# Entrika · Cumhuriyet: proposal

**Version 2 (2026-11-20).** Rebuilt on the designer's research page, *Entrika Cumhuriyet* (https://claude.ai/artifact/5zr1hAMcnsd6ZuCZAQfCYB). That page was written for rules v0.7; this file adapts it to v0.9, using the `about` lines in `game/content/*.json`. Prose is in English; every name is Turkish. Version 1 (Birinci Meclis, 1920–23) is in git history.

## 1. The world

**Ankara, November 1924 to August 1925: the succession window.** It opens when Karabekir, Rauf, Ali Fuat and Refet found the Terakkiperver Cumhuriyet Fırkası and closes when Latife Hanım and the Gazi divorce. Fethi and İsmet both serve as Başvekil; the Şeyh Said rebellion breaks out; the Takrir-i Sükûn law shuts the opposition down. A few Buhran cards reach into 1926, or back to March 1924. Every Character was a real candidate to come after the Gazi, or close to one.

- The Başvekil drafts three bills (Tasarı) and sends two; the Meclis Reisi passes one. İnkılap goes on the İnkılap track, İrtica on the İrtica track.
- As reaction rises, the Gazi gets the tools the regime really used: the İstiklal Mahkemesi, police reports and the Takrir-i Sükûn.
- **The Traitors' win is Karşı Devrim:** the counter-revolution wins. Nobody dies. Law 5816 and taste both rule out a game won by the Gazi's death.
- **Respect rules (unchanged):** the Gazi appears only in real portraits, only on his card, his seat and the centre of the frieze; nothing in the game acts on his image; no flag on any defeat, İrtica or Mürteci card; no flavor line defames a real person. Saf is dealt at random, so the game labels no real person a Mürteci.

### Terms

| Glossary | muhtesem | cumhuriyet | Note |
|---|---|---|---|
| Sultan role | Süleyman | **Gazi** | His title; the surname Atatürk comes in 1934 |
| Loyalist / Traitor | Sadık / Hain | **İnkılapçı / Mürteci** | They match the İnkılap and İrtica cards |
| Allegiance | Taraf | **Saf** | |
| First / Second Minister | Birinci / İkinci Vekil | **Başvekil / Meclis Reisi** | One drafts the bill, the other passes it |
| Minister | Vekil | **Vekil** | Either seat |
| Character | Karakter | **Şahsiyet** | |
| Wildcard | – | **Ecnebi** | Outsiders to Ankara's cabinet |
| Companion | Kul | **Yaver** | |
| Crisis | Kriz | **Buhran** | |
| Court | Tertip | **Kulis** | Played in waves (dalga) |
| Objection | İtiraz | **Gensoru** | A motion that can bring down a minister |
| Decree | Hüküm | **Takdir ve Tekdir** | Short forms: Takdir after İnkılap, Tekdir after İrtica |
| Sultan's base power | Ferman | **Kararname** | |
| Kader deck / step | Kader | **Tasarı / Oylama** | Bills for reform or reaction |
| Hizmet / Hıyanet | Hizmet / Hıyanet | **İnkılap / İrtica** | |
| Intrigue | Entrika | **Entrika** | |
| Ambition / Favor | Hırs / Lütuf | **Hırs / Teveccüh** | |
| Base power | Temel güç | **Meziyet** | |
| Influence | Nüfuz | **İtibar** | |
| Divan / Harem / Saray | Divan / Harem / Saray | **Meclis / Çankaya / Ankara** | The Assembly, the Gazi's house, the whole capital |
| Loyalty / Treason track | Sadakat / İhanet yolu | **İnkılap / İrtica** | |
| Sultan's death | Süleyman'ın ölümü | **Karşı Devrim** | |
| Investigator | müfettiş | **müfettiş** | Named by the İstiklal Mahkemesi |
| Tagline | Sarayda bir hain var. | **Çankaya'da bir hain var.** | From the research page |

## 2. Roster, v0.7 → v0.9

v0.9 has 7 court Characters plus the Gazi; the research had 8 for v0.7 slots. Mihrimah's slot no longer exists, so **Halide Edib moves to the Yaverler** (nobet), where a writer at the centre of politics fits; her v0.7 powers (peek at the Başvekil's draw, give İtibar) have no v0.9 home.

### Şahsiyetler

| id (v0.9 powers) | Research slot (v0.7) | Şahsiyet | Meziyet / Teveccüh | Fit |
|---|---|---|---|---|
| `suleyman` Ferman | Süleyman | **Gazi Mustafa Kemal Paşa** | Kararname | Unchanged |
| `hurrem` Fısıltı / Çifte Oyun | Hürrem | **Latife Hanım** | Köşkün Hanımı / Peçesiz | Same powers as v0.7 |
| `ibrahim` Sadrazam / Divan Nüfuzu | Pargalı | **İsmet Paşa** | Kabineyi Kurmak / İkinci Adam | Base unchanged; the favor now pays on İnkılap while he is Vekil instead of on appointment: the second man earns from the reforms |
| `sahsultan` İtiraz / Sürgün | Mahidevran | **Kâzım Karabekir** | Terakkiperver / Kara Liste | His v0.7 powers are exactly v0.9's `sahsultan` |
| `mustafa` Veliaht / Ocak Sevgisi | Mustafa | **Fevzi Paşa** | Erkân-ı Harbiye / Ordunun Babası | New powers: the Chief of Staff steps into a seat at the last moment; a Gensoru against the army's father pays him |
| `hatice` Himaye / Sezgi | Hatice | **Fethi Bey** | Hoşgörü / Paris'ten Mektup | Hoşgörü (v0.7: cancel a Tekdir) widens to v0.9's shield; a letter from Paris tells him whether two players share a Saf |
| `rustem` Kulis / Yön Değiştir | Rüstem | **Celal Bayar** | Çankaya Sofrası / Saf Değiştir | Same powers as v0.7 |
| `barbaros` Ganimet / Gözcü | Barbaros | **Rauf Bey** | Hamidiye Baskını / Seyir Defteri | Same powers as v0.7 |
| `gritti` Faiz / Venedik Postası | Gritti | **Cavid Bey** (Ecnebi) | Faiz / Lozan Dosyası | Same |
| `sarlken` Feragat / Plus Ultra | Şarlken | **Abdülmecid Efendi** (Ecnebi) | Feragat / Ümmetin Halifesi | Same |
| `tahmasp` Cephe / Yakıp Yıkma | Tahmasp | **Venizelos** (Ecnebi) | Ege Cephesi / Yakıp Yıkma | Ege Cephesi now picks the Buhran's field (v0.9 Cephe) instead of peeking at two Buhran cards |

### Yaverler (every Yaver recasts in v0.9)

| id → recast | Yaver | Research (v0.7) | Fit |
|---|---|---|---|
| `daye` → valide | **Recep Peker** | Meclis Kararı | Same: the party secretary writes the group's decision, never for himself |
| `bali` → muhur | **Salih Bozok** | Tasdik | Same |
| `ayas` → azil | **Kılıç Ali** | Kabine Tadili (seat swap, gone in v0.9) | The Gazi's man on the tribunal: the Gazi picks the newcomer |
| `matrakci` → casus | **Falih Rıfkı** | Köşk Dedikodusu (peek hand and Hırs) | The journalist inside Çankaya sees what a player played and on whom |
| `sumbul` → akil-hocasi | **Mahmut Esat Bozkurt** | Dokunulmazlık | Same; the jurist chooses its field |
| `nigar` → muhurlu-evrak | **Hasan Rıza Soyak** | Şifreli Telgraf | Same |
| `ebussuud` → teftis | **Ali Çetinkaya** | Tahkikat | Same |
| `gulsah` → iftira | **Yunus Nadi** | Gazete Kampanyası | Same |
| `seker` → saray-tabibi | **Tevfik Rüştü Bey** | Doktor Raporu | Same |
| `gulfem` → kefalet | **Nuri Conker** | İstiklal Madalyası (gone) | The childhood friend stands surety for a Vekil and shares his fate |
| `iskender` → defterdar | **Abdülhalik Renda** | Special: Başvekil draws 4, discards 2 | That special is exactly v0.9's `defterdar` |
| `firuze` → nazar | **Afet Hanım** | Special: +1 when gaining İtibar | Close to the Gazi: his Takdir or Tekdir on a Vekil counts double |
| `gulaga` → sukut | **Makbule Hanım** | Special: hand limit 4 | The sister who kept his house keeps it quiet: a player sits out the next wave |
| `lokman` → nobet | **Halide Edib** | Character (Mihrimah's slot, gone) | The writer finds out who played a card on a player |

**Dropped: Sabiha.** She was 12 and adopted only in 1925, and her v0.7 special has no v0.9 home. Women: Latife, Halide, Afet, Makbule (4).

### Entrika

| id | Field × copies | Name | Note |
|---|---|---|---|
| `akil-hocasi` | Meclis 2, Çankaya 2 | **Dokunulmazlık** | Research |
| `muhur` | Meclis 3 | **Tasdik** | Research; the Kararname still overrides it |
| `valide` | Meclis 4 | **Meclis Kararı** | Research |
| `azil` | Meclis 3 | **Kabine Tadili** | Research name, new mechanic: the Gazi picks the newcomer |
| `casus` | Çankaya 2 | **Sivil Polis** | New: a plain-clothes man tails one player |
| `muhurlu-evrak` | Çankaya 2 | **Şifreli Telgraf** | Research |
| `saray-tabibi` | Çankaya 2 | **Doktor Raporu** | Research |
| `iftira` | Çankaya 3 | **Gazete Kampanyası** | Research |
| `kefalet` | Çankaya 3 | **Kefil** | New: you vouch for a Vekil and share the vote's outcome |
| `teftis` | Meclis 3 | **Tahkikat** | Research |
| `defterdar` | Meclis 2 | **Ek Tasarı** | New: the Başvekil drafts four bills |
| `nobet` | Meclis 2 | **Santral** | New: the Assembly switchboard knows who called |
| `nazar` | Çankaya 2 | **Manşet** | New: the front page doubles praise or blame |
| `sukut` | Çankaya 2 | **Sansür** | New: the Takrir-i Sükûn year |

### Hırs

| id | v0.9 goal | Name |
|---|---|---|
| `divanda-nufuz` | Unseat a Vekil with an Entrika | **Kabine Düşürmek** (new) |
| `suphe` | Be Vekil when İrtica is played | **Şüphe Altında** |
| `takdir` | Be Vekil when İnkılap is played | **İnkılaba Ortak** (new: the research's Gazi'nin Takdiri was a different goal) |
| `gozden` | Lose İtibar | **Gözden Düşmek** |
| `kulisci` | Entrika on 3 different players | **Kulisçi** |
| `yukselen` | Vekil in 2 crises | **Kabinede Söz** |
| `itirazci` | Make a Gensoru | **Gensoru Veren** |
| `hedef` | 2+ Entrika on you in one crisis | **Hedef Tahtası** |
| `ortak` | Tasdik or Kefil on a Vekil | **Silah Arkadaşı** |
| `hazine` | Play 3 Entrika in one crisis | **Seferberlik** (new: the research's Örtülü Ödenek was "end holding 3") |
| `koltuk` | Become Vekil through an Entrika | **Koltuk Kapmak** |
| `kulak` | Use Sivil Polis, Şifreli Telgraf, Tahkikat or Santral | **Kulak Misafiri** |

### Buhranlar

| id | Field | Draw | Name |
|---|---|---|---|
| `yeniceri` | Meclis | 0 İtibar | **Şeyh Said İsyanı** (Feb 1925) |
| `hazine` | Ankara | Nobody | **Düyun-ı Umumiye** |
| `venedik` | Ankara | Beside the Gazi | **Elçilikler Ankara'ya** |
| `harem` | Çankaya | Least İtibar | **Köşkte Kavga** |
| `macar` | Meclis | Nobody | **Sıkıyönetim** (Feb 1925). The research's "Takrir-i Sükûn" is now the 4th İrtica power, so this card takes the martial law that came with it |
| `muhur` | Çankaya | Last Vekils | **Kayıp Şifre** |
| `divan` | Meclis | Last Vekils | **Terakkiperver Kuruldu** (Nov 1924) |
| `sehzade` | Çankaya | Beside the Gazi | **Veraset Meselesi** |
| `istanbul` | Çankaya | Everyone | **Şapka Kanunu** (Nov 1925) |
| `irakeyn` | Meclis | Least İtibar | **Musul Meselesi** |
| `isabella` | Ankara | Last Vekils | **Hanedan Sürgünü** (Mar 1924) |

### Tasarı, Saf and the İrtica track

| Card or space | Name |
|---|---|
| Kader `h` / `x` | **İnkılap / İrtica** (a bill for reform or reaction) |
| Taraf | **İnkılapçı / Mürteci** |
| İrtica 2 `sorusturma` | **İstiklal Mahkemesi**: a müfettiş looks at one Saf card |
| İrtica 3 `hazineDefteri` | **Emniyet Raporu**: a named player looks at the top 3 bills |
| İrtica 4 `fermanRefresh` | **Takrir-i Sükûn**: the Gazi may use his Kararname again |
| İrtica 5 `death` | **Karşı Devrim**: the Mürteciler win |

## 3. Art direction

**Changes for version 2:** the palette, fonts, brass Deco frames and Damga icon style stay. The Kader deck becomes a kanun tasarısı (a bill with the Meclis stamp) instead of a telegram form: its frame, back and the icons `kader`, `hizmet`, `hiyanet`, `loyalty`, `treason`, `death`, `loyalist`, `traitor`. `harem` becomes the Çankaya köşk; `min1` / `min2` become the Başvekil and Meclis Reisi seats. The frieze and the stills follow the new cast and cards.

**One line:** an Onuncu Yıl poster printed on 1920s newsprint. Cream paper, flag red, navy and khaki in flat letterpress colours, brass rules, sunbursts and stepped Deco corners. The Ottoman version's gold leaf, arches, rumi, tiles and tughra are gone.

Surfaces follow the same rule as v3 ("public is paper, private is lacquer"), renamed **kâğıt ve bakalit**: public on newsprint, private on bakelite, the dark brown resin of 1920s and 30s telephones and radios.

### Palette

| Token | Hex | Use |
|---|---|---|
| Kâğıt | `#EEE6D3` | Public surfaces, card faces |
| Kâğıt gölgesi | `#D8CBAF` | Aged edges, panels |
| Mürekkep | `#1E1C19` | Text |
| Bakalit | `#2A1E18` | Private surfaces (hand, Taraf, Telgraf, peeks) |
| Bakalit ışığı | `#4A362B` | Raised areas on bakalit |
| Pirinç | `#B08D45` (light `#E6CF8F`, shadow `#6E5420`) | Card frame metal: machined brass bands, not gilding |
| Al | `#B3221F` | The flag's red: Gazi, Takdir, İtibar |
| Lacivert | `#23406E` | Office: Meclis, Vekil |
| Haki | `#556B2F` | The national army's uniform: Zafer, Vatansever |
| Ankara taşı | `#A0624D` | The pink andesite of Ulus: Kulis |
| Kopya kalemi | `#4F3B78` | The violet of indelible pencil and telegraph stamps: Telgraf, secrets |
| Kara | `#2B2522` | Mourning black (Istanbul papers ran black borders under occupation): Hezimet, Hain |
| Kurşun | `#5A6168` | Printing lead: Entrika |

### Icon family: Damga

Flat rubber-stamp silhouettes with Deco geometry: straight cuts, 45° chamfers, round terminals, no outlines, one silhouette per term. Each shows a period object, as the Kat'ı set shows court objects. Made from a new template in the same pipeline (masks, `meaning.json`, build).

| Colour (paper / bakalit) | Terms and motifs |
|---|---|
| Al `#B3221F` / `#F2958A` | Gazi (kalpak), İtibar (five-point star), Takdir (pen nib), Başkumandanlık (field binoculars), Ankara (castle silhouette) |
| Lacivert `#23406E` / `#9EB4DE` | Meclis (rostrum), Vekil (briefcase), Birinci / İkinci Vekil (briefcase with I / II), Gizli Celse (drawn curtain), Yaver (aiguillette cord), İtimat Oyu (raised ballot), frequency badges (1, ∞, calendar leaf) |
| Haki `#556B2F` / `#B9CF8E` | Zafer (laurel wreath), Vatansever (rising sun), Kurtuluş yolu (milestone), güvenilir (handshake) |
| Ankara taşı `#A0624D` / `#EDB9A5` | Kulis (door ajar) |
| Kopya kalemi `#4F3B78` / `#C4B3EA` | Telgraf (Morse key), Emel (Deco steps), Madalya (medal on ribbon), Taraf (coin, two faces), Gizli (padlock) |
| Kara `#2B2522` / `#D9CEC2` | Hezimet (broken sabre), Hain (dagger), Esaret yolu (chain), Buhran (folded newspaper), İtiraz (raised hand), şüpheli (magnifier), Meclis dağılır (toppled chair) |
| Kurşun `#5A6168` / `#D3D8DC` | Entrika (envelope), Meziyet (key), Şahsiyet (Deco profile head) |

Corner gems become **enamel lapel badges**: a round badge with a brass rim. The contrast disc rule stays (black disc on light frames, white on dark).

### Frames (the layout slots stay fixed)

| Kind | Art window | Frame and details |
|---|---|---|
| Şahsiyet | Stepped Deco top (ziggurat) | Brass double rule, chamfered corners; the name band is an engraved building plaque |
| Gazi | Same as Şahsiyet | A red sunburst band round the window, crescent and star at the apex, base panel only |
| Ecnebi | Same as Şahsiyet | A passport guilloche band and a diagonal consular stripe in one corner |
| Yaver | Rectangle with photo-corner mounts | An identity card: perforated stamp edge, a stamp in the corner |
| Entrika | Rectangle with 45° clipped corners, like a press clipping | Thick-thin letterpress rules; a field stripe in lacivert (Meclis) or Ankara taşı (Kulis) |
| Buhran | Full width under a masthead band | An "extra edition" front page: heavy black rule, the field badge in the corner |
| Zafer | Telegram form | Ruled lines, violet stamp, khaki border with laurel sprigs |
| Hezimet | Telegram form | Black mourning border, violet stamp |
| Emel | Drawn: Deco steps under a sunburst | Violet frame with a ribbon tab |
| Taraf | Drawn: rising sun (Vatansever), a cast shadow and dagger (Hain) | Haki or kara frame; no person |

| Back | Design |
|---|---|
| Entrika | Halftone newsprint, ENTRİKA set in lead type |
| Telgraf | A telegram envelope, TELGRAF header in violet |
| Buhran | The seal on red |
| Şahsiyet | Brass sunburst |
| Yaver | Aiguillette cord pattern |
| Emel | Violet banknote guilloche |
| Taraf | A sealed envelope stamped GİZLİDİR |

### Ornament and pattern

- Sunburst rays, as on the 1933 Onuncu Yıl posters.
- Stepped ziggurat corners and parallel speed lines (Art Deco).
- Banknote guilloche rosettes and fine-line lathe patterns, as on the first Republic banknotes (1927).
- Postage-stamp perforations and the Ankara castle vignette of the 1920s stamps.
- Telegraph form ruling and Morse dot-dash borders.
- Letterpress: thick-thin rules, period dingbats, halftone dots, slightly misregistered two-colour red and black.
- Wheat sheaf and laurel from Republic stamps and medals.
- Not used: arches, tiles, rumi, tughra, Ottoman script, and the neo-Ottoman facade of the First Assembly building as ornament (its photograph is fine as a still).

### Seal

The tughra is replaced by a **round rubber-stamp seal**: double ring, crescent and star in the centre, the legend `TÜRKİYE BÜYÜK MİLLET MECLİSİ · ANKARA · 1920` in Latin capitals, with an uneven ink impression. It goes on the Takdir screen and the Buhran back. Drawn new, not copied from today's official TBMM emblem.

### Seat niche

A **stepped Deco portal** with vertical fluting, in place of the arch.

- Vekil seats: lacivert horizontal speed lines behind the figure, in place of the gilt lattice.
- Gazi's seat: red-and-white sunburst rays behind, a brass double rule round the portal, a small crescent and star at the apex, in place of the gilding.
- The Yaver sits at the foot as a small identity card.

### Frieze (home and lobby)

The 11 Şahsiyet cut-outs stand in a row on a podium line, all at the same scale, Gazi in the middle, like an Onuncu Yıl poster or the First Assembly's group photograph. Behind them, a brass sunburst and a thin-line Ankara skyline (castle, Assembly building, railway station). A red band runs along the foot.

### Fonts (Google Fonts)

| Role | Font | Why |
|---|---|---|
| Card names, labels | **Josefin Sans** 600–700, uppercase, wide tracking | 1920s geometric sans |
| Interface | **Jost** 400/500 | Futura-like, the type of 1930s Turkish posters |
| Game voice (flavor, quotes) | **Old Standard TT** italic | The period's newspaper text face |
| Buhran masthead (optional) | **Abril Fatface** | The headline Didone of the dailies |

All four list Latin Extended. Step 3 checks İ ı ş ğ in each.

### Still grade

- Every photograph is black and white, so the grade unifies sources instead of tinting them: a full-strength tritone (shadow `#1E1C19`, mid `#7C6B55`, highlight `#F0E7D3`), a slight contrast lift and a light vignette.
- Entrika and Buhran stills also get a halftone screen at about 12%, so they read as newspaper reproductions.
- Portraits get no halftone.

### Music (synthesised)

| Setting | Value |
|---|---|
| Mode | D Dorian (D E F G A B C), Anatolian folk melody harmonised the Western way, as the Türk Beşleri did. No augmented second, so it stays clear of the Ottoman loop's Hicaz |
| Drone | Open fifth D2 + A2 (73.4 and 110 Hz), sine, very quiet, slow swell |
| Timbre | Melody as a muted piano pluck (triangle, fast attack, ~1.2 s decay); under it a reed-organ pad (sawtooth, low-pass ~800 Hz) |
| Rhythm and tempo | Aksak 7/8 (2+2+3), one bar ≈ 2.8 s; a soft low tom on each group start |
| Mood | Dignified and tense, not martial. No march, and no quotation of the İstiklal Marşı or any anthem |
| Effects (if the skin carries them) | Telegraph key click to play a card; rubber-stamp thud and a typewriter bell for the Takdir; a short rising fourth for Zafer; a muted low cluster for Hezimet |

## 4. Images

To be redone for the 1924–25 cast and cards, with the same rules: Wikimedia Commons first, real photographs only for people, every portrait at least 400 px wide, sources in `art/manifest.json`, no unused files left behind.
