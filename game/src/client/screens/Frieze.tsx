// The row of figures along the bottom of the home and lobby screens: which Characters, how tall and where come from
// the mod's skin; a Character without a cut-out is left out.
import { frieze, portrait } from '../skin.ts';

export function Frieze() {
  return (
    <div className="frieze" aria-hidden="true">
      {frieze().map(({ char, size, x }) => {
        const p = portrait(char);
        if (!p) return null;
        const w = size * 1.5, h = w * p.niche.ar;
        return <img key={char} src={p.src} alt="" style={{ left: x, width: w, height: h, bottom: -h * 0.3 }} />;
      })}
    </div>
  );
}
