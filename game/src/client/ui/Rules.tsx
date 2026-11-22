// The rules, inside the game: a sheet over whatever is on screen (home, the lobby or the game), opening on a grid of
// sections. Each section is a page of short paragraphs; arrows (and the arrow keys) step between them. The words are the
// rules.* sentences in lang/<lang>.json, so every mod reads them in its own terms. Two marks in them: *bold*, and
// [[section]] or [[section|words]], a link to another section (shown with its title when no words are given).
// manual.html stays the long-form source.
import { Fragment, useEffect, useSyncExternalStore, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { RULES } from '../../engine/index.ts';
import { t } from '../strings.ts';
import { treasonWords } from '../words.ts';
import { Em, Gl } from './marks.tsx';

/** One paragraph: its icon, its sentence (rules.<section>.<key>) and, for the crisis steps, a step name in front. */
interface Item { icon: string; key: string; lead?: string }
interface Section { id: string; icon: string; items: Item[]; steps?: boolean }

const SECTIONS: Section[] = [
  { id: 'goal', icon: 'allegiance', items: [
    { icon: 'suleyman', key: 'ruler' }, { icon: 'allegiance', key: 'sides' }, { icon: 'death', key: 'win' },
    { icon: 'influence', key: 'race' }, { icon: 'suspect', key: 'talk' },
  ] },
  { id: 'hold', icon: 'character', items: [
    { icon: 'character', key: 'character' }, { icon: 'allegiance', key: 'allegiance' }, { icon: 'companion', key: 'companion' },
    { icon: 'intrigue', key: 'hand' }, { icon: 'ambition', key: 'ambition' }, { icon: 'influence', key: 'influence' },
    { icon: 'suleyman', key: 'ruler' }, { icon: 'favor', key: 'learning' },
  ] },
  { id: 'crisis', icon: 'crisis', steps: true, items: [
    { icon: 'crisis', key: 'crisis', lead: 'step.crisis' }, { icon: 'minister', key: 'appoint', lead: 'step.appoint' },
    { icon: 'court', key: 'court', lead: 'step.court' }, { icon: 'kader', key: 'kader', lead: 'step.kader' },
    { icon: 'treason', key: 'result', lead: 'step.result' }, { icon: 'decree', key: 'decree', lead: 'step.decree' },
  ] },
  { id: 'court', icon: 'court', items: [
    { icon: 'court', key: 'waves' }, { icon: 'saray', key: 'fields' }, { icon: 'secret', key: 'anon' },
    { icon: 'companion', key: 'companion' }, { icon: 'seal', key: 'timing' }, { icon: 'intrigue', key: 'draw' },
    { icon: 'ferman', key: 'end' },
  ] },
  { id: 'fate', icon: 'kader', items: [
    { icon: 'min1', key: 'min1' }, { icon: 'min2', key: 'min2' }, { icon: 'secret', key: 'silence' },
    { icon: 'kader', key: 'deck' }, { icon: 'loyalty', key: 'loyalty' }, { icon: 'treason', key: 'treason' },
  ] },
  { id: 'influence', icon: 'influence', items: [
    { icon: 'influence', key: 'start' }, { icon: 'decree', key: 'decree' }, { icon: 'objection', key: 'objection' },
    { icon: 'companion', key: 'zero' }, { icon: 'ambition', key: 'winner' },
  ] },
];

// ---------- open and close from anywhere: undefined is closed, null the grid, a section id that section

let at: string | null | undefined;
const subs = new Set<() => void>();
const go = (to: string | null | undefined) => { at = to; subs.forEach(f => f()); };
export const openRules = (section: string | null = null) => go(section);
const useAt = () => useSyncExternalStore(f => { subs.add(f); return () => subs.delete(f); }, () => at);

// the numbers the sentences quote, from the rules the engine plays by
const vars = () => ({
  loyalty: RULES.tracks.loyalty, treason: RULES.tracks.treason, hand: RULES.handLimit, cost: RULES.objectionCost,
  h: RULES.kader.hizmet, x: RULES.kader.hiyanet,
});
const title = (id: string) => t(`rules.${id}`);

/** A sentence with its *bold* and [[links]] made real. */
function Text({ text }: { text: string }) {
  const out: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(/\[\[(\w+)(?:\|([^\]]+))?\]\]|\*([^*]+)\*/g)) {
    out.push(text.slice(last, m.index));
    out.push(m[1]
      ? <button type="button" key={m.index} className="rl-link" onClick={() => go(m[1])}>{m[2] ?? title(m[1])}</button>
      : <b key={m.index}>{m[3]}</b>);
    last = m.index + m[0].length;
  }
  out.push(text.slice(last));
  return <Fragment>{out}</Fragment>;
}

/** What the Treason spaces bring, in this mod's words: the space, the power's name and what it does. */
function TreasonSpaces() {
  const spaces = Array.from({ length: RULES.tracks.treason }, (_, i) => i + 1)
    .map(n => ({ n, key: n === RULES.tracks.treason ? 'death' : RULES.treasonPowers[String(n)] }))
    .filter(s => s.key);
  return (
    <ol className="rl-spaces">
      {spaces.map(s => {
        const w = treasonWords(s.key!);
        return <li key={s.n}><small>{s.n}</small><span><b>{w.name}.</b> {w.text}</span></li>;
      })}
    </ol>
  );
}

function Page({ s }: { s: Section }) {
  const v = vars();
  return (
    <ul className={`rl-items ${s.steps ? 'steps' : ''}`}>
      {s.items.map((it, i) => (
        <li key={it.key} className={it.key === 'treason' ? 'wide' : ''}>
          <Em k={it.icon} s={22} />
          <p>
            {it.lead && <b className="rl-lead">{i + 1}. {t(it.lead)} </b>}
            <Text text={t(`rules.${s.id}.${it.key}`, v)} />
          </p>
          {s.id === 'fate' && it.key === 'treason' && <TreasonSpaces />}
        </li>
      ))}
    </ul>
  );
}

export function RulesSheet() {
  const now = useAt();
  const i = SECTIONS.findIndex(s => s.id === now);
  const s = SECTIONS[i];
  const step = (d: number) => { const n = SECTIONS[i + d]; if (n) go(n.id); };
  useEffect(() => {
    if (now === undefined) return;
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') go(now === null ? undefined : null);
      else if (now !== null && e.key === 'ArrowLeft') step(-1);
      else if (now !== null && e.key === 'ArrowRight') step(1);
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [now]);
  return (
    <AnimatePresence>
      {now !== undefined && (
        <motion.div key="rules" className="full zp sheet rules" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          <div className="bd block">
            <div className="rl-head">
              {s ? (
                <>
                  <button type="button" className="rl-back" onClick={() => go(null)}><Gl k="back" />{t('rules')}</button>
                  <p className="h-mid"><Em k={s.icon} s={26} />{title(s.id)}</p>
                  <span className="rl-step">
                    <button type="button" disabled={i === 0} onClick={() => step(-1)} aria-label={t('rules.prev')}><Gl k="back" /></button>
                    <small>{i + 1}/{SECTIONS.length}</small>
                    <button type="button" disabled={i === SECTIONS.length - 1} onClick={() => step(1)} aria-label={t('rules.next')}><Gl k="next" /></button>
                  </span>
                </>
              ) : <p className="h-mid">{t('rules')}</p>}
              <button type="button" className="rl-close" onClick={() => go(undefined)} aria-label={t('close')}><Gl k="close" /></button>
            </div>
            {s ? (
              <div className="rl-body" key={s.id}><Page s={s} /></div>
            ) : (
              <div className="rl-grid">
                {SECTIONS.map(x => (
                  <button type="button" key={x.id} onClick={() => go(x.id)}><Em k={x.icon} s={48} /><b>{title(x.id)}</b></button>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
