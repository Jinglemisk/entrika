// Dev-only backend of the card text editor (/?duzenle): writes the printed words of a card into a mod's words file,
// mods/<mod>/<lang>.json. Only the text fields listed here can change, and only for ids the game has; ids, targets,
// copies, draw rules, frequencies and art are game behaviour and stay out of reach.
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import type http from 'node:http';
import { AMBITIONS, CHARACTERS, COMPANIONS, CRISES, INTRIGUE, MISC } from '../src/engine/index.ts';
import { MODS_DIR, modById } from './mods.ts';

const LANGS = ['tr', 'en'];
const CARD = ['name', 'text', 'flavor'];
const LINES = ['name', 'text.0', 'text.1', 'flavor'];
// Each words group: the ids it may hold and the text fields of each entry.
const GROUPS: Record<string, { ids: string[]; fields: string[] }> = {
  characters: { ids: CHARACTERS.map(c => c.id), fields: ['name', 'short', 'base.name', 'base.text', 'favor.name', 'favor.text', 'flavor'] },
  companions: { ids: COMPANIONS.map(c => c.id), fields: CARD },
  intrigue: { ids: INTRIGUE.map(c => c.id), fields: CARD },
  crises: { ids: CRISES.map(c => c.id), fields: CARD },
  ambitions: { ids: AMBITIONS.map(c => c.id), fields: CARD },
  kader: { ids: Object.keys(MISC.kader), fields: LINES },
  taraf: { ids: Object.keys(MISC.taraf), fields: LINES },
  treason: { ids: Object.keys(MISC.treason), fields: ['name', 'text'] },
};

type Entry = Record<string, unknown>;
interface Edit { mod: string; lang: string; group: string; id: string; set: Record<string, unknown> }

/** Writes the edit's fields into the words object; an empty field removes the word (the native one shows again). */
function applyEdit(words: Entry, { group, id, set }: Edit) {
  const g = Object.hasOwn(GROUPS, group) ? GROUPS[group] : undefined;
  if (!g || !g.ids.includes(id)) throw new Error(`Bilinmeyen kart: ${group} / ${id}`);
  const edits = Object.entries(set ?? {});
  if (!edits.length) throw new Error('Değişiklik yok.');
  for (const [field, value] of edits) {
    if (!g.fields.includes(field)) throw new Error(`Bu alan düzenlenemez: ${field}`);
    if (typeof value !== 'string') throw new Error(`Metin değil: ${field}`);
  }
  const entry = ((words[group] ??= {}) as Entry)[id] ??= {};
  for (const [field, value] of edits) {
    const keys = field.split('.');
    let o = entry as Entry;
    keys.slice(0, -1).forEach((k, i) => { o = (o[k] ??= /^\d+$/.test(keys[i + 1]) ? [] : {}) as Entry; });
    const last = keys[keys.length - 1];
    if (value) o[last] = value;
    else delete o[last];
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
  // a mod the server knows and a language from a fixed list, so the path can never leave mods/
  if (typeof edit.mod !== 'string' || !modById(edit.mod)) throw new Error(`Bilinmeyen mod: ${edit.mod}`);
  if (!LANGS.includes(edit.lang)) throw new Error(`Bilinmeyen dil: ${edit.lang}`);
  const file = path.join(MODS_DIR, edit.mod, `${edit.lang}.json`);
  const words = (fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {}) as Entry;   // fresh, in case it was edited by hand
  applyEdit(words, edit);
  fs.writeFileSync(file, format(words) + '\n');
}

// Only the editor page itself may write: same origin, and a host that is this machine's name or address, so a
// page on another site that rebinds its DNS name to this server cannot pass for it.
function trusted(req: http.IncomingMessage): boolean {
  const host = req.headers.host ?? '';
  let name: string;
  try { name = new URL(`http://${host}`).hostname.replace(/^\[|\]$/g, ''); } catch { return false; }
  return req.headers.origin === `http://${host}` && (name === 'localhost' || net.isIP(name) !== 0);
}

/** POST { mod, lang, group, id, set: { field: text } } → { ok: true } or { error }. Routed only outside production. */
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
