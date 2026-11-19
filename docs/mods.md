# Making a mod

A mod sets Entrika in another world: the same game, with its own names, card text and look. Mods never change what a card does. Every card, power and term keeps its effect and its internal id; a mod only says what that id is called and how it is described in its world.

This page covers a mod's words. Phase 2 of `plan.md` adds its look (frames, colours, icons, portraits, stills, music) to the same folder.

## The folder

```
mods/<id>/
  mod.json      what the mod is
  tr.json       its words in Turkish
  en.json       its words in English
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

## Tools

- `npm run mods` lists what every mod lacks in each language: words, terms, term forms, overrides of unknown sentences, unknown ids. `--all` lists every missing item instead of the first dozen. It fails when a finished mod is incomplete in its native language.
- `npm run mods -- --worksheet <mod>` prints the nomenclature worksheet.
- `/?duzenle` is the card text editor on the dev server. Pick the mod and language at the top left. Empty fields show the native text as a hint. Kaydet writes into the mod's words file.
- `/?kartlar` draws every card. The pickers at the top right switch the mod and language.
- In a test room, the host can pick a draft mod in the lobby and play it through.

## Adding a mod

1. Make `mods/<id>/mod.json` with `draft: true`.
2. Print the worksheet and name everything: every term, Character, power, Kul, card, Hırs, Crisis, Kader and Taraf card, and Treason power.
3. Write the native words file. Use the editor for card text and edit `terms` by hand.
4. Run `npm run mods` until the native language is complete, play a test room, then write the second language.
5. Drop `draft` from `mod.json`.
