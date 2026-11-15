// Plays many random games through the engine and checks that each one ends and keeps every card accounted for.
// Run: node scripts/sim.ts [games]
import { act, createGame, RULES, RuleError, type Game } from '../src/engine/index.ts';
import { botAnswer, botPower } from '../src/engine/bot.ts';

const games = Number(process.argv[2] ?? 500);
let seed = 1;
const r = () => {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x7fffffff;
};

function intrigueCount(g: Game) {
  const inCourt = g.court?.plays.length && g.sub !== 'wave' ? 0 : 0;
  return g.decks.intrigue.length + g.decks.intrigueDiscard.length + g.players.reduce((s, p) => s + p.hand.length, 0) + inCourt;
}
function kaderCount(g: Game) {
  const k = g.kader;
  const inHand = k && g.step === 'kader' ? (g.sub === 'first' ? k.drawn.length : g.sub === 'second' ? k.passed.length : 0) : 0;
  return g.decks.kader.length + g.decks.kaderDiscard.length + g.tracks.loyalty + g.tracks.treason + inHand;
}

const stats = { loyalist: 0, traitor: 0, crises: 0, steps: 0, errors: 0 };
for (let i = 0; i < games; i++) {
  const n = 5 + (i % 4);
  let g = createGame(Array.from({ length: n }, (_, k) => `P${k}`), { seed: i + 1, learning: i % 5 === 0 });
  let steps = 0;
  while (g.step !== 'over') {
    if (++steps > 5000) throw new Error(`game ${i} did not end: ${g.step}/${g.sub}`);
    if (r() < 0.05) {
      const who = Math.floor(r() * n);
      const pw = botPower(g, who, r);
      if (pw) g = act(g, who, pw);
    }
    const urgent = g.asks.filter(x => x.type === 'discard' || x.type === 'keepOne');
    const pool = urgent.length ? urgent : g.asks;
    const a = pool[Math.floor(r() * pool.length)];
    if (!a) throw new Error(`game ${i} stuck at ${g.step}/${g.sub} with no asks`);
    try {
      g = act(g, a.to, botAnswer(g, a, r));
    } catch (e) {
      if (!(e instanceof RuleError)) throw e;
      stats.errors++;
      if (stats.errors < 15) console.log(`game ${i} ${a.type}: ${e.message}`);
      if (stats.errors > 200) throw new Error('too many rule errors');
    }
    const ic = intrigueCount(g);
    if (g.step !== 'court' && ic !== 30) throw new Error(`game ${i}: intrigue cards ${ic} at ${g.step}/${g.sub}`);
    for (const p of g.players) {
      if (p.influence < 0) throw new Error(`game ${i}: negative influence`);
      if (p.hand.length > RULES.handLimit && !g.asks.some(x => x.type === 'discard' && x.to === p.id)) throw new Error(`game ${i}: hand over limit without a discard ask`);
    }
    const { first, second } = g.ministers;
    if (first !== null && (first === second || g.players[first].sultan)) throw new Error(`game ${i}: bad ministers`);
    const kc = kaderCount(g);
    if (kc !== 17 && g.step !== 'kader') throw new Error(`game ${i}: kader cards ${kc} at ${g.step}/${g.sub}`);
  }
  stats[g.winner!.side]++;
  stats.crises += g.crisisNo;
  stats.steps += steps;
}
console.log(`${games} games: loyalists ${stats.loyalist}, traitors ${stats.traitor}, avg crises ${(stats.crises / games).toFixed(1)}, avg answers ${(stats.steps / games).toFixed(0)}, rule errors ${stats.errors}`);
