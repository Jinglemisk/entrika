# Icon round 2

Jingle found the Varak ve mine set generic. Two causes: every icon is the same gold-rim-and-enamel material, so at 15 px in card text the gold rim is all that reads and terms look alike; and many motifs are stock symbols (heart, question mark, cog, check, scales, target).

This round redraws the motifs as Ottoman objects and tries three treatments on the same 20 terms. Showcase: https://claude.ai/artifact/413jtyCL6ffgKCK6g74R9G (built from a scratchpad page; regenerate from these files if republishing).

- `cini/`: İznik tile painting. Rich, but busy at text size; needs an ivory keyline on lacquer.
- `kati/`: Ottoman paper-cut silhouettes, black masks tinted by meaning. Recommended. `tint/` and `tint-l/` are the pre-tinted paper and lacquer files; the colours are in `meaning.json` (lapis, al, malachite and gold match the UI v3 signal tokens).
- `mine2/`: the current enamel family with gold cut back to thin walls.

Motif changes from the current set: Nüfuz star → sorguç plume, Hüküm scales → signet ring, Hizmet check → whole seal with a rosette, Sadık plain shield → spiral wicker kalkan, Hırs target → drawn recurve bow.

## Making an icon

`./gen.sh <style> <name> [<style>/raw/divan.png]` runs one `codex exec` with `<style>/template.txt` and the row for `<name>` in `subjects.tsv` (subject, Çini colours, Mine enamel). Divan is the key, made without a reference; every other icon attaches it. Then `python3 -I post.py <style> <names…>` writes `set/` (512 master and -144/-72/-48), and `python3 -I tint.py` writes the Kat'ı tints. `raw/` is gitignored.

## Outcome

Jingle picked Kat'ı on 2026-11-15. Kader, Hain and Ferman were redone and the other 15 terms the game uses were added (`kati/subjects2.tsv`, `kati/gen2.sh`; earlier attempts are `raw/*.v1.png`). The masters went to `art/icons/masks/`; see `art/icons/README.md`.
