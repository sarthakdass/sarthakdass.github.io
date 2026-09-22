# twilight darkening's website

A single-page site — one `index.html` with all six sections (Home, Projects, Math, Awards, Hobbies, Now) reached by anchor links in the nav. Plain HTML/CSS, no build step, ready for GitHub Pages.

## 1. Put it on GitHub

**User site (lives at `https://yourusername.github.io`):**
1. Create a repo named exactly `yourusername.github.io`.
2. Push these files to the repo root (commands below).
3. In the repo's **Settings → Pages**, set Source to "Deploy from a branch", branch `main`, folder `/ (root)`. Save.
4. Live in a minute or two at `https://yourusername.github.io`.

**Project site (lives at `https://yourusername.github.io/repo-name`):** same steps, any repo name.

```bash
git init
git add .
git commit -m "Initial site"
git branch -M main
git remote add origin https://github.com/yourusername/yourusername.github.io.git
git push -u origin main
```

## 2. File structure

```
index.html    everything — nav, hero, and all six sections
papers/       compiled PDFs of your LaTeX write-ups (+ optional .tex source)
assets/       any other static files
```

## 3. Editing content

- Everything lives in one file. Each section is a `<section id="...">` block — the nav links (`#projects`, `#math`, etc.) jump straight to them.
- `projects` and `math` use repeatable `.entry` blocks (title, date/meta, description, optional links) — copy a block to add a new one.
- Fill in your name, university, and blog URL in the Home section (currently `[insert my name]`, `[University]`, and a placeholder blog link).
- **LaTeX write-ups**: compile each `.tex` to PDF (`pdflatex`, `latexmk`, or Overleaf's download button) and place it in `papers/`, then link it from the Math section.

## 4. Customizing the look

All colors, fonts, and spacing are CSS variables and rules inside the `<style>` block at the top of `index.html` — no separate stylesheet to hunt through. Page content is capped at 940px wide with 56px of side padding for wide margins; adjust `.wrap` to change that. The palette is the sepia/paper theme (`--paper: #f3f1ea`, `--ink`, `--accent`, `--sage`) — change those hex values to restyle the whole page.

## 5. Custom domain (optional)

Add a `CNAME` file to the repo root containing your domain, then point your DNS at GitHub Pages per [GitHub's docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site).
