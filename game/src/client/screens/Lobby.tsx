// The lobby. Left: the world the game is set in and its settings, which the host sets and everyone else sees read-only.
// Right: the room code to share and the seats in table order. Seat order is the order around the real table
// (Objections go clockwise), so the host can move people to match where they sit.
import { useState } from 'react';
import { RULES } from '../../engine/index.ts';
import { send, type RoomView } from '../net.ts';
import { Em, Gl } from '../ui/marks.tsx';
import { t } from '../strings.ts';
import { MODS, modName } from '../words.ts';
import { openRules } from '../ui/Rules.tsx';
import { Frieze } from './Frieze.tsx';

/** A setting the host switches: a checkbox, its name and one line on what it does. */
function Option({ on, off, label, why, set }: { on: boolean; off?: boolean; label: string; why: string; set?: (v: boolean) => void }) {
  return (
    <label className={`opt ${off ? 'off' : ''}`}>
      <input type="checkbox" checked={on && !off} disabled={!set || off} onChange={e => set?.(e.target.checked)} />
      <span><b>{label}</b><small>{why}</small></span>
    </label>
  );
}

export function Lobby({ room }: { room: RoomView }) {
  const n = room.seats.length;
  const ok = n >= RULES.players.min && n <= RULES.players.max;
  const host = room.host;
  const op = (o: Record<string, unknown>) => send({ t: 'lobby', o });
  const link = `${location.origin}/?oda=${room.code}`;
  const [copied, setCopied] = useState(false);
  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: 'Entrika', text: t('lobby.shareText', { code: room.code }), url: link });
      else {
        await navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch { /* cancelled */ }
  };
  const mods = MODS.filter(m => !m.draft || room.dev);   // unfinished mods only in test rooms
  return (
    <div className="full zp lobby">
      <div className="bd block">
        <div className="title">
          <b>Entrika</b>
          <p className="vo">{t('tagline')} <button type="button" className="rules-link" onClick={() => openRules()}>{t('rules')}</button></p>
        </div>

        <div className="setup">
          <p className="h-step">{t('lobby.mod')}</p>
          <div className="worlds" role="radiogroup" aria-label={t('lobby.mod')}>
            {mods.map(m => (
              <button type="button" key={m.id} role="radio" aria-checked={room.mod === m.id} className={room.mod === m.id ? 'on' : ''}
                disabled={!host} onClick={() => op({ op: 'mod', value: m.id })}>{modName(m)}</button>
            ))}
          </div>
          <p className="h-step">{t('settings')}</p>
          <Option on={room.learning} label={t('lobby.learning')} why={t('lobby.learningWhy')}
            set={host ? v => op({ op: 'learning', value: v }) : undefined} />
          <Option on={room.timers} off={room.learning} label={t('lobby.timers')} why={t(room.learning ? 'lobby.timersOff' : 'lobby.timersWhy')}
            set={host ? v => op({ op: 'timers', value: v }) : undefined} />
        </div>

        <div className="side">
          <div className="room">
            <div>
              <p className="h-step">{t('lobby.code')}</p>
              <div className="code">{room.code.split('').map((c, i) => <i key={i}>{c}</i>)}</div>
            </div>
            <button type="button" className="b" onClick={share}><Gl k="share" />{t(copied ? 'lobby.copied' : 'lobby.share')}</button>
          </div>
          <div className="seats-h">
            <p className="h-step">{t('lobby.players', { n, max: RULES.players.max })}</p>
            {host && <button type="button" className="ln" onClick={() => op({ op: 'shuffle' })}>{t('lobby.shuffle')}</button>}
          </div>
          <ol className="seats">
            {room.seats.map((s, i) => (
              <li key={i} className={room.mine.includes(i) ? 'me' : ''}>
                <span className="no">{i + 1}</span>
                <b>{room.mine.includes(i) && !room.dev ? t('youName', { name: s.name }) : s.name}</b>
                {room.sultan === i && <span className="tg">{t('lobby.sultan')}</span>}
                {!s.online && !room.dev && <small>{t('offline')}</small>}
                {host && (
                  <span className="ctl">
                    <button type="button" aria-label={t('lobby.makeSultan')} title={t('lobby.makeSultan')} className={room.sultan === i ? 'on' : ''} onClick={() => op({ op: 'sultan', seat: room.sultan === i ? null : i })}>
                      <Em k="suleyman" s={18} />
                    </button>
                    <button type="button" aria-label={t('lobby.up')} disabled={i === 0} onClick={() => op({ op: 'move', from: i, to: i - 1 })}><Gl k="up" /></button>
                    <button type="button" aria-label={t('lobby.down')} disabled={i === n - 1} onClick={() => op({ op: 'move', from: i, to: i + 1 })}><Gl k="down" /></button>
                    {!room.mine.includes(i) && <button type="button" aria-label={t('lobby.kick')} onClick={() => op({ op: 'kick', seat: i })}><Gl k="close" /></button>}
                  </span>
                )}
              </li>
            ))}
          </ol>
          <p className="hint">
            {t('lobby.seatWhy')}{' '}
            {room.sultan !== null ? '' : t(host ? 'lobby.sultanPick' : 'lobby.sultanRandom')}
          </p>
          <div className="bt">
            <button type="button" className="b quiet" onClick={() => send({ t: 'leave' })}>{t('btn.leave')}</button>
            {host ? <button type="button" className="b pri" disabled={!ok} onClick={() => send({ t: 'start' })}>{t('lobby.start')}</button>
              : <span className="wait">{t('lobby.waitHost')}</span>}
          </div>
        </div>
        <Frieze />
      </div>
    </div>
  );
}
