// Tertip, played in waves. Everyone but Süleyman privately plays a card or passes; the wave flips and takes effect at once.
// Order inside a flip (manual, "All at once"): reveal powers (Yön Değiştir), protections, Minister checks, owner choices
// clockwise from Süleyman's left, swaps, summed Influence, then draws.
import { RULES, intrigueById, soleField, type Field } from './content.ts';
import {
  P, ask, checkHand, clockwise, companionDef, companionUp, discardCard, drawIntrigue, eligibleList, ensureKader,
  favorOn, fieldsOpen, gain, isMinister, log, lose, must, readyPower, seatOf, top,
} from './core.ts';
import { checkAmbitions } from './ambitions.ts';
import type { Game, PID, Play, RevealedPlay, WavePlay } from './types.ts';

const INFO_CARDS = ['saray-dedikodusu', 'muhurlu-evrak', 'teftis'];

/** How many cards this player may still put down in the current wave. */
export function waveAllowance(g: Game, id: PID): number {
  const p = P(g, id);
  const left = RULES.cardsPerCrisis - p.played;
  const perWave = readyPower(g, 'hurrem', 'favor')?.id === id ? 2 : 1;
  return Math.max(0, Math.min(left, perWave, p.hand.length));
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
    .filter(p => rule === 'minister' ? isMinister(g, p.id) : rule === 'other' ? p.id !== owner : rule === 'self' ? p.id === owner : true)
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
  if (r && (r !== card.kind || !f)) {
    for (const named of r === 'akil-hocasi' ? fieldsOpen(g) : [undefined]) {
      const rf = effectiveField(g, id, card.field, r, named);
      if (rf && legalTargets(g, id, r).length) out.push({ as: r, field: rf, recast: true });
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
  must(plays.length <= waveAllowance(g, id), plays.length > 1 ? 'Bu dalgada bir kart oynayabilirsin.' : 'Bu krizde kart hakkın bitti.');
  must(new Set(plays.map(x => x.uid)).size === plays.length, 'Aynı kart iki kez oynanamaz.');
  must(plays.filter(x => x.recastAs).length <= 1, 'Kul bu krizde bir kez çevirir.');
  must(plays.filter(x => x.esma).length <= 1, 'Esma Hatun bir kez kullanılır.');
  return plays.map(wp => {
    const card = p.hand.find(c => c.uid === wp.uid);
    must(card, 'Bu kart elinde değil.');
    let as = card.kind;
    if (wp.recastAs) {
      must(canRecast(g, id) === wp.recastAs, 'Kulun şu an bu kartı çeviremez.');
      as = wp.recastAs;
      if (as === 'akil-hocasi') must(wp.field === 'harem' || wp.field === 'divan', 'Akıl Hocası için alan seç.');
    }
    const field = effectiveField(g, id, card.field, as, wp.recastAs ? wp.field : undefined);
    must(field, 'Bu kart açık alanın kartı değil.');
    must(legalTargets(g, id, as).includes(wp.target), 'Bu kart o oyuncuya oynanamaz.');
    if (wp.esma) must(p.companion === 'esma' && companionUp(g, id) && !p.companionUsed, 'Esma Hatun şu an kullanılamaz.');
    return { owner: id, card, as, field, target: wp.target, recast: !!wp.recastAs, esma: !!wp.esma };
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
      p.played++;
      if (pl.recast) p.companionUsed = true;
      plays.push(pl);
    }
  }
  c.plays = plays;
  if (!plays.length) {
    c.done = true;
    log(g, 'courtEnd', { waves: c.wave });
    g.sub = 'ferman';
    if (g.ferman) ask(g, { to: g.sultan, type: 'ferman' });
    return;
  }
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
  // protections first: Akıl Hocası guards its player from other cards of its field, from this flip on
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
    if (ok(i) && intrigueById[pl.as].target === 'minister' && !isMinister(g, pl.target)) set(i, 'void', 'notMinister');
  });
  plays.forEach((pl, i) => {
    if (!ok(i)) return;
    if (pl.as === 'muhur' && !c.sealed.includes(pl.target)) c.sealed.push(pl.target);
    if (pl.as === 'saray-tabibi' && !c.tabib.includes(pl.target)) c.tabib.push(pl.target);
  });
  // replacements: Mühür wins in its own wave; the first owner clockwise wins a shared target
  const claimed = new Set<number>();
  c.replaceQueue = [];
  plays.forEach((pl, i) => {
    if (!ok(i) || pl.as !== 'valide') return;
    if (c.sealed.includes(pl.target)) return set(i, 'void', 'sealed');
    if (claimed.has(pl.target)) return set(i, 'void', 'sameTarget');
    claimed.add(pl.target);
    c.replaceQueue.push({ owner: pl.owner, target: pl.target, play: i });
  });
  // information
  plays.forEach((pl, i) => {
    if (!ok(i)) return;
    if (pl.as === 'teftis') c.teftis.push({ owner: pl.owner, target: pl.target });
    if (pl.as === 'saray-dedikodusu') {
      const t = P(g, pl.target);
      g.peeks.push({ to: pl.owner, c: g.crisisNo, kind: 'handAmbition', of: pl.target, hand: t.hand.map(x => ({ kind: x.kind, field: x.field })), ambition: t.ambition });
    }
    if (pl.as === 'muhurlu-evrak') {
      ensureKader(g, 3);
      g.peeks.push({ to: pl.owner, c: g.crisisNo, kind: 'kaderTop', cards: top(g, 3), source: 'muhurlu-evrak' });
    }
    if (INFO_CARDS.includes(pl.as)) P(g, pl.owner).stats.usedInfoCard = true;
  });
  // who got targeted, for Hırs cards
  for (const pl of plays) {
    const t = P(g, pl.target);
    t.targetedThisCrisis++;
    t.stats.targetedMax = Math.max(t.stats.targetedMax, t.targetedThisCrisis);
    const st = P(g, pl.owner).stats;
    if (pl.target !== pl.owner && !st.targets.includes(pl.target)) st.targets.push(pl.target);
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

/** Ask the next Valide'nin Buyruğu owner for the new Minister, or finish the wave. Called by advance(). */
export function nextReplacement(g: Game) {
  const c = g.court!;
  while (c.replaceQueue.length) {
    const q = c.replaceQueue[0];
    const seat = seatOf(g, q.target);
    if (seat && eligibleList(g, seat).filter(id => id !== q.target).length) {
      ask(g, { to: q.owner, type: 'replace', seat, removed: q.target, reason: 'valide' });
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
  c.plays.forEach((pl, i) => {
    if (okAt(i) && pl.as === 'divan-sirasi') {
      g.ministers = { first: g.ministers.second, second: g.ministers.first };
      log(g, 'swapped', { first: g.ministers.first, second: g.ministers.second });
    }
  });
  // Influence: each player's gains and losses from the wave are summed and applied once
  const net = new Map<PID, number>();
  c.plays.forEach((pl, i) => {
    if (!okAt(i)) return;
    if (pl.as === 'iftira') net.set(pl.target, (net.get(pl.target) ?? 0) - 1);
    if (pl.as === 'gozde') net.set(pl.target, (net.get(pl.target) ?? 0) + 1);
  });
  for (const [id, d] of net) {
    if (d < 0 && c.tabib.includes(id)) {
      c.plays.forEach((pl, i) => { if (okAt(i) && pl.as === 'iftira' && pl.target === id) reveal[i].note = 'tabib'; });
      continue;
    }
    if (d < 0) c.drawsOwed[id] = (c.drawsOwed[id] ?? 0) + lose(g, id, -d, 'intrigue');
    if (d > 0) gain(g, id, d, 'intrigue');
  }
  // Esma Hatun returns a card that took effect; everything else goes to the discard pile
  c.plays.forEach((pl, i) => {
    const owner = P(g, pl.owner);
    if (pl.esma && okAt(i) && owner.companion === 'esma' && !owner.companionUsed) {
      owner.companionUsed = true;
      owner.hand.push(pl.card);
      log(g, 'esma', { who: pl.owner, card: pl.card.kind });
      checkHand(g, pl.owner);
    } else discardCard(g, pl.card);
  });
  for (const [id, n] of Object.entries(c.drawsOwed)) {
    if (n > 0) {
      drawIntrigue(g, Number(id), n);
      checkHand(g, Number(id));
    }
  }
  checkAmbitions(g);
  log(g, 'waveResolved', { wave: c.wave });
  openWave(g);
}

/** A Minister leaves the seat to a new player: Valide'nin Buyruğu, an Objection, Feragat or the Ferman. */
export function replaceMinister(g: Game, removed: PID, by: PID, reason: string, newcomer: PID) {
  const seat = seatOf(g, removed);
  must(seat, 'O oyuncu artık Vekil değil.');
  must(newcomer !== removed && eligibleList(g, seat).includes(newcomer), 'Bu oyuncu o koltuğa uygun değil.');
  g.ministers[seat] = newcomer;
  log(g, 'replaced', { seat, removed, newcomer, reason, by });
  if (reason === 'valide') P(g, newcomer).stats.seatByIntrigue = true;
}

export function drawForSeatLoss(g: Game, id: PID) {
  if (g.step === 'court' && g.court && !g.court.done) {
    g.court.drawsOwed[id] = (g.court.drawsOwed[id] ?? 0) + 1;
    return;
  }
  drawIntrigue(g, id, 1);
  checkHand(g, id);
}
