# Entrika: art direction

The chosen direction, as shown on the comparison page (`index.html`, published as an artifact). Round 3 redrew every card after looking at published card games. Round 4 applied the designer's decisions on art placement, Kul cards, the tuğra and text size (see Decisions). The base is still direction B, the Ottoman miniature: paper, gold leaf, lapis and vermilion, and backs taken from Ottoman bookbinding. Each card type now has its own enamel or material, and the photos carry only a faint warm grade. All ornament is drawn in SVG and CSS; the show stills are the only photos.

## Decisions (round 5)

- **One name line.** The name cartouche sits at the same height on every card type: centre at y = 380 of 700, which is 181 px from the top at 258 px wide. Windows end there and text plates start below it.
  - On every type the text plate starts directly under the name (y 422) and runs to the bottom margin (y 650); there is no gap between name and plate.
  - On full-art Crisis cards the scene runs behind the whole card. The plate is translucent paper over it (72–84% opacity with a light blur and the tuğra watermark), and the sentence is centred in it at 5.4cqw.
  - The compact frame (under 150 px) keeps its own name bar at the bottom, as before.
- **Frequency as icons only.** Oyunda bir, Krizde bir and Her zaman are small dark-bronze discs with a gold ring at the start of the effect. The words are in `title` and `aria-label`, like the field gems.
  - The icons, in the existing stroke style: `once` (circle with a serifed 1), `percrisis` (circular arrow around a dot), `always` (infinity). They stay distinct at 16 px.
  - In `terms.json` these three entries carry `"display": "icon"` and a `tooltip`.
- **Character powers without tabs.** Each power reads "Name: description" in its own panel. The base power is roman in the red-edged panel. The Hırs-unlocked power is entirely italic (name and text) in the blue hatched panel.
- **Crisis text.** One sentence from the manual, timed to the Crisis flip, with term icons. The "Tertip: yalnız …" line and the "Çekiliş." label are gone; the field gem carries the field.
- **Portrait backdrop.** The Character cut-outs now sit on their own lit studio backdrop, not the frame's red velvet. It is a dark warm umber gradient (`#4d4238 → #120e0b`) with a soft gold halo behind the head (`#f0d6a0` at 75%, fading out) and a vignette. The figure separates from the frame, as in a cast promo.
  - The alternative, shown on Hürrem and Süleyman, is a lapis dusk (`#2b4a8f → #0a1230`) with zerefşan gold flecks and a pale halo. It is more Ottoman, but cooler, and it competes with the Kul cards' lapis.
- **Short Character names.** Süleyman, Hürrem, Pargalı, Mahidevran, Malkoçoğlu, Hatice, Mihrimah, Rüstem. They are used on the cards, in the roster and as `terms.json` stems (`char.*`, with the character icon; Süleyman stays `term.suleyman`). Kul names are unchanged.
- **Fields are only tags.** Nothing on the page shows a Harem or Divan zone. Cards are played in front of the targeted Character; the field is the gem on the card.

## Decisions (round 4)

- **Art placement.**
  - **A, window:** the art sits in the arch. This is the standard for Kul, Entrika, Kader, Hırs and Taraf.
  - **C, figure breaking the frame:** all eight Characters, at detail size.
    - Each portrait is cut out with macOS Vision (locally) and set on one shared backdrop: deep red velvet with the gold kaftan lattice.
    - Only the head breaks over the arch. The cut-out layer is a band 64% of the window wide, ending at the arch's spring line, so the hair and shoulders at the sides stay inside.
    - At 120 and 64 px the compact frame shows the same cut-out on the same backdrop, without the break. (Round 5 replaced the shared red-velvet backdrop with a lit studio backdrop.)
  - **B, full art:** all ten Crisis cards. The scene fills the card inside the gold rim; the name cartouche and a translucent text plate sit on top.
- **Kul: one look.** Lapis enamel, round arch, enamel cartouche with gold lettering. The Kılık/Özel ribbons and the malachite variant are gone.
- **Frequency inline.** How often an effect works opens the effect text (round 5: as an icon only, words in a tooltip).
  - Frequencies come from the manual: recast Kul are once per crisis; Kara Ahmed, Piri and Esma are once per game; Afife is always on.
  - Character powers are once per game, except İbrahim's Divan Nüfuzu (always) and Süleyman's Lütuf (none).
- **Real tuğra.** Süleyman's tuğra (Wikimedia Commons, public domain; see `art/stills/manifest.json` → `tugra`) replaces the drawn one.
  - It is embossed gold on black-green lacquer on the Kriz back.
  - It is a faint watermark behind every Crisis text plate.
  - The sanitised SVG is `art/stills/tugra-suleyman.svg`, painted with `currentColor`.
- **Boş Mektup removed** from the cards, the icon set and `terms.json`. The digital game doesn't need it.
- **Text size.** Body text is 5cqw (12.9 px at 258), power text 4.7cqw (12.1 px), and the draw line 4.7cqw. Round 3 used 4.35 and 4.1.
  - Long power texts were tightened. (Round 5 then fixed the name line at y = 380 on every type.)
- **AI-generated textures:** deferred.

## What makes the cards read as finished

These are the points taken from the reference games (Hearthstone, Runeterra, Gwent, Marvel Snap, Inscryption, Secret Hitler, Coup, Avalon, Citadels, Bang!, Blood on the Clocktower, Dead of Winter, Love Letter, 7 Wonders), and what replaced the flat round-2 card:

- **Layered frame with real depth.** The frame stacks six layers:
  1. a bevelled gold rim (an SVG specular-light filter on a gold gradient);
  2. a thin dark line;
  3. an enamel band filled with a rumi pattern;
  4. an inner gold rule;
  5. a patterned field;
  6. an embossed gold molding around the art window.

  Round 2 used flat 1-px rules, which is what made it look templated.
- **Material.**
  - Gold is an eight-stop gradient with a bright highlight band, not a flat colour.
  - Every card type has its own base: red velvet (Character), lapis enamel (Kul), İznik glaze (Entrika), ferman paper with zerefşan gold flecks under full art (Crisis), emerald enamel or black lacquer (Kader), plum (Hırs), teal or oxblood (Taraf).
  - A leather grain sits over the enamels, and paper fibre over the paper.
- **Name cartouche.** An Ottoman cartouche with scrolled ends sits on the seam between the art and the text, as Hearthstone's name banner does. It casts a shadow on both, which gives the card depth.
- **Gems that break the frame.**
  - The corner medallion is a cabochon in a scalloped gold bezel, overlapping the frame corner like Hearthstone's mana gem.
  - The field marker is a second gem: coral for Harem, cobalt for Divan.
  - Both stay readable at 64 px.
- **Text plate.** Inset paper with an inner shadow, a gold-and-ink double edge and gold corner triangles. Text is centred and terms carry their icons.
- **One silhouette per type.** The arch shape tells the type at a glance:
  - pointed: Character, Kader, Hırs, Taraf;
  - round: Kul;
  - lobed: Entrika;
  - none: Crisis, which is full art.
- **A finial (alem)** sits on the arch apex of Character, Kader, Hırs and Taraf cards, as a crest does on rare cards.
- **A simplified frame at small sizes.** Under 150 px wide, the ornament drops out. What remains is a thick bevelled gold edge, the enamel line, two large gems, full-bleed art and a name bar. Under 90 px the name bar goes too. The ornament never turns to mush at 64 px.

## Palette

Page and paper:

| Token | Hex | Use |
|---|---|---|
| paper | `#f1e4c4` | text plates, paper cards, cartouches (as ivory gradient `#fffaea → #d9c08a`) |
| ink / ink-2 | `#2a1c12` / `#5b4630` | text |
| lapis | `#1f3c86` | Divan, Kul, Entrika back, Lütuf panel |
| vermilion | `#b3311d` | Harem, Traitor, Temel güç panel, names (`#6a1610` on ivory) |
| malachite | `#2d6a4e` | Loyal, Hizmet |
| gold gradient | `#6b4710 → #d6ae55 → #fff0b4 → #c6963a → #7c5616 → #e9c96c → #b8892d → #6e4b12` | every metal part |

Enamel per card type (top of the radial gradient → bottom):

| Type | Enamel | Gem |
|---|---|---|
| Character | `#7b1d25 → #33090e` red velvet | crimson |
| Kul | `#244797 → #0b1a42` | cobalt |
| Entrika | İznik glaze `#f5f1e6` with a cobalt, turquoise and red tile band | ivory |
| Crisis | full-art scene; ferman paper `#f3e6c6` with zerefşan under it | crimson |
| Hizmet / Hıyanet | `#22694b → #0a2a1c` / `#2a1a1e → #060304` | emerald / crimson |
| Hırs | `#5a2a55 → #1e0a1c` | plum |
| Taraf Sadık / Hain | `#17605f → #05201f` / `#3a0c10 → #070203` | teal / black |

Field gems: coral for Harem, cobalt for Divan, split coral and cobalt for Saray, emerald for the Loyalty track, crimson for the Treason track. The field name is in `title` and `aria-label`; no text label is shown.

## Fonts

All three cover ğ ş ı İ ç ö ü.
- Display: Alegreya SC 700. Names are set in `#6a1610` on ivory, or in `#ffe6a0` on enamel cartouches (Kul).
- Body: Alegreya 400, 700 and italic.
- Label: Alegreya Sans SC 700. Used for power-panel tabs and the Kul ribbon.

Put `lang="tr"` on the root. Name boxes need a line-height of at least 1.05, or the İ dot clips.

## Ornament (all drawn here as SVG, in `#g-*`, `#p-*` and `#s-*` defs)

- **Rumi band** (`p-rumi`): small gold split-leaf rumi motifs, used on the enamel frame band.
- **Kaftan ogival lattice** (`p-ogival`): the field behind the Character art.
- **Halkâri** (`p-halkari`): gold-line scrolls on the Kul, Kader and Hırs fields, and on the Entrika back.
- **Çintemani** (`p-cintemani`): three balls and wavy lines, on Hırs and Taraf.
- **İznik tile** (`p-iznik`, `p-saz`): a cobalt tulip, turquoise leaves and a red dot, for the Entrika band and field.
- **Zerefşan** (`p-zerefsan`): gold flecks on ferman paper, for Crisis.
- **Ebru** (`g-ebru` plus `f-ebru`): striped colour bands bent through two turbulence displacements, for the Kader back and the Hırs art.
- **Tuğra** (`s-tugra`): Süleyman the Magnificent's real tuğra, from a public-domain Wikimedia Commons trace (`art/stills/tugra-suleyman.svg`). It is sanitised to bare geometry and painted with `currentColor` plus a 5-unit stroke for body. It appears in embossed gold on the Crisis back and as a 16% gold watermark behind every Crisis text plate.
- **Köşebent and şemse**: gold corner pieces at the bottom of every front, and on the backs. The şemse is the almond medallion with pendants on the Entrika back.
- **Cetvel**: three coloured rules (lapis, vermilion, turquoise) on the paper cards.

## Card backs

| Deck | Back |
|---|---|
| Entrika | lapis binding, halkâri field, gold şemse with a rumi centre, keyhole, word |
| Kader | ebru paper, a large gold-bezelled crimson seal, word on an ivory cartouche |
| Taraf | sealed letter: ivory paper with zerefşan, envelope folds, a crimson wax seal with the mask icon |
| Hırs | plum binding, çintemani, a gold-bezelled plum gem |
| Crisis | black-green lacquer with halkâri and zerefşan; Süleyman's tuğra in embossed gold over a dark offset; word on an ivory cartouche |

The backs drop their word and plate under 150 px.

## Still treatment: the grade

- **Strength.** One variable, `s`, set to **0.15** by default. The page slider runs from 0 to 50%. Round 2's "85%" was a misreading, which left far too much red.
- **Midtone.** It moved from red to warm umber and gold. The tritone tables are:
  - R `0.045 0.28 0.60 0.88 1.00`
  - G `0.035 0.19 0.43 0.76 0.96`
  - B `0.030 0.11 0.24 0.52 0.84`
- **Mix.** `out = 0.8·s · tritone(luminance) + (1 − 0.8·s) · original`. At 0.15 that is 12% tritone, which reads as a faint candlelit warmth.
- **Baked copies.** The page applies the grade live, as an SVG filter. Baked copies at `s = 0.15` are in `art/stills/graded/` (and `graded/roster/`), made by the same formula. **The game should use the baked files.** If `s` changes, re-run the bake (`bake.py` maths: numpy `interp` over the five stops).
- **Rendering bug.** Chromium can paint an image blank or black if it decodes after its SVG filter was first applied. The page works around it in two ways: card images use `decoding="sync"`, and each image's filter is dropped and restored once it loads. That is one more reason to bake.

## Portraits

- **Roster standard (unchanged).** `art/stills/roster/<id>.jpg`: 4:5, eye line at 37% from the top, face 36% of the height. On cards: `object-position: 50% 16–18%`.
- **Character cut-outs (applied, fork C).** macOS Vision's foreground-mask request, run from a small Swift script, with no install and no upload.
  - It was run on all eight Character stills. The results are in `art/stills/cutout/` as full-size PNGs; the page uses 600 px WebP copies.
  - Placement per character is in `cutplace.json` on the page side and the manifest (`entities.char.*.cutout`). It is computed from the detected face: the face is 25cqw tall, centred at x 50, y 32, and the photo always covers the window down to the name line.
  - The masks are clean on the five studio portraits (Süleyman, Hürrem, Mahidevran, Mihrimah, Rüstem).
  - İbrahim, Bali and Hatice are cut from 300 px promo images. Their edges are fine, but the images are soft at 258 px on a retina screen (about 1.4 device px per CSS px; 2 is needed).

## Crisis full art: resolution

A full-art card shows a 5:7 slice of a landscape still. At 258 px on a retina phone it needs about 2 device px per CSS px (source height ≥ 755 px).

| Crisis | Source | Px per CSS px | Verdict |
|---|---|---|---|
| Macar Seferi | 1600×1067 | 2.8 | sharp |
| Şehzade Meselesi | 1550×1024 (candidate 2, promo) | 2.7 | sharp |
| Yeniçeri İsyanı | 931×607 (candidate 2) | 1.6 | soft on retina |
| Kaybolan Mühür, İstanbul'da Dedikodu, Sınırda İsyan | 931×607 | 1.6 | soft on retina |
| Divan Kavgası | 800×598 | 1.6 | soft on retina |
| Haremde Skandal | 800×533 | 1.4 | soft on retina |
| Hazine Açığı, Venedik Elçiliği | 720×400, 641×400 | 1.1 | low: needs a better still |

Yeniçeri and Şehzade switched to their sharper second candidates for full art.

## Small-size frame

Below 150 px every card uses a separate compact frame. Scaling the full frame down turns it to noise at 120 px and makes it unreadable at 64 px.

## Card anatomy

There are seven slots:
1. corner gem (resolve order or type icon);
2. field gem (icon only, with a tooltip);
3. art window (arch per type, embossed molding);
4. name cartouche;
5. text plate (centred; every effect opens with a frequency icon, its words in a tooltip; Character has two untitled panels, the base power roman and the Hırs power italic; Crisis has one sentence on who draws when it flips);
6. flavor line between fleurons (none on Crisis cards);
7. frame (rim, enamel band, inner rule, köşebent, bottom drop).

There are no bottom badges. Geometry is a 500 × 700 unit drawing (1 unit = 0.2cqw), so the same markup scales from 64 to 258 px and beyond.

## Inline term icons

`art/terms.json` drives one renderer with the regex `(?<![\p{L}\p{N}])(stems)(?:['’]\p{L}+|\p{L}*)` and flags `gu`. It runs on every `data-terms` element: effect text, power panels and the draw line. It skips frequency pills (`data-noterms`) and power names (`.pn`), so a power called Kulis doesn't pick up the Kul icon. Boş Mektup is no longer in the table.

## Landscape phone sizes

The phone is held horizontally, at 852 × 393.
- **Detail view: 258 × 361.** The card fills the usable height. Body text is 5cqw ≈ 12.9 px and power text 4.7cqw ≈ 12.1 px. Don't show a full card narrower than about 240 px.
- **Table: about 120 px.** The compact frame: gems, art and name bar.
- **Hand: about 64 px.** Gems and art only. The type reads from the enamel colour and the gem.
- **Icons:** 16 px in UI text, 20–24 px as buttons or track markers.

## Turkish terms

| Concept | Term |
|---|---|
| Ministers | Birinci Vekil / İkinci Vekil |
| Court step | Tertip |
| Ambition | Hırs |
| Companion | Kul |
| Allegiance | Taraf |

The rest are as in round 2:
- Nüfuz, Sadık and Hain, Hüküm, İtiraz, Temel güç, Lütuf;
- Sahiplenilir, İsimsiz, Oyunda bir, Krizde bir, Her zaman.

## Known weak spots

- **Photo versus painted art.** The stills are photos, while reference games use painted art, so the frame has to carry more of the "published" feel. Generated metal, leather and texture maps are deferred to a later round.
- **Low resolution.**
  - İbrahim, Bali, Hatice and Nigar come from 300 px promo images and are soft at detail size; the first three are Character cut-outs.
  - Hazine Açığı and Venedik Elçiliği are too low-res for full art.
- **No posed photo.** Daye, Lokman, Matrakçı, Gülşah, Şeker, Gülfem, Piri and Afife are candid screencaps.
- **Still missing.** Ayas Paşa and Kara Ahmed Paşa. Esma is an unconfirmed stand-in.
- **Hırs and Taraf** have no photo by design. They use drawn emblems; ebru and the emblem are placeholders a designer could refine.
- **Filter cost.** The page carries many SVG filters (bevel and shadow on every card). For the game, render each frame type once to an image, or keep the filters but bake the stills.
