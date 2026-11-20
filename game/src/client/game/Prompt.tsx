// The one prompt block, bottom right: the step, one sentence, at most a few buttons. It renders whatever the game is
// waiting for from you, and when nothing is, who it is waiting for. Cards are read and acted on in the card pop-up;
// the prompt confirms.
import { useEffect, useState, type ReactNode } from 'react';
import {
  RULES, clockwise, companionById, eligibleList, legalTargets, canRecast, readyPowerOf,
  type Ask, type Game, type PID, type Seat,
} from '../../engine/index.ts';
import { actAs } from '../net.ts';
import { Em, Gl } from '../ui/marks.tsx';
import { Head, KulHead } from '../ui/Figure.tsx';
import { Refs } from '../ui/Refs.tsx';
import { t } from '../strings.ts';
import { cardWords, isPower, kulWords, powerName } from '../words.ts';
import { sfx } from '../sound.ts';
import { shownWait, shownWaiting, useGame, useSecondsLeft } from './ctx.ts';

const STEPS = ['crisis', 'appoint', 'court', 'kader', 'result', 'decree'] as const;
const stepIndex = (s: string) => (s === 'objections' ? 1 : s === 'setup' ? 0 : Math.max(0, STEPS.indexOf(s as never)));

export function Stp({ label, ask }: { label?: string; ask?: number }) {
  const { g, room, asks } = useGame();
  const i = stepIndex(g.step);
  const left = useSecondsLeft(room, ask ?? asks[0]?.id);
  return (
    <div className="stp">
      <span className="tk">{STEPS.map((_, j) => <i key={j} className={j < i ? 'done' : j === i ? 'now' : ''} />)}</span>
      {label ?? t(`step.${STEPS[i]}`)}
      {left !== null && <span className={`clock ${left <= 5 ? 'low' : ''}`}><Gl k="clock" />{left}</span>}
    </div>
  );
}

/** A button. `via` marks an option you have only through a power: the power's face and name ride on the button. */
export function Btn({ children, pri, off, via, onClick }: {
  children: ReactNode; pri?: boolean; off?: boolean; via?: { icon: ReactNode; label: string }; onClick?: () => void;
}) {
  return (
    <button type="button" className={`b ${pri ? 'pri' : ''} ${off ? 'off' : ''} ${via ? 'via' : ''}`} disabled={off}
      onClick={() => { if (!off) { sfx(pri ? 'press' : 'tap'); onClick?.(); } }}>
      {via && <span className="via-ic">{via.icon}</span>}
      {via ? <span className="via-tx"><span>{children}</span><small>{via.label}</small></span> : children}
    </button>
  );
}
export const viaChar = (character: string, power: string) => ({ icon: <Head character={character} />, label: power });
export const viaKul = (id: string) => ({ icon: <KulHead id={id} />, label: kulWords(id).name });

const name = (g: { players: { name: string }[] }, id: PID | null | undefined) => (id === null || id === undefined ? '' : g.players[id].name);

export function Prompt() {
  const { asks, freePick } = useGame();
  const a = asks[0];
  return <div className="pr">{freePick ? <FreePickView /> : a ? <AskView key={a.id} a={a} /> : <Waiting />}</div>;
}

/** A free power (Sürgün, Sezgi, Faiz, Ganimet) waiting for its target: tap a seat (Sezgi: two), or call it off. */
function FreePickView() {
  const { freePick, setFreePick } = useGame();
  const two = freePick!.n === 2;
  return (
    <>
      <Stp />
      <p className="vo"><b className="ref">{powerName(freePick!.power)}</b>. {t(two ? 'free.pickTwo' : 'free.pick')}
        <small>{t('tapSeat')}{two ? ` ${freePick!.chosen.length}/2` : ''}</small></p>
      <div className="bt"><Btn onClick={() => setFreePick(null)}>{t('btn.cancel')}</Btn></div>
    </>
  );
}

function AskView({ a }: { a: Ask }) {
  const { g } = useGame();
  const hidden = g.players.filter(p => !p.sultan).map(p => p.id);
  switch (a.type) {
    case 'discard': return <Discard a={a} />;
    case 'keepOne': return <KeepOne a={a} />;
    case 'window': return <Window a={a} />;
    case 'tie': return <PickSeat a={a} legal={a.candidates} text={t('ask.tie')} />;
    case 'appoint': return <Appoint a={a} />;
    case 'kulis': return <Kulis a={a} />;
    case 'object': return <Objection a={a} />;
    case 'replace': return <Replace a={a} />;
    case 'wave': return <Wave a={a} />;
    case 'redirect': return <Redirect a={a} />;
    case 'ferman': return <Ferman a={a} />;
    case 'investigator': return <PickSeat a={a} legal={hidden} text={t('ask.investigator')} />;
    case 'investigate': return <PickSeat a={a} legal={hidden.filter(id => id !== a.to)} text={t('ask.investigate')} />;
    case 'hazineName': return <PickSeat a={a} legal={hidden} text={t('ask.hazineName')} />;
    case 'next': return <Next a={a} />;
    case 'ack': return <Ack a={a} />;
    default: return <FullScreenHint />;  // companion, cephe, kader, decree, venedik have their own full-screen views
  }
}

// ---------- waiting

function Waiting() {
  const { g, seat } = useGame();
  const waitingFor = shownWaiting(g).filter(id => id !== seat);
  if (g.asks.some(a => a.type === 'ack')) return <AckWait />;
  if (g.step === 'court' && g.sub === 'wave' && g.court) {
    // nothing per seat while a wave is open: who is done, or passed at once for want of a card, stays hidden
    const mine = g.court.submitted[seat];
    const sealed = Array.isArray(mine) && mine.length > 0 ? mine : null;
    return (
      <>
        <Stp label={t('waveN', { n: g.court.wave })} ask={g.asks.find(a => a.type === 'wave')?.id} />
        {sealed ? (
          <div className="vo">{t('wait.sealedOn')}<PlayList plays={sealed.map(p => ({ as: p.recastAs ?? kindOf(g, seat, p.uid), target: p.target }))} /></div>
        ) : <p className="vo">{g.players[seat].sultan ? t('wait.sultanCourt') : t(g.court.silenced.includes(seat) ? 'wait.silenced' : 'wait.passed')}</p>}
        <div className="wait">{t('wait.wave')}</div>
        {sealed && <Retract />}
      </>
    );
  }
  const open = g.asks.find(a => a.to !== seat && shownWait(a) && a.type !== 'ack');
  let text = t('wait.generic');
  if (g.step === 'kader') text = t('wait.kader');
  else if (g.kulis && g.step === 'appoint') text = t('wait.kulis', { a: name(g, g.players.find(p => p.character === 'rustem')?.id), b: name(g, g.sultan) });
  else if (g.step === 'decree') text = t('wait.decree', { name: name(g, g.decree?.chooser) });
  else if (g.step === 'objections' && g.sub === 'done') text = t('wait.toCourt', { name: name(g, g.sultan) });
  else if (g.step === 'objections' && g.sub === 'turn') {
    const now = g.asks.find(a => a.type === 'object')?.to;
    const order = clockwise(g).map(p => p.id);
    const next = now !== undefined ? order[order.indexOf(now) + 1] : undefined;
    text = t(next !== undefined ? 'wait.objectionNext' : 'wait.objectionLast', { now: name(g, now), next: name(g, next) });
  }
  // every timed decision a player is known to be weighing reads the same way
  if (open?.type === 'window') text = t('wait.window', { name: name(g, open.to), power: windowName(open.power) });
  else if (open?.type === 'ferman') text = t('wait.window', { name: name(g, open.to), power: powerName('ferman') });
  else if (open?.type === 'redirect') text = t('wait.window', { name: name(g, open.to), power: powerName('yonDegistir') });
  else if (g.asks.some(a => a.type === 'replace' && a.reason === 'valide' && a.to !== seat)) text = t('wait.valide');
  return (
    <>
      <Stp ask={open?.id} />
      <p className="vo">{text}</p>
      {waitingFor.length > 0 && <div className="wait">{t('wait.for', { names: waitingFor.map(id => name(g, id)).join(', ') })}</div>}
    </>
  );
}
const kindOf = (g: Game, seat: PID, uid: number) => g.players[seat].hand.find(c => c.uid === uid)?.kind ?? '';

/** Cards and who they go to: a card icon, the card's name, an arrow, the target's head and name. */
function PlayList({ plays }: { plays: { as: string; target: PID }[] }) {
  const { g } = useGame();
  return (
    <span className="plays">
      {plays.map((p, i) => (
        <span key={i} className="pl-row">
          <Em k="intrigue" s={15} /><b>{cardWords(p.as).name}</b><Gl k="next" />
          <Head character={g.players[p.target].character} />{g.players[p.target].name}
        </span>
      ))}
    </span>
  );
}

function Retract() {
  const { act } = useGame();
  return <div className="bt"><Btn onClick={() => act({ t: 'retract' })}>{t('btn.retract')}</Btn></div>;
}

function FullScreenHint() {
  return <><Stp /><p className="vo">{t('wait.yourScreen')}</p></>;
}

// ---------- Devam: everyone confirms a public moment

/** Heads of everyone, ticked once they pressed Devam. */
function AckHeads() {
  const { g, room, seat, setSeat } = useGame();
  // a player deciding a hidden window looks exactly like one who hasn't pressed Devam yet
  const pending = new Set(g.asks.filter(a => a.type === 'ack' || !shownWait(a)).map(a => a.to));
  return (
    <span className="ackheads">
      {g.players.map(p => (
        // DEV: in test rooms the heads switch seats, as the seat toggles do while the court is covered
        <span key={p.id} className={[pending.has(p.id) ? '' : 'done', room.dev && p.id === seat && 'me'].filter(Boolean).join(' ')} title={p.name}
          onClick={room.dev ? () => setSeat(p.id) : undefined}>
          <Head character={p.character} />{!pending.has(p.id) && <Gl k="check" />}
        </span>
      ))}
    </span>
  );
}

function Ack({ a }: { a: Extract<Ask, { type: 'ack' }> }) {
  const { g, room } = useGame();
  // one press answers for every seat on this device (test rooms hold them all)
  const press = () => {
    for (const x of g.asks) if (x.type === 'ack' && room.mine.includes(x.to)) actAs(x.to, { t: 'answer', ask: x.id });
  };
  return (
    <>
      <Stp />
      <p className="vo">{a.what === 'wave' && g.court ? t('ack.waveN', { n: g.court.wave, k: g.court.reveals[g.court.reveals.length - 1]?.length ?? 0 }) : t(`ack.${a.what}`)}</p>
      <AckHeads />
      <div className="bt"><Btn pri onClick={press}>{t('btn.continue')}<Gl k="next" /></Btn></div>
    </>
  );
}

function AckWait() {
  return <><Stp /><p className="vo">{t('ack.waiting')}</p><AckHeads /></>;
}

// ---------- shared: pick one seat on the court

function PickSeat({ a, legal, text }: { a: Ask; legal: PID[]; text: string }) {
  const { act, setPicker } = useGame();
  useEffect(() => {
    setPicker({ legal, onPick: id => { setPicker(null); act({ t: 'answer', ask: a.id, value: id }); } });
    return () => setPicker(null);
  }, [a.id]);
  return <><Stp /><p className="vo">{text}<small>{t('tapSeat')}</small></p></>;
}

// ---------- hand-limit discards and Yakıp Yıkma: pick in the card pop-up, confirm here

function Discard({ a }: { a: Extract<Ask, { type: 'discard' }> }) {
  const { hand, act, me } = useGame();
  const ready = hand.sel.length === a.n;
  return (
    <>
      <Stp />
      <p className="vo">{t('ask.discard', { n: a.n, limit: me.hand.length - a.n })}<small>{t('ask.discardHow')}</small></p>
      <div className="bt"><Btn pri off={!ready} onClick={() => { act({ t: 'answer', ask: a.id, value: hand.sel }); hand.setSel([]); }}>{t('btn.discard', { n: hand.sel.length, total: a.n })}</Btn></div>
    </>
  );
}

function KeepOne({ a }: { a: Ask }) {
  const { hand, act, me } = useGame();
  const kept = me.hand.find(c => c.uid === hand.sel[0]);
  return (
    <>
      <Stp />
      <p className="vo">{t('ask.keepOne')}<small>{kept ? t('ask.keeping', { card: cardWords(kept.kind).name }) : t('ask.keepHow')}</small></p>
      <div className="bt"><Btn pri off={!kept} onClick={() => { act({ t: 'answer', ask: a.id, value: hand.sel[0] }); hand.setSel([]); }}>{t('btn.keep')}</Btn></div>
    </>
  );
}

// ---------- optional timed powers: use or skip

/** The face and name a timed power rides under: its Character. Nöbet is a card's look, so it rides under nothing. */
function powerVia(g: Game, a: Extract<Ask, { type: 'window' }>) {
  if (a.power === 'nobet') return undefined;
  const p = g.players[a.to];
  return viaChar(p.character, windowName(a.power));
}
/** A power window's name: a Character power, or Nöbet's card. */
const windowName = (power: string) => (isPower(power) ? powerName(power) : cardWords(power).name);

/** Powers that pick a seat on the court once used, and what the pick answers. */
function seatPick(g: Game, a: Extract<Ask, { type: 'window' }>): { legal: PID[]; value: (id: PID) => unknown } | null {
  switch (a.power) {
    case 'feragat': {
      const seat: Seat = g.ministers.first === a.to ? 'first' : 'second';
      return { legal: eligibleList(g, seat).filter(id => id !== a.to), value: id => ({ target: id }) };
    }
    case 'himaye': return { legal: g.players.filter(p => !p.sultan).map(p => p.id), value: id => ({ target: id }) };
    case 'veliaht': {
      const seats = (['first', 'second'] as Seat[]).filter(s => eligibleList(g, s).includes(a.to));
      return { legal: seats.map(s => g.ministers[s]!), value: id => ({ seat: g.ministers.first === id ? 'first' : 'second' }) };
    }
    default: return null;
  }
}
const FIELDS = ['divan', 'harem', 'saray'] as const;

function Window({ a }: { a: Extract<Ask, { type: 'window' }> }) {
  const { g, act, setPicker } = useGame();
  const [picking, setPicking] = useState(false);
  const answer = (v: unknown) => act({ t: 'answer', ask: a.id, value: v });
  useEffect(() => () => setPicker(null), []);
  const pick = seatPick(g, a);
  const choices = a.power === 'cephe' || a.power === 'nobet';   // a field, or one of the cards played on the watched player
  const useIt = () => {
    if (pick) setPicker({ legal: pick.legal, onPick: id => { setPicker(null); answer(pick.value(id)); } });
    if (pick || choices) return setPicking(true);
    answer(true);
  };
  const nobet = a.power === 'nobet' ? (a.ctx as { plays: number[] }).plays : [];
  return (
    <>
      <Stp />
      <p className="vo"><b className="ref">{windowName(a.power)}</b>. {picking
        ? t(pick ? 'tapSeat' : a.power === 'cephe' ? 'pickField' : 'pickCard')   // the choices need the room on a phone
        : <Refs text={t(`window.${a.power}`, ctxVars(g, a))} />}</p>
      {picking && a.power === 'cephe' && (
        <div className="opts">{FIELDS.map(f => <button type="button" key={f} className="chip" onClick={() => answer(f)}><Em k={f} s={14} />{t(f)}</button>)}</div>
      )}
      {picking && a.power === 'nobet' && (
        <div className="opts">{nobet.map(i => {
          const h = g.court!.history[i];
          return <button type="button" key={i} className="chip" onClick={() => answer(i)}><Em k={h.field} s={14} />{cardWords(h.as).name}<small>&nbsp;· {t('waveShort', { n: h.wave })}</small></button>;
        })}</div>
      )}
      <div className="bt">
        <Btn onClick={() => { setPicker(null); answer(false); }}>{t('btn.skip')}</Btn>
        {!picking && <Btn pri via={powerVia(g, a)} onClick={useIt}>{t('btn.use')}</Btn>}
      </div>
    </>
  );
}
function ctxVars(g: Game, a: Extract<Ask, { type: 'window' }>) {
  const c = (a.ctx ?? {}) as { target?: PID; of?: PID; on?: PID; delta?: number };
  return { target: name(g, c.target), of: name(g, c.of), on: name(g, c.on), dir: c.delta && c.delta > 0 ? t('gives') : t('takes') };
}

// ---------- the two Vekil seats: Atama, a replacement, the Ferman

type SlotState = { id: PID | null; lock?: boolean; gone?: PID | null };
/** The two Minister seats as slots. A locked slot stays as it is; an empty one waits for a tap on the court. */
function SeatSlots({ first, second, onTap }: { first: SlotState; second: SlotState; onTap?: (s: Seat) => void }) {
  const { g } = useGame();
  const slot = (s: Seat, v: SlotState) => (
    <button type="button" key={s} className={`slot ${v.id !== null ? 'on' : 'empty'} ${v.lock ? 'lock' : ''}`} disabled={v.lock || !onTap} onClick={() => onTap?.(s)}>
      <i className="rn">{s === 'first' ? 'I' : 'II'}</i>
      <div>
        <small>{t(s === 'first' ? 'min1' : 'min2')}</small>
        <b>{v.id !== null ? <><Head character={g.players[v.id].character} />{name(g, v.id)}</> : t('tapSeatShort')}</b>
        <span>{v.lock ? t('slot.stays') : v.gone != null ? t('slot.gone', { name: name(g, v.gone) }) : t(s === 'first' ? 'min1Does' : 'min2Does')}</span>
      </div>
      {v.lock && <Gl k="lock" />}
    </button>
  );
  return <div className="slots">{slot('first', first)}{slot('second', second)}</div>;
}

function Appoint({ a }: { a: Ask }) {
  const { g, act, setPicker } = useGame();
  const [first, setFirst] = useState<PID | null>(null);
  const [second, setSecond] = useState<PID | null>(null);
  const ok = g.players.filter(p => !p.sultan && g.surgun.now !== p.id).map(p => p.id);
  useEffect(() => {
    setPicker({
      legal: ok.filter(id => id !== first && id !== second),
      chosen: [first, second].filter((x): x is PID => x !== null),
      onPick: id => {
        sfx('place');
        if (first === null) setFirst(id);
        else if (second === null) setSecond(id);
      },
    });
  }, [first, second]);
  useEffect(() => () => setPicker(null), []);
  const sadrazam = a.to !== g.sultan;
  return (
    <>
      <Stp />
      <p className="vo">{t(sadrazam ? 'ask.appointSadrazam' : 'ask.appoint')}<small>{t('ask.appointHow')}</small></p>
      <SeatSlots first={{ id: first }} second={{ id: second }} onTap={s => (s === 'first' ? setFirst(null) : setSecond(null))} />
      <div className="bt">
        <Btn pri off={first === null || second === null} via={sadrazam ? viaChar('ibrahim', powerName('sadrazam')) : undefined}
          onClick={() => { setPicker(null); act({ t: 'answer', ask: a.id, value: { first, second } }); }}>
          {t('btn.appoint')} <small>{[first, second].filter(x => x !== null).length}/2</small>
        </Btn>
      </div>
    </>
  );
}

/** A Vekil lost the seat: the same two slots, the other Vekil locked, the empty seat filled by a tap. */
function Replace({ a }: { a: Extract<Ask, { type: 'replace' }> }) {
  const { g, act, setPicker } = useGame();
  const [pick, setPick] = useState<PID | null>(null);
  const legal = eligibleList(g, a.seat).filter(id => id !== a.removed && id !== a.not);
  useEffect(() => {
    setPicker({ legal: legal.filter(id => id !== pick), chosen: pick !== null ? [pick] : [], onPick: id => { sfx('place'); setPick(id); } });
  }, [pick]);
  useEffect(() => () => setPicker(null), []);
  const other: Seat = a.seat === 'first' ? 'second' : 'first';
  const open: SlotState = { id: pick, gone: a.removed };
  const kept: SlotState = { id: g.ministers[other], lock: true };
  const daye = a.not !== undefined;
  const via = a.reason === 'itiraz' ? viaChar('sahsultan', powerName('itiraz')) : daye ? viaKul('daye') : undefined;
  return (
    <>
      <Stp />
      <p className="vo">{t(`ask.replace.${daye ? 'daye' : a.reason}`, { removed: name(g, a.removed), seat: t(a.seat === 'first' ? 'min1' : 'min2') })}<small>{t('tapSeat')}</small></p>
      <SeatSlots first={a.seat === 'first' ? open : kept} second={a.seat === 'second' ? open : kept} onTap={() => setPick(null)} />
      <div className="bt"><Btn pri off={pick === null} via={via} onClick={() => { setPicker(null); act({ t: 'answer', ask: a.id, value: pick }); }}>{t('btn.seat')}</Btn></div>
    </>
  );
}

function Ferman({ a }: { a: Ask }) {
  const { g, act, setPicker } = useGame();
  const [on, setOn] = useState(false);
  const [seat, setSeat] = useState<Seat | null>(null);
  const [pick, setPick] = useState<PID | null>(null);
  const mins = [g.ministers.first!, g.ministers.second!];
  useEffect(() => {
    if (!on) return setPicker(null);
    if (!seat) return setPicker({ legal: mins, onPick: id => setSeat(g.ministers.first === id ? 'first' : 'second') });
    const legal = eligibleList(g, seat).filter(id => id !== g.ministers[seat] && id !== pick);
    setPicker({ legal, chosen: pick !== null ? [pick] : [], onPick: id => { sfx('place'); setPick(id); } });
  }, [on, seat, pick]);
  useEffect(() => () => setPicker(null), []);
  const slotOf = (s: Seat): SlotState => (seat === s ? { id: pick, gone: g.ministers[s] } : { id: g.ministers[s], lock: !!seat });
  const back = () => { setOn(false); setSeat(null); setPick(null); };
  return (
    <>
      <Stp />
      <p className="vo">{t(!on ? 'ask.ferman' : !seat ? 'ask.fermanWho' : 'ask.fermanNew')}{on && <small>{t('tapSeat')}</small>}</p>
      {on && <SeatSlots first={slotOf('first')} second={slotOf('second')} onTap={s => { if (!seat) setSeat(s); else setPick(null); }} />}
      <div className="bt">
        {!on ? <Btn onClick={() => act({ t: 'answer', ask: a.id, value: null })}>{t('btn.skip')}</Btn> : <Btn onClick={back}>{t('btn.back')}</Btn>}
        {!on && <Btn pri via={viaChar('suleyman', powerName('ferman'))} onClick={() => setOn(true)}>{t('btn.use')}</Btn>}
        {on && <Btn pri off={pick === null} onClick={() => { setPicker(null); act({ t: 'answer', ask: a.id, value: { seat, target: pick } }); }}>{t('btn.seat')}</Btn>}
      </div>
    </>
  );
}

function Kulis({ a }: { a: Ask }) {
  const { g, act } = useGame();
  const rustem = g.players.find(p => p.character === 'rustem');
  return (
    <>
      <Stp />
      <p className="vo">{t('ask.kulis', { name: name(g, rustem?.id) })}<small>{t('ask.kulisHow', { n: RULES.kulisSeconds })}</small></p>
      <div className="bt"><Btn pri onClick={() => act({ t: 'answer', ask: a.id })}>{t('btn.endKulis')}</Btn></div>
    </>
  );
}

// ---------- İtiraz

function Objection({ a }: { a: Ask }) {
  const { g, me, act, setPicker } = useGame();
  const [mode, setMode] = useState<null | 'paid' | 'free'>(null);
  const canFree = readyPowerOf(g, a.to, 'sahsultan', 'base');
  const cost = RULES.objectionCost;
  const seats = (['first', 'second'] as Seat[]).filter(s => g.ministers[s] !== a.to);   // never your own seat
  const affordable = (free: boolean) => seats.filter(() => free || me.influence >= cost).map(s => g.ministers[s]!);
  useEffect(() => {
    if (!mode) return setPicker(null);
    setPicker({
      legal: affordable(mode === 'free'),
      onPick: id => {
        setPicker(null);
        act({ t: 'answer', ask: a.id, value: { seat: g.ministers.first === id ? 'first' : 'second', free: mode === 'free' } });
      },
    });
  }, [mode]);
  useEffect(() => () => setPicker(null), []);
  const mine = g.ministers.first === a.to || g.ministers.second === a.to;
  return (
    <>
      <Stp label={t('step.objections')} />
      <p className="vo">{mode ? t('ask.objectPick') : t('ask.object')}
        {!mode && !canFree && <small>{t(mine ? 'ask.objectNotSelf' : 'ask.objectCost', { cost: cost })}</small>}{mode && <small>{t('tapSeat')}</small>}</p>
      <div className="bt">
        {mode ? <Btn onClick={() => setMode(null)}>{t('btn.back')}</Btn> : <Btn onClick={() => act({ t: 'answer', ask: a.id, value: null })}>{t('btn.pass')}</Btn>}
        {!mode && <Btn pri off={!affordable(false).length} onClick={() => setMode('paid')}>{t('btn.object')} <small>−{cost}<Em k="influence" s={14} /></small></Btn>}
        {!mode && canFree && <Btn via={viaChar('sahsultan', powerName('itiraz'))} onClick={() => setMode('free')}>{t('btn.objectFree')}</Btn>}
      </div>
    </>
  );
}

function Next({ a }: { a: Extract<Ask, { type: 'next' }> }) {
  const { act } = useGame();
  return (
    <>
      <Stp />
      <p className="vo">{t(`ask.next.${a.what}`)}</p>
      <div className="bt"><Btn pri onClick={() => act({ t: 'answer', ask: a.id })}>{t(`btn.next.${a.what}`)}</Btn></div>
    </>
  );
}

// ---------- Tertip: tap a card, choose how to play it in the pop-up, then tap a seat; stage, then seal

function Wave({ a }: { a: Ask }) {
  const { g, seat, me, act, hand, setPicker } = useGame();
  const { aim, staged } = hand;
  useEffect(() => {
    if (!aim) return setPicker(null);
    setPicker({
      legal: legalTargets(g, seat, aim.as),
      onPick: id => {
        sfx('place');
        hand.setStaged([...staged, { ...aim, target: id }]);
        hand.setAim(null);
      },
    });
  }, [aim, staged.length]);
  useEffect(() => () => setPicker(null), []);

  const submit = (plays: typeof staged) => {
    setPicker(null);
    act({ t: 'answer', ask: a.id, value: plays.map(p => ({ uid: p.uid, target: p.target, ...(p.recast ? { recastAs: p.as, field: p.field } : {}) })) });
  };
  const cifte = readyPowerOf(g, seat, 'hurrem', 'favor') && g.court?.cifte !== seat;
  const kul = canRecast(g, seat) && me.companion;
  return (
    <>
      <Stp label={t('waveN', { n: g.court?.wave ?? 1 })} />
      {aim ? (
        <p className="vo"><span className="clamp"><b>{cardWords(aim.as).name}</b>{aim.recast ? ` (${t('recastFrom', { card: cardWords(kindOf(g, seat, aim.uid)).name })})` : ''}</span>
          <small>{t('ask.waveTarget')}</small></p>
      ) : staged.length ? (
        <div className="vo">{t('ask.waveStaged')}<PlayList plays={staged} /></div>
      ) : (
        // a power's hint below takes the how-to's place: the prompt has room for one of them
        <p className="vo">{t('ask.wave')}{!(cifte || kul) && <small>{t('ask.waveHow')}</small>}</p>
      )}
      {!aim && !staged.length && (cifte || kul) && (
        <div className="opts">
          {cifte && <span className="vchip"><Head character="hurrem" /><span><Refs text={t('hint.cifte')} /></span></span>}
          {kul && <span className="vchip"><KulHead id={kul} /><span><Refs text={t('hint.recast', { name: kulWords(kul).name, card: cardWords(companionById[kul].recast).name })} /></span></span>}
        </div>
      )}
      <div className="bt">
        {aim ? <Btn onClick={() => hand.setAim(null)}>{t('btn.back')}</Btn>
          : staged.length ? <Btn onClick={() => hand.setStaged([])}>{t('btn.undo')}</Btn>
          : <Btn onClick={() => submit([])}>{t('btn.pass')}</Btn>}
        <Btn pri off={!staged.length || !!aim} onClick={() => submit(staged)}>{t('btn.seal')}{staged.length > 1 ? ` (${staged.length})` : ''}</Btn>
      </div>
    </>
  );
}

// ---------- Yön Değiştir

function Redirect({ a }: { a: Extract<Ask, { type: 'redirect' }> }) {
  const { g, act, setPicker } = useGame();
  const [pick, setPick] = useState<number | null>(null);
  const plays = g.court!.plays;
  useEffect(() => {
    if (pick === null) return setPicker(null);
    setPicker({
      legal: g.players.filter(p => !p.sultan && p.id !== a.to).map(p => p.id),
      onPick: id => { setPicker(null); act({ t: 'answer', ask: a.id, value: { play: pick, target: id } }); },
    });
  }, [pick]);
  useEffect(() => () => setPicker(null), []);
  return (
    <>
      <Stp />
      <p className="vo"><b>{powerName('yonDegistir')}.</b> {t('ask.redirect')}{pick !== null && <small>{t('tapSeat')}</small>}</p>
      <div className="opts">{a.plays.map(i => (
        <button type="button" key={i} className={`chip ${pick === i ? 'on' : ''}`} onClick={() => setPick(i)}><Em k="intrigue" s={14} />{cardWords(plays[i].as).name}</button>
      ))}</div>
      <div className="bt"><Btn onClick={() => { setPicker(null); act({ t: 'answer', ask: a.id, value: null }); }}>{t('btn.skip')}</Btn></div>
    </>
  );
}

export { name as playerName };
