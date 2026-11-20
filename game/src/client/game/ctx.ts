// What every game component needs: the state, who is looking, and how to act. Plus the one "seat picker" that turns
// taps on the court into answers (targets, appointments, replacements).
import { createContext, useContext, useEffect, useState } from 'react';
import { RULES, type Action, type Ask, type Field, type Game, type Moment, type PID, type Player } from '../../engine/index.ts';
import type { CardRef } from '../cardSpecs.ts';
import type { RoomView } from '../net.ts';

export interface Picker {
  legal: PID[];
  chosen?: PID[];
  onPick: (id: PID) => void;
}
export type Sheet =
  | { t: 'seat'; id: PID }
  | { t: 'card'; ref: CardRef; uid?: number; own?: boolean }   // uid: a card in your hand; own: your Character or Kul
  | { t: 'log' }
  | { t: 'settings' }
  | { t: 'secret' }
  | { t: 'track' }
  | null;

/** One way to put a hand card down: as printed, or recast by your Kul. */
export interface Form { as: string; field: Field; recast: boolean }
export interface Aim extends Form { uid: number }
export interface Staged extends Aim { target: PID }

/** The hand, shared by the hand, the card pop-up and the prompt: cards picked to discard or keep, and in Tertip the
 *  card being aimed and the plays staged for this wave. */
export interface HandState {
  mode: 'view' | 'play' | 'discard' | 'keep';
  sel: number[];
  setSel: (uids: number[]) => void;
  aim: Aim | null;
  setAim: (a: Aim | null) => void;
  staged: Staged[];
  setStaged: (s: Staged[]) => void;
}

/** A free power waiting for its target seat (n: 2 for Sezgi). Kept apart from the ask's picker so calling it off restores that. */
export interface FreePick { power: string; legal: PID[]; n: 1 | 2; chosen: PID[] }

export interface GameCtx {
  room: RoomView;
  g: Game;
  seat: PID;
  me: Player;
  asks: Ask[];               // what the game waits for from me, most urgent first
  act: (a: Action) => void;
  picker: Picker | null;                   // what a tap on the court does now: the free power's pick wins over the ask's
  setPicker: (p: Picker | null) => void;
  freePick: FreePick | null;
  setFreePick: (f: FreePick | null) => void;
  sheet: Sheet;
  setSheet: (s: Sheet) => void;
  setSeat: (id: PID) => void;
  hand: HandState;
  moment: Moment | null;     // a public moment is up in the court area until everyone presses Devam
  fx: { seat: Record<PID, import('./Fx.tsx').SeatFx[]>; banner: import('./Fx.tsx').Banner | null };   // effects read from the log
}

export const Ctx = createContext<GameCtx | null>(null);
export const useGame = () => useContext(Ctx)!;

const URGENT: Ask['type'][] = ['discard', 'keepOne', 'venedik'];
export function myAsks(g: Game, seat: PID): Ask[] {
  const mine = g.asks.filter(a => a.to === seat);
  const rank = (a: Ask) => (URGENT.includes(a.type) ? 0 : a.type === 'ack' ? 2 : 1);
  return mine.slice().sort((a, b) => rank(a) - rank(b));
}

/** Whether the table may see the game waiting on this ask. A Tertip wave never shows (an instant pass would tell
 *  everyone who has no playable card), nor does a hand-limit discard or Yakıp Yıkma's keep-one (hand sizes are
 *  secret), nor a hidden power window (rules.json powerWindows). */
const SECRET_ASKS: Ask['type'][] = ['wave', 'discard', 'keepOne'];
export const shownWait = (a: Ask) => !SECRET_ASKS.includes(a.type) && !(a.type === 'window' && RULES.powerWindows[a.power]?.show === 'hidden')
  && !(a.type === 'replace' && a.reason === 'valide');   // the owner of a Valide'nin Buyruğu picks unseen
/** Seconds left on a timed ask, or null if it isn't timed. Re-renders the caller every second while it runs. */
export function useSecondsLeft(room: RoomView, askId: number | undefined): number | null {
  const due = askId === undefined ? undefined : room.deadlines?.[askId];
  const [, tick] = useState(0);
  useEffect(() => {
    if (due === undefined) return;
    const id = setInterval(() => tick(n => n + 1), 1000);
    return () => clearInterval(id);
  }, [due]);
  return due === undefined ? null : Math.max(0, Math.ceil((due - (Date.now() + room.skew)) / 1000));
}

/** The seats the table can see the game waiting on. */
export const shownWaiting = (g: Game): PID[] => [...new Set(g.asks.filter(shownWait).map(a => a.to))];

/** The public moment waiting for Devam presses, if any. */
export const pendingMoment = (g: Game): Moment | null => {
  const a = g.asks.find(x => x.type === 'ack');
  if (a && a.type === 'ack') return a.what;
  // a flipped wave waiting on a Valide'nin Buyruğu or Azil pick: the table sees the flip first, then waits for the seat
  if (g.step === 'court' && g.sub === 'valide' && g.court?.reveals.length) return 'wave';
  return null;
};
