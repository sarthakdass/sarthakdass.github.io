# sarthakdass.github.io

Plain HTML/CSS/JS, no build step required. One page per section.

```
index.html      Home
projects.html   Projects
math.html       Math
hobbies.html    Hobbies (marquee + Academic Hobbies + Other Hobbies)
now.html        Now
css/style.css   Colors, fonts, spacing (tokens at the top) and all animation styles
css/projects.css  Extra styles for the two demo pages in projects/
js/site.js      All behaviour: header bar, reveals, spotlight, tilt, marquee, paths, page transition
assets/         logo-sd.svg (vector), logo-sd.png (transparent, black letters), favicon.svg
projects/       Live demos, in the site theme (fourier-visualization.html, gerrymandle-boards.html)
tools/          restyle_gerrymandle.py (see below)
papers/         PDFs (SobolevSpaces_COV.pdf)
build_pages.py  Optional: regenerates the five pages so header/footer stay identical
```

## Animations (all live on the site)
1. **Headline reveal** – page titles and your name rise out of a mask on load
2. **Scroll reveal** – project / math / hobby cards and Now rows fade up as they enter view
3. **Cursor spotlight** – soft glow follows the pointer across the dark top layer
4. **Layered tilt** – cards tilt slightly and the stacked-paper layers peek out on hover
5. **Interest marquee** – scrolling ticker on the Hobbies page (Pause button, also pauses on hover)
6. **Random-walk paths** – drifting Brownian paths behind your name on Home (Pause button)
7. **Page transition** – lilac / vermilion / ink sheets sweep between the five pages

All of it respects "reduce motion" (static page, no transition) and the site is fully readable with
JavaScript off. Touch devices skip the cursor effects (spotlight and tilt).

## Editing
- Edit the .html files directly, **or** edit `build_pages.py` and run `python3 build_pages.py`
  (re-running overwrites the five page files, so pick one workflow).
- New page: add it to `PAGES` in `build_pages.py` (or to the nav in every page) and to the
  `PAGE` pattern near the bottom of `js/site.js` so it gets the transition. New demo pages in
  `projects/` can reuse `project_shell()` from `build_pages.py`.
- To opt a new card into animations, add `data-reveal` (fade-up) and/or `data-tilt` (tilt).
- Colors/fonts: variables in `:root` at the top of `css/style.css`.

## Regenerating the Gerrymandle page
`projects/gerrymandle-boards.html` is your generator's output with the site theme applied. If you re-run the
generator, re-apply the theme from the site root:

    python3 tools/restyle_gerrymandle.py  raw-generator-output.html  projects/gerrymandle-boards.html

Boards, counts and wording are untouched; only the page shell and styling change.

## Deploy
Push everything to the `sarthakdass.github.io` repo root; GitHub Pages serves it as-is.
