# Entrika: UI v3, the design system

A static design document, published at the link in `plan.md`. It replaces the v2 prototype's look and layout after Jingle called v2 cheap ("a low-effort mobile rip-off") and asked whether it was the best the genre can do. Nothing in v3 is playable; v2 stays as the interaction reference.

## Files

- `src/ui.css` is the system: tokens and every component. The game should start from this file.
- `src/screens.mjs` draws each screen as static HTML from one frozen moment of crisis 4. `src/build.mjs` wraps them in the document (`src/doc.css`) and writes `index.html`. Run `node ui/v3/src/build.mjs`; edit `src/`, never `index.html`.
- `img/cards/` are cards baked from the art page by `src/bake-cards.mjs` (its header says what must be running). Only the images the page uses are kept.
- `img/v2/tertip-selin.jpg` is a capture of the v2 prototype, used for the critique.

## What changed from v2, and why

- **Surfaces carry meaning.** Paper is public, lacquer is private. v2 was one dark room with five saturated fields.
- **Only cards are ornate.** No bevel, glow or gold gradient outside a card frame. v2 put the cards' gold on every control, which is the look of free-to-play palace sims.
- **Seats are figures in a row**, Süleyman in the middle, the same order on every phone. v2 used 56 px medallions on an arc that rotated per phone. The row needs the viewer's own seat in it.
- **One prompt block** (step, one sentence, at most two buttons) replaces the wax seal, plaque and paper slip.
- **Powers are a named list** with state, replacing three unlabelled pips.
- **Sicil**: a per-crisis table (Vekils, Kader result, Decree, events) as the first tab of the log.
- **Tap a card, then a seat.** Drag is optional, because the court is outside thumb reach.

## Things a builder should know

- Class names `.me` and `.mine` are taken (`.mine` is the shelf identity block; a seat that is you is `.st.you`; your own laid card is `.cb.own`).
- A zone class (`.zp` paper, `.zl` lacquer) sets `--fg`, `--line`, `--s-al` and the rest; components never name a colour directly. The three surface options are theme classes on the screen root (`th-split`, `th-paper`, `th-lake`).
- The figure in a niche is drawn twice: once masked to the arch, once clipped to a centre band above the spring line so only the head breaks the frame. Placement per Character is the `CUT` table in `screens.mjs` (head centre, head top, scale).
- The Kader deck count is no longer on the resting screen. If Jingle wants it back it costs the field chip on the top line.
- Long crisis names (İstanbul'da Dedikodu) need the field chip to collapse to its icon; not drawn yet.

## Open

The six decisions at the end of the page ("Decisions for Jingle"). Nothing in `docs/direction.md` has been changed; decision 2 would overturn its 13 November seat-arc ruling.
