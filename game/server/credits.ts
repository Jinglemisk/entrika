// /kaynaklar: what Entrika is, who owns each world, and where every picture came from. Built on each request from each
// mod's mod.json (its rights line and where its source list lives) and that source list (art/manifest.json), so it
// never lags the art. A picture is the candidate the mod's skin points at, else the list's first (its pick).
import fs from 'node:fs';
import path from 'node:path';
import type http from 'node:http';
import { DEFAULT_MOD, MODS, MODS_DIR } from './mods.ts';

const REPO = path.join(MODS_DIR, '..');
type Lang = 'tr' | 'en';
const TEXT: Record<Lang, Record<string, string>> = {
  tr: {
    title: 'Hakkında ve kaynaklar',
    about: 'Entrika resmi olmayan, ticari olmayan bir hayran oyunudur; arkadaşlar arasında oynanmak için yapıldı. Hiçbir yapımcı, yayıncı ya da yayıneviyle bağı yoktur, onlarca onaylanmamıştır. Dizilerin ve kitapların adları, karakterleri ve görüntüleri sahiplerine aittir. Bir hak sahibi bir şeyin kaldırılmasını isterse kaldırılır.',
    own: 'Oyunun kuralları, kart metinleri ve kodu Entrika\'nındır.',
    card: 'Kart', source: 'Kaynak', licence: 'Lisans', other: 'English',
  },
  en: {
    title: 'About and credits',
    about: 'Entrika is an unofficial, non-commercial fan game, made to be played among friends. It is not affiliated with or endorsed by any producer, broadcaster or publisher. The names, characters and images of the series and books belong to their owners. Anything a rights holder asks to have removed will be removed.',
    own: 'The rules, card text and code are Entrika\'s own.',
    card: 'Card', source: 'Source', licence: 'Licence', other: 'Türkçe',
  },
};
// a source list's entity id → where its name is in the mod's words
const GROUP: Record<string, string> = { char: 'characters', comp: 'companions', card: 'intrigue', crisis: 'crises' };

const esc = (s: string) => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
const read = (file: string) => { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return null; } };

function modSection(id: string, lang: Lang): string {
  const dir = path.join(MODS_DIR, id);
  const mod = read(path.join(dir, 'mod.json'));
  if (!mod || mod.draft) return '';
  const words = read(path.join(dir, `${lang}.json`)) ?? read(path.join(dir, `${mod.native}.json`)) ?? {};
  const list = mod.sources ? read(mod.sources.startsWith('/') ? path.join(REPO, mod.sources) : path.join(dir, mod.sources)) : null;
  let skin = '';
  try { skin = fs.readFileSync(path.join(dir, 'skin.json'), 'utf8'); } catch { /* no skin */ }
  const rows = Object.entries<{ candidates?: { file: string; source_page?: string; source_url?: string; licence?: string }[] }>(list?.entities ?? {})
    .map(([key, e]) => {
      const c = e.candidates ?? [];
      const pick = c.find(x => skin.includes(x.file.replace(/\.\w+$/, ''))) ?? c[0];
      if (!pick) return '';
      const [kind, ...rest] = key.split('.');
      const name = kind === 'term' ? words.kader?.[rest[0] === 'hizmet' ? 'h' : 'x']?.name : words[GROUP[kind]]?.[rest.join('.')]?.name;
      const href = pick.source_page || pick.source_url || '';
      const host = href ? new URL(href).hostname.replace(/^www\./, '') : '';
      if (!name) return '';   // pictures for cards no longer in the game
      return `<tr><td>${esc(name)}</td><td>${href ? `<a href="${esc(href)}" rel="noopener">${esc(host)}</a>` : ''}</td><td>${esc(pick.licence ?? '')}</td></tr>`;
    }).join('');
  const T = TEXT[lang];
  return `<section><h2>${esc(mod.name?.[lang] ?? mod.name?.[mod.native] ?? id)}</h2><p>${esc(mod.rights?.[lang] ?? mod.rights?.[mod.native] ?? '')}</p>`
    + (rows ? `<div class="t"><table><thead><tr><th>${T.card}</th><th>${T.source}</th><th>${T.licence}</th></tr></thead><tbody>${rows}</tbody></table></div>` : '') + '</section>';
}

export function credits(req: http.IncomingMessage, res: http.ServerResponse) {
  const lang: Lang = new URL(req.url ?? '/', 'http://x').searchParams.get('dil') === 'en' ? 'en' : 'tr';
  const T = TEXT[lang];
  const html = `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Entrika · ${T.title}</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,400;0,800;1,400&family=Alegreya+Sans:wght@500;700&display=swap">
<style>
body{margin:0;background:#efe6cf;color:#2a2017;font:500 16px/1.5 "Alegreya Sans",system-ui,sans-serif}
main{max-width:46rem;margin:0 auto;padding:2rem max(16px,env(safe-area-inset-left)) 3rem}
h1{font:800 2.2rem/1.1 Alegreya,Georgia,serif;margin:0 0 1rem}h2{font:800 1.4rem/1.2 Alegreya,Georgia,serif;margin:2rem 0 .4rem}
p{margin:.4rem 0}.lead{font:italic 400 1.1rem/1.45 Alegreya,Georgia,serif}a{color:#7a1a20}
.t{overflow-x:auto}table{border-collapse:collapse;width:100%;font-size:.92rem;margin-top:.6rem}
th,td{text-align:left;padding:.35rem .5rem;border-bottom:1px solid #d6c8a4;vertical-align:top}th{font-weight:700;color:#6b5a44}
nav{display:flex;gap:1rem;font-weight:700}
</style></head><body><main>
<nav><a href="/">Entrika</a><a href="/kurallar">${lang === 'tr' ? 'Kurallar' : 'Rules'}</a><a href="/kaynaklar${lang === 'tr' ? '?dil=en' : ''}">${T.other}</a></nav>
<h1>${T.title}</h1><p class="lead">${T.about}</p><p>${T.own}</p>
${[...MODS].sort((a, b) => Number(b.id === DEFAULT_MOD) - Number(a.id === DEFAULT_MOD)).map(m => modSection(m.id, lang)).join('')}
</main></body></html>`;
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-cache' });
  res.end(html);
}
