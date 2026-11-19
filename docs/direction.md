# Entrika — direction

The standing brief for the browser game. Read it before starting any work on the game, art or engine.

## What we're building

- **Entrika** is the game's name. It replaces "Sarayda Hain Var!" everywhere.
- A browser game played on phones (current iPhones, Safari/Chrome), either around one table or remotely. Phones only for now; a shared TV or table screen showing the board is a good later idea.
- **Played in landscape.** Phones are held horizontally; every screen is designed for that.
- It's for friends. No anti-cheat, no server-side bookkeeping, no accounts. People talk at the table or on their own WhatsApp call, so there's no in-app chat or voice.
- The UI is in Turkish and English, picked on each phone. Every sentence goes through a string table per language (`game/lang/`), and the game's world (names, card text, look) comes from the room's mod (`mods/`, see `docs/mods.md`).
- The digital game doesn't carry paper workarounds. Placement is private and simultaneous on each phone, so the eyes-closed night, the call order and Boş Mektup aren't needed.
- **It's an online game, not a paper one.** Each phone shows only its owner's secrets and the game knows everything, so rules that exist to manage a physical table don't apply:
  - Choose and look cards aren't claimed; the owner decides privately on their phone.
  - Placed cards stay hidden until the reveal. Others only see that a player is ready, not whether they placed or passed.
  - The phone enforces the rules; for example, a Sadık Vekil can't make an illegal Kader play.
  - Peeking at a neighbour's phone isn't a design concern.

  Questions like these are settled here, not put to the designer as rules questions.
- The rules are the living manual (`manual.html`, published as an artifact). The first playable follows the manual's current version.

## Philosophy

- **Data-driven at the core.** Cards, Characters, Companions, Ambitions, Crises, actions, effects, resolve order, formulas and dials (deck counts, track lengths, the Allegiance table, Influence rules) live in data that a small rules engine reads. Changing a number, a name or a card count never means touching engine code.
- **Content is hot-editable; mechanics are code.** Names, portraits, descriptions and flavor text can change at any time without a code change. A brand-new effect needs code; renaming or re-describing an existing one doesn't.
- **One content source.** The game's words live in the mods (`mods/<id>/<lang>.json`); the manual should read them too, and its Lexicon retires (plan.md, Later).
- **Clean, simple code.** Small modules, plain names, no speculative abstractions.

## How we work

1. **Art first.** A subagent sets the art direction. It produces two directions side by side for the designer to pick from: (A) dark palace drama — deep red, black, gold, candlelight; (B) Ottoman miniature — cream paper, gold leaf, tile patterns.
2. **Then the first playable, in one overnight pass.** It's built end to end without stopping until the designer can play a full game.
3. **Testing aid.** A test room puts every seat on one browser. A small eye on each seat switches between their screens, and a bot switch hands the other seats to random legal play. Both exist only in test rooms and are removed later.
4. **No automated tests during the build.** Tests come much later.

## Art

This section is the `muhtesem` mod's art direction. Each mod has its own look, built to the same layout and rules (`docs/mods.md`): real images for people, one icon family, ornate cards and plain controls. The pipeline is shared: `art/tools/portrait.py` makes every mod's character cut-outs and crops, and `art/icons/build.py` builds every mod's icon set.

- **Chosen direction:** B, Ottoman miniature (cream paper, gold leaf, lapis and vermilion, manuscript-style names), with stills graded in direction A's red-to-gold hue at reduced strength. Details live in `art/directions/notes.md`. Art direction and UI are separate tracks: the art page covers cards, icons and stills; UI is built on top of it.
- Real stills from the show only, never AI-generated or regenerated. Any card showing a person uses a standard posed hero shot, like a cast promo or a roster image: same framing, same eye line, facing the viewer. Event cards use scenes, e.g. a janissary riot for Yeniçeri İsyanı. Online sources are fine.
- Card layouts are consistent. Characters' two powers sit in clearly separate panels. Card titles and body text are centred. Harem and Divan show as icons only; tooltips carry the words.
- **Icon style: Kat'ı** (picked 2026-11-15, replacing Varak ve mine, which read as generic gold specks at text size). Ottoman paper-cut silhouettes, one shape and one colour per term, the colour taken from its meaning (lapis office, vermilion treason, malachite loyalty, gold the Sultan, rose Harem, plum Kader and Hırs). Motifs are court objects, not stock symbols. Each icon is made from the template in `art/icons/proposals/r2/kati/`; `art/icons/README.md` says how the set is built.
- **Corner gems** carry a contrast disc: black on light frames (Entrika, Kriz, Süleyman's gold), white on dark frames, so the icon stands out.
- **Terms carry their icons.** Wherever card or UI text names a game term, its icon is drawn in front of it ("play any [icon] Entrika card"). One renderer does this from the active mod's term table (stems per language) and the icons in `game/content/terms.json`, so it also catches suffixed forms. `art/terms.json` is the art page's older copy; the game no longer reads it.
- Clear popups that carry each action. Neat card animations: drawing, placing, the simultaneous reveal, the Kader hand-off, a card landing on a track, the Decree.
- Mobile-first and light. No heavy engines.

## UI

Decided with the designer on 2026-11-13. On 2026-11-15 the look and layout moved to the v3 design system (`ui/v3/`, https://claude.ai/artifact/7drJc9A7wWYvoCAVvUkSzH), with all six of its recommendations taken. The game screen is built from `ui/v3/src/ui.css`. The v2 prototype is retired: its gold-on-every-control look read as a cheap mobile game.

- **Surfaces.** Public is paper, private is lacquer (kâğıt ve lake). The court, the tracks, reveals and the Decree are drawn on paper. Your hand, Taraf, Kader cards and peeks are drawn on lacquer.
- **Only cards are ornate.** Card frames keep their gold, enamel and gems. Controls have no bevels, glows or gold gradients, and hierarchy comes from type and spacing.
- **Table.** The cast stands in one fixed row, in seat order, the same on every phone. Süleyman is in the middle and your own seat is in the row. The tracks and the Crisis run along the top line. Your Taraf, powers, hand and the prompt sit on the lacquer shelf below. Seat order matters because Objections go clockwise and some Crises draw for the players beside Süleyman.
- **One prompt block,** bottom right: the step, one sentence, at most two buttons. To play a card, tap it and then tap a seat; dragging is optional.
- **Icons.** Kat'ı emblems for game terms and cards only, dark on paper and light on lacquer. Interface chrome uses line glyphs.
- **Type.** Alegreya Sans for the interface, Alegreya italic for the game's voice, small caps only on card objects.
- **Kader deck count** is off the resting screen and shown in Sonuç and Sicil.
- **Pace.** Süleyman's phone taps "next" to close a step, for example after the Objections or a Tertip wave. After a reveal that had cards in it, the next Tertip wave opens by itself; a wave where nobody plays ends Tertip. No timers.
- **Secret info.** Your hand is always visible. Allegiance and Hırs show only while you press and hold.
- **Reveals play in sync** on every phone, so the table reacts together.
- **Game log.** Its first tab is Sicil, one row per crisis: Vekils, Kader result, Decree, events. The full event list sits behind it: appointments, which cards resolved on whom, Kader results, Decrees.
- **Private marks.** You can tag other players (şüpheli, güvenilir). Only you see your tags.
- **Attention.** Visual cues always, plus sound effects, a quiet music loop and a buzz when you must act, each switchable. iPhone Safari has no web vibration, so the buzz may work on Android only.

## Turkish terms

Decided so far (the full list is in `art/directions/notes.md`): Birinci Vekil / İkinci Vekil (Ministers), Tertip (Court), Hırs (Ambition), Kul (Companion), Entrika (Intrigue).

## Tech

- TypeScript, React, Vite, and Motion for card animations. The game lives in `game/`; its README says how to run it.
- One player creates a room and shares a four-letter code; others join with it, the same way at a table or remotely.
- **The relay runs the rules.** The server applies every action with the same engine the phones carry and keeps the latest state, saved to disk. A locked phone rejoins, and two phones can't disagree about the state. It still sends the whole state to every phone, which shows only its owner's secrets (no anti-cheat, as above). In development it runs on the Mac with phones on the same Wi-Fi; later it can move to the Hetzner box. Production hosting isn't a concern yet.
- **Content is data.** Mechanics are in `game/content/*.json`, the dials in `game/content/rules.json`, card names and texts in each mod's words (`mods/<id>/<lang>.json`), pictures and the whole look in each mod's skin (`mods/<id>/skin.json`, `skin.css`), and interface sentences in `game/lang/<lang>.json`. Behaviour is code in `game/src/engine/`. The manual doesn't read these files yet; until it does, a text change goes in both places.
- **Cards are drawn, not baked.** Every face is built at run time on one fixed layout, from the mod's words and its skin's frame layers (SVG). The Ottoman frames came from the art page's generator and now live in the `muhtesem` skin.
- **Sound is synthesised** with Web Audio: the effects and a quiet loop whose notes come from the mod's skin (makam Hicaz in `muhtesem`). There are no audio files to source.
- **Rulings.** Cases the manual leaves open are decided in the engine and listed in `docs/rulings.md`.
