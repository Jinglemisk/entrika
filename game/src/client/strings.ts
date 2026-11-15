// Every interface string goes through here, so an English table can be added later without touching components.
import tr from '../../content/strings.tr.json' with { type: 'json' };

const TABLE = tr as Record<string, string>;

export function t(key: string, vars?: Record<string, unknown>): string {
  const s = TABLE[key];
  if (s === undefined) {
    if (import.meta.env?.DEV) console.warn('missing string', key);
    return key;
  }
  return vars ? s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? '')) : s;
}
