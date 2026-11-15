// Card text editor: open /?duzenle on the dev server (not linked from the game). It edits only the printed text of
// each card and saves it into content/*.json through the server's /dev/content; ids, effects and art stay as they are.
import { useEffect, useState } from 'react';
import terms from '../../../../art/terms.json' with { type: 'json' };
import { AMBITIONS, CHARACTERS, COMPANIONS, CRISES, INTRIGUE, MISC, type Field } from '../../engine/index.ts';
import { Card, CardDefs } from '../cards/Card.tsx';
import { ICON_BASE } from '../cards/terms.ts';
import { spec, type CardRef } from '../cardSpecs.ts';
import './editor.css';

type Entry = Record<string, unknown>;
type Drafts = Record<string, Record<string, string>>;   // item key → field path → text not yet saved
interface TextField { path: string; label: string; long?: boolean }
interface Item { key: string; group: string; file: string; id: string; entry: Entry; fields: TextField[]; ref?: CardRef }

const NAME: TextField = { path: 'name', label: 'Ad' };
const TEXT: TextField = { path: 'text', label: 'Metin', long: true };
const FLAVOR: TextField = { path: 'flavor', label: 'Alt yazı', long: true };
// Süleyman has no Lütuf power, so his card shows only the fields he has
const character = (c: { favor?: unknown }): TextField[] => [
  NAME,
  { path: 'base.name', label: 'Temel güç: adı' }, { path: 'base.text', label: 'Temel güç: metni', long: true },
  ...(c.favor ? [{ path: 'favor.name', label: 'Lütuf gücü: adı' }, { path: 'favor.text', label: 'Lütuf gücü: metni', long: true }] : []),
  FLAVOR,
];
const lines = (e: { text: string[] }): TextField[] =>
  [NAME, ...e.text.map((_, i) => ({ path: `text.${i}`, label: `Metin, satır ${i + 1}`, long: true })), FLAVOR];

const item = (group: string, file: string, id: string, entry: object, fields: TextField[], ref?: CardRef): Item =>
  ({ key: `${file}:${id}`, group, file, id, entry: entry as Entry, fields, ref });

const ITEMS: Item[] = [
  ...CHARACTERS.map(c => item('Karakterler', 'characters', c.id, c, character(c), { t: 'char', id: c.id })),
  ...COMPANIONS.map(c => item('Kullar', 'companions', c.id, c, [NAME, TEXT, FLAVOR], { t: 'kul', id: c.id })),
  ...INTRIGUE.map(c => item('Entrika', 'intrigue', c.id, c, [NAME, TEXT, FLAVOR],
    { t: 'intr', kind: c.id, field: Object.keys(c.copies)[0] as Field })),
  ...CRISES.map(c => item('Krizler', 'crises', c.id, c, [NAME, TEXT, FLAVOR], { t: 'crisis', id: c.id })),
  ...AMBITIONS.map(c => item('Hırs', 'ambitions', c.id, c, [NAME, TEXT, FLAVOR], { t: 'hirs', id: c.id })),
  ...(['h', 'x'] as const).map(k => item('Kader ve Taraf', 'misc', `kader.${k}`, MISC.kader[k], lines(MISC.kader[k]), { t: 'kader', k })),
  ...(['loyalist', 'traitor'] as const).map(side =>
    item('Kader ve Taraf', 'misc', `taraf.${side}`, MISC.taraf[side], lines(MISC.taraf[side]), { t: 'taraf', side })),
  ...Object.entries(MISC.treason).map(([k, e]) => item('İhanet güçleri', 'misc', `treason.${k}`, e, [NAME, TEXT])),
];
const GROUPS = [...new Set(ITEMS.map(i => i.group))];
const TERMS = terms.terms as { id: string; stems: string[]; icon: string; display?: string }[];

const get = (e: Entry, path: string) => path.split('.').reduce<unknown>((o, k) => (o as Entry | undefined)?.[k], e) as string | undefined;
function put(e: Entry, path: string, v: string | undefined) {
  const keys = path.split('.');
  const last = keys.pop()!;
  const o = keys.reduce((o, k) => o[k] as Entry, e);
  if (v === undefined) delete o[last];
  else o[last] = v;
}
function without(d: Drafts, key: string, keep: Record<string, string> = {}): Drafts {
  const next = { ...d };
  delete next[key];
  return Object.keys(keep).length ? { ...next, [key]: keep } : next;
}

// spec() builds a card from the loaded content and caches it per ref. Laying the shown text over the entry for that
// one build, with the text in the ref as its cache key, previews a draft through the game's own card builder.
function previewSpec(it: Item, values: Record<string, string>) {
  const saved = it.fields.map(f => [f.path, get(it.entry, f.path)] as const);
  const ref = { ...it.ref!, draft: JSON.stringify(values) };
  for (const [p, v] of Object.entries(values)) put(it.entry, p, v);
  try { return spec(ref); }
  finally { for (const [p, v] of saved) put(it.entry, p, v); }
}

export function Editor() {
  // the hash keeps the open card when the page reloads
  const [sel, setSel] = useState(() => location.hash.slice(1));
  const [drafts, setDrafts] = useState<Drafts>({});
  const [filter, setFilter] = useState('');
  const [status, setStatus] = useState<{ key: string; ok?: boolean; msg: string } | null>(null);
  const it = ITEMS.find(i => i.key === sel) ?? ITEMS[0];
  const value = (i: Item, path: string) => drafts[i.key]?.[path] ?? get(i.entry, path) ?? '';
  const values = Object.fromEntries(it.fields.map(f => [f.path, value(it, f.path)]));
  const dirty = !!drafts[it.key];

  function select(key: string) {
    setSel(key);
    history.replaceState(null, '', '#' + key);
  }

  function edit(path: string, v: string) {
    setDrafts(d => {
      const mine = { ...d[it.key], [path]: v };
      if (v === (get(it.entry, path) ?? '')) delete mine[path];   // back to the saved text: nothing to save
      return without(d, it.key, mine);
    });
  }

  async function save(i: Item) {
    const set = drafts[i.key];
    if (!set) return;
    setStatus({ key: i.key, msg: 'Kaydediliyor…' });
    try {
      const res = await fetch('/dev/content', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ file: i.file, id: i.id, set }),
      });
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!body.ok) throw new Error(body.error ?? `sunucu ${res.status} döndü (yalnızca geliştirme sunucusunda kaydeder)`);
    } catch (e) {
      setStatus({ key: i.key, ok: false, msg: `Kaydedilemedi: ${(e as Error).message}` });
      return;
    }
    // The file is written. Until Vite hot-reloads it, keep the loaded copy in step so the card reads as saved.
    for (const [p, v] of Object.entries(set)) put(i.entry, p, v);
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
        <input className="ed-filter" type="search" placeholder="Ara: ad ya da metin" value={filter} onChange={e => setFilter(e.target.value)} />
        {GROUPS.map(g => {
          const list = shown.filter(i => i.group === g);
          return list.length > 0 && (
            <section key={g}>
              <h2>{g}</h2>
              {list.map(i => (
                <button key={i.key} className={i.key === it.key ? 'on' : undefined} onClick={() => select(i.key)}>
                  {value(i, 'name') || i.id}
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
          <span className="ed-kind">{it.group} · {it.id}</span>
          <button className="ed-save" disabled={!dirty} onClick={() => save(it)} title="Ctrl/⌘ + S">Kaydet</button>
        </header>
        <p className={'ed-status' + (note?.ok === true ? ' ok' : note?.ok === false ? ' err' : '')}>
          {note ? note.msg : dirty ? 'Kaydedilmemiş değişiklik var.' : ' '}
        </p>
        {it.fields.map(f => {
          const props = {
            value: values[f.path],
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
          Nüfuzu), simgesini ve kalın yazısını alır. Büyük-küçük harf önemlidir. Kaydet: düğme ya da Ctrl/⌘ + S.
        </p>
        <details className="ed-terms">
          <summary>Tanınan terimler</summary>
          <ul>
            {TERMS.map(t => (
              <li key={t.id}>
                <img src={`${ICON_BASE}${t.icon}-48.png`} alt="" />
                {t.stems.join(', ')}{t.display === 'icon' && <small> (yalnız simge)</small>}
              </li>
            ))}
          </ul>
        </details>
      </main>

      <aside className="ed-preview">
        <CardDefs />
        {it.ref ? <Card spec={previewSpec(it, values)} width={260} /> : (
          <div className="ed-power"><b>{values.name}</b><p>{values.text}</p><small>İhanet gücü: kartı yok, metni oyun içinde görünür.</small></div>
        )}
      </aside>
    </div>
  );
}
