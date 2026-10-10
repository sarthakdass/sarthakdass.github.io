#!/usr/bin/env python3
"""Builds the Writing section from the post sources in writing-src/.

    python3 tools/build_writing.py            # what gets published (drafts are skipped)
    python3 tools/build_writing.py --drafts   # include posts marked `draft: true`, for previewing

Also runs as the last step of `python3 build_pages.py`. Run both from the site root.

Output (the whole writing/ folder is generated, so never edit it by hand):
    writing/index.html                  the hub: five cards
    writing/<category>/index.html       one archive per category, newest first (all, math, ...)
    writing/posts/<slug>/index.html     the posts
    writing/feed.xml                    RSS feed

A post is writing-src/<slug>.md (or writing-src/<slug>/index.md when it has images or other files of its own;
everything else in that folder is copied next to the post, so ![caption](fig1.png) just works). See README.md.
"""
import datetime as dt
import html
import os
import re
import shutil
import sys

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(root)
sys.path.insert(0, root)

SITE = "https://sarthakdass.github.io"
SRC = "writing-src"
OUT = "writing"

# slug, name, description. "all" is every post; the rest match a post's `tags:`.
CATS = [
    ("all", "All", "Check out the entire archive"),
    ("math", "Math", "Excursions, pedagogy, and teaching"),
    ("not-so-investigative-journalism", "Not-so-investigative journalism", "Learning and educating on various topics"),
    ("basketball", "Basketball", "Basketball history and topics I like"),
    ("thoughts", "Thoughts", "Catch-all miscellaneous writing"),
]
CAT_BY_SLUG = {c[0]: c for c in CATS}


def slugify(text):
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def cat_slug(label):
    """'Math', 'math', 'Not-so-investigative journalism', 'journalism' all find their category."""
    s = slugify(label)
    if s in CAT_BY_SLUG:
        return s
    for slug, name, _ in CATS:
        if s == slugify(name) or (s == "journalism" and slug.startswith("not-so")):
            return slug
    raise SystemExit(f"Unknown tag {label!r}. Use one of: " + ", ".join(c[1] for c in CATS[1:]))


# ------------------------------------------------------------------ markdown with real LaTeX support
FENCE = re.compile(r"(^```.*?^```[ \t]*$|^~~~.*?^~~~[ \t]*$|`[^`\n]+`)", re.S | re.M)
DISPLAY_ENVS = r"equation|align|alignat|gather|multline|flalign|eqnarray"
MATH_PATTERNS = [
    ("D", re.compile(r"\$\$(.+?)\$\$", re.S)),
    ("D", re.compile(r"\\\[(.+?)\\\]", re.S)),
    ("E", re.compile(r"\\begin\{((?:%s)\*?)\}(.+?)\\end\{\1\}" % DISPLAY_ENVS, re.S)),
    ("I", re.compile(r"\\\((.+?)\\\)", re.S)),
    ("I", re.compile(r"(?<![\\$\w])\$(?![\s$])((?:[^$\n\\]|\\.|\n(?!\n))+?)(?<![\s\\])\$(?![\d$])")),
]
ENVS = {  # name -> (label, numbered)
    "theorem": ("Theorem", True), "lemma": ("Lemma", True), "proposition": ("Proposition", True),
    "corollary": ("Corollary", True), "claim": ("Claim", True), "conjecture": ("Conjecture", True),
    "definition": ("Definition", True), "example": ("Example", False), "remark": ("Remark", False),
    "note": ("Note", False), "exercise": ("Exercise", False), "question": ("Question", False),
    "proof": ("Proof", False),
}


def protect_math(text, store):
    """Swap every math span for a placeholder so Markdown cannot touch it (underscores, asterisks, <, &...)."""
    def keep(kind, tex):
        store.append((kind, tex))
        return f"ZZMATH{len(store) - 1}ZZ"

    def run(seg):
        seg = seg.replace("\\$", "ZZDOLLARZZ")
        for kind, pat in MATH_PATTERNS:
            if kind == "E":
                seg = pat.sub(lambda m: keep("E", m.group(0)), seg)
            else:
                seg = pat.sub(lambda m, k=kind: keep(k, m.group(1).strip()), seg)
        return seg.replace("ZZDOLLARZZ", "$")

    parts = FENCE.split(text)
    # re.split with one capture group: odd indexes are code, even are prose
    return "".join(p if i % 2 else run(p) for i, p in enumerate(parts))


def restore_math(h, store):
    def tex(kind, body):
        body = html.escape(body, quote=False)
        if kind == "I":
            return f"\\({body}\\)"
        if kind == "D":
            return f"\\[{body}\\]"
        return body                                   # a bare \begin{align} ... \end{align}

    # a display formula standing alone in its paragraph becomes a block, not an inline run
    h = re.sub(r"<p>\s*ZZMATH(\d+)ZZ\s*</p>",
               lambda m: ('<div class="math-block">%s</div>' % tex(*store[int(m.group(1))]))
               if store[int(m.group(1))][0] in "DE" else m.group(0), h)
    return re.sub(r"ZZMATH(\d+)ZZ", lambda m: tex(*store[int(m.group(1))]), h)


def fenced_divs(text):
    """::: theorem Cauchy-Schwarz ... :::   becomes a styled theorem box (see css/writing.css)."""
    out, stack = [], []
    for line in text.split("\n"):
        m = re.match(r"^:::\s*([a-z]+)\s*(.*?)\s*$", line)
        if m and m.group(1) in ENVS:
            label, _ = ENVS[m.group(1)]
            title = m.group(2)
            ttl = f' <span class="env__title">({html.escape(title)})</span>' if title else ""
            out.append(f'<div class="env env--{m.group(1)}" markdown="1">\n'
                       f'<p class="env__head"><span class="env__name">{label}</span>{ttl}</p>\n')
            stack.append(1)
        elif line.strip() == ":::" and stack:
            stack.pop()
            out.append("\n</div>\n")
        else:
            out.append(line)
    if stack:
        raise SystemExit("A ::: block was never closed with a line containing only :::")
    return "\n".join(out)


def render_markdown(text):
    import markdown
    store = []
    text = fenced_divs(protect_math(text, store))
    body = markdown.markdown(
        text,
        extensions=["extra", "sane_lists", "smarty", "toc"],
        extension_configs={"toc": {"permalink": "#", "permalink_class": "anchor", "permalink_title": "Link to this section"}},
    )
    return restore_math(body, store), store


def render_html_source(text):
    store = []
    text = protect_math(text, store)
    return restore_math(text, store), store


# ------------------------------------------------------------------ posts
class Post:
    pass


def parse_front_matter(raw, where):
    m = re.match(r"^---\s*\n(.*?)\n---\s*\n?(.*)$", raw, re.S)
    if not m:
        raise SystemExit(f"{where}: a post must start with a --- front matter block (title, date, tags)")
    meta = {}
    for line in m.group(1).split("\n"):
        if ":" in line and not line.startswith("#"):
            k, v = line.split(":", 1)
            meta[k.strip().lower()] = v.strip().strip('"').strip("'")
    return meta, m.group(2)


def plain_excerpt(body_html, limit=190):
    """Plain text up to the first formula in the first paragraph (so no raw TeX shows up in listings)."""
    m = re.search(r"<p>(.*?)</p>", body_html, re.S)
    if not m:
        return ""
    para = m.group(1)
    cut = re.search(r"\\\(|\\\[|\\begin", para)
    cut_here = bool(cut)
    if cut:
        para = para[: cut.start()]
    para = html.unescape(re.sub(r"<[^>]+>", "", para)).strip()
    if len(para) > limit:
        para = para[:limit].rsplit(" ", 1)[0]
        cut_here = True
    para = para.rstrip(" ,;:—-")
    return (para + "…") if (cut_here and para) else para


def load_posts(include_drafts):
    posts = []
    if not os.path.isdir(SRC):
        return posts
    for entry in sorted(os.listdir(SRC)):
        path = os.path.join(SRC, entry)
        if entry.startswith(("_", ".")) or entry.lower() == "readme.md":
            continue
        extra_dir = None
        if os.path.isdir(path):
            idx = next((os.path.join(path, f) for f in ("index.md", "index.html") if os.path.exists(os.path.join(path, f))), None)
            if not idx:
                continue
            slug, src, extra_dir = entry, idx, path
        elif entry.endswith((".md", ".html")):
            slug, src = os.path.splitext(entry)[0], path
        else:
            continue
        meta, body_src = parse_front_matter(open(src, encoding="utf-8").read(), src)
        p = Post()
        p.slug = slugify(meta.get("slug", slug))
        p.title = meta.get("title") or slug
        p.draft = meta.get("draft", "").lower() in ("true", "yes", "1")
        if p.draft and not include_drafts:
            continue
        try:
            p.date = dt.date.fromisoformat(meta["date"])
        except Exception:
            raise SystemExit(f"{src}: needs `date: YYYY-MM-DD` in the front matter")
        tags = [t for t in re.split(r"\s*,\s*", meta.get("tags", "")) if t]
        p.cats = []
        for t in tags:
            s = cat_slug(t)
            if s != "all" and s not in p.cats:
                p.cats.append(s)
        if not p.cats:
            p.cats = ["thoughts"]
        p.subtitle = meta.get("subtitle", "")
        p.section = meta.get("section", "").strip().lower()
        p.summary = meta.get("summary", "")
        p.extra_dir = extra_dir
        if src.endswith(".md"):
            p.body, store = render_markdown(body_src)
        else:
            p.body, store = render_html_source(body_src)
        p.has_math = bool(store) or "\\(" in p.body or "\\[" in p.body or "\\begin{" in p.body
        p.excerpt = html.escape(p.subtitle) if p.subtitle else html.escape(plain_excerpt(p.body))
        words = len(re.sub(r"<[^>]+>|\\\(.*?\\\)|\\\[.*?\\\]", " ", p.body, flags=re.S).split())
        p.minutes = max(1, round(words / 220))
        posts.append(p)
    slugs = [p.slug for p in posts]
    dup = {s for s in slugs if slugs.count(s) > 1}
    if dup:
        raise SystemExit("Two posts share the slug " + ", ".join(sorted(dup)))
    posts.sort(key=lambda p: (p.date, p.slug), reverse=True)
    return posts


def fmt_date(d):
    return d.strftime("%B ") + str(d.day) + d.strftime(", %Y")


def posts_in(posts, slug):
    return posts if slug == "all" else [p for p in posts if slug in p.cats]


def math_page_posts():
    """Posts that belong on the Math page (front matter `section: math`), newest first, for build_pages.py."""
    return [p for p in load_posts(False) if p.section == "math"]


# ------------------------------------------------------------------ pages
def build(page, title_markup, divider, include_drafts=False):
    every = load_posts(include_drafts)
    posts = [p for p in every if not p.section]
    math_posts = [p for p in every if p.section == "math"]
    if os.path.isdir(OUT):
        shutil.rmtree(OUT)
    os.makedirs(OUT)
    n_written = 0

    def write(path, text):
        nonlocal n_written
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            f.write(text)
        n_written += 1

    rss = f'<link rel="alternate" type="application/rss+xml" title="Sarthak Dassarma: Writing" href="{{up}}writing/feed.xml">\n'

    def head_css(up):
        return f'<link rel="stylesheet" href="{up}css/writing.css">\n' + rss.format(up=up)

    # ---- hub: five cards
    cards = []
    for slug, name, desc in CATS:
        n = len(posts_in(posts, slug))
        count = f"{n} post{'s' if n != 1 else ''}" if n else "No posts yet"
        cards.append(f"""        <li>
          <a class="wcard" href="{slug}/" data-reveal>
            <h2 class="wcard__title">{html.escape(name)}</h2>
            <p class="wcard__desc">{html.escape(desc)}</p>
            <span class="wcard__meta"><span>{count}</span><span class="wcard__arrow" aria-hidden="true">&rarr;</span></span>
          </a>
        </li>""")
    hub_stage = f"""<header class="stage">
  <div class="wrap">
    <h1 class="page-title reveal">{title_markup("Writing")}</h1>
  </div>
</header>"""
    hub = f"""      <ul class="wcards">
{chr(10).join(cards)}
      </ul>"""
    write(f"{OUT}/index.html", page("writing.html", "Writing — Sarthak Dassarma", "", hub_stage, hub,
                                   "Writing by Sarthak Dassarma: math, basketball, and miscellaneous thoughts.",
                                   divider=True, up="../", head_extra=head_css("../")))

    # ---- one archive per category, newest first
    def tabs(current, prefix):
        items = "".join(
            f'<li><a class="wtab{" is-on" if slug == current else ""}" href="{prefix}{slug}/"'
            f'{" aria-current=\"page\"" if slug == current else ""}>{html.escape(name)}</a></li>'
            for slug, name, _ in CATS)
        return f'<ul class="wtabs" aria-label="Categories">{items}</ul>'

    for slug, name, desc in CATS:
        items = posts_in(posts, slug)
        rows, year = [], None
        for p in items:
            if p.date.year != year:
                year = p.date.year
                rows.append(f'        <li class="wyear" aria-hidden="true">{year}</li>')
            chips = "".join(f'<span class="wchip">{html.escape(CAT_BY_SLUG[c][1])}</span>' for c in p.cats)
            rows.append(f"""        <li class="wpost" data-reveal>
          <time class="wpost__date" datetime="{p.date.isoformat()}">{p.date.strftime('%b')} {p.date.day}</time>
          <div class="wpost__main">
            <h2 class="wpost__title"><a href="../posts/{p.slug}/">{html.escape(p.title)}</a></h2>
            {f'<p class="wpost__excerpt">{p.excerpt}</p>' if p.excerpt else ''}
            <p class="wpost__meta">{chips}<span>{p.minutes} min read</span></p>
          </div>
        </li>""")
        body = tabs(slug, "../") + "\n" + (
            f'      <ol class="wlist">\n{chr(10).join(rows)}\n      </ol>' if rows else
            '      <p class="wempty">Nothing here yet.</p>')
        long = " page-title--long" if len(name) > 12 else ""
        stage = f"""<header class="stage">
  <div class="wrap">
    <a class="back-link" href="../">&larr; Writing</a>
    <h1 class="page-title{long} reveal">{title_markup(html.escape(name))}</h1>
    <p class="stage__lede">{html.escape(desc)}</p>
  </div>
</header>"""
        write(f"{OUT}/{slug}/index.html", page("writing.html", f"{name} — Writing — Sarthak Dassarma", "", stage, body,
                                              f"{name}: {desc}.", divider=True, up="../../", head_extra=head_css("../../")))

    # ---- the posts
    for i, p in enumerate(posts):
        chips = "".join(f'<a class="wchip wchip--dark" href="../../{c}/">{html.escape(CAT_BY_SLUG[c][1])}</a>' for c in p.cats)
        sub = f'\n    <p class="stage__lede stage__lede--wide">{p.excerpt}</p>' if p.subtitle else ""
        draft = '<span class="wchip wchip--draft">Draft</span>' if p.draft else ""
        stage = f"""<header class="stage">
  <div class="wrap wrap--post">
    <a class="back-link" href="../../">&larr; Writing</a>
    <h1 class="page-title page-title--post reveal">{title_markup(html.escape(p.title))}</h1>{sub}
    <p class="post-meta"><time datetime="{p.date.isoformat()}">{fmt_date(p.date)}</time><span>{p.minutes} min read</span>{chips}{draft}</p>
  </div>
</header>"""
        newer = posts[i - 1] if i > 0 else None
        older = posts[i + 1] if i + 1 < len(posts) else None
        pn = ""
        if newer or older:
            pn = '\n      <nav class="post-nav" aria-label="More posts">'
            pn += (f'<a class="post-nav__prev" href="../{older.slug}/"><small>Older</small><span>{html.escape(older.title)}</span></a>'
                   if older else "<span></span>")
            pn += (f'<a class="post-nav__next" href="../{newer.slug}/"><small>Newer</small><span>{html.escape(newer.title)}</span></a>'
                   if newer else "<span></span>")
            pn += "</nav>"
        content = f"""      <article class="post prose">
{p.body}
      </article>{pn}"""
        math_head = ('<script src="../../../js/writing-math.js"></script>\n'
                     '<script defer src="https://cdn.jsdelivr.net/npm/mathjax@3.2.2/es5/tex-chtml.js"></script>\n') if p.has_math else ""
        write(f"{OUT}/posts/{p.slug}/index.html",
              page("writing.html", f"{p.title} — Sarthak Dassarma", "post-page", stage, content,
                   (p.subtitle or re.sub(r"<[^>]+>|&[a-z#0-9]+;", "", p.excerpt))[:240],
                   divider=True, up="../../../", head_extra=head_css("../../../") + math_head))
        if p.extra_dir:
            for f in os.listdir(p.extra_dir):
                if f not in ("index.md", "index.html"):
                    src = os.path.join(p.extra_dir, f)
                    dst = os.path.join(OUT, "posts", p.slug, f)
                    (shutil.copytree if os.path.isdir(src) else shutil.copy)(src, dst)

    # ---- posts that live on the Math page: math/<slug>/index.html
    for p in math_posts:
        sub = f'\n    <p class="stage__lede stage__lede--wide">{p.excerpt}</p>' if p.subtitle else ""
        stage = f"""<header class="stage">
  <div class="wrap wrap--post">
    <a class="back-link" href="../">&larr; Math</a>
    <h1 class="page-title page-title--post reveal">{title_markup(html.escape(p.title))}</h1>{sub}
    <p class="post-meta"><time datetime="{p.date.isoformat()}">{p.date.strftime('%B %Y')}</time><span>{p.minutes} min read</span></p>
  </div>
</header>"""
        content = f"""      <article class="post prose">
{p.body}
      </article>"""
        math_head = ('<script src="../../js/writing-math.js"></script>\n'
                     '<script defer src="https://cdn.jsdelivr.net/npm/mathjax@3.2.2/es5/tex-chtml.js"></script>\n') if p.has_math else ""
        css = '<link rel="stylesheet" href="../../css/writing.css">\n'
        dest = f"math/{p.slug}"
        write(f"{dest}/index.html",
              page("math.html", f"{p.title} — Sarthak Dassarma", "post-page", stage, content,
                   (p.subtitle or p.summary or re.sub(r"<[^>]+>|&[a-z#0-9]+;", "", p.excerpt))[:240],
                   divider=True, up="../../", head_extra=css + math_head))
        if p.extra_dir:
            for f in os.listdir(p.extra_dir):
                if f not in ("index.md", "index.html"):
                    src = os.path.join(p.extra_dir, f)
                    (shutil.copytree if os.path.isdir(src) else shutil.copy)(src, os.path.join(dest, f))

    # ---- RSS
    def rfc822(d):
        return dt.datetime(d.year, d.month, d.day, 12).strftime("%a, %d %b %Y %H:%M:%S +0000")
    items = "".join(
        f"<item><title>{html.escape(p.title)}</title><link>{SITE}/writing/posts/{p.slug}/</link>"
        f"<guid>{SITE}/writing/posts/{p.slug}/</guid><pubDate>{rfc822(p.date)}</pubDate>"
        + "".join(f"<category>{html.escape(CAT_BY_SLUG[c][1])}</category>" for c in p.cats)
        + f"<description>{html.escape(re.sub(chr(60) + '[^>]+>', '', html.unescape(p.excerpt)))}</description></item>"
        for p in posts[:30])
    write(f"{OUT}/feed.xml",
          '<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>Sarthak Dassarma: Writing</title>'
          f"<link>{SITE}/writing/</link><description>Math, basketball, and miscellaneous thoughts.</description>"
          f"{items}</channel></rss>\n")
    print(f"wrote {OUT}/ ({n_written} files, {len(posts)} post{'s' if len(posts) != 1 else ''}"
          f"{', drafts included' if include_drafts else ''})")


if __name__ == "__main__":
    from build_pages import page, title_markup, DIVIDER  # noqa: E402
    build(page, title_markup, DIVIDER, include_drafts="--drafts" in sys.argv)
