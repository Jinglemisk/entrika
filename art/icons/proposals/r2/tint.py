# kati/set/<name>-<size>.png (black mask) -> kati/tint/ (paper meaning colour) and kati/tint-l/ (lacquer colour, for dark grounds and bezels)
import json, glob, os
from PIL import Image
m = json.load(open('meaning.json'))['colours']
for ground, d in (('paper', 'kati/tint'), ('lacquer', 'kati/tint-l')):
  col = {t: v[ground] for v in m.values() for t in v['terms']}
  os.makedirs(d, exist_ok=True)
  for f in glob.glob('kati/set/*.png'):
      b = os.path.basename(f); n = b[:-4].rsplit('-', 1)[0] if b[:-4].rsplit('-', 1)[-1].isdigit() else b[:-4]
      h = col.get(n, '#2a1c12'); rgb = tuple(int(h[i:i+2], 16) for i in (1, 3, 5))
      im = Image.open(f).convert('RGBA'); out = Image.new('RGBA', im.size, rgb + (0,)); out.putalpha(im.getchannel('A'))
      out.save(d + '/' + b)
