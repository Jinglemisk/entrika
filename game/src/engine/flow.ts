// The crisis as a state machine. Actions only record answers; advance() moves the game forward whenever nothing it
// needs is still owed. Each step has small "subs" so a step can wait for one player, then another.
import { RULES, crisisById } from './content.ts';
import {
  P, ackAll, ask, beside, checkHand, clockwise, drawIntrigue, ensureKader, favorOn, gain, hasAsk, log, lose, others, readyPower,
} from './core.ts';
import { checkAmbitions, revealAmbitions } from './ambitions.ts';
import { flipWave, nextReplacement, openWave, resolveWave } from './court.ts';
import type { Game, PID } from './types.ts';

/** Asks that block everything until answered: hand-limit discards and the like. */
const INTERRUPTS = ['discard', 'keepOne', 'venedik'] as const;

export function advance(g: Game) {
  for (let guard = 0; guard < 200; guard++) {
    if (g.step === 'over') return;
    if (hasAsk(g, ...INTERRUPTS)) return;
    const before = `${g.step}/${g.sub}/${g.asks.length}`;
    STEPS[g.step](g);
    const after = `${g.step}/${g.sub}/${g.asks.length}`;
    if (before === after) return;
  }
  throw new Error('advance() did not settle');
}

const go = (g: Game, step: Game['step'], sub = 'begin') => {
  g.step = step;
  g.sub = sub;
};
const waiting = (g: Game) => g.asks.length > 0;

const STEPS: Record<Game['step'], (g: Game) => void> = {
  setup(g) {
    if (waiting(g)) return;
    go(g, 'crisis');
  },

  crisis(g) {
    if (waiting(g)) return;
    switch (g.sub) {
      case 'begin': {
        g.crisisNo++;
        g.crisis = null;
        g.field = null;
        g.surgun.now = g.surgun.next;
        g.surgun.next = null;
        g.ministers = { first: null, second: null };
        g.appointer = g.sultan;
        g.kulis = false;
        g.court = null;
        g.kader = null;
        g.decree = null;
        for (const p of g.players) {
          p.objected = false;
          p.targetedThisCrisis = 0;
          p.playedThisCrisis = 0;
          p.companionUsed = false;
        }
        g.sicil.push({ c: g.crisisNo, crisis: '', first: null, second: null, result: null, decree: null, events: [] });
        if (g.surgun.now !== null) log(g, 'surgunActive', { who: g.surgun.now });
        g.sub = 'hazine';
        if (g.hazineDefteri) ask(g, { to: g.sultan, type: 'hazineName' });
        return;
      }
      case 'hazine':
        g.hazineDefteri = false;
        g.sub = 'flip';
        return;
      case 'flip':
        flipCrisis(g, g.decks.crisis.shift());
        return;
      case 'draws': {
        // Cephe: Tahmasp picks the field before the table sees the crisis
        g.sub = 'cephe';
        const t = readyPower(g, 'tahmasp', 'base');
        if (t) ask(g, { to: t.id, type: 'window', power: 'cephe' });
        return;
      }
      case 'cephe':
        g.sub = 'seen';
        ackAll(g, 'crisis');
        return;
      case 'seen':
        go(g, 'appoint');
        return;
    }
  },

  appoint(g) {
    if (waiting(g)) return;
    switch (g.sub) {
      case 'begin': {
        g.sub = 'sadrazam';
        const i = readyPower(g, 'ibrahim', 'base');
        if (i) ask(g, { to: i.id, type: 'window', power: 'sadrazam' });
        return;
      }
      case 'sadrazam': {
        // Kulis is a word with the appointer, so it is offered only when that is still Süleyman
        g.sub = 'pre';
        const r = readyPower(g, 'rustem', 'base');
        if (r && g.appointer === g.sultan) ask(g, { to: r.id, type: 'window', power: 'kulis' });
        return;
      }
      case 'pre':
        g.sub = 'pick';
        if (g.kulis) ask(g, { to: g.sultan, type: 'kulis' });
        return;
      case 'pick':
        g.sub = 'appointed';
        ask(g, { to: g.appointer ?? g.sultan, type: 'appoint' });
        return;
      case 'appointed': {
        g.sub = 'feragat';
        const s = readyPower(g, 'sarlken', 'base');
        if (s && (g.ministers.first === s.id || g.ministers.second === s.id)) ask(g, { to: s.id, type: 'window', power: 'feragat' });
        return;
      }
      case 'feragat':
        go(g, 'objections');
        g.objectionTurn = 0;
        return;
    }
  },

  objections(g) {
    if (waiting(g)) return;
    if (g.sub === 'begin' || g.sub === 'turn') {
      const order = clockwise(g);
      if (g.objectionTurn >= order.length) {
        g.sub = 'done';
        ask(g, { to: g.sultan, type: 'next', what: 'court' });
        return;
      }
      g.sub = 'turn';
      const p = order[g.objectionTurn++];
      ask(g, { to: p.id, type: 'object' });
      return;
    }
    if (g.sub === 'done') go(g, 'court');
  },

  court(g) {
    if (waiting(g)) return;
    switch (g.sub) {
      case 'begin': {
        g.court = {
          wave: 0, submitted: {}, plays: [], akil: {}, sealed: [], tabib: [], himaye: null, teftis: [], kefalet: [], casus: [],
          nobet: [], defterdar: [], nazar: [], silenced: [], silenceNext: [], cifte: null,
          history: [], reveals: [], replaceQueue: [], drawsOwed: {}, done: false,
        };
        g.sub = 'himaye';
        const h = readyPower(g, 'hatice', 'base');
        if (h) ask(g, { to: h.id, type: 'window', power: 'himaye' });
        return;
      }
      case 'himaye':
        openWave(g);
        return;
      case 'wave':
        flipWave(g);
        return;
      case 'redirect':
        resolveWave(g);
        return;
      case 'valide':
        nextReplacement(g);
        return;
      case 'seen':
        openWave(g);
        return;
      case 'veliaht':
        g.sub = 'ferman';
        if (g.ferman) ask(g, { to: g.sultan, type: 'ferman' });
        return;
      case 'ferman':
        go(g, 'kader');
        return;
    }
  },

  kader(g) {
    if (waiting(g)) return;
    const k = g.kader;
    switch (g.sub) {
      case 'begin': {
        const { first, second } = g.ministers;
        if (first === null || second === null) throw new Error('Kader without two Vekils');
        g.lastMinisters = [first, second];
        const row = g.sicil[g.sicil.length - 1];
        row.first = first;
        row.second = second;
        for (const id of [first, second]) P(g, id).stats.appointedCrises++;
        g.kader = { drawn: [], passed: [], played: null, discards: { first: [], second: [] }, first, second };
        log(g, 'kaderStart', { first, second });
        g.sub = 'draw';
        return;
      }
      case 'draw': {
        // Defterdar: a Birinci Vekil it was put on, and who still sits there, draws one more
        const n = RULES.kader.draw + (g.court?.defterdar.includes(k!.first) ? 1 : 0);
        ensureKader(g, n);
        k!.drawn = g.decks.kader.splice(0, n);
        g.sub = 'first';
        ask(g, { to: k!.first, type: 'kaderFirst', cards: k!.drawn.slice(), discard: n - 2 });
        return;
      }
      case 'first':
        g.sub = 'second';
        ask(g, { to: k!.second, type: 'kaderSecond', cards: k!.passed.slice() });
        return;
      case 'second':
        go(g, 'result');
        return;
    }
  },

  result(g) {
    if (waiting(g)) return;
    const k = g.kader!;
    switch (g.sub) {
      case 'begin': {
        const card = k.played!;
        const row = g.sicil[g.sicil.length - 1];
        row.result = card;
        if (card === 'h') g.tracks.loyalty++;
        else g.tracks.treason++;
        log(g, 'result', { card, loyalty: g.tracks.loyalty, treason: g.tracks.treason });
        for (const id of [k.first, k.second]) P(g, id).stats[card === 'x' ? 'ministerOnHiyanet' : 'ministerOnHizmet'] = true;
        if (card === 'h') for (const id of [k.first, k.second]) if (favorOn(g, id, 'ibrahim')) gain(g, id, 1, 'divanNufuzu');
        settleKefalet(g, card);
        for (const t of g.court?.teftis ?? []) {
          const cards = t.target === k.first ? k.discards.first : t.target === k.second ? k.discards.second : [];
          g.peeks.push({ to: t.owner, c: g.crisisNo, kind: 'discards', of: t.target, cards, source: 'teftis' });
        }
        checkAmbitions(g);
        if (g.tracks.loyalty >= RULES.tracks.loyalty) return finish(g, 'loyalist', 'loyalty');
        if (g.tracks.treason >= RULES.tracks.treason) return finish(g, 'traitor', 'treason');
        g.sub = 'power';
        if (card === 'x') {
          const power = RULES.treasonPowers[String(g.tracks.treason)];
          if (power === 'sorusturma') {
            log(g, 'sorusturma');
            ask(g, { to: g.sultan, type: 'investigator' });
          } else if (power === 'hazineDefteri') {
            g.hazineDefteri = true;
            log(g, 'hazineDefteri');
          } else if (power === 'fermanRefresh') {
            g.ferman = true;
            log(g, 'fermanRefresh');
          }
        }
        const b = readyPower(g, 'barbaros', 'favor');
        if (b && b.id !== k.first) ask(g, { to: b.id, type: 'window', power: 'gozcu' });
        ackAll(g, 'result');
        return;
      }
      case 'power':
        go(g, 'decree');
        return;
    }
  },

  decree(g) {
    if (waiting(g)) return;
    switch (g.sub) {
      case 'begin': {
        const delta = g.kader!.played === 'h' ? 1 : -1;
        g.decree = { delta, chooser: g.sultan, target: null };
        g.sub = 'fisilti';
        const h = readyPower(g, 'hurrem', 'base');
        if (h) ask(g, { to: h.id, type: 'window', power: 'fisilti', ctx: { delta } });
        return;
      }
      case 'fisilti':
        g.sub = 'choose';
        ask(g, { to: g.decree!.chooser, type: 'decree', delta: g.decree!.delta });
        return;
      case 'choose':
        applyDecree(g);
        g.sub = 'end';
        return;
      case 'end':
        endCrisis(g);
        return;
    }
  },

  over() {},
};

// ---------- pieces used by the steps and by answers

export function flipCrisis(g: Game, id: string | undefined) {
  if (!id) {
    g.decks.crisis = g.decks.crisisUsed.splice(0);
    id = g.decks.crisis.shift()!;
  }
  g.crisis = id;
  g.decks.crisisUsed.push(id);
  g.sicil[g.sicil.length - 1].crisis = id;
  const def = crisisById[id];
  log(g, 'crisis', { id });
  g.sub = 'draws';
  const hidden = others(g);
  switch (def.draw) {
    case 'everyone': return crisisDraw(g, hidden.map(p => p.id));
    case 'zeroInfluence': return crisisDraw(g, hidden.filter(p => p.influence === 0).map(p => p.id));
    case 'besideSultan': return crisisDraw(g, beside(g));
    case 'lastMinisters': return crisisDraw(g, g.lastMinisters);
    case 'leastInfluence': {
      const min = Math.min(...hidden.map(p => p.influence));
      const low = hidden.filter(p => p.influence === min).map(p => p.id);
      if (low.length === 1) return crisisDraw(g, low);
      ask(g, { to: g.sultan, type: 'tie', candidates: low });
      return;
    }
    case 'none': return;
  }
}

export function crisisDraw(g: Game, ids: PID[]) {
  for (const id of ids) {
    drawIntrigue(g, id, 1);
    checkHand(g, id);
  }
}

/** How much the Hüküm moves on this Vekil: 2 under a Nazar, else 1. */
export const decreeSize = (g: Game, id: PID) => (g.court?.nazar.includes(id) ? 2 : 1);

function applyDecree(g: Game) {
  const d = g.decree!;
  const target = d.target!;
  const delta = d.delta * decreeSize(g, target);
  const row = g.sicil[g.sicil.length - 1];
  row.decree = { to: target, delta };
  if (delta > 0) {
    log(g, 'decree', { to: target, delta, by: d.chooser });
    gain(g, target, delta, 'decree');
  } else if (savedBy(g, target)) {
    log(g, 'decree', { to: target, delta, by: d.chooser, cancelled: savedBy(g, target) });
  } else {
    const lost = loseAndDraw(g, target, -delta, 'decree');
    log(g, 'decree', { to: target, delta, by: d.chooser, lost });
  }
  checkAmbitions(g);
}

/** What keeps a player from losing Influence this crisis: Himaye, or Çeşnigir on them. */
const savedBy = (g: Game, id: PID) => (g.court?.himaye === id ? 'himaye' : g.court?.tabib.includes(id) ? 'tabib' : null);

/** Kefalet pays its owner on Hizmet and costs them on Hıyanet, if the Vekil it was put on still sits at Kader. */
function settleKefalet(g: Game, card: 'h' | 'x') {
  const k = g.kader!;
  for (const { owner, target } of g.court?.kefalet ?? []) {
    if (target !== k.first && target !== k.second) continue;
    if (card === 'h') gain(g, owner, 1, 'kefalet');
    else if (savedBy(g, owner)) log(g, 'kefaletSaved', { who: owner, by: savedBy(g, owner) });
    else loseAndDraw(g, owner, 1, 'kefalet');
  }
}

export function loseAndDraw(g: Game, id: PID, n: number, why: string) {
  const lost = lose(g, id, n, why);
  if (lost) {
    drawIntrigue(g, id, lost);
    checkHand(g, id);
  }
  return lost;
}

function endCrisis(g: Game) {
  revealAmbitions(g);
  log(g, 'crisisEnd');
  go(g, 'crisis');
}

function finish(g: Game, side: 'loyalist' | 'traitor', reason: 'loyalty' | 'treason') {
  const winners = g.players.filter(p => !p.sultan && p.side === side);
  const best = Math.max(...winners.map(p => p.influence));
  let top = winners.filter(p => p.influence === best);
  if (top.length > 1 && top.some(p => p.ambitionMet)) top = top.filter(p => p.ambitionMet);
  g.winner = { side, reason, overall: top.map(p => p.id) };
  g.asks = [];
  log(g, 'gameOver', { side, reason, overall: g.winner.overall });
  g.step = 'over';
  g.sub = 'over';
}
