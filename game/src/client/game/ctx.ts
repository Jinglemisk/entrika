// What every game component needs: the state, who is looking, and how to act. Plus the one "seat picker" that turns
// taps on the court into answers (targets, appointments, replacements).
import { createContext, useContext } from 'react';
import type { Action, Ask, Field, Game, Moment, PID, Player } from '../../engine/index.ts';
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
  | null;

/** One way to put a hand card down: as printed, or recast by your Kul, with Esma Hatun or not. */
export interface Form { as: string; field: Field; recast: boolean }
export interface Aim extends Form { uid: number; esma: boolean }
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

export interface GameCtx {
  room: RoomView;
  g: Game;
  seat: PID;
  me: Player;
  asks: Ask[];               // what the game waits for from me, most urgent first
  act: (a: Action) => void;
  picker: Picker | null;
  setPicker: (p: Picker | null) => void;
  sheet: Sheet;
  setSheet: (s: Sheet) => void;
  setSeat: (id: PID) => void;
  hand: HandState;
  moment: Moment | null;     // a public moment is up in the court area until everyone presses Devam
}

export const Ctx = createContext<GameCtx | null>(null);
export const useGame = () => useContext(Ctx)!;

const URGENT: Ask['type'][] = ['discard', 'keepOne', 'venedik'];
export function myAsks(g: Game, seat: PID): Ask[] {
  const mine = g.asks.filter(a => a.to === seat);
  const rank = (a: Ask) => (URGENT.includes(a.type) ? 0 : a.type === 'ack' ? 2 : 1);
  return mine.slice().sort((a, b) => rank(a) - rank(b));
}

/** The public moment waiting for Devam presses, if any. */
export const pendingMoment = (g: Game): Moment | null => {
  const a = g.asks.find(x => x.type === 'ack');
  return a && a.type === 'ack' ? a.what : null;
};
