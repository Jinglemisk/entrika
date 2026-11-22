# `got` mod: proposal

**Rework, 2026-11-20.** The mod now follows the designer's research page "Entrika Westeros" (https://claude.ai/artifact/KcTKLNY8bj3YjP9eHbaixP), which was written for rules v0.7, adapted here to v0.9. The `about` lines in `game/content/*.json` say what each id does now. The first version (Robert's court, season 1) is in this file's git history.

Subtitle: **Entrika: Game of Thrones**. Written in English first. The Turkish follows the official translation where a name is established (Kral Eli, Küçük Konsey, Kızıl Kale); names that couldn't be verified are listed in the art manifest.

---

## 1. The world

**When:** Joffrey's court, from the Battle of the Blackwater to the Purple Wedding (seasons 3–4). Tywin is Hand, the Tyrells are at court, Sansa is still a hostage, and Joffrey is alive. Nobody is at court for all of it: Littlefinger leaves for the Vale midway and Jaime only comes home at the end.

**Why this king:** everyone at this court has a reason to keep Joffrey (Lannisters and Tyrells have staked their houses on him) and a reason to kill him (he is cruel, and Tommen would be easier). The show ends him at his own wedding feast, so the Kader chain becomes the feast: the Hand pours three cups and passes two; the Master of Coin serves one to the king.

### Term table

| Glossary term (id) | `got` name | Why |
|---|---|---|
| Süleyman / the Sultan (`suleyman`) | **the King** (card: Joffrey Baratheon) | Public, always a Loyalist, alive until the fifth Poison. |
| Loyalist / Traitor (`loyalist`, `traitor`) | **Loyalist / Turncloak** | Westeros's own word for a traitor. |
| Allegiance (`allegiance`) | **Allegiance** | Kept. |
| First / Second Minister (`min1`, `min2`) | **Hand of the King / Master of Coin** | The two seats that run the realm in season 3. |
| Minister (`minister`) | **Councillor** | Either seat. |
| Divan / Harem / Saray (`divan`, `harem`, `saray`) | **Small Council / Holdfast / Red Keep** | Maegor's Holdfast is the royal family's keep. |
| Intrigue (`intrigue`) | **Scheme** | |
| Companion (`companion`) | **Retainer** | |
| Court (`court`) | **The Game** | Played in waves. |
| Influence (`influence`) | **Gold** | Dissent is a bribe; the richest player on the winning side wins. |
| Favor power (`favor`) | **Favor** | |
| Base power (`base`) | **Base** | Plain; unchanged from the manual. |
| Objection (`objection`) | **Dissent** | |
| Decree (`decree`) | **The King's Judgment** | |
| Ferman (`ferman`) | **I Am the King** | Joffrey's own line. |
| Kader deck (`kader`) | **Cups** | |
| Hizmet / Hıyanet (`h`, `x`) | **Wine / Poison** | The Poison is the poison that kills Joffrey. |
| Kader step | **The Pouring** | The Hand pours three, passes two; the Master of Coin serves one. |
| Loyalty / Treason track | **Long May He Reign / The Purple Wedding** | |
| Süleyman's death (`death`) | **The Purple Wedding**: Joffrey dies, the Turncloaks win | |
| Investigator | **Interrogator** | The Black Cells. |

### Purple Wedding track (Treason powers)

| Space | id | Name | Effect |
|---|---|---|---|
| 1 | `1` | — | Nothing. |
| 2 | `sorusturma` | **The Black Cells** | An interrogator looks at one Allegiance card. |
| 3 | `hazineDefteri` | **Iron Bank Ledger** | A named player looks at the top 3 cups. |
| 4 | `fermanRefresh` | **The King's Justice** | Joffrey may use I Am the King again. |
| 5 | `death` | **The Purple Wedding** | Joffrey dies. Turncloaks win. |

---

## 2. Roster: v0.7 research → v0.9 ids

### Characters

| id (v0.9) | Who | Base | Favor | From the research |
|---|---|---|---|---|
| `suleyman` | **Joffrey Baratheon** | I Am the King | — | Same. |
| `hurrem` | **Margaery Tyrell** | The King's Ear | Rose and Thorn | Same powers. |
| `ibrahim` | **Tywin Lannister** | Send Him to Bed | **Gold of the Rock** (new) | Base same. Favor changed from "gain 1 Gold when appointed" to "gain 1 Gold when Wine is served while you're a Councillor". |
| `sahsultan` | **Cersei Lannister** | The Queen's Displeasure | Banishment | Was Mahidevran in v0.7; v0.9 gave those exact powers to `sahsultan`. |
| `mustafa` | **Jaime Lannister** | **The Lord Commander's Seat** (new) | **Kingslayer's Price** (new) | Powers changed: take a seat when the Game ends, even under the King's Seal; whoever dissents against you pays you. Still Jaime: the Kingsguard walks in, and crossing the Kingslayer costs. |
| `hatice` | **Tyrion Lannister** | The Slap | I Drink and I Know Things | Powers grew: the shield now covers Schemes as well as Judgment, and the knowing is "are these two on the same side" instead of an Ambition. Research names kept; they still say what the powers do. |
| `rustem` | **Petyr Baelish** | A Private Word | Chaos Is a Ladder | Same. |
| `barbaros` | **Varys** | Stolen Letters | Little Birds | Same. |
| `gritti` (wildcard) | **Tycho Nestoris** | Interest | The Iron Bank Will Have Its Due | Same. |
| `sarlken` (wildcard) | **Oberyn Martell** | Not Here for a Seat | Unbowed, Unbent, Unbroken | Same. |
| `tahmasp` (wildcard) | **Daenerys Targaryen** | **Mother of Dragons** (new) | Dracarys | Base changed from "look at the top 2 crises" to "choose this crisis's field". |

**Sansa moves to a Retainer** (v0.7 Mihrimah has no v0.9 slot): she carries the necklace that holds the poison, so she stays in the Purple Wedding; she takes the High Septon's place, who is barely on screen in seasons 3–4.

### Retainers (every one recasts a Scheme)

| id | Recasts | Retainer | Why |
|---|---|---|---|
| `daye` | The Queen Regent's Command (`valide`), not yourself | **Ser Ilyn Payne** | Research pick. The headsman carries out Cersei's will, never his own. |
| `bali` | The King's Seal (`muhur`) | **Sandor Clegane** | Research pick. |
| `ayas` | Stripped of Office (`azil`) | **Janos Slynt** | Research pick; Tyrion strips him of the City Watch. |
| `matrakci` | Paid Informer (`casus`) | **Ros** | Research had her on Whispers (look at a hand); v0.9's nearest is `casus` (see what a player played). |
| `sumbul` | Sworn Sword (`akil-hocasi`), you pick the field | **Bronn** | Research pick; a sellsword picks his side. |
| `nigar` | Dark Wings (`muhurlu-evrak`) | **Grand Maester Pycelle** | Research pick. |
| `ebussuud` | Confession (`teftis`) | **Olenna Tyrell** | Was a special (hand limit 4). She knows exactly what went into the cup. |
| `gulsah` | Slander (`iftira`) | **Lancel Lannister** | Research pick. |
| `seker` | Maester's Remedy (`saray-tabibi`) | **Qyburn** | Research had him on Maester's Remedy. |
| `gulfem` | A Fool's Wager (`kefalet`) | **Ser Dontos Hollard** | His card (Lannister Gold) is gone; a drunk fool's bet on a Councillor fits him. |
| `iskender` | The Crown's Ledgers (`defterdar`) | **Ser Kevan Lannister** | Was a special: "as Hand, draw 4 and discard 2", which is now the `defterdar` card. |
| `firuze` | The King's Eye (`nazar`) | **Shae** | Was a special (+1 Gold). The Judgment counts double on whoever she stands beside. |
| `gulaga` | Hold Your Tongue (`sukut`) | **Sansa Stark** | Moved from Characters. A hostage learns silence and teaches it. |
| `lokman` | Kingsguard Watch (`nobet`) | **Podrick Payne** | Was a special (return a card). The squire at the door knows who came in. |

Dropped: **the High Septon**.

### Schemes

| id | Field (copies) | Name | v0.9 effect | From the research |
|---|---|---|---|---|
| `akil-hocasi` | Council 2, Holdfast 2 | **Sworn Sword** | Cancels the other Schemes of its field on this player | Same. |
| `muhur` | Council 3 | **The King's Seal** | Schemes can't replace this Councillor; I Am the King still can | Same. |
| `valide` | Council 4 | **The Queen Regent's Command** | Replace a Councillor with anyone, you included | Same. |
| `azil` | Council 3 | **Stripped of Office** (new) | The King replaces this Councillor | Council Reshuffle (swap seats) is gone. |
| `casus` | Holdfast 2 | **Paid Informer** (new) | After the Game, see what this player played and on whom | Whispers looked at a hand. |
| `muhurlu-evrak` | Holdfast 2 | **Dark Wings** | Look at the top 3 cups, put them back | Same. |
| `saray-tabibi` | Holdfast 2 | **Maester's Remedy** | This player loses no Gold, Judgment included | Same. |
| `iftira` | Holdfast 3 | **Slander** | −1 Gold | Same. |
| `kefalet` | Holdfast 3 | **A Fool's Wager** (new) | On a Councillor: gain 1 on Wine, lose 1 on Poison | Replaces Lannister Gold. |
| `teftis` | Council 3 | **Confession** | See what this Councillor discarded | Same. |
| `defterdar` | Council 2 | **The Crown's Ledgers** (new) | The Hand draws 4 and discards 2 | New in v0.9. |
| `nobet` | Council 2 | **Kingsguard Watch** (new) | Learn who played one card on this player | New in v0.9. |
| `nazar` | Holdfast 2 | **The King's Eye** (new) | The Judgment on this Councillor gives or takes 2 | New in v0.9. |
| `sukut` | Holdfast 2 | **Hold Your Tongue** (new) | This player sits out the next wave | New in v0.9. |

### Crises (the research's eleven, by field and draw)

| id | Field | Draw | Name |
|---|---|---|---|
| `yeniceri` | Small Council | 0 Gold | **Riot in Flea Bottom** |
| `hazine` | Red Keep | nobody | **Debt to the Iron Bank** |
| `venedik` | Red Keep | beside the King | **The Tyrells Arrive** |
| `harem` | Holdfast | least Gold | **Bastard Letters** |
| `macar` | Small Council | nobody | **Battle of the Blackwater** |
| `muhur` | Holdfast | last Councillors | **A Stone Goes Missing** |
| `divan` | Small Council | last Councillors | **Small Council Quarrel** |
| `sehzade` | Holdfast | beside the King | **Who Marries Tommen?** |
| `istanbul` | Holdfast | everyone | **Talk in the Taverns** |
| `irakeyn` | Small Council | least Gold | **News of the Red Wedding** |
| `isabella` | Red Keep | last Councillors | **The Stark Girl Is Gone** |

### Ambitions

| id | v0.9 goal | Name | From the research |
|---|---|---|---|
| `divanda-nufuz` | Unseat a Councillor with a Scheme | **Strip the Chain** (new) | Goal changed. |
| `suphe` | Be a Councillor when Poison is served | **Under Suspicion** | Same. |
| `takdir` | Be a Councillor when Wine is served | **A Toast to the King** (new) | Goal changed. |
| `gozden` | Lose Gold | **A Lighter Purse** (new) | Goal changed (any loss, not only the Judgment). |
| `kulisci` | Schemes on 3 different players | **Many Threads** (new) | Goal changed (3, not 2). |
| `yukselen` | Be a Councillor in two crises | **A Seat at the Table** | Research name, moved to the goal it fits. |
| `itirazci` | Make a Dissent | **Dissenter** | Same. |
| `hedef` | 2+ Schemes on you in one crisis | **Marked** | Same. |
| `ortak` | Put the King's Seal or A Fool's Wager on a Councillor | **Stand Surety** (new) | Goal changed. |
| `hazine` | Play 3 Schemes in one crisis | **Play the Game** (new) | Goal changed. |
| `koltuk` | Become a Councillor through a Scheme | **Climb the Ladder** | Same. |
| `kulak` | Use Paid Informer, Dark Wings, Confession or Kingsguard Watch | **Eavesdropper** | Same, with the v0.9 cards. |

---

## 3. Art direction

*From the first version. Kept: iron frames, fonts, music. Being reworked for the new world: the Kader deck becomes cups (back, icons, stills), the frieze, house tints, the icons whose meaning moved, and every portrait (seasons 3–4). Sections 4–5 below describe the first version.*

**The idea: vellum and iron.** The Ottoman version is paper and lacquer. Here the public surfaces are **maester's vellum** (court, tracks, reveals, Judgment) and the private ones are **blackened iron and oiled leather** (your hand, your Oath, the Ravens, peeks). Gold is spent on the King and Favor only. Stone is the Red Keep's warm red sandstone, and the light is candles and braziers.

### Palette

| Token | Role | Paper | On iron (lacquer) |
|---|---|---|---|
| Vellum | public ground | `#E7D9BB` (hi `#F3EAD3`, sink `#D3C29C`) | n/a |
| Iron | private ground | n/a | `#1C1D20` (raise `#2A2C30`, sink `#121315`) |
| Ink | text, iron-gall ink | `#231C17` | `#EFE6CF` |
| Sandstone | Red Keep stone, seat niches | `#A65A3C` (shade `#6E3524`) | n/a |
| Steel | office: Council, Councillors, Retainer, Seal, badges | `#3D5468` | `#9FB4C6` |
| Blood | Treachery, Oathbreaker, Conspiracy, Crisis, Challenge, suspect | `#9A2318` | `#E58B78` |
| Kingswood | Fealty, Sworn, King's Peace, trusted | `#2E5B3E` | `#86C29A` |
| Wine | Whispers | `#8C3A55` | `#EBA3BC` |
| Gold (Baratheon) | the King, Favor, Judgment, Royal Command, Red Keep | `#8A6410` | `#ECD38A` (leaf `#C9A23A`) |
| Raven | Ravens, Ambition, Boon, Oath, secret | `#2F3352` | `#B3BAE0` |

Steel, blood, Kingswood and gold take the places of lapis, vermilion, malachite and gold in UI v3, so every interface signal keeps its meaning. Only the hues change.

### Frames (shape language per card kind; layout slots unchanged)

| Kind | Art window | Frame and material | Name band | Back |
|---|---|---|---|---|
| Character | **Round Romanesque arch** (the Red Keep's windows) | Blackened iron with riveted bands; house colour enamelled on the spandrels (Lannister crimson, Stark grey, Baratheon gold and black, Targaryen black and red, Tyrell green, and grey for Varys and Littlefinger) | Leather strap with iron buckle ends; Cinzel | Blood-red velvet with the **Iron Throne** silhouette |
| King | Same arch, crowned by a **fan of fused blades** (the Iron Throne's back) | Baratheon black and gold leaf | Gold strap | (Character back) |
| Retainer | **Flat lintel**, square-headed (a servant's door) | Oak and brass; **maester's chain** border (mixed metal links) | Plain leather | Chain-link lattice with a hound's-head medallion |
| Scheme | **Octagon** (clipped corners, like a shuttered window) | Dark oak with a **Valyrian steel ripple** inlay band | Iron plate | Dark oak with the catspaw dagger medallion |
| Crisis | **Crenellated top edge** (battlements) | Red sandstone ashlar | Stone lintel | The **royal seal** on top, a raven medallion below |
| Ravens (Fealty / Treachery) | **Unrolled letter**: rolled edges top and bottom | Vellum on iron; the cartouche seal is **intact gold wax** (Fealty) or **broken red wax** (Treachery), which reuses the renderer's `seal: ok / broken` | Ribbon | Black raven feathers with a wax disc |
| Ambition | Round arch with **ladder-rung** side borders | Raven indigo enamel | Iron strap | Indigo with a ladder of blades climbing to a crown |
| Oath | Drawn art (no photo) | Sworn: white field, Kingswood edge. Oathbreaker: blood field, broken links | Ribbon | A sealed letter tied with ribbon over a sword hilt |

Corner gems keep the contrast-disc rule (black on light frames, white on dark), set in **iron rivet bosses** instead of gold bezels. The Council gem is steel, the Whispers gem is wine, and the Red Keep gem is split steel and wine (as `j-saray` is now).

### Ornament and patterns

| Motif | Where |
|---|---|
| Valyrian steel ripple (damascus bands) | Scheme frames, dividers between the two power panels |
| Rivets and strap iron | Character and King frames, gems |
| Norman chevron moulding | Arch edges, seat niches |
| Maester's chain (links of different metals) | Retainer frames, Ravens backs |
| Heraldic charges (stag, lion, direwolf, dragon, rose, mockingbird) | House tints only; never a full coat of arms behind text |
| Red Keep ashlar | Crisis frames, niche walls, home screen |
| Raven feather | Ravens back, the Ravens step's background |

### Icon family: Blazon

Kat'ı becomes **Blazon**: flat heraldic charges, one silhouette each, cut like a banner appliqué, with no outlines or inner lines that would disappear at 15 px. The colour comes from the meaning (palette above). Motifs are objects from the court, not stock symbols. Each icon gets a generated master from one template, the same way `art/icons/` builds Kat'ı now.

| Term | Charge | Colour |
|---|---|---|
| Council (`divan`) | High-backed council chair | Steel |
| Whispers (`harem`) | Little bird (mockingbird) | Wine |
| Red Keep (`saray`) | Battlemented tower | Gold |
| Councillor (`minister`) | Chain of office | Steel |
| Hand (`min1`) | The Hand's pin | Steel |
| Master of Laws (`min2`) | Scales | Steel |
| Scheming (`court`) | Keyhole | Steel |
| Retainer (`companion`) | Hound's head | Steel |
| King's Seal (`seal`) | Wax seal with crowned stag | Steel |
| once / once a crisis / always | Single candle / hourglass / brazier | Steel |
| Treachery (`hiyanet`) | Goblet (the strongwine) | Blood |
| Oathbreaker (`traitor`) | Broken sword | Blood |
| Conspiracy (`treason`) | Two crossed daggers | Blood |
| Crisis (`crisis`) | Raven with a scroll | Blood |
| Challenge (`objection`) | Thrown gauntlet | Blood |
| Character (`character`) | Pennant | Blood |
| suspect | Narrowed eye | Blood |
| Fealty (`hizmet`) | Kneeling knight | Kingswood |
| Sworn (`loyalist`) | Sword point-down | Kingswood |
| King's Peace (`loyalty`) | Sheathed sword | Kingswood |
| trusted | Clasped hands | Kingswood |
| King (`suleyman`) | Iron Throne | Gold |
| Favor (`influence`) | Gold dragon coin | Gold |
| Judgment (`decree`) | Robert's warhammer | Gold |
| Royal Command (`ferman`) | Crown | Gold |
| Ravens (`kader`) | Raven | Raven |
| Ambition (`ambition`) | Ladder | Raven |
| Boon (`favor`) | Key | Raven |
| Oath (`allegiance`) | Ribboned scroll | Raven |
| secret | Hood | Raven |
| Scheme (`intrigue`) | Dagger (the catspaw's) | Ink |
| Birthright (`base`) | Blank escutcheon | Ink |
| the Boar (`death`) | Boar's head | Ink |

### Seal

The tughra becomes **Robert's royal seal: the crowned stag**, rampant inside a round wax impression with a beaded rim. Gold leaf on the Judgment screen, deep oxblood wax on the Crisis back. Generated as a texture (allowed), drawn flat so it reads at 40 px.

### Seat niche

A **round-arched window in red sandstone** with a chevron-moulded edge and a deep reveal; the figure stands in candle-lit dark. **The King's seat** has the Iron Throne's blade fan behind the arch in blackened iron, edged in gold leaf, replacing the Süleyman seat's gilding.

### Frieze (home and lobby)

Six cut-outs on a Red Keep ashlar strip fading into vellum: **Littlefinger, Cersei, Robert (centre, largest), Ned, Varys, Joffrey**. Cersei and Ned stand on either side of Robert, which is the season's central triangle.

### Fonts (Google Fonts)

| Use | Font | Why |
|---|---|---|
| Card names, headings, small caps on card objects | **Cinzel** | The closest free relative of the show's Trajan titles |
| The game's voice (flavor, prompts' italic) | **EB Garamond** italic | Bookish and readable at phone sizes |
| Interface | **Alegreya Sans** (kept) | Already tested for legibility on phones, and it has nothing Ottoman in it. Cinzel and Garamond carry the change of world (open question 9) |

### Still grade

**Red Keep dusk**: teal-iron shadows, candle-gold highlights. A split tone with shadows to `#1B2428` and highlights to `#E8C88A`, saturation −15 %, mixed at 15 %, the same strength as the Ottoman grade. It follows the show's own King's Landing grade (warm), so stills from the cold Winterfell and Wall scenes sit closer to it.

### Music (synthesised)

| | |
|---|---|
| Mode | D Aeolian, with a passing raised 6th (B♮, Dorian colour) on rising phrases. No phrase from Ramin Djawadi's score. |
| Drone | Open fifth D2 + A2, bowed: two detuned sawtooths through a low-pass at about 600 Hz, slow 0.6 s swell |
| Lead | **Hammered dulcimer**: plucked triangle plus a short noise transient, fast decay. The show leans on dulcimer, so it signals the setting without quoting. |
| Colour | A low cello swell (sawtooth, 0.4 s attack) every eighth bar |
| Tempo | 72 bpm in 3/4, four-bar phrases with long rests; quieter than the Hicaz loop |

The settings pref line becomes "A quiet loop in D minor."

---

## 4. Image sourcing plan

Rules (from `docs/direction.md` and `plan.md`): real images from the series only; generated images only for icons and textures. People get **a standard posed promo or cast portrait**: chest-up, eye line level, facing the viewer, the same framing for every card. Where no posed shot exists, use a frontal screencap and mark it `posed: false` in the manifest, as the Ottoman roster does. **Season 1 looks** (costume, age) everywhere, so the court looks like one moment. Nothing is downloaded until this is approved.

**Sources**, in order:
1. **HBO's official season 1 character portraits** (studio, dark background) as published on HBO's press pages and the series' IMDb photo gallery.
2. **The Game of Thrones Wiki** (gameofthrones.fandom.com) infobox images, which are mostly the same HBO promos. Used to find the original, never as the final file if the original exists.
3. **HBO's official YouTube channel** (GameofThrones) clips at 1080p for frames, drawn from the player the way the Ottoman rounds 13–17 did.
4. Screencap archives only for a frame that isn't in 1–3; each source is vetted and logged.

Every file goes in `mods/got/art/manifest.json` with source URL, page, note, focus and `posed`.

### Characters

| id | Who | Actor | Image |
|---|---|---|---|
| `suleyman` | Robert Baratheon | Mark Addy | S1 promo portrait (HBO) |
| `hurrem` | Cersei Lannister | Lena Headey | S1 promo portrait |
| `ibrahim` | Eddard Stark | Sean Bean | S1 promo portrait |
| `sahsultan` | Renly Baratheon | Gethin Anthony | S1 promo portrait (not the S2 crowned one) |
| `mustafa` | Joffrey Baratheon | Jack Gleeson | S1 promo portrait (prince, no crown) |
| `hatice` | Varys | Conleth Hill | S1 promo portrait |
| `rustem` | Petyr Baelish | Aidan Gillen | S1 promo portrait |
| `barbaros` | Arya Stark | Maisie Williams | S1 promo portrait |
| `gritti` | Tyrion Lannister | Peter Dinklage | S1 promo portrait |
| `sarlken` | Jon Snow | Kit Harington | S1 promo portrait (Night's Watch black) |
| `tahmasp` | Daenerys Targaryen | Emilia Clarke | S1 promo portrait |

### Retainers

| id | Who | Actor | Image |
|---|---|---|---|
| `daye` | Jaime Lannister | Nikolaj Coster-Waldau | S1 promo, Kingsguard white |
| `bali` | Sandor Clegane | Rory McCann | S1 promo |
| `ayas` | Ilyn Payne | Wilko Johnson | Frontal screencap, S1E9 (Ned's execution); likely no promo |
| `matrakci` | Ros | Esmé Bianco | S1 promo if one exists, otherwise a frontal screencap. Clothed, head and shoulders. |
| `sumbul` | Syrio Forel | Miltos Yerolemou | Frontal screencap, S1E3 or S1E6 (lessons) |
| `nigar` | Pycelle | Julian Glover | S1 promo |
| `ebussuud` | Jory Cassel | Jamie Sives | Frontal screencap, S1E1–E5 |
| `gulsah` | Shae | Sibel Kekilli | S1 promo (or S2) |
| `seker` | Lancel Lannister | Eugene Simon | Frontal screencap, S1E7 (squire) |
| `gulfem` | Sansa Stark | Sophie Turner | S1 promo |
| `iskender` | Janos Slynt | Dominic Carter | Frontal screencap, S1E8 |
| `firuze` | Loras Tyrell | Finn Jones | S1 promo or a S1E4 tourney frame, helmet off |
| `gulaga` | Septa Mordane | Susan Brown | Frontal screencap, S1E1 or S1E4 |
| `lokman` | Barristan Selmy | Ian McElhinney | S1 promo, Kingsguard white |

### Scheme stills (scenes, faces of Retainers avoided where the scene allows)

| id | Scene |
|---|---|
| `akil-hocasi` Not Today | Syrio's wooden sword against Meryn Trant's steel, wide (S1E8) |
| `muhur` King's Seal | Ned pressing the royal seal into wax on Robert's will (S1E7) |
| `valide` Usurper | Ned sitting the Iron Throne in the King's place, hearing petitions (S1E6) |
| `azil` Dismissed | Barristan throwing his sword and cloak down before Joffrey, wide (S1E10) |
| `casus` Shadowed | Arya hiding in the dungeon dark as Varys and Illyrio pass (S1E5) |
| `muhurlu-evrak` Opened Letters | Lysa's letter hidden in the lens, Catelyn and Luwin opening it (S1E1) |
| `saray-tabibi` The Taster | Lancel pouring Robert's wine before the hunt (S1E7) |
| `iftira` Rumor | Septa Unella ringing the shame bell (S5E10; framed on her, no nudity) |
| `kefalet` Tourney Wager | Littlefinger and Renly laying bets at the Hand's Tourney (S1E4) |
| `teftis` Inquiry | Ned reading *The Lineages and Histories of the Great Houses* (S1E6) |
| `defterdar` The Crown's Ledgers | Ned at the Hand's desk among the ledgers (S1E3–E4) |
| `nobet` Standing Guard | Kingsguard at the throne-room doors, wide (S1E5) |
| `nazar` The King's Eye | Robert at the tourney looking almost into the lens (S1E4) |
| `sukut` Hold Your Tongue | Sansa and Septa Mordane at needlework, the septa hushing (S1E1) |

### Crisis stills

| id | Scene |
|---|---|
| `yeniceri` Swords in the Street | Ned's guard against Jaime's men in the rain (S1E5) |
| `hazine` The Crown's Debts | The first Small Council meeting (S1E3) |
| `venedik` The Iron Bank's Envoy | The Iron Bank's hall in Braavos (S4E6) |
| `harem` Scandal in the Street of Silk | Ned and Littlefinger in the brothel with the royal bastard (S1E4–E5) |
| `macar` Raids in the Riverlands | Burned villagers petitioning the throne (S1E6) |
| `muhur` The Death of Jon Arryn | Pycelle telling Ned the last words (S1E3), or the empty Hand's chair |
| `divan` A Quarrel in Council | The council ordering Daenerys's death, Ned with the pin (S1E5) |
| `sehzade` The Heir in Question | Ned and Cersei in the godswood (S1E7) |
| `istanbul` The Hand's Tourney | The lists and stands, wide (S1E4) |
| `irakeyn` The Targaryen Threat | The khalasar at Drogo's wedding, wide (S1E1) |
| `isabella` Trouble on the Kingsroad | At the Trident: Arya, Joffrey and the direwolves (S1E2) |

### Ravens stills

| Card | Scene |
|---|---|
| Fealty | Winterfell kneeling as Robert arrives (S1E1) |
| Treachery | Cersei tearing Robert's will (S1E7) |
| (end screen, optional) | Robert on his deathbed after the boar (S1E7) |

### Generated (icons and textures only)

The Blazon icons (the 35 terms above, plus whatever the mod check lists); the crowned-stag seal; vellum, iron, oak, sandstone and leather grounds; the Valyrian ripple band; the chain and chevron borders; the Iron Throne silhouette and blade fan; the Oath art (sword, broken sword). No people.

---

## 5. Decisions (review, 2026-11-19)

| Question | Decision |
|---|---|
| Subtitle | **Game of Thrones**. "King's Landing" goes in the flavor lines. |
| Seat names | **Keep Hand of the King and Master of Laws.** Seats are offices the King hands out each crisis, so Renly's own title won't confuse anyone. |
| Shae | **Keep her.** |
| People's looks | **Seasons 1–2 only** for every Character and Retainer (Joffrey and Arya especially; Cersei's season 1 hair). Later seasons are fine for objects and scenes (Schemes, Crises) when the still is better. |
| Later-season power names | Fine. |
| House tints | An optional per-card colour override is requested in the skin format. The frames must also work without it. |

Still open for step 2: Sworn/Oathbreaker as side names, the interface font, and the Turkish terms (taken from the official translation, not coined).
