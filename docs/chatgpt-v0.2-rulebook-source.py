bash -lc cat > /mnt/data/sarayda_assets/build_rulebook_v02.py <<'PY'
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT,TA_CENTER
from reportlab.lib.colors import HexColor
from math import pi, cos, sin
import os, re, html, collections

OUT='/mnt/data/Sarayda_Hain_Var_Prototype_Rulebook_v0.2.pdf'
W,H=A4
L,R=43,43
U=W-L-R
BG=HexColor('#F7F2E8')
PAPER=HexColor('#FFFDF8')
INK=HexColor('#122A26')
DARK=HexColor('#0D2924')
DARK2=HexColor('#174339')
GOLD=HexColor('#B58B4C')
GOLD_LT=HexColor('#EAD6AF')
MUTED=HexColor('#59635B')
RED=HexColor('#8E3E43')
GREEN=HexColor('#2F7460')
BLUE=HexColor('#3F647A')
STROKE=HexColor('#DCCBAA')
PALE_GREEN=HexColor('#E7F1E7')
PALE_RED=HexColor('#F4E6E3')

pdfmetrics.registerFont(TTFont('DVS','/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('DVS-B','/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'))
pdfmetrics.registerFont(TTFont('DVSerif','/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf'))
pdfmetrics.registerFont(TTFont('DVSerif-B','/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf'))
pdfmetrics.registerFontFamily('DVS',normal='DVS',bold='DVS-B',italic='DVS',boldItalic='DVS-B')

c=canvas.Canvas(OUT,pagesize=A4,pageCompression=1)
c.setTitle('Sarayda Hain Var! — Prototype Rulebook v0.2')
c.setAuthor('Unofficial fan-game prototype — playtest rules')
c.setSubject('Muhteşem Yüzyıl themed social-deduction game: complete v0.2 rules')
PAGECOUNT=17
issues=[]

def line(x1,yt,x2,yt2,color=STROKE,th=0.8):
    c.setStrokeColor(color); c.setLineWidth(th); c.line(x1,H-yt,x2,H-yt2)

def rect(x,y,w,h,fill=PAPER,stroke=STROKE,r=10,linewidth=0.8):
    c.setFillColor(fill)
    c.setStrokeColor(stroke if stroke is not None else fill)
    c.setLineWidth(linewidth)
    c.roundRect(x,H-y-h,w,h,r,stroke=stroke is not None,fill=1)

def label(txt,x,y,size=8,color=MUTED,font='DVS',align='left'):
    c.setFillColor(color); c.setFont(font,size)
    if align=='right': c.drawRightString(x,H-y,txt)
    elif align=='center': c.drawCentredString(x,H-y,txt)
    else: c.drawString(x,H-y,txt)

def ptxt(text,x,top,w,size=9,leading=None,color=INK,font='DVS',spaceAfter=0,align=TA_LEFT,maxh=None,id=None):
    lead=leading or size*1.47
    sty=ParagraphStyle('txt',fontName=font,fontSize=size,leading=lead,textColor=color,alignment=align,spaceAfter=spaceAfter,allowWidows=0,allowOrphans=0)
    par=Paragraph(text,sty)
    _,hh=par.wrap(w,900)
    if maxh is not None and hh>maxh+0.5:
        issues.append((id or text[:32],round(hh,1),maxh))
    par.drawOn(c,x,H-top-hh)
    return hh

def page(title,kicker,subtitle,num):
    c.setFillColor(BG); c.rect(0,0,W,H,stroke=0,fill=1)
    c.setFillColor(DARK); c.rect(0,H-31,W,31,stroke=0,fill=1)
    label('SARAYDA HAIN VAR!  /  PLAYTEST EDITION',L,20,8.0,HexColor('#F2E7D3'))
    label(kicker.upper(),W-R,20,7.6,HexColor('#F2E7D3'),align='right')
    line(L,49,W-R,49,GOLD,0.85)
    label(title,L,91,29,INK,'DVSerif-B')
    ptxt(subtitle,L,102,U,size=9.05,leading=13.6,color=MUTED,maxh=42,id='subtitle '+title)
    line(L,807,W-R,807,GOLD_LT,0.8)
    label('UNOFFICIAL FAN CONCEPT  ·  V0.2  ·  NOV 2026',L,826,7.35,MUTED)
    label(f'{num:02d} / {PAGECOUNT:02d}',W-R,826,7.6,INK,align='right')

def newpage(): c.showPage()

def small_head(txt,x,y,color=DARK):
    label(txt.upper(),x,y,9,color,'DVS-B')

def strip(x,y,w,h,head,body,fill=DARK):
    rect(x,y,w,h,fill=fill,stroke=None,r=10)
    label(head.upper(),x+14,y+21,9.2,GOLD_LT,'DVS-B')
    ptxt(body,x+14,y+29,w-28,9.0,13.6,HexColor('#FAF9F4'),maxh=h-32,id='strip '+head)

def card(x,y,w,h,name,tag,body,foot='',accent=GREEN,symbol='S',num=None,body_size=8.45):
    rect(x,y,w,h,PAPER,STROKE,13)
    rect(x+10,y+10,36,h-20,accent,None,8)
    c.setFillColor(HexColor('#FFFBF2'))
    c.setFont('DVSerif-B',19)
    c.drawCentredString(x+28,H-y-35,symbol)
    if num is not None:
        label(str(num),x+28,y+h-20,7.3,HexColor('#FFF3D9'),align='center')
    tx=x+59
    tw=w-71
    nsize=12 if len(name)<23 else 10.4
    ptxt(name,tx,y+18,tw,size=nsize,leading=nsize*1.18,font='DVSerif-B',maxh=30,id='name '+name)
    label(tag.upper(),tx,y+58,7.5,accent,'DVS-B')
    ptxt(body,tx,y+70,tw,size=body_size,leading=body_size*1.48,maxh=h-106,id='body '+name)
    line(tx,y+h-33,x+w-13,y+h-33,STROKE,0.5)
    label(foot.upper(),tx,y+h-18,7.0,MUTED)

def major_card(x,y,w,h,name,base_title,base_text,favor_title,favor_text,letter,accent=GREEN):
    rect(x,y,w,h,PAPER,STROKE,14)
    rect(x+12,y+12,43,h-24,accent,None,9)
    label(letter,x+33,y+53,23,HexColor('#FFFAF1'),'DVSerif-B',align='center')
    tx=x+69; tw=w-84
    ptxt(name,tx,y+20,tw,size=15,leading=16,font='DVSerif-B',maxh=32,id='major name'+name)
    label('BASE POWER  ·  ONCE / GAME',tx,y+68,7.0,accent,'DVS-B')
    ptxt('<font name="DVS-B">'+base_title+'</font> — '+base_text,tx,y+76,tw,size=8.65,leading=12.7,maxh=66,id='major base '+name)
    line(tx,y+145,x+w-15,y+145,STROKE,0.65)
    label('FAVOR POWER  ·  UNLOCKABLE',tx,y+163,7.0,GOLD,'DVS-B')
    ptxt('<font name="DVS-B">'+favor_title+'</font> — '+favor_text,tx,y+173,tw,size=8.55,leading=12.55,maxh=h-191,id='major fav '+name)
    label('PUBLIC ROLE',x+16,y+h-21,6.7,HexColor('#F7E9CF'))

def companion_card(x,y,w,h,data,idx):
    name,tag,body,kind=data
    accent={'RECAST':GREEN,'PASSIVE':BLUE,'TACTICAL':RED,'PROGRESS':GOLD}.get(kind,GREEN)
    rect(x,y,w,h,PAPER,STROKE,10)
    rect(x+9,y+9,30,h-18,accent,None,7)
    label(str(idx).zfill(2),x+24,y+30,10,HexColor('#FFF8E9'),'DVS-B',align='center')
    tx=x+48; tw=w-60
    ptxt(name,tx,y+14,tw,size=12,leading=13.2,font='DVSerif-B',maxh=27,id='compname '+name)
    label(tag.upper(),tx,y+46,7.2,accent,'DVS-B')
    ptxt(body,tx,y+55,tw,size=8.4,leading=12.2,maxh=h-69,id='companion '+name)
    label(kind,x+w-12,y+h-13,6.35,MUTED,align='right')

def ambition_card(x,y,w,h,name,body,idx):
    rect(x,y,w,h,PAPER,STROKE,9)
    rect(x+9,y+9,28,h-18,GOLD,None,7)
    label(f'{idx:02}',x+23,y+30,9,HexColor('#FFF8E9'),'DVS-B',align='center')
    xx=x+46
    ptxt(name,xx,y+12,w-56,size=11.4,leading=12.3,font='DVSerif-B',maxh=20,id='amb '+name)
    ptxt(body,xx,y+36,w-57,size=8.0,leading=11.4,maxh=h-43,id='ambdesc '+name)

def draw_coin(x,y,r=22,txt='1'):
    c.setFillColor(GOLD_LT);c.setStrokeColor(GOLD);c.setLineWidth(1.7);c.circle(x,H-y,r,stroke=1,fill=1)
    c.setFillColor(DARK);c.setFont('DVSerif-B',17);c.drawCentredString(x,H-y-5.4,txt)

# DATA
mains=[
 ('Sultan Süleyman','FERMAN','Before a vote, replace one Minister with another eligible non-Süleyman player.','İKİNCİ LÜTUF','After one Imperial Decree, give +1 Influence to any player (including yourself).','S',GOLD),
 ('Hürrem Sultan','İKNA','Before a vote, swap one nominated Minister with an eligible non-Süleyman player.','ÇİFTE OYUN','Play a second Intrigue card in a single crisis. You still may Petition only once.','H',RED),
 ('Pargalı İbrahim','SADRAZAM','When a team you proposed is rejected, you may lead the next proposal instead of passing leadership. The rejection still counts.','DİVAN NÜFUZU','After serving as a Minister on an approved mission, gain +1 Influence, regardless of outcome.','P',GREEN),
 ('Mahidevran Sultan','İTİRAZ','After a proposal is approved, call one immediate second vote on the same team. The second result replaces the first.','İTİBAR','Prevent one loss of 1 Influence that would affect you.','M',RED),
 ('Bali Bey','MUHAFIZ','After mission cards are revealed but before scoring, disregard one Sabotage card.','GÖZCÜ','Before a vote, privately inspect one player’s full Intrigue hand.','B',GREEN),
 ('Hatice Sultan','HİMAYE','As a reaction, cancel an Intrigue card that targets a player. This does not cancel character powers.','AİLE HİMAYESİ','During an Imperial Decree after failure, prevent one Minister from losing Influence.','H',BLUE),
 ('Mihrimah Sultan','ELÇİLİK','During a Court window, discard one card, draw two, and keep one. This does not use your Intrigue play.','AF','After a rejected proposal, remove one refusal marker. Cannot undo the third refusal after the crisis has ended.','M',GOLD),
 ('Rüstem Paşa','KULİS','Before a vote, require one player to announce and commit to an Approve or Reject ballot.','YÖN DEĞİŞTİR','As a reaction, redirect an Intrigue that targets you to another legal target.','R',GREEN),
]
# correct ability name
mains[6]=('Mihrimah Sultan','ELÇİLİK','During a Court window, discard one card, draw two, and keep one. This does not use your Intrigue play.','AF','After a rejected proposal, remove one refusal marker. Cannot undo the third refusal after the crisis has ended.','M',GOLD)

companions=[
 ('Sümbül Ağa','SARAYIN KULAKLARI','Once per crisis, play any Intrigue card as Saray Dedikodusu instead. The original card is discarded.','RECAST'),
 ('Matrakçı Nasuh','TEDBİR','Once per game, play any Intrigue card as Akıl Hocası as a reaction.','RECAST'),
 ('Nigar Kalfa','GİZLİ POSTA','Once per game, play any Intrigue card as Gizli Mektup.','RECAST'),
 ('Gül Ağa','SAHTE MÜHÜR','Once per game, play any Intrigue card as Valide’nin Buyruğu.','RECAST'),
 ('Ayas Paşa','DİVAN KULİSİ','Once per game, play any Intrigue card as Kulis.','RECAST'),
 ('Şeker Ağa','İKRAM','Once per game, your Petition gives +2 Influence instead of +1. It still discards a card.','PROGRESS'),
 ('Gülfem Hatun','SÜKÛNET','Ignore the first 1 Influence you would lose from any source (mandatory).','PASSIVE'),
 ('Daye Hatun','YENİDEN DENEME','Once per game, when your Intrigue is countered, return it to your hand after cancellation. Your play is still spent.','TACTICAL'),
 ('Afife Hatun','DÜZEN','Once per crisis at the start of the Court window, if your hand is empty, draw 1 Intrigue.','PASSIVE'),
 ('Esma Hatun','SADIK HABERCİ','Once per game, after your Intrigue card resolves, draw 1 card, then discard down to 3.','TACTICAL'),
 ('Firuze Hatun','GÖZDE','Once per game, play any Intrigue card as Hazine Lütfu to gain +1 Influence.','RECAST'),
 ('Gülşah Hatun','İFTİRA','Once per game, play any Intrigue card as İftira.','RECAST'),
 ('Mercan Ağa','MUHALİF KULAK','Once per game, after your Reject ballot is revealed, draw 1 Intrigue.','PASSIVE'),
 ('Lokman Ağa','SARAY NÖBETİ','Once per game, play any Intrigue card as Saray Muhafızı as a reaction.','RECAST'),
 ('Ebussuud Efendi','USUL BİLGİSİ','You may reveal a completed Ambition at 2 Influence instead of 3.','PROGRESS'),
 ('Piri Mehmet Paşa','KİŞİSEL TALEP','Once per game, make a Petition without discarding a card. It still uses your Court action.','PROGRESS'),
]

intrigue=[
 ('Saray Dedikodusu','COURT','Privately inspect up to 2 random Intrigue cards in another player’s hand, then return them. Never inspect Allegiance or Ambition.','3 COPIES','D',GREEN),
 ('Akıl Hocası','REACTION','Cancel one just-played Intrigue card. Both cards are discarded. Can counter another Akıl Hocası.','3 COPIES','A',BLUE),
 ('Gizli Mektup','COURT','Exchange 1 random Intrigue card from a chosen player’s hand with 1 card from your own hand. Both must hold a card.','3 COPIES','M',GREEN),
 ('Valide’nin Buyruğu','COURT','Replace one nominee with an eligible unselected player in the same seat (Minister or Adviser).','3 COPIES','V',RED),
 ('Kulis','COURT','Choose a player: they must announce Approve or Reject, then cast that ballot. Commitment ends if the team changes.','3 COPIES','K',RED),
 ('Hazine Lütfu','COURT','Gain +1 Influence from the treasury, up to the maximum of 5.','3 COPIES','L',GOLD),
 ('İftira','COURT','Choose one player to lose 1 Influence. Influence cannot fall below 0.','2 COPIES','İ',RED),
 ('Gözde’nin Hediyesi','COURT','Give another player +1 Influence, then draw 1 Intrigue card. Respect the hand limit.','2 COPIES','H',GOLD),
 ('Mühürlü Evrak','COURT','Look at the top 3 Intrigue cards. Keep 1; put the others on the bottom of the deck in any order.','2 COPIES','E',BLUE),
 ('Sahte Ferman','COURT','Protect one nominee’s seat from being changed by Intrigue cards until the next vote. Character powers still work.','2 COPIES','F',GOLD),
 ('Saray Muhafızı','REACTION','Cancel an Intrigue card effect that would raise or lower anyone’s Influence. Does not cancel Imperial Decree.','2 COPIES','S',BLUE),
 ('Saray Tabibi','DECREE','After Süleyman names a Minister to lose Influence, prevent that loss of 1. Does not change the crisis result.','2 COPIES','T',BLUE),
]

ambitions=[
 ('Divanda Nüfuz','Serve as a Minister on 2 approved missions.'),
 ('Padişahın Takdiri','Receive +1 Influence from an Imperial Decree.'),
 ('İki Cepheli Siyaset','Cast Approve and Reject on different proposals.'),
 ('Söz Sahibi','Lead a team proposal that is approved.'),
 ('Fısıltı Ağı','Play Intrigue cards in 2 different crises.'),
 ('Saray Hazinesi','Finish a crisis with exactly 3 Intrigue cards in hand.'),
 ('Dilekçe Ustası','Gain Influence by Petition in 2 different crises.'),
 ('Muhalif Ses','Reject a proposal that nevertheless gets approved.'),
 ('Sarayın Adamı','Serve on any successful mission.'),
 ('Şüphe Altında','Serve as a Minister on a failed mission.'),
 ('Kulisçinin İzi','Play 2 differently named Intrigue cards.'),
 ('Değişen Ortaklar','Serve as a Minister with 2 different co-Ministers on approved missions.'),
]

crises=['Yeniçeri İsyanı','Hazine Açığı','Venedik Elçiliği','Haremde Skandal','Macar Seferi','Kaybolan Mühür','Divan Kavgası','Şehzade Meselesi','İstanbul’da Dedikodu','Sınırda İsyan']

# 01 COVER
c.setFillColor(DARK);c.rect(0,0,W,H,fill=1,stroke=0)
# ornamental cover border
c.setStrokeColor(GOLD); c.setLineWidth(1.1)
c.roundRect(40,47,W-80,H-96,13,stroke=1,fill=0)
c.setStrokeColor(HexColor('#3F5B4F'));c.setLineWidth(0.5)
c.roundRect(48,55,W-96,H-112,10,stroke=1,fill=0)
# courtyard arches
for idx in range(5):
    xx=96+idx*101
    c.setFillColor(HexColor('#163C33'))
    c.roundRect(xx,H-625,53,195,25,stroke=0,fill=1)
    c.setFillColor(DARK); c.roundRect(xx+9,H-626,36,168,19,stroke=0,fill=1)
# stylized crescent/star
cx,cy=W/2,H-200
c.setFillColor(GOLD)
c.circle(cx,H-170,43,fill=1,stroke=0)
c.setFillColor(DARK);c.circle(cx+16,H-154,40,fill=1,stroke=0)
# star in central crest
px=cx-58;py=H-166; c.setStrokeColor(GOLD); c.setLineWidth(1.5)
for k in range(5):
    a=-pi/2+2*pi*k/5
    b=-pi/2+2*pi*((k+2)%5)/5
    c.line(px+18*cos(a),py+18*sin(a),px+18*cos(b),py+18*sin(b))
label('THE COURT OF SECRETS',W/2,292,11.5,GOLD_LT,'DVS-B',align='center')
label('MUHTEŞEM YÜZYIL',W/2,346,28,HexColor('#F3E7D0'),'DVSerif-B',align='center')
label('SARAYDA',W/2,425,53,HexColor('#FFF9EB'),'DVSerif-B',align='center')
label('HAİN VAR!',W/2,489,54,HexColor('#FFF9EB'),'DVSerif-B',align='center')
line(133,518,W-133,518,GOLD,1)
label('A GAME OF LOYALTY, INTRIGUE & IMPERIAL FAVOR',W/2,542,9.2,GOLD_LT,'DVS-B',align='center')
label('4–6 PLAYERS  ·  25–45 MINUTES  ·  AGE 12+',W/2,688,10,HexColor('#F7EDD9'),align='center')
label('PROTOTYPE RULEBOOK',W/2,741,15.2,GOLD_LT,'DVSerif-B',align='center')
label('V0.2  ·  NOVEMBER 2026  ·  UNOFFICIAL FAN DESIGN',W/2,765,8.1,HexColor('#D1C4A7'),align='center')
newpage()

# 02 OVERVIEW
page('Welcome to the Divan','the game in one glance','The Sultan rules in public. Loyalty, ambition and sabotage unfold behind closed doors.',2)
strip(L,153,U,93,'The core question','Whom can Süleyman trust? The court repeatedly appoints Ministers to face a crisis. Players argue, scheme and vote. Hidden conspirators may sabotage the mission. First faction to 3 crisis victories wins.')
small_head('What each player controls',L,283)
# 4 visual layers
labels=[('01','MAIN CHARACTER','Public identity + base power + locked Favor power'),('02','COMPANION','Public permanent helper; a second, tactical class'),('03','ALLEGIANCE','Secret Loyalist or Conspirator; determines the winner'),('04','INTRIGUE & AMBITION','Private cards; tactical actions and personal progression')]
for i,(n,name,desc) in enumerate(labels):
    x=L+(i%2)*259; y=298+(i//2)*108
    rect(x,y,250,94,PAPER,STROKE,10)
    label(n,x+14,y+30,23,GOLD,'DVSerif-B')
    label(name,x+52,y+28,8.9,INK,'DVS-B')
    ptxt(desc,x+52,y+36,183,8.2,12,MUTED,maxh=45,id='layers')
small_head('Prototype contents',L,531)
contents=[('8','Main characters'),('16','Companions (2× main roster)'),('8','Allegiance cards (5 Loyal / 3 Conspirator)'),('30','Intrigue cards (12 unique effects)'),('12','Common Ambition cards'),('10','Palace Crisis prompts'),('12','Support / Sabotage cards (6 pairs)'),('12','Approve / Reject voting cards (6 pairs)'),('1','Board + vote, refusal & Influence tokens')]
for i,(n,desc) in enumerate(contents):
    xx=L+(i%2)*258; yy=549+(i//2)*42
    label(n,xx,yy+13,13,GOLD,'DVSerif-B'); ptxt(desc,xx+31,yy+2,217,8.15,12.1,maxh=30,id='component')
newpage()

# 03 SETUP
page('Prepare the Palace','game setup','Only the Sultan’s allegiance is public. Companions are drafted independently from characters.',3)
setup=[
('1','Seat the court','Randomly assign Sultan Süleyman to one player. Give every other player a different Main Character from the remaining seven. Leave unused characters in the box.'),
('2','Assign hidden allegiances','Süleyman is always Loyalist. Shuffle the exact number of non-Süleyman Loyalist and Conspirator cards shown in the table and deal one face down to everyone else.'),
('3','Let conspirators recognize each other','At 5–6 players, everyone closes their eyes; the conspirators open theirs, recognize each other, then close them again. At 4 players there is only one conspirator.'),
('4','Draft companions','Shuffle all 16 Companion cards. Deal 2 face down to every player. Each keeps 1 face up beside their Main Character. Put unchosen Companions away.'),
('5','Deal starting resources','Everyone begins at 1 Influence, takes a reusable Approve / Reject pair and Support / Sabotage pair, and draws 2 Intrigue cards. Maximum hand is 3.'),
('6','Select an Ambition','Shuffle the common Ambition deck. Each player privately draws 2, keeps 1 and returns the other to the box. An Ambition can be claimed only once.'),
('7','Set the scene','Shuffle the 10 Crisis prompts. Set scores and refusals to zero. Give the Council Leader marker to Süleyman. Start Crisis 1.'),
]
for i,(n,title,desc) in enumerate(setup):
    y=156+i*81
    rect(L,y,35,35,fill=DARK,stroke=None,r=8)
    label(n,L+17,y+25,14,GOLD_LT,'DVSerif-B',align='center')
    label(title,L+49,y+15,10.2,INK,'DVS-B')
    ptxt(desc,L+49,y+22,U-55,8.25,11.9,maxh=48,id='setup '+title)
rect(L,730,U,63,PAPER,STROKE,9)
small_head('Allegiance composition',L+13,747)
label('4 PLAYERS',L+15,766,8.1,INK,'DVS-B')
label('Sultan + 2 Loyal + 1 Conspirator',L+90,766,8.15,MUTED)
label('5 PLAYERS',L+15,781,8.1,INK,'DVS-B')
label('Sultan + 2 Loyal + 2 Conspirators',L+90,781,8.15,MUTED)
label('6 PLAYERS',L+285,766,8.1,INK,'DVS-B')
label('Sultan + 3 Loyal + 2 Conspirators',L+352,766,7.1,MUTED)
newpage()

# 04 CORE CRISIS
page('Each Crisis, Seven Steps','round structure','The Council Leader proposes a mission; Süleyman remains the final arbiter of Influence.',4)
steps=[
('01','REVEAL','Reveal the next Crisis prompt. Every player draws 1 Intrigue, discarding down to 3.'),
('02','NOMINATE','Leader chooses exactly 2 non-Süleyman Ministers and any additional Advisers required by the crisis table. All nominated players must be different.'),
('03','COURT WINDOW','Players discuss and may play Intrigue, use public powers or make a Petition. Reactions interrupt immediately. Each player gets 1 Court action per crisis.'),
('04','VOTE','Everyone simultaneously reveals Approve or Reject. More than half of all players must Approve. Otherwise add 1 refusal, pass Leader clockwise and repeat Step 2 without redrawing.'),
('05','SECRET MISSION','If approved, every nominated Minister and Adviser secretly submits Support or Sabotage. Loyalists must Support; conspirators may choose either.'),
('06','REVEAL & SCORE','Shuffle mission submissions and reveal. One unblocked Sabotage makes the crisis fail; otherwise it succeeds. Mark 1 point for the corresponding faction.'),
('07','IMPERIAL DECREE','Süleyman chooses exactly 1 of the two Ministers: success gives +1 Influence; failure takes −1. Process any allowed reactions, then check Ambition claims.'),
]
for i,(n,title,body) in enumerate(steps):
    y=155+i*69
    rect(L,y,43,46,DARK2,None,9);label(n,L+21,y+30,16,GOLD_LT,'DVSerif-B',align='center')
    label(title,L+56,y+17,8.9,INK,'DVS-B')
    ptxt(body,L+56,y+25,U-62,8.4,12.0,maxh=39,id='step '+title)
small_head('Team size and Minister seats',L,668)
# grid
x=L;y=681;cw=[84,80,80,80,80,80]
headers=['PLAYERS','CRISIS 1','CRISIS 2','CRISIS 3','CRISIS 4','CRISIS 5']
rows=[['4','2','2','2','2','2'],['5','2','3','2','3','3'],['6','2','3','3','3','4']]
colx=[x]
for w in cw: colx.append(colx[-1]+w)
rect(L,y,U,93,PAPER,STROKE,8)
for j,hdr in enumerate(headers):
    label(hdr,colx[j]+cw[j]/2,y+19,7.2,DARK,'DVS-B',align='center')
for i,row in enumerate(rows):
    yy=y+41+i*17
    for j,cell in enumerate(row):label(cell,colx[j]+cw[j]/2,yy,8.7,INK,'DVS-B' if j==0 else 'DVS',align='center')
label('Every team has 2 Ministers. Any extra seats are Advisers. Süleyman may be an Adviser, never a Minister.',L,792,7.45,MUTED)
newpage()

# 05 INFLUENCE
page('Imperial Favor & Personal Ambition','new core mechanism','Influence matters politically, but does not replace the hidden-faction victory condition.',5)
# score strip
rect(L,153,U,85,PAPER,STROKE,11)
label('SUCCESSFUL CRISIS',L+18,177,8.0,GREEN,'DVS-B')
label('Süleyman awards +1 Influence',L+18,199,10.2,INK)
label('FAILED CRISIS',L+280,177,8.0,RED,'DVS-B')
label('Süleyman deducts −1 Influence',L+280,199,10.2,INK)
label('He selects ONE of the TWO named Ministers; never an Adviser. Even the third rejected proposal is blamed.',L+18,225,7.65,MUTED)
small_head('Influence economy',L,274)
bullets=[
'All players start with 1 Influence. Track 0–5; it never goes below 0 or above 5.',
'During the Court window, any player may make a Petition: discard 1 Intrigue face up to gain +1 Influence. A Petition uses that player’s one Court action and cannot be countered.',
'Intrigue cards, Companions and character powers can also give or remove Influence.',
'On every completed crisis, Süleyman must publicly reward or blame exactly one Minister. Choosing someone already at the limit still counts as the Decree.',
'At 3 Influence, a player who has achieved their secret Ambition may reveal it and unlock the Favor power printed on their Main Character (once per game).',
'After unlocking, the Favor power stays available even if Influence falls below 3. Influence 5 is NOT an individual win condition.'
]
for i,t in enumerate(bullets):
    y=288+i*57
    c.setFillColor(GOLD);c.circle(L+8,H-(y+12),3.0,stroke=0,fill=1)
    ptxt(t,L+19,y,U-22,8.85,13.3,maxh=45,id='economy '+str(i))
small_head('The progression loop',L,650)
# flow cards
loops=[('1','START','1 Influence'),('2','COURT','Petition, cards, Decree'),('3','AMBITION','Reach 3 + complete'),('4','FAVOR','Reveal; unlock power')]
for i,(n,head,desc) in enumerate(loops):
    x=L+i*129
    rect(x,670,115,83,PAPER,STROKE,10)
    label(n,x+12,693,19,GOLD,'DVSerif-B')
    label(head,x+38,695,7.5,DARK,'DVS-B')
    ptxt(desc,x+12,705,92,7.4,10.5,maxh=37,id='loop'+head)
    if i<3:label('>',x+120,713,13,GOLD,'DVS-B')
strip(L,764,U,35,'WINNING STAYS SIMPLE','',DARK)
# override strip body blank: small text
label('3 SUCCESSFUL CRISES = LOYALIST WIN      ·      3 FAILED CRISES = CONSPIRATOR WIN',L+12,785,7.3,HexColor('#FFFBF3'),'DVS-B')
newpage()

# 06-07 MAINS
for pg in range(2):
    page('The Public Cast' if pg==0 else 'The Public Cast · Continued','eight main characters','All powers are public. Base: once per game. Favor: once per game after Ambition + Influence unlock.',6+pg)
    for k,item in enumerate(mains[pg*4:(pg+1)*4]):
        col=k%2;row=k//2
        major_card(L+col*259,164+row*284,248,264,*item)
    strip(L,744,U,51,'Order of power','Character powers do not consume the one-Intrigue-per-crisis limit. A Favor power must be unlocked before it can be used.',DARK)
    newpage()

# 08-09 COMPANIONS
for pg in range(2):
    page('The Companion Deck' if pg==0 else 'The Companion Deck · Continued','16 permanent helpers','16 Companions for 8 Main Characters (2× as many). Every player drafts one permanent, public helper.',8+pg)
    for k,it in enumerate(companions[pg*8:(pg+1)*8]):
        col=k%2;row=k//2
        companion_card(L+col*259,164+row*147,249,134,it,pg*8+k+1)
    strip(L,758,U,36,'Recasting a card','To “play as” another card: discard the actual card, use the named effect and timing, and spend your normal Intrigue play.',DARK)
    newpage()

# 10-11 INTRIGUE
for pg in range(2):
    page('The Intrigue Deck' if pg==0 else 'The Intrigue Deck · Continued','30 cards · 12 unique','6 effects have 3 copies each; 6 effects have 2 copies each. These are consumable cards, unlike Companions.',10+pg)
    for k,it in enumerate(intrigue[pg*6:(pg+1)*6]):
        name,timing,body,count,letter,accent=it
        col=k%2;row=k//2
        card(L+col*259,164+row*197,249,184,name,timing,body,count,accent,letter,body_size=8.4)
    strip(L,759,U,36,'Court · Reaction · Decree','COURT: after nomination. REACTION: interrupt another card. DECREE: between Süleyman’s selection and applying his loss.',DARK)
    newpage()

#12 AMBITIONS
page('The Hidden Ambition Deck','12 shared objectives','At setup: draw two, secretly keep one. Both factions use the same deck; Ambitions do not grant an individual victory.',12)
for i,it in enumerate(ambitions):
    col=i%2;row=i//2
    ambition_card(L+col*259,161+row*99,248,91,it[0],it[1],i+1)
strip(L,766,U,30,'Claiming','',DARK)
label('At crisis end: verify a completed objective + at least 3 Influence; reveal it and unlock Favor.',L+13,788,7.6,HexColor('#FFF8EB'))
newpage()

# 13 EXAMPLE
page('One Night at Topkapı','worked example','Five players, third crisis. Hürrem and Bali Bey are the two secret conspirators; nobody else knows.',13)
rect(L,153,U,91,PAPER,STROKE,10)
label('CRISIS CARD 03',L+15,178,8.2,GOLD,'DVS-B')
label('Yeniçeri İsyanı',L+15,206,19,INK,'DVSerif-B')
label('Entering: Loyalists 1  /  Conspirators 1',W-R-15,178,8,MUTED,align='right')
label('Needed: 2 Ministers + 0 Advisers  /  Score on approval & mission',W-R-15,216,7.4,MUTED,align='right')
example=[
 ('1','NOMINATE','Süleyman, as Leader, appoints Hürrem and Pargalı as the two Ministers.'),
 ('2','INTERFERE','Mahidevran plays Valide’nin Buyruğu: replace Pargalı with Bali Bey.'),
 ('3','COUNTER','Pargalı uses his Matrakçı Companion: discards any Intrigue card as Akıl Hocası. The replacement is canceled.'),
 ('4','VOTE','Three Approve, two Reject. The original Hürrem–Pargalı team passes.'),
 ('5','SECRET MISSION','Pargalı (Loyalist) submits Support. Hürrem (Conspirator) submits Sabotage. The shuffled submissions reveal one Sabotage.'),
 ('6','IMPERIAL DECREE','The conspirators earn their second crisis point. Süleyman blames Pargalı and deducts 1 Influence (down to 0).'),
 ('7','PERSONAL MOTIVE','Pargalı fought to stay because his secret Ambition is Divanda Nüfuz (2 ministerial missions). That motive did not make him a conspirator.'),
]
for i,(n,heading,body) in enumerate(example):
    y=266+i*66
    rect(L,y,37,41,fill=DARK2,stroke=None,r=8)
    label(n,L+18,y+28,15,GOLD_LT,'DVSerif-B',align='center')
    label(heading,L+50,y+15,8.4,INK,'DVS-B')
    ptxt(body,L+50,y+23,U-56,size=8.2,leading=11.9,maxh=44,id='ex'+n)
strip(L,744,U,51,'What changed from the old edition','The minor character is not a one-use Matrakçı card: he is a persistent Companion that converts a card from hand into a counter.',DARK)
newpage()

# 14 edge cases
page('Timing & Edge Cases','rules clarifications','Use these interpretations when card effects collide. No player is ever eliminated.',14)
edge=[
 ('PUBLIC / SECRET','Main Characters, Companions, votes and Influence totals are public. Allegiances, Ambitions and held Intrigue cards are private.'),
 ('ONE PLAY PER CRISIS','Each player may use at most one Intrigue card or Petition per crisis. A Reaction or Decree card also spends that slot. Hürrem’s unlocked Favor permits one extra Intrigue, not another Petition.'),
 ('RECASTING','Companions that say “play as X” change a card’s effect and timing, not its physical card identity. One card is discarded. Such a play can be countered normally.'),
 ('REACTION CHAINS','Announce a card, allow immediate reactions, then resolve reactions in reverse order. A counter can itself be countered. Each player’s one-card limit still applies.'),
 ('MISSED WINDOW','COURT cards must be played before the vote of a proposal. REACTION cards are immediate. DECREE cards can be played only after the Sultan selects a Minister.'),
 ('CHANGED TEAM','If a proposal changes, Kulis commitments and Sahte Ferman locks end; a fresh Court window occurs. No player draws a new card.'),
 ('THREE REJECTIONS','A third rejected proposal immediately fails the crisis. Record one conspirator point. The Sultan then blames one of the last proposal’s two Ministers. No secret mission is played.'),
 ('VOTE TIES','A tie is a rejection. Count votes from everybody, including non-nominees and Süleyman.'),
 ('MINISTER / ADVISER','Two distinct non-Süleyman nominees always fill the Minister seats. Additional nominees (if any) are Advisers; all mission members submit, but only Ministers receive an Imperial Decree.'),
 ('BALANCING SECRECY','Loyalists may never submit Sabotage. Conspirators may submit either card. No Intrigue, character or Companion ability may directly reveal Allegiance.'),
 ('DRAWS & CAPS','Hand limit 3 after any draw or exchange, Influence 0–5. When Intrigue draw pile empties, shuffle the discard pile into a new draw pile.'),
 ('POWER PRECEDENCE','Printed Companion abilities are passive or once-per-game as specified. If effects conflict, Reaction resolves before the triggering card; Main Character effects override Sahte Ferman locks.'),
]
for i,(head,body) in enumerate(edge):
    x=L+(i%2)*259;y=156+(i//2)*101
    rect(x,y,249,91,PAPER,STROKE,8)
    label(head,x+12,y+19,7.75,DARK,'DVS-B')
    ptxt(body,x+12,y+26,224,7.75,11.1,maxh=60,id='edge'+head)
strip(L,772,U,27,'Reminder','',DARK)
label('Words spoken at the table are never binding except when a card explicitly locks a vote.',L+14,789,7.45,HexColor('#FFFBF3'))
newpage()

#15 CRISIS
page('The Crisis Cards & Victory Track','narrative prompts','Crisis names set the atmosphere only. In v0.2 they do not introduce separate random effects.',15)
for i,cr in enumerate(crises):
    x=L+(i%2)*259;y=162+(i//2)*76
    rect(x,y,249,64,PAPER,STROKE,9)
    rect(x+9,y+9,37,46,DARK2,None,7)
    label(f'{i+1:02}',x+27,y+36,13,GOLD_LT,'DVSerif-B',align='center')
    ptxt(cr,x+57,y+17,180,12,15,font='DVSerif-B',maxh=40,id='crisis'+cr)
small_head('Score immediately; stop at three',L,587)
rect(L,603,U,81,PAPER,STROKE,10)
label('LOYALISTS',L+28,626,10,GREEN,'DVS-B'); label('CONSPIRATORS',L+285,626,10,RED,'DVS-B')
for i in range(3):
    c.setFillColor(PALE_GREEN);c.setStrokeColor(GREEN);c.circle(L+30+i*52,H-654,14,stroke=1,fill=1)
    c.setFillColor(PALE_RED);c.setStrokeColor(RED);c.circle(L+287+i*52,H-654,14,stroke=1,fill=1)
ptxt('A crisis counts as Loyalist success only if it is approved and the mission has no unblocked Sabotage. Any other completed crisis counts for Conspirators.',L,702,U,size=9.25,leading=14,maxh=55,id='crisis victory')
strip(L,753,U,45,'What not to add yet','Avoid executions, movement, player elimination or crisis-specific modifiers until the core voting, Influence and card interactions are tested.')
newpage()

#16 origins
page('Design Origins & Playtest Notes','mechanical influences','Specific ideas borrowed as design references; all text, combinations and new card effects are original prototype choices.',16)
refs=[
 ('THE RESISTANCE / AVALON','Approving mission teams; secret Support/Sabotage; race to three scored missions. No player elimination.'),
 ('SECRET HITLER','Repeated contested appointments and escalating refusal pressure; a visible ruler creates political focus.'),
 ('BANG!','Separate public characters from hidden allegiances; distinguish persistent cards from consumable actions.'),
 ('COUP','Reactive counters and flexible role-related actions; companions add a small amount of conversion and bluff without eliminating players.'),
 ('LOVE LETTER','Compact repeated card effects, small hand limits, memorable consequences and easy-to-teach card text.'),
]
for i,(title,desc) in enumerate(refs):
    y=157+i*88
    rect(L,y,U,77,PAPER,STROKE,9)
    label(title,L+13,y+21,8.6,DARK,'DVS-B')
    ptxt(desc,L+13,y+28,U-25,8.2,12.2,maxh=43,id='influence '+title)
small_head('Playtest questions',L,617)
ptxt('Does the Sultan’s forced Decree create negotiation or merely punish unlucky Ministers? Can players unlock Favor by Crisis 3? Do recasters, especially Matrakçı, overpower printed Intrigue cards? Do 4-player games give the single conspirator enough options?',L,634,U,8.75,13.1,maxh=64,id='playtesting')
small_head('Reference rulebooks / publisher information',L,709)
sources=[
 'indieboardsandcards.com/our-games/the-resistance/',
 'secrethitler.com/assets/Secret_Hitler_Rules.pdf',
 'bang.dvgiochi.com/content/1/docs/01_bang_rules_EN.pdf',
 'rules.dized.com/game/xzsTtI3VTV-2wvos3otxIg/coup',
 'zmangames.com/game/love-letter/',
]
for i,s in enumerate(sources):label('• '+s,L,725+i*13,7.05,MUTED)
newpage()

#17 QUICK REFERENCE
page('One-Page Rules Reference','table companion','Keep beside the score board. This page should be sufficient once everybody knows the cards.',17)
strip(L,154,U,76,'Victory','Loyalists: 3 successful approved missions. Conspirators: 3 failed crises, including those ending in three rejected proposals. Influence 5 never wins the game.')
small_head('Crisis flow',L,266)
for i,(a,b) in enumerate([('1. REVEAL','Crisis + draw 1, hand max 3'),('2. NOMINATE','2 Ministers + any Advisers'),('3. COURT','Play an Intrigue or Petition'),('4. VOTE','Majority needed; 3 rejections fail'),('5. MISSION','Loyalists must Support'),('6. SCORE','Any unblocked Sabotage fails'),('7. DECREE','Sultan: +1 or −1 to 1 Minister')]):
    y=281+i*51
    rect(L,y,U,43,PAPER,STROKE,7)
    label(a,L+11,y+26,9,DARK,'DVS-B')
    ptxt(b,L+154,y+11,U-166,9.05,14,maxh=27,id='quick'+a)
small_head('Four decisive boundaries',L,676)
rect(L,688,U,108,PAPER,STROKE,9)
for i,(a,b) in enumerate([
 ('MINISTERS','Exactly 2; may not be Süleyman'),
 ('CARD LIMIT','1 Intrigue or Petition per crisis'),
 ('INFLUENCE','Start 1; range 0–5; claim Ambition at 3'),
 ('COMPANIONS','Permanent public help; recasts discard a hand card')
]):
    x=L+12+(i%2)*250;y=700+(i//2)*43
    label(a,x,y+12,7.7,DARK,'DVS-B')
    ptxt(b,x,y+15,222,7.6,11,maxh=29,id='quick boundary')
newpage()

assert len(mains)==8 and len(companions)==16 and len(intrigue)==12 and len(ambitions)==12 and len(crises)==10
assert sum(int(i[3].split()[0]) for i in intrigue)==30
c.save()
print('OUT',OUT,os.path.getsize(OUT))
print('TEXT FIT WARNINGS',len(issues))
for item in issues:print(item)
PY
python /mnt/data/sarayda_assets/build_rulebook_v02.py