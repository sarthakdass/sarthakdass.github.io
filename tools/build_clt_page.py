#!/usr/bin/env python3
"""Writes projects/clt-visualization.html (the canvas port of clt-draw) in the site shell.

Run from the site root:  python3 tools/build_clt_page.py
Re-run it whenever the nav or footer in build_pages.py changes, so this page stays in step with the others.
The interactive part lives in js/clt.js; the page text and MathJax live here.
"""
import os
import sys

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, root)
os.chdir(root)
from build_pages import project_shell, title_markup  # noqa: E402

MATHJAX = r"""<script>
  window.MathJax = {
    tex: { inlineMath: [["\\(", "\\)"]], displayMath: [["\\[", "\\]"]] },
    options: { skipHtmlTags: ["script", "noscript", "style", "textarea", "pre", "code"] },
    startup: {
      pageReady: function () {
        return MathJax.startup.defaultPageReady().then(function () {
          var panels = document.querySelectorAll(".formula");
          for (var i = 0; i < panels.length; i++) panels[i].classList.add("ready");
        });
      }
    }
  };
</script>
<script defer src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js"></script>
"""

DESCRIPTION = ("Behold the power of the Central Limit Theorem! Convergence to a normal distribution is inevitable, "
               "how long can your curve avoid it?")

CREDIT = ("The idea for this project is not original. An anonymous student from Professor Dan Ostrov's Probability "
          "class designed a similar website, and I took inspiration in designing my own visually interactive "
          "Central Limit Theorem project.")

STAGE = f"""    <a class="back-link" href="./">&larr; Back to projects</a>
    <h1 class="page-title page-title--long reveal">{title_markup("Central Limit Theorem Visualization")}</h1>
    <p class="stage__lede stage__lede--wide">{DESCRIPTION}</p>"""

CONTENT = r"""      <p class="clt-intro">If you want a challenge, I have been able to come up with curves that don't quite converge to the normal curve even up to 1024 draws, although the shape certainly is approaching it fast. Can you do the same?</p>

      <div class="canvas-card canvas-card--clt">
        <canvas id="clt-canvas" role="img" aria-label="Drawing area. Drag with the mouse or a finger to draw a probability density."></canvas>
        <div class="status" id="clt-status" aria-live="polite"></div>
        <div class="readout" id="clt-readout"></div>
      </div>

      <div class="controls">
        <button class="btn btn--solid" id="clt-submit" type="button" disabled>Submit curve</button>
        <button class="btn" id="clt-redraw" type="button">Redraw</button>
        <label><input type="checkbox" id="show-normal"> Normal curve</label>
        <label><input type="checkbox" id="show-original"> Original curve</label>
      </div>

      <p class="clt-label" id="n-label">Number of draws added together, n</p>
      <div class="clt-slider">
        <input id="n-slider" type="range" min="0" max="9" step="1" value="0" disabled aria-labelledby="n-label" aria-valuetext="n = 2">
        <div class="clt-ticks is-disabled" id="n-ticks"></div>
      </div>

      <div class="clt-chart-head">
        <h2>How fast?</h2>
        <p>The distance to the normal curve at each n, on a log scale. The dashed line shows what a 1/&radic;n decay looks like.</p>
      </div>
      <div class="canvas-card">
        <canvas id="clt-chart" class="chart" role="img" aria-label="Distance to the normal curve for each n"></canvas>
      </div>

      <section class="notes">
        <h2>How it works</h2>

        <p><strong>Your curve becomes a lattice distribution.</strong> When you press Submit curve, the stretch of canvas you drew on is resampled to \(M=1024\) evenly spaced points and scaled so the values \(p_0,\dots,p_{M-1}\) add up to 1. That is the probability mass function of one draw \(X\), which takes the values \(k=0,1,\dots,M-1\).</p>

        <p><strong>Sums are exact.</strong> For independent draws, the distribution of a sum is the convolution of the individual distributions:</p>
        <div class="formula">\[ P(X_1+X_2=s)=\sum_k p_k\,p_{s-k}=(p*p)_s . \]</div>

        <p><strong>Doubling saves work.</strong> Instead of adding one draw at a time (1023 convolutions to reach \(n=1024\)), each step combines the previous result with itself:</p>
        <div class="formula">\[ p^{*2n}=p^{*n}*p^{*n},\qquad n=1,2,4,\dots,512 . \]</div>
        <p>That is 2 draws, then 2 more combined with them to make 4, then 4 more to make 8, and so on up to 1024: just ten convolutions, all done when you press Submit curve. Each one uses the fast Fourier transform, because the transform of a convolution is the product of the transforms, so squaring the spectrum doubles the number of draws:</p>
        <div class="formula">\[ \widehat{p^{*2n}}=\bigl(\widehat{p^{*n}}\bigr)^{2} . \]</div>
        <p>The only approximation is the 1024-point lattice itself.</p>

        <p><strong>Standardize so every n fits on one axis.</strong> A sum of \(n\) draws has mean \(n\mu\) and standard deviation \(\sigma\sqrt n\), so it keeps spreading out. Rescaling,</p>
        <div class="formula">\[ Z_n=\frac{S_n-n\mu}{\sigma\sqrt n},\qquad g_n(z)=\sigma\sqrt n\;P(S_n=k)\ \text{ at }\ z=\frac{k-n\mu}{\sigma\sqrt n}, \]</div>
        <p>gives every \(Z_n\) mean 0 and variance 1. The canvas plots \(g_n\) in orange. The dashed white curve is the standard normal density \(\varphi(z)=e^{-z^2/2}/\sqrt{2\pi}\), and the dashed lilac curve is your original curve, standardized the same way.</p>

        <p><strong>The Central Limit Theorem</strong> says that \(Z_n\) converges in distribution to \(N(0,1)\) for any curve with finite variance.</p>

        <p><strong>How fast?</strong> The readout reports the Kolmogorov distance between the two cumulative distribution functions,</p>
        <div class="formula">\[ D_n=\sup_z\,\bigl|F_n(z)-\Phi(z)\bigr|\;\le\;\frac{C\,\rho}{\sigma^{3}\sqrt n},\qquad \rho=\mathbb E\,|X-\mu|^{3}, \]</div>
        <p>where the bound is the Berry&ndash;Esseen theorem, which is why the dashed guide in the chart falls like \(1/\sqrt n\). Cumulants add under independent sums, so skewness \(\gamma\) shrinks exactly like \(1/\sqrt n\), and kurtosis \(\beta\) approaches its normal value of 3 exactly like \(1/n\):</p>
        <div class="formula">\[ \gamma_n=\frac{\gamma_1}{\sqrt n},\qquad \beta_n-3=\frac{\beta_1-3}{n} . \]</div>
        <p>A normal curve has skewness 0 and kurtosis 3. Spikier or lopsided curves start further away and take a few more doublings, but they get there.</p>

        <p>Written first in Python with Pygame, then ported to Canvas for this page.</p>
      </section>

      <aside class="credit">
        <h2>Credit</h2>
        <p>@@CREDIT@@</p>
      </aside>""".replace("@@CREDIT@@", CREDIT)

html = project_shell(
    "Central Limit Theorem Visualization — Sarthak Dassarma",
    STAGE,
    CONTENT,
    head_extra=MATHJAX,
    body_end='<script src="../js/clt.js" defer></script>',
)
with open("projects/clt-visualization.html", "w", encoding="utf-8") as f:
    f.write(html)
print("wrote projects/clt-visualization.html", len(html), "bytes")
