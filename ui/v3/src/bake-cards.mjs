// Bakes cards from the art page (art/directions/index.html) to transparent WebP files at 258, 120 and 64 px, 3x.
// Needs two things running first:
//   1. Chrome with a debugging port:  "Google Chrome" --headless=new --remote-debugging-port=9333 --user-data-dir=<tmp dir>
//   2. The art page served over http WITH a utf-8 charset (prepend <!doctype html><meta charset="utf-8"> to a copy;
//      python's http.server sends no charset and the Turkish names break). The URL below expects it at :8766/art/.
// Run: node ui/v3/src/bake-cards.mjs <output dir>. Edit `jobs` to choose cards; `want.S` limits the 64 px set.
import fs from 'node:fs';
const out=process.argv[2];
const base='http://127.0.0.1:9333';
const t=await (await fetch(base+'/json/new?about:blank',{method:'PUT'})).json();
const ws=new WebSocket(t.webSocketDebuggerUrl);
await new Promise(r=>ws.onopen=r);
let id=0;const pend=new Map();
ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&pend.has(m.id)){pend.get(m.id)(m);pend.delete(m.id)}};
const send=(method,params={})=>new Promise(r=>{const i=++id;pend.set(i,r);ws.send(JSON.stringify({id:i,method,params}))});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const ev=async e=>{const r=await send('Runtime.evaluate',{expression:e,awaitPromise:true,returnByValue:true});if(r.result.exceptionDetails)throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0,500));return r.result.result.value};
await send('Emulation.setDeviceMetricsOverride',{width:900,height:900,deviceScaleFactor:3,mobile:false});
await send('Page.enable');await send('Runtime.enable');
await send('Page.navigate',{url:'http://127.0.0.1:8766/art/index.html'});
await sleep(3000);
await send('Emulation.setDefaultBackgroundColorOverride',{color:{r:0,g:0,b:0,a:0}});
// index all 258px cards by name/class
const list=await ev(`(()=>{window.__cs=[...document.querySelectorAll('.c3')].filter(c=>Math.round(c.getBoundingClientRect().width)===258);
 return __cs.map((c,i)=>[i,(c.querySelector('.nm')||{}).textContent||'',c.className])})()`);
const find=(name,cls)=>{const m=list.find(([i,n,c])=>(name?n.trim()===name:true)&&(cls?c.includes(cls):true));if(!m)throw new Error('no card '+name+' '+cls);return m[0]};
await ev(`(()=>{const st=document.createElement('div');st.id='__stage';st.style.cssText='position:fixed;left:0;top:0;width:900px;height:900px;z-index:99999;';
 document.documentElement.style.background='transparent';document.body.style.background='transparent';
 for(const el of [...document.body.children]){ if(el.tagName!=='SCRIPT'&&el.tagName!=='STYLE'&&el.tagName!=='svg'&&el.tagName!=='SVG'){ el.style.visibility='hidden'; } }
 document.body.appendChild(st);})()`);
const jobs=[
 ['intr-iftira','İftira',''],['intr-valide',"Valide'nin Buyruğu",''],['intr-akil','Akıl Hocası',''],['intr-muhur','Mühür',''],['intr-tabib','Saray Tabibi',''],['intr-dedikodu','Saray Dedikodusu',''],
 ['crisis-divan','Divan Kavgası',''],['kader-hizmet','Hizmet',''],['kader-hiyanet','Hıyanet',''],
 ['char-suleyman','Süleyman','sultan'],['char-mahidevran','Mahidevran',''],['char-hurrem','Hürrem',''],['char-rustem','Rüstem',''],['char-hatice','Hatice',''],
 ['kul-bali','Malkoçoğlu',''],['kul-sumbul','Sümbül Ağa',''],['hirs-kulak','Kulak Misafiri',''],['taraf-sadik','Sadık',''],['taraf-hain','Hain',''],
 ['back-intr','','b-intr'],['back-kader','','b-kader'],['back-crisis','','b-crisis'],['back-taraf','','b-taraf'],['back-hirs','','b-hirs'],['back-kul','','b-kul'],['back-char','','b-char'],
];
const sizes={L:258,M:120,S:64};
const want={L:null,M:null,S:['back-intr','back-kader','intr-muhur','intr-akil','intr-tabib','intr-valide','intr-iftira','intr-dedikodu']};
for(const [slug,name,cls] of jobs){
  const idx=find(name,cls);
  for(const [k,w] of Object.entries(sizes)){
    if(want[k]&&!want[k].includes(slug))continue;
    if(k==='L'&&slug.startsWith('back-')&&slug!=='back-taraf'&&slug!=='back-crisis')continue;
    const h=Math.round(w*1.4);
    await ev(`(()=>{const st=document.getElementById('__stage');st.innerHTML='';const b=document.createElement('div');b.style.cssText='position:absolute;left:10px;top:10px;width:${w}px;visibility:visible';
      const c=__cs[${idx}].cloneNode(true);c.style.boxShadow='none';c.style.visibility='visible';b.appendChild(c);st.appendChild(b);
      return Promise.all([...c.querySelectorAll('img')].map(im=>im.decode?im.decode().catch(()=>0):0))})()`);
    await sleep(450);
    const r=await send('Page.captureScreenshot',{format:'webp',quality:88,clip:{x:10,y:10,width:w,height:h,scale:1}});
    fs.writeFileSync(`${out}/${slug}-${k}.webp`,Buffer.from(r.result.data,'base64'));
  }
  console.log(slug);
}
await fetch(base+'/json/close/'+t.id);ws.close();
