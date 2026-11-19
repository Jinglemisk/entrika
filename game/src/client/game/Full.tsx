// Full-screen views: private asks on lacquer (choose a Kul, the Kader cards, Venedik Postası, the Decree) and
// the end of the game on paper. Public moments (Crisis, wave, result) live in the court area: see Moments.
import { useState } from 'react';
import { motion } from 'motion/react';
import { RULES, characterById, companionById, type Ask, type Kader, type PID } from '../../engine/index.ts';
import { send } from '../net.ts';
import { Card } from '../cards/Card.tsx';
import { spec } from '../cardSpecs.ts';
import { Em, Star } from '../ui/marks.tsx';
import { Figure, Head } from '../ui/Figure.tsx';
import { t } from '../strings.ts';
import { sfx } from '../sound.ts';
import { Btn, Stp, playerName as name } from './Prompt.tsx';
import { Court } from './Court.tsx';
import { Slots } from './Mizan.tsx';
import { useGame } from './ctx.ts';

const fade = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.25 } };

// ---------- private asks

export const FULL_ASKS: Ask['type'][] = ['companion', 'kaderFirst', 'kaderSecond', 'decree', 'venedik'];

export function FullAsk() {
  const { asks } = useGame();
  const a = asks.find(x => FULL_ASKS.includes(x.type));
  if (!a) return null;
  return (
    <motion.div className={`full ${a.type === 'decree' ? 'zp' : 'zl'}`} key={a.id} {...fade}>
      <div className="bd">
        {a.type === 'companion' && <Companion a={a} />}
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

function KaderCards({ cards, marks, onTap }: { cards: Kader[]; marks: (i: number) => { cls: string; tag?: string }; onTap: (i: number) => void }) {
  const w = cards.length > 3 ? 112 : 140;
  return (
    <div className="kd">
      {cards.map((k, i) => {
        const m = marks(i);
        return (
          <motion.button type="button" key={i} className={`k ${m.cls}`} onClick={() => onTap(i)}
            initial={{ y: -40, opacity: 0, rotateY: 90 }} animate={{ y: m.cls === 'toss' ? 26 : 0, opacity: 1, rotateY: 0 }} transition={{ delay: i * 0.12 }}>
            <Card spec={spec({ t: 'kader', k })} width={w} whole />
            {m.tag && <span className={`kt ${m.cls === 'toss' ? 'out' : m.cls === 'go' ? 'go' : ''}`}>{m.tag}</span>}
          </motion.button>
        );
      })}
    </div>
  );
}

function KaderFirst({ a }: { a: Extract<Ask, { type: 'kaderFirst' }> }) {
  const { g, act } = useGame();
  const [toss, setToss] = useState<number[]>([]);
  const tap = (i: number) => {
    sfx('tap');
    if (toss.includes(i)) return setToss(toss.filter(j => j !== i));
    setToss(toss.length >= a.discard ? [...toss.slice(1), i] : [...toss, i]);
  };
  return (
    <div className="split kader">
      <div className="col">
        <Stp label={t('step.kader')} />
        <p className="h-mid">{t('ask.kaderFirst', { n: a.discard, second: name(g, g.kader!.second) })}</p>
        {a.cards.length > 3 && <p className="vo small">{t('kader.defterdar')}</p>}
        <p className="vo small dim">{t('ask.kaderSilence')}</p>
        <div className="bt left"><Btn pri off={toss.length !== a.discard} onClick={() => act({ t: 'answer', ask: a.id, value: toss })}>{t('btn.passKader', { name: name(g, g.kader!.second) })}</Btn></div>
      </div>
      <KaderCards cards={a.cards} onTap={tap} marks={i => toss.includes(i) ? { cls: 'toss', tag: t('kader.toss') } : { cls: 'go', tag: t('kader.go') }} />
    </div>
  );
}

function KaderSecond({ a }: { a: Extract<Ask, { type: 'kaderSecond' }> }) {
  const { g, act } = useGame();
  const [play, setPlay] = useState<number | null>(null);
  return (
    <div className="split kader">
      <div className="col">
        <Stp label={t('step.kader')} />
        <p className="h-mid">{t('ask.kaderSecond', { first: name(g, g.kader!.first) })}</p>
        <p className="vo small dim">{t('ask.kaderSilence')}</p>
        <div className="bt left"><Btn pri off={play === null} onClick={() => act({ t: 'answer', ask: a.id, value: play })}>{t('btn.playKader')}</Btn></div>
      </div>
      <KaderCards cards={a.cards} onTap={i => { sfx('tap'); setPlay(i); }}
        marks={i => play === i ? { cls: 'go', tag: t('kader.play') } : play !== null ? { cls: 'toss', tag: t('kader.toss') } : { cls: '' }} />
    </div>
  );
}

function Decree({ a }: { a: Extract<Ask, { type: 'decree' }> }) {
  const { g, act } = useGame();
  const [pick, setPick] = useState<PID | null>(null);
  const ids = [g.ministers.first!, g.ministers.second!];
  const size = (id: PID) => (g.court?.nazar.includes(id) ? 2 : 1);
  const nazar = ids.filter(id => size(id) > 1);
  return (
    <div className="split decree">
      <div className="col">
        {a.to === g.sultan
          ? <img src="/art/stills/tugra-suleyman.svg" alt="" className="tugra" />
          : <p className="vo fisilti"><Head character={g.players[a.to].character} />{t('ask.decreeFisilti')}</p>}
        <p className="h-step">{t('step.decree')}</p>
        <p className="h-mid">{t(a.delta > 0 ? 'ask.decreeGive' : 'ask.decreeTake')}</p>
        <p className="vo small">{t(a.delta > 0 ? 'ask.decreeGiveWhy' : 'ask.decreeTakeWhy')}
          {nazar.map(id => <span key={id}> {t('ask.decreeNazar', { name: g.players[id].name })}</span>)}</p>
        <div className="bt left"><Btn pri off={pick === null} onClick={() => act({ t: 'answer', ask: a.id, value: pick })}>{t('btn.decree')}</Btn></div>
      </div>
      <div className="pair">
        {ids.map((id, i) => {
          const p = g.players[id];
          return (
            <button type="button" key={id} className={`st vk big ${pick === id ? 'pick' : ''}`} style={{ ['--nw' as string]: '150px', ['--nh' as string]: '182px' }} onClick={() => { sfx('tap'); setPick(id); }}>
              <div className="nc"><Figure character={p.character} nw={150} nh={182} brk={12} /><span className="of">{t(i === 0 ? 'min1' : 'min2')}</span>
                {pick === id && <span className="delta"><Star n={1} size={40} label={`${a.delta > 0 ? '+' : '−'}${size(id)}`} /></span>}</div>
              <div className="pl"><b>{charName(p.character)}</b><i>{t('nameInfluence', { char: p.name, n: p.influence })}</i></div>
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
