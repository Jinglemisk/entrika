// The lacquer shelf: what is yours. Your Taraf and Hırs (press and hold to read), your Character and Kul, and your
// hand. They are whole cards, text and all, small but readable on a big screen; tap one to read it at full size and
// act on it. Every card shares one top line. The prompt block sits on the right.
import { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FREE_POWERS, RULES, characterById, freePowerTargets } from '../../engine/index.ts';
import { Card, CardBack } from '../cards/Card.tsx';
import { intrRef, spec, type CardRef } from '../cardSpecs.ts';
import { Head } from '../ui/Figure.tsx';
import { t } from '../strings.ts';
import { sfx } from '../sound.ts';
import { useGame } from './ctx.ts';
import { charRef, kulRef } from './Pop.tsx';

export const SHELF_CARD = 80;   // Character, Kul and hand cards (game.css lays the shelf out around this)
const BACK = 52;               // the Taraf back
const HAND_W = 248;            // the hand panel's inner width (game.css: .zone.mid, .hand)

/** The shelf's three framed panels (yours, your hand, the prompt), drawn behind the cards with a label set into
 *  each top border. */
export function ShelfZones() {
  const { me } = useGame();
  return (
    <div className="zones" aria-hidden="true">
      <Zone k="mine" label={t(me.sultan ? 'zone.sultan' : 'zone.mine')} />
      <Zone k="mid" label={me.sultan ? '' : t('zone.hand', { n: me.hand.length, limit: RULES.handLimit })} />
      <Zone k="side" label="" />
    </div>
  );
}
function Zone({ k, label }: { k: string; label: string }) {
  return (
    <div className={`zone ${k}`}>
      <i className="cn tl" /><i className="cn tr" /><i className="cn bl" /><i className="cn br" />
      {label && <span className="zlabel">{label}</span>}
    </div>
  );
}

export function Mine() {
  const { g, me, seat, setSheet } = useGame();
  const hold = useRef<number | null>(null);
  const start = () => { hold.current = window.setTimeout(() => setSheet({ t: 'secret' }), 160); };
  const stop = () => { if (hold.current) clearTimeout(hold.current); hold.current = null; };
  const ch = characterById[me.character];
  const live = [ch.base.id, ch.favor?.id ?? ''].some(p => FREE_POWERS[p] && freePowerTargets(g, seat, p));
  const open = (ref: CardRef) => () => { sfx('tap'); setSheet({ t: 'card', ref, own: true }); };
  return (
    <div className="mine">
      <button type="button" className="mc tf" onPointerDown={start} onPointerUp={stop} onPointerLeave={stop} onClick={() => setSheet({ t: 'secret' })}>
        <CardBack kind="taraf" width={BACK} />
        <small>{t(me.sultan ? 'sultanCard' : 'holdSecret')}</small>
      </button>
      <button type="button" className={`mc ${live ? 'live' : ''}`} onClick={open(charRef(g, me.character))}>
        <Card spec={spec(charRef(g, me.character))} width={SHELF_CARD} whole />
      </button>
      {me.companion && (
        <button type="button" className="mc" onClick={open(kulRef(me))}>
          <Card spec={spec(kulRef(me))} width={SHELF_CARD} whole />
        </button>
      )}
    </div>
  );
}

export function Hand() {
  const { g, me, hand, setSheet, asks } = useGame();
  if (me.sultan) return <div className="hand"><p className="empty-hand">{t('sultanNoHand')}</p></div>;
  if (['appoint', 'replace', 'ferman'].includes(asks[0]?.type ?? '')) return null;   // seat slots show here instead
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
