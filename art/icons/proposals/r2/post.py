# raw/<name>.png -> set/<name>.png (512) + -144/-72/-48
#   cini, mine2: magenta key -> alpha
#   kati: black ink -> alpha mask (black pixels, alpha = ink), for CSS mask + tint
# Then crop to content and pad to a square with a 6% margin.
# usage: python3 -I post.py <style> name...
import sys, os
from PIL import Image

def key(im):
    im = im.convert('RGB'); w, h = im.size; px = im.load()
    out = Image.new('RGBA', (w, h)); op = out.load()
    for y in range(h):
        for x in range(w):
            r, g, b = px[x, y]
            m = min(r, b) - g
            a = 255 if m < 40 else 0 if m > 140 else int(255 * (140 - m) / 100)
            if 0 < a < 255:
                f = a / 255
                r = max(0, min(255, int((r - 255 * (1 - f)) / f)))
                g = max(0, min(255, int(g / f)))
                b = max(0, min(255, int((b - 255 * (1 - f)) / f)))
            op[x, y] = (r, g, b, a)
    return out

def ink(im):
    lum = im.convert('L').point(lambda v: 0 if v > 225 else 255 if v < 40 else int(255 * (225 - v) / 185))
    out = Image.new('RGBA', im.size, (0, 0, 0, 0))
    out.putalpha(lum)
    return out

def square(im, margin=.06):
    bb = im.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox()
    im = im.crop(bb)
    s = int(max(im.size) / (1 - 2 * margin))
    c = Image.new('RGBA', (s, s))
    c.paste(im, ((s - im.width) // 2, (s - im.height) // 2))
    return c.resize((512, 512), Image.LANCZOS)

style = sys.argv[1]
os.makedirs(f'{style}/set', exist_ok=True)
for n in sys.argv[2:]:
    raw = Image.open(f'{style}/raw/{n}.png')
    ic = square(ink(raw) if style == 'kati' else key(raw))
    ic.save(f'{style}/set/{n}.png')
    for s in (144, 72, 48):
        ic.resize((s, s), Image.LANCZOS).save(f'{style}/set/{n}-{s}.png')
    print(style, n)
