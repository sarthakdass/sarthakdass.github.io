#!/usr/bin/env python3
"""Generates index.html, projects.html, math.html, hobbies.html, now.html.

Run from the site folder:  python3 build_pages.py
The output files are plain static HTML; this script is only a convenience
so the header, footer and page-transition markup stay identical on every
page. You can also edit the generated .html files directly and ignore this
script (pick one workflow: re-running overwrites the five pages).
"""
import os
import re
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "tools"))
import figs  # noqa: E402  (math figures, drawn as inline SVG)

PAGES = [
    ("index.html", "Home"),
    ("projects.html", "Projects"),
    ("math.html", "Math"),
    ("hobbies.html", "Hobbies"),
    ("now.html", "Now"),
    ("visuals.html", "Visuals"),
]

FONTS = (
    "https://fonts.googleapis.com/css2?"
    "family=IBM+Plex+Mono:wght@400;500"
    "&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400"
    "&family=Inter:wght@400;500;600;700;800"
    "&display=swap"
)

# --- logo: traced from the SD monogram (assets/logo-sd.svg), inlined so it takes the text colour
_LOGO_SVG = open("assets/logo-sd.svg", encoding="utf-8").read()
_LOGO_D = re.search(r' d="([^"]+)"', _LOGO_SVG).group(1)
_LOGO_VB = re.search(r'viewBox="([^"]+)"', _LOGO_SVG).group(1)
_LOGO_D = re.sub(r"(\d+\.\d)\d", r"\1", _LOGO_D)  # 1 decimal is plenty at header size
LOGO = (
    f'<svg class="brand__mark" viewBox="{_LOGO_VB}" aria-hidden="true" focusable="false">'
    f'<path fill="currentColor" stroke="currentColor" stroke-width="0.45" stroke-linejoin="round" fill-rule="evenodd" d="{_LOGO_D}"/></svg>'
)

# --- math figures, each generated once and inlined where used
FIG = {
    "gasket": figs.gasket(min_r=2.4),
    "hilbert": figs.hilbert(5),
    "elliptic": figs.elliptic(),
    "elliptic_decor": figs.elliptic(labels=False, grid=False),
    "elliptic_icon": figs.elliptic_icon(),
    "sierpinski": figs.sierpinski(5),
    "sierpinski_mark": figs.sierpinski(4),
    "fano": figs.fano(),
    "cantor": figs.cantor(),
    "mollifier": figs.mollifier(),
    "variations": figs.variations(),
    "spread": figs.spread(),
    "black_scholes": figs.black_scholes(),
    "hexes": figs.hexes(),
    "epicycle": figs.epicycle(),
    "contours": figs.contours(),
}

FOOTER_INNER = (
    f'<span class="footer__mark v" aria-hidden="true">{FIG["sierpinski_mark"]}</span>'
    "&copy; 2026 Sarthak Dassarma. Built with plain HTML and hosted on GitHub Pages."
)
DIVIDER = f'\n      <div class="divider v" aria-hidden="true">{FIG["cantor"]}</div>'

# Runs before first paint: marks the page as JS-enabled and, if we arrived through the
# stacked-sheet transition, keeps the sheets covering the page until they sweep away.
HEAD_SCRIPT = (
    "<script>(function(){var d=document.documentElement;d.classList.add('js');"
    "try{if(sessionStorage.getItem('sd-pt')){sessionStorage.removeItem('sd-pt');"
    "if(!matchMedia('(prefers-reduced-motion: reduce)').matches)d.classList.add('pt-cover');}}catch(e){}"
    "setTimeout(function(){if(!window.__sd){d.classList.remove('js','pt-cover');}},4000);})();</script>"
)

PT = """<div class="pt" aria-hidden="true">
  <div class="pt__layer"></div><div class="pt__layer"></div><div class="pt__layer"></div>
</div>"""

INTERESTS = [
    "Algebraic geometry", "Combinatorics", "Distribution theory", "Functional analysis",
    "Measure theory", "Optimization", "Contest math", "Quantitative finance",
]


def nav(current, prefix=""):
    items = []
    for href, label in PAGES:
        cur = ' aria-current="page"' if href == current else ""
        items.append(
            f"""        <li><a class="nav-link" href="{prefix}{href}"{cur}>
          <span class="nav-link__roll"><span class="nav-link__label">{label}</span><span class="nav-link__label nav-link__label--dup" aria-hidden="true">{label}</span></span>
          <span class="nav-link__line" aria-hidden="true"></span>
        </a></li>"""
        )
    links = "\n".join(items)
    return f"""<header class="site-header">
  <div class="topbar">
    <a class="brand" href="{prefix}index.html" aria-label="Sarthak Dassarma, home">
      {LOGO}
      <span class="brand__name">Sarthak Dassarma</span>
    </a>
    <nav class="nav" aria-label="Primary">
      <ul class="nav__links">
{links}
      </ul>
    </nav>
  </div>
</header>"""


def page(filename, title, body_class, stage_html, content, description="", divider=False):
    desc = f'\n<meta name="description" content="{description}">' if description else ""
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="theme-color" content="#0d1016">{desc}
<title>{title}</title>
{HEAD_SCRIPT}
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="{FONTS}" rel="stylesheet">
<link rel="stylesheet" href="css/style.css">
<script src="js/site.js" defer></script>
</head>
<body class="{body_class}">

{PT}

<a class="skip" href="#content">Skip to content</a>

{nav(filename)}

{stage_html}

<div class="stack">
  <div class="sheet">
    <main class="sheet__content wrap" id="content">
{content}{DIVIDER if divider else ""}
    </main>
    <footer class="footer">
      <div class="wrap">{FOOTER_INNER}</div>
    </footer>
  </div>
</div>

</body>
</html>
"""


def project_shell(title, back_stage_html, content_html, head_extra="", body_end="", css="projects.css"):
    """Page shell for the demos in projects/ (one folder down, so every path gets ../)."""
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="theme-color" content="#0d1016">
<title>{title}</title>
{HEAD_SCRIPT}
<link rel="icon" href="../assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="{FONTS}" rel="stylesheet">
<link rel="stylesheet" href="../css/style.css">
<link rel="stylesheet" href="../css/{css}">
{head_extra}<script src="../js/site.js" defer></script>
</head>
<body>

{PT}

<a class="skip" href="#content">Skip to content</a>

{nav("projects.html", "../")}

<header class="stage">
  <div class="wrap">
{back_stage_html}
  </div>
</header>

<div class="stack">
  <div class="sheet">
    <main class="sheet__content wrap" id="content">
{content_html}
    </main>
    <footer class="footer">
      <div class="wrap">{FOOTER_INNER}</div>
    </footer>
  </div>
</div>
{body_end}
</body>
</html>
"""


def title_markup(text):
    return f'<span class="line"><span>{text}</span></span>'


def marquee():
    def copy(cls=""):
        c = f' class="{cls}"' if cls else ""
        return "".join(f"<span{c}>{w}</span><span{c}><i>&#10022;</i></span>" for w in INTERESTS)
    return f"""
  <div class="marquee" aria-hidden="true"><div class="marquee__track">{copy()}{copy("dup")}</div></div>
  <div class="wrap marquee-controls"><button class="chip-btn" type="button" data-marquee-toggle aria-pressed="false">Pause marquee</button></div>"""


def stage(title, lede="", extra="", art=""):
    lede_html = f'\n      <p class="stage__lede">{lede}</p>' if lede else ""
    art_html = ""
    if art:
        name, key = art
        art_html = f'\n  <div class="stage__art stage__art--{name} v" aria-hidden="true">{FIG[key]}</div>'
    return f"""<header class="stage">{art_html}
  <div class="wrap">
    <h1 class="page-title reveal">{title_markup(title)}</h1>{lede_html}
  </div>{extra}
</header>"""


def add_figs(content, mapping):
    """Give chosen entry cards a thumbnail column: mapping = {title substring: (figure key, square?)}."""
    parts = re.split(r'(?=<article class="entry")', content)
    out = []
    for p in parts:
        if p.startswith('<article class="entry"'):
            for sub, (key, sq) in mapping.items():
                if sub in p:
                    p = p.replace('<article class="entry"', '<article class="entry entry--fig"', 1)
                    cls = "entry__fig entry__fig--sq" if sq else "entry__fig"
                    p = p.replace("</article>", f'<div class="{cls} v" aria-hidden="true">{FIG[key]}</div>\n      </article>', 1)
                    break
        out.append(p)
    return "".join(out)


def tag_icon(key, text):
    return f'<span class="tag-ic"><span class="v" aria-hidden="true">{FIG[key]}</span>{text}</span>'


def decorate(content):
    """Opt cards into the scroll-reveal and layered-tilt animations."""
    content = content.replace('<article class="entry">', '<article class="entry" data-reveal data-tilt>')
    content = content.replace('<div class="group"', '<div data-reveal data-tilt class="group"')
    content = content.replace('<div class="group group--wide"', '<div data-reveal data-tilt class="group group--wide"')
    content = content.replace('<div class="now__row">', '<div class="now__row" data-reveal>')
    return content


# ---------------------------------------------------------------- HOME
home_stage = '''<header class="stage" data-paths>
  <div class="wrap">
    <p class="eyebrow eyebrow--plain">Hi! I&rsquo;m</p>
    <h1 class="display reveal"><span class="line"><span>Sarthak</span></span> <span class="line"><span>Dassarma<span class="dot">.</span></span></span></h1>
    <div class="contact">
      <a class="btn btn--solid" href="https://github.com/sarthakdass" target="_blank" rel="noopener">GitHub <span aria-hidden="true">&nearr;</span></a>
      <span class="chip-mono">s.dassarma [at] columbia [dot] edu</span>
    </div>
  </div>
</header>'''

home_content = '''      <p class="statement">I&rsquo;m a graduate student studying applied mathematics at Columbia University with a passion for creative problem solving. Interested in collaborating and connecting abstract structure with real problems to inspire impactful innovation.</p>
      <p class="aside">I completed my undergraduate studies at Santa Clara University, where I studied pure mathematics with an emphasis in applied mathematics.</p>'''

# ------------------------------------------------------------- PROJECTS
projects_content = '''      <article class="entry">
        <div class="entry__index" aria-hidden="true">01</div>
        <div class="entry__body">
          <header class="entry__head">
            <h2 class="entry__title">s-arbitrage &amp; Portfolio Allocation Research Framework (Python)</h2>
            <span class="entry__meta">Oct 2026</span>
          </header>
          <p>Built a walk-forward pairs-trading and portfolio-allocation backtester with cointegration testing, Kalman-filtered hedge ratios, and Ornstein-Uhlenbeck half-life estimation. Implemented five portfolio construction methods including convex risk-parity optimization and multi-start SLSQP for non-convex Sharpe optimization. Packaged as an installable Python library with CLI, CI pipeline (GitHub Actions, Python 3.10+) and documented methodology.</p>
          <ul class="tags"><li>NumPy</li><li>pandas</li><li>SciPy</li><li>statsmodels</li></ul>
          <div class="entry__links">
            <a class="btn" href="https://github.com/sarthakdass/statarb" target="_blank" rel="noopener">Source <span aria-hidden="true">&nearr;</span></a>
          </div>
        </div>
      </article>

      <article class="entry">
        <div class="entry__index" aria-hidden="true">02</div>
        <div class="entry__body">
          <header class="entry__head">
            <h2 class="entry__title">Fourier Visualization</h2>
            <span class="entry__meta">Sep 2026</span>
          </header>
          <p>The program takes a user's drawing with a mouse as a complex Fourier series function of 201 rotating vectors each rotated by a unique complex constant and calculates these complex constants to obtain the parameterized Fourier function. After the user draws their picture, the program displays an animation of the user's drawn shape with this Fourier Series.</p>
          <ul class="tags"><li>Python</li><li>Pygame</li><li>JavaScript</li><li>Canvas</li></ul>
          <div class="entry__links">
            <a class="btn btn--solid" href="projects/fourier-visualization.html">Live link <span aria-hidden="true">&nearr;</span></a>
            <a class="btn" href="https://github.com/sarthakdass/fourier-draw" target="_blank" rel="noopener">Source <span aria-hidden="true">&nearr;</span></a>
          </div>
        </div>
      </article>

      <article class="entry">
        <div class="entry__index" aria-hidden="true">03</div>
        <div class="entry__body">
          <header class="entry__head">
            <h2 class="entry__title">Gerrymandle Puzzle Generator &mdash; motivated by <a href="https://gerrymandle.com/" target="_blank" rel="noopener">gerrymandle</a></h2>
            <span class="entry__meta">Aug 2026</span>
          </header>
          <p>Designed a bitmask-based exhaustive search algorithm to partition a hex grid into connected districts, using recursive backtracking with branch-and-bound pruning. Built a randomized generate-and-test search that samples board layouts and colorings, then re-verifies each candidate for solution uniqueness. Wrote a template-free HTML/SVG renderer in pure Python to turn structured puzzle data into an interactive site.</p>
          <ul class="tags"><li>Python</li><li>HTML</li></ul>
          <div class="entry__links">
            <a class="btn btn--solid" href="projects/gerrymandle-boards.html" target="_blank" rel="noopener">Live link <span aria-hidden="true">&nearr;</span></a>
            <a class="btn" href="https://github.com/sarthakdass/gerrymandle-puzzles" target="_blank" rel="noopener">Source <span aria-hidden="true">&nearr;</span></a>
          </div>
        </div>
      </article>

      <article class="entry">
        <div class="entry__index" aria-hidden="true">04</div>
        <div class="entry__body">
          <header class="entry__head">
            <h2 class="entry__title">Discretized Method for Continuous-Time Black-Scholes</h2>
            <span class="entry__meta">May 2025</span>
          </header>
          <p>Implemented Black-Scholes pricing model with terminal boundary conditions and a 2-dimensional solution lattice. Applied backward recursion via a tridiagonal matrix to compute option prices across a stock price grid until time zero.</p>
          <ul class="tags"><li>Jupyter Notebook</li><li>pandas</li></ul>
        </div>
      </article>'''

# ------------------------------------------------------------------ MATH
math_content = '''      <article class="entry">
        <div class="entry__index" aria-hidden="true">01</div>
        <div class="entry__body">
          <header class="entry__head">
            <h2 class="entry__title">Distribution theory notes</h2>
            <span class="entry__meta">In progress</span>
          </header>
          <p>Working notes &mdash; to be posted soon.</p>
          <!--
          <div class="entry__links">
            <a class="btn btn--solid" href="papers/distribution-theory-notes.pdf" target="_blank" rel="noopener">Notes (PDF) <span aria-hidden="true">&nearr;</span></a>
          </div>
          -->
        </div>
      </article>

      <article class="entry">
        <div class="entry__index" aria-hidden="true">02</div>
        <div class="entry__body">
          <header class="entry__head">
            <h2 class="entry__title">Sobolev Spaces and the Calculus of Variations</h2>
            <span class="entry__meta">May 2026</span>
          </header>
          <p>Final Real Analysis presentation proving the straight line is the curve of minimal length between two points.</p>
          <div class="entry__links">
            <a class="btn btn--solid" href="papers/SobolevSpaces_COV.pdf" target="_blank" rel="noopener">Notes (PDF) <span aria-hidden="true">&nearr;</span></a>
          </div>
        </div>
      </article>'''

# --------------------------------------------------------------- HOBBIES
hobbies_content = '''      <section class="block" aria-labelledby="academic">
        <h2 class="block__title" id="academic">Academic Hobbies</h2>
        <p class="block__lede">Some things I like to do as of now:</p>
        <div class="groups">
          <div class="group group--wide">
            <h3>Math</h3>
            <ul class="cols">
              <li>Algebraic geometry</li>
              <li>Combinatorics</li>
              <li>Distribution theory</li>
              <li>Functional analysis</li>
              <li>Measure theory</li>
              <li>Optimization</li>
              <li>Contest math (not seriously for a while, but I used to dabble in the Olympiads)
                <ul>
                  <li>I also participated in the Putnam. I was a 2025 Top 500 Scorer with a score of 30</li>
                  <li>I was featured in <a href="https://www.scu.edu/news-and-events/feature-stories/2026/stories/math-major-and-putnam-standout-wants-to-change-the-way-you-think-about-math.html" target="_blank" rel="noopener">a very nice article</a></li>
                </ul>
              </li>
              <li>Quantitative finance / financial market games</li>
            </ul>
          </div>
          <div class="group">
            <h3>Teaching</h3>
            <ul>
              <li>I was a TA for Discrete Math, Probability, Statistics, Linear Algebra, and Abstract Algebra</li>
              <li>I taught contest math through my last three years of high school and my freshman year at college</li>
            </ul>
          </div>
          <div class="group">
            <h3>Writing</h3>
            <ul>
              <li><a href="https://oofset.substack.com/" target="_blank" rel="noopener">Check out my blog!</a></li>
            </ul>
          </div>
        </div>
      </section>

      <section class="block" aria-labelledby="other">
        <h2 class="block__title" id="other">Other Hobbies</h2>
        <ul class="plain" style="margin-top:24px">
          <li><strong>Logic puzzles.</strong> <a href="https://eev.ee/fyi/variant-sudoku/" target="_blank" rel="noopener">Variant sudoku</a> puzzles follow typical sudoku rules, but typically with a twist. Sometimes you may have to "color" cells that you know are the same but don't know the value of yet, and sometimes you will even have to construct the regions of the puzzle yourself.</li>
          <li><strong>Crosswords.</strong> I enjoy constructing and solving crosswords, especially <a href="https://en.wikipedia.org/wiki/Cryptic_crossword" target="_blank" rel="noopener">cryptic crosswords</a>.</li>
          <li><strong>Basketball.</strong> My personal preference is playing pickup basketball with my established friend groups, but I also practice alone and enjoy playing at new parks and making new friends. I also love learning and engaging in discussions about the history of basketball.</li>
          <li><strong>Watching sports.</strong> I enjoy watching most sports, notably: basketball, American football, cricket, football ("soccer").</li>
          <li><a href="https://setwithforks.com/" target="_blank" rel="noopener"><strong>Set</strong></a> is a card game played with a special deck of 3<sup>4</sup> = 81 cards where each card has four features that distinguish it from the others: color, shape, shading, and number. For each feature, there are three variants. Your aim is to select a set which is a combination of three cards such that for each of the four features, the variants of that feature expressed by the three cards are either all the same or all different. I hold the world record in 7 of the 16 game modes, including the base variant where I have completed a 24-set game in 23.25 seconds and Set-Chain, where I have completed a 34-set game in 27.85 seconds.</li>
          <li><a href="https://hanabi.github.io/about" target="_blank" rel="noopener"><strong>Hanabi</strong></a> is a cooperative card game where you see everyone's cards except their own. You give clues by color or rank to your teammates so they learn the identity of their cards, and they give you clues so you learn your cards. The goal is to play cards in an ordered stack like in solitaire &mdash; the default is 5 stacks of 5 different colors of cards ranked 1 through 5, but this can change in other variants. The user <strong>SpinTop</strong> and I achieved a 31-second two-player five-suit speedrun 4 years ago, which was 3rd fastest at the time and still in the top 10.</li>
          <li><strong>Cooperative games.</strong> Board games, card games, video games, etc.</li>
          <li><strong>Food.</strong> I love eating food from all parts of the world. Always happy to give and receive new recommendations. I believe in supporting restaurants, not gatekeeping!</li>
          <li><strong>Hiking.</strong></li>
          <li><strong>Reading.</strong></li>
          <li><strong>Poker.</strong></li>
        </ul>
      </section>'''

# ------------------------------------------------------------------- NOW
now_content = '''      <dl class="now">
        <div class="now__row">
          <dt>Where I am</dt>
          <dd>New York, NY during the academic year. The San Francisco Bay Area during breaks.</dd>
        </div>
        <div class="now__row">
          <dt>What I'm studying now</dt>
          <dd>
            <ul class="tags"><li>{TAG_AG}</li><li>{TAG_DT}</li><li>{TAG_OPT}</li><li>{TAG_QF}</li></ul>
          </dd>
        </div>
        <div class="now__row">
          <dt>Where I am/will be working</dt>
          <dd>I am finishing up my summer research and pursuing my master's in applied mathematics. My interests are much more heavily skewed towards mathematics, particularly in subjects like algebraic geometry, combinatorics, analysis, etc.</dd>
        </div>
      </dl>

      <ul class="bullets">
        <li>I am spending quite a bit of time writing up my distribution theory notes, and hope to publish that soon.</li>
        <li>I plan to spend a little bit of time studying up on financial concepts, conducting some mock trading, etc.</li>
        <li>In the medium to long term, I want teaching mathematics to be a part of my life. Currently it is not, and I have not been seriously looking into ways to change this in the short term.</li>
      </ul>'''


now_content = (now_content
    .replace("{TAG_AG}", tag_icon("elliptic_icon", "Algebraic geometry"))
    .replace("{TAG_DT}", tag_icon("mollifier", "Distribution theory"))
    .replace("{TAG_OPT}", tag_icon("contours", "Optimization"))
    .replace("{TAG_QF}", tag_icon("spread", "Quantitative finance")))

# thumbnails on cards
projects_content = add_figs(decorate(projects_content), {
    "s-arbitrage": ("spread", False),
    "Fourier Visualization": ("epicycle", True),
    "Gerrymandle": ("hexes", False),
    "Black-Scholes": ("black_scholes", False),
})
math_content = add_figs(decorate(math_content), {
    "Distribution theory notes": ("mollifier", False),
    "Sobolev Spaces and the Calculus of Variations": ("variations", False),
})
hobbies_content = decorate(hobbies_content)
now_content = decorate(now_content)

# ---------- Visuals gallery page
TILES = [
    ("gasket", "Apollonian gasket", "dark", "Math page: cropped into the corner of the dark layer, behind the title.", "Descartes circle theorem", False),
    ("hilbert", "Hilbert curve", "dark", "Projects page: a faint texture down the right edge of the dark layer.", "space-filling curve", False),
    ("elliptic", "Elliptic curve + group law", "dark", "Now page: behind the title, with a tiny version on the Algebraic geometry tag. y\u00b2 = x\u00b3 \u2212 x + 1, with P + Q.", "chord-and-tangent addition", False),
    ("sierpinski", "Sierpinski triangle", "dark", "End-of-page mark in every footer. It is also Pascal\u2019s triangle mod 2.", "fractal", False),
    ("fano", "Fano plane", "dark", "Hobbies page: tucked into the corner of the dark layer, behind the title.", "7 points, 7 lines", False),
    ("cantor", "Cantor set", "light", "Six-level divider at the bottom of Projects, Math, Hobbies and Now.", "measure theory", True),
    ("mollifier", "Mollifiers \u2192 \u03b4", "light", "Thumbnail for the Distribution theory notes, and the Distribution theory tag icon.", "distribution theory", False),
    ("variations", "Curves between two points", "light", "Thumbnail for Sobolev Spaces and the Calculus of Variations; the straight line wins.", "calculus of variations", False),
    ("contours", "Level sets + gradient descent", "light", "The Optimization icon.", "optimization", False),
    ("spread", "Mean-reverting spread", "light", "Thumbnail for s-arbitrage: entries when the spread leaves the \u00b12\u03c3 band. Also the Quantitative finance icon.", "quantitative finance", False),
    ("black_scholes", "Call price \u2192 payoff", "light", "Thumbnail for the Black\u2013Scholes project as expiry approaches.", "quantitative finance", False),
    ("hexes", "Hex districts", "light", "Thumbnail for the Gerrymandle puzzle generator.", "combinatorics", False),
    ("epicycle", "Epicycles", "light", "Thumbnail for Fourier Visualization.", "Fourier series", False),
]


def tile(key, name, tone, where, tag, wide):
    w = " vtile__fig--wide" if wide else ""
    return f"""        <article class="vtile" data-reveal data-tilt>
          <div class="vtile__fig {tone}{w} v" role="img" aria-label="{name}">{FIG[key]}</div>
          <div class="vtile__body">
            <h3 class="vtile__name">{name}</h3>
            <p class="vtile__where">{where}</p>
            <span class="vtile__tag">{tag}</span>
          </div>
        </article>"""


visuals_content = f"""      <section class="block" aria-labelledby="gallery">
        <h2 class="block__title" id="gallery">The gallery</h2>
        <p class="block__lede">Dark tiles are meant for the dark top layer; light tiles are small thumbnails and icons for cards.</p>
        <div class="gal">
{chr(10).join(tile(*t) for t in TILES)}
        </div>
      </section>"""


OUT = {
    "index.html": page(
        "index.html", "Sarthak Dassarma", "home", home_stage, home_content,
        "Sarthak Dassarma — graduate student in applied mathematics at Columbia University.",
    ),
    "projects.html": page(
        "projects.html", "Projects — Sarthak Dassarma", "",
        stage("Projects", "Things I've built or am building.", art=("hilbert", "hilbert")),
        projects_content, divider=True,
    ),
    "math.html": page(
        "math.html", "Math — Sarthak Dassarma", "",
        stage("Math", "Notes, handouts, and write-ups, mostly typeset in LaTeX.", art=("gasket", "gasket")),
        math_content, divider=True,
    ),
    "hobbies.html": page(
        "hobbies.html", "Hobbies — Sarthak Dassarma", "",
        stage("Hobbies", extra=marquee(), art=("fano", "fano")),
        hobbies_content, divider=True,
    ),
    "now.html": page(
        "now.html", "Now — Sarthak Dassarma", "",
        stage("Now", art=("elliptic", "elliptic_decor")),
        now_content, divider=True,
    ),
    "visuals.html": page(
        "visuals.html", "Visuals — Sarthak Dassarma", "",
        stage("Visuals", "Math visuals used on this website!"),
        visuals_content,
    ),
}

if __name__ == "__main__":
    for name, html in OUT.items():
        with open(name, "w", encoding="utf-8") as f:
            f.write(html)
        print("wrote", name, len(html), "bytes")
