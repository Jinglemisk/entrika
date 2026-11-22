# Entrika

**There's a traitor at court.** Entrika is a social-deduction card game for 5 to 8 friends, played in the browser on phones held sideways, either around one table or over a call. A game takes about 30 minutes.

The same game can be played in three worlds, each in Turkish and English:

| World | The court | The ruler | The Traitors win when |
|---|---|---|---|
| **Muhteşem Yüzyıl** (the original) | Süleyman's palace, 1520s–1550s | Sultan Süleyman | the Sultan dies |
| **Game of Thrones** | Joffrey's court, from the Blackwater to the Purple Wedding | King Joffrey | the fifth Strangler is poured |
| **Cumhuriyet** | Ankara, November 1924 to August 1925 | Atatürk | the counter-revolution wins |

The host picks the world in the lobby. Each phone picks its own language, so one table can play in both. The rules are the same in every world; only the names, text and look change.

Entrika is an unofficial, non-commercial fan game. See [Licence and rights](#licence-and-rights).

## The game

One player is the **ruler**: public, always loyal, and the one who hands out the two Minister seats. Some of the other players are secret **Traitors** who want the ruler gone; the rest are **Loyalists**. Nobody knows for sure who is who, but the Traitors know each other.

Each round a **Crisis** hits the court, and the ruler names two **Ministers** to handle it. They decide its outcome in secret with the **fate deck**, which is mostly bad news:

- a good card goes on the Loyalty track; the Loyalists win with 4;
- a bad card goes on the Treason track; the Traitors win with 5, and the fifth space ends the ruler.

Nobody is eliminated. On the winning side, the player with the most **Influence** wins overall, so loyal players compete with each other too.

### A crisis, in six steps

1. **Crisis.** A card is flipped. It opens one of two fields of play, or both, and says who draws a card.
2. **Appoint.** The ruler names the First and Second Minister. Then, going round the table, anyone may pay 1 Influence to object to a Minister and have them replaced.
3. **Court.** Everyone plays **Intrigue** cards on each other in simultaneous waves. The cards swap Ministers, protect seats, steal Influence, spy on hands and cancel each other. Court ends after a wave where nobody plays.
4. **Fate.** The First Minister draws 3 fate cards, discards 1 and passes 2 to the Second Minister, who discards 1 and plays the other. Nobody else sees the discards, so a bad card can always be blamed on the other Minister.
5. **Result.** The played card goes on its track. Treason spaces 2 to 4 give the ruler powers: an investigation, a look at the fate deck, a fresh use of their own power. Then the Ministers defend themselves; they may claim anything, but nobody may show hidden cards.
6. **Decree.** After a good card the ruler gives 1 Influence to one of the Ministers; after a bad one, takes 1 from one. Choosing which is how the ruler rewards trust and punishes suspicion.

### What each player holds

| Piece | Public or secret | What it does |
|---|---|---|
| Character | Public | Who you are at court. A power you can use once a game, and a second power that stays locked until you complete your Ambition. |
| Allegiance | Secret | Loyalist or Traitor. |
| Companion | Public | A helper that can play any Intrigue card as its own specialty, once per crisis, as long as you have Influence. |
| Intrigue hand | Secret | Up to 3 cards. |
| Ambition | Secret | A personal goal; completing it unlocks your second power. |
| Influence | Public | Your score, and what you pay to object. |

Each world names these its own way. For example, the fate deck is Kader (Hizmet / Hıyanet) in Muhteşem Yüzyıl, Cups (Arbor Red / Strangler) in Game of Thrones, and Tasarı (İnkılap / İrtica) in Cumhuriyet.

For a first game the lobby offers a **learning game**: no Companions, Ambitions or second powers.

The game carries these rules in short, in every world and language: the Rules link on the home screen and in the lobby, and the **?** button at the top right in game. The long-form manual is `manual.html`, written with the Muhteşem Yüzyıl names.

## Playing it

One player makes a room and shares its four-letter code or link; the others join with it. Each phone shows only its owner's secrets. The server runs the rules, so nobody needs to know them all: the game deals, checks every move, and shows the Court reveals on every phone at once.

The game isn't hosted yet. It runs on one computer, and phones on the same Wi-Fi join through that computer's address:

```sh
cd game
npm install
npm run dev     # prints http://localhost:4700 and the Wi-Fi address for phones
```

To try it alone, open `http://localhost:4700/?hizli=got`: a game is dealt at once with every seat in this browser (`?hizli=muhtesem`, `?hizli=cumhuriyet`; `&n=6` for six players). Such a link also turns on the test aids for the tab, as `?devmode=on` does. `game/README.md` has the rest: the test aids, the card text editor, and how the code fits together.

## Making a world

A world is a folder in `mods/`. It holds the names and text in each language, and its look: card frames, colours, icons, portraits, stills, the seal and the music. The rules engine doesn't change, so any world plays the same game. `docs/mods.md` explains how to make one, and `npm run mods` (in `game/`) lists what a world is still missing.

## What's in the repo

- `game/`: the browser game.
  - The rules engine, the server and the phone app.
  - The mechanics and numbers in `game/content/`.
  - The interface sentences, in Turkish and English, in `game/lang/`.
- `mods/`: the three worlds.
  - Each has its words, look, art and a `PROPOSAL.md` with its design decisions.
  - The image sources are listed in each world's `art/manifest.json` (Muhteşem Yüzyıl's in `art/stills/manifest.json`).
- `art/`: the original world's stills and icons, plus the tools every world uses (the portrait cut-out tool and the icon build).
- `ui/v3/`: the design system the screens are built on.
- `manual.html`: the long-form rules manual.
- `docs/`:
  - `direction.md`: the standing brief.
  - `mods.md`: how worlds work.
  - `rulings.md`: the cases the manual leaves open and how the game decides them.
  - The rest is design history.
- `plan.md`: what's next.

## Status

Rules v0.9, one playtest. The game is playable from start to finish with 5 to 8 players in all three worlds and both languages, with learning and full modes and optional turn timers.

## Licence and rights

Entrika is an **unofficial, non-commercial fan project**, made to be played among friends. It is not affiliated with or endorsed by any producer, broadcaster or publisher, and it makes no money.

**It is fiction.** The characters come from TV series, books and history, but who stays loyal, who betrays, and everything anyone says or does in the game is invented for play. None of it describes real people, their personalities or real events, and nothing in it is a claim about history.

- **Code:** MIT.
- **Entrika's own material:** the rules, the manual, the card text and the art made for Entrika (icons, card frames) are CC BY-NC 4.0, free to share and adapt for non-commercial use, with credit.
- **Everyone else's material is theirs and isn't licensed here:** the series, books, characters, stills and photographs the worlds draw on belong to their owners. The credits are in the game, under Credits on the home screen and in settings, and every picture's source is listed in its world's manifest. A rights holder who wants anything removed can ask, and it will be removed.

The full terms are in [LICENSE](LICENSE). The repository is private and the game is not published; keep it that way unless the borrowed images are replaced.
