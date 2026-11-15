// The lacquer shelf: what is yours. Your Taraf (press and hold to read it), your powers as a named list with state,
// and your hand. The prompt block sits on its right.
import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { characterById, companionById, FREE_POWERS, freePowerTargets, intrigueById, type PowerState } from '../../engine/index.ts';
import { Card, CardBack } from '../cards/Card.tsx';
import { intrRef, spec } from '../cardSpecs.ts';
import { t } from '../strings.ts';
import { sfx } from '../sound.ts';
import { useGame } from './ctx.ts';

export function Mine() {
  const { g, me, setSheet } = useGame();
  const hold = useRef<number | null>(null);
  const ch = characterById[me.character];
  const start = () => { hold.current = window.setTimeout(() => setSheet({ t: 'secret' }), 160); };
  const stop = () => { if (hold.current) clearTimeout(hold.current); hold.current = null; };
  return (
    <div className="mine">
      <button type="button" className="tf" onPointerDown={start} onPointerUp={stop} onPointerLeave={stop} onClick={() => setSheet({ t: 'secret' })}>
        <CardBack kind="taraf" width={46} />
        <small>{t(me.sultan ? 'sultanCard' : 'holdSecret')}</small>
      </button>
      <ul className="pw">
        {me.sultan ? <SultanPowers /> : (
          <>
            <PowerRow which="base" name={ch.base.name} state={me.base} power={ch.base.id} />
            {!g.learning && <PowerRow which="favor" name={ch.favor.name} state={me.favor} power={ch.favor.id} />}
            {me.companion && <KulRow />}
          </>
        )}
      </ul>
    </div>
  );
}

function SultanPowers() {
  const { g } = useGame();
  const tr = g.tracks.treason;
  return (
    <>
      <li className={g.ferman ? '' : 'used'}><i className="d" /><b>{t('ferman')}</b><small>{t(g.ferman ? 'fermanReady' : 'fermanUsed')}</small></li>
      <li className={tr >= 2 ? 'used' : 'lock'}><i className="d" /><b>{t('sorusturma')}</b><small>{t(tr >= 2 ? 'trackPowerTaken' : 'opensAt', { n: 2 })}</small></li>
      <li className={g.hazineDefteri ? '' : tr >= 3 ? 'used' : 'lock'}><i className="d" /><b>{t('hazineDefteri')}</b><small>{t(g.hazineDefteri ? 'hazinePending' : tr >= 3 ? 'trackPowerTaken' : 'opensAt', { n: 3 })}</small></li>
    </>
  );
}

function PowerRow({ which, name, state, power }: { which: 'base' | 'favor'; name: string; state: PowerState; power: string }) {
  const { g, seat, act, setPicker } = useGame();
  const [armed, setArmed] = useState(false);
  const free = FREE_POWERS[power] ? freePowerTargets(g, seat, power) : null;
  const usable = !!free;
  const sub = state === 'used' ? t('used') : state === 'locked' ? t('favorLocked') : armed ? t('tapAgain') : usable ? t('tapToUse') : t(which === 'base' ? 'baseReady' : 'favorReady');
  const use = () => {
    if (!free) return;
    sfx('tap');
    if (FREE_POWERS[power].target) {
      setPicker({ legal: free, onPick: id => { act({ t: 'power', power, target: id }); setPicker(null); } });
    } else if (armed) { act({ t: 'power', power }); setArmed(false); }
    else { setArmed(true); setTimeout(() => setArmed(false), 3000); }
  };
  return (
    <li className={[state === 'used' && 'used', state === 'locked' && 'lock', usable && 'live'].filter(Boolean).join(' ')} onClick={use}>
      <i className="d" /><b>{name}</b><small>{sub}</small>
    </li>
  );
}

function KulRow() {
  const { me } = useGame();
  const c = companionById[me.companion!];
  const down = me.influence < 1;
  const spentGame = !!c.special && c.freq === 'once' && me.companionUsed;
  const spentCrisis = !!c.recast && me.companionUsed;
  const sub = down ? t('kulDown') : spentGame ? t('used') : spentCrisis ? t('kulUsedCrisis') : c.recast ? t('kulRecast', { card: recastName(c.recast) }) : t('kulSpecial');
  return <li className={down || spentGame || spentCrisis ? 'used' : ''}><i className="d" /><b>{c.name}</b><small>{sub}</small></li>;
}
const recastName = (id: string) => intrigueById[id].name;

export function Hand() {
  const { me, hand, setSheet, asks } = useGame();
  if (me.sultan || asks[0]?.type === 'appoint') return null;   // Süleyman holds no cards; appointing shows the seats here
  const tap = (uid: number) => {
    sfx('tap');
    if (hand.mode === 'view') {
      const c = me.hand.find(x => x.uid === uid)!;
      return setSheet({ t: 'card', ref: intrRef(c) });
    }
    if (hand.mode === 'play' || hand.mode === 'keep') return hand.setSel(hand.sel[0] === uid ? [] : [uid]);
    hand.setSel(hand.sel.includes(uid) ? hand.sel.filter(x => x !== uid) : [...hand.sel, uid]);
  };
  const w = Math.min(96, Math.floor((316 - 9 * (me.hand.length - 1)) / Math.max(1, me.hand.length)));   // fit the space left of the prompt
  return (
    <div className="hand">
      <AnimatePresence initial={false}>
        {me.hand.map(c => {
          const sel = hand.sel.includes(c.uid);
          const cls = ['hc', sel && 'sel', sel && hand.mode === 'discard' && 'toss'].filter(Boolean).join(' ');
          return (
            <motion.button type="button" key={c.uid} className={cls} style={{ width: w, height: w * 1.4 }} onClick={() => tap(c.uid)}
              layout initial={{ y: -60, opacity: 0, rotate: -6 }} animate={{ y: sel ? (hand.mode === 'discard' ? 14 : -18) : 0, opacity: 1, rotate: 0 }}
              exit={{ y: -90, opacity: 0, scale: 0.8 }} transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              onContextMenu={e => { e.preventDefault(); setSheet({ t: 'card', ref: intrRef(c) }); }}>
              <Card spec={specOf(c)} width={w} />
            </motion.button>
          );
        })}
      </AnimatePresence>
      {!me.hand.length && <p className="empty-hand">{t('emptyHand')}</p>}
    </div>
  );
}
const specOf = (c: { kind: string; field: 'harem' | 'divan' }) => spec(intrRef(c));
