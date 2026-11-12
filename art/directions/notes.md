# Entrika: art direction

The chosen direction, as shown on the comparison page (`index.html`, published as an artifact). Its base is direction B, the Ottoman miniature: burnished paper, flat gold leaf, lapis and vermilion, and card backs taken from Ottoman bookbinding. The stills carry direction A's red-to-gold grade at reduced strength. Direction A's own card style, and the UI mocks from round 1, are gone. Everything is plain CSS and inline SVG.

## Palette

| Token | Hex | Use |
|---|---|---|
| `--paper` | `#f1e4c4` | ground, card face (burnished *aharlı* paper) |
| `--paper-2` / `--paper-3` | `#e4d0a2` / `#d9c08a` | shade, table |
| `--ink` | `#2a1c12` | text, outlines (soot ink) |
| `--ink-2` | `#5b4630` | secondary text |
| `--lapis` | `#1f3c86` | Divan, Kul "Kılık", Intrigue back, primary buttons |
| `--vermilion` | `#b3311d` | names (red manuscript headings), Harem, Traitor |
| `--malachite` | `#2d6a4e` | Loyal, Hizmet, Kul "Özel" |
| `--gold` / `--gold-hi` | `#b88a2e` / `#dcb456` | gold leaf, medallions, frames |
| `--cherry` | `#5f1a22` | Kader back (*vişneçürüğü* leather) |

Paper fibre: an SVG `feTurbulence` tile at 9% opacity over every paper surface. Apart from the paper, colour is flat.

## Fonts

All three cover ğ ş ı İ ç ö ü.
- Display: Alegreya SC 700, in vermilion. Used for names and headings.
- Body: Alegreya 400, 700 and italic. Used for rules text and flavor.
- Label: Alegreya Sans SC 700. Used for panel labels, ribbons and buttons.

Put `lang="tr"` on the root, or uppercase and small caps turn "i" into "I" instead of "İ". Name boxes need a line-height of about 1.15, or `overflow:hidden` clips the dot of İ.

## Still treatment: the grade

Every still on a card gets one SVG filter, with a single strength variable `s` (`GRADE` in the build, the slider on the page). It is set at 0.85 for now, and the designer settles the final value with the slider (50–100%).

1. Luminance → red-to-gold tritone (`feComponentTransfer` tables):
   R `0.035 0.29 0.64 0.93 1`, G `0.02 0.045 0.24 0.72 0.95`, B `0.025 0.06 0.14 0.46 0.82`.
2. Mix with the original colour: `feComposite arithmetic k2 = 0.8·s, k3 = 1 − 0.8·s`. At `s = 1` that is A's round-1 grade; at 0.85 it is 68% tritone, 32% original.
3. No vignette or glow. The paper frame does the framing.

For the game, bake the grade into the image files at build time (sharp or ImageMagick, same tables, the chosen `s`) and drop the live filter. That is lighter on phones and avoids filter differences in Safari.

## Portraits: the roster standard

Every card that shows a person uses `art/stills/roster/<id>.jpg`. That covers Characters, Kul cards, and Intrigue cards that are just a person (so far Valide'nin Buyruğu).
- Crop: 4:5, chest up, centred on the face. The eye line is at 37% from the top, and the face box is 36% of the height.
- When a source is too tight for that framing, the crop zooms in and records a higher `face_share` in the manifest. Lokman Ağa (0.54) and the Esma stand-in (0.56) are the outliers.
- Sources come in this order of preference: studio cast portraits from the producer's site (TIMS Productions), then posed season promo portraits (TVMaze character images, IMDb promo), then a chest-up screencap.
- On the card, the 4:5 portrait sits in the art window at `object-position: 50% 18%`, which shows the head and shoulders.
- Backgrounds still vary: black studio, patterned backdrop, white, outdoors, palace rooms. The grade evens out the colour but not the backdrop. Cutting out the backgrounds would make the set uniform; that has been proposed and is not done.

## Card anatomy

One skeleton for every card type, 5:7. All sizes are in container units (`cqw`), so the same component renders at every size.

| Slot | What it holds |
|---|---|
| 1 Corner medallion (9.5cqw) | Intrigue: resolve order 1–10. Others: type icon. Kader: seal, ticked or cracked |
| 2 Name (centred, up to 2 lines) | Vermilion. On Kul cards, paper-coloured on a lapis (Kılık) or malachite (Özel) plate |
| 3 Field icon (9.5cqw disc, icon only) | Harem (vermilion) or Divan (lapis). The name is in `title` and `aria-label`. Saray shows a split disc. Kader shows its track. Characters leave it empty |
| 4 Art window (60cqw tall) | Pointed arch with a gold and lapis line. Kul cards use a rounded arch with an inset frame |
| 5 Kul ribbon | Kul cards only: "Kılık · krizde bir" (lapis) or "Özel · …" (malachite) |
| 6 Effect text (centred) | Game terms carry their icon (see below). Characters: two separate panels, Temel güç (vermilion icon) and Lütuf (lapis, hatched, "Hırs ile açılır"). Crisis: a boxed draw line |
| 7 Flavor line | One italic line between two gold fleurons. Never carries rules |

- There are no footer badges. "Must claim" is written into the text ("Açılışta sahiplen"), and frequency sits in the panel label or the Kul ribbon.
- Under 150 px wide, a card shows slots 1–4 only. That is the hand and table view.
- Card backs follow Ottoman bookbinding: a gold almond medallion (*şemse*) with pendants, gold corner pieces (*köşebent*) and a double gold frame. Intrigue is lapis, Kader is cherry. Intrigue and Boş Mektup share a back, and Hizmet and Hıyanet share a back.

## Inline term icons

- `art/terms.json` lists every game term as `{ "id", "stems": [...], "icon" }`, with ids from the manual (`term.*`, `card.*`) and icons from the sprite (`#i-*`).
- One renderer builds a single regex from all stems, longest first: `(?<![\p{L}\p{N}])(stems)(?:['’]\p{L}+|\p{L}*)` with flags `gu`. It wraps each hit as icon plus word, kept together by `nowrap`.
- Suffixes stay attached: Nüfuzu, Vekile, Divan'da, Tertip'te.
- `\b` cannot be used: it treats ı, ş and ğ as word breaks.
- Matching is case-sensitive. Lowercase stems are listed only where a term is written in lowercase (sahiplen, krizde bir, oyunda bir).
- A short stem also catches longer unrelated words that start with it, such as Kul in "Kullan". Avoid starting card text with such a word, or add an exception.
- The renderer runs on elements marked `data-terms`: effect text, power text, Kul ribbon and draw line. It skips names, panel labels and flavor.

## Icons

- One sprite of 41 icons on a 24-unit grid: stroke 1.6, round caps and joins, no fills.
- It covers all 37 icons in the manual's sprite, redrawn, plus `saray` (palace gate), `seal` (Kader back), `claim` (speech mark) and `anon` (hood).
- Colour only marks meaning: Harem and Traitor are vermilion, Divan lapis, Loyal malachite, Influence and Süleyman gold.
- They read at 16, 20 and 24 px. Inline in text they are 1.05em and inherit the meaning colour.

## Landscape phone sizes

The game is played with the phone held horizontally (852 × 393 CSS px on a current iPhone).
- **Detail view.** A card fills the usable height: about 361 px tall, so 258 px wide. Body text is then 4.55cqw ≈ 11.7 px and panel text 4.25cqw ≈ 11 px, which is the floor. Do not show a full card smaller than about 240 px wide.
- **Table and in-play cards.** Around 120 px wide, in the compact view: medallion, name, field icon and art.
- **Hand.** Around 64 px wide, also compact. Four or five fit along the bottom edge, with room for the rest of the board above.
- **Icons.** 16 px in running UI text, 20–24 px as buttons or track markers.
- Portrait art is 4:5, but the art window is wider than tall. Because of the roster crop it still shows head and shoulders at every size.

## Motion

The reveal turns every placed card at the same moment: `rotateY(180deg)` over 0.9 s on `cubic-bezier(.45,.05,.2,1)`. The card lifts 10 px at the midpoint, like a page turning, and an ink shadow fades off each face. There is no stagger, because placement order is secret. `prefers-reduced-motion` swaps the turn for a fade.

## Turkish terms (decided)

| Concept | Term |
|---|---|
| Ministers | Birinci Vekil / İkinci Vekil (Vekil) |
| Court step | Tertip |
| Ambition | Hırs |
| Companion | Kul |

These are also used on the page:
- Character → Karakter, Intrigue → Entrika, Crisis → Kriz, Influence → Nüfuz, Loyalist → Sadık, Traitor → Hain.
- Loyalty/Treason track → Sadakat/İhanet yolu, Decree → Hüküm, Objection → İtiraz, Base power → Temel güç, Favor power → Lütuf.
- must claim → Sahiplenilir, anonymous → İsimsiz, once per game → Oyunda bir, once per crisis → Krizde bir, always → Her zaman, Allegiance → Taraf.
- Recast and Special Kul → Kılık and Özel.

## Known weak spots

- **Low-resolution promos.** Pargalı İbrahim, Bali Bey, Hatice, Nigar and the second candidates come from 300 px promo images (TVMaze), so they are soft at detail size.
- **No posed photo.** Daye, Lokman, Matrakçı, Gülşah, Şeker, Gülfem, Piri and Afife only have candid screencaps cropped to the roster frame.
- **Esma.** Still an unconfirmed stand-in.
- **Ayas Paşa and Kara Ahmed Paşa.** Still missing; see `art/stills/manifest.json`.
