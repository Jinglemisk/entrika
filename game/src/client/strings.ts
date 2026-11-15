// Every interface string goes through here, so an English table can be added later without touching components.
import tr from '../../content/strings.tr.json' with { type: 'json' };
import { suffix, type Case } from './turkish.ts';

const TABLE = tr as Record<string, string>;

export function t(key: string, vars?: Record<string, unknown>): string {
  const s = TABLE[key];
  if (s === undefined) {
    if (import.meta.env?.DEV) console.warn('missing string', key);
    return key;
  }
  // {name} inserts a value; {name:dat} adds a Turkish case suffix to it (dat, acc, gen, loc, abl)
  return vars ? s.replace(/\{(\w+)(?::(\w+))?\}/g, (_, k, c) => (c ? suffix(String(vars[k] ?? ''), c as Case) : String(vars[k] ?? ''))) : s;
}
