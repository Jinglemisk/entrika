# Entrika — plan

The game is playable end to end (rules v0.9, `game/README.md`) in three settings, each in Turkish and English. The mods work below is done (2026-11-20); what's left is under Next.

| Mod | Setting | Written first in |
|---|---|---|
| `muhtesem` | Muhteşem Yüzyıl, Süleyman's court, 1520s–1550s | Turkish |
| `got` | Game of Thrones: Joffrey's court, Blackwater to the Purple Wedding (seasons 3–4) | English |
| `cumhuriyet` | Ankara, November 1924 to August 1925: who comes after the Gazi | Turkish |

## The model

- **Mod** is picked by the host in the lobby and holds for the whole room. **Language** is picked on each phone, so one room can read in two languages. The log and every prompt are stored as keys, so this works.
- A mod is written first in its native language. The other language is written from it. A phone whose language the mod lacks falls back to the mod's native language.
- The game is called **Entrika** in every mod. The mod's name is its subtitle.

Three layers, and who owns each:

| Layer | Owner | Example |
|---|---|---|
| Mechanics | The engine, shared by every mod | `valide`: a Divan card played on a Minister that replaces them; the owner may pick themselves |
| Words | Each mod, in each language | `valide` is "Valide'nin Buyruğu" (muhtesem/tr), "Mother's Demand" (muhtesem/en), something of its own in got/en |
| Look | Each mod's skin | Card frames, colours, patterns, icons, portraits, stills, seal, fonts, music |

- **Ids are internal.** They keep their current, Ottoman-flavoured spelling (`valide`, `suleyman`, `kader`) and are never shown. A mod names an id for its own world; it doesn't translate the Ottoman name.
- **Interface sentences are written once per language,** not per mod. They name game things by id, and the mod fills the name in: `Bu el {card:valide} kartını oynayamazsın`, `{term:minister:dat} itiraz et`.
- **Grammatical forms are written by hand,** not computed:
  - each Turkish term has its case forms (Vekil, Vekili, Vekile, Vekilin, Vekilde, Vekilden);
  - each English term has its singular, plural and article form.

  Computed suffixes are kept only for player names. A mod may override a whole sentence when its world needs other wording.
- **Fixed layout, free look.**
  - Fixed in every mod: the card's size, the positions of the name band, art window, text box, flavor line and two corner icon slots; the table layout (seat row, name position, Influence counter under it, tracks, shelf, prompt block).
  - Changed by each mod: the frame drawn for each card kind, the art window's shape, card backs, palettes, patterns, the seat niche, the seal, the frieze, interface colours, fonts, the still grade and music.
- **A skin is data and files, not code.** The renderer knows the layout and nothing about any setting. Adding a mod means adding a folder.

## Phases

### 1. Groundwork: words (done 2026-11-20, see `docs/mods.md`)
- Content files keep only mechanics. Each mechanic gets a short neutral English line saying what it does, for mod authors.
- Every name, text and flavor line moves into the `muhtesem` mod's Turkish words.
- Engine and server errors become keys with values.
- Words hard-coded in components and the card renderer become keys.
- Interface sentences are rewritten from scratch with placeholders (`{term.minister:dat}`, `{card.valide}`), in Turkish and in English. Each term gets hand-written forms. The card-text icon matcher reads its stems from the active mod and language.
- A language switch goes on the home screen and in settings.
- The room gets a `mod` setting, and the host picks it in the lobby. Phones switch mods while running.
- The card gallery and the text editor get mod and language pickers. The editor saves into the mod's words.
- A **mod check** lists what each mod is missing in each language: names, texts, forms, sentence overrides and assets. It also prints the **nomenclature worksheet**: every id with its mechanical line, for naming.
- **Done when:** a screenshot comparison of every card and a staged game shows no change, and the tests pass.

### 2. Groundwork: skins (done 2026-11-20, see `docs/mods.md`, "The skin")
- The card renderer is rebuilt around the fixed layout. Frames, window shapes, backs, palettes, patterns and the still grade come from the mod's skin.
- The skin also supplies:
  - the seat niche (with the Süleyman seat's gilding);
  - the seal on the Decree screen and the Crisis back;
  - the frieze;
  - interface colour tokens and fonts;
  - the term icons and their colours;
  - portraits with their card and niche crops;
  - card stills;
  - music settings.
- Today's Ottoman look moves into the `muhtesem` skin and must come out identical. Asset paths in a skin are relative to the mod folder; `muhtesem` keeps pointing at the existing `art/` files, so nothing is moved.
- A repo tool makes character cut-outs (macOS Vision foreground mask) and computes their crops from the face, so every mod produces portraits the same way.
- **Done when:** screenshots match today's, and a crude test skin proves that every slot switches.
- Landed as: `mods/<id>/skin.json` (frames as layered SVGs, backs, stills, tints, icons, niche, seal, frieze, music), `skin.css` (tokens, fonts, decoration), `portraits.json`; the neutral fallback skin in `game/skin/`; the portrait tool `art/tools/portrait.py` (+ `cutout.swift`); `art/icons/build.py <icons folder>`; `game/content/icons.json` lists every icon id; `npm run mods` lists each skin's gaps, the mod authors' sourcing checklist.

### 3. The mods (done 2026-11-20)
One agent per mod, each on its own branch:

1. **Proposal:** art direction, plus who each Character and Kul is, and what each Entrika, Hırs, Crisis and term is called. Reviewed before any writing.
2. **Words:** every name, text and flavor line in the native language, then the second language. Reviewed.
3. **Skin and assets:** frames, colours, patterns, icons, seal, fonts and music. Portraits and stills sourced for every Character, Kul, Entrika, Crisis and Kader card. People are shown with real images only:
   - `got`: stills from the series;
   - `cumhuriyet`: period photographs;
   - `muhtesem`: the existing stills, filling any gaps.

   Generated images are allowed for icons and textures only.
4. **Merge:** the mod check passes for both languages, a full game is played through in each mod, and every screen is checked.

`muhtesem` needs its English words and any missing art, not a new look.

Each mod's `PROPOSAL.md` holds its world, roster and art direction, and the decisions taken in review. Each `art/manifest.json` marks its weak images.

### Rules for every mod
- Same mechanics, ids and card counts. No new effects.
- Every screen, card and line reads as that world. Nothing Ottoman leaks into `got` or `cumhuriyet`.
- Real people are shown only in real images, never generated ones.
- Sources go in the mod's asset manifest.

## Next
- **Sources:** `got` and `cumhuriyet` follow the designer's research pages, "Entrika Westeros" (https://claude.ai/artifact/KcTKLNY8bj3YjP9eHbaixP) and "Entrika Cumhuriyet" (https://claude.ai/artifact/5zr1hAMcnsd6ZuCZAQfCYB), adapted from rules v0.7 to v0.9. Each mod's `PROPOSAL.md` has the mapping.
- **Check the Turkish names in `got`** against the official translation; `mods/got/art/manifest.json` lists the unverified ones (Hazine Ustası, Dönek, Arbor Kırmızısı, Boğucu, Mor Düğün, Serçeparmak and others).
- **Weak images** (each mod's manifest marks them `weak`):
  - `got`: Dontos's portrait, Bastard Letters (a generic letter), a few season 1–2 stills (Kingsguard Watch, Talk in the Taverns, A Fool's Wager, Maester's Remedy);
  - `cumhuriyet`: Latife (not frontal), Halide (small head), portraits dated after 1925 (Celal Bayar, Recep Peker, Nuri Conker, Renda, Ali Fuat), Mahmut Esat in profile, Şeyh Said İsyanı and Şapka Kanunu (stand-ins: their real photos show leaders or the Gazi), Santral (a Seattle switchboard), Musul Meselesi (a map);
  - `muhtesem`: Pledge, Counterplot (dark), Lokman (close-up).
- **Cumhuriyet's Gazi** is under respect rules: real portraits only, on his card, seat and the frieze centre; the Traitors' win is "Karşı Devrim" and nobody dies. Seven research Yaverler with no portrait above 400 px were swapped for figures with the same fit (table in its proposal).
- **Bundle size:** every mod's words and frame SVGs are bundled, so the app is over 800 kB. Load a mod's skin files on demand if it grows.

## Later
- The rules manual for each mod and language. Today it is English with Ottoman names, at `/kurallar`. The mod files become the one source for names, and the manual's Lexicon retires.
- Before release, remove the test aids marked `DEV` in the client: seat eyes, corner heads, the Devam heads that switch seats, the robot button, the test-game row on home, and the test rooms themselves.
- Playtests:
  - log every game (player count, winner, final tracks, minutes, what the losing side called unfair);
  - tune the Kader deck (7/11), the track lengths and the allegiance counts;
  - watch Defterdar, Sükût, and whether Tertip stays anonymous.
- Not built: hosting beyond this Mac, chat or a private Kulis channel for remote play, handing a seat to a bot when someone leaves.

## Sources
- `docs/direction.md` is the standing brief. `docs/rulings.md` lists the engine's rulings and the rules for what each phone shows.
- `docs/rulebook-v0.1.pdf`, `docs/chatgpt-transcript.md` and `docs/chatgpt-v0.2-rulebook-source.py` are the design history.
- `art/directions/notes.md` holds the Ottoman art rounds; `art/stills/manifest.json` lists the still sources.
