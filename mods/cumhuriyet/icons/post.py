# raw/<name>.png (black on white) -> masks/<name>.png: 512 px, black, alpha = ink, cropped to content with a 6% margin.
# usage: python3 -I post.py [name...]   (no names: every raw/<name>.png without a version suffix)
# once and always are plain glyphs, drawn by the shared art/icons/glyphs.py; this copies them from art/icons/masks.
import glob, os, shutil, sys
from PIL import Image

here = os.path.dirname(os.path.abspath(__file__))
os.makedirs(f'{here}/masks', exist_ok=True)

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

names = sys.argv[1:] or sorted(os.path.basename(p)[:-4] for p in glob.glob(f'{here}/raw/*.png') if '.v' not in os.path.basename(p))
for n in names:
    square(ink(Image.open(f'{here}/raw/{n}.png'))).save(f'{here}/masks/{n}.png')
shared = os.path.join(here, '../../../art/icons/masks')
for n in ('once', 'always'):
    shutil.copy(f'{shared}/{n}.png', f'{here}/masks/{n}.png')
print(len(names), 'masks + once, always')
