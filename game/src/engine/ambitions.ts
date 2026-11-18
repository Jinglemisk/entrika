// Hırs cards: a goal per card, read from content. Met goals stay secret until the end of the crisis, then unlock the Favor power.
import { ambitionById, type GoalType } from './content.ts';
import { log } from './core.ts';
import type { Game, Stats } from './types.ts';

const GOALS: Record<GoalType, (s: Stats, n: number) => boolean> = {
  appointedCrises: (s, n) => s.appointedCrises >= n,
  ministerOnHiyanet: s => s.ministerOnHiyanet,
  ministerOnHizmet: s => s.ministerOnHizmet,
  lostInfluence: s => s.lostInfluence,
  distinctTargets: (s, n) => s.targets.length >= n,
  objected: s => s.objected,
  targetedInCrisis: (s, n) => s.targetedMax >= n,
  playedInCrisis: (s, n) => s.playedMax >= n,
  backedMinister: s => s.backedMinister,
  unseatedByIntrigue: s => s.unseatedByIntrigue,
  seatByIntrigue: s => s.seatByIntrigue,
  usedInfoCard: s => s.usedInfoCard,
};

export function checkAmbitions(g: Game) {
  for (const p of g.players) {
    if (!p.ambition || p.ambitionMet) continue;
    const { goal } = ambitionById[p.ambition];
    if (GOALS[goal.type](p.stats, goal.n ?? 1)) p.ambitionMet = true;
  }
}

export function revealAmbitions(g: Game) {
  for (const p of g.players) {
    if (!p.ambitionMet || p.ambitionShown) continue;
    p.ambitionShown = true;
    if (p.favor === 'locked') p.favor = 'ready';
    log(g, 'ambition', { who: p.id, id: p.ambition });
  }
}
