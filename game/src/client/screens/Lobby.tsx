// The lobby: the room code to share, the seats in table order, and the host's settings. Seat order is the order
// around the real table (Objections go clockwise), so the host can move people to match where they sit.
import { useState } from 'react';
import { RULES } from '../../engine/index.ts';
import { send, type RoomView } from '../net.ts';
import { Em, Gl } from '../ui/marks.tsx';
import { t } from '../strings.ts';
import { MODS, modName } from '../words.ts';
import { Frieze } from './Frieze.tsx';

export function Lobby({ room }: { room: RoomView }) {
  const n = room.seats.length;
  const ok = n >= RULES.players.min && n <= RULES.players.max;
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
  return (
    <div className="full zp lobby">
      <Frieze />
      <div className="bd block">
        <div className="title">
          <b>Entrika</b>
          <p className="vo">{t('tagline')}</p>
          <a className="rules-link" href="/kurallar" target="_blank" rel="noopener">{t('rules')}</a>
          {/* the host sets the game up; everyone else sees how it is set */}
          {room.host ? (
            <div className="opts">
              {/* the world the game is set in; unfinished mods only in test rooms */}
              {MODS.filter(m => !m.draft || room.dev).map(m => (
                <button type="button" key={m.id} className={`chip ${room.mod === m.id ? 'on' : ''}`} onClick={() => op({ op: 'mod', value: m.id })}>{modName(m)}</button>
              ))}
            </div>
          ) : null}
          {room.host ? (
            <div className="opts">
              <button type="button" className={`chip ${room.learning ? 'on' : ''}`} onClick={() => op({ op: 'learning', value: !room.learning })}>{t('lobby.learning')}</button>
              {!room.learning && <button type="button" className={`chip ${room.timers ? 'on' : ''}`} onClick={() => op({ op: 'timers', value: !room.timers })}>{t('lobby.timers')}</button>}
              <button type="button" className="chip" onClick={() => op({ op: 'shuffle' })}>{t('lobby.shuffle')}</button>
            </div>
          ) : (
            <div className="opts">
              <span className="chip on">{modName(MODS.find(m => m.id === room.mod) ?? MODS[0])}</span>
              <span className="chip on">{t(room.learning ? 'lobby.learning' : 'lobby.full')}</span>
              {!room.learning && room.timers && <span className="chip on">{t('lobby.timers')}</span>}
            </div>
          )}
          <p className="vo small">{t(room.learning ? 'lobby.learningWhy' : 'lobby.fullWhy')}</p>
          <p className="vo small">{t('lobby.seatWhy')}</p>
        </div>
        <div className="side">
          <p className="h-step">{t('lobby.code')}</p>
          <div className="code">{room.code.split('').map((c, i) => <i key={i}>{c}</i>)}</div>
          <ol className="seats">
            {room.seats.map((s, i) => (
              <li key={i} className={room.mine.includes(i) ? 'me' : ''}>
                <span className="no">{i + 1}</span>
                <b>{room.mine.includes(i) && !room.dev ? t('youName', { name: s.name }) : s.name}</b>
                {room.sultan === i && <span className="tg">{t('lobby.sultan')}</span>}
                {!s.online && !room.dev && <small>{t('offline')}</small>}
                {room.host && (
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
          <p className="wait">
            {t('lobby.count', { n, min: RULES.players.min, max: RULES.players.max })}{' '}
            {room.sultan !== null ? '' : t(room.host ? 'lobby.sultanPick' : 'lobby.sultanRandom')}
          </p>
          <div className="bt">
            <button type="button" className="b" onClick={() => send({ t: 'leave' })}>{t('btn.leave')}</button>
            <button type="button" className="b" onClick={share}><Gl k="share" />{t(copied ? 'lobby.copied' : 'lobby.share')}</button>
            {room.host ? <button type="button" className="b pri" disabled={!ok} onClick={() => send({ t: 'start' })}>{t('lobby.start')}</button>
              : <span className="wait">{t('lobby.waitHost')}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
