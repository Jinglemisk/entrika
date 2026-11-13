# Entrika — plan

The living rules are the player manual (`manual.html`, published as an artifact). Its Notes section holds open decisions, tuning dials and parked ideas.

## Next
1. Review the v0.6 manual; confirm the "Proposed" items and settle the open questions in Notes.
2. Paper prototype (index cards are fine) and 3–5 learning games in Basic mode.
3. Log every game: player count, winner, final track state, minutes, what the losing side called unfair.
4. Tune the dials: Kader deck ratio, track lengths, allegiance counts.
5. Then Full mode (Companions, Ambitions, Favor powers).

## Browser game (see `docs/direction.md`)
1. Art direction: B picked. Round 4 (window art standard, cut-out Characters, full-art Crises, real tuğra) is at https://claude.ai/artifact/KHGRZwpyu91CbWxZNv7kZH. Tokens are in `art/directions/notes.md`, roster portraits in `art/stills/roster/` and the term-icon table in `art/terms.json`. Still open:
   - settle the grade strength with the slider;
   - replace the low-res Hazine Açığı and Venedik Elçiliği stills;
   - AI-generated textures (deferred);
   - find art for Ayas Paşa and Kara Ahmed Paşa.
2. Final art in the chosen direction: card templates, icon set, portraits, popups.
3. UI layout proposal (subagent), once the art is final, from the decisions in the UI section of `docs/direction.md`.
4. First playable, built overnight end to end from the manual's current rules.

## Sources
- `docs/rulebook-v0.1.pdf` — first ChatGPT rulebook.
- `docs/chatgpt-transcript.md` — the original ChatGPT conversation, recovered from the share link.
- `docs/chatgpt-v0.2-rulebook-source.py` — the script ChatGPT used for its v0.2 PDF; the only copy of v0.2's card text.
