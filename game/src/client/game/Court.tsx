// The court: every seat as a figure in a niche, one fixed row in seat order with Süleyman in the middle,
// the same order on every phone. Taps pick a target when a picker is active, otherwise open the seat sheet.
import { characterById, companionById, intrigueById, type Game, type PID } from '../../engine/index.ts';
import { Em, Gl } from '../ui/marks.tsx';
import { Figure } from '../ui/Figure.tsx';
import { getTags, usePrefs } from '../prefs.ts';
import { t } from '../strings.ts';
import { useGame } from './ctx.ts';
import { DevToggle } from './DevBar.tsx';

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
  const { g, seat, picker, setSheet, room } = useGame();
  usePrefs();   // re-render when a private tag changes
  const tags = getTags(room.code, seat);
  const order = displayOrder(g.players.length, g.sultan);
  const n = g.players.length;
  const slot = n >= 8 ? 92 : n === 7 ? 104 : 112;
  const nw = n >= 8 ? 82 : 90;
  return (
    <div className="ct" style={{ ['--slot' as string]: `${slot}px`, ...(top != null ? { top } : {}) }}>
      {order.map(id => <SeatView key={id} id={id} nw={nw} me={id === seat} compact={compact} tag={tags[id]}
        onTap={() => (picker && picker.legal.includes(id) ? picker.onPick(id) : setSheet({ t: 'seat', id }))} />)}
    </div>
  );
}

function SeatView({ id, nw, me, onTap, compact, tag }: { id: PID; nw: number; me: boolean; onTap: () => void; compact?: boolean; tag?: string }) {
  const { g, picker, room, seat, hand } = useGame();
  const p = g.players[id];
  const vk = g.ministers.first === id ? 1 : g.ministers.second === id ? 2 : 0;
  const court = g.court;
  const ready = g.step === 'court' && g.sub === 'wave' && court && id in court.submitted && !p.sultan && !g.asks.some(a => a.type === 'wave' && a.to === id);
  const waiting = g.asks.some(a => a.to === id);
  const legal = picker?.legal.includes(id);
  const chosen = picker?.chosen?.includes(id);
  const dim = picker && !legal && !chosen;
  const sw = p.sultan ? nw + 14 : nw;
  const sh = p.sultan ? 124 : 106;
  const cls = ['st', p.sultan && 'sul', vk && 'vk', me && 'you', dim && 'dim', legal && 'legal', chosen && 'pick', waiting && 'busy']
    .filter(Boolean).join(' ');
  const lasting = lastingTags(g, id);
  const comp = p.companion ? companionById[p.companion] : null;
  const offline = !room.seats[id]?.online && !room.dev;
  // your own cards aimed at this seat this wave, staged or sealed: only you see these
  const sealed = g.court?.submitted[seat];
  const mine = [...(Array.isArray(sealed) ? sealed : []), ...hand.staged].filter(x => x.target === id).length;
  return (
    <button type="button" className={cls} style={{ ['--nw' as string]: `${sw}px`, ['--nh' as string]: `${sh}px` }} onClick={onTap}>
      <div className="nc">
        <Figure character={p.character} nw={sw} brk={p.sultan ? 12 : 9} />
        {vk ? <span className="of">{t(vk === 1 ? 'min1' : 'min2')}</span> : null}
        {!p.sultan && comp && (
          <span className={`kl ${p.influence < 1 ? 'down' : ''}`} title={comp.name}>
            {comp.art ? <img src={comp.art.src} alt="" style={{ objectPosition: comp.art.pos }} /> : <i className="kl-em" />}
          </span>
        )}
        {ready && <span className="rd"><Gl k="check" /></span>}
        {g.surgun.now === id && <span className="exile">{t('exiled')}</span>}
        {tag && <span className={`mytag ${tag}`} title={t(`tag.${tag}`)}>{tag === 'suspect' ? '?' : '✓'}</span>}
        {mine > 0 && <span className="myplay" title={t('myPlayHere')}><Em k="intrigue" s={14} />{mine > 1 ? mine : ''}</span>}
        <DevToggle id={id} />
      </div>
      <div className="pl">
        <b>{characterShort(p.character)}</b>
        <i>{me ? t('youName', { name: p.name }) : p.name}{offline ? ' ·' : ''}</i>
      </div>
      {!compact && (
        <div className="ld">
          {lasting.map(l => <span key={l.k} className={`pt ${l.k}`} title={l.title}>{l.icons.map(k => <Em key={k} k={k} s={13} />)}{l.k === 'tabib' && <Gl k="lock" />}</span>)}
          {!p.sultan && <span className="ic" title={t('nInfluence', { n: p.influence })}><Em k="influence" s={14} /><b>{p.influence}</b></span>}
          {!p.sultan && <span className="ic" title={t('handCount', { n: p.hand.length })}><Em k="intrigue" s={14} /><b>{p.hand.length}</b></span>}
        </div>
      )}
    </button>
  );
}

const characterShort = (id: string) => characterById[id].name;

/** Protections that last the crisis are public: they show as icons under the player (the name on hover). */
function lastingTags(g: Game, id: PID): { k: string; icons: string[]; title: string }[] {
  const c = g.court;
  if (!c) return [];
  const tags: { k: string; icons: string[]; title: string }[] = [];
  if (c.sealed.includes(id)) tags.push({ k: 'muhur', icons: ['seal'], title: intrigueById.muhur.name });
  if (c.akil[id]?.length) tags.push({ k: 'akil', icons: c.akil[id], title: `${intrigueById['akil-hocasi'].name}: ${c.akil[id].map(f => t(f)).join(', ')}` });
  if (c.tabib.includes(id)) tags.push({ k: 'tabib', icons: ['influence'], title: intrigueById['saray-tabibi'].name });
  return tags;
}
