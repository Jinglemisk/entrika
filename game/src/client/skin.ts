// The look a phone shows: the active mod's skin (mods/<id>/skin.json and the files it names), switched with the mod's
// words. The game knows the layout (card size, where the name, art window, text plate and corner icons sit; the seat
// row, the shelf) and nothing about any world: frames, colours, icons, portraits, stills, the seal, the frieze, fonts
// and music all come from here. A piece the mod lacks comes from the neutral skin in game/skin/, never from another mod.
//   skin.json      what the skin is made of (see docs/mods.md)
//   skin.css       interface tokens, fonts and decoration, loaded as a stylesheet: url()s resolve against the mod folder
//   portraits.json each Character's cut-out and its card and niche crops (written by art/tools/portrait.py)
// Paths in skin.json are relative to the mod folder; a path starting with / is a URL on the game server (/art/...).
import neutralJson from '../../skin/skin.json' with { type: 'json' };
import { currentMod, onWordsChange } from './words.ts';

export type Face = 'char' | 'sultan' | 'kul' | 'intr' | 'crisis' | 'kader-h' | 'kader-x' | 'hirs' | 'taraf-s' | 'taraf-h';
export type Deck = 'intr' | 'kader' | 'taraf' | 'hirs' | 'kul' | 'char' | 'crisis';
export interface Still { src: string; pos?: string }
export interface Portrait {
  src: string;
  card: { cl: number; cw: number; ct: number; op: string };   // the cut-out on a Character card (art window units)
  niche: { hx: number; y0: number; ar: number; w: number };   // the cut-out in a seat's niche (Figure.tsx)
}
export interface Music { drone: number[]; scale: number[]; wave?: OscillatorType; beat?: [number, number] }
interface FaceDef { frame: string; base: [string, string]; darkGems?: boolean; art?: string; backdrop?: string; breakY?: number }
interface SkinDef {
  defs?: string;
  faces?: Partial<Record<Face, FaceDef>>;
  backs?: Partial<Record<Deck, string>>;
  tints?: Record<string, [string, string]>;
  art?: Record<string, Still>;
  icons?: { dir: string; version?: string };
  niche?: { path: string; mask?: string; sultan?: string };
  seal?: string;
  frieze?: { char: string; size: number; x: number }[];
  music?: Music;
}

// Everything the renderer reads synchronously is bundled: skin.json, portraits.json, the SVG and HTML files a skin
// names, the icon colours. Images, skin.css and fonts load by URL from the server's /mods/ and /art/.
const ROOT = '../../../';
const SKINS = import.meta.glob('../../../mods/*/skin.json', { eager: true, import: 'default' }) as Record<string, SkinDef>;
const PORTRAITS = import.meta.glob('../../../mods/*/portraits.json', { eager: true, import: 'default' }) as Record<string, Record<string, Portrait>>;
const FILES = import.meta.glob(['../../../mods/*/**/*.svg', '../../../mods/*/**/*.html', '../../skin/**/*.svg', '!../../../mods/*/art/**', '!../../../mods/*/icons/**'],
  { eager: true, query: '?raw', import: 'default' }) as Record<string, string>;
const COLOURS = import.meta.glob(['../../../mods/*/icons/meaning.json', '../../../art/icons/meaning.json'], { eager: true, import: 'default' }) as
  Record<string, { colours: Record<string, { paper: string; lacquer: string; terms: string[] }> }>;

/** One skin, its paths resolved: `key` finds a bundled file, `url` an image. */
interface Loaded {
  def: SkinDef; portraits: Record<string, Portrait>;
  key: (p: string) => string; url: (p: string) => string;
}
function load(def: SkinDef, dir: string | null): Loaded {
  // a bundled file's glob key; /art/... and /mods/... are repo paths
  const key = (p: string) => (p.startsWith('/') ? ROOT + p.slice(1) : dir ? `${ROOT}mods/${dir}/${p}` : `../../skin/${p}`);
  const url = (p: string) => (p.startsWith('/') || !dir ? p : `/mods/${dir}/${p}`);
  return { def, portraits: (dir && PORTRAITS[`${ROOT}mods/${dir}/portraits.json`]) || {}, key, url };
}
const NEUTRAL = load(neutralJson as unknown as SkinDef, null);
const loaded = new Map<string, Loaded | null>();
function skinOf(id: string): Loaded | null {
  if (!loaded.has(id)) {
    const def = SKINS[`${ROOT}mods/${id}/skin.json`];
    loaded.set(id, def ? load(def, id) : null);
  }
  return loaded.get(id)!;
}
const mod = () => skinOf(currentMod());

/** A bundled text file (SVG or HTML) of a skin, with its relative href/src made absolute. */
function text(s: Loaded, p: string | undefined): string | undefined {
  if (!p) return undefined;
  const raw = FILES[s.key(p)];
  if (raw === undefined) return undefined;
  return raw.replace(/\b(href|src)="(?![#/]|data:|https?:)([^"]+)"/g, (_, a, v) => `${a}="${s.url(v)}"`);
}

// ---------- cards
/** A card face's frame file, split into the layers the renderer stacks (docs/mods.md, "Card frames"). */
export interface FaceLayers {
  window?: string; under: string; frame: string; top: string; slot: string; small: string; slotSmall: string;
  base: [string, string]; darkGems: boolean; art?: string; backdrop?: string; breakY?: number;
}
/** The inside of the <g data-layer="name"> element of an SVG file, or ''. */
function layer(svg: string, name: string): string {
  const open = svg.indexOf(`data-layer="${name}"`);
  if (open < 0) return '';
  const start = svg.indexOf('>', open) + 1;
  const tag = /<g\b[^>]*?(\/?)>|<\/g>/g;
  tag.lastIndex = start;
  let depth = 1, m: RegExpExecArray | null;
  while ((m = tag.exec(svg))) {
    if (m[0] === '</g>') { if (--depth === 0) return svg.slice(start, m.index); } else if (!m[1]) depth++;
  }
  return '';
}
const inner = (svg: string) => svg.slice(svg.indexOf('>', svg.indexOf('<svg')) + 1, svg.lastIndexOf('</svg>'));
const faceCache = new Map<string, FaceLayers>();
export function face(f: Face): FaceLayers {
  const k = `${currentMod()}/${f}`;
  let out = faceCache.get(k);
  if (!out) {
    const s = mod();
    const own = s?.def.faces?.[f];
    const [src, d] = own ? [s!, own] : [NEUTRAL, NEUTRAL.def.faces![f]!];
    const svg = text(src, d.frame) ?? '';
    const win = /<path\b[^>]*data-layer="window"[^>]*>/.exec(svg)?.[0];
    out = {
      window: win ? /\bd="([^"]+)"/.exec(win)?.[1] : undefined,
      under: layer(svg, 'under'), frame: layer(svg, 'frame'), top: layer(svg, 'top'), slot: layer(svg, 'slot'),
      small: layer(svg, 'small'), slotSmall: layer(svg, 'slot-small'),
      base: d.base, darkGems: !!d.darkGems, art: text(src, d.art) ?? text(NEUTRAL, NEUTRAL.def.faces![f]!.art), backdrop: text(src, d.backdrop), breakY: d.breakY,
    };
    faceCache.set(k, out);
  }
  return out;
}
/** A deck's back, the inside of its SVG (500 x 700). */
export function back(deck: Deck): string {
  const s = mod();
  return inner(text(s ?? NEUTRAL, s?.def.backs?.[deck]) ?? text(NEUTRAL, NEUTRAL.def.backs![deck])!);
}
/** The gradients, patterns, filters and symbols every frame and back of the skin points at. */
export const defs = () => {
  const s = mod();
  return inner((s && text(s, s.def.defs)) ?? text(NEUTRAL, NEUTRAL.def.defs)!);
};
/** The photo for a card ("intrigue.valide", "companions.daye", "crises.yeniceri", "kader.h"), if the skin has one. */
export function still(id: string): Still | undefined {
  const s = mod(), a = s?.def.art?.[id];
  return a && { src: s!.url(a.src), pos: a.pos };
}
/** A card's own base colours, for skins that tint cards one by one ("char.hurrem"). */
export const tint = (id: string) => mod()?.def.tints?.[id];
/** A Character's cut-out and its crops, if the skin has one. */
export function portrait(character: string): Portrait | undefined {
  const s = mod(), p = s?.portraits[character];
  return p && { ...p, src: s!.url(p.src) };
}

// ---------- icons
/** The skin's term icons: one silhouette per icon id, tinted for paper (the file) and lacquer (masked with --l). */
function icons() {
  const s = mod(), i = s?.def.icons;
  if (!s || !i) return null;
  const light: Record<string, string> = {};
  const colours = COLOURS[s.key(`${i.dir}meaning.json`)]?.colours ?? {};
  for (const c of Object.values(colours)) for (const t of c.terms) light[t] = c.lacquer;
  return { base: s.url(`${i.dir}set/`), v: i.version ?? '1', light };
}
let iconSet: ReturnType<typeof icons> = null;   // set by apply()
/** An icon's file at a size, or '' when the skin has no icons. */
export const iconUrl = (name: string, size: 48 | 72 | 144 = 48) => (iconSet ? `${iconSet.base}${name}-${size}.png?v=${iconSet.v}` : '');
export const iconLight = (name: string) => iconSet?.light[name] ?? '#efe6cf';
export const iconHtml = (name: string, size: 48 | 72 | 144 = 48) =>
  iconSet ? `<i class="ico" style="--i:url(${iconUrl(name, size)});--l:${iconLight(name)}" aria-hidden="true"></i>` : '';

// ---------- table and screens
const NICHE = NEUTRAL.def.niche!;
/** The seat niche (viewBox 0 0 100 120), its mask, and what Süleyman's seat adds round it (HTML). */
export function niche() {
  const s = mod(), n = s?.def.niche ?? NICHE;
  return { path: n.path, mask: n.mask ?? n.path, sultan: s ? text(s, n.sultan) ?? '' : '' };
}
/** The seal on the Decree screen. */
export const seal = () => { const s = mod(); return s?.def.seal ? s.url(s.def.seal) : undefined; };
/** The figures along the bottom of home and lobby: which Characters, how tall, where. */
export const frieze = () => mod()?.def.frieze ?? [];
export const music = () => mod()?.def.music;

// ---------- switching: the skin follows the mod (words.ts setWords)
const listeners = new Set<() => void>();
/** Called when the skin changes, after the words: for things built from the skin outside React (music). */
export const onSkinChange = (f: () => void) => listeners.add(f);
let applied: string | null = null;
function apply() {
  const id = currentMod();
  if (id === applied) return;
  applied = id;
  faceCache.clear();
  iconSet = icons();
  if (typeof document === 'undefined') return;
  // skin.css: the stylesheet of a mod with a skin, after the game's own (neutral) styles
  let link = document.getElementById('skin-css') as HTMLLinkElement | null;
  const css = mod() ? `/mods/${id}/skin.css` : null;
  if (css) {
    if (!link) { link = Object.assign(document.createElement('link'), { id: 'skin-css', rel: 'stylesheet' }); document.head.append(link); }
    if (link.getAttribute('href') !== css) link.href = css;
  } else link?.remove();
  // the niche shape and the Kul emblem are used by CSS masks
  const root = document.documentElement.style;
  root.setProperty('--arch', `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 120' preserveAspectRatio='none'><path d='${niche().mask}'/></svg>`)}")`);
  const kul = iconUrl('companion', 72);
  if (kul) root.setProperty('--kul-icon', `url(${kul})`); else root.removeProperty('--kul-icon');
  listeners.forEach(f => f());
}
onWordsChange(apply);
apply();
