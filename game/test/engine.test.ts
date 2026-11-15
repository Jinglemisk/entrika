// Critical rules tests. Each one plays the engine through real answers, the way phones do, and checks one rule
// from the manual that would silently break a game if it regressed.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  act, createGame, freePowerTargets, playableForms, RuleError, type Action, type Ask, type Field, type Game, type PID,
} from '../src/engine/index.ts';
import { botAnswer, botPower } from '../src/engine/bot.ts';
import { advance } from '../src/engine/flow.ts';

let uid = 1000;
const card = (kind: string, field: Field) => ({ uid: uid++, kind, field });
const ask = (g: Game, type: Ask['type'], to?: PID) => {
  const a = g.asks.find(x => x.type === type && (to === undefined || x.to === to));
  assert.ok(a, `no ${type} ask${to !== undefined ? ' for ' + to : ''} at ${g.step}/${g.sub}`);
  return a;
};
const answer = (g: Game, type: Ask['type'], value?: unknown, to?: PID) => {
  const a = ask(g, type, to);
  return act(g, a.to, { t: 'answer', ask: a.id, value });
};

/** Deterministic answers for everything a test doesn't care about: decline every optional power, never object. */
function calm(g: Game, a: Ask, appoint?: { first: PID; second: PID }): unknown {
  switch (a.type) {
    case 'appoint': return appoint ?? { first: g.players.find(p => !p.sultan)!.id, second: g.players.filter(p => !p.sultan)[1].id };
    case 'window': case 'object': case 'next': case 'ferman': case 'redirect': case 'venedik': case 'kulis': return null;
    case 'companion': return a.offer[0];
    case 'discard': return g.players[a.to].hand.slice(0, a.n).map(c => c.uid);
    default: return (botAnswer(g, a, () => 0) as { value?: unknown }).value;
  }
}

/** A 6-player learning game (Süleyman at seat 0) taken to the first Tertip wave of a chosen Crisis, with given Vekils.
 *  Every hand starts empty; hands() deals what a test needs. */
function court(opts: { first: PID; second: PID; crisis?: string }): Game {
  let g = createGame(['S', 'A', 'B', 'C', 'D', 'E'], { seed: 7, sultan: 0, learning: true });
  for (const p of g.players) if (!p.sultan) p.base = 'used';    // no power windows from here on
  g.asks = g.asks.filter(a => a.type !== 'window');
  advance(g);
  g.crisis = opts.crisis ?? 'hazine';                             // Hazine Açığı: both fields open, nobody draws
  for (const p of g.players) p.hand = [];
  while (g.step !== 'court') {
    const a = g.asks[0];
    assert.ok(a, `stuck at ${g.step}/${g.sub}`);
    g = act(g, a.to, { t: 'answer', ask: a.id, value: calm(g, a, opts) } as Action);
  }
  return g;
}
/** Deal these hands (everyone else empty) and reopen the current wave so its asks match. */
function hands(g: Game, h: Record<number, ReturnType<typeof card>[]>): Game {
  for (const p of g.players) if (!p.sultan) p.hand = h[p.id] ?? [];
  g.asks = g.asks.filter(a => a.type !== 'wave' && a.type !== 'ferman' && a.type !== 'ack');
  g.step = 'court';
  g.sub = 'wave';
  g.court!.done = false;
  g.court!.submitted = {};
  for (const p of g.players) if (!p.sultan) {
    if (p.hand.length) g.asks.push({ id: g.nextAsk++, to: p.id, type: 'wave' });
    else g.court!.submitted[p.id] = null;
  }
  return g;
}
/** Everyone with an open wave ask plays what `plays` says for them, or passes. */
function wave(g: Game, plays: Record<number, { uid: number; target: PID; recastAs?: string; field?: Field; returns?: boolean }[]>): Game {
  for (const a of g.asks.filter(x => x.type === 'wave')) g = act(g, a.to, { t: 'answer', ask: a.id, value: plays[a.to] ?? [] });
  return g;
}
/** Everyone presses Devam on the public moment that is up. */
function seen(g: Game): Game {
  for (const a of g.asks.filter(x => x.type === 'ack')) g = act(g, a.to, { t: 'answer', ask: a.id });
  return g;
}
const lastReveal = (g: Game) => g.court!.reveals[g.court!.reveals.length - 1];

test('random games always end, and no card is ever lost', () => {
  let seed = 3;
  const r = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  for (let i = 0; i < 150; i++) {
    const n = 5 + (i % 4);
    let g = createGame(Array.from({ length: n }, (_, k) => `P${k}`), { seed: i + 11, learning: i % 3 === 0 });
    for (let steps = 0; g.step !== 'over'; steps++) {
      assert.ok(steps < 5000, `game ${i} did not end`);
      if (r() < 0.05) { const pw = botPower(g, Math.floor(r() * n), r); if (pw) try { g = act(g, (pw as { target?: number }).target ?? 0, pw); } catch { /* not that player's power */ } }
      const urgent = g.asks.filter(a => a.type === 'discard' || a.type === 'keepOne');
      const pool = urgent.length ? urgent : g.asks;
      const a = pool[Math.floor(r() * pool.length)];
      g = act(g, a.to, botAnswer(g, a, r));
      if (g.step !== 'court') {
        const cards = g.decks.intrigue.length + g.decks.intrigueDiscard.length + g.players.reduce((s, p) => s + p.hand.length, 0);
        assert.equal(cards, 30, `intrigue cards at ${g.step}`);
      }
    }
    assert.ok(g.tracks.loyalty === 4 || g.tracks.treason === 5);
  }
});

test('Mühür beats Valide\'nin Buyruğu on the same Vekil in the same wave', () => {
  let g = court({ first: 1, second: 2 });
  const m = card('muhur', 'divan'), v = card('valide', 'divan');
  g = hands(g, { 3: [m], 4: [v] });
  g = wave(g, { 3: [{ uid: m.uid, target: 1 }], 4: [{ uid: v.uid, target: 1 }] });
  assert.equal(g.ministers.first, 1);
  assert.deepEqual(lastReveal(g).map(r => [r.as, r.outcome, r.note]), [['muhur', 'ok', undefined], ['valide', 'void', 'sealed']]);
});

test('Valide\'nin Buyruğu and Divan Sırası on the First Vekil: the manual\'s example', () => {
  // Pargalı (A) First, Hatice (B) Second; Valide brings in Rüstem (C) as First, then the seats swap
  let g = court({ first: 1, second: 2 });
  const v = card('valide', 'divan'), d = card('divan-sirasi', 'divan');
  g = hands(g, { 4: [v], 5: [d] });
  g = wave(g, { 4: [{ uid: v.uid, target: 1 }], 5: [{ uid: d.uid, target: 1 }] });
  g = answer(g, 'replace', 3, 4);
  assert.deepEqual(g.ministers, { first: 2, second: 3 });
  assert.equal(g.players[1].hand.length, 1, 'the removed Vekil draws at the end of the wave');
});

test('two Valide\'nin Buyruğu on one Vekil: the first owner clockwise from Süleyman applies', () => {
  let g = court({ first: 1, second: 2 });
  const v1 = card('valide', 'divan'), v2 = card('valide', 'divan');
  g = hands(g, { 3: [v1], 5: [v2] });
  g = wave(g, { 3: [{ uid: v1.uid, target: 1 }], 5: [{ uid: v2.uid, target: 1 }] });
  assert.equal(ask(g, 'replace').to, 3);
  g = answer(g, 'replace', 4, 3);
  assert.equal(g.ministers.first, 4);
  assert.equal(lastReveal(g)[1].note, 'sameTarget');
});

test('Akıl Hocası cancels cards of its own field on its player for the whole crisis, not the other field', () => {
  let g = court({ first: 1, second: 2 });
  const akil = card('akil-hocasi', 'harem'), ift = card('iftira', 'harem'), muhur = card('muhur', 'divan');
  g = hands(g, { 1: [akil], 3: [ift], 4: [muhur] });
  g = wave(g, { 1: [{ uid: akil.uid, target: 1 }], 3: [{ uid: ift.uid, target: 1 }], 4: [{ uid: muhur.uid, target: 1 }] });
  assert.deepEqual(lastReveal(g).map(r => r.outcome), ['ok', 'cancelled', 'ok']);
  assert.equal(g.players[1].influence, 1);
  const ift2 = card('iftira', 'harem');
  g = hands(g, { 5: [ift2] });
  g = wave(g, { 5: [{ uid: ift2.uid, target: 1 }] });
  assert.equal(lastReveal(g)[0].outcome, 'cancelled', 'still protected in a later wave');
});

test('İftira and Gözde\'nin Hediyesi on one player cancel out, even at 0 Influence', () => {
  let g = court({ first: 1, second: 2 });
  g.players[3].influence = 0;
  const i = card('iftira', 'harem'), z = card('gozde', 'harem');
  g = hands(g, { 4: [i], 5: [z] });
  g = wave(g, { 4: [{ uid: i.uid, target: 3 }], 5: [{ uid: z.uid, target: 3 }] });
  assert.equal(g.players[3].influence, 0);
  assert.equal(g.players[3].hand.length, 0, 'no loss, so no draw');
});

test('a loss of Influence draws one Intrigue card per point lost; at 0 there is nothing to lose', () => {
  let g = court({ first: 1, second: 2 });
  g.players[4].influence = 0;
  const a = card('iftira', 'harem'), b = card('iftira', 'harem');
  g = hands(g, { 1: [a], 2: [b] });
  g = wave(g, { 1: [{ uid: a.uid, target: 3 }], 2: [{ uid: b.uid, target: 4 }] });
  assert.equal(g.players[3].influence, 0);
  assert.equal(g.players[3].hand.length, 1);
  assert.equal(g.players[4].hand.length, 0);
});

test('Saray Tabibi turns a negative wave total into 0 and blocks the Decree\'s loss', () => {
  let g = court({ first: 1, second: 2 });
  const tb = card('saray-tabibi', 'harem'), i = card('iftira', 'harem');
  g = hands(g, { 3: [tb], 4: [i] });
  g = wave(g, { 3: [{ uid: tb.uid, target: 1 }], 4: [{ uid: i.uid, target: 1 }] });
  assert.equal(g.players[1].influence, 1);
  assert.ok(g.court!.tabib.includes(1));
});

test('a card outside the open field cannot be placed, unless a Kul recasts it into the field', () => {
  let g = court({ first: 1, second: 2, crisis: 'macar' });   // Macar Seferi: Divan only
  const i = card('iftira', 'harem');
  g = hands(g, { 3: [i] });
  const a = ask(g, 'wave', 3);
  assert.throws(() => act(g, 3, { t: 'answer', ask: a.id, value: [{ uid: i.uid, target: 1 }] }), RuleError);
  g.players[3].companion = 'bali';   // Malkoçoğlu: play any card as Mühür
  g = act(g, 3, { t: 'answer', ask: a.id, value: [{ uid: i.uid, target: 1, recastAs: 'muhur' }] });
  assert.deepEqual(lastReveal(g).map(r => [r.as, r.field, r.recast, r.outcome]), [['muhur', 'divan', true, 'ok']]);
});

test('one Intrigue card per wave, but no limit per crisis', () => {
  let g = court({ first: 1, second: 2 });
  const c = [card('iftira', 'harem'), card('iftira', 'harem'), card('iftira', 'harem')];
  g = hands(g, { 3: c });
  const a = ask(g, 'wave', 3);
  assert.throws(() => act(g, 3, { t: 'answer', ask: a.id, value: [{ uid: c[0].uid, target: 4 }, { uid: c[1].uid, target: 4 }] }), RuleError);
  for (const x of c) {
    g = wave(g, { 3: [{ uid: x.uid, target: 4 }] });
    g = seen(g);
  }
  assert.equal(g.players[3].hand.length, 0, 'all three played, one wave each');
  assert.equal(g.court!.reveals.length, 3);
});

test('a flipped wave waits for every player, Süleyman too, to press Devam', () => {
  let g = court({ first: 1, second: 2 });
  const i = card('iftira', 'harem');
  g = hands(g, { 3: [i, card('iftira', 'harem')] });
  g = wave(g, { 3: [{ uid: i.uid, target: 4 }] });
  assert.deepEqual(g.asks.filter(a => a.type === 'ack').map(a => a.to).sort(), [0, 1, 2, 3, 4, 5]);
  for (const a of g.asks.filter(x => x.type === 'ack' && x.to !== 0)) g = act(g, a.to, { t: 'answer', ask: a.id });
  assert.ok(!g.asks.some(a => a.type === 'wave'), 'the next wave waits for the last Devam');
  g = seen(g);
  assert.ok(g.asks.some(a => a.type === 'wave' && a.to === 3), 'then the next wave opens');
});

test('a wave where nobody plays ends Tertip and offers Süleyman the Ferman', () => {
  let g = court({ first: 1, second: 2 });
  g = wave(g, {});
  assert.equal(ask(g, 'ferman').to, 0);
  g = answer(g, 'ferman', { seat: 'first', target: 3 }, 0);
  assert.equal(g.ministers.first, 3);
  assert.equal(g.ferman, false);
  assert.equal(g.players[1].hand.length, 1, 'the removed Vekil draws');
  assert.equal(g.step, 'kader');
});

test('Kader: any Vekil may discard or play any card, Loyalist or not; the result waits for Devam', () => {
  let g = court({ first: 1, second: 2 });
  g.players[1].side = 'loyalist';
  g.players[2].side = 'loyalist';
  g.decks.kader = ['h', 'x', 'h', ...g.decks.kader];
  g = wave(g, {});
  g = answer(g, 'ferman', null, 0);
  g = answer(g, 'kaderFirst', [0], 1);        // a Loyalist tosses a Hizmet
  const second = ask(g, 'kaderSecond', 2);
  assert.deepEqual(second.type === 'kaderSecond' && second.cards, ['x', 'h']);
  g = act(g, 2, { t: 'answer', ask: second.id, value: 0 });   // and plays the Hıyanet
  assert.equal(g.tracks.treason, 1);
  assert.equal(g.step, 'result');
  g = seen(g);
  assert.equal(g.step, 'decree');
});

test('the Decree: Hizmet gives +1 to a Vekil; the 4th Hizmet ends the game and the most Influence wins overall', () => {
  let g = court({ first: 1, second: 2 });
  g.tracks.loyalty = 3;
  for (const p of g.players) if (!p.sultan) p.side = 'loyalist';
  g.players[3].side = 'traitor';
  g.players[5].influence = 4;
  g.decks.kader = ['h', 'h', 'h', ...g.decks.kader];
  g = wave(g, {});
  g = answer(g, 'ferman', null, 0);
  g = answer(g, 'kaderFirst', [0], 1);
  g = answer(g, 'kaderSecond', 0, 2);
  assert.equal(g.step, 'over');
  assert.equal(g.winner!.side, 'loyalist');
  assert.deepEqual(g.winner!.overall, [5]);
});

test('an Objection costs Influence (not a loss, so no draw) and Süleyman picks the replacement', () => {
  let g = createGame(['S', 'A', 'B', 'C', 'D'], { seed: 3, sultan: 0, learning: true });
  for (const p of g.players) { p.hand = []; if (!p.sultan) p.base = 'used'; }
  g.asks = g.asks.filter(a => a.type !== 'window');
  advance(g);
  while (!g.asks.some(a => a.type === 'appoint')) g = act(g, g.asks[0].to, { t: 'answer', ask: g.asks[0].id, value: calm(g, g.asks[0]) });
  g = answer(g, 'appoint', { first: 1, second: 2 });
  for (const p of g.players) p.hand = [];
  const o = ask(g, 'object', 1);
  assert.throws(() => act(g, 1, { t: 'answer', ask: o.id, value: { seat: 'first' } }), RuleError, 'not your own seat');
  g = act(g, 1, { t: 'answer', ask: o.id, value: { seat: 'second' } });
  assert.equal(g.players[1].influence, 0);
  g = answer(g, 'replace', 3, 0);
  assert.equal(g.ministers.second, 3);
  assert.equal(g.players[2].hand.length, 1, 'the removed Vekil draws one card for the lost seat');
  assert.equal(g.players[1].hand.length, 0, 'spending Influence is not losing it: no draw');
});

test('hand limit: drawing over 3 asks for a discard before anything else moves', () => {
  let g = court({ first: 1, second: 2 });
  const i = card('iftira', 'harem');
  g = hands(g, { 4: [i], 3: [card('muhur', 'divan'), card('muhur', 'divan'), card('teftis', 'divan')] });
  g.players[3].influence = 1;
  g = wave(g, { 4: [{ uid: i.uid, target: 3 }] });
  // seat 3 passed with 3 cards, lost 1 Influence, drew to 4: must discard 1
  const d = ask(g, 'discard', 3);
  assert.equal(d.type === 'discard' && d.n, 1);
  assert.ok(g.asks.every(a => a.type !== 'ferman'), 'the game waits for the discard');
});

/** A full game (Kuls, Hırs, Favor) at the first Crisis, with these Characters on seats 1.., hands empty. */
function fullGame(chars: string[]): Game {
  let g = createGame(['S', 'A', 'B', 'C', 'D', 'E'], { seed: 7, sultan: 0 });
  chars.forEach((c, i) => { g.players[i + 1].character = c; });
  while (g.step === 'setup') g = act(g, g.asks[0].to, { t: 'answer', ask: g.asks[0].id, value: calm(g, g.asks[0]) } as Action);
  for (const p of g.players) p.hand = [];
  return g;
}

test('a hand that shrinks while a hand-limit discard is owed re-counts it (Ganimet, Yakıp Yıkma)', () => {
  let g = fullGame(['barbaros', 'tahmasp']);
  g.players[2].favor = 'ready';
  g.players[1].hand = [card('iftira', 'harem'), card('iftira', 'harem'), card('iftira', 'harem')];
  g.players[3].hand = [card('muhur', 'divan'), card('muhur', 'divan'), card('teftis', 'divan'), card('valide', 'divan')];
  g.asks.push({ id: g.nextAsk++, to: 3, type: 'discard', n: 1 });
  g = act(g, 2, { t: 'power', power: 'yakipYikma' });
  g = act(g, 1, { t: 'power', power: 'ganimet', target: 3 });   // the victim drops to 3: owes nothing
  assert.ok(!g.asks.some(a => a.type === 'discard' && a.to === 3));
  g = answer(g, 'keepOne', g.players[1].hand[0].uid, 1);          // Barbaros was at 4, keeps 1: owes nothing
  assert.ok(!g.asks.some(a => a.type === 'discard'));
});

test('Ganimet can\'t be used while every other hand is empty', () => {
  const g = fullGame(['barbaros']);
  assert.equal(freePowerTargets(g, 1, 'ganimet'), null);
  assert.throws(() => act(g, 1, { t: 'power', power: 'ganimet', target: 2 }), RuleError);
});

test('Matrakçı Nasuh can recast a printed Akıl Hocası into the other field', () => {
  let g = court({ first: 1, second: 2 });   // Hazine Açığı opens both fields
  const ak = card('akil-hocasi', 'harem'), m = card('muhur', 'divan');
  g = hands(g, { 3: [ak], 4: [m] });
  g.players[3].companion = 'matrakci';
  assert.deepEqual(playableForms(g, 3, ak.uid).map(f => [f.field, f.recast]), [['harem', false], ['divan', true]]);
  g = wave(g, { 3: [{ uid: ak.uid, target: 1, recastAs: 'akil-hocasi', field: 'divan' }], 4: [{ uid: m.uid, target: 1 }] });
  assert.deepEqual(lastReveal(g).map(r => [r.as, r.field, r.outcome]), [['akil-hocasi', 'divan', 'ok'], ['muhur', 'divan', 'cancelled']]);
});

test('Gül Ağa raises the hand limit to 4 while face up; Lokman Ağa returns a card that took effect, once', () => {
  let g = court({ first: 1, second: 2 });
  const i = card('iftira', 'harem'), a = card('gozde', 'harem'), b = card('gozde', 'harem');
  g = hands(g, { 4: [i], 3: [card('muhur', 'divan'), card('muhur', 'divan'), card('teftis', 'divan')], 5: [a, b] });
  g.players[3].companion = 'gulaga';
  g.players[3].influence = 2;
  g.players[5].companion = 'lokman';
  g = wave(g, { 4: [{ uid: i.uid, target: 3 }], 5: [{ uid: a.uid, target: 1, returns: true }] });
  assert.equal(g.players[3].hand.length, 4, 'lost 1 Influence, drew to 4, still face up: no discard');
  assert.ok(!g.asks.some(x => x.type === 'discard'));
  assert.ok(g.players[5].hand.some(c => c.uid === a.uid), 'the returned card is back in hand');
  assert.equal(g.players[5].companionUsed, true);
  g = seen(g);
  const w = ask(g, 'wave', 5);
  assert.throws(() => act(g, 5, { t: 'answer', ask: w.id, value: [{ uid: b.uid, target: 1, returns: true }] }), RuleError, 'only once per game');
});

test('Kulis is offered only when Süleyman still appoints: Sadrazam is asked first', () => {
  let g = createGame(['S', 'A', 'B', 'C', 'D', 'E'], { seed: 7, sultan: 0, learning: true });
  for (const p of g.players) if (!p.sultan) p.base = 'used';
  g.players[1].character = 'ibrahim'; g.players[1].base = 'ready';
  g.players[2].character = 'rustem'; g.players[2].base = 'ready';
  g.asks = g.asks.filter(a => a.type !== 'window');
  advance(g);
  while (!g.asks.some(a => a.type === 'window' && a.power === 'sadrazam')) g = act(g, g.asks[0].to, { t: 'answer', ask: g.asks[0].id, value: calm(g, g.asks[0]) } as Action);
  assert.ok(!g.asks.some(a => a.type === 'window' && a.power === 'kulis'), 'Kulis waits for the Sadrazam answer');
  g = act(g, 1, { t: 'answer', ask: ask(g, 'window', 1).id, value: true });
  assert.ok(!g.asks.some(a => a.type === 'window' && a.power === 'kulis'), 'Pargalı appoints, so no Kulis');
  assert.equal(ask(g, 'appoint').to, 1);
});

test('Saray Hazinesi counts on the crisis that ends the game and breaks the overall tie', () => {
  let g = court({ first: 1, second: 2 });
  g.tracks.loyalty = 3;
  for (const p of g.players) if (!p.sultan) p.side = 'loyalist';
  g.players[4].influence = 4;
  g.players[5].influence = 4;
  g = hands(g, { 4: [card('muhur', 'divan'), card('muhur', 'divan'), card('teftis', 'divan')] });
  g.players[4].ambition = 'hazine';
  g.decks.kader = ['h', 'h', 'h', ...g.decks.kader];
  g = wave(g, {});
  g = answer(g, 'ferman', null, 0);
  g = answer(g, 'kaderFirst', [0], 1);
  g = answer(g, 'kaderSecond', 0, 2);
  assert.equal(g.step, 'over');
  assert.deepEqual(g.winner!.overall, [4]);
});
