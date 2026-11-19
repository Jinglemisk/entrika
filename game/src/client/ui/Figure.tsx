// A Character standing in a niche: the cut-out is drawn twice, masked to the niche and clipped to a band so the head
// breaks the frame (v3 design). Characters without a cut-out show a plain silhouette. The niche's shape, the Sultan
// seat's ornament and the portraits come from the mod's skin.
import { niche, portrait, still } from '../skin.ts';

/** The niche behind a seat. Behind the figure sit the niche, a ground the skin can pattern for a Vekil (.nbg, shown
 *  on .vk) and, for Süleyman, the skin's ornament. A cut-out too short for the niche (a wide source frame, or a narrow
 *  niche) is scaled up until it reaches the niche's foot. */
export function Figure({ character, nw, nh, brk = 9, gilded }: { character: string; nw: number; nh: number; brk?: number; gilded?: boolean }) {
  const p = portrait(character), k = p?.niche;
  const n = niche();
  const ground = (
    <>
      <svg viewBox="0 0 100 120" preserveAspectRatio="none" aria-hidden="true"><path d={n.path} /></svg>
      <i className="nbg" />
      {gilded && n.sultan && <div className="gilded" dangerouslySetInnerHTML={{ __html: n.sultan }} />}
    </>
  );
  if (!p || !k) {
    return (
      <>
        {ground}
        <svg viewBox="0 0 100 120" className="sil" aria-hidden="true"><circle cx="50" cy="46" r="17" /><path d="M14 120c2-30 16-44 36-44s34 14 36 44z" /></svg>
      </>
    );
  }
  const w = Math.max(k.w, (nh + brk) / (nw * k.ar * (1 - k.y0)));
  const iw = w * nw, ih = iw * k.ar, left = nw / 2 - k.hx * iw, top = -brk - k.y0 * ih;
  const img = <img src={p.src} alt="" draggable={false} style={{ left, top, width: iw, height: ih }} />;
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
  const p = portrait(character);
  if (!p) return <i className="head none" />;
  return <img className="head" src={p.src} alt="" style={{ objectPosition: `${p.niche.hx * 100}% ${Math.max(0, p.niche.y0 * 100 - 2)}%` }} />;
}

/** A Kul's round head, from its card art; the Kul emblem when it has none. */
export function KulHead({ id }: { id: string }) {
  const art = still(`companions.${id}`);
  if (!art) return <i className="head kul-em" />;
  return <img className="head" src={art.src} alt="" style={{ objectPosition: art.pos }} />;
}
