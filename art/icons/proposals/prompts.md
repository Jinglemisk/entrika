# Icon prompt templates

Two styles proposed for the term icons. The comparison page is `index.html` in this folder; the generated files are in `mine/` (A) and `muhur/` (B).

Each icon is one `codex exec` call that uses Codex's built-in `image_gen` tool. Only the `Subject` line (and, in A, the `enamel` clause) changes from icon to icon. Everything else is a fixed anchor, so the full set comes out consistent.

## How a set is made

1. Generate the key icon (Divan) without a reference.
2. Generate every other icon with the key attached (`codex exec -i <key>.png`) and the reference line below added after `Asset type`.
3. Post-process:
   - **A:** keep the generated alpha.
   - **B:** turn the black ink into alpha over pure black, so the game can use the file as a CSS mask and tint it.
   - **Both:** crop to the content, pad to a square with a 6% margin on each side, and save a 512 px master plus 144, 72 and 48 px copies.

Every prompt starts with:

```
Generate exactly one image with your image_gen tool, then stop. Do not run shell commands and do not write files.
```

Reference line (every icon except the key):

```
Input images: Image 1 is a style reference from the same icon set. Match its material, contour weight, lighting, colour handling and level of detail exactly. Do not copy its subject or its shape.
```

## A · Varak ve mine (relief-gilded enamel)

```
Use case: logo-brand
Asset type: one game UI icon for "Entrika", an Ottoman court card game drawn like a 16th-century Ottoman manuscript. Used from 16 px to 48 px: inline before words in card text and inside small round gold gem bezels on cards.
Subject: {subject}
Style/medium: a relief-gilded emblem, like a raised gold-leaf ornament on an Ottoman manuscript page or an enamelled gold jewel. A solid, bold silhouette built from a few large shapes. Burnished gold with a bevelled edge: a bright pale-gold highlight along the top-left edges and deeper amber gold in the recesses. Inside the silhouette, flat inlaid enamel: {enamel}. Each enamel field sits inside thin raised gold walls.
Contour: one continuous dark brown (#2a1c12) outline around the whole silhouette, about 2% of the canvas width, so the icon holds on light cream paper and on near-black.
Composition: one object only, centred, straight-on front view, symmetric where the subject allows, filling about 80% of a square canvas with even margins.
Lighting: soft, even light from the top left. No cast shadow, no glow, no environment reflections.
Background: fully transparent (alpha). If transparency is not possible, a perfectly flat pure white #FFFFFF.
Palette: gold #6b4710, #d6ae55, #fff0b4, #c6963a; enamel only from lapis #1f3c86, vermilion #b3311d, malachite #2d6a4e, plum #5a2a55, ivory #f5f1e6.
Legibility: it must still read when shrunk to 16 px. Few large shapes, no filigree, no detail thinner than 1/20 of the canvas, at most three enamel fields.
Avoid: text, letters, numerals, a frame, roundel, badge or plaque behind the object, people, faces, hands, animals, photorealism, perspective, drop shadow.
```

## B · Mühür kalıbı (bookbinding-stamp silhouette)

```
Use case: logo-brand
Asset type: one game UI icon for "Entrika", an Ottoman court card game drawn like a 16th-century Ottoman manuscript. The game uses it as a one-colour mask and tints it (lapis, vermilion, gold, cream). Used from 16 px to 48 px: inline before words in card text and inside small round gold gem bezels on cards.
Subject: {subject}
Style/medium: a solid one-colour silhouette cut like an Ottoman bookbinding stamp (cilt kalıbı) or a carved seal. Bold filled shapes; the inner detail is cut out as white negative-space channels of one even width, about 1/25 of the canvas. Curves are calligraphic and slightly tapered; ends finish in small rumi split-leaf points where it suits the subject. The largest mass carries one inset white channel that follows its outer edge at an even distance, like the tooled border of a gilt binding stamp; smaller parts stay solid. Flat graphic print, like a woodcut.
Colour: pure black #000000 on a pure white #FFFFFF background, nothing else. No grey, no gradient, no texture, no paper grain, no shading.
Composition: one object only, centred, straight-on front view, symmetric where the subject allows, filling about 80% of a square canvas with even margins.
Legibility: it must still read when shrunk to 16 px. Few large shapes, no white channel thinner than 1/30 of the canvas, at most four interior cut-outs.
Avoid: outline-only line drawing, hatching, thin lines, text, letters, numerals, a frame, roundel or plaque behind the object, people, faces, hands, animals, 3D, perspective.
```

## Subjects

| Term | File | Subject | Enamel (A only) |
|---|---|---|---|
| Nüfuz | `influence` | an eight-pointed Ottoman star made of two overlapping squares, with a small round boss at its centre | a small vermilion enamel boss at the centre; the star itself is solid gold |
| Entrika | `intrigue` | a tall plaque shaped like a pointed Ottoman arch (ogee top, straight sides, flat base) with a large keyhole cut through its centre | the plaque face is lapis enamel inside a gold rim; the keyhole is a dark opening |
| Kader | `kader` | three tall cards with pointed-arch tops, fanned out from one point at the bottom; the front card carries one round seal in its middle | the cards are ivory enamel with gold edges; the seal on the front card is vermilion enamel |
| Hizmet | `hizmet` | a round twelve-lobed rosette seal, whole, with one bold check mark across its centre | the inner disc is malachite enamel; the check mark is raised gold |
| Hıyanet | `hiyanet` | a round twelve-lobed rosette seal split top to bottom into two halves by one wide jagged crack, the halves pushed slightly apart | the inner disc of each half is vermilion enamel; the crack is empty |
| Harem | `harem` | a single upright Ottoman tulip (lale) with a slender pointed almond-shaped bloom, a short straight stem and two curved leaves | the bloom is vermilion enamel, the two leaves malachite enamel |
| Divan | `divan` | the Ottoman council hall seen from the front: a small domed pavilion with one crescent finial on top of the dome and one arched doorway | the dome is lapis enamel; the doorway is a dark opening |
| Vekil | `vekil` | a tall Ottoman vizier's ceremonial turban (kallavi) shown on its own as an object, wide and rounded at the top, with one diagonal band across it; no head, no face, no person | the turban body is ivory enamel; the diagonal band is raised gold |
| Hırs | `hirs` | a round archery target of three rings pierced by one Ottoman flight arrow that comes in from the upper right | the target rings alternate plum enamel and gold; the arrow is gold |
| Kul | `kul` | an Ottoman ewer (ibrik): a pear-shaped body on a small foot, a tall narrow neck with a lid, a long curved spout on the right and a curled handle on the left | the body is lapis enamel; neck, spout, handle and foot are gold |
| Taraf | `taraf` | a masquerade eye mask (domino mask) with two almond-shaped eye holes and a short ribbon tie at each side, shown on its own, no face behind it | the mask is vermilion enamel with a gold rim; the eye holes are open |
| Oyunda bir | `once` | a thick ring with one upright bar standing in its centre, like a numeral one inside a circle | the space inside the ring is lapis enamel; the ring and the bar are gold |

Three motifs differ from the current SVG set:
- **Vekil** is a kallavi turban instead of a bench.
- **Kul** is an ewer instead of two human silhouettes, because the icons show no people.
- **Hırs** adds an arrow to the target.
