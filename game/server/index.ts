// One process serves everything: the app (Vite in dev, dist/ in production), the art folder, and the game over WebSocket.
// Run: npm run dev, then open http://<this computer's address>:4700 on each phone (same Wi-Fi).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { WebSocketServer, type WebSocket } from 'ws';
import { RuleError } from '../src/engine/index.ts';
import {
  backToLobby, createRoom, join, load, lobby, newToken, play, rooms, seatsOf, setListener, start, type LobbyOp, type Room,
} from './rooms.ts';

const PORT = Number(process.env.PORT ?? 4700);
const PROD = process.env.NODE_ENV === 'production';
const ROOT = path.join(import.meta.dirname, '..');
const ART = path.join(ROOT, '..', 'art');
const DIST = path.join(ROOT, 'dist');

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2', '.mp3': 'audio/mpeg', '.ico': 'image/x-icon',
};

function sendFile(res: http.ServerResponse, file: string, cache: string) {
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) { res.writeHead(404).end(); return; }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file).toLowerCase()] ?? 'application/octet-stream', 'Cache-Control': cache });
    fs.createReadStream(file).pipe(res);
  });
}
/** Serve a file from inside a folder, refusing paths that climb out of it. */
function serveFrom(dir: string, urlPath: string, res: http.ServerResponse, cache: string) {
  const file = path.normalize(path.join(dir, decodeURIComponent(urlPath)));
  if (!file.startsWith(dir + path.sep)) { res.writeHead(403).end(); return; }
  sendFile(res, file, cache);
}

const server = http.createServer();
let vite: { middlewares: (req: http.IncomingMessage, res: http.ServerResponse) => void } | null = null;
if (!PROD) {
  const { createServer } = await import('vite');
  vite = await createServer({ root: ROOT, server: { middlewareMode: true, hmr: { server } }, appType: 'spa' });
}

server.on('request', (req, res) => {
  const url = new URL(req.url ?? '/', 'http://x');
  if (url.pathname.startsWith('/art/')) return serveFrom(ART, url.pathname.slice(5), res, 'public, max-age=86400');
  if (vite) return vite.middlewares(req, res);
  const asset = url.pathname !== '/' && fs.existsSync(path.join(DIST, url.pathname));
  if (asset) return serveFrom(DIST, url.pathname.slice(1), res, 'public, max-age=31536000, immutable');
  sendFile(res, path.join(DIST, 'index.html'), 'no-cache');
});

// ---------- WebSocket protocol

type In =
  | { t: 'hello'; code?: string; token?: string }
  | { t: 'create'; name: string; test?: number }
  | { t: 'join'; code: string; name: string }
  | { t: 'leave' }
  | { t: 'lobby'; o: LobbyOp }
  | { t: 'start' }
  | { t: 'lobbyAgain' }
  | { t: 'act'; seat: number; action: import('../src/engine/index.ts').Action };

interface Conn { ws: WebSocket; token: string; code: string | null }
const conns = new Set<Conn>();
const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', (req, socket, head) => {
  if (new URL(req.url ?? '/', 'http://x').pathname !== '/ws') return;   // Vite's HMR socket handles its own path
  wss.handleUpgrade(req, socket, head, ws => wss.emit('connection', ws, req));
});

function view(room: Room, token: string) {
  return {
    code: room.code, dev: room.dev, learning: room.learning, sultan: room.sultan, version: room.version,
    host: token === room.host,
    seats: room.seats.map(s => ({ name: s.name, bot: s.bot, online: [...conns].some(c => c.code === room.code && c.token === s.token) })),
    mine: seatsOf(room, token),
    game: room.game,
  };
}
function push(room: Room) {
  for (const c of conns) if (c.code === room.code) send(c, { t: 'room', room: view(room, c.token), token: c.token });
}
setListener(push);
const send = (c: Conn, msg: unknown) => c.ws.readyState === c.ws.OPEN && c.ws.send(JSON.stringify(msg));

function handle(c: Conn, m: In) {
  const room = c.code ? rooms.get(c.code) : undefined;
  switch (m.t) {
    case 'hello': {
      if (m.token) c.token = m.token;
      const r = m.code ? rooms.get(m.code.toUpperCase()) : undefined;
      if (r && seatsOf(r, c.token).length) {
        c.code = r.code;
        push(r);
      } else send(c, { t: 'home', token: c.token });
      return;
    }
    case 'create': {
      const r = createRoom(String(m.name ?? '').slice(0, 18), c.token, m.test ? Number(m.test) : null);
      c.code = r.code;
      push(r);
      return;
    }
    case 'join': {
      const r = rooms.get(String(m.code ?? '').trim().toUpperCase());
      if (!r) throw new RuleError('Bu kodla bir oda yok.');
      c.code = r.code;
      join(r, String(m.name ?? '').slice(0, 18), c.token);
      push(r);
      return;
    }
    case 'leave': {
      const prev = room;
      c.code = null;
      send(c, { t: 'home', token: c.token });
      if (prev) push(prev);
      return;
    }
  }
  if (!room) throw new RuleError('Önce bir odaya gir.');
  if (m.t === 'lobby') lobby(room, c.token, m.o);
  else if (m.t === 'start') start(room, c.token);
  else if (m.t === 'lobbyAgain') backToLobby(room, c.token);
  else if (m.t === 'act') play(room, c.token, m.seat, m.action);
}

wss.on('connection', ws => {
  const c: Conn = { ws, token: newToken(), code: null };
  conns.add(c);
  ws.on('message', data => {
    let m: In;
    try { m = JSON.parse(String(data)); } catch { return; }
    try {
      handle(c, m);
    } catch (e) {
      const msg = e instanceof RuleError ? e.message : 'Sunucu hatası.';
      if (!(e instanceof RuleError)) console.error(e);
      send(c, { t: 'error', msg });
    }
  });
  ws.on('close', () => {
    conns.delete(c);
    const r = c.code ? rooms.get(c.code) : undefined;
    if (r) push(r);
  });
});

load();
server.listen(PORT, () => {
  const addrs = Object.values(os.networkInterfaces()).flat().filter(a => a && a.family === 'IPv4' && !a.internal).map(a => a!.address);
  console.log(`Entrika on http://localhost:${PORT}` + addrs.map(a => `  http://${a}:${PORT}`).join(''));
});
