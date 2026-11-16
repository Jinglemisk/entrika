// Player input. act() validates an answer or a power against the rules, applies it to a copy of the state and advances.
import { RULES } from './content.ts';
import {
  P, ask, checkHand, discardCard, dropAsk, eligible, eligibleList, ensureKader, favorOn, gain, log, must, rand,
  readyPower, top,
} from './core.ts';
import { checkWave, drawForSeatLoss, playableForms, replaceMinister, waveAllowance } from './court.ts';
import { advance, crisisDraw } from './flow.ts';
import type { Action, Ask, Game, Kader, PID, Seat, WavePlay } from './types.ts';

export function act(prev: Game, who: PID, a: Action): Game {
  const g = structuredClone(prev);
  must(g.step !== 'over', 'Oyun bitti.');
  must(g.players[who], 'Böyle bir oyuncu yok.');
  if (a.t === 'answer') answer(g, who, a.ask, a.value);
  else if (a.t === 'power') usePower(g, who, a.power, a.target, a.also);
  else if (a.t === 'retract') retract(g, who);
  advance(g);
  return g;
}

// ---------- answers

function answer(g: Game, who: PID, askId: number, value: unknown) {
  const a = g.asks.find(x => x.id === askId);
  must(a, 'Bu soru artık geçerli değil.');
  must(a.to === who, 'Bu karar senin değil.');
  const handler = ANSWERS[a.type] as (g: Game, a: Ask, v: unknown) => void;
  handler(g, a, value);
  dropAsk(g, a.id);
}

const asPid = (g: Game, v: unknown): PID => {
  must(typeof v === 'number' && g.players[v], 'Bir oyuncu seç.');
  return v;
};
const notSultan = (g: Game, id: PID) => must(!P(g, id).sultan, 'Süleyman seçilemez.');

// v comes off the network: every handler checks it before use
type Handlers = { [K in Ask['type']]: (g: Game, a: Extract<Ask, { type: K }>, v: any) => void };

const ANSWERS: Handlers = {
  companion(g, a, v) {
    must(a.offer.includes(v), 'Bu Kul sana gelmedi.');
    P(g, a.to).companion = v;
  },

  discard(g, a, v) {
    const p = P(g, a.to);
    must(Array.isArray(v) && v.length === a.n && new Set(v).size === v.length, `${a.n} kart seç.`);
    for (const uid of v) {
      const c = p.hand.find(x => x.uid === uid);
      must(c, 'Bu kart elinde değil.');
      p.hand = p.hand.filter(x => x.uid !== uid);
      discardCard(g, c);
    }
  },

  keepOne(g, a, v) {
    const p = P(g, a.to);
    const keep = p.hand.find(x => x.uid === v);
    must(keep, 'Tutacağın kartı seç.');
    for (const c of p.hand) if (c !== keep) discardCard(g, c);
    p.hand = [keep];
    checkHand(g, a.to);   // a hand-limit discard owed from before is void now
  },

  window(g, a, v) {
    const use = v !== false && v !== null && v !== undefined;
    const p = P(g, a.to);
    if (!use) return;
    const spend = (which: 'base' | 'favor', extra?: Record<string, unknown>) => {
      p[which] = 'used';
      log(g, 'power', { who: a.to, power: a.power, ...extra });
    };
    switch (a.power) {
      case 'cephe':
        must(v === 'divan' || v === 'harem' || v === 'saray', 'Bir alan seç.');
        g.field = v;
        spend('base', { field: v });
        return;
      case 'kulis': spend('base'); g.kulis = true; return;
      case 'sadrazam': spend('base'); g.appointer = a.to; return;
      case 'feragat': {
        const target = asPid(g, (v as { target?: unknown }).target);
        replaceMinister(g, a.to, a.to, 'feragat', target);
        spend('base');
        gain(g, a.to, 1, 'feragat');
        return;
      }
      case 'iskender':
        p.companionUsed = true;
        g.kader!.iskender = true;
        log(g, 'power', { who: a.to, power: 'iskender' });
        return;
      case 'gozcu':
        spend('favor');
        g.peeks.push({ to: a.to, c: g.crisisNo, kind: 'discards', of: g.kader!.first, cards: g.kader!.discards.first.slice(), source: 'gozcu' });
        return;
      case 'veliaht': {
        const seat = (v as { seat?: unknown }).seat;
        must((seat === 'first' || seat === 'second') && eligible(g, a.to, seat), 'Bu koltuğa geçemezsin.');
        const removed = g.ministers[seat]!;
        replaceMinister(g, removed, a.to, 'veliaht', a.to);
        spend('base');
        drawForSeatLoss(g, removed);
        return;
      }
      case 'fisilti': spend('base'); g.decree!.chooser = a.to; return;
      case 'himaye': {
        const target = asPid(g, (v as { target?: unknown }).target);
        notSultan(g, target);
        g.court!.himaye = target;
        spend('base', { target });
        return;
      }
      case 'lokman': {
        const plays = (a.ctx as { plays: number[] }).plays;
        must(typeof v === 'number' && plays.includes(v), 'Sana oynanan bir kart seç.');
        const pl = g.court!.plays[v];
        p.companionUsed = true;
        g.peeks.push({ to: a.to, c: g.crisisNo, kind: 'playedBy', by: pl.owner, card: pl.as });
        log(g, 'power', { who: a.to, power: 'lokman' });
        return;
      }
    }
    throw new Error('unknown window ' + a.power);
  },

  tie(g, a, v) {
    must(a.candidates.includes(v), 'Eşit olanlardan birini seç.');
    crisisDraw(g, [v]);
  },

  appoint(g, a, v) {
    const { first, second } = (v ?? {}) as { first?: unknown; second?: unknown };
    const f = asPid(g, first), s = asPid(g, second);
    must(f !== s, 'İki ayrı oyuncu seç.');
    notSultan(g, f); notSultan(g, s);
    must(g.surgun.now !== f && g.surgun.now !== s, 'Sürgündeki oyuncu bu kriz Vekil olamaz.');
    g.ministers = { first: f, second: s };
    log(g, 'appoint', { first: f, second: s, by: a.to });
  },

  kulis() {},

  object(g, a, v) {
    if (v === null || v === undefined || v === false) {
      log(g, 'noObjection', { who: a.to });
      return;
    }
    const { seat, free } = v as { seat: Seat; free?: boolean };
    const p = P(g, a.to);
    must(seat === 'first' || seat === 'second', 'Bir Vekil seç.');
    const target = g.ministers[seat]!;
    must(target !== a.to, 'Kendi koltuğuna itiraz edemezsin.');
    must(!p.objected, 'Bu kriz zaten itiraz ettin.');
    if (free) {
      must(readyPower(g, 'sahsultan', 'base')?.id === a.to, 'İtiraz gücün yok.');
      p.base = 'used';
    } else {
      const cost = RULES.objectionCost;
      must(p.influence >= cost, `İtiraz ${cost} Nüfuz tutar.`);
      p.influence -= cost;
      if (favorOn(g, target, 'mustafa')) gain(g, target, cost, 'ocakSevgisi');   // Ocak Sevgisi: the fee goes to Mustafa
    }
    p.objected = true;
    p.stats.objected = true;
    must(eligibleList(g, seat).some(id => id !== target), 'Yerine geçebilecek kimse yok.');
    log(g, free ? 'itiraz' : 'objection', { who: a.to, against: target, seat });
    ask(g, { to: free ? a.to : g.appointer ?? g.sultan, type: 'replace', seat, removed: target, reason: free ? 'itiraz' : 'objection' });
  },

  replace(g, a, v) {
    const newcomer = asPid(g, v);
    must(newcomer !== a.not, 'Daye Hatun ile kendini seçemezsin.');
    replaceMinister(g, a.removed, a.to, a.reason, newcomer);
    drawForSeatLoss(g, a.removed);
    if (a.reason === 'valide' || a.reason === 'azil') g.court!.replaceQueue.shift();
  },

  wave(g, a, v) {
    must(!g.asks.some(x => x.type === 'discard' && x.to === a.to), 'Önce el sınırına kadar kart at.');
    const plays = (Array.isArray(v) ? v : []) as WavePlay[];
    checkWave(g, a.to, plays);
    g.court!.submitted[a.to] = plays.length ? plays : null;
  },

  redirect(g, a, v) {
    if (v === null || v === undefined || v === false) return;
    const { play, target } = v as { play: number; target: unknown };
    must(a.plays.includes(play), 'Sana oynanan bir kart seç.');
    const t = asPid(g, target);
    notSultan(g, t);
    must(t !== a.to, 'Kartı başka bir oyuncuya kaydır.');
    const pl = g.court!.plays[play];
    pl.movedFrom = pl.target;
    pl.target = t;
    P(g, a.to).favor = 'used';
    log(g, 'power', { who: a.to, power: 'yonDegistir', target: t });
  },

  ferman(g, a, v) {
    if (v === null || v === undefined || v === false) return;
    const { seat, target } = v as { seat: Seat; target: unknown };
    must(seat === 'first' || seat === 'second', 'Bir Vekil seç.');
    const removed = g.ministers[seat]!;
    replaceMinister(g, removed, a.to, 'ferman', asPid(g, target));
    g.ferman = false;
    P(g, a.to).base = 'used';
    log(g, 'ferman', { removed, newcomer: g.ministers[seat], seat });
    drawForSeatLoss(g, removed);
  },

  kaderFirst(g, a, v) {
    const k = g.kader!;
    must(Array.isArray(v) && v.length === a.discard && new Set(v).size === v.length && v.every(i => a.cards[i]), `${a.discard} kart at.`);
    const tossed: Kader[] = v.map((i: number) => a.cards[i]);
    k.passed = a.cards.filter((_, i) => !v.includes(i));
    k.discards.first = tossed;
    g.decks.kaderDiscard.push(...tossed);
    log(g, 'kaderPassed', { first: a.to, second: k.second });
  },

  kaderSecond(g, a, v) {
    const k = g.kader!;
    must(v === 0 || v === 1, 'Oynayacağın kartı seç.');
    const play = a.cards[v];
    k.played = play;
    k.discards.second = [a.cards[1 - v]];
    g.decks.kaderDiscard.push(a.cards[1 - v]);
  },

  investigator(g, _a, v) {
    const id = asPid(g, v);
    notSultan(g, id);
    log(g, 'investigator', { who: id });
    ask(g, { to: id, type: 'investigate' });
  },

  investigate(g, a, v) {
    const of = asPid(g, v);
    notSultan(g, of);
    must(of !== a.to, 'Başka bir oyuncunun Tarafına bak.');
    g.peeks.push({ to: a.to, c: g.crisisNo, kind: 'allegiance', of, side: P(g, of).side! });
    log(g, 'investigated', { by: a.to, of });
  },

  hazineName(g, _a, v) {
    const id = asPid(g, v);
    notSultan(g, id);
    ensureKader(g, 3);
    const cards = top(g, 3);
    g.peeks.push({ to: id, c: g.crisisNo, kind: 'kaderTop', cards, source: 'hazineDefteri' });
    log(g, 'hazineNamed', { who: id });
  },

  next() {},
  ack() {},

  decree(g, _a, v) {
    const id = asPid(g, v);
    must(id === g.ministers.first || id === g.ministers.second, 'Vekillerden birini seç.');
    g.decree!.target = id;
  },

  venedik(g, a, v) {
    if (v === null || v === undefined || v === false) return;
    must(typeof v === 'number' && a.cards[v] !== undefined, 'Bir kart seç ya da olduğu gibi bırak.');
    const [card] = g.decks.kader.splice(v, 1);
    g.decks.kader.push(card);
    log(g, 'venedikBottom', { who: a.to });
  },
};

// ---------- Court: take a placed card back before the wave flips

function retract(g: Game, who: PID) {
  const c = g.court;
  must(g.step === 'court' && g.sub === 'wave' && c && who in c.submitted, 'Geri alınacak kart yok.');
  must(!g.asks.some(x => x.type === 'wave' && x.to === who), 'Henüz kart koymadın.');
  must(waveAllowance(g, who) > 0 && P(g, who).hand.some(card => playableForms(g, who, card.uid).length), 'Bu dalgada oynayabileceğin kart yok.');
  delete c.submitted[who];
  ask(g, { to: who, type: 'wave' });
}

// ---------- powers with no stated timing: any time except during Tertip and Kader

/** target: one other player, one who holds a card, two other players (Sezgi), or none. */
export const FREE_POWERS: Record<string, { character: string; which: 'base' | 'favor'; target: 'other' | 'otherWithHand' | 'two' | null }> = {
  surgun: { character: 'sahsultan', which: 'favor', target: 'other' },
  sezgi: { character: 'hatice', which: 'favor', target: 'two' },
  ganimet: { character: 'barbaros', which: 'base', target: 'otherWithHand' },
  faiz: { character: 'gritti', which: 'base', target: 'other' },
  venedikPostasi: { character: 'gritti', which: 'favor', target: null },
  yakipYikma: { character: 'tahmasp', which: 'favor', target: null },
};
const FREE_STEPS: Game['step'][] = ['crisis', 'appoint', 'objections', 'result', 'decree'];

export function freePowerTargets(g: Game, who: PID, power: string): PID[] | null {
  const def = FREE_POWERS[power];
  if (!def || !FREE_STEPS.includes(g.step)) return null;
  if (readyPower(g, def.character, def.which)?.id !== who) return null;
  if (!def.target) return [];
  const targets = g.players.filter(p => !p.sultan && p.id !== who && (def.target !== 'otherWithHand' || p.hand.length > 0)).map(p => p.id);
  return targets.length >= (def.target === 'two' ? 2 : 1) ? targets : null;   // Ganimet with every other hand empty: no button, no picker with nothing to tap
}

function usePower(g: Game, who: PID, power: string, target?: PID, also?: PID) {
  const targets = freePowerTargets(g, who, power);
  must(targets, 'Bu güç şu an kullanılamaz.');
  const def = FREE_POWERS[power];
  if (def.target) must(target !== undefined && targets.includes(target), 'Bir oyuncu seç.');
  if (def.target === 'two') must(also !== undefined && also !== target && targets.includes(also), 'İki ayrı oyuncu seç.');
  const p = P(g, who);
  p[def.which] = 'used';
  log(g, 'power', { who, power, ...(def.target ? { target } : {}), ...(def.target === 'two' ? { also } : {}) });
  switch (power) {
    case 'surgun': g.surgun.next = target!; return;
    case 'sezgi':
      g.peeks.push({ to: who, c: g.crisisNo, kind: 'sameSide', a: target!, b: also!, same: P(g, target!).side === P(g, also!).side });
      return;
    case 'ganimet': {
      const from = P(g, target!);
      const i = Math.floor(rand(g) * from.hand.length);
      const [card] = from.hand.splice(i, 1);
      p.hand.push(card);
      g.peeks.push({ to: who, c: g.crisisNo, kind: 'stolen', from: target!, card: card.kind });
      checkHand(g, who);
      checkHand(g, target!);   // the victim may have owed a hand-limit discard counted on the bigger hand
      return;
    }
    case 'faiz': g.faiz = { by: who, on: target! }; return;
    case 'venedikPostasi': {
      ensureKader(g, 3);
      const cards = top(g, 3);
      g.peeks.push({ to: who, c: g.crisisNo, kind: 'kaderTop', cards, source: 'venedikPostasi' });
      ask(g, { to: who, type: 'venedik', cards });
      return;
    }
    case 'yakipYikma':
      for (const q of g.players) if (!q.sultan && q.hand.length > 1) ask(g, { to: q.id, type: 'keepOne' });
      return;
  }
}
