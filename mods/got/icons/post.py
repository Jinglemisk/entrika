# raw/<name>.png (black ink on white, from gen.sh) -> masks/<name>.png: 512 px, black, alpha = ink, cropped to content
# and padded to a square with a 6 % margin. Same treatment as the Kat'ı masks (art/icons/proposals/r2/post.py).
# usage: python3 -I mods/got/icons/post.py [name...]   (no names: every raw/*.png that isn't an old .vNNN take)
import sys, os, glob
from PIL import Image

here = os.path.dirname(os.path.abspath(__file__))

def ink(im):
    lum = im.convert('L').point(lambda v: 0 if v > 225 else 255 if v < 40 else int(255 * (225 - v) / 185))
    out = Image.new('RGBA', im.size, (0, 0, 0, 0))
    out.putalpha(lum)
    return out

def square(im, margin=.06):
    im = im.crop(im.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox())
    s = int(max(im.size) / (1 - 2 * margin))
    c = Image.new('RGBA', (s, s))
    c.paste(im, ((s - im.width) // 2, (s - im.height) // 2))
    return c.resize((512, 512), Image.LANCZOS)

names = sys.argv[1:] or [os.path.basename(p)[:-4] for p in glob.glob(f'{here}/raw/*.png') if '.v' not in os.path.basename(p)]
os.makedirs(f'{here}/masks', exist_ok=True)
for n in sorted(names):
    square(ink(Image.open(f'{here}/raw/{n}.png'))).save(f'{here}/masks/{n}.png')
print(len(names), 'masks')
