// Tertip, played in waves. Everyone but Süleyman privately plays a card or passes; the wave flips and takes effect at once.
// Order inside a flip (manual, "All at once"): reveal powers (Yön Değiştir), protections, Minister checks, replacements
// clockwise from Süleyman's left, summed Influence, then draws.
import { intrigueById, soleField, type Field } from './content.ts';
import {
  P, ackAll, ask, checkHand, clockwise, companionDef, companionUp, discardCard, drawIntrigue, eligible, eligibleList,
  ensureKader, favorOn, fieldsOpen, isMinister, log, lose, must, readyPower, seatOf, top,
} from './core.ts';
import { checkAmbitions } from './ambitions.ts';
import type { Game, PID, Play, RevealedPlay, WavePlay } from './types.ts';

const INFO_CARDS = ['casus', 'muhurlu-evrak', 'teftis', 'nobet'];
const BACKERS = ['muhur', 'kefalet'];
const REPLACERS = ['valide', 'azil'];

/** How many cards this player may still put down in the current wave. */
export function waveAllowance(g: Game, id: PID): number {
  if (g.court?.silenced.includes(id)) return 0;   // Sükût
  const perWave = readyPower(g, 'hurrem', 'favor')?.id === id ? 2 : 1;
  return Math.min(perWave, P(g, id).hand.length);
}

/** The field a card counts as, or null if it can't be placed in this crisis. */
export function effectiveField(g: Game, id: PID, printed: Field, as: string, named?: Field): Field | null {
  const open = fieldsOpen(g);
  const f = as === 'akil-hocasi' ? (named ?? printed) : soleField(as) ?? printed;
  if (open.includes(f)) return f;
  if (favorOn(g, id, 'sarlken')) return open[0];   // Plus Ultra: counts as a card of an open field
  return null;
}

export function canRecast(g: Game, id: PID): string | null {
  const p = P(g, id);
  const def = companionDef(p.companion);
  if (!def?.recast || p.companionUsed || !companionUp(g, id)) return null;
  return def.recast;
}

/** Players this card kind may be played on by this owner. */
export function legalTargets(g: Game, owner: PID, as: string): PID[] {
  const rule = intrigueById[as].target;
  return g.players
    .filter(p => !p.sultan)
    .filter(p => rule === 'minister' ? isMinister(g, p.id) : rule === 'first' ? g.ministers.first === p.id
      : rule === 'other' ? p.id !== owner : rule === 'self' ? p.id === owner : true)
    .map(p => p.id);
}

/** Whether a hand card can be put down this wave in some form (as printed, or recast). */
export function playableForms(g: Game, id: PID, uid: number): { as: string; field: Field; recast: boolean }[] {
  const card = P(g, id).hand.find(c => c.uid === uid);
  if (!card) return [];
  const out: { as: string; field: Field; recast: boolean }[] = [];
  const f = effectiveField(g, id, card.field, card.kind);
  if (f && legalTargets(g, id, card.kind).length) out.push({ as: card.kind, field: f, recast: false });
  const r = canRecast(g, id);
  if (r) {
    for (const named of r === 'akil-hocasi' ? fieldsOpen(g) : [undefined]) {
      const rf = effectiveField(g, id, card.field, r, named);
      // skip a recast that plays exactly like the printed card; Sümbül Ağa may still turn an Oyunbozan to the other field
      if (rf && !(r === card.kind && rf === f) && legalTargets(g, id, r).length) out.push({ as: r, field: rf, recast: true });
    }
  }
  return out;
}

export function openWave(g: Game) {
  const c = g.court!;
  c.wave++;
  c.submitted = {};
  c.plays = [];
  c.drawsOwed = {};
  c.silenced = c.silenceNext;   // the silenced phone just passes, with no sign the table could read
  c.silenceNext = [];
  g.sub = 'wave';
  for (const p of clockwise(g)) {
    const can = waveAllowance(g, p.id) > 0 && p.hand.some(card => playableForms(g, p.id, card.uid).length > 0);
    if (can) ask(g, { to: p.id, type: 'wave' });
    else c.submitted[p.id] = null;
  }
  log(g, 'waveOpen', { wave: c.wave });
}

/** Check a wave submission and turn it into plays. Throws a RuleError with a Turkish message if it breaks a rule. */
export function checkWave(g: Game, id: PID, plays: WavePlay[]): Play[] {
  const p = P(g, id);
  must(Array.isArray(plays), 'Geçersiz hamle.');
  if (!plays.length) return [];
  must(plays.length <= waveAllowance(g, id), 'Bu dalgada bir kart oynayabilirsin.');
  must(new Set(plays.map(x => x.uid)).size === plays.length, 'Aynı kart iki kez oynanamaz.');
  must(plays.filter(x => x.recastAs).length <= 1, 'Kul bu krizde bir kez çevirir.');
  return plays.map(wp => {
    const card = p.hand.find(c => c.uid === wp.uid);
    must(card, 'Bu kart elinde değil.');
    let as = card.kind;
    if (wp.recastAs) {
      must(canRecast(g, id) === wp.recastAs, 'Kulun şu an bu kartı çeviremez.');
      as = wp.recastAs;
      if (as === 'akil-hocasi') must(wp.field === 'harem' || wp.field === 'divan', 'Oyunbozan için alan seç.');
    }
    const field = effectiveField(g, id, card.field, as, wp.recastAs ? wp.field : undefined);
    must(field, 'Bu kart açık alanın kartı değil.');
    must(legalTargets(g, id, as).includes(wp.target), 'Bu kart o oyuncuya oynanamaz.');
    return { owner: id, card, as, field, target: wp.target, recast: !!wp.recastAs };
  });
}

export function flipWave(g: Game) {
  const c = g.court!;
  const order = clockwise(g).map(p => p.id);
  const plays: Play[] = [];
  for (const id of order) {
    const sub = c.submitted[id];
    if (!sub || !sub.length) continue;
    let checked: Play[];
    try {
      checked = checkWave(g, id, sub);
    } catch {
      log(g, 'playDropped', { who: id });   // the hand changed after submitting; count it as a pass
      continue;
    }
    const p = P(g, id);
    if (checked.length > 1) {
      p.favor = 'used';
      log(g, 'power', { who: id, power: 'cifteOyun' });
    }
    for (const pl of checked) {
      p.hand = p.hand.filter(x => x.uid !== pl.card.uid);
      if (pl.recast) p.companionUsed = true;
      plays.push(pl);
    }
    p.playedThisCrisis += checked.length;
    p.stats.playedMax = Math.max(p.stats.playedMax, p.playedThisCrisis);
  }
  c.plays = plays;
  if (!plays.length) return endCourt(g);
  log(g, 'waveFlip', { wave: c.wave, n: plays.length });
  const r = readyPower(g, 'rustem', 'favor');
  const onHim = r ? plays.map((pl, i) => (pl.target === r.id ? i : -1)).filter(i => i >= 0) : [];
  if (r && onHim.length) {
    g.sub = 'redirect';
    ask(g, { to: r.id, type: 'redirect', plays: onHim });
    return;
  }
  resolveWave(g);
}

export function resolveWave(g: Game) {
  const c = g.court!;
  const reveal: RevealedPlay[] = c.plays.map(pl => ({
    card: pl.card, as: pl.as, field: pl.field, target: pl.target, recast: pl.recast, outcome: 'ok',
    ...(pl.movedFrom !== undefined ? { movedFrom: pl.movedFrom } : {}),
  }));
  const plays = c.plays;
  for (const pl of plays) c.history.push({ owner: pl.owner, as: pl.as, field: pl.field, target: pl.target, wave: c.wave });
  // protections first: Oyunbozan (akil-hocasi) guards its player from other cards of its field, from this flip on
  plays.forEach(pl => {
    if (pl.as !== 'akil-hocasi') return;
    const list = (c.akil[pl.target] ??= []);
    if (!list.includes(pl.field)) list.push(pl.field);
  });
  plays.forEach((pl, i) => {
    if (pl.as !== 'akil-hocasi' && c.akil[pl.target]?.includes(pl.field)) set(i, 'cancelled', 'akil');
  });
  // a card that needs a Minister checks for one at the flip
  plays.forEach((pl, i) => {
    const rule = intrigueById[pl.as].target;
    if (ok(i) && rule === 'minister' && !isMinister(g, pl.target)) set(i, 'void', 'notMinister');
    if (ok(i) && rule === 'first' && g.ministers.first !== pl.target) set(i, 'void', 'notFirst');
  });
  plays.forEach((pl, i) => {
    if (!ok(i)) return;
    if (pl.as === 'muhur' && !c.sealed.includes(pl.target)) c.sealed.push(pl.target);
    if (pl.as === 'saray-tabibi' && !c.tabib.includes(pl.target)) c.tabib.push(pl.target);
  });
  // replacements (Valide'nin Buyruğu, Azil): Mühür wins in its own wave, Himaye all crisis; the first owner clockwise
  // wins a shared target
  const claimed = new Set<number>();
  c.replaceQueue = [];
  plays.forEach((pl, i) => {
    if (!ok(i) || !REPLACERS.includes(pl.as)) return;
    if (c.sealed.includes(pl.target)) return set(i, 'void', 'sealed');
    if (c.himaye === pl.target) return set(i, 'void', 'himaye');
    if (claimed.has(pl.target)) return set(i, 'void', 'sameTarget');
    claimed.add(pl.target);
    const daye = pl.as === 'valide' && pl.recast;   // Daye Hatun's Valide can't seat its owner
    c.replaceQueue.push({ owner: pl.owner, target: pl.target, play: i, reason: pl.as as 'valide' | 'azil', noSelf: daye });
  });
  // information, and cards that act later
  plays.forEach((pl, i) => {
    if (!ok(i)) return;
    if (pl.as === 'teftis') c.teftis.push({ owner: pl.owner, target: pl.target });
    if (pl.as === 'kefalet') c.kefalet.push({ owner: pl.owner, target: pl.target });
    if (pl.as === 'casus') c.casus.push({ owner: pl.owner, target: pl.target });
    if (pl.as === 'nobet') c.nobet.push({ owner: pl.owner, target: pl.target });
    if (pl.as === 'defterdar' && !c.defterdar.includes(pl.target)) c.defterdar.push(pl.target);
    if (pl.as === 'nazar' && !c.nazar.includes(pl.target)) c.nazar.push(pl.target);
    if (pl.as === 'sukut' && !c.silenceNext.includes(pl.target)) c.silenceNext.push(pl.target);
    if (BACKERS.includes(pl.as)) P(g, pl.owner).stats.backedMinister = true;
    if (pl.as === 'muhurlu-evrak') {
      ensureKader(g, 3);
      g.peeks.push({ to: pl.owner, c: g.crisisNo, kind: 'kaderTop', cards: top(g, 3), source: 'muhurlu-evrak' });
    }
    if (INFO_CARDS.includes(pl.as)) P(g, pl.owner).stats.usedInfoCard = true;
  });
  // who got targeted, for Hırs cards: only other players' cards count
  for (const pl of plays) {
    if (pl.target === pl.owner) continue;
    const t = P(g, pl.target);
    t.targetedThisCrisis++;
    t.stats.targetedMax = Math.max(t.stats.targetedMax, t.targetedThisCrisis);
    const st = P(g, pl.owner).stats;
    if (!st.targets.includes(pl.target)) st.targets.push(pl.target);
  }
  c.reveals.push(reveal);
  g.sub = 'valide';

  function ok(i: number) {
    return reveal[i].outcome === 'ok';
  }
  function set(i: number, outcome: RevealedPlay['outcome'], note: string) {
    reveal[i].outcome = outcome;
    reveal[i].note = note;
  }
}

/** Ask for the next new Minister (Valide'nin Buyruğu: its owner; Azil: Süleyman), or finish the wave. Called by advance(). */
export function nextReplacement(g: Game) {
  const c = g.court!;
  while (c.replaceQueue.length) {
    const q = c.replaceQueue[0];
    const seat = seatOf(g, q.target);
    if (seat && eligibleList(g, seat).filter(id => id !== q.target && !(q.noSelf && id === q.owner)).length) {
      const to = q.reason === 'azil' ? g.sultan : q.owner;
      ask(g, { to, type: 'replace', seat, removed: q.target, reason: q.reason, ...(q.noSelf ? { not: q.owner } : {}) });
      return;
    }
    c.replaceQueue.shift();
    const rv = c.reveals[c.reveals.length - 1][q.play];
    rv.outcome = 'void';
    rv.note = 'noneEligible';
  }
  finishWave(g);
}

function finishWave(g: Game) {
  const c = g.court!;
  const reveal = c.reveals[c.reveals.length - 1];
  const okAt = (i: number) => reveal[i].outcome === 'ok';
  // Influence: İftira on one player adds up and applies once; Çeşnigir or Himaye saves it
  const loss = new Map<PID, number>();
  c.plays.forEach((pl, i) => {
    if (okAt(i) && pl.as === 'iftira') loss.set(pl.target, (loss.get(pl.target) ?? 0) + 1);
  });
  const saver = (id: PID) => (c.himaye === id ? 'himaye' : c.tabib.includes(id) ? 'tabib' : null);
  // the saves are known now, so every outcome is final: one public line per card, never who played it
  c.plays.forEach((pl, i) => { if (okAt(i) && pl.as === 'iftira' && saver(pl.target)) reveal[i].note = saver(pl.target)!; });
  reveal.forEach(r => log(g, 'play', {
    as: r.as, target: r.target, outcome: r.outcome, ...(r.note ? { note: r.note } : {}), ...(r.movedFrom !== undefined ? { movedFrom: r.movedFrom } : {}),
  }));
  for (const [id, n] of loss) if (!saver(id)) c.drawsOwed[id] = (c.drawsOwed[id] ?? 0) + lose(g, id, n, 'intrigue');
  for (const pl of c.plays) discardCard(g, pl.card);
  for (const [id, n] of Object.entries(c.drawsOwed)) {
    if (n > 0) {
      drawIntrigue(g, Number(id), n);
      checkHand(g, Number(id));
    }
  }
  checkAmbitions(g);
  log(g, 'waveResolved', { wave: c.wave });
  g.sub = 'seen';
  ackAll(g, 'wave');
}

/** No one played in the last wave: Mantık shows what it watched, Nöbet asks which card to trace, then Veliaht and the
 *  Ferman may move a seat. */
function endCourt(g: Game) {
  const c = g.court!;
  c.done = true;
  log(g, 'courtEnd', { waves: c.wave });
  for (const k of c.casus) {
    const plays = c.history.filter(h => h.owner === k.target).map(h => ({ as: h.as, field: h.field, target: h.target }));
    g.peeks.push({ to: k.owner, c: g.crisisNo, kind: 'casus', of: k.target, plays });
  }
  for (const k of c.nobet) {
    // cards other players put on the watched player; the watcher's own cards would teach them nothing
    const plays = c.history.map((h, i) => (h.target === k.target && h.owner !== k.target && h.owner !== k.owner ? i : -1)).filter(i => i >= 0);
    if (plays.length) ask(g, { to: k.owner, type: 'window', power: 'nobet', ctx: { on: k.target, plays } });
    else g.peeks.push({ to: k.owner, c: g.crisisNo, kind: 'playedBy', on: k.target, by: null, card: null });
  }
  g.sub = 'veliaht';
  const m = readyPower(g, 'mustafa', 'base');
  if (m && (eligible(g, m.id, 'first') || eligible(g, m.id, 'second'))) ask(g, { to: m.id, type: 'window', power: 'veliaht' });
}

/** A Minister leaves the seat to a new player: Valide'nin Buyruğu, Azil, an Objection, Feragat, Veliaht or the Ferman. */
export function replaceMinister(g: Game, removed: PID, by: PID, reason: string, newcomer: PID) {
  const seat = seatOf(g, removed);
  must(seat, 'O oyuncu artık Vekil değil.');
  must(newcomer !== removed && eligibleList(g, seat).includes(newcomer), 'Bu oyuncu o koltuğa uygun değil.');
  g.ministers[seat] = newcomer;
  log(g, 'replaced', { seat, removed, newcomer, reason, by });
  if (REPLACERS.includes(reason)) P(g, newcomer).stats.seatByIntrigue = true;
}

export function drawForSeatLoss(g: Game, id: PID) {
  if (g.step === 'court' && g.court && !g.court.done) {
    g.court.drawsOwed[id] = (g.court.drawsOwed[id] ?? 0) + 1;
    return;
  }
  drawIntrigue(g, id, 1);
  checkHand(g, id);
}
