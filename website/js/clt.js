/* Central Limit Theorem Visualization: canvas port of github.com/sarthakdass/clt-draw
   The maths below mirrors clt_draw/core.py line for line, so both versions give the same numbers.
   Plain JS, no dependencies. */
(function () {
  'use strict';

  /* ==================================================================
     Core mathematics (no DOM)
     ================================================================== */
  var LATTICE = 1024;        // points the drawn curve is resampled to
  var LEVELS = 10;           // n = 2^1 ... 2^10
  var Z_MAX = 5;             // the plot shows z in [-Z_MAX, Z_MAX]
  var Z_POINTS = 1001;
  var MIN_COLUMNS = 20;      // a curve must cover at least this many drawing columns
  var RES = 1000;            // drawing columns (resolution-independent)

  var Z_GRID = new Float64Array(Z_POINTS);
  for (var zi = 0; zi < Z_POINTS; zi++) Z_GRID[zi] = -Z_MAX + (2 * Z_MAX * zi) / (Z_POINTS - 1);

  function normalPdf(z) { return Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI); }

  // Standard normal CDF, Abramowitz & Stegun 7.1.26 (|error| < 1.5e-7), same as the Python core
  function normalCdf(z) {
    var x = Math.abs(z) / Math.SQRT2;
    var t = 1 / (1 + 0.3275911 * x);
    var poly = t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))));
    return 0.5 * (1 + Math.sign(z) * (1 - poly * Math.exp(-x * x)));
  }

  // Turn what was drawn (NaN where nothing was) into densities on the lattice; null if too little.
  function valuesFromColumns(cols, lattice) {
    lattice = lattice || LATTICE;
    var drawn = [];
    for (var i = 0; i < cols.length; i++) if (!isNaN(cols[i])) drawn.push(i);
    if (drawn.length < MIN_COLUMNS) return null;
    var first = drawn[0], last = drawn[drawn.length - 1], m = last - first + 1;

    var filled = new Float64Array(m), j = 0;                    // linear fill of gaps (np.interp)
    for (var c = first; c <= last; c++) {
      while (j < drawn.length - 2 && drawn[j + 1] < c) j++;
      var a = drawn[j], b = drawn[j + 1] === undefined ? drawn[j] : drawn[j + 1];
      var ya = cols[a], yb = cols[b];
      filled[c - first] = b === a ? ya : ya + ((c - a) / (b - a)) * (yb - ya);
    }

    var values = new Float64Array(lattice), sum = 0;            // resample to the lattice
    for (var t = 0; t < lattice; t++) {
      var pos = (t * (m - 1)) / (lattice - 1), i0 = Math.floor(pos), f = pos - i0;
      var v = i0 >= m - 1 ? filled[m - 1] : filled[i0] * (1 - f) + filled[i0 + 1] * f;
      if (v < 0) v = 0;
      values[t] = v;
      sum += v;
    }
    return sum > 0 ? values : null;
  }

  // Iterative radix-2 FFT with one shared twiddle table (so every smaller size reuses it)
  function makeFFT(maxN) {
    var half = maxN >> 1, C = new Float64Array(half), S = new Float64Array(half);
    for (var k = 0; k < half; k++) { var a = (-2 * Math.PI * k) / maxN; C[k] = Math.cos(a); S[k] = Math.sin(a); }
    return function fft(re, im, n, inverse) {
      for (var i = 1, j = 0; i < n; i++) {
        var bit = n >> 1;
        for (; j & bit; bit >>= 1) j ^= bit;
        j ^= bit;
        if (i < j) { var t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; }
      }
      for (var len = 2; len <= n; len <<= 1) {
        var h = len >> 1, step = maxN / len;
        for (var s = 0; s < n; s += len) {
          for (var q = 0, idx = 0; q < h; q++, idx += step) {
            var wr = C[idx], wi = inverse ? -S[idx] : S[idx];
            var p = s + q, r = p + h;
            var xr = re[r] * wr - im[r] * wi, xi = re[r] * wi + im[r] * wr;
            re[r] = re[p] - xr; im[r] = im[p] - xi;
            re[p] += xr; im[p] += xi;
          }
        }
      }
    };
  }

  function nextPow2(n) { var s = 1; while (s < n) s <<= 1; return s; }

  // The pmf of the sum of two independent copies: convolve it with itself via the FFT.
  function convolveWithItself(pmf, fft, re, im) {
    var outLen = 2 * pmf.length - 1, size = nextPow2(outLen);
    re.fill(0, 0, size); im.fill(0, 0, size);
    re.set(pmf);
    fft(re, im, size, false);
    for (var k = 0; k < size; k++) {                            // square the spectrum
      var a = re[k], b = im[k];
      re[k] = a * a - b * b; im[k] = 2 * a * b;
    }
    fft(re, im, size, true);
    var out = new Float64Array(outLen), total = 0;
    for (var i = 0; i < outLen; i++) { var v = re[i] / size; if (v < 0) v = 0; out[i] = v; total += v; }
    for (var j = 0; j < outLen; j++) out[j] /= total;
    return out;
  }

  // Standardize the pmf of a sum of n draws and measure how normal it is.
  function standardizedLevel(pmf, n, meanIdx, stdIdx) {
    var len = pmf.length, scale = stdIdx * Math.sqrt(n), shift = n * meanIdx;

    var density = new Float64Array(Z_POINTS);
    for (var g = 0; g < Z_POINTS; g++) {
      var pos = Z_GRID[g] * scale + shift;
      if (pos < 0 || pos > len - 1) continue;
      var i0 = Math.floor(pos), f = pos - i0;
      density[g] = (i0 >= len - 1 ? pmf[len - 1] : pmf[i0] * (1 - f) + pmf[i0 + 1] * f) * scale;
    }

    var cdf = 0, ks = 0, skew = 0, kurt = 0;
    for (var k = 0; k < len; k++) {
      var z = (k - shift) / scale, p = pmf[k], phi = normalCdf(z);
      var before = cdf;
      cdf += p;
      var d = Math.max(Math.abs(cdf - phi), Math.abs(before - phi));      // both sides of each jump
      if (d > ks) ks = d;
      var z2 = z * z;
      skew += p * z2 * z;
      kurt += p * z2 * z2;
    }
    return { n: n, density: density, ks: ks, skew: skew, kurt: kurt };
  }

  // Returns step(): the next level each call (n = 1, 2, 4, ..., 1024), then null.
  function makeStepper(values, levels) {
    levels = levels || LEVELS;
    var sum = 0, i;
    for (i = 0; i < values.length; i++) sum += values[i];
    var pmf = new Float64Array(values.length);
    for (i = 0; i < values.length; i++) pmf[i] = values[i] / sum;

    var mean = 0;
    for (i = 0; i < pmf.length; i++) mean += i * pmf[i];
    var varr = 0;
    for (i = 0; i < pmf.length; i++) varr += (i - mean) * (i - mean) * pmf[i];
    var std = Math.sqrt(varr);
    if (std === 0) throw new Error('the curve has zero spread');

    var lastLen = (Math.pow(2, levels - 1) * (pmf.length - 1)) + 1;          // length before the final doubling
    var maxN = nextPow2(2 * lastLen - 1);
    var fft = makeFFT(maxN), re = new Float64Array(maxN), im = new Float64Array(maxN);

    var lvl = 0;
    return function step() {
      if (lvl > levels) return null;
      if (lvl > 0) pmf = convolveWithItself(pmf, fft, re, im);               // n/2 draws + n/2 draws -> n draws
      var out = standardizedLevel(pmf, Math.pow(2, lvl), mean, std);
      lvl++;
      return out;
    };
  }

  function computeLevels(values, levels) {
    var step = makeStepper(values, levels), out = [], lv;
    while ((lv = step())) out.push(lv);
    return out;
  }

  // Exposed for testing against the Python implementation.
  window.CLTCore = { LATTICE: LATTICE, LEVELS: LEVELS, Z_GRID: Z_GRID, normalCdf: normalCdf,
                     valuesFromColumns: valuesFromColumns, computeLevels: computeLevels };

  /* ==================================================================
     Interface
     ================================================================== */
  var canvas = document.getElementById('clt-canvas');
  if (!canvas) return;                                  // core only (e.g. when imported for tests)

  var chart = document.getElementById('clt-chart');
  var ctx = canvas.getContext('2d'), cctx = chart.getContext('2d');
  var statusEl = document.getElementById('clt-status');
  var readoutEl = document.getElementById('clt-readout');
  var submitBtn = document.getElementById('clt-submit');
  var redrawBtn = document.getElementById('clt-redraw');
  var showNormal = document.getElementById('show-normal');
  var showOriginal = document.getElementById('show-original');
  var slider = document.getElementById('n-slider');
  var ticksEl = document.getElementById('n-ticks');

  var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var INK = '#0d1016', TEXT = '#e9ecf2', SOFT = '#a3acbd', ACCENT = '#ff5a36', LILAC = '#8f9bff', RULE = '#2a3142';

  var cols = new Float64Array(RES).fill(NaN);
  var drawing = false, lastCol = null, lastVal = 0;
  var locked = false, ready = false, computing = false;
  var levels = [], sel = 0, nValues = [];
  for (var li = 1; li <= LEVELS; li++) nValues.push(Math.pow(2, li));
  var shown = new Float64Array(Z_POINTS), shownY = 0.5, targetY = 0.5, target = null, raf = 0, lastTs = 0;

  // ---- sizing -------------------------------------------------------------
  function fit(cv) {
    var r = cv.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = Math.max(10, Math.round(r.width)), h = Math.max(10, Math.round(r.height));
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) {
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    }
    cv.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
    return { w: w, h: h };
  }
  function geom(w, h) {
    var narrow = w < 560;
    return { x0: 26, x1: w - 26, top: narrow ? 74 : 58, base: h - 44 };
  }

  // ---- drawing phase ------------------------------------------------------
  function clamp(v, a, b) { return Math.min(Math.max(v, a), b); }

  function paint(e) {
    var r = canvas.getBoundingClientRect(), g = geom(r.width, r.height);
    var x = e.clientX - r.left, y = e.clientY - r.top;
    var col = Math.round(clamp(((x - g.x0) / (g.x1 - g.x0)) * (RES - 1), 0, RES - 1));
    var val = (g.base - y) / (g.base - g.top);
    if (lastCol === null) cols[col] = val;
    else {                                              // fill every column the stroke crossed
      var a = Math.min(lastCol, col), b = Math.max(lastCol, col);
      for (var c = a; c <= b; c++) {
        var t = b === a ? 0 : (c - lastCol) / (col - lastCol);
        cols[c] = lastVal + t * (val - lastVal);
      }
    }
    lastCol = col; lastVal = val;
  }

  canvas.addEventListener('pointerdown', function (e) {
    if (locked) return;
    drawing = true; lastCol = null;
    canvas.setPointerCapture(e.pointerId);
    paint(e); refresh();
  });
  canvas.addEventListener('pointermove', function (e) { if (drawing) { paint(e); refresh(); } });
  function endStroke() { drawing = false; lastCol = null; refresh(); }
  canvas.addEventListener('pointerup', endStroke);
  canvas.addEventListener('pointercancel', endStroke);

  // ---- rendering ----------------------------------------------------------
  function line(c, xs, ys, n) {
    c.beginPath();
    for (var i = 0; i < n; i++) { if (i === 0) c.moveTo(xs[i], ys[i]); else c.lineTo(xs[i], ys[i]); }
  }

  function drawAxis(g) {
    ctx.fillStyle = SOFT; ctx.font = '400 12px "IBM Plex Mono", monospace'; ctx.textAlign = 'center';
    for (var z = -Z_MAX; z <= Z_MAX; z++) {                       // ticks at -5 ... 5
      var px = g.x0 + ((z + Z_MAX) / (2 * Z_MAX)) * (g.x1 - g.x0);
      ctx.strokeStyle = SOFT; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(px, g.base); ctx.lineTo(px, g.base + 5); ctx.stroke();
      ctx.fillText(String(z), px, g.base + 19);
    }
    ctx.textAlign = 'right';
    ctx.fillText(locked ? 'z : standard deviations from the mean' : 'x', g.x1, g.base + 36);
  }

  function render() {
    var s = fit(canvas), g = geom(s.w, s.h), w = s.w, h = s.h;
    ctx.clearRect(0, 0, w, h);
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.strokeStyle = SOFT; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(g.x0, g.base + 0.5); ctx.lineTo(g.x1, g.base + 0.5); ctx.stroke();

    drawAxis(g);

    if (!locked) {
      var xs = [], ys = [];
      for (var i = 0; i < RES; i++) {
        if (isNaN(cols[i])) continue;
        xs.push(g.x0 + (i / (RES - 1)) * (g.x1 - g.x0));
        ys.push(g.base - Math.max(cols[i], 0) * (g.base - g.top));
      }
      if (!xs.length) {
        ctx.fillStyle = SOFT; ctx.font = '500 15px "IBM Plex Sans", system-ui, sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('Drag to draw a curve above the baseline.', w / 2, (g.top + g.base) / 2 - 8);
        ctx.fillText('It becomes your probability density.', w / 2, (g.top + g.base) / 2 + 14);
        return;
      }
      ctx.save();
      ctx.beginPath(); ctx.rect(0, g.top - 12, w, g.base - g.top + 12); ctx.clip();
      if (xs.length > 1) {
        ctx.beginPath(); ctx.moveTo(xs[0], g.base);
        for (var a = 0; a < xs.length; a++) ctx.lineTo(xs[a], ys[a]);
        ctx.lineTo(xs[xs.length - 1], g.base); ctx.closePath();
        ctx.fillStyle = 'rgba(143,155,255,0.22)'; ctx.fill();
        line(ctx, xs, ys, xs.length); ctx.strokeStyle = TEXT; ctx.lineWidth = 3; ctx.stroke();
      }
      ctx.restore();
      return;
    }

    if (!ready || !levels.length) return;

    var X = new Float64Array(Z_POINTS), Y = new Float64Array(Z_POINTS), k;
    var toX = function (zz) { return g.x0 + ((zz + Z_MAX) / (2 * Z_MAX)) * (g.x1 - g.x0); };
    var toY = function (d) { return g.base - (Math.max(d, 0) / shownY) * (g.base - g.top); };
    for (k = 0; k < Z_POINTS; k++) X[k] = toX(Z_GRID[k]);

    ctx.save();
    ctx.beginPath(); ctx.rect(g.x0 - 2, g.top - 6, g.x1 - g.x0 + 4, g.base - g.top + 7); ctx.clip();
    ctx.setLineDash([7, 6]); ctx.lineWidth = 2;
    if (showOriginal.checked) {                         // tall spikes in the original simply run off the top
      for (k = 0; k < Z_POINTS; k++) Y[k] = toY(levels[0].density[k]);
      line(ctx, X, Y, Z_POINTS); ctx.strokeStyle = LILAC; ctx.stroke();
    }
    if (showNormal.checked) {
      for (k = 0; k < Z_POINTS; k++) Y[k] = toY(normalPdf(Z_GRID[k]));
      line(ctx, X, Y, Z_POINTS); ctx.strokeStyle = TEXT; ctx.stroke();
    }
    ctx.setLineDash([]);
    for (k = 0; k < Z_POINTS; k++) Y[k] = toY(shown[k]);
    ctx.beginPath(); ctx.moveTo(X[0], g.base);
    for (k = 0; k < Z_POINTS; k++) ctx.lineTo(X[k], Y[k]);
    ctx.lineTo(X[Z_POINTS - 1], g.base); ctx.closePath();
    ctx.fillStyle = 'rgba(255,90,54,0.28)'; ctx.fill();
    line(ctx, X, Y, Z_POINTS); ctx.strokeStyle = ACCENT; ctx.lineWidth = 3; ctx.stroke();
    ctx.restore();
  }

  function renderChart() {
    var s = fit(chart), w = s.w, h = s.h;
    cctx.clearRect(0, 0, w, h);
    cctx.textBaseline = 'alphabetic';
    cctx.fillStyle = SOFT; cctx.font = '400 12px "IBM Plex Mono", monospace'; cctx.textAlign = 'center';
    if (levels.length < 3) {
      cctx.fillText('Submit a curve to see how quickly the', w / 2, h / 2 - 8);
      cctx.fillText('distance to the normal curve shrinks.', w / 2, h / 2 + 12);
      return;
    }
    var ks = [], i;
    for (i = 1; i < levels.length; i++) ks.push(levels[i].ks);
    var lo = Math.min.apply(null, ks) * 0.6, hi = Math.max.apply(null, ks) * 1.5;
    var left = 54, right = w - 24, top = 46, bottom = h - 40;
    var X = function (j) { return left + (j / (LEVELS - 1)) * (right - left); };
    var Y = function (v) { return bottom - ((Math.log(v) - Math.log(lo)) / (Math.log(hi) - Math.log(lo))) * (bottom - top); };

    cctx.textAlign = 'right';                           // decade gridlines
    for (var p = Math.ceil(Math.log10(lo)); p <= Math.floor(Math.log10(hi)); p++) {
      var yy = Y(Math.pow(10, p));
      cctx.strokeStyle = 'rgba(163,172,189,0.2)'; cctx.lineWidth = 1;
      cctx.beginPath(); cctx.moveTo(left, yy); cctx.lineTo(right, yy); cctx.stroke();
      cctx.fillText(String(Math.pow(10, p)), left - 8, yy + 4);
    }
    cctx.textAlign = 'center';                          // n labels
    var every = w < 560 ? 2 : 1;
    for (i = 0; i < LEVELS; i += every) cctx.fillText(String(nValues[i]), X(i), bottom + 20);

    cctx.setLineDash([4, 5]); cctx.strokeStyle = SOFT; cctx.lineWidth = 1;   // 1/sqrt(n) guide
    cctx.beginPath();
    for (i = 0; i < LEVELS; i++) { var ry = Y(ks[0] * Math.pow(2, -i / 2)); if (i === 0) cctx.moveTo(X(i), ry); else cctx.lineTo(X(i), ry); }
    cctx.stroke(); cctx.setLineDash([]);

    cctx.beginPath();
    for (i = 0; i < LEVELS; i++) { if (i === 0) cctx.moveTo(X(i), Y(ks[i])); else cctx.lineTo(X(i), Y(ks[i])); }
    cctx.strokeStyle = LILAC; cctx.lineWidth = 2; cctx.stroke();
    for (i = 0; i < LEVELS; i++) {
      var on = ready && i === sel;
      cctx.beginPath(); cctx.arc(X(i), Y(ks[i]), on ? 6.5 : 3.5, 0, 2 * Math.PI);
      cctx.fillStyle = on ? ACCENT : LILAC; cctx.fill();
    }
    cctx.fillStyle = SOFT; cctx.textAlign = 'right';
    cctx.fillText('dashed: 1/\u221an', right, 28);
    chart.setAttribute('aria-label', 'Distance to the normal curve falls from ' + ks[0].toFixed(3) + ' at n = 2 to ' +
      ks[ks.length - 1].toFixed(4) + ' at n = 1024');
  }

  // ---- state transitions --------------------------------------------------
  function refresh() {
    updateControls();
    render();
  }

  function drawnColumns() {
    var c = 0;
    for (var i = 0; i < RES; i++) if (!isNaN(cols[i])) c++;
    return c;
  }

  function updateControls() {
    submitBtn.disabled = locked || !valuesFromColumns(cols);
    slider.disabled = !ready;
    ticksEl.classList.toggle('is-disabled', !ready);
    if (!locked) {
      statusEl.textContent = drawnColumns() ? 'Press \u201cSubmit curve\u201d to lock it in.' : 'Drag on the canvas to draw your probability density function.';
      readoutEl.textContent = '';
    }
  }

  function submit() {
    var values = valuesFromColumns(cols);
    if (!values) return;
    locked = true; ready = false; computing = true; levels = [];
    refresh();
    var step = makeStepper(values);
    (function next() {
      var lv = step();
      if (lv) {
        levels.push(lv);
        statusEl.textContent = 'Precomputing sums by doubling\u2026 n = ' + lv.n;
        renderChart();
        setTimeout(next, 16);                           // yield so the page can repaint between levels
      } else {
        computing = false; ready = true;
        refresh();
        select(0, true);
        slider.focus({ preventScroll: true });
      }
    })();
  }

  function reset() {
    cancelAnimationFrame(raf); raf = 0;
    cols.fill(NaN); lastCol = null; drawing = false;
    locked = false; ready = false; computing = false; levels = []; sel = 0; target = null;
    slider.value = 0;
    refresh(); renderChart();
  }

  function select(i, instant) {
    sel = i;
    slider.value = String(i);
    slider.setAttribute('aria-valuetext', 'n = ' + nValues[i]);
    Array.prototype.forEach.call(ticksEl.children, function (b, j) { b.classList.toggle('is-on', j === i); });
    var lv = levels[i + 1];
    target = lv.density;
    var peak = 0;
    for (var k = 0; k < Z_POINTS; k++) if (target[k] > peak) peak = target[k];
    targetY = Math.max(0.45, 1.15 * peak);
    statusEl.textContent = 'Sum of ' + lv.n + ' draws, rescaled to mean 0 and spread 1';
    readoutEl.textContent = 'n = ' + lv.n + '  \u00b7  D = ' + lv.ks.toFixed(4) + '  \u00b7  skew ' + signed(lv.skew) +
      '  \u00b7  kurtosis ' + lv.kurt.toFixed(3);
    if (instant || reduce) {
      shown.set(target); shownY = targetY;
      render();
    } else if (!raf) {
      lastTs = performance.now();
      raf = requestAnimationFrame(animate);
    }
    renderChart();
  }
  function signed(v) { return (v < 0 ? '\u2212' : '+') + Math.abs(v).toFixed(3); }

  function animate(ts) {                                // glide to the newly selected density
    var dt = Math.min(50, ts - lastTs); lastTs = ts;
    var k = 1 - Math.exp(-dt / 80), maxd = 0;
    for (var i = 0; i < Z_POINTS; i++) {
      var d = target[i] - shown[i];
      shown[i] += d * k;
      if (Math.abs(d) > maxd) maxd = Math.abs(d);
    }
    shownY += (targetY - shownY) * k;
    render();
    if (maxd > 1e-4 || Math.abs(targetY - shownY) > 1e-3) raf = requestAnimationFrame(animate);
    else { shown.set(target); shownY = targetY; render(); raf = 0; }
  }

  // ---- ticks + events -----------------------------------------------------
  nValues.forEach(function (n, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.textContent = String(n);
    b.setAttribute('aria-label', 'n = ' + n);
    b.addEventListener('click', function () { if (ready) select(i, false); });
    ticksEl.appendChild(b);
  });

  slider.addEventListener('input', function () { if (ready) select(parseInt(slider.value, 10), false); });
  submitBtn.addEventListener('click', submit);
  redrawBtn.addEventListener('click', reset);
  showNormal.addEventListener('change', render);
  showOriginal.addEventListener('change', render);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !locked && !e.target.closest('button, input, a') && !submitBtn.disabled) submit();
  });

  var rt = 0;
  function onResize() { clearTimeout(rt); rt = setTimeout(function () { render(); renderChart(); }, 60); }
  if ('ResizeObserver' in window) { new ResizeObserver(onResize).observe(canvas); new ResizeObserver(onResize).observe(chart); }
  else window.addEventListener('resize', onResize);

  reset();
})();
