// Card faces and backs as HTML strings. Every card is a 500 x 700 unit drawing (1 unit = 0.2cqw) with a fixed layout:
// the art window from (50, 72) to (450, the name line), the name band on the name line, the text plate under it down to
// 650, and two corner icon slots at (60, 60) and (440, 60). Everything drawn round that layout comes from the active
// mod's skin (skin.ts): the frame layers, the window's shape, the drawn art, the backs. Stacking, bottom to top:
//   base colour -> under -> art (photo, cut-out on its backdrop, or drawn art) -> frame -> cut-out head breaking the
//   frame -> top -> corner slots -> HTML: corner icons, name, text plate
// Under 150 px wide the card switches to the skin's compact layers (small, slot-small); under 90 px the name goes too
// (cards.css).
import { termsInHtml } from './terms.ts';
import { face, back, iconHtml, type Deck, type Face } from '../skin.ts';

export type CardKind = 'char' | 'kul' | 'intr' | 'crisis' | 'kader-h' | 'kader-x' | 'hirs' | 'taraf-s' | 'taraf-h';
export type BackKind = Deck;
type Freq = 'once' | 'crisis' | 'always';

export interface CardSpec {
  kind: CardKind;
  face: Face;                                                    // which of the skin's frames: the kind, or 'sultan'
  name: string;
  med: string;                                                   // corner-slot icon id
  field?: 'harem' | 'divan' | 'saray' | 'ly' | 'tr';
  fieldLabel?: string;                                           // the field slot's tooltip ("Alan: Harem")
  art?: { src: string; pos?: string };                           // photo in the window (full URL)
  cut?: { src: string; cl: number; cw: number; ct: number; op: string }; // a Character's cut-out (skin.ts Portrait.card)
  tint?: [string, string];                                       // this card's own base colours, if the skin tints it
  bodyHtml: string;
  flavor?: string;
  stamp?: { text: string; tone: 'used' | 'ok' };                 // a state stamped across the picture (Kul used, Hırs done)
}

// ------------------------------------------------------------------ the fixed layout, in card units
const NAME_Y = 380;                         // the name line; Character cards sit it 30 higher, for two powers and a flavor line
const WX0 = 50, WX1 = 450, WYT = 72;        // the art window: left, right, top
const SLOTS = [60, 440], SLOT_Y = 60;       // corner icon slots
const SLOTS_SMALL = [84, 416], SLOT_Y_SMALL = 84;   // the same, on the compact frame

// ------------------------------------------------------------------ number printing (kept from the art page)
const fx = (n: number, d: number) => n.toFixed(d);
/** str() of a Python float: integral values keep their ".0". */
const pf = (n: number) => (Number.isInteger(n) ? `${n}.0` : String(n));
const q = (u: number) => `${fx(u * 0.2, 2)}cqw`;
/** urllib.parse.quote(s, safe=''): encodeURIComponent plus the five characters it leaves alone. */
const pyQuote = (s: string) => encodeURIComponent(s).replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase());
// the window path as a mask, in the art box's own coordinates (viewBox offset), fully percent-encoded
function maskUri(path: string, x0: number, yt: number, w: number, h: number): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='${x0} ${yt} ${w} ${h}' preserveAspectRatio='none'><path d='${path}'/></svg>`;
  return 'url(data:image/svg+xml,' + pyQuote(svg) + ')';
}
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
const layer = (cls: string, inner: string) => `<svg class="L ${cls}" viewBox="0 0 500 700" aria-hidden="true">${inner}</svg>`;
const at = (x: number, y: number, inner: string) => `<g transform="translate(${x} ${y})">${inner}</g>`;

const FIELD_ICON = { harem: 'harem', divan: 'divan', saray: 'saray', ly: 'loyalty', tr: 'treason' } as const;
const FQ: Record<Freq, string> = { once: 'once', crisis: 'percrisis', always: 'always' };

// ------------------------------------------------------------------ text helpers
/** The frequency icon on its disc; the words ("Oyunda bir") are the tooltip. */
export function freqHtml(freq: Freq, label: string): string {
  return `<span class="fq" title="${esc(label)}" aria-label="${esc(label)}" role="img" data-noterms>${iconHtml(FQ[freq])}</span>`;
}

/** A body paragraph with term icons. */
export function para(textHtml: string): string {
  return `<p data-terms>${termsInHtml(textHtml)}</p>`;
}

const LOCK = '<svg viewBox="0 0 20 20" aria-hidden="true"><rect x="4.5" y="9" width="11" height="8" rx="1.5"/><path d="M7 9V6.5a3 3 0 016 0V9"/></svg>';

/** The state of a power in play: used powers are faded and labelled, a locked Lütuf power carries a lock. */
export interface PowerMark { state: 'ready' | 'used' | 'locked'; label: string }

/** A Character power: frequency icon (freqHtml, or ''), name, text, in one run. Base and Lütuf look alike (the Lütuf
 *  power is the lower one); a mark shows its state in play. */
export function powerHtml(kind: 'base' | 'favor', name: string, freq: string, textHtml: string, mark?: PowerMark): string {
  const st = mark && mark.state !== 'ready'
    ? `<span class="pw-st ${mark.state}" title="${esc(mark.label)}">${mark.state === 'locked' ? LOCK : esc(mark.label)}</span>` : '';
  const inner = `${freq ? freq + ' ' : ''}<b class="pn">${name}:</b> ${textHtml}`;
  return `<div class="pw ${kind} ${mark?.state ?? ''}">${st}<p data-terms>${termsInHtml(inner)}</p></div>`;
}

/** The ornament between the two powers (styled by the skin). */
export const POWER_SEP = '<div class="pw-sep" aria-hidden="true"><i></i></div>';

// ------------------------------------------------------------------ the card
export function cardHtml(s: CardSpec): string {
  const { kind, name, med, field, cut } = s;
  const f = face(s.face);
  const [e1, e2] = s.tint ?? f.base;
  const cy = kind === 'char' ? NAME_Y - 30 : NAME_Y;
  const full = kind === 'crisis';           // a Crisis is all picture: the art box runs edge to edge (cards.css .v-full)
  const ah = cy - WYT;
  const mask = !full && f.window ? `;--am:${maskUri(f.window, WX0, WYT, WX1 - WX0, ah)}` : '';

  // ---- art: a cut-out on its backdrop, a photo, or the skin's drawn art
  let img: string;
  if (cut) {
    img = (f.backdrop ?? '') + `<img class="fig" src="${cut.src}" alt="" decoding="sync" `
      + `style="left:${pf(cut.cl)}%;width:${pf(cut.cw)}%;top:${pf(cut.ct)}cqw;object-position:${cut.op}">`;
  } else if (s.art) {
    img = `<img src="${s.art.src}" alt="" style="object-position:${s.art.pos ?? '50% 30%'}" decoding="sync">`;
  } else {
    img = f.art ?? '';
  }
  const artHtml = `<div class="art" style="--ax:${q(WX0)};--ay:${q(WYT)};--aw:${q(WX1 - WX0)};--ah:${q(ah)}${mask}">${img}</div>`;

  // ---- a cut-out's head rising over the frame: a band 64 % of the window wide, down to the skin's break line
  let cutHtml = '';
  if (cut && f.breakY) {
    const bx0 = WX0 + (WX1 - WX0) * .18, bw = (WX1 - WX0) * .64;
    const il = (cut.cl / 100 * (WX1 - WX0) + WX0 - bx0) * .2;    // image left inside the band, cqw
    const iw = cut.cw / 100 * (WX1 - WX0) * .2;
    cutHtml = `<div class="cut big" style="left:${q(bx0)};width:${q(bw)};height:${q(f.breakY)}">`
      + `<img src="${cut.src}" alt="" decoding="sync" style="left:${fx(il, 2)}cqw;width:${fx(iw, 2)}cqw;top:${fx(WYT * .2 + cut.ct, 2)}cqw"></div>`;
  }

  // ---- corner slots: the left one always, the right one when the card has a field
  const used = field ? SLOTS : SLOTS.slice(0, 1), usedSmall = field ? SLOTS_SMALL : SLOTS_SMALL.slice(0, 1);
  const slots = layer('big', used.map(x => at(x, SLOT_Y, f.slot)).join(''));
  const slotsSmall = layer('small', usedSmall.map(x => at(x, SLOT_Y_SMALL, f.slotSmall)).join(''));

  // ---- HTML text
  const fld = field
    ? `<span class="fj" title="${esc(s.fieldLabel ?? '')}" aria-label="${esc(s.fieldLabel ?? '')}" role="img">${iconHtml(FIELD_ICON[field], 72)}</span>` : '';
  const nmCls = [...name].length > 13 ? 'nm long' : 'nm';
  const py = cy + 42, ph = 650 - cy - 42; // the plate starts right under the name and runs to the bottom margin
  const plate = `<div class="plate big" style="--py:${q(py)};--ph:${q(ph)}"><div class="pin">${s.bodyHtml}`
    + (s.flavor ? `<p class="fl">${s.flavor}</p>` : '') + '</div></div>';
  // a lot of rules text (Hatice Sultan) can't take the bigger type small whole cards use
  const dense = s.bodyHtml.replace(/<[^>]*>/g, '').length > 190 && 'dense';
  const cls = ['c3', `t-${kind}`, `f-${s.face}`, full && 'v-full', f.darkGems && 'gem-dk', dense].filter(Boolean).join(' ');
  return `<article class="${cls}" style="--e1:${e1};--e2:${e2};--cy:${q(cy)}" aria-label="${esc(name)}">`
    + `<div class="base"></div>${layer('big', f.under)}${artHtml}${layer('big', f.frame)}${cutHtml}${layer('big', f.top)}${slots}`
    + `${layer('small', f.small)}${slotsSmall}`
    + `<span class="mj">${iconHtml(med, 72)}</span>${fld}<h4 class="${nmCls}">${name}</h4>${plate}`
    + (s.stamp ? `<span class="stamp ${s.stamp.tone}">${esc(s.stamp.text)}</span>` : '') + '</article>';
}

// ------------------------------------------------------------------ card backs
/** A deck's back: the skin's drawing, with `word` printed on it ("ENTRİKA"); `label` is what a screen reader hears. */
export function backHtml(kind: BackKind, word: string, label: string): string {
  return `<article class="c3 back b-${kind}" role="img" aria-label="${esc(label)}">${layer('', back(kind))}`
    + `<div class="bk"><span class="bw">${esc(word)}</span></div></article>`;
}
