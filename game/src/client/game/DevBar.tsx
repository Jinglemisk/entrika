// DEV ONLY (remove with test rooms before release): switch to any seat's phone, and hand seats to bots, so one person
// can play a whole game. A tiny toggle sits on each seat in the court; when the court is covered (full screens,
// moments), a row of small heads takes its place in the corner.
import type { PID } from '../../engine/index.ts';
import { send } from '../net.ts';
import { Gl } from '../ui/marks.tsx';
import { Head } from '../ui/Figure.tsx';
import { t } from '../strings.ts';
import { useGame } from './ctx.ts';

/** DEV: the small switch on a seat. A span, because the seat itself is a button. */
export function DevToggle({ id }: { id: PID }) {
  const { g, seat, setSeat, room } = useGame();
  if (!room.dev) return null;
  const waiting = g.asks.some(a => a.to === id);
  const cls = ['devt', id === seat && 'on', waiting && 'wait', room.seats[id]?.bot && 'bot'].filter(Boolean).join(' ');
  return (
    <span role="button" className={cls} title={t('dev.switch', { name: g.players[id].name })}
      onClick={e => { e.stopPropagation(); setSeat(id); }}>
      <Gl k="eye" />
    </span>
  );
}

/** DEV: the corner row of heads used while the court is covered. */
export function DevSeats() {
  const { g, seat, setSeat, room } = useGame();
  return (
    <div className="devseats">
      {g.players.map(p => {
        const waiting = g.asks.some(a => a.to === p.id);
        return (
          <button type="button" key={p.id} title={p.name} onClick={() => setSeat(p.id)}
            className={[p.id === seat && 'on', waiting && 'wait', room.seats[p.id]?.bot && 'bot'].filter(Boolean).join(' ')}>
            <Head character={p.character} />
          </button>
        );
      })}
      <BotToggle />
    </div>
  );
}

/** DEV: hand every other seat to bots, or take them back. */
export function BotToggle() {
  const { g, room, seat } = useGame();
  if (!room.dev) return null;
  const bots = room.seats.map((s, i) => (s.bot ? i : -1)).filter(i => i >= 0);
  const setBots = (seats: number[]) => send({ t: 'lobby', o: { op: 'bots', seats } });
  return (
    <button type="button" className={`devbot ${bots.length ? 'on' : ''}`} title={t(bots.length ? 'dev.botsOff' : 'dev.botsOn')}
      onClick={() => setBots(bots.length ? [] : g.players.map(p => p.id).filter(id => id !== seat))}>
      <Gl k="bot" />
    </button>
  );
}
