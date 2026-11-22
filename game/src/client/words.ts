// The words a phone shows: the active mod's names, card text, flavor and term forms, in the phone's language.
// Mods live in mods/<id>/ at the repo root: mod.json says what the mod is, <lang>.json holds its words. A word the
// mod lacks in this language comes from the mod's native language; a word it lacks there shows as ⟦kind.id⟧, never
// as another mod's word. App sets the mod (from the room) and the language (from prefs) before each render.
import { CHARACTERS, type Kader, type Side } from '../engine/index.ts';

export type Lang = 'tr' | 'en';
export const LANGS: Lang[] = ['tr', 'en'];

/** mod.json: `rights` is one line naming who owns the world the mod borrows. */
export interface ModInfo {
  id: string; native: Lang; name: Partial<Record<Lang, string>>; draft?: boolean;
  rights?: Partial<Record<Lang, string>>;
}
interface PowerWords { name?: string; text?: string }
interface CardWords { name?: string; text?: string; flavor?: string }
interface CharWords { name?: string; short?: string; flavor?: string; base?: PowerWords; favor?: PowerWords }
interface LinesWords { name?: string; text?: string[]; flavor?: string }
/** A term's words: `name` is the plain form; other keys are hand-written forms (Turkish acc, dat, gen, loc, abl, pl...;
 *  English pl, a, the). `stems` are what the card-text icon matcher looks for (default: the name). */
export type TermWords = { name?: string; stems?: string[] } & Record<string, string | string[] | undefined>;
export interface Words {
  terms?: Record<string, TermWords>;
  characters?: Record<string, CharWords>;
  companions?: Record<string, CardWords>;
  intrigue?: Record<string, CardWords>;
  ambitions?: Record<string, CardWords>;
  crises?: Record<string, CardWords>;
  kader?: Partial<Record<Kader, LinesWords>>;
  taraf?: Partial<Record<Side, LinesWords>>;
  treason?: Record<string, PowerWords>;
  /** sentence overrides: an interface string key, and the sentence this mod says instead */
  strings?: Record<string, string>;
}
export type Group = Exclude<keyof Words, 'terms' | 'strings'>;

const files = import.meta.glob('../../../mods/*/*.json', { eager: true, import: 'default' }) as Record<string, unknown>;
const WORDS: Record<string, Partial<Record<Lang, Words>>> = {};
const infos: ModInfo[] = [];
for (const [p, data] of Object.entries(files)) {
  const [, mod, file] = /mods\/([^/]+)\/([^/]+)\.json$/.exec(p)!;
  if (file === 'mod') infos.push(data as ModInfo);
  else if ((LANGS as string[]).includes(file)) (WORDS[mod] ??= {})[file as Lang] = data as Words;
}
export const DEFAULT_MOD = 'muhtesem';
/** Every mod: the original first, then finished ones, then drafts. */
const rank = (m: ModInfo) => (m.id === DEFAULT_MOD ? 0 : m.draft ? 2 : 1);
export const MODS = infos.sort((a, b) => rank(a) - rank(b) || a.id.localeCompare(b.id));
const modInfo = (id: string) => MODS.find(m => m.id === id) ?? MODS.find(m => m.id === DEFAULT_MOD)!;

let mod = modInfo(DEFAULT_MOD);
let lang: Lang = 'tr';
const listeners = new Set<() => void>();
/** Called on every change of mod or language, before the next render: caches built from words drop themselves. */
export const onWordsChange = (f: () => void) => listeners.add(f);

/** Switch the active mod and language. Cheap when nothing changes, so App calls it on every render. */
export function setWords(modId: string, l: Lang) {
  const next = modInfo(modId);
  if (next === mod && l === lang) return;
  mod = next;
  lang = l;
  if (globalThis.document) document.documentElement.lang = l;   // capitals follow the language (Turkish dotted İ)
  listeners.forEach(f => f());
}
export const currentLang = () => lang;
export const currentMod = () => mod.id;
/** The words file of a mod in a language, created empty if the mod has none yet (the text editor fills it in). */
export const wordsFile = (modId: string, l: Lang): Words => ((WORDS[modId] ??= {})[l] ??= {});

/** A mod's name in the phone's language, or in its own. */
export const modName = (m: ModInfo) => m.name[lang] ?? m.name[m.native] ?? m.id;
/** Who owns a mod's world (the active one by default), in the phone's language, or in its own. */
export const modRights = (m = mod) => m.rights?.[lang] ?? m.rights?.[m.native] ?? '';

const missing = (key: string) => `⟦${key}⟧`;
type Pick<T> = (w: Words) => T | undefined;
/** The first of the phone's language and the mod's native language that has the word. */
function pick<T>(get: Pick<T>): T | undefined {
  const own = WORDS[mod.id] ?? {};
  return get(own[lang] ?? {}) ?? (lang !== mod.native ? get(own[mod.native] ?? {}) : undefined);
}
const str = (key: string, get: Pick<string>) => pick(get) ?? missing(key);

export const cardWords = (id: string) => ({
  name: str(`card.${id}`, w => w.intrigue?.[id]?.name),
  text: str(`card.${id}.text`, w => w.intrigue?.[id]?.text),
  flavor: str(`card.${id}.flavor`, w => w.intrigue?.[id]?.flavor),
});
export const kulWords = (id: string) => ({
  name: str(`kul.${id}`, w => w.companions?.[id]?.name),
  text: str(`kul.${id}.text`, w => w.companions?.[id]?.text),
  flavor: str(`kul.${id}.flavor`, w => w.companions?.[id]?.flavor),
});
export const hirsWords = (id: string) => ({
  name: str(`hirs.${id}`, w => w.ambitions?.[id]?.name),
  text: str(`hirs.${id}.text`, w => w.ambitions?.[id]?.text),
  flavor: str(`hirs.${id}.flavor`, w => w.ambitions?.[id]?.flavor),
});
/** A Crisis card's flavor line is optional. */
export const crisisWords = (id: string) => ({
  name: str(`crisis.${id}`, w => w.crises?.[id]?.name),
  text: str(`crisis.${id}.text`, w => w.crises?.[id]?.text),
  flavor: pick(w => w.crises?.[id]?.flavor),
});
export const charWords = (id: string) => ({
  name: str(`char.${id}`, w => w.characters?.[id]?.name),
  /** the name in running text ("Hürrem" for Hürrem Sultan) */
  short: pick(w => w.characters?.[id]?.short) ?? str(`char.${id}`, w => w.characters?.[id]?.name),
  flavor: str(`char.${id}.flavor`, w => w.characters?.[id]?.flavor),
});
const linesWords = (key: string, get: Pick<LinesWords>) => ({
  name: str(key, w => get(w)?.name),
  text: pick(w => get(w)?.text) ?? [missing(`${key}.text`)],
  flavor: str(`${key}.flavor`, w => get(w)?.flavor),
});
export const kaderWords = (k: Kader) => linesWords(`kader.${k}`, w => w.kader?.[k]);
export const tarafWords = (side: Side) => linesWords(`taraf.${side}`, w => w.taraf?.[side]);
export const treasonWords = (id: string) => ({
  name: str(`treason.${id}`, w => w.treason?.[id]?.name),
  text: str(`treason.${id}.text`, w => w.treason?.[id]?.text),
});

// a power id → the Character and slot that hold it
const POWER_AT: Record<string, { character: string; slot: 'base' | 'favor' }> = {};
for (const c of CHARACTERS) {
  POWER_AT[c.base.id] = { character: c.id, slot: 'base' };
  if (c.favor) POWER_AT[c.favor.id] = { character: c.id, slot: 'favor' };
}
export const isPower = (id: string) => id in POWER_AT;
export function powerWords(id: string) {
  const at = POWER_AT[id];
  return {
    name: str(`power.${id}`, w => w.characters?.[at?.character]?.[at?.slot]?.name),
    text: str(`power.${id}.text`, w => w.characters?.[at?.character]?.[at?.slot]?.text),
  };
}
export const powerName = (id: string) => powerWords(id).name;

/** A term in a form: term('minister', 'dat') → "Vekile". A mod that lacks the term in this language lends its native
 *  name (no form: grammar doesn't carry across languages); a missing form shows as ⟦term.id:form⟧. */
export function term(id: string, form = 'name'): string {
  const own = WORDS[mod.id] ?? {};
  const here = own[lang]?.terms?.[id];
  if (here) {
    const v = here[form];
    return typeof v === 'string' ? v : missing(form === 'name' ? `term.${id}` : `term.${id}:${form}`);
  }
  const native = lang !== mod.native ? own[mod.native]?.terms?.[id]?.name : undefined;
  return typeof native === 'string' ? native : missing(`term.${id}`);
}
/** The words the card-text matcher looks for in this mod and language: every term's stems. */
export function termStems(id: string): string[] {
  const t = pick(w => w.terms?.[id]);
  return t?.stems ?? (typeof t?.name === 'string' ? [t.name] : []);
}
/** A sentence this mod words its own way in this language, if any. Never borrowed from another language. */
export const override = (key: string) => WORDS[mod.id]?.[lang]?.strings?.[key];
