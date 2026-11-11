/* Sarthak Dassarma — site behavior. Plain JS, no dependencies.
   Every effect degrades gracefully: with JavaScript off, or with
   "reduce motion" on, the page is simply static and fully readable. */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var coarse = !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
  window.__sd = 1; // tells the inline <head> safety net that this file loaded

  /* ------------------------------------------------------------------
     Headline reveal   +   Scroll reveal
     ------------------------------------------------------------------ */
  var started = false;
  function start() {
    if (started) return;
    started = true;

    Array.prototype.forEach.call(document.querySelectorAll('.reveal'), function (t) {
      t.classList.add('is-in');
    });

    var items = document.querySelectorAll('[data-reveal]');
    if (reduce || !('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(items, function (i) { i.classList.add('in', 'settled'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); settle(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
    Array.prototype.forEach.call(items, function (i) { io.observe(i); });
  }

  function settle(el) {
    var done = false;
    function finish() {
      if (done) return;
      done = true;
      el.classList.add('settled');
    }
    el.addEventListener('transitionend', function onEnd(ev) {
      if (ev.target === el && ev.propertyName === 'opacity') { el.removeEventListener('transitionend', onEnd); finish(); }
    });
    setTimeout(finish, 1100);
  }

  /* ------------------------------------------------------------------ */
  function init() {
    start();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();


/* Brand mark: hovering (or tapping) the SD monogram spins the S twice around the stem of the D.
 * The S is drawn as a thin slab (a stack of slices) and every point is projected with perspective, so the near edge
 * grows, the far edge shrinks, the sides show as it turns edge-on, and it casts a soft shadow on the D. */
(function () {
  var brand = document.querySelector('.brand'), sg = brand && brand.querySelector('.brand__s');
  var sh = brand && brand.querySelector('.brand__shade path');
  if (!sg || !sh) return;
  var NS = 'http://www.w3.org/2000/svg';
  var flat = sg.querySelector('path'), D = flat.getAttribute('d');
  var toks = D.match(/[MCLZ]|-?\d*\.?\d+/g);
  var AX = 110.9, CY = 118.5;          // the D's stem, and the S's vertical middle
  var DIST = 62, HALF = 1.9, LAYERS = 7, TURNS = 1, MS = 1300;
  var slab = document.createElementNS(NS, 'g');
  slab.setAttribute('class', 'brand__slab');
  sg.appendChild(slab);
  var paths = [];
  for (var k = 0; k < LAYERS; k++) { var p = document.createElementNS(NS, 'path'); p.setAttribute('fill-rule', 'evenodd'); slab.appendChild(p); paths.push(p); }
  slab.style.display = 'none';
  var raf = 0;

  function project(w, sin, cos, dx, dy) {
    var out = [], nums = [], i = 0, n = toks.length;
    while (i < n) {
      var t = toks[i];
      if (/[MCLZ]/.test(t)) { out.push(t); i++; continue; }
      var x = +toks[i] - AX, y = +toks[i + 1] - CY; i += 2;
      var X = x * cos + w * sin, Z = -x * sin + w * cos, s = DIST / (DIST - Z);
      out.push((AX + X * s + dx).toFixed(2) + ' ' + (CY + y * s + dy).toFixed(2));
    }
    return out.join(' ').replace(/([MCLZ]) /g, '$1');
  }
  function rgb() {
    var m = getComputedStyle(brand).color.match(/[\d.]+/g) || [233, 236, 243];
    return [+m[0], +m[1], +m[2]];
  }
  function mix(c, f) { return 'rgb(' + c.map(function (v) { return Math.round(v * f + 8 * (1 - f)); }).join(',') + ')'; }

  function frame(th) {
    var sin = Math.sin(th), cos = Math.cos(th), as = Math.abs(sin), c = rgb();
    var order = [];
    for (var k = 0; k < LAYERS; k++) order.push({ k: k, w: HALF * (1 - 2 * k / (LAYERS - 1)) });
    order.sort(function (a, b) { return a.w * cos - b.w * cos; });          // farthest slice first
    // lighting from the front: the face turned toward the viewer is lit by how squarely it faces us
    var face = 0.52 + 0.48 * Math.abs(cos);
    for (var q = 0; q < LAYERS; q++) {
      var o = order[q], isTop = q === LAYERS - 1;
      paths[q].setAttribute('d', project(o.w, sin, cos, 0, 0));
      paths[q].setAttribute('fill', mix(c, isTop ? face : 0.34 + 0.26 * q / LAYERS));
    }
    // shadow thrown on the D: strongest when the S is turned edge-on and nearest the stem
    sh.setAttribute('d', project(0, sin, cos, 1.2 + 3.0 * as, 0.9 + 1.4 * as));
    sh.parentNode.style.opacity = (0.8 * Math.pow(as, 0.7)).toFixed(3);
  }
  function ease(t) { return 0.5 - 0.5 * Math.cos(Math.PI * t); }
  function spin() {
    if (raf || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
    flat.style.display = 'none'; slab.style.display = '';
    var t0 = null;
    (function step(now) {
      if (t0 == null) t0 = now;
      var t = Math.min(1, (now - t0) / MS);
      frame(TURNS * 2 * Math.PI * ease(t));
      if (t < 1) raf = requestAnimationFrame(step);
      else { raf = 0; slab.style.display = 'none'; flat.style.display = ''; sh.parentNode.style.opacity = 0; }
    })(performance.now());
  }
  brand.addEventListener('pointerenter', spin);
  brand.addEventListener('focus', spin);
})();

/* ------------------------------------------------------------------
   Optional dark mode: a sun / moon button at the end of the top row.
   Light is the default; the choice is remembered on this device.
   ------------------------------------------------------------------ */
(function () {
  var nav = document.querySelector('.site-header .nav');
  if (!nav) return;
  var root = document.documentElement;
  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'theme-toggle';
  btn.innerHTML =
    '<svg class="ic-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.4 14.6A8.6 8.6 0 0 1 9.4 3.6a8.6 8.6 0 1 0 11 11z"/></svg>' +
    '<svg class="ic-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/></svg>';
  function isDark() { return root.getAttribute('data-theme') === 'dark'; }
  function sync() {
    var d = isDark();
    btn.setAttribute('aria-label', d ? 'Switch to light mode' : 'Switch to dark mode');
    btn.title = d ? 'Switch to light mode' : 'Switch to dark mode';
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', d ? '#161b25' : '#eceff4');
  }
  btn.addEventListener('click', function () {
    function flip() {
      if (isDark()) root.removeAttribute('data-theme'); else root.setAttribute('data-theme', 'dark');
      try { localStorage.setItem('sd-theme', isDark() ? 'dark' : 'light'); } catch (e) { /* private mode */ }
      sync();
    }
    var calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (document.startViewTransition && !calm) {
      document.startViewTransition(flip);
    } else if (calm) {
      flip();
    } else {
      root.classList.add('theme-fade');
      flip();
      setTimeout(function () { root.classList.remove('theme-fade'); }, 500);
    }
  });
  nav.appendChild(btn);
  sync();
})();

