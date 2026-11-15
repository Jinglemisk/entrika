// The one prompt block, bottom right: the step, one sentence, at most two buttons. It renders whatever the game is
// waiting for from you, and when nothing is, who it is waiting for.
import { useEffect, useMemo, useState } from 'react';
import {
  RULES, characterById, eligibleList, intrigueById, legalTargets, playableForms, waveAllowance, canRecast,
  type Ask, type Field, type PID, type Seat, type WavePlay,
} from '../../engine/index.ts';
import { t } from '../strings.ts';
import { sfx } from '../sound.ts';
import { useGame } from './ctx.ts';

const STEPS = ['crisis', 'appoint', 'court', 'kader', 'result', 'decree'] as const;
const stepIndex = (s: string) => (s === 'objections' ? 1 : s === 'setup' ? 0 : Math.max(0, STEPS.indexOf(s as never)));

export function Stp({ label }: { label?: string }) {
  const { g } = useGame();
  const i = stepIndex(g.step);
  return (
    <div className="stp">
      <span className="tk">{STEPS.map((_, j) => <i key={j} className={j < i ? 'done' : j === i ? 'now' : ''} />)}</span>
      {label ?? t(`step.${STEPS[i]}`)}
    </div>
  );
}

export function Btn({ children, pri, off, onClick }: { children: React.ReactNode; pri?: boolean; off?: boolean; onClick?: () => void }) {
  return (
    <button type="button" className={`b ${pri ? 'pri' : ''} ${off ? 'off' : ''}`} disabled={off} onClick={() => { if (!off) { sfx(pri ? 'press' : 'tap'); onClick?.(); } }}>
      {children}
    </button>
  );
}

const name = (g: { players: { name: string }[] }, id: PID | null | undefined) => (id === null || id === undefined ? '' : g.players[id].name);

export function Prompt() {
  const { asks } = useGame();
  const a = asks[0];
  return <div className="pr">{a ? <AskView key={a.id} a={a} /> : <Waiting />}</div>;
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
    default: return <FullScreenHint />;  // companion, cephe, kader, decree, venedik have their own full-screen views
  }
}

// ---------- waiting

function Waiting() {
  const { g, seat } = useGame();
  const waitingFor = [...new Set(g.asks.map(a => a.to))].filter(id => id !== seat);
  let text = t('wait.generic');
  if (g.step === 'court' && g.sub === 'wave' && g.court) {
    const total = g.players.length - 1;
    const ready = total - g.asks.filter(a => a.type === 'wave').length;
    const sealed = g.court.submitted[seat] !== undefined && !g.players[seat].sultan;
    return (
      <>
        <Stp label={t('waveN', { n: g.court.wave })} />
        <p className="vo">{g.players[seat].sultan ? t('wait.sultanCourt') : sealed ? t('wait.sealed') : t('wait.cantPlay')}</p>
        <div className="wait">
          <span className="dots">{Array.from({ length: total }, (_, i) => <i key={i} className={i < ready ? 'on' : ''} />)}</span>
          {t('wait.ready', { n: ready, total })}{waitingFor.length ? ' ' + t('wait.for', { names: waitingFor.map(id => name(g, id)).join(', ') }) : ''}
        </div>
        {sealed && !g.players[seat].sultan && g.court.submitted[seat] !== null && <Retract />}
      </>
    );
  }
  if (g.step === 'kader') text = t('wait.kader');
  else if (g.kulis && g.step === 'appoint') text = t('wait.kulis', { a: name(g, g.players.find(p => p.character === 'rustem')?.id), b: name(g, g.sultan) });
  else if (g.step === 'decree') text = t('wait.decree', { name: name(g, g.decree?.chooser) });
  else if (g.step === 'objections' && g.sub === 'turn') text = t('wait.objection');
  return (
    <>
      <Stp />
      <p className="vo">{text}</p>
      {waitingFor.length > 0 && <div className="wait">{t('wait.for', { names: waitingFor.map(id => name(g, id)).join(', ') })}</div>}
    </>
  );
}

function Retract() {
  const { act } = useGame();
  return <div className="bt"><Btn onClick={() => act({ t: 'retract' })}>{t('btn.retract')}</Btn></div>;
}

function FullScreenHint() {
  return <><Stp /><p className="vo">{t('wait.yourScreen')}</p></>;
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

// ---------- hand-limit discards and Yakıp Yıkma

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
  const { hand, act } = useGame();
  return (
    <>
      <Stp />
      <p className="vo">{t('ask.keepOne')}</p>
      <div className="bt"><Btn pri off={hand.sel.length !== 1} onClick={() => { act({ t: 'answer', ask: a.id, value: hand.sel[0] }); hand.setSel([]); }}>{t('btn.keep')}</Btn></div>
    </>
  );
}

// ---------- optional timed powers: use or skip

const POWER_NAMES: Record<string, () => string> = {
  iskender: () => t('power.iskender'),
};
function powerName(power: string) {
  if (POWER_NAMES[power]) return POWER_NAMES[power]();
  for (const c of Object.values(characterById)) {
    if (c.base.id === power) return c.base.name;
    if (c.favor.id === power) return c.favor.name;
  }
  return power;
}

function Window({ a }: { a: Extract<Ask, { type: 'window' }> }) {
  const { g, act, setPicker } = useGame();
  const [picking, setPicking] = useState(false);
  const answer = (v: unknown) => act({ t: 'answer', ask: a.id, value: v });
  useEffect(() => () => setPicker(null), []);
  const useIt = () => {
    if (a.power === 'feragat') {
      const seat: Seat = g.ministers.first === a.to ? 'first' : 'second';
      setPicking(true);
      setPicker({ legal: eligibleList(g, seat).filter(id => id !== a.to), onPick: id => { setPicker(null); answer({ target: id }); } });
      return;
    }
    answer(true);
  };
  return (
    <>
      <Stp />
      <p className="vo"><b>{powerName(a.power)}.</b> {t(`window.${a.power}`, ctxVars(g, a))}{picking && <small>{t('tapSeat')}</small>}</p>
      <div className="bt">
        <Btn onClick={() => { setPicker(null); answer(false); }}>{t('btn.skip')}</Btn>
        {!picking && <Btn pri onClick={useIt}>{t('btn.use')}</Btn>}
      </div>
    </>
  );
}
function ctxVars(g: import('../../engine/index.ts').Game, a: Extract<Ask, { type: 'window' }>) {
  const c = (a.ctx ?? {}) as { target?: PID; of?: PID; delta?: number };
  return { target: name(g, c.target), of: name(g, c.of), dir: c.delta && c.delta > 0 ? t('gives') : t('takes') };
}

// ---------- Atama

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
  const self = a.to !== g.sultan;
  return (
    <>
      <Stp />
      <p className="vo">{t(self ? 'ask.appointSadrazam' : 'ask.appoint')}<small>{t('ask.appointHow')}</small></p>
      <div className="slots-mini">
        <button type="button" className={`slot ${first !== null ? 'on' : ''}`} onClick={() => setFirst(null)}><i className="rn">I</i><span>{first !== null ? name(g, first) : t('min1')}</span></button>
        <button type="button" className={`slot ${second !== null ? 'on' : ''}`} onClick={() => setSecond(null)}><i className="rn">II</i><span>{second !== null ? name(g, second) : t('min2')}</span></button>
      </div>
      <div className="bt">
        <Btn pri off={first === null || second === null} onClick={() => { setPicker(null); act({ t: 'answer', ask: a.id, value: { first, second } }); }}>
          {t('btn.appoint')} <small>{[first, second].filter(x => x !== null).length}/2</small>
        </Btn>
      </div>
    </>
  );
}

function Kulis({ a }: { a: Ask }) {
  const { g, act } = useGame();
  const [left, setLeft] = useState(RULES.kulisSeconds);
  useEffect(() => {
    const id = setInterval(() => setLeft(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, []);
  const rustem = g.players.find(p => p.character === 'rustem');
  return (
    <>
      <Stp />
      <p className="vo">{t('ask.kulis', { name: name(g, rustem?.id) })}<small>{t('secondsLeft', { n: left })}</small></p>
      <div className="bt"><Btn pri onClick={() => act({ t: 'answer', ask: a.id })}>{t('btn.endKulis')}</Btn></div>
    </>
  );
}

// ---------- İtiraz

function Objection({ a }: { a: Ask }) {
  const { g, me, act, setPicker } = useGame();
  const [mode, setMode] = useState<null | 'paid' | 'free'>(null);
  const canFree = me.character === 'mahidevran' && me.base === 'ready';
  const cost = (id: PID) => (g.players[id].character === 'mustafa' && !g.learning && g.players[id].favor !== 'locked' ? 2 : RULES.objectionCost);
  const seats: Seat[] = ['first', 'second'];
  const affordable = (free: boolean) => seats.filter(s => free || me.influence >= cost(g.ministers[s]!)).map(s => g.ministers[s]!);
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
  const minCost = Math.min(cost(g.ministers.first!), cost(g.ministers.second!));
  return (
    <>
      <Stp label={t('step.objections')} />
      <p className="vo">{mode ? t('ask.objectPick') : t('ask.object', { cost: minCost })}
        {canFree && !mode && <small>{t('ask.objectFree')}</small>}</p>
      <div className="bt">
        {mode ? <Btn onClick={() => setMode(null)}>{t('btn.back')}</Btn> : <Btn onClick={() => act({ t: 'answer', ask: a.id, value: null })}>{t('btn.pass')}</Btn>}
        {!mode && canFree && <Btn onClick={() => setMode('free')}>{t('btn.objectFree')}</Btn>}
        {!mode && <Btn pri off={!affordable(false).length} onClick={() => setMode('paid')}>{t('btn.object')} <small>−{minCost}</small></Btn>}
      </div>
    </>
  );
}

function Replace({ a }: { a: Extract<Ask, { type: 'replace' }> }) {
  const { g } = useGame();
  const legal = eligibleList(g, a.seat).filter(id => id !== a.removed);
  return <PickSeat a={a} legal={legal} text={t(`ask.replace.${a.reason}`, { removed: name(g, a.removed), seat: t(a.seat === 'first' ? 'min1' : 'min2') })} />;
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

// ---------- Tertip: tap a card, then a seat

interface Staged extends WavePlay { as: string }

function Wave({ a }: { a: Ask }) {
  const { g, seat, me, act, hand, setPicker } = useGame();
  const [staged, setStaged] = useState<Staged[]>([]);
  const [form, setForm] = useState(0);
  const [esma, setEsma] = useState(false);
  const allowance = waveAllowance(g, seat);
  const sel = hand.sel[0] ?? null;
  const forms = useMemo(() => (sel !== null ? playableForms(g, seat, sel) : []), [sel, g]);
  const usedRecast = staged.some(s => s.recastAs);
  const options = forms.filter(f => !(f.recast && usedRecast));
  const cur = options[Math.min(form, options.length - 1)];
  const card = me.hand.find(c => c.uid === sel);
  const canEsma = me.companion === 'esma' && me.influence > 0 && !me.companionUsed && !staged.some(s => s.esma);

  useEffect(() => setForm(0), [sel]);
  useEffect(() => {
    if (!cur || sel === null || staged.length >= allowance) return setPicker(null);
    setPicker({
      legal: legalTargets(g, seat, cur.as),
      onPick: id => {
        sfx('place');
        setStaged(s => [...s, { uid: sel, target: id, as: cur.as, ...(cur.recast ? { recastAs: cur.as, field: cur.field } : {}), ...(esma ? { esma: true } : {}) }]);
        hand.setSel([]);
        setEsma(false);
      },
    });
  }, [cur?.as, cur?.field, cur?.recast, sel, staged.length, esma]);
  useEffect(() => () => setPicker(null), []);

  const submit = (plays: Staged[]) => {
    setPicker(null);
    hand.setSel([]);
    act({ t: 'answer', ask: a.id, value: plays.map(({ as: _as, ...p }) => p) });
  };
  const left = RULES.cardsPerCrisis - me.played;
  return (
    <>
      <Stp label={t('waveN', { n: g.court?.wave ?? 1 })} />
      {card && cur ? (
        <p className="vo">
          <span className="clamp"><b>{intrigueById[cur.as].name}{cur.recast ? ` (${t('recastFrom', { card: intrigueById[card.kind].name })})` : ''}.</b> {intrigueById[cur.as].text}</span>
          <small>{t('ask.waveTarget')}</small>
        </p>
      ) : card ? (
        <p className="vo">{t('ask.waveCantPlay', { card: intrigueById[card.kind].name })}</p>
      ) : (
        <p className="vo">{staged.length ? t('ask.waveStaged', { list: staged.map(s => `${intrigueById[s.as].name} → ${name(g, s.target)}`).join(', ') }) : t('ask.wave', { left })}
          <small>{t('ask.waveHow', { n: allowance })}</small></p>
      )}
      <div className="opts">
        {options.length > 1 && options.map((f, i) => (
          <button type="button" key={f.as + f.field} className={`chip ${i === form ? 'on' : ''}`} onClick={() => setForm(i)}>
            {f.recast ? t('recastAs', { card: intrigueById[f.as].name, field: f.as === 'akil-hocasi' ? t(f.field as Field) : '' }) : t('asPrinted')}
          </button>
        ))}
        {card && canEsma && <button type="button" className={`chip ${esma ? 'on' : ''}`} onClick={() => setEsma(e => !e)}>{t('withEsma')}</button>}
        {canRecast(g, seat) && !card && !staged.length && <span className="hint">{t('recastHint')}</span>}
      </div>
      <div className="bt">
        {staged.length ? <Btn onClick={() => setStaged([])}>{t('btn.undo')}</Btn> : <Btn onClick={() => submit([])}>{t('btn.pass')}</Btn>}
        <Btn pri off={!staged.length} onClick={() => submit(staged)}>{t('btn.seal')}{staged.length > 1 ? ` (${staged.length})` : ''}</Btn>
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
        <button type="button" key={i} className={`chip ${pick === i ? 'on' : ''}`} onClick={() => setPick(i)}>{intrigueById[plays[i].as].name}</button>
      ))}</div>
      <div className="bt"><Btn onClick={() => { setPicker(null); act({ t: 'answer', ask: a.id, value: null }); }}>{t('btn.skip')}</Btn></div>
    </>
  );
}

// ---------- Ferman

function Ferman({ a }: { a: Ask }) {
  const { g, act, setPicker } = useGame();
  const [stage, setStage] = useState<'ask' | 'minister' | 'newcomer'>('ask');
  const [seat, setSeat] = useState<Seat | null>(null);
  useEffect(() => {
    if (stage === 'minister') setPicker({ legal: [g.ministers.first!, g.ministers.second!], onPick: id => { setSeat(g.ministers.first === id ? 'first' : 'second'); setStage('newcomer'); } });
    else if (stage === 'newcomer' && seat) setPicker({
      legal: eligibleList(g, seat).filter(id => id !== g.ministers[seat]),
      onPick: id => { setPicker(null); act({ t: 'answer', ask: a.id, value: { seat, target: id } }); },
    });
    else setPicker(null);
  }, [stage, seat]);
  useEffect(() => () => setPicker(null), []);
  return (
    <>
      <Stp />
      <p className="vo">{t(stage === 'ask' ? 'ask.ferman' : stage === 'minister' ? 'ask.fermanWho' : 'ask.fermanNew')}</p>
      <div className="bt">
        {stage === 'ask' ? <Btn onClick={() => act({ t: 'answer', ask: a.id, value: null })}>{t('btn.noFerman')}</Btn> : <Btn onClick={() => { setStage('ask'); setSeat(null); }}>{t('btn.back')}</Btn>}
        {stage === 'ask' && <Btn pri onClick={() => setStage('minister')}>{t('btn.ferman')}</Btn>}
      </div>
    </>
  );
}

export { name as playerName };
