// The whole game state is one plain JSON object. The server keeps it; every phone gets it and shows only its owner's secrets.
import type { Field } from './content.ts';

export type PID = number;                 // seat index, 0..n-1, clockwise around the table
export type Kader = 'h' | 'x';            // Hizmet, Hıyanet
export type Side = 'loyalist' | 'traitor';
export type Seat = 'first' | 'second';
export type PowerState = 'locked' | 'ready' | 'used';

export interface CardInst { uid: number; kind: string; field: Field }

export interface Stats {
  appointedCrises: number;
  partners: Record<number, number>;       // crises served beside each other player
  ministerOnHiyanet: boolean;
  decreeGain: boolean;
  decreeLoss: boolean;
  targets: number[];                      // other players you placed Intrigue cards on
  gainCrises: number[];
  objected: boolean;
  targetedMax: number;
  endWithHand: boolean;
  seatByIntrigue: boolean;
  usedInfoCard: boolean;
}

export interface Player {
  id: PID;
  name: string;
  character: string;
  sultan: boolean;
  side: Side | null;                      // null for Süleyman
  companion: string | null;
  ambition: string | null;
  ambitionMet: boolean;                   // condition met; revealed at the end of the crisis
  ambitionShown: boolean;                 // revealed: the Favor power is unlocked
  influence: number;
  hand: CardInst[];
  base: PowerState;
  favor: PowerState;
  companionUsed: boolean;                 // once-per-crisis recast, or a once-per-game special, is spent
  stats: Stats;
  // per crisis
  objected: boolean;
  targetedThisCrisis: number;
}

export interface Play {
  owner: PID;
  card: CardInst;                         // the physical card
  as: string;                             // the kind it counts as (recast or printed)
  field: Field;                           // the field it counts as
  target: PID;
  recast: boolean;
  movedFrom?: PID;                        // Yön Değiştir moved it here
}

export type Outcome = 'ok' | 'cancelled' | 'void';
export interface RevealedPlay extends Omit<Play, 'owner'> {
  outcome: Outcome;
  note?: string;
}

/** One card as submitted in a wave: which card, on whom, and optionally the Kul recast. */
export interface WavePlay { uid: number; target: PID; recastAs?: string; field?: Field }

export interface Court {
  wave: number;
  submitted: Record<number, WavePlay[] | null>;   // null = passed; missing = not yet
  plays: Play[];                                  // the flipped wave, waiting to resolve
  akil: Record<number, Field[]>;                  // crisis-long Akıl Hocası protection per player
  sealed: number[];                               // Mühür: can't be replaced by Intrigue cards
  tabib: number[];                                // Saray Tabibi: can't lose Influence this crisis
  teftis: { owner: PID; target: PID }[];
  reveals: RevealedPlay[][];                      // every flipped wave this crisis, public
  replaceQueue: { owner: PID; target: PID; play: number }[];
  drawsOwed: Record<number, number>;              // seats and Influence lost this wave, drawn when it ends
  done: boolean;
}

export interface KaderStep {
  iskender: boolean;
  drawn: Kader[];
  passed: Kader[];
  played: Kader | null;
  discards: { first: Kader[]; second: Kader[] };
  first: PID;
  second: PID;
}

export type Peek =
  | { to: PID; c: number; kind: 'handAmbition'; of: PID; hand: { kind: string; field: Field }[]; ambition: string | null }
  | { to: PID; c: number; kind: 'kaderTop'; cards: Kader[]; source: string }
  | { to: PID; c: number; kind: 'allegiance'; of: PID; side: Side }
  | { to: PID; c: number; kind: 'ambition'; of: PID; ambition: string | null }
  | { to: PID; c: number; kind: 'discards'; of: PID; cards: Kader[]; source: string }
  | { to: PID; c: number; kind: 'crisisTop'; cards: string[] }
  | { to: PID; c: number; kind: 'stolen'; from: PID; card: string }
  | { to: PID; c: number; kind: 'role'; side: Side; traitors: PID[] };   // dealt at setup; traitors see each other

export interface LogEntry { c: number; k: string; p?: Record<string, unknown> }

export interface SicilRow {
  c: number; crisis: string; first: PID | null; second: PID | null;
  result: Kader | null; decree: { to: PID; delta: number } | null; events: LogEntry[];
}

/** Public moments every player confirms having seen: a Crisis flips, a wave flips, the Kader result. */
export type Moment = 'crisis' | 'wave' | 'result';

export type StepName = 'setup' | 'crisis' | 'appoint' | 'objections' | 'court' | 'kader' | 'result' | 'decree' | 'over';

// What the game waits for. Every input a player owes is an Ask addressed to them.
export type Ask =
  | { id: number; to: PID; type: 'companion'; offer: string[] }
  | { id: number; to: PID; type: 'discard'; n: number }
  | { id: number; to: PID; type: 'keepOne' }
  | { id: number; to: PID; type: 'window'; power: string; ctx?: Record<string, unknown> }
  | { id: number; to: PID; type: 'cephe'; cards: string[] }
  | { id: number; to: PID; type: 'tie'; candidates: PID[] }
  | { id: number; to: PID; type: 'appoint' }
  | { id: number; to: PID; type: 'kulis' }
  | { id: number; to: PID; type: 'object' }
  | { id: number; to: PID; type: 'replace'; seat: Seat; removed: PID; reason: string }
  | { id: number; to: PID; type: 'wave' }
  | { id: number; to: PID; type: 'redirect'; plays: number[] }
  | { id: number; to: PID; type: 'ferman' }
  | { id: number; to: PID; type: 'kaderFirst'; cards: Kader[]; discard: number }
  | { id: number; to: PID; type: 'kaderSecond'; cards: Kader[] }
  | { id: number; to: PID; type: 'investigator' }
  | { id: number; to: PID; type: 'investigate' }
  | { id: number; to: PID; type: 'hazineName' }
  | { id: number; to: PID; type: 'next'; what: string }
  | { id: number; to: PID; type: 'ack'; what: Moment }             // everyone presses Devam before the game moves on
  | { id: number; to: PID; type: 'decree'; delta: number }
  | { id: number; to: PID; type: 'venedik'; cards: Kader[] };

export interface Game {
  v: 1;
  rng: number;
  learning: boolean;
  players: Player[];
  sultan: PID;
  nextUid: number;
  nextAsk: number;
  decks: { intrigue: CardInst[]; intrigueDiscard: CardInst[]; kader: Kader[]; kaderDiscard: Kader[]; crisis: string[]; crisisUsed: string[] };
  tracks: { loyalty: number; treason: number };
  ferman: boolean;
  crisisNo: number;
  crisis: string | null;
  step: StepName;
  sub: string;                            // where inside the step we are
  ministers: { first: PID | null; second: PID | null };
  lastMinisters: PID[];
  appointer: PID | null;                  // Süleyman, or Pargalı with Sadrazam
  kulis: boolean;
  objectionTurn: number;                  // index into the objection order
  surgun: { next: PID | null; now: PID | null };
  hazineDefteri: boolean;                 // owed before the next crisis
  faiz: { by: PID; on: PID } | null;
  court: Court | null;
  kader: KaderStep | null;
  decree: { delta: number; chooser: PID; target: PID | null; himaye: boolean | null } | null;
  asks: Ask[];
  peeks: Peek[];
  log: LogEntry[];
  sicil: SicilRow[];
  winner: { side: Side; reason: 'loyalty' | 'treason'; overall: PID[] } | null;
}

export type Action =
  | { t: 'answer'; ask: number; value?: unknown }
  | { t: 'power'; power: string; target?: PID }
  | { t: 'retract' };

export class RuleError extends Error {}
