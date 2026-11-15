// The lacquer shelf: what is yours. Your Taraf and Hırs (press and hold to read), your Character and Kul, and your
// hand. They are whole cards, text and all, small but readable on a big screen; tap one to read it at full size and
// act on it. Every card shares one top line. The prompt block sits on the right.
import { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FREE_POWERS, companionById, characterById, freePowerTargets, type PowerState } from '../../engine/index.ts';
import { Card, CardBack } from '../cards/Card.tsx';
import { intrRef, spec } from '../cardSpecs.ts';
import { Head } from '../ui/Figure.tsx';
import { t } from '../strings.ts';
import { sfx } from '../sound.ts';
import { useGame } from './ctx.ts';

export const SHELF_CARD = 80;   // Character, Kul and hand cards (game.css lays the shelf out around this)
const BACK = 52;               // the Taraf back
const HAND_W = 252;            // px between your Kul and the prompt (game.css: .hand left, .pr left)

export function Mine() {
  const { g, me, seat, setSheet } = useGame();
  const hold = useRef<number | null>(null);
  const start = () => { hold.current = window.setTimeout(() => setSheet({ t: 'secret' }), 160); };
  const stop = () => { if (hold.current) clearTimeout(hold.current); hold.current = null; };
  const ch = characterById[me.character];
  const live = [ch.base.id, ch.favor?.id ?? ''].some(p => FREE_POWERS[p] && freePowerTargets(g, seat, p));
  const pips: PowerState[] = me.sultan
    ? [g.ferman ? 'ready' : 'used', g.tracks.treason >= 2 ? 'used' : 'locked', g.hazineDefteri ? 'ready' : g.tracks.treason >= 3 ? 'used' : 'locked']
    : g.learning ? [me.base] : [me.base, me.favor];
  const kul = me.companion ? companionById[me.companion] : null;
  return (
    <div className="mine">
      <button type="button" className="mc tf" onPointerDown={start} onPointerUp={stop} onPointerLeave={stop} onClick={() => setSheet({ t: 'secret' })}>
        <CardBack kind="taraf" width={BACK} />
        <small>{t(me.sultan ? 'sultanCard' : 'holdSecret')}</small>
      </button>
      <button type="button" className={`mc ${live ? 'live' : ''}`} onClick={() => { sfx('tap'); setSheet({ t: 'card', ref: { t: 'char', id: me.character }, own: true }); }}>
        <Card spec={spec({ t: 'char', id: me.character })} width={SHELF_CARD} whole />
        <Pips states={pips} />
      </button>
      {kul && (
        <button type="button" className={`mc ${me.influence < 1 ? 'down' : ''}`} onClick={() => { sfx('tap'); setSheet({ t: 'card', ref: { t: 'kul', id: kul.id }, own: true }); }}>
          <Card spec={spec({ t: 'kul', id: kul.id })} width={SHELF_CARD} whole />
          <Pips states={[kulState()]} />
        </button>
      )}
    </div>
  );

  function kulState(): PowerState {
    if (!kul || me.influence < 1) return 'locked';
    if (kul.freq !== 'always' && me.companionUsed) return 'used';
    return 'ready';
  }
}

function Pips({ states }: { states: PowerState[] }) {
  return <span className="pips">{states.map((s, i) => <i key={i} className={s} />)}</span>;
}

export function Hand() {
  const { g, me, hand, setSheet, asks } = useGame();
  if (me.sultan || ['appoint', 'replace', 'ferman'].includes(asks[0]?.type ?? '')) return null;   // seat slots show here instead
  const open = (uid: number) => {
    sfx('tap');
    const c = me.hand.find(x => x.uid === uid)!;
    setSheet({ t: 'card', ref: intrRef(c), uid });
  };
  // a hand bigger than the space overlaps instead of shrinking
  const n = Math.max(1, me.hand.length);
  const w = SHELF_CARD;
  const gap = n > 1 ? Math.min(6, Math.floor((HAND_W - w * n) / (n - 1))) : 6;   // negative: the cards overlap
  return (
    <div className="hand" style={{ gap: 0 }}>
      <AnimatePresence initial={false}>
        {me.hand.map((c, i) => {
          const sealed = g.court?.submitted[me.id];
          const staged = hand.staged.find(s => s.uid === c.uid) ?? (Array.isArray(sealed) ? sealed.find(s => s.uid === c.uid) : undefined);
          const up = hand.sel.includes(c.uid) || hand.aim?.uid === c.uid;
          const toss = up && hand.mode === 'discard';
          const cls = ['hc', up && 'sel', toss && 'toss', staged && 'staged'].filter(Boolean).join(' ');
          return (
            <motion.button type="button" key={c.uid} className={cls} style={{ width: w, height: w * 1.4, marginLeft: i ? gap : 0 }} onClick={() => open(c.uid)}
              layout initial={{ y: -60, opacity: 0, rotate: -6 }} animate={{ y: toss ? 14 : up || staged ? -14 : 0, opacity: 1, rotate: 0 }}
              exit={{ y: -90, opacity: 0, scale: 0.8 }} transition={{ type: 'spring', stiffness: 380, damping: 30 }}>
              <Card spec={spec(intrRef(c))} width={w} whole />
              {staged && <span className="aimed"><Head character={g.players[staged.target].character} /></span>}
            </motion.button>
          );
        })}
      </AnimatePresence>
      {!me.hand.length && <p className="empty-hand">{t('emptyHand')}</p>}
    </div>
  );
}
