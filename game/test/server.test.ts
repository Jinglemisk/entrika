// The multi-phone path: separate clients make and join a room by code, each acts only for its own seat,
// and a whole game runs to the end over WebSocket.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { botAnswer } from '../src/engine/bot.ts';
import type { Game } from '../src/engine/index.ts';

const PORT = 4790 + Math.floor(Math.random() * 9);
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

interface Client { ws: WebSocket; room: any; errors: string[]; token?: string }
async function client(): Promise<Client> {
  const ws = new WebSocket(`ws://127.0.0.1:${PORT}/ws`);
  const c: Client = { ws, room: null, errors: [] };
  ws.onmessage = e => {
    const m = JSON.parse(String(e.data));
    if (m.token) c.token = m.token;
    if (m.t === 'room') c.room = m.room;
    if (m.t === 'error') c.errors.push(m.key);
  };
  await new Promise(r => (ws.onopen = r));
  ws.send(JSON.stringify({ t: 'hello' }));
  return c;
}
const send = (c: Client, m: unknown) => c.ws.send(JSON.stringify(m));

test('five phones play a full game by room code', async () => {
  const data = mkdtempSync(path.join(tmpdir(), 'entrika-'));
  const server = spawn(process.execPath, ['server/index.ts'], { env: { ...process.env, PORT: String(PORT), NODE_ENV: 'production', DATA_DIR: data }, stdio: 'ignore' });
  try {
    await sleep(1200);
    const host = await client();
    send(host, { t: 'create', name: 'Kerem' });
    await sleep(200);
    const code = host.room.code as string;
    assert.match(code, /^[A-Z]{4}$/);
    const others = await Promise.all(['Ayşe', 'Mert', 'Elif', 'Can'].map(async name => {
      const c = await client();
      send(c, { t: 'join', code: code.toLowerCase(), name });
      return c;
    }));
    await sleep(300);
    const all = [host, ...others];
    assert.equal(host.room.seats.length, 5);
    for (const c of all) assert.equal(c.room.mine.length, 1, 'each phone owns exactly one seat');

    send(others[0], { t: 'start' });
    await sleep(200);
    assert.ok(others[0].errors.length, 'only the host can start');
    send(host, { t: 'start' });
    await sleep(300);

    const spoof = others[1];
    const victim = others[2].room.mine[0];
    send(spoof, { t: 'act', seat: victim, action: { t: 'answer', ask: 1, value: null } });
    await sleep(200);
    assert.ok(spoof.errors.includes('err.notYourSeat'), 'a phone cannot act for another seat');

    let rounds = 0;
    while (!host.room.game?.winner) {
      assert.ok(++rounds < 3000, 'game did not finish');
      const g: Game = host.room.game;
      const a = g.asks.find(x => x.type === 'discard' || x.type === 'keepOne') ?? g.asks[0];
      const owner = all.find(c => c.room.mine.includes(a.to))!;
      send(owner, { t: 'act', seat: a.to, action: botAnswer(owner.room.game, a) });
      const v = host.room.version;
      for (let i = 0; i < 100 && host.room.version === v; i++) await sleep(5);
    }
    assert.ok(['loyalist', 'traitor'].includes(host.room.game.winner.side));
    for (const c of all) c.ws.close();
  } finally {
    server.kill();
  }
});
