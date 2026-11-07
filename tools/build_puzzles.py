#!/usr/bin/env python3
"""Writes puzzles/index.html (the list) and puzzles/<slug>/index.html (one playable page per puzzle).

Run from the site root:  python3 tools/build_puzzles.py

To add a puzzle, append an entry to PUZZLES below and run this script again. The player is js/sudoku.js and
the styles are css/puzzles.css.  Each puzzle stores only a salted hash per cell as its answer key ("check"),
so the solution digits never appear on the site or in this repository; the player compares hashes.
Cell coordinates are [row, column], both counted 1-9 from the top-left.
A puzzle with "layout": "wide" and a "thermos" list (see LB_THERMOS) is drawn as two boards side by side: the grid
to fill in, plus a display-only reference grid showing the gray thermometers, with the pad and rules underneath.
"""
import html
import json
import re
import os
import sys

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, root)
os.chdir(root)
from build_pages import page, title_markup  # noqa: E402

CELL, INSET = 100, 5

EXTRA_CARDS = ["puzzle_generator_card.html"]

# The seven letter-thermometers of "Letter Blocks". Each is a list of paths made of (row, column) cells inside a 3x3 box
# (0-2); every path starts at the bulb. "box" is where the letter is drawn on the reference board (row, column of boxes).
LB_THERMOS = [
    {"box": (0, 0), "paths": [[(1, 1), (0, 0), (1, 0), (2, 0)], [(1, 1), (0, 2), (1, 2), (2, 2)]]},                     # M
    {"box": (0, 1), "paths": [[(1, 0), (0, 0), (0, 1), (0, 2)], [(1, 0), (1, 1)], [(1, 0), (2, 0), (2, 1), (2, 2)]]},   # E
    {"box": (0, 2), "paths": [[(1, 1), (0, 0), (1, 0), (2, 0)], [(1, 1), (2, 2), (1, 2), (0, 2)]]},                     # N
    {"box": (1, 0), "paths": [[(0, 2), (0, 1), (0, 0), (1, 0), (2, 0), (2, 1), (2, 2)], [(1, 0), (1, 1)]]},             # E
    {"box": (1, 1), "paths": [[(1, 1), (0, 2), (0, 1), (0, 0)], [(1, 1), (2, 0), (2, 1), (2, 2)]]},                     # Z
    {"box": (1, 2), "paths": [[(2, 2), (2, 1), (2, 0), (1, 0), (0, 0), (0, 1), (0, 2)], [(1, 0), (1, 1)]]},             # E
    {"box": (2, 0), "paths": [[(0, 2), (0, 1), (0, 0), (1, 0), (1, 1), (1, 2), (2, 2), (2, 1), (2, 0)]]},               # S
]

PUZZLES = [
    {
        "slug": "letter-blocks",
        "title": "Letter Blocks",
        "date": "Nov 2026",
        "tags": ["Sudoku", "Thermometers"],
        "layout": "wide",           # two boards side by side, pad and rules underneath
        "summary": "A thermo Sudoku where seven letter-shaped thermometers each go in a different 3&times;3 box.",
        "rules": [
            ("", "Every thermometer in the right Sudoku grid must be placed in a unique 3&times;3 region on the left Sudoku grid, leaving two blank."),
            ("", "Moreover, you are not allowed to rotate, reflect, or translate a thermometer inside the region it is placed."),
            ("", "Every path running from a shared bulb to a tip must form its own strictly increasing sequence."),
        ],
        "givens": "000000000" + "010000000" + "000103000" + "000000000" + "000000000" + "000000000" + "000308000" + "000000060" + "000000000",
        "cages": [],
        "lines": [],
        "thermos": LB_THERMOS,
        # salted hash of every correct digit (see h53 in js/sudoku.js)
        "check": ["27076ogaha3","1v1kcli66q7","2cixsdeddm3","1gwd1daywoi","122ajqmitzo","12muraaji6g","dnpmmxbtvu","29z1gbxqeq0","gml5avhu9s","1cyt2g54z9f","1uz42x0p59j","2dmbee2wlbr","20h63jexui4","b8g90z1o7n","2ahtktds3ws","25lqy9yvbhu","2af9debr522","e4t3hvdchr","21m9e8vibz","ki2raj131h","2exu61gjo4y","238m8fica9i","188h1j7b6r9","136a5xjzlrn","ckdbcob3iw","1cgrp48e5t2","lh7xwafl1c","vohfebl32l","s3igc3w9zk","10fwo0zbzx7","1nn38wulgvx","1o2j3mdiq59","1w09kdx92ys","ypldlud0eq","74rlsfhv4o","23bd7wmwe96","vla6xgc9sv","5u2kn6s4dv","18otshovs9r","iatxuqzd1r","1lwu2tjnma5","6xp3dtslq","gk0do9obrq","1t5ip6l4xv7","1hufg26m14z","16jwiae90u1","77nn5zi72f","12p4ihmxo89","899j0nb78p","1lw5nxdbr42","1hnyqvs0zu3","loi7tujyzd","du77bdp3i8","lo51hyola3","258dsotorn0","23mdrtchd0h","1ouufw5vafn","14fqw7r11na","26x8fi9mj1t","1027mem0n74","slm8lgm3g6","1qxpeysun3g","xo4493woyk","1rx4zrp1g6q","1xswyk2cjit","greqfnfuht","2dzfud644a1","14ojtdbj82l","29phpw04wip","20gb8yvm0ts","257v5takvo8","280zdr1rc4z","2e5fj48x7gv","19oq4k1awrl","z4lfowmime","1vxv4nrb21q","owehg6xo1y","9f91ty7ogt","6rxnnnpgrb","204x7jpemqu","1jj066elydw"],
    },
    {
        "slug": "entry",
        "title": "Entry",
        "date": "Oct 2026",
        "tags": ["Sudoku", "Killer Cage", "German Whisper"],
        "summary": "A Sudoku with killer cages and German whisper lines.",
        "rules": [
            ("Classical Sudoku rules apply:", "every row, column and 3&times;3 box contains 1&ndash;9."),
            ("Killer cages (dashed):", "the digits in a cage add up to the small number in its top-left corner. Sudoku rules still apply, so a cage may repeat a digit only if its cells are in different rows, columns and boxes."),
            ("German Whisper lines (red):", "neighboring digits on a line differ by at least 5."),
        ],
        # 81 characters, row by row; 0 = empty
        "givens": "007000000" + "000000000" + "000000000" + "000000000" + "000000007" + "000000008" + "000000000" + "000000000" + "000000000",
        "cages": [
            (12, [(1, 1), (2, 1), (3, 1)]),
            (15, [(3, 5), (3, 6), (4, 5)]),
            (22, [(3, 7), (3, 8), (4, 7), (4, 8)]),
            (20, [(4, 4), (5, 4), (6, 4), (7, 4)]),
            (19, [(5, 2), (5, 3), (6, 2)]),
            (18, [(6, 5), (6, 6), (7, 5)]),
            (26, [(8, 3), (8, 4), (8, 5), (9, 3), (9, 4)]),
            (20, [(9, 7), (9, 8), (9, 9)]),
        ],
        "lines": [
            [(4, 4), (3, 3), (4, 2), (4, 3), (3, 4), (3, 5), (4, 5)],
            [(2, 9), (1, 8), (2, 8), (2, 7), (3, 8), (4, 7), (4, 8)],
            [(7, 9), (6, 8), (7, 8), (8, 9), (9, 9)],
            [(8, 1), (7, 2), (8, 3), (7, 3), (8, 4), (9, 4)],
        ],
        # salted hash of every correct digit (see h53 in js/sudoku.js)
        "check": ["r08zw3alfg", "2fy5kxelqav", "1t11j7pk3ia", "7htms2y7ku", "3c99si7ihc", "1d0t8x1mgpi", "cfmfzvf26h", "11asisogu3c", "xiv07rkqfa", "2ggpxesfgv9", "1o8x5gxu9hf", "1rsb8i3wq48", "20phfkjwvmi", "g4xxsvzr5n", "2atg40o42jz", "229q9tuk8rm", "e2pojgp8pd", "1c6dnkh6snl", "z2qxoireu5", "gi3emzs3jd", "ahz9jpr8dg", "2e9i1ukec3v", "2c7hq7ois19", "10kmi6cyz53", "w5ll508tr1", "1jpiev30u51", "2ey61pdj1o3", "m9yt0amiwx", "4ph4xhmsfg", "1rppflqjbc4", "jh8a17ju62", "1tbe1elod5n", "ppxw6yabsm", "1260vxcj0kr", "sg533yuint", "1aznl51wckf", "28uo6d66vxn", "25ysoqpuqch", "1on63v9ogbp", "rfm46ys3dt", "uezvyo0b2w", "1xd5z1h8cor", "2fxd1fhivys", "23v8v7o1vit", "1uifwrk1at5", "2cs40qxnnlz", "26gmyfyiana", "1pdg1e44seq", "8o9bj6ymrz", "dwapemut29", "rrf4877hqe", "1oxaqphwj0n", "yy8ah5le7f", "hgn8g0in38", "i452u1rn08", "1jbbon0ocrt", "1afyv5b737s", "2670c83qiw3", "1o7sbjovns0", "15hz7pw1rky", "1mf9cz25z7r", "193l5hj7hqj", "2d6074abge3", "1fhxj8m97dj", "1sog98b7uy3", "23ihrd72mrk", "mokdbjlv41", "27qb03wos2k", "17de8pmvke0", "1m9xnpdkqde", "1oib8mycmt3", "2c5easl4tt", "24rpkoa7n4k", "1b6pc47ln3b", "22qilv3n3bx", "lr6ztbpwuw", "1g0pwu1h7ax", "2g04y7lxfso", "8nbrfe5bml", "15pc2yc3x7l", "2crwmsnnpk7"],
    },
]


# ----------------------------------------------------------------------------- geometry
def cage_path(cells):
    """Dashed outline of a killer cage, inset from the cell edges, as one closed SVG path (board units: 100 per cell)."""
    cs = {(r - 1, c - 1) for r, c in cells}
    sides = [  # start corner, tangent (dx, dy), inward normal (dx, dy)
        ((0, 0), (1, 0), (0, 1)),
        ((1, 0), (0, 1), (-1, 0)),
        ((1, 1), (-1, 0), (0, -1)),
        ((0, 1), (0, -1), (1, 0)),
    ]
    segs = []
    for r, c in sorted(cs):
        for (sx, sy), (tx, ty), (nx, ny) in sides:
            t = (ty, tx)               # tangent as (d_row, d_col)
            out = (-ny, -nx)           # outward neighbour as (d_row, d_col)
            if (r + out[0], c + out[1]) in cs:
                continue
            behind = (r - t[0], c - t[1])
            ahead = (r + t[0], c + t[1])
            diag_b = (behind[0] + out[0], behind[1] + out[1])
            diag_a = (ahead[0] + out[0], ahead[1] + out[1])
            s_shift = INSET if behind not in cs else (0 if diag_b not in cs else -INSET)
            e_shift = -INSET if ahead not in cs else (0 if diag_a not in cs else INSET)
            x0 = (c + sx) * CELL + nx * INSET + tx * s_shift
            y0 = (r + sy) * CELL + ny * INSET + ty * s_shift
            x1 = (c + sx) * CELL + tx * CELL + nx * INSET + tx * e_shift
            y1 = (r + sy) * CELL + ty * CELL + ny * INSET + ty * e_shift
            segs.append(((x0, y0), (x1, y1)))
    # chain the segments into loops
    ends = {}
    for k, (a, b) in enumerate(segs):
        ends.setdefault(a, []).append(k)
        ends.setdefault(b, []).append(k)
    used, d = set(), []
    for k0 in range(len(segs)):
        if k0 in used:
            continue
        used.add(k0)
        a, b = segs[k0]
        pts = [a, b]
        while pts[-1] != pts[0]:
            nxt = [k for k in ends[pts[-1]] if k not in used]
            if not nxt:
                break
            k = nxt[0]
            used.add(k)
            p, q = segs[k]
            pts.append(q if p == pts[-1] else p)
        pts = pts[:-1] if pts[-1] == pts[0] else pts
        d.append("M" + " L".join(f"{x} {y}" for x, y in pts) + " Z")
    return " ".join(d)


def label_pos(cells):
    r, c = min((r, c) for r, c in cells)       # top-most, then left-most cell
    return (c - 1) * CELL + 16, (r - 1) * CELL + 33, (r - 1) * 9 + (c - 1)


def center(rc):
    return (rc[1] - 1) * CELL + CELL // 2, (rc[0] - 1) * CELL + CELL // 2


THERMO_W, BULB_R = 28, 36


def thermo_cell(box, rc):
    """Centre of cell rc (row, col inside a 3x3 box) of the box (row, col) on the 9x9 reference board."""
    return (box[1] * 3 + rc[1]) * CELL + CELL // 2, (box[0] * 3 + rc[0]) * CELL + CELL // 2


def thermo_group(p, attrs):
    """All thermometers of the reference board as one SVG group: arms as round-capped lines, a bulb at each start."""
    out = [f"<g {attrs}>"]
    bulbs = []
    for t in p["thermos"]:
        for path in t["paths"]:
            out.append('<polyline fill="none" points="%s"/>' % " ".join("%d,%d" % thermo_cell(t["box"], rc) for rc in path))
        bulbs.append(thermo_cell(t["box"], t["paths"][0][0]))
    out += ['<circle cx="%d" cy="%d" r="%d" fill="currentColor" stroke="none"/>' % (x, y, BULB_R) for x, y in bulbs]
    out.append("</g>")
    return "".join(out)


def ref_board(p):
    """The right-hand board of a two-board puzzle: an empty grid showing the gray thermometers (display only)."""
    thin = "".join(f"M{n * 100} 0V900M0 {n * 100}H900" for n in range(1, 9) if n % 3)
    thick = "".join(f"M{n * 100} 0V900M0 {n * 100}H900" for n in range(3, 9, 3))
    label = "The thermometers to place, each used once: M, E, N, E, Z, E and S. Each letter is drawn in its own 3 by 3 box of this grid, with a bulb at the start of every thermometer."
    return ('<svg class="sd-ref" viewBox="-5 -5 910 910" role="img" aria-label="%s">' % label
            + '<rect class="sd-bg" x="-5" y="-5" width="910" height="910"/>'
            + f'<path class="sd-thin" d="{thin}"/>'
            + thermo_group(p, 'class="sd-thermos"')
            + f'<path class="sd-thick" d="{thick}"/><rect class="sd-frame" x="0" y="0" width="900" height="900"/></svg>')


def player_data(p):
    cages = []
    for total, cells in p["cages"]:
        lx, ly, lc = label_pos(cells)
        cages.append({"sum": total, "path": cage_path(cells), "lx": lx, "ly": ly, "labelCell": lc})
    lines = [{"points": " ".join("%d,%d" % center(rc) for rc in ln)} for ln in p["lines"]]
    return {"id": p["slug"], "title": p["title"], "givens": p["givens"], "cages": cages, "lines": lines, "check": p["check"]}


# ----------------------------------------------------------------------------- list page
def thumb(p):
    d = player_data(p)
    thin = "".join(f"M{n * 100} 0V900M0 {n * 100}H900" for n in range(1, 9) if n % 3)
    thick = "".join(f"M{n * 100} 0V900M0 {n * 100}H900" for n in range(3, 9, 3))
    out = ['<svg viewBox="-8 -8 916 916" role="img" aria-label="Preview of the puzzle %s" xmlns="http://www.w3.org/2000/svg">' % html.escape(p["title"])]
    out.append(f'<path d="{thin}" fill="none" stroke="currentColor" stroke-opacity="0.28" stroke-width="3"/>')
    if p.get("thermos"):
        out.append(thermo_group(p, f'opacity="0.34" stroke="currentColor" stroke-width="{THERMO_W}" stroke-linecap="round" stroke-linejoin="round"'))
    out.append(f'<path d="{thick}" fill="none" stroke="currentColor" stroke-opacity="0.8" stroke-width="7"/>')
    out.append('<rect x="0" y="0" width="900" height="900" fill="none" stroke="currentColor" stroke-opacity="0.85" stroke-width="9"/>')
    for ln in d["lines"]:
        out.append(f'<polyline points="{ln["points"]}" fill="none" stroke="#d03a3a" stroke-opacity="0.55" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>')
    for cg in d["cages"]:
        out.append(f'<path d="{cg["path"]}" fill="none" stroke="currentColor" stroke-opacity="0.8" stroke-width="5" stroke-dasharray="14 11"/>')
    out.append("</svg>")
    return "".join(out)


def list_page():
    stage = f"""<header class="stage">
  <div class="wrap">
    <h1 class="page-title reveal">{title_markup("Puzzles")}</h1>
  </div>
</header>"""
    cards = []
    for n, p in enumerate(PUZZLES, start=1):
        tags = "".join(f"<li>{html.escape(t)}</li>" for t in p["tags"])
        cards.append(f"""      <article class="entry entry--card" data-reveal data-tilt>
        <header class="entry__top">
          <span class="entry__index" aria-hidden="true">{n:02d}</span>
          <h2 class="entry__title">{html.escape(p["title"])}</h2>
          <span class="entry__meta">{p["date"]}</span>
        </header>
        <div class="entry__main">
        <div class="entry__body">
          <ul class="tags">{tags}</ul>
          <div class="entry__links">
            <a class="btn btn--solid btn--lilac" href="{p["slug"]}/">Play <span aria-hidden="true">&rarr;</span></a>
          </div>
        </div>
        <div class="entry__fig v" aria-hidden="true">{thumb(p)}</div>
        </div>
      </article>""")
    # tools that belong with the puzzles (hand-written cards, numbered after the playable puzzles)
    n = len(PUZZLES)
    for extra in EXTRA_CARDS:
        n += 1
        card = open(os.path.join(root, "tools", extra), encoding="utf-8").read()
        cards.append(re.sub(r'(entry__index" aria-hidden="true">)\d+', lambda m: m.group(1) + f"{n:02d}", card, count=1).rstrip("\n"))
    content = "\n\n".join(cards)
    return page("puzzles.html", "Puzzles — Sarthak Dassarma", "", stage, content, divider=True,
                up="../", nav_current="puzzles.html",
                head_extra='<link rel="stylesheet" href="../css/puzzles.css">\n',
                description="Logic puzzles by Sarthak Dassarma, playable in the browser.")


# ----------------------------------------------------------------------------- puzzle page
ICON = {
    "digit": '<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="3.5" y="3.5" width="25" height="25" rx="5" fill="none" stroke="currentColor" stroke-width="2.4"/><text x="16" y="17" text-anchor="middle" dominant-baseline="central" font-family="Inter,sans-serif" font-weight="700" font-size="19" fill="currentColor">9</text></svg>',
    "corner": '<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="3.5" y="3.5" width="25" height="25" rx="5" fill="none" stroke="currentColor" stroke-width="2.4"/><g font-family="Inter,sans-serif" font-weight="700" font-size="9" fill="currentColor" text-anchor="middle" dominant-baseline="central"><text x="10" y="10">1</text><text x="22" y="10">2</text><text x="10" y="22">3</text></g></svg>',
    "center": '<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="3.5" y="3.5" width="25" height="25" rx="5" fill="none" stroke="currentColor" stroke-width="2.4"/><text x="16" y="17" text-anchor="middle" dominant-baseline="central" font-family="Inter,sans-serif" font-weight="700" font-size="11" fill="currentColor">12</text></svg>',
    "color": '<svg viewBox="0 0 32 32" aria-hidden="true"><defs><clipPath id="sdw"><rect x="4.5" y="4.5" width="23" height="23" rx="4"/></clipPath></defs><g clip-path="url(#sdw)"><path d="M16 16 L16 2 L26 6 Z" fill="#f4a3a3"/><path d="M16 16 L26 6 L30 16 Z" fill="#f6c08b"/><path d="M16 16 L30 16 L26 26 Z" fill="#f1e286"/><path d="M16 16 L26 26 L16 30 Z" fill="#a8dba0"/><path d="M16 16 L16 30 L6 26 Z" fill="#8bd7cf"/><path d="M16 16 L6 26 L2 16 Z" fill="#8dc4f1"/><path d="M16 16 L2 16 L6 6 Z" fill="#b7a5ef"/><path d="M16 16 L6 6 L16 2 Z" fill="#efa7d4"/></g><rect x="3.5" y="3.5" width="25" height="25" rx="5" fill="none" stroke="currentColor" stroke-width="2.4"/></svg>',
    "undo": '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M12 8 L6 14 L12 20" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M7 14 H19 a7 7 0 0 1 0 14 H14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    "redo": '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M20 8 L26 14 L20 20" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M25 14 H13 a7 7 0 0 0 0 14 H18" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    "check": '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M6 17 L13 24 L26 8" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    "del": '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M11 7 H27 a2 2 0 0 1 2 2 V23 a2 2 0 0 1 -2 2 H11 L3 16 Z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M16 12 L24 20 M24 12 L16 20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
}


def puzzle_page(p):
    stage = f"""<header class="stage">
  <div class="wrap">
    <a class="back-link" href="../">&larr; Back to puzzles</a>
    <h1 class="page-title reveal">{title_markup(html.escape(p["title"]))}</h1>
  </div>
</header>"""
    wide = p.get("layout") == "wide"
    tags = "".join(f"<li>{html.escape(t)}</li>" for t in p["tags"])
    rules = "".join("<li>" + (f"<strong>{a}</strong> " if a else "") + f"{b}</li>" for a, b in p["rules"])
    keys = "".join(f'<button class="sd-key" type="button" data-n="{n}" aria-label="{n}">{n}</button>' for n in range(1, 10))
    data = json.dumps(player_data(p), separators=(",", ":"))
    top = f"""<div class="sd__top">
              <span class="sd__timer" id="sd-timer" role="timer" aria-label="Elapsed time">0:00</span>
              <span class="sd__topbtns">
                <button class="sd__pill sd__pill--icon" id="sd-fs" type="button" aria-pressed="false" aria-label="Fullscreen" title="Fullscreen"><svg class="sd__fs-in" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg><svg class="sd__fs-out" viewBox="0 0 16 16" aria-hidden="true"><path d="M6 2v4H2M14 6h-4V2M10 14v-4h4M2 10h4v4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="sd__fslabel">Exit</span></button>
                <button class="sd__pill" id="sd-pause" type="button" aria-pressed="false"><svg viewBox="0 0 16 16" aria-hidden="true"><rect x="3.5" y="2.5" width="3" height="11" rx="1" fill="currentColor"/><rect x="9.5" y="2.5" width="3" height="11" rx="1" fill="currentColor"/></svg><span>Pause</span></button>
                <button class="sd__pill" id="sd-reset" type="button">Reset</button>
              </span>
            </div>"""
    del_key = f'<button class="sd-key sd-key--del" id="sd-del" type="button" aria-label="Clear selected cells" title="Clear (Backspace)">{ICON["del"]}</button>'
    modes = f"""<div class="sd__modes">
                  <button class="sd-tool" type="button" data-mode="digit" aria-pressed="true" aria-label="Digit mode" title="Digit: big numbers">{ICON["digit"]}</button>
                  <button class="sd-tool" type="button" data-mode="corner" aria-pressed="false" aria-label="Corner marks" title="Corner marks (hold Shift)">{ICON["corner"]}</button>
                  <button class="sd-tool" type="button" data-mode="center" aria-pressed="false" aria-label="Center marks" title="Center marks (hold Ctrl)">{ICON["center"]}</button>
                  <button class="sd-tool" type="button" data-mode="color" aria-pressed="false" aria-label="Colors" title="Colors">{ICON["color"]}</button>
                </div>"""
    actions = f"""<div class="sd__actions">
                <button class="sd-tool" id="sd-undo" type="button" aria-label="Undo" title="Undo (Ctrl+Z)">{ICON["undo"]}</button>
                <button class="sd-tool" id="sd-redo" type="button" aria-label="Redo" title="Redo (Ctrl+Y)">{ICON["redo"]}</button>
                <button class="sd-tool sd-tool--check" id="sd-check" type="button" aria-label="Check my digits" title="Check">{ICON["check"]}</button>
              </div>"""
    rules_card = f"""<section class="sd__rules" aria-labelledby="rules">
              <div class="sd__rulehead"><h2 id="rules">Rules</h2><ul class="tags">{tags}</ul></div>
              <ul class="sd__rulelist">{rules}</ul>
            </section>"""
    paused = '<div class="sd__paused" id="sd-paused" hidden><strong>Puzzle paused</strong><button class="sd__pill sd__pill--solid" id="sd-resume" type="button">Resume</button></div>'
    if wide:
        # two boards side by side (left: the one you fill in, right: the thermometers to place); pad and rules underneath
        content = f"""      <section class="sd sd--wide" id="sd">
        <div class="sd__play">
          {top}
          <div class="sd__boards">
            <div class="sd__boardcol">
              <div class="sd__board">
                <svg id="sd-board" viewBox="-5 -5 910 910" role="img" aria-label="Sudoku board. Select a cell, then type a digit."></svg>
              </div>
            </div>
            <div class="sd__boardcol">
              <div class="sd__board sd__board--ref">{ref_board(p)}</div>
            </div>
            {paused}
          </div>
          <div class="sd__lower">
            <div class="sd__controls">
              <div class="sd__padrow">
                <div class="sd__keys" id="sd-keys">{keys}{del_key}</div>
                {modes}
              </div>
              {actions}
            </div>
            <div class="sd__lowerright">
              {rules_card}
              <div class="sd__msg" id="sd-msg" role="status" aria-live="polite"></div>
            </div>
          </div>
        </div>
      </section>
      <script type="application/json" id="sd-data">{data}</script>"""
    else:
        content = f"""      <section class="sd" id="sd">
        <div class="sd__play">
          <div class="sd__boardcol">
            <div class="sd__board">
              <svg id="sd-board" viewBox="-5 -5 910 910" role="img" aria-label="Sudoku board. Select a cell, then type a digit."></svg>
              {paused}
            </div>
          </div>

          <div class="sd__side">
            {top}
            {rules_card}
            <div class="sd__msg" id="sd-msg" role="status" aria-live="polite"></div>
            <div class="sd__controls">
              <div class="sd__padrow">
                <div class="sd__keys" id="sd-keys">{keys}{del_key}</div>
                {modes}
              </div>
              {actions}
            </div>
          </div>
        </div>
      </section>
      <script type="application/json" id="sd-data">{data}</script>"""
    return page("puzzles.html", f"{html.escape(p['title'])} — Puzzles — Sarthak Dassarma", "", stage, content, divider=True,
                up="../../", nav_current="puzzles.html",
                head_extra='<link rel="stylesheet" href="../../css/puzzles.css">\n<script src="../../js/sudoku.js" defer></script>\n',
                description=f"{html.escape(p['title'])}: {html.escape(p['summary'])}")


def write(path, text):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(text)


if __name__ == "__main__":
    write("puzzles/index.html", list_page())
    for pz in PUZZLES:
        write(f"puzzles/{pz['slug']}/index.html", puzzle_page(pz))
    print("wrote puzzles/ (%d puzzle%s)" % (len(PUZZLES), "" if len(PUZZLES) == 1 else "s"))
