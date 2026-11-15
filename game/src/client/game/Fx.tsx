// Every public effect shows on the table as it happens, read from the game log (the same stream the Sicil sheet
// shows): Nüfuz and card changes float off the seat they hit, a seat that changes hands glows, and every power use
// gets a banner on every phone. Seat effects wait while a public moment covers the court, then play.
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { Game, LogEntry, PID } from '../../engine/index.ts';
import { Em } from '../ui/marks.tsx';
import { Head } from '../ui/Figure.tsx';
import { logText } from '../logText.ts';
import { useGame } from './ctx.ts';

export interface SeatFx { key: number; kind: 'gain' | 'lose' | 'draw' | 'discard' | 'seat'; n: number }
export interface Banner { key: number; who: PID | null; text: string }

const SEAT_KINDS: Record<string, SeatFx['kind']> = { gain: 'gain', lose: 'lose', draw: 'draw', discard: 'discard' };
const BANNER_KINDS = new Set(['power', 'itiraz', 'objection', 'ferman', 'returned', 'firuze', 'faiz', 'ambition', 'sorusturma', 'hazineDefteri', 'fermanRefresh']);
const SEAT_MS = 2200;
const BANNER_MS = 3200;

/** Turns new log entries into seat effects and banners. Starts from the log as it is on mount, so a reload doesn't
 *  replay the game. */
export function useLogFx(g: Game, courtVisible: boolean) {
  const seen = useRef(g.log.length);
  const [queue, setQueue] = useState<{ i: number; e: LogEntry }[]>([]);
  const [seat, setSeat] = useState<Record<PID, SeatFx[]>>({});
  const [banners, setBanners] = useState<Banner[]>([]);

  useEffect(() => {
    if (g.log.length < seen.current) seen.current = g.log.length;   // a new game
    const fresh = g.log.slice(seen.current).map((e, k) => ({ i: seen.current + k, e }));
    seen.current = g.log.length;
    if (!fresh.length) return;
    const bs = fresh.filter(({ e }) => BANNER_KINDS.has(e.k)).map(({ i, e }) => ({ key: i, who: whoOf(e), text: logText(g, e) ?? '' })).filter(b => b.text);
    if (bs.length) setBanners(b => [...b, ...bs]);
    setQueue(q => [...q, ...fresh.filter(({ e }) => SEAT_KINDS[e.k] || e.k === 'replaced' || e.k === 'swapped')]);
  }, [g.log.length]);

  // seat effects play only while the court is on screen
  useEffect(() => {
    if (!courtVisible || !queue.length) return;
    const add: Record<PID, SeatFx[]> = {};
    for (const { i, e } of queue) {
      const p = e.p ?? {};
      const push = (id: unknown, fx: SeatFx) => { if (typeof id === 'number') (add[id] ??= []).push(fx); };
      if (SEAT_KINDS[e.k]) push(p.who, { key: i, kind: SEAT_KINDS[e.k], n: Number(p.n ?? 1) });
      if (e.k === 'replaced') push(p.newcomer, { key: i, kind: 'seat', n: 0 });
      if (e.k === 'swapped') { push(p.first, { key: i, kind: 'seat', n: 0 }); push(p.second, { key: i + 0.5, kind: 'seat', n: 0 }); }
    }
    setQueue([]);
    setSeat(s => {
      const next = { ...s };
      for (const [id, list] of Object.entries(add)) next[Number(id)] = [...(next[Number(id)] ?? []), ...list];
      return next;
    });
    const keys = new Set(Object.values(add).flat().map(f => f.key));
    setTimeout(() => setSeat(s => Object.fromEntries(Object.entries(s).map(([id, l]) => [id, l.filter(f => !keys.has(f.key))]))), SEAT_MS);
  }, [courtVisible, queue.length]);

  // one banner at a time
  useEffect(() => {
    if (!banners.length) return;
    const id = setTimeout(() => setBanners(b => b.slice(1)), BANNER_MS);
    return () => clearTimeout(id);
  }, [banners[0]?.key]);

  return { seat, banner: banners[0] ?? null };
}

const whoOf = (e: LogEntry): PID | null => (typeof e.p?.who === 'number' ? e.p.who : typeof e.p?.by === 'number' ? e.p.by : null);

/** The effects floating off one seat. */
export function SeatEffects({ id }: { id: PID }) {
  const { fx } = useGame();
  const list = fx.seat[id] ?? [];
  return (
    <AnimatePresence>
      {list.map((f, k) => f.kind === 'seat'
        ? <motion.span key={f.key} className="fx-seat" initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }} transition={{ duration: SEAT_MS / 1000 }} />
        : (
          <motion.span key={f.key} className={`fx ${f.kind}`} initial={{ opacity: 0, y: 6 + k * 18 }} animate={{ opacity: [0, 1, 1, 0], y: -26 + k * 18 }}
            transition={{ duration: SEAT_MS / 1000, times: [0, .15, .75, 1] }}>
            {f.kind === 'gain' || f.kind === 'draw' ? '+' : '−'}{f.n}<Em k={f.kind === 'gain' || f.kind === 'lose' ? 'influence' : 'intrigue'} s={16} />
          </motion.span>
        ))}
    </AnimatePresence>
  );
}

/** The banner across the top of the table: who used what. */
export function PowerBanner() {
  const { g, fx } = useGame();
  const b = fx.banner;
  return (
    <AnimatePresence>
      {b && (
        <motion.div key={b.key} className="banner" initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: .25 }}>
          {b.who !== null && g.players[b.who] && <Head character={g.players[b.who].character} />}
          <span>{b.text}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
