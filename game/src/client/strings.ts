// Every interface sentence goes through t(). Sentences are written once per language (game/lang/<lang>.json) and
// name game things by id, so each mod fills in its own words:
//   {term.minister}      a term's plain form           {term.minister:dat}  a hand-written form of it
//   {card.valide}        an Entrika card's name        {char.hurrem}        a Character ({char.hurrem:short})
//   {kul.daye}           a Kul's name                  {power.ferman}       a Character power's name
//   {treason.sorusturma} an İhanet yolu power's name
// and values passed in by the caller: {name}, and {name:dat} for a player name with its Turkish case suffix (dat, acc,
// gen, loc, abl; English ignores the case). A mod may override any sentence in its words file. A sentence that opens
// with a game word gets a capital letter, so "the King" can start a sentence as "The King".
import tr from '../../lang/tr.json' with { type: 'json' };
import en from '../../lang/en.json' with { type: 'json' };
import { suffix, type Case } from './turkish.ts';
import {
  cardWords, charWords, crisisWords, currentLang, hirsWords, kulWords, override, powerName, term, treasonWords, type Lang,
} from './words.ts';

const TABLES: Record<Lang, Record<string, string>> = { tr, en };

/** The game word a {kind.id:form} reference names. */
function ref(kind: string, id: string, form: string | undefined): string | undefined {
  switch (kind) {
    case 'term': return term(id, form);
    case 'card': return cardWords(id).name;
    case 'char': return form === 'short' ? charWords(id).short : charWords(id).name;
    case 'kul': return kulWords(id).name;
    case 'power': return powerName(id);
    case 'treason': return treasonWords(id).name;
    case 'hirs': return hirsWords(id).name;
    case 'crisis': return crisisWords(id).name;
  }
}

const PLACE = /\{(\w+)(?:\.([\w-]+))?(?::(\w+))?\}/g;

/** Fills in a sentence's references and values. */
export function fill(s: string, vars?: Record<string, unknown>): string {
  const lang = currentLang();
  const out = s.replace(PLACE, (m, a: string, id: string | undefined, form: string | undefined) => {
    if (id !== undefined) return ref(a, id, form) ?? m;
    const v = String(vars?.[a] ?? '');
    return form && lang === 'tr' ? suffix(v, form as Case) : v;
  });
  return /^\{\w+\.[\w-]+/.test(s) ? out.charAt(0).toLocaleUpperCase(lang) + out.slice(1) : out;
}

/** A string exactly as one language writes it, placeholders and all: for naming a language in itself. */
export const tIn = (lang: Lang, key: string) => TABLES[lang][key] ?? key;

export function t(key: string, vars?: Record<string, unknown>): string {
  const s = override(key) ?? TABLES[currentLang()][key] ?? TABLES.tr[key];
  if (s === undefined) {
    if (import.meta.env?.DEV) console.warn('missing string', key);
    return key;
  }
  return fill(s, vars);
}
