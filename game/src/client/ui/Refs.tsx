// Names of other cards and powers inside interface text get a dashed underline, so "Tamamlarsan Yön Değiştir açılır"
// reads as pointing at a card. The names are the active mod's; a name that is also a game term (İtiraz is both a power
// and the Objection) is left plain.
import { Fragment } from 'react';
import { CHARACTERS, COMPANIONS, INTRIGUE, MISC, TERMS } from '../../engine/index.ts';
import { cardWords, kulWords, onWordsChange, powerName, termStems, treasonWords } from '../words.ts';

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
let re: RegExp | null = null;
onWordsChange(() => { re = null; });

function build(): RegExp {
  const termWords = new Set(Object.keys(TERMS).flatMap(termStems));
  const names = [
    ...INTRIGUE.map(c => cardWords(c.id).name),
    ...COMPANIONS.map(c => kulWords(c.id).name),
    ...CHARACTERS.flatMap(c => [c.base, ...(c.favor ? [c.favor] : [])]).map(p => powerName(p.id)),
    ...Object.keys(MISC.treason).filter(k => k !== '1' && k !== 'death').map(k => treasonWords(k).name),   // the Sultan's death is an ending, not a power
  ].filter(n => !termWords.has(n) && !n.startsWith('⟦'));
  if (!names.length) return /(?!)/gu;
  return new RegExp(`(?<![\\p{L}\\p{N}])(${[...new Set(names)].sort((a, b) => b.length - a.length).map(esc).join('|')})(?:['’]\\p{L}+|\\p{L}*)`, 'gu');
}

/** Text with every card or power name underlined. */
export function Refs({ text }: { text: string }) {
  re ??= build();
  const out: React.ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(re)) {
    out.push(text.slice(last, m.index), <span key={m.index} className="ref">{m[0]}</span>);
    last = m.index! + m[0].length;
  }
  out.push(text.slice(last));
  return <Fragment>{out}</Fragment>;
}
