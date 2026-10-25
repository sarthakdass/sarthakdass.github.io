/* Shallow Water Simulation: click to drop pebbles in a fluid reservoir.
   Standalone repo: github.com/sarthakdass/shallow-water-sim   (the same file runs the page on sarthakdass.github.io)

   Part 1 is the numerical solver (no DOM, so it also runs under Node: see test/test_core.js).
   Part 2 is the canvas, the sliders and the pointer handling.

   Units: grid spacing dx = dy = 1, time unit = 1 step, rest depth H = 1, and g = c^2, so the
   small-wave speed sqrt(gH) is exactly the "wave speed" slider, measured in cells per step.
   The equations are the full (nonlinear) shallow water equations; `nl = 0` switches the nonlinear
   terms off, which leaves the linear equations, where waves simply pass through each other. */
(function (root) {
  'use strict';

  /* ==================================================================
     Part 1. Solver
     ================================================================== */

  var SPONGE_WIDTH = 16;     // cells of absorbing layer along each wall
  var SPONGE_MAX = 0.10;     // peak damping rate (per step) of that layer at full absorption
  var C_MAX = 0.65;          // slider limit; the scheme is stable for c <= 1/sqrt(2) = 0.7071
  var NU_MAX = 0.12;         // slider limit; with this scheme the viscous step is stable for nu <= 1/8 (see "How it works")

  /* Shallow-water equations on an Arakawa C-grid, forward-backward in time.
       eta : surface height, at cell centers        (nx  x ny  values)
       u   : x-velocity,     at vertical cell faces (nx+1 x ny  values)
       v   : y-velocity,     at horizontal faces    (nx  x ny+1 values)
     Depth h = 1 + eta. With nl = 1 the equations are the full nonlinear ones,
       eta_t + div(h u) = 0,    u_t + (u . grad) u = -g grad(eta) + nu laplacian(u),
     with nl = 0 the advection term and the eta*u part of the flux are dropped (linear waves). */
  function createSolver(nx, ny) {
    var nxp = nx + 1;
    var eta = new Float64Array(nx * ny);
    var u = new Float64Array(nxp * ny), un = new Float64Array(nxp * ny);        // un, vn: scratch arrays
    var v = new Float64Array(nx * (ny + 1)), vn = new Float64Array(nx * (ny + 1));
    var sE = new Float64Array(nx * ny);          // sponge damping at cell centers
    var sU = new Float64Array(nxp * ny);         // ... at u faces
    var sV = new Float64Array(nx * (ny + 1));    // ... at v faces
    var P = { c: 0.45, nu: 0.02, alpha: 0, sponge: 1, nl: 1 };   // `sponge` scales the absorbing layer (tests switch it off)
    var etaTop = 0, speedTop = 0;                // largest crest and flow speed seen so far, used to pick the time step
    var substeps = 1;

    function wallDistance(x, y) {                // distance (in cells) from (x, y) to the nearest wall
      return Math.min(x, nx - x, y, ny - y);
    }
    function sponge(x, y) {
      var d = wallDistance(x, y);
      if (d >= SPONGE_WIDTH) return 0;
      var s = 1 - d / SPONGE_WIDTH;
      return P.alpha * P.sponge * SPONGE_MAX * s * s;       // quadratic ramp: no sudden change, so no reflection from the layer itself
    }
    function rebuildSponge() {
      var i, j;
      for (j = 0; j < ny; j++) for (i = 0; i < nx; i++) sE[j * nx + i] = sponge(i + 0.5, j + 0.5);
      for (j = 0; j < ny; j++) for (i = 0; i <= nx; i++) sU[j * nxp + i] = sponge(i, j + 0.5);
      for (j = 0; j <= ny; j++) for (i = 0; i < nx; i++) sV[j * nx + i] = sponge(i + 0.5, j);
    }
    rebuildSponge();

    // One step of length dt (dt <= 1).
    function stepOnce(dt) {
      var c = P.c, nl = P.nl, nud = P.nu * dt, al = P.alpha, g = c * c;
      var i, j, k, row, rm, rp, er, uk, vk, ua, va, dux, duy, top = -1, fast = 0;

      // 1. u: pressure gradient + upwind advection into the scratch array `un` (old eta, old u), then viscosity on that result
      for (j = 0; j < ny; j++) {
        row = j * nxp; er = j * nx; rm = (j > 0 ? row - nxp : row); rp = (j < ny - 1 ? row + nxp : row);
        for (i = 1; i < nx; i++) {
          k = row + i; uk = u[k];
          va = 0.25 * (v[er + i - 1] + v[er + i] + v[er + i - 1 + nx] + v[er + i + nx]);   // v averaged to this u point
          dux = uk > 0 ? uk - u[k - 1] : u[k + 1] - uk;                                  // upwind differences
          duy = va > 0 ? uk - u[rm + i] : u[rp + i] - uk;
          un[k] = uk - dt * (g * (eta[er + i] - eta[er + i - 1]) + nl * (uk * dux + va * duy));
          if (uk > fast) fast = uk; else if (-uk > fast) fast = -uk;
        }
        un[row] = -al * c * eta[er] / Math.sqrt(1 + nl * eta[er]);                        // left wall: outflow = alpha sqrt(g/h) eta  (alpha = 0: solid wall)
        un[row + nx] = al * c * eta[er + nx - 1] / Math.sqrt(1 + nl * eta[er + nx - 1]);  // right wall
      }
      for (j = 0; j < ny; j++) {
        row = j * nxp; rm = (j > 0 ? row - nxp : row); rp = (j < ny - 1 ? row + nxp : row);
        for (i = 1; i < nx; i++) {
          k = row + i;
          u[k] = (un[k] + nud * (un[k + 1] + un[k - 1] + un[rm + i] + un[rp + i] - 4 * un[k])) * (1 - sU[k] * dt);
        }
        u[row] = un[row]; u[row + nx] = un[row + nx];
      }

      // 2. v, the same way
      for (j = 1; j < ny; j++) {
        row = j * nx; rm = (j - 1) * nxp; rp = j * nxp;
        for (i = 0; i < nx; i++) {
          k = row + i; vk = v[k];
          ua = 0.25 * (u[rm + i] + u[rm + i + 1] + u[rp + i] + u[rp + i + 1]);          // u averaged to this v point
          dux = ua > 0 ? vk - v[k - (i > 0 ? 1 : 0)] : v[k + (i < nx - 1 ? 1 : 0)] - vk;
          duy = vk > 0 ? vk - v[k - nx] : v[k + nx] - vk;
          vn[k] = vk - dt * (g * (eta[k] - eta[k - nx]) + nl * (ua * dux + vk * duy));
          if (vk > fast) fast = vk; else if (-vk > fast) fast = -vk;
        }
      }
      for (i = 0; i < nx; i++) {
        vn[i] = -al * c * eta[i] / Math.sqrt(1 + nl * eta[i]);                            // bottom wall (j = 0)
        k = (ny - 1) * nx + i;
        vn[ny * nx + i] = al * c * eta[k] / Math.sqrt(1 + nl * eta[k]);                    // top wall
      }
      for (j = 1; j < ny; j++) {
        row = j * nx;
        for (i = 0; i < nx; i++) {
          k = row + i;
          v[k] = (vn[k] + nud * (vn[k + (i < nx - 1 ? 1 : 0)] + vn[k - (i > 0 ? 1 : 0)] + vn[k + nx] + vn[k - nx] - 4 * vn[k])) * (1 - sV[k] * dt);
        }
      }
      for (i = 0; i < nx; i++) { v[i] = vn[i]; v[ny * nx + i] = vn[ny * nx + i]; }

      // 3. mass fluxes F = (1 + eta_upwind) * velocity on the faces (scratch arrays again), then the NEW eta (the "backward" half)
      for (j = 0; j < ny; j++) {
        row = j * nxp; er = j * nx;
        for (i = 0; i <= nx; i++) {
          uk = u[row + i];
          ua = i === 0 ? eta[er] : i === nx ? eta[er + nx - 1] : uk > 0 ? eta[er + i - 1] : eta[er + i];
          un[row + i] = uk * (1 + nl * ua);
        }
      }
      for (j = 0; j <= ny; j++) {
        row = j * nx;
        for (i = 0; i < nx; i++) {
          vk = v[row + i];
          va = j === 0 ? eta[i] : j === ny ? eta[row - nx + i] : vk > 0 ? eta[row - nx + i] : eta[row + i];
          vn[row + i] = vk * (1 + nl * va);
        }
      }
      for (j = 0; j < ny; j++) {
        row = j * nxp; er = j * nx;
        for (i = 0; i < nx; i++) {
          k = er + i;
          eta[k] = (eta[k] - dt * (un[row + i + 1] - un[row + i] + vn[k + nx] - vn[k])) * (1 - sE[k] * dt);
          if (eta[k] > top) top = eta[k];
        }
      }
      etaTop = top; speedTop = fast;
    }

    // One unit of time. Waves travel at sqrt(g (1 + eta)) + |velocity|, which grows with the wave height, so the unit is
    // cut into equal sub-steps whenever the CFL condition  sqrt(2) * speed * dt <= 1  would otherwise fail (10% margin).
    // Linear mode (nl = 0) never sub-steps: the slider limits already keep it stable.
    function step() {
      substeps = 1;
      if (P.nl > 0) {
        var speed = P.c * Math.sqrt(1 + Math.max(0, etaTop)) + speedTop;
        substeps = Math.min(8, Math.max(1, Math.ceil(1.1 * Math.SQRT2 * speed)));
      }
      var dt = 1 / substeps;
      for (var s = 0; s < substeps; s++) stepOnce(dt);
    }

    // A pebble: a smooth Gaussian dent of height `amp` and spread `s` (cells), the water at rest.
    function drop(x, y, s, amp) {
      var r = Math.ceil(4 * s), i0 = Math.max(0, Math.floor(x - r)), i1 = Math.min(nx - 1, Math.ceil(x + r));
      var j0 = Math.max(0, Math.floor(y - r)), j1 = Math.min(ny - 1, Math.ceil(y + r));
      for (var j = j0; j <= j1; j++) for (var i = i0; i <= i1; i++) {
        var dx = i + 0.5 - x, dy = j + 0.5 - y;
        var e = eta[j * nx + i] + amp * Math.exp(-(dx * dx + dy * dy) / (2 * s * s));
        eta[j * nx + i] = e < -0.8 ? -0.8 : e;               // keep the water from running dry where pebbles pile up
        if (e > etaTop) etaTop = e;
      }
    }

    // E = 1/2 * sum( g eta^2 + h (u^2 + v^2) ); wall faces count half, h on a face is the mean of the cells beside it
    function energy() {
      var g = P.c * P.c, nl = P.nl, e = 0, i, j, k, h, w;
      for (k = 0; k < eta.length; k++) e += g * eta[k] * eta[k];
      for (j = 0; j < ny; j++) for (i = 0; i <= nx; i++) {
        k = u[j * nxp + i]; w = (i === 0 || i === nx) ? 0.5 : 1;
        h = 1 + nl * (i === 0 ? eta[j * nx] : i === nx ? eta[j * nx + nx - 1] : 0.5 * (eta[j * nx + i - 1] + eta[j * nx + i]));
        e += w * h * k * k;
      }
      for (j = 0; j <= ny; j++) for (i = 0; i < nx; i++) {
        k = v[j * nx + i]; w = (j === 0 || j === ny) ? 0.5 : 1;
        h = 1 + nl * (j === 0 ? eta[i] : j === ny ? eta[(ny - 1) * nx + i] : 0.5 * (eta[(j - 1) * nx + i] + eta[j * nx + i]));
        e += w * h * k * k;
      }
      return 0.5 * e;
    }
    function maxAbs() {
      var m = 0;
      for (var k = 0; k < eta.length; k++) { var a = Math.abs(eta[k]); if (a > m) m = a; }
      return m;
    }
    function sum() { var s = 0; for (var k = 0; k < eta.length; k++) s += eta[k]; return s; }
    function reset() { eta.fill(0); u.fill(0); un.fill(0); v.fill(0); vn.fill(0); etaTop = 0; speedTop = 0; }
    function setParams(p) {
      var rebuild = (p.alpha !== undefined && p.alpha !== P.alpha) || (p.sponge !== undefined && p.sponge !== P.sponge);
      for (var key in p) if (key in P) P[key] = p[key];
      if (rebuild) rebuildSponge();
    }

    return {
      nx: nx, ny: ny, eta: eta, params: P,
      u: u, v: v,
      step: step, stepOnce: stepOnce, drop: drop, energy: energy, maxAbs: maxAbs, sum: sum, reset: reset, setParams: setParams,
    };
  }

  var core = { createSolver: createSolver, C_MAX: C_MAX, NU_MAX: NU_MAX, SPONGE_WIDTH: SPONGE_WIDTH };
  if (typeof module !== 'undefined' && module.exports) module.exports = core;
  root.ShallowWater = core;

  /* ==================================================================
     Part 2. Page: canvas, sliders, pointer
     ================================================================== */
  if (typeof document === 'undefined') return;
  var canvas = document.getElementById('sw-canvas');
  if (!canvas) return;

  var NX = 320, NY = 160;               // 2 : 1, matches the canvas
  var STEPS_PER_SECOND = 240;           // simulated steps per real second, whatever the screen's refresh rate
  var MAX_STEPS_PER_FRAME = 12;
  var SHADE_PER_HEIGHT = 0.09;          // color scale = 9% of the pebble height: eta of that size maps to ~76% of full color (tanh)
  var shadeScale = 0.0135;
  var IDLE_BELOW = 2e-5;                // stop stepping once the surface is this flat

  var solver = createSolver(NX, NY);
  var ctx = canvas.getContext('2d');
  var off = document.createElement('canvas');
  off.width = NX; off.height = NY;
  var offCtx = off.getContext('2d');
  var img = offCtx.createImageData(NX, NY);

  var el = function (id) { return document.getElementById(id); };
  var ui = {
    c: el('sw-c'), nu: el('sw-nu'), alpha: el('sw-alpha'), size: el('sw-size'), height: el('sw-height'), nl: el('sw-nl'),
    cVal: el('sw-c-val'), nuVal: el('sw-nu-val'), alphaVal: el('sw-alpha-val'), sizeVal: el('sw-size-val'), heightVal: el('sw-height-val'), nlVal: el('sw-nl-val'),
    pause: el('sw-pause'), clear: el('sw-clear'), random: el('sw-random'),
    status: el('sw-status'), readout: el('sw-readout'),
  };

  var paused = false, baseline = 0, lastNote = '', accumulator = 0, lastTime = 0, visible = true;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function readParams() {
    var p = {
      c: parseFloat(ui.c.value), nu: parseFloat(ui.nu.value), alpha: parseFloat(ui.alpha.value), nl: ui.nl.checked ? 1 : 0,
    };
    solver.setParams(p);
    ui.cVal.textContent = p.c.toFixed(2);
    ui.nuVal.textContent = p.nu.toFixed(3);
    ui.alphaVal.textContent = p.alpha === 0 ? 'reflecting' : p.alpha === 1 ? 'absorbing' : Math.round(p.alpha * 100) + '% absorbing';
    ui.sizeVal.textContent = parseFloat(ui.size.value).toFixed(1);
    ui.heightVal.textContent = parseFloat(ui.height.value).toFixed(2);
    ui.nlVal.textContent = p.nl ? 'on' : 'off';
    shadeScale = SHADE_PER_HEIGHT * parseFloat(ui.height.value);
    wake();
  }

  function pebble(x, y, strength) {
    solver.drop(x, y, parseFloat(ui.size.value), -parseFloat(ui.height.value) * (strength || 1));
    baseline = solver.energy();
    wake();
  }

  /* ---------- drawing ---------- */
  var W = 0, H = 0, dpr = 1;
  function resize() {
    var r = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.max(1, Math.round(r.width * dpr));
    H = Math.max(1, Math.round(W / 2));
    if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; }
    draw();
  }

  // colors: still water is the page's ink; crests lilac, troughs the site's orange
  var CREST = [165, 176, 255], TROUGH = [255, 98, 62], REST = [20, 25, 38], WHITE = [236, 239, 244];
  function draw() {
    var eta = solver.eta, d = img.data, i, j, k, t, a, tone;
    for (j = 0; j < NY; j++) {
      for (i = 0; i < NX; i++) {
        k = j * NX + i;
        t = Math.tanh(eta[k] / shadeScale);                       // -1 .. 1
        // light from the upper left: shade by the surface slope so the ripples look like a surface
        var ex = eta[k + (i < NX - 1 ? 1 : 0)] - eta[k - (i > 0 ? 1 : 0)];
        var ey = eta[k + (j < NY - 1 ? NX : 0)] - eta[k - (j > 0 ? NX : 0)];
        var lit = Math.max(-1, Math.min(1, (-(ex + ey) / shadeScale) * 0.8));
        a = Math.abs(t);
        tone = t >= 0 ? CREST : TROUGH;
        var p = 4 * k;
        for (var q = 0; q < 3; q++) {
          var base = REST[q] + (tone[q] - REST[q]) * a;
          base = lit > 0 ? base + (WHITE[q] - base) * lit * 0.35 : base * (1 + lit * 0.15);
          d[p + q] = base < 0 ? 0 : base > 255 ? 255 : base;
        }
        d[p + 3] = 255;
      }
    }
    offCtx.putImageData(img, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(off, 0, 0, W, H);
    drawWalls();
  }

  function drawWalls() {
    var al = solver.params.alpha, sw = (SPONGE_WIDTH / NX) * W, e, grd;
    var lw = Math.max(2, 2 * dpr);
    if (al > 0) {                                         // the absorbing layer, drawn as a soft darkening toward each wall
      var shade = 'rgba(13,16,22,' + (0.62 * al).toFixed(3) + ')', clear = 'rgba(13,16,22,0)';
      var sv = (SPONGE_WIDTH / NY) * H;                   // same number of cells vertically
      grd = ctx.createLinearGradient(0, 0, sw, 0); grd.addColorStop(0, shade); grd.addColorStop(1, clear);
      ctx.fillStyle = grd; ctx.fillRect(0, 0, sw, H);
      grd = ctx.createLinearGradient(W, 0, W - sw, 0); grd.addColorStop(0, shade); grd.addColorStop(1, clear);
      ctx.fillStyle = grd; ctx.fillRect(W - sw, 0, sw, H);
      grd = ctx.createLinearGradient(0, 0, 0, sv); grd.addColorStop(0, shade); grd.addColorStop(1, clear);
      ctx.fillStyle = grd; ctx.fillRect(0, 0, W, sv);
      grd = ctx.createLinearGradient(0, H, 0, H - sv); grd.addColorStop(0, shade); grd.addColorStop(1, clear);
      ctx.fillStyle = grd; ctx.fillRect(0, H - sv, W, sv);
    }
    e = lw / 2;                                           // the wall itself: solid when reflecting, fading out as it absorbs
    ctx.lineWidth = lw;
    ctx.strokeStyle = 'rgba(143,155,255,' + (0.95 - 0.8 * al).toFixed(3) + ')';
    ctx.strokeRect(e, e, W - lw, H - lw);
  }

  /* ---------- readouts ---------- */
  function updateReadout() {
    var C = solver.params.c;
    var pct = baseline > 1e-12 ? Math.round(100 * Math.min(1, solver.energy() / baseline)) : 0;
    var txt = 'Courant ' + C.toFixed(2) + ' · energy left ' + pct + '%';
    if (txt !== lastNote) { ui.readout.textContent = txt; lastNote = txt; }
  }

  /* ---------- main loop ---------- */
  var running = false;
  function wake() { if (!running) { running = true; lastTime = 0; requestAnimationFrame(frame); } }

  function frame(now) {
    if (!lastTime) lastTime = now;
    var dt = Math.min(0.05, (now - lastTime) / 1000);   // clamp after tab switches
    lastTime = now;
    if (!paused && visible) {
      accumulator += dt * STEPS_PER_SECOND;
      var n = Math.min(MAX_STEPS_PER_FRAME, Math.floor(accumulator));
      accumulator -= Math.floor(accumulator);
      for (var s = 0; s < n; s++) solver.step();
    }
    if (visible) { draw(); updateReadout(); }
    // stop the loop when nothing can change: paused, scrolled away, or the surface is flat. wake() restarts it.
    if (paused || !visible || solver.maxAbs() < IDLE_BELOW) { running = false; return; }
    requestAnimationFrame(frame);
  }

  /* ---------- pointer ---------- */
  var down = false, lastX = 0, lastY = 0;
  function toGrid(ev) {
    var r = canvas.getBoundingClientRect();
    return { x: ((ev.clientX - r.left) / r.width) * NX, y: ((ev.clientY - r.top) / r.height) * NY };
  }
  canvas.addEventListener('pointerdown', function (ev) {
    down = true;
    canvas.setPointerCapture(ev.pointerId);
    var p = toGrid(ev); lastX = p.x; lastY = p.y;
    pebble(p.x, p.y, 1);
    if (paused) draw();
    ev.preventDefault();
  });
  canvas.addEventListener('pointermove', function (ev) {
    if (!down) return;
    var p = toGrid(ev), dx = p.x - lastX, dy = p.y - lastY;
    if (dx * dx + dy * dy >= 36) {                      // a trail of smaller pebbles, one every 6 cells
      lastX = p.x; lastY = p.y; pebble(p.x, p.y, 0.6);
      if (paused) draw();
    }
  });
  function up(ev) { down = false; if (canvas.hasPointerCapture && canvas.hasPointerCapture(ev.pointerId)) canvas.releasePointerCapture(ev.pointerId); }
  canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointercancel', up);

  function randomPebble() {
    var m = SPONGE_WIDTH;
    pebble(m + Math.random() * (NX - 2 * m), m + Math.random() * (NY - 2 * m), 1);
    if (paused) draw();
  }
  canvas.addEventListener('keydown', function (ev) {
    if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); randomPebble(); }
  });

  /* ---------- controls ---------- */
  ['c', 'nu', 'alpha', 'size', 'height'].forEach(function (key) { ui[key].addEventListener('input', readParams); });
  ui.nl.addEventListener('change', readParams);
  ui.random.addEventListener('click', randomPebble);
  ui.clear.addEventListener('click', function () {
    solver.reset(); baseline = 0; updateReadout(); draw();
  });
  ui.pause.addEventListener('click', function () {
    paused = !paused;
    ui.pause.textContent = paused ? 'Play' : 'Pause';
    ui.pause.setAttribute('aria-pressed', paused ? 'true' : 'false');
    if (!paused) wake();
  });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible && !paused) wake();
    }).observe(canvas);
  }
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas); else window.addEventListener('resize', resize);

  readParams();
  resize();
  if (!reduceMotion) { solver.drop(NX * 0.36, NY * 0.5, parseFloat(ui.size.value), -parseFloat(ui.height.value)); baseline = solver.energy(); wake(); }
  updateReadout();
})(typeof window !== 'undefined' ? window : globalThis);
