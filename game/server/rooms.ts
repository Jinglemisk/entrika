// Rooms: a short code, the seats, and the game. The server runs the engine, so every phone sees the same state.
import { randomBytes } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {
  act, ambitionById, askSeconds, characterById, companionById, createGame, crisisById, intrigueById, RuleError, RULES,
  timeoutAnswer, type Action, type Game,
} from '../src/engine/index.ts';
import { botAnswer, botPower } from '../src/engine/bot.ts';
import { DEFAULT_MOD, modById } from './mods.ts';

export interface Seat { name: string; token: string; bot: boolean }
export interface Room {
  code: string;
  created: number;
  touched: number;
  host: string;                 // token of the creator
  dev: boolean;                 // test room: one phone may act for every seat
  learning: boolean;
  mod?: string;                 // the world the game is set in (mods/<id>); missing = the default mod
  timers?: boolean;             // timed power windows and waves (off in learning games); missing = on, except test rooms
  deadlines?: Record<number, number>;   // ask id -> epoch ms when it times out
  sultan: number | null;        // seat that plays Süleyman, null = random
  seats: Seat[];
  game: Game | null;
  version: number;
}

const DATA = process.env.DATA_DIR ?? path.join(import.meta.dirname, '..', 'data');
const FILE = path.join(DATA, 'rooms.json');
const MAX_AGE = 3 * 24 * 3600 * 1000;
const NAMES = ['Ayşe', 'Elif', 'Mert', 'Kerem', 'Defne', 'Can', 'Selin', 'Ozan'];
const LETTERS = 'ABCDEFGHJKLMNPRSTUVYZ';

export const rooms = new Map<string, Room>();
type Listener = (room: Room) => void;
let onChange: Listener = () => {};
export const setListener = (fn: Listener) => { onChange = fn; };

export function load() {
  try {
    const list = JSON.parse(fs.readFileSync(FILE, 'utf8')) as Room[];
    for (const r of list) {
      if (Date.now() - r.touched >= MAX_AGE) continue;
      // a game saved by an older engine, or before a card was cut, can't be played on: send the room back to its lobby
      if (r.game && (r.game.v !== 3 || !fitsContent(r.game))) {
        console.warn(`room ${r.code}: its game was saved by an older engine or uses cards no longer in the content; back to the lobby`);
        r.game = null;
      }
      rooms.set(r.code, r);
      syncDeadlines(r);   // deadlines survive a restart; an overdue one fires at once
    }
  } catch { /* first run */ }
}

/** Whether every Character, Kul, Hırs, Intrigue and Crisis card a saved game refers to still exists. */
function fitsContent(g: Game): boolean {
  const cards = [...g.decks.intrigue, ...g.decks.intrigueDiscard, ...g.players.flatMap(p => p.hand)];
  return g.players.every(p => characterById[p.character] && (!p.companion || companionById[p.companion]) && (!p.ambition || ambitionById[p.ambition]))
    && cards.every(c => intrigueById[c.kind])
    && [...g.decks.crisis, ...g.decks.crisisUsed].every(id => crisisById[id]);
}
let saveTimer: NodeJS.Timeout | null = null;
function save() {
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    saveTimer = null;
    fs.mkdirSync(DATA, { recursive: true });
    fs.writeFileSync(FILE, JSON.stringify([...rooms.values()]));
  }, 800);
}
function changed(room: Room) {
  room.version++;
  room.touched = Date.now();
  syncDeadlines(room);
  save();
  onChange(room);
  scheduleBots(room);
}

// ---------- timers: each timed ask gets a deadline when it appears; when it passes, the ask is answered for the player
export const timed = (room: Room) => !!room.game && !room.learning && (room.timers ?? !room.dev);
const timerHandles = new Map<string, NodeJS.Timeout>();
function syncDeadlines(room: Room) {
  const g = room.game;
  const now = Date.now();
  const next: Record<number, number> = {};
  if (g && timed(room)) {
    for (const a of g.asks) {
      const secs = askSeconds(a);
      if (secs !== null) next[a.id] = room.deadlines?.[a.id] ?? now + secs * 1000;
    }
  }
  room.deadlines = next;
  clearTimeout(timerHandles.get(room.code));
  timerHandles.delete(room.code);
  const first = Math.min(...Object.values(next));
  if (Number.isFinite(first)) timerHandles.set(room.code, setTimeout(() => expire(room), Math.max(0, first - now) + 50));
}
function expire(room: Room) {
  timerHandles.delete(room.code);
  const g = room.game;
  if (!g) return;
  const now = Date.now();
  let game = g;
  for (const a of g.asks) {
    const due = room.deadlines?.[a.id];
    if (due === undefined || due > now || !game.asks.some(x => x.id === a.id)) continue;
    try { game = act(game, a.to, { t: 'answer', ask: a.id, value: timeoutAnswer(a) }); }
    catch (e) { console.warn('timeout answer failed', (e as Error).message); }
  }
  room.game = game;
  changed(room);
}

export const newToken = () => randomBytes(12).toString('base64url');
function newCode() {
  for (;;) {
    const code = Array.from({ length: 4 }, () => LETTERS[Math.floor(Math.random() * LETTERS.length)]).join('');
    if (!rooms.has(code)) return code;
  }
}

export function createRoom(name: string, token: string, test: number | null): Room {
  const room: Room = {
    code: newCode(), created: Date.now(), touched: Date.now(), host: token, dev: test !== null, learning: false, mod: DEFAULT_MOD, sultan: null,
    seats: [], game: null, version: 0,
  };
  if (test) {
    const n = Math.max(RULES.players.min, Math.min(RULES.players.max, test));
    for (let i = 0; i < n; i++) room.seats.push({ name: i === 0 && name ? name : NAMES[i], token, bot: false });
  } else room.seats.push({ name: name || 'Oyuncu', token, bot: false });
  rooms.set(room.code, room);
  changed(room);
  return room;
}

export function join(room: Room, name: string, token: string): number {
  const mine = room.seats.findIndex(s => s.token === token);
  if (mine >= 0 && !room.dev) return mine;
  if (room.game) throw new RuleError('err.started');
  if (room.seats.length >= RULES.players.max) throw new RuleError('err.full');
  room.seats.push({ name: name || `Oyuncu ${room.seats.length + 1}`, token, bot: false });
  changed(room);
  return room.seats.length - 1;
}

/** Seats this connection may act for. In a test room the creator acts for every seat. */
export function seatsOf(room: Room, token: string): number[] {
  if (room.dev && token === room.host) return room.seats.map((_, i) => i);
  return room.seats.flatMap((s, i) => (s.token === token ? [i] : []));
}

export type LobbyOp =
  | { op: 'learning'; value: boolean }
  | { op: 'mod'; value: string }
  | { op: 'timers'; value: boolean }
  | { op: 'sultan'; seat: number | null }
  | { op: 'move'; from: number; to: number }
  | { op: 'shuffle' }
  | { op: 'kick'; seat: number }
  | { op: 'rename'; seat: number; name: string }
  | { op: 'bots'; seats: number[] };

export function lobby(room: Room, token: string, o: LobbyOp) {
  const host = token === room.host;
  if (o.op === 'rename') {
    if (!seatsOf(room, token).includes(o.seat)) throw new RuleError('err.notYourSeat');
    room.seats[o.seat].name = String(o.name).slice(0, 18) || room.seats[o.seat].name;
    return changed(room);
  }
  if (o.op === 'bots') {
    if (!room.dev || !host) throw new RuleError('err.botsDevOnly');
    room.seats.forEach((s, i) => { s.bot = o.seats.includes(i); });
    return changed(room);
  }
  if (!host) throw new RuleError('err.hostOnly');
  if (room.game) throw new RuleError('err.inGame');
  switch (o.op) {
    case 'learning': room.learning = !!o.value; break;
    case 'mod': {
      const m = modById(String(o.value));
      if (!m || (m.draft && !room.dev)) throw new RuleError('err.badMod');   // unfinished mods are for test rooms
      room.mod = m.id;
      break;
    }
    case 'timers': room.timers = !!o.value; break;
    case 'sultan': room.sultan = o.seat === null || room.seats[o.seat] ? o.seat : null; break;
    case 'move': {
      const [s] = room.seats.splice(o.from, 1);
      if (!s) return;
      room.seats.splice(Math.max(0, Math.min(room.seats.length, o.to)), 0, s);
      room.sultan = null;
      break;
    }
    case 'shuffle':
      for (let i = room.seats.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [room.seats[i], room.seats[j]] = [room.seats[j], room.seats[i]];
      }
      room.sultan = null;
      break;
    case 'kick':
      if (room.seats[o.seat]?.token === room.host && !room.dev) throw new RuleError('err.kickSelf');
      room.seats.splice(o.seat, 1);
      room.sultan = null;
      break;
  }
  changed(room);
}

/** Leaving a lobby frees the seat; the host's role passes to the next seat. Leaving a game keeps the seat for a rejoin. */
export function leave(room: Room, token: string) {
  if (room.game || room.dev) return;
  const i = room.seats.findIndex(s => s.token === token);
  if (i < 0) return;
  room.seats.splice(i, 1);
  room.sultan = null;
  if (room.host === token && room.seats.length) room.host = room.seats[0].token;
  changed(room);
}

export function start(room: Room, token: string) {
  if (token !== room.host) throw new RuleError('err.hostStarts');
  const n = room.seats.length;
  if (n < RULES.players.min || n > RULES.players.max) throw new RuleError('err.playerCount', { min: RULES.players.min, max: RULES.players.max });
  room.game = createGame(room.seats.map(s => s.name), {
    learning: room.learning, sultan: room.sultan ?? undefined, seed: Math.floor(Math.random() * 2 ** 31),
  });
  changed(room);
}

export function backToLobby(room: Room, token: string) {
  if (token !== room.host) throw new RuleError('err.hostNewGame');
  room.game = null;
  changed(room);
}

export function play(room: Room, token: string, seat: number, action: Action) {
  if (!room.game) throw new RuleError('err.notStarted');
  if (!seatsOf(room, token).includes(seat)) throw new RuleError('err.notYourSeat');
  room.game = act(room.game, seat, action);
  changed(room);
}

// ---------- bots (test rooms): seats marked bot answer their asks after a short pause

const botTimers = new Map<string, NodeJS.Timeout>();
const BOT_DELAY = Number(process.env.BOT_DELAY ?? 700);
function scheduleBots(room: Room) {
  if (!room.dev || !room.game || room.game.step === 'over' || botTimers.has(room.code)) return;
  const due = room.game.asks.filter(a => room.seats[a.to]?.bot);
  if (!due.length) return;
  botTimers.set(room.code, setTimeout(() => {
    botTimers.delete(room.code);
    const g = room.game;
    if (!g || g.step === 'over') return;
    const urgent = g.asks.filter(a => room.seats[a.to]?.bot && (a.type === 'discard' || a.type === 'keepOne'));
    const mine = urgent.length ? urgent : g.asks.filter(a => room.seats[a.to]?.bot);
    const a = mine[0];
    if (!a) return;
    if (a.type === 'ack') {   // bots press Devam together
      for (const x of g.asks.filter(x => x.type === 'ack' && room.seats[x.to]?.bot)) room.game = act(room.game!, x.to, { t: 'answer', ask: x.id });
      return changed(room);
    }
    try {
      if (Math.random() < 0.05) {
        const pw = botPower(g, a.to);
        if (pw) room.game = act(room.game!, a.to, pw);
      }
      room.game = act(room.game!, a.to, botAnswer(room.game!, room.game!.asks.find(x => x.id === a.id) ?? a));
    } catch (e) {
      console.warn('bot move failed', (e as Error).message);
      room.seats[a.to].bot = false;
    }
    changed(room);
  }, BOT_DELAY));
}
