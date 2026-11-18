// Public moments in the court's place: a Crisis flips, a Tertip wave flips, the Kader result. Each stays until every
// player has pressed Devam (the engine waits on an "ack" from everyone); the prompt below holds the button.
import { useEffect } from 'react';
import { motion } from 'motion/react';
import { MISC, RULES, crisisById, crisisField, intrigueById, type Moment, type PID, type RevealedPlay } from '../../engine/index.ts';
import { Card } from '../cards/Card.tsx';
import { spec } from '../cardSpecs.ts';
import { Em, Gl } from '../ui/marks.tsx';
import { Head } from '../ui/Figure.tsx';
import { Refs } from '../ui/Refs.tsx';
import { t } from '../strings.ts';
import { sfx } from '../sound.ts';
import { Slots } from './Mizan.tsx';
import { useGame } from './ctx.ts';

const flip = (i = 0) => ({ initial: { rotateY: 180, y: 20, opacity: 0 }, animate: { rotateY: 0, y: 0, opacity: 1 }, transition: { delay: 0.1 + i * 0.16, duration: 0.5 } });

export function MomentView({ what }: { what: Moment }) {
  useEffect(() => { sfx(what === 'wave' ? 'reveal' : 'flip'); }, []);
  return (
    <motion.div className="moment-area" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
      {what === 'crisis' && <CrisisMoment />}
      {what === 'wave' && <WaveMoment />}
      {what === 'result' && <ResultMoment />}
    </motion.div>
  );
}

function Who({ id }: { id: PID }) {
  const { g } = useGame();
  return <span className="who"><Head character={g.players[id].character} />{g.players[id].name}</span>;
}

function CrisisMoment() {
  const { g } = useGame();
  const c = crisisById[g.crisis!];
  const f = crisisField(g);
  const drew = g.log.filter(e => e.c === g.crisisNo && e.k === 'draw').map(e => e.p!.who as PID);
  return (
    <div className="mo-split">
      <motion.div className="mo-card" {...flip()}><Card spec={spec({ t: 'crisis', id: c.id })} width={118} /></motion.div>
      <div className="mo-col">
        <p className="h-step">{t('crisisN', { n: g.crisisNo })}</p>
        <p className="mo-title">{c.name}</p>
        <p className="mo-line"><Em k={f} s={22} /><b>{t(f)}</b><span>{t(`fieldOpen.${f}`)}{g.field && ` ${t('moment.cephe')}`}</span></p>
        <p className="mo-line"><Em k="intrigue" s={22} />
          {drew.length ? <>{drew.map((id, i) => <span key={i} className="who plus"><Head character={g.players[id].character} />{g.players[id].name}<b>+1</b></span>)}</>
            : <span>{t('moment.nobodyDraws')}</span>}
        </p>
        <p className="mo-note">{c.text}</p>
      </div>
    </div>
  );
}

const OUTCOME_ICON: Record<string, string> = { ok: 'check', cancelled: 'close', void: 'close' };
function WaveMoment() {
  const { g } = useGame();
  const c = g.court!;
  const reveal = c.reveals[c.reveals.length - 1] ?? [];
  const tight = reveal.length > 6;
  const w = tight ? 90 : 96;   // below 90 px a card loses its name
  return (
    <div className="mo-row">
      {reveal.map((r, i) => (
        <motion.div key={i} className={`wv ${r.outcome !== 'ok' ? 'void' : ''}`} style={{ width: w + (tight ? 2 : 12) }} {...flip(i)}>
          <div className="wv-card">
            <Card spec={spec({ t: 'intr', kind: r.as, field: r.field })} width={w} />
            <span className={`wv-out ${r.outcome}`} title={outcomeText(r)}><Gl k={OUTCOME_ICON[r.outcome]} /></span>
          </div>
          <span className="wv-to"><Gl k="next" /><Who id={r.target} /></span>
          {outcomeText(r) !== t('outcome.ok') && <span className={`wv-why ${r.outcome !== 'ok' ? 'bad' : ''}`}><Refs text={outcomeText(r)} /></span>}
        </motion.div>
      ))}
    </div>
  );
}
/** Cards whose effect lasts the crisis or comes later say so under the card. */
const LATER: Record<string, string> = {
  muhur: 'outcome.lasting', 'akil-hocasi': 'outcome.lasting', 'saray-tabibi': 'outcome.lasting',
  kefalet: 'outcome.atKader', teftis: 'outcome.atKader', defterdar: 'outcome.atKader', casus: 'outcome.atEnd', nobet: 'outcome.atEnd',
  nazar: 'outcome.atDecree', sukut: 'outcome.nextWave',
};
function outcomeText(r: RevealedPlay): string {
  if (r.movedFrom !== undefined && r.outcome === 'ok') return t('outcome.moved');
  if (r.outcome === 'ok') {
    if (r.note) return t(`outcome.${r.note}`);
    if (r.recast) return t('outcome.recast', { card: intrigueById[r.card.kind].name });
    return t(LATER[r.as] ?? 'outcome.ok');
  }
  return t(`outcome.${r.note ?? r.outcome}`);
}

function ResultMoment() {
  const { g } = useGame();
  const k = g.kader!;
  const card = k.played!;
  const power = card === 'x' ? RULES.treasonPowers[String(g.tracks.treason)] : null;
  const def = power ? MISC.treason[power as 'sorusturma'] : null;
  return (
    <div className="mo-split">
      <motion.div className="mo-card" {...flip()}><Card spec={spec({ t: 'kader', k: card })} width={118} /></motion.div>
      <div className="mo-col">
        <p className="h-step">{t('resultN', { n: g.crisisNo })}</p>
        <p className={`mo-title ${card === 'x' ? 'al' : 'mal'}`}><Em k={card === 'x' ? 'hiyanet' : 'hizmet'} s={30} />{MISC.kader[card].name}</p>
        <p className="mo-line"><Who id={k.first} /><Gl k="next" /><Who id={k.second} /><span>{t('moment.kaderWho')}</span></p>
        <div className="mo-tracks bigtrk">
          <span className="h"><Em k="hizmet" s={18} /><Slots big n={RULES.tracks.loyalty} on={g.tracks.loyalty} fresh={card === 'h' ? g.tracks.loyalty - 1 : undefined} /></span>
          <span className="x"><Em k="hiyanet" s={18} /><Slots big n={RULES.tracks.treason} on={g.tracks.treason} fresh={card === 'x' ? g.tracks.treason - 1 : undefined} end /></span>
        </div>
        <p className="mo-note">
          {def ? <><Em k="treason" s={16} /><b>{def.name}.</b> {def.text}</> : <><Em k="decree" s={16} />{t(card === 'h' ? 'moment.decreeGive' : 'moment.decreeTake')}</>}
        </p>
      </div>
    </div>
  );
}
