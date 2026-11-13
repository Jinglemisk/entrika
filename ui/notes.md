# Entrika: UI layout proposal

The spec for the first playable's screens, published at https://claude.ai/artifact/QdvwmggdeWJ3mTdBr47eJH. It follows the fixed UI decisions in `docs/direction.md` and Jingle's 2026-11-13 calls (cards sit in front of the targeted player, fields are only card tags, short Character names, round-5 card text, visible power-use state).

## How the page is put together

- `index.html` is the whole page. The block between `BEGIN ART` and `END ART` near the end is copied from `art/directions/index.html` (card CSS, the two SVG sprites, one card article per card kind) and `art/terms.json`. When the art page changes, re-copy that block; cards are matched by the image they show, not by position, because the art page keeps moving.
- Cards the art page doesn't draw (most Entrika kinds, most Kul, İtirazcı) are made in the page script by patching an existing card's name, image, number, field gem and text.
- Images are published under `img/`. Most map to the baked stills in `art/stills/graded/`. The Character cut-outs and the Crisis full-art crops have no baked copies yet, so they come from `art/directions/img/` ungraded; the bake should cover them before the build.
- Every screen is fluid: it reads `env(safe-area-inset-*)` in full-screen mode and fixed 59/59/21 px insets inside the drawn phone frames, and sizes the middle band from the container height (`cqh`). That's what lets one layout serve 852×393, 932×430 and a Safari tab.

## Still open (details on the page, "For Jingle")

- Claim rule: public "mine" (variant A) or private choices (variant B).
- Face-down cards visible during the night, or only from «Saray uyansın».
- Enforced Loyalist duty in Kader (a lock) versus a warning.
- Recast declared at placement.
- Powers that act inside another player's step (Fısıltı, Himaye, Göz Bebeği, Yön Değiştir) need a short prompt window; Rüstem's Kulis has no in-app form.
