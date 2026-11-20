// Every screen is drawn on one 852×393 landscape canvas (an iPhone held sideways) and scaled to fit the window,
// so the layout is the same on every phone and on a desktop browser. Home and the lobby also stand upright on a
// 393×852 canvas, so a name can be typed with the phone held normally; the game asks for the phone turned.
import { useEffect, useState, type ReactNode } from 'react';
import { usePrefs } from './prefs.ts';
import { t } from './strings.ts';

export const W = 852;
export const H = 393;

function fit(upright: boolean) {
  const vw = window.innerWidth, vh = window.innerHeight;
  // upright by the screen's own orientation, so a keyboard shrinking the window doesn't turn the canvas sideways
  const o = screen.orientation?.type;
  const upr = (o ? o.startsWith('portrait') : vh > vw) && vw < 700;
  const tall = upright && upr;
  const portrait = !upright && upr && vh > vw * 1.1;
  const [w, h] = tall ? [H, W] : [W, H];
  return { scale: Math.min(vw / w, vh / h), portrait, tall };
}

export function Stage({ children, theme = 'zp', upright = false }: { children: ReactNode; theme?: string; upright?: boolean }) {
  const { lang } = usePrefs();
  const [f, setF] = useState(() => fit(upright));
  useEffect(() => setF(fit(upright)), [upright]);
  useEffect(() => {
    const on = () => setF(fit(upright));
    window.addEventListener('resize', on);
    window.addEventListener('orientationchange', on);
    return () => { window.removeEventListener('resize', on); window.removeEventListener('orientationchange', on); };
  }, [upright]);
  return (
    <div className="stage">
      <div className={`ph ui th-split ${theme} ${f.tall ? 'tall' : ''}`} lang={lang} style={{ transform: `scale(${f.scale})` }}>
        {children}
      </div>
      {f.portrait && (
        <div className="rotate">
          <svg viewBox="0 0 64 64" aria-hidden="true"><rect x="20" y="8" width="24" height="44" rx="4" /><path d="M10 40a24 24 0 0 0 34 16M44 56l-1-7 7 1" /></svg>
          <p>{t('rotate')}</p>
        </div>
      )}
    </div>
  );
}
