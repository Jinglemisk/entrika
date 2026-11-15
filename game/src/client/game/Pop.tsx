// The card pop-up: the card itself, centred and big enough to read, and beneath it only what the card can't say: who it
// may target, the state of its powers, and the buttons for what you can do with it right now (discard, keep, play as
// printed or through your Kul or Esma Hatun, use a power). Seat, secret and private-info sheets share the frame.
import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import {
  FREE_POWERS, MISC, characterById, companionById, crisisById, freePowerTargets, intrigueById,
  playableForms, waveAllowance, type PowerDef, type PowerState,
} from '../../engine/index.ts';
import { Card } from '../cards/Card.tsx';
import { spec, type CardRef } from '../cardSpecs.ts';
import { Em, Gl } from '../ui/marks.tsx';
import { KulHead } from '../ui/Figure.tsx';
import { Refs } from '../ui/Refs.tsx';
import { t } from '../strings.ts';
import { sfx } from '../sound.ts';
import { Btn } from './Prompt.tsx';
import { useGame, type Form } from './ctx.ts';

const TARGET_ICON = { player: 'court', minister: 'minister', other: 'court', self: 'character' } as const;
export const POP_CARD = 178;   // one card; two side by side use POP_PAIR
export const POP_PAIR = 162;

/** The pop-up frame: dimmed table behind, the card(s) centred, extra info beneath, tap outside to close. */
export function PopShell({ zone = 'zl', className = '', onClose, cards, children }: {
  zone?: 'zl' | 'zp'; className?: string; onClose?: () => void; cards?: ReactNode; children?: ReactNode;
}) {
  return (
    <motion.div className="popbg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} onClick={onClose}>
      <motion.div className={`pop ${zone} ${className}`} initial={{ scale: 0.94, y: 10 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 420, damping: 32 }}
        onClick={e => e.stopPropagation()}>
        {onClose && <button type="button" className="x-close" onClick={onClose} aria-label={t('close')}><Gl k="close" /></button>}
        {cards && <div className="pop-cards">{cards}</div>}
        {children && <div className="pop-info">{children}</div>}
      </motion.div>
    </motion.div>
  );
}

export function CardPop({ cardRef, uid, own }: { cardRef: CardRef; uid?: number; own?: boolean }) {
  const { setSheet } = useGame();
  const close = () => setSheet(null);
  return (
    <PopShell onClose={close} cards={<Card spec={spec(cardRef)} width={POP_CARD} />}>
      <Extra cardRef={cardRef} uid={uid} own={own} close={close} />
    </PopShell>
  );
}

/** What the card face can't show. Kader and Taraf cards say everything themselves. */
function Extra({ cardRef, uid, own, close }: { cardRef: CardRef; uid?: number; own?: boolean; close: () => void }) {
  switch (cardRef.t) {
    case 'intr': {
      const def = intrigueById[cardRef.kind];
      return (
        <>
          <p className="pop-meta"><Em k={TARGET_ICON[def.target]} s={15} />{t(`target.${def.target}`)}</p>
          {uid !== undefined && <HandActions uid={uid} close={close} />}
        </>
      );
    }
    case 'char': return <PowerChips id={cardRef.id} own={!!own} close={close} />;
    case 'kul': return <KulState id={cardRef.id} own={!!own} />;
    case 'crisis': {
      const c = crisisById[cardRef.id];
      return <p className="pop-meta"><Em k={c.field} s={15} />{t(`fieldRule.${c.field}`)}</p>;
    }
    case 'hirs': return own ? <AmbitionState /> : null;
    default: return null;
  }
}

/** Your Hırs: done, met (opens at the end of the crisis), or what it would unlock. */
export function AmbitionState() {
  const { me } = useGame();
  const favor = characterById[me.character].favor.name;
  if (!me.ambition) return null;
  return <p className="pop-note"><Em k="ambition" s={15} /><span><Refs text={me.ambitionShown ? t('ambitionDone') : me.ambitionMet ? t('ambitionMet') : t('ambitionUnlocks', { favor })} /></span></p>;
}

// ---------- a card in your hand

function HandActions({ uid, close }: { uid: number; close: () => void }) {
  const { g, seat, me, hand, asks } = useGame();
  const done = (f: () => void) => () => { sfx('tap'); f(); close(); };
  if (hand.mode === 'discard') {
    const a = asks[0];
    const n = a?.type === 'discard' ? a.n : 0;
    const on = hand.sel.includes(uid);
    const full = !on && hand.sel.length >= n;
    return (
      <div className="pop-acts">
        <Btn pri={!on} off={full} onClick={done(() => hand.setSel(on ? hand.sel.filter(x => x !== uid) : [...hand.sel, uid]))}>
          {t(on ? 'pop.undiscard' : 'pop.discard')}
        </Btn>
        <span className="pop-note">{t('pop.discardCount', { n: hand.sel.length, total: n })}</span>
      </div>
    );
  }
  if (hand.mode === 'keep') {
    return <div className="pop-acts"><Btn pri onClick={done(() => hand.setSel([uid]))}>{t('btn.keep')}</Btn></div>;
  }
  const sealed = g.court?.submitted[seat];
  const mine = Array.isArray(sealed) ? sealed.find(x => x.uid === uid) : undefined;
  if (mine) return <p className="pop-note">{t('pop.sealedOn', { name: g.players[mine.target].name })}</p>;
  if (hand.mode !== 'play') return <p className="pop-note">{t('pop.playsInCourt')}</p>;

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
  const esmaReady = me.companion === 'esma' && me.influence > 0 && !me.companionUsed && !hand.staged.some(s => s.esma);
  const aim = (f: Form, esma: boolean) => done(() => hand.setAim({ ...f, uid, esma }));
  const kul = me.companion;
  return (
    <div className="pop-acts">
      {forms.map(f => (
        <div key={f.as + f.field} className="pop-row">
          <Btn pri={!f.recast} via={f.recast && kul ? { icon: <KulHead id={kul} />, label: companionById[kul].name } : undefined} onClick={aim(f, false)}>
            {f.recast ? t('pop.playAs', { card: intrigueById[f.as].name }) : t('pop.play')}
            {f.recast && f.as === 'akil-hocasi' && <small><Em k={f.field} s={14} />{t(f.field)}</small>}
          </Btn>
          {esmaReady && (
            <Btn via={{ icon: <KulHead id="esma" />, label: companionById.esma.name }} onClick={aim(f, true)}>{t('pop.withEsma')}</Btn>
          )}
        </div>
      ))}
    </div>
  );
}

// ---------- a Character's powers: one chip each, its state, and Kullan when it can be used now

const FREQ_ICON = { once: 'once', crisis: 'percrisis', always: 'always' } as const;
const STATE_TEXT = (s: PowerState) => t(s === 'used' ? 'used' : s === 'locked' ? 'favorLocked' : 'ready');

export function PowerChips({ id, own, close }: { id: string; own: boolean; close: () => void }) {
  const { g } = useGame();
  const ch = characterById[id];
  if (ch.sultan) return <SultanChips />;
  const holder = g.players.find(p => p.character === id);
  return (
    <>
      <div className="chips">
        <PowerChip def={ch.base} which="base" state={holder?.base ?? 'ready'} own={own} close={close} />
        {!g.learning && <PowerChip def={ch.favor} which="favor" state={holder?.favor ?? 'locked'} own={own} close={close} />}
      </div>
      {own && !g.learning && <AmbitionState />}
    </>
  );
}

function PowerChip({ def, which, state, own, close }: { def: PowerDef; which: 'base' | 'favor'; state: PowerState; own: boolean; close: () => void }) {
  const { g, seat, act, setPicker } = useGame();
  const free = own && FREE_POWERS[def.id] ? freePowerTargets(g, seat, def.id) : null;
  if (free) {
    const use = () => {
      close();
      if (FREE_POWERS[def.id].target) setPicker({ legal: free, onPick: target => { setPicker(null); act({ t: 'power', power: def.id, target }); } });
      else act({ t: 'power', power: def.id });
    };
    return <Btn pri onClick={use}>{t('btn.use')}: {def.name}{FREE_POWERS[def.id].target ? <small>{t('pop.thenSeat')}</small> : null}</Btn>;
  }
  return (
    <span className={`pchip ${state}`}>
      <Em k={which} s={15} /><b>{def.name}</b>{def.freq && <Em k={FREQ_ICON[def.freq]} s={13} />}<i>{STATE_TEXT(state)}</i>
    </span>
  );
}

function SultanChips() {
  const { g } = useGame();
  const tr = g.tracks.treason;
  const chip = (icon: string, name: string, state: PowerState, sub: string) => (
    <span key={name} className={`pchip ${state}`}><Em k={icon} s={15} /><b>{name}</b><i>{sub}</i></span>
  );
  return (
    <div className="chips">
      {chip('ferman', characterById.suleyman.base.name, g.ferman ? 'ready' : 'used', t(g.ferman ? 'fermanReady' : 'fermanUsed'))}
      {chip('treason', MISC.treason.sorusturma.name, tr >= 2 ? 'used' : 'locked', t(tr >= 2 ? 'trackPowerTaken' : 'opensAt', { n: 2 }))}
      {chip('treason', MISC.treason.hazineDefteri.name, g.hazineDefteri ? 'ready' : tr >= 3 ? 'used' : 'locked',
        t(g.hazineDefteri ? 'hazinePending' : tr >= 3 ? 'trackPowerTaken' : 'opensAt', { n: 3 }))}
    </div>
  );
}

// ---------- a Kul

export function KulState({ id, own }: { id: string; own: boolean }) {
  const { g } = useGame();
  const c = companionById[id];
  const holder = g.players.find(p => p.companion === id);
  const state = !holder ? null : holder.influence < 1 ? t('kulDown') : c.freq !== 'always' && holder.companionUsed ? t(c.recast ? 'kulUsedCrisis' : 'used') : t('ready');
  return (
    <>
      <p className="pop-meta">{c.freq && <Em k={FREQ_ICON[c.freq]} s={15} />}{t(`freq.${c.freq}`)}{state ? ` · ${state}` : ''}</p>
      {own && c.recast && <p className="pop-note"><span><Refs text={t('pop.kulHow', { card: intrigueById[c.recast].name })} /></span></p>}
      {own && <p className="pop-note">{t('pop.kulUp')}</p>}
    </>
  );
}
