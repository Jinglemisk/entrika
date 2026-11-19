# Makes a Character's portrait for a mod: the cut-out and where it sits on the Character card and in the seat's niche.
#   python3 -I art/tools/portrait.py <mod> <character id> <photo>
#   python3 -I art/tools/portrait.py got hurrem mods/got/art/char.hurrem-1.jpg
# Needs macOS (Vision, through art/tools/cutout.swift) and Pillow with WebP. It writes
#   mods/<mod>/art/cutout/char.<id>.png   the full-size cut-out
#   mods/<mod>/art/cut-char.<id>.webp     the game's copy, 600 px wide
# and the entry for <id> in mods/<mod>/portraits.json, which the game reads (skin.ts Portrait):
#   card  {cl, cw, ct, op}: the face 30cqw tall, centred at (50, 35) on the 100-wide card, and the photo always
#         covering the art window (10..90 across, 14.4 down to the name line at 70); op places the photo when the
#         compact card crops it.
#   niche {hx, y0, ar, w}: hx is the head's centre and y0 its top, as fractions of the photo; ar is its height over
#         its width; w is its width over the niche's, so the face is 0.46 of the niche wide.
# These are the rules the muhtesem portraits were tuned to. A photo needs one clear person, head and shoulders, the
# face turned to the viewer; check the result in /?kartlar and on the table, and nudge the numbers by hand if needed.
import json, os, subprocess, sys
import numpy as np
from PIL import Image

if len(sys.argv) != 4:
    sys.exit('usage: python3 -I art/tools/portrait.py <mod> <character id> <photo>')
mod, cid, photo = sys.argv[1:]
root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
mdir = os.path.join(root, 'mods', mod)
if not os.path.exists(os.path.join(mdir, 'mod.json')):
    sys.exit(f'no mod at {mdir}')
os.makedirs(os.path.join(mdir, 'art', 'cutout'), exist_ok=True)
png = os.path.join(mdir, 'art', 'cutout', f'char.{cid}.png')
run = subprocess.run(['swift', os.path.join(root, 'art', 'tools', 'cutout.swift'), photo, png], capture_output=True, text=True)
if run.returncode:
    sys.exit(run.stderr.strip() or 'cutout.swift failed')
d = json.loads(run.stdout)
W, H = d['w'], d['h']
if not d['face']:
    sys.exit('no face found: pick a photo with the face turned to the viewer')
fx, fy, fw, fh = d['face']

# ---- trim the cut-out to the person: their alpha box plus a 4 % margin, the bottom kept at the photo's bottom, so a
#      wide photo doesn't leave the figure small in a frame of empty sides (the frieze sizes figures by width)
im = Image.open(png)
box = (np.array(im.getchannel('A')) > 8)
cols, rows_ = np.where(box.any(0))[0], np.where(box.any(1))[0]
mx, my = .04 * (cols[-1] - cols[0] + 1), .04 * (rows_[-1] - rows_[0] + 1)
x0, x1 = max(0, int(cols[0] - mx)), min(W, int(cols[-1] + 1 + mx))
y0 = max(0, int(rows_[0] - my))
im.crop((x0, y0, x1, H)).save(png)
fx, fy, fw, fh = (fx * W - x0) / (x1 - x0), (fy * H - y0) / (H - y0), fw * W / (x1 - x0), fh * H / (H - y0)
W, H = x1 - x0, H - y0
ar = H / W

# ---- card: the art window is 10..90cqw across and 14.4cqw down to the name line at 70cqw
ih = 30 / fh
iw = ih / ar
if iw < 80:                                   # too narrow to cover the window: scale up
    iw, ih = 80, 80 * ar
left = min(10, max(90 - iw, 50 - (fx + fw / 2) * iw))
ct = 35 - 14.4 - (fy + fh / 2) * ih
ct = min(0, ct)                               # the photo starts at or above the window's top
if 14.4 + ct + ih < 70:                       # and reaches the name line
    ct = 70 - 14.4 - ih
card = {'cl': round((left - 10) / .8, 2), 'cw': round(iw / .8, 2), 'ct': round(ct, 2),
        'op': f'{round((fx + fw / 2) * 100)}% {round(fy * 100) + 2}%'}

# ---- niche: the head's centre is the mean centre of the cut-out's rows from the top of the head to the middle of the face
a = np.array(Image.open(png).getchannel('A')) > 128
rows = np.where(a.any(1))[0]
top = int(rows[0])
band = a[top:max(top + 1, int((fy + fh / 2) * H))]
hx = float(np.mean([np.where(r)[0].mean() for r in band if r.any()])) / W
niche = {'hx': round(hx, 3), 'y0': round(top / H, 4), 'ar': round(ar, 4), 'w': round(.46 / fw, 2)}

# ---- the game's copy, and the entry
web = os.path.join(mdir, 'art', f'cut-char.{cid}.webp')
im = Image.open(png)
im.resize((600, round(600 * ar)), Image.LANCZOS).save(web, 'WEBP', quality=82, method=6)
pf = os.path.join(mdir, 'portraits.json')
portraits = json.load(open(pf)) if os.path.exists(pf) else {}
portraits[cid] = {'src': f'art/cut-char.{cid}.webp', 'card': card, 'niche': niche}
with open(pf, 'w') as f:
    f.write('{\n' + ',\n'.join(
        f'  {json.dumps(k)}: {{\n    "src": {json.dumps(v["src"])},\n    "card": {json.dumps(v["card"], separators=(", ", ": "))},\n'
        f'    "niche": {json.dumps(v["niche"], separators=(", ", ": "))}\n  }}' for k, v in portraits.items()) + '\n}\n')
print(cid, json.dumps(portraits[cid]))
