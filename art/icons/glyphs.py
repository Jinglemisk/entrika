# Draws the two frequency masks that are plain symbols, not paper-cut motifs: once (a bold 1) and always (∞).
# They sit on an 18 px disc, so they are geometric and fill the frame; the disc's own rim is the ring.
# usage: python3 -I art/icons/glyphs.py && python3 -I art/icons/build.py
import math, os
from PIL import Image, ImageDraw

here = os.path.dirname(os.path.abspath(__file__))
S = 2048  # drawn at 4x, saved at 512

def save(im, name):
    a = im.resize((512, 512), Image.LANCZOS)
    out = Image.new('RGBA', a.size, (0, 0, 0, 0))
    out.putalpha(a)
    out.save(f'{here}/masks/{name}.png')

# 1: tall stem, a flag to the upper left, a foot bar
im = Image.new('L', (S, S), 0); d = ImageDraw.Draw(im)
stem, top, bot = 380, 170, 1880
cx = S // 2 + 90
d.rectangle((cx - stem // 2, top, cx + stem // 2, bot), fill=255)
d.polygon([(cx - stem // 2, top), (cx + stem // 2 - 40, top), (cx - stem // 2 - 560, top + 520), (cx - stem // 2 - 560, top + 140)], fill=255)
d.polygon([(cx - stem // 2 + 2, top), (cx - stem // 2 - 560, top + 140), (cx - stem // 2 - 560, top + 520), (cx - stem // 2 + 2, top + 380)], fill=255)
d.rectangle((cx - stem // 2 - 330, bot - 300, cx + stem // 2 + 330, bot), fill=255)
save(im, 'once')

# ∞: lemniscate of Bernoulli, thick even stroke
im = Image.new('L', (S, S), 0); d = ImageDraw.Draw(im)
a, w = 930, 300
pts = []
for i in range(2001):
    t = 2 * math.pi * i / 2000
    den = 1 + math.sin(t) ** 2
    pts.append((S / 2 + a * math.cos(t) / den, S / 2 + 1.25 * a * math.sin(t) * math.cos(t) / den))
for p in pts:
    d.ellipse((p[0] - w / 2, p[1] - w / 2, p[0] + w / 2, p[1] + w / 2), fill=255)
save(im, 'always')
print('once, always')
