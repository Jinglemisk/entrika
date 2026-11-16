# Icons

The game's term icons are the Kat'ı set: Ottoman paper-cut silhouettes, one per game term.

- `masks/<name>.png`: the 512 px source silhouettes (black, alpha = the cut paper). Made with Codex from `proposals/r2/kati/template.txt`; the subjects are in that folder. Except `once` (a bold 1) and `always` (∞): plain symbols drawn by `glyphs.py` so they read on the 18 px frequency disc.
- `meaning.json`: each icon's colour, one per meaning, with a paper value and a lacquer value.
- `set/`: built by `python3 -I art/icons/build.py`, each mask tinted with its paper colour, at 512, 144, 72 and 48 px. Never edit these by hand.

The game shows a `set/` file as it is on light grounds. On dark grounds (lacquer zones, the frequency discs, the black corner-gem discs) the CSS masks the same file with the lacquer colour; on a filled button it takes the label colour. `cards/terms.ts` (`iconHtml`) and `ui/marks.tsx` (`Em`) carry both colours; the rules are at the top of `cards/cards.css`.

To add or change an icon: generate the mask with the Kat'ı template and Divan as the style key, drop it in `masks/`, give it a colour in `meaning.json`, and run the build. If a file changes under the same name, bump `?v=` in `iconUrl` (`cards/terms.ts`) so browsers drop the cached copy.
