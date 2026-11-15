// Rooms: a short code, the seats, and the game. The server runs the engine, so every phone sees the same state.
import { randomBytes } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { act, createGame, RuleError, RULES, type Action, type Game } from '../src/engine/index.ts';
import { botAnswer, botPower } from '../src/engine/bot.ts';

export interface Seat { name: string; token: string; bot: boolean }
export interface Room {
  code: string;
  created: number;
  touched: number;
  host: string;                 // token of the creator
  dev: boolean;                 // test room: one phone may act for every seat
  learning: boolean;
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
    for (const r of list) if (Date.now() - r.touched < MAX_AGE) rooms.set(r.code, r);
  } catch { /* first run */ }
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
  save();
  onChange(room);
  scheduleBots(room);
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
    code: newCode(), created: Date.now(), touched: Date.now(), host: token, dev: test !== null, learning: false, sultan: null,
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
  if (room.game) throw new RuleError('Oyun başladı; yeni oyuncu katılamaz.');
  if (room.seats.length >= RULES.players.max) throw new RuleError('Oda dolu.');
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
  | { op: 'sultan'; seat: number | null }
  | { op: 'move'; from: number; to: number }
  | { op: 'shuffle' }
  | { op: 'kick'; seat: number }
  | { op: 'rename'; seat: number; name: string }
  | { op: 'bots'; seats: number[] };

export function lobby(room: Room, token: string, o: LobbyOp) {
  const host = token === room.host;
  if (o.op === 'rename') {
    if (!seatsOf(room, token).includes(o.seat)) throw new RuleError('Bu koltuk senin değil.');
    room.seats[o.seat].name = String(o.name).slice(0, 18) || room.seats[o.seat].name;
    return changed(room);
  }
  if (o.op === 'bots') {
    if (!room.dev || !host) throw new RuleError('Botlar yalnız test odasında.');
    room.seats.forEach((s, i) => { s.bot = o.seats.includes(i); });
    return changed(room);
  }
  if (!host) throw new RuleError('Bunu yalnız odayı kuran yapabilir.');
  if (room.game) throw new RuleError('Oyun sürüyor.');
  switch (o.op) {
    case 'learning': room.learning = !!o.value; break;
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
      if (room.seats[o.seat]?.token === room.host && !room.dev) throw new RuleError('Kendini çıkaramazsın.');
      room.seats.splice(o.seat, 1);
      room.sultan = null;
      break;
  }
  changed(room);
}

export function start(room: Room, token: string) {
  if (token !== room.host) throw new RuleError('Oyunu odayı kuran başlatır.');
  const n = room.seats.length;
  if (n < RULES.players.min || n > RULES.players.max) throw new RuleError(`${RULES.players.min}–${RULES.players.max} oyuncu gerekir.`);
  room.game = createGame(room.seats.map(s => s.name), {
    learning: room.learning, sultan: room.sultan ?? undefined, seed: Math.floor(Math.random() * 2 ** 31),
  });
  changed(room);
}

export function backToLobby(room: Room, token: string) {
  if (token !== room.host) throw new RuleError('Yalnız odayı kuran yeni oyun açabilir.');
  room.game = null;
  changed(room);
}

export function play(room: Room, token: string, seat: number, action: Action) {
  if (!room.game) throw new RuleError('Oyun başlamadı.');
  if (!seatsOf(room, token).includes(seat)) throw new RuleError('Bu koltuk senin değil.');
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
