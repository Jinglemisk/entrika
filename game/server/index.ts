// One process serves everything: the app (Vite in dev, dist/ in production), the art folder, and the game over WebSocket.
// Run: npm run dev, then open http://<this computer's address>:4700 on each phone (same Wi-Fi).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { WebSocketServer, type WebSocket } from 'ws';
import { RuleError } from '../src/engine/index.ts';
import {
  backToLobby, createRoom, timed, join, leave, load, lobby, newToken, play, rooms, seatsOf, setListener, start, type LobbyOp, type Room,
} from './rooms.ts';
import { contentEdit } from './content.ts';
import { DEFAULT_MOD, MODS_DIR } from './mods.ts';

const PORT = Number(process.env.PORT ?? 4700);
const PROD = process.env.NODE_ENV === 'production';
const ROOT = path.join(import.meta.dirname, '..');
const ART = path.join(ROOT, '..', 'art');
const DIST = path.join(ROOT, 'dist');
const MANUAL = path.join(ROOT, '..', 'manual.html');

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2', '.mp3': 'audio/mpeg', '.ico': 'image/x-icon',
};

// Art and mod files keep their names when they're redrawn, so phones revalidate them on every load (a cheap 304 when
// unchanged) rather than keeping a stale portrait for a day.
const REVALIDATE = 'no-cache';
function sendFile(req: http.IncomingMessage, res: http.ServerResponse, file: string, cache: string) {
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) { res.writeHead(404).end(); return; }
    const modified = new Date(Math.floor(st.mtimeMs / 1000) * 1000);
    const since = req.headers['if-modified-since'];
    if (since && new Date(since) >= modified) { res.writeHead(304, { 'Cache-Control': cache }).end(); return; }
    res.writeHead(200, {
      'Content-Type': TYPES[path.extname(file).toLowerCase()] ?? 'application/octet-stream', 'Cache-Control': cache,
      'Last-Modified': modified.toUTCString(),
    });
    fs.createReadStream(file).pipe(res);
  });
}
/** Serve a file from inside a folder, refusing paths that climb out of it. */
function serveFrom(dir: string, urlPath: string, req: http.IncomingMessage, res: http.ServerResponse, cache: string) {
  const file = path.normalize(path.join(dir, decodeURIComponent(urlPath)));
  if (!file.startsWith(dir + path.sep)) { res.writeHead(403).end(); return; }
  sendFile(req, res, file, cache);
}

const server = http.createServer();
let vite: { middlewares: (req: http.IncomingMessage, res: http.ServerResponse) => void } | null = null;
if (!PROD) {
  const { createServer } = await import('vite');
  vite = await createServer({ root: ROOT, server: { middlewareMode: true, hmr: { server } }, appType: 'spa' });
}

server.on('request', (req, res) => {
  const url = new URL(req.url ?? '/', 'http://x');
  if (url.pathname.startsWith('/art/')) return serveFrom(ART, url.pathname.slice(5), req, res, REVALIDATE);
  if (url.pathname.startsWith('/mods/')) return serveFrom(MODS_DIR, url.pathname.slice(6), req, res, REVALIDATE);
  if (url.pathname === '/kurallar') return manual(res);
  if (!PROD && url.pathname === '/dev/content') return contentEdit(req, res);   // the card text editor, /?duzenle
  if (vite) return vite.middlewares(req, res);
  const asset = url.pathname !== '/' && fs.existsSync(path.join(DIST, url.pathname));
  if (asset) return serveFrom(DIST, url.pathname.slice(1), req, res, 'public, max-age=31536000, immutable');
  sendFile(req, res, path.join(DIST, 'index.html'), 'no-cache');
});

// The rules: the manual published as an artifact, read fresh on each request so it never lags the repo. It is written
// as an artifact body (no document shell), so the shell goes on here; the designer's Notes and the Lexicon editor need
// claude.ai and mean nothing at the table, so they are hidden.
const MANUAL_SHELL = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
  + '<style>#notes,#lexicon,.toc li:has(> a[href="#notes"]),.toc li:has(> a[href="#lexicon"]){display:none!important}</style></head><body>';
function manual(res: http.ServerResponse) {
  fs.readFile(MANUAL, 'utf8', (err, body) => {
    if (err) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-cache' });
    res.end(MANUAL_SHELL + body + '</body></html>');
  });
}

// ---------- WebSocket protocol

type In =
  | { t: 'hello'; code?: string; token?: string }
  | { t: 'create'; name: string; test?: number; mod?: string; start?: boolean }
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
    code: room.code, dev: room.dev, learning: room.learning, mod: room.mod ?? DEFAULT_MOD, sultan: room.sultan, version: room.version,
    timers: timed(room) || (!room.game && !room.learning && (room.timers ?? !room.dev)), deadlines: room.deadlines ?? {}, now: Date.now(),
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
      // DEV ONLY: a test game can be set in a world and dealt at once, straight from home (?hizli=got)
      if (r.dev && m.mod) lobby(r, c.token, { op: 'mod', value: m.mod });
      if (r.dev && m.start) start(r, c.token);
      c.code = r.code;
      push(r);
      return;
    }
    case 'join': {
      const r = rooms.get(String(m.code ?? '').trim().toUpperCase());
      if (!r) throw new RuleError('err.noRoom');
      c.code = r.code;
      join(r, String(m.name ?? '').slice(0, 18), c.token);
      push(r);
      return;
    }
    case 'leave': {
      const prev = room;
      c.code = null;
      send(c, { t: 'home', token: c.token });
      if (prev) { leave(prev, c.token); push(prev); }
      return;
    }
  }
  if (!room) throw new RuleError('err.noRoomYet');
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
      // the phone words the error in its own language: a string key and its values
      if (!(e instanceof RuleError)) console.error(e);
      send(c, e instanceof RuleError ? { t: 'error', key: e.message, vars: e.vars } : { t: 'error', key: 'err.server' });
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
