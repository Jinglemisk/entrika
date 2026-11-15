// Names of other cards and powers inside interface text get a dashed underline, so "Tamamlarsan Yön Değiştir açılır"
// reads as pointing at a card. The names come from the content files; game terms that are not card names
// (İtiraz is both a power and the Objection) are left plain.
import { Fragment } from 'react';
import terms from '../../../../art/terms.json' with { type: 'json' };
import { CHARACTERS, COMPANIONS, INTRIGUE, MISC } from '../../engine/index.ts';

const termWords = new Set((terms.terms as { id: string; stems: string[] }[]).filter(x => x.id.startsWith('term.')).flatMap(x => x.stems));
const names = [
  ...INTRIGUE.map(c => c.name),
  ...COMPANIONS.map(c => c.name),
  ...CHARACTERS.flatMap(c => [c.base.name, ...(c.favor ? [c.favor.name] : [])]),
  ...Object.entries(MISC.treason).filter(([k]) => k !== '1').map(([, v]) => v.name),
].filter(n => !termWords.has(n));
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const RE = new RegExp(`(?<![\\p{L}\\p{N}])(${[...new Set(names)].sort((a, b) => b.length - a.length).map(esc).join('|')})(?:['’]\\p{L}+|\\p{L}*)`, 'gu');

/** Text with every card or power name underlined. */
export function Refs({ text }: { text: string }) {
  const out: React.ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(RE)) {
    out.push(text.slice(last, m.index), <span key={m.index} className="ref">{m[0]}</span>);
    last = m.index! + m[0].length;
  }
  out.push(text.slice(last));
  return <Fragment>{out}</Fragment>;
}
