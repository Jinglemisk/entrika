# Entrika — plan

The living rules are the player manual (`manual.html`, published as an artifact). Its Notes section holds open decisions, tuning dials and parked ideas.

## Next
1. Review the v0.7 manual; confirm the "Proposed" items and settle the open questions in Notes. v0.7 is the 1534 court; the reasoning behind it is at https://claude.ai/artifact/Tgm55z6tdi3NwjVtsEMHEH.
2. 3–5 learning games in Basic mode, in the browser build. Paper is out since v0.7: Court is played in waves, and a physical table can't hide who played what across waves.
3. Log every game: player count, winner, final track state, minutes, what the losing side called unfair.
4. Tune the dials: Kader deck ratio, track lengths, allegiance counts.
5. Then Full mode (Companions, Ambitions, Favor powers).

## Browser game (see `docs/direction.md`)
1. Art direction: B picked. Round 5 (one name line, icon frequencies, studio-lit Character portraits) is at https://claude.ai/artifact/KHGRZwpyu91CbWxZNv7kZH. Tokens are in `art/directions/notes.md`, roster portraits in `art/stills/roster/` and the term-icon table in `art/terms.json`. Still open:
   - settle the grade strength with the slider;
   - replace the low-res Hazine Açığı and Venedik Elçiliği stills;
   - AI-generated textures (deferred);
   - find art for Ayas Paşa;
   - v0.7 roster art: hero shots for Mustafa, Barbaros, Gritti, Şarlken and Şah Tahmasp; Kul window art for Malkoçoğlu (his roster still is ready), İskender Çelebi and Firuze Hatun; full-art stills for Irakeyn Seferi and Isabella Fortuna;
   - `art/terms.json`: add the five new Characters, and move Malkoçoğlu from Character to Kul.
2. Final art in the chosen direction: card templates, icon set, portraits, popups.
3. UI layout proposal (subagent), once the art is final, from the decisions in the UI section of `docs/direction.md`.
4. First playable, built overnight end to end from the manual's current rules.

## Sources
- `docs/rulebook-v0.1.pdf` — first ChatGPT rulebook.
- `docs/chatgpt-transcript.md` — the original ChatGPT conversation, recovered from the share link.
- `docs/chatgpt-v0.2-rulebook-source.py` — the script ChatGPT used for its v0.2 PDF; the only copy of v0.2's card text.
