// The court: every seat as a figure in a niche, one fixed row in seat order with Süleyman in the middle,
// the same order on every phone. Taps pick a target when a picker is active, otherwise open the seat sheet.
import { characterById, companionById, intrigueById, type Game, type PID } from '../../engine/index.ts';
import { Em, Gl } from '../ui/marks.tsx';
import { Figure } from '../ui/Figure.tsx';
import { getTags, usePrefs } from '../prefs.ts';
import { t } from '../strings.ts';
import { shownWaiting, useGame } from './ctx.ts';
import { DevToggle } from './DevBar.tsx';
import { SeatEffects } from './Fx.tsx';

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
  const waiting = shownWaiting(g).includes(id);
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
        <Figure character={p.character} nw={sw} nh={sh} brk={p.sultan ? 12 : 9} gilded={p.sultan} />
        {vk ? <span className="of">{t(vk === 1 ? 'min1' : 'min2')}</span> : null}
        {!p.sultan && comp && (
          <span className={`kl ${p.influence < 1 ? 'down' : ''}`} title={comp.name}>
            {comp.art ? <img src={comp.art.src} alt="" style={{ objectPosition: comp.art.pos }} /> : <i className="kl-em" />}
          </span>
        )}
        {g.surgun.now === id && <span className="exile">{t('exiled')}</span>}
        {tag && <span className={`mytag ${tag}`} title={t(`tag.${tag}`)}>{tag === 'suspect' ? '?' : '✓'}</span>}
        {mine > 0 && <span className="myplay" title={t('myPlayHere')}><Em k="intrigue" s={14} />{mine > 1 ? mine : ''}</span>}
        <DevToggle id={id} />
        <SeatEffects id={id} />
      </div>
      <div className="pl">
        <b className={characterShort(p.character).length > 14 ? 'long' : ''}>{characterShort(p.character)}</b>
        <i>{me ? t('youName', { name: p.name }) : p.name}{offline ? ' ·' : ''}</i>
      </div>
      {!compact && (
        <div className="ld">
          {!p.sultan && <span className="ic" title={t('nInfluence', { n: p.influence })}><Em k="influence" s={14} /><b>{p.influence}</b></span>}
          {/* at most three chips on the seat; the seat sheet names them all */}
          {(lasting.length > 3 ? lasting.slice(0, 2) : lasting).map(l => <TagChip key={l.k} tag={l} />)}
          {lasting.length > 3 && <span className="pt more">+{lasting.length - 2}</span>}
          {!p.sultan && me && <span className="ic" title={t('handCount', { n: p.hand.length })}><Em k="intrigue" s={14} /><b>{p.hand.length}</b></span>}
        </div>
      )}
    </button>
  );
}

const characterShort = (id: string) => characterById[id].name;

export type Tag = { k: string; icons: string[]; title: string; mark?: 'lock' | 'bar' };
/** Everything public that is still waiting on a seat (rulings R6). One chip per kind of effect, so the same kind always
 *  looks the same: a lock on a protection, a bar on a restriction, the eye on a secret look still to come, the Kader or
 *  Hüküm icon on what works there. A chip goes once its effect has worked. */
export function lastingTags(g: Game, id: PID): Tag[] {
  const out: Tag[] = [];
  const add = (k: string, icons: string[], title: string, mark?: Tag['mark']) => {
    const same = out.find(x => x.icons.join() === icons.join() && x.mark === mark);
    if (same) same.title += `, ${title}`;
    else out.push({ k, icons, title, mark });
  };
  const c = g.court;
  const card = (k: string) => intrigueById[k].name;
  if (c) {
    const kaderDone = !!g.kader?.played;
    if (c.himaye === id) add('himaye', ['seal', 'influence'], characterById.hatice.base.name, 'lock');
    if (c.sealed.includes(id)) add('muhur', ['seal'], card('muhur'), 'lock');
    if (c.akil[id]?.length) add('akil', c.akil[id], `${card('akil-hocasi')} (${c.akil[id].map(f => t(f)).join(', ')})`, 'lock');
    if (c.tabib.includes(id)) add('tabib', ['influence'], card('saray-tabibi'), 'lock');
    if (!c.done && (c.silenceNext.includes(id) || c.silenced.includes(id))) add('sukut', ['intrigue'], card('sukut'), 'bar');
    if (!c.done && c.casus.some(x => x.target === id)) add('look', ['secret'], card('casus'));
    if (!c.done && c.nobet.some(x => x.target === id)) add('look', ['secret'], card('nobet'));
    // cards that need their player still in a Vekil seat go quiet when the seat is lost
    const seated = g.ministers.first === id || g.ministers.second === id;
    if (!kaderDone && seated && c.teftis.some(x => x.target === id)) add('look', ['secret'], card('teftis'));
    if (!kaderDone && g.ministers.first === id && c.defterdar.includes(id)) add('kader', ['kader'], card('defterdar'));
    if (!kaderDone && seated && c.kefalet.some(x => x.target === id)) add('kader', ['kader'], card('kefalet'));
    if (seated && c.nazar.includes(id)) add('nazar', ['decree'], card('nazar'));   // the crisis, and the court with it, ends at the Hüküm
  }
  if (g.surgun.next === id) add('surgun', ['minister'], characterById.sahsultan.favor!.name, 'bar');
  if (g.faiz?.on === id) add('faiz', ['base'], characterById.gritti.base.name);
  return out;
}

/** One chip: the icon(s), and the lock or the bar. */
export function TagChip({ tag }: { tag: Tag }) {
  return (
    <span className={`pt ${tag.k} ${tag.mark === 'bar' ? 'barred' : ''}`} title={tag.title}>
      {tag.icons.map(k => <Em key={k} k={k} s={13} />)}{tag.mark === 'lock' && <Gl k="lock" />}
    </span>
  );
}
