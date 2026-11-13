# Bakes the grade into copies of the stills: out = k2*tritone(lum) + (1-k2)*src, k2 = 0.8*s (same maths as the page filter).
# usage: python3 -I bake.py <s> <src_dir> <dst_dir>
import sys, os
import numpy as np
from PIL import Image
TABLE = {  # warm umber-gold tritone; keep in sync with the #grade filter on the page
    'R': [0.045, 0.28, 0.60, 0.88, 1.00],
    'G': [0.035, 0.19, 0.43, 0.76, 0.96],
    'B': [0.030, 0.11, 0.24, 0.52, 0.84],
}
s, src, dst = float(sys.argv[1]), sys.argv[2], sys.argv[3]
k2 = 0.8 * s
os.makedirs(dst, exist_ok=True)
xs = np.linspace(0, 1, 5)
n = 0
for f in sorted(os.listdir(src)):
    if not f.lower().endswith('.jpg'):
        continue
    a = np.asarray(Image.open(os.path.join(src, f)).convert('RGB')).astype(np.float32) / 255
    lum = a[..., 0] * .2126 + a[..., 1] * .7152 + a[..., 2] * .0722
    tri = np.stack([np.interp(lum, xs, TABLE[c]) for c in 'RGB'], -1)
    out = np.clip(k2 * tri + (1 - k2) * a, 0, 1)
    Image.fromarray((out * 255 + .5).astype(np.uint8)).save(os.path.join(dst, f), quality=82, optimize=True, progressive=True)
    n += 1
print('baked', n, 'files at s =', s, 'k2 =', round(k2, 3))
