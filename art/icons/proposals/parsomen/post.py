# Magenta key -> alpha, crop, pad square (6%), then two outputs per icon:
#   set/<name>.png (+144/72/48)        transparent ink emblem
#   token/<name>.png (+144/72/48)      emblem on a parchment disc with an ink rim
# usage: python3 -I post.py <dir> name...
import sys, os
from PIL import Image, ImageDraw, ImageFilter

PARCH = (243, 226, 179)
INK = (27, 20, 18)

def key(im):
    im = im.convert('RGB')
    w, h = im.size
    px = im.load()
    out = Image.new('RGBA', (w, h))
    op = out.load()
    for y in range(h):
        for x in range(w):
            r, g, b = px[x, y]
            # magenta-ness: high r and b, low g
            m = min(r, b) - g
            a = 255 if m < 40 else 0 if m > 140 else int(255 * (140 - m) / 100)
            if 0 < a < 255:  # unmix the magenta from the edge pixel
                f = a / 255
                r = max(0, min(255, int((r - 255 * (1 - f)) / f)))
                g = max(0, min(255, int(g / f)))
                b = max(0, min(255, int((b - 255 * (1 - f)) / f)))
            op[x, y] = (r, g, b, a)
    return out

def square(im, margin=.06):
    bb = im.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox()
    im = im.crop(bb)
    s = int(max(im.size) / (1 - 2 * margin))
    c = Image.new('RGBA', (s, s))
    c.paste(im, ((s - im.width) // 2, (s - im.height) // 2))
    return c.resize((512, 512), Image.LANCZOS)

def token(icon):
    S = 1024
    t = Image.new('RGBA', (S, S))
    d = ImageDraw.Draw(t)
    rim = int(S * .035)
    d.ellipse((0, 0, S - 1, S - 1), fill=INK + (255,))
    d.ellipse((rim, rim, S - 1 - rim, S - 1 - rim), fill=PARCH + (255,))
    t = t.resize((512, 512), Image.LANCZOS)
    inner = icon.resize((400, 400), Image.LANCZOS)
    t.alpha_composite(inner, (56, 56))
    return t

def save(im, path):
    im.save(path + '.png')
    for s in (144, 72, 48):
        im.resize((s, s), Image.LANCZOS).save(f'{path}-{s}.png')

root = sys.argv[1]
for n in sys.argv[2:]:
    os.makedirs(f'{root}/set', exist_ok=True); os.makedirs(f'{root}/token', exist_ok=True)
    ic = square(key(Image.open(f'{root}/raw/{n}.png')))
    save(ic, f'{root}/set/{n}')
    save(token(ic), f'{root}/token/{n}')
    print(n, 'done')
