// The whole game state is one plain JSON object. The server keeps it; every phone gets it and shows only its owner's secrets.
import type { CrisisField, Field } from './content.ts';

export type PID = number;                 // seat index, 0..n-1, clockwise around the table
export type Kader = 'h' | 'x';            // Hizmet, Hıyanet
export type Side = 'loyalist' | 'traitor';
export type Seat = 'first' | 'second';
export type PowerState = 'locked' | 'ready' | 'used';

export interface CardInst { uid: number; kind: string; field: Field }

export interface Stats {
  appointedCrises: number;
  ministerOnHiyanet: boolean;
  ministerOnHizmet: boolean;
  lostInfluence: boolean;                 // any loss; paying for an İtiraz is spending, not losing
  targets: number[];                      // other players you placed Intrigue cards on
  objected: boolean;
  targetedMax: number;
  playedMax: number;                      // most cards you put down in one crisis
  backedMinister: boolean;                // a Mühür or Kefalet of yours took effect on a Vekil
  unseatedByIntrigue: boolean;            // your Valide or Azil removed a Vekil
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
  companionUsed: boolean;                 // the once-per-crisis recast is spent
  stats: Stats;
  // per crisis
  objected: boolean;
  targetedThisCrisis: number;
  playedThisCrisis: number;
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
  akil: Record<number, Field[]>;                  // crisis-long Oyunbozan (akil-hocasi) protection per player
  sealed: number[];                               // Mühür: can't be replaced by Intrigue cards
  tabib: number[];                                // Çeşnigir: can't lose Influence this crisis
  himaye: PID | null;                             // Himaye: neither unseated by Intrigue cards nor losing Influence
  teftis: { owner: PID; target: PID }[];
  kefalet: { owner: PID; target: PID }[];         // pays or costs its owner at the Kader result
  casus: { owner: PID; target: PID }[];           // Mantık: shows its owner the target's plays when Tertip ends
  nobet: { owner: PID; target: PID }[];           // Nöbet: its owner learns who played one card on the target when Tertip ends
  defterdar: PID[];                               // the Birinci Vekil draws 4 Kader cards if still seated
  nazar: PID[];                                   // the Hüküm on this Vekil counts 2
  silenced: PID[];                                // Sükût: can't play in this wave
  silenceNext: PID[];                             // Sükût played this wave: can't play in the next
  history: { owner: PID; as: string; field: Field; target: PID; wave: number }[];   // every card flipped this crisis, for Mantık and Nöbet
  reveals: RevealedPlay[][];                      // every flipped wave this crisis, public
  replaceQueue: { owner: PID; target: PID; play: number; reason: 'valide' | 'azil'; noSelf: boolean }[];
  drawsOwed: Record<number, number>;              // seats and Influence lost this wave, drawn when it ends
  done: boolean;
}

export interface KaderStep {
  drawn: Kader[];
  passed: Kader[];
  played: Kader | null;
  discards: { first: Kader[]; second: Kader[] };
  first: PID;
  second: PID;
}

export type Peek =
  | { to: PID; c: number; kind: 'kaderTop'; cards: Kader[]; source: string }
  | { to: PID; c: number; kind: 'allegiance'; of: PID; side: Side }
  | { to: PID; c: number; kind: 'discards'; of: PID; cards: Kader[]; source: string }
  | { to: PID; c: number; kind: 'casus'; of: PID; plays: { as: string; field: Field; target: PID }[] }
  | { to: PID; c: number; kind: 'sameSide'; a: PID; b: PID; same: boolean }
  | { to: PID; c: number; kind: 'playedBy'; on: PID; by: PID | null; card: string | null }   // Nöbet; null: nobody else played on them
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
  | { id: number; to: PID; type: 'tie'; candidates: PID[] }
  | { id: number; to: PID; type: 'appoint' }
  | { id: number; to: PID; type: 'kulis' }
  | { id: number; to: PID; type: 'object' }
  | { id: number; to: PID; type: 'replace'; seat: Seat; removed: PID; reason: string; not?: PID }   // not: Daye Hatun's owner can't pick themselves
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
  v: 2;                                   // bump when the state's shape changes: older saved games go back to the lobby
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
  field: CrisisField | null;              // Cephe: the field Tahmasp chose for this crisis
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
  decree: { delta: number; chooser: PID; target: PID | null } | null;
  asks: Ask[];
  peeks: Peek[];
  log: LogEntry[];
  sicil: SicilRow[];
  winner: { side: Side; reason: 'loyalty' | 'treason'; overall: PID[] } | null;
}

export type Action =
  | { t: 'answer'; ask: number; value?: unknown }
  | { t: 'power'; power: string; target?: PID; also?: PID }   // also: Sezgi's second player
  | { t: 'retract' };

export class RuleError extends Error {}
