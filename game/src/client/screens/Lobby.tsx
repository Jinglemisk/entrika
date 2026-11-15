// The lobby: the room code to share, the seats in table order, and the host's settings. Seat order is the order
// around the real table (Objections go clockwise), so the host can move people to match where they sit.
import { RULES } from '../../engine/index.ts';
import { send, type RoomView } from '../net.ts';
import { Gl } from '../ui/marks.tsx';
import { t } from '../strings.ts';
import { Frieze } from './Frieze.tsx';

export function Lobby({ room }: { room: RoomView }) {
  const n = room.seats.length;
  const ok = n >= RULES.players.min && n <= RULES.players.max;
  const op = (o: Record<string, unknown>) => send({ t: 'lobby', o });
  const link = `${location.origin}/?oda=${room.code}`;
  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: 'Entrika', text: t('lobby.shareText', { code: room.code }), url: link });
      else await navigator.clipboard.writeText(link);
    } catch { /* cancelled */ }
  };
  return (
    <div className="full zp lobby">
      <Frieze />
      <div className="bd block">
        <div className="title">
          <b>Entrika</b>
          <p className="vo">{t('tagline')}</p>
          {room.host && (
            <div className="opts host">
              <button type="button" className={`chip ${room.learning ? 'on' : ''}`} onClick={() => op({ op: 'learning', value: !room.learning })}>{t('lobby.learning')}</button>
              {!room.learning && <button type="button" className={`chip ${room.timers ? 'on' : ''}`} onClick={() => op({ op: 'timers', value: !room.timers })}>{t('lobby.timers')}</button>}
              <button type="button" className="chip" onClick={() => op({ op: 'shuffle' })}>{t('lobby.shuffle')}</button>
            </div>
          )}
          <p className="vo small">{t(room.learning ? 'lobby.learningWhy' : 'lobby.fullWhy')}</p>
        </div>
        <div className="side">
          <p className="h-step">{t('lobby.code')}</p>
          <div className="code">{room.code.split('').map((c, i) => <i key={i}>{c}</i>)}</div>
          <ol className="seats">
            {room.seats.map((s, i) => (
              <li key={i} className={room.mine.includes(i) ? 'me' : ''}>
                <span className="no">{i + 1}</span>
                <b>{s.name}</b>
                {room.sultan === i && <span className="tg">{t('lobby.sultan')}</span>}
                {!s.online && !room.dev && <small>{t('offline')}</small>}
                {room.host && (
                  <span className="ctl">
                    <button type="button" aria-label={t('lobby.makeSultan')} className={room.sultan === i ? 'on' : ''} onClick={() => op({ op: 'sultan', seat: room.sultan === i ? null : i })}>
                      <img src="/art/icons/set/suleyman-48.png" alt="" />
                    </button>
                    <button type="button" aria-label={t('lobby.up')} disabled={i === 0} onClick={() => op({ op: 'move', from: i, to: i - 1 })}><Gl k="up" /></button>
                    <button type="button" aria-label={t('lobby.down')} disabled={i === n - 1} onClick={() => op({ op: 'move', from: i, to: i + 1 })}><Gl k="down" /></button>
                    {!room.mine.includes(i) && <button type="button" aria-label={t('lobby.kick')} onClick={() => op({ op: 'kick', seat: i })}><Gl k="close" /></button>}
                  </span>
                )}
              </li>
            ))}
          </ol>
          <p className="wait">{t('lobby.count', { n, min: RULES.players.min, max: RULES.players.max })}{room.sultan === null ? ' ' + t('lobby.sultanRandom') : ''}</p>
          <div className="bt">
            <button type="button" className="b" onClick={() => send({ t: 'leave' })}>{t('btn.leave')}</button>
            <button type="button" className="b" onClick={share}><Gl k="share" />{t('lobby.share')}</button>
            {room.host ? <button type="button" className="b pri" disabled={!ok} onClick={() => send({ t: 'start' })}>{t('lobby.start')}</button>
              : <span className="wait">{t('lobby.waitHost')}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
