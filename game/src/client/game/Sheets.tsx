// Sheets over the table: a seat's details, a card at reading size, the Sicil and log, settings, your secrets
// (press and hold your Taraf), and the pop-up for new private information.
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  ambitionById, characterById, companionById, crisisById, intrigueById, MISC, type Peek, type PID,
} from '../../engine/index.ts';
import { Card } from '../cards/Card.tsx';
import { spec } from '../cardSpecs.ts';
import { Em, Gl } from '../ui/marks.tsx';
import { Head, KulHead } from '../ui/Figure.tsx';
import { t } from '../strings.ts';
import { logText } from '../logText.ts';
import { getTags, markPeeksSeen, peeksSeen, setTag, setPrefs, usePrefs } from '../prefs.ts';
import { send } from '../net.ts';
import { startMusic, stopMusic } from '../sound.ts';
import { Btn } from './Prompt.tsx';
import { CardPop, CharPowers, PopClose, PopShell } from './Pop.tsx';
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
  }
}

// ---------- a seat

function SeatSheet({ id, close }: { id: PID; close: () => void }) {
  const { g, seat, room } = useGame();
  const p = g.players[id];
  const comp = p.companion ? companionById[p.companion] : null;
  const vk = g.ministers.first === id ? 'min1' : g.ministers.second === id ? 'min2' : null;
  const [tags, setTags] = useState(() => getTags(room.code, seat));
  const tag = (v: 'suspect' | 'trusted') => {
    setTag(room.code, seat, id, tags[id] === v ? null : v);
    setTags(getTags(room.code, seat));
  };
  const onThem = (g.court?.reveals ?? []).flat().filter(r => r.target === id);
  return (
    <PopShell zone="zp" className="seatpop" onClose={close}>
      <Card spec={spec({ t: 'char', id: p.character })} width={168} />
      <div className="pop-body">
        <PopClose onClick={close} />
        <p className="pop-kind"><Em k="character" s={16} />{characterById[p.character].name}{vk && <><i className="sep" /><Em k="minister" s={16} />{t(vk)}</>}</p>
        <p className="pop-name">{p.name}{id === seat ? ` ${t('you')}` : ''}</p>
        {!p.sultan && (
          <p className="pop-stats">
            <span title={t('nInfluence', { n: p.influence })}><Em k="influence" s={18} /><b>{p.influence}</b></span>
            <span title={t('handCount', { n: p.hand.length })}><Em k="intrigue" s={18} /><b>{p.hand.length}</b></span>
            {comp && <span className={p.influence < 1 ? 'down' : ''} title={comp.name}><KulHead id={comp.id} />{comp.name}{p.influence < 1 ? ` (${t('faceDown')})` : ''}</span>}
          </p>
        )}
        <CharPowers id={p.character} own={false} close={close} />
        {p.ambitionShown && p.ambition && <p className="pop-note"><Em k="ambition" s={15} /><b>{ambitionById[p.ambition].name}</b>{t('ambitionDone')}</p>}
        {onThem.length > 0 && (
          <p className="pop-note">{t('onThemThisCrisis')} {onThem.map((r, i) => <span key={i} className={`tg ${r.outcome !== 'ok' ? 'void' : ''}`}>{intrigueById[r.as].name}</span>)}</p>
        )}
        {id !== seat && !p.sultan && (
          <div className="priv zl">
            <small><Gl k="eye" />{t('onlyYou')}</small>
            <button type="button" className={`b ${tags[id] === 'suspect' ? 'on2' : ''}`} onClick={() => tag('suspect')}><Em k="suspect" s={16} />{t('tag.suspect')}</button>
            <button type="button" className={`b ${tags[id] === 'trusted' ? 'on3' : ''}`} onClick={() => tag('trusted')}><Em k="trusted" s={16} />{t('tag.trusted')}</button>
          </div>
        )}
      </div>
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
            <td>{r.decree ? `${g.players[r.decree.to].name} ${r.decree.delta > 0 ? '+1' : '−1'}` : ''}</td>
            <td className="nt">{r.events.map(e => logText(g, e)).filter(Boolean).join(' ')}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ---------- private information

export function PeekBody({ p }: { p: Peek }) {
  const { g } = useGame();
  const n = (id: PID) => g.players[id].name;
  const kader = (cards: string[]) => <div className="peek-cards">{cards.map((k, i) => <Card key={i} spec={spec({ t: 'kader', k: k as 'h' })} width={100} />)}</div>;
  switch (p.kind) {
    case 'role':
      return (
        <div className="peek role">
          <div className="peek-cards"><Card spec={spec({ t: 'taraf', side: p.side })} width={120} /></div>
          <div>
            <p className="h-mid">{t(p.side === 'traitor' ? 'youTraitor' : 'youLoyalist')}</p>
            <p className="vo">{p.side === 'traitor' ? (p.traitors.length ? t('peek.traitors', { names: p.traitors.map(n).join(', ') }) : t('peek.alone')) : t('peek.loyalist')}</p>
            <p className="vo small">«{g.players[p.to].side === 'traitor' ? characterById[g.players[p.to].character].traitor : characterById[g.players[p.to].character].loyal}»</p>
          </div>
        </div>
      );
    case 'handAmbition':
      return (
        <div className="peek">
          <p className="vo">{t('peek.handAmbition', { name: n(p.of) })}</p>
          <div className="peek-cards">
            {p.hand.map((c, i) => <Card key={i} spec={spec({ t: 'intr', kind: c.kind, field: c.field })} width={80} />)}
            {!p.hand.length && <span className="tg">{t('emptyHandOf')}</span>}
            {p.ambition && <Card spec={spec({ t: 'hirs', id: p.ambition })} width={80} />}
          </div>
        </div>
      );
    case 'kaderTop': return <div className="peek"><p className="vo">{t(`peek.kaderTop.${p.source}`)}</p>{kader(p.cards)}</div>;
    case 'allegiance':
      return <div className="peek"><p className="vo">{t('peek.allegiance', { name: n(p.of), side: t(p.side) })}</p><div className="peek-cards"><Card spec={spec({ t: 'taraf', side: p.side })} width={100} /></div></div>;
    case 'ambition':
      return <div className="peek"><p className="vo">{t('peek.ambition', { name: n(p.of) })}</p><div className="peek-cards">{p.ambition && <Card spec={spec({ t: 'hirs', id: p.ambition })} width={100} />}</div></div>;
    case 'kaderDraw': return <div className="peek"><p className="vo">{t('peek.kaderDraw')}</p>{kader(p.cards)}</div>;
    case 'discards': return <div className="peek"><p className="vo">{t(`peek.discards.${p.source}`, { name: n(p.of) })}</p>{p.cards.length ? kader(p.cards) : <p className="vo small">{t('peek.noDiscards')}</p>}</div>;
    case 'crisisTop': return <div className="peek"><p className="vo">{t('peek.crisisTop')}</p><div className="peek-cards">{p.cards.map(c => <Card key={c} spec={spec({ t: 'crisis', id: c })} width={90} />)}</div></div>;
    case 'stolen': return <div className="peek"><p className="vo">{t('peek.stolen', { name: n(p.from), card: intrigueById[p.card].name })}</p></div>;
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
      <div className="pop-body wide">
        <p className="pop-kind"><Gl k="eye" />{t('onlyYou')}</p>
        <PeekBody p={p} />
        <div className="pop-acts"><Btn pri onClick={done}>{t('btn.gotIt')}</Btn></div>
      </div>
    </PopShell>
  );
}

// ---------- your secrets (press and hold the Taraf)

function SecretSheet({ close }: { close: () => void }) {
  const { g, me } = useGame();
  useEffect(() => {
    const up = () => close();
    window.addEventListener('pointerup', up);
    return () => window.removeEventListener('pointerup', up);
  }, []);
  if (me.sultan) {
    return (
      <PopShell onClose={close}>
        <Card spec={spec({ t: 'char', id: 'suleyman' })} width={150} />
        <div className="pop-body"><p className="pop-kind"><Em k="public" s={16} />{t('public')}</p><p className="pop-name">{t('sultanSecret')}</p><p className="pop-text">{t('sultanSecretWhy')}</p></div>
      </PopShell>
    );
  }
  const ch = characterById[me.character];
  const role = g.peeks.find(p => p.to === me.id && p.kind === 'role');
  return (
    <PopShell className="secret" onClose={close}>
      <Card spec={spec({ t: 'taraf', side: me.side! })} width={150} />
      {me.ambition && <Card spec={spec({ t: 'hirs', id: me.ambition })} width={150} />}
      <div className="pop-body">
        <p className="pop-kind"><Gl k="eye" />{t('onlyYou')}</p>
        <p className="pop-name">{t(me.side === 'traitor' ? 'youTraitor' : 'youLoyalist')}</p>
        <p className="pop-text">«{me.side === 'traitor' ? ch.traitor : ch.loyal}»</p>
        {role && role.kind === 'role' && me.side === 'traitor' && <p className="pop-note">{role.traitors.length ? t('peek.traitors', { names: role.traitors.map(i => g.players[i].name).join(', ') }) : t('peek.alone')}</p>}
        {me.ambition && <p className="pop-note"><Em k="ambition" s={15} /><span><b>{ambitionById[me.ambition].name}.</b> {me.ambitionShown ? t('ambitionDone') : me.ambitionMet ? t('ambitionMet') : t('ambitionUnlocks', { favor: ch.favor.name })}</span></p>}
        <p className="pop-note"><Gl k="hold" />{t('releaseToClose')}</p>
      </div>
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

