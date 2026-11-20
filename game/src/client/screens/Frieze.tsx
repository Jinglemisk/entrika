// The row of figures along the bottom of the home and lobby screens. The mod's skin only says who stands in it; the
// layout is the same for every mod: even spacing, every head the same size (each portrait's niche crop already scales
// its head to the niche), the ruler a little larger and on top, and the row fading out at the bottom. Sizes are
// fractions of the strip's width, so each screen just sets the strip's width and place in CSS.
import { characterById } from '../../engine/index.ts';
import { frieze, portrait } from '../skin.ts';

const RATIO = 1 / 3;    // the strip's height to its width
const HEAD_TOP = 0.2;   // where the heads' tops line up, as a share of the strip's height

export function Frieze() {
  const ids = frieze().filter(c => portrait(c));
  const n = ids.length;
  return (
    <div className="frieze" aria-hidden="true">
      {ids.map((c, i) => {
        const k = portrait(c)!.niche;
        const big = characterById[c]?.sultan ? 1.12 : 1;
        const w = k.w * (1.5 / n) * big;                       // image width, in strip widths
        const h = w * k.ar / RATIO;                             // image height, in strip heights
        const top = (big > 1 ? HEAD_TOP * 0.55 : HEAD_TOP) - k.y0 * h;
        return (
          <img key={c} src={portrait(c)!.src} alt=""
            style={{ left: `${((i + 0.5) / n - k.hx * w) * 100}%`, top: `${top * 100}%`, width: `${w * 100}%`, zIndex: big > 1 ? n : n - Math.round(Math.abs(i - (n - 1) / 2)) }} />
        );
      })}
    </div>
  );
}
