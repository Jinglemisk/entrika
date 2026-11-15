// The card pop-up: a card at reading size with what you can do with it right now. Tapping any card opens it: a hand
// card offers discard, keep or the ways to play it (as printed, through your Kul, with Esma Hatun); your Character
// and Kul show their powers, with Kullan when one can be used now. The pop-up only answers what the prompt asks.
import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import {
  FREE_POWERS, MISC, ambitionById, characterById, companionById, crisisById, freePowerTargets, intrigueById,
  playableForms, waveAllowance, type PowerDef, type PowerState,
} from '../../engine/index.ts';
import { Card } from '../cards/Card.tsx';
import { spec, type CardRef } from '../cardSpecs.ts';
import { Em, Gl } from '../ui/marks.tsx';
import { KulHead } from '../ui/Figure.tsx';
import { t } from '../strings.ts';
import { sfx } from '../sound.ts';
import { Btn } from './Prompt.tsx';
import { useGame, type Form } from './ctx.ts';

const TARGET_ICON = { player: 'court', minister: 'minister', other: 'court', self: 'character' } as const;

/** The pop-up frame every compact sheet shares: dimmed table behind, a box sized to its content, tap outside to close. */
export function PopShell({ zone = 'zl', className = '', onClose, children }: { zone?: 'zl' | 'zp'; className?: string; onClose?: () => void; children: ReactNode }) {
  return (
    <motion.div className="popbg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} onClick={onClose}>
      <motion.div className={`pop ${zone} ${className}`} initial={{ scale: 0.94, y: 10 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 420, damping: 32 }}
        onClick={e => e.stopPropagation()}>
        {children}
      </motion.div>
    </motion.div>
  );
}
export function PopClose({ onClick }: { onClick: () => void }) {
  return <button type="button" className="x-close" onClick={onClick} aria-label={t('close')}><Gl k="close" /></button>;
}

export function CardPop({ cardRef, uid, own }: { cardRef: CardRef; uid?: number; own?: boolean }) {
  const { setSheet } = useGame();
  const close = () => setSheet(null);
  const s = spec(cardRef);
  return (
    <PopShell onClose={close}>
      <Card spec={s} width={168} />
      <div className="pop-body">
        <PopClose onClick={close} />
        <Head1 cardRef={cardRef} />
        <p className="pop-name">{s.name}</p>
        <Body cardRef={cardRef} uid={uid} own={own} close={close} />
      </div>
    </PopShell>
  );
}

function Head1({ cardRef }: { cardRef: CardRef }) {
  const field = cardRef.t === 'intr' ? cardRef.field : cardRef.t === 'crisis' ? crisisById[cardRef.id].field : null;
  const icon = { intr: 'intrigue', char: 'character', kul: 'companion', hirs: 'ambition', crisis: 'crisis', kader: 'kader', taraf: 'allegiance' }[cardRef.t];
  return (
    <p className="pop-kind">
      <Em k={icon} s={16} />{t(`kind.${cardRef.t}`)}
      {field && <><i className="sep" /><Em k={field} s={16} />{t(field)}</>}
    </p>
  );
}

function Body({ cardRef, uid, own, close }: { cardRef: CardRef; uid?: number; own?: boolean; close: () => void }) {
  switch (cardRef.t) {
    case 'intr': {
      const def = intrigueById[cardRef.kind];
      return (
        <>
          <p className="pop-text">{def.text}</p>
          <p className="pop-meta"><Em k={TARGET_ICON[def.target]} s={15} />{t(`target.${def.target}`)}</p>
          {uid !== undefined && <HandActions uid={uid} close={close} />}
        </>
      );
    }
    case 'char': return <CharPowers id={cardRef.id} own={!!own} close={close} />;
    case 'kul': return <KulBody id={cardRef.id} own={!!own} />;
    case 'crisis': {
      const c = crisisById[cardRef.id];
      return <><p className="pop-text">{c.text}</p><p className="pop-meta"><Em k={c.field} s={15} />{t(`fieldRule.${c.field}`)}</p></>;
    }
    case 'hirs': return <p className="pop-text">{ambitionById[cardRef.id].text}</p>;
    case 'kader': return <p className="pop-text">{MISC.kader[cardRef.k].text.join(' ')}</p>;
    case 'taraf': return <p className="pop-text">{MISC.taraf[cardRef.side].text.join(' ')}</p>;
  }
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
    <div className="pop-acts col">
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

// ---------- a Character's powers

export function CharPowers({ id, own, close }: { id: string; own: boolean; close: () => void }) {
  const { g, me } = useGame();
  const ch = characterById[id];
  if (ch.sultan) return <SultanPowers />;
  const holder = g.players.find(p => p.character === id);
  return (
    <div className="pop-powers">
      <PowerLine def={ch.base} which="base" state={holder?.base ?? 'ready'} own={own} close={close} />
      {!g.learning && <PowerLine def={ch.favor} which="favor" state={holder?.favor ?? 'locked'} own={own} close={close} />}
      {own && me.ambition && !g.learning && (
        <p className="pop-note"><Em k="ambition" s={15} />{me.ambitionShown ? t('ambitionDone') : me.ambitionMet ? t('ambitionMet') : t('ambitionUnlocks', { favor: ch.favor.name })}</p>
      )}
    </div>
  );
}

const FREQ_ICON = { once: 'once', crisis: 'percrisis', always: 'always' } as const;
function PowerLine({ def, which, state, own, close }: { def: PowerDef; which: 'base' | 'favor'; state: PowerState; own: boolean; close: () => void }) {
  const { g, seat, act, setPicker } = useGame();
  const free = own && FREE_POWERS[def.id] ? freePowerTargets(g, seat, def.id) : null;
  const use = () => {
    sfx('press');
    close();
    if (FREE_POWERS[def.id].target) setPicker({ legal: free!, onPick: target => { setPicker(null); act({ t: 'power', power: def.id, target }); } });
    else act({ t: 'power', power: def.id });
  };
  return (
    <div className={`pwl ${state}`}>
      <p className="pwl-head">
        <Em k={which} s={16} /><b>{def.name}</b>
        {def.freq && <Em k={FREQ_ICON[def.freq]} s={14} />}
        <span className="st8">{state === 'used' ? t('used') : state === 'locked' ? t('favorLocked') : t('ready')}</span>
      </p>
      <p className="pwl-text">{def.text}</p>
      {free && <Btn pri onClick={use}>{t('btn.use')}{FREE_POWERS[def.id].target ? <small>{t('pop.thenSeat')}</small> : null}</Btn>}
    </div>
  );
}

function SultanPowers() {
  const { g } = useGame();
  const tr = g.tracks.treason;
  const ferman = characterById.suleyman.base;
  const row = (name: string, text: string, state: PowerState, sub: string) => (
    <div className={`pwl ${state}`} key={name}>
      <p className="pwl-head"><Em k="treason" s={16} /><b>{name}</b><span className="st8">{sub}</span></p>
      <p className="pwl-text">{text}</p>
    </div>
  );
  return (
    <div className="pop-powers">
      <div className={`pwl ${g.ferman ? 'ready' : 'used'}`}>
        <p className="pwl-head"><Em k="ferman" s={16} /><b>{ferman.name}</b><span className="st8">{t(g.ferman ? 'fermanReady' : 'fermanUsed')}</span></p>
        <p className="pwl-text">{ferman.text}</p>
      </div>
      {row(MISC.treason.sorusturma.name, MISC.treason.sorusturma.text, tr >= 2 ? 'used' : 'locked', t(tr >= 2 ? 'trackPowerTaken' : 'opensAt', { n: 2 }))}
      {row(MISC.treason.hazineDefteri.name, MISC.treason.hazineDefteri.text, g.hazineDefteri ? 'ready' : tr >= 3 ? 'used' : 'locked',
        t(g.hazineDefteri ? 'hazinePending' : tr >= 3 ? 'trackPowerTaken' : 'opensAt', { n: 3 }))}
    </div>
  );
}

// ---------- a Kul

function KulBody({ id, own }: { id: string; own: boolean }) {
  const { g } = useGame();
  const c = companionById[id];
  const holder = g.players.find(p => p.companion === id);
  const state = !holder ? null : holder.influence < 1 ? t('kulDown') : c.freq !== 'always' && holder.companionUsed ? t(c.recast ? 'kulUsedCrisis' : 'used') : t('ready');
  return (
    <>
      <p className="pop-text">{c.text}</p>
      <p className="pop-meta">{c.freq && <Em k={FREQ_ICON[c.freq]} s={15} />}{t(`freq.${c.freq}`)}{state ? ` · ${state}` : ''}</p>
      {own && c.recast && <p className="pop-note">{t('pop.kulHow', { card: intrigueById[c.recast].name })}</p>}
      {own && <p className="pop-note">{t('pop.kulUp')}</p>}
    </>
  );
}
