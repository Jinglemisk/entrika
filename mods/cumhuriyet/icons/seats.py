# Draws min1 and min2 from the minister mask: the same briefcase with one or two bold straps cut through its body,
# so the two seats read apart at 16 px (a Roman I and II in the case). Run after post.py.
# usage: python3 -I seats.py
import os
from PIL import Image, ImageDraw

here = os.path.dirname(os.path.abspath(__file__))
base = Image.open(f'{here}/masks/minister.png')
a = base.getchannel('A')
w, h = a.size
# the case body: rows below the flap where the mask is mostly solid
rows = [y for y in range(h) if sum(1 for x in range(0, w, 4) if a.getpixel((x, y)) > 128) > (w / 4) * 0.55]
top, bot = rows[0], rows[-1]
body_top = top + int((bot - top) * 0.50)   # below the flap and clasp
body_bot = bot - int((bot - top) * 0.10)
strap = int(w * 0.11)

def cut(xs, name):
    m = a.copy()
    d = ImageDraw.Draw(m)
    for cx in xs:
        d.rectangle((cx - strap // 2, body_top, cx + strap // 2, body_bot), fill=0)
    out = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    out.putalpha(m)
    out.save(f'{here}/masks/{name}.png')

cut([w // 2], 'min1')
cut([w // 2 - int(w * 0.17), w // 2 + int(w * 0.17)], 'min2')
print('min1, min2', body_top, body_bot)
