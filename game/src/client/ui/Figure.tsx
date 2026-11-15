// A Character standing in an arched niche: the cut-out is drawn twice, masked to the arch and clipped to a band so the
// head breaks the frame (v3 design). Characters without a cut-out show a plain silhouette.
import placement from '../../../../art/stills/placement.json' with { type: 'json' };

export interface Niche { hx: number; y0: number; ar: number; w: number }
const PLACE = placement as Record<string, { niche?: Niche; card?: { cl: number; cw: number; ct: number; op: string } }>;
const ARCH = 'M.5 119.5V46C.5 22 30 12 50 .6 70 12 99.5 22 99.5 46v73.5z';

export const cutSrc = (character: string) => `/art/directions/img/cut-char.${character}.webp`;
export const hasCut = (character: string) => !!PLACE[`char.${character}`]?.niche;
export const cardPlacement = (character: string) => PLACE[`char.${character}`]?.card;
export const nichePlacement = (character: string) => PLACE[`char.${character}`]?.niche;

export function Figure({ character, nw, brk = 9 }: { character: string; nw: number; brk?: number }) {
  const k = nichePlacement(character);
  if (!k) {
    return (
      <>
        <svg viewBox="0 0 100 120" preserveAspectRatio="none" aria-hidden="true"><path d={ARCH} /></svg>
        <svg viewBox="0 0 100 120" className="sil" aria-hidden="true"><circle cx="50" cy="46" r="17" /><path d="M14 120c2-30 16-44 36-44s34 14 36 44z" /></svg>
      </>
    );
  }
  const iw = k.w * nw, ih = iw * k.ar, left = nw / 2 - k.hx * iw, top = -brk - k.y0 * ih;
  const img = <img src={cutSrc(character)} alt="" draggable={false} style={{ left, top, width: iw, height: ih }} />;
  return (
    <>
      <svg viewBox="0 0 100 120" preserveAspectRatio="none" aria-hidden="true"><path d={ARCH} /></svg>
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
