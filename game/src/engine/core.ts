// Small state helpers shared by every step: randomness, asks, the log, drawing, Influence, the hand limit, eligibility.
import { RULES, characterById, companionById, crisisById, intrigueById, type CrisisField, type Field } from './content.ts';
import type { Ask, CardInst, Game, Kader, Moment, PID, Player, Seat } from './types.ts';
import { RuleError } from './types.ts';

// ---------- randomness (mulberry32, the seed lives in the state so a game replays exactly)
export function rand(g: Game): number {
  let t = (g.rng = (g.rng + 0x6d2b79f5) | 0);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
export function shuffle<T>(g: Game, list: T[]): T[] {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand(g) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------- guards
export function must(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new RuleError(msg);
}

// ---------- players and seats
export const P = (g: Game, id: PID): Player => g.players[id];
export const sultan = (g: Game) => g.players[g.sultan];
export const others = (g: Game) => g.players.filter(p => !p.sultan);
/** Non-Süleyman players clockwise, starting at Süleyman's left. */
export function clockwise(g: Game): Player[] {
  const n = g.players.length;
  return Array.from({ length: n - 1 }, (_, i) => g.players[(g.sultan + 1 + i) % n]);
}
export const beside = (g: Game): PID[] => {
  const n = g.players.length;
  return [(g.sultan + n - 1) % n, (g.sultan + 1) % n];
};
export const seatOf = (g: Game, id: PID): Seat | null =>
  g.ministers.first === id ? 'first' : g.ministers.second === id ? 'second' : null;
export const isMinister = (g: Game, id: PID) => seatOf(g, id) !== null;
export const otherSeat = (s: Seat): Seat => (s === 'first' ? 'second' : 'first');

/** May take a Minister seat: not Süleyman, not the other current Minister, not named by Sürgün this crisis. */
export function eligible(g: Game, id: PID, forSeat: Seat | null): boolean {
  const p = P(g, id);
  if (!p || p.sultan) return false;
  if (g.surgun.now === id) return false;
  if (forSeat && g.ministers[otherSeat(forSeat)] === id) return false;
  if (forSeat && g.ministers[forSeat] === id) return false;
  return true;
}
export const eligibleList = (g: Game, forSeat: Seat | null) => g.players.filter(p => eligible(g, p.id, forSeat)).map(p => p.id);

// ---------- characters, companions, powers
export const charOf = (g: Game, id: PID) => characterById[P(g, id).character];
export const holder = (g: Game, character: string): Player | undefined => g.players.find(p => p.character === character);
/** The player holding this Character, if that power is ready to use. */
export function readyPower(g: Game, character: string, which: 'base' | 'favor'): Player | undefined {
  const p = holder(g, character);
  if (!p) return undefined;
  if (which === 'favor' && g.learning) return undefined;
  return p[which] === 'ready' ? p : undefined;
}
/** Always-on Favor powers (Divan Nüfuzu, Ocak Sevgisi, Plus Ultra) work once unlocked. */
export const favorOn = (g: Game, id: PID, character: string) => {
  const p = P(g, id);
  return !g.learning && p.character === character && p.favor !== 'locked';
};
/** A Companion works only while its player has at least 1 Influence. */
export const companionUp = (g: Game, id: PID) => !!P(g, id).companion && P(g, id).influence >= 1;
export const companionIs = (g: Game, id: PID, comp: string) => P(g, id).companion === comp && companionUp(g, id);
export const companionDef = (id: string | null) => (id ? companionById[id] : null);
export const cardName = (kind: string) => intrigueById[kind].name;

// ---------- asks and the log
export function ask(g: Game, a: Omit<Ask, 'id'> & Record<string, unknown>): Ask {
  const full = { ...a, id: g.nextAsk++ } as Ask;
  g.asks.push(full);
  return full;
}
/** Whether this player holds this Character's power and it is ready now. */
export const readyPowerOf = (g: Game, id: PID, character: string, which: 'base' | 'favor') => readyPower(g, character, which)?.id === id;

/** Seconds a player has to answer this ask when the room plays with timers, or null if it is never timed:
 *  appointments, replacements, the Decree, Kader, discards and Devam wait as long as the table talks. */
export function askSeconds(a: Ask): number | null {
  switch (a.type) {
    case 'window': return RULES.powerWindows[a.power]?.secs ?? null;
    case 'wave': return RULES.timers.wave;
    case 'object': return RULES.timers.object;
    case 'redirect': return RULES.timers.redirect;
    case 'ferman': return RULES.timers.ferman;
    case 'kulis': return RULES.kulisSeconds;
    default: return null;
  }
}
/** What a timed-out ask counts as: the power isn't used, the player passes. */
export function timeoutAnswer(a: Ask): unknown {
  return a.type === 'wave' ? [] : a.type === 'window' ? false : null;
}

/** Every player, Süleyman too, confirms a public moment before the game moves on. */
export function ackAll(g: Game, what: Moment) {
  for (const p of g.players) ask(g, { to: p.id, type: 'ack', what });
}
export const asksOf = (g: Game, type: Ask['type']) => g.asks.filter(a => a.type === type);
export const hasAsk = (g: Game, ...types: Ask['type'][]) => g.asks.some(a => types.includes(a.type));
export function dropAsk(g: Game, id: number) {
  g.asks = g.asks.filter(a => a.id !== id);
}
export function log(g: Game, k: string, p?: Record<string, unknown>) {
  const e = { c: g.crisisNo, k, ...(p ? { p } : {}) };
  g.log.push(e);
  const row = g.sicil[g.sicil.length - 1];
  if (row && row.c === g.crisisNo && SICIL_EVENTS.has(k)) row.events.push(e);
}
const SICIL_EVENTS = new Set(['objection', 'itiraz', 'ferman', 'feragat', 'sadrazam', 'kulis', 'power', 'replaced', 'ambition', 'sorusturma', 'hazineDefteri', 'yakipYikma']);

// ---------- Intrigue deck
export function drawIntrigue(g: Game, id: PID, n = 1): number {
  let got = 0;
  for (let i = 0; i < n; i++) {
    if (!g.decks.intrigue.length && g.decks.intrigueDiscard.length) {
      g.decks.intrigue = shuffle(g, g.decks.intrigueDiscard);
      g.decks.intrigueDiscard = [];
      log(g, 'intrigueReshuffle');
    }
    const c = g.decks.intrigue.shift();
    if (!c) break;
    P(g, id).hand.push(c);
    got++;
  }
  if (got) log(g, 'draw', { who: id, n: got });
  return got;
}
export function discardCard(g: Game, c: CardInst) {
  g.decks.intrigueDiscard.push(c);
}

/** After anything adds cards to a hand: ask for discards down to the hand limit. */
export function checkHand(g: Game, id: PID) {
  const over = P(g, id).hand.length - RULES.handLimit;
  const existing = g.asks.find(a => a.type === 'discard' && a.to === id);
  if (existing) dropAsk(g, existing.id);
  if (over > 0) ask(g, { to: id, type: 'discard', n: over });
}

// ---------- Kader deck
export function ensureKader(g: Game, n: number) {
  if (g.decks.kader.length < n) {
    g.decks.kader = g.decks.kader.concat(shuffle(g, g.decks.kaderDiscard));
    g.decks.kaderDiscard = [];
    log(g, 'kaderReshuffle');
  }
}
export const top = (g: Game, n: number): Kader[] => g.decks.kader.slice(0, n);

// ---------- Influence
/** A gain from one source. Faiz reacts to it. */
export function gain(g: Game, id: PID, n: number, why: string) {
  if (n <= 0) return;
  const p = P(g, id);
  p.influence += n;
  log(g, 'gain', { who: id, n, why });
  if (g.faiz && g.faiz.on === id) {
    const by = g.faiz.by;
    g.faiz = null;
    log(g, 'faiz', { who: by, on: id });
    gain(g, by, 1, 'faiz');
  }
}
/** A loss. Returns how much was actually lost; the loser draws that many Intrigue cards later (the caller decides when). */
export function lose(g: Game, id: PID, n: number, why: string): number {
  const p = P(g, id);
  const lost = Math.min(n, p.influence);
  if (lost <= 0) return 0;
  p.influence -= lost;
  p.stats.lostInfluence = true;
  log(g, 'lose', { who: id, n: lost, why });
  return lost;
}

export function sideOf(g: Game, id: PID) {
  return P(g, id).side;
}
/** The crisis's field: the card's, unless Tahmasp chose another with Cephe. */
export const crisisField = (g: Game): CrisisField => g.field ?? (g.crisis ? crisisById[g.crisis].field : 'saray');
export const fieldsOpen = (g: Game): Field[] => {
  const f = crisisField(g);
  return f === 'saray' ? ['harem', 'divan'] : [f];
};

export const nameOf = (g: Game, id: PID) => P(g, id).name;
export const characterName = (g: Game, id: PID) => characterById[P(g, id).character].name;
