// Content → card drawing. Every card face in the game is built here from the content files, so a name or text edit
// in content/*.json shows up on the cards with no other change.
import {
  ambitionById, characterById, companionById, crisisById, intrigueById, MISC, soleField, type Field, type Kader, type Side,
} from '../engine/index.ts';
import { freqHtml, para, powerHtml, type CardSpec } from './cards/render.ts';
import { cardPlacement, cutSrc } from './ui/Figure.tsx';

export type CardRef =
  | { t: 'intr'; kind: string; field: Field }
  | { t: 'char'; id: string }
  | { t: 'kul'; id: string }
  | { t: 'hirs'; id: string }
  | { t: 'crisis'; id: string }
  | { t: 'kader'; k: Kader }
  | { t: 'taraf'; side: Side };

const P = (text: string) => para(text);   // para() puts the term icons in
const cache = new Map<string, CardSpec>();

export function spec(ref: CardRef): CardSpec {
  const key = JSON.stringify(ref);
  let s = cache.get(key);
  if (!s) cache.set(key, (s = build(ref)));
  return s;
}

function build(ref: CardRef): CardSpec {
  switch (ref.t) {
    case 'intr': {
      const d = intrigueById[ref.kind];
      return { kind: 'intr', name: d.name, med: 'intrigue', field: ref.field, art: d.art ?? undefined, bodyHtml: P(d.text), flavor: d.flavor };
    }
    case 'char': {
      const d = characterById[ref.id];
      const place = cardPlacement(ref.id);
      return {
        kind: 'char', name: d.name, med: 'character', variant: 'v-break', backdrop: 'studio',
        ...(d.sultan ? { pal: 'sultan' as const } : {}),
        ...(place ? { cut: { src: cutSrc(ref.id), ...place } } : { artSvg: { emblem: d.sultan ? 'suleyman' : 'character' } }),
        bodyHtml: powerHtml('base', d.base.name, d.base.freq, d.base.text) + (d.favor ? powerHtml('favor', d.favor.name, d.favor.freq, d.favor.text) : ''),
        flavor: d.flavor,
      };
    }
    case 'kul': {
      const d = companionById[ref.id];
      const field = d.recast ? soleField(d.recast) ?? undefined : undefined;
      return {
        kind: 'kul', name: d.name, med: 'companion', field,
        ...(d.art ? { art: d.art } : { artSvg: { emblem: 'companion' } }),
        bodyHtml: para((d.freq ? freqHtml(d.freq) + ' ' : '') + d.text), flavor: d.flavor,
      };
    }
    case 'hirs': {
      const d = ambitionById[ref.id];
      return { kind: 'hirs', name: d.name, med: 'ambition', artSvg: 'hirs', bodyHtml: para(d.text + '<br>Tamamlayınca kartı aç: Lütuf gücün açılır.'), flavor: d.flavor };
    }
    case 'crisis': {
      const d = crisisById[ref.id];
      return {
        kind: 'crisis', name: d.name, med: 'crisis', field: d.field, variant: 'v-full',
        ...(d.art ? { art: d.art } : { artSvg: { emblem: 'crisis' } }),
        bodyHtml: P(d.text), ...(d.flavor ? { flavor: d.flavor } : {}),
      };
    }
    case 'kader': {
      const d = MISC.kader[ref.k];
      return {
        kind: ref.k === 'h' ? 'kader-h' : 'kader-x', name: d.name, med: ref.k === 'h' ? 'hizmet' : 'hiyanet',
        field: ref.k === 'h' ? 'ly' : 'tr', seal: ref.k === 'h' ? 'ok' : 'broken', art: d.art,
        bodyHtml: d.text.map(P).join(''), flavor: d.flavor,
      };
    }
    case 'taraf': {
      const d = MISC.taraf[ref.side];
      const s = ref.side === 'loyalist';
      return { kind: s ? 'taraf-s' : 'taraf-h', name: d.name, med: s ? 'loyalist' : 'traitor', artSvg: s ? 'taraf-s' : 'taraf-h', bodyHtml: d.text.map(P).join(''), flavor: d.flavor };
    }
  }
}

export const intrRef = (c: { kind: string; field: Field }): CardRef => ({ t: 'intr', kind: c.kind, field: c.field });
