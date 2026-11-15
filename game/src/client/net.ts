// The connection to the server: one WebSocket, reconnecting on its own, exposed to React as a small store.
import { useSyncExternalStore } from 'react';
import type { Action, Game } from '../engine/index.ts';

export interface RoomView {
  code: string; dev: boolean; learning: boolean; sultan: number | null; version: number; host: boolean;
  seats: { name: string; bot: boolean; online: boolean }[];
  mine: number[];
  game: Game | null;
}
export interface NetState { status: 'connecting' | 'open' | 'closed'; room: RoomView | null; home: boolean; error: string | null; errorAt: number }

const TOKEN = 'entrika:token';
const ROOM = 'entrika:room';
const store = {
  get: (k: string) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k: string, v: string | null) => { try { v === null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch { /* private mode */ } },
};

let state: NetState = { status: 'connecting', room: null, home: false, error: null, errorAt: 0 };
const subs = new Set<() => void>();
function set(patch: Partial<NetState>) {
  state = { ...state, ...patch };
  subs.forEach(f => f());
}

let ws: WebSocket | null = null;
let retry = 0;
const queue: string[] = [];

function connect() {
  const proto = location.protocol === 'https:' ? 'wss' : 'ws';
  ws = new WebSocket(`${proto}://${location.host}/ws`);
  set({ status: 'connecting' });
  ws.onopen = () => {
    retry = 0;
    set({ status: 'open' });
    const code = new URLSearchParams(location.search).get('oda') ?? store.get(ROOM) ?? undefined;
    ws!.send(JSON.stringify({ t: 'hello', token: store.get(TOKEN) ?? undefined, code }));
    while (queue.length) ws!.send(queue.shift()!);
  };
  ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (m.token) store.set(TOKEN, m.token);
    if (m.t === 'room') {
      store.set(ROOM, m.room.code);
      set({ room: m.room, home: false });
    } else if (m.t === 'home') {
      store.set(ROOM, null);
      set({ room: null, home: true });
    } else if (m.t === 'error') set({ error: m.msg, errorAt: Date.now() });
  };
  ws.onclose = () => {
    set({ status: 'closed' });
    setTimeout(connect, Math.min(4000, 300 * 2 ** retry++));
  };
}
connect();
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && ws && ws.readyState > 1) connect();
});

export function send(msg: Record<string, unknown>) {
  const s = JSON.stringify(msg);
  if (ws && ws.readyState === 1) ws.send(s);
  else queue.push(s);
}
export const actAs = (seat: number, action: Action) => send({ t: 'act', seat, action });
export const clearError = () => set({ error: null });

export function useNet(): NetState {
  return useSyncExternalStore(f => { subs.add(f); return () => subs.delete(f); }, () => state);
}
