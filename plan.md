# Entrika — plan

The living rules are the player manual (`manual.html`, published as an artifact). Its Notes section holds open decisions, tuning dials and parked ideas.

## Next
1. Review the v0.7 manual; confirm the "Proposed" items and settle the open questions in Notes. v0.7 is the 1534 court; the reasoning behind it is at https://claude.ai/artifact/Tgm55z6tdi3NwjVtsEMHEH.
2. 3–5 learning games in Basic mode, in the browser build. Paper is out since v0.7: Court is played in waves, and a physical table can't hide who played what across waves.
3. Log every game: player count, winner, final track state, minutes, what the losing side called unfair.
4. Tune the dials: Kader deck ratio, track lengths, allegiance counts.
5. Then Full mode (Companions, Ambitions, Favor powers).

## Browser game (see `docs/direction.md`)
1. Art: direction B, at https://claude.ai/artifact/KHGRZwpyu91CbWxZNv7kZH. It covers v0.7 card texts, Süleyman's gold-leaf frame, backs for all seven decks and the Varak ve mine icons (set in `art/icons/set/`, sheet at https://claude.ai/artifact/9xBpkHTszW3Fca2HkSsnC1). Tokens are in `art/directions/notes.md`, the term-icon table in `art/terms.json`. Still open:
   - stills for the v0.7 newcomers: Mustafa, Barbaros, Gritti, Şarlken, Şah Tahmasp, İskender Çelebi, Firuze Hatun, Isabella Fortuna;
   - replace the low-res Hazine Açığı and Venedik Elçiliği stills;
   - confirm the grade strength (15%);
   - AI-generated textures (deferred).
2. UI: v2 (the playable prototype at https://claude.ai/artifact/LRHXJ79aqaRtv5r4t5wipw, source in `ui/v2/src/`) was rejected on looks: gold bevels on every control read as a cheap mobile game. It stays as the interaction reference. v3 is a static design system at https://claude.ai/artifact/7drJc9A7wWYvoCAVvUkSzH (source in `ui/v3/src/`, notes in `ui/v3/notes.md`): paper for public, lacquer for private, the cast in a row, one prompt block. Waiting on Jingle's six decisions at the end of that page:
   - surface (paper and lacquer, all paper, all dark);
   - court order (fixed row with Süleyman centred, or the 13 November arc);
   - icons (emblems for game terms only, line glyphs for chrome);
   - interface type (Alegreya Sans plus Alegreya italic);
   - Kader deck count off the resting screen;
   - Sicil as the log's first tab.
3. First playable, built overnight end to end from the manual's current rules, reusing `art/terms.json`, the graded stills, the icon set and the UI prototype.

## Sources
- `docs/rulebook-v0.1.pdf` — first ChatGPT rulebook.
- `docs/chatgpt-transcript.md` — the original ChatGPT conversation, recovered from the share link.
- `docs/chatgpt-v0.2-rulebook-source.py` — the script ChatGPT used for its v0.2 PDF; the only copy of v0.2's card text.
