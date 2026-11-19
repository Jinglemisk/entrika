// Card text editor: open /?duzenle on the dev server (not linked from the game). Pick a mod and a language, then edit
// the printed words of each card; they save into mods/<mod>/<lang>.json through the server's /dev/content. Ids, effects
// and art stay as they are. An empty field shows the mod's native text as a hint, and the card shows what the game
// would show (the native text, or a ⟦marker⟧).
import { useEffect, useState } from 'react';
import { AMBITIONS, CHARACTERS, COMPANIONS, CRISES, INTRIGUE, MISC, type Field } from '../../engine/index.ts';
import { Card, CardDefs } from '../cards/Card.tsx';
import { iconUrl, knownTerms } from '../cards/terms.ts';
import { spec, type CardRef } from '../cardSpecs.ts';
import { LANGS, MODS, setWords, wordsFile, type Group, type Lang } from '../words.ts';
import './editor.css';

type Entry = Record<string, unknown>;
type Drafts = Record<string, Record<string, string>>;   // item key → field path → text not yet saved
interface TextField { path: string; label: string; long?: boolean }
interface Item { key: string; label: string; group: Group; id: string; fields: TextField[]; ref?: CardRef }

const NAME: TextField = { path: 'name', label: 'Ad' };
const TEXT: TextField = { path: 'text', label: 'Metin', long: true };
const FLAVOR: TextField = { path: 'flavor', label: 'Alt yazı', long: true };
// Süleyman has no Lütuf power, so his card shows only the fields he has
const character = (c: { favor?: unknown }): TextField[] => [
  NAME, { path: 'short', label: 'Kısa ad (kart metinlerinde geçtiği gibi)' },
  { path: 'base.name', label: 'Temel güç: adı' }, { path: 'base.text', label: 'Temel güç: metni', long: true },
  ...(c.favor ? [{ path: 'favor.name', label: 'Lütuf gücü: adı' }, { path: 'favor.text', label: 'Lütuf gücü: metni', long: true }] : []),
  FLAVOR,
];
const LINES: TextField[] = [NAME, { path: 'text.0', label: 'Metin, satır 1', long: true }, { path: 'text.1', label: 'Metin, satır 2', long: true }, FLAVOR];

const item = (label: string, group: Group, id: string, fields: TextField[], ref?: CardRef): Item =>
  ({ key: `${group}:${id}`, label, group, id, fields, ref });

const ITEMS: Item[] = [
  ...CHARACTERS.map(c => item('Karakterler', 'characters', c.id, character(c), { t: 'char', id: c.id })),
  ...COMPANIONS.map(c => item('Kullar', 'companions', c.id, [NAME, TEXT, FLAVOR], { t: 'kul', id: c.id })),
  ...INTRIGUE.map(c => item('Entrika', 'intrigue', c.id, [NAME, TEXT, FLAVOR], { t: 'intr', kind: c.id, field: Object.keys(c.copies)[0] as Field })),
  ...CRISES.map(c => item('Krizler', 'crises', c.id, [NAME, TEXT, FLAVOR], { t: 'crisis', id: c.id })),
  ...AMBITIONS.map(c => item('Hırs', 'ambitions', c.id, [NAME, TEXT, FLAVOR], { t: 'hirs', id: c.id })),
  ...(['h', 'x'] as const).map(k => item('Kader ve Taraf', 'kader', k, LINES, { t: 'kader', k })),
  ...(['loyalist', 'traitor'] as const).map(side => item('Kader ve Taraf', 'taraf', side, LINES, { t: 'taraf', side })),
  ...Object.keys(MISC.treason).map(k => item('İhanet güçleri', 'treason', k, [NAME, TEXT])),
];
const LABELS = [...new Set(ITEMS.map(i => i.label))];
const about = (it: Item): string => {
  const list = { characters: CHARACTERS, companions: COMPANIONS, intrigue: INTRIGUE, crises: CRISES, ambitions: AMBITIONS } as Record<string, { id: string; about: string }[]>;
  return list[it.group]?.find(x => x.id === it.id)?.about ?? (MISC as unknown as Record<string, Record<string, { about: string }>>)[it.group]?.[it.id]?.about ?? '';
};

const get = (e: unknown, path: string) => path.split('.').reduce<unknown>((o, k) => (o as Entry | undefined)?.[k], e) as string | undefined;
/** Sets a field by path, making the objects (or the line array, for text.0) on the way. */
function put(e: Entry, path: string, v: string | undefined) {
  const keys = path.split('.');
  let o = e;
  keys.slice(0, -1).forEach((k, i) => { o = (o[k] ??= /^\d+$/.test(keys[i + 1]) ? [] : {}) as Entry; });
  const last = keys[keys.length - 1];
  if (v === undefined) delete o[last];
  else o[last] = v;
}
function without(d: Drafts, key: string, keep: Record<string, string> = {}): Drafts {
  const next = { ...d };
  delete next[key];
  return Object.keys(keep).length ? { ...next, [key]: keep } : next;
}

const q0 = new URLSearchParams(location.search);
const startMod = MODS.some(m => m.id === q0.get('mod')) ? q0.get('mod')! : MODS[0].id;
const startLang = (LANGS as string[]).includes(q0.get('dil') ?? '') ? q0.get('dil') as Lang : MODS.find(m => m.id === startMod)!.native;

export function Editor() {
  // the hash keeps the open card when the page reloads; the query keeps the mod and language
  const [sel, setSel] = useState(() => location.hash.slice(1));
  const [mod, setMod] = useState(startMod);
  const [lang, setLang] = useState<Lang>(startLang);
  const [drafts, setDrafts] = useState<Drafts>({});
  const [filter, setFilter] = useState('');
  const [status, setStatus] = useState<{ key: string; ok?: boolean; msg: string } | null>(null);
  setWords(mod, lang);
  const info = MODS.find(m => m.id === mod)!;
  const file = wordsFile(mod, lang);
  const native = lang === info.native ? null : wordsFile(mod, info.native);
  const it = ITEMS.find(i => i.key === sel) ?? ITEMS[0];
  const saved = (i: Item, path: string) => get(file, `${i.group}.${i.id}.${path}`);
  const value = (i: Item, path: string) => drafts[i.key]?.[path] ?? saved(i, path) ?? '';
  const values = Object.fromEntries(it.fields.map(f => [f.path, value(it, f.path)]));
  const dirty = !!drafts[it.key];

  function select(key: string) {
    setSel(key);
    history.replaceState(null, '', location.search + '#' + key);
  }
  function pick(m: string, l: Lang) {
    if (Object.keys(drafts).length && !confirm('Kaydedilmemiş değişiklikler gidecek. Devam?')) return;
    setDrafts({});
    setMod(m);
    setLang(l);
    history.replaceState(null, '', `?duzenle&mod=${m}&dil=${l}#${it.key}`);
  }

  function edit(path: string, v: string) {
    setDrafts(d => {
      const mine = { ...d[it.key], [path]: v };
      if (v === (saved(it, path) ?? '')) delete mine[path];   // back to the saved text: nothing to save
      return without(d, it.key, mine);
    });
  }

  // The card is built by the game's own card builder from the loaded words. Laying the draft over the entry for that one
  // build, with the words it shows in the ref as its cache key, previews it.
  function preview(i: Item) {
    const entry = (((file[i.group] ??= {}) as Entry)[i.id] ??= {}) as Entry;
    const before = i.fields.map(f => [f.path, get(entry, f.path)] as const);
    for (const [p, v] of Object.entries(drafts[i.key] ?? {})) put(entry, p, v || undefined);
    try { return spec({ ...i.ref!, draft: JSON.stringify([mod, lang, entry]) } as unknown as CardRef); }
    finally { for (const [p, v] of before) put(entry, p, v); }
  }

  async function save(i: Item) {
    const set = drafts[i.key];
    if (!set) return;
    setStatus({ key: i.key, msg: 'Kaydediliyor…' });
    try {
      const res = await fetch('/dev/content', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mod, lang, group: i.group, id: i.id, set }),
      });
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!body.ok) throw new Error(body.error ?? `sunucu ${res.status} döndü (yalnızca geliştirme sunucusunda kaydeder)`);
    } catch (e) {
      setStatus({ key: i.key, ok: false, msg: `Kaydedilemedi: ${(e as Error).message}` });
      return;
    }
    // The file is written. Until Vite reloads it, keep the loaded copy in step so the card reads as saved.
    const entry = (((file[i.group] ??= {}) as Entry)[i.id] ??= {}) as Entry;
    for (const [p, v] of Object.entries(set)) put(entry, p, v || undefined);
    // keep whatever was typed while the save was on its way
    setDrafts(d => without(d, i.key, Object.fromEntries(Object.entries(d[i.key] ?? {}).filter(([p, v]) => v !== set[p]))));
    setStatus({ key: i.key, ok: true, msg: 'Kaydedildi' });
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') { e.preventDefault(); void save(it); }
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  });

  const unsaved = Object.keys(drafts).length > 0;
  useEffect(() => {
    if (!unsaved) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    addEventListener('beforeunload', warn);
    return () => removeEventListener('beforeunload', warn);
  }, [unsaved]);

  const q = filter.trim().toLocaleLowerCase('tr');
  const shown = ITEMS.filter(i => !q || [i.id, ...i.fields.map(f => value(i, f.path))].some(s => s.toLocaleLowerCase('tr').includes(q)));
  const note = status?.key === it.key && !(status.ok && dirty) ? status : null;   // "Kaydedildi" goes once you type again

  return (
    <div className="editor">
      <nav className="ed-list">
        <div className="ed-pick">
          <select value={mod} onChange={e => pick(e.target.value, MODS.find(m => m.id === e.target.value)!.native)}>
            {MODS.map(m => <option key={m.id} value={m.id}>{m.name[m.native] ?? m.id}{m.draft ? ' (taslak)' : ''}</option>)}
          </select>
          <select value={lang} onChange={e => pick(mod, e.target.value as Lang)}>
            {LANGS.map(l => <option key={l} value={l}>{l}{l === info.native ? ' (ana dil)' : ''}</option>)}
          </select>
        </div>
        <input className="ed-filter" type="search" placeholder="Ara: ad ya da metin" value={filter} onChange={e => setFilter(e.target.value)} />
        {LABELS.map(g => {
          const list = shown.filter(i => i.label === g);
          return list.length > 0 && (
            <section key={g}>
              <h2>{g}</h2>
              {list.map(i => (
                <button key={i.key} className={i.key === it.key ? 'on' : undefined} onClick={() => select(i.key)}>
                  {value(i, 'name') || <i className="ed-missing">{i.id}</i>}
                  {drafts[i.key] && <i className="ed-dot" title="Kaydedilmedi" />}
                </button>
              ))}
            </section>
          );
        })}
      </nav>

      <main className="ed-form">
        <header className="ed-head">
          <h1>{value(it, 'name') || it.id}</h1>
          <span className="ed-kind">{it.label} · {it.id} · {mod}/{lang}</span>
          <button className="ed-save" disabled={!dirty} onClick={() => save(it)} title="Ctrl/⌘ + S">Kaydet</button>
        </header>
        <p className="ed-about">{about(it)}</p>
        <p className={'ed-status' + (note?.ok === true ? ' ok' : note?.ok === false ? ' err' : '')}>
          {note ? note.msg : dirty ? 'Kaydedilmemiş değişiklik var.' : ' '}
        </p>
        {it.fields.map(f => {
          const props = {
            value: values[f.path],
            placeholder: native ? get(native, `${it.group}.${it.id}.${f.path}`) ?? '' : '',
            // card text is one paragraph: Enter would only put a stray line break into the JSON
            onChange: (e: { target: { value: string } }) => edit(f.path, e.target.value.replace(/\s*\n\s*/g, ' ')),
          };
          return (
            <label key={f.path} className={drafts[it.key]?.[f.path] !== undefined ? 'ed-field changed' : 'ed-field'}>
              <span>{f.label}</span>
              {f.long ? <textarea rows={2} {...props} /> : <input {...props} />}
            </label>
          );
        })}
        <p className="ed-help">
          Terimler kendiliğinden işaretlenir: listedeki bir terimle başlayan her kelime, ekleriyle birlikte (Entrika'yı,
          Nüfuzu), simgesini ve kalın yazısını alır. Büyük-küçük harf önemlidir. Terimlerin kendisi ve halleri
          mods/{mod}/{lang}.json içindeki "terms" bölümünde. Kaydet: düğme ya da Ctrl/⌘ + S.
        </p>
        <details className="ed-terms">
          <summary>Tanınan terimler</summary>
          <ul>
            {knownTerms().map(t => (
              <li key={t.stem}><img src={iconUrl(t.icon)} alt="" />{t.stem}</li>
            ))}
          </ul>
        </details>
      </main>

      <aside className="ed-preview">
        <CardDefs />
        {it.ref ? <Card spec={preview(it)} width={260} /> : (
          <div className="ed-power"><b>{values.name}</b><p>{values.text}</p><small>İhanet gücü: kartı yok, metni oyun içinde görünür.</small></div>
        )}
      </aside>
    </div>
  );
}
