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
| Saray | `saray` | an Ottoman palace gate seen from the front: one arched gateway between two slender towers with pointed conical roofs | the two tower roofs are vermilion enamel and the gateway arch is lapis enamel |
| Kriz | `crisis` | a single tall flame with three tongues rising from a small shallow brazier bowl | the flame is vermilion enamel with a gold inner tongue; the bowl is gold |
| Tertip | `court` | a square palace window frame filled with a bold diagonal lattice screen (kafes) of large diamond-shaped openings, about four openings across | the openings show lapis enamel behind the gold lattice bars |
| Süleyman | `suleyman` | a tall Ottoman imperial crown in four stacked jewelled tiers, like Süleyman's Venetian helmet-crown, with a small upright plume on top; the crown alone, no head, no face, no person | a row of vermilion enamel jewels on each tier; the crown itself is gold |
| Birinci Vekil | `min1` | the same kallavi turban as Image 2, with a large round medallion overlapping its lower right; the medallion carries one raised upright bar | the turban body is ivory enamel with its gold band; the medallion is vermilion enamel with a gold rim and one gold bar (second reference: `minister.png`) |
| İkinci Vekil | `min2` | the same kallavi turban as Image 2, with a large round medallion overlapping its lower right; the medallion carries two raised upright bars side by side | the turban body is ivory enamel with its gold band; the medallion is lapis enamel with a gold rim and two gold bars (second reference: `minister.png`) |
| Açık | `public` | a short, wide Ottoman herald's horn (nefir) bent into a half circle, its mouthpiece at the lower left and a large flared bell at the upper right; a chunky shape that fills the square | a lapis enamel band wraps the middle of the horn |
| Gizli | `secret` | a folded letter seen from the front, its flap closed with a large round wax seal in the middle | the paper is ivory enamel; the wax seal is vermilion enamel |
| Sadık | `loyalist` | a round Ottoman shield (kalkan) seen from the front, with a raised central boss and eight radiating ribs | the shield face between the ribs is malachite enamel; boss and ribs are gold |
| Hain | `traitor` | a curved Ottoman dagger (hançer) standing upright, point down, with a jewelled hilt and a short crossguard | the grip is vermilion enamel; the blade is gold |
| Sadakat yolu | `loyalty` | a staircase of four square tiles rising from lower left to upper right, each tile one step higher than the last, with a small round shield standing on the top tile; the whole shape fills the square | the four tiles are malachite enamel; the small shield is malachite enamel with a gold boss |
| İhanet yolu | `treason` | a staircase of five square tiles rising from lower left to upper right, each tile one step higher than the last, with a small dagger standing point down on the top tile; the whole shape fills the square | the five tiles are vermilion enamel; the dagger is gold |
| Süleyman'ın ölümü | `death` | an Ottoman headstone (mezar taşı): a tall narrow upright slab on a low base, topped by a small carved crown | the slab face is plum enamel; the crown and the base are gold |
| Kader sırtı | `seal` | a round wax seal with an irregular wavy rim and a raised eight-petal rosette in its centre | the wax is vermilion enamel; the rosette is gold |
| Karakter | `character` | an empty portrait frame shaped like a pointed Ottoman arch on a flat base, with a small finial (alem) on the apex; nothing inside the frame | the inside of the frame is vermilion enamel; frame and finial are gold |
| Lütuf | `favor` | an ornate Ottoman padlock with its curved shackle swung open | the lock body is lapis enamel inside a gold rim |
| Temel güç | `base` | an Ottoman mace (topuz): a round ribbed head on a short straight handle, standing upright | the mace head is vermilion enamel between gold ribs; the handle is gold |
| Hüküm | `decree` | a balance scale: one horizontal beam on a central upright post, with a round pan hanging from each end | the two pans are lapis enamel; beam and post are gold |
| Ferman | `ferman` | an imperial edict (ferman): a tall scroll unrolled from top to bottom, with abstract gold loops at the top that suggest a tuğra (not real letters) and a round wax seal hanging from the bottom | the scroll paper is ivory enamel; the hanging seal is vermilion enamel |
| İtiraz | `objection` | two Ottoman halberds (teber) crossed in a bold X, each with a broad curved axe blade at the top | the axe blades are vermilion enamel; the shafts are gold |
| Krizde bir | `percrisis` | a thick ring made of one curved arrow that runs almost all the way around, with a single arrowhead at its end, and a small round dot in the centre; same ring proportions as Image 2 | the space inside the ring is lapis enamel; the arrow ring and the dot are gold (second reference: `once.png`) |
| Her zaman | `always` | a thick ring with a bold infinity sign (a figure-eight lying on its side) across its centre; same ring proportions as Image 2 | the space inside the ring is lapis enamel; the ring and the infinity sign are gold (second reference: `once.png`) |
| Menü | `menu` | three thick horizontal bars of equal length stacked with equal gaps, rounded ends | a thin lapis enamel inlay runs along the middle of each stroke |
| Kapat | `close` | a bold X made of two thick crossed bars with rounded ends | a thin lapis enamel inlay runs along the middle of each stroke |
| Geri | `back` | a bold arrow pointing left: a thick straight shaft with a wide triangular head | a thin lapis enamel inlay runs along the middle of each stroke |
| Sonraki | `chev-r` | one bold chevron pointing right, like a thick sideways V with rounded ends | a thin lapis enamel inlay runs along the middle of each stroke |
| Hazır | `ready` | one bold check mark with rounded ends | a malachite enamel inlay runs along the middle of the check mark |
| Pas | `pass` | a bold arrow that arcs over a small square block from left to right, its head pointing down on the right side of the block | the block is ivory enamel; the arrow is gold with a thin lapis inlay |
| Günlük | `log` | a closed book in Ottoman leather binding, front cover facing the viewer, with an almond-shaped medallion (şemse) in the middle and corner pieces | the cover is lapis enamel; medallion and corner pieces are gold |
| Ayarlar | `settings` | a cogwheel with eight broad square teeth and a round hole in the centre | a lapis enamel ring sits between the teeth and the centre hole |
| Ses | `sound` | a loudspeaker: a small square box with a cone flaring to the right, and two thick curved sound waves to its right | the cone is lapis enamel |
| Müzik | `music` | two musical eighth notes joined by one thick beam | the two note heads are lapis enamel |
| Titreşim | `vibration` | a slim upright rounded rectangle (a handheld tablet) with two short thick zigzag lines on each side showing vibration | the screen face is lapis enamel |
| Şüpheli | `suspect` | a bold question-mark shape with a round dot below it | vermilion enamel inside a gold rim |
| Güvenilir | `trusted` | a heart shape with gently pointed lobes, like an Ottoman ornamental heart | malachite enamel inside a gold rim |
| Devam | `next` | a bold right-pointing triangle, like a play symbol, with slightly rounded corners | lapis enamel inside a gold rim |
| Önceki | `chev-l` | not generated: `chev-r` mirrored | — |

Three motifs differ from the current SVG set:
- **Vekil** is a kallavi turban instead of a bench.
- **Kul** is an ewer instead of two human silhouettes, because the icons show no people.
- **Hırs** adds an arrow to the target.

## Full set (style A)

Style A was picked. The full set is in `art/icons/set/`, made with the A template above, unchanged.
- **File names** follow the `terms.json` icon ids. Four proposal files were renamed when copied: `vekil` → `minister`, `hirs` → `ambition`, `kul` → `companion`, `taraf` → `allegiance`. The other eight proposal icons were copied as they were, not regenerated.
- **Second reference.** A few icons attach a second image, named in the Enamel column. Their Subject line says what to take from it: the turban for the two Vekil ranks, and the ring for the frequency icons.
- **Retired icons are left out:** claim (sahiplen), anon (isimsiz) and letter (Boş Mektup).
- **Tertip** is a kafes window screen. The crescent is gone, and the set has no night imagery.
