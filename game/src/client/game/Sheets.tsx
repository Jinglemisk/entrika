// Sheets over the table: a seat's details, a card at reading size, the Sicil and log, settings, your secrets
// (press and hold your Taraf), and the pop-up for new private information.
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  ambitionById, characterById, companionById, crisisById, intrigueById, MISC, type Peek, type PID,
} from '../../engine/index.ts';
import { Card } from '../cards/Card.tsx';
import { spec, type CardRef } from '../cardSpecs.ts';
import { Em, Gl, Star } from '../ui/marks.tsx';
import { Head } from '../ui/Figure.tsx';
import { t } from '../strings.ts';
import { logText } from '../logText.ts';
import { getTags, markPeeksSeen, peeksSeen, setTag, setPrefs, usePrefs } from '../prefs.ts';
import { send } from '../net.ts';
import { startMusic, stopMusic } from '../sound.ts';
import { Btn } from './Prompt.tsx';
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
    case 'card': return <CardSheet cardRef={sheet.ref} close={close} />;
    case 'log': return <LogSheet close={close} />;
    case 'settings': return <SettingsSheet close={close} />;
    case 'secret': return <SecretSheet close={close} />;
  }
}

// ---------- a seat

function SeatSheet({ id, close }: { id: PID; close: () => void }) {
  const { g, seat, room } = useGame();
  const p = g.players[id];
  const ch = characterById[p.character];
  const comp = p.companion ? companionById[p.companion] : null;
  const [tags, setTags] = useState(() => getTags(room.code, seat));
  const tag = (v: 'suspect' | 'trusted') => {
    setTag(room.code, seat, id, tags[id] === v ? null : v);
    setTags(getTags(room.code, seat));
  };
  const onThem = (g.court?.reveals ?? []).flat().filter(r => r.target === id);
  const powerSub = (state: string, which: 'base' | 'favor') =>
    state === 'used' ? t('used') : state === 'locked' ? t('favorLocked') : t(which === 'base' ? 'baseReady' : 'favorReady');
  return (
    <motion.div className="full zp sheet" {...fade}>
      <div className="bd split">
        <Card spec={spec({ t: 'char', id: p.character })} width={200} />
        <div className="col">
          <Close onClick={close} />
          <p className="h-mid">{p.name}{id === seat ? ` ${t('you')}` : ''}</p>
          <div className="nm-row">
            <span className="pill plain">{ch.name}</span>
            {!p.sultan && <span className="pill"><Star n={p.influence} size={20} />{t('nInfluence', { n: p.influence })}</span>}
            {comp && <span className="pill">{comp.art && <img src={comp.art.src} alt="" />}{comp.name}{p.influence < 1 ? ` (${t('faceDown')})` : ''}</span>}
            {!p.sultan && <span className="pill plain">{t('handCount', { n: p.hand.length })}</span>}
          </div>
          <ul className="pw">
            <li className={p.sultan ? (g.ferman ? '' : 'used') : p.base === 'used' ? 'used' : ''}><i className="d" /><b>{ch.base.name}</b><small>{p.sultan ? t(g.ferman ? 'fermanReady' : 'fermanUsed') : powerSub(p.base, 'base')}</small></li>
            {!p.sultan && !g.learning && <li className={p.favor === 'used' ? 'used' : p.favor === 'locked' ? 'lock' : ''}><i className="d" /><b>{ch.favor.name}</b><small>{powerSub(p.favor, 'favor')}</small></li>}
            {p.ambitionShown && p.ambition && <li><i className="d" /><b>{ambitionById[p.ambition].name}</b><small>{t('ambitionDone')}</small></li>}
          </ul>
          {onThem.length > 0 && <p className="wait fg">{t('onThemThisCrisis')} {onThem.map((r, i) => <span key={i} className={`tg ${r.outcome !== 'ok' ? 'void' : ''}`}>{intrigueById[r.as].name}</span>)}</p>}
          {id !== seat && !p.sultan && (
            <div className="priv zl">
              <small><Gl k="eye" />{t('onlyYou')}</small>
              <button type="button" className={`b ${tags[id] === 'suspect' ? 'on2' : ''}`} onClick={() => tag('suspect')}>{t('tag.suspect')}</button>
              <button type="button" className={`b ${tags[id] === 'trusted' ? 'on3' : ''}`} onClick={() => tag('trusted')}>{t('tag.trusted')}</button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ---------- a card at reading size

function CardSheet({ cardRef, close }: { cardRef: CardRef; close: () => void }) {
  const s = spec(cardRef);
  const kindLabel = t(`kind.${cardRef.t}`);
  const field = 'field' in cardRef ? cardRef.field : cardRef.t === 'crisis' ? crisisById[cardRef.id].field : null;
  const text = cardRef.t === 'intr' ? intrigueById[cardRef.kind].text : cardRef.t === 'crisis' ? crisisById[cardRef.id].text : null;
  return (
    <motion.div className="full zl sheet" {...fade} onClick={close}>
      <div className="bd split">
        <Card spec={s} width={236} />
        <div className="col">
          <Close onClick={close} />
          <p className="h-step">{field && <Em k={field} s={18} />}{kindLabel}{field ? `, ${t(field)}` : ''}</p>
          <p className="h-mid">{s.name}</p>
          {text && <p className="vo big plain">{text}</p>}
          <div className="rule" />
          <p className="vo small">{t('cardTapClose')}</p>
        </div>
      </div>
    </motion.div>
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
  const kader = (cards: string[]) => <div className="peek-cards">{cards.map((k, i) => <Card key={i} spec={spec({ t: 'kader', k: k as 'h' })} width={88} />)}</div>;
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
    <motion.div className="full zl sheet peekpop" {...fade} key={seen}>
      <div className="bd block">
        <p className="h-step"><Gl k="eye" />{t('onlyYou')}</p>
        <PeekBody p={p} />
        <div className="bt left"><Btn pri onClick={done}>{t('btn.gotIt')}</Btn></div>
      </div>
    </motion.div>
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
      <motion.div className="full zl sheet" {...fade} onClick={close}>
        <div className="bd split">
          <div className="col"><p className="h-step"><Gl k="eye" />{t('public')}</p><p className="h-mid">{t('sultanSecret')}</p><p className="vo">{t('sultanSecretWhy')}</p></div>
          <Card spec={spec({ t: 'char', id: 'suleyman' })} width={196} />
        </div>
      </motion.div>
    );
  }
  const ch = characterById[me.character];
  const role = g.peeks.find(p => p.to === me.id && p.kind === 'role');
  return (
    <motion.div className="full zl sheet secret" {...fade} onClick={close}>
      <div className="bd split">
        <div className="col">
          <p className="h-step"><Gl k="eye" />{t('onlyYou')}</p>
          <p className="h-mid">{t(me.side === 'traitor' ? 'youTraitor' : 'youLoyalist')}</p>
          <p className="vo big">«{me.side === 'traitor' ? ch.traitor : ch.loyal}»</p>
          {role && role.kind === 'role' && me.side === 'traitor' && <p className="vo small plain">{role.traitors.length ? t('peek.traitors', { names: role.traitors.map(i => g.players[i].name).join(', ') }) : t('peek.alone')}</p>}
          {me.ambition && <p className="vo small plain"><b>{t('yourAmbition', { name: ambitionById[me.ambition].name })}</b> {ambitionById[me.ambition].text} {me.ambitionShown ? t('ambitionDone') : me.ambitionMet ? t('ambitionMet') : t('ambitionUnlocks', { favor: ch.favor.name })}</p>}
          <p className="wait"><Gl k="hold" />{t('releaseToClose')}</p>
        </div>
        <Card spec={spec({ t: 'taraf', side: me.side! })} width={176} />
        {me.ambition && <Card spec={spec({ t: 'hirs', id: me.ambition })} width={176} />}
      </div>
    </motion.div>
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

