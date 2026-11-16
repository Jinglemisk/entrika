// Log entries are stored as keys with arguments; this turns them into Turkish sentences through the string table.
import { ambitionById, characterById, companionById, crisisById, intrigueById, MISC, type Game, type LogEntry } from '../engine/index.ts';
import { t } from './strings.ts';

export function powerLabel(power: string): string {
  if (power === 'iskender' || power === 'lokman') return companionById[power].name;
  if (power === 'cifteOyun' || power === 'yonDegistir' || power) {
    for (const c of Object.values(characterById)) {
      if (c.base.id === power) return c.base.name;
      if (c.favor?.id === power) return c.favor.name;
    }
  }
  return power;
}

/** One log entry as a sentence, or null for entries that are bookkeeping only. */
export function logText(g: Game, e: LogEntry): string | null {
  const p = (e.p ?? {}) as Record<string, any>;
  const n = (id: unknown) => (typeof id === 'number' && g.players[id] ? g.players[id].name : '?');
  const seat = (s: unknown) => t(s === 'first' ? 'min1' : 'min2');
  switch (e.k) {
    case 'crisis': return t('log.crisis', { name: crisisById[p.id].name, field: t(crisisById[p.id].field) });
    case 'draw': return t('log.draw', { who: n(p.who), n: p.n });
    case 'gain': return t('log.gain', { who: n(p.who), n: p.n, why: t(`why.${p.why}`) });
    case 'lose': return t('log.lose', { who: n(p.who), n: p.n, why: t(`why.${p.why}`) });
    case 'firuze': return t('log.firuze', { who: n(p.who) });
    case 'play': return t(p.outcome === 'ok' ? 'log.play' : 'log.playVoid', { card: intrigueById[p.as as string].name, target: n(p.target), why: t(`outcome.${p.note ?? p.outcome}`) });
    case 'faiz': return t('log.faiz', { who: n(p.who), on: n(p.on) });
    case 'appoint': return t('log.appoint', { first: n(p.first), second: n(p.second), by: n(p.by) });
    case 'power':
      if (p.field) return t('log.cephe', { who: n(p.who), field: t(p.field) });
      return t(p.also !== undefined ? 'log.powerOnTwo' : p.target !== undefined ? 'log.powerOn' : 'log.power', { who: n(p.who), power: powerLabel(p.power), target: n(p.target), also: n(p.also) });
    case 'kefaletSaved': return t(`log.kefaletSaved.${p.by}`, { who: n(p.who) });
    case 'noObjection': return null;
    case 'objection': return t('log.objection', { who: n(p.who), against: n(p.against) });
    case 'itiraz': return t('log.itiraz', { who: n(p.who), against: n(p.against) });
    case 'replaced': return t(`log.replaced.${p.reason}`, { removed: n(p.removed), newcomer: n(p.newcomer), seat: seat(p.seat) });
    case 'ferman': return null;   // 'replaced' already says it
    case 'waveFlip': return t('log.waveFlip', { wave: p.wave, n: p.n });
    case 'courtEnd': return t('log.courtEnd', { n: p.waves - 1 });
    case 'playDropped': return t('log.playDropped', { who: n(p.who) });
    case 'kaderStart': return t('log.kaderStart', { first: n(p.first), second: n(p.second) });
    case 'result': return t('log.result', { card: MISC.kader[p.card as 'h'].name, loyalty: p.loyalty, treason: p.treason });
    case 'sorusturma': return t('log.sorusturma');
    case 'hazineDefteri': return t('log.hazineDefteri');
    case 'fermanRefresh': return t('log.fermanRefresh');
    case 'investigator': return t('log.investigator', { who: n(p.who) });
    case 'investigated': return t('log.investigated', { by: n(p.by), of: n(p.of) });
    case 'hazineNamed': return t('log.hazineNamed', { who: n(p.who) });
    case 'decree':
      if (p.delta > 0) return t('log.decreeGive', { to: n(p.to), by: n(p.by) });
      if (p.cancelled) return t(`log.decreeCancelled.${p.cancelled}`, { to: n(p.to), by: n(p.by) });
      return t('log.decreeTake', { to: n(p.to), by: n(p.by), lost: p.lost });
    case 'ambition': return t('log.ambition', { who: n(p.who), name: ambitionById[p.id].name, favor: characterById[g.players[p.who].character].favor?.name });
    case 'gameOver': return t(p.side === 'traitor' ? 'traitorsWin' : 'loyalistsWin');
    case 'surgunActive': return t('log.surgun', { who: n(p.who) });
    case 'venedikBottom': return t('log.venedik', { who: n(p.who) });
    case 'intrigueReshuffle': return t('log.intrigueReshuffle');
    case 'kaderReshuffle': return t('log.kaderReshuffle');
    default: return null;
  }
}
