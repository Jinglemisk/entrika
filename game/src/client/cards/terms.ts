// Inline term icons: every game term in card text gets its icon in front of it, driven by art/terms.json.
// Port of the art page's DOM renderer, working on strings instead of nodes.
import terms from '../../../../art/terms.json' with { type: 'json' };

export const ICON_BASE = '/art/icons/set/';

interface Term { id: string; stems: string[]; icon: string }

const byStem = new Map<string, Term>();
for (const t of terms.terms as Term[]) for (const s of t.stems) byStem.set(s, t);
// longer stems first, so Saray Dedikodusu wins over Saray and Birinci Vekil over Vekil
const stems = [...byStem.keys()].sort((a, b) => b.length - a.length);
const reEsc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const TERM_RE = new RegExp(terms.match.regex.replace('STEMS', stems.map(reEsc).join('|')), terms.match.flags);

function renderText(text: string): string {
  return text.replace(TERM_RE, (m, stem: string) => {
    const t = byStem.get(stem)!;
    const ref = /^(card|comp|char)\./.test(t.id) ? ' ref' : '';   // another card named in the text: dashed underline
    return `<span class="tm t-${t.icon}${ref}" data-term="${t.id}"><img class="ico" src="${ICON_BASE}${t.icon}-48.png" alt="" aria-hidden="true">${m}</span>`;
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
