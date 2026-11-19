# Writes mods/cumhuriyet/skin.json: the faces and backs drawn by make.py, the stills picked in art/manifest.json (first
# candidate, with its focus as the CSS position), the table pieces and the music. Rerun after changing the manifest.
#   python3 -I mods/cumhuriyet/cards/skin_json.py
import json, os

MOD = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
man = json.load(open(os.path.join(MOD, 'art', 'manifest.json')))['entities']

def face(kind, base, art=None, dark=True, **kw):
    f = {'frame': f'cards/{kind}.svg', 'base': base}
    if art:
        f['art'] = f'cards/{art}.svg'
    if dark:
        f['darkGems'] = True
    f.update(kw)
    return f

LAC, KARA, HAKI, MOR = ['#2f4f80', '#0e1a2e'], ['#4a403a', '#0d0b0a'], ['#6e8640', '#222b12'], ['#6a5596', '#1c1430']
art = {}
prefix = {'card.': 'intrigue.', 'comp.': 'companions.', 'crisis.': 'crises.'}
for key, ent in man.items():
    c = ent['candidates'][0]
    pos = f'{round(c["focus"][0] * 100)}% {round(c["focus"][1] * 100)}%'
    for p, q in prefix.items():
        if key.startswith(p):
            art[q + key[len(p):]] = {'src': f'art/{c["file"]}', 'pos': pos}
    if key == 'term.hizmet':
        art['kader.h'] = {'src': f'art/{c["file"]}', 'pos': pos}
    if key == 'term.hiyanet':
        art['kader.x'] = {'src': f'art/{c["file"]}', 'pos': pos}

skin = {
    'defs': 'cards/defs.svg',
    'faces': {
        'char': face('char', LAC, 'art-character', backdrop='cards/backdrop.svg', breakY=156),
        'sultan': face('sultan', ['#c9a85a', '#5a4318'], 'art-suleyman', dark=False, backdrop='cards/backdrop.svg', breakY=156),
        'kul': face('kul', LAC, 'art-companion'),
        'intr': face('intr', ['#6b7178', '#2a2e33']),
        'crisis': face('crisis', KARA, 'art-crisis'),
        'kader-h': face('kader-h', HAKI),
        'kader-x': face('kader-x', KARA),
        'hirs': face('hirs', MOR, 'art-hirs'),
        'taraf-s': face('taraf-s', HAKI, 'art-taraf-s'),
        'taraf-h': face('taraf-h', KARA, 'art-taraf-h'),
    },
    'backs': {k: f'cards/back-{k}.svg' for k in ('intr', 'kader', 'taraf', 'hirs', 'kul', 'char', 'crisis')},
    'art': dict(sorted(art.items())),
    'icons': {'dir': 'icons/', 'version': '2'},
    'niche': {
        'path': 'M.5 119.5V28H12V16H24V6H76V16H88V28H99.5V119.5Z',
        'mask': 'M0 120V27H12V15H24V5H76V15H88V27H100V120Z',
        'sultan': 'table/gazi-seat.html',
    },
    'seal': 'table/seal.svg',
    # the Gazi stands only at the centre, at the same scale as the others
    'frieze': [
        {'char': 'barbaros', 'size': 94, 'x': 0}, {'char': 'hurrem', 'size': 94, 'x': 92},
        {'char': 'mustafa', 'size': 96, 'x': 180}, {'char': 'suleyman', 'size': 98, 'x': 272},
        {'char': 'ibrahim', 'size': 96, 'x': 366}, {'char': 'sahsultan', 'size': 94, 'x': 456},
        {'char': 'hatice', 'size': 94, 'x': 546},
    ],
    # D Dorian over an open fifth; the uneven beat range stands in for the aksak 2+2+3 feel
    'music': {'drone': [146.83, 220.0], 'scale': [293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25, 587.33],
              'wave': 'triangle', 'beat': [460, 1380]},
}
with open(os.path.join(MOD, 'skin.json'), 'w') as f:
    json.dump(skin, f, ensure_ascii=False, indent=1)
    f.write('\n')
print(len(art), 'stills wired')
