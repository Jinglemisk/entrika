# Entrika

**There's a traitor in the palace.** Entrika is a social-deduction card game for 5 to 8 friends, set in the Ottoman court of the TV series *Muhteşem Yüzyıl*. You play it in the browser, on phones held sideways, either around one table or over a call. A game takes about 30 minutes.

It is an unofficial fan game, played in Turkish. It was formerly called *Sarayda Hain Var!*.

## The game

Sultan Süleyman rules in public, and everyone knows he is loyal. Some of his courtiers are secret Traitors (Hain) who want him dead. The rest are Loyalists (Sadık), and nobody knows for sure who is who. The Traitors know each other.

Each round a **Crisis** (Kriz) hits the palace, and Süleyman picks two Ministers (Vekil) to handle it. They decide its fate in secret with the **Kader** deck, which is mostly bad news:

- a **Hizmet** card helps the empire and goes on the Loyalty track;
- a **Hıyanet** card brings the Sultan closer to death and goes on the Treason track.

The Loyalists win with 4 Hizmet. The Traitors win with 5 Hıyanet, and the fifth space is Süleyman's death. Nobody is eliminated. On the winning side, the player with the most **Influence** (Nüfuz) wins overall, so loyal players compete with each other too.

### A crisis, in six steps

1. **Crisis.** A card is flipped. It opens a field (Harem, Divan or both) and says who draws an Intrigue card.
2. **Appoint.** Süleyman names the First and Second Minister. Then, going round the table, anyone may pay 1 Influence to object to a Minister and have them replaced (İtiraz).
3. **Court** (Tertip). Everyone plays **Intrigue** cards (Entrika) on each other in simultaneous waves. The cards swap Ministers, seal seats, steal Influence, spy on hands and cancel each other. Court ends after a wave where nobody plays.
4. **Kader.** The First Minister draws 3 Kader cards, discards 1 and passes 2 to the Second Minister, who discards 1 and plays the other. Nobody else sees the discards, so a Hıyanet can always be blamed on the other Minister.
5. **Result.** The played card goes on its track. Treason spaces 2 to 4 give Süleyman powers: an investigation, a look at the Kader deck, a fresh Ferman. Then the Ministers defend themselves and may claim anything, but nobody may show hidden cards.
6. **Decree** (Hüküm). After a Hizmet, Süleyman gives 1 Influence to one of the two Ministers; after a Hıyanet, he takes 1 from one. Choosing which one is how he rewards the Minister he trusts and punishes the one he suspects.

### What each player holds

| Piece | Public or secret | What it does |
|---|---|---|
| Character (Karakter) | Public | Who you are at court: Hürrem, İbrahim, Mustafa, Şah Sultan and so on. A Base power you can use once a game, and a locked Favor power (Lütuf). |
| Allegiance (Taraf) | Secret | Loyalist or Traitor. |
| Companion (Kul) | Public | A helper that can turn any Intrigue card into its own specialty, once per crisis, as long as you have Influence. |
| Intrigue hand | Secret | Up to 3 cards. |
| Ambition (Hırs) | Secret | A personal goal. Completing it unlocks your Favor power. |
| Influence | Public | Your score, and what you pay for Objections. |

For a first game the lobby offers a **learning game**: no Companions, Ambitions or Favor powers.

The full rules are in the manual: `manual.html`, also published at https://claude.ai/artifact/5gQkB81wmjSUCno7w26Eau. The game serves it at `/kurallar`, linked from the home screen, the lobby and the in-game settings.

## Playing it

One player makes a room and shares its four-letter code or link; the others join with it. Each phone shows only its owner's secrets: your hand, your Allegiance, your Ambition and your Kader draws. The server runs the rules, so nobody needs to know them all to play. The game deals, enforces targets and timing, and plays the Court reveals on every phone at once.

It isn't hosted yet. It runs from one computer, and phones on the same Wi-Fi join through that computer's address. `game/README.md` has the commands, the test room that puts every seat on one browser, and how to edit card text.

## What's in the repo

- `game/` is the browser game: the rules engine, the server and the phone app. The content (card names, text, numbers) is JSON in `game/content/`.
- `manual.html` is the living rules manual. Names and flavor text are edited in its Lexicon, which lives in the published artifact's database.
- `art/` has the card stills, character cut-outs and the Kat'ı term icons, plus the scripts that build them.
- `ui/v3/` is the design system the game screens are built on.
- `docs/direction.md` is the standing brief: what we're building and how. `docs/rulings.md` lists the cases the manual leaves open and how the game decides them. The rest of `docs/` is the early design history.
- `plan.md` lists the next steps.

## Status

Rules v0.9, one playtest. The game is playable from start to finish with 5 to 8 players, with learning and full modes and optional turn timers.
