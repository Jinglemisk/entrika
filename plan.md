# Entrika — plan

The living rules are the player manual (`manual.html`, published as an artifact). Its Notes section holds open decisions, tuning dials and parked ideas.

## Next
1. Review the v0.8 manual; confirm the "Proposed" items and settle the open questions in Notes. v0.7 is the 1534 court; the reasoning behind it is at https://claude.ai/artifact/Tgm55z6tdi3NwjVtsEMHEH.
2. 3–5 learning games in Basic mode, in the browser build (lobby: "Öğrenme oyunu"). Paper is out since v0.7: Court is played in waves, and a physical table can't hide who played what across waves.
3. Log every game: player count, winner, final track state, minutes, what the losing side called unfair.
4. Tune the dials: Kader deck ratio, track lengths, allegiance counts.
5. Then Full mode (Companions, Ambitions, Favor powers).

## Browser game (see `docs/direction.md`)
1. Art: direction B, at https://claude.ai/artifact/KHGRZwpyu91CbWxZNv7kZH. It covers v0.7 card texts, Süleyman's gold-leaf frame, backs for all seven decks and the Varak ve mine icons (set in `art/icons/set/`, sheet at https://claude.ai/artifact/9xBpkHTszW3Fca2HkSsnC1). Tokens are in `art/directions/notes.md`, the term-icon table in `art/terms.json`. Still open:
   - the art page and the art review still show the old Varak ve mine icons; the game uses Kat'ı (picked 2026-11-15 from https://claude.ai/artifact/413jtyCL6ffgKCK6g74R9G).
   - confirm the grade strength (15%);
   - AI-generated textures (deferred).
2. UI: the v3 design system is the way forward (decided 2026-11-15, all six recommendations taken): https://claude.ai/artifact/7drJc9A7wWYvoCAVvUkSzH, source in `ui/v3/src/`, notes in `ui/v3/notes.md`, decisions in the UI section of `docs/direction.md`. The v2 prototype is retired.
3. First playable: done (branch `feat/playable-game`, folder `game/`). Every rule in manual v0.7 is in it: setup with Kul choice, Atama with Objections and every timed power, Tertip in waves, Ferman, Kader, the Treason powers, the Decree, Hırs cards and the overall winner. There are rooms with a share code, rejoin after a locked phone, test rooms with bots, sound, and critical rules tests. How to run it: `game/README.md`.
4. Next:
   - Play a real game on phones over Wi-Fi.
   - Decide whether the manual should read `game/content/` so card text lives in one place.
   - Before release: remove the test-room aids marked `DEV` in `game/src/client/` (seat eyes, corner heads, Devam heads that switch seats, the robot button) along with test rooms.
   - Card balance: both passes are in the game (listed in `docs/rulings.md`). The 2026-11-18 Hırs and Kul pass (https://claude.ai/artifact/UN4Bfz4nMi8i1hyLckntu2) made every Kul recast a card. It added Defterdar, Nöbet, Nazar and Sükût (37 cards), renamed Casus to Mantık and Akıl Hocası to Oyunbozan, swapped Sümbül's and Matrakçı's cards, and gave seven Hırs cards new goals. Still to do: bring the manual up to date with it, and watch Defterdar and Sükût in playtests.
   - Feedback audit (2026-11-19, https://claude.ai/artifact/H5orxdR2AtHFBTRypuQmm2): every card and power now shows the same way as others of its kind, Kul recasts and Valide picks no longer name their owner, and Mühürlü Evrak has no target. The rules for what each phone shows are at the end of `docs/rulings.md`. The manual needs the Mühürlü Evrak text.
   - Art round 15 gave Azil, Kefalet, Casus and Çeşnigir their own stills (notes in `art/directions/notes.md`). Kefalet is the weakest pick (two small full-length figures); its alternate 2 is a close-up. The art comparison page and the UI proposal still link the old cards' stills. Round 16 widened 11 Kul card crops to head and shoulders; Lokman stays a close-up (no medium shot found).
   - Watch in playtests: does Tertip stay anonymous with Casus, Sümbül Ağa, Lokman Ağa and Sezgi? Do players stop objecting once they hold Azil? Tally the Kader 7/11 deck: after about 10 games, 7 or more Loyalist wins → 6/12; 7 or more Traitor wins → 7/10.
   - Not built yet: chat or a private Kulis channel for remote play; hosting beyond this Mac; handing a seat to a bot or a new player when someone leaves; a record of every finished game for playtest logging; in-game rules help.

## Sources
- `docs/rulebook-v0.1.pdf` — first ChatGPT rulebook.
- `docs/chatgpt-transcript.md` — the original ChatGPT conversation, recovered from the share link.
- `docs/chatgpt-v0.2-rulebook-source.py` — the script ChatGPT used for its v0.2 PDF; the only copy of v0.2's card text.
