// The crisis as a state machine. Actions only record answers; advance() moves the game forward whenever nothing it
// needs is still owed. Each step has small "subs" so a step can wait for one player, then another.
import { RULES, crisisById } from './content.ts';
import {
  P, ackAll, ask, beside, checkHand, clockwise, companionIs, drawIntrigue, ensureKader, gain, hasAsk, log, lose, others,
  readyPower,
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
          if (p.companion && !['iskender', 'firuze', 'lokman'].includes(p.companion)) p.companionUsed = false;   // once-per-game Kuls stay spent
        }
        g.sicil.push({ c: g.crisisNo, crisis: '', first: null, second: null, result: null, decree: null, events: [] });
        if (g.surgun.now !== null) log(g, 'surgunActive', { who: g.surgun.now });
        g.sub = 'hazine';
        if (g.hazineDefteri) ask(g, { to: g.sultan, type: 'hazineName' });
        return;
      }
      case 'hazine': {
        g.hazineDefteri = false;
        g.sub = 'cephe';
        const t = readyPower(g, 'tahmasp', 'base');
        if (t) ask(g, { to: t.id, type: 'window', power: 'cephe' });
        return;
      }
      case 'cephe':
        flipCrisis(g, g.decks.crisis.shift());
        return;
      case 'draws':
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
      case 'begin':
        g.court = {
          wave: 0, submitted: {}, plays: [], akil: {}, sealed: [], tabib: [], teftis: [], reveals: [], replaceQueue: [],
          drawsOwed: {}, done: false,
        };
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
        for (const [a, b] of [[first, second], [second, first]]) {
          const st = P(g, a).stats;
          st.appointedCrises++;
          st.partners[b] = (st.partners[b] ?? 0) + 1;
          const pargali = P(g, a);
          if (pargali.character === 'ibrahim' && !g.learning && pargali.favor !== 'locked') gain(g, a, 1, 'divanNufuzu');
        }
        g.kader = { iskender: false, drawn: [], passed: [], played: null, discards: { first: [], second: [] }, first, second };
        log(g, 'kaderStart', { first, second });
        g.sub = 'windows';
        if (companionIs(g, first, 'iskender') && !P(g, first).companionUsed) ask(g, { to: first, type: 'window', power: 'iskender' });
        return;
      }
      case 'windows': {
        const n = RULES.kader.draw + (k!.iskender ? 1 : 0);
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
        if (card === 'x') for (const id of [k.first, k.second]) P(g, id).stats.ministerOnHiyanet = true;
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
        g.decree = { delta, chooser: g.sultan, target: null, himaye: null };
        g.sub = 'fisilti';
        const h = readyPower(g, 'hurrem', 'base');
        if (h) ask(g, { to: h.id, type: 'window', power: 'fisilti', ctx: { delta } });
        return;
      }
      case 'fisilti':
        g.sub = 'choose';
        ask(g, { to: g.decree!.chooser, type: 'decree', delta: g.decree!.delta });
        return;
      case 'choose': {
        const d = g.decree!;
        g.sub = 'himaye';
        const h = readyPower(g, 'hatice', 'base');
        if (d.delta < 0 && h && P(g, d.target!).influence > 0 && !g.court?.tabib.includes(d.target!))
          ask(g, { to: h.id, type: 'window', power: 'himaye', ctx: { target: d.target } });
        return;
      }
      case 'himaye':
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

function applyDecree(g: Game) {
  const d = g.decree!;
  const target = d.target!;
  const row = g.sicil[g.sicil.length - 1];
  row.decree = { to: target, delta: d.delta };
  if (d.delta > 0) {
    P(g, target).stats.decreeGain = true;
    log(g, 'decree', { to: target, delta: 1, by: d.chooser });
    gain(g, target, 1, 'decree');
  } else if (d.himaye) {
    log(g, 'decree', { to: target, delta: -1, by: d.chooser, cancelled: 'himaye' });
  } else if (g.court?.tabib.includes(target)) {
    log(g, 'decree', { to: target, delta: -1, by: d.chooser, cancelled: 'tabib' });
  } else {
    const lost = loseAndDraw(g, target, 1, 'decree');
    if (lost) P(g, target).stats.decreeLoss = true;
    log(g, 'decree', { to: target, delta: -1, by: d.chooser, lost });
  }
  checkAmbitions(g);
}

export function loseAndDraw(g: Game, id: PID, n: number, why: string) {
  const lost = lose(g, id, n, why);
  if (lost) {
    drawIntrigue(g, id, lost);
    checkHand(g, id);
  }
  return lost;
}

/** Saray Hazinesi: hands are counted at the end of every crisis, the last one included. */
function countHands(g: Game) {
  for (const p of others(g)) if (p.hand.length >= 3) p.stats.endWithHand = true;
  checkAmbitions(g);
}

function endCrisis(g: Game) {
  countHands(g);
  revealAmbitions(g);
  log(g, 'crisisEnd');
  go(g, 'crisis');
}

function finish(g: Game, side: 'loyalist' | 'traitor', reason: 'loyalty' | 'treason') {
  countHands(g);   // a met Hırs breaks a tie for the overall win
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
