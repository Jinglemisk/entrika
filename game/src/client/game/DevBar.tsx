// Testing aid for test rooms: switch to any seat's phone, and hand seats to bots so one person can play a whole game.
// It lives in the left gutter beside the board. Remove it with the test rooms when the game is done.
import { send } from '../net.ts';
import { Gl } from '../ui/marks.tsx';
import { t } from '../strings.ts';
import { useGame } from './ctx.ts';

export function DevBar() {
  const { g, room, seat, setSeat } = useGame();
  const bots = room.seats.map((s, i) => (s.bot ? i : -1)).filter(i => i >= 0);
  const setBots = (seats: number[]) => send({ t: 'lobby', o: { op: 'bots', seats } });
  return (
    <div className="devbar">
      {g.players.map(p => {
        const waiting = g.asks.some(a => a.to === p.id);
        return (
          <button type="button" key={p.id} title={p.name} onClick={() => setSeat(p.id)}
            className={[p.id === seat && 'on', waiting && 'wait', room.seats[p.id]?.bot && 'bot', p.sultan && 'sul'].filter(Boolean).join(' ')}>
            {p.name.slice(0, 2)}
          </button>
        );
      })}
      <button type="button" className={`tool ${bots.length ? 'on' : ''}`} title={t(bots.length ? 'dev.botsOff' : 'dev.botsOn')}
        onClick={() => setBots(bots.length ? [] : g.players.map(p => p.id).filter(id => id !== seat))}>
        <Gl k="bot" />
      </button>
    </div>
  );
}
