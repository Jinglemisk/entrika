// The top line: Hizmet track, the Crisis and its field, Hıyanet track, and the log, settings and rules buttons (in a
// test room with ?devmode=on, the bot button takes the rules button's place; the rules stay in settings).
import { crisisById, crisisField, RULES } from '../../engine/index.ts';
import { Em, Gl } from '../ui/marks.tsx';
import { t } from '../strings.ts';
import { crisisWords } from '../words.ts';
import { useGame } from './ctx.ts';
import { BotToggle } from './DevBar.tsx';
import { DEVMODE } from '../devmode.ts';
import { openRules } from '../ui/Rules.tsx';

const FIELD_ICON = { harem: 'harem', divan: 'divan', saray: 'saray' } as const;

export function Slots({ n, on, fresh, end, big }: { n: number; on: number; fresh?: number; end?: boolean; big?: boolean }) {
  return (
    <span className={big ? 'bs' : 'sl'}>
      {Array.from({ length: n }, (_, i) => (
        <i key={i} className={[i < on ? (i === fresh ? 'new' : 'on') : '', end && i === n - 1 ? 'end' : ''].join(' ')} />
      ))}
    </span>
  );
}

export function Mizan() {
  const { g, room, setSheet } = useGame();
  const c = g.crisis ? crisisById[g.crisis] : null;
  const field = crisisField(g);
  const unread = g.log.length;
  return (
    <div className="mz">
      <button type="button" className="trk h" title={t('loyaltyTrack')} onClick={() => setSheet({ t: 'track', which: 'h' })}><Em k="hizmet" s={20} /><span>{t('hizmet')}</span><Slots n={RULES.tracks.loyalty} on={g.tracks.loyalty} /></button>
      <button type="button" className="kz" onClick={() => c && setSheet({ t: 'card', ref: { t: 'crisis', id: c.id } })}>
        <small>{t('crisisN', { n: g.crisisNo || 1 })}</small>
        <b>{c ? crisisWords(c.id).name : g.crisisNo ? t('crisisComing') : t('setupTitle')}</b>
        {c && <span className="chipf"><Em k={FIELD_ICON[field]} s={16} />{t(field)}</span>}
      </button>
      <div className="r">
        <button type="button" className="trk x" title={t('treasonTrack')} onClick={() => setSheet({ t: 'track', which: 'x' })}><Slots n={RULES.tracks.treason} on={g.tracks.treason} end /><span>{t('hiyanet')}</span><Em k="hiyanet" s={20} /></button>
        <div className="nav">
          <button type="button" className={unread ? 'dot' : ''} onClick={() => setSheet({ t: 'log' })} aria-label={t('sicil')}><Gl k="log" /></button>
          <button type="button" onClick={() => setSheet({ t: 'settings' })} aria-label={t('settings')}><Gl k="set" /></button>
          {room.dev && DEVMODE ? <BotToggle /> : <button type="button" onClick={() => openRules()} aria-label={t('rules')}><Gl k="help" /></button>}
        </div>
      </div>
    </div>
  );
}
