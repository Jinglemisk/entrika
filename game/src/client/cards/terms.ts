// Inline term icons: every game term in card text gets its icon in front of it. What counts as a term comes from the
// active mod's words (term stems, card, Kul and Character names, power names) and its icon from content/terms.json.
// Port of the art page's DOM renderer, working on strings instead of nodes.
import meaning from '../../../../art/icons/meaning.json' with { type: 'json' };
import { CHARACTERS, COMPANIONS, INTRIGUE, MISC, TERMS } from '../../engine/index.ts';
import { cardWords, charWords, kulWords, onWordsChange, powerName, termStems, treasonWords } from '../words.ts';

export const ICON_BASE = '/art/icons/set/';
// ?v= changes whenever the set is redrawn under the same file names, so browsers drop cached icons.
export const iconUrl = (name: string, size: 48 | 72 | 144 = 48) => `${ICON_BASE}${name}-${size}.png?v=2`;

// Kat'ı icons: each file is the silhouette tinted with its paper colour. On dark grounds the CSS masks the same file
// with the icon's lacquer colour (--l), from art/icons/meaning.json.
const LIGHT: Record<string, string> = {};
for (const c of Object.values(meaning.colours)) for (const t of c.terms) LIGHT[t] = c.lacquer;
export const iconLight = (name: string) => LIGHT[name] ?? '#efe6cf';
export const iconHtml = (name: string, size: 48 | 72 | 144 = 48) =>
  `<i class="ico" style="--i:url(${iconUrl(name, size)});--l:${iconLight(name)}" aria-hidden="true"></i>`;

/** One thing the matcher finds: its id (term.*, card.*, kul.*, char.*, power.*, treason.*) and its icon. */
interface Term { id: string; icon: string }

// A stem matches at the start of a word and runs on through any following letters, so Turkish suffixes stay attached
// (Nüfuzu, Vekile, Divan'da). Matching is case-sensitive. \p{L} with the u flag, not \b: \b treats ı, ş and ğ as
// word breaks. Longer stems go first, so Mühürlü Evrak wins over Mühür and Birinci Vekil over Vekil.
const reEsc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
let matcher: { byStem: Map<string, Term>; re: RegExp } | null = null;
onWordsChange(() => { matcher = null; });

function build() {
  const byStem = new Map<string, Term>();
  const add = (id: string, icon: string | null | undefined, stems: string[]) => {
    if (icon) for (const s of stems) if (s && !s.startsWith('⟦')) byStem.set(s, { id, icon });
  };
  // other cards named in the text first, so a game term spelled the same way wins
  for (const c of INTRIGUE) add(`card.${c.id}`, 'intrigue', [cardWords(c.id).name]);
  for (const c of COMPANIONS) add(`kul.${c.id}`, 'companion', [kulWords(c.id).name]);
  for (const c of CHARACTERS) if (!c.sultan) add(`char.${c.id}`, 'character', [charWords(c.id).short]);
  for (const c of CHARACTERS) for (const p of [c.base, c.favor]) if (p?.icon) add(`power.${p.id}`, p.icon, [powerName(p.id)]);
  for (const [id, p] of Object.entries(MISC.treason)) if (p.icon) add(`treason.${id}`, p.icon, [treasonWords(id).name]);
  for (const [id, d] of Object.entries(TERMS)) add(`term.${id}`, d.icon, termStems(id));
  const stems = [...byStem.keys()].sort((a, b) => b.length - a.length);
  const re = stems.length ? new RegExp(`(?<![\\p{L}\\p{N}])(${stems.map(reEsc).join('|')})(?:['’]\\p{L}+|\\p{L}*)`, 'gu') : /(?!)/gu;
  return { byStem, re };
}

/** Every stem the matcher knows in the active mod and language, with its icon (the text editor lists them). */
export function knownTerms(): { stem: string; icon: string; id: string }[] {
  matcher ??= build();
  return [...matcher.byStem].map(([stem, t]) => ({ stem, ...t }));
}

function renderText(text: string): string {
  matcher ??= build();
  const { byStem, re } = matcher;
  return text.replace(re, (m, stem: string) => {
    const t = byStem.get(stem)!;
    const ref = /^(card|kul|char|power)\./.test(t.id) ? ' ref' : '';   // another card named in the text: dashed underline
    return `<span class="tm t-${t.icon}${ref}" data-term="${t.id}">${iconHtml(t.icon)}${m}</span>`;
  });
}

/** Plain text in, HTML out: escapes the text, then puts an icon in front of every term. */
export function termsHtml(text: string): string {
  return renderText(text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'));
}

const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
const TAG_RE = /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][\w:-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g;
const CLASS_RE = /(?:^|\s)class\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/;

// frequency pills (data-noterms) and power names (.pn) stay plain; .tm is already rendered
function skips(attrs: string): boolean {
  if (/(?:^|\s)data-noterms(?=[\s=/]|$)/.test(attrs)) return true;
  const c = CLASS_RE.exec(attrs);
  const cls = c ? (c[1] ?? c[2] ?? c[3]).split(/\s+/) : [];
  return cls.includes('pn') || cls.includes('tm');
}

/** Applies the term renderer to the text nodes of an HTML fragment, skipping [data-noterms], .pn and rendered terms. */
export function termsInHtml(html: string): string {
  const open: { tag: string; skip: boolean }[] = [];
  const skipping = () => open.length > 0 && open[open.length - 1].skip;
  let out = '', last = 0, m: RegExpExecArray | null;
  TAG_RE.lastIndex = 0;
  while ((m = TAG_RE.exec(html))) {
    const text = html.slice(last, m.index);
    out += skipping() ? text : renderText(text);
    out += m[0];
    last = TAG_RE.lastIndex;
    if (!m[2]) continue; // comment
    const tag = m[2].toLowerCase();
    if (m[1]) { // closing tag: pop to its opener
      const i = open.map((o) => o.tag).lastIndexOf(tag);
      if (i >= 0) open.length = i;
    } else if (!VOID.has(tag) && !m[3].trimEnd().endsWith('/')) {
      open.push({ tag, skip: skipping() || skips(m[3]) });
    }
  }
  const rest = html.slice(last);
  return out + (skipping() ? rest : renderText(rest));
}
