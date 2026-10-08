#!/usr/bin/env python3
"""Re-skins the raw output of the Gerrymandle puzzle generator into the site theme.

Run from the site root:
    python3 tools/restyle_gerrymandle.py  path/to/raw-generator-output.html  projects/gerrymandle-boards.html

It keeps every board, count and sentence exactly as generated; it only swaps the page shell and
styling (css/style.css + css/projects.css), renames the map panel class `.stage` -> `.board`
(so it can't collide with the site's dark header layer) and updates the show/hide-solution script.
"""
import re, sys, os

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, root)
os.chdir(root)
from build_pages import project_shell, title_markup  # noqa: E402

if len(sys.argv) != 3:
    sys.exit(__doc__)
src = open(sys.argv[1], encoding="utf-8").read()

# --- dossier tidy-up: drop the redundant row, hide two answers behind spoilers, drop the prose note ---
def tidy(h):
    h = re.sub(r"\s*<dt>Of those, purple wins</dt><dd class=\"hit\">exactly 1</dd>", "", h)
    def spoil(m):
        return '%s<dd><span class="spoiler" role="button" tabindex="0" aria-label="Reveal answer">%s</span></dd>' % (m.group(1), m.group(2).strip())
    h = re.sub(r"(<dt>(?:Most districts purple wins under any cut|The winning split)</dt>)<dd>(.*?)</dd>", spoil, h)
    h = re.sub(r'\s*<p class="note">.*?</p>', "", h, flags=re.S)
    return h

title = re.search(r"<title>(.*?)</title>", src, re.S).group(1)
h1 = re.search(r"<h1>(.*?)</h1>", src, re.S).group(1)
lede = re.search(r'<div class="lede">\s*(.*?)\s*</div>', src, re.S).group(1)
rules = re.search(r'(<div class="rules">.*?</div>)\s*(?=<div class="secthead">)', src, re.S).group(1)
rest = re.search(r'(<div class="secthead">.*?)</div>\s*<script>', src, re.S).group(1)
script = re.search(r"<script>.*?</script>", src, re.S).group(0)

# the map panel was called .stage; the site already uses that name for its dark header layer
rest = tidy(rest)
rest = rest.replace('<div class="stage">', '<div class="board">')
script = script.replace("querySelector('.stage')", "querySelector('.board')")
assert "'.board'" in script and 'class="board"' in rest
rest = rest.replace('<section class="puzzle"', '<section class="puzzle" data-reveal')

# lede paragraphs become the stage lede under the title
paras = re.findall(r"<p>(.*?)</p>", lede, re.S)
lede_html = "\n".join(f'    <p class="stage__lede stage__lede--wide">{re.sub(chr(10), " ", p).strip()}</p>' for p in paras)

stage_inner = f'''    <a class="back-link" href="./">&larr; Back to projects</a>
    <h1 class="page-title page-title--long reveal"><span class="line"><span>{h1}</span></span></h1>
{lede_html}'''

content = rules + "\n" + rest
html = project_shell(f"{title} — Sarthak Dassarma", stage_inner, content, head_extra='<script src="../js/gerrymandle.js" defer></script>\n', body_end=script)
open(sys.argv[2], "w", encoding="utf-8").write(html)
print("wrote", sys.argv[2], len(html), "bytes;", rest.count('class="puzzle"'), "puzzles")
