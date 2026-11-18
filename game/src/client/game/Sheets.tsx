// Sheets over the table: a seat's details, a card at reading size, the two tracks, the Sicil and log, settings, your
// secrets (press and hold your Taraf), and the pop-up for new private information.
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  RULES, crisisById, intrigueById, MISC, type Peek, type PID,
} from '../../engine/index.ts';
import { Card } from '../cards/Card.tsx';
import { spec } from '../cardSpecs.ts';
import { Em, Gl } from '../ui/marks.tsx';
import { Head } from '../ui/Figure.tsx';
import { t } from '../strings.ts';
import { logText } from '../logText.ts';
import { getTags, markPeeksSeen, peeksSeen, setTag, setPrefs, usePrefs } from '../prefs.ts';
import { send } from '../net.ts';
import { startMusic, stopMusic } from '../sound.ts';
import { Btn } from './Prompt.tsx';
import { CardPop, POP_CARD, PopShell, charRef, hirsRef, kulRef } from './Pop.tsx';
import { Refs } from '../ui/Refs.tsx';
import { useGame } from './ctx.ts';

const fade = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0 }, transition: { duration: 0.2 } };

function Close({ onClick }: { onClick: () => void }) {
  return <button type="button" className="x-close" onClick={onClick} aria-label={t('close')}><Gl k="close" /></button>;
}

export function SheetView() {
  const { sheet, setSheet } = useGame();
  if (!sheet) return null;
  const close = () => setSheet(null);
  switch (sheet.t) {
    case 'seat': return <SeatSheet id={sheet.id} close={close} />;
    case 'card': return <CardPop cardRef={sheet.ref} uid={sheet.uid} own={sheet.own} />;
    case 'log': return <LogSheet close={close} />;
    case 'settings': return <SettingsSheet close={close} />;
    case 'secret': return <SecretSheet close={close} />;
    case 'track': return <TrackSheet which={sheet.which} close={close} />;
  }
}

// ---------- a seat: their Character and Kul cards, and beneath them what the cards can't show

function SeatSheet({ id, close }: { id: PID; close: () => void }) {
  const { g, seat, room } = useGame();
  const p = g.players[id];
  const [tags, setTags] = useState(() => getTags(room.code, seat));
  const tag = (v: 'suspect' | 'trusted') => {
    setTag(room.code, seat, id, tags[id] === v ? null : v);
    setTags(getTags(room.code, seat));
  };
  return (
    <PopShell className="seatpop" onClose={close} cards={<>
      <Card spec={spec(charRef(g, p.character))} width={POP_CARD} />
      {p.companion && <Card spec={spec(kulRef(p))} width={POP_CARD} />}
    </>}>
      <div className="pop-who">
        <b>{p.name}{id === seat ? ` ${t('you')}` : ''}</b>
        {!p.sultan && <span title={t('nInfluence', { n: p.influence })}><Em k="influence" s={17} />{p.influence}</span>}
        {!p.sultan && id === seat && <span title={t('handCount', { n: p.hand.length })}><Em k="intrigue" s={17} />{p.hand.length}</span>}
        {id !== seat && !p.sultan && (
          <span className="tags" title={t('onlyYou')}>
            <Gl k="eye" />
            <button type="button" className={`b ${tags[id] === 'suspect' ? 'on2' : ''}`} onClick={() => tag('suspect')}><Em k="suspect" s={16} />{t('tag.suspect')}</button>
            <button type="button" className={`b ${tags[id] === 'trusted' ? 'on3' : ''}`} onClick={() => tag('trusted')}><Em k="trusted" s={16} />{t('tag.trusted')}</button>
          </span>
        )}
      </div>
    </PopShell>
  );
}

// ---------- the two tracks: what each Hizmet and each Hıyanet brings

function TrackSheet({ which, close }: { which: 'h' | 'x'; close: () => void }) {
  const { g } = useGame();
  const loyal = Array.from({ length: RULES.tracks.loyalty }, (_, i) => i + 1 === RULES.tracks.loyalty
    ? { icon: 'loyalist', name: t('loyalistsWin'), text: '' }
    : { icon: 'influence', name: t('track.decreeGive'), text: '' });
  const treason = Array.from({ length: RULES.tracks.treason }, (_, i) => {
    const n = i + 1;
    if (n === RULES.tracks.treason) return { icon: 'death', ...MISC.treason.death };
    const key = RULES.treasonPowers[String(n)];
    const def = key ? MISC.treason[key as 'sorusturma'] : MISC.treason['1'];
    return { icon: key ? (key === 'fermanRefresh' ? 'ferman' : 'treason') : 'pass', ...def };
  });
  const row = (cls: 'h' | 'x', icon: string, name: string, on: number, steps: { icon: string; name: string; text: string }[], every: string) => (
    <div className={`trow ${cls} ${which === cls ? 'focus' : ''}`}>
      <p className="trow-head"><Em k={icon} s={20} /><b>{name}</b><span>{on}/{steps.length}</span><i><Refs text={every} /></i></p>
      <ol className="tsteps">
        {steps.map((st, i) => (
          <li key={i} className={i < on ? 'on' : i === on ? 'next' : ''}>
            <span className={`slot-ic ${cls === 'x' && i === steps.length - 1 ? 'end' : ''}`} />
            <small>{i + 1}</small>
            <Em k={st.icon} s={18} />
            <b><Refs text={st.name} /></b>
            {st.text && <span>{st.text}</span>}
          </li>
        ))}
      </ol>
    </div>
  );
  return (
    <PopShell className="trackpop" onClose={close}>
      {row('h', 'hizmet', t('hizmet'), g.tracks.loyalty, loyal, MISC.kader.h.text.join(' '))}
      {row('x', 'hiyanet', t('hiyanet'), g.tracks.treason, treason, MISC.kader.x.text.join(' '))}
    </PopShell>
  );
}

// ---------- Sicil and the full log

function LogSheet({ close }: { close: () => void }) {
  const { g, seat } = useGame();
  const [tab, setTab] = useState<'sicil' | 'log' | 'secrets'>('sicil');
  const mine = g.peeks.filter(p => p.to === seat);
  return (
    <motion.div className="full zp sheet log" {...fade}>
      <div className="bd block">
        <div className="log-head">
          <p className="h-mid">{t('sicil')}</p>
          <span className="tabs">
            {(['sicil', 'log', 'secrets'] as const).map(k => (
              <button type="button" key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{t(`tab.${k}`)}{k === 'secrets' && mine.length ? ` (${mine.length})` : ''}</button>
            ))}
          </span>
          <Close onClick={close} />
        </div>
        <div className="scroll">
          {tab === 'sicil' && <Sicil />}
          {tab === 'log' && (
            <ol className="events">
              {g.log.map((e, i) => ({ e, s: logText(g, e), i })).filter(x => x.s).reverse().map(({ e, s, i }) => (
                <li key={i}><span className="c">{e.c || '·'}</span>{s}</li>
              ))}
            </ol>
          )}
          {tab === 'secrets' && (mine.length ? <div className="peeks">{mine.slice().reverse().map((p, i) => <PeekBody key={i} p={p} />)}</div> : <p className="vo">{t('noSecrets')}</p>)}
        </div>
      </div>
    </motion.div>
  );
}

function Sicil() {
  const { g } = useGame();
  const hd = (id: PID | null) => id === null ? null : <span className="pill"><Head character={g.players[id].character} />{g.players[id].name}</span>;
  return (
    <table className="sc">
      <thead><tr><th /><th>{t('sicil.crisis')}</th><th>{t('sicil.ministers')}</th><th>{t('sicil.kader')}</th><th>{t('sicil.decree')}</th><th>{t('sicil.events')}</th></tr></thead>
      <tbody>
        {g.sicil.map(r => (
          <tr key={r.c}>
            <td className="n">{r.c}</td>
            <td>{r.crisis && <><b>{crisisById[r.crisis].name}</b><span className="f"><Em k={crisisById[r.crisis].field} s={15} /></span></>}</td>
            <td>{hd(r.first)}{r.first !== null && <Gl k="arrow" className="ar" />}{hd(r.second)}</td>
            <td>{r.result ? <span className={`res ${r.result}`}>{MISC.kader[r.result].name}</span> : <span className="res">{t('ongoing')}</span>}</td>
            <td>{r.decree ? `${g.players[r.decree.to].name} ${r.decree.delta > 0 ? '+' : '−'}${Math.abs(r.decree.delta)}` : ''}</td>
            <td className="nt">{r.events.map(e => logText(g, e)).filter(Boolean).join(' ')}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ---------- private information: the cards first, the words beneath

export function PeekBody({ p }: { p: Peek }) {
  const { g } = useGame();
  const n = (id: PID) => g.players[id].name;
  const kader = (cards: string[], w = 96) => <div className="peek-cards">{cards.map((k, i) => <Card key={i} spec={spec({ t: 'kader', k: k as 'h' })} width={w} whole />)}</div>;
  const words = (text: string) => <p className="pop-text"><Refs text={text} /></p>;
  switch (p.kind) {
    case 'role': {
      return (
        <div className="peek">
          <div className="peek-cards"><Card spec={spec({ t: 'taraf', side: p.side })} width={130} whole /></div>
          <p className="pop-name">{t(p.side === 'traitor' ? 'youTraitor' : 'youLoyalist')}</p>
          {p.side === 'traitor' && words(p.traitors.length ? t('peek.traitors', { names: p.traitors.map(n).join(', ') }) : t('peek.alone'))}
        </div>
      );
    }
    case 'casus':
      return (
        <div className="peek">
          {p.plays.length > 0 && (
            <div className="peek-cards">
              {p.plays.map((x, i) => (
                <span key={i} className="peek-play"><Card spec={spec({ t: 'intr', kind: x.as, field: x.field })} width={90} whole /><small><Gl k="next" />{n(x.target)}</small></span>
              ))}
            </div>
          )}
          {words(t('peek.casus', { name: n(p.of) }) + (p.plays.length ? '' : ' ' + t('peek.casusNone')))}
        </div>
      );
    case 'sameSide': return <div className="peek">{words(t(p.same ? 'peek.sameSide' : 'peek.otherSide', { a: n(p.a), b: n(p.b) }))}</div>;
    case 'playedBy':
      if (p.by === null || p.card === null) return <div className="peek">{words(t('peek.playedByNone', { on: n(p.on) }))}</div>;
      return (
        <div className="peek">
          <div className="peek-cards"><Card spec={spec({ t: 'intr', kind: p.card, field: intrigueById[p.card].copies.harem ? 'harem' : 'divan' })} width={110} whole /></div>
          {words(t('peek.playedBy', { on: n(p.on), name: n(p.by), card: intrigueById[p.card].name }))}
        </div>
      );
    case 'kaderTop': return <div className="peek">{kader(p.cards)}{words(t(`peek.kaderTop.${p.source}`))}</div>;
    case 'allegiance':
      return <div className="peek"><div className="peek-cards"><Card spec={spec({ t: 'taraf', side: p.side })} width={110} whole /></div>{words(t('peek.allegiance', { name: n(p.of), side: t(p.side) }))}</div>;
    case 'discards': return <div className="peek">{p.cards.length ? kader(p.cards) : null}{words(t(`peek.discards.${p.source}`, { name: n(p.of) }) + (p.cards.length ? '' : ' ' + t('peek.noDiscards')))}</div>;
    case 'stolen': return <div className="peek"><div className="peek-cards"><Card spec={spec({ t: 'intr', kind: p.card, field: intrigueById[p.card].copies.harem ? 'harem' : 'divan' })} width={110} whole /></div>{words(t('peek.stolen', { name: n(p.from), card: intrigueById[p.card].name }))}</div>;
  }
}

/** New private information pops up once on its owner's phone. */
export function PeekPopup() {
  const { g, seat, room } = useGame();
  const mine = g.peeks.filter(p => p.to === seat);
  const [seen, setSeen] = useState(() => peeksSeen(room.code, seat));
  useEffect(() => setSeen(peeksSeen(room.code, seat)), [seat]);
  if (mine.length <= seen) return null;
  const p = mine[seen];
  const done = () => { markPeeksSeen(room.code, seat, seen + 1); setSeen(seen + 1); };
  return (
    <PopShell className="peekpop" key={seen}>
      <p className="pop-kind"><Gl k="eye" />{t('onlyYou')}</p>
      <PeekBody p={p} />
      <div className="pop-acts"><Btn pri onClick={done}>{t('btn.gotIt')}</Btn></div>
    </PopShell>
  );
}

// ---------- your secrets (press and hold the Taraf): Taraf and Hırs cards, and beneath them what they mean for you

function SecretSheet({ close }: { close: () => void }) {
  const { g, me } = useGame();
  useEffect(() => {
    const up = () => close();
    window.addEventListener('pointerup', up);
    return () => window.removeEventListener('pointerup', up);
  }, []);
  if (me.sultan) {
    return (
      <PopShell onClose={close} cards={<Card spec={spec(charRef(g, me.character))} width={POP_CARD} />}>
        <p className="pop-who"><b>{t('sultanSecret')}</b><span>{t('sultanSecretWhy')}</span></p>
      </PopShell>
    );
  }
  const role = g.peeks.find(p => p.to === me.id && p.kind === 'role');
  return (
    <PopShell className="secret" onClose={close} cards={<>
      <Card spec={spec({ t: 'taraf', side: me.side! })} width={POP_CARD} />
      {me.ambition && !g.learning && <Card spec={spec(hirsRef(me))} width={POP_CARD} />}
    </>}>
      <p className="pop-who"><b>{t(me.side === 'traitor' ? 'youTraitor' : 'youLoyalist')}</b>
        {role && role.kind === 'role' && me.side === 'traitor' && <span>{role.traitors.length ? t('peek.traitors', { names: role.traitors.map(i => g.players[i].name).join(', ') }) : t('peek.alone')}</span>}
      </p>
    </PopShell>
  );
}

// ---------- settings

function SettingsSheet({ close }: { close: () => void }) {
  const prefs = usePrefs();
  const { room, g } = useGame();
  const toggle = (k: 'sfx' | 'music' | 'buzz') => {
    setPrefs({ [k]: !prefs[k] });
    if (k === 'music') (prefs.music ? stopMusic : startMusic)();
  };
  return (
    <motion.div className="full zp sheet" {...fade}>
      <div className="bd block settings">
        <div className="log-head"><p className="h-mid">{t('settings')}</p><Close onClick={close} /></div>
        <div className="rows">
          {(['sfx', 'music', 'buzz'] as const).map(k => (
            <button type="button" key={k} className={`row ${prefs[k] ? 'on' : ''}`} onClick={() => toggle(k)}>
              <b>{t(`pref.${k}`)}</b><small>{t(`pref.${k}.why`)}</small><span className="sw">{prefs[k] ? t('on') : t('off')}</span>
            </button>
          ))}
        </div>
        <p className="vo small">{t('roomCode', { code: room.code })} · {t(g.learning ? 'learningGame' : 'fullGame')}</p>
        <div className="bt left">
          <Btn onClick={() => send({ t: 'leave' })}>{t('btn.leave')}</Btn>
          {room.host && <Btn onClick={() => send({ t: 'lobbyAgain' })}>{t('btn.endGame')}</Btn>}
        </div>
      </div>
    </motion.div>
  );
}

