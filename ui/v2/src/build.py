"""Assemble ui/v2/index.html from the source parts and a fresh pull of the art page.

Run from anywhere:  python3 ui/v2/src/build.py
The art block (card CSS, the two SVG sprites, one card article per kind, terms.json)
is copied from art/directions/index.html every time, so re-running picks up art fixes.
"""
import json, re, sys, os, html

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
ART = os.path.join(REPO, 'art/directions/index.html')
TERMS = os.path.join(REPO, 'art/terms.json')
OUT = os.path.join(REPO, 'ui/v2/index.html')

s = open(ART, encoding='utf-8').read()

# ---- card CSS: from "The card." block to the forks section (includes inline terms, backs, compact frame)
a = s.index('/* =====================================================================\n   The card.')
b = s.index('/* ---------- forks ---------- */')
card_css = s[a:b]
# root textures the card CSS relies on
root = re.search(r':root\{(.*?)\n\}', s, flags=re.S).group(1)
fiber = re.search(r'--fiber:(url\(".*?"\));', root).group(1)
leather = re.search(r'--leather:(url\(".*?"\));', root).group(1)
card_css = (':root{--fiber:%s;--leather:%s}\n' % (fiber, leather)) + card_css
# the Sultan's gold card, the PNG icon rules and the extra backs come after the page-only sections
k = s.index('/* ---------- the Sultan')
card_css += s[k:s.index('</style>', k)]
card_css += '\n.sprite{position:absolute;width:0;height:0;overflow:hidden}\n'

# ---- sprites
sprites = re.findall(r'<svg class="sprite".*?</svg>', s, flags=re.S)
assert len(sprites) == 2, len(sprites)

# ---- cards: first canonical article per kind
arts = re.findall(r'<article class="c3[^"]*".*?</article>', s, flags=re.S)
def pick(cls, label):
    lab = html.escape(label, quote=True).replace('&#x27;', '&#x27;')
    for x in arts:
        m = re.match(r'<article class="([^"]+)"[^>]*aria-label="([^"]*)"', x)
        if m.group(1) == cls and html.unescape(m.group(2)) == label and 'dusk-' not in x:
            return x
    sys.exit('missing card %s %s' % (cls, label))

WANT = {
    'char.suleyman': ('c3 t-char sultan v-break', 'Süleyman'),
    'char.hurrem': ('c3 t-char v-break', 'Hürrem'),
    'char.ibrahim': ('c3 t-char v-break', 'Pargalı'),
    'char.mahidevran': ('c3 t-char v-break', 'Mahidevran'),
    'char.hatice': ('c3 t-char v-break', 'Hatice'),
    'char.mihrimah': ('c3 t-char v-break', 'Mihrimah'),
    'char.rustem': ('c3 t-char v-break', 'Rüstem'),
    'kul.sumbul': ('c3 t-kul', 'Sümbül Ağa'),
    'kul.bali': ('c3 t-kul', 'Malkoçoğlu'),
    'kul.afife': ('c3 t-kul', 'Afife Hatun'),
    'intr.iftira': ('c3 t-intr', 'İftira'),
    'intr.akil': ('c3 t-intr', 'Akıl Hocası'),
    'intr.valide': ('c3 t-intr', "Valide'nin Buyruğu"),
    'intr.muhur': ('c3 t-intr', 'Mühür'),
    'intr.saray-tabibi': ('c3 t-intr', 'Saray Tabibi'),
    'intr.saray-dedikodusu': ('c3 t-intr', 'Saray Dedikodusu'),
    'crisis.divan': ('c3 t-crisis v-full', 'Divan Kavgası'),
    'kader.h': ('c3 t-kader-h', 'Hizmet'),
    'kader.x': ('c3 t-kader-x', 'Hıyanet'),
    'hirs.kulak': ('c3 t-hirs', 'Kulak Misafiri'),
    'taraf.s': ('c3 t-taraf-s', 'Sadık'),
    'taraf.h': ('c3 t-taraf-h', 'Hain'),
    'back.intr': ('c3 back b-intr', 'Entrika kart sırtı'),
    'back.kader': ('c3 back b-kader', 'Kader kart sırtı'),
    'back.taraf': ('c3 back b-taraf', 'Taraf kart sırtı'),
    'back.hirs': ('c3 back b-hirs', 'Hırs kart sırtı'),
    'back.crisis': ('c3 back b-crisis', 'Kriz kart sırtı'),
}
cards = {k: pick(*v) for k, v in WANT.items()}

terms = json.load(open(TERMS, encoding='utf-8'))
terms_list = terms['terms'] if isinstance(terms, dict) else terms

def js(o):
    return json.dumps(o, ensure_ascii=False).replace('</', '<\\/')

art_block = (
    '<!-- ART:BEGIN  pulled from art/directions/index.html and art/terms.json by build.py; do not edit by hand -->\n'
    '<style id="art-css">\n' + card_css + '</style>\n'
    + '\n'.join(sprites) + '\n'
    '<script type="application/json" id="art-cards">' + js(cards) + '</script>\n'
    '<script type="application/json" id="art-terms">' + js(terms_list) + '</script>\n'
    '<!-- ART:END -->'
)

shell = open(os.path.join(HERE, 'shell.html'), encoding='utf-8').read()
css = open(os.path.join(HERE, 'game.css'), encoding='utf-8').read()
jsrc = open(os.path.join(HERE, 'game.js'), encoding='utf-8').read()
spec = open(os.path.join(HERE, 'spec.html'), encoding='utf-8').read()
out = (shell.replace('/*@CSS@*/', css)
            .replace('<!--@ART@-->', art_block)
            .replace('<!--@SPEC@-->', spec)
            .replace('/*@JS@*/', jsrc))
open(OUT, 'w', encoding='utf-8').write(out)
# icons: every id the page can ask for, at the three game sizes (never the 512 masters)
import shutil
SET = os.path.join(REPO, 'art/icons/set')
ids = {f.rsplit('-', 1)[0] for f in os.listdir(SET) if re.match(r'.+-(48|72|144)\.png$', f)}
used = set(re.findall(r'icons/([a-z0-9-]+)-\d+\.png', out)) | {t['icon'] for t in terms_list}
used |= {w for w in re.findall(r"'([a-z][a-z0-9-]*)'", jsrc) if w in ids}
used |= {'vibration'}
ICONS = os.path.join(REPO, 'ui/v2/img/icons'); os.makedirs(ICONS, exist_ok=True)
for f in os.listdir(ICONS):
    if f.rsplit('-', 1)[0] not in used: os.remove(os.path.join(ICONS, f))
for i in sorted(used):
    for sz in (48, 72, 144):
        src = os.path.join(SET, f'{i}-{sz}.png')
        if os.path.exists(src): shutil.copyfile(src, os.path.join(ICONS, f'{i}-{sz}.png'))
print('icons:', len(used), sorted(used))
imgs = sorted(set(re.findall(r'img/[\w.\-]+\.(?:jpg|webp|png)', out)))
missing = [i for i in imgs if not os.path.exists(os.path.join(REPO, 'ui/v2', i))]
missing += [f'icons/{i}' for i in sorted(used) if not os.path.exists(os.path.join(ICONS, f'{i}-48.png'))]
print('wrote', OUT, len(out), 'bytes;', len(imgs), 'images referenced; missing:', missing)
