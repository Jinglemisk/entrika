// Entrika UI v3: static screen mockups. Each function returns the inside of one 852×393 phone.
// Nothing here is playable; the data below is one frozen moment of crisis 4 (Divan Kavgası).

/* ---------- marks ---------- */
const G = {
  check: '<path d="M4 10.5l4 4 8-9"/>',
  lock: '<rect x="4.5" y="9" width="11" height="8" rx="1.5"/><path d="M7 9V6.5a3 3 0 016 0V9"/>',
  log: '<path d="M5 5h10M5 10h10M5 15h6"/>',
  set: '<path d="M3 6h7M15 6h2M3 14h2M10 14h7"/><circle cx="12.5" cy="6" r="2.2"/><circle cx="7.5" cy="14" r="2.2"/>',
  eye: '<path d="M2 10s3-5 8-5 8 5 8 5-3 5-8 5-8-5-8-5z"/><circle cx="10" cy="10" r="2.2"/>',
  close: '<path d="M5 5l10 10M15 5L5 15"/>',
  hold: '<circle cx="10" cy="10" r="2.6"/><circle cx="10" cy="10" r="7" stroke-dasharray="2.5 3"/>',
  back: '<path d="M16 10H4M9 5l-5 5 5 5"/>',
};
export const gl = (k, cls = '') => `<svg class="gl ${cls}" viewBox="0 0 20 20" aria-hidden="true">${G[k]}</svg>`;
const em = (k, s = 18) => `<img class="em" src="img/ico/${k}.png" alt="" style="width:${s}px;height:${s}px">`;
const starPts = (() => { const p = []; for (let i = 0; i < 16; i++) { const r = i % 2 ? 8.9 : 11.4, a = Math.PI * i / 8 - Math.PI / 2; p.push((12 + r * Math.cos(a)).toFixed(2) + ',' + (12 + r * Math.sin(a)).toFixed(2)); } return p.join(' '); })();
export const star = (n, cls = '', size) => `<span class="star ${n === 0 ? 'zero' : ''} ${cls}"${size ? ` style="width:${size}px;height:${size}px;font-size:${Math.round(size * .52)}px"` : ''}><svg viewBox="0 0 24 24"><polygon points="${starPts}" fill="#d2ab52" stroke="#6b4d0f" stroke-width="1"/></svg><span>${n}</span></span>`;
const card = (slug, size, w, cls = '', style = '') => `<img class="${cls}" src="img/cards/${slug}-${size}.webp" alt="" width="${w}" height="${Math.round(w * 1.4)}" style="width:${w}px;height:${Math.round(w * 1.4)}px;${style}">`;

/* ---------- the table ---------- */
const CUT = { // head centre x, head top y (fractions of the image), image aspect h/w, scale against the niche width
  suleyman: { hx: .455, y0: .03, ar: 4 / 3, w: 1.34 }, hurrem: { hx: .515, y0: .0925, ar: 4 / 3, w: 1.26 },
  ibrahim: { hx: .454, y0: .063, ar: 380 / 300, w: 1.5 }, mahidevran: { hx: .474, y0: .0525, ar: 4 / 3, w: 1.2 },
  hatice: { hx: .483, y0: .042, ar: 380 / 300, w: 1.24 }, mihrimah: { hx: .557, y0: .104, ar: 4 / 3, w: 1.3 },
  rustem: { hx: .523, y0: .069, ar: 4 / 3, w: 1.36 },
};
export const PL = {
  ayse: { n: 'Ayşe', c: 'hatice', cn: 'Hatice', nf: 1, kul: 'daye' },
  elif: { n: 'Elif', c: 'mihrimah', cn: 'Mihrimah', nf: 0, kul: 'nigar', kulDown: true },
  mert: { n: 'Mert', c: 'rustem', cn: 'Rüstem', nf: 2, kul: 'nigar' },
  kerem: { n: 'Kerem', c: 'suleyman', cn: 'Süleyman', sul: true },
  defne: { n: 'Defne', c: 'hurrem', cn: 'Hürrem', nf: 2, kul: 'sumbul' },
  can: { n: 'Can', c: 'ibrahim', cn: 'Pargalı', nf: 1, kul: 'afife' },
  selin: { n: 'Selin', c: 'mahidevran', cn: 'Mahidevran', nf: 1, kul: 'bali' },
  ozan: { n: 'Ozan', c: null, cn: 'Mustafa', nf: 1, kul: 'daye' },
};
// Divan order: the Sultan in the middle, the table running clockwise to his left (our right) and wrapping.
export const ORDER = ['ayse', 'elif', 'mert', 'kerem', 'defne', 'can', 'selin'];
const ARCH = 'M.5 119.5V46C.5 22 30 12 50 .6 70 12 99.5 22 99.5 46v73.5z';

export function figure(c, nw, nh, brk = 9) {
  const k = CUT[c], iw = k.w * nw, ih = iw * k.ar, left = nw / 2 - k.hx * iw, top = -brk - k.y0 * ih;
  const im = `<img src="img/cut/${c}.webp" alt="" style="left:${left.toFixed(1)}px;top:${top.toFixed(1)}px;width:${iw.toFixed(1)}px;height:${ih.toFixed(1)}px">`;
  return `<svg viewBox="0 0 100 120" preserveAspectRatio="none" aria-hidden="true"><path d="${ARCH}"/></svg><div class="fg in">${im}</div><div class="fg out">${im}</div>`;
}
const NOART = '<svg viewBox="0 0 100 120" preserveAspectRatio="none" aria-hidden="true"><path d="' + 'M.5 119.5V46C.5 22 30 12 50 .6 70 12 99.5 22 99.5 46v73.5z' + '"/></svg><svg viewBox="0 0 100 120" class="sil" aria-hidden="true"><circle cx="50" cy="46" r="17"/><path d="M14 120c2-30 16-44 36-44s34 14 36 44z"/></svg>';
export function seat(id, o = {}, geo = {}) {
  const p = PL[id], nw = p.sul ? (geo.nwS || 104) : (geo.nw || 90), nh = p.sul ? (geo.nhS || 124) : (geo.nh || 106);
  const cls = ['st', p.sul && 'sul', o.vk && 'vk', o.band && 'band', o.me && 'you', o.dim && 'dim', o.legal && 'legal', o.pick && 'pick'].filter(Boolean).join(' ');
  const nf = o.nf ?? p.nf;
  return `<div class="${cls}" style="--nw:${nw}px;--nh:${nh}px${o.ground ? `;--g:${o.ground}` : ''}">
    <div class="nc"${o.ground ? ` style="--ground:${o.ground};--edge:${o.edge || 'transparent'}"` : ''}>${p.c ? figure(p.c, nw, nh, p.sul ? 12 : 9) : NOART}
      ${o.vk ? `<span class="of">${o.vk === 1 ? 'Birinci Vekil' : 'İkinci Vekil'}</span>` : ''}${o.band ? `<span class="of" style="background:${o.bandBg}">${o.band}</span>` : ''}
      ${p.sul ? '' : `<span class="nf">${star(nf)}</span>`}
      ${p.sul || o.noKul ? '' : `<span class="kl ${p.kulDown ? 'down' : ''}"><img src="img/kul/${p.kul}.jpg" alt=""></span>`}
      ${o.ready ? `<span class="rd">${gl('check')}</span>` : ''}
      </div>
    <div class="pl"><b>${o.me ? p.n + ' (sen)' : p.n}</b><i>${p.cn}</i></div>
    <div class="ld">${o.ord ? `<span class="ord ${o.ordState || ''}">${o.ord}</span>` : ''}${(o.laid || []).join('')}</div>
  </div>`;
}
export const court = (states = {}, order = ORDER, geo = {}) => `<div class="ct" style="--slot:${geo.slot || 104}px${geo.top != null ? `;top:${geo.top}px` : ''}">${order.map(id => seat(id, states[id] || {}, geo)).join('')}</div>`;
const slots = (n, on, cls = '', neu) => Array.from({ length: n }, (_, i) => `<i class="${i < on ? (i === neu ? 'new' : 'on') : ''} ${cls && i === n - 1 ? cls : ''}"></i>`).join('');
export const mizan = (o = {}) => `<div class="mz">
  <div class="trk h">${em('hizmet', 20)}<span>Hizmet</span><span class="sl">${slots(4, o.h ?? 2)}</span></div>
  <div class="kz"><small>Kriz ${o.k ?? 4}</small><b>${o.name || 'Divan Kavgası'}</b><span class="chipf">${em(o.field || 'divan', 16)}${o.fieldName || 'Divan'}</span></div>
  <div class="r"><div class="trk x"><span class="sl">${slots(5, o.x ?? 1, 'end', o.neu)}</span><span>Hıyanet</span>${em('hiyanet', 20)}</div>
  <div class="nav"><span class="dot">${gl('log')}</span><span>${gl('set')}</span></div></div>
</div>`;
const steps = ['Kriz', 'Atama', 'Tertip', 'Kader', 'Sonuç', 'Hüküm'];
export const stp = (i, label) => `<div class="stp"><span class="tk">${steps.map((_, j) => `<i class="${j < i ? 'done' : j === i ? 'now' : ''}"></i>`).join('')}</span>${label || steps[i]}</div>`;
const meBlock = (o = {}) => `<div class="mine">
  <div class="tf">${card('back-taraf', 'M', 46)}<small>Taraf, Hırs<br>basılı tut</small></div>
  <ul class="pw">
    <li class="${o.baseUsed ? 'used' : ''}"><i class="d"></i><b>İtiraz</b><small>${o.baseUsed ? 'kullanıldı' : 'temel güç, hazır'}</small></li>
    <li class="lock"><i class="d"></i><b>Sürgün</b><small>Hırs'la açılır</small></li>
    <li class="${o.kulUsed ? 'used' : ''}"><i class="d"></i><b>Malkoçoğlu</b><small>${o.kulUsed ? 'bu krizde kullanıldı' : "Mühür'e çevirir"}</small></li>
  </ul></div>`;
const hand = (o = {}) => `<div class="hand">
  <div class="hc ${o.sel === 0 ? 'sel' : ''} ${o.gone === 0 ? 'gone' : ''}">${card('intr-muhur', 'M', 96)}</div>
  <div class="hc ${o.sel === 1 ? 'sel' : ''}">${card('intr-valide', 'M', 96)}</div>
  <div class="hc ${o.allOff ? 'off' : ''}">${card('intr-iftira', 'M', 96)}${o.allOff ? '' : '<span class="via">Harem kartı<b>Malkoçoğlu ile Mühür</b></span>'}</div>
</div>`;
const phone = (inner, th = 'th-split') => `<div class="ph ui ${th}" lang="tr">${inner}<i class="island"></i></div>`;
const table = (states, o = {}) => `<div class="pub zp"><div class="bd">${mizan(o.mz)}${court(states, o.order, o.geo)}</div></div>`;
const shelf = (inner) => `<div class="shelf zl"><div class="bd">${inner}</div><i class="home"></i></div>`;

/* ---------- 1. Tertip: your move, a card lifted, targets lit ---------- */
export function sTertip(th) {
  const st = {
    ayse: { vk: 1, legal: true, ready: true }, elif: { dim: true, ready: true }, mert: { dim: true }, kerem: { dim: true },
    defne: { vk: 2, legal: true, ready: true }, can: { dim: true, ready: true }, selin: { me: true, dim: true },
  };
  return phone(table(st) + shelf(`${meBlock()}${hand({ sel: 1 })}
    <div class="pr">${stp(2, 'Tertip, 1. dalga')}
      <p class="vo"><b>Valide'nin Buyruğu.</b> Bir Vekili değiştirir; yerine geleni sen seçersin.<small>Hedef seç: Ayşe ya da Defne.</small></p>
      <div class="bt"><span class="b">Pas geç</span><span class="b off">Mühürle</span></div></div>`), th);
}
/* ---------- 2. Tertip: sealed, waiting ---------- */
export function sTertipWait() {
  const st = {
    ayse: { vk: 1, ready: true, laid: ['<i class="cb own"></i>'] }, elif: { ready: true }, mert: {}, kerem: {},
    defne: { vk: 2, ready: true }, can: { ready: true }, selin: { me: true, ready: true },
  };
  return phone(table(st) + shelf(`${meBlock()}${hand({ allOff: true, sel: -1 })}
    <div class="pr">${stp(2, 'Tertip, 1. dalga')}
      <p class="vo">Kartın mühürlendi. Açılışa kadar kimse göremez.</p>
      <div class="wait"><span class="dots"><i class="on"></i><i class="on"></i><i class="on"></i><i class="on"></i><i class="on"></i><i></i></span>5/6 hazır. Mert bekleniyor.</div>
      <div class="bt"><span class="b">Kartı geri al</span></div></div>`));
}
/* ---------- 3. Atama: Süleyman's phone ---------- */
export function sAtama() {
  const st = {
    ayse: { vk: 1, pick: true }, elif: { legal: true }, mert: { legal: true }, kerem: { me: true },
    defne: { legal: true }, can: { legal: true }, selin: { legal: true },
  };
  return phone(table(st) + shelf(`
    <div class="mine" style="grid-template-columns:1fr;width:176px"><ul class="pw">
      <li><i class="d"></i><b>Ferman</b><small>Tertip bitince bir Vekili değiştir</small></li>
      <li class="lock"><i class="d"></i><b>Soruşturma</b><small>2. Hıyanet'te açılır</small></li>
      <li class="lock"><i class="d"></i><b>Hazine Defteri</b><small>3. Hıyanet'te açılır</small></li></ul></div>
    <div class="slots">
      <div class="slot on"><i class="rn">I</i><div><small>Birinci Vekil</small><b>Ayşe</b><span>Kader'den üç kart çeker</span></div>${gl('close')}</div>
      <div class="slot"><i class="rn">II</i><div><small>İkinci Vekil</small><b>Bir koltuğa dokun</b><span>İki karttan birini oynar</span></div></div>
    </div>
    <div class="pr" style="left:530px">${stp(1, 'Atama')}
      <p class="vo">İki Vekil ata. Kendini atayamazsın.</p>
      <div class="bt"><span class="b off">Atamayı ilan et <small>1/2</small></span></div></div>`));
}
/* ---------- 4. İtiraz: your turn to object ---------- */
export function sItiraz() {
  const st = {
    ayse: { vk: 1, legal: true, ord: '4' }, elif: { ord: '5' }, mert: { ord: '6' }, kerem: {},
    defne: { vk: 2, legal: true, ord: '1', ordState: 'done' }, can: { ord: '2', ordState: 'done' }, selin: { me: true, ord: '3', ordState: 'now' },
  };
  return phone(table(st) + shelf(`${meBlock()}${hand({})}
    <div class="pr">${stp(1, 'Atama, itirazlar')}
      <p class="vo">İtiraz sırası sende. Bir Vekili değiştirtmek 1 Nüfuz.<small>İtiraz gücün hazır: bedelsiz olur.</small></p>
      <div class="bt"><span class="b">Geç</span><span class="b pri">İtiraz et <small>−1 Nüfuz</small></span></div></div>`));
}
/* ---------- 5. Kriz: the flip (public moment) ---------- */
export function sKriz() {
  return phone(`<div class="full zp"><div class="bd" style="grid-template-columns:236px 1fr;gap:40px;padding:22px 8px 0 26px">
    ${card('crisis-divan', 'L', 236, 'cardL')}
    <div style="display:grid;align-content:start;gap:12px;padding-top:18px">
      <p class="h-step">Kriz 4</p>
      <p class="h-big">Divan Kavgası</p>
      <div class="rule"></div>
      <p class="vo" style="font-size:19px;font-style:normal;display:flex;gap:9px;align-items:center">${em('divan', 26)}<span>Divan krizi. Bu krizde yalnız Divan kartları oynanır.</span></p>
      <p class="vo" style="font-size:19px">Geçen krizin Vekilleri birer Entrika kartı çeker.</p>
      <div class="nm-row"><span class="pill"><img src="img/cut/rustem.webp" alt="">Mert +1 kart</span><span class="pill"><img src="img/cut/hurrem.webp" alt="">Defne +1 kart</span></div>
      <div class="wait" style="margin-top:22px">Kerem atamaya geçecek.</div>
    </div></div><i class="home"></i></div>`);
}
/* ---------- 6. Açılış: the wave flips (public moment) ---------- */
export function sAcilis() {
  const st = { ayse: { vk: 1 }, elif: { dim: true }, mert: {}, kerem: { dim: true }, defne: { vk: 2, dim: true }, can: { dim: true }, selin: { me: true, dim: true } };
  return phone(`<div class="full zp"><div class="bd">${mizan()}${court(st)}
    <div class="rv" style="left:2px">${card('intr-muhur', 'M', 80)}<span class="tg">kriz boyu kalır</span></div>
    <div class="rv void" style="left:98px">${card('intr-valide', 'M', 80)}<span class="tg">boşa gitti</span></div>
    <div class="rv" style="left:223px">${card('intr-akil', 'M', 80)}<span class="tg">kriz boyu kalır</span></div>
    <div class="nar">${stp(2, 'Tertip, 1. dalga açıldı')}
      <p class="vo" style="font-size:19px"><b>Mühür</b> Ayşe'yi koltuğunda tutar. Aynı dalgadaki <b>Valide'nin Buyruğu</b> boşa gider.</p>
      <p class="vo" style="font-size:15px;color:var(--fg2)">Üç kart açıldı. Kimin oynadığı gizli kalır.</p>
      <div class="wait" style="margin-top:auto"><span class="dots"><i class="on"></i><i class="on"></i><i></i></span>Sırada: Mert'in önündeki Akıl Hocası</div></div>
  </div><i class="home"></i></div>`);
}
/* ---------- 7. Kader: the First Minister's pick (private ask) ---------- */
export function sKader() {
  return phone(`<div class="full zl"><div class="bd" style="grid-template-columns:232px 1fr;gap:26px;padding:26px 0 0 4px">
    <div style="display:grid;align-content:start;gap:11px">
      ${stp(3, 'Kader')}
      <p class="h-mid">Birini at, ikisini Defne'ye gönder.</p>
      <p class="vo" style="font-size:15px">Sadıksın: elinde Hıyanet varken Hizmet'i atamazsın.</p>
      <p class="vo" style="font-size:15px;color:var(--fg2)">Bu adımda kimse konuşmaz.</p>
      <div class="bt" style="justify-content:flex-start;margin-top:14px"><span class="b pri">İkisini gönder</span></div>
    </div>
    <div class="kd">
      <div class="k lockd">${card('kader-hizmet', 'L', 150, 'cardL')}<span class="kt">${gl('lock')}Atılamaz</span></div>
      <div class="k">${card('kader-hiyanet', 'L', 150, 'cardL')}<span class="kt go">Gidecek</span></div>
      <div class="k toss">${card('kader-hiyanet', 'L', 150, 'cardL')}<span class="kt out">Atılacak</span></div>
    </div></div><i class="home"></i></div>`);
}
/* ---------- 8. Sonuç: Hıyanet lands (public moment) ---------- */
export function sSonuc() {
  const big = (n, on, neu) => Array.from({ length: n }, (_, i) => `<i class="${i < on ? 'on' : ''} ${i === neu ? 'new' : ''} ${n === 5 && i === 4 ? 'end' : ''}">${n === 5 && i > 0 && i >= on ? ['', 'S', 'H', 'F', '☠'][i] ? '' : '' : ''}</i>`).join('');
  return phone(`<div class="full zp"><div class="bd" style="grid-template-columns:212px 1fr;gap:38px;padding:24px 4px 0 30px">
    ${card('kader-hiyanet', 'L', 212, 'cardL')}
    <div style="display:grid;align-content:start;gap:10px;padding-top:6px">
      <p class="h-step">Sonuç, kriz 4</p>
      <p class="h-big" style="color:var(--s-al)">Hıyanet</p>
      <p class="vo" style="font-size:16px">Ayşe üç kart çekti, Defne birini oynadı.</p>
      <div class="bigtrk">
        <div class="row h"><span>Hizmet</span><span class="bs">${big(4, 2)}</span><small>2/4</small></div>
        <div class="row x"><span>Hıyanet</span><span class="bs">${big(5, 2, 1)}</span><small>2/5</small></div>
      </div>
      <div class="rule"></div>
      <p class="vo" style="font-size:16px;font-style:normal"><b>Soruşturma açıldı.</b> Süleyman bir müfettiş seçer; müfettiş bir oyuncunun Tarafına gizlice bakar.</p>
      <div class="wait">Kerem müfettişi seçiyor.</div>
    </div></div><i class="home"></i></div>`);
}
/* ---------- 9. Hüküm: Süleyman's decree ---------- */
export function sHukum() {
  const big = (id, role, on) => { const p = PL[id]; return `<div class="st vk ${on ? 'pick' : ''}" style="--nw:150px;--nh:182px;width:176px;height:250px"><div class="nc" style="bottom:52px">${figure(p.c, 150, 182, 12)}<span class="of">${role}</span>${on ? `<span class="nf" style="left:auto;right:-16px;bottom:auto;top:34px">${star(1, '', 40).replace('>1<', '>−1<')}</span>` : ''}</div><div class="pl" style="bottom:10px"><b style="font-size:16px">${p.n}</b><i>${p.cn}, ${p.nf} Nüfuz</i></div></div>`; };
  return phone(`<div class="full zp"><div class="bd" style="grid-template-columns:296px 1fr;gap:10px;padding:30px 0 0 14px">
    <div style="display:grid;align-content:start;gap:11px">
      <img src="img/tugra.svg" alt="" style="width:92px;opacity:.82">
      <p class="h-step">Hüküm</p>
      <p class="h-mid">Bir Vekilden 1 Nüfuz al.</p>
      <p class="vo" style="font-size:15px">Hıyanet oynandı. Kaybeden bir Entrika kartı çeker.</p>
      <div class="bt" style="justify-content:flex-start;margin-top:12px"><span class="b pri">Hükmü mühürle</span></div>
    </div>
    <div style="display:flex;gap:26px;justify-content:center;align-items:flex-start;padding-top:36px">${big('ayse', 'Birinci Vekil')}${big('defne', 'İkinci Vekil', true)}</div>
  </div><i class="home"></i></div>`);
}
/* ---------- 10. Secrets: press and hold ---------- */
export function sSir() {
  return phone(`<div class="full zl"><div class="bd" style="grid-template-columns:1fr auto auto;gap:22px;padding:26px 16px 0 4px;align-items:start">
    <div style="display:grid;align-content:start;gap:11px;padding-top:8px">
      <p class="h-step" style="display:flex;gap:6px;align-items:center">${gl('eye')}Yalnız sen görürsün</p>
      <p class="h-mid">Sadıksın.</p>
      <p class="vo" style="font-size:17px">«Mustafa'yı ancak Sultan'ın sevgisi korur.»</p>
      <p class="vo" style="font-size:15px;font-style:normal"><b>Hırsın: Kulak Misafiri.</b> Saray Dedikodusu, Mühürlü Evrak ya da Teftiş kullan; Sürgün gücün açılır.</p>
      <p class="wait" style="margin:10px 0 0">${gl('hold')}Parmağını kaldırınca kapanır.</p>
    </div>
    ${card('taraf-sadik', 'L', 194, 'cardL')}${card('hirs-kulak', 'L', 194, 'cardL')}
  </div><i class="home"></i></div>`);
}
/* ---------- 11. Seat sheet: long-press a seat ---------- */
export function sKoltuk() {
  return phone(`<div class="full zp"><div class="bd" style="grid-template-columns:214px 1fr;gap:26px;padding:20px 0 0 12px">
    ${card('char-rustem', 'L', 214, 'cardL')}
    <div style="display:grid;align-content:start;gap:9px;padding-top:4px;position:relative">
      <span style="position:absolute;right:0;top:0;width:44px;height:44px;display:grid;place-items:center;color:var(--fg2)">${gl('close')}</span>
      <p class="h-mid">Mert</p>
      <div class="nm-row"><span class="pill plain">Rüstem</span><span class="pill" style="padding-left:2px">${star(2, '', 20)}2 Nüfuz</span><span class="pill"><img src="img/kul/nigar.jpg" alt="">Nigar Kalfa</span><span class="pill plain">Elinde 2 kart</span></div>
      <ul class="pw" style="margin-top:2px;max-width:420px">
        <li class="used"><i class="d"></i><b>Kulis</b><small>kriz 2'de kullandı: Süleyman'la bir dakika özel konuştu</small></li>
        <li class="lock"><i class="d"></i><b>Yön Değiştir</b><small>Hırsını tamamlarsa açılır</small></li>
        <li><i class="d"></i><b>Nigar Kalfa</b><small>bir kartı Mühürlü Evrak yapar, bu krizde hazır</small></li>
      </ul>
      <p class="wait" style="margin:2px 0 0;color:var(--fg)">Bu krizde önünde: <span class="tg">Akıl Hocası</span></p>
      <div class="priv zl"><small>${gl('eye')}Yalnız sen görürsün</small><span class="b on2">Şüpheli</span><span class="b">Güvenilir</span></div>
    </div></div><i class="home"></i></div>`);
}
/* ---------- 12. Sicil: the record ---------- */
export function sSicil() {
  const hd = (id) => `<span class="pill"><img src="img/cut/${PL[id].c}.webp" alt="">${PL[id].n}</span>`;
  const row = (n, name, f, a, b, res, huk, note) => `<tr><td class="n">${n}</td><td><b>${name}</b><span class="f">${em(f, 15)}</span></td><td>${hd(a)}<svg class="gl ar" viewBox="0 0 20 20"><path d="M7 4l6 6-6 6"/></svg>${hd(b)}</td><td>${res ? `<span class="res ${res}">${res === 'h' ? 'Hizmet' : 'Hıyanet'}</span>` : '<span class="res">sürüyor</span>'}</td><td>${huk || ''}</td><td class="nt">${note || ''}</td></tr>`;
  return phone(`<div class="full zp"><div class="bd" style="padding:14px 4px 0 8px;display:block">
    <div style="display:flex;align-items:center;gap:14px;height:40px">
      <p class="h-mid" style="font-size:24px">Sicil</p>
      <span class="tabs"><b>Krizler</b><span>Bütün olaylar</span></span>
      <span style="margin-left:auto;width:44px;height:44px;display:grid;place-items:center;color:var(--fg2)">${gl('close')}</span></div>
    <table class="sc"><thead><tr><th></th><th>Kriz</th><th>Birinci › İkinci Vekil</th><th>Kader</th><th>Hüküm</th><th>Olanlar</th></tr></thead><tbody>
      ${row(1, "İstanbul'da Dedikodu", 'harem', 'can', 'defne', 'h', 'Defne +1', '')}
      ${row(2, 'Macar Seferi', 'divan', 'ayse', 'mert', 'x', 'Ayşe −1', "Elif itiraz etti: Can yerine Mert. Mert Kulis'i kullandı.")}
      ${row(3, 'Kaybolan Mühür', 'harem', 'mert', 'defne', 'h', 'Mert +1', 'Ayşe +1 (Gözde\'nin Hediyesi).')}
      ${row(4, 'Divan Kavgası', 'divan', 'ayse', 'defne', '', '', '1. dalga: üç kart. Mühür Ayşe\'de kaldı.')}
    </tbody></table>
  </div><i class="home"></i></div>`);
}
/* ---------- 13. Lobby ---------- */
export function sLobi() {
  const names = ['Kerem', 'Defne', 'Can', 'Selin', 'Ayşe', 'Elif', 'Mert'];
  const fr = [['hatice', 84, 0], ['mihrimah', 88, 66], ['rustem', 98, 132], ['suleyman', 116, 206], ['hurrem', 94, 306], ['ibrahim', 88, 378], ['mahidevran', 90, 444]];
  return phone(`<div class="full zp">
    <div class="frieze">${fr.map(([c, w, x]) => { const k = CUT[c]; return `<img src="img/cut/${c}.webp" alt="" style="left:${x}px;width:${w * 1.5}px;height:${w * 1.5 * k.ar}px;bottom:${-w * 1.5 * k.ar * .3}px">`; }).join('')}</div>
    <div class="bd" style="display:block">
    <div style="position:absolute;left:10px;top:26px;display:grid;gap:4px">
      <b style="font:800 62px/1 var(--f-card);letter-spacing:.03em">Entrika</b>
      <p class="vo" style="font-size:19px">Sarayda bir hain var.</p></div>
    <div style="position:absolute;right:6px;top:22px;width:316px;display:grid;gap:9px;justify-items:end;text-align:right">
      <p class="h-step">Oda kodu</p>
      <div class="code"><i>4</i><i>7</i><i>1</i><i>2</i></div>
      <div class="nm-row" style="justify-content:flex-end;max-width:316px">${names.map((n, i) => `<span class="pill plain">${n}${i === 0 ? ', kurucu' : ''}</span>`).join('')}</div>
      <p class="wait" style="margin:0">7 oyuncu masada. 5 ile 8 arası oynanır.</p>
      <div class="bt"><span class="b">Kodu paylaş</span><span class="b pri">Oyunu başlat</span></div>
    </div></div><i class="home"></i></div>`);
}
/* ---------- 14. Game end ---------- */
export function sSon() {
  const side = { ayse: 's', elif: 's', mert: 'x', defne: 'x', can: 's', selin: 's' };
  const nf = { ayse: 1, elif: 0, mert: 3, defne: 2, can: 2, selin: 1 };
  const st = {}; for (const id of ORDER) st[id] = id === 'kerem' ? { dim: true } : { nf: nf[id], band: side[id] === 'x' ? 'Hain' : 'Sadık', bandBg: side[id] === 'x' ? 'var(--al)' : 'var(--mal)', dim: side[id] !== 'x', noKul: true };
  st.mert.ground = 'var(--gold)'; st.mert.edge = '#7a5a14'; st.selin.me = true;
  return phone(`<div class="full zp"><div class="bd" style="display:block">
    <div style="position:absolute;left:8px;top:20px;display:grid;gap:5px">
      <p class="h-step">Oyun bitti, kriz 9</p>
      <p class="h-big" style="color:var(--s-al)">Hainler kazandı</p>
      <p class="vo" style="font-size:17px">Beşinci Hıyanet oynandı. Süleyman öldü.</p></div>
    <div style="position:absolute;right:4px;top:26px;display:grid;gap:8px;justify-items:end">
      <div class="trk h">${em('hizmet', 20)}<span>Hizmet</span><span class="sl">${slots(4, 3)}</span><small>3/4</small></div>
      <div class="trk x">${em('hiyanet', 20)}<span>Hıyanet</span><span class="sl">${slots(5, 5)}</span><small>5/5</small></div></div>
    ${court(st, ORDER, { top: 132 })}
    <div style="position:absolute;left:8px;right:4px;top:324px;display:flex;align-items:center;gap:10px">
      <p class="vo" style="font-size:16px;font-style:normal;margin-right:auto"><b>Galip: Mert.</b> Kazanan tarafta en çok Nüfuz onda.</p>
      <span class="b">Sicile bak</span><span class="b pri">Yeni oyun</span></div>
  </div><i class="home"></i></div>`);
}
/* ---------- 15. Card detail: long-press a card ---------- */
export function sKart() {
  return phone(`<div class="full zl"><div class="bd" style="grid-template-columns:254px 1fr;gap:30px;padding:9px 0 0 22px">
    ${card('intr-valide', 'L', 254, 'cardL')}
    <div style="display:grid;align-content:start;gap:10px;padding-top:22px;position:relative">
      <span style="position:absolute;right:0;top:6px;width:44px;height:44px;display:grid;place-items:center;color:var(--fg2)">${gl('close')}</span>
      <p class="h-step" style="display:flex;gap:6px;align-items:center">${em('divan', 18)}Entrika kartı, Divan</p>
      <p class="h-mid">Valide'nin Buyruğu</p>
      <p class="vo" style="font-size:18px;font-style:normal;max-width:400px">Bir Vekile koy. Onu uygun bir oyuncuyla değiştir; kendini de seçebilirsin. Yeni oyuncu aynı koltuğa oturur.</p>
      <div class="rule" style="max-width:400px"></div>
      <p class="vo" style="font-size:15px;max-width:400px">Bu krizde oynanabilir. Koltuğunu kaybeden Vekil bir kart çeker.</p>
      <div class="bt" style="justify-content:flex-start;margin-top:10px"><span class="b pri">Bu kartı seç</span></div>
    </div></div><i class="home"></i></div>`);
}

/* ---------- loose component specimens (not in a phone) ---------- */
export const specSeats = () => {
  const one = (id, o, cap) => `<figure class="spc"><div class="ct" style="position:relative;top:0;height:188px;--slot:112px;padding-top:8px">${seat(id, o)}</div><figcaption>${cap}</figcaption></figure>`;
  return [
    one('can', {}, 'Courtier. Nüfuz star left, Kul right.'),
    one('ayse', { vk: 1 }, 'Vekil: lapis ground and band.'),
    one('kerem', {}, 'Süleyman: gold ground, 14 px taller.'),
    one('selin', { me: true }, 'You: inverted name plate.'),
    one('defne', { ready: true, laid: ['<i class="cb"></i>', '<i class="cb"></i>'] }, 'Ready seal; two cards laid on her.'),
    one('mert', { legal: true }, 'Legal target: gold edge and bar.'),
    one('elif', { laid: ['<span class="tg">Mühür</span>'] }, '0 Nüfuz: grey star, Kul face down. A lasting card is a name tag.'),
    one('can', { dim: true }, 'Not a legal target: 34% and grey.'),
  ].join('');
};
export const specHand = () => `<div class="hand" style="position:relative;left:0;top:0;padding:26px 8px 8px">
  <div class="hc">${card('intr-muhur', 'M', 96)}</div><div class="hc sel">${card('intr-valide', 'M', 96)}</div>
  <div class="hc">${card('intr-iftira', 'M', 96)}<span class="via">Harem kartı<b>Malkoçoğlu ile Mühür</b></span></div>
  <div class="hc off">${card('intr-dedikodu', 'M', 96)}<span class="why">${gl('lock')}Harem kartı.<br>Bu kriz Divan.</span></div></div>`;

/* ---------- proof: eight seats ---------- */
export function sSekiz() {
  const st = { ayse: { vk: 1 }, defne: { vk: 2 }, selin: { me: true } };
  return phone(table(st, { order: ['ozan', 'ayse', 'elif', 'mert', 'kerem', 'defne', 'can', 'selin'], geo: { slot: 91, nw: 78, nh: 94, nwS: 92, nhS: 110 } }) + shelf(`${meBlock()}${hand({})}
    <div class="pr">${stp(2, 'Tertip, 1. dalga')}<p class="vo">Bir kart oyna ya da pas geç.<small>Divan krizi: iki kartın oynanabilir.</small></p>
      <div class="bt"><span class="b">Pas geç</span><span class="b off">Mühürle</span></div></div>`));
}
/* ---------- layout wireframes ---------- */
const reach = '<svg class="reach" viewBox="0 0 852 393" aria-hidden="true"><circle cx="20" cy="400" r="235"/><circle cx="832" cy="400" r="235"/></svg>';
const bx = (x, y, w, h, t = '', c = '') => `<i class="x ${c}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px">${t}</i>`;
export function wfArc() {
  let seats = ''; for (let i = 0; i < 7; i++) { const a = (197 + i * 24.3) * Math.PI / 180, x = 426 + 330 * Math.cos(a), y = 212 + 178 * Math.sin(a); seats += bx(x - 28, y - 28, 56, 56, '', 'r f'); }
  return `<div class="ph wf">${reach}${seats}${bx(207, 114, 438, 150, '', '')}${bx(223, 126, 80, 112, 'Kriz', 'f')}${bx(313, 136, 212, 42, 'Hizmet', '')}${bx(313, 198, 212, 42, 'Hıyanet', '')}${bx(531, 130, 104, 54, 'Vekil I', 'f')}${bx(531, 193, 104, 54, 'Vekil II', 'f')}
    ${bx(59, 284, 72, 72, 'Sen', 'r')}${bx(181, 298, 132, 44, 'Güçler', '')}${bx(343, 282, 84, 118, '', 'f')}${bx(413, 282, 84, 118, 'El', 'f')}${bx(483, 282, 84, 118, '', 'f')}${bx(650, 256, 110, 44, 'Pas geç', '')}${bx(600, 310, 190, 60, 'Mühürle', 'f')}${bx(63, 5, 200, 38, 'Adım', '')}</div>`;
}
export function wfRow() {
  let seats = ''; for (let i = 0; i < 7; i++) seats += bx(59 + 3 + i * 104 + 7, i === 3 ? 62 : 80, 90, i === 3 ? 124 : 106, '', 'a f');
  return `<div class="ph wf">${reach}${bx(59, 9, 150, 30, 'Hizmet', '')}${bx(300, 9, 252, 30, 'Kriz', '')}${bx(570, 9, 160, 30, 'Hıyanet', '')}${seats}${bx(0, 230, 852, 163, '', 'shelfx')}
    ${bx(59, 244, 172, 112, 'Taraf, güçler', '')}${bx(247, 236, 96, 134, '', 'f')}${bx(352, 236, 96, 134, 'El', 'f')}${bx(457, 236, 96, 134, '', 'f')}${bx(565, 243, 228, 60, 'Tek cümle', '')}${bx(595, 312, 88, 46, 'Pas geç', '')}${bx(691, 312, 102, 46, 'Mühürle', 'f')}</div>`;
}
export function wfRails() {
  let l = '', r = ''; for (let i = 0; i < 4; i++) l += bx(59, 12 + i * 58, 168, 50, '', 'f'); for (let i = 0; i < 3; i++) r += bx(625, 12 + i * 58, 168, 50, '', 'f');
  return `<div class="ph wf">${reach}${l}${r}${bx(243, 12, 96, 134, 'Kriz', 'f')}${bx(351, 12, 258, 40, 'Hizmet', '')}${bx(351, 60, 258, 40, 'Hıyanet', '')}${bx(351, 108, 258, 38, 'Tek cümle', '')}
    ${bx(273, 236, 96, 134, '', 'f')}${bx(378, 236, 96, 134, 'El', 'f')}${bx(483, 236, 96, 134, '', 'f')}${bx(59, 252, 168, 104, 'Taraf, güçler', '')}${bx(625, 196, 168, 60, 'Pas geç', '')}${bx(625, 266, 168, 90, 'Mühürle', 'f')}</div>`;
}
