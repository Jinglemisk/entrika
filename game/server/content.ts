// Dev-only backend of the card text editor (/?duzenle): writes display text into content/*.json. Only the fields
// listed here can change; ids, targets, copies, draw rules, frequencies and art are game behaviour and stay out of reach.
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import type http from 'node:http';

const DIR = path.join(import.meta.dirname, '..', 'content');
const CARD = ['name', 'text', 'flavor'];
// Files that hold a list of entries with an id, and the text fields of each entry.
const LISTS: Record<string, string[]> = {
  characters: ['name', 'base.name', 'base.text', 'favor.name', 'favor.text', 'loyal', 'traitor', 'flavor'],
  companions: CARD, intrigue: CARD, crises: CARD, ambitions: CARD,
};

type Entry = Record<string, unknown>;
interface Edit { file: string; id: string; set: Record<string, unknown> }

/** The entry an edit addresses and the fields it may change there, or undefined for anything unknown. */
function locate(file: string, id: string, data: unknown): { entry: Entry; fields: string[] } | undefined {
  if (Object.hasOwn(LISTS, file)) {
    const entry = (data as Entry[]).find(e => e.id === id);
    return entry && { entry, fields: LISTS[file] };
  }
  // misc.json is keyed by group: Kader and Taraf cards print their text as lines, treason powers have no card
  const m = file === 'misc' ? /^(kader|taraf|treason)\.([\w-]+)$/.exec(id) : null;
  const group = m && (data as Record<string, Record<string, Entry>>)[m[1]];
  const entry = m && group && Object.hasOwn(group, m[2]) ? group[m[2]] : undefined;
  if (!m || !entry) return;
  if (m[1] === 'treason') return { entry, fields: ['name', 'text'] };
  return { entry, fields: ['name', 'flavor', ...(entry.text as string[]).map((_, i) => `text.${i}`)] };
}

function applyEdit(data: unknown, { file, id, set }: Edit) {
  const hit = typeof id === 'string' ? locate(file, id, data) : undefined;
  if (!hit) throw new Error(`Bilinmeyen kart: ${file} / ${id}`);
  const edits = Object.entries(set ?? {});
  if (!edits.length) throw new Error('Değişiklik yok.');
  for (const [field, value] of edits) {
    if (!hit.fields.includes(field)) throw new Error(`Bu alan düzenlenemez: ${field}`);
    if (typeof value !== 'string') throw new Error(`Metin değil: ${field}`);
  }
  for (const [field, value] of edits) {
    const keys = field.split('.');
    const last = keys.pop()!;
    (keys.reduce((o, k) => o[k] as Entry, hit.entry))[last] = value;
  }
}

// Two-space JSON, but anything that fits on one line of WIDTH stays on it (art, copies, short lists), so the files
// stay as easy to read as the hand-written ones and an edit changes only its own line.
const WIDTH = 110;
const flat = (v: unknown): string =>
  v === null || typeof v !== 'object' ? JSON.stringify(v)
    : Array.isArray(v) ? (v.length ? `[${v.map(flat).join(', ')}]` : '[]')
      : Object.keys(v).length ? `{ ${Object.entries(v).map(([k, x]) => `${JSON.stringify(k)}: ${flat(x)}`).join(', ')} }` : '{}';

function format(v: unknown, indent = '', column = 0): string {
  const one = flat(v);
  if (v === null || typeof v !== 'object' || column + one.length + 1 <= WIDTH) return one;   // +1: the comma after it
  const inner = indent + '  ';
  const lines = Array.isArray(v)
    ? v.map(x => inner + format(x, inner, inner.length))
    : Object.entries(v).map(([k, x]) => {
      const head = `${inner}${JSON.stringify(k)}: `;
      return head + format(x, inner, head.length);
    });
  const [open, close] = Array.isArray(v) ? '[]' : '{}';
  return `${open}\n${lines.join(',\n')}\n${indent}${close}`;
}

function save(edit: Edit) {
  // a fixed list of names, so the path can never leave content/
  if (typeof edit.file !== 'string' || (!Object.hasOwn(LISTS, edit.file) && edit.file !== 'misc')) throw new Error(`Bilinmeyen dosya: ${edit.file}`);
  const file = path.join(DIR, `${edit.file}.json`);
  const data: unknown = JSON.parse(fs.readFileSync(file, 'utf8'));   // fresh, in case the file was edited by hand
  applyEdit(data, edit);
  fs.writeFileSync(file, format(data) + '\n');
}

// Only the editor page itself may write: same origin, and a host that is this machine's name or address, so a
// page on another site that rebinds its DNS name to this server cannot pass for it.
function trusted(req: http.IncomingMessage): boolean {
  const host = req.headers.host ?? '';
  let name: string;
  try { name = new URL(`http://${host}`).hostname.replace(/^\[|\]$/g, ''); } catch { return false; }
  return req.headers.origin === `http://${host}` && (name === 'localhost' || net.isIP(name) !== 0);
}

/** POST { file, id, set: { field: text } } → { ok: true } or { error }. Routed only outside production. */
export function contentEdit(req: http.IncomingMessage, res: http.ServerResponse) {
  const reply = (status: number, body: object) =>
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' }).end(JSON.stringify(body));
  if (req.method !== 'POST') return reply(405, { error: 'POST bekleniyor.' });
  if (!trusted(req)) return reply(403, { error: 'Yalnızca bu sunucunun kendi sayfasından.' });
  let body = '';
  req.setEncoding('utf8');
  req.on('data', chunk => { body += chunk; });
  req.on('end', () => {
    try {
      save(JSON.parse(body) as Edit);
      reply(200, { ok: true });
    } catch (e) {
      reply(400, { error: e instanceof Error ? e.message : String(e) });
    }
  });
}
