// The row of court figures along the bottom of the home and lobby screens.
import { cutSrc, nichePlacement } from '../ui/Figure.tsx';

const ROW: [string, number, number][] = [
  ['hatice', 84, 0], ['mihrimah', 88, 66], ['rustem', 98, 132], ['suleyman', 116, 206], ['hurrem', 94, 306], ['ibrahim', 88, 378], ['mahidevran', 90, 444],
];

export function Frieze() {
  return (
    <div className="frieze" aria-hidden="true">
      {ROW.map(([c, w, x]) => {
        const k = nichePlacement(c);
        const ar = k?.ar ?? 4 / 3;
        return <img key={c} src={cutSrc(c)} alt="" style={{ left: x, width: w * 1.5, height: w * 1.5 * ar, bottom: -w * 1.5 * ar * 0.3 }} />;
      })}
    </div>
  );
}
