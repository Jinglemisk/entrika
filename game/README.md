# Entrika: the browser game

The game from the manual (v0.7, Court in waves), for phones held sideways and for desktop browsers. One player opens a room and shares its four-letter code; the others join with it.

## Run it

```sh
cd game
npm install
npm run dev          # http://localhost:4700, plus the Wi-Fi address it prints, for phones
```

Phones on the same Wi-Fi open the printed address (for example `http://192.168.1.161:4700`). A link with `?oda=CODE` fills in the code.

For production, run `npm run build`, then `npm start`. The `PORT` variable changes the port (default 4700).

## Test alone

On the home screen, "Test oyunu" opens a room where this browser plays every seat:

- The small eye on each seat switches to that seat's phone. While the court is covered, the row of heads in the corner (or the Devam heads) does the same.
- The robot button in the top bar hands every other seat to a bot, which plays random legal moves.
- One Devam press answers for every seat this browser holds.

These aids exist only in test rooms and are marked `DEV` in the code; normal rooms bind each phone to its own seat.

## Change the game

- **Names, card text, flavor:** the room's mod, in `mods/<id>/<lang>.json` at the repo root, or the card text editor below. Each card face is drawn from these words, so an edit appears on the next reload. `docs/mods.md` says how a mod is built; `npm run mods` lists what each mod still lacks.
- **Interface wording:** `lang/tr.json` and `lang/en.json`, one sentence per key in each language. The game's own words come in by id, so one sentence serves every mod:
  - `{term.minister:dat}` is a term in one of its hand-written forms, `{card.valide}` a card's name, `{power.ferman}` a power's name (all placeholders are in `docs/mods.md`);
  - `{name}` inserts a value, and `{name:dat}` adds a Turkish case suffix (dat, acc, gen, loc, abl) to it, so a sentence reads "Mert'e itiraz etti".
- **Mechanics:** `content/*.json` holds what each card, power, Kul, Hırs and Crisis does (ids, targets, copies, draw rules), with an `about` line in plain English, and `content/terms.json` lists the game's terms and their icons.
- **Numbers:** `content/rules.json` holds deck sizes, track lengths, the Allegiance table, the hand limit, the Objection cost and the Treason powers. Restart the server after editing it.
- **New behaviour** (a new effect or power) is code: `src/engine/`.

## Edit card text

With `npm run dev` running, open `http://localhost:4700/?duzenle`. Pick the mod and language at the top left, then a card; change its text in the middle and the card on the right redraws as you type. An empty field shows the mod's native text as a hint. Kaydet (or Ctrl/⌘+S) writes the change into `mods/<mod>/<lang>.json`. `/?kartlar` draws every card; its pickers switch the mod and language.

- Only printed text can change: names, card text, flavor lines, power names and texts, Character quotes, Kader and Taraf lines, treason powers. The server refuses everything else (ids, targets, copies, draw rules, frequencies, art), and both the page and its save endpoint exist only on the dev server.
- Term icons need no markup: a word that starts with one of the mod's term stems, card names, Kul names or Character short names (case-sensitive, any suffix) gets its icon and bold type. The editor lists them.
- Saves write two-space JSON that keeps short objects (art, copies) on one line, so a save changes only the line it edits.

## How it fits together

- **`src/engine/`** is the rules, as pure functions over one JSON game state. The server and the phones run the same code.
  - `act(state, seat, action)` checks an action and returns the next state.
  - Every input the game is waiting for is an "ask" addressed to a seat.
  - `flow.ts` is the crisis state machine.
  - `court.ts` is Tertip in waves.
  - `actions.ts` holds the answers and the powers with no fixed timing.
- **`server/`** is one Node process.
  - It serves the app, plus the repo's `art/` folder at `/art/`.
  - It runs the engine for each room and pushes the state to every phone over WebSocket.
  - It saves rooms to `data/rooms.json`, so a restart or a locked phone loses nothing.
- **`src/client/`** is React on the v3 design system (`ui/v3/src/ui.css`).
  - `cards/` draws every card from data, ported from the art page's generator.
  - `game/` holds the table, the shelf, the prompt block and the full-screen moments.

Every phone receives the whole state and shows only its owner's secrets. That is the friends-game trade-off in `docs/direction.md`: there is no anti-cheat, and the seat switch is simple.

## Checks

```sh
npm run typecheck
npm test             # critical rules tests, including 150 random full games
node scripts/sim.ts 2000   # longer random-play soak
```
