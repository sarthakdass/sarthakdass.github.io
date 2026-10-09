#!/usr/bin/env python3
"""Rewrites the site header (logo + nav) in the hand-edited project pages so it matches build_pages.py.

    python3 tools/sync_nav.py

The six main pages, the taxi page and the Writing section are generated, so they never need this.
Run it after adding a section to PAGES in build_pages.py.
"""
import glob
import os
import re
import sys

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(root)
sys.path.insert(0, root)
from build_pages import nav  # noqa: E402

new = nav("projects.html", "../")
for path in ["projects/clt-visualization.html", "projects/fourier-visualization.html", "projects/gerrymandle-boards.html"]:
    if not os.path.exists(path):
        continue
    h = open(path, encoding="utf-8").read()
    out = re.sub(r'<header class="site-header">.*?</header>', lambda m: new, h, count=1, flags=re.S)
    if out != h:
        open(path, "w", encoding="utf-8").write(out)
        print("updated", path)
