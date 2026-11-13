(function () {
'use strict';
/* =====================================================================
   Entrika: one scripted round, playable from any seat.
   This is a prototype, not the engine: the content, hands and bot
   choices below are fake data for crisis 4 (Divan Kavgası). The rules
   that the UI has to enforce (fields, legal targets, Kul recast,
   Loyalist duty, resolve order) are real, so free play stays legal.
   ===================================================================== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const ART = JSON.parse($('#art-cards').textContent);
const TERMS = JSON.parse($('#art-terms').textContent);
const ico = (n, c = 'ico') => `<svg class="${c}" aria-hidden="true"><use href="#i-${n}"/></svg>`;
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* ---------------- strings (every UI string goes through here) ---------------- */
const T = {
  step: ['Kriz', 'Atama', 'Tertip', 'Kader', 'Sonuç', 'Hüküm'],
  newCrisis: 'Yeni Kriz', announce: 'Atamayı ilan et', sleep: 'Saray uyusun', wake: 'Saray uyansın', kader: 'Kader', decree: 'Hüküm',
  kulisEnd: 'Kulis bitti', seal: 'Mühürle', pass: 'Pas geç', object: 'İtiraz et', skip: 'Geç', send: 'Gönder', play: 'Oyna', use: 'Kullan', ok: 'Tamam',
  start: 'Oyunu başlat', join: 'Koda katıl', restart: 'Baştan', end: 'Oyun sonu', newGame: 'Yeni oyun',
  min1: 'Birinci Vekil', min2: 'İkinci Vekil', yourTurn: 'Sıra sende', waiting: n => `${n} kişi bekleniyor`, waitingOne: 'Bekleniyor',
  ready: n => `${n} hazır`, hold: 'Basılı tut', tossOne: 'Birini at', sendTwo: 'İkisi İkinci Vekile gider', playOther: 'Diğeri oynanır',
  dutyH1: 'Sadık Birinci Vekil Hıyanet atar.', dutyH2: 'Sadık İkinci Vekil Hizmet oynar.', silent: 'Kimse konuşmaz',
  who: 'Yerine kim?', whoObj: 'İtiraz ettiğin Vekilin yerine kim?', whoFerman: 'Fermanla kimi atıyorsun?', fermanQ: 'Bir Vekili değiştir; Mühür’ü de aşar.',
  investigator: 'Soruşturmacıyı seç', investigate: 'Kimin Tarafına bakacaksın?', defend: 'Vekiller kendini savunur',
  decreeH: 'Bir Vekile 1 Nüfuz ver', decreeX: 'Bir Vekilden 1 Nüfuz al', protoEnd: 'Prototip bu krizle bitiyor',
  log: 'Kayıt', settings: 'Ayarlar', sound: 'Ses', music: 'Müzik', vib: 'Titreşim', vibNote: 'iPhone’da yok', cues: 'Görsel ipuçları her zaman açık.',
  devSeat: 'Koltuk değiştir', devJump: 'Adıma git', devNotes: 'Prototip notları', suspect: 'Şüpheli', trusted: 'Güvenilir',
  allies: 'Hain dostların', alone: 'Tek Hain sensin', roomCode: 'Oda kodu', share: 'Bu kodu paylaş', joined: 'Masadakiler', empty: 'boş',
  traitorsWin: 'Hainler kazandı', loyalWin: 'Sadıklar kazandı', death: 'Süleyman’ın ölümü',
  peekHand: 'Eli ve Hırs kartı', peekTop: 'Kader destesinin üstü', peekDisc: 'Attığı kart', peekTaraf: 'Tarafı',
};
const STEP_I = { lobi: -1, k0: 0, atama: 1, itiraz: 1, 'itiraz-done': 1, tertip: 2, acilis: 2, 'acilis-done': 2, kader: 3, sonuc: 4, 'sonuc-done': 4, hukum: 5, son: 5 };

/* ---------------- content ---------------- */
const CH = {
  suleyman: { n: 'Süleyman', base: ['Ferman', 'decree'] },
  hurrem: { n: 'Hürrem', base: ['Fısıltı', 'decree'], favor: ['Çifte Oyun', 'court'] },
  ibrahim: { n: 'Pargalı', base: ['Sadrazam', 'min1'], favor: ['Divan Nüfuzu', 'influence'] },
  mahidevran: { n: 'Mahidevran', base: ['İtiraz', 'objection'], favor: ['Sürgün', 'minister'] },
  bali: { n: 'Malkoçoğlu', base: ['Muhafız', 'hiyanet'], favor: ['Gözcü', 'secret'] },
  hatice: { n: 'Hatice', base: ['Himaye', 'influence'], favor: ['Haber', 'ambition'] },
  mihrimah: { n: 'Mihrimah', base: ['Göz Bebeği', 'secret'], favor: ['Hediye', 'influence'] },
  rustem: { n: 'Rüstem', base: ['Kulis', 'secret'], favor: ['Yön Değiştir', 'intrigue'] },
};
const KUL = {
  sumbul: { n: 'Sümbül Ağa', as: 'saray-dedikodusu' }, daye: { n: 'Daye Hatun', as: 'valide' }, lokman: { n: 'Lokman Ağa', as: 'muhur' },
  nigar: { n: 'Nigar Kalfa', as: 'muhurlu-evrak' }, gulsah: { n: 'Gülşah Hatun', as: 'iftira' }, piri: { n: 'Piri Mehmet Paşa' }, afife: { n: 'Afife Hatun' },
};
// tg: who it may be placed on. min = a Vekil, self = yourself, other = anyone but you, any = anyone
const INTR = {
  'akil-d': { n: 'Akıl Hocası', no: 1, f: 'D', tg: 'any', img: 'card.akil-hocasi-1.jpg', pos: '50% 40%', t: 'Bu oyuncuya konan, kendi alanındaki diğer Entrika kartlarını iptal eder.', fl: 'Akıl, kılıçtan keskindir.' },
  'akil-h': { n: 'Akıl Hocası', no: 1, f: 'H', tg: 'any', img: 'card.akil-hocasi-1.jpg', pos: '50% 40%', t: 'Bu oyuncuya konan, kendi alanındaki diğer Entrika kartlarını iptal eder.', fl: 'Akıl, kılıçtan keskindir.' },
  muhur: { n: 'Mühür', no: 2, f: 'D', tg: 'min' },
  valide: { n: "Valide'nin Buyruğu", no: 3, f: 'D', tg: 'min', t: 'Bir Vekile koy. Onu uygun bir oyuncuyla değiştir; kendini de seçebilirsin.' },
  'divan-sirasi': { n: 'Divan Sırası', no: 4, f: 'D', tg: 'min', img: 'card.divan-sirasi-1.jpg', pos: '30% 50%', t: 'Bir Vekile koy. Birinci Vekil ile İkinci Vekil yer değiştirir.', fl: 'Divanda sıra, kaderdir.' },
  'saray-dedikodusu': { n: 'Saray Dedikodusu', no: 5, f: 'H', tg: 'other', t: 'Bu oyuncunun eline ve Hırs kartına gizlice bak.' },
  'muhurlu-evrak': { n: 'Mühürlü Evrak', no: 6, f: 'H', tg: 'self', img: 'card.muhurlu-evrak-1.jpg', pos: '50% 30%', t: 'Kendi önüne koy. Kader destesinin üstteki 3 kartına gizlice bak.', fl: 'Mühür kırılmadan sır saklanır.' },
  'saray-tabibi': { n: 'Saray Tabibi', no: 7, f: 'H', tg: 'any' },
  iftira: { n: 'İftira', no: 8, f: 'H', tg: 'any' },
  gozde: { n: "Gözde'nin Hediyesi", no: 9, f: 'H', tg: 'other', img: 'card.gozde-1.jpg', pos: '50% 40%', t: 'Bu oyuncu (sen değil) 1 Nüfuz kazanır.', fl: 'Gözdenin hediyesi, borcun ilkidir.' },
  teftis: { n: 'Teftiş', no: 10, f: 'D', tg: 'min', img: 'card.teftis-1.jpg', pos: '35% 30%', t: 'Bir Vekile koy. Kader adımından sonra attığı kartlara gizlice bak.', fl: 'Defterler yalan söylemez.' },
};
const HIRS = {
  itirazci: { n: 'İtirazcı', t: 'Bir İtiraz yap.' }, koltuk: { n: 'Koltuk Kapmak', t: 'Bir Entrika kartıyla Vekil ol.' },
  takdir: { n: 'Padişahın Takdiri', t: "Süleyman'ın +1'ini al." }, divanda: { n: 'Divanda Nüfuz', t: 'İki kez Vekil olarak atan.' },
  supheli: { n: 'Şüphe Altında', t: 'Hıyanet oynandığında Vekil ol.' }, gozden: { n: 'Gözden Düşmek', t: "Süleyman'ın Hükmüyle Nüfuz kaybet." },
  kulak: { n: 'Kulak Misafiri' },
};
const TRACK_PW = { 2: ['Soruşturma', 'secret'], 3: ['Hazine Defteri', 'kader'], 4: ['Ferman', 'decree'], 5: [T.death, 'death'] };

/* ---------------- term icons (one renderer, driven by art/terms.json) ---------------- */
const byStem = {}; const stems = [];
TERMS.forEach(t => t.stems.forEach(s => { byStem[s] = t; stems.push(s); }));
stems.sort((a, b) => b.length - a.length);
const termRe = new RegExp('(?<![\\p{L}\\p{N}])(' + stems.map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ")(?:['’]\\p{L}+|\\p{L}*)", 'gu');
function renderTerms(el) {
  const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); const nodes = []; let n;
  while ((n = w.nextNode())) nodes.push(n);
  nodes.forEach(node => {
    if (node.parentElement && node.parentElement.closest('[data-noterms], .pn, .tm')) return;
    const text = node.nodeValue; let m, last = 0, frag = null; termRe.lastIndex = 0;
    while ((m = termRe.exec(text))) {
      const t = byStem[m[1]]; if (!t || t.display === 'icon') continue;
      frag = frag || document.createDocumentFragment();
      frag.appendChild(document.createTextNode(text.slice(last, m.index)));
      const sp = document.createElement('span'); sp.className = 'tm t-' + t.icon;
      sp.innerHTML = ico(t.icon); sp.appendChild(document.createTextNode(m[0])); frag.appendChild(sp);
      last = m.index + m[0].length;
    }
    if (frag) { frag.appendChild(document.createTextNode(text.slice(last))); node.parentNode.replaceChild(frag, node); }
  });
}

/* ---------------- cards: art-page markup, patched only where the art page has no card yet ---------------- */
const cardCache = {};
function patch(h, o) {
  if (o.label) h = h.replace(/aria-label="[^"]*"/, `aria-label="${esc(o.label)}"`).replace(/<h4 class="nm[^"]*">[^<]*<\/h4>/, `<h4 class="nm${o.label.length > 13 ? ' long' : ''}">${esc(o.label)}</h4>`);
  if (o.img) h = h.replace(/<img src="[^"]*" alt="" style="[^"]*"/, `<img src="img/${o.img}" alt="" style="object-position:${o.pos || '50% 35%'}"`);
  if (o.no) h = h.replace(/<span class="mj"><b>\d+<\/b>/, `<span class="mj"><b>${o.no}</b>`);
  if (o.text) h = h.replace(/<p data-terms>[\s\S]*?<\/p>/, `<p data-terms>${o.text}</p>`);
  if (o.fl !== undefined) h = h.replace(/<p class="fl">[\s\S]*?<\/p>/, o.fl ? `<p class="fl">${o.fl}</p>` : '');
  if (o.field) {
    const [from, to] = o.field;
    const nm = { coral: ['harem', 'Harem'], cobalt: ['divan', 'Divan'] };
    h = h.split('j-' + from).join('j-' + to).split('#i-' + nm[from][0]).join('#i-' + nm[to][0]).split('Alan: ' + nm[from][1]).join('Alan: ' + nm[to][1]);
  }
  return h;
}
function cardHTML(key) {
  if (cardCache[key]) return cardCache[key];
  let h = ART[key];
  const [kind, id] = key.split('.');
  if (kind === 'intr') {
    const d = INTR[id];
    const own = { iftira: 1, valide: 1, muhur: 1, 'saray-tabibi': 1, 'saray-dedikodusu': 1 }[id];
    if (own) h = patch(ART['intr.' + id], { text: d.t });
    else {
      const harem = d.f === 'H';
      h = patch(ART[harem ? 'intr.iftira' : 'intr.muhur'], { label: d.n, img: d.img, pos: d.pos, no: d.no, text: d.t, fl: d.fl });
    }
    if (id === 'akil-h') h = patch(h, { field: ['cobalt', 'coral'] });
    if (id === 'akil-d') h = patch(h, { field: ['coral', 'cobalt'] });
  } else if (kind === 'kul' && !h) {
    const k = KUL[id]; const as = INTR[k.as];
    h = patch(ART['kul.sumbul'], { label: k.n, img: 'roster-comp.' + id + '.jpg', pos: '50% 22%', text: `Bir Entrika kartını ${as.n} olarak koy.`, fl: '' });
    if (as.f === 'D') h = patch(h, { field: ['coral', 'cobalt'] });
  } else if (kind === 'kul' && id === 'sumbul') {
    h = patch(h, { text: 'Bir Entrika kartını Saray Dedikodusu olarak koy.' });
  } else if (kind === 'hirs' && id !== 'kulak') {
    h = patch(ART['hirs.kulak'], { label: HIRS[id].n, text: HIRS[id].t, fl: '' });
  }
  if (!h) { console.warn('no card', key); return ''; }
  const t = document.createElement('template'); t.innerHTML = h;
  t.content.querySelectorAll('[data-terms]').forEach(renderTerms);
  t.content.querySelectorAll('img').forEach(i => { i.removeAttribute('decoding'); i.setAttribute('draggable', 'false'); });
  return (cardCache[key] = t.innerHTML);
}
const card = (key, w, cls = '') => `<div class="c3-w ${cls}" style="width:${w}px">${cardHTML(key)}</div>`;

/* ---------------- drawn shapes ---------------- */
const SCALLOP = 'M0 -30A8.5 8.5 0 0 1 15 -26A8.5 8.5 0 0 1 26 -15A8.5 8.5 0 0 1 30 0A8.5 8.5 0 0 1 26 15A8.5 8.5 0 0 1 15 26A8.5 8.5 0 0 1 0 30A8.5 8.5 0 0 1 -15 26A8.5 8.5 0 0 1 -26 15A8.5 8.5 0 0 1 -30 0A8.5 8.5 0 0 1 -26 -15A8.5 8.5 0 0 1 -15 -26A8.5 8.5 0 0 1 0 -30Z';
function bezel(sul) {
  return `<svg viewBox="-34 -34 68 68" aria-hidden="true"><g filter="url(#f-bevel)"><path d="${SCALLOP}" transform="scale(1.06)" fill="url(#g-gold)"/></g>
  ${sul ? '<circle r="26.5" fill="none" stroke="url(#j-crimson)" stroke-width="3.2"/>' : ''}<circle r="${sul ? 24.6 : 25.6}" fill="#1d140d" stroke="#3a2208" stroke-width="1.2"/></svg>`;
}
function medal(id, sul) {
  const p = G.pl[id];
  return `<div class="med">${bezel(sul)}<div class="pt"><img src="img/roster-char.${p.ch}.jpg" alt="" draggable="false"></div></div>`;
}
function cartPath(w, h) {
  const e = .5625 * h, r = w - e, f = n => n.toFixed(1);
  return `M${f(e)} 0H${f(r)}C${f(r + .22 * h)} 0 ${f(r + .28 * h)} ${f(.19 * h)} ${f(r + .375 * h)} ${f(.28 * h)}Q${f(r + .5 * h)} ${f(.375 * h)} ${f(w)} ${f(.5 * h)}Q${f(r + .5 * h)} ${f(.625 * h)} ${f(r + .375 * h)} ${f(.72 * h)}C${f(r + .28 * h)} ${f(.81 * h)} ${f(r + .22 * h)} ${f(h)} ${f(r)} ${f(h)}H${f(e)}C${f(e - .22 * h)} ${f(h)} ${f(e - .28 * h)} ${f(.81 * h)} ${f(e - .375 * h)} ${f(.72 * h)}Q${f(e - .5 * h)} ${f(.625 * h)} 0 ${f(.5 * h)}Q${f(e - .5 * h)} ${f(.375 * h)} ${f(e - .375 * h)} ${f(.28 * h)}C${f(e - .28 * h)} ${f(.19 * h)} ${f(e - .22 * h)} 0 ${f(e)} 0Z`;
}
function cartSVG(w, h, fill = 'url(#g-ivory)') {
  return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><path d="${cartPath(w, h)}" fill="${fill}" filter="url(#f-shadow)"/><path d="${cartPath(w, h)}" fill="none" stroke="url(#g-gold)" stroke-width="2.6" filter="url(#f-bevel)"/><path d="${cartPath(w - 8, h - 8)}" transform="translate(4 4)" fill="none" stroke="#b3311d" stroke-width=".8" opacity=".55"/></svg>`;
}
function plaqueSVG(w, h) {
  const p = cartPath(w, h), pi = cartPath(w - 10, h - 10);
  return `<svg viewBox="0 0 ${w} ${h}" aria-hidden="true"><path d="${p}" fill="#0c1c16" filter="url(#f-shadow)"/><path d="${p}" fill="url(#p-halkari)" opacity=".9"/>
  <path d="${p}" fill="none" stroke="url(#g-gold)" stroke-width="4" filter="url(#f-bevel)"/><path d="${pi}" transform="translate(5 5)" fill="none" stroke="url(#g-gold)" stroke-width="1.1" opacity=".8"/></svg>`;
}
function waxSVG(icon, txt) {
  return `<svg viewBox="-40 -40 80 80" aria-hidden="true"><defs><radialGradient id="wx${icon}" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#e2584a"/><stop offset=".45" stop-color="#a3221b"/><stop offset="1" stop-color="#4f0b09"/></radialGradient></defs>
  <path d="M2 -36C12 -37 20 -31 27 -27C35 -22 37 -13 36 -4C38 5 35 13 31 20C27 30 18 36 8 36C1 39 -8 37 -15 34C-25 31 -33 23 -35 13C-38 4 -36 -6 -33 -14C-29 -24 -21 -31 -12 -34C-6 -36 -2 -36 2 -36Z" fill="url(#wx${icon})" filter="url(#f-shadow)"/>
  <circle r="24" fill="none" stroke="#5a0d07" stroke-width="2.4" opacity=".7"/><circle r="22.5" fill="none" stroke="#ff9a82" stroke-width=".9" opacity=".45"/>
  <g transform="translate(-13 -13) scale(1.08)" style="color:#5a0d07"><use href="#i-${icon}" width="24" height="24" stroke="#5a0d07" fill="none" stroke-width="2.2" transform="translate(.6 1)"/></g>
  <g transform="translate(-13 -13) scale(1.08)"><use href="#i-${icon}" width="24" height="24" stroke="#ffb3a0" fill="none" stroke-width="1.6" opacity=".75"/></g></svg>`;
}
const tickSVG = () => `<svg viewBox="-40 -40 80 80" aria-hidden="true"><path d="M2 -36C12 -37 20 -31 27 -27C35 -22 37 -13 36 -4C38 5 35 13 31 20C27 30 18 36 8 36C1 39 -8 37 -15 34C-25 31 -33 23 -35 13C-38 4 -36 -6 -33 -14C-29 -24 -21 -31 -12 -34C-6 -36 -2 -36 2 -36Z" fill="url(#j-crimson)" stroke="#3a0605" stroke-width="2"/><circle r="22" fill="none" stroke="#ffb3a0" stroke-width="2" opacity=".5"/><path d="M-13 1L-4 10L14 -10" fill="none" stroke="#ffe0d4" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const xSVG = () => `<svg viewBox="-20 -20 40 40"><path d="M-12 -12L12 12M12 -12L-12 12" stroke="#4a0905" stroke-width="9" stroke-linecap="round"/><path d="M-12 -12L12 12M12 -12L-12 12" stroke="#e2402a" stroke-width="5.5" stroke-linecap="round"/></svg>`;
function nicheSVG(kind) {
  const d = 'M1.5 41V16Q1.5 8 8 4.5Q13.5 2 15 0Q16.5 2 22 4.5Q28.5 8 28.5 16V41Z';
  const fill = kind === 'h' ? '#0f3826' : '#2a0b0e';
  return `<svg viewBox="0 0 30 42" aria-hidden="true"><path d="${d}" fill="${fill}"/><path d="${d}" fill="url(#p-halkari)" opacity=".5"/><path d="${d}" fill="none" stroke="url(#g-gold)" stroke-width="1.6"/></svg>`;
}
function traySVG(w, h) {
  const c = 18;
  const p = `M${c} 0H${w - c}A${c} ${c} 0 0 0 ${w} ${c}V${h - c}A${c} ${c} 0 0 0 ${w - c} ${h}H${c}A${c} ${c} 0 0 0 0 ${h - c}V${c}A${c} ${c} 0 0 0 ${c} 0Z`;
  const i = 7, pi = `M${c} ${i}H${w - c}A${c - i} ${c - i} 0 0 0 ${w - i} ${c}V${h - c}A${c - i} ${c - i} 0 0 0 ${w - c} ${h - i}H${c}A${c - i} ${c - i} 0 0 0 ${i} ${h - c}V${c}A${c - i} ${c - i} 0 0 0 ${c} ${i}Z`;
  return `<svg class="tray-bg" viewBox="-6 -6 ${w + 12} ${h + 12}" aria-hidden="true"><defs><radialGradient id="trayg" cx=".5" cy=".4" r=".8"><stop offset="0" stop-color="#1d4234"/><stop offset=".6" stop-color="#0e231b"/><stop offset="1" stop-color="#06100c"/></radialGradient></defs>
  <path d="${p}" fill="url(#trayg)" filter="url(#f-shadow)"/><path d="${p}" fill="url(#p-halkari)" opacity=".55"/><path d="${p}" fill="url(#p-zerefsan)" opacity=".35"/>
  <path d="${p}" fill="none" stroke="url(#g-gold)" stroke-width="4" filter="url(#f-bevel)"/><path d="${pi}" fill="none" stroke="url(#g-gold)" stroke-width="1.1" opacity=".75"/>
  <use href="#s-tugra" x="${w / 2 - 70}" y="${h / 2 - 40}" width="140" height="80" style="color:#c99a3a" opacity=".07"/></svg>`;
}
function vkSVG() {
  return `<svg class="vk-bg" viewBox="0 0 108 57" preserveAspectRatio="none" aria-hidden="true"><path d="M6 1H102Q107 1 107 6V51Q107 56 102 56H6Q1 56 1 51V6Q1 1 6 1Z" fill="url(#g-enamel-lapis)"/><path d="M6 1H102Q107 1 107 6V51Q107 56 102 56H6Q1 56 1 51V6Q1 1 6 1Z" fill="url(#p-halkari)" opacity=".6"/><path d="M6 1H102Q107 1 107 6V51Q107 56 102 56H6Q1 56 1 51V6Q1 1 6 1Z" fill="none" stroke="url(#g-gold)" stroke-width="2.4"/></svg>`;
}
function bannerSVG(red) {
  const w = 500, h = 96, body = cartPath(w - 40, h - 16);
  return `<svg viewBox="0 0 ${w} ${h}" aria-hidden="true"><defs><linearGradient id="roll" x1="0" x2="1"><stop offset="0" stop-color="#7c5616"/><stop offset=".35" stop-color="#fff0b4"/><stop offset=".6" stop-color="#c6963a"/><stop offset="1" stop-color="#5a3a10"/></linearGradient>
  <linearGradient id="redb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c8432c"/><stop offset="1" stop-color="#6e1610"/></linearGradient></defs>
  <g transform="translate(20 8)"><path d="${body}" fill="${red ? 'url(#redb)' : 'url(#g-ivory)'}" filter="url(#f-shadow)"/>${red ? '' : `<path d="${body}" fill="url(#p-zerefsan)" opacity=".5"/>`}<path d="${body}" fill="none" stroke="url(#g-gold)" stroke-width="3.5" filter="url(#f-bevel)"/></g>
  <rect x="2" y="4" width="20" height="88" rx="9" fill="url(#roll)"/><rect x="${w - 22}" y="4" width="20" height="88" rx="9" fill="url(#roll)"/></svg>`;
}
const tugra = (cls = '') => `<svg class="${cls}" viewBox="0 0 140 86" aria-hidden="true"><use href="#s-tugra" width="140" height="86"/></svg>`;

/* ---------------- state ---------------- */
let G, U;
const ORDER = ['kerem', 'defne', 'can', 'selin', 'bora', 'ayse', 'elif', 'mert']; // clockwise from Süleyman
function fresh() {
  const P = (id, name, ch, o) => Object.assign({ id, name, ch, sul: false, taraf: null, kul: null, inf: 0, hand: [], hirs: null, pw: { base: 'ready', favor: 'locked' }, kulUsed: false }, o);
  let u = 0; const C = k => ({ uid: 'c' + (++u), k });
  const pl = {
    kerem: P('kerem', 'Kerem', 'suleyman', { sul: true, pw: { base: 'ready', favor: null } }),
    defne: P('defne', 'Defne', 'hurrem', { taraf: 'S', kul: 'lokman', inf: 2, hand: [C('muhur'), C('gozde')], hirs: { id: 'takdir', done: false } }),
    can: P('can', 'Can', 'ibrahim', { taraf: 'H', kul: 'piri', inf: 1, hand: [C('valide'), C('divan-sirasi')], hirs: { id: 'divanda', done: false }, pw: { base: 'used', favor: 'locked' } }),
    selin: P('selin', 'Selin', 'mahidevran', { taraf: 'S', kul: 'sumbul', inf: 1, hand: [C('akil-d'), C('saray-dedikodusu')], hirs: { id: 'itirazci', done: false } }),
    bora: P('bora', 'Bora', 'bali', { taraf: 'S', kul: 'gulsah', inf: 2, hand: [C('saray-tabibi')], hirs: { id: 'supheli', done: false }, pw: { base: 'used', favor: 'locked' } }),
    ayse: P('ayse', 'Ayşe', 'hatice', { taraf: 'S', kul: 'afife', inf: 1, hand: [C('muhurlu-evrak'), C('akil-h')], hirs: { id: 'gozden', done: false } }),
    elif: P('elif', 'Elif', 'mihrimah', { taraf: 'H', kul: 'nigar', inf: 0, hand: [C('iftira')], hirs: { id: 'kulak', done: false } }),
    mert: P('mert', 'Mert', 'rustem', { taraf: 'H', kul: 'daye', inf: 2, hand: [C('iftira'), C('saray-tabibi')], hirs: { id: 'koltuk', done: false } }),
  };
  const iDeck = ['teftis', 'muhur', 'iftira', 'gozde', 'divan-sirasi', 'akil-d', 'valide', 'saray-dedikodusu', 'teftis', 'iftira'].map(C);
  return {
    step: 'lobi', crisisNo: 4, crisis: 'divan', crisisName: 'Divan Kavgası', field: 'D', order: ORDER.slice(), pl, me: G ? G.me : 'selin',
    min: { 1: null, 2: null }, draft: { 1: null, 2: null }, lastMin: ['selin', 'bora'], track: { h: 1, x: 1 },
    kDeck: ['h', 'x', 'x', 'x', 'h', 'h', 'x', 'h', 'x', 'h', 'x'], iDeck, placed: [], ready: {}, objTurn: null, objected: {},
    protect: {}, noLoss: {}, viaCard: {}, wasMin: {}, asks: [], fast: false, busy: false, played: null, lastDecree: null, teftis: [], kulis: false,
    tags: G ? G.tags : {}, dev: G ? G.dev : true, set: G ? G.set : { sound: true, music: false, vib: true },
    log: [
      { c: 1, h: 'Macar Seferi', f: 'D' }, { i: 'min1', t: 'Atama: <b>Defne</b> Birinci, <b>Bora</b> İkinci Vekil.' }, { i: 'court', t: 'Açılış: Mühür → Defne. İftira → Elif.' },
      { i: 'hizmet', cls: 'kh', t: 'Kader: <b>Hizmet</b>. Sadakat yolu 1.' }, { i: 'decree', t: 'Hüküm: <b>Bora</b> +1 Nüfuz.' },
      { c: 2, h: 'Haremde Skandal', f: 'H' }, { i: 'min1', t: '<b>Can</b> Sadrazam kullandı: <b>Can</b> Birinci, <b>Defne</b> İkinci Vekil.' }, { i: 'court', t: 'Açılış: Gözde’nin Hediyesi → Mert. Saray Tabibi → Can.' },
      { i: 'hiyanet', cls: 'kx', t: 'Kader: <b>Hıyanet</b>. İhanet yolu 1.' }, { i: 'decree', t: 'Hüküm: <b>Can</b> −1 Nüfuz; Saray Tabibi korudu.' },
      { c: 3, h: 'Kaybolan Mühür', f: 'H' }, { i: 'min1', t: 'Atama: <b>Selin</b> Birinci, <b>Can</b> İkinci Vekil.' }, { i: 'objection', t: '<b>Mert</b> İtiraz etti: Can yerine <b>Bora</b>.' },
      { i: 'hiyanet', cls: 'kx', t: 'Kader: <b>Hıyanet</b>; <b>Bora</b> Muhafız kullandı, kart ıskartaya.' }, { i: 'decree', t: 'Hüküm: <b>Selin</b> −1 Nüfuz.' },
    ],
  };
}
const P = id => G.pl[id];
const others = id => G.order.filter(x => x !== id);
const isMin = id => G.min[1] === id || G.min[2] === id;
const seatOf = id => G.min[1] === id ? 1 : G.min[2] === id ? 2 : 0;
const sul = () => G.order.find(id => P(id).sul);
function log(i, t, cls) { if (!G.log.some(l => l.c === G.crisisNo)) G.log.push({ c: G.crisisNo, h: G.crisisName, f: G.field }); G.log.push({ i, t, cls }); if (!sheetOpen) $('#hud .boss.log')?.insertAdjacentHTML('beforeend', '<i class="dot"></i>'); }
function eligible(exclude = []) { return G.order.filter(id => !P(id).sul && !isMin(id) && !exclude.includes(id)); }
function drawIntr(id) { const c = G.iDeck.shift(); if (c) P(id).hand.push(c); return c; }

/* ---------------- geometry (board space: 734 × 372) ---------------- */
const B = { w: 734, h: 372, cx: 367, cy: 212, rx: 330, ry: 178 };
let K = 1;
function arc() { const i = G.order.indexOf(G.me); return G.order.slice(i + 1).concat(G.order.slice(0, i)); }
function seatXY(i, n) {
  const span = n === 1 ? 0 : Math.min(146, 24.33 * (n - 1)); const a = (270 - span / 2 + (n === 1 ? 0 : span * i / (n - 1))) * Math.PI / 180;
  return { x: B.cx + B.rx * Math.cos(a), y: B.cy + B.ry * Math.sin(a) };
}
function posOf(id) {
  if (id === G.me) return { x: 44, y: 320 };
  const a = arc(); return seatXY(a.indexOf(id), a.length);
}
function frontOf(id, k = 0, n = 1) {
  // in front of a seat = beside it on the table side, clear of the tray; extra cards fan outward
  if (id === G.me) return { x: 100 + k * 16, y: 250 - k * 4 };
  const p = posOf(id), s = P(id).sul ? 4 : 0;
  if (p.y < 90) return { x: p.x + (k - (n - 1) / 2) * 17, y: p.y + 62 + s, r: (k - (n - 1) / 2) * 8 };
  const side = p.x <= B.cx + 1 ? 1 : -1;
  return { x: p.x + side * (47 + s + k * 13), y: p.y - 25 + k * 3, r: side * (k - (n - 1) / 2) * 9 };
}
function boardXY(el) {
  const r = el.getBoundingClientRect(), b = $('#board').getBoundingClientRect(), s = b.width / B.w;
  return { x: (r.left + r.width / 2 - b.left) / s, y: (r.top + r.height / 2 - b.top) / s, w: r.width / s };
}
function clientToBoard(cx, cy) { const b = $('#board').getBoundingClientRect(), s = b.width / B.w; return { x: (cx - b.left) / s, y: (cy - b.top) / s }; }
function layout() {
  const game = $('#game'); const full = document.documentElement.classList.contains('full');
  let probe = $('#probe');
  if (!probe) { probe = document.createElement('div'); probe.id = 'probe'; probe.style.cssText = 'position:absolute;left:var(--sl);right:var(--sr);top:var(--st);bottom:var(--sb);pointer-events:none;visibility:hidden'; game.appendChild(probe); }
  const W = game.clientWidth, H = game.clientHeight;
  const sl = probe.offsetLeft, st = probe.offsetTop, sw = probe.offsetWidth, sh = probe.offsetHeight;
  K = Math.min(sw / B.w, sh / B.h);
  const L = sl + (sw - B.w * K) / 2, Tp = st + (sh - B.h * K) / 2;
  [$('#board'), $('#moment')].forEach(b => { b.style.transform = `translate(${L}px,${Tp}px) scale(${K})`; });
  if (!full) {
    const ph = $('#phone'), pw = ph.offsetWidth, avail = document.documentElement.clientWidth - 32;
    const s = Math.min(1, avail / pw); ph.style.transform = s < 1 ? `scale(${s})` : ''; ph.style.marginBottom = s < 1 ? `${-(1 - s) * ph.offsetHeight}px` : '';
  }
  $('#rotate').hidden = !(full && H > W);
  drawCarpet(W, H, L, Tp);
}
function drawCarpet(W, H, L, Tp) {
  const svg = $('#carpet');
  svg.innerHTML = `<defs><radialGradient id="cg" cx=".5" cy=".55" r=".6"><stop offset="0" stop-color="#7a1b22"/><stop offset=".7" stop-color="#4a0f15"/><stop offset="1" stop-color="#2a070b"/></radialGradient></defs>
  <ellipse cx="${B.cx}" cy="${B.cy + 14}" rx="${B.rx + 26}" ry="${B.ry + 30}" fill="url(#cg)"/>
  <ellipse cx="${B.cx}" cy="${B.cy + 14}" rx="${B.rx + 26}" ry="${B.ry + 30}" fill="url(#p-ogival)" opacity=".18"/>
  <ellipse cx="${B.cx}" cy="${B.cy + 14}" rx="${B.rx + 20}" ry="${B.ry + 24}" fill="none" stroke="url(#p-rumi)" stroke-width="11" opacity=".9"/>
  <ellipse cx="${B.cx}" cy="${B.cy + 14}" rx="${B.rx + 26}" ry="${B.ry + 30}" fill="none" stroke="url(#g-gold)" stroke-width="2.5"/>
  <ellipse cx="${B.cx}" cy="${B.cy + 14}" rx="${B.rx + 13}" ry="${B.ry + 17}" fill="none" stroke="url(#g-gold)" stroke-width="1.2" opacity=".8"/>
  <ellipse cx="${B.cx}" cy="${B.cy + 14}" rx="${B.rx - 48}" ry="${B.ry - 48}" fill="none" stroke="#c99a3a" stroke-width=".8" stroke-dasharray="1 5" opacity=".5"/>`;
}

/* ---------------- sound, vibration ---------------- */
let AC = null, musicNode = null;
function audio() { if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { AC = null; } } return AC; }
function sfx(kind) {
  if (G.fast || !G.set.sound) return; const ac = AC; if (!ac) return; if (ac.state === 'suspended') ac.resume();
  const t = ac.currentTime, g = ac.createGain(); g.connect(ac.destination);
  const tone = (f, d, type = 'sine', v = .2, at = 0) => { const o = ac.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t + at); const gg = ac.createGain(); gg.gain.setValueAtTime(v, t + at); gg.gain.exponentialRampToValueAtTime(.001, t + at + d); o.connect(gg); gg.connect(g); o.start(t + at); o.stop(t + at + d + .02); return o; };
  const noise = (d, v = .25, f = 900) => { const b = ac.createBuffer(1, ac.sampleRate * d, ac.sampleRate); const c = b.getChannelData(0); for (let i = 0; i < c.length; i++) c[i] = (Math.random() * 2 - 1) * (1 - i / c.length) ** 2; const s = ac.createBufferSource(); s.buffer = b; const fl = ac.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = f; const gg = ac.createGain(); gg.gain.value = v; s.connect(fl); fl.connect(gg); gg.connect(g); s.start(t); };
  if (kind === 'thud') { const o = tone(120, .35, 'sine', .5); o.frequency.exponentialRampToValueAtTime(48, t + .3); noise(.12, .3, 500); }
  else if (kind === 'seal') { noise(.08, .35, 1400); tone(180, .18, 'triangle', .25); }
  else if (kind === 'flip') noise(.09, .18, 3000);
  else if (kind === 'chime') { tone(659, .9, 'sine', .12); tone(988, .8, 'sine', .08, .08); tone(1319, .7, 'sine', .05, .16); }
  else if (kind === 'coin') { tone(1568, .25, 'triangle', .09); tone(2093, .3, 'triangle', .07, .06); }
  else if (kind === 'paper') noise(.22, .14, 2200);
  else if (kind === 'gong') { tone(98, 2.2, 'sine', .35); tone(196, 1.6, 'sine', .12); tone(293, 1.2, 'sine', .06); }
}
function music(on) {
  const ac = audio(); if (!ac) return;
  if (on && !musicNode) {
    const g = ac.createGain(); g.gain.value = .0; g.gain.linearRampToValueAtTime(.05, ac.currentTime + 2); g.connect(ac.destination);
    const os = [110, 164.8, 220.5].map((f, i) => { const o = ac.createOscillator(); o.type = i ? 'sine' : 'triangle'; o.frequency.value = f; const l = ac.createOscillator(); l.frequency.value = .07 + i * .03; const lg = ac.createGain(); lg.gain.value = 1.4; l.connect(lg); lg.connect(o.frequency); o.connect(g); o.start(); l.start(); return [o, l]; });
    musicNode = { g, os };
  } else if (!on && musicNode) { const m = musicNode; musicNode = null; m.g.gain.linearRampToValueAtTime(0, ac.currentTime + .6); setTimeout(() => m.os.forEach(([o, l]) => { o.stop(); l.stop(); }), 700); }
}
function buzz(p) { if (!G.fast && G.set.vib && navigator.vibrate) try { navigator.vibrate(p); } catch (e) { } }

/* ---------------- motion helpers ---------------- */
const wait = ms => G.fast ? Promise.resolve() : new Promise(r => setTimeout(r, ms));
function anim(el, kf, o) { if (G.fast || !el) return Promise.resolve(); const a = el.animate(kf, Object.assign({ fill: 'forwards', easing: 'cubic-bezier(.2,.8,.25,1)' }, o)); return a.finished.catch(() => { }); }
function fxEl(html, x, y, w, layer = '#fx') {
  const d = document.createElement('div'); d.className = 'flyer'; d.style.cssText = `position:absolute;left:${x - w / 2}px;top:${y - w * .7}px;width:${w}px;z-index:30;pointer-events:none;perspective:700px`;
  d.innerHTML = html; $(layer).appendChild(d); return d;
}
// a card that flies from a to b in board space; optional flip midway (back → face or face → back)
async function flyCard(front, back, a, b, o = {}) {
  if (G.fast) return;
  const w = o.w || 30, s0 = (o.w0 || w) / w, s1 = (o.w1 || w) / w;
  const el = fxEl(`<div class="flip" style="position:relative;transform-style:preserve-3d;transition:none;${o.startFace ? '' : (back ? 'transform:rotateY(180deg)' : '')}">
    <div style="backface-visibility:hidden;-webkit-backface-visibility:hidden">${o.startFace ? front : (back || front)}</div>
    ${back ? `<div style="position:absolute;inset:0;transform:rotateY(180deg);backface-visibility:hidden;-webkit-backface-visibility:hidden">${o.startFace ? back : front}</div>` : ''}</div>`, a.x, a.y, w, o.layer);
  const fl = el.firstElementChild;
  const dx = b.x - a.x, dy = b.y - a.y, arcH = o.arc ?? -Math.min(60, Math.hypot(dx, dy) * .25);
  const r0 = o.r0 || 0, r1 = o.r1 || 0, dur = o.dur || 520;
  const kf = [
    { transform: `translate(0,0) scale(${s0}) rotate(${r0}deg)` },
    { transform: `translate(${dx * .5}px,${dy * .5 + arcH}px) scale(${(s0 + s1) / 2 * (o.pop || 1.08)}) rotate(${(r0 + r1) / 2}deg)`, offset: .5 },
    { transform: `translate(${dx}px,${dy}px) scale(${s1}) rotate(${r1}deg)` }];
  const p = anim(el, kf, { duration: dur, easing: 'cubic-bezier(.3,.7,.3,1)' });
  if (back) anim(fl, [{ transform: o.startFace ? 'rotateY(0deg)' : 'rotateY(180deg)' }, { transform: o.startFace ? 'rotateY(180deg)' : 'rotateY(0deg)' }], { duration: dur * .7, delay: dur * .15, easing: 'ease-in-out' });
  await p; if (!o.keep) el.remove(); return el;
}
function dust(x, y, color = '#ffe6a0', n = 16, layer = '#fx') {
  if (G.fast) return;
  for (let i = 0; i < n; i++) {
    const d = document.createElement('i'); const s = 3 + Math.random() * 4;
    d.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${s}px;height:${s}px;border-radius:50%;background:${color};box-shadow:0 0 6px ${color};z-index:40;pointer-events:none`;
    $(layer).appendChild(d); const a = Math.random() * Math.PI * 2, r = 24 + Math.random() * 46;
    d.animate([{ transform: 'translate(-50%,-50%) scale(1)', opacity: 1 }, { transform: `translate(calc(-50% + ${Math.cos(a) * r}px),calc(-50% + ${Math.sin(a) * r}px)) scale(.2)`, opacity: 0 }], { duration: 600 + Math.random() * 400, easing: 'cubic-bezier(.1,.7,.3,1)' }).finished.then(() => d.remove());
  }
}
async function stampAt(x, y, html, size = 34) {
  if (G.fast) return;
  const el = fxEl(html, x, y + size * .2, size); el.style.height = size + 'px'; el.style.top = (y - size / 2) + 'px';
  await anim(el, [{ transform: 'scale(2.4) rotate(-18deg)', opacity: 0 }, { transform: 'scale(.92) rotate(-6deg)', opacity: 1, offset: .7 }, { transform: 'scale(1) rotate(-8deg)', opacity: 1 }], { duration: 360, easing: 'cubic-bezier(.3,1.4,.5,1)' });
  sfx('seal'); buzz(15); await wait(380); await anim(el, [{ opacity: 1 }, { opacity: 0 }], { duration: 260 }); el.remove();
}
async function coinFly(fromId, toId, label) {
  if (G.fast) return;
  const a = fromId ? posOf(fromId) : { x: B.cx, y: 150 }, b = toId ? posOf(toId) : { x: B.cx, y: 120 };
  const el = fxEl(`<div class="coin" style="width:26px;height:26px;font-size:14px">${label}</div>`, a.x, a.y, 26);
  el.style.top = (a.y - 13) + 'px'; sfx('coin');
  await anim(el, [{ transform: 'translate(0,0) scale(.6)', opacity: 0 }, { transform: `translate(${(b.x - a.x) / 2}px,${(b.y - a.y) / 2 - 40}px) scale(1.5)`, opacity: 1, offset: .45 }, { transform: `translate(${b.x - a.x}px,${b.y - a.y}px) scale(1)`, opacity: toId ? 1 : 0 }], { duration: 760 });
  if (toId) dust(b.x, b.y, '#ffe6a0', 10); el.remove();
}
async function banner(title, sub, o = {}) {
  if (G.fast) return;
  const m = $('#fx'); const el = document.createElement('div'); el.className = 'banner' + (o.red ? ' red' : '');
  el.innerHTML = `${bannerSVG(o.red)}<b>${esc(title)}</b>${sub ? `<i>${esc(sub)}</i>` : ''}`; m.appendChild(el);
  sfx(o.red ? 'chime' : 'paper'); if (o.red) buzz([30, 60, 30]);
  await anim(el, [{ transform: 'scaleX(.04) scaleY(.7)', opacity: 0 }, { transform: 'scaleX(1.02) scaleY(1)', opacity: 1, offset: .75 }, { transform: 'scaleX(1) scaleY(1)', opacity: 1 }], { duration: 420 });
  await wait(o.hold || 900);
  // fold into the step cartouche
  const c = $('#hud .stepc'); const t = c ? boardXY(c) : { x: 100, y: 22 };
  await anim(el, [{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: `translate(${t.x - 367}px,${t.y - 176}px) scale(.3)`, opacity: 0 }], { duration: 420, easing: 'cubic-bezier(.5,0,.75,0)' });
  el.remove();
}
function scrim(on, cls = '') {
  const s = $('#scrim');
  if (on) { s.hidden = false; s.className = 'scrim ' + cls; requestAnimationFrame(() => s.classList.add('on')); }
  else { s.classList.remove('on'); setTimeout(() => { if (!s.classList.contains('on')) s.hidden = true; }, 360); }
}
function moment(html) { const m = $('#moment'); m.innerHTML = html || ''; m.hidden = !html; return m; }

/* ---------------- asks: every decision goes through here; bots answer for seats nobody is viewing ---------------- */
let askSeq = 0;
function ask(who, kind, data = {}) {
  return new Promise(res => {
    const a = { id: ++askSeq, who, kind, data, res, timer: null };
    G.asks.push(a); schedule(a); render();
    if (who === G.me && !G.fast) onMyAsk(a);
  });
}
function answer(a, v) { if (!G.asks.includes(a)) return; clearTimeout(a.timer); G.asks = G.asks.filter(x => x !== a); a.res(v); }
function schedule(a) {
  clearTimeout(a.timer); a.timer = null;
  if (a.who === G.me && !G.fast) return;
  if (G.fast) { answer(a, bot(a)); return; }
  const d = { place: 900 + Math.random() * 2600, object: 900, power: 1100, kader1: 1600, kader2: 1500 }[a.kind] || 1000;
  a.timer = setTimeout(() => answer(a, bot(a)), d);
}
const myAsk = kind => G.asks.find(a => a.who === G.me && (!kind || a.kind === kind));
function bot(a) {
  const { who, kind, data } = a; const p = P(who);
  switch (kind) {
    case 'power': return { kulis: false, gozbebegi: true, fisilti: false, himaye: false }[data.p] || false;
    case 'object': return who === 'selin' && p.pw.base === 'ready' && G.min[2] ? { seat: 2, free: true } : null;
    case 'pick': { const pref = ['ayse', 'defne', 'selin', 'bora', 'mert', 'elif', 'can'];
      if (data.why === 'valide' && data.options.includes(who)) return who;
      return pref.find(x => data.options.includes(x)) || data.options[0]; }
    case 'place': return botPlace(who);
    case 'kader1': { const c = data.cards; const loyal = p.taraf === 'S';
      let i = loyal ? c.indexOf('x') : c.indexOf('h'); if (i < 0) i = 0; return i; }
    case 'kader2': { const c = data.cards; const loyal = p.taraf === 'S';
      const keep = loyal ? (c.includes('h') ? c.indexOf('h') : 0) : (c.includes('x') ? c.indexOf('x') : 0); return 1 - keep; }
    case 'ferman': return null;
    case 'decree': return data.type === 'x' ? G.min[2] : G.min[1];
    case 'peek': return true;
    case 'kulisEnd': return true;
    default: return null;
  }
}
function botPlace(who) {
  const p = P(who); const pick = (k, tgt, as) => { const c = p.hand.find(c => c.k === k); return c && tgt ? { uid: c.uid, as: as || null, target: tgt } : null; };
  switch (who) {
    case 'defne': return pick('muhur', G.min[1]);
    case 'can': return pick('valide', G.min[1]);
    case 'selin': return pick('teftis', G.min[1]);
    case 'mert': return P('mert').inf > 0 ? pick('iftira', G.min[2], 'valide') : null;
    default: return null;
  }
}
// switching seats: whatever the new viewer owes becomes UI, the old viewer's asks go to bots
function setViewer(id) {
  if (G.me === id) return;
  G.me = id; U = freshU(); closeSheet(); closeInspect();
  moment(''); scrim(false); $('#fx').innerHTML = '';
  G.asks.forEach(a => schedule(a));
  render(); const a = myAsk(); if (a) onMyAsk(a, true);
}

/* ---------------- legality ---------------- */
function kulOf(id) { const p = P(id); return p.kul ? KUL[p.kul] : null; }
function kulLive(id) { const p = P(id); const k = kulOf(id); return !!(k && k.as && p.inf >= 1 && !p.kulUsed); }
function fieldOpen(f) { return G.field === 'S' || G.field === f; }
function identity(c, recast, owner) { return recast ? kulOf(owner).as : c.k; }
function playOptions(owner, c) { // what this card can be placed as right now
  const opts = [];
  if (fieldOpen(INTR[c.k].f)) opts.push(null);
  if (kulLive(owner) && fieldOpen(INTR[kulOf(owner).as].f) && kulOf(owner).as !== c.k) opts.push('kul');
  return opts;
}
function targetsFor(owner, k) {
  const tg = INTR[k].tg; const all = G.order.slice();
  if (tg === 'min') return [G.min[1], G.min[2]].filter(Boolean);
  if (tg === 'self') return [owner];
  if (tg === 'other') return all.filter(x => x !== owner);
  return all;
}

/* ---------------- rendering ---------------- */
function freshU() { return { sel: null, recast: false, draft: null, tablet: null, vk: null, free: false, toss: null, dragging: null }; }
function render() {
  if (!G) return;
  const lobby = G.step === 'lobi';
  $('#board').style.visibility = lobby ? 'hidden' : '';
  $('#game').classList.toggle('is-night', G.step === 'tertip');
  if (lobby) { renderLobby(); return; }
  renderTray(); renderSeats(); renderPlaced(); renderMe(); renderHand(); renderAct(); renderHud(); renderPrompt();
}
function renderSeats() {
  const box = $('#seats'); const a = arc(); const n = a.length;
  const targeting = targetMode();
  $('#board').classList.toggle('targeting', !!targeting);
  box.innerHTML = a.map((id, i) => {
    const p = P(id), xy = seatXY(i, n), s = seatOf(id), dr = G.draft[1] === id ? 1 : G.draft[2] === id ? 2 : 0;
    const acting = actingIds().includes(id);
    const legal = targeting && targeting.includes(id);
    const tag = (G.tags[G.me] || {})[id];
    const cls = ['seat', p.sul ? 'sul' : '', acting ? 'acting' : '', legal ? 'legal' : ''].join(' ');
    return `<div class="${cls}" data-id="${id}" style="left:${xy.x}px;top:${xy.y}px">
      <i class="ring"></i>${p.sul ? `<div class="crest">${tugra()}</div>` : ''}${medal(id, p.sul)}
      <div class="nm"><span class="cart">${esc(p.name)}</span></div>
      ${p.sul ? '' : `<div class="coin${p.inf ? '' : ' zero'}" title="Nüfuz">${p.inf}</div>`}
      ${p.kul ? `<div class="kp${p.inf ? '' : ' down'}" title="${esc(KUL[p.kul].n)}"><img src="img/roster-comp.${p.kul}.jpg" alt=""></div>` : ''}
      ${s ? `<div class="vkb"><div class="vtab">${s === 1 ? 'I' : 'II'}</div></div>` : dr ? `<div class="vkb"><div class="vtab ghost">${dr === 1 ? 'I' : 'II'}</div></div>` : ''}
      ${G.ready[id] && (G.step === 'tertip') ? `<div class="tick">${tickSVG()}</div>` : ''}
      ${tag ? `<div class="tagp t-${tag}">${ico(tag === 'sus' ? 'traitor' : 'loyalist')}</div>` : ''}
      ${G.objTurn === id ? `<div class="objtok">${ico('objection')}</div>` : ''}
      <i class="hit"></i></div>`;
  }).join('');
}
function actingIds() {
  // seats the table is waiting on; placement stays anonymous, so during Tertip this is everyone not yet ready
  if (G.step === 'tertip') return G.order.filter(id => !P(id).sul && !G.ready[id]);
  if (G.objTurn) return [G.objTurn];
  if (G.step === 'atama' && !G.asks.length) return [sul()];
  const a = G.asks.filter(a => a.kind !== 'place' && a.kind !== 'power').map(a => a.who);
  return a;
}
function renderTray() {
  const t = $('#tray');
  const crisis = G.step === 'k0' ? card('back.crisis', 80) : card('crisis.' + G.crisis, 80);
  const niche = (kind, i) => {
    const filled = i < G.track[kind]; const pw = kind === 'x' ? TRACK_PW[i + 1] : null; const win = kind === 'h' && i === 3;
    return `<div class="niche${pw && i + 1 === 5 ? ' death' : ''}${win ? ' win' : ''}" data-n="${kind}${i}" title="${pw ? esc(pw[0]) : win ? 'Sadıklar kazanır' : ''}">${nicheSVG(kind)}
      ${filled ? card('kader.' + kind, 26) : pw ? `<span class="pw">${ico(pw[1])}</span>` : win ? `<span class="pw">${ico('loyalist')}</span>` : ''}</div>`;
  };
  const vk = n => {
    const id = G.min[n] || G.draft[n]; const ghost = !G.min[n] && G.draft[n];
    const pick = (myAsk('object') && G.min[n]) || (myAsk('pick') && myAsk('pick').data.why === 'fermanSeat');
    return `<div class="vk${id ? '' : ' empty'}${pick ? ' pick' : ''}${U.vk === n ? ' picked' : ''}" data-vk="${n}" style="${ghost ? 'opacity:.6' : ''}">${vkSVG()}
      <div class="vm">${id ? medal(id) : `<div class="med">${bezel()}</div>`}</div>
      <div class="vt"><i>${ico(n === 1 ? 'min1' : 'min2')}${n === 1 ? 'Birinci' : 'İkinci'}</i><b>${id ? esc(P(id).name) : '—'}</b></div>
      ${G.protect[G.min[n]] ? `<div class="sealed">${tickSVG()}</div>` : ''}</div>`;
  };
  t.innerHTML = `${traySVG(438, 150)}
    <div class="slot-crisis" data-insp="crisis">${crisis}</div><div class="tag-crisis">${G.step === 'k0' ? 'Kriz ' + G.crisisNo : esc(G.crisisName)}</div>
    <div class="tracks">
      <div class="trow h"><span class="rl" title="Sadakat yolu">${ico('hizmet')}</span>${[0, 1, 2, 3].map(i => niche('h', i)).join('')}
        <div class="deck" style="position:relative;margin-left:9px" title="Kader destesi">${card('back.kader', 28)}<b>${G.kDeck.length}</b></div></div>
      <div class="trow x"><span class="rl" title="İhanet yolu">${ico('hiyanet')}</span>${[0, 1, 2, 3, 4].map(i => niche('x', i)).join('')}</div>
    </div>
    <div class="vekils">${vk(1)}${vk(2)}</div>`;
}
function renderPlaced() {
  const box = $('#placed');
  let list = [];
  if (G.step === 'tertip') {
    list = G.placed.filter(c => c.owner === G.me);
    if (U.draft) { const c = P(G.me).hand.find(c => c.uid === U.draft.uid); if (c) list = list.concat([{ uid: c.uid, k: c.k, as: U.draft.as ? kulOf(G.me).as : null, owner: G.me, target: U.draft.target, down: true, draft: true }]); }
  } else if (['acilis', 'acilis-done', 'kader', 'sonuc', 'sonuc-done', 'hukum', 'son'].includes(G.step)) list = G.placed;
  const byT = {}; list.forEach(c => (byT[c.target] = byT[c.target] || []).push(c));
  const seen = new Set();
  list.forEach(c => {
    seen.add(c.uid);
    const grp = byT[c.target], k = grp.indexOf(c), xy = frontOf(c.target, k, grp.length), face = c.as || c.k;
    let el = box.querySelector(`[data-pc="${c.uid}"]`);
    if (!el || el.dataset.face !== face) {
      if (el) el.parentNode.removeChild(el);
      el = document.createElement('div'); el.dataset.pc = c.uid; el.dataset.face = face;
      el.innerHTML = `<div class="flip"><div class="bk">${card('back.intr', 30)}</div><div class="fr">${card('intr.' + face, 30)}</div></div><span class="x">${xSVG()}</span>`;
      box.appendChild(el);
    }
    el.className = 'pc' + (c.down ? '' : ' up') + (c.owner === G.me ? ' mine' : '') + (c.state === 'done' ? ' done' : '') + (c.state === 'void' ? ' void' : '') + (c.focus ? ' focus' : '');
    el.style.left = xy.x + 'px'; el.style.top = xy.y + 'px'; el.style.rotate = c.focus ? '0deg' : (xy.r || 0) + 'deg';
    const badge = (cls, on, html) => { const b = el.querySelector('.' + cls); if (on && !b) el.insertAdjacentHTML('beforeend', `<span class="${cls}">${html}</span>`); if (!on && b) b.parentNode.removeChild(b); };
    badge('rc', !c.down && !!c.as, 'Kul'); badge('eye', !!c.eye, ico('secret'));
  });
  Array.from(box.children).forEach(el => { if (!seen.has(el.dataset.pc)) box.removeChild(el); });
}
function renderMe() {
  const me = $('#me'); const p = P(G.me);
  const tm = targetMode(); const legal = tm && tm.includes(G.me);
  const pip = (cls, icon, label, title) => `<button class="pip ${cls}" data-pip="${label}" title="${esc(title)}" aria-label="${esc(title)}"><i>${ico(icon)}</i></button>`;
  const ch = CH[p.ch]; let pips = '';
  if (p.sul) {
    const fa = myAsk('ferman');
    pips = pip(`base ${p.pw.base === 'used' ? 'used' : ''} ${fa ? 'live' : ''}`, 'decree', 'base', `${ch.base[0]} · Oyunda bir · ${p.pw.base === 'used' ? 'kullanıldı' : 'hazır'}`);
  } else {
    const live = myAsk('object') && p.ch === 'mahidevran' && p.pw.base === 'ready';
    pips = pip(`base ${p.pw.base === 'used' ? 'used' : ''} ${live ? 'live' : ''} ${U.free ? 'on' : ''}`, ch.base[1], 'base', `${ch.base[0]} · Oyunda bir · ${p.pw.base === 'used' ? 'kullanıldı' : 'hazır'}`)
      + pip(`favor ${p.pw.favor === 'locked' ? 'locked' : p.pw.favor === 'used' ? 'used' : ''}`, p.pw.favor === 'locked' ? 'ambition' : ch.favor[1], 'favor', `${ch.favor[0]} · ${p.pw.favor === 'locked' ? 'Hırs ile açılır' : p.pw.favor === 'used' ? 'kullanıldı' : 'hazır'}`);
    if (p.kul && KUL[p.kul].as) pips += pip(`kulp ${p.kulUsed ? 'used' : ''} ${p.inf ? '' : 'locked'}`, 'percrisis', 'kul', `${KUL[p.kul].n} · Krizde bir · ${p.inf ? (p.kulUsed ? 'bu kriz kullanıldı' : 'hazır') : 'Nüfuz 0: kapalı'}`);
  }
  me.innerHTML = `<div class="me-med${legal ? ' legal' : ''}" data-me="1"><i class="ring"></i>${medal(G.me, p.sul)}${p.sul ? '' : `<div class="coin${p.inf ? '' : ' zero'}">${p.inf}</div>`}
    <span class="hold">${ico('secret')}${T.hold}</span>${G.ready[G.me] && G.step === 'tertip' ? `<div class="tick" style="position:absolute;right:-6px;top:-4px;width:26px;height:26px">${tickSVG()}</div>` : ''}</div>
    <div class="pips">${pips}</div>
    ${p.kul ? `<div class="mekul${p.inf ? '' : ' down'}" data-insp="kul">${card('kul.' + p.kul, 34)}</div>` : ''}`;
}
function renderHand() {
  const h = $('#hand'); const p = P(G.me);
  $$('.namerib,.recast', h).forEach(e => e.parentNode.removeChild(e));
  if (p.sul) { h.innerHTML = renderTools(); return; }
  $$('.tools', h).forEach(e => e.parentNode.removeChild(e));
  const place = myAsk('place'); const cards = p.hand.filter(c => !(U.draft && U.draft.uid === c.uid));
  const n = cards.length, seen = new Set();
  cards.forEach((c, i) => {
    seen.add(c.uid);
    const mid = (n - 1) / 2, rot = (i - mid) * 7, x = (i - mid) * 64, y = Math.abs(i - mid) * 5;
    const opts = place ? playOptions(G.me, c) : [null];
    const off = place && !opts.length; const kulOnly = place && opts.length === 1 && opts[0] === 'kul';
    const sel = U.sel === c.uid;
    let el = h.querySelector(`.hc[data-uid="${c.uid}"]`);
    if (!el) { el = document.createElement('div'); el.className = 'hc'; el.dataset.uid = c.uid; el.innerHTML = card('intr.' + c.k, 84) + `<span class="lock">${ico('close')}</span>`; el.style.transform = `translate(${x}px,${y + 90}px) rotate(${rot}deg)`; h.appendChild(el); void el.offsetWidth; }
    el.className = 'hc' + (sel ? ' sel' : '') + (off ? ' off' : '') + (place && !off && !U.sel && !U.draft ? ' can' : '') + (U.dragging === c.uid ? ' gone' : '');
    el.style.transform = sel ? `translate(${x}px,${y - 36}px) rotate(0deg) scale(1.22)` : `translate(${x}px,${y}px) rotate(${rot}deg)`;
    el.style.zIndex = sel ? 20 : i + 1;
    const kb = el.querySelector('.kulb'); if (kulOnly && !kb) el.insertAdjacentHTML('beforeend', `<span class="kulb"><img src="img/roster-comp.${p.kul}.jpg" alt=""></span>`); if (!kulOnly && kb) kb.parentNode.removeChild(kb);
  });
  $$('.hc', h).forEach(el => { if (!seen.has(el.dataset.uid)) h.removeChild(el); });
  if (U.sel && !U.dragging) {
    const c = p.hand.find(c => c.uid === U.sel); const i = cards.indexOf(c);
    if (c && i >= 0) {
      const x = (i - (n - 1) / 2) * 64; const idn = identity(c, U.recast, G.me);
      const opts = playOptions(G.me, c);
      h.insertAdjacentHTML('beforeend', `<div class="namerib" style="margin-left:${x}px;top:-46px"><span class="cart">${esc(INTR[idn].n)}</span></div>`);
      if (place && opts.includes('kul')) {
        const k = KUL[p.kul];
        h.insertAdjacentHTML('beforeend', `<button class="recast${U.recast ? ' on' : ''}" data-recast="1" style="left:${167 + x + 58}px;top:-10px;width:150px">
          <svg viewBox="0 0 150 44" preserveAspectRatio="none"><path class="rf" d="${cartPath(150, 44)}" fill="#14285e"/><path d="${cartPath(150, 44)}" fill="none" stroke="url(#g-gold)" stroke-width="2"/></svg>
          <img src="img/roster-comp.${p.kul}.jpg" alt=""><span><i>${esc(k.n)}</i><b>${esc(INTR[k.as].n)}</b></span></button>`);
      }
    }
  }
}
function renderTools() {
  if (G.step !== 'atama' && !myAsk('pick')) return '';
  if (G.step !== 'atama') return '';
  const t = n => `<button class="tablet${G.draft[n] ? ' used' : ''}${U.tablet === n ? ' sel' : ''}" data-tablet="${n}" aria-label="${n === 1 ? T.min1 : T.min2}">
    <svg viewBox="0 0 54 66"><path d="M27 1L53 12V65H1V12Z" fill="url(#g-enamel-lapis)"/><path d="M27 1L53 12V65H1V12Z" fill="url(#p-halkari)" opacity=".6"/><path d="M27 1L53 12V65H1V12Z" fill="none" stroke="url(#g-gold)" stroke-width="3" filter="url(#f-bevel)"/></svg>
    <b>${n === 1 ? 'I' : 'II'}</b><i>${n === 1 ? T.min1 : T.min2}</i></button>`;
  return `<div class="tools">${t(1)}${t(2)}</div>`;
}
function stepButton() {
  // Süleyman's one step button: [label, enabled, sub]
  const nReady = G.order.filter(id => !P(id).sul && G.ready[id]).length, nAll = G.order.length - 1;
  switch (G.step) {
    case 'k0': return [T.newCrisis, true];
    case 'atama': return G.kulis ? [T.kulisEnd, true] : [T.announce, !!(G.draft[1] && G.draft[2]) && !G.asks.length || (G.me !== sul() && !G.asks.length)];
    case 'itiraz': return [T.sleep, false];
    case 'itiraz-done': return [T.sleep, !G.asks.length];
    case 'tertip': return [T.wake, nReady === nAll, T.ready(`${nReady}/${nAll}`)];
    case 'acilis': return [T.kader, false];
    case 'acilis-done': return [T.kader, !G.asks.length];
    case 'kader': case 'sonuc': return [T.decree, false];
    case 'sonuc-done': return [T.decree, !G.asks.length];
    case 'hukum': return [T.newCrisis, false];
    case 'son': return [T.newCrisis, true];
    default: return null;
  }
}
function renderAct() {
  const box = $('#act'); const p = P(G.me); let h = '';
  const place = myAsk('place'), obj = myAsk('object');
  if (place) {
    h = `<button class="seal ${U.draft ? 'ready' : 'off'}" data-act="seal"><span class="rib">${T.seal}</span><span class="wax">${waxSVG('seal')}</span></button>
      <button class="slipb" data-act="pass">${T.pass}</button>`;
  } else if (obj) {
    const free = U.free; const can = U.vk && (free || p.inf >= 1);
    h = `<button class="seal ${can ? 'ready' : 'off'}" data-act="object"><span class="rib">${T.object}</span><span class="wax">${waxSVG('objection')}${free ? '' : '<span class="cost coin">−1</span>'}</span></button>
      <button class="slipb" data-act="skipobj">${T.skip}</button>`;
  } else if (G.step === 'son' && G.protoEnd) {
    h = `<button class="plaque ready" data-act="toEnd">${plaqueSVG(196, 56)}<span>${T.end}</span></button>
      <button class="slipb" data-act="restart">${T.restart}</button>`;
  } else {
    const sb = stepButton();
    if (sb && !G.busy) {
      const mine = p.sul; const [label, en, sub] = sb;
      if (mine) h = `<button class="plaque ${en ? 'ready' : 'off'}" data-act="step">${plaqueSVG(196, 56)}<span>${esc(label)}</span>${sub ? `<small>${esc(sub)}</small>` : ''}</button>`;
      else if (G.dev && en) h = `<button class="plaque ghost" data-act="step" title="Geliştirici: Süleyman adına bas">${plaqueSVG(196, 56)}<span class="devtag">DEV · SÜLEYMAN</span><span>${esc(label)}</span></button>`;
    }
  }
  box.innerHTML = h;
}
function renderHud() {
  const hud = $('#hud'); const si = STEP_I[G.step] ?? 0;
  const mine = G.asks.some(a => a.who === G.me && a.kind !== 'peek') || (P(G.me).sul && stepButton() && stepButton()[1] && G.step !== 'son');
  let sub = '';
  const waitingOn = actingIds().filter(id => id !== G.me);
  if (myAsk()) sub = `<span class="sub mine">${ico('court')}${T.yourTurn}</span>`;
  else if (G.step === 'tertip') sub = `<span class="sub">${ico('court')}${waitingOn.length ? T.waiting(waitingOn.length) : T.ready('hepsi')}</span>`;
  else if (G.step === 'kader') sub = `<span class="sub">${ico('kader')}${T.silent}</span>`;
  else if (G.step === 'acilis') { const f = G.placed.find(c => c.focus); sub = `<span class="sub">${ico('court')}Açılış${f ? ' · ' + esc(INTR[f.as || f.k].n) : ''}</span>`; }
  else if (G.step === 'sonuc-done') sub = `<span class="sub">${ico('minister')}${T.defend}</span>`;
  else if (waitingOn.length === 1) sub = `<span class="sub">${ico('court')}${esc(P(waitingOn[0]).name)}</span>`;
  else sub = `<span class="sub">Kriz ${G.crisisNo}${G.step === 'k0' ? '' : ' · ' + esc(G.crisisName)}</span>`;
  const hadDot = hud.querySelector('.boss.log .dot');
  hud.innerHTML = `<div class="stepc${myAsk() ? ' mine' : ''}" data-act="stephelp"><div class="cbody">${cartSVG(196, 38)}
      <span class="beads">${T.step.map((s, i) => `<i class="bead ${i < si ? 'done' : i === si ? 'now' : ''}" title="${s}"></i>`).join('')}</span>
      <span class="sn">${esc(T.step[si] || '')}</span></div>${sub}</div>
    <button class="boss log" data-act="log" aria-label="${T.log}"><span>${ico('decree')}</span>${hadDot ? '<i class="dot"></i>' : ''}</button>
    <button class="boss set" data-act="settings" aria-label="${T.settings}"><span>${ico('menu')}</span></button>`;
}
function targetMode() {
  // which seats glow right now (null when nothing is being targeted)
  const place = myAsk('place');
  if (place && U.sel) { const c = P(G.me).hand.find(c => c.uid === U.sel); if (c) return targetsFor(G.me, identity(c, U.recast, G.me)); }
  if (G.step === 'atama' && P(G.me).sul && U.tablet) return eligible().filter(id => id !== G.draft[3 - U.tablet] && id !== G.draft[U.tablet]);
  const pk = myAsk('pick'); if (pk) return pk.data.options;
  return null;
}
function renderPrompt() {
  $$('#board > .prompt').forEach(e => e.remove());
  const a = G.asks.find(a => a.who === G.me && ['power', 'pick', 'ferman', 'kulisEnd'].includes(a.kind));
  if (!a) return;
  const p = P(G.me); let h = '';
  const bg = `<svg class="pbg" viewBox="0 0 170 120" preserveAspectRatio="none"><path d="M4 0H166Q170 0 170 4V116Q170 120 166 120H4Q0 120 0 116V4Q0 0 4 0Z" fill="url(#g-ivory)" filter="url(#f-shadow)"/><path d="M4 0H166Q170 0 170 4V116Q170 120 166 120H4Q0 120 0 116V4Q0 0 4 0Z" fill="none" stroke="url(#g-gold)" stroke-width="2.4"/><path d="M8 5H162V115H8Z" fill="none" stroke="#b3311d" stroke-width=".6" opacity=".5"/></svg>`;
  if (a.kind === 'power') {
    const names = { kulis: 'Kulis', gozbebegi: 'Göz Bebeği', fisilti: 'Fısıltı', himaye: 'Himaye' };
    const txt = { kulis: 'Süleyman atamadan önce onunla baş başa konuş.', gozbebegi: 'Birinci Vekilin çektiği kartlara gizlice bak.', fisilti: 'Hükmü bu kez sen ver.', himaye: `${esc(a.data.target ? P(a.data.target).name : '')} Nüfuz kaybetmesin.` };
    h = `<h5><img src="img/roster-char.${p.ch}.jpg" alt="">${names[a.data.p]}</h5><p>${txt[a.data.p]}</p>
      <div class="row"><button class="yes" data-pr="yes">${T.use}</button><button class="no" data-pr="no">${T.skip}</button></div>`;
  } else if (a.kind === 'ferman') {
    h = `<h5><img src="img/roster-char.suleyman.jpg" alt="">Ferman</h5><p>${T.fermanQ}</p>
      <div class="row"><button class="yes" data-pr="yes">${T.use}</button><button class="no" data-pr="no">${T.skip}</button></div>`;
  } else if (a.kind === 'pick') {
    const title = { replace: T.who, objector: T.whoObj, valide: T.who, ferman: T.whoFerman, investigator: T.investigator, investigate: T.investigate, fermanSeat: 'Hangi Vekil?' }[a.data.why] || T.who;
    h = `<h5>${ico(a.data.icon || 'minister')}${esc(title)}</h5>${a.data.note ? `<p>${a.data.note}</p>` : ''}`;
  } else if (a.kind === 'kulisEnd') return;
  $('#board').insertAdjacentHTML('beforeend', `<div class="prompt${a.kind === 'pick' ? ' slim' : ''}">${bg}${h}</div>`);
}

/* ---------------- lobby, end ---------------- */
let lobbyTimer = null;
function renderLobby() {
  const joined = G.lobbyN ?? 1;
  const ids = ['kerem', 'defne', 'can', 'selin', 'bora', 'ayse', 'elif', 'mert'];
  moment(`<div class="lobby"><div class="bgart" style="background-image:url(img/ui.title-1.jpg)"></div>
    <div class="logo"><b>ENTRİKA</b><i>Sarayda bir hain var.</i></div>
    <div class="codebox"><span>${T.roomCode.toLocaleUpperCase('tr')}</span><div class="digits">${'4712'.split('').map(d => `<span class="digit">${d}</span>`).join('')}</div>
      <span style="color:#b9a27a;letter-spacing:.06em;font-size:11px">${T.share}</span></div>
    <div class="joined"><h6>${T.joined.toLocaleUpperCase('tr')} · ${joined}/8</h6><div class="grid">${ids.map((id, i) => i < joined
      ? `<figure><div class="lm">${medal(id, i === 0)}</div><figcaption class="${i === 0 ? 'host' : ''}">${esc(P(id).name)}</figcaption></figure>`
      : `<figure><div class="empty"></div><figcaption style="color:#7a6a55">${T.empty}</figcaption></figure>`).join('')}</div></div>
    <button class="slipb" data-act="join" style="left:18px;top:292px">${T.join}</button>
    <button class="plaque ${joined >= 5 ? 'ready' : 'off'}" data-act="start" style="right:4px;bottom:10px">${plaqueSVG(196, 56)}<span>${T.start}</span><small>5–8 oyuncu</small></button></div>`);
  $('#moment').style.zIndex = 21;
  if (joined < 8 && !lobbyTimer) lobbyTimer = setTimeout(() => { lobbyTimer = null; if (G.step === 'lobi') { G.lobbyN = joined + 1; sfx('coin'); renderLobby(); } }, 650);
}
function joinPad() {
  const m = $('#moment'); let code = '';
  const draw = () => { $('#jp .digits').innerHTML = [0, 1, 2, 3].map(i => `<span class="digit" style="${code[i] ? '' : 'opacity:.35'}">${code[i] || '·'}</span>`).join(''); };
  m.insertAdjacentHTML('beforeend', `<div id="jp" style="position:absolute;inset:0;background:rgba(10,7,5,.92);display:flex;align-items:center;justify-content:center;gap:40px">
    <div style="display:grid;gap:10px;justify-items:center"><span style="font:700 11px/1 var(--f-label);letter-spacing:.12em;color:var(--gold)">${T.roomCode.toLocaleUpperCase('tr')}</span><div class="digits"></div></div>
    <div class="keypad">${[1, 2, 3, 4, 5, 6, 7, 8, 9, '←', 0, '✓'].map(k => `<button class="key" data-k="${k}">${k}</button>`).join('')}</div></div>`);
  draw();
  $('#jp').addEventListener('click', e => {
    const k = e.target.closest('[data-k]')?.dataset.k; if (!k) { if (e.target.id === 'jp') $('#jp').remove(); return; }
    if (k === '←') code = code.slice(0, -1); else if (k === '✓') { $('#jp').remove(); return; } else if (code.length < 4) code += k;
    sfx('coin'); draw();
  });
}
async function gameEnd() {
  G.step = 'bitti'; closeSheet(); render(); $('#board').style.visibility = 'hidden';
  // scripted ending a few crises later: the Treason track reaches Süleyman's death
  const inf = { defne: 3, can: 2, selin: 2, bora: 4, ayse: 1, elif: 1, mert: 3 };
  const ids = G.order.filter(id => !P(id).sul);
  scrim(true);
  moment(`<div class="endv"><div class="head"><b>${T.death.toLocaleUpperCase('tr')}</b><i>${T.traitorsWin} · İhanet yolu 5/5</i></div>
    <div class="track">${[0, 1, 2, 3, 4].map(() => card('kader.x', 30)).join('')}</div>
    <div class="row">${ids.map(id => { const p = P(id); const win = p.taraf === 'H'; const top = id === 'mert';
      return `<div class="pl ${win ? 'win' : 'lose'} ${top ? 'top' : ''}" data-e="${id}"><svg class="crown" viewBox="0 0 30 20"><path d="M2 18L5 5L11 12L15 2L19 12L25 5L28 18Z" fill="currentColor" stroke="#6e4b12"/></svg>
        <div class="bigcard tw"><div class="flip" style="transform:rotateY(0)"><div>${card('back.taraf', 72)}</div><div class="fr">${card('taraf.' + (p.taraf === 'H' ? 'h' : 's'), 72)}</div></div></div>
        <div class="em">${medal(id)}<div class="coin" style="position:absolute;right:-6px;bottom:-2px">${inf[id]}</div></div><b>${esc(p.name)}</b></div>`; }).join('')}</div>
    <button class="slipb" data-act="restart" style="left:8px;bottom:10px">${T.restart}</button>
    <button class="plaque ready" data-act="restart" style="right:4px;bottom:10px">${plaqueSVG(196, 56)}<span>${T.newGame}</span></button></div>`);
  sfx('gong'); buzz([60, 80, 60]);
  await wait(700);
  const flips = $$('.endv .flip');
  flips.forEach(f => anim(f, [{ transform: 'rotateY(0)' }, { transform: 'rotateY(180deg)' }], { duration: 800, easing: 'cubic-bezier(.45,.05,.2,1)' }));
  sfx('flip'); await wait(900);
  const top = $('.endv .pl.top'); if (top) { const r = boardXY(top); dust(r.x, r.y - 40, '#ffe6a0', 26, '#moment'); }
}

/* ---------------- step flows ---------------- */
async function doStep() {
  if (G.busy) return; G.busy = true; render();
  try {
    switch (G.step) {
      case 'k0': await flowCrisis(); break;
      case 'atama': if (G.kulis) { G.kulis = false; moment(''); scrim(false); break; } await flowAnnounce(); break;
      case 'itiraz-done': await flowSleep(); break;
      case 'tertip': await flowWake(); break;
      case 'acilis-done': { const pl = await flowKader(); await flowResult(pl); break; }
      case 'sonuc-done': await flowDecree(); break;
      case 'son': G.protoEnd = true; break;
    }
  } finally { G.busy = false; render(); }
}
async function flowCrisis() {
  // Step 1: the Crisis flips on every phone at once, then its draw line runs
  const slot = $('#tray .slot-crisis'); const from = slot ? boardXY(slot) : { x: 204, y: 182 };
  if (!G.fast) {
    scrim(true); sfx('gong'); buzz(40);
    const m = moment(`<div class="bigcard" id="cf" style="left:${367 - 118}px;top:${186 - 165}px;width:236px"><div class="flip" style="transform:rotateY(0)"><div>${card('back.crisis', 236)}</div><div class="fr">${card('crisis.' + G.crisis, 236)}</div></div></div>`);
    const bc = $('#cf'); const s0 = 80 / 236;
    await anim(bc, [{ transform: `translate(${from.x - 367}px,${from.y - 186}px) scale(${s0})` }, { transform: 'translate(0,0) scale(1)' }], { duration: 520 });
    await wait(150); sfx('flip');
    await anim(bc.firstElementChild, [{ transform: 'rotateY(0) translateZ(0)' }, { transform: 'rotateY(90deg) translateZ(60px)', offset: .5 }, { transform: 'rotateY(180deg) translateZ(0)' }], { duration: 760, easing: 'cubic-bezier(.45,.05,.2,1)' });
    dust(367, 186, '#9fb8ff', 22, '#moment');
    G.step = 'kriz-shown'; await wait(1700);
    await anim(bc, [{ transform: 'translate(0,0) scale(1)' }, { transform: `translate(${from.x - 367}px,${from.y - 186}px) scale(${s0})` }], { duration: 480, easing: 'cubic-bezier(.5,0,.3,1)' });
    moment(''); scrim(false);
  }
  G.step = 'k0b'; G.crisisShown = true; render();
  log('crisis', `Kriz: <b>${G.crisisName}</b> (Divan). Geçen krizin Vekilleri birer Entrika çeker.`);
  for (const id of G.lastMin) await drawFx(id, 'crisis');
  G.step = 'atama'; G.draft = { 1: null, 2: null }; render();
  await banner('Atama', 'Süleyman Vekillerini seçiyor');
  if (P('mert').pw.base === 'ready') {
    const use = await ask('mert', 'power', { p: 'kulis' });
    if (use) { P('mert').pw.base = 'used'; log('secret', '<b>Mert</b> Kulis kullandı: Süleyman’la baş başa.'); await kulisMoment(); }
  }
  render();
}
async function drawFx(id, src) {
  const c = drawIntr(id); if (!c) return;
  render();
  if (G.fast) return;
  const from = boardXY($('#tray .slot-crisis'));
  if (id === G.me) {
    const el = $(`#hand .hc[data-uid="${c.uid}"]`); if (el) el.style.opacity = '0';
    const to = el ? boardXY(el) : { x: 367, y: 330 };
    await flyCard(card('intr.' + c.k, 84), card('back.intr', 84), from, to, { w: 84, w0: 40, w1: 84, dur: 620 });
    if (el) el.style.opacity = ''; sfx('paper');
  } else {
    await flyCard(card('back.intr', 30), null, from, posOf(id), { w: 30, dur: 520 });
    dust(posOf(id).x, posOf(id).y, '#9fb8ff', 6);
  }
}
async function kulisMoment() {
  G.kulis = true; if (G.fast) { G.kulis = false; return; }
  scrim(true);
  moment(`<div class="mtitle"><span class="cart">Kulis</span><p>${ico('secret')}Rüstem, Süleyman’la baş başa</p></div>
    <div style="position:absolute;left:0;right:0;top:90px;display:flex;justify-content:center;gap:30px">${['char.rustem', 'char.suleyman'].map(k => `<div style="width:150px">${card(k, 150)}</div>`).join('')}</div>
    ${G.me === sul() ? `<button class="plaque ready" data-act="kulisEnd" style="right:4px;bottom:10px">${plaqueSVG(196, 56)}<span>${T.kulisEnd}</span></button>` : ''}`);
  render();
  if (G.me !== sul()) { await wait(2600); G.kulis = false; moment(''); scrim(false); }
}
async function flowAnnounce() {
  // bot Süleyman (or a half-finished draft) completes the appointment
  if (!G.draft[1]) G.draft[1] = 'bora'; if (!G.draft[2]) G.draft[2] = G.draft[1] === 'can' ? 'bora' : 'can';
  G.min = { 1: G.draft[1], 2: G.draft[2] }; G.draft = { 1: null, 2: null }; U.tablet = null;
  [1, 2].forEach(n => { G.wasMin[G.min[n]] = true; });
  log('min1', `Atama: <b>${P(G.min[1]).name}</b> Birinci, <b>${P(G.min[2]).name}</b> İkinci Vekil.`);
  await ceremony(G.min[1], G.min[2]);
  render();
  await flowObjections();
}
async function ceremony(a, b) {
  if (G.fast) return;
  scrim(true); sfx('gong'); buzz(40);
  moment(`<div class="mtitle" style="top:6px"><svg viewBox="0 0 140 86" style="width:120px;height:70px;color:#e9c96c;filter:drop-shadow(0 2px 4px #000)"><use href="#s-tugra" width="140" height="86"/></svg></div>
    ${[a, b].map((id, i) => `<div class="cer" style="position:absolute;left:${i ? 389 : 195}px;top:74px;width:150px;display:grid;justify-items:center;gap:8px">
      ${card('char.' + P(id).ch, 150)}<span class="cart" style="height:24px;font-size:14px">${ico(i ? 'min2' : 'min1')}${i ? T.min2 : T.min1}</span>
      <b style="font:700 16px/1 var(--f-display);color:var(--gold-hi);margin-top:-4px">${esc(P(id).name)}</b></div>`).join('')}`);
  const els = $$('#moment .cer');
  await Promise.all(els.map((e, i) => anim(e, [{ transform: 'translateY(90px) scale(.7)', opacity: 0 }, { transform: 'translateY(0) scale(1)', opacity: 1 }], { duration: 560, delay: i * 160 })));
  dust(270, 150, '#ffe6a0', 18, '#moment'); dust(464, 150, '#ffe6a0', 18, '#moment');
  await wait(1500);
  const tg = [1, 2].map(n => boardXY($(`#tray .vk[data-vk="${n}"] .vm`)));
  await Promise.all(els.map((e, i) => { const r = boardXY(e); return anim(e, [{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: `translate(${tg[i].x - r.x}px,${tg[i].y - r.y}px) scale(.18)`, opacity: .2 }], { duration: 520, easing: 'cubic-bezier(.5,0,.3,1)' }); }));
  moment(''); scrim(false); sfx('thud');
}
async function flowObjections() {
  G.step = 'itiraz'; render();
  const S = sul();
  for (const id of G.order.slice(G.order.indexOf(S) + 1).concat(G.order.slice(0, G.order.indexOf(S)))) {
    const p = P(id); G.objTurn = id; render();
    const free = p.ch === 'mahidevran' && p.pw.base === 'ready';
    if (p.inf < 1 && !free) { await wait(350); continue; }
    const r = await ask(id, 'object', {});
    if (r && r.seat) await applyObjection(id, r);
    else await wait(180);
  }
  G.objTurn = null; G.step = 'itiraz-done'; render();
}
async function applyObjection(by, r) {
  const p = P(by); const seat = r.seat; const out = G.min[seat];
  if (r.free) p.pw.base = 'used'; else { p.inf -= 1; coinFly(by, null, '−1'); }
  G.objected[by] = true; if (p.hirs && p.hirs.id === 'itirazci') p.hirs.done = true;
  const vkEl = $(`#tray .vk[data-vk="${seat}"]`);
  if (vkEl && !G.fast) { const v = boardXY(vkEl); await stampAt(v.x, v.y, waxSVG('objection'), 46); }
  G.min[seat] = null; render();
  await drawFx(out, 'seat');
  const options = eligible([out]);
  const chooser = r.free ? by : sul();
  const repl = await ask(chooser, 'pick', { why: r.free ? 'objector' : 'replace', options, icon: seat === 1 ? 'min1' : 'min2' });
  G.min[seat] = repl; G.wasMin[repl] = true;
  log('objection', `<b>${p.name}</b> İtiraz etti${r.free ? ' (Mahidevran, bedava)' : ''}: ${P(out).name} yerine <b>${P(repl).name}</b>.`);
  render();
  if (!G.fast) { const v = boardXY($(`#tray .vk[data-vk="${seat}"]`)); dust(v.x, v.y, '#ffe6a0', 14); sfx('thud'); }
}
async function flowSleep() {
  G.step = 'tertip'; G.ready = {}; G.placed = []; U = freshU(); render(); sfx('gong');
  await banner(T.sleep, 'Tertip', {});
  const ids = G.order.filter(id => !P(id).sul);
  ids.forEach(id => ask(id, 'place').then(r => onPlaced(id, r)));
  render();
}
function onPlaced(id, r) {
  const p = P(id);
  if (r) {
    const c = p.hand.find(c => c.uid === r.uid);
    if (c) {
      p.hand = p.hand.filter(x => x !== c);
      if (r.as) p.kulUsed = true;
      G.placed.push({ uid: c.uid, k: c.k, as: r.as ? kulOf(id).as : null, owner: id, target: r.target, down: true, state: 'wait' });
    }
  }
  G.ready[id] = true; U.draft = id === G.me ? null : U.draft; if (id === G.me) U.sel = null;
  render();
  if (!G.fast) { const el = $(`#seats .seat[data-id="${id}"] .tick`); if (el) anim(el, [{ transform: 'scale(2.2) rotate(-25deg)', opacity: 0 }, { transform: 'scale(1) rotate(-8deg)', opacity: 1 }], { duration: 300, easing: 'cubic-bezier(.3,1.5,.5,1)' }); sfx('seal'); }
}
async function flowWake() {
  // Step 3b: the synced reveal. Cards appear face down in front of their targets, then all flip at once.
  G.step = 'acilis'; render(); sfx('chime');
  await banner(T.wake, 'Açılış');
  if (!G.fast) {
    const els = $$('#placed .pc');
    await Promise.all(els.map((e, i) => { const r = boardXY(e); return anim(e, [{ transform: `translate(${367 - r.x}px,${190 - r.y}px) scale(.4)`, opacity: 0 }, { transform: 'translate(0,0) scale(1)', opacity: 1 }], { duration: 480, delay: i * 90 }); }));
    els.forEach(e => e.getAnimations().forEach(a => a.cancel()));
    await wait(650);
  }
  G.placed.forEach(c => { c.down = false; }); render(); sfx('flip'); buzz(25);
  await wait(1100);
  await resolveAll();
  log('court', 'Açılış: ' + (G.placed.length ? G.placed.map(c => `${INTR[c.as || c.k].n}${c.as ? ' (Kul)' : ''} → ${P(c.target).name}${c.state === 'void' ? ' ✗' : ''}`).join(', ') : 'kart yok') + '.');
  // Süleyman's Ferman, after everything resolved
  if (P(sul()).pw.base === 'ready') {
    const use = await ask(sul(), 'ferman', {});
    if (use) {
      const seat = await ask(sul(), 'pick', { why: 'fermanSeat', options: [G.min[1], G.min[2]], icon: 'decree' });
      const n = seatOf(seat); const repl = await ask(sul(), 'pick', { why: 'ferman', options: eligible(), icon: 'decree' });
      P(sul()).pw.base = 'used'; G.min[n] = repl; G.wasMin[repl] = true; render(); await drawFx(seat, 'seat');
      log('decree', `Ferman: ${P(seat).name} yerine <b>${P(repl).name}</b>.`);
    }
  }
  G.step = 'acilis-done'; render();
}
async function resolveAll() {
  const S = G.order.indexOf(sul());
  const dist = id => (G.order.indexOf(id) - S + G.order.length) % G.order.length;
  const list = G.placed.slice().sort((a, b) => INTR[a.as || a.k].no - INTR[b.as || b.k].no || dist(a.owner) - dist(b.owner));
  for (const c of list) {
    if (c.state === 'void') continue;
    const k = c.as || c.k, d = INTR[k], t = c.target;
    c.focus = true; render(); await wait(520);
    let ok = true;
    if (d.tg === 'min' && !isMin(t)) ok = false;
    else if (k === 'akil-d' || k === 'akil-h') {
      G.placed.forEach(o => { if (o !== c && o.target === t && INTR[o.as || o.k].f === d.f && !(o.as || o.k).startsWith('akil')) o.state = 'void'; });
      sfx('seal');
    } else if (k === 'muhur') { G.protect[t] = true; const v = $(`#tray .vk[data-vk="${seatOf(t)}"]`); if (v && !G.fast) { const r = boardXY(v); await stampAt(r.x + 40, r.y - 18, tickSVG(), 30); } }
    else if (k === 'valide') {
      if (G.protect[t]) ok = false;
      else {
        const n = seatOf(t); c.focus = false; render();
        const repl = await ask(c.owner, 'pick', { why: 'valide', options: eligible().concat(), icon: 'min' + n });
        G.min[n] = repl; G.wasMin[repl] = true; G.viaCard[repl] = true;
        if (P(repl).hirs && P(repl).hirs.id === 'koltuk') P(repl).hirs.done = true;
        render(); if (!G.fast) { const r = boardXY($(`#tray .vk[data-vk="${n}"]`)); dust(r.x, r.y, '#ffe6a0', 16); sfx('thud'); }
        await drawFx(t, 'seat');
      }
    } else if (k === 'divan-sirasi') { const a = G.min[1]; G.min[1] = G.min[2]; G.min[2] = a; render(); sfx('paper'); }
    else if (k === 'saray-dedikodusu') { c.eye = true; render(); if (c.owner === G.me) await ask(c.owner, 'peek', { kind: 'hand', target: t }); else await wait(500); }
    else if (k === 'muhurlu-evrak') { c.eye = true; render(); if (c.owner === G.me) await ask(c.owner, 'peek', { kind: 'top' }); else await wait(500); }
    else if (k === 'saray-tabibi') { G.noLoss[t] = true; }
    else if (k === 'iftira') { if (!G.noLoss[t] && P(t).inf > 0) { P(t).inf -= 1; coinFly(t, null, '−1'); render(); await drawFx(t, 'seat'); } else ok = false; }
    else if (k === 'gozde') { if (t !== c.owner && !P(t).sul) { P(t).inf += 1; coinFly(null, t, '+1'); } else ok = false; }
    else if (k === 'teftis') { G.teftis.push({ owner: c.owner, who: t }); c.eye = true; }
    c.focus = false; c.state = ok ? 'done' : 'void'; render();
    await wait(ok ? 380 : 620);
  }
}
async function flowKader() {
  G.step = 'kader'; G.kader = {}; render();
  await banner(T.kader, T.silent);
  const m1 = G.min[1], m2 = G.min[2];
  if (G.order.includes('elif') && P('elif').pw.base === 'ready') {
    const use = await ask('elif', 'power', { p: 'gozbebegi' });
    if (use) { P('elif').pw.base = 'used'; G.gozbebegi = 'elif'; }
  }
  const drawn = G.kDeck.splice(0, 3); G.kader.drawn = drawn.slice(); render();
  const deck = boardXY($('#tray .deck'));
  if (G.gozbebegi === G.me) await ask(G.me, 'peek', { kind: 'kader', cards: drawn });
  if (m1 !== G.me && !G.fast) { for (let i = 0; i < 3; i++) { flyCard(card('back.kader', 30), null, deck, posOf(m1), { dur: 560 }); await wait(140); } await wait(500); }
  const t1 = await ask(m1, 'kader1', { cards: drawn });
  const passed = drawn.filter((_, i) => i !== t1); G.kader.d1 = drawn[t1];
  if (m1 !== G.me && !G.fast) { flyCard(card('back.kader', 30), null, posOf(m1), deck, { dur: 480 }); await wait(260); await Promise.all([0, 1].map(i => flyCard(card('back.kader', 30), null, posOf(m1), posOf(m2), { dur: 820, arc: -50 - i * 12 }))); }
  const t2 = await ask(m2, 'kader2', { cards: passed });
  G.kader.d2 = passed[t2]; const played = passed[1 - t2]; G.played = played;
  if (m2 !== G.me && !G.fast) { flyCard(card('back.kader', 30), null, posOf(m2), deck, { dur: 480 }); await wait(200); }
  return played;
}
async function flowResult(played) {
  G.step = 'sonuc'; render();
  const m2 = G.min[2]; const from = m2 === G.me ? { x: 367, y: 186 } : posOf(m2);
  const nk = played === 'h' ? G.track.h : G.track.x; const niche = $(`#tray .niche[data-n="${played}${nk}"]`);
  if (!G.fast) {
    scrim(true, 'kader');
    const m = moment(`<div class="bigcard" id="lc" style="left:${367 - 78}px;top:${186 - 109}px;width:156px"><div class="flip" style="transform:rotateY(0)"><div>${card('back.kader', 156)}</div><div class="fr">${card('kader.' + played, 156)}</div></div></div>`);
    const el = $('#lc'), s0 = 30 / 156;
    await anim(el, [{ transform: `translate(${from.x - 367}px,${from.y - 186}px) scale(${s0})` }, { transform: 'translate(0,0) scale(1)' }], { duration: 560 });
    await wait(260); sfx('flip');
    await anim(el.firstElementChild, [{ transform: 'rotateY(0)' }, { transform: 'rotateY(180deg)' }], { duration: 700, easing: 'cubic-bezier(.45,.05,.2,1)' });
    if (played === 'h') { dust(367, 186, '#9ff0c4', 30, '#moment'); sfx('chime'); } else { dust(367, 186, '#ff5a3c', 30, '#moment'); sfx('gong'); }
    await wait(1200);
    const to = niche ? boardXY(niche) : { x: 300, y: 200 };
    scrim(false);
    await anim(el, [{ transform: 'translate(0,0) scale(1) rotate(0)' }, { transform: `translate(${(to.x - 367) * .6}px,${(to.y - 186) * .6 - 30}px) scale(.5) rotate(-6deg)`, offset: .6 }, { transform: `translate(${to.x - 367}px,${to.y - 186 + 3}px) scale(${30 / 156}) rotate(0)` }], { duration: 700, easing: 'cubic-bezier(.5,0,.6,1)' });
    moment('');
  }
  if (played === 'h') G.track.h += 1; else G.track.x += 1;
  render(); sfx('thud'); buzz([50, 30, 80]);
  const n2 = $(`#tray .niche[data-n="${played}${nk}"]`);
  if (n2 && !G.fast) { const r = boardXY(n2); dust(r.x, r.y, played === 'h' ? '#9ff0c4' : '#ffb39c', 22); anim($('#tray'), [{ transform: 'translate(0,0)' }, { transform: 'translate(0,3px)' }, { transform: 'translate(0,-1px)' }, { transform: 'translate(0,0)' }], { duration: 260, fill: 'none' }); }
  [G.min[1], G.min[2]].forEach(id => { if (played === 'x' && P(id).hirs?.id === 'supheli') P(id).hirs.done = true; });
  log(played === 'h' ? 'hizmet' : 'hiyanet', `Kader: <b>${played === 'h' ? 'Hizmet' : 'Hıyanet'}</b>. ${played === 'h' ? 'Sadakat' : 'İhanet'} yolu ${played === 'h' ? G.track.h : G.track.x}.`, 'k' + played);
  // power space
  if (played === 'x' && TRACK_PW[G.track.x]) {
    const [name, icon] = TRACK_PW[G.track.x];
    if (n2) n2.classList.add('lit');
    await banner(name, 'İhanet yolu ' + G.track.x, { red: true });
    if (G.track.x === 2) {
      const inv = await ask(sul(), 'pick', { why: 'investigator', options: G.order.filter(id => !P(id).sul), icon: 'secret' });
      const tgt = await ask(inv, 'pick', { why: 'investigate', options: G.order.filter(id => !P(id).sul && id !== inv), icon: 'allegiance' });
      if (inv === G.me) await ask(inv, 'peek', { kind: 'taraf', target: tgt }); else await wait(900);
      log('secret', `Soruşturma: <b>${P(inv).name}</b>, ${P(tgt).name}’in Tarafına baktı.`);
    }
  }
  // Teftiş: owners look at the discards of a Vekil they inspected
  for (const t of G.teftis) if (isMin(t.who) && t.owner === G.me) await ask(G.me, 'peek', { kind: 'disc', target: t.who, cards: [seatOf(t.who) === 1 ? G.kader.d1 : G.kader.d2] });
  G.step = 'sonuc-done'; render();
}
async function flowDecree() {
  G.step = 'hukum'; render();
  await banner(T.decree, G.played === 'h' ? T.decreeH : T.decreeX);
  let decider = sul();
  const hur = G.order.find(id => P(id).ch === 'hurrem');
  if (hur && P(hur).pw.base === 'ready') { const use = await ask(hur, 'power', { p: 'fisilti' }); if (use) { P(hur).pw.base = 'used'; decider = hur; log('decree', `<b>${P(hur).name}</b> Fısıltı kullandı.`); } }
  const type = G.played; const tgt = await ask(decider, 'decree', { type });
  await sealedFerman(tgt, type);
  let blocked = false;
  if (type === 'x') {
    const hat = G.order.find(id => P(id).ch === 'hatice');
    if (hat && P(hat).pw.base === 'ready' && P(tgt).inf > 0) { const use = await ask(hat, 'power', { p: 'himaye', target: tgt }); if (use) { P(hat).pw.base = 'used'; blocked = true; } }
    if (G.noLoss[tgt]) blocked = true;
    if (!blocked && P(tgt).inf > 0) { P(tgt).inf -= 1; coinFly(tgt, null, '−1'); if (P(tgt).hirs?.id === 'gozden') P(tgt).hirs.done = true; render(); await wait(400); await drawFx(tgt, 'seat'); }
  } else { P(tgt).inf += 1; coinFly(null, tgt, '+1'); if (P(tgt).hirs?.id === 'takdir') P(tgt).hirs.done = true; }
  log('decree', `Hüküm: <b>${P(tgt).name}</b> ${type === 'h' ? '+1' : '−1'} Nüfuz${blocked ? ' (korundu)' : ''}.`);
  render(); await wait(600);
  // end of crisis: completed Hırs cards are revealed, Favor powers unlock
  const done = G.order.filter(id => P(id).hirs && P(id).hirs.done && !P(id).hirs.shown);
  if (done.length) await hirsReveal(done);
  G.step = 'son'; render();
}
async function sealedFerman(tgt, type) {
  if (G.fast) return;
  scrim(true);
  moment(`<div class="ferman" id="sf">${fermanSVG()}<div class="fin">${tugra('tg')}<h3>${T.decree}</h3>
    <div class="who"><div style="display:grid;justify-items:center;gap:4px"><div class="fm" style="position:relative;width:70px;height:70px">${medal(tgt)}</div><span style="font:700 15px/1 var(--f-display);color:var(--ink-red)">${esc(P(tgt).name)}</span></div></div>
    <div class="delta">${type === 'h' ? '+1' : '−1'} <span class="coin">${type === 'h' ? '+' : '−'}</span></div></div>
    <div id="sfseal" style="position:absolute;left:50%;bottom:-6px;width:70px;height:70px;margin-left:-35px">${waxSVG('decree')}</div></div>`);
  const f = $('#sf'), seal = $('#sfseal');
  const rolled = 'inset(44% 0 44% 0)', open_ = 'inset(0 0 0 0)';
  await anim(f, [{ transform: 'translateY(-260px)', clipPath: rolled, opacity: 0 }, { transform: 'translateY(0)', clipPath: rolled, opacity: 1 }], { duration: 520 });
  await anim(seal, [{ transform: 'translateY(-150px) scale(1)' }, { transform: 'translateY(-150px) scale(1)' }], { duration: 10 });
  sfx('seal'); await anim(seal, [{ transform: 'translateY(-150px) scale(1)', opacity: 1 }, { transform: 'translateY(-150px) scale(1.25) rotate(10deg)', opacity: 1 }, { transform: 'translateY(-150px) scale(1.7) rotate(24deg)', opacity: 0 }], { duration: 460 });
  sfx('paper'); await anim(f, [{ clipPath: rolled }, { clipPath: open_ }], { duration: 640, easing: 'cubic-bezier(.2,.9,.3,1)' });
  await wait(1500);
  await anim(f, [{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(.6) translateY(40px)', opacity: 0 }], { duration: 380 });
  moment(''); scrim(false);
}
function fermanSVG() {
  return `<svg viewBox="0 0 300 356" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="fr" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#7c5616"/><stop offset=".4" stop-color="#fff0b4"/><stop offset=".6" stop-color="#c6963a"/><stop offset="1" stop-color="#5a3a10"/></linearGradient></defs>
  <rect x="16" y="10" width="268" height="336" fill="#f6e8c6" filter="url(#f-shadow)"/><rect x="16" y="10" width="268" height="336" fill="url(#p-zerefsan)" opacity=".7"/>
  <rect x="26" y="20" width="248" height="316" fill="none" stroke="url(#g-gold)" stroke-width="2.5"/><rect x="31" y="25" width="238" height="306" fill="none" stroke="#1f3c86" stroke-width=".8" opacity=".6"/>
  <rect x="6" y="0" width="288" height="18" rx="9" fill="url(#fr)"/><rect x="6" y="338" width="288" height="18" rx="9" fill="url(#fr)"/></svg>`;
}
async function hirsReveal(ids) {
  ids.forEach(id => { P(id).hirs.shown = true; if (P(id).pw.favor === 'locked') P(id).pw.favor = 'ready'; log('ambition', `<b>${P(id).name}</b> Hırsını açtı: ${HIRS[P(id).hirs.id].n}. Lütuf gücü açıldı.`); });
  if (G.fast) return;
  scrim(true);
  moment(`<div class="mtitle"><span class="cart">Hırs</span><p>${ico('favor')}Lütuf gücü açıldı</p></div>
    <div style="position:absolute;left:0;right:0;top:66px;display:flex;justify-content:center;gap:34px">${ids.map(id => `<div style="display:grid;justify-items:center;gap:8px">
      <div class="bigcard" style="position:relative;width:150px"><div class="flip"><div>${card('back.hirs', 150)}</div><div class="fr">${card('hirs.' + P(id).hirs.id, 150)}</div></div></div>
      <span class="cart" style="height:22px;font-size:14px">${esc(P(id).name)} · ${esc(CH[P(id).ch].favor[0])}</span></div>`).join('')}</div>`);
  await wait(400); sfx('flip');
  await Promise.all($$('#moment .flip').map(f => anim(f, [{ transform: 'rotateY(0)' }, { transform: 'rotateY(180deg)' }], { duration: 760, easing: 'cubic-bezier(.45,.05,.2,1)' })));
  dust(367, 160, '#e2b4e0', 24, '#moment'); sfx('chime');
  await wait(1800); moment(''); scrim(false);
}

/* ---------------- my asks: what the viewer sees when it is their move ---------------- */
async function onMyAsk(a, quiet) {
  render();
  if (a.kind === 'kader1' || a.kind === 'kader2') return kaderPick(a);
  if (a.kind === 'decree') return decreePick(a);
  if (a.kind === 'peek') return peek(a);
  if (a.kind === 'kulisEnd') return;
  if (!quiet && (a.kind === 'place' || a.kind === 'object')) { await wait(a.kind === 'place' ? 1500 : 200); if (G.asks.includes(a)) { sfx('chime'); buzz([30, 60, 30]); } }
  else if (!quiet) { sfx('chime'); buzz(30); }
}
function kaderPick(a) {
  const cards = a.data.cards; const first = a.kind === 'kader1'; const p = P(G.me); const loyal = p.taraf === 'S';
  // Loyalist duty, enforced: a Sadık First Minister must toss a Hıyanet if one was drawn; a Sadık Second Minister must play a Hizmet
  const locked = cards.map(k => loyal && (first ? (cards.includes('x') && k === 'h') : (cards.includes('h') && k === 'h' && cards.filter(c => c === 'h').length === 1)));
  let toss = null;
  scrim(true, 'kader');
  const n = cards.length, w = 156, gap = n === 3 ? 22 : 34, x0 = 367 - (n * w + (n - 1) * gap) / 2;
  const draw = () => {
    moment(`<div class="mtitle"><span class="cart">${ico(first ? 'min1' : 'min2')}${first ? T.min1 : T.min2}</span><p>${ico('kader')}${T.tossOne} · ${first ? T.sendTwo : T.playOther}</p></div>
      ${cards.map((k, i) => `<div class="kcard${toss === i ? ' toss' : toss !== null ? ' keep' : ''}${locked[i] ? ' locked' : ''}" data-k="${i}" style="left:${x0 + i * (w + gap)}px;top:80px">
        ${card('kader.' + k, w)}${locked[i] ? `<span class="lockb">${ico('loyalist')}</span>` : ''}<span class="stamp">${waxSVG('close')}</span>
        ${!first ? `<span class="play cart" style="height:22px;font-size:13px">${T.play}</span>` : ''}</div>`).join('')}
      <p class="duty" id="duty">${first ? T.dutyH1 : T.dutyH2}</p>
      <div class="act" style="position:absolute;right:0;bottom:0;width:240px;height:120px"><button class="seal ${toss !== null ? 'ready' : 'off'}" data-kp="go"><span class="rib">${first ? T.send : T.play}</span><span class="wax">${waxSVG('seal')}</span></button></div>`);
  };
  draw();
  if (!G.fast) {
    const els = $$('#moment .kcard');
    if (first) els.forEach((e, i) => anim(e, [{ transform: 'translateY(160px) rotate(8deg)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 480, delay: i * 120, fill: 'none' }));
    else els.forEach((e, i) => anim(e, [{ transform: `translate(${(1 - 2 * i) * 60}px,-120px) rotateY(180deg) scale(.5)`, opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 560, delay: 100, fill: 'none' }));
    sfx('paper'); buzz([30, 60, 30]);
  }
  const m = $('#moment');
  const onClick = async e => {
    const kc = e.target.closest('.kcard'); const go = e.target.closest('[data-kp="go"]');
    if (kc) {
      const i = +kc.dataset.k;
      if (locked[i]) { kc.classList.remove('shake'); void kc.offsetWidth; kc.classList.add('shake'); $('#duty').classList.add('on'); buzz(20); return; }
      toss = toss === i ? null : i; sfx('paper'); draw(); return;
    }
    if (go && toss !== null) {
      m.removeEventListener('click', onClick);
      const els = $$('#moment .kcard');
      sfx('seal');
      await anim(els[toss], [{ transform: 'translateY(26px) rotate(-4deg)', opacity: 1 }, { transform: 'translateY(240px) rotate(-18deg)', opacity: 0 }], { duration: 480, easing: 'cubic-bezier(.5,0,.75,0)' });
      const keep = els.filter((_, i) => i !== toss);
      if (first) {
        await Promise.all(keep.map((e, j) => { const r = boardXY(e); return anim(e, [{ transform: 'none' }, { transform: `translate(${367 - r.x + (j ? 8 : -8)}px,${186 - r.y}px) rotate(${j ? 5 : -5}deg) scale(.7)` }], { duration: 420 }); }));
        await stampAt(367, 186, waxSVG('seal'), 54);
        await Promise.all(keep.map(e => anim(e, [{ opacity: 1 }, { transform: 'translate(0,-330px) scale(.3)', opacity: 0, composite: 'add' }], { duration: 520, easing: 'cubic-bezier(.5,0,.75,0)' })));
      } else {
        await anim(keep[0], [{ transform: 'none' }, { transform: 'translateY(-10px) scale(1.06)' }], { duration: 300 });
      }
      moment(''); scrim(false); answer(a, toss);
    }
  };
  m.addEventListener('click', onClick);
}
function decreePick(a) {
  const type = a.data.type; let pick = null;
  scrim(true);
  const draw = () => moment(`<div class="ferman" id="df">${fermanSVG()}<div class="fin">${tugra('tg')}<h3>${T.decree}</h3><p>${type === 'h' ? T.decreeH : T.decreeX}</p>
    <div class="who">${[1, 2].map(n => { const id = G.min[n]; return `<button class="${pick === id ? 'on' : ''}" data-dp="${id}"><span class="fm">${medal(id)}</span><span>${esc(P(id).name)}</span><span style="font:700 9px/1 var(--f-label);letter-spacing:.06em;color:#5b4630">${n === 1 ? T.min1 : T.min2}</span></button>`; }).join('')}</div>
    <div class="delta" style="opacity:${pick ? 1 : .25}">${type === 'h' ? '+1' : '−1'} <span class="coin">${type === 'h' ? '+' : '−'}</span></div></div></div>
    <div class="act" style="position:absolute;right:0;bottom:0;width:240px;height:120px"><button class="seal ${pick ? 'ready' : 'off'}" data-dp="go"><span class="rib">${T.seal}</span><span class="wax">${waxSVG('decree')}</span></button></div>`);
  draw();
  if (!G.fast) anim($('#df'), [{ clipPath: 'inset(44% 0 44% 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: 560, easing: 'cubic-bezier(.2,.9,.3,1)', fill: 'none' });
  sfx('paper');
  const m = $('#moment');
  const onClick = async e => {
    const b = e.target.closest('[data-dp]'); if (!b) return;
    if (b.dataset.dp === 'go') { if (!pick) return; m.removeEventListener('click', onClick); sfx('seal');
      await anim($('#df'), [{ clipPath: 'inset(0 0 0 0)' }, { clipPath: 'inset(44% 0 44% 0)' }], { duration: 420 }); moment(''); scrim(false); answer(a, pick); return; }
    pick = b.dataset.dp; sfx('paper'); draw();
  };
  m.addEventListener('click', onClick);
}
function peek(a) {
  const d = a.data; let body = '', title = '';
  if (d.kind === 'hand') { const p = P(d.target); title = `${p.name} · ${T.peekHand}`; body = p.hand.map(c => card('intr.' + c.k, 120)).join('') + (p.hirs ? card('hirs.' + p.hirs.id, 120) : ''); }
  else if (d.kind === 'top') { title = T.peekTop; body = G.kDeck.slice(0, 3).map(k => card('kader.' + k, 120)).join(''); }
  else if (d.kind === 'kader') { title = 'Göz Bebeği'; body = d.cards.map(k => card('kader.' + k, 120)).join(''); }
  else if (d.kind === 'disc') { title = `Teftiş · ${P(d.target).name} · ${T.peekDisc}`; body = d.cards.map(k => card('kader.' + k, 120)).join(''); }
  else if (d.kind === 'taraf') { const p = P(d.target); title = `Soruşturma · ${p.name} · ${T.peekTaraf}`; body = card('taraf.' + (p.taraf === 'H' ? 'h' : 's'), 150); }
  scrim(true);
  moment(`<div class="mtitle"><span class="cart">${ico('secret')}${esc(title)}</span><p>Yalnız sen görüyorsun</p></div>
    <div class="peek" style="top:40px"><div class="row">${body}</div></div>
    <div class="act" style="position:absolute;right:0;bottom:0;width:240px;height:120px"><button class="plaque ready" data-pk="ok">${plaqueSVG(196, 56)}<span>${T.ok}</span></button></div>`);
  if (!G.fast) $$('#moment .peek .c3-w').forEach((e, i) => anim(e, [{ transform: 'translateY(40px) scale(.8)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 420, delay: i * 90, fill: 'none' }));
  sfx('paper');
  $('#moment [data-pk]').addEventListener('click', () => { moment(''); scrim(false); answer(a, true); });
}

/* ---------------- input: hand ---------------- */
function canDrag(uid) { const a = myAsk('place'); if (!a) return false; const c = P(G.me).hand.find(c => c.uid === uid); return !!(c && playOptions(G.me, c).length); }
function selectCard(uid) {
  const c = P(G.me).hand.find(c => c.uid === uid); if (!c) return;
  const opts = playOptions(G.me, c);
  if (U.sel === uid) { U.sel = null; U.recast = false; render(); return; }
  U.sel = uid; U.recast = opts.length === 1 && opts[0] === 'kul'; sfx('paper'); render();
}
function tryPlace(target) {
  const a = myAsk('place'); if (!a || !U.sel) return false;
  const c = P(G.me).hand.find(c => c.uid === U.sel); const k = identity(c, U.recast, G.me);
  if (!targetsFor(G.me, k).includes(target)) return false;
  const from = $(`#hand .hc[data-uid="${c.uid}"]`); const fxy = U.dropAt || (from ? boardXY(from) : { x: 367, y: 320 }); U.dropAt = null;
  U.draft = { uid: c.uid, as: U.recast ? 'kul' : null, target }; U.sel = null; U.recast = false;
  render();
  const to = frontOf(target);
  const pc = $(`#placed .pc[data-pc="${c.uid}"]`); if (pc) pc.style.visibility = 'hidden';
  flyCard(card('back.intr', 30), card('intr.' + k, 30), fxy, to, { w: 30, w0: 84, w1: 30, startFace: true, dur: 480 }).then(() => { if (pc) pc.style.visibility = ''; sfx('paper'); dust(to.x, to.y, '#ffe6a0', 8); });
  return true;
}
let inspectOpen = false;
function bindInput() {
  const board = $('#board');
  board.addEventListener('pointerdown', e => {
    audio();
    const hc = e.target.closest('.hc'); const tab = e.target.closest('.tablet'); const meMed = e.target.closest('.me-med'); const seat = e.target.closest('.seat');
    if (hc) return handDown(e, hc);
    if (tab) return tabletDown(e, tab);
    if (meMed) return holdMe(e);
    if (seat) return seatDown(e, seat);
  });
  board.addEventListener('click', e => {
    const b = e.target.closest('[data-act],[data-pr],[data-recast],[data-vk],[data-pip],[data-insp],.pc'); if (!b) return;
    if (b.dataset.act) return act(b.dataset.act);
    if (b.dataset.pr) { const a = G.asks.find(a => a.who === G.me && (a.kind === 'power' || a.kind === 'ferman')); if (a) { sfx(b.dataset.pr === 'yes' ? 'seal' : 'paper'); answer(a, b.dataset.pr === 'yes'); render(); } return; }
    if (b.dataset.recast) { U.recast = !U.recast; const c = P(G.me).hand.find(c => c.uid === U.sel); if (c && !playOptions(G.me, c).includes(null)) U.recast = true; sfx('paper'); render(); return; }
    if (b.dataset.vk) return vkTap(+b.dataset.vk);
    if (b.dataset.pip) return pipTap(b.dataset.pip);
    if (b.dataset.insp) return inspectThing(b.dataset.insp);
    if (b.classList.contains('pc')) {
      if (G.step === 'tertip' && U.draft && b.dataset.pc === U.draft.uid) { U.draft = null; sfx('paper'); render(); return; }
      const c = G.placed.find(c => c.uid === b.dataset.pc); if (c && !c.down) inspectCard('intr.' + (c.as || c.k));
    }
  });
  $('#moment').addEventListener('click', e => {
    const b = e.target.closest('[data-act]'); if (b) act(b.dataset.act);
  });
}
function handDown(e, el) {
  const uid = el.dataset.uid; e.preventDefault();
  try { el.setPointerCapture(e.pointerId); } catch (_) { }
  const st = { x: e.clientX, y: e.clientY, mode: null }; let ghost = null, hot = null;
  const hold = setTimeout(() => { if (!st.mode) { st.mode = 'inspect'; inspectCard('intr.' + P(G.me).hand.find(c => c.uid === uid).k, true); } }, 420);
  const move = ev => {
    if (!st.mode && Math.hypot(ev.clientX - st.x, ev.clientY - st.y) > 9) {
      clearTimeout(hold);
      if (canDrag(uid)) {
        st.mode = 'drag'; if (U.sel !== uid) { const c = P(G.me).hand.find(c => c.uid === uid); const o = playOptions(G.me, c); U.sel = uid; U.recast = o.length === 1 && o[0] === 'kul'; render(); }
        U.dragging = uid; render();
        const c = P(G.me).hand.find(c => c.uid === uid);
        ghost = fxEl(card('intr.' + identity(c, U.recast, G.me), 60), 0, 0, 60); ghost.style.transition = 'transform .12s ease-out';
      } else st.mode = 'none';
    }
    if (st.mode === 'drag' && ghost) {
      const p = clientToBoard(ev.clientX, ev.clientY);
      // the card rides above the finger; near a legal seat it shrinks and settles where it will land
      const tm = targetMode() || []; let best = null, bd = 58;
      tm.forEach(id => { const q = posOf(id); const dd = Math.min(Math.hypot(q.x - p.x, q.y - p.y), Math.hypot(q.x - p.x, q.y - (p.y - 46))); if (dd < bd) { bd = dd; best = id; } });
      if (best !== hot) { $$('.seat.hot,.me-med.hot').forEach(s => s.classList.remove('hot')); hot = best; if (hot) { (hot === G.me ? $('.me-med') : $(`.seat[data-id="${hot}"]`))?.classList.add('hot'); buzz(8); } }
      if (hot) { const f = frontOf(hot); ghost.style.left = (f.x - 30) + 'px'; ghost.style.top = (f.y - 42) + 'px'; ghost.style.transform = 'scale(.55)'; }
      else { ghost.style.left = (p.x - 30) + 'px'; ghost.style.top = (p.y - 96) + 'px'; ghost.style.transform = 'rotate(-5deg)'; }
    }
  };
  const up = ev => {
    clearTimeout(hold); el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up);
    if (st.mode === 'drag') {
      if (ghost) ghost.parentNode.removeChild(ghost); U.dragging = null; $$('.seat.hot,.me-med.hot').forEach(s => s.classList.remove('hot'));
      if (!(hot && tryPlace(hot))) { render(); }
    } else if (st.mode === 'inspect') closeInspect();
    else if (!st.mode) {
      if (myAsk('place')) { const c = P(G.me).hand.find(c => c.uid === uid); if (c && !playOptions(G.me, c).length) { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); buzz(15); return; } selectCard(uid); }
      else inspectCard('intr.' + P(G.me).hand.find(c => c.uid === uid).k);
    }
  };
  el.addEventListener('pointermove', move); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
}
function tabletDown(e, el) {
  const n = +el.dataset.tablet; e.preventDefault();
  try { el.setPointerCapture(e.pointerId); } catch (_) { }
  const st = { x: e.clientX, y: e.clientY, drag: false }; let ghost = null, hot = null;
  U.tablet = n; render();
  const move = ev => {
    if (!st.drag && Math.hypot(ev.clientX - st.x, ev.clientY - st.y) > 9) { st.drag = true; ghost = fxEl(`<div class="vtab" style="width:40px;height:48px;font-size:20px">${n === 1 ? 'I' : 'II'}</div>`, 0, 0, 40); }
    if (st.drag) {
      const p = clientToBoard(ev.clientX, ev.clientY); ghost.style.left = (p.x - 20) + 'px'; ghost.style.top = (p.y - 44) + 'px';
      let best = null, bd = 48; (targetMode() || []).forEach(id => { const q = posOf(id); const d = Math.hypot(q.x - p.x, q.y - p.y); if (d < bd) { bd = d; best = id; } });
      if (best !== hot) { $$('.seat.hot').forEach(s => s.classList.remove('hot')); hot = best; if (hot) $(`.seat[data-id="${hot}"]`)?.classList.add('hot'); }
    }
  };
  const up = () => {
    window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up);
    if (ghost) ghost.remove();
    if (st.drag && hot) appoint(n, hot); else if (st.drag) { U.tablet = null; render(); }
  };
  window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
}
function appoint(n, id) {
  if (!(targetMode() || []).includes(id)) return;
  G.draft[n] = id; U.tablet = null; sfx('seal'); render();
  const s = $(`.seat[data-id="${id}"] .vkb`); if (s) anim(s, [{ transform: 'scale(2.2) translateY(-20px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 320, easing: 'cubic-bezier(.3,1.5,.5,1)', fill: 'none' });
}
function seatDown(e, el) {
  const id = el.dataset.id; e.preventDefault();
  const st = { t: Date.now(), x: e.clientX, y: e.clientY, long: false };
  const hold = setTimeout(() => { st.long = true; inspectSeat(id); }, 460);
  const up = ev => {
    clearTimeout(hold); window.removeEventListener('pointerup', up);
    if (st.long || Math.hypot(ev.clientX - st.x, ev.clientY - st.y) > 12) return;
    seatTap(id);
  };
  window.addEventListener('pointerup', up);
}
function seatTap(id) {
  const tm = targetMode();
  if (tm) {
    if (!tm.includes(id)) { const s = $(`.seat[data-id="${id}"]`); s?.classList.add('shake'); setTimeout(() => s?.classList.remove('shake'), 400); return; }
    if (myAsk('place')) return tryPlace(id);
    if (G.step === 'atama' && U.tablet) return appoint(U.tablet, id);
    const pk = myAsk('pick'); if (pk) { sfx('seal'); answer(pk, id); render(); return; }
  }
  if (G.step === 'atama' && P(G.me).sul && (G.draft[1] === id || G.draft[2] === id)) { if (G.draft[1] === id) G.draft[1] = null; else G.draft[2] = null; sfx('paper'); render(); return; }
  if (G.dev) { setViewer(id); return; }
  inspectSeat(id);
}
function vkTap(n) {
  const obj = myAsk('object');
  if (obj && G.min[n]) { U.vk = U.vk === n ? null : n; sfx('paper'); render(); return; }
  const pk = myAsk('pick'); if (pk && pk.data.why === 'fermanSeat') { answer(pk, G.min[n]); render(); return; }
  if (P(G.me).sul && G.step === 'atama' && G.draft[n]) { G.draft[n] = null; render(); return; }
  const id = G.min[n]; if (id) inspectSeat(id);
}
function pipTap(which) {
  const p = P(G.me);
  if (which === 'base' && myAsk('object') && p.ch === 'mahidevran' && p.pw.base === 'ready') { U.free = !U.free; sfx('seal'); render(); return; }
  if (which === 'kul') return inspectThing('kul');
  inspectCard('char.' + p.ch);
}
function holdMe(e) {
  e.preventDefault(); const el = e.target.closest('.me-med');
  const tm = targetMode();
  if (tm && tm.includes(G.me)) { const up0 = () => { window.removeEventListener('pointerup', up0); if (myAsk('place')) tryPlace(G.me); else { const pk = myAsk('pick'); if (pk) { answer(pk, G.me); render(); } } }; window.addEventListener('pointerup', up0); return; }
  let shown = false; const p = P(G.me);
  const t = setTimeout(() => { shown = true; showSecret(); }, 260);
  const up = () => { clearTimeout(t); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up); if (shown) { moment(''); scrim(false); } else inspectCard('char.' + p.ch); };
  window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
}
function showSecret() {
  // Taraf and Hırs, only while the finger stays down
  const p = P(G.me); scrim(true); buzz(12);
  if (p.sul) { moment(`<div class="peek"><div class="row">${card('char.suleyman', 170)}</div><p class="lbl">Süleyman herkesçe bilinir: her zaman Sadık.</p></div>`); return; }
  const allies = p.taraf === 'H' ? G.order.filter(id => id !== G.me && P(id).taraf === 'H') : [];
  moment(`<div class="peek"><div class="row">
    <div>${card('taraf.' + (p.taraf === 'H' ? 'h' : 's'), 156)}${p.taraf === 'H' ? `<p class="lbl">${allies.length ? T.allies.toLocaleUpperCase('tr') : T.alone}</p><div class="allies">${allies.map(id => `<figure><div class="am">${medal(id)}</div><figcaption>${esc(P(id).name)}</figcaption></figure>`).join('')}</div>` : ''}</div>
    <div>${card('hirs.' + p.hirs.id, 156)}<p class="lbl">${p.hirs.done ? 'TAMAMLANDI' : 'HIRS'}</p></div></div></div>`);
  if (!G.fast) $$('#moment .peek .row > div').forEach((e, i) => anim(e, [{ transform: 'translate(-180px,180px) scale(.3)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 300, delay: i * 60, fill: 'none' }));
}
function inspectCard(key, hold) {
  scrim(true); inspectOpen = true;
  moment(`<div class="insp" data-close="1">${card(key, 258)}${hold ? '' : `<button class="close" data-close="1" aria-label="Kapat">${ico('close')}</button>`}</div>`);
  if (!G.fast) anim($('#moment .insp .c3-w'), [{ transform: 'scale(.6) translateY(60px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 260, fill: 'none' });
  if (!hold) $('#moment .insp').addEventListener('click', closeInspect, { once: true });
}
function closeInspect() { if (!inspectOpen) return; inspectOpen = false; moment(''); scrim(false); }
function inspectThing(what) {
  if (what === 'crisis') return inspectCard(G.step === 'k0' ? 'back.crisis' : 'crisis.' + G.crisis);
  if (what === 'kul') return inspectCard('kul.' + P(G.me).kul);
}
function inspectSeat(id) {
  const p = P(id); const ch = CH[p.ch]; inspectOpen = true; scrim(true);
  const tag = (G.tags[G.me] || {})[id];
  const pw = (nm, st, icon, cls) => `<div class="pwline"><span class="pip ${cls} ${st}"><i>${ico(icon)}</i></span>${esc(nm)} · <i>${st === 'used' ? 'kullanıldı' : st === 'locked' ? 'Hırs ile açılır' : 'hazır'}</i></div>`;
  moment(`<div class="insp"><div style="width:200px">${card('char.' + p.ch, 200)}</div>
    <div class="side"><h3>${esc(p.name)}</h3><span class="ch">${esc(ch.n).toLocaleUpperCase('tr')}${p.sul ? ' · HER ZAMAN SADIK' : ''}</span>
      ${p.sul ? '' : `<div class="stats"><span class="coin${p.inf ? '' : ' zero'}" style="position:static">${p.inf}</span> Nüfuz${p.kul ? ` · <span style="width:46px;display:inline-block">${card('kul.' + p.kul, 46)}</span>` : ''}</div>`}
      ${pw(ch.base[0], p.pw.base, ch.base[1], 'base')}${ch.favor ? pw(ch.favor[0], p.pw.favor, p.pw.favor === 'locked' ? 'ambition' : ch.favor[1], 'favor') : ''}
      ${id === G.me || p.sul ? '' : `<div class="tagrow"><button class="tagbtn${tag === 'sus' ? ' on' : ''}" data-tag="sus"><span class="tagp t-sus">${ico('traitor')}</span>${T.suspect}</button>
        <button class="tagbtn${tag === 'ok' ? ' on' : ''}" data-tag="ok"><span class="tagp t-ok">${ico('loyalist')}</span>${T.trusted}</button></div>
        <p class="cue" style="margin:0">Etiketleri yalnız sen görürsün.</p>`}
    </div><button class="close" data-close="1" aria-label="Kapat">${ico('close')}</button></div>`);
  $('#moment .insp').addEventListener('click', e => {
    const t = e.target.closest('[data-tag]');
    if (t) { const m = G.tags[G.me] = G.tags[G.me] || {}; m[id] = m[id] === t.dataset.tag ? null : t.dataset.tag; sfx('seal'); render(); inspectSeat(id); return; }
    if (e.target.closest('[data-close]') || e.target.classList.contains('insp')) closeInspect();
  });
}

/* ---------------- actions ---------------- */
function act(a) {
  audio();
  switch (a) {
    case 'step': return doStep();
    case 'seal': { const ask_ = myAsk('place'); if (!ask_ || !U.draft) return; const d = U.draft; answer(ask_, { uid: d.uid, as: d.as, target: d.target }); return; }
    case 'pass': { const ask_ = myAsk('place'); if (!ask_) return; U.draft = null; U.sel = null; answer(ask_, null); return; }
    case 'object': { const ask_ = myAsk('object'); if (!ask_ || !U.vk) return; const r = { seat: U.vk, free: U.free }; U.vk = null; U.free = false; answer(ask_, r); return; }
    case 'skipobj': { const ask_ = myAsk('object'); if (!ask_) return; U.vk = null; U.free = false; answer(ask_, null); render(); return; }
    case 'log': return openLog();
    case 'settings': return openSettings();
    case 'stephelp': return stepHelp();
    case 'start': G.step = 'k0'; moment(''); render(); return;
    case 'join': return joinPad();
    case 'toEnd': return gameEnd();
    case 'restart': return jump('lobi');
    case 'kulisEnd': G.kulis = false; moment(''); scrim(false); render(); return;
  }
}
function stepHelp() {
  const help = { k0: 'Süleyman yeni Krizi açar.', 'k0b': 'Kriz kartı çekenleri belirler.', atama: 'Süleyman iki Vekil seçer.', itiraz: 'Sırayla İtiraz: 1 Nüfuz öde, bir Vekili değiştirt.', 'itiraz-done': 'Süleyman geceyi başlatır.',
    tertip: 'Bir Entrika kartını bir oyuncunun önüne koy ya da pas geç. Kimse kimin ne koyduğunu bilmez.', acilis: 'Kartlar sırayla çözülür: küçük numara önce.', 'acilis-done': 'Süleyman Kader’e geçer.',
    kader: 'Birinci Vekil 3 kart çeker, birini atar; İkinci Vekil birini atar, birini oynar.', sonuc: 'Oynanan kart yoluna konur.', 'sonuc-done': 'Vekiller savunma yapar, sonra Hüküm.', hukum: 'Süleyman bir Vekile Nüfuz verir ya da alır.', son: 'Kriz bitti.' }[G.step] || '';
  const c = $('#hud .stepc'); if (!c || c.querySelector('.helpslip')) return;
  c.insertAdjacentHTML('beforeend', `<span class="helpslip" style="display:block;max-width:250px;margin-top:4px;padding:6px 10px;background:var(--ivory-grad);color:var(--ink);font:400 12.5px/1.25 var(--f-body);border-radius:3px;box-shadow:0 0 0 1px #b88a2e,0 3px 6px rgba(0,0,0,.5)">${esc(help)}</span>`);
  setTimeout(() => c.querySelector('.helpslip')?.remove(), 3200);
}

/* ---------------- drawers ---------------- */
let sheetOpen = false;
function openDrawer(html, wide) {
  const s = $('#sheet'); s.hidden = false; sheetOpen = true;
  s.innerHTML = `<div class="shade" data-shut="1"></div><div class="drawer" style="${wide ? 'width:100%' : ''}">${html}</div>`;
  requestAnimationFrame(() => s.querySelector('.drawer').classList.add('open'));
  s.onclick = e => { if (e.target.closest('[data-shut]')) closeSheet(); };
  sfx('paper');
}
function closeSheet() { const s = $('#sheet'); if (!sheetOpen) return; sheetOpen = false; const d = s.querySelector('.drawer'); if (d) d.classList.remove('open'); setTimeout(() => { if (!sheetOpen) { s.hidden = true; s.innerHTML = ''; } }, 330); }
function openLog() {
  $('#hud .boss.log .dot')?.remove();
  let h = '';
  const groups = []; G.log.forEach(l => { if (l.c) groups.push({ head: l, items: [] }); else if (groups.length) groups[groups.length - 1].items.push(l); });
  groups.reverse().forEach(g => {
    h += `<div class="lg-h"><i class="fgem ${g.head.f}"></i>Kriz ${g.head.c} · ${esc(g.head.h)}</div>` + g.items.map(l => `<div class="lg ${l.cls || ''}">${ico(l.i)}<span>${l.t}</span></div>`).join('');
  });
  openDrawer(`<div class="scroll"><header><h4>${T.log}</h4><button class="x" data-shut="1" aria-label="Kapat">${ico('close')}</button></header><div class="body">${h}</div></div>`);
}
function openSettings() {
  const s = G.set; const ids = G.order;
  const steps = [['lobi', 'Lobi'], ['k0', 'Kriz'], ['atama', 'Atama'], ['tertip', 'Tertip'], ['acilis', 'Açılış'], ['kader', 'Kader'], ['sonuc', 'Sonuç'], ['hukum', 'Hüküm'], ['bitti', 'Oyun sonu']];
  openDrawer(`<div class="tray2"><header><h4>${T.settings}</h4><button class="x" data-shut="1" aria-label="Kapat">${ico('close')}</button></header><div class="body">
    <div class="toggles">
      <button class="tg${s.sound ? ' on' : ''}" data-set="sound"><i>${ico('sound')}</i><span>${T.sound}</span></button>
      <button class="tg${s.music ? ' on' : ''}" data-set="music"><i>${ico('music')}</i><span>${T.music}</span></button>
      <button class="tg${s.vib ? ' on' : ''}" data-set="vib"><i>${ico('vibrate')}</i><span>${T.vib}</span><small>${T.vibNote}</small></button>
    </div><p class="cue">${T.cues}</p>
    <div class="devsec"><h5>GELİŞTİRİCİ</h5>
      <div class="chips"><button class="chip${G.dev ? ' on' : ''}" data-dev="seat">${T.devSeat}: dokun ve ol</button></div>
      <div class="chips">${ids.map(id => `<button class="chip${G.me === id ? ' on' : ''}" data-as="${id}"><img src="img/roster-char.${P(id).ch}.jpg" alt="">${esc(P(id).name)}${P(id).sul ? '' : P(id).taraf === 'H' ? ' ·H' : ' ·S'}</button>`).join('')}</div>
      <h5>${T.devJump.toLocaleUpperCase('tr')}</h5>
      <div class="chips">${steps.map(([k, n]) => `<button class="chip" data-jump="${k}">${n}</button>`).join('')}</div>
      <div class="chips"><button class="chip" data-notes="1">${T.devNotes}</button></div>
    </div></div></div>`);
  $('#sheet').querySelector('.tray2').addEventListener('click', e => {
    const b = e.target.closest('[data-set],[data-dev],[data-as],[data-jump],[data-notes]'); if (!b) return;
    if (b.dataset.set) { G.set[b.dataset.set] = !G.set[b.dataset.set]; if (b.dataset.set === 'music') music(G.set.music); if (b.dataset.set === 'vib') buzz(40); sfx('seal'); b.classList.toggle('on'); return; }
    if (b.dataset.dev) { G.dev = !G.dev; b.classList.toggle('on'); render(); return; }
    if (b.dataset.as) { closeSheet(); setViewer(b.dataset.as); devbar(); return; }
    if (b.dataset.jump) { closeSheet(); jump(b.dataset.jump); return; }
    if (b.dataset.notes) { openDrawer(`<div class="scroll"><header><h4>${T.devNotes}</h4><button class="x" data-shut="1">${ico('close')}</button></header><div class="body spec" style="color:var(--ink)">${$('#spec').innerHTML}</div></div>`, true); }
  });
}

/* ---------------- dev: jump to a step, view as a seat ---------------- */
let jumpGen = 0;
async function jump(target) {
  const gen = ++jumpGen;
  G.asks.forEach(a => clearTimeout(a.timer));
  const keep = G ? { me: G.me } : {};
  G = fresh(); G.me = keep.me || 'selin'; U = freshU(); moment(''); scrim(false); $('#fx').innerHTML = ''; closeSheet();
  if (target === 'lobi') { G.lobbyN = 1; render(); devbar(); return; }
  if (target === 'bitti') { devbar(); return gameEnd(); }
  G.step = 'k0'; render();
  const order = ['k0', 'atama', 'tertip', 'acilis', 'kader', 'sonuc', 'hukum'];
  const ti = order.indexOf(target);
  const flush = async () => { while (G.asks.length) answer(G.asks[0], bot(G.asks[0])); await Promise.resolve(); await Promise.resolve(); };
  try {
    G.fast = true;
    if (ti >= 1) await flowCrisis();
    if (gen !== jumpGen) return;
    if (ti >= 2) await flowAnnounce();
    if (ti === 2) { G.fast = false; await flowSleep(); }
    else if (ti >= 3) { await flowSleep(); await flush(); }
    if (gen !== jumpGen) return;
    G.busy = true;
    if (ti === 3) { G.fast = false; await flowWake(); }
    else if (ti >= 4) await flowWake();
    if (ti === 4) { G.fast = false; const pl = await flowKader(); await flowResult(pl); }
    else if (ti === 5) { const pl = await flowKader(); G.fast = false; await flowResult(pl); }
    else if (ti >= 6) { const pl = await flowKader(); await flowResult(pl); G.fast = false; await flowDecree(); }
  } finally { if (gen === jumpGen) { G.fast = false; G.busy = false; render(); devbar(); } }
}
function devbar() {
  const d = $('#devbar'); if (!d) return;
  const views = [['kerem', 'Süleyman'], ['selin', 'Sadık · Selin'], ['mert', 'Hain · Mert']];
  const steps = [['lobi', 'Lobi'], ['k0', 'Kriz'], ['atama', 'Atama'], ['tertip', 'Tertip'], ['acilis', 'Açılış'], ['kader', 'Kader'], ['sonuc', 'Sonuç'], ['hukum', 'Hüküm'], ['bitti', 'Oyun sonu']];
  const size = $('#game').dataset.size === 'max';
  d.innerHTML = `<div class="grp"><span>GÖRÜNÜM</span>${views.map(([id, n]) => `<button class="${G.me === id ? 'on' : ''}" data-dv="${id}"><img src="img/roster-char.${P(id).ch}.jpg" alt="">${n}</button>`).join('')}</div>
    <div class="grp"><span>ADIM</span>${steps.map(([k, n]) => `<button data-dj="${k}">${n}</button>`).join('')}</div>
    <div class="grp"><span>EKRAN</span><button class="${size ? '' : 'on'}" data-ds="pro">852×393</button><button class="${size ? 'on' : ''}" data-ds="max">932×430</button></div>`;
}
function bindDevbar() {
  $('#devbar').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return; audio();
    if (b.dataset.dv) { setViewer(b.dataset.dv); devbar(); }
    if (b.dataset.dj) jump(b.dataset.dj);
    if (b.dataset.ds) { $('#game').dataset.size = b.dataset.ds === 'max' ? 'max' : ''; layout(); render(); devbar(); }
  });
}

/* ---------------- boot ---------------- */
function boot() {
  const coarse = matchMedia('(pointer: coarse)').matches; const small = Math.min(screen.width, screen.height) < 600;
  if ((coarse && small) || location.hash === '#full') document.documentElement.classList.add('full');
  G = null; G = fresh(); G.me = 'selin'; U = freshU(); G.lobbyN = 1;
  bindInput(); bindDevbar();
  layout(); render(); devbar();
  addEventListener('resize', () => { layout(); render(); });
  addEventListener('hashchange', () => { document.documentElement.classList.toggle('full', location.hash === '#full' || (coarse && small)); layout(); render(); });
  addEventListener('unhandledrejection', e => console.error('flow error', e.reason));
  addEventListener('orientationchange', () => setTimeout(() => { layout(); render(); }, 250));
  document.addEventListener('contextmenu', e => { if (e.target.closest('#game')) e.preventDefault(); });
  if (document.fonts) document.fonts.ready.then(() => render());
}
boot();
})();
