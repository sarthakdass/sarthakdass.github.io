/* NYC Yellow Taxi Tip Prediction: the interactive parts of the project page.
 * Plain JS, no dependencies. The zone shapes and numbers come from js/taxi-data.js,
 * which tools/prep_taxi_data.py builds from the project's folium maps.
 *
 *   1. threshold explorer  (why the label is "tip above 25% of the fare")
 *   2. bar charts          (cleaning, results, regression, location vs. time)
 *   3. the zone map        (seven layers, hover or tap a zone for its numbers, zoom and pan)
 */
(function () {
  'use strict';

  var SVGNS = 'http://www.w3.org/2000/svg';
  function $(id) { return document.getElementById(id); }
  function pct(v, d) { return (v * 100).toFixed(d == null ? 1 : d) + '%'; }
  function signed(v, d) { return (v >= 0 ? '+' : '−') + Math.abs(v * 100).toFixed(d == null ? 1 : d); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function commas(n) { return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','); }

  /* ------------------------------------------------------------------ 1. threshold explorer */
  var TH = {
    20: { share: 0.773, text: 'At 20%, 77.3% of card trips count as generous. A model that always answers “generous” would already be right 77.3% of the time, so any real classifier would look good next to it.' },
    25: { share: 0.625, text: 'At 25%, 62.5% of trips count as generous. Always answering “generous” is right 62.5% of the time. That is the bar the model has to beat.' },
    30: { share: 0.355, text: 'At 30%, only 35.5% of trips count as generous, so always answering “not generous” is right 64.5% of the time. Also workable, but 25% sits nearer the middle of the tip options a payment screen usually offers.' }
  };
  var QUANT = [[10, 11.5], [25, 21.5], [50, 27.3], [75, 32.3], [90, 38.4]];

  function thresholdExplorer() {
    var root = $('tx-threshold');
    if (!root) return;
    var buttons = root.querySelectorAll('[data-th]');
    var fill = $('tx-th-fill'), mark = $('tx-th-mark'), out = $('tx-th-text'), val = $('tx-th-val'), lab = $('tx-th-label');
    var q = $('tx-quant');
    q.innerHTML = QUANT.map(function (p) {
      return '<span class="tx-q" style="left:' + (p[1] / 45 * 100) + '%"><i></i><b>' + p[1].toFixed(1) + '%</b><em>' + p[0] + 'th</em></span>';
    }).join('');
    function set(t) {
      var d = TH[t];
      Array.prototype.forEach.call(buttons, function (b) { b.classList.toggle('is-on', +b.dataset.th === t); b.setAttribute('aria-pressed', +b.dataset.th === t); });
      fill.style.width = (d.share * 100) + '%';
      mark.style.left = (t / 45 * 100) + '%';
      val.textContent = (d.share * 100).toFixed(1) + '%';
      lab.textContent = 'of card trips tip more than ' + t + '% of the fare';
      out.textContent = d.text;
    }
    Array.prototype.forEach.call(buttons, function (b) { b.addEventListener('click', function () { set(+b.dataset.th); }); });
    set(25);
  }

  /* ------------------------------------------------------------------ 2. bar charts */
  // rows: [{label, sub, bars:[{v, cls, text}]}], max = value that fills the track
  function barChart(el, rows, max, opts) {
    if (!el) return;
    opts = opts || {};
    el.innerHTML = rows.map(function (r) {
      var bars = r.bars.map(function (b) {
        return '<div class="tx-bar"><div class="tx-track"><span class="tx-fill ' + (b.cls || '') + '" data-w="' + Math.max(0.6, b.v / max * 100) + '"></span>' +
          (b.mark != null ? '<span class="tx-tick" style="left:' + (b.mark / max * 100) + '%" title="' + esc(b.markTitle || '') + '"></span>' : '') +
          '</div><span class="tx-val">' + b.text + '</span></div>';
      }).join('');
      return '<div class="tx-row"><div class="tx-lab">' + r.label + (r.sub ? '<small>' + r.sub + '</small>' : '') + '</div><div class="tx-bars">' + bars + '</div></div>';
    }).join('');
    var go = function () {
      Array.prototype.forEach.call(el.querySelectorAll('.tx-fill'), function (f) { f.style.width = f.dataset.w + '%'; });
    };
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        if (es[0].isIntersecting) { go(); io.disconnect(); }
      }, { threshold: 0.2 });
      io.observe(el);
      setTimeout(go, 2500);
    } else go();
  }

  function charts() {
    // rows removed by cleaning (January 2025, 3,475,226 raw rows; categories overlap)
    var noise = [
      ['Paid with cash (tip recorded as $0)', 1030833, 29.7],
      ['Fare below the $2.50 minimum', 148270, 4.3],
      ['Zero-distance trips', 90893, 2.6],
      ['Unmapped zone IDs (above 263)', 28357, 0.8],
      ['Drop-off at or before pick-up', 2051, 0.06],
      ['Fare above $200', 1020, 0.03]
    ];
    barChart($('tx-noise'), noise.map(function (n) {
      return { label: n[0], bars: [{ v: n[2], cls: 'is-accent', text: commas(n[1]) + ' <small>' + n[2] + '%</small>' }] };
    }), 30);

    // accuracy vs. the always-guess baseline
    var sets = [
      ['January, held-out 20%', '468,013 trips', 62.4, 75.5, 13.1, '0.735'],
      ['February, unseen month', '2,236,061 trips', 62.0, 74.7, 12.7, '0.727'],
      ['December, unseen month', '2,382,363 trips', 59.5, 76.1, 16.6, '0.758']
    ];
    barChart($('tx-results'), sets.map(function (s) {
      return { label: s[0], sub: s[1] + ' · AUC ' + s[5], bars: [
        { v: s[2], cls: 'is-base', text: s[2].toFixed(1) + '% <small>always “generous”</small>' },
        { v: s[3], cls: 'is-accent', text: s[3].toFixed(1) + '% <small>decision tree, +' + s[4].toFixed(1) + ' pts</small>' }
      ] };
    }), 100);

    // regression: nested models, then used as a classifier
    var r2 = [['Mean tip only', 0.0], ['Fare only', 0.582], ['Full model, 82 features', 0.599]];
    barChart($('tx-r2'), r2.map(function (r, i) {
      return { label: r[0], bars: [{ v: r[1], cls: i === 2 ? 'is-accent' : 'is-base', text: 'R² = ' + r[1].toFixed(3).replace(/0+$/, '').replace(/\.$/, '.0') }] };
    }), 1);
    var cls = [['Always “generous”', 62.4, 'is-base'], ['Linear regression, thresholded', 66.9, 'is-lilac'], ['Decision tree', 75.5, 'is-accent']];
    barChart($('tx-cls'), cls.map(function (c) {
      return { label: c[0], bars: [{ v: c[1], cls: c[2], text: c[1].toFixed(1) + '%' }] };
    }), 100);

    // weekday rush vs. Fri/Sat night, February, by pickup group
    var G = [
      ['JFK Airport', 4607, .110, .121, 3528, .123, .123],
      ['LaGuardia Airport', 4709, .638, .651, 1715, .566, .563],
      ['Midtown', 42129, .665, .667, 25008, .634, .653],
      ['Other Manhattan', 148358, .572, .579, 139462, .612, .635],
      ['Outer boroughs (no airports)', 1593, .368, .350, 1493, .397, .389]
    ];
    barChart($('tx-groups'), G.map(function (g) {
      var ch = (g[5] - g[2]) * 100;
      return { label: g[0], sub: 'night vs. rush: ' + (ch >= 0 ? '+' : '−') + Math.abs(ch).toFixed(1) + ' pts', bars: [
        { v: g[2] * 100, mark: g[3] * 100, markTitle: 'Model average: ' + pct(g[3]), cls: 'is-base', text: pct(g[2]) + ' <small>weekday 7–10am · ' + commas(g[1]) + ' trips</small>' },
        { v: g[5] * 100, mark: g[6] * 100, markTitle: 'Model average: ' + pct(g[6]), cls: 'is-accent', text: pct(g[5]) + ' <small>Fri/Sat 10pm–4am · ' + commas(g[4]) + ' trips</small>' }
      ] };
    }), 100);
  }

  /* ------------------------------------------------------------------ 3. zone map */
  var YLORRD = ['#ffffcc', '#ffeda0', '#fed976', '#feb24c', '#fd8d3c', '#fc4e2a', '#e31a1c', '#bd0026', '#800026'];
  var RDBU = ['#053061', '#2166ac', '#4393c3', '#92c5de', '#d1e5f0', '#f7f7f7', '#fddbc7', '#f4a582', '#d6604d', '#b2182b', '#67001f']; // blue (lower) to red (higher)

  function hex(c) { return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]; }
  function ramp(stops, t) {
    t = Math.max(0, Math.min(1, t));
    var x = t * (stops.length - 1), i = Math.min(stops.length - 2, Math.floor(x)), f = x - i;
    var a = hex(stops[i]), b = hex(stops[i + 1]);
    return 'rgb(' + [0, 1, 2].map(function (k) { return Math.round(a[k] + (b[k] - a[k]) * f); }).join(',') + ')';
  }
  function quantile(arr, p) {
    var s = arr.slice().sort(function (a, b) { return a - b; });
    return s.length ? s[Math.min(s.length - 1, Math.floor(p * (s.length - 1) + 0.5))] : 0;
  }

  function zoneMap() {
    var D = window.TAXI_DATA, host = $('tx-map');
    if (!D || !host) return;
    var Z = D.zones;

    var rateAll = function (vs) { vs = vs.filter(function (v) { return v != null; }); return [Math.min.apply(null, vs), Math.max.apply(null, vs)]; };
    var janRate = rateAll(Z.map(function (z) { return z.j[1]; }).concat(Z.map(function (z) { return z.j[2]; })));
    var febRate = rateAll(Z.map(function (z) { return z.r[1]; }).concat(Z.map(function (z) { return z.n[1]; })));
    var gapLim = Math.max(0.01, quantile(Z.map(function (z) { return z.j[3]; }).filter(function (v) { return v != null; }).map(Math.abs), 0.95));
    var dA = Z.map(function (z) { return z.r[1] != null && z.n[1] != null ? z.n[1] - z.r[1] : null; });
    var dP = Z.map(function (z) { return z.r[2] != null && z.n[2] != null ? z.n[2] - z.r[2] : null; });
    var diffLim = Math.max(0.01, quantile(dA.concat(dP).filter(function (v) { return v != null; }).map(Math.abs), 0.95));
    Z.forEach(function (z, i) { z.dA = dA[i]; z.dP = dP[i]; });

    var VIEWS = {
      jan_act: { grp: 'jan', name: 'Actual share of generous tips', get: function (z) { return z.j[1]; }, dom: janRate, kind: 'rate', cap: 'Share of generous tips, by pickup zone' },
      jan_pred: { grp: 'jan', name: 'Model-predicted probability', get: function (z) { return z.j[2]; }, dom: janRate, kind: 'rate', cap: 'Average predicted probability of a generous tip' },
      jan_gap: { grp: 'jan', name: 'Model error', get: function (z) { return z.j[3]; }, dom: [-gapLim, gapLim], kind: 'div', cap: 'Predicted minus actual (red: the model over-predicts, blue: under-predicts)' },
      feb_rush: { grp: 'feb', name: 'Weekday 7–10am', get: function (z) { return z.r[1]; }, dom: febRate, kind: 'rate', cap: 'Share of generous tips, weekday mornings' },
      feb_night: { grp: 'feb', name: 'Fri/Sat 10pm–4am', get: function (z) { return z.n[1]; }, dom: febRate, kind: 'rate', cap: 'Share of generous tips, Friday and Saturday nights' },
      feb_diff: { grp: 'feb', name: 'Night minus rush (actual)', get: function (z) { return z.dA; }, dom: [-diffLim, diffLim], kind: 'div', cap: 'Change in generous share, night minus rush (red: night tips more)' },
      feb_diffm: { grp: 'feb', name: 'Night minus rush (model)', get: function (z) { return z.dP; }, dom: [-diffLim, diffLim], kind: 'div', cap: 'Model-predicted change, night minus rush (red: night tips more)' }
    };
    var view = 'jan_act', pinned = null, hover = null;

    // ---- build the svg once
    var vb = D.viewBox.slice();
    var svg = document.createElementNS(SVGNS, 'svg');
    svg.setAttribute('class', 'tx-svg');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'Map of New York City taxi zones, colored by the share of generous tips');
    svg.setAttribute('viewBox', vb.join(' '));
    var g = document.createElementNS(SVGNS, 'g');
    svg.appendChild(g);
    var paths = Z.map(function (z) {
      var p = document.createElementNS(SVGNS, 'path');
      p.setAttribute('d', z.d);
      p.setAttribute('class', 'tx-zone');
      p.dataset.id = z.id;
      g.appendChild(p);
      return p;
    });
    var hi = document.createElementNS(SVGNS, 'path');
    hi.setAttribute('class', 'tx-hi');
    hi.setAttribute('pointer-events', 'none');
    g.appendChild(hi);
    host.appendChild(svg);

    // ---- layer buttons and legend
    var tabs = $('tx-layers');
    tabs.innerHTML =
      '<div class="tx-tabgrp"><span class="tx-tablab">January hold-out <small>468,013 trips the tree never trained on</small></span>' +
      ['jan_act', 'jan_pred', 'jan_gap'].map(btn).join('') + '</div>' +
      '<div class="tx-tabgrp"><span class="tx-tablab">February, a month it never saw <small>weekday rush vs. weekend night</small></span>' +
      ['feb_rush', 'feb_night', 'feb_diff', 'feb_diffm'].map(btn).join('') + '</div>';
    function btn(k) { return '<button type="button" class="tx-tab" data-view="' + k + '" aria-pressed="false">' + VIEWS[k].name + '</button>'; }
    var legend = $('tx-legend');

    function colorOf(v, V) {
      if (v == null) return '#e3e6ec';
      var t = (v - V.dom[0]) / (V.dom[1] - V.dom[0] || 1);
      return V.kind === 'rate' ? ramp(YLORRD, t) : ramp(RDBU, t);
    }
    function render() {
      var V = VIEWS[view];
      Z.forEach(function (z, i) { paths[i].setAttribute('fill', colorOf(V.get(z), V)); });
      Array.prototype.forEach.call(tabs.querySelectorAll('.tx-tab'), function (b) {
        var on = b.dataset.view === view; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on);
      });
      var stops = V.kind === 'rate' ? YLORRD : RDBU;
      var fmt = V.kind === 'rate' ? function (v) { return pct(v, 0); } : function (v) { return signed(v, 1) + ' pts'; };
      var mid = V.kind === 'rate' ? '' : '<span>0</span>';
      legend.innerHTML = '<span class="tx-legcap">' + V.cap + '</span>' +
        '<span class="tx-legscale"><span class="tx-legbar" style="background:linear-gradient(90deg,' + stops.join(',') + ')"></span>' +
        '<span class="tx-legnum"><span>' + fmt(V.dom[0]) + '</span>' + mid + '<span>' + fmt(V.dom[1]) + '</span></span></span>' +
        '<span class="tx-legnote"><i></i> gray: too few trips to show</span>';
      info();
    }
    tabs.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('.tx-tab');
      if (b) { view = b.dataset.view; render(); }
    });

    // ---- the details panel
    var panel = $('tx-info');
    function row(k, v) { return '<div><dt>' + k + '</dt><dd>' + v + '</dd></div>'; }
    function info() {
      var id = hover != null ? hover : pinned;
      var z = id == null ? null : Z[id];
      if (!z) {
        hi.setAttribute('d', '');
        panel.innerHTML = '<p class="tx-hint">Hover over a zone, or tap one, to see its numbers. Click to keep it selected. Use the buttons to zoom, and drag the map to move around.</p>';
        return;
      }
      hi.setAttribute('d', z.d);
      var V = VIEWS[view], h = '<h3>' + esc(z.z) + '</h3><p class="tx-bor">' + esc(z.b) + (pinned === id ? ' · selected' : '') + '</p><dl>';
      if (V.grp === 'jan') {
        if (z.j[1] == null) h += row('Test trips', commas(z.j[0])) + '</dl><p class="tx-hint">Fewer than 50 trips here, so the rates are left out.</p>';
        else h += row('Test trips', commas(z.j[0])) + row('Actual generous share', pct(z.j[1])) + row('Model probability', pct(z.j[2])) +
          row('Predicted − actual', signed(z.j[3]) + ' pts') + row('Average fare', '$' + z.j[4].toFixed(2)) + '</dl>';
      } else {
        h += row('Weekday 7–10am', commas(z.r[0]) + ' trips') + (z.r[1] == null ? '' : row(' actual / model', pct(z.r[1]) + ' / ' + pct(z.r[2]))) +
          row('Fri/Sat 10pm–4am', commas(z.n[0]) + ' trips') + (z.n[1] == null ? '' : row(' actual / model', pct(z.n[1]) + ' / ' + pct(z.n[2])));
        if (z.dA != null) h += row('Night − rush, actual', signed(z.dA) + ' pts') + row('Night − rush, model', signed(z.dP) + ' pts');
        h += '</dl>';
        if (z.dA == null) h += '<p class="tx-hint">Fewer than 40 trips in a slice, so the rates are left out.</p>';
      }
      panel.innerHTML = h;
    }

    // ---- pointer: hover, click to pin, drag to pan
    var drag = null;
    svg.addEventListener('pointerover', function (e) {
      if (drag && drag.moved) return;
      var p = e.target.closest && e.target.closest('.tx-zone');
      if (p && e.pointerType === 'mouse') { hover = indexOf(p); info(); }
    });
    function indexOf(p) { return paths.indexOf(p); }
    svg.addEventListener('pointerleave', function () { if (hover != null) { hover = null; info(); } });
    svg.addEventListener('pointerdown', function (e) {
      drag = { x: e.clientX, y: e.clientY, vb: vb.slice(), moved: false, id: e.pointerId };
    });
    svg.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!drag.moved && Math.hypot(dx, dy) < 5) return;
      if (!drag.moved) { drag.moved = true; svg.classList.add('is-panning'); try { svg.setPointerCapture(drag.id); } catch (x) { /* optional */ } }
      var r = svg.getBoundingClientRect(), k = drag.vb[2] / r.width;
      vb = [drag.vb[0] - dx * k, drag.vb[1] - dy * k, drag.vb[2], drag.vb[3]];
      clampView(); svg.setAttribute('viewBox', vb.join(' '));
    });
    function endDrag(e) {
      if (!drag) return;
      var wasClick = !drag.moved;
      drag = null; svg.classList.remove('is-panning');
      if (wasClick && e.type === 'pointerup') {
        var p = e.target.closest && e.target.closest('.tx-zone');
        var i = p ? indexOf(p) : null;
        pinned = (i == null || i === pinned) ? null : i;
        if (e.pointerType !== 'mouse') hover = null;
        info();
      }
    }
    svg.addEventListener('pointerup', endDrag);
    svg.addEventListener('pointercancel', endDrag);

    // ---- zoom
    function clampView() {
      var w = D.viewBox[2], h = D.viewBox[3];
      vb[2] = Math.min(w, Math.max(w / 24, vb[2])); vb[3] = vb[2] * h / w;
      vb[0] = Math.max(D.viewBox[0] - w * 0.1, Math.min(D.viewBox[0] + w * 1.1 - vb[2], vb[0]));
      vb[1] = Math.max(D.viewBox[1] - h * 0.1, Math.min(D.viewBox[1] + h * 1.1 - vb[3], vb[1]));
    }
    function zoomTo(box, animate) {
      var from = vb.slice(), t0 = null;
      var to = box.slice();
      if (!animate || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { vb = to; clampView(); svg.setAttribute('viewBox', vb.join(' ')); return; }
      (function step(t) {
        if (t0 == null) t0 = t;
        var k = Math.min(1, (t - t0) / 260), e = 1 - Math.pow(1 - k, 3);
        vb = from.map(function (v, i) { return v + (to[i] - v) * e; });
        svg.setAttribute('viewBox', vb.join(' '));
        if (k < 1) requestAnimationFrame(step); else clampView();
      })(performance.now());
    }
    function zoomBy(f) {
      var cx = vb[0] + vb[2] / 2, cy = vb[1] + vb[3] / 2, w = vb[2] / f, h = vb[3] / f;
      zoomTo([cx - w / 2, cy - h / 2, w, h], true);
    }
    // Manhattan's bounding box, from the zone outlines
    var man = Z.filter(function (z) { return z.b === 'Manhattan'; });
    var xs = [], ys = [];
    man.forEach(function (z) {
      (z.d.match(/-?\d+\.?\d* -?\d+\.?\d*/g) || []).forEach(function (s) { var a = s.split(' '); xs.push(+a[0]); ys.push(+a[1]); });
    });
    var mx0 = Math.min.apply(null, xs), mx1 = Math.max.apply(null, xs), my0 = Math.min.apply(null, ys), my1 = Math.max.apply(null, ys);
    var mh = (my1 - my0) * 1.06, mw = mh * D.viewBox[2] / D.viewBox[3];
    var manBox = [(mx0 + mx1) / 2 - mw / 2, my0 - (my1 - my0) * 0.03, mw, mh];
    var coreBox = [-175, -430, 640, 640 * D.viewBox[3] / D.viewBox[2]];
    vb = coreBox.slice(); clampView(); svg.setAttribute('viewBox', vb.join(' '));
    $('tx-zin').addEventListener('click', function () { zoomBy(1.6); });
    $('tx-zout').addEventListener('click', function () { zoomBy(1 / 1.6); });
    $('tx-zman').addEventListener('click', function () { zoomTo(manBox, true); });
    $('tx-zall').addEventListener('click', function () { zoomTo(D.viewBox.slice(), true); });
    $('tx-zcore').addEventListener('click', function () { zoomTo(coreBox.slice(), true); });
    svg.addEventListener('dblclick', function (e) {
      var r = svg.getBoundingClientRect();
      var px = vb[0] + (e.clientX - r.left) / r.width * vb[2], py = vb[1] + (e.clientY - r.top) / r.height * vb[3];
      var w = vb[2] / 1.8, h = vb[3] / 1.8;
      zoomTo([px - w / 2, py - h / 2, w, h], true);
    });

    render();
  }

  function boot() {
    thresholdExplorer();
    charts();
    try { zoneMap(); } catch (e) {
      var h = $('tx-map'); if (h) h.textContent = 'The map could not load.';
      if (window.console) console.error(e);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
