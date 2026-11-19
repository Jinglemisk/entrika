// The mods on disk: mods/<id>/mod.json at the repo root. The server only needs to know which exist and which are drafts
// (unfinished: offered in test rooms only); the words and art are read by the phones.
import fs from 'node:fs';
import path from 'node:path';

export const MODS_DIR = path.join(import.meta.dirname, '..', '..', 'mods');
export const DEFAULT_MOD = 'muhtesem';
export interface ModInfo { id: string; native: string; draft?: boolean }

export const MODS: ModInfo[] = fs.readdirSync(MODS_DIR, { withFileTypes: true })
  .filter(d => d.isDirectory() && fs.existsSync(path.join(MODS_DIR, d.name, 'mod.json')))
  .map(d => JSON.parse(fs.readFileSync(path.join(MODS_DIR, d.name, 'mod.json'), 'utf8')) as ModInfo);
export const modById = (id: string) => MODS.find(m => m.id === id);
