// A random but legal player. Used by the test-game "bots" switch and by the simulation script.
import { RULES } from './content.ts';
import { eligibleList, favorOn, readyPower } from './core.ts';
import { legalTargets, playableForms, waveAllowance } from './court.ts';
import { FREE_POWERS, freePowerTargets } from './actions.ts';
import type { Action, Ask, Game, Kader, PID, Seat, WavePlay } from './types.ts';

type R = () => number;
const pick = <T>(r: R, list: T[]): T => list[Math.floor(r() * list.length)];
const chance = (r: R, p: number) => r() < p;

export function botAnswer(g: Game, a: Ask, r: R = Math.random): Action {
  const v = value(g, a, r);
  return { t: 'answer', ask: a.id, value: v };
}

function value(g: Game, a: Ask, r: R): unknown {
  const me = g.players[a.to];
  const hidden = g.players.filter(p => !p.sultan).map(p => p.id);
  switch (a.type) {
    case 'companion': return pick(r, a.offer);
    case 'discard': return shuffled(r, me.hand.map(c => c.uid)).slice(0, a.n);
    case 'keepOne': return pick(r, me.hand).uid;
    case 'window': {
      if (!chance(r, 0.5)) return false;
      if (a.power === 'feragat') {
        const seat: Seat = g.ministers.first === a.to ? 'first' : 'second';
        const list = eligibleList(g, seat).filter(id => id !== a.to);
        return list.length ? { target: pick(r, list) } : false;
      }
      return true;
    }
    case 'cephe': return pick(r, a.cards);
    case 'tie': return pick(r, a.candidates);
    case 'appoint': {
      const ok = hidden.filter(id => g.surgun.now !== id);
      const [f, s] = shuffled(r, ok);
      return { first: f, second: s };
    }
    case 'kulis': return null;
    case 'object': {
      if (!chance(r, 0.25)) return null;
      const seats = (['first', 'second'] as Seat[]).filter(s => g.ministers[s] !== a.to);
      const seat = pick(r, seats);
      const target = g.ministers[seat]!;
      if (!eligibleList(g, seat).some(id => id !== target)) return null;
      if (readyPower(g, 'sahsultan', 'base')?.id === a.to && chance(r, 0.5)) return { seat, free: true };
      const cost = favorOn(g, target, 'mustafa') ? 2 : RULES.objectionCost;
      return me.influence >= cost ? { seat } : null;
    }
    case 'replace': return pick(r, eligibleList(g, a.seat).filter(id => id !== a.removed));
    case 'wave': return wave(g, a.to, r);
    case 'redirect':
      if (!chance(r, 0.5)) return null;
      return { play: pick(r, a.plays), target: pick(r, hidden.filter(id => id !== a.to)) };
    case 'ferman': {
      if (!chance(r, 0.3)) return null;
      const seat: Seat = chance(r, 0.5) ? 'first' : 'second';
      const list = eligibleList(g, seat).filter(id => id !== g.ministers[seat]);
      return list.length ? { seat, target: pick(r, list) } : null;
    }
    case 'kaderFirst': return kaderFirst(me.side === 'loyalist', a.cards, a.discard, r);
    case 'kaderSecond': {
      if (me.side === 'loyalist' && a.cards.includes('h')) return a.cards.indexOf('h');
      return me.side === 'traitor' && a.cards.includes('x') && chance(r, 0.8) ? a.cards.indexOf('x') : pick(r, [0, 1]);
    }
    case 'investigator': return pick(r, hidden);
    case 'investigate': return pick(r, hidden.filter(id => id !== a.to));
    case 'hazineName': return pick(r, hidden);
    case 'next': case 'ack': return null;
    case 'decree': return pick(r, [g.ministers.first!, g.ministers.second!]);
    case 'venedik': return chance(r, 0.5) ? null : pick(r, [0, 1, 2].filter(i => a.cards[i] !== undefined));
  }
}

function wave(g: Game, id: PID, r: R): WavePlay[] {
  if (chance(r, Math.min(0.9, 0.25 + 0.15 * (g.court?.wave ?? 1)))) return [];   // bots tire of plotting as waves go on
  const me = g.players[id];
  const n = Math.min(waveAllowance(g, id), chance(r, 0.3) ? 2 : 1);
  const out: WavePlay[] = [];
  let recastUsed = false;
  for (const card of shuffled(r, me.hand)) {
    if (out.length >= n) break;
    const forms = playableForms(g, id, card.uid).filter(f => !(f.recast && recastUsed));
    if (!forms.length) continue;
    const f = pick(r, forms);
    const target = pick(r, legalTargets(g, id, f.as));
    if (f.recast) recastUsed = true;
    out.push({ uid: card.uid, target, ...(f.recast ? { recastAs: f.as, field: f.field } : {}) });
  }
  return out;
}

function kaderFirst(loyal: boolean, cards: Kader[], n: number, r: R): number[] {
  const idx = cards.map((_, i) => i);
  if (!loyal) return shuffled(r, idx).slice(0, n);
  const xs = shuffled(r, idx.filter(i => cards[i] === 'x'));
  const hs = shuffled(r, idx.filter(i => cards[i] === 'h'));
  return xs.concat(hs).slice(0, n);
}

/** A random free power this player could use now, as an action. */
export function botPower(g: Game, id: PID, r: R = Math.random): Action | null {
  for (const power of shuffled(r, Object.keys(FREE_POWERS))) {
    const t = freePowerTargets(g, id, power);
    if (!t) continue;
    if (FREE_POWERS[power].target && !t.length) continue;
    return { t: 'power', power, ...(t.length ? { target: pick(r, t) } : {}) };
  }
  return null;
}

function shuffled<T>(r: R, list: T[]): T[] {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
