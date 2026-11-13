# Entrika — direction

The standing brief for the browser game. Read it before starting any work on the game, art or engine.

## What we're building

- **Entrika** is the game's name. It replaces "Sarayda Hain Var!" everywhere.
- A browser game played on phones (current iPhones, Safari/Chrome), either around one table or remotely. Phones only for now; a shared TV or table screen showing the board is a good later idea.
- **Played in landscape.** Phones are held horizontally; every screen is designed for that.
- It's for friends. No anti-cheat, no server-side bookkeeping, no accounts. People talk at the table or on their own WhatsApp call, so there's no in-app chat or voice.
- The UI is in Turkish. English comes later through i18n, so every UI string goes through a string table from the start.
- The digital game doesn't carry paper workarounds. Placement is private and simultaneous on each phone, so the eyes-closed night, the call order and Boş Mektup aren't needed.
- The rules are the living manual (`manual.html`, published as an artifact). The first playable follows the manual's current version.

## Philosophy

- **Data-driven at the core.** Cards, Characters, Companions, Ambitions, Crises, actions, effects, resolve order, formulas and dials (deck counts, track lengths, the Allegiance table, Influence rules) live in data that a small rules engine reads. Changing a number, a name or a card count never means touching engine code.
- **Content is hot-editable; mechanics are code.** Names, portraits, descriptions and flavor text can change at any time without a code change. A brand-new effect needs code; renaming or re-describing an existing one doesn't.
- **One content source.** The manual and the game read the same content, and they stay in sync. The manual's Lexicon is where names and text get edited.
- **Clean, simple code.** Small modules, plain names, no speculative abstractions.

## How we work

1. **Art first.** A subagent sets the art direction. It produces two directions side by side for the designer to pick from: (A) dark palace drama — deep red, black, gold, candlelight; (B) Ottoman miniature — cream paper, gold leaf, tile patterns.
2. **Then the first playable, in one overnight pass.** It's built end to end without stopping until the designer can play a full game.
3. **Testing aid.** Clicking a player's icon switches to that player's screen, so one person can play every seat. It's removed later.
4. **No automated tests during the build.** Tests come much later.

## Art

- **Chosen direction:** B, Ottoman miniature (cream paper, gold leaf, lapis and vermilion, manuscript-style names), with stills graded in direction A's red-to-gold hue at reduced strength. Details live in `art/directions/notes.md`. Art direction and UI are separate tracks: the art page covers cards, icons and stills; UI is built on top of it.
- Real stills from the show only, never AI-generated or regenerated. Any card showing a person uses a standard posed hero shot, like a cast promo or a roster image: same framing, same eye line, facing the viewer. Event cards use scenes, e.g. a janissary riot for Yeniçeri İsyanı. Online sources are fine.
- Card layouts are consistent. Characters' two powers sit in clearly separate panels. Card titles and body text are centred. Harem and Divan show as icons only; tooltips carry the words.
- **Terms carry their icons.** Wherever card or UI text names a game term, its icon is drawn in front of it ("play any [icon] Entrika card"). One renderer does this from a data table of terms, Turkish stems and icons, so it also catches suffixed forms.
- Clear popups that carry each action. Neat card animations: drawing, placing, the simultaneous reveal, the Kader hand-off, a card landing on a track, the Decree.
- Mobile-first and light. No heavy engines.

## UI

Decided with the designer on 2026-11-13. A UI agent proposes the layout once the art is final.

- **Table.** The other players sit in seat order along an arc at the top, with Süleyman's seat marked; up to 7 must fit. The Crisis, the Hizmet and Hıyanet tracks and the two Vekils sit in the centre. Your Character, Influence, hand and Kul run along the bottom. Seat order matters because Objections go clockwise and some Crises draw for the players beside Süleyman.
- **Pace.** Süleyman's phone taps "next" to close a step, for example after the Objections or after the reveal. No timers.
- **Secret info.** Your hand is always visible. Allegiance and Hırs show only while you press and hold.
- **Reveals play in sync** on every phone, so the table reacts together.
- **Game log.** A drawer holds the full history, round by round: appointments, which cards resolved on whom, Kader results, Decrees.
- **Private marks.** You can tag other players (şüpheli, güvenilir). Only you see your tags.
- **Attention.** Visual cues always, plus sound effects, a quiet music loop and a buzz when you must act, each switchable. iPhone Safari has no web vibration, so the buzz may work on Android only.

## Turkish terms

Decided so far (the full list is in `art/directions/notes.md`): Birinci Vekil / İkinci Vekil (Ministers), Tertip (Court), Hırs (Ambition), Kul (Companion), Entrika (Intrigue).

## Tech

- TypeScript, React, Vite, and Motion for card animations.
- One player creates a room and shares a short code; others join with it, the same way at a table or remotely.
- A tiny relay passes messages and keeps the latest game state, so a phone that locks can rejoin. In development it runs on the Mac with phones on the same Wi-Fi; later it can move to the Hetzner box. Production hosting isn't a concern yet.
