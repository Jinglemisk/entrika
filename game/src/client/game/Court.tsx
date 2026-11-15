// The court: every seat as a figure in a niche, one fixed row in seat order with Süleyman in the middle,
// the same order on every phone. Taps pick a target when a picker is active, otherwise open the seat sheet.
import { characterById, clockwise, companionById, intrigueById, type Game, type PID } from '../../engine/index.ts';
import { Gl, Star } from '../ui/marks.tsx';
import { Figure } from '../ui/Figure.tsx';
import { t } from '../strings.ts';
import { useGame } from './ctx.ts';

/** Seat order for display (v3): Süleyman in the middle; the table runs clockwise from his left (our right) and wraps
 *  round to the far left, so neighbours on screen are neighbours at the table. */
export function displayOrder(n: number, sultan: PID): PID[] {
  const right = Math.ceil((n - 1) / 2);
  const at = (i: number) => (sultan + i) % n;
  const leftSide = Array.from({ length: n - 1 - right }, (_, k) => at(right + 1 + k));
  const rightSide = Array.from({ length: right }, (_, k) => at(1 + k));
  return [...leftSide, sultan, ...rightSide];
}

export function Court({ top, compact }: { top?: number; compact?: boolean }) {
  const { g, seat, picker, setSheet } = useGame();
  const order = displayOrder(g.players.length, g.sultan);
  const n = g.players.length;
  const slot = n >= 8 ? 92 : n === 7 ? 104 : 112;
  const nw = n >= 8 ? 82 : 90;
  return (
    <div className="ct" style={{ ['--slot' as string]: `${slot}px`, ...(top != null ? { top } : {}) }}>
      {order.map(id => <SeatView key={id} id={id} nw={nw} me={id === seat} compact={compact}
        onTap={() => (picker && picker.legal.includes(id) ? picker.onPick(id) : setSheet({ t: 'seat', id }))} />)}
    </div>
  );
}

function SeatView({ id, nw, me, onTap, compact }: { id: PID; nw: number; me: boolean; onTap: () => void; compact?: boolean }) {
  const { g, picker, room } = useGame();
  const p = g.players[id];
  const vk = g.ministers.first === id ? 1 : g.ministers.second === id ? 2 : 0;
  const court = g.court;
  const ready = g.step === 'court' && g.sub === 'wave' && court && id in court.submitted && !p.sultan && !g.asks.some(a => a.type === 'wave' && a.to === id);
  const waiting = g.asks.some(a => a.to === id);
  const legal = picker?.legal.includes(id);
  const chosen = picker?.chosen?.includes(id);
  const dim = picker && !legal && !chosen;
  const objTurn = g.step === 'objections' ? objectionMark(g, id) : null;
  const sw = p.sultan ? nw + 14 : nw;
  const sh = p.sultan ? 124 : 106;
  const cls = ['st', p.sultan && 'sul', vk && 'vk', me && 'you', dim && 'dim', legal && 'legal', chosen && 'pick', waiting && 'busy']
    .filter(Boolean).join(' ');
  const lasting = lastingTags(g, id);
  const comp = p.companion ? companionById[p.companion] : null;
  const offline = !room.seats[id]?.online && !room.dev;
  return (
    <button type="button" className={cls} style={{ ['--nw' as string]: `${sw}px`, ['--nh' as string]: `${sh}px` }} onClick={onTap}>
      <div className="nc">
        <Figure character={p.character} nw={sw} brk={p.sultan ? 12 : 9} />
        {vk ? <span className="of">{t(vk === 1 ? 'min1' : 'min2')}</span> : null}
        {!p.sultan && <span className="nf"><Star n={p.influence} /></span>}
        {!p.sultan && comp && (
          <span className={`kl ${p.influence < 1 ? 'down' : ''}`} title={comp.name}>
            {comp.art ? <img src={comp.art.src} alt="" style={{ objectPosition: comp.art.pos }} /> : <i className="kl-em" />}
          </span>
        )}
        {ready && <span className="rd"><Gl k="check" /></span>}
        {g.surgun.now === id && <span className="exile">{t('exiled')}</span>}
      </div>
      <div className="pl">
        <b>{me ? t('youName', { name: p.name }) : p.name}{offline ? ' ·' : ''}</b>
        <i>{characterShort(p.character)}</i>
      </div>
      {!compact && (
        <div className="ld">
          {objTurn && <span className={`ord ${objTurn.state}`}>{objTurn.n}</span>}
          {lasting.map(tag => <span key={tag} className="tg">{tag}</span>)}
          {!p.sultan && <span className="hn" title={t('handCount', { n: p.hand.length })}>{p.hand.length}</span>}
        </div>
      )}
    </button>
  );
}

const characterShort = (id: string) => characterById[id].name;

function objectionMark(g: Game, id: PID) {
  const order = clockwise(g).map(p => p.id);
  const i = order.indexOf(id);
  if (i < 0) return null;
  const turn = g.objectionTurn - 1;
  const state = i < turn ? 'done' : i === turn && g.sub === 'turn' ? 'now' : '';
  return { n: i + 1, state };
}

/** Protections that last the crisis are public: they show as name tags under the player. */
function lastingTags(g: Game, id: PID): string[] {
  const c = g.court;
  if (!c) return [];
  const tags: string[] = [];
  if (c.sealed.includes(id)) tags.push(intrigueById.muhur.name);
  if (c.akil[id]?.length) tags.push(intrigueById['akil-hocasi'].name);
  if (c.tabib.includes(id)) tags.push(intrigueById['saray-tabibi'].name);
  return tags;
}
