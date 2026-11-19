// The mod check: what each mod is missing in each language, and the nomenclature worksheet for naming a new one.
//   npm run mods                       every mod × language: missing names, texts, flavors, term forms, bad overrides
//   npm run mods -- --all              the same, every missing item listed
//   npm run mods -- --worksheet got    Markdown: every id with what it does and its current names, for naming a mod
// Exits 1 if a finished (non-draft) mod is missing anything in its native language, or the interface strings are broken.
import fs from 'node:fs';
import path from 'node:path';
import { AMBITIONS, CHARACTERS, COMPANIONS, CRISES, INTRIGUE, MISC, TERMS } from '../src/engine/index.ts';

type Lang = 'tr' | 'en';
const LANGS: Lang[] = ['tr', 'en'];
type Obj = Record<string, any>;
const ROOT = path.join(import.meta.dirname, '..', '..');
const MODS_DIR = path.join(ROOT, 'mods');
const readJson = (f: string): Obj => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : {});
const STRINGS = Object.fromEntries(LANGS.map(l => [l, readJson(path.join(ROOT, 'game', 'lang', `${l}.json`))])) as Record<Lang, Record<string, string>>;
const mods = fs.readdirSync(MODS_DIR).filter(d => fs.existsSync(path.join(MODS_DIR, d, 'mod.json')))
  .map(d => readJson(path.join(MODS_DIR, d, 'mod.json')) as { id: string; native: Lang; draft?: boolean; name: Obj });

// ---------- what a complete words file holds
interface Need { group: string; id: string; fields: string[]; about: string }
const CARD = ['name', 'text', 'flavor'];
const NEEDS: Need[] = [
  ...CHARACTERS.map(c => ({ group: 'characters', id: c.id, about: c.about, fields: ['name', 'flavor', 'base.name', 'base.text', ...(c.favor ? ['favor.name', 'favor.text'] : [])] })),
  ...COMPANIONS.map(c => ({ group: 'companions', id: c.id, about: c.about, fields: CARD })),
  ...INTRIGUE.map(c => ({ group: 'intrigue', id: c.id, about: c.about, fields: CARD })),
  ...AMBITIONS.map(c => ({ group: 'ambitions', id: c.id, about: c.about, fields: CARD })),
  ...CRISES.map(c => ({ group: 'crises', id: c.id, about: c.about, fields: ['name', 'text'] })),   // a crisis flavor line is optional
  ...Object.entries(MISC.kader).map(([id, d]) => ({ group: 'kader', id, about: d.about, fields: CARD })),
  ...Object.entries(MISC.taraf).map(([id, d]) => ({ group: 'taraf', id, about: d.about, fields: CARD })),
  ...Object.entries(MISC.treason).map(([id, d]) => ({ group: 'treason', id, about: d.about, fields: ['name', 'text'] })),
];
const get = (o: Obj, p: string) => p.split('.').reduce<any>((x, k) => x?.[k], o);
/** A list for the report: the first dozen, then a count. --all prints every one. */
const ALL = process.argv.includes('--all');
const few = (xs: string[]) => (ALL || xs.length <= 12 ? xs.join(', ') : `${xs.slice(0, 12).join(', ')} … and ${xs.length - 12} more (--all)`);
const filled = (v: unknown) => (Array.isArray(v) ? v.length > 0 && v.every(x => typeof x === 'string' && x.trim()) : typeof v === 'string' && v.trim() !== '');

// ---------- references inside sentences: {kind.id} and {kind.id:form}
const POWERS = new Set(CHARACTERS.flatMap(c => [c.base.id, ...(c.favor ? [c.favor.id] : [])]));
const KNOWN: Record<string, Set<string>> = {
  term: new Set(Object.keys(TERMS)), card: new Set(INTRIGUE.map(c => c.id)), char: new Set(CHARACTERS.map(c => c.id)),
  kul: new Set(COMPANIONS.map(c => c.id)), power: POWERS, treason: new Set(Object.keys(MISC.treason)),
  hirs: new Set(AMBITIONS.map(c => c.id)), crisis: new Set(CRISES.map(c => c.id)),
};
const REF = /\{(\w+)\.([\w-]+)(?::(\w+))?\}/g;
function badRefs(s: string): string[] {
  return [...s.matchAll(REF)].filter(([, kind, id]) => !KNOWN[kind]?.has(id)).map(m => m[0]);
}
/** term id → the forms the sentences of a language use */
function formsUsed(sentences: string[]): Map<string, Set<string>> {
  const used = new Map<string, Set<string>>();
  for (const s of sentences) for (const [, kind, id, form] of s.matchAll(REF)) {
    if (kind !== 'term') continue;
    if (!used.has(id)) used.set(id, new Set());
    if (form) used.get(id)!.add(form);
  }
  return used;
}

// ---------- the check
function check(): boolean {
  let ok = true;
  const out: string[] = [];
  // the interface strings: same keys in every language, known references only
  const keys = new Set(LANGS.flatMap(l => Object.keys(STRINGS[l])));
  for (const l of LANGS) {
    const missing = [...keys].filter(k => !(k in STRINGS[l]));
    const bad = Object.entries(STRINGS[l]).flatMap(([k, s]) => badRefs(s).map(r => `${k}: ${r}`));
    if (missing.length || bad.length) ok = false;
    out.push(`game/lang/${l}.json: ${missing.length || bad.length ? '' : 'ok'}`);
    if (missing.length) out.push(`  missing strings: ${missing.join(', ')}`);
    if (bad.length) out.push(`  unknown references: ${bad.join('; ')}`);
  }
  for (const m of mods) {
    out.push('', `${m.id}${m.draft ? ' (draft)' : ''}, native ${m.native}`);
    for (const l of [m.native, ...LANGS.filter(x => x !== m.native)]) {
      const w = readJson(path.join(MODS_DIR, m.id, `${l}.json`));
      const problems: string[] = [];
      const gaps = NEEDS.flatMap(n => n.fields.filter(f => !filled(get(w, `${n.group}.${n.id}.${f}`))).map(f => `${n.group}.${n.id}.${f}`));
      if (gaps.length) problems.push(`missing words (${gaps.length}): ${few(gaps)}`);
      const overrides: Obj = w.strings ?? {};
      const used = formsUsed([...Object.values(STRINGS[l]), ...Object.values(overrides)]);
      const terms: Obj = w.terms ?? {};
      const noTerm = Object.keys(TERMS).filter(id => !filled(terms[id]?.name));
      if (noTerm.length) problems.push(`missing terms (${noTerm.length}): ${few(noTerm)}`);
      const noForm = [...used].flatMap(([id, forms]) => (terms[id] ? [...forms].filter(f => !filled(terms[id][f])).map(f => `${id}:${f}`) : []));
      if (noForm.length) problems.push(`missing term forms (${noForm.length}): ${few(noForm)}`);
      const strayKeys = Object.keys(overrides).filter(k => !(k in STRINGS[l]));
      if (strayKeys.length) problems.push(`overrides of unknown strings: ${strayKeys.join(', ')}`);
      const strayRefs = Object.entries(overrides).flatMap(([k, s]) => badRefs(String(s)).map(r => `${k}: ${r}`));
      if (strayRefs.length) problems.push(`unknown references in overrides: ${strayRefs.join('; ')}`);
      const strayIds = ['characters', 'companions', 'intrigue', 'ambitions', 'crises', 'kader', 'taraf', 'treason']
        .flatMap(g => Object.keys(w[g] ?? {}).filter(id => !NEEDS.some(n => n.group === g && n.id === id)).map(id => `${g}.${id}`))
        .concat(Object.keys(terms).filter(id => !(id in TERMS)).map(id => `terms.${id}`));
      if (strayIds.length) problems.push(`unknown ids: ${few(strayIds)}`);
      const native = l === m.native;
      if (native && !m.draft && problems.length) ok = false;
      out.push(`  ${l}${native ? ' (native)' : ''}: ${problems.length ? '' : 'complete'}`);
      for (const p of problems) out.push(`    ${p}`);
    }
  }
  console.log(out.join('\n'));
  return ok;
}

// ---------- the nomenclature worksheet
function worksheet(modId: string | undefined) {
  const list = modId ? mods.filter(m => m.id === modId) : mods;
  if (!list.length) throw new Error(`No mod ${modId}`);
  const words = (m: { id: string }, l: Lang) => readJson(path.join(MODS_DIR, m.id, `${l}.json`));
  const cols = list.flatMap(m => LANGS.map(l => ({ head: `${m.id}/${l}`, w: words(m, l) })));
  const cell = (v: unknown) => String(v ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
  const row = (id: string, about: string, vals: unknown[]) => `| \`${id}\` | ${cell(about)} | ${vals.map(cell).join(' | ')} |`;
  const table = (title: string, rows: string[]) =>
    [`## ${title}`, '', `| id | what it does | ${cols.map(c => c.head).join(' | ')} |`, `|---|---|${cols.map(() => '---|').join('')}`, ...rows, ''];
  const out = [`# Nomenclature worksheet${modId ? `: ${modId}` : ''}`, '',
    'Every id the game uses, what it does, and what each mod calls it. Ids never show; name each for its effect in your world.', ''];
  out.push(...table('Terms', Object.entries(TERMS).map(([id, d]) => row(id, d.about, cols.map(c => c.w.terms?.[id]?.name)))));
  out.push(...table('Characters', CHARACTERS.flatMap(c => [
    row(c.id, c.about, cols.map(x => x.w.characters?.[c.id]?.name)),
    row(`${c.id} › ${c.base.id}`, `Base power. ${c.base.about}`, cols.map(x => x.w.characters?.[c.id]?.base?.name)),
    ...(c.favor ? [row(`${c.id} › ${c.favor.id}`, `Favor power. ${c.favor.about}`, cols.map(x => x.w.characters?.[c.id]?.favor?.name))] : []),
  ])));
  const simple = (title: string, group: string, items: { id: string; about: string }[]) =>
    out.push(...table(title, items.map(c => row(c.id, c.about, cols.map(x => x.w[group]?.[c.id]?.name)))));
  simple('Kul (Companions)', 'companions', COMPANIONS);
  simple('Entrika (Intrigue cards)', 'intrigue', INTRIGUE);
  simple('Hırs (Ambitions)', 'ambitions', AMBITIONS);
  simple('Crises', 'crises', CRISES);
  simple('Kader cards', 'kader', Object.entries(MISC.kader).map(([id, d]) => ({ id, about: d.about })));
  simple('Taraf (Allegiance)', 'taraf', Object.entries(MISC.taraf).map(([id, d]) => ({ id, about: d.about })));
  simple('Treason track powers', 'treason', Object.entries(MISC.treason).map(([id, d]) => ({ id, about: d.about })));
  console.log(out.join('\n'));
}

const args = process.argv.slice(2).filter(a => a !== '--all');
if (args[0] === '--worksheet') worksheet(args[1]);
else process.exit(check() ? 0 : 1);
