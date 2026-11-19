# Rulings the browser game makes

The manual leaves some cases open. On a phone each one needs an answer, so the engine picks one. Each ruling below is what the game does now. Manual v0.8 carries the ones players need; overrule any of them there.

## Changed after the first playtest (2026-11-15)

These differ from manual v0.7 on Jingle's call; manual v0.8 has them.

- **No per-crisis Intrigue limit.** Still one card per wave (two with Çifte Oyun), but as many waves as you like. Çifte Oyun no longer mentions the 2-card limit.
- **No Loyalist duty in Kader.** Either Vekil may discard or play any card, whatever their side. İskender Çelebi is now just "draw 4, discard 2".
- **Devam.** A flipped Crisis, each flipped wave and the Kader result stay on every phone until every player, Süleyman too, presses Devam. This replaces Süleyman's "go to the Decree" button.

## Balance pass (2026-11-16)

Jingle took every proposal in the balance review (https://claude.ai/artifact/4gwXX8AKQ2omRzGgA4Bcim). Manual v0.8 has the new cards.

- **Kader deck:** 7 Hizmet, 11 Hıyanet.
- **Intrigue cards:**
  - Azil replaces Divan Sırası.
  - Kefalet replaces Gözde'nin Hediyesi.
  - Casus (2 copies) replaces Saray Dedikodusu.
  - Saray Tabibi is renamed Çeşnigir.
  - Mühür loses its Divan Sırası clause.
  - Mühürlü Evrak drops to 2 copies.
  - The deck is now 29 cards: 15 Divan, 14 Harem.
- **Kul:**
  - Daye Hatun's Valide can't seat its own player.
  - Ayas Paşa now plays Azil, Şeker Ağa plays Çeşnigir, Gülfem Hatun plays Kefalet and Sümbül Ağa plays Casus.
  - Firuze Hatun adds 1 to every Decree gain.
  - Lokman Ağa, once a crisis, learns who played one card on you.
- **Characters:**
  - Divan Nüfuzu pays on Hizmet only.
  - Himaye is a shield before Tertip.
  - Sezgi replaces Haber.
  - Veliaht takes a seat after Tertip.
  - Ocak Sevgisi hands the Objection fee to Mustafa.
  - Cephe picks the crisis's field.
- **Art:** Azil, Kefalet, Casus and Çeşnigir still use the old cards' art until the redo.

## Kul and Hırs pass (2026-11-18)

Jingle took P1–P12 of the Hırs and Kul review (https://claude.ai/artifact/UN4Bfz4nMi8i1hyLckntu2) and swapped two Kul. The manual doesn't have these yet.

- **Every Kul recasts a card,** once per crisis. The four special powers became cards: İskender Çelebi plays Defterdar, Firuze Hatun plays Nazar, Lokman Ağa plays Nöbet and Gül Ağa plays Sükût. The hand limit is 3 for everyone.
- **Renames:** Casus is now Mantık, played by Matrakçı Nasuh. Akıl Hocası is now Oyunbozan, played by Sümbül Ağa, who picks its field. The card ids stay `casus` and `akil-hocasi`.
- **New cards,** 2 copies each: Defterdar and Nöbet (Divan), Nazar and Sükût (Harem). The deck is now 37 cards: 19 Divan, 18 Harem.
- **Hırs:**
  - new goals for Padişahın Takdiri, Gözden Düşmek, Ortak Kader, Divanda Nüfuz, Yükselen Yıldız, Saray Hazinesi and Kulisçi;
  - Kulak Misafiri adds Nöbet.
- **Saved games** from before this change go back to the lobby, because the game state's shape changed.

## Targets and placement

- **Süleyman** can't be the target of an Intrigue card. None of them would do anything to him.
- **Cards that need a Minister** (Mühür, Valide'nin Buyruğu, Azil, Kefalet, Teftiş, Nazar) can be aimed only at a current Minister, and Defterdar only at the Birinci Vekil. Ministers change only at a flip, so this matches the "checks at the flip" rule.
- **Mantık and Sükût** can't be played on yourself.
- **Mühürlü Evrak** has no target (since 2026-11-19): it flips as the card alone, so the wave doesn't name its owner. No Oyunbozan reaches it and Yön Değiştir can't move it.
- **Off-field cards.** A card outside the open field can't be placed unless it is recast into the field, or played under Plus Ultra. The manual says such a card "does nothing", so the phone stops you wasting it.
- **Pass or play.** A player with no legal play in a wave passes automatically. A player who owes a hand-limit discard must discard before playing.

## Waves

- **Valide'nin Buyruğu and Azil on one Vekil** are both replacements: the first owner clockwise applies, and the other goes to waste. Mühür in the same wave stops both, and Himaye stops both all crisis.
- **Azil** is always Süleyman's pick, even when Pargalı appoints with Sadrazam. The card says "Süleyman".
- **Kefalet** resolves at the Kader result, before the game-end check, for every Kefalet whose Vekil still sits there. On Hizmet its owner gains 1. On Hıyanet its owner loses 1 and draws, unless Çeşnigir or Himaye is on them. Several Kefalets each resolve. The gain or loss is public, so it shows who played the card.
- **Mantık** shows, when Tertip ends, every card its target played this crisis: the card as played (a Kul recast shows as the recast), its target, in every wave, whatever its outcome.
- **Nöbet**:
  - When Tertip ends, its owner picks one card that other players put on the watched player this crisis, and secretly learns who played it.
  - Any wave and any outcome counts. A recast shows as played, and a card moved by Yön Değiştir counts for its final target.
  - The owner's own cards and the watched player's own cards aren't offered. With none left, the owner is told nobody else played on them.
- **Defterdar** acts at Kader if the player it was put on still holds the Birinci Vekil seat: they draw 4 Kader cards and discard 2. Several Defterdar on one Vekil still mean 4. Teftiş and Gözcü on the Birinci Vekil see both discards.
- **Nazar**:
  - The Hüküm on that Vekil gives or takes 2. Several Nazar on one Vekil still mean 2.
  - A −2 draws as many cards as were actually lost. Çeşnigir and Himaye stop the whole loss.
  - Faiz still pays Gritti 1.
- **Sükût**: the silenced player is passed in the next wave without a sign to the table; their own phone says why. If nobody else plays in that wave, Tertip ends.
- **Yön Değiştir** may move any card played on Rüstem, including his own.

## Appointment

- **Sadrazam:** Pargalı also picks the replacement after an Objection that crisis, because Sadrazam means he appoints instead of Süleyman.
- A Minister removed by an Objection may be appointed again in the same crisis. The eligibility rule doesn't forbid it.
- **No Objection to your own seat.** A Vekil may object to the other Vekil. Objecting to yourself would only buy a card for 1 Influence.
- **Divan Nüfuzu** pays at the Kader result, on Hizmet, if Pargalı is one of the two Vekils then.
- **Ocak Sevgisi:** a paid Objection against Mustafa costs 1 as usual, and the 1 goes to him. Şah Sultan's free İtiraz pays nothing, so nothing goes to him.

## Powers

- **Free powers.** A power with no stated timing can be used during the Kriz, Atama, İtiraz, Sonuç and Hüküm steps. It can't be used during setup.
- **Timed powers ask their owner when they apply.** These are:
  - Cephe, after the Crisis flips and before the table sees it;
  - Kulis and Sadrazam, before the appointment;
  - Feragat, before Objections;
  - Himaye, before the first wave;
  - Veliaht, when Tertip ends, before the Ferman;
  - Nöbet's pick, when Tertip ends;
  - Gözcü, after Kader;
  - Fısıltı, in the Decree.

  Each one asks only when it could change something. For example, Veliaht asks only if Mustafa could take a seat: he isn't a Vekil and isn't exiled.
- **Cephe** sets the field for placing Intrigue cards. The Crisis's draw rule stays as printed.
- **Himaye** may shield Hatice herself. Ferman, Objections and Veliaht still move the shielded player.
- **Veliaht** ignores Mühür and Himaye. The Vekil he replaces draws 1, and the Ferman can still move him.
- **Sezgi** picks two players other than Süleyman and Hatice.
- **Fısıltı** applies to both kinds of Decree: Hürrem picks who gets the +1 or who loses 1.
- **Peeking at the Kader deck.** Mühürlü Evrak, Hazine Defteri and Venedik Postası all shuffle the Kader discards in first if fewer than 3 cards are left, as Venedik Postası's text says.
- **Soruşturma** is used at once: Süleyman names the investigator in the Result step.

## Hırs cards

- **Kulisçi** counts 3 other players over the whole game.
- **Hedef Tahtası** counts every card other players placed on you, whether or not it took effect. Your own cards don't count; otherwise Mühürlü Evrak plus one more card on yourself completes it alone.
- **Saray Hazinesi** counts every card you put down in one crisis, whatever its outcome. Recasts count, and so do both Çifte Oyun cards.
- **Kulak Misafiri** counts only if the information card took effect: Mantık, Mühürlü Evrak, Teftiş or Nöbet.
- **Koltuk Kapmak** counts a seat won by Valide'nin Buyruğu or Azil.
- **Divanda Nüfuz** counts when your Valide'nin Buyruğu or Azil, recasts included, actually replaces a Vekil.
- **Ortak Kader** counts when your Mühür or Kefalet, recasts included, takes effect on a Vekil at the flip, whatever the Kader result.
- **Padişahın Takdiri** and **Şüphe Altında** count both Vekils at Kader.
- **Yükselen Yıldız** counts crises in which you were a Vekil at Kader.
- **Gözden Düşmek** counts any real loss: the Hüküm, İftira or Kefalet. Paying for an İtiraz is spending, not losing, so it doesn't count. You can't lose at 0, and a loss saved by Himaye or Çeşnigir doesn't count.

## Setup

- **Opening reveal.** Every hidden player sees their Taraf at the start. Traitors also see each other, replacing the eyes-closed step. Everyone gets the same pop-up, so no phone looks different.
- **Roster changes (2026-11-15).** Mihrimah, Afife Hatun and Esma Hatun are out. Gül Ağa takes Afife's power (hand limit 4 while face up) and Lokman Ağa takes Esma's (a played card that takes effect returns to hand, once per game), so there are 14 Kul again and every player picks one of two at 8 players. Since 2026-11-18 both recast cards instead (Sükût and Nöbet).
- **Timers.** With timers on (the default; off in learning games and test rooms, and the host can switch them off), a power window, an Objection turn, Yön Değiştir and the Ferman time out as "not used", and a Tertip wave times out as a pass. Times are in `rules.json` (`powerWindows`, `timers`). Appointments, replacements, the Decree, Kader, discards and Devam are never timed: the talk is the game.
- **Who sees a window.** Every power use is public: the card's stamp, a banner on every phone and a log line. What a power shows you stays private. Deliberation is hidden where it can be: Gözcü's secret look is decided inside a pause everyone sits through, so the table can't tell it from a Devam not yet pressed. Nöbet's pick shows no name either; the table already saw the Nöbet card flip, so the wait tells it nothing new. Public windows show whose window is open and its countdown. A window is only offered when it could change something, and that check may read only public state.
- **Tertip waves show nothing per seat.** A player with no playable card is passed at once, so per-seat "ready" marks would show who has no card. Everyone's plays are revealed together when the wave flips. Each card then gets its own public log line (card, target, outcome), never its owner.
- **A Kul recast is anonymous** (2026-11-19). The wave shows the card as played, with no word of the Kul, and the Kul's *kullanıldı* stamp shows only on its owner's phone. Every Kul recasts, so making recasts public would name the owner of up to one card per player per crisis. **Çifte Oyun** follows suit: its banner and stamp wait for Tertip's end and don't say which wave. **Plus Ultra** shows nothing either, since naming it would name Şarlken.
- **A Valide'nin Buyruğu's owner picks unseen.** While they choose the new Vekil, the table reads "yeni Vekil seçiliyor" and no seat is marked. Azil is Süleyman's pick and shows as usual.
- **Hand sizes are secret.** A visible count drops when a wave flips, so it shows who played and, when only one player did, which card was theirs. Only your own count shows. The log and the waiting line don't name who is discarding to the hand limit or keeping one card for Yakıp Yıkma.
- **Mahidevran is replaced by Şah Sultan** (Süleyman's other sister), with the same İtiraz and Sürgün powers. Allegiance is dealt independently of Character, and a mother on the other side from her son Mustafa read as absurd.

## What each phone shows (2026-11-19)

The audit at https://claude.ai/artifact/H5orxdR2AtHFBTRypuQmm2 checked every card and power against the rules above and added four, so a new card has a fixed answer for each layer:

- **R6, anything waiting on a seat shows under it.** One chip per kind of effect until it has worked: a lock on a protection (Mühür, Oyunbozan, Çeşnigir, Himaye), a bar on a restriction (Sükût, Sürgün), the eye on a secret look still to come (Mantık, Nöbet, Teftiş), the Kader icon on what works at Kader (Defterdar, Kefalet), the Hüküm icon on Nazar, the power icon on Faiz. A seat shows three chips at most, then a count; the seat sheet names them all, since phones have no hover.
- **R7, every public number that moves, shows.** A Nüfuz change floats off the seat, and its log line gives the amount and the reason. A paid İtiraz shows its −1 too, though it still isn't a loss for Gözden Düşmek.
- **R8, a modifier is named on the screen it changes.** Nazar on the Hüküm screen and the result screen, Defterdar on the Kader screen.
- **R9, every secret look has one shape.** The cards or faces first, then one sentence that starts with the source's name. Ganimet's victim gets one too.
- **Waiting lines.** Every timed decision a player is known to be weighing reads "X, Y gücünü düşünüyor", the Ferman and Yön Değiştir included.

