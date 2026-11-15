// A new game, dealt as the manual's Setup says.
import { AMBITIONS, CHARACTERS, COMPANIONS, CRISES, INTRIGUE, RULES, type Field } from './content.ts';
import { ask, log, must, shuffle } from './core.ts';
import { advance } from './flow.ts';
import type { CardInst, Game, Kader, Player, Side } from './types.ts';

export interface SetupOptions {
  learning?: boolean;   // learning game: no Kuls, Hırs or Favor powers, no Wildcards
  sultan?: number;      // seat that plays Süleyman; random if missing
  seed?: number;
}

const blankStats = () => ({
  appointedCrises: 0, partners: {}, ministerOnHiyanet: false, decreeGain: false, decreeLoss: false, targets: [],
  gainCrises: [], objected: false, targetedMax: 0, endWithHand: false, seatByIntrigue: false, usedInfoCard: false,
});

export function createGame(names: string[], opts: SetupOptions = {}): Game {
  const n = names.length;
  must(n >= RULES.players.min && n <= RULES.players.max, `Oyuncu sayısı ${RULES.players.min}–${RULES.players.max} olmalı.`);
  const learning = !!opts.learning;
  const g: Game = {
    v: 1, rng: (opts.seed ?? Date.now()) | 0, learning, players: [], sultan: 0, nextUid: 1, nextAsk: 1,
    decks: { intrigue: [], intrigueDiscard: [], kader: [], kaderDiscard: [], crisis: [], crisisUsed: [] },
    tracks: { loyalty: 0, treason: 0 }, ferman: true, crisisNo: 0, crisis: null, step: 'setup', sub: 'companions',
    ministers: { first: null, second: null }, lastMinisters: [], appointer: null, kulis: false, objectionTurn: 0,
    surgun: { next: null, now: null }, hazineDefteri: false, sorusturma: null, faiz: null,
    court: null, kader: null, decree: null, asks: [], peeks: [], log: [], sicil: [], winner: null,
  };
  g.sultan = opts.sultan ?? Math.floor(shuffleIndex(g, n));

  const pool = shuffle(g, CHARACTERS.filter(c => !c.sultan && !(learning && c.wildcard)).map(c => c.id));
  const table = RULES.allegiance[String(n)];
  const sides: Side[] = shuffle(g, [...Array(table.loyalist).fill('loyalist'), ...Array(table.traitor).fill('traitor')]);
  const ambitions = shuffle(g, AMBITIONS.map(a => a.id));
  const comps = shuffle(g, COMPANIONS.map(c => c.id));

  g.players = names.map((name, id): Player => {
    const isSultan = id === g.sultan;
    return {
      id, name, sultan: isSultan,
      character: isSultan ? 'suleyman' : pool.shift()!,
      side: isSultan ? null : sides.shift()!,
      companion: null,
      ambition: isSultan || learning ? null : ambitions.shift()!,
      ambitionMet: false, ambitionShown: false,
      influence: isSultan ? 0 : RULES.startInfluence,
      hand: [],
      base: 'ready',
      favor: isSultan ? 'used' : 'locked',
      companionUsed: false, stats: blankStats(), objected: false, played: 0, targetedThisCrisis: 0,
    };
  });

  const cards: CardInst[] = [];
  for (const def of INTRIGUE)
    for (const [field, count] of Object.entries(def.copies))
      for (let i = 0; i < (count ?? 0); i++) cards.push({ uid: g.nextUid++, kind: def.id, field: field as Field });
  g.decks.intrigue = shuffle(g, cards);
  g.decks.kader = shuffle(g, [...Array(RULES.kader.hizmet).fill('h'), ...Array(RULES.kader.hiyanet).fill('x')] as Kader[]);
  g.decks.crisis = shuffle(g, CRISES.map(c => c.id));

  for (const p of g.players) {
    if (p.sultan) continue;
    p.hand = g.decks.intrigue.splice(0, RULES.startIntrigue);
    if (!learning) ask(g, { to: p.id, type: 'companion', offer: comps.splice(0, RULES.companionChoices) });
  }
  const traitors = g.players.filter(p => p.side === 'traitor').map(p => p.id);
  for (const p of g.players) {
    if (p.side) g.peeks.push({ to: p.id, c: 0, kind: 'role', side: p.side, traitors: p.side === 'traitor' ? traitors.filter(x => x !== p.id) : [] });
  }
  log(g, 'setup', { n, learning });
  advance(g);
  return g;
}

function shuffleIndex(g: Game, n: number) {
  return shuffle(g, Array.from({ length: n }, (_, i) => i))[0];
}
