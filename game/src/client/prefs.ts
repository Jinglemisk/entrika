// Per-phone conveniences kept in localStorage: sound switches, private tags on other players, peeks already shown.
import { useSyncExternalStore } from 'react';

export interface Prefs { sfx: boolean; music: boolean; buzz: boolean }
const KEY = 'entrika:prefs';
const read = <T,>(k: string, fallback: T): T => {
  try { return { ...fallback, ...JSON.parse(localStorage.getItem(k) ?? 'null') } as T; } catch { return fallback; }
};
const write = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode */ } };

let prefs: Prefs = read(KEY, { sfx: true, music: false, buzz: true });
const subs = new Set<() => void>();
export const getPrefs = () => prefs;
export function setPrefs(p: Partial<Prefs>) {
  prefs = { ...prefs, ...p };
  write(KEY, prefs);
  subs.forEach(f => f());
}
export const usePrefs = () => useSyncExternalStore(f => { subs.add(f); return () => subs.delete(f); }, () => prefs);

/** Tags you put on other players (şüpheli, güvenilir). Only you see them. Keyed by room and your seat. */
export type Tag = 'suspect' | 'trusted';
export function getTags(room: string, seat: number): Record<number, Tag> {
  return read(`entrika:tags:${room}:${seat}`, {});
}
export function setTag(room: string, seat: number, of: number, tag: Tag | null) {
  const all = getTags(room, seat);
  if (tag) all[of] = tag; else delete all[of];
  write(`entrika:tags:${room}:${seat}`, all);
  subs.forEach(f => f());
}

/** How many of your peeks you have already been shown, so each new one pops up once. */
export const peeksSeen = (room: string, seat: number): number => read(`entrika:peeks:${room}:${seat}`, { n: 0 }).n;
export const markPeeksSeen = (room: string, seat: number, n: number) => write(`entrika:peeks:${room}:${seat}`, { n });
