# Entrika: art directions A and B

The two directions shown in `index.html` (the published comparison page). Both use the same stills from `art/stills/`. The difference is the treatment: crop, frame, colour and ornament. When one is picked, its tokens below carry into the game. Everything is plain CSS and inline SVG.

## Shared rules (both directions)

**Card anatomy.** One skeleton for every card type, 5:7. All sizes are in container units (`cqw`), so the same component renders at hand size and at detail size.

| Slot | Position and size | Intrigue | Character | Companion | Crisis | Kader |
|---|---|---|---|---|---|---|
| 1 Corner medallion | top-left, 14cqw circle | resolve order 1–10 | character icon | companion icon | crisis icon | seal, ticked or cracked |
| 2 Name | top row, up to 2 lines | | | | | |
| 3 Field badge | top-right pill | Harem / Divan | empty | the field of the card it recasts as | the field it opens | Sadakat / İhanet |
| 4 Art window | 62cqw tall, full width | still | portrait | portrait | scene | scene |
| 5 Effect text | flexible | effect | Base and Favor powers | recast rule | field rule plus a boxed draw line | track and Decree |
| 6 Flavor line | one line, italic | | | | | |
| 7 Footer badges | bottom row | claim/anonymous, category, ×copies | power badges | per-crisis, claim | night field, number | count in deck |

- Under 150 px wide, a card shows only slots 1, 2 and 4 (`@container (max-width:150px)`). That is the hand view.
- Card backs: Intrigue and Boş Mektup share one back. Hizmet and Hıyanet share another. That is a rule, not a style choice: a back must never tell the kinds apart.
- Portrait crop: head and shoulders, eyes in the upper third. Each still in `manifest.json` has a `focus` point; use it as `object-position`.

**Icons.** One sprite (`#i-*` symbols in the page). 24-unit grid, stroke 1.6, round caps and joins, no fills. 41 icons: all 37 in the manual's sprite, redrawn, plus `saray` (palace gate), `seal` (the Kader back), and separate `claim` (speech mark) and `anon` (hood) icons. The manual reuses the public and secret eyes for those two. Colour only marks meaning: fields, sides, Influence. Some choices are specific to the setting: Influence is an eight-point star, Süleyman is the ceremonial turban with its plume, Süleyman's death is an Ottoman headstone with a turban, Intrigue is a keyhole in a pointed arch, Court is a crescent.

**Motion.** The reveal turns every placed card at the same moment (`rotateY(180deg)`, one class on the table). No stagger, because placement order is secret. `prefers-reduced-motion` swaps the turn for a fade.

**Turkish UI terms (proposed).** The manual is in English. The page uses these Turkish terms, which should go into the string table:
Character → Karakter, Companion → Musahip, Intrigue → Entrika, Crisis → Kriz, Influence → Nüfuz, First/Second Minister → Birinci/İkinci Vezir, Loyalist → Sadık, Traitor → Hain, Loyalty/Treason track → Sadakat/İhanet yolu, Court → Gece, Decree → Hüküm, Objection → İtiraz, Ambition → Emel, Base power → Temel güç, Favor power → Lütuf, must claim → Sahiplenilir, anonymous → İsimsiz, once per game → Oyunda bir, once per crisis → Krizde bir, always → Her zaman, Allegiance → Taraf, field → Alan, resolve order → çözüm sırası. Kader, Hizmet, Hıyanet, Boş Mektup, Divan, Harem and Saray stay as they are. "Musahip" (the sultan's companion) is the least obvious choice; "Yardımcı" is the plain alternative.

**Turkish casing.** Put `lang="tr"` on the root. Without it, CSS uppercase turns "i" into "I" instead of "İ". Name boxes need a line-height of about 1.15: at 1.0, `overflow:hidden` clips the dot of İ.

**Performance.** The page applies the colour treatments live with SVG filters. For the game, bake the treatment into the image files at build time (sharp or ImageMagick, same numbers as below) and keep only the overlays and frames in CSS. That is lighter on phones and avoids any filter differences in Safari.

## A · Karanlık saray dramı (dark palace drama)

Deep red, black and gold, lit by candles like the show's opening. Each still is reduced to a red-to-gold tritone and framed in a chamfered gold rule.

**Palette**

| Token | Hex | Use |
|---|---|---|
| `--ink` | `#0d0708` | ground, card face |
| `--ink-2` | `#1b0c0f` | raised surfaces |
| `--oxblood` | `#4a0e16` | velvet, Intrigue back |
| `--crimson` | `#962230` | Traitor, Hıyanet, danger |
| `--gold` | `#c9a14a` | frames, rules, icons |
| `--gold-hi` | `#f0d48b` | names, highlights |
| `--gold-lo` | `#7d6127` | inner frame line |
| `--candle` | `#ffb45c` | glow, used only as light |
| `--text` / `--text-2` | `#f1e3c8` / `#b9a07d` | body text / secondary |
| field Harem | `#b8354a` (badge text `#f08c9b`) | Divan uses gold |
| side Loyal | `#2d6a4e` (text `#9fe0b8`) | Hizmet, Sadakat |

**Fonts** (all cover ğ ş ı İ ç ö ü):
- Display: Bodoni Moda 600, italic 500 for flavor lines. Used for names, titles and numbers.
- Body: Source Sans 3, 400 and 600. Used for rules text.
- Label: Barlow Semi Condensed 600, uppercase, tracking 0.08–0.12em. Used for badges, steps and buttons.

**Ornament rules**
- Card frame: three inset rules, a thin dark-gold line, a black gap and a gold line (`box-shadow` insets).
- Art window: corners cut at 3cqw (`clip-path` octagon) with a 0.5cqw gold hairline.
- Intrigue back: oxblood velvet radial, a gold lattice at ±45° (the harem *kafes*), and a gold eight-point star medallion holding the keyhole. Kader back: black with faint gold rays and the same medallion holding the unbroken seal. Wordmark in Bodoni, tracked wide.
- Buttons: gold gradient `#d6b25a → #a9832f`, dark text.
- No other patterns. Darkness is the ornament.

**Still treatment**
1. Luminance → tritone (SVG `feComponentTransfer` tables):
   R `0.035 0.29 0.64 0.93 1`, G `0.02 0.045 0.24 0.72 0.95`, B `0.025 0.06 0.14 0.46 0.82`.
2. Mix 80% tritone with 20% original colour (`feComposite arithmetic k2=.8 k3=.2`), so skin stays human.
3. Candle glow: radial `rgba(255,176,92,.38)` from the top-left, `mix-blend-mode:screen`.
4. Vignette: radial to `rgba(8,3,4,.82)` at the edges.
5. Crop: tight. Faces fill the window; for scenes, crop to the action.

**Motion.** Cards turn in 0.78 s on `cubic-bezier(.3,.7,.2,1)`. A candle flare lights the table, then a gold glint sweeps each face.

## B · Osmanlı minyatürü (Ottoman miniature)

Burnished cream paper, flat gold leaf, lapis and vermilion. Each still is flattened into posterized colour planes, printed onto the paper, and seen through a pointed arch.

**Palette**

| Token | Hex | Use |
|---|---|---|
| `--paper` | `#f1e4c4` | ground, card face (burnished *aharlı* paper) |
| `--paper-2` | `#e4d0a2` | table, shade |
| `--ink` | `#2a1c12` | text, outlines (soot ink) |
| `--ink-2` | `#5b4630` | secondary text |
| `--lapis` | `#1f3c86` | Divan, Intrigue back, primary buttons |
| `--vermilion` | `#b3311d` | names (rubrication), Harem, Traitor |
| `--malachite` | `#2d6a4e` | Loyal, Hizmet, Sadakat |
| `--gold` / `--gold-hi` | `#b88a2e` / `#dcb456` | gold leaf, medallions |
| `--cherry` | `#5f1a22` | Kader back (*vişneçürüğü* leather) |

**Fonts** (all cover ğ ş ı İ ç ö ü):
- Display: Alegreya SC 700, set in vermilion like the red headings of a manuscript. Used for names and titles.
- Body: Alegreya 400, 700 and italic. Used for rules text and flavor.
- Label: Alegreya Sans SC 700. Used for badges, steps and buttons.

**Ornament rules**
- Card frame: the ruled border of a manuscript page (*cetvel*), drawn as inset rules: gold 1.4cqw, ink hairline, paper gap, lapis hairline.
- Art window: a pointed arch (CSS `mask` with an SVG path), outlined in gold with a lapis inner line.
- Card backs follow Ottoman bookbinding: a gold almond medallion (*şemse*) with pendants top and bottom, gold corner pieces (*köşebent*) and a double gold frame. Intrigue is lapis; Kader is cherry leather. The keyhole or the seal and the word sit inside the şemse.
- Flavor lines sit between two small gold fleurons (❦).
- Paper fibre: an SVG `feTurbulence` tile at 9% opacity over every paper surface.
- No gradients except the paper. Colour is flat.

**Still treatment**
1. Soften: `feGaussianBlur` 1.1, which stops posterization from turning JPEG noise into speckle.
2. Lift: linear slope 1.18, intercept 0.04–0.06 per channel. Miniatures have few deep blacks.
3. Saturate 1.2.
4. Posterize to six warm steps (`feComponentTransfer discrete`):
   R `0.32 0.50 0.66 0.80 0.92 0.99`, G `0.24 0.40 0.56 0.71 0.86 0.95`, B `0.22 0.33 0.46 0.60 0.74 0.84`.
5. `mix-blend-mode:multiply` over paper, so highlights become paper.
6. Crop: a little looser than A. The arch needs headroom; keep the face below the arch's shoulders.

**Motion.** Cards turn like a page: 0.9 s on `cubic-bezier(.45,.05,.2,1)`, lifting 10 px at the midpoint, with an ink shadow that fades off each face.

## Known weak spots

- Most portraits are 720×400 screencaps, which is enough for phone cards and soft at large sizes. A takes this better than B, because posterization exaggerates blur and compression.
- Season 4 stills (older Süleyman, Vahide Perçin as Hürrem) are mixed in among the scenes. Portraits are from seasons 1–3.
- See `art/stills/manifest.json` for missing slots (Ayas Paşa, Kara Ahmed Paşa), stand-ins and source concerns.
