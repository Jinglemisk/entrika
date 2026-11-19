/// <reference types="vite/client" />
// Thin React layer over the card string builders. The markup is built once per distinct spec and set as innerHTML.
import { memo, useLayoutEffect, useMemo, useRef, type RefObject } from 'react';
import { backHtml, cardHtml, CARD_DEFS, type BackKind, type CardSpec } from './render.ts';
import { backWords } from '../cardSpecs.ts';
import './cards.css';

// Chromium can paint an image that decodes after its SVG filter (the photo grade) as blank: drop the filter when
// a photo loads and put it back two frames later. Carried over from the art page; not reproduced in headless Chrome.
function useFilterRepaint(ref: RefObject<HTMLDivElement | null>) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onLoad = (e: Event) => {
      const img = e.target;
      if (!(img instanceof HTMLImageElement) || !img.closest('.art, .cut')) return;
      img.style.filter = 'none';
      requestAnimationFrame(() => requestAnimationFrame(() => { img.style.filter = ''; }));
    };
    el.addEventListener('load', onLoad, true); // load does not bubble; catch it on the way down
    return () => el.removeEventListener('load', onLoad, true);
  }, [ref]);
}

function Slot({ html, width, className }: { html: string; width: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useFilterRepaint(ref);
  return (
    <div ref={ref} className={className ? `c3-slot ${className}` : 'c3-slot'}
      style={{ width, height: width * 1.4 }} dangerouslySetInnerHTML={{ __html: html }} />
  );
}

/** A card face, `width` px wide (height = width x 1.4). Below 150 px it draws the compact frame, below 90 px without the
 *  name, unless `whole` keeps the full card with its text at any size. */
export const Card = memo(function Card({ spec, width, className, whole }: { spec: CardSpec; width: number; className?: string; whole?: boolean }) {
  const key = JSON.stringify(spec); // specs written inline still hit the memo
  const html = useMemo(() => cardHtml(spec), [key]); // eslint-disable-line react-hooks/exhaustive-deps
  return <Slot html={html} width={width} className={[className, whole && 'whole'].filter(Boolean).join(' ') || undefined} />;
});

/** Not memoised: its word follows the mod and language, which aren't props. */
export function CardBack({ kind, width, className }: { kind: BackKind; width: number; className?: string }) {
  const { word, label } = backWords(kind);
  const html = useMemo(() => backHtml(kind, word, label), [kind, word, label]);
  return <Slot html={html} width={width} className={className} />;
}

/** The gradients, patterns and filters every card points at. Render once per page, before or beside the cards. */
export const CardDefs = memo(function CardDefs() {
  return <div aria-hidden="true" dangerouslySetInnerHTML={{ __html: CARD_DEFS }} />;
});
