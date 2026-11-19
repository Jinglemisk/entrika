# Builds a mod's icon set from its masks. An icons folder holds
#   masks/<name>.png  512 px black silhouettes (alpha = the shape), one per icon id (game/content/icons.json)
#   meaning.json      each icon's paper and lacquer colour
#   -> set/<name>.png (512) and set/<name>-144/-72/-48.png, tinted with the paper colour
# The game shows these files as they are on light grounds and masks them with the lacquer colour on dark ones.
# usage: python3 -I art/icons/build.py [icons folder]
#   no folder: this one, the muhtesem Kat'ı set; for another mod: python3 -I art/icons/build.py mods/got/icons
import json, os, glob, sys
from PIL import Image

here = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else os.path.dirname(os.path.abspath(__file__))
colours = json.load(open(f'{here}/meaning.json'))['colours']
paper = {t: v['paper'] for v in colours.values() for t in v['terms']}

masks = sorted(glob.glob(f'{here}/masks/*.png'))
missing = sorted(set(paper) - {os.path.basename(m)[:-4] for m in masks})
assert not missing, f'no mask for {missing}'
os.makedirs(f'{here}/set', exist_ok=True)
for m in masks:
    name = os.path.basename(m)[:-4]
    h = paper[name]
    rgb = tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))
    alpha = Image.open(m).getchannel('A')
    im = Image.new('RGBA', alpha.size, rgb + (0,))
    im.putalpha(alpha)
    im.save(f'{here}/set/{name}.png')
    for s in (144, 72, 48):
        im.resize((s, s), Image.LANCZOS).save(f'{here}/set/{name}-{s}.png')
print(len(masks), 'icons')
