// A Character standing in an arched niche: the cut-out is drawn twice, masked to the arch and clipped to a band so the
// head breaks the frame (v3 design). Characters without a cut-out show a plain silhouette.
import placement from '../../../../art/stills/placement.json' with { type: 'json' };
import { companionById } from '../../engine/index.ts';

export interface Niche { hx: number; y0: number; ar: number; w: number }
const PLACE = placement as Record<string, { niche?: Niche; card?: { cl: number; cw: number; ct: number; op: string } }>;
const ARCH = 'M.5 119.5V46C.5 22 30 12 50 .6 70 12 99.5 22 99.5 46v73.5z';

export const cutSrc = (character: string) => `/art/directions/img/cut-char.${character}.webp`;
export const hasCut = (character: string) => !!PLACE[`char.${character}`]?.niche;
export const cardPlacement = (character: string) => PLACE[`char.${character}`]?.card;
export const nichePlacement = (character: string) => PLACE[`char.${character}`]?.niche;

// Süleyman's niche keeps the arch's shape and adds gilding round it: an outer gold rim, an inner gold line, rosettes
// where the arch springs, and plinths at its foot.
const GILD = (
  <>
    <svg viewBox="0 0 100 120" preserveAspectRatio="none" className="gild" aria-hidden="true">
      <path className="rim" d="M-3.5 120V46C-3.5 19 27 8 50 -4C73 8 103.5 19 103.5 46V120" />
      <path className="ln" d="M7 120V48C7 28 33 17 50 7C67 17 93 28 93 48V120" />
      <path className="pl" d="M-5 110H12V120H-5Z M88 110H105V120H88Z" />
    </svg>
    <i className="ros l" /><i className="ros r" />
  </>
);

/** The niche behind a seat. Behind the figure sit the arch, a lattice for a Vekil (shown by CSS on .vk) and, for
 *  Süleyman, the gilding. */
export function Figure({ character, nw, brk = 9, gilded }: { character: string; nw: number; brk?: number; gilded?: boolean }) {
  const k = nichePlacement(character);
  const ground = (
    <>
      <svg viewBox="0 0 100 120" preserveAspectRatio="none" aria-hidden="true"><path d={ARCH} /></svg>
      <i className="nbg" />
      {gilded && GILD}
    </>
  );
  if (!k) {
    return (
      <>
        {ground}
        <svg viewBox="0 0 100 120" className="sil" aria-hidden="true"><circle cx="50" cy="46" r="17" /><path d="M14 120c2-30 16-44 36-44s34 14 36 44z" /></svg>
      </>
    );
  }
  const iw = k.w * nw, ih = iw * k.ar, left = nw / 2 - k.hx * iw, top = -brk - k.y0 * ih;
  const img = <img src={cutSrc(character)} alt="" draggable={false} style={{ left, top, width: iw, height: ih }} />;
  return (
    <>
      {ground}
      <div className="fg in">{img}</div>
      <div className="fg out">{img}</div>
    </>
  );
}

/** A round head crop for pills and lists. */
export function Head({ character }: { character: string }) {
  const k = nichePlacement(character);
  if (!k) return <i className="head none" />;
  return <img className="head" src={cutSrc(character)} alt="" style={{ objectPosition: `${k.hx * 100}% ${Math.max(0, k.y0 * 100 - 2)}%` }} />;
}

/** A Kul's round head, from its card art; the Kul emblem when it has none. */
export function KulHead({ id }: { id: string }) {
  const art = companionById[id]?.art;
  if (!art) return <i className="head kul-em" />;
  return <img className="head" src={art.src} alt="" style={{ objectPosition: art.pos }} />;
}
