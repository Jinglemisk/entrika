/// <reference types="vite/client" />
// Thin React layer over the card string builders. The markup is built once per distinct spec and set as innerHTML.
import { memo, useLayoutEffect, useMemo, useRef, type RefObject } from 'react';
import { backHtml, cardHtml, type BackKind, type CardSpec } from './render.ts';
import { defs } from '../skin.ts';
import { currentMod } from '../words.ts';
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

// The plate's type is sized for the usual card; a long text in a wide font (Turkish, Cumhuriyet's face) can overrun it.
// Shrink that card's text in steps until it fits, once the fonts are in.
function useFitText(ref: RefObject<HTMLDivElement | null>, html: string, width: number) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => el.querySelectorAll<HTMLElement>('.pin').forEach(pin => {
      pin.style.removeProperty('--fit');
      if (!pin.clientHeight) return; // the compact frame hides the plate
      for (let f = .95; pin.scrollHeight > pin.clientHeight + 1 && f > .55; f -= .05) pin.style.setProperty('--fit', f.toFixed(2));
    });
    fit();
    document.fonts?.ready.then(fit);
  }, [ref, html, width]);
}

function Slot({ html, width, className }: { html: string; width: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useFilterRepaint(ref);
  useFitText(ref, html, width);
  return (
    <div ref={ref} className={className ? `c3-slot ${className}` : 'c3-slot'}
      style={{ width, height: width * 1.4 }} dangerouslySetInnerHTML={{ __html: html }} />
  );
}

/** A card face, `width` px wide (height = width x 1.4). Below 150 px it draws the compact frame, below 90 px without the
 *  name, unless `whole` keeps the full card with its text at any size. */
export const Card = memo(function Card({ spec, width, className, whole }: { spec: CardSpec; width: number; className?: string; whole?: boolean }) {
  const key = currentMod() + JSON.stringify(spec); // specs written inline still hit the memo; a new mod draws anew
  const html = useMemo(() => cardHtml(spec), [key]); // eslint-disable-line react-hooks/exhaustive-deps
  return <Slot html={html} width={width} className={[className, whole && 'whole'].filter(Boolean).join(' ') || undefined} />;
});

/** Not memoised: its word and drawing follow the mod and language, which aren't props. */
export function CardBack({ kind, width, className }: { kind: BackKind; width: number; className?: string }) {
  const { word, label } = backWords(kind);
  const mod = currentMod();
  const html = useMemo(() => backHtml(kind, word, label), [kind, word, label, mod]); // eslint-disable-line react-hooks/exhaustive-deps
  return <Slot html={html} width={width} className={className} />;
}

/** The skin's gradients, patterns, filters and symbols, which every card points at. Render once per page, before or
 *  beside the cards. */
export function CardDefs() {
  const mod = currentMod();
  const html = useMemo(() => `<svg class="c3-sprite" aria-hidden="true" focusable="false">${defs()}</svg>`, [mod]); // eslint-disable-line react-hooks/exhaustive-deps
  return <div aria-hidden="true" dangerouslySetInnerHTML={{ __html: html }} />;
}
