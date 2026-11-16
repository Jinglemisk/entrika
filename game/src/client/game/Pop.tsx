// The card pop-up: the card itself, as big as the screen allows. The card carries its own state (spent powers, a Kul
// used or face down, a Hırs done), so beneath it there is only what you can do with it now: discard, keep, play as
// printed or through your Kul, use a power. Seat, secret and private-info sheets share the frame.
import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import {
  FREE_POWERS, characterById, companionById, freePowerTargets, intrigueById, playableForms, waveAllowance,
  type Game, type Player,
} from '../../engine/index.ts';
import { Card } from '../cards/Card.tsx';
import { spec, type CardRef } from '../cardSpecs.ts';
import { Em, Gl } from '../ui/marks.tsx';
import { KulHead } from '../ui/Figure.tsx';
import { t } from '../strings.ts';
import { sfx } from '../sound.ts';
import { Btn } from './Prompt.tsx';
import { useGame, type Form, type GameCtx } from './ctx.ts';

/** Card widths in a pop-up: as big as the 393 px stage allows, a little smaller when a row sits beneath. */
export const POP_BIG = 258;
export const POP_CARD = 226;

// ---------- cards as they stand in play

/** A Character card showing which of its powers are spent or still locked. */
export function charRef(g: Game, character: string): CardRef {
  const p = g.players.find(x => x.character === character);
  if (!p) return { t: 'char', id: character };
  if (p.sultan) return { t: 'char', id: character, st: { base: g.ferman ? 'ready' : 'used' } };
  return { t: 'char', id: character, st: { base: p.base, favor: g.learning ? 'locked' : p.favor } };
}
/** A player's Kul card, stamped when it is face down (0 Influence) or spent. */
export function kulRef(p: Player): CardRef {
  const c = companionById[p.companion!];
  const st = p.influence < 1 ? 'down' : c.freq !== 'always' && p.companionUsed ? 'used' : undefined;
  return { t: 'kul', id: c.id, ...(st ? { st } : {}) };
}
/** Your Hırs card, stamped once completed. */
export const hirsRef = (p: Player): CardRef => ({ t: 'hirs', id: p.ambition!, done: p.ambitionMet || p.ambitionShown });

// ---------- the frame

/** The table blacked out behind, the card(s) floating in the middle, anything else beneath, tap outside to close. */
export function PopShell({ className = '', onClose, cards, children }: {
  className?: string; onClose?: () => void; cards?: ReactNode; children?: ReactNode;
}) {
  return (
    <motion.div className="popbg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} onClick={onClose}>
      <motion.div className={`pop zl ${className}`} initial={{ scale: 0.94, y: 10 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 420, damping: 32 }}
        onClick={e => e.stopPropagation()}>
        {onClose && <button type="button" className="x-close" onClick={onClose} aria-label={t('close')}><Gl k="close" /></button>}
        {cards && <div className="pop-cards">{cards}</div>}
        {children && <div className="pop-info">{children}</div>}
      </motion.div>
    </motion.div>
  );
}

export function CardPop({ cardRef, uid, own }: { cardRef: CardRef; uid?: number; own?: boolean }) {
  const ctx = useGame();
  const close = () => ctx.setSheet(null);
  const below = cardRef.t === 'intr' && uid !== undefined ? handActions(ctx, uid, close)
    : cardRef.t === 'char' && own ? powerButtons(ctx, cardRef.id, close)
    : null;
  return (
    <PopShell onClose={close} cards={<Card spec={spec(cardRef)} width={below ? POP_CARD : POP_BIG} />}>
      {below}
    </PopShell>
  );
}

// ---------- a card in your hand: what you can do with it now

function handActions({ g, seat, me, hand, asks }: GameCtx, uid: number, close: () => void): ReactNode {
  const done = (f: () => void) => () => { sfx('tap'); f(); close(); };
  if (hand.mode === 'discard') {
    const a = asks[0];
    const n = a?.type === 'discard' ? a.n : 0;
    const on = hand.sel.includes(uid);
    return (
      <div className="pop-acts">
        <Btn pri={!on} off={!on && hand.sel.length >= n} onClick={done(() => hand.setSel(on ? hand.sel.filter(x => x !== uid) : [...hand.sel, uid]))}>
          {t(on ? 'pop.undiscard' : 'pop.discard')} <small>{hand.sel.length}/{n}</small>
        </Btn>
      </div>
    );
  }
  if (hand.mode === 'keep') return <div className="pop-acts"><Btn pri onClick={done(() => hand.setSel([uid]))}>{t('btn.keep')}</Btn></div>;
  const sealed = g.court?.submitted[seat];
  const mine = Array.isArray(sealed) ? sealed.find(x => x.uid === uid) : undefined;
  if (mine) return <p className="pop-note">{t('pop.sealedOn', { name: g.players[mine.target].name })}</p>;
  if (hand.mode !== 'play') return null;

  const staged = hand.staged.find(s => s.uid === uid);
  if (staged) {
    return (
      <div className="pop-acts">
        <span className="pop-note">{t('pop.stagedOn', { name: g.players[staged.target].name })}</span>
        <Btn onClick={done(() => hand.setStaged(hand.staged.filter(s => s.uid !== uid)))}>{t('btn.undo')}</Btn>
      </div>
    );
  }
  if (hand.staged.length >= waveAllowance(g, seat)) return <p className="pop-note">{t('pop.waveFull')}</p>;
  const recastUsed = hand.staged.some(s => s.recast);
  const forms = playableForms(g, seat, uid).filter(f => !(f.recast && recastUsed));
  if (!forms.length) return <p className="pop-note bad">{t('pop.cantPlay')}</p>;
  const aim = (f: Form) => done(() => hand.setAim({ ...f, uid }));
  const kul = me.companion;
  return (
    <div className="pop-acts">
      {forms.map(f => (
        <div key={f.as + f.field} className="pop-row">
          <Btn pri={!f.recast} via={f.recast && kul ? { icon: <KulHead id={kul} />, label: companionById[kul].name } : undefined} onClick={aim(f)}>
            {f.recast ? t('pop.playAs', { card: intrigueById[f.as].name }) : t('pop.play')}
            {f.recast && f.as === 'akil-hocasi' && <small><Em k={f.field} s={14} />{t(f.field)}</small>}
          </Btn>
        </div>
      ))}
    </div>
  );
}

// ---------- your Character: a button for each power you can use right now

function powerButtons({ g, seat, act, setFreePick }: GameCtx, character: string, close: () => void): ReactNode {
  const ch = characterById[character];
  const usable = [ch.base, ch.favor].filter(d => d && FREE_POWERS[d.id] && freePowerTargets(g, seat, d.id));
  if (!usable.length) return null;
  const use = (power: string) => () => {
    close();
    const targets = freePowerTargets(g, seat, power)!;
    if (FREE_POWERS[power].target) setFreePick({ power, legal: targets, n: FREE_POWERS[power].target === 'two' ? 2 : 1, chosen: [] });
    else act({ t: 'power', power });
  };
  return (
    <div className="pop-acts">
      {usable.map(d => (
        <Btn key={d!.id} pri onClick={use(d!.id)}>{t('btn.use')}: {d!.name}{FREE_POWERS[d!.id].target ? <small>{t('pop.thenSeat')}</small> : null}</Btn>
      ))}
    </div>
  );
}
