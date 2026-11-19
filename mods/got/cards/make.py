# Draws the got skin's SVGs: vellum and iron (mods/got/PROPOSAL.md, section 3). Every frame, back and drawn art is
# built here from a few shared pieces, so the set stays one family. Hand-written SVG only; the icons it places come
# from icons/set/ (build them first). Rerun after any change:
#   python3 -I mods/got/cards/make.py
import base64, io, os
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
MOD = os.path.dirname(HERE)

def write(path, body, vb='0 0 500 700', extra=''):
    with open(os.path.join(MOD, path), 'w') as f:
        f.write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}"{extra}>\n{body}\n</svg>\n')

def icon(name, x, y, s, size=144):
    return f'<image href="icons/set/{name}-{size}.png" x="{x}" y="{y}" width="{s}" height="{s}"/>'

# ------------------------------------------------------------------ shared pieces
OUTER = 'M25 13H475Q487 13 487 25V675Q487 687 475 687H25Q13 687 13 675V25Q13 13 25 13ZM37 33H463Q467 33 467 37V663Q467 667 463 667H37Q33 667 33 663V37Q33 33 37 33Z'

def rivets(color='url(#g-rivet)'):
    pts = [(20, y) for y in range(90, 640, 70)] + [(480, y) for y in range(90, 640, 70)]
    pts += [(x, 20) for x in range(110, 400, 70)] + [(x, 680) for x in range(110, 400, 70)]
    return '<g>' + ''.join(f'<use href="#s-rivet" x="{x}" y="{y}"/>' for x, y in pts) + '</g>'

def brackets(fill='url(#g-iron)'):
    # L-shaped iron straps on the four corners, each with two rivets
    one = 'M10 10H96V30H30V96H10Z'
    g = ''.join(f'<path d="{one}" transform="{t}"/>' for t in
                ['', 'translate(500 0) scale(-1 1)', 'translate(0 700) scale(1 -1)', 'translate(500 700) scale(-1 -1)'])
    r = ''.join(f'<use href="#s-rivet" x="{x}" y="{y}"/>' for x, y in
                [(20, 20), (80, 20), (20, 80), (480, 20), (420, 20), (480, 80), (20, 680), (80, 680), (20, 620), (480, 680), (420, 680), (480, 620)])
    return f'<g fill="{fill}" filter="url(#f-bevel)">{g}</g>{r}'

def border(rim='url(#g-iron)', line='url(#g-steel)'):
    return (f'<g filter="url(#f-bevel)"><rect x="7" y="7" width="486" height="686" rx="12" fill="none" stroke="{rim}" stroke-width="12"/>'
            f'<rect x="32" y="32" width="436" height="636" rx="4" fill="none" stroke="{line}" stroke-width="3"/></g>'
            f'<rect x="14" y="14" width="472" height="672" rx="8" fill="none" stroke="#0a0a0b" stroke-width="1.6"/>')

def molding(win, rim='url(#g-iron)', line='#c9b98f'):
    return (f'<g filter="url(#f-bevel)"><path d="{win}" fill="none" stroke="{rim}" stroke-width="11"/></g>'
            f'<path d="{win}" fill="none" stroke="{line}" stroke-width="1.4" opacity=".55"/>')

def nameband(y, cap='url(#g-iron)', stitch='#6b5236'):
    # a vellum strip between two riveted iron end caps
    t, b = y - 30, y + 30
    return (f'<g filter="url(#f-shadow)"><rect x="44" y="{t}" width="412" height="60" rx="3" fill="url(#g-vellum)"/></g>'
            f'<rect x="44" y="{t}" width="412" height="60" rx="3" fill="url(#p-fiber)" opacity=".5"/>'
            f'<path d="M60 {t + 7}H440M60 {b - 7}H440" stroke="{stitch}" stroke-width="1.6" stroke-dasharray="7 5" opacity=".55"/>'
            f'<rect x="44" y="{t}" width="412" height="60" rx="3" fill="none" stroke="#1c1d20" stroke-width="3"/>'
            f'<g fill="{cap}" filter="url(#f-bevel)"><path d="M24 {t - 8}H62V{b + 8}H24L14 {y}Z"/><path d="M476 {t - 8}H438V{b + 8}H476L486 {y}Z"/></g>'
            f'<use href="#s-rivet" x="45" y="{y - 18}"/><use href="#s-rivet" x="45" y="{y + 18}"/><use href="#s-rivet" x="455" y="{y - 18}"/><use href="#s-rivet" x="455" y="{y + 18}"/>')

def slot(disc):
    return (f'<g filter="url(#f-shadow)"><circle r="35" fill="url(#g-iron-r)" filter="url(#f-bevel)"/>'
            f'<circle r="29" fill="{disc}"/><circle r="29" fill="none" stroke="#0a0a0b" stroke-width="1.2"/></g>'
            + ''.join(f'<circle cx="{x}" cy="{y}" r="2.6" fill="#b9bec4"/>' for x, y in [(0, -32), (32, 0), (0, 32), (-32, 0)]))

def slot_small(disc):
    octo = 'M-22 -54H22L54 -22V22L22 54H-22L-54 22V-22Z'
    return f'<g filter="url(#f-shadow)"><path d="{octo}" fill="url(#g-iron-r)" filter="url(#f-bevel)"/><circle r="41" fill="{disc}"/></g>'

def small(edge, cap='url(#g-iron)'):
    y = 612
    return (f'<rect x="20" y="20" width="460" height="660" rx="10" fill="none" stroke="{edge}" stroke-width="14"/>'
            f'<g filter="url(#f-bevel)"><rect x="9" y="9" width="482" height="682" rx="14" fill="none" stroke="url(#g-iron)" stroke-width="18"/>'
            f'<rect x="29" y="29" width="442" height="642" rx="6" fill="none" stroke="url(#g-steel)" stroke-width="5"/></g>'
            f'<g class="sname"><g filter="url(#f-shadow)"><rect x="34" y="566" width="432" height="92" rx="4" fill="url(#g-vellum)"/></g>'
            f'<rect x="34" y="566" width="432" height="92" rx="4" fill="none" stroke="#1c1d20" stroke-width="5"/>'
            f'<g fill="{cap}" filter="url(#f-bevel)"><path d="M14 556H50V668H14Z"/><path d="M486 556H450V668H486Z"/></g></g>')

def face(win, under, frame, top, disc, edge, cap='url(#g-iron)'):
    w = f'<path data-layer="window" d="{win}"/>\n' if win else ''
    return (w + f'<g data-layer="under">{under}</g>\n<g data-layer="frame">{frame}</g>\n<g data-layer="top">{top}</g>\n'
            f'<g data-layer="slot">{slot(disc)}</g>\n<g data-layer="small">{small(edge, cap)}</g>\n<g data-layer="slot-small">{slot_small(disc)}</g>')

def band(pattern, opacity=1):
    return f'<path fill-rule="evenodd" fill="url(#{pattern})" opacity="{opacity}" d="{OUTER}"/>'

LIGHT, DARK = '#f3ead3', '#1c1d20'

# window shapes, all inside x 50..450, y 72..name line
def arch(yb): return f'M50 {yb}V172A200 100 0 0 1 450 172V{yb}Z'
def lintel(yb): return f'M50 {yb}V96L74 72H426L450 96V{yb}Z'
def octagon(yb): return f'M50 {yb}V118L96 72H404L450 118V{yb}Z'

# ------------------------------------------------------------------ defs
def defs():
    def png(path, size=256):
        im = Image.open(os.path.join(MOD, path)).resize((size, size), Image.LANCZOS)
        b = io.BytesIO(); im.save(b, 'PNG'); return base64.b64encode(b.getvalue()).decode()
    return f'''<defs>
<!-- still grade "Red Keep dusk": teal-iron shadows, candle-gold highlights, mixed at 15 % -->
<filter id="grade" color-interpolation-filters="sRGB" x="0" y="0" width="100%" height="100%">
 <feColorMatrix in="SourceGraphic" type="matrix" values=".2126 .7152 .0722 0 0 .2126 .7152 .0722 0 0 .2126 .7152 .0722 0 0 0 0 0 1 0" result="l"/>
 <feComponentTransfer in="l" result="t"><feFuncR type="table" tableValues="0.106 0.30 0.62 0.91"/><feFuncG type="table" tableValues="0.141 0.30 0.55 0.78"/><feFuncB type="table" tableValues="0.157 0.27 0.38 0.54"/></feComponentTransfer>
 <feComponentTransfer in="SourceGraphic" result="s"><feFuncR type="linear" slope=".93" intercept=".02"/><feFuncG type="linear" slope=".93" intercept=".02"/><feFuncB type="linear" slope=".93" intercept=".02"/></feComponentTransfer>
 <feComposite in="t" in2="s" operator="arithmetic" k1="0" k2="0.15" k3="0.85" k4="0"/>
</filter>
<linearGradient id="g-iron" x1="0" y1="0" x2="1" y2="1">
 <stop offset="0" stop-color="#0e0f11"/><stop offset=".18" stop-color="#4a4d52"/><stop offset=".3" stop-color="#7c8188"/><stop offset=".42" stop-color="#2a2c30"/>
 <stop offset=".62" stop-color="#141518"/><stop offset=".8" stop-color="#5a5e64"/><stop offset="1" stop-color="#16171a"/></linearGradient>
<radialGradient id="g-iron-r" cx=".38" cy=".32" r=".8"><stop offset="0" stop-color="#8a8f96"/><stop offset=".45" stop-color="#35383d"/><stop offset="1" stop-color="#0c0d0f"/></radialGradient>
<linearGradient id="g-steel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5d6a76"/><stop offset=".35" stop-color="#c3ccd4"/><stop offset=".6" stop-color="#6e7a86"/><stop offset="1" stop-color="#2b333b"/></linearGradient>
<radialGradient id="g-rivet" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#d9dde2"/><stop offset=".4" stop-color="#5f646b"/><stop offset="1" stop-color="#121315"/></radialGradient>
<linearGradient id="g-gold" x1="0" y1="0" x2="1" y2="1">
 <stop offset="0" stop-color="#5e430e"/><stop offset=".16" stop-color="#c9a23a"/><stop offset=".3" stop-color="#f3dc92"/><stop offset=".46" stop-color="#a8822a"/>
 <stop offset=".64" stop-color="#6e5212"/><stop offset=".8" stop-color="#e2c56a"/><stop offset="1" stop-color="#6a4c10"/></linearGradient>
<linearGradient id="g-vellum" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7efdc"/><stop offset=".55" stop-color="#e9dcbd"/><stop offset="1" stop-color="#d3c29c"/></linearGradient>
<linearGradient id="g-sand" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4e2416"/><stop offset=".25" stop-color="#a65a3c"/><stop offset=".45" stop-color="#d08a64"/><stop offset=".7" stop-color="#8a4630"/><stop offset="1" stop-color="#3a1a10"/></linearGradient>
<linearGradient id="g-oak" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2a1c12"/><stop offset=".5" stop-color="#4a3322"/><stop offset="1" stop-color="#22160d"/></linearGradient>
<linearGradient id="g-wax" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c2382c"/><stop offset=".5" stop-color="#8a1c14"/><stop offset="1" stop-color="#4a0b08"/></linearGradient>
<radialGradient id="g-velvet" cx=".5" cy=".42" r=".75"><stop offset="0" stop-color="#7a1c18"/><stop offset=".6" stop-color="#3e0c0b"/><stop offset="1" stop-color="#160404"/></radialGradient>
<radialGradient id="g-night" cx=".5" cy=".4" r=".8"><stop offset="0" stop-color="#3a4060"/><stop offset=".6" stop-color="#1c1f33"/><stop offset="1" stop-color="#0a0b14"/></radialGradient>
<radialGradient id="g-disc" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#fbf5e6"/><stop offset=".6" stop-color="#e7d9bb"/><stop offset="1" stop-color="#b8a578"/></radialGradient>
<!-- what a Character's cut-out stands in front of: Red Keep stone at dusk, a candle behind the head -->
<linearGradient id="st-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a2a20"/><stop offset=".6" stop-color="#25140f"/><stop offset="1" stop-color="#0e0806"/></linearGradient>
<radialGradient id="st-halo" cx=".5" cy=".28" r=".42"><stop offset="0" stop-color="#e8c88a" stop-opacity=".7"/><stop offset=".5" stop-color="#a65a3c" stop-opacity=".25"/><stop offset="1" stop-color="#a65a3c" stop-opacity="0"/></radialGradient>
<radialGradient id="st-vig" cx=".5" cy=".4" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></radialGradient>
<filter id="f-bevel" x="-8%" y="-8%" width="116%" height="116%" color-interpolation-filters="sRGB">
 <feGaussianBlur in="SourceAlpha" stdDeviation="1.6" result="b"/>
 <feSpecularLighting in="b" surfaceScale="2.4" specularConstant=".9" specularExponent="22" lighting-color="#e9eef2" result="s"><feDistantLight azimuth="225" elevation="42"/></feSpecularLighting>
 <feComposite in="s" in2="SourceAlpha" operator="in" result="si"/>
 <feComposite in="SourceGraphic" in2="si" operator="arithmetic" k1="0" k2="1" k3=".7" k4="0" result="lit"/>
 <feDropShadow in="lit" dx="0" dy="2" stdDeviation="1.6" flood-color="#000" flood-opacity=".6"/></filter>
<filter id="f-shadow" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000" flood-opacity=".5"/></filter>
<filter id="f-rough" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".06" numOctaves="2" seed="3"/><feDisplacementMap in="SourceGraphic" scale="5" xChannelSelector="R" yChannelSelector="G"/></filter>
<!-- patterns -->
<pattern id="p-fiber" width="160" height="160" patternUnits="userSpaceOnUse"><filter id="f-fib"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 .35 0 0 0 0 .25 0 0 0 0 .1 0 0 0 .14 0"/></filter><rect width="160" height="160" filter="url(#f-fib)"/></pattern>
<pattern id="p-chevron" width="24" height="24" patternUnits="userSpaceOnUse"><rect width="24" height="24" fill="#2a1410"/><path d="M0 18L12 6L24 18" fill="none" stroke="#7a3a28" stroke-width="4"/><path d="M0 22L12 10L24 22" fill="none" stroke="#120806" stroke-width="1.2" opacity=".7"/></pattern>
<pattern id="p-ripple" width="40" height="14" patternUnits="userSpaceOnUse"><rect width="40" height="14" fill="#23262a"/><path d="M0 4C10 0 10 8 20 4S30 0 40 4M0 10C10 6 10 14 20 10S30 6 40 10" fill="none" stroke="#8d969f" stroke-width="1.6" opacity=".8"/></pattern>
<pattern id="p-chain" width="28" height="20" patternUnits="userSpaceOnUse"><rect width="28" height="20" fill="#24180e"/><rect x="2" y="5" width="16" height="10" rx="5" fill="none" stroke="#a88a4a" stroke-width="2.6"/><rect x="16" y="7" width="10" height="6" rx="3" fill="none" stroke="#7d848c" stroke-width="2.2"/></pattern>
<pattern id="p-ashlar" width="60" height="30" patternUnits="userSpaceOnUse"><rect width="60" height="30" fill="#9a5236"/><path d="M0 .5H60M0 15.5H60M.5 0V15M30.5 15V30" stroke="#5a2a1a" stroke-width="1.6"/><rect width="60" height="30" fill="url(#p-fiber)" opacity=".6"/></pattern>
<pattern id="p-ashlar-faint" width="60" height="30" patternUnits="userSpaceOnUse"><path d="M0 .5H60M0 15.5H60M.5 0V15M30.5 15V30" stroke="#000" stroke-width="1" opacity=".16"/></pattern>
<pattern id="p-feather" width="30" height="40" patternUnits="userSpaceOnUse"><rect width="30" height="40" fill="#121318"/><path d="M15 2C25 12 25 26 15 38C5 26 5 12 15 2Z" fill="#20232c"/><path d="M15 4V38" stroke="#3a3f4d" stroke-width="1.2"/><path d="M15 12L9 8M15 18L8 13M15 24L8 19M15 12L21 8M15 18L22 13M15 24L22 19" stroke="#2e323d" stroke-width="1"/></pattern>
<pattern id="p-mail" width="12" height="10" patternUnits="userSpaceOnUse"><circle cx="6" cy="5" r="4" fill="none" stroke="#000" stroke-width="1" opacity=".22"/><circle cx="0" cy="0" r="4" fill="none" stroke="#000" stroke-width="1" opacity=".22"/><circle cx="12" cy="0" r="4" fill="none" stroke="#000" stroke-width="1" opacity=".22"/><circle cx="0" cy="10" r="4" fill="none" stroke="#000" stroke-width="1" opacity=".22"/><circle cx="12" cy="10" r="4" fill="none" stroke="#000" stroke-width="1" opacity=".22"/></pattern>
<pattern id="p-vine" width="36" height="44" patternUnits="userSpaceOnUse"><rect width="36" height="44" fill="#2a0c16"/><path d="M0 22C9 12 27 32 36 22" fill="none" stroke="#3e5a2a" stroke-width="2"/><g fill="#5a1a3a"><circle cx="12" cy="28" r="3.2"/><circle cx="18" cy="28" r="3.2"/><circle cx="15" cy="33" r="3.2"/><circle cx="21" cy="33" r="3.2"/><circle cx="18" cy="38" r="3.2"/></g><path d="M26 14c4-4 8-2 8 2-4 0-6 2-8-2z" fill="#3e5a2a"/></pattern>
<pattern id="p-rungs" width="20" height="44" patternUnits="userSpaceOnUse"><rect width="20" height="44" fill="#1e2036"/><rect y="18" width="20" height="8" fill="#5c5f7c"/><rect y="18" width="20" height="2" fill="#9aa0c8" opacity=".6"/></pattern>
<!-- small parts -->
<symbol id="s-rivet" viewBox="-6 -6 12 12" x="-6" y="-6" width="12" height="12" overflow="visible"><circle r="5" fill="url(#g-rivet)"/><circle r="5" fill="none" stroke="#08090a" stroke-width=".8"/></symbol>
<symbol id="s-blade" viewBox="-9 -150 18 150" overflow="visible"><path d="M0 -150L8 -128V0H-8V-128Z"/></symbol>
<symbol id="s-crown" viewBox="0 0 256 256"><mask id="m-crown" style="mask-type:alpha"><image width="256" height="256" href="data:image/png;base64,{png('icons/masks/ferman.png', 128)}"/></mask><rect width="256" height="256" mask="url(#m-crown)"/></symbol>
<symbol id="s-stag" viewBox="0 0 256 256"><mask id="m-stag" style="mask-type:alpha"><image width="256" height="256" href="data:image/png;base64,{png('icons/masks/loyalty.png')}"/></mask><rect width="256" height="256" mask="url(#m-stag)"/></symbol>
</defs>'''

# ------------------------------------------------------------------ faces
def char_face(sultan=False):
    yb = 350
    win = arch(yb)
    rim = 'url(#g-gold)' if sultan else 'url(#g-iron)'
    under = band('p-chevron') + '<rect x="35" y="35" width="430" height="630" fill="url(#p-ashlar-faint)"/>'
    if sultan:
        # the Iron Throne's back: a fan of fused blades rising out of the arch
        blades = ''.join(f'<use href="#s-blade" x="0" y="0" transform="translate(250 196) rotate({a}) scale({0.9 + 0.25 * (1 - abs(a) / 80):.2f})"/>'
                         for a in range(-80, 81, 10))
        under += f'<g fill="url(#g-iron)" stroke="url(#g-gold)" stroke-width="1.6" filter="url(#f-bevel)" opacity=".95">{blades}</g>'
    frame = border(rim) + molding(win, rim) + brackets('url(#g-gold)' if sultan else 'url(#g-iron)') + rivets()
    frame += '<path d="M250 660l12 12-12 12-12-12z" fill="url(#g-steel)" filter="url(#f-bevel)"/>'
    top = nameband(yb, 'url(#g-gold)' if sultan else 'url(#g-iron)')
    return face(win, under, frame, top, LIGHT if sultan else DARK, '#c9a23a' if sultan else '#5a2a1c')

def plain_face(win, yb, pattern, edge, disc, rim='url(#g-iron)', extra_under='', extra_frame='', extra_top='', cap='url(#g-iron)'):
    under = band(pattern) + '<rect x="35" y="35" width="430" height="630" fill="url(#p-ashlar-faint)" opacity=".7"/>' + extra_under
    frame = border(rim) + (molding(win, rim) if win else '') + brackets(rim) + rivets() + extra_frame
    return face(win, under, frame, nameband(yb, cap) + extra_top, disc, edge, cap)

def crisis_face():
    yb = 380
    # stone battlements across the top, over the picture
    merlons = ''.join(f'<rect x="{x}" y="30" width="44" height="34"/>' for x in range(36, 460, 80))
    frame = (border('url(#g-sand)', '#e0a27c') + brackets('url(#g-sand)') +
             f'<g fill="url(#g-sand)" filter="url(#f-bevel)"><rect x="30" y="20" width="440" height="16"/>{merlons}</g>'
             f'<g fill="url(#p-ashlar)" opacity=".55"><rect x="30" y="20" width="440" height="16"/>{merlons}</g>')
    under = band('p-ashlar')
    return face(None, under, frame, nameband(yb, 'url(#g-sand)'), DARK, '#8a4630', 'url(#g-sand)')

def kader_face(broken):
    # a cup card: a goblet-shaped window (a round bowl on a stem) on a band of vines
    yb = 380
    win = f'M50 {yb}V200C50 120 120 72 250 72C380 72 450 120 450 200V{yb}Z'
    edge = '#4a0f2a' if broken else '#6a1a22'
    return plain_face(win, yb, 'p-vine', edge, DARK)

def hirs_face():
    yb = 380
    win = arch(yb)
    rails = ('<rect x="15" y="40" width="20" height="620" fill="url(#p-rungs)"/><rect x="465" y="40" width="20" height="620" fill="url(#p-rungs)"/>'
             '<rect x="15" y="40" width="3" height="620" fill="#9aa0c8" opacity=".5"/><rect x="482" y="40" width="3" height="620" fill="#9aa0c8" opacity=".5"/>')
    return plain_face(win, yb, 'p-feather', '#2f3352', DARK, extra_under=rails)

def taraf_face(traitor):
    yb = 380
    win = arch(yb)
    line = '#e58b78' if traitor else '#e9eef2'
    extra = f'<path d="{win}" fill="none" stroke="{line}" stroke-width="2.4" opacity=".75" transform="translate(250 226) scale(.975) translate(-250 -226)"/>'
    return plain_face(win, yb, 'p-chevron' if traitor else 'p-mail', '#4e0e0c' if traitor else '#3a5a48', DARK, extra_frame=extra)

# ------------------------------------------------------------------ backs
def back_frame(rim='url(#g-iron)'):
    return border(rim) + brackets(rim) + rivets()

def medallion(name, r=92, disc='url(#g-disc)', cy=320):
    return (f'<g transform="translate(250 {cy})" filter="url(#f-shadow)"><circle r="{r + 12}" fill="url(#g-iron-r)" filter="url(#f-bevel)"/>'
            f'<circle r="{r}" fill="{disc}"/><circle r="{r}" fill="none" stroke="#0a0a0b" stroke-width="2"/></g>'
            + ''.join(f'<use href="#s-rivet" x="{250 + (r + 6) * c:.1f}" y="{cy + (r + 6) * s:.1f}"/>' for c, s in [(1, 0), (-1, 0), (0, 1), (0, -1), (.707, .707), (-.707, .707), (.707, -.707), (-.707, -.707)])
            + icon(name, 250 - r * .78, cy - r * .78, r * 1.56))

def plate(y=588):
    return (f'<g class="bplate"><g filter="url(#f-shadow)"><rect x="140" y="{y - 26}" width="220" height="52" rx="3" fill="url(#g-vellum)"/></g>'
            f'<rect x="140" y="{y - 26}" width="220" height="52" rx="3" fill="none" stroke="#1c1d20" stroke-width="3"/>'
            f'<g fill="url(#g-iron)" filter="url(#f-bevel)"><path d="M126 {y - 32}H150V{y + 32}H126L118 {y}Z"/><path d="M374 {y - 32}H350V{y + 32}H374L382 {y}Z"/></g></g>')

def stag_seal(cx, cy, r, wax='url(#g-wax)', mark='#3a0806'):
    # the King's seal: a round wax impression with a beaded rim and the crowned stag (the King's Peace mask)
    beads = ''.join(f'<circle cx="{cx + (r - 9) * __import__("math").cos(a / 36 * 6.2832):.1f}" cy="{cy + (r - 9) * __import__("math").sin(a / 36 * 6.2832):.1f}" r="2.6"/>' for a in range(36))
    s = r * 1.15
    return (f'<g filter="url(#f-shadow)"><circle cx="{cx}" cy="{cy}" r="{r + 6}" fill="{wax}" filter="url(#f-rough)"/></g>'
            f'<circle cx="{cx}" cy="{cy}" r="{r - 3}" fill="none" stroke="{mark}" stroke-width="2" opacity=".6"/>'
            f'<g fill="{mark}" opacity=".55">{beads}</g>'
            f'<use href="#s-stag" x="{cx - s / 2}" y="{cy - s / 2 + r * .12}" width="{s}" height="{s}" fill="{mark}" opacity=".8"/>'
            f'<use href="#s-crown" x="{cx - r * .22}" y="{cy - r * .5}" width="{r * .44}" height="{r * .44}" fill="{mark}" opacity=".8"/>')

def backs():
    write('cards/back-char.svg', '<rect width="500" height="700" fill="url(#g-velvet)"/><rect width="500" height="700" fill="url(#p-mail)" opacity=".5"/>'
          + medallion('suleyman', 100) + plate() + back_frame())
    write('cards/back-kul.svg', '<rect width="500" height="700" fill="url(#p-chain)"/><rect width="500" height="700" fill="#1a1008" opacity=".35"/>'
          + medallion('companion', 90) + plate() + back_frame())
    write('cards/back-intr.svg', '<rect width="500" height="700" fill="url(#g-oak)"/><rect width="500" height="700" fill="url(#p-fiber)" opacity=".7"/>'
          '<rect x="60" y="0" width="34" height="700" fill="url(#p-ripple)"/><rect x="406" y="0" width="34" height="700" fill="url(#p-ripple)"/>'
          + medallion('intrigue', 92, cy=300) + back_frame())
    write('cards/back-crisis.svg', '<rect width="500" height="700" fill="url(#p-ashlar)"/><rect width="500" height="700" fill="#2a0e08" opacity=".35"/>'
          + stag_seal(250, 190, 84) + medallion('crisis', 70, cy=400) + plate() + back_frame('url(#g-sand)'))
    write('cards/back-kader.svg', '<rect width="500" height="700" fill="url(#p-vine)"/><rect width="500" height="700" fill="url(#g-velvet)" opacity=".35"/>' + medallion('kader', 92) + plate() + back_frame())
    rungs = ''.join(f'<rect x="170" y="{y}" width="160" height="12" rx="2"/>' for y in range(70, 660, 52))
    write('cards/back-hirs.svg', '<rect width="500" height="700" fill="url(#g-night)"/><rect width="500" height="700" fill="url(#p-feather)" opacity=".25"/>'
          f'<g fill="url(#g-iron)" filter="url(#f-bevel)"><rect x="160" y="40" width="16" height="620"/><rect x="324" y="40" width="16" height="620"/>{rungs}</g>'
          + medallion('ambition', 82) + plate() + back_frame())
    write('cards/back-taraf.svg', '<rect width="500" height="700" fill="url(#g-vellum)"/><rect width="500" height="700" fill="url(#p-fiber)"/>'
          '<path d="M40 40L250 330L460 40" fill="none" stroke="#b8a578" stroke-width="3"/>'
          '<path d="M232 300V660M268 300V660" stroke="#7a1c18" stroke-width="10"/>'
          '<g fill="url(#g-iron)" filter="url(#f-bevel)"><path d="M244 40H256V250H244Z"/><path d="M200 250H300V264H200Z"/><circle cx="250" cy="282" r="10"/></g>'
          + stag_seal(250, 340, 62) + plate(600) + back_frame())

# ------------------------------------------------------------------ drawn art (400 x 350, sliced)
def art(path, body):
    write(path, body, '0 0 400 350', ' preserveAspectRatio="xMidYMid slice"')

def drawn_art():
    def disc_icon(name, ground, r=96):
        return (f'<rect x="-40" y="-40" width="480" height="430" fill="{ground}"/>'
                f'<g filter="url(#f-shadow)"><circle cx="200" cy="176" r="{r + 12}" fill="url(#g-iron-r)" filter="url(#f-bevel)"/><circle cx="200" cy="176" r="{r}" fill="url(#g-disc)"/></g>'
                + icon(name, 200 - r * .78, 176 - r * .78, r * 1.56))
    art('cards/art-character.svg', disc_icon('character', 'url(#g-velvet)'))
    art('cards/art-suleyman.svg', disc_icon('suleyman', 'url(#g-velvet)'))
    art('cards/art-companion.svg', disc_icon('companion', 'url(#p-chain)'))
    art('cards/art-crisis.svg', disc_icon('crisis', 'url(#p-ashlar)'))
    art('cards/art-hirs.svg', '<rect x="-40" y="-40" width="480" height="430" fill="url(#g-night)"/>'
        '<g fill="url(#g-iron)" stroke="#9aa0c8" stroke-width="1.4">'
        + ''.join(f'<use href="#s-blade" transform="translate({200 + dx} {360 - i * 40}) scale(.4)"/>' for i in range(9) for dx in (-120, 120))
        + '</g>' + ''.join(f'<rect x="80" y="{338 - i * 40}" width="240" height="7" fill="url(#g-iron)"/>' for i in range(9))
        + '<g filter="url(#f-shadow)"><circle cx="200" cy="176" r="86" fill="url(#g-iron-r)" filter="url(#f-bevel)"/><circle cx="200" cy="176" r="74" fill="url(#g-disc)"/></g>'
        + icon('ambition', 142, 118, 116))
    shield = 'M200 34L296 64V160C296 236 252 278 200 304C148 278 104 236 104 160V64Z'
    inner = 'M200 56L276 80V160C276 220 242 254 200 276C158 254 124 220 124 160V80Z'
    art('cards/art-taraf-s.svg', '<rect x="-40" y="-40" width="480" height="430" fill="#2e5b3e"/><rect x="-40" y="-40" width="480" height="430" fill="url(#p-mail)"/>'
        f'<g filter="url(#f-shadow)"><path d="{shield}" fill="url(#g-steel)" filter="url(#f-bevel)"/><path d="{inner}" fill="#f3ead3"/></g>'
        + icon('loyalist', 130, 96, 140))
    art('cards/art-taraf-h.svg', '<rect x="-40" y="-40" width="480" height="430" fill="#4e0e0c"/><rect x="-40" y="-40" width="480" height="430" fill="url(#p-chevron)" opacity=".35"/>'
        '<g fill="none" stroke="url(#g-iron)" stroke-width="12"><rect x="24" y="150" width="70" height="40" rx="20"/><rect x="306" y="150" width="70" height="40" rx="20" transform="rotate(14 340 170)"/></g>'
        f'<g filter="url(#f-shadow)"><path d="{shield}" fill="url(#g-iron)" filter="url(#f-bevel)"/><path d="{inner}" fill="#f3ead3"/></g>'
        + icon('traitor', 130, 96, 140))
    write('cards/backdrop.svg', '<rect width="400" height="310" fill="url(#st-bg)"/><rect width="400" height="310" fill="url(#p-ashlar-faint)"/>'
          '<rect width="400" height="310" fill="url(#st-halo)"/><rect width="400" height="310" fill="url(#st-vig)"/>', '0 0 400 310', ' preserveAspectRatio="xMidYMid slice"')

# ------------------------------------------------------------------ table
def table():
    os.makedirs(os.path.join(MOD, 'table'), exist_ok=True)
    # the Judgment seal stands alone as an image, so it carries its own defs
    seal_defs = defs().replace('<defs>', '<defs>', 1)
    write('table/seal.svg', seal_defs + stag_seal(200, 200, 170, 'url(#g-gold)', '#3a2a06'), '0 0 400 400', ' width="400" height="400"')
    blades = ''.join(f'<use href="#s-blade" transform="translate(50 52) rotate({a}) scale({0.28 + 0.07 * (1 - abs(a) / 75):.3f} {0.36 + 0.1 * (1 - abs(a) / 75):.3f})"/>'
                     for a in range(-75, 76, 15))
    with open(os.path.join(MOD, 'table/king-seat.html'), 'w') as f:
        f.write('<svg viewBox="0 0 100 120" preserveAspectRatio="none" class="throne" aria-hidden="true">'
                f'<g class="bl">{blades}</g>'
                '<path class="rim" d="M-3 120V50A53 53 0 0 1 103 50V120"/><path class="ln" d="M6 120V51A44 44 0 0 1 94 51V120"/>'
                '<path class="st" d="M-6 112H106V120H-6Z"/></svg>\n')

if __name__ == '__main__':
    os.makedirs(os.path.join(MOD, 'cards'), exist_ok=True)
    with open(os.path.join(HERE, 'defs.svg'), 'w') as f:
        f.write('<svg xmlns="http://www.w3.org/2000/svg">\n' + defs() + '\n</svg>\n')
    write('cards/char.svg', char_face())
    write('cards/sultan.svg', char_face(sultan=True))
    write('cards/kul.svg', plain_face(lintel(380), 380, 'p-chain', '#5a3d22', DARK, rim='url(#g-iron)'))
    write('cards/intr.svg', plain_face(octagon(380), 380, 'p-ripple', '#3b2a1d', DARK))
    write('cards/crisis.svg', crisis_face())
    write('cards/kader-h.svg', kader_face(False))
    write('cards/kader-x.svg', kader_face(True))
    write('cards/hirs.svg', hirs_face())
    write('cards/taraf-s.svg', taraf_face(False))
    write('cards/taraf-h.svg', taraf_face(True))
    backs(); drawn_art(); table()
    print('got skin drawn')
