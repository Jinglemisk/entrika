# Icon round 2

Jingle found the Varak ve mine set generic. Two causes: every icon is the same gold-rim-and-enamel material, so at 15 px in card text the gold rim is all that reads and terms look alike; and many motifs are stock symbols (heart, question mark, cog, check, scales, target).

This round redraws the motifs as Ottoman objects and tries three treatments on the same 20 terms. Showcase: https://claude.ai/artifact/413jtyCL6ffgKCK6g74R9G (built from a scratchpad page; regenerate from these files if republishing).

- `cini/`: İznik tile painting. Rich, but busy at text size; needs an ivory keyline on lacquer.
- `kati/`: Ottoman paper-cut silhouettes, black masks tinted by meaning. Recommended. `tint/` and `tint-l/` are the pre-tinted paper and lacquer files; the colours are in `meaning.json` (lapis, al, malachite and gold match the UI v3 signal tokens).
- `mine2/`: the current enamel family with gold cut back to thin walls.

Motif changes from the current set: Nüfuz star → sorguç plume, Hüküm scales → signet ring, Hizmet check → whole seal with a rosette, Sadık plain shield → spiral wicker kalkan, Hırs target → drawn recurve bow.

## Making an icon

`./gen.sh <style> <name> [<style>/raw/divan.png]` runs one `codex exec` with `<style>/template.txt` and the row for `<name>` in `subjects.tsv` (subject, Çini colours, Mine enamel). Divan is the key, made without a reference; every other icon attaches it. Then `python3 -I post.py <style> <names…>` writes `set/` (512 master and -144/-72/-48), and `python3 -I tint.py` writes the Kat'ı tints. `raw/` is not committed.

## Open

Waiting on Jingle's pick. For Kat'ı, redo Kader (reads as a map pin), Hain (blade too thin at 16 px) and Ferman (looks like a lantern), then generate the other 29 terms. The game's chrome already uses line glyphs; the gold chrome icons in `art/icons/set/` should be dropped.
