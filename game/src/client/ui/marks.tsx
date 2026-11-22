// Small marks from the v3 system: line glyphs for interface chrome, the skin's icons for game terms (Em), the Nüfuz star.
import type { CSSProperties } from 'react';
import { iconLight, iconUrl } from '../skin.ts';

const G: Record<string, string> = {
  check: 'M4 10.5l4 4 8-9',
  log: 'M5 5h10M5 10h10M5 15h6',
  close: 'M5 5l10 10M15 5L5 15',
  back: 'M16 10H4M9 5l-5 5 5 5',
  next: 'M4 10h12M11 5l5 5-5 5',
  arrow: 'M7 4l6 6-6 6',
  up: 'M10 15V5M5 9l5-5 5 5',
  down: 'M10 5v10M5 11l5 5 5-5',
  plus: 'M10 4v12M4 10h12',
  share: 'M10 3v10M6 7l4-4 4 4M4 11v5h12v-5',
};
export function Gl({ k, className = '' }: { k: string; className?: string }) {
  if (k === 'lock') return <svg className={`gl ${className}`} viewBox="0 0 20 20" aria-hidden="true"><rect x="4.5" y="9" width="11" height="8" rx="1.5" /><path d="M7 9V6.5a3 3 0 016 0V9" /></svg>;
  if (k === 'set') return <svg className={`gl ${className}`} viewBox="0 0 20 20" aria-hidden="true"><path d="M3 6h7M15 6h2M3 14h2M10 14h7" /><circle cx="12.5" cy="6" r="2.2" /><circle cx="7.5" cy="14" r="2.2" /></svg>;
  if (k === 'eye') return <svg className={`gl ${className}`} viewBox="0 0 20 20" aria-hidden="true"><path d="M2 10s3-5 8-5 8 5 8 5-3 5-8 5-8-5-8-5z" /><circle cx="10" cy="10" r="2.2" /></svg>;
  if (k === 'hold') return <svg className={`gl ${className}`} viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="2.6" /><circle cx="10" cy="10" r="7" strokeDasharray="2.5 3" /></svg>;
  if (k === 'clock') return <svg className={`gl ${className}`} viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7" /><path d="M10 6v4l2.6 1.8" /></svg>;
  if (k === 'help') return <svg className={`gl ${className}`} viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7.5" /><path d="M7.7 8a2.4 2.4 0 1 1 3.3 2.2c-.6.3-1 .8-1 1.4v.4M10 14.2v.1" /></svg>;
  if (k === 'bot') return <svg className={`gl ${className}`} viewBox="0 0 20 20" aria-hidden="true"><rect x="4" y="6" width="12" height="10" rx="2" /><path d="M10 3v3M7.5 11h.01M12.5 11h.01" /></svg>;
  return <svg className={`gl ${className}`} viewBox="0 0 20 20" aria-hidden="true"><path d={G[k]} /></svg>;
}

export const ICON = iconUrl;
export function Em({ k, s = 18, style }: { k: string; s?: number; style?: CSSProperties }) {
  const v = { '--i': `url(${ICON(k, s > 30 ? 144 : s > 20 ? 72 : 48)})`, '--l': iconLight(k) } as CSSProperties;
  return <i className="em ico" aria-hidden="true" style={{ width: s, height: s, ...v, ...style }} />;
}

const STAR = (() => {
  const p: string[] = [];
  for (let i = 0; i < 16; i++) {
    const r = i % 2 ? 8.9 : 11.4, a = (Math.PI * i) / 8 - Math.PI / 2;
    p.push((12 + r * Math.cos(a)).toFixed(2) + ',' + (12 + r * Math.sin(a)).toFixed(2));
  }
  return p.join(' ');
})();
export function Star({ n, size, label }: { n: number; size?: number; label?: string }) {
  const st = size ? { width: size, height: size, fontSize: Math.round(size * 0.52) } : undefined;
  return (
    <span className={`star ${n === 0 ? 'zero' : ''}`} style={st} title={label}>
      <svg viewBox="0 0 24 24"><polygon points={STAR} strokeWidth="1" /></svg>
      <span>{label ?? n}</span>
    </span>
  );
}
