// Content → card drawing. Every card face in the game is built here: mechanics and art from the content files, words
// from the active mod (words.ts), so a name or text edit in a mod's words shows up on the cards with no other change.
// The renderer gets every word it prints from here.
import {
  characterById, companionById, crisisById, intrigueById, MISC, soleField, type Field, type Freq, type Kader, type Side,
} from '../engine/index.ts';
import { POWER_SEP, freqHtml, para, powerHtml, type BackKind, type CardSpec } from './cards/render.ts';
import { cardPlacement, cutSrc } from './ui/Figure.tsx';
import { t } from './strings.ts';
import {
  cardWords, charWords, crisisWords, currentLang, hirsWords, kaderWords, kulWords, onWordsChange, powerWords, tarafWords, term,
} from './words.ts';

type PowerState = 'ready' | 'used' | 'locked';
/** A card as drawn. In play, cards also carry their state: which powers are spent or locked, a Kul used or face
 *  down, a Hırs completed. Without a state (gallery, editor) the card is drawn fresh. */
export type CardRef =
  | { t: 'intr'; kind: string; field: Field }
  | { t: 'char'; id: string; st?: { base: PowerState; favor?: PowerState } }
  | { t: 'kul'; id: string; st?: 'used' | 'down' }
  | { t: 'hirs'; id: string; done?: boolean }
  | { t: 'crisis'; id: string }
  | { t: 'kader'; k: Kader }
  | { t: 'taraf'; side: Side };

const P = (text: string) => para(text);   // para() puts the term icons in
const cache = new Map<string, CardSpec>();
onWordsChange(() => cache.clear());

const FREQ_TERM: Record<NonNullable<Freq>, string> = { once: 'once', crisis: 'percrisis', always: 'always' };
const freq = (f: Freq) => (f ? freqHtml(f, term(FREQ_TERM[f])) : '');
const fieldLabel = (f: 'harem' | 'divan' | 'saray' | 'ly' | 'tr') =>
  f === 'ly' ? t('loyaltyTrack') : f === 'tr' ? t('treasonTrack') : t(`cardField.${f}`);

export function spec(ref: CardRef): CardSpec {
  const key = JSON.stringify(ref);
  let s = cache.get(key);
  if (!s) cache.set(key, (s = build(ref)));
  return s;
}

function build(ref: CardRef): CardSpec {
  switch (ref.t) {
    case 'intr': {
      const d = intrigueById[ref.kind], w = cardWords(ref.kind);
      return { kind: 'intr', name: w.name, med: 'intrigue', field: ref.field, fieldLabel: fieldLabel(ref.field), art: d.art ?? undefined, bodyHtml: P(w.text), flavor: w.flavor };
    }
    case 'char': {
      const d = characterById[ref.id], w = charWords(ref.id);
      const place = cardPlacement(ref.id);
      const power = (slot: 'base' | 'favor') => {
        const p = d[slot]!, pw = powerWords(p.id);
        return powerHtml(slot, pw.name, freq(p.freq), pw.text, mark(ref.st?.[slot]));
      };
      return {
        kind: 'char', name: w.name, med: 'character', variant: 'v-break', backdrop: 'studio',
        ...(d.sultan ? { pal: 'sultan' as const } : {}),
        ...(place ? { cut: { src: cutSrc(ref.id), ...place } } : { artSvg: { emblem: d.sultan ? 'suleyman' : 'character' } }),
        bodyHtml: power('base') + (d.favor ? POWER_SEP + power('favor') : ''),
        flavor: w.flavor,
      };
    }
    case 'kul': {
      const d = companionById[ref.id], w = kulWords(ref.id);
      const field = d.recast ? soleField(d.recast) ?? undefined : undefined;
      return {
        kind: 'kul', name: w.name, med: 'companion', field, ...(field ? { fieldLabel: fieldLabel(field) } : {}),
        ...(d.art ? { art: d.art } : { artSvg: { emblem: 'companion' } }),
        bodyHtml: para((d.freq ? freq(d.freq) + ' ' : '') + w.text), flavor: w.flavor,
        ...(ref.st ? { stamp: { text: t(`stamp.${ref.st}`), tone: 'used' as const } } : {}),
      };
    }
    case 'hirs': {
      const w = hirsWords(ref.id);
      return {
        kind: 'hirs', name: w.name, med: 'ambition', artSvg: 'hirs', bodyHtml: para(w.text + '<br>' + t('hirs.unlock')), flavor: w.flavor,
        ...(ref.done ? { stamp: { text: t('stamp.done'), tone: 'ok' as const } } : {}),
      };
    }
    case 'crisis': {
      const d = crisisById[ref.id], w = crisisWords(ref.id);
      return {
        kind: 'crisis', name: w.name, med: 'crisis', field: d.field, fieldLabel: fieldLabel(d.field), variant: 'v-full',
        ...(d.art ? { art: d.art } : { artSvg: { emblem: 'crisis' } }),
        bodyHtml: P(w.text), ...(w.flavor ? { flavor: w.flavor } : {}),
      };
    }
    case 'kader': {
      const d = MISC.kader[ref.k], w = kaderWords(ref.k);
      const field = ref.k === 'h' ? 'ly' : 'tr';
      return {
        kind: ref.k === 'h' ? 'kader-h' : 'kader-x', name: w.name, med: ref.k === 'h' ? 'hizmet' : 'hiyanet',
        field, fieldLabel: fieldLabel(field), seal: ref.k === 'h' ? 'ok' : 'broken', art: d.art ?? undefined,
        bodyHtml: w.text.map(P).join(''), flavor: w.flavor,
      };
    }
    case 'taraf': {
      const w = tarafWords(ref.side);
      const s = ref.side === 'loyalist';
      return { kind: s ? 'taraf-s' : 'taraf-h', name: w.name, med: s ? 'loyalist' : 'traitor', artSvg: s ? 'taraf-s' : 'taraf-h', bodyHtml: w.text.map(P).join(''), flavor: w.flavor };
    }
  }
}

// a card back's word is its deck's term, in capitals ("ENTRİKA")
const BACK_TERM: Record<BackKind, string> = {
  intr: 'intrigue', kader: 'kader', taraf: 'allegiance', hirs: 'ambition', kul: 'companion', char: 'character', crisis: 'crisis',
};
export function backWords(kind: BackKind) {
  const what = term(BACK_TERM[kind]);
  return { word: what.toLocaleUpperCase(currentLang()), label: t('back.label', { what }) };
}

const mark = (state?: PowerState) => (state ? { state, label: t(state === 'used' ? 'stamp.used' : 'favorLocked') } : undefined);

export const intrRef = (c: { kind: string; field: Field }): CardRef => ({ t: 'intr', kind: c.kind, field: c.field });
