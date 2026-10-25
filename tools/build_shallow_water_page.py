#!/usr/bin/env python3
"""Writes projects/shallow-water-simulation.html in the site shell.

Run from the site root:  python3 tools/build_shallow_water_page.py
Re-run it whenever the nav or footer changes (tools/sync_nav.py also refreshes the header).
The solver and the canvas live in js/shallow-water.js (the same file is in the standalone repo
github.com/sarthakdass/shallow-water-sim); the page text and MathJax live here.
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

DESCRIPTION = "Click to drop pebbles in the fluid reservoir canvas"

STAGE = f"""    <a class="back-link" href="./">&larr; Back to projects</a>
    <h1 class="page-title page-title--long reveal">{title_markup("Shallow Water Simulation")}</h1>
    <p class="stage__lede stage__lede--wide">{DESCRIPTION}</p>"""

CONTENT = r"""      <p class="clt-intro">Click or drag on the water to drop pebbles, then change the sliders and watch what the waves do. Wave speed sets how fast the rings travel, viscosity damps them, and the walls can bounce them back or swallow them. With wave interaction on, the waves also change each other: tall crests outrun low ones, fronts steepen and break, and overlapping waves lose energy faster. Numerical solutions to the shallow water equations are computed live in browser.</p>

      <div class="canvas-card canvas-card--sw">
        <canvas id="sw-canvas" tabindex="0" role="img" aria-label="Water reservoir. Click or drag to drop pebbles. With the canvas focused, press Enter or Space to drop a pebble at a random spot."></canvas>
        <div class="status" id="sw-status">Click or drag to drop pebbles</div>
        <div class="readout" id="sw-readout"></div>
      </div>

      <div class="sw-buttons">
        <button class="btn btn--solid" id="sw-random" type="button">Drop a random pebble</button>
        <button class="btn" id="sw-pause" type="button" aria-pressed="false">Pause</button>
        <button class="btn" id="sw-clear" type="button">Clear water</button>
      </div>

      <div class="sw-controls">
        <div class="sw-field">
          <div class="sw-field__head"><label class="sw-field__name" for="sw-c">Wave speed</label><span class="sw-field__val" id="sw-c-val">0.45</span></div>
          <div class="clt-slider"><input id="sw-c" type="range" min="0.10" max="0.65" step="0.01" value="0.45"></div>
          <p class="sw-field__hint">c = &radic;(gH), in cells per step</p>
        </div>
        <div class="sw-field">
          <div class="sw-field__head"><label class="sw-field__name" for="sw-nu">Viscosity</label><span class="sw-field__val" id="sw-nu-val">0.005</span></div>
          <div class="clt-slider"><input id="sw-nu" type="range" min="0" max="0.12" step="0.005" value="0.005"></div>
          <p class="sw-field__hint">Damps short ripples first</p>
        </div>
        <div class="sw-field">
          <div class="sw-field__head"><label class="sw-field__name" for="sw-alpha">Walls</label><span class="sw-field__val" id="sw-alpha-val">50% absorbing</span></div>
          <div class="clt-slider"><input id="sw-alpha" type="range" min="0" max="1" step="0.05" value="0.5"></div>
          <p class="sw-field__hint">Reflecting &harr; absorbing</p>
        </div>
        <div class="sw-field">
          <div class="sw-field__head"><label class="sw-field__name" for="sw-size">Pebble size</label><span class="sw-field__val" id="sw-size-val">2.0</span></div>
          <div class="clt-slider"><input id="sw-size" type="range" min="1" max="6" step="0.5" value="2"></div>
          <p class="sw-field__hint">Width of the dent, in cells</p>
        </div>
        <div class="sw-field">
          <div class="sw-field__head"><label class="sw-field__name" for="sw-height">Pebble height</label><span class="sw-field__val" id="sw-height-val">0.15</span></div>
          <div class="clt-slider"><input id="sw-height" type="range" min="0.02" max="0.30" step="0.01" value="0.15"></div>
          <p class="sw-field__hint">Dent depth, as a fraction of water depth</p>
        </div>
        <div class="sw-field">
          <div class="sw-field__head"><label class="sw-field__name" for="sw-nl">Wave interaction</label><span class="sw-field__val" id="sw-nl-val">on</span></div>
          <label class="sw-switch"><input id="sw-nl" type="checkbox" checked><span class="sw-switch__track" aria-hidden="true"></span></label>
          <p class="sw-field__hint">Off: waves pass straight through each other</p>
        </div>
      </div>

      <section class="notes">
        <h2>How it works</h2>

        <p><strong>The model.</strong> When a body of water is much shallower than the length of its waves, the incompressible Navier&ndash;Stokes equations can be averaged over the depth, with the pressure fixed by the weight of the water above (the hydrostatic approximation). The result is the <em>shallow water equations</em>. Write the depth as \(h=H+\eta\), where \(H\) is the depth at rest and \(\eta(x,y,t)\) is how far the surface sits above that, and let \(\mathbf u=(u,v)\) be the depth-averaged velocity:</p>
        <div class="formula">\[ \partial_t h+\nabla\!\cdot\!(h\,\mathbf u)=0,\qquad \partial_t\mathbf u+(\mathbf u\!\cdot\!\nabla)\mathbf u=-g\,\nabla\eta+\nu\nabla^2\mathbf u . \]</div>
        <p>The first equation says water is conserved. The second is momentum: gravity pushes water down the slope of the surface, and the viscous term \(\nu\nabla^2\mathbf u\) smooths out differences in velocity. Here \(\nu\) is an <em>effective</em> viscosity in grid units.</p>

        <p><strong>Small waves: the linear equations.</strong> The simulation solves the full equations above, but I only test the linear version. When the waves are small, \(|\eta|\ll H\), every product of small quantities (the advection term, and \(\eta\,\mathbf u\) in the mass equation) can be dropped, leaving</p>
        <div class="formula">\[ \partial_t\eta=-H\,\nabla\!\cdot\!\mathbf u,\qquad \partial_t\mathbf u=-g\,\nabla\eta+\nu\nabla^2\mathbf u . \]</div>
        <p>With \(\nu=0\), differentiating the first equation in time and substituting the second gives the two-dimensional wave equation</p>
        <div class="formula">\[ \partial_t^2\eta=c^2\,\nabla^2\eta,\qquad c=\sqrt{gH}, \]</div>
        <p>so \(c\) is exactly the wave-speed slider. In the code, \(\Delta x=\Delta y=H=1\) and \(g=c^2\). The linear equations treat every wave independently: two ripples simply add, and pass straight through each other. The <em>Wave interaction</em> switch turns the nonlinear terms off to show exactly that.</p>

        <p><strong>What viscosity does.</strong> Try a plane wave \(e^{i(kx-\omega t)}\) in the linear equations. Substituting gives \(\omega^2+i\nu k^2\omega-c^2k^2=0\), so</p>
        <div class="formula">\[ \omega=\pm\sqrt{c^2k^2-\tfrac14\nu^2k^4}\;-\;\tfrac{i}{2}\,\nu k^2 . \]</div>
        <p>The imaginary part means the amplitude decays like \(e^{-\nu k^2 t/2}\) and the energy like \(e^{-\nu k^2 t}\). The decay rate grows with \(k^2\), so fine ripples die long before broad swells do.</p>

        <p><strong>What wave interaction adds.</strong> The nonlinear terms make the speed of a wave depend on its own height. For a right-going wave of height \(\eta\) (a simple wave of the full equations),</p>
        <div class="formula">\[ \text{speed}=3\sqrt{g(H+\eta)}-2\sqrt{gH}\;\approx\;c\Bigl(1+\frac{3\eta}{2H}\Bigr), \]</div>
        <p>so crests run ahead of troughs. The front of a crest steepens until the characteristics cross and the waves do not bounce off one another, because the equations still describe waves that travel through each other. The momentum equation is also written in advective form, which does not conserve momentum, so the speed of a breaking front is approximate.</p>

        <p><strong>The grid.</strong> The unknowns live on a staggered grid (Arakawa&rsquo;s C-grid): \(\eta\) at the center of each cell, \(u\) on the vertical cell faces, \(v\) on the horizontal ones. Each derivative then sits exactly halfway between the two values it is built from, which makes centered differences second-order accurate with spacing \(\Delta x\) rather than \(2\Delta x\), and it stops the &ldquo;checkerboard&rdquo; pattern (cells alternating up and down) from hiding where the gradient cannot see it.</p>

        <p><strong>Time stepping.</strong> Updating both fields from the old values (forward Euler) is unstable for waves: for a mode with wavenumbers \((k,l)\), every step multiplies it by a factor of modulus \(\sqrt{1+C^2s^2}>1\), where \(s^2=4\sin^2\frac{k\Delta x}{2}+4\sin^2\frac{l\Delta y}{2}\) and \(C=c\,\Delta t/\Delta x\). I use the <em>forward&ndash;backward</em> scheme instead. First the velocities are advanced from the old surface, then the surface is advanced from the <em>new</em> velocities:</p>
        <div class="formula">\[ \mathbf u^{*}=\mathbf u^{n}-\Delta t\Bigl[g\,\nabla_h\eta^{n}+(\mathbf u^{n}\!\cdot\!\nabla)_{\!\uparrow}\mathbf u^{n}\Bigr],\qquad \mathbf u^{n+1}=\bigl(1+\nu\Delta t\,\Delta_h\bigr)\mathbf u^{*},\qquad \eta^{n+1}=\eta^{n}-\Delta t\,\nabla_h\!\cdot\!\bigl[(H+\eta^{n}_{\uparrow})\,\mathbf u^{n+1}\bigr], \]</div>
        <p>where \(\nabla_h\) are the centered differences between neighboring cells and faces, the arrow marks values taken from the <em>upwind</em> side (the side the water is coming from; this keeps the advection stable and the depth positive), and \(\Delta_h u_{i,j}=u_{i+1,j}+u_{i-1,j}+u_{i,j+1}+u_{i,j-1}-4u_{i,j}\) is the five-point Laplacian. For small waves without viscosity, the linear part of this scheme neither grows nor damps a wave: a mode with wavenumbers \((k,l)\) advances with</p>
        <div class="formula">\[ \sin^2\!\frac{\omega\Delta t}{2}=C^2\Bigl[\sin^2\!\frac{k\Delta x}{2}+\sin^2\!\frac{l\Delta y}{2}\Bigr],\qquad C=\frac{c\,\Delta t}{\Delta x}. \]</div>
        <p>Because \(\sin^2\le1\), the right side stays below 1 for every mode exactly when \(2C^2\le1\), that is</p>
        <div class="formula">\[ c\,\frac{\Delta t}{\Delta x}\le\frac1{\sqrt2}\approx0.707 . \]</div>
        <p>This is the CFL condition which is why the wave-speed slider stops at 0.65. I do realize that this is a slight weakness since the numerical speed of short waves is below \(c\), so grid-scale ripples lag behind the ring. In actuality, the true shallow-water equations have no such dispersion (albeit some trailing wake does occur as in two dimensions the wave equation does not obey Huygens&rsquo; principle, so the surface does not return to rest the instant a ring passes.)</p>

        <p><strong>Stability with viscosity.</strong> The viscous step multiplies a mode by \(1-D\), where \(D=\nu\,\Delta t\,s^2/\Delta x^2\) and \(s^2\le8\) for the five-point Laplacian. Applying it to the updated velocity, as above, gives one full step of a mode a \(2\times2\) matrix with determinant \(1-D\) and trace \(2-D-(1-D)C^2s^2\). Both eigenvalues stay inside the unit disk only if \(|\mathrm{tr}|\le1+\det\), and the upper half of that inequality reads \((1-D)\,C^2s^2\ge0\). So \(D\le1\) for the worst mode, \(s^2=8\), which means</p>
        <div class="formula">\[ 8\,\nu\,\frac{\Delta t}{\Delta x^2}\le1\quad\Longleftrightarrow\quad \nu\le\tfrac18 . \]</div>
        <p>The viscosity slider stops at 0.12. My first version applied the viscous term to the <em>old</em> velocities. That is stable only while \(4\nu+2C^2\le1\), which at the top of the speed slider would have capped \(\nu\) near 0.04.</p>

        <p><strong>Tall waves are faster.</strong> Everything above is for small waves. A wave of height \(\eta\) moves at up to \(\sqrt{g(H+\eta)}+|\mathbf u|\), so the CFL limit gets tighter as waves grow. Each step the solver takes the largest crest and flow speed it has seen, and if \(\sqrt2\cdot1.1\cdot\text{speed}\cdot\Delta t\) would exceed 1 it splits the step into up to eight equal sub-steps. Shorter steps only help the viscous limit, so \(\nu\le\tfrac18\) still holds. A dent can never take the surface below 20% of the depth, so the water cannot run dry.</p>

        <p><strong>The pebble.</strong> Each pebble is a smooth Gaussian dent, \(\eta_0=-A\,e^{-r^2/2s^2}\), in water at rest, with \(A\) the pebble-height slider (as a fraction of \(H\); 0.15 by default) and \(s\) from the size slider. I chose a smooth profile rather than a one-cell spike because a spike is made of grid-scale waves, and those are exactly the ones the scheme moves wrongly. Dragging leaves a trail of smaller pebbles, one every six cells. Dents add where pebbles overlap, so dropping many in one spot makes a tall disturbance.</p>

        <p><strong>Reflecting walls.</strong> A solid wall means no flow through it, \(\mathbf u\cdot\mathbf n=0\). In the momentum equation that is \(\partial_n\eta=0\), and a wave reflects with its sign unchanged. Because no water can leave, the total volume \(\sum\eta\) is conserved exactly. The test script confirms the drift is about \(10^{-14}\).</p>

        <p><strong>Absorbing walls.</strong> To let waves leave, the wall is given a radiation (Sommerfeld) condition: the outflow velocity is proportional to the local height,</p>
        <div class="formula">\[ u_n=\alpha\sqrt{\frac{g}{H+\eta}}\;\eta\;\approx\;\alpha\,\frac{c}{H}\,\eta\quad(\text{small waves}). \]</div>
        <p>For a small wave hitting the wall at angle \(\theta\) from the normal, matching incident and reflected waves to this condition gives the reflection coefficient</p>
        <div class="formula">\[ R(\theta)=\frac{\cos\theta-\alpha}{\cos\theta+\alpha} . \]</div>
        <p>At \(\alpha=0\) this is a solid wall (\(R=1\)). At \(\alpha=1\) a head-on wave is absorbed completely, but a glancing one still partly reflects, and rings from a pebble meet the walls at all angles. So the slider also grows a sponge layer 16 cells deep, which damps both \(\eta\) and \(\mathbf u\) at the same rate \(\sigma(d)=\alpha\,\sigma_0\,(1-d/16)^2\), with \(d\) the distance from the wall. Damping both fields equally leaves the wave impedance \(\eta/u\) unchanged, and the quadratic ramp avoids any sudden change, so the layer itself reflects very little. You can see it as the dark band along the edge, and the bright wall line fades as \(\alpha\) rises. The test script measures \(R=0.334\) at \(\alpha=0.5\) head-on, against the predicted \(1/3\).</p>

        <p><strong>The energy readout.</strong> The wave energy is</p>
        <div class="formula">\[ E=\tfrac12\sum\bigl(g\,\eta^2+(H+\eta)\,|\mathbf u|^2\bigr)\,\Delta x\,\Delta y , \]</div>
        <p>and the canvas shows it as a percentage of its value right after your latest pebble. With solid walls, \(\nu=0\) and small waves it stays near 100% (the scheme conserves a slightly modified energy, so the reading wobbles by about 1%). With wave interaction on and tall waves it falls even then, because breaking fronts lose energy. Viscosity drains it at the rate \(\nu H\!\int|\nabla\mathbf u|^2\), and the absorbing walls drain it as waves enter the sponge.</p>

        <p><strong>Decisions and trade-offs.</strong></p>
        <ul>
          <li><strong>Nonlinear-linear toggle.</strong> Waves in the linear equations cannot affect one another, so interaction needs the nonlinear terms. Therefore, I included a toggle (and a pebble-height slider) so you can compare various settings to the linear version with exact solutions. The default pebble dents the surface by 15% of the depth, because at 5% the nonlinear effects were too faint to see. Unfortunately the penalty is first-order upwind differencing, so the energy lost at a breaking front is a numerical estimate.</li>
          <li><strong>Staggered grid with forward&ndash;backward stepping</strong> instead of a collocated grid with a multi-stage Runge&ndash;Kutta method: one cheap pass per field, no stages, and no numerical damping when \(\nu=0\). Any energy you see disappear is the viscosity or the walls, not the scheme.</li>
          <li><strong>Fixed units.</strong> With \(\Delta x=\Delta t=H=1\), the speed slider is the Courant number. The solver runs at 240 steps per second of real time whatever your screen&rsquo;s refresh rate, and each frame draws however many steps have accumulated.</li>
          <li><strong>Slider limits come from the analysis</strong> (\(c\le0.65<0.707\), \(\nu\le0.12<0.125\)), plus automatic sub-stepping for tall waves, so no combination of sliders can blow up. The tests include tall pebbles at both slider extremes.</li>
          <li><strong>Color.</strong> The height is passed through \(\tanh\bigl(\eta/(0.09\,A)\bigr)\) where \(A\) is the pebble height, so that both the fresh splash and a faint ring far away stay visible, then shaded by the local slope as if lit from the upper left. Crests are lilac and troughs orange.</li>
        </ul>

        <p>The solver (<code>js/shallow-water.js</code>) is a few hundred lines with no dependencies. The standalone repository with the numerical tests is at <a href="https://github.com/sarthakdass/shallow-water-sim" target="_blank" rel="noopener">github.com/sarthakdass/shallow-water-sim</a>.</p>
      </section>"""

html = project_shell(
    "Shallow Water Simulation — Sarthak Dassarma",
    STAGE,
    CONTENT,
    head_extra=MATHJAX,
    body_end='<script src="../js/shallow-water.js" defer></script>',
)
with open("projects/shallow-water-simulation.html", "w", encoding="utf-8") as f:
    f.write(html)
print("wrote projects/shallow-water-simulation.html", len(html), "bytes")
