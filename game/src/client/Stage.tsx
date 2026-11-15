// Every screen is drawn on one 852×393 landscape canvas (an iPhone held sideways) and scaled to fit the window,
// so the layout is the same on every phone and on a desktop browser.
import { useEffect, useState, type ReactNode } from 'react';
import { t } from './strings.ts';

export const W = 852;
export const H = 393;

function fit() {
  const vw = window.innerWidth, vh = window.innerHeight;
  return { scale: Math.min(vw / W, vh / H), portrait: vh > vw * 1.1 && vw < 700 };
}

export function Stage({ children, theme = 'zp' }: { children: ReactNode; theme?: string }) {
  const [f, setF] = useState(fit);
  useEffect(() => {
    const on = () => setF(fit());
    window.addEventListener('resize', on);
    window.addEventListener('orientationchange', on);
    return () => { window.removeEventListener('resize', on); window.removeEventListener('orientationchange', on); };
  }, []);
  return (
    <div className="stage">
      <div className={`ph ui th-split ${theme}`} lang="tr" style={{ transform: `scale(${f.scale})` }}>
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
