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

- The strip on the left switches between seats.
- The robot button hands every other seat to a bot, which plays random legal moves.

Bots and the seat strip exist only in test rooms; normal rooms bind each phone to its own seat.

## Change the game

- **Names, card text, flavor:** `content/*.json`. Each card face is drawn from this data, so an edit appears on the next reload.
- **Interface wording:** `content/strings.tr.json`.
  - `{name}` inserts a value.
  - `{name:dat}` adds a Turkish case suffix (dat, acc, gen, loc, abl), so a sentence reads "Mert'e itiraz etti".
- **Numbers:** `content/rules.json` holds deck sizes, track lengths, the Allegiance table, the hand limit, cards per crisis, the Objection cost and the Treason powers. Restart the server after editing it.
- **New behaviour** (a new effect or power) is code: `src/engine/`.

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
