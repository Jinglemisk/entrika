# Draws the cumhuriyet skin's SVGs: newsprint and bakelite, brass rules, Onuncu Yıl sunbursts and stepped Deco
# corners (mods/cumhuriyet/PROPOSAL.md, section 3). Every frame, back and drawn art is built here from a few shared
# pieces, so the set stays one family. Hand-written SVG only; the icons it places come from icons/set/ (build them
# first with art/icons/build.py). No flag, no crescent and star, no likeness of anyone anywhere in this file.
#   python3 -I mods/cumhuriyet/cards/make.py
import base64, io, math, os
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
MOD = os.path.dirname(HERE)

PAPER, INK, BAKALIT = '#eee6d3', '#1e1c19', '#2a1e18'
AL, LAC, HAKI, TASI, MOR, KARA, KURSUN = '#b3221f', '#23406e', '#556b2f', '#a0624d', '#4f3b78', '#2b2522', '#5a6168'

def write(path, body, vb='0 0 500 700', extra=''):
    with open(os.path.join(MOD, path), 'w') as f:
        f.write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}"{extra}>\n{body}\n</svg>\n')

def icon(name, x, y, s, size=144):
    return f'<image href="icons/set/{name}-{size}.png" x="{x:.1f}" y="{y:.1f}" width="{s:.1f}" height="{s:.1f}"/>'

def chamfer(x0, y0, x1, y1, c):
    return f'M{x0 + c} {y0}H{x1 - c}L{x1} {y0 + c}V{y1 - c}L{x1 - c} {y1}H{x0 + c}L{x0} {y1 - c}V{y0 + c}Z'

OUTER = chamfer(13, 13, 487, 687, 22) + chamfer(33, 33, 467, 667, 12)

# ------------------------------------------------------------------ shared pieces
def border(rim='url(#g-brass)', line='url(#g-brass-v)'):
    return (f'<path d="{chamfer(8, 8, 492, 692, 26)}" fill="none" stroke="{rim}" stroke-width="11" filter="url(#f-bevel)"/>'
            f'<path d="{chamfer(30, 30, 470, 670, 13)}" fill="none" stroke="{line}" stroke-width="3"/>'
            f'<path d="{chamfer(15, 15, 485, 685, 21)}" fill="none" stroke="{INK}" stroke-width="1.4" opacity=".7"/>')

def corners(fill='url(#g-brass)'):
    # stepped Deco corner blocks: three nested steps on each corner
    one = 'M30 30H92V40H50V52H40V92H30Z M50 52H72V60H58V72H50Z'
    g = ''.join(f'<path d="{one}" transform="{t}"/>' for t in
                ['', 'translate(500 0) scale(-1 1)', 'translate(0 700) scale(1 -1)', 'translate(500 700) scale(-1 -1)'])
    return f'<g fill="{fill}" fill-rule="evenodd" filter="url(#f-bevel)">{g}</g>'

def studs():
    pts = [(250, 20), (250, 680), (20, 350), (480, 350)]
    return ''.join(f'<use href="#s-stud" x="{x}" y="{y}"/>' for x, y in pts)

def molding(win, rim='url(#g-brass)', line=PAPER):
    return (f'<path d="{win}" fill="none" stroke="{rim}" stroke-width="10" filter="url(#f-bevel)"/>'
            f'<path d="{win}" fill="none" stroke="{line}" stroke-width="1.2" opacity=".5"/>')

def nameband(y, rim='url(#g-brass)'):
    # an engraved plaque: chamfered ends, paper face, brass rim, three Deco bars at each end
    t, b = y - 30, y + 30
    plate = f'M64 {t}H436L456 {y}L436 {b}H64L44 {y}Z'
    bars = ''.join(f'<rect x="{x}" y="{y - h / 2}" width="5" height="{h}"/>' for x, h in [(22, 18), (30, 30), (38, 42)])
    bars += ''.join(f'<rect x="{500 - x - 5}" y="{y - h / 2}" width="5" height="{h}"/>' for x, h in [(22, 18), (30, 30), (38, 42)])
    return (f'<g filter="url(#f-shadow)"><path d="{plate}" fill="url(#g-paper)"/></g>'
            f'<path d="{plate}" fill="url(#p-grain)" opacity=".6"/>'
            f'<path d="M70 {t + 7}H430M70 {b - 7}H430" stroke="{INK}" stroke-width="1" opacity=".35"/>'
            f'<path d="{plate}" fill="none" stroke="{rim}" stroke-width="4" filter="url(#f-bevel)"/>'
            f'<g fill="{rim}" filter="url(#f-bevel)">{bars}</g>')

def slot(disc):
    # a round lapel badge: brass rim, enamel disc
    return (f'<g filter="url(#f-shadow)"><circle r="35" fill="url(#g-brass-r)" filter="url(#f-bevel)"/>'
            f'<circle r="28" fill="{disc}"/><circle r="28" fill="none" stroke="{INK}" stroke-width="1.2"/>'
            f'<circle r="31.5" fill="none" stroke="{PAPER}" stroke-width=".8" opacity=".5"/></g>')

def slot_small(disc):
    return f'<g filter="url(#f-shadow)"><path d="{chamfer(-54, -54, 54, 54, 18)}" fill="url(#g-brass-r)" filter="url(#f-bevel)"/><circle r="41" fill="{disc}"/></g>'

def small(edge, rim='url(#g-brass)'):
    return (f'<path d="{chamfer(20, 20, 480, 680, 18)}" fill="none" stroke="{edge}" stroke-width="14"/>'
            f'<path d="{chamfer(9, 9, 491, 691, 26)}" fill="none" stroke="{rim}" stroke-width="17" filter="url(#f-bevel)"/>'
            f'<path d="{chamfer(29, 29, 471, 671, 14)}" fill="none" stroke="url(#g-brass-v)" stroke-width="4"/>'
            f'<g class="sname"><g filter="url(#f-shadow)"><path d="{chamfer(34, 566, 466, 658, 14)}" fill="url(#g-paper)"/></g>'
            f'<path d="{chamfer(34, 566, 466, 658, 14)}" fill="none" stroke="{rim}" stroke-width="5"/></g>')

def face(win, under, frame, top, disc, edge):
    w = f'<path data-layer="window" d="{win}"/>\n' if win else ''
    return (w + f'<g data-layer="under">{under}</g>\n<g data-layer="frame">{frame}</g>\n<g data-layer="top">{top}</g>\n'
            f'<g data-layer="slot">{slot(disc)}</g>\n<g data-layer="small">{small(edge)}</g>\n<g data-layer="slot-small">{slot_small(disc)}</g>')

def band(pattern, opacity=1):
    return f'<path fill-rule="evenodd" fill="url(#{pattern})" opacity="{opacity}" d="{OUTER}"/>'

def sunburst(cx, cy, n=28, fill='url(#g-brass)', opacity=1, r0=0, scale=1):
    rays = ''.join(f'<use href="#s-ray" transform="translate({cx} {cy}) rotate({i * 360 / n:.2f}) scale({scale})"/>' for i in range(n))
    return f'<g fill="{fill}" opacity="{opacity}">{rays}</g>'

LIGHT, DARK = PAPER, BAKALIT

# window shapes, all inside x 50..450, y 72..name line
def ziggurat(yb): return f'M50 {yb}V156H80V128H112V100H148V72H352V100H388V128H420V156H450V{yb}Z'
def clipped(yb): return f'M50 {yb}V104L82 72H418L450 104V{yb}Z'
def rect(yb, top=72): return f'M50 {yb}V{top}H450V{yb}Z'

# ------------------------------------------------------------------ defs
def defs():
    def png(path, size=256):
        im = Image.open(os.path.join(MOD, path)).resize((size, size), Image.LANCZOS)
        b = io.BytesIO(); im.save(b, 'PNG'); return base64.b64encode(b.getvalue()).decode()
    return f'''<defs>
<!-- still grade: a full sepia-silver tritone (shadow {INK}, mid #7c6b55, highlight #f0e7d3) with the shadows opened a
     little, so black-and-white prints, Gallica scans and the dark Kahn autochromes read as one set -->
<filter id="grade" color-interpolation-filters="sRGB" x="0" y="0" width="100%" height="100%">
 <feColorMatrix in="SourceGraphic" type="matrix" values=".2126 .7152 .0722 0 0 .2126 .7152 .0722 0 0 .2126 .7152 .0722 0 0 0 0 0 1 0" result="l"/>
 <feComponentTransfer in="l" result="g"><feFuncR type="gamma" exponent=".82" amplitude="1.04" offset="0"/><feFuncG type="gamma" exponent=".82" amplitude="1.04" offset="0"/><feFuncB type="gamma" exponent=".82" amplitude="1.04" offset="0"/></feComponentTransfer>
 <feComponentTransfer in="g"><feFuncR type="table" tableValues="0.118 0.32 0.486 0.74 0.941"/><feFuncG type="table" tableValues="0.110 0.29 0.420 0.69 0.906"/><feFuncB type="table" tableValues="0.098 0.25 0.333 0.60 0.827"/></feComponentTransfer>
</filter>
<linearGradient id="g-brass" x1="0" y1="0" x2="1" y2="1">
 <stop offset="0" stop-color="#5a4318"/><stop offset=".18" stop-color="#b08d45"/><stop offset=".32" stop-color="#e6cf8f"/><stop offset=".46" stop-color="#9c7a36"/>
 <stop offset=".64" stop-color="#6e5420"/><stop offset=".8" stop-color="#d2b56e"/><stop offset="1" stop-color="#5e4719"/></linearGradient>
<linearGradient id="g-brass-v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e6cf8f"/><stop offset=".4" stop-color="#b08d45"/><stop offset=".75" stop-color="#7a5e26"/><stop offset="1" stop-color="#d2b56e"/></linearGradient>
<radialGradient id="g-brass-r" cx=".38" cy=".32" r=".8"><stop offset="0" stop-color="#f0dca0"/><stop offset=".45" stop-color="#a8853e"/><stop offset="1" stop-color="#4a3712"/></radialGradient>
<linearGradient id="g-paper" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6f0e2"/><stop offset=".55" stop-color="{PAPER}"/><stop offset="1" stop-color="#d8cbaf"/></linearGradient>
<radialGradient id="g-bakalit" cx=".5" cy=".35" r=".85"><stop offset="0" stop-color="#4a362b"/><stop offset=".6" stop-color="{BAKALIT}"/><stop offset="1" stop-color="#140d0a"/></radialGradient>
<radialGradient id="g-al" cx=".5" cy=".4" r=".8"><stop offset="0" stop-color="#c8352f"/><stop offset=".65" stop-color="{AL}"/><stop offset="1" stop-color="#5e100e"/></radialGradient>
<radialGradient id="g-lac" cx=".5" cy=".35" r=".85"><stop offset="0" stop-color="#36578c"/><stop offset=".6" stop-color="{LAC}"/><stop offset="1" stop-color="#0e1a2e"/></radialGradient>
<radialGradient id="g-haki" cx=".5" cy=".35" r=".85"><stop offset="0" stop-color="#6e8640"/><stop offset=".6" stop-color="{HAKI}"/><stop offset="1" stop-color="#222b12"/></radialGradient>
<radialGradient id="g-kara" cx=".5" cy=".35" r=".85"><stop offset="0" stop-color="#4a403a"/><stop offset=".6" stop-color="{KARA}"/><stop offset="1" stop-color="#0d0b0a"/></radialGradient>
<radialGradient id="g-mor" cx=".5" cy=".35" r=".85"><stop offset="0" stop-color="#6a5596"/><stop offset=".6" stop-color="{MOR}"/><stop offset="1" stop-color="#1c1430"/></radialGradient>
<radialGradient id="g-disc" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#fbf7ee"/><stop offset=".6" stop-color="{PAPER}"/><stop offset="1" stop-color="#c9b994"/></radialGradient>
<!-- what a Character's cut-out stands in front of: a studio paper backdrop with a soft light behind the head -->
<linearGradient id="st-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5e5446"/><stop offset=".6" stop-color="#3a3229"/><stop offset="1" stop-color="#1c1712"/></linearGradient>
<radialGradient id="st-halo" cx=".5" cy=".28" r=".45"><stop offset="0" stop-color="#f0e7d3" stop-opacity=".6"/><stop offset=".5" stop-color="#b08d45" stop-opacity=".2"/><stop offset="1" stop-color="#b08d45" stop-opacity="0"/></radialGradient>
<radialGradient id="st-vig" cx=".5" cy=".4" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".5"/></radialGradient>
<filter id="f-bevel" x="-8%" y="-8%" width="116%" height="116%" color-interpolation-filters="sRGB">
 <feGaussianBlur in="SourceAlpha" stdDeviation="1.4" result="b"/>
 <feSpecularLighting in="b" surfaceScale="2" specularConstant=".85" specularExponent="24" lighting-color="#fff4d6" result="s"><feDistantLight azimuth="225" elevation="45"/></feSpecularLighting>
 <feComposite in="s" in2="SourceAlpha" operator="in" result="si"/>
 <feComposite in="SourceGraphic" in2="si" operator="arithmetic" k1="0" k2="1" k3=".6" k4="0" result="lit"/>
 <feDropShadow in="lit" dx="0" dy="1.6" stdDeviation="1.2" flood-color="#000" flood-opacity=".5"/></filter>
<filter id="f-shadow" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#000" flood-opacity=".45"/></filter>
<filter id="f-ink" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="7" result="t"/><feDisplacementMap in="SourceGraphic" in2="t" scale="2.4" xChannelSelector="R" yChannelSelector="G"/></filter>
<!-- patterns -->
<pattern id="p-grain" width="160" height="160" patternUnits="userSpaceOnUse"><filter id="f-grn"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 .3 0 0 0 0 .24 0 0 0 0 .15 0 0 0 .13 0"/></filter><rect width="160" height="160" filter="url(#f-grn)"/></pattern>
<pattern id="p-speed" width="20" height="10" patternUnits="userSpaceOnUse"><path d="M0 2.5H20M0 6.5H20" stroke="#e6cf8f" stroke-width="1.2" opacity=".32"/></pattern>
<pattern id="p-guilloche" width="40" height="16" patternUnits="userSpaceOnUse"><path d="M0 8C10 0 10 16 20 8S30 0 40 8M0 4C10 -4 10 12 20 4S30 -4 40 4M0 12C10 4 10 20 20 12S30 4 40 12" fill="none" stroke="#e6cf8f" stroke-width=".9" opacity=".38"/></pattern>
<pattern id="p-halftone" width="8" height="8" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.5" fill="{INK}" opacity=".22"/><circle cx="6" cy="6" r="1.5" fill="{INK}" opacity=".22"/></pattern>
<pattern id="p-rule" width="40" height="24" patternUnits="userSpaceOnUse"><path d="M0 23.5H40" stroke="{MOR}" stroke-width="1" opacity=".35"/></pattern>
<pattern id="p-steps" width="28" height="14" patternUnits="userSpaceOnUse"><path d="M0 12H5V8H9V4H19V8H23V12H28" fill="none" stroke="#e6cf8f" stroke-width="1.3" opacity=".4"/></pattern>
<pattern id="p-perf" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="11" cy="11" r="5" fill="{BAKALIT}" opacity=".85"/></pattern>
<!-- small parts -->
<symbol id="s-stud" viewBox="-7 -7 14 14" x="-7" y="-7" width="14" height="14" overflow="visible"><rect x="-6" y="-6" width="12" height="12" transform="rotate(45)" fill="url(#g-brass-r)"/><rect x="-6" y="-6" width="12" height="12" transform="rotate(45)" fill="none" stroke="{INK}" stroke-width=".8"/></symbol>
<path id="s-ray" d="M-9 0L0 -400L9 0Z"/>
<symbol id="s-rostrum" viewBox="0 0 256 256"><mask id="m-rostrum" style="mask-type:alpha"><image width="256" height="256" href="data:image/png;base64,{png('icons/masks/divan.png')}"/></mask><rect width="256" height="256" mask="url(#m-rostrum)"/></symbol>
<symbol id="s-sun" viewBox="0 0 256 256"><mask id="m-sun" style="mask-type:alpha"><image width="256" height="256" href="data:image/png;base64,{png('icons/masks/loyalist.png')}"/></mask><rect width="256" height="256" mask="url(#m-sun)"/></symbol>
</defs>'''

# ------------------------------------------------------------------ faces
def char_face(sultan=False):
    yb = 350
    win = ziggurat(yb)
    under = band('p-speed') + '<rect x="35" y="35" width="430" height="630" fill="url(#p-grain)" opacity=".5"/>'
    if sultan:
        # a brass sunburst rising behind the portrait, Onuncu Yıl poster fashion; no flag, no emblem
        under += f'<g clip-path="url(#c-sultan)"><clipPath id="c-sultan"><path d="{OUTER}" fill-rule="evenodd"/></clipPath>' \
                 + sunburst(250, 230, 36, 'url(#g-brass)', .55) + '</g>'
    frame = border() + molding(win) + corners() + studs()
    frame += f'<path d="M232 676H268L262 686H238Z" fill="url(#g-brass)" filter="url(#f-bevel)"/>'
    top = nameband(yb)
    return face(win, under, frame, top, LIGHT if sultan else DARK, '#b08d45' if sultan else LAC)

def plain_face(win, yb, pattern, edge, disc, extra_under='', extra_frame='', extra_top='', rim='url(#g-brass)'):
    under = band(pattern) + '<rect x="35" y="35" width="430" height="630" fill="url(#p-grain)" opacity=".5"/>' + extra_under
    frame = border(rim) + (molding(win, rim) if win else '') + corners(rim) + studs() + extra_frame
    return face(win, under, frame, nameband(yb, rim) + extra_top, disc, edge)

def kul_face():
    # an identity card: the photo held by four brass photo corners, a perforated stamp edge down both sides
    yb = 380
    win = rect(yb)
    tri = 'M44 66H92L44 114Z'
    mounts = ''.join(f'<path d="{tri}" transform="{t}"/>' for t in
                     ['', 'translate(500 0) scale(-1 1)', f'translate(0 {yb + 66}) scale(1 -1)', f'translate(500 {yb + 66}) scale(-1 -1)'])
    perf = '<rect x="35" y="420" width="16" height="230" fill="url(#p-perf)"/><rect x="449" y="420" width="16" height="230" fill="url(#p-perf)"/>'
    return plain_face(win, yb, 'p-guilloche', LAC, DARK, extra_under=perf,
                      extra_frame=f'<g fill="url(#g-brass)" filter="url(#f-bevel)">{mounts}</g>')

def intr_face():
    # a press clipping: clipped corners, thick-thin letterpress rules above and below the picture
    yb = 380
    win = clipped(yb)
    rules = f'<path d="M50 60H450M50 54H450" stroke="{PAPER}" stroke-width="1" opacity=".55"/><path d="M50 57H450" stroke="{PAPER}" stroke-width="3" opacity=".35"/>'
    return plain_face(win, yb, 'p-halftone', KURSUN, DARK, extra_frame=rules)

def crisis_face():
    # an extra edition: a masthead band across the top over the full picture, heavy black rules
    yb = 380
    mast = (f'<g filter="url(#f-shadow)"><rect x="30" y="26" width="440" height="44" fill="url(#g-kara)"/></g>'
            f'<rect x="30" y="26" width="440" height="44" fill="url(#p-speed)"/>'
            f'<path d="M30 74H470" stroke="{INK}" stroke-width="5"/><path d="M30 80H470" stroke="{INK}" stroke-width="1.5"/>'
            + sunburst(250, 70, 18, 'url(#g-brass)', .9, scale=.08)
            + f'<circle cx="250" cy="70" r="12" fill="url(#g-brass-r)" filter="url(#f-bevel)"/>')
    frame = border('url(#g-brass)') + corners() + studs() + mast
    return face(None, band('p-halftone'), frame, nameband(yb), DARK, KARA)

def kader_face(defeat):
    # a kanun tasarısı: a bill's head sheet over the picture, the Assembly's round stamp pressed on its corner.
    # İnkılap gets a khaki rule; İrtica a black mourning border.
    yb = 380
    win = rect(yb, 132)
    edge = KARA if defeat else HAKI
    head = (f'<g filter="url(#f-shadow)"><path d="M50 60H450V124H50Z" fill="url(#g-paper)"/></g>'
            f'<path d="M50 60H450V124H50Z" fill="url(#p-grain)" opacity=".6"/>'
            f'<path d="M64 72H436" stroke="{INK}" stroke-width="2.4"/><path d="M64 77H436" stroke="{INK}" stroke-width=".8"/>'
            f'<path d="M150 92H350M180 104H320M200 114H300" stroke="{INK}" stroke-width="3" opacity=".55"/>'
            f'<path d="M64 120H436" stroke="{INK}" stroke-width=".8"/>'
            f'<g transform="translate(92 98) rotate(-10)" opacity=".8" filter="url(#f-ink)" fill="{MOR}" stroke="{MOR}">'
            f'<circle r="21" fill="none" stroke-width="2.6"/><circle r="15" fill="none" stroke-width="1"/>'
            f'<use href="#s-rostrum" x="-11" y="-11" width="22" height="22" stroke="none"/></g>'
            f'<g transform="translate(408 98)" fill="{AL if not defeat else INK}" opacity=".85">'
            f'<path d="M-14 -16H14V12L0 4L-14 12Z"/></g>')
    mourn = f'<path d="{chamfer(36, 36, 464, 664, 12)}" fill="none" stroke="{INK}" stroke-width="9"/>' if defeat else ''
    return plain_face(win, yb, 'p-steps', edge, DARK, extra_frame=mourn + head)

def hirs_face():
    yb = 380
    win = ziggurat(yb)
    return plain_face(win, yb, 'p-guilloche', MOR, DARK)

def taraf_face(traitor):
    yb = 380
    win = ziggurat(yb)
    line = '#d9cec2' if traitor else '#e6cf8f'
    extra = f'<path d="{win}" fill="none" stroke="{line}" stroke-width="2" opacity=".7" transform="translate(250 226) scale(.97) translate(-250 -226)"/>'
    return plain_face(win, yb, 'p-steps' if traitor else 'p-speed', KARA if traitor else HAKI, DARK, extra_frame=extra)

# ------------------------------------------------------------------ backs
def back_frame():
    return border() + corners() + studs()

def medallion(name, r=92, cy=320, disc='url(#g-disc)'):
    return (f'<g transform="translate(250 {cy})" filter="url(#f-shadow)"><circle r="{r + 12}" fill="url(#g-brass-r)" filter="url(#f-bevel)"/>'
            f'<circle r="{r}" fill="{disc}"/><circle r="{r}" fill="none" stroke="{INK}" stroke-width="2"/>'
            f'<circle r="{r + 6}" fill="none" stroke="{PAPER}" stroke-width="1" opacity=".5"/></g>'
            + icon(name, 250 - r * .74, cy - r * .74, r * 1.48))

def plate(y=588):
    p = f'M160 {y - 26}H340L360 {y}L340 {y + 26}H160L140 {y}Z'
    return (f'<g class="bplate"><g filter="url(#f-shadow)"><path d="{p}" fill="url(#g-paper)"/></g>'
            f'<path d="{p}" fill="none" stroke="url(#g-brass)" stroke-width="4" filter="url(#f-bevel)"/></g>')

def ground(fill, pattern=None, op=1):
    g = f'<rect width="500" height="700" fill="{fill}"/>'
    if pattern:
        g += f'<rect width="500" height="700" fill="url(#{pattern})" opacity="{op}"/>'
    return g + '<rect width="500" height="700" fill="url(#p-grain)" opacity=".5"/>'

def seal(cx, cy, r, ink=MOR, op=.85):
    # the Assembly's rubber stamp: double ring, a beaded band, the rostrum in the centre. Words go round it in Latin
    # capitals (the Onuncu Yıl lens); the stamp is drawn new, not copied from any official emblem.
    tid = f'sr{int(cx)}{int(cy)}{int(r)}'
    rr = r - 26
    beads = ''.join(f'<circle cx="{cx + (r - 10) * math.cos(a / 48 * 6.2832):.1f}" cy="{cy + (r - 10) * math.sin(a / 48 * 6.2832):.1f}" r="1.6"/>' for a in range(48))
    s = r * .78
    return (f'<g opacity="{op}" filter="url(#f-ink)" fill="{ink}" stroke="{ink}">'
            f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke-width="{r * .04:.1f}"/>'
            f'<circle cx="{cx}" cy="{cy}" r="{r * .62:.1f}" fill="none" stroke-width="{r * .02:.1f}"/>'
            f'<g stroke="none">{beads}</g>'
            f'<path id="{tid}a" d="M{cx - rr} {cy}A{rr} {rr} 0 0 1 {cx + rr} {cy}" fill="none" stroke="none"/>'
            f'<path id="{tid}b" d="M{cx - rr - r * .07:.1f} {cy}A{rr + r * .07:.1f} {rr + r * .07:.1f} 0 0 0 {cx + rr + r * .07:.1f} {cy}" fill="none" stroke="none"/>'
            f'<text stroke="none" font-family="Josefin Sans,Jost,Futura,sans-serif" font-weight="700" font-size="{r * .13:.1f}" letter-spacing="{r * .012:.1f}" text-anchor="middle">'
            f'<textPath href="#{tid}a" startOffset="50%">TÜRKİYE BÜYÜK MİLLET MECLİSİ</textPath></text>'
            f'<text stroke="none" font-family="Josefin Sans,Jost,Futura,sans-serif" font-weight="700" font-size="{r * .13:.1f}" letter-spacing="{r * .03:.1f}" text-anchor="middle">'
            f'<textPath href="#{tid}b" startOffset="50%">ANKARA · 1920</textPath></text>'
            f'<use href="#s-rostrum" x="{cx - s / 2:.1f}" y="{cy - s / 2:.1f}" width="{s:.1f}" height="{s:.1f}" stroke="none"/></g>')

def backs():
    write('cards/back-char.svg', ground('url(#g-lac)', 'p-speed') + sunburst(250, 320, 40, 'url(#g-brass)', .35)
          + medallion('character', 100) + plate() + back_frame())
    cord = ''.join(f'<path d="M{x} 40C{x + 30} 120 {x - 30} 200 {x} 280S{x - 30} 440 {x} 520S{x + 30} 620 {x} 660" fill="none" stroke="url(#g-brass)" stroke-width="5" opacity=".55"/>' for x in (90, 410))
    write('cards/back-kul.svg', ground('url(#g-lac)', 'p-guilloche') + cord + medallion('companion', 90) + plate() + back_frame())
    cols = ''.join(f'<rect x="{x}" y="70" width="84" height="560" fill="url(#p-halftone)"/><path d="M{x} 70V630" stroke="{INK}" stroke-width="1" opacity=".3"/>' for x in (60, 158, 256, 354))
    write('cards/back-intr.svg', ground('url(#g-paper)') + cols
          + f'<path d="M50 60H450M50 66H450" stroke="{INK}" stroke-width="2"/><path d="M50 640H450" stroke="{INK}" stroke-width="2"/>'
          + medallion('intrigue', 92, cy=300) + back_frame())
    write('cards/back-crisis.svg', ground('url(#g-al)', 'p-speed') + seal(250, 200, 92, PAPER, .7)
          + medallion('crisis', 70, cy=410) + plate() + back_frame())
    # the bill's folder: a buff dossier tied with a red tape, the Assembly's stamp on its cover
    env = (f'<path d="M70 120H430V600H70Z" fill="url(#g-paper)" filter="url(#f-shadow)"/>'
           f'<path d="M70 120H430V600H70Z" fill="url(#p-grain)" opacity=".7"/>'
           f'<path d="M90 150H410M90 156H410" stroke="{INK}" stroke-width="1.6" opacity=".6"/>'
           f'<rect x="70" y="420" width="360" height="14" fill="{AL}" opacity=".85"/>'
           + seal(250, 300, 110, MOR, .75))
    write('cards/back-kader.svg', ground('url(#g-mor)', 'p-steps') + env + plate() + back_frame())
    write('cards/back-hirs.svg', ground('url(#g-mor)', 'p-guilloche') + sunburst(250, 330, 32, 'url(#g-brass)', .3)
          + medallion('ambition', 82) + plate() + back_frame())
    flap = (f'<path d="M50 50H450V650H50Z" fill="url(#g-paper)"/><path d="M50 50L250 300L450 50" fill="#e2d6bb" stroke="{INK}" stroke-width="1.5" opacity=".9"/>'
            f'<path d="M50 650L230 420M450 650L270 420" stroke="{INK}" stroke-width="1" opacity=".3"/>')
    write('cards/back-taraf.svg', ground('url(#g-kara)') + flap
          + f'<g transform="translate(250 300)" filter="url(#f-shadow)"><circle r="46" fill="url(#g-al)"/><circle r="46" fill="none" stroke="#5e100e" stroke-width="3"/></g>'
          + icon('secret', 222, 272, 56) + plate(600) + back_frame())

# ------------------------------------------------------------------ drawn art (400 x 350, sliced)
def art(path, body):
    write(path, body, '0 0 400 350', ' preserveAspectRatio="xMidYMid slice"')

def disc_icon(name, ground_fill, r=96, rays=False):
    g = f'<rect x="-40" y="-40" width="480" height="430" fill="{ground_fill}"/>'
    if rays:
        g += sunburst(200, 176, 32, 'url(#g-brass)', .35)
    return (g + f'<g filter="url(#f-shadow)"><circle cx="200" cy="176" r="{r + 12}" fill="url(#g-brass-r)" filter="url(#f-bevel)"/><circle cx="200" cy="176" r="{r}" fill="url(#g-disc)"/></g>'
            + icon(name, 200 - r * .74, 176 - r * .74, r * 1.48))

def drawn_art():
    art('cards/art-character.svg', disc_icon('character', 'url(#g-lac)', rays=True))
    art('cards/art-suleyman.svg', disc_icon('suleyman', 'url(#g-lac)', rays=True))
    art('cards/art-companion.svg', disc_icon('companion', 'url(#g-lac)'))
    art('cards/art-crisis.svg', disc_icon('crisis', 'url(#g-kara)'))
    steps = ''.join(f'<rect x="{60 + i * 40}" y="{330 - i * 34}" width="{280 - i * 80 if 280 - i * 80 > 40 else 40}" height="34" fill="url(#g-brass)" opacity=".5"/>' for i in range(4))
    art('cards/art-hirs.svg', '<rect x="-40" y="-40" width="480" height="430" fill="url(#g-mor)"/>' + sunburst(200, 176, 32, 'url(#g-brass)', .3)
        + '<g filter="url(#f-shadow)"><circle cx="200" cy="176" r="86" fill="url(#g-brass-r)" filter="url(#f-bevel)"/><circle cx="200" cy="176" r="74" fill="url(#g-disc)"/></g>'
        + icon('ambition', 145, 121, 110))
    # Vatansever: a rising sun over a horizon line; Hain: a long cast shadow and the dagger. No person, no flag.
    art('cards/art-taraf-s.svg', '<rect x="-40" y="-40" width="480" height="430" fill="url(#g-haki)"/>'
        + sunburst(200, 250, 30, '#e6cf8f', .4)
        + f'<circle cx="200" cy="250" r="78" fill="url(#g-brass-r)"/><rect x="-40" y="250" width="480" height="140" fill="{KARA}" opacity=".85"/>'
        + f'<path d="M-40 250H440" stroke="#e6cf8f" stroke-width="4"/>'
        )
    art('cards/art-taraf-h.svg', '<rect x="-40" y="-40" width="480" height="430" fill="url(#g-kara)"/>'
        + f'<path d="M150 330L250 330L420 40L360 40Z" fill="#000" opacity=".35"/>'
        + f'<path d="M-40 330H440" stroke="#d9cec2" stroke-width="2" opacity=".5"/>'
        + '<g filter="url(#f-shadow)"><circle cx="200" cy="176" r="86" fill="url(#g-brass-r)" filter="url(#f-bevel)"/><circle cx="200" cy="176" r="74" fill="url(#g-disc)"/></g>'
        + icon('traitor', 145, 121, 110))
    write('cards/backdrop.svg', '<rect width="400" height="310" fill="url(#st-bg)"/>' + sunburst(200, 90, 36, '#f0e7d3', .06)
          + '<rect width="400" height="310" fill="url(#st-halo)"/><rect width="400" height="310" fill="url(#st-vig)"/>',
          '0 0 400 310', ' preserveAspectRatio="xMidYMid slice"')

# ------------------------------------------------------------------ table
def table():
    os.makedirs(os.path.join(MOD, 'table'), exist_ok=True)
    # the Takdir seal stands alone as an image, so it carries its own defs
    write('table/seal.svg', defs() + seal(200, 200, 180, MOR, .9), '0 0 400 400', ' width="400" height="400"')
    # the Gazi's seat: brass rays fanning from behind the head and a stepped brass portal; no flag, no emblem
    rays = ''.join(f'<path d="M50 50L{50 + 80 * math.cos(math.radians(a)):.1f} {50 - 80 * math.sin(math.radians(a)):.1f}" />' for a in range(-10, 191, 10))
    with open(os.path.join(MOD, 'table/gazi-seat.html'), 'w') as f:
        f.write('<svg viewBox="0 0 100 120" preserveAspectRatio="none" class="gunes" aria-hidden="true">'
                f'<g class="ry">{rays}</g>'
                '<path class="rim" d="M-3 120V27H9V15H21V5H79V15H91V27H103V120"/>'
                '<path class="ln" d="M5 120V33H15V21H27V12H73V21H85V33H95V120"/>'
                '<path class="st" d="M-6 112H106V120H-6Z"/></svg>\n')

if __name__ == '__main__':
    os.makedirs(os.path.join(MOD, 'cards'), exist_ok=True)
    with open(os.path.join(HERE, 'defs.svg'), 'w') as f:
        f.write('<svg xmlns="http://www.w3.org/2000/svg">\n' + defs() + '\n</svg>\n')
    write('cards/char.svg', char_face())
    write('cards/sultan.svg', char_face(sultan=True))
    write('cards/kul.svg', kul_face())
    write('cards/intr.svg', intr_face())
    write('cards/crisis.svg', crisis_face())
    write('cards/kader-h.svg', kader_face(False))
    write('cards/kader-x.svg', kader_face(True))
    write('cards/hirs.svg', hirs_face())
    write('cards/taraf-s.svg', taraf_face(False))
    write('cards/taraf-h.svg', taraf_face(True))
    backs(); drawn_art(); table()
    print('cumhuriyet skin drawn')
