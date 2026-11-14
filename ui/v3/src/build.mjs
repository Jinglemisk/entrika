// Builds ui/v3/index.html from ui.css, doc.css and the screen templates. Run: node ui/v3/src/build.mjs
import fs from 'node:fs';
import * as S from './screens.mjs';
const here = new URL('.', import.meta.url);
const read = f => fs.readFileSync(new URL(f, here), 'utf8');
const fr = (html, cls = '') => `<div class="fr ${cls}">${html}</div>`;
const fig = (html, cap) => `<figure>${fr(html)}<figcaption>${cap}</figcaption></figure>`;
const pub = '<span class="tag-pub">herkes görür</span>', prv = '<span class="tag-prv">yalnız sen</span>';
const sw = (hex, name, role, v) => `<div><i style="background:${hex}"></i><b>${name}</b><span>${role}</span><code>--${v} ${hex}</code></div>`;
const em = k => `<img src="img/ico/${k}.png" alt="" style="width:var(--z);height:var(--z)">`;

const body = `
<header>
  <p class="note">Entrika, game screen, third pass. A design system to build from. Nothing on this page is playable.</p>
  <h1>The court on paper, your hand in the dark</h1>
  <p class="lede">v2 looks cheap because its interface is as ornate as its cards: gold bevels on every seat, button and label. v3 makes the cards the only ornate objects, replaces the 56 px medallions with the cast standing in a row, and gives every surface a meaning: paper is public, lacquer is yours alone.</p>
  <figure>${fr(S.sTertip('th-split'), 'wide')}
    <figcaption><b>Tertip, your move, at 852×393.</b> Selin has lifted Valide'nin Buyruğu. The two Vekils are the legal targets and stay in colour; everyone else recedes. One sentence says what the card does; two buttons answer it.</figcaption></figure>
  <ul class="toc"><li><a href="#teshis">What is wrong with v2</a></li><li><a href="#tur">What the genre needs</a></li><li><a href="#ilkeler">Rules of the system</a></li><li><a href="#secenekler">Options</a></li><li><a href="#sistem">Tokens and components</a></li><li><a href="#ekranlar">Every screen</a></li><li><a href="#yapim">Build notes</a></li><li><a href="#kararlar">Decisions for Jingle</a></li></ul>
</header>

<section id="teshis">
  <h2>What is wrong with v2</h2>
  <p>Both of your complaints are right, and they have the same cause. v2 copied the cards' vocabulary (gold rim, enamel, cartouche) onto every control. Drawn in CSS at 20 to 60 px, that vocabulary turns into the house style of free-to-play palace sims such as Game of Sultans, which is why it reads as a knock-off.</p>
  <figure class="shot"><img src="img/v2/tertip-selin.jpg" alt="The v2 Tertip screen" width="1704" height="786">
    <span class="pin" style="left:41%;top:14%">1</span><span class="pin" style="left:88%;top:62%">2</span><span class="pin" style="left:24%;top:58%">3</span>
    <span class="pin" style="left:14%;top:30%">4</span><span class="pin" style="left:47%;top:43%">5</span><span class="pin" style="left:50%;top:92%">6</span>
    <span class="pin" style="left:28%;top:79%">7</span><span class="pin" style="left:17%;top:15%">8</span><span class="pin" style="left:90%;top:86%">9</span></figure>
  <ol class="find">
    <li><span><b>Gold on everything.</b> Seats, coins, tray, plaques, buttons and labels share one bevelled gold gradient. The cards no longer stand out from the furniture.</span></li>
    <li><span><b>Eleven container shapes.</b> Scalloped medallion, scrolled cartouche, hexagonal plaque, wax seal, arrow ribbon, paper slip, niche, star coin, round boss, shield tab, lozenge name tag. None of them means anything.</span></li>
    <li><span><b>Five saturated fields at once.</b> Red carpet, green tray, blue plaques, ivory labels and gold all compete at full strength.</span></li>
    <li><span><b>Faces at 40 px.</b> The show's stills are the best asset in the project. Here each is cropped into a 56 px disc with up to four badges hanging off its rim.</span></li>
    <li><span><b>The score is the smallest thing.</b> The two tracks decide the game and are drawn as 30×42 px niches inside a tray that also holds the Crisis, the deck and both Vekils.</span></li>
    <li><span><b>The hand is cropped.</b> Card names and text sit below the screen edge, so you recognise your three cards by the top of a photo.</span></li>
    <li><span><b>Powers are unlabelled pips.</b> Three round icons with no words. You can't tell which is used or what any of them does.</span></li>
    <li><span><b>One small-caps serif does every job</b>, from 8 px labels to titles, with a shadow under it. The step line runs into Elif's seat.</span></li>
    <li><span><b>Materials faked in CSS.</b> Wax, lacquer and scroll rollers need a painter. Drawn with gradients they are the low-effort signal you noticed.</span></li>
  </ol>
</section>

<section id="tur">
  <h2>Is v2 the best this genre can do? No</h2>
  <p>Entrika is a talking game. Players look at each other, or at the call, and glance at the phone. The screen has to answer five questions in one glance, in this order: is it my move, what is the score, who holds the two seats, who is ready, what can I play. v2 answers the first in 10.5 px text and the second in the smallest element on screen.</p>
  <p>It is also a two-thumb landscape screen. Thumbs rest on the bottom corners; the top centre is a stretch. Apple's guideline for a touch target is 44 pt and Android's is 48 dp. So decisions belong at the bottom right, reading belongs in the middle, and anything in the top row must be a large tap target, never a drag.</p>
  <h3>What phone games do well, and what v3 takes</h3>
  <div class="tbl"><table class="t">
    <thead><tr><th>Game</th><th>What it does on a phone</th><th>Taken into v3</th></tr></thead><tbody>
    <tr><td>Marvel Snap</td><td>Cards are the only detailed objects; the board and chrome are flat and dark. One End Turn button, bottom right. Its designers treat on-card text complexity as a budget (<a href="https://www.gdcvault.com/play/1029024/Designing-MARVEL-SNAP">GDC 2023 talk</a>).</td><td>Quiet chrome. One primary button in the right thumb zone.</td></tr>
    <tr><td>Balatro (mobile)</td><td>The port reworked the UI around drag and drop with very large drop zones; reviewers still found text small on standard iPhones (<a href="https://www.engadget.com/gaming/balatro-is-an-almost-perfect-mobile-port-163050971.html">Engadget</a>).</td><td>Seat targets of 104×180 px. No text under 11 px.</td></tr>
    <tr><td>Pokémon TCG Pocket</td><td>Presentation is the product: a tapped card fills the screen, and card text is short enough to parse on a phone (<a href="https://www.nintendolife.com/reviews/mobile/pokemon-trading-card-game-pocket">Nintendo Life</a>).</td><td>Card detail at 254 px with the rule restated beside it in interface type.</td></tr>
    <tr><td>Among Us, meeting screen</td><td>Player tiles in rows. Tap a tile, then confirm. An "I voted" mark appears without saying for whom.</td><td>Tap a card, tap a seat, then seal. The red ready seal.</td></tr>
    <tr><td>Triple Agent</td><td>A hidden-role party game where the device runs the session: one instruction at a time, no rulebook (<a href="https://apps.apple.com/app/triple-agent/id1247445624">App Store</a>).</td><td>The prompt: one sentence and at most two buttons, always in the same place.</td></tr>
    <tr><td>Jackbox games, Sunderfolk</td><td>The phone is a private controller while attention is elsewhere.</td><td>The public and private halves of the screen.</td></tr>
    <tr><td>Secret Hitler (secrethitler.io and the box)</td><td>The tracks are the board. The physical game looks expensive with three flat colours and heavy type.</td><td>Tracks always on screen. Flat colour, no bevels.</td></tr>
    <tr><td>Reverse: 1999, Arknights</td><td>Landscape phone interfaces that read as premium through type, thin rules and flat fields.</td><td>Hierarchy from type and spacing, not from frames.</td></tr>
    <tr><td>Hearthstone, Legends of Runeterra (mobile)</td><td>Fanned hand that lifts on touch; a turn banner that sweeps the board.</td><td>The banner becomes the full-screen public moments. The fan is dropped: the hand limit is 3, so whole cards fit.</td></tr>
    <tr><td>Reigns</td><td>One decision per screen.</td><td>Private decisions (Kader, peeks, secrets) take the whole screen.</td></tr>
    <tr><td>Game of Sultans and its clones</td><td>Bevelled gold on every control.</td><td>Nothing. This is the look v2 drifted into.</td></tr>
  </tbody></table></div>
  <p class="note">Linked rows were checked against the linked source this session. The others are described from the shipped games; this page can't embed outside screenshots.</p>
  <h3>v2 against v3, measured on the same screen</h3>
  <div class="tbl"><table class="t">
    <thead><tr><th></th><th>v2</th><th>v3</th></tr></thead><tbody>
    <tr><td>Smallest text</td><td class="num">8 px</td><td class="num good">11 px</td></tr>
    <tr><td>A seat</td><td>56 px disc, 40 px of photo</td><td class="good">90×106 px figure, head and shoulders</td></tr>
    <tr><td>Seat tap target</td><td class="num">68×68 px</td><td class="num good">104×180 px</td></tr>
    <tr><td>A hand card</td><td>84 px, name and text off-screen</td><td class="good">96 px, whole card with its name bar</td></tr>
    <tr><td>Container shapes</td><td class="num">11</td><td class="good">4: arch for people, rectangle for documents, circle for a seal, star for Nüfuz</td></tr>
    <tr><td>Colour fields at rest</td><td>red, green, blue, ivory, gold, black</td><td class="good">paper and lacquer, plus four signals</td></tr>
    <tr><td>Commit and decline</td><td>wax seal with ribbon, lacquer plaque, paper slip</td><td class="good">one button in two weights</td></tr>
    <tr><td>Your powers</td><td>three unlabelled 28 px pips</td><td class="good">a named list with each power's state</td></tr>
    <tr><td>Who served, what happened</td><td>a text log in a drawer</td><td class="good">Sicil: one row per crisis</td></tr>
  </tbody></table></div>
</section>

<section id="ilkeler">
  <h2>Rules of the system</h2>
  <ul class="rules">
    <li><b>Public is paper, private is lacquer.</b>Whatever the whole table sees is drawn on paper: the court, the tracks, reveals, the Decree. Whatever only you see is on dark lacquer: your hand, your Taraf, the Kader cards, a peek. A hidden-role game needs this distinction constantly, so the surface carries it.</li>
    <li><b>Cards are the only ornate objects.</b>The card frames keep their gold, enamel and gems. Nothing else on screen has a bevel, a glow or a gradient you can see.</li>
    <li><b>The cast is the court.</b>Each player is their Character's cut-out in an arched niche, the way a miniature sets a figure on a flat ground. Süleyman sits in the middle on gold.</li>
    <li><b>One meaning per colour.</b>Gold: you can act here, and the Sultan. Lapis: office, the two Vekils. Red: Hıyanet, Hain, a sealed commitment. Malachite: Hizmet, Sadık.</li>
    <li><b>One sentence, two buttons.</b>Every decision arrives in the same block at the bottom right: the step, one sentence in the game's voice, at most two buttons.</li>
    <li><b>Three voices in type.</b>Sans for the interface. Italic serif when the game speaks. Small caps only on card objects.</li>
  </ul>
</section>

<section id="secenekler">
  <h2>Options</h2>
  <h3>Surface: three directions on the same screen</h3>
  <div class="seg" role="group" aria-label="Surface direction"><button id="th-split" aria-pressed="true" data-th="th-split">Kâğıt ve lake</button><button id="th-paper" aria-pressed="false" data-th="th-paper">Murakka, all paper</button><button id="th-lake" aria-pressed="false" data-th="th-lake">Lake, all dark</button></div>
  <figure id="thfig">${fr(S.sTertip('th-split'), 'wide')}</figure>
  <div class="opt">
    <div><b class="rec">Kâğıt ve lake (recommended)</b>Paper court over a lacquer shelf. The split says what is public and what is yours without a label. Cards sit on the dark half, where their gold reads best.</div>
    <div><b>Murakka</b>Everything on paper, like an album page. Calmest and closest to art direction B. Loses the public and private distinction, and three ivory Entrika cards on a tan shelf have less contrast.</div>
    <div><b>Lake</b>Everything on lapis-black. Best for the stills, kindest in a dark room. It is the nearest to v2, and near-black with gold is the commonest look in the genre.</div>
  </div>
  <h3>Layout: where the table goes</h3>
  <div class="grid3">
    <figure>${fr(S.wfArc())}<figcaption><b>Masa (v2).</b> Seats on an arc, a tray in the middle. The arc leaves the corners empty and pushes the centre into a 438×150 box.</figcaption></figure>
    <figure>${fr(S.wfRow())}<figcaption><b>Divan (recommended).</b> One row of figures, Sultan centred. Tracks become one line. The bottom 40% is yours.</figcaption></figure>
    <figure>${fr(S.wfRails())}<figcaption><b>Kanatlar.</b> Seats as two side columns under the thumbs. Best reach, but seats shrink to 168×50 rows and the order bends into a U.</figcaption></figure>
  </div>
  <p class="note">Shaded quarter-circles: comfortable thumb reach in a two-handed hold, drawn at 235 px from each bottom corner.</p>
  <div class="tbl"><table class="t">
    <thead><tr><th></th><th>Masa</th><th>Divan</th><th>Kanatlar</th></tr></thead><tbody>
    <tr><td>Seat size at 7 players</td><td>56 px disc</td><td class="good">90×106 figure</td><td>168×50 row, 40 px face</td></tr>
    <tr><td>Seat order reads as</td><td>a table, rotated on each phone</td><td class="good">one line, identical on every phone</td><td>a U, split across the screen</td></tr>
    <tr><td>"Beside Süleyman", "clockwise from his left"</td><td>depends on where he falls</td><td class="good">literally beside him; rightwards, then wraps</td><td>unclear across two columns</td></tr>
    <tr><td>Primary action</td><td>in reach</td><td class="good">in reach</td><td>in reach</td></tr>
    <tr><td>Targeting a seat</td><td>drag or tap across the screen</td><td>tap card, tap seat; far but 104 px wide</td><td class="good">under the thumbs</td></tr>
    <tr><td>Hand</td><td>84 px, cropped</td><td class="good">96 px, whole</td><td>96 px, whole, centre is out of reach</td></tr>
    <tr><td>Fits 8</td><td>yes, at 56 px</td><td>yes, 78×94 figures</td><td>yes, 4 and 4</td></tr>
  </tbody></table></div>
  <figure>${fr(S.sSekiz(), 'wide')}<figcaption><b>Divan with eight seats.</b> Slots drop from 104 to 91 px. Ozan plays Mustafa, who has no still yet: the niche holds a silhouette until the art exists.</figcaption></figure>
  <h3>Icons: emblems for the game, lines for the interface</h3>
  <p>The Varak ve mine emblems are small paintings. They work where they name a game term at 18 px or more, and on cards. As interface chrome (close, log, settings, ready, lock) they turn into gold smudges and bring the bevels back. v3 uses them for terms only and draws chrome as one-weight line glyphs.</p>
  <div class="icocmp">
    <figure><div class="rowi" style="background:#e5d9bb;--z:16px">${['settings', 'log', 'close', 'ready', 'secret'].map(em).join('')}</div><div class="rowi" style="background:#0d1324;--z:16px">${['settings', 'log', 'close', 'ready', 'secret'].map(em).join('')}</div><figcaption>Emblems as chrome at 16 px (v2)</figcaption></figure>
    <figure><div class="rowi ui" style="background:#e5d9bb;color:#241a12">${['set', 'log', 'close', 'check', 'eye'].map(k => S.gl(k)).join('')}</div><div class="rowi ui" style="background:#0d1324;color:#efe6cf">${['set', 'log', 'close', 'check', 'eye'].map(k => S.gl(k)).join('')}</div><figcaption>Line glyphs at 20 px (v3)</figcaption></figure>
    <figure><div class="rowi" style="background:#e5d9bb;--z:24px">${['hizmet', 'hiyanet', 'divan', 'harem', 'influence', 'kader'].map(em).join('')}</div><figcaption>Emblems for game terms at 24 px: kept</figcaption></figure>
  </div>
</section>

<section id="sistem">
  <h2>Tokens and components</h2>
  <p>The source is <code>ui/v3/src/ui.css</code>: every value below is a custom property there, and every component on this page is drawn by it.</p>
  <h3>Colour</h3>
  <div class="sw">
    ${sw('#e5d9bb', 'Kâğıt', 'public ground', 'paper')}${sw('#d6c8a2', 'Kâğıt, gölge', 'empty niche, sunk areas', 'paper-2')}${sw('#f4ecd6', 'Kâğıt, açık', 'raised plates, tags', 'paper-hi')}${sw('#241a12', 'Mürekkep', 'text on paper; primary button on paper', 'ink')}
    ${sw('#0d1324', 'Lake', 'private ground', 'lake')}${sw('#1f2a4e', 'Lake, açık', 'raised on lacquer', 'lake-hi')}${sw('#efe6cf', 'Fildişi', 'text on lacquer', 'ivory')}
    ${sw('#c9a24a', 'Altın', 'you can act here; Süleyman', 'gold')}${sw('#21408c', 'Lacivert', 'office: the Vekils, Kul', 'lapis')}${sw('#a82e1c', 'Al', 'Hıyanet, Hain, sealed', 'al')}${sw('#2c6a4d', 'Malakit', 'Hizmet, Sadık', 'mal')}
  </div>
  <p class="note">Each signal has a lighter twin for lacquer (<code>--lapis-hi</code>, <code>--al-hi</code>, <code>--mal-hi</code>, <code>--gold-hi</code>). Components never name a colour: they read <code>--fg</code>, <code>--line</code>, <code>--s-al</code> and so on from the zone they sit in (<code>.zp</code> paper, <code>.zl</code> lacquer).</p>
  <h3>Type</h3>
  <div class="typ ui">
    <div><small>Moment title<br>Alegreya 800, 46</small><span style="font:800 46px/1 var(--f-voice)">Hıyanet</span></div>
    <div><small>Ask title<br>Alegreya 800, 28</small><span style="font:800 28px/1.05 var(--f-voice)">Birini at, ikisini Defne'ye gönder.</span></div>
    <div><small>The game's voice<br>Alegreya italic, 15.5</small><span style="font:italic 400 15.5px/1.22 var(--f-voice)">İtiraz sırası sende. Bir Vekili değiştirtmek 1 Nüfuz.</span></div>
    <div><small>Button<br>Alegreya Sans 800, 15</small><span style="font:800 15px/1 var(--f-ui)">Mühürle</span></div>
    <div><small>Player name<br>Alegreya Sans 800, 13.5</small><span style="font:800 13.5px/1 var(--f-ui)">Ayşe</span></div>
    <div><small>Step, track, tag<br>Alegreya Sans 800, 12.5</small><span style="font:800 12.5px/1 var(--f-ui)">Tertip, 1. dalga</span></div>
    <div><small>Secondary line, minimum<br>Alegreya Sans 500, 11 to 11.5</small><span style="font:500 11.5px/1 var(--f-ui)">Hatice, temel güç, hazır</span></div>
    <div><small>Card object only<br>Alegreya SC 800</small><span style="font:800 22px/1 var(--f-card)">Valide'nin Buyruğu</span></div>
  </div>
  <p class="note">Sizes are CSS px on the 852 px screen. Figures are lining and tabular. Sentence case everywhere; the only capitals are the ones Turkish spelling asks for.</p>
  <h3>Shape and spacing</h3>
  <ul>
    <li><b>Arch</b> for a person, <b>rectangle</b> with a 2 to 3 px radius for a document or a button, <b>circle</b> for a seal mark, <b>eight-point star</b> for Nüfuz. Nothing else.</li>
    <li>Spacing on a 4 px step. Lines are 1 px at 26% ink or 20% ivory. The shelf edge is a double rule, gold over lacquer.</li>
    <li>Depth comes from two things only: cards cast a shadow, and the lifted card crosses the shelf edge.</li>
    <li>Board: 734×372, the safe area of an 852×393 iPhone in landscape. Top line 9 to 39. Court 46 to 226. Shelf from 230, bleeding to the screen edge. Slots are 104 px for 5 to 7 players and 91 px for 8.</li>
  </ul>
  <h3>The seat and its states</h3>
  <div class="slab ui"><div class="zp" style="display:flex;gap:10px 4px;flex-wrap:wrap">${S.specSeats()}</div></div>
  <h3>The hand</h3>
  <div class="slab ui"><div class="zl">${S.specHand()}</div></div>
  <p class="note">Left to right: playable, selected (lifts 18 px across the shelf edge), playable only through your Kul, locked with the reason. Cards are the 120 px compact frame shown at 96. Long-press opens the detail view.</p>
  <h3>Buttons and the prompt</h3>
  <div class="slab ui"><div class="zl" style="display:flex;gap:10px;flex-wrap:wrap;align-items:center"><span class="b pri">Mühürle</span><span class="b">Pas geç</span><span class="b off">Atamayı ilan et <small>1/2</small></span><span class="b pri">İtiraz et <small>−1 Nüfuz</small></span></div>
    <div class="zp" style="display:flex;gap:10px;flex-wrap:wrap;align-items:center"><span class="b pri">Hükmü mühürle</span><span class="b">Sicile bak</span><span class="b off">Oyunu başlat <small>4/5</small></span></div></div>
  <p class="note">One component: 46 px high, 3 px radius. Primary is gold on lacquer and ink on paper. A disabled primary keeps its place and shows why (a count), so the layout never jumps.</p>
</section>

<section id="ekranlar">
  <h2>Every screen</h2>
  <p>One crisis, start to finish, then the sheets. Tap a screen to see it at full width.</p>
  <div class="grid2">
    ${fig(S.sLobi(), `${pub}<b>Lobby.</b> The cast is the title screen. Room code, who has joined, one start button for the host.`)}
    ${fig(S.sKriz(), `${pub}<b>Kriz.</b> The card turns on every phone at once. The field and who draws are restated at reading size.`)}
    ${fig(S.sAtama(), `${prv}<b>Atama, Süleyman's phone.</b> He has no hand, so the shelf holds two appointment slots. Tap a seat to fill the next slot; the seat takes its lapis ground at once.`)}
    ${fig(S.sItiraz(), `${prv}<b>İtiraz, your turn.</b> The order runs under the seats: done, now, to come. Tap the Vekil you object to, then the button.`)}
    ${fig(S.sTertipWait(), `${prv}<b>Tertip, sealed.</b> Your card lies face down in front of Ayşe; the gold outline shows on your phone only. Others see a red seal on your seat.`)}
    ${fig(S.sAcilis(), `${pub}<b>Açılış.</b> The shelf drops away: a reveal is public, so the whole screen is paper. Cards open under the seats they were played on.`)}
    ${fig(S.sKader(), `${prv}<b>Kader, the Birinci Vekil.</b> The whole screen is lacquer. A Sadık player's forbidden discard is locked and says so.`)}
    ${fig(S.sSonuc(), `${pub}<b>Sonuç.</b> The tracks at reading size, the new space ringed in gold, the power it opened in one sentence.`)}
    ${fig(S.sHukum(), `${pub}<b>Hüküm, Süleyman's phone.</b> Two Vekils, one tap, one seal. Other phones see the same page with the result.`)}
    ${fig(S.sSon(), `${pub}<b>Game end.</b> The winning side stays in colour; the overall winner stands on gold.`)}
    ${fig(S.sSir(), `${prv}<b>Press and hold the sealed letter.</b> Taraf, your Character's motive for that side, and your Hırs. Lift your finger and it closes.`)}
    ${fig(S.sKart(), `${prv}<b>Long-press a card.</b> The full card at 254 px, with its rule restated in interface type and whether it can be played now.`)}
    ${fig(S.sKoltuk(), `${pub}<b>Long-press a seat.</b> Public facts on paper. Your private mark sits on a lacquer strip, because only you see it.`)}
    ${fig(S.sSicil(), `${pub}<b>Sicil.</b> One row per crisis: who served, what was played, what Süleyman decreed. This is the evidence players argue from.`)}
  </div>
</section>

<section id="yapim">
  <h2>Build notes</h2>
  <p>The interaction model in <code>ui/v2/notes.md</code> stands: asks addressed to one seat, legality from one rules module, scheduled synced moments, no timers. v3 changes what is drawn, and three things about how.</p>
  <ul>
    <li><b>Tap, then tap.</b> Select a card, tap a seat, seal. Drag still works but nothing depends on it; the court is outside thumb reach.</li>
    <li><b>The shelf is the phone's private state.</b> It slides down (240 ms) when a public moment starts and returns after. A private ask covers the whole screen in lacquer.</li>
    <li><b>The Kader deck count leaves the resting screen.</b> It shows in Sonuç and Sicil. The top line has room for the two tracks and the crisis, nothing more.</li>
  </ul>
  <h3>Components</h3>
  <div class="tbl"><table class="t">
    <thead><tr><th>Component</th><th>Holds</th><th>States</th></tr></thead><tbody>
    <tr><td>Screen</td><td>Safe-area board, surfaces that bleed</td><td>table, public moment, private ask, sheet</td></tr>
    <tr><td>Mizan</td><td>Hizmet track, crisis name and field, Hıyanet track, log and settings</td><td>a new space is ringed in gold until the next crisis</td></tr>
    <tr><td>Court, Seat</td><td>Figure in a niche, name plate, Nüfuz star, Kul chip, office band, ready seal, cards laid</td><td>idle, legal, dimmed, picked; Vekil I or II; Süleyman; you; Kul face down; no art</td></tr>
    <tr><td>Shelf</td><td>Identity (sealed letter, power list), Hand, Prompt</td><td>player, Süleyman (slots instead of a hand), hidden</td></tr>
    <tr><td>HandCard</td><td>The 120 px compact card</td><td>playable, selected, through Kul, locked with reason</td></tr>
    <tr><td>Prompt</td><td>Step ticks and name, one sentence, a hint line, up to two buttons</td><td>your move, waiting (count and who), disabled with reason</td></tr>
    <tr><td>Moment</td><td>Kriz, Açılış, Sonuç, Hüküm, game end</td><td>always paper, same on every phone</td></tr>
    <tr><td>Ask</td><td>Kader pick, peeks, secrets, card detail</td><td>always lacquer, only on the addressed phone</td></tr>
    <tr><td>Sheet</td><td>Sicil, seat sheet, settings</td><td>paper, with a lacquer strip for anything private</td></tr>
  </tbody></table></div>
  <h3>Motion</h3>
  <div class="tbl"><table class="t">
    <thead><tr><th>Event</th><th>What moves</th><th>Time</th></tr></thead><tbody>
    <tr><td>A card is lifted</td><td>The card rises 18 px; seats that aren't legal fade to 34%</td><td class="num">160 ms</td></tr>
    <tr><td>A card is placed</td><td>It travels to the seat, turns face down and settles as a 12×17 chip</td><td class="num">320 ms</td></tr>
    <tr><td>A Vekil is named</td><td>Lapis fills the niche from the base; the band slides up</td><td class="num">360 ms</td></tr>
    <tr><td>A public moment starts</td><td>The shelf slides down; the court stays where it is</td><td class="num">240 ms</td></tr>
    <tr><td>Açılış</td><td>Chips grow to 80 px cards under their seats and turn together</td><td class="num">480 + 700 ms</td></tr>
    <tr><td>Sonuç</td><td>The Kader card turns; its track space fills; a gold ring stays</td><td class="num">700 + 400 ms</td></tr>
    <tr><td>Reduced motion</td><td>Every item above becomes a 120 ms cross-fade</td><td class="num">120 ms</td></tr>
  </tbody></table></div>
  <h3>Assets this needs</h3>
  <ul>
    <li><b>Cut-outs.</b> Seven Characters have them. Mustafa, Barbaros, Gritti, Şarlken and Şah Tahmasp need stills first, then the same macOS Vision cut-out. Pargalı and Hatice come from 300 px sources: sharp in a 90 px niche, soft in the 150 px Hüküm niche.</li>
    <li><b>Baked cards.</b> Each card as a WebP at 120 and 258 px wide, 3x. The 13 on this page were baked from the art page with <code>ui/v3/src/bake-cards.mjs</code>. The game should ship baked cards, not the live SVG filters.</li>
    <li><b>Line glyphs.</b> Eight are drawn here (check, lock, log, settings, eye, close, hold, back). The game needs about fourteen.</li>
    <li><b>Fonts.</b> Alegreya Sans 500, 700, 800; Alegreya 400 italic, 700, 800; Alegreya SC 800 for the wordmark. All cover Turkish.</li>
  </ul>
</section>

<section id="kararlar">
  <h2>Decisions for Jingle</h2>
  <ol>
    <li><b>Surface.</b> Kâğıt ve lake (recommended), all paper, or all dark.</li>
    <li><b>Court order.</b> A fixed row with Süleyman in the middle, the same on every phone (recommended). This replaces the 13 November decision of an arc that starts at the viewer's left. It also puts your own seat in the row.</li>
    <li><b>Icons.</b> Emblems for game terms and cards only, line glyphs for interface chrome (recommended), or emblems everywhere as in v2.</li>
    <li><b>Interface type.</b> Alegreya Sans for the interface and Alegreya italic for the game's voice (recommended), or keep small caps throughout.</li>
    <li><b>Kader deck count.</b> Off the resting screen, shown in Sonuç and Sicil (recommended), or kept on the top line at the cost of the field name.</li>
    <li><b>Sicil.</b> A per-crisis table as the first tab of the log (recommended), with the full event list behind it.</li>
  </ol>
</section>`;

const script = `
(function(){
  var root=document.documentElement; root.classList.add('js');
  function fit(){ document.querySelectorAll('.fr').forEach(function(f){ f.style.setProperty('--s', f.clientWidth/868); }); }
  fit(); addEventListener('resize', fit);
  if (window.ResizeObserver) { var ro=new ResizeObserver(fit); document.querySelectorAll('.fr').forEach(function(f){ ro.observe(f); }); }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  document.querySelectorAll('.grid2 > figure').forEach(function(g){ g.addEventListener('click', function(){ g.classList.toggle('big'); fit(); }); });
  var ph=document.querySelector('#thfig .ph');
  document.querySelectorAll('.seg button').forEach(function(b){ b.addEventListener('click', function(){
    document.querySelectorAll('.seg button').forEach(function(x){ x.setAttribute('aria-pressed', x===b ? 'true' : 'false'); });
    ph.classList.remove('th-split','th-paper','th-lake'); ph.classList.add(b.dataset.th); }); });
})();`;

const html = `<title>Entrika UI v3</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Alegreya+SC:wght@800&family=Alegreya+Sans:wght@500;700;800&family=Alegreya:ital,wght@0,400;0,700;0,800;1,400&display=swap">
<style>
${read('doc.css')}
${read('ui.css')}
</style>
<main class="doc">${body}</main>
<script>${script}</script>
`;
fs.writeFileSync(new URL('../index.html', here), html);
console.log('index.html', (html.length / 1024).toFixed(0) + ' KB');
