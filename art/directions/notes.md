# Entrika: art direction

The chosen direction, as shown on the comparison page (`index.html`, published as an artifact). Round 3 redrew every card after looking at published card games. The base is still direction B, the Ottoman miniature: paper, gold leaf, lapis and vermilion, and backs taken from Ottoman bookbinding. Each card type now has its own enamel or material, and the photos carry only a faint warm grade. All ornament is drawn in SVG and CSS; the show stills are the only photos.

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
  - Every card type has its own base: red velvet (Character), lapis or malachite enamel (Kul), İznik glaze (Entrika), ferman paper with zerefşan gold flecks (Crisis), emerald enamel or black lacquer (Kader), plum (Hırs), teal or oxblood (Taraf).
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
  - square: Crisis.
- **A finial (alem)** sits on the arch apex of Character, Kader, Hırs and Taraf cards, as a crest does on rare cards.
- **A simplified frame at small sizes.** Under 150 px wide, the ornament drops out. What remains is a thick bevelled gold edge, the enamel line, two large gems, full-bleed art and a name bar. Under 90 px the name bar goes too. The ornament never turns to mush at 64 px.

## Palette

Page and paper:

| Token | Hex | Use |
|---|---|---|
| paper | `#f1e4c4` | text plates, paper cards, cartouches (as ivory gradient `#fffaea → #d9c08a`) |
| ink / ink-2 | `#2a1c12` / `#5b4630` | text |
| lapis | `#1f3c86` | Divan, Kul Kılık, Entrika back, Lütuf panel |
| vermilion | `#b3311d` | Harem, Traitor, Temel güç panel, names (`#6a1610` on ivory) |
| malachite | `#2d6a4e` | Loyal, Hizmet, Kul Özel |
| gold gradient | `#6b4710 → #d6ae55 → #fff0b4 → #c6963a → #7c5616 → #e9c96c → #b8892d → #6e4b12` | every metal part |

Enamel per card type (top of the radial gradient → bottom):

| Type | Enamel | Gem |
|---|---|---|
| Character | `#7b1d25 → #33090e` red velvet | crimson |
| Kul Kılık | `#244797 → #0b1a42` | cobalt |
| Kul Özel | `#2d6e50 → #0d2a1c` | emerald |
| Entrika | İznik glaze `#f5f1e6` with a cobalt, turquoise and red tile band | ivory |
| Crisis | ferman paper `#f3e6c6` with zerefşan | crimson |
| Hizmet / Hıyanet | `#22694b → #0a2a1c` / `#2a1a1e → #060304` | emerald / crimson |
| Hırs | `#5a2a55 → #1e0a1c` | plum |
| Taraf Sadık / Hain | `#17605f → #05201f` / `#3a0c10 → #070203` | teal / black |

Field gems: coral for Harem, cobalt for Divan, ivory for Saray, emerald for the Loyalty track, crimson for the Treason track. The field name is in `title` and `aria-label`; no text label is shown.

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
- **Tuğra** (`s-tugra`): an abstract tuğra (two beyze loops, three tuğ verticals with zülfe flags, two long arms). Embossed gold over a lapis shadow on the Crisis header and the Crisis back.
- **Köşebent and şemse**: gold corner pieces at the bottom of every front, and on the backs. The şemse is the almond medallion with pendants on the Entrika back.
- **Cetvel**: three coloured rules (lapis, vermilion, turquoise) on the paper cards.

## Card backs

| Deck | Back |
|---|---|
| Entrika and Boş Mektup | lapis binding, halkâri field, gold şemse with a rumi centre, keyhole, word |
| Kader | ebru paper, a large gold-bezelled crimson seal, word on an ivory cartouche |
| Taraf | sealed letter: ivory paper with zerefşan, envelope folds, a crimson wax seal with the mask icon |
| Hırs | plum binding, çintemani, a gold-bezelled plum gem |
| Crisis | ferman paper, halkâri panel, embossed tuğra |

The backs drop their word and plate under 150 px.

## Still treatment: the grade

- **Strength.** One variable, `s`, set to **0.15** by default. The page slider runs from 0 to 50%. Round 2's "85%" was a misreading, which left far too much red.
- **Midtone.** It moved from red to warm umber and gold. The tritone tables are:
  - R `0.045 0.28 0.60 0.88 1.00`
  - G `0.035 0.19 0.43 0.76 0.96`
  - B `0.030 0.11 0.24 0.52 0.84`
- **Mix.** `out = 0.8·s · tritone(luminance) + (1 − 0.8·s) · original`. At 0.15 that is 12% tritone, which reads as a faint candlelit warmth.
- **Baked copies.** The page applies the grade live, as an SVG filter. Baked copies at `s = 0.15` are in `art/stills/graded/` (and `graded/roster/`), made by the same formula. **The game should use the baked files.** If `s` changes, re-run the bake (`bake.py` maths: numpy `interp` over the five stops).
- **Rendering bug.** Chromium can paint an image black if it decodes after its SVG filter was first applied. The page re-touches the filter on each image `load` event. That is one more reason to bake.

## Portraits

- **Roster standard (unchanged).** `art/stills/roster/<id>.jpg`: 4:5, eye line at 37% from the top, face 36% of the height. On cards: `object-position: 50% 16–18%`.
- **Cut-out, demo only (not applied).** macOS Vision's foreground-mask request, run from a small Swift script, with no install and no upload. It was demoed on Hürrem and Süleyman from their full studio portraits (`art/stills/cutout/`).
  - The masks are clean on the studio portraits.
  - It has not been tried on candid screencaps, where busy backgrounds will mask less cleanly.

## Forks (both shown on the page)

1. **Art placement.**
   - **A, window (recommended):** the art sits in the arch on every card.
   - **B, full art:** the photo fills the card and the text sits on a translucent plate.
   - **C, breaking the frame:** a cut-out figure rises over the arch.

   A stays standard because most sources are small, and scene stills cannot carry full art. C is worth considering only for the eight Character cards, and only if cut-outs are approved. Süleyman's turban is the strongest case.
2. **Small-size frame.** A separate compact frame below 150 px (recommended, as built) versus scaling the full frame down. Scaled down, the full frame becomes noise at 120 px and is unreadable at 64 px.

## Card anatomy

There are seven slots:
1. corner gem (resolve order or type icon);
2. field gem (icon only, with a tooltip);
3. art window (arch per type, embossed molding);
4. name cartouche;
5. text plate (centred; Character has two panels, Temel güç with a red tab and Lütuf with a blue hatched tab; Kul has a Kılık or Özel ribbon; Crisis has a boxed draw line);
6. flavor line between fleurons;
7. frame (rim, enamel band, inner rule, köşebent, bottom drop).

There are no bottom badges. Geometry is a 500 × 700 unit drawing (1 unit = 0.2cqw), so the same markup scales from 64 to 258 px and beyond.

## Inline term icons

These are unchanged from round 2. `art/terms.json` drives one renderer with the regex `(?<![\p{L}\p{N}])(stems)(?:['’]\p{L}+|\p{L}*)` and flags `gu`. It runs on every `data-terms` element: effect text, power panels, the Kul ribbon and the draw line.

## Landscape phone sizes

The phone is held horizontally, at 852 × 393.
- **Detail view: 258 × 361.** The card fills the usable height. Body text is 4.35cqw ≈ 11.2 px, the minimum; do not show a full card narrower than about 240 px.
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
- Sahiplenilir, İsimsiz, Oyunda bir, Krizde bir;
- Kılık (recast) and Özel (special).

## Known weak spots

- **Photo versus painted art.** The stills are photos, while reference games use painted art, so the frame has to carry more of the "published" feel. Mitigations: the faint grade, the bevel and the cartouche shadows. Generated metal, leather and texture maps would add wear and grain that clean vector gold lacks. That is a proposal only, not used.
- **Low resolution.** İbrahim, Bali, Hatice and Nigar come from 300 px promo images and are soft at detail size.
- **No posed photo.** Daye, Lokman, Matrakçı, Gülşah, Şeker, Gülfem, Piri and Afife are candid screencaps.
- **Still missing.** Ayas Paşa and Kara Ahmed Paşa. Esma is an unconfirmed stand-in.
- **Hırs and Taraf** have no photo by design. They use drawn emblems; ebru and the emblem are placeholders a designer could refine.
- **Filter cost.** The page carries many SVG filters (bevel and shadow on every card). For the game, render each frame type once to an image, or keep the filters but bake the stills.
