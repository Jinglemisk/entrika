// What every game component needs: the state, who is looking, and how to act. Plus the one "seat picker" that turns
// taps on the court into answers (targets, appointments, replacements).
import { createContext, useContext } from 'react';
import type { Action, Ask, Game, PID, Player } from '../../engine/index.ts';
import type { RoomView } from '../net.ts';

export interface Picker {
  legal: PID[];
  chosen?: PID[];
  onPick: (id: PID) => void;
}
export type Sheet =
  | { t: 'seat'; id: PID }
  | { t: 'card'; ref: import('../cardSpecs.ts').CardRef; title?: string }
  | { t: 'log' }
  | { t: 'settings' }
  | { t: 'secret' }
  | null;

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
}

/** The hand's selection, shared by the hand and the prompt: cards picked to play, discard or keep. */
export interface HandState {
  mode: 'view' | 'play' | 'discard' | 'keep';
  sel: number[];
  setSel: (uids: number[]) => void;
}

export const Ctx = createContext<GameCtx | null>(null);
export const useGame = () => useContext(Ctx)!;

const URGENT: Ask['type'][] = ['discard', 'keepOne', 'venedik'];
export function myAsks(g: Game, seat: PID): Ask[] {
  const mine = g.asks.filter(a => a.to === seat);
  return [...mine.filter(a => URGENT.includes(a.type)), ...mine.filter(a => !URGENT.includes(a.type))];
}
