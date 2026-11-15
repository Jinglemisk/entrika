// The game screen: paper above (the court, tracks and Crisis, all public), lacquer below (your hand, Taraf and
// powers), the prompt block at the bottom right, and full-screen views on top when the moment calls for one.
import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import type { Action, PID } from '../../engine/index.ts';
import { actAs, type RoomView } from '../net.ts';
import { CardDefs } from '../cards/Card.tsx';
import { buzz, sfx } from '../sound.ts';
import { Ctx, myAsks, type GameCtx, type HandState, type Picker, type Sheet } from './ctx.ts';
import { Court } from './Court.tsx';
import { Mizan } from './Mizan.tsx';
import { Hand, Mine } from './Shelf.tsx';
import { Prompt } from './Prompt.tsx';
import { FullAsk, GameOver, Moments, ResultScreen } from './Full.tsx';
import { PeekPopup, SheetView } from './Sheets.tsx';
import { DevBar } from './DevBar.tsx';

const SEAT_KEY = 'entrika:view';

export function Game({ room }: { room: RoomView }) {
  const g = room.game!;
  const [seat, setSeatRaw] = useState<PID>(() => {
    const saved = Number(sessionStorage.getItem(SEAT_KEY + room.code));
    return room.mine.includes(saved) ? saved : room.mine[0] ?? 0;
  });
  const setSeat = (id: PID) => {
    setSeatRaw(id);
    sessionStorage.setItem(SEAT_KEY + room.code, String(id));
  };
  const [picker, setPicker] = useState<Picker | null>(null);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [sel, setSel] = useState<number[]>([]);
  const me = g.players[seat];
  const asks = useMemo(() => myAsks(g, seat), [g, seat]);
  const top = asks[0];
  const mode: HandState['mode'] = top?.type === 'wave' ? 'play' : top?.type === 'discard' ? 'discard' : top?.type === 'keepOne' ? 'keep' : 'view';

  // a fresh hand selection whenever the question or the viewer changes (prompts set and clear the seat picker themselves)
  useEffect(() => { setSel([]); }, [top?.id, seat]);
  // a buzz and a chime when the game turns to you
  const lastAsk = useRef<number | null>(null);
  useEffect(() => {
    if (top && top.id !== lastAsk.current && !room.seats[seat]?.bot) {
      sfx('turn');
      buzz();
    }
    lastAsk.current = top?.id ?? null;
  }, [top?.id]);
  // track sounds
  const tracks = useRef(g.tracks);
  useEffect(() => {
    if (g.tracks.loyalty > tracks.current.loyalty) sfx('good');
    if (g.tracks.treason > tracks.current.treason) sfx('bad');
    tracks.current = g.tracks;
    if (g.winner) sfx('win');
  }, [g.tracks.loyalty, g.tracks.treason, !!g.winner]);

  const act = (a: Action) => actAs(seat, a);
  const ctx: GameCtx = { room, g, seat, me, asks, act, picker, setPicker, sheet, setSheet, setSeat, hand: { mode, sel, setSel } };

  return (
    <Ctx.Provider value={ctx}>
      <CardDefs />
      <div className="pub zp">
        <div className="bd">
          <Mizan />
          <Court />
        </div>
      </div>
      <div className="shelf zl">
        <div className="bd">
          <Mine />
          <Hand />
          <Prompt />
        </div>
      </div>
      <AnimatePresence>
        <ResultScreen key="result" />
        <FullAsk key="ask" />
      </AnimatePresence>
      <Moments />
      <AnimatePresence><PeekPopup key="peek" /></AnimatePresence>
      <AnimatePresence>{sheet && <SheetView key="sheet" />}</AnimatePresence>
      <AnimatePresence>{g.winner && <GameOver key="end" />}</AnimatePresence>
      {room.dev && <DevBar />}
    </Ctx.Provider>
  );
}
