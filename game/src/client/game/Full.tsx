// Full-screen views. Private asks on lacquer (choose a Kul, the Kader cards, Cephe, Venedik Postası, the Decree)
// and public moments on paper (a Crisis flips, a wave flips, the Kader result, the end of the game).
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MISC, RULES, characterById, companionById, crisisById, intrigueById, type Ask, type Kader, type PID, type RevealedPlay,
} from '../../engine/index.ts';
import { send } from '../net.ts';
import { Card } from '../cards/Card.tsx';
import { spec } from '../cardSpecs.ts';
import { Em, Gl, Star } from '../ui/marks.tsx';
import { Figure, Head } from '../ui/Figure.tsx';
import { t } from '../strings.ts';
import { sfx } from '../sound.ts';
import { Btn, Prompt, Stp, playerName as name } from './Prompt.tsx';
import { Court } from './Court.tsx';
import { Slots } from './Mizan.tsx';
import { useGame } from './ctx.ts';

const fade = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.25 } };

// ---------- private asks

export function FullAsk() {
  const { asks } = useGame();
  const a = asks.find(x => ['companion', 'cephe', 'kaderFirst', 'kaderSecond', 'decree', 'venedik'].includes(x.type));
  if (!a) return null;
  return (
    <motion.div className={`full ${a.type === 'decree' ? 'zp' : 'zl'}`} key={a.id} {...fade}>
      <div className="bd">
        {a.type === 'companion' && <Companion a={a} />}
        {a.type === 'cephe' && <Cephe a={a} />}
        {a.type === 'kaderFirst' && <KaderFirst a={a} />}
        {a.type === 'kaderSecond' && <KaderSecond a={a} />}
        {a.type === 'decree' && <Decree a={a} />}
        {a.type === 'venedik' && <Venedik a={a} />}
      </div>
    </motion.div>
  );
}

function Companion({ a }: { a: Extract<Ask, { type: 'companion' }> }) {
  const { act, me } = useGame();
  const [pick, setPick] = useState<string | null>(null);
  return (
    <div className="split">
      <div className="col">
        <p className="h-step">{t('setupTitle')}</p>
        <p className="h-mid">{t('ask.companion')}</p>
        <p className="vo">{t('ask.companionWhy', { name: me.name })}</p>
        <div className="bt left"><Btn pri off={!pick} onClick={() => act({ t: 'answer', ask: a.id, value: pick })}>{pick ? t('btn.takeKul', { name: companionById[pick].name }) : t('btn.pickKul')}</Btn></div>
      </div>
      <div className="cards">
        {a.offer.map(id => (
          <button type="button" key={id} className={`pickcard ${pick === id ? 'on' : ''}`} onClick={() => { sfx('tap'); setPick(id); }}>
            <Card spec={spec({ t: 'kul', id })} width={170} />
          </button>
        ))}
      </div>
    </div>
  );
}

function Cephe({ a }: { a: Extract<Ask, { type: 'cephe' }> }) {
  const { act } = useGame();
  const [pick, setPick] = useState<string | null>(null);
  return (
    <div className="split">
      <div className="col">
        <Stp />
        <p className="h-mid">{t('ask.cephe')}</p>
        <p className="vo">{t('ask.cepheHow')}</p>
        <div className="bt left"><Btn pri off={!pick} onClick={() => act({ t: 'answer', ask: a.id, value: pick })}>{pick ? t('btn.playCrisis', { name: crisisById[pick].name }) : t('btn.pickOne')}</Btn></div>
      </div>
      <div className="cards">
        {a.cards.map(id => (
          <button type="button" key={id} className={`pickcard ${pick === id ? 'on' : ''}`} onClick={() => setPick(id)}>
            <Card spec={spec({ t: 'crisis', id })} width={170} />
          </button>
        ))}
      </div>
    </div>
  );
}

function KaderCards({ cards, marks, onTap }: { cards: Kader[]; marks: (i: number) => { cls: string; tag?: string; lock?: boolean }; onTap: (i: number) => void }) {
  const w = cards.length > 3 ? 112 : 140;
  return (
    <div className="kd">
      {cards.map((k, i) => {
        const m = marks(i);
        return (
          <motion.button type="button" key={i} className={`k ${m.cls}`} onClick={() => onTap(i)}
            initial={{ y: -40, opacity: 0, rotateY: 90 }} animate={{ y: m.cls === 'toss' ? 26 : 0, opacity: 1, rotateY: 0 }} transition={{ delay: i * 0.12 }}>
            <Card spec={spec({ t: 'kader', k })} width={w} />
            {m.tag && <span className={`kt ${m.cls === 'toss' ? 'out' : m.cls === 'go' ? 'go' : ''}`}>{m.lock && <Gl k="lock" />}{m.tag}</span>}
          </motion.button>
        );
      })}
    </div>
  );
}

function KaderFirst({ a }: { a: Extract<Ask, { type: 'kaderFirst' }> }) {
  const { g, act, me } = useGame();
  const [toss, setToss] = useState<number[]>([]);
  const loyal = me.side === 'loyalist';
  const xs = a.cards.filter(c => c === 'x').length;
  const needX = loyal ? Math.min(a.discard, xs) : 0;
  const locked = (i: number) => loyal && a.cards[i] === 'h' && needX > 0 && toss.filter(j => a.cards[j] === 'x').length < needX && !toss.includes(i)
    && toss.length >= a.discard - (needX - toss.filter(j => a.cards[j] === 'x').length);
  const tap = (i: number) => {
    sfx('tap');
    if (toss.includes(i)) return setToss(toss.filter(j => j !== i));
    if (loyal && a.cards[i] === 'h' && needX > 0 && a.discard - toss.length <= needX - toss.filter(j => a.cards[j] === 'x').length) return;
    setToss(toss.length >= a.discard ? [...toss.slice(1), i] : [...toss, i]);
  };
  const legal = toss.length === a.discard && toss.filter(j => a.cards[j] === 'x').length >= needX;
  return (
    <div className="split kader">
      <div className="col">
        <Stp label={t('step.kader')} />
        <p className="h-mid">{t('ask.kaderFirst', { n: a.discard, second: name(g, g.kader!.second) })}</p>
        {loyal && <p className="vo small">{t('ask.kaderLoyalFirst')}</p>}
        <p className="vo small dim">{t('ask.kaderSilence')}</p>
        <div className="bt left"><Btn pri off={!legal} onClick={() => act({ t: 'answer', ask: a.id, value: toss })}>{t('btn.passKader', { name: name(g, g.kader!.second) })}</Btn></div>
      </div>
      <KaderCards cards={a.cards} onTap={tap} marks={i => toss.includes(i) ? { cls: 'toss', tag: t('kader.toss') } : locked(i) ? { cls: 'lockd', tag: t('kader.locked'), lock: true } : { cls: 'go', tag: t('kader.go') }} />
    </div>
  );
}

function KaderSecond({ a }: { a: Extract<Ask, { type: 'kaderSecond' }> }) {
  const { g, act, me } = useGame();
  const loyal = me.side === 'loyalist';
  const forced = loyal && a.cards.includes('h') ? a.cards.indexOf('h') : null;
  const [play, setPlay] = useState<number | null>(forced);
  return (
    <div className="split kader">
      <div className="col">
        <Stp label={t('step.kader')} />
        <p className="h-mid">{t('ask.kaderSecond', { first: name(g, g.kader!.first) })}</p>
        {loyal && <p className="vo small">{t('ask.kaderLoyalSecond')}</p>}
        <p className="vo small dim">{t('ask.kaderSilence')}</p>
        <div className="bt left"><Btn pri off={play === null} onClick={() => act({ t: 'answer', ask: a.id, value: play })}>{t('btn.playKader')}</Btn></div>
      </div>
      <KaderCards cards={a.cards} onTap={i => { if (forced === null) { sfx('tap'); setPlay(i); } }}
        marks={i => play === i ? { cls: 'go', tag: t('kader.play') } : play !== null ? { cls: 'toss', tag: t('kader.toss') } : { cls: '' }} />
    </div>
  );
}

function Decree({ a }: { a: Extract<Ask, { type: 'decree' }> }) {
  const { g, act } = useGame();
  const [pick, setPick] = useState<PID | null>(null);
  const ids = [g.ministers.first!, g.ministers.second!];
  return (
    <div className="split decree">
      <div className="col">
        <img src="/art/stills/tugra-suleyman.svg" alt="" className="tugra" />
        <p className="h-step">{t('step.decree')}</p>
        <p className="h-mid">{t(a.delta > 0 ? 'ask.decreeGive' : 'ask.decreeTake')}</p>
        <p className="vo small">{t(a.delta > 0 ? 'ask.decreeGiveWhy' : 'ask.decreeTakeWhy')}</p>
        <div className="bt left"><Btn pri off={pick === null} onClick={() => act({ t: 'answer', ask: a.id, value: pick })}>{t('btn.decree')}</Btn></div>
      </div>
      <div className="pair">
        {ids.map((id, i) => {
          const p = g.players[id];
          return (
            <button type="button" key={id} className={`st vk big ${pick === id ? 'pick' : ''}`} style={{ ['--nw' as string]: '150px', ['--nh' as string]: '182px' }} onClick={() => { sfx('tap'); setPick(id); }}>
              <div className="nc"><Figure character={p.character} nw={150} brk={12} /><span className="of">{t(i === 0 ? 'min1' : 'min2')}</span>
                {pick === id && <span className="delta"><Star n={1} size={40} label={a.delta > 0 ? '+1' : '−1'} /></span>}</div>
              <div className="pl"><b>{p.name}</b><i>{t('nameInfluence', { char: charName(p.character), n: p.influence })}</i></div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
const charName = (id: string) => characterById[id].name;

function Venedik({ a }: { a: Extract<Ask, { type: 'venedik' }> }) {
  const { act } = useGame();
  const [pick, setPick] = useState<number | null>(null);
  return (
    <div className="split kader">
      <div className="col">
        <p className="h-step">{t('power.venedikPostasi')}</p>
        <p className="h-mid">{t('ask.venedik')}</p>
        <p className="vo small">{t('ask.venedikHow')}</p>
        <div className="bt left">
          <Btn onClick={() => act({ t: 'answer', ask: a.id, value: null })}>{t('btn.leaveAsIs')}</Btn>
          <Btn pri off={pick === null} onClick={() => act({ t: 'answer', ask: a.id, value: pick })}>{t('btn.toBottom')}</Btn>
        </div>
      </div>
      <KaderCards cards={a.cards} onTap={i => setPick(pick === i ? null : i)} marks={i => pick === i ? { cls: 'toss', tag: t('kader.bottom') } : { cls: '', tag: t('kader.nth', { n: i + 1 }) }} />
    </div>
  );
}

// ---------- public moments

/** Shows each new Crisis and each flipped wave once, then gets out of the way. */
export function Moments() {
  const { g } = useGame();
  const [seen, setSeen] = useState<{ crisis: number; wave: number }>(() => ({ crisis: g.crisisNo, wave: g.court?.reveals.length ?? 0 }));
  const [show, setShow] = useState<null | { t: 'crisis' } | { t: 'wave'; i: number }>(null);
  useEffect(() => {
    if (g.crisis && g.crisisNo !== seen.crisis) {
      setSeen(s => ({ ...s, crisis: g.crisisNo, wave: 0 }));
      setShow({ t: 'crisis' });
      sfx('flip');
      return;
    }
    const n = g.court?.reveals.length ?? 0;
    if (n > seen.wave && g.court) {
      setSeen(s => ({ ...s, wave: n }));
      setShow({ t: 'wave', i: n - 1 });
      sfx('reveal');
    }
  }, [g.crisisNo, g.crisis, g.court?.reveals.length]);
  useEffect(() => {
    if (!show) return;
    const ms = show.t === 'crisis' ? 4500 : 7000;
    const id = setTimeout(() => setShow(null), ms);
    return () => clearTimeout(id);
  }, [show]);
  return (
    <AnimatePresence>
      {show?.t === 'crisis' && g.crisis && <CrisisFlip key="c" onClose={() => setShow(null)} />}
      {show?.t === 'wave' && g.court?.reveals[show.i] && <WaveReveal key={'w' + show.i} reveal={g.court.reveals[show.i]} wave={show.i + 1} onClose={() => setShow(null)} />}
    </AnimatePresence>
  );
}

function CrisisFlip({ onClose }: { onClose: () => void }) {
  const { g } = useGame();
  const c = crisisById[g.crisis!];
  const drew = g.log.filter(e => e.c === g.crisisNo && e.k === 'draw').map(e => e.p!.who as PID);
  return (
    <motion.div className="full zp moment" {...fade} onClick={onClose}>
      <div className="bd split">
        <motion.div initial={{ rotateY: 180, scale: 0.8 }} animate={{ rotateY: 0, scale: 1 }} transition={{ duration: 0.7 }}>
          <Card spec={spec({ t: 'crisis', id: c.id })} width={222} />
        </motion.div>
        <div className="col">
          <p className="h-step">{t('crisisN', { n: g.crisisNo })}</p>
          <p className="h-big">{c.name}</p>
          <div className="rule" />
          <p className="vo big"><Em k={c.field} s={26} /><span>{t(`fieldRule.${c.field}`)}</span></p>
          <p className="vo big">{c.text}</p>
          {drew.length > 0 && <div className="nm-row">{drew.map((id, i) => <span key={i} className="pill"><Head character={g.players[id].character} />{t('plusCard', { name: name(g, id) })}</span>)}</div>}
          <p className="wait">{t('tapToClose')}</p>
        </div>
      </div>
    </motion.div>
  );
}

function WaveReveal({ reveal, wave, onClose }: { reveal: RevealedPlay[]; wave: number; onClose: () => void }) {
  const { g } = useGame();
  const w = reveal.length > 5 ? 92 : 104;
  return (
    <motion.div className="full zp moment" {...fade} onClick={onClose}>
      <div className="bd">
        <Stp label={t('waveFlipped', { n: wave })} />
        <div className="reveal-row">
          {reveal.map((r, i) => (
            <motion.div key={i} className={`rv ${r.outcome !== 'ok' ? 'void' : ''}`} style={{ width: w + 20 }}
              initial={{ rotateY: 180, y: 30, opacity: 0 }} animate={{ rotateY: 0, y: 0, opacity: 1 }} transition={{ delay: 0.15 + i * 0.18, duration: 0.5 }}>
              <Card spec={spec({ t: 'intr', kind: r.as, field: r.field })} width={w} />
              <span className="tg">{t('onPlayer', { name: name(g, r.target) })}</span>
              <span className={`tg ${r.outcome !== 'ok' ? 'void' : ''}`}>{outcomeText(r)}</span>
            </motion.div>
          ))}
        </div>
        <p className="vo">{t('revealNote', { n: reveal.length })}</p>
        <p className="wait">{t('tapToClose')}</p>
      </div>
    </motion.div>
  );
}
function outcomeText(r: RevealedPlay): string {
  if (r.outcome === 'ok') {
    if (r.note === 'tabib') return t('outcome.tabib');
    if (r.recast) return t('outcome.recast', { card: intrigueById[r.card.kind].name });
    return ['muhur', 'akil-hocasi', 'saray-tabibi'].includes(r.as) ? t('outcome.lasting') : t('outcome.ok');
  }
  return t(`outcome.${r.note ?? r.outcome}`);
}

export function ResultScreen() {
  const { g, seat } = useGame();
  // the result stays up a few seconds after Süleyman moves on, so nobody misses it
  const [linger, setLinger] = useState<number | null>(null);
  const [closed, setClosed] = useState<number | null>(null);
  useEffect(() => {
    if (g.step === 'result') { setLinger(g.crisisNo); return; }
    if (linger === null) return;
    const id = setTimeout(() => setLinger(null), 5000);
    return () => clearTimeout(id);
  }, [g.step, g.crisisNo]);
  const live = g.step === 'result' || (linger === g.crisisNo && closed !== g.crisisNo);
  if (!live || !g.kader?.played) return null;
  const card = g.kader.played;
  const power = card === 'x' ? RULES.treasonPowers[String(g.tracks.treason)] : null;
  const myAsk = g.asks.find(a => a.to === seat);
  return (
    <motion.div className="full zp moment result" {...fade} onClick={() => g.step !== 'result' && setClosed(g.crisisNo)}>
      <div className="bd split">
        <motion.div initial={{ rotateY: 180, y: -30 }} animate={{ rotateY: 0, y: 0 }} transition={{ duration: 0.7 }}>
          <Card spec={spec({ t: 'kader', k: card })} width={200} />
        </motion.div>
        <div className="col">
          <p className="h-step">{t('resultN', { n: g.crisisNo })}</p>
          <p className={`h-big ${card === 'x' ? 'al' : 'mal'}`}>{MISC.kader[card].name}</p>
          <p className="vo small">{t('resultWho', { first: name(g, g.kader.first), second: name(g, g.kader.second) })}</p>
          <div className="bigtrk">
            <div className="row h"><span>{t('hizmet')}</span><Slots n={RULES.tracks.loyalty} on={g.tracks.loyalty} fresh={card === 'h' ? g.tracks.loyalty - 1 : undefined} /><small>{g.tracks.loyalty}/{RULES.tracks.loyalty}</small></div>
            <div className="row x"><span>{t('hiyanet')}</span><Slots n={RULES.tracks.treason} on={g.tracks.treason} fresh={card === 'x' ? g.tracks.treason - 1 : undefined} end /><small>{g.tracks.treason}/{RULES.tracks.treason}</small></div>
          </div>
          {power && <><div className="rule" /><p className="vo small plain"><b>{MISC.treason[power as 'sorusturma'].name}.</b> {MISC.treason[power as 'sorusturma'].text}</p></>}
          {myAsk ? <div className="inline-prompt"><Prompt /></div> : <p className="wait">{t('wait.for', { names: [...new Set(g.asks.map(a => name(g, a.to)))].join(', ') })}</p>}
        </div>
      </div>
    </motion.div>
  );
}

export function GameOver() {
  const { g, room } = useGame();
  const w = g.winner;
  if (!w) return null;
  const winners = w.overall.map(id => name(g, id)).join(', ');
  return (
    <motion.div className="full zp end" {...fade}>
      <div className="bd">
        <div className="end-head">
          <p className="h-step">{t('gameOverN', { n: g.crisisNo })}</p>
          <p className={`h-big ${w.side === 'traitor' ? 'al' : 'mal'}`}>{t(w.side === 'traitor' ? 'traitorsWin' : 'loyalistsWin')}</p>
          <p className="vo big">{t(w.reason === 'treason' ? 'endTreason' : 'endLoyalty')}</p>
        </div>
        <div className="end-tracks">
          <div className="trk h"><Em k="hizmet" s={20} /><span>{t('hizmet')}</span><Slots n={RULES.tracks.loyalty} on={g.tracks.loyalty} /></div>
          <div className="trk x"><Em k="hiyanet" s={20} /><span>{t('hiyanet')}</span><Slots n={RULES.tracks.treason} on={g.tracks.treason} end /></div>
        </div>
        <Court top={118} compact />
        <div className="end-sides">
          {g.players.filter(p => !p.sultan).map(p => (
            <span key={p.id} className={`pill plain side ${p.side}`}>{p.name}: {t(p.side!)}{w.overall.includes(p.id) ? ' ★' : ''}</span>
          ))}
        </div>
        <div className="end-foot">
          <p className="vo plain"><b>{t('overallWinner', { names: winners })}</b> {t('overallWhy')}</p>
          {room.host && <Btn pri onClick={() => send({ t: 'lobbyAgain' })}>{t('btn.newGame')}</Btn>}
        </div>
      </div>
    </motion.div>
  );
}
