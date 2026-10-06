"""Thirteen small math figures, returned as inline-SVG strings.

Styling hooks (defined in preview.css):
  .s   stroke = currentColor   .a stroke = accent    .l stroke = lilac
  .fc  fill   = currentColor   .fa fill   = accent   .fl fill   = lilac
  .t   thicker stroke
Lines use vector-effect: non-scaling-stroke, so they stay hairline at any size.
"""
import cmath
import math
import random


def _svg(vb, body, label, extra=""):
    return (f'<svg viewBox="{vb}" role="img" aria-label="{label}" xmlns="http://www.w3.org/2000/svg"{extra}>'
            f'{body}</svg>')


def _poly(pts, cls="s", close=False):
    d = "M" + "L".join(f"{x:.2f},{y:.2f}" for x, y in pts) + ("Z" if close else "")
    return f'<path class="{cls}" d="{d}"/>'


# ---------------------------------------------------------------- 1 Apollonian gasket
def gasket(R=300.0, min_r=6.0, cap=900):
    """Circle packing via the Descartes circle theorem.

    First two circles come from the quadratic form of the theorem; after that every new circle is the
    exact 'reflection' of the previous fourth one (k' = 2(k1+k2+k3) - k4, and the same for k*z),
    so no circle is ever produced twice."""
    def make(k, kz):
        z = kz / k
        return (z.real, z.imag, abs(1 / k), k, kz)

    def first_two(c1, c2, c3):
        k1, k2, k3 = c1[3], c2[3], c3[3]
        z1, z2, z3 = complex(c1[0], c1[1]), complex(c2[0], c2[1]), complex(c3[0], c3[1])
        rk = 2 * math.sqrt(max(0.0, k1 * k2 + k2 * k3 + k3 * k1))
        rz = 2 * cmath.sqrt(k1 * k2 * z1 * z2 + k2 * k3 * z2 * z3 + k3 * k1 * z3 * z1)
        base_k, base_kz = k1 + k2 + k3, k1 * z1 + k2 * z2 + k3 * z3
        return [make(base_k + sg * rk, base_kz + sg * rz) for sg in (1, -1)]

    def circ(x, y, r, k):
        return (x, y, r, k, k * complex(x, y))

    outer = circ(0.0, 0.0, R, -1 / R)
    r = R / 2
    c1, c2 = circ(-r, 0.0, r, 1 / r), circ(r, 0.0, r, 1 / r)
    s1, s2 = first_two(outer, c1, c2)
    circles = [c1, c2, s1, s2]
    stack = [(outer, c1, s1, c2), (outer, c2, s1, c1), (c1, c2, s1, outer),
             (outer, c1, s2, c2), (outer, c2, s2, c1), (c1, c2, s2, outer)]
    while stack and len(circles) < cap:
        a, b, c, d = stack.pop()
        k = 2 * (a[3] + b[3] + c[3]) - d[3]
        kz = 2 * (a[4] + b[4] + c[4]) - d[4]
        n = make(k, kz)
        if n[2] < min_r:
            continue
        circles.append(n)
        stack += [(a, b, n, c), (a, c, n, b), (b, c, n, a)]
    body = f'<circle class="s" cx="0" cy="0" r="{R}"/>'
    for i, (x, y, rr, _, _) in enumerate(circles):
        cls = "s a" if rr < 16 and i % 6 == 0 else ("s l" if i % 3 == 0 else "s")
        body += f'<circle class="{cls}" cx="{x:.1f}" cy="{y:.1f}" r="{rr:.1f}"/>'
    return _svg(f"{-R-2} {-R-2} {2*R+4} {2*R+4}", body, "Apollonian gasket")


# ---------------------------------------------------------------- 2 Sierpinski triangle
def sierpinski(depth=5, filled=True):
    tris = []

    def rec(ax, ay, bx, by, cx, cy, d):
        if d == 0:
            tris.append(((ax, ay), (bx, by), (cx, cy)))
            return
        abx, aby = (ax + bx) / 2, (ay + by) / 2
        bcx, bcy = (bx + cx) / 2, (by + cy) / 2
        cax, cay = (cx + ax) / 2, (cy + ay) / 2
        rec(ax, ay, abx, aby, cax, cay, d - 1)
        rec(abx, aby, bx, by, bcx, bcy, d - 1)
        rec(cax, cay, bcx, bcy, cx, cy, d - 1)

    h = 100 * math.sqrt(3) / 2
    rec(50, 0, 0, h, 100, h, depth)
    d = "".join(f"M{a[0]:.2f},{a[1]:.2f}L{b[0]:.2f},{b[1]:.2f}L{c[0]:.2f},{c[1]:.2f}Z" for a, b, c in tris)
    cls = "fc" if filled else "s"
    body = f'<path class="{cls}" d="{d}"/>'
    return _svg(f"-1 -1 102 {h+2:.1f}", body, "Sierpinski triangle")


# ---------------------------------------------------------------- 3 elliptic curve + group law
_X0 = -1.32471795724475   # real root of x^3 - x + 1
_XMAX = 1.78              # |y| reaches ~2.2 here, so the curve ends inside the frame


def _branches(n=300):
    xs = [_X0 + (_XMAX - _X0) * (i / n) for i in range(n + 1)]
    f = lambda x: math.sqrt(max(x ** 3 - x + 1, 0))
    return [(x, f(x)) for x in xs], [(x, -f(x)) for x in xs]


def elliptic(labels=True, grid=True):
    """y^2 = x^3 - x + 1 with the chord through P=(-1,1), Q=(0,1): third point (1,1), so P+Q=(1,-1)."""
    S = 92
    X = lambda x: (x + 1.7) * S
    Y = lambda y: (2.3 - y) * S
    up, lo = _branches()
    body = ""
    if grid:
        for gx in range(-1, 2):
            body += f'<path class="s" style="opacity:.18" d="M{X(gx):.1f},0V{Y(-2.3):.1f}"/>'
        for gy in range(-2, 3):
            body += f'<path class="s" style="opacity:.18" d="M0,{Y(gy):.1f}H{X(2.0):.1f}"/>'
        body += f'<path class="s" style="opacity:.5" d="M0,{Y(0):.1f}H{X(2.0):.1f}M{X(0):.1f},0V{Y(-2.3):.1f}"/>'
    body += _poly([(X(x), Y(y)) for x, y in up], "s t")
    body += _poly([(X(x), Y(y)) for x, y in lo], "s t")
    body += f'<path class="a" d="M{X(-1.6):.1f},{Y(1):.1f}H{X(1.95):.1f}"/>'
    body += f'<path class="l" style="stroke-dasharray:4 4" d="M{X(1):.1f},{Y(1):.1f}V{Y(-1):.1f}"/>'
    for (x, y, lab, dx, dy, cls) in [(-1, 1, "P", -14, -10, "fa"), (0, 1, "Q", -4, -12, "fa"),
                                     (1, 1, "R", 8, -10, "fl"), (1, -1, "P+Q", 8, 16, "fa")]:
        body += f'<circle class="{cls}" cx="{X(x):.1f}" cy="{Y(y):.1f}" r="4"/>'
        if labels:
            body += f'<text x="{X(x)+dx:.1f}" y="{Y(y)+dy:.1f}">{lab}</text>'
    return _svg(f"-6 -6 {X(2.0)+12:.0f} {Y(-2.3)+12:.0f}", body,
                "Elliptic curve y squared equals x cubed minus x plus one, with chord-and-tangent addition")


def elliptic_icon():
    """Just the curve, for tiny sizes."""
    S = 40
    X = lambda x: (x + 1.4) * S
    Y = lambda y: (2.3 - y) * S
    up, lo = _branches(120)
    body = _poly([(X(x), Y(y)) for x, y in up], "s t") + _poly([(X(x), Y(y)) for x, y in lo], "s t")
    return _svg(f"-3 -3 {X(_XMAX)+6:.0f} {Y(-2.3)+6:.0f}", body, "Elliptic curve")


# ---------------------------------------------------------------- 4 Cantor set
def cantor(rows=6, w=600):
    body = ""
    for k in range(rows):
        n, seg = 2 ** k, w / 3 ** k
        # intervals at level k: positions given by ternary digits in {0,2}
        for i in range(n):
            pos = 0.0
            for b in range(k):
                digit = 2 if (i >> (k - 1 - b)) & 1 else 0
                pos += digit * w / 3 ** (b + 1)
            body += f'<rect class="fc" x="{pos:.2f}" y="{k*12}" width="{seg:.2f}" height="3.5" rx="1.2"/>'
    return _svg(f"0 -1 {w} {rows*12}", body, "Cantor set, six levels")


# ---------------------------------------------------------------- 5 Hilbert curve
def hilbert(order=5):
    n = 2 ** order

    def d2xy(d):
        x = y = 0
        t, s = d, 1
        while s < n:
            rx = 1 & (t // 2)
            ry = 1 & (t ^ rx)
            if ry == 0:
                if rx == 1:
                    x, y = s - 1 - x, s - 1 - y
                x, y = y, x
            x += s * rx
            y += s * ry
            t //= 4
            s *= 2
        return x, y

    pts = [d2xy(d) for d in range(n * n)]
    body = _poly([(x + .5, y + .5) for x, y in pts], "s")
    return _svg(f"-0.5 -0.5 {n+1} {n+1}", body, f"Hilbert curve of order {order}")


# ---------------------------------------------------------------- 6 mollifier -> delta
def mollifier():
    W, H = 300, 190
    X = lambda x: (x + 2.5) / 5 * W
    Y = lambda y: H - 10 - y / 5.2 * (H - 20)
    body = f'<path class="s" style="opacity:.5" d="M0,{Y(0):.1f}H{W}"/>'
    eps = [1.0, 0.6, 0.36, 0.22, 0.13]
    for i, e in enumerate(eps):
        pts = [(X(x), Y(math.exp(-(x / e) ** 2) / (e * math.sqrt(math.pi))))
               for x in [-2.5 + 5 * j / 300 for j in range(301)]]
        cls = "a t" if i == len(eps) - 1 else ("l" if i % 2 else "s")
        body += _poly(pts, cls)
    return _svg(f"0 0 {W} {H}", body, "Gaussian mollifiers narrowing toward a Dirac delta")


# ---------------------------------------------------------------- 7 calculus of variations
def variations():
    W, H = 300, 170
    a, b = (14, 128), (286, 44)
    body = ""
    for k, eps in enumerate([-46, -32, -19, -8, 9, 20, 33, 47]):
        pts = []
        for j in range(101):
            t = j / 100
            x = a[0] + t * (b[0] - a[0])
            y = a[1] + t * (b[1] - a[1])
            # perpendicular-ish bump + a second harmonic so the family isn't all the same shape
            y += eps * math.sin(math.pi * t) * (1 if k % 2 == 0 else 0.8) + 0.25 * eps * math.sin(2 * math.pi * t)
            pts.append((x, y))
        body += _poly(pts, "l" if k % 2 else "s")
    body += f'<path class="a t" d="M{a[0]},{a[1]}L{b[0]},{b[1]}"/>'
    body += f'<circle class="fc" cx="{a[0]}" cy="{a[1]}" r="3.5"/><circle class="fc" cx="{b[0]}" cy="{b[1]}" r="3.5"/>'
    return _svg(f"0 0 {W} {H}", body, "Curves between two points; the straight line is the shortest")


# ---------------------------------------------------------------- 8 cointegrated spread
def spread():
    W, H = 300, 130
    rnd = random.Random(11)
    n, theta, sig = 230, 0.09, 1.0
    s, ser = 0.0, []
    for _ in range(n):
        s = s * (1 - theta) + sig * rnd.gauss(0, 1)
        ser.append(s)
    sd = sig / math.sqrt(1 - (1 - theta) ** 2)
    X = lambda i: 6 + i / (n - 1) * (W - 12)
    Y = lambda v: H / 2 - v / (3.2 * sd) * (H / 2 - 8)
    body = f'<rect class="fl" style="opacity:.14" x="6" y="{Y(2*sd):.1f}" width="{W-12}" height="{Y(-2*sd)-Y(2*sd):.1f}" rx="3"/>'
    body += f'<path class="s" style="opacity:.55;stroke-dasharray:3 4" d="M6,{Y(0):.1f}H{W-6}"/>'
    body += _poly([(X(i), Y(v)) for i, v in enumerate(ser)], "s")
    for i, v in enumerate(ser):
        if abs(v) > 2 * sd:
            body += f'<circle class="fa" cx="{X(i):.1f}" cy="{Y(v):.1f}" r="3"/>'
    return _svg(f"0 0 {W} {H}", body, "Mean-reverting spread with two-sigma entry bands")


# ---------------------------------------------------------------- 9 Black-Scholes family
def black_scholes():
    W, H = 300, 190
    K, r, vol = 100.0, 0.03, 0.25
    N = lambda x: 0.5 * (1 + math.erf(x / math.sqrt(2)))

    def call(S, tau):
        if tau <= 0:
            return max(S - K, 0)
        d1 = (math.log(S / K) + (r + vol ** 2 / 2) * tau) / (vol * math.sqrt(tau))
        d2 = d1 - vol * math.sqrt(tau)
        return S * N(d1) - K * math.exp(-r * tau) * N(d2)

    X = lambda S: (S - 60) / 80 * (W - 16) + 8
    Y = lambda v: H - 10 - v / 42 * (H - 22)
    body = f'<path class="s" style="opacity:.5" d="M8,{Y(0):.1f}H{W-8}"/>'
    for i, tau in enumerate([1.0, 0.5, 0.25, 0.08]):
        pts = [(X(S), Y(call(S, tau))) for S in [60 + 80 * j / 160 for j in range(161)]]
        body += _poly(pts, "l" if i % 2 else "s")
    payoff = [(X(60), Y(0)), (X(100), Y(0)), (X(140), Y(40))]
    body += _poly(payoff, "a t")
    return _svg(f"0 0 {W} {H}", body, "Black-Scholes call price converging to the payoff as expiry nears")


# ---------------------------------------------------------------- 10 hex tiling (districts)
def hexes():
    W, H = 300, 200
    s = 21.0  # hex "radius"
    w = math.sqrt(3) * s
    rows, cols = 5, 7
    cells = []
    for r in range(rows):
        for c in range(cols):
            cx = 24 + c * w + (w / 2 if r % 2 else 0)
            cy = 26 + r * s * 1.5
            cells.append((r, c, cx, cy))
    district = {(1, 1), (1, 2), (2, 1), (2, 2), (3, 2)}
    body = ""
    rnd = random.Random(5)
    for r, c, cx, cy in cells:
        pts = [(cx + s * math.cos(math.radians(60 * k - 30)), cy + s * math.sin(math.radians(60 * k - 30))) for k in range(6)]
        cls = "s a t" if (r, c) in district else "s"
        body += _poly(pts, cls, close=True)
        party = "fp" if rnd.random() < 0.42 else "fg"
        body += f'<circle class="{party}" cx="{cx:.1f}" cy="{cy:.1f}" r="4.2"/>'
    return _svg(f"0 0 {W} {H}", body, "Hex tiles with one highlighted district")


# ---------------------------------------------------------------- 11 epicycles
def epicycle():
    W = 220
    cx, cy = 110, 110
    a1, a2, a3 = 56, 28, 9
    z = lambda t: a1 * cmath.exp(1j * t) + a2 * cmath.exp(-2j * t) + a3 * cmath.exp(5j * t)
    curve = [(cx + z(t).real, cy + z(t).imag) for t in [2 * math.pi * j / 600 for j in range(601)]]
    body = _poly(curve, "a")
    t0 = 1.15
    p0 = complex(cx, cy)
    for amp, k, cls in [(a1, 1, "s"), (a2, -2, "s"), (a3, 5, "s")]:
        body += f'<circle class="{cls}" style="opacity:.45" cx="{p0.real:.1f}" cy="{p0.imag:.1f}" r="{amp}"/>'
        p1 = p0 + amp * cmath.exp(1j * k * t0)
        body += f'<path class="s" d="M{p0.real:.1f},{p0.imag:.1f}L{p1.real:.1f},{p1.imag:.1f}"/>'
        p0 = p1
    body += f'<circle class="fa" cx="{p0.real:.1f}" cy="{p0.imag:.1f}" r="3.5"/>'
    return _svg(f"0 0 {W} {W}", body, "Rotating vectors tracing a closed curve")


# ---------------------------------------------------------------- 12 Fano plane
def fano():
    W = 220
    A, B, C = (110, 18), (16, 180), (204, 180)
    mid = lambda p, q: ((p[0] + q[0]) / 2, (p[1] + q[1]) / 2)
    D, E, F = mid(A, B), mid(B, C), mid(C, A)
    G = ((A[0] + B[0] + C[0]) / 3, (A[1] + B[1] + C[1]) / 3)
    body = _poly([A, B, C], "s", close=True)
    for p, q in [(A, E), (B, F), (C, D)]:
        body += _poly([p, q], "s")
    ccx, ccy = G
    rad = math.dist(G, D)
    body += f'<circle class="a" cx="{ccx:.1f}" cy="{ccy:.1f}" r="{rad:.1f}"/>'
    for p in (A, B, C, D, E, F, G):
        body += f'<circle class="fc" cx="{p[0]:.1f}" cy="{p[1]:.1f}" r="4"/>'
    return _svg("8 10 204 180", body, "Fano plane: seven points, seven lines")


# ---------------------------------------------------------------- 13 level sets + gradient descent
def contours():
    W, H = 300, 190
    cx, cy = 150, 95
    ang = math.radians(-24)
    ca, sa = math.cos(ang), math.sin(ang)
    lam1, lam2 = 1.0, 9.0
    body = ""
    for k, c in enumerate([0.5, 1.4, 2.8, 4.6, 6.8]):
        a_, b_ = math.sqrt(2 * c / lam1) * 38, math.sqrt(2 * c / lam2) * 38
        body += (f'<ellipse class="s" style="opacity:{0.9 - k*0.1:.2f}" cx="{cx}" cy="{cy}" rx="{a_:.1f}" ry="{b_:.1f}" '
                 f'transform="rotate({-24} {cx} {cy})"/>')
    # gradient descent on f = 1/2 (lam1 u^2 + lam2 v^2) in the rotated frame
    u, v = 3.1, 0.9
    pts = []
    for _ in range(14):
        x = cx + (u * ca - v * sa) * 38 * 0.55
        y = cy + (u * sa + v * ca) * 38 * 0.55
        pts.append((x, y))
        u, v = u - 0.19 * lam1 * u, v - 0.19 * lam2 * v
    body += _poly(pts, "a t")
    for x, y in pts:
        body += f'<circle class="fa" cx="{x:.1f}" cy="{y:.1f}" r="2.6"/>'
    body += f'<circle class="fc" cx="{cx}" cy="{cy}" r="3.4"/>'
    return _svg(f"0 0 {W} {H}", body, "Level sets of a quadratic with a gradient-descent path")


# ---------------------------------------------------------------- 14 random walks (the Home page animation, frozen)
def random_walks():
    W, H = 300, 190
    rnd = random.Random(21)
    body = ""
    for i, cls in enumerate(["a", "l", "s", "a", "l", "s", "l", "a", "s", "l"]):
        x, y = rnd.uniform(0, 80), rnd.uniform(40, 150)
        dx, vol = rnd.uniform(2.4, 3.2), rnd.uniform(5, 9)
        pts = [(x, y)]
        for _ in range(rnd.randint(56, 86)):
            x += dx
            y += rnd.gauss(0, vol)
            y = 20 - y if y < 10 else (2 * (H - 10) - y if y > H - 10 else y)
            if x > W - 6:
                break
            pts.append((x, y))
        k = len(pts)
        for lo, hi, op in [(0.0, 0.45, 0.22), (0.4, 0.75, 0.5), (0.7, 1.0, 1.0)]:   # older = fainter
            seg = pts[int(lo * (k - 1)): int(hi * (k - 1)) + 1]
            if len(seg) > 1:
                body += _poly(seg, cls).replace('<path class', f'<path style="opacity:{op}" class')
        head = {"a": "fa", "l": "fl", "s": "fc"}[cls]
        body += f'<circle class="{head}" cx="{pts[-1][0]:.1f}" cy="{pts[-1][1]:.1f}" r="2.6"/>'
    return _svg(f"0 0 {W} {H}", body, "Random-walk paths with fading trails")


FIGS = {
    "gasket": gasket, "sierpinski": sierpinski, "elliptic": elliptic, "elliptic_icon": elliptic_icon, "cantor": cantor,
    "hilbert": hilbert, "mollifier": mollifier, "variations": variations, "spread": spread,
    "black_scholes": black_scholes, "hexes": hexes, "epicycle": epicycle, "fano": fano,
    "contours": contours, "random_walks": random_walks,
}

if __name__ == "__main__":
    for k, fn in FIGS.items():
        print(f"{k:14s}{len(fn()):>8d} bytes")
