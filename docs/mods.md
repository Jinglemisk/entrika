# Making a mod

A mod sets Entrika in another world: the same game, with its own names, card text and look. Mods never change what a card does. Every card, power and term keeps its effect and its internal id; a mod only says what that id is called and how it is described in its world.

A mod has two halves in one folder: its **words** (names, card text, flavor, the game's terms) and its **skin** (card frames, colours, fonts, icons, portraits, stills, the seal, music). The game knows the layout and nothing about any world.

## The folder

```
mods/<id>/
  mod.json         what the mod is
  tr.json          its words in Turkish
  en.json          its words in English
  skin.json        its look: what each part is made of
  skin.css         interface colours, fonts, card and table styling
  portraits.json   each Character's cut-out and crops (made by art/tools/portrait.py)
  cards/           card frames, drawn art, backs, shared SVG defs
  table/           the Sultan seat's ornament, the seal
  icons/           masks/, meaning.json, and set/ (built)
  art/             stills, portraits and their sources (art/manifest.json)
```

`mod.json`:

```json
{ "id": "got", "native": "en", "draft": true, "name": { "en": "Game of Thrones", "tr": "Taht Oyunları" } }
```

- **`native`** is the language the mod is written in first. A phone set to the other language falls back to it word by word, until that language's file has the word.
- **`draft: true`** means the mod is unfinished. The host can pick it only in test rooms. Remove the flag when `npm run mods` reports its native language complete.
- **`name`** is shown on the lobby's chips, in each language.

## The words file

Each words file has the same sections. Every one is keyed by the game's ids, the ones in `game/content/`.

```json
{
  "terms": {
    "minister": { "name": "Vekil", "acc": "Vekili", "dat": "Vekile", "gen": "Vekilin", "pl": "Vekiller" },
    "decree": { "name": "Hüküm", "acc": "Hükmü", "loc": "Hüküm'de", "stems": ["Hüküm", "Hükm"] }
  },
  "characters": {
    "hurrem": {
      "name": "Hürrem Sultan", "short": "Hürrem",
      "base": { "name": "Fısıltı", "text": "Hüküm'de Nüfuzu hangi Vekilin alacağını Süleyman yerine sen seçersin." },
      "favor": { "name": "Çifte Oyun", "text": "Bir dalgada bir yerine iki kart oyna." },
      "flavor": "Esir geldi, Haseki oldu."
    }
  },
  "companions": { "daye": { "name": "Daye Hatun", "text": "…", "flavor": "…" } },
  "intrigue":   { "valide": { "name": "Valide'nin Buyruğu", "text": "…", "flavor": "…" } },
  "ambitions":  { "suphe": { "name": "Şüphe Altında", "text": "…", "flavor": "…" } },
  "crises":     { "yeniceri": { "name": "Yeniçeri İsyanı", "text": "…" } },
  "kader":      { "h": { "name": "Hizmet", "text": ["…", "…"], "flavor": "…" }, "x": { … } },
  "taraf":      { "loyalist": { "name": "Sadık", "text": ["…", "…"], "flavor": "…" }, "traitor": { … } },
  "treason":    { "sorusturma": { "name": "Soruşturma", "text": "…" } },
  "strings":    { "tagline": "Sarayda bir hain var." }
}
```

- **The ids are internal.** They keep their Ottoman spelling (`valide`, `suleyman`, `kader`) and players never see them. Name each id for what it does in your world. Don't translate the Ottoman name: in Game of Thrones, `valide` is a card that lets you seat anyone you like, not "the Mother's Order".
- **What each id does** is in its `about` line in `game/content/`, in plain English. `npm run mods -- --worksheet <mod>` prints every id with its `about` line and the names it has so far, as a Markdown table to name from.
- **Card text** is plain text. Game terms in it get their icon by themselves: any word that starts with a term's stem, suffixes and all (Vekile, Nüfuzu, Divan'da). Other cards' names, Kul names and Character short names are marked the same way. Matching is case-sensitive.
- **`short`** is a Character's name as card text uses it (Hürrem for Hürrem Sultan). It defaults to the full name.
- **A crisis's `flavor`** is optional; every other card has one.
- **`strings`** overrides interface sentences for this mod, in this language only. Use it for lines that carry the world's flavor: `tagline`, `endLoyalty` ("Devlet ayakta."), `pref.music.why`. An override may use the same placeholders as the sentence it replaces.

## Terms and their forms

`terms` names the game's vocabulary: the Sultan's role, the Ministers, Influence, the fields, the tracks and so on. `game/content/terms.json` lists every term, with its icon and what it means. Each term has:

- **`name`**, the plain form;
- **forms**, written by hand, that the interface sentences ask for:
  - Turkish: `acc`, `dat`, `gen`, `loc`, `abl` (the cases), `pl` (plural), and a few others such as `plAcc` and `you` ("Hainsin": you are one);
  - English: `pl`, `a` ("a Minister", "an Envoy") and `the` ("the King", or just "Süleyman" when the role is a name);
- **`stems`**, the word starts the card-text matcher looks for. They default to the name. List more when the term changes shape in text (Hükm for Hükmü, Sadığ for Sadığı), or lowercase forms used mid-sentence (birinci Vekil).

The check lists exactly which forms the sentences use and which your file lacks. Forms aren't generated from rules, because Turkish sound changes (kitap → kitabı) and English articles would come out wrong.

## Interface sentences

The interface sentences live in `game/lang/<lang>.json`, written once per language for every mod. They name game things by id, and the active mod fills each one in:

| Placeholder | Becomes |
|---|---|
| `{term.minister}` | the term's name |
| `{term.minister:dat}` | one of its forms |
| `{card.valide}` | an Entrika card's name |
| `{char.hurrem}`, `{char.hurrem:short}` | a Character's name or short name |
| `{kul.daye}` | a Kul's name |
| `{power.ferman}` | a Character power's name |
| `{treason.sorusturma}` | a Treason track power's name |
| `{name}`, `{name:dat}` | a value from the game (a player's name, with its Turkish case suffix worked out) |

A sentence that starts with a placeholder gets a capital letter, so `{term.suleyman:the}` can open an English sentence as "The King". Turkish sentences are written so that names either take one of the term's forms or stand on their own ("{card.valide} kartını"). Names of cards and powers have no forms.

## When a word is missing

A phone shows a word from:

1. the mod, in the phone's language;
2. the mod, in its native language;
3. a visible marker, such as `⟦card.valide⟧`.

It never borrows a word from another mod. A finished mod has no markers in its native language; the check enforces that.

## The skin

`skin.json` names every part of the look. Paths are relative to the mod folder; a path starting with `/` is a URL on the game server (`muhtesem` points at the repo's `/art/` this way). Anything a skin leaves out shows the neutral skin in `game/skin/`: plain grey frames, a silhouette for art, no icons. A mod never borrows another mod's look.

```json
{
  "defs": "cards/defs.svg",
  "faces": {
    "char":   { "frame": "cards/char.svg", "base": ["#7b1d25", "#33090e"], "art": "cards/art-character.svg",
                "backdrop": "cards/backdrop.svg", "breakY": 152 },
    "intr":   { "frame": "cards/intr.svg", "base": ["#f5f1e6", "#e8e0cc"], "darkGems": true },
    …
  },
  "backs":    { "intr": "cards/back-intr.svg", "kader": "…", "taraf": "…", "hirs": "…", "kul": "…", "char": "…", "crisis": "…" },
  "tints":    { "char.hurrem": ["#a01a2a", "#3a0a10"] },
  "art":      { "intrigue.valide": { "src": "art/card.valide-1.jpg", "pos": "50% 16%" }, "companions.daye": { … },
                "crises.yeniceri": { … }, "kader.h": { … } },
  "icons":    { "dir": "icons/", "version": "1" },
  "niche":    { "path": "M0 120V46C0 22 30 12 50 0C70 12 100 22 100 46V120z", "sultan": "table/sultan-seat.html" },
  "seal":     "table/seal.svg",
  "frieze":   [{ "char": "hatice", "size": 84, "x": 0 }, …],
  "music":    { "drone": [146.83, 220], "scale": [293.66, 311.13, 369.99, 392, 440, 466.16, 523.25, 587.33],
                "wave": "triangle", "beat": [700, 1600] }
}
```

### Card frames

Every card is a 500 × 700 drawing with a fixed layout, the same in every mod:

| Slot | Where (card units) |
|---|---|
| Art window | x 50 to 450, from y 72 down to the name line |
| Name line | y 380 (Character cards: y 350, for two powers and a flavor line) |
| Text plate | from 42 under the name line to y 650 |
| Corner icon slots | (60, 60) for the card's kind, (440, 60) for its field when it has one |
| Compact card (under 150 px wide) | corner slots at (84, 84) and (416, 84), the name low down |

A Crisis is all picture: its art runs edge to edge above the name, with no window.

`faces` has one entry per card face: `char`, `sultan` (the Sultan role's Character card), `kul`, `intr`, `crisis`, `kader-h`, `kader-x`, `hirs`, `taraf-s`, `taraf-h`. Each entry has:

- **`frame`**: one SVG file (viewBox `0 0 500 700`) whose groups are the layers, marked with `data-layer`. The renderer stacks them in this order:

  | Layer | What it is |
  |---|---|
  | `window` | a `<path data-layer="window" d="…">`, not drawn: the art window's shape, used as its mask. Draw it inside the art window's box. A Crisis frame has none. |
  | `under` | drawn under the art: patterned bands, spandrels |
  | `frame` | drawn over the art: the border, the molding round the window, corner pieces |
  | `top` | drawn over everything else: the name band, ornaments, a seal over the art |
  | `slot` | the ground behind a corner icon, drawn round (0, 0); placed at each used corner slot |
  | `small` | the compact card's frame; mark its name band `class="sname"` |
  | `slot-small` | the compact card's corner ground, drawn round (0, 0) |

  The layers point at gradients, patterns and filters in **`defs`**, one shared SVG of `<defs>` for the whole skin. `#grade` there is the still grade if `skin.css` applies it (`.c3 .art img{filter:url(#grade)}`).
- **`base`**: the two colours of the card's ground (`--e1`, `--e2`); `skin.css` decides how they're painted.
- **`darkGems`**: the corner icons sit on a dark ground, so they're drawn in their light colour.
- **`art`**: the drawn art (an SVG) for a card without a photo: Hırs and Taraf always, a Character without a portrait, a Kul or Crisis without a still.
- **`backdrop`**: what a Character's cut-out stands in front of.
- **`breakY`**: on Character cards, the portrait's head rises over the frame down to this line (the arch's spring line in `muhtesem`). Leave it out and the portrait stays inside the window.

**`backs`** are one SVG per deck (500 × 700, the whole back). The deck's name is printed over it in HTML; place it with `skin.css` (`.c3.b-kader .bw{…}`) and mark a plate drawn for it `class="bplate"` so it hides on small cards.

**`tints`** optionally give one card its own base colours (`char.hurrem`, `intrigue.valide`, `companions.daye`, `crises.yeniceri`, `ambitions.suphe`), for a skin that colours cards by house.

In any skin SVG or HTML file, a relative `href` or `src` points into the mod folder.

### Stills and portraits

- **`art`** maps each card to its photo: `intrigue.<id>`, `companions.<id>`, `crises.<id>`, `kader.h`, `kader.x`. `pos` is the CSS object-position that keeps the subject in frame.
- **Portraits** are cut-outs of each Character, standing in their seat's niche and on their card. Make them with the portrait tool (below); it writes `portraits.json`. Each entry has the cut-out's `src`, its `card` crop (`cl`, `cw`, `ct` place it in the art window; `op` places it when the compact card crops it) and its `niche` crop (`hx` the head's centre, `y0` its top, `ar` the photo's height over width, `w` its width against the niche's). Nudge the numbers by hand if a portrait sits wrong.
- People are shown in real images only, never generated ones. Record every source in `art/manifest.json` (`source_url`, `source_page`, `note`, `focus`).

### Icons

One icon per id in `game/content/icons.json`, which says what each stands for. Draw them as 512 px black silhouettes in `icons/masks/<id>.png`, give each a colour in `icons/meaning.json` (a `paper` colour for light grounds and a `lacquer` colour for dark ones, grouped by meaning), and build the set:

```sh
python3 -I art/icons/build.py mods/<id>/icons
```

That writes `icons/set/<id>.png` and the -144, -72 and -48 sizes the game shows. Bump `version` in `skin.json` when you redraw icons under the same names, so phones drop the cached ones.

### The table and the screens

- **`niche`**: the seat's niche, a path in a `0 0 100 120` box; `mask` if the figure's mask should differ from the drawn shape; `sultan`, an HTML file drawn round the Sultan's niche (an SVG and any extra elements, styled in `skin.css`).
- **`seal`**: the image on the Decree screen.
- **`frieze`**: the Characters standing along the bottom of the home and lobby screens, with their height and left edge in pixels on the 852-wide screen.
- **`music`**: the quiet loop. A drone of `drone` frequencies, under a plucked melody that wanders `scale` (played an octave down), one note every `beat` milliseconds, in the `wave` oscillator's timbre.

### skin.css

`skin.css` is loaded as a stylesheet when the mod is active, after the game's own styles, so it overrides them. It holds:

- the interface tokens on `.ui` (`--paper`, `--lake`, `--ink`, `--gold`, `--lapis`, `--al`, `--mal` and the rest; the full list is at the top of `ui/v3/src/ui.css`) and the fonts (`--f-ui`, `--f-voice`, `--f-card`), loaded with `@import` from Google Fonts;
- the card look: `.c3` fonts (`--f-display`, `--f-body`), the ground (`.c3 > .base`), the name, the text plate, the power panels, the stamps, the still grade, the back words;
- the table: the Vekil niche's pattern (`.st.vk .nbg`), the Sultan ornament's styles, the Influence star, the shelf and its panels (`.zone`, `.zone .cn`).

`mods/muhtesem/skin.css` styles every one of these and is the reference.

## Tools

- `npm run mods` lists what every mod lacks in each language (words, terms, term forms, overrides of unknown sentences, unknown ids) and in its skin (frames, drawn art, backs, stills, portraits, icons and their colours, niche, seal, frieze, music, `skin.css`). The skin list is the checklist for drawing and sourcing. `--all` lists every missing item instead of the first dozen. It fails when a finished mod is incomplete in its native language or its skin.
- `npm run mods -- --worksheet <mod>` prints the nomenclature worksheet.
- `/?duzenle` is the card text editor on the dev server. Pick the mod and language at the top left. Empty fields show the native text as a hint. Kaydet writes into the mod's words file.
- `/?kartlar` draws every card. The pickers at the top right switch the mod and language, words and skin together.
- `python3 -I art/tools/portrait.py <mod> <character id> <photo>` makes a Character's portrait: it cuts the person out with macOS Vision (`art/tools/cutout.swift`, on this Mac, nothing uploaded), finds the face, writes the cut-out to `art/` and its crops to `portraits.json`. It needs macOS and Python with Pillow (WebP) and NumPy.
- `python3 -I art/icons/build.py mods/<id>/icons` builds the icon set.
- In a test room, the host can pick a draft mod in the lobby and play it through.

## Adding a mod

1. Make `mods/<id>/mod.json` with `draft: true`.
2. Print the worksheet and name everything: every term, Character, power, Kul, card, Hırs, Crisis, Kader and Taraf card, and Treason power.
3. Write the native words file. Use the editor for card text and edit `terms` by hand.
4. Run `npm run mods` until the native language is complete, play a test room, then write the second language.
5. Write the skin: start from `game/skin/` (the neutral skin) or `mods/muhtesem/`, draw the frames and backs, source the stills and portraits, draw and build the icons, and style `skin.css`. Run `npm run mods` until the skin is complete.
6. Drop `draft` from `mod.json`.
