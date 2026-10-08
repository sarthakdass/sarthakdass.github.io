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
     Header: transparent over the dark stage, flat paper bar over the sheet
     ------------------------------------------------------------------ */
  var header = document.querySelector('.site-header');
  var sheet = document.querySelector('.sheet');
  function updateHeader() {
    if (!header || !sheet) return;
    header.classList.toggle('on-light', sheet.getBoundingClientRect().top < header.offsetHeight - 4);
  }
  window.addEventListener('scroll', updateHeader, { passive: true });
  window.addEventListener('resize', updateHeader);
  updateHeader();

  /* ------------------------------------------------------------------
     1 · Headline reveal   +   2 · Scroll reveal
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

  // While a card is still fading in (opacity < 1) the browser flattens its 3D layers, so the
  // tilt's colored sheets would paint on top of the card. Tilt only starts once it has settled.
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

  /* ------------------------------------------------------------------
     3 · Cursor spotlight on the dark stage
     ------------------------------------------------------------------ */
  var stage = document.querySelector('.stage');
  if (stage && !reduce && !coarse) {
    document.addEventListener('pointermove', function (e) {
      var r = stage.getBoundingClientRect();
      var inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      if (inside) {
        stage.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        stage.style.setProperty('--my', (e.clientY - r.top) + 'px');
      }
      stage.classList.toggle('is-lit', inside);
    }, { passive: true });
    document.addEventListener('pointerleave', function () { stage.classList.remove('is-lit'); });
  }

  /* ------------------------------------------------------------------
     4 · Layered tilt on cards
     ------------------------------------------------------------------ */
  if (!reduce && !coarse) {
    Array.prototype.forEach.call(document.querySelectorAll('[data-tilt]'), function (el) {
      function ready() { return !el.hasAttribute('data-reveal') || el.classList.contains('settled'); }
      el.addEventListener('pointermove', function (e) {
        if (!ready()) return;                       // still fading in: leave it flat
        if (!el.classList.contains('is-tilting')) el.classList.add('is-tilting');
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = 'perspective(1100px) rotateY(' + (px * 6).toFixed(2) + 'deg) rotateX(' + (-py * 5).toFixed(2) + 'deg)';
      });
      el.addEventListener('pointerleave', function () {
        el.classList.remove('is-tilting');
        el.style.transform = '';
      });
    });
  }

  /* ------------------------------------------------------------------
     5 · Marquee: continuous by default; optional arrow navigation
     ------------------------------------------------------------------ */
  var marquee = document.querySelector('.marquee');
  if (marquee) initMarquee(marquee);

  function initMarquee(box) {
    var track = box.querySelector('.marquee__track');
    var toggleBtn = document.querySelector('[data-marquee-toggle]');
    var arrowBtn = document.querySelector('[data-marquee-arrows]');
    var arrowsBox = document.querySelector('.marquee-arrows');
    var prevBtn = document.querySelector('[data-marquee-prev]');
    var nextBtn = document.querySelector('[data-marquee-next]');
    if (!track || !toggleBtn || !arrowBtn) return;

    var DURATION = 36;                 // seconds for one loop, matches the CSS animation
    var STEP_MS = 440;
    var mode = 'auto', paused = false, idx = 0, busy = false;
    var n = 0, starts = [], loopW = 0, pad = 0;

    // The track holds three identical copies of the word list, so any word can be
    // brought to the left with filled space on both sides, and wrapping is seamless.
    function measure() {
      var kids = track.children, perCopy = kids.length / 3;
      n = perCopy / 2;
      starts = [];
      for (var i = 0; i < n; i++) starts.push(kids[2 * i].offsetLeft);
      loopW = kids[perCopy].offsetLeft;
      pad = box.clientWidth * 0.1;
    }
    function posMid(i) { return loopW + starts[i] - pad; }     // word i in the middle copy
    function currentOffset() {
      var m = new DOMMatrixReadOnly(getComputedStyle(track).transform);
      return -m.m41;
    }
    function setX(x, animate) {
      track.style.transition = animate ? 'transform ' + STEP_MS + 'ms cubic-bezier(0.7,0,0.2,1)' : 'none';
      track.style.transform = 'translateX(' + (-x) + 'px)';
      if (!animate) void track.offsetWidth;       // flush so the next change can animate
    }
    function labels() {
      var off = mode === 'arrows' || paused;
      toggleBtn.textContent = off ? 'Play marquee' : 'Pause marquee';
      toggleBtn.setAttribute('aria-pressed', String(off));
      arrowBtn.setAttribute('aria-pressed', String(mode === 'arrows'));
      if (arrowsBox) arrowsBox.hidden = mode !== 'arrows';
    }

    function enterArrows() {
      measure();
      var cur = currentOffset() + loopW;           // same picture, shifted into the middle copy
      track.style.animation = 'none';
      box.classList.remove('is-paused');
      paused = false;
      setX(cur, false);
      var best = 0, bestD = Infinity;
      for (var i = 0; i < n; i++) {
        var d = Math.abs(posMid(i) - cur);
        if (d < bestD) { bestD = d; best = i; }
      }
      idx = best;
      mode = 'arrows';
      setX(posMid(idx), true);                     // glide to the nearest word
    }

    function exitArrows() {
      var o = ((posMid(idx) - loopW) % loopW + loopW) % loopW;
      track.style.transition = 'none';
      track.style.transform = '';
      track.style.animation = 'none';
      void track.offsetWidth;
      track.style.animation = '';
      track.style.animationDelay = '-' + (o / loopW * DURATION).toFixed(3) + 's';
      mode = 'auto';
      paused = false;
    }

    function go(delta) {
      if (mode !== 'arrows' || busy) return;
      busy = true;
      var next = idx + delta, wrapTo = null;
      if (next >= n) { next = 0; setX(posMid(n - 1), false); setX(posMid(0) + loopW, true); wrapTo = posMid(0); }
      else if (next < 0) { next = n - 1; setX(posMid(0), false); setX(posMid(n - 1) - loopW, true); wrapTo = posMid(n - 1); }
      else { setX(posMid(next), true); }
      idx = next;
      setTimeout(function () {
        if (wrapTo !== null) setX(wrapTo, false);   // jump back into the middle copy; looks identical
        busy = false;
      }, STEP_MS + 30);
    }

    toggleBtn.addEventListener('click', function () {
      if (mode === 'arrows') exitArrows();
      else { paused = !paused; box.classList.toggle('is-paused', paused); }
      labels();
    });
    arrowBtn.addEventListener('click', function () {
      if (mode === 'arrows') exitArrows(); else enterArrows();
      labels();
    });
    if (prevBtn) prevBtn.addEventListener('click', function () { go(-1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { go(1); });

    document.addEventListener('keydown', function (e) {
      if (mode !== 'arrows') return;
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      var t = e.target;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      e.preventDefault();
      go(e.key === 'ArrowRight' ? 1 : -1);
    });

    var rt = 0;
    window.addEventListener('resize', function () {
      if (mode !== 'arrows') return;
      clearTimeout(rt);
      rt = setTimeout(function () { measure(); setX(posMid(idx), false); }, 120);
    });

    labels();
  }

  /* ------------------------------------------------------------------
     6 · Random-walk paths behind the home headline
     ------------------------------------------------------------------ */
  var homeStage = document.querySelector('.stage[data-paths]');
  if (homeStage) initPaths(homeStage);

  function initPaths(stageEl) {
    var canvas = document.createElement('canvas');
    canvas.className = 'stage__canvas';
    canvas.setAttribute('aria-hidden', 'true');
    stageEl.insertBefore(canvas, stageEl.firstChild);
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var COLORS = ['255,90,54', '143,155,255', '233,236,242'];
    var STRENGTH = [0.75, 0.65, 0.4];
    var TRAIL = 150;
    var N = window.innerWidth < 640 ? 8 : 14;
    var W = 0, H = 0, walkers = [], running = !reduce, onscreen = true, raf = 0, last = 0;

    function gauss() {
      var u = 0, v = 0;
      while (!u) u = Math.random();
      while (!v) v = Math.random();
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    }
    function spawn(i, fresh) {
      var w = {
        x: fresh ? Math.random() * W * 0.8 : -Math.random() * 40,
        y: H * (0.15 + 0.7 * Math.random()),
        vx: 0.9 + Math.random() * 0.9,
        vol: 1.4 + Math.random() * 2.2,
        c: i % 3, pts: [], done: false
      };
      w.pts.push([w.x, w.y]);
      return w;
    }
    function size() {
      var r = stageEl.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function step(w, k) {
      if (w.done) { w.pts.shift(); return; }
      w.x += w.vx * 1.7 * k;
      w.y += gauss() * w.vol * Math.sqrt(k);
      if (w.y < 10) w.y = 20 - w.y; else if (w.y > H - 10) w.y = 2 * (H - 10) - w.y; // reflect at the edges
      w.pts.push([w.x, w.y]);
      if (w.pts.length > TRAIL) w.pts.shift();
      if (w.x > W + 20) w.done = true;            // let the trail drain off-screen, then respawn
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.lineWidth = 1.5; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      for (var c = 0; c < 3; c++) {
        for (var b = 0; b < 5; b++) {           // five age bands: older segments are fainter
          ctx.beginPath();
          for (var i = 0; i < walkers.length; i++) {
            var w = walkers[i];
            if (w.c !== c) continue;
            var n = w.pts.length, s0 = Math.floor(n * b / 5), s1 = Math.min(n, Math.floor(n * (b + 1) / 5) + 1);
            if (s1 - s0 < 2) continue;
            ctx.moveTo(w.pts[s0][0], w.pts[s0][1]);
            for (var j = s0 + 1; j < s1; j++) ctx.lineTo(w.pts[j][0], w.pts[j][1]);
          }
          ctx.strokeStyle = 'rgba(' + COLORS[c] + ',' + (STRENGTH[c] * (b + 1) / 5).toFixed(3) + ')';
          ctx.stroke();
        }
      }
    }
    function frame(t) {
      var k = Math.min(2.5, (t - last) / 16.67 || 1);
      last = t;
      for (var i = 0; i < walkers.length; i++) {
        step(walkers[i], k);
        if (walkers[i].done && walkers[i].pts.length < 2) walkers[i] = spawn(i, false);
      }
      draw();
      if (running && onscreen) raf = requestAnimationFrame(frame);
    }
    function play() { cancelAnimationFrame(raf); last = performance.now(); raf = requestAnimationFrame(frame); }
    function reset() {
      size();
      walkers = [];
      for (var i = 0; i < N; i++) walkers.push(spawn(i, true));
      for (var s = 0; s < 120; s++) for (var j = 0; j < walkers.length; j++) step(walkers[j], 1); // pre-roll so it starts alive
      draw();
    }

    reset();
    if (running) play();

    // control: a small chip next to the contact links
    var holder = stageEl.querySelector('.contact') || stageEl.querySelector('.wrap');
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chip-btn';
    btn.setAttribute('aria-pressed', String(!running));
    btn.textContent = running ? 'Pause random-walk animation' : 'Play random-walk animation';
    btn.addEventListener('click', function () {
      running = !running;
      btn.textContent = running ? 'Pause random-walk animation' : 'Play random-walk animation';
      btn.setAttribute('aria-pressed', String(!running));
      if (running) play(); else cancelAnimationFrame(raf);
    });
    if (holder) holder.appendChild(btn);

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        onscreen = entries[0].isIntersecting;
        if (onscreen && running) play();
      }).observe(stageEl);
    }
    var resizeTimer = 0, lastW = W, lastH = H;
    function onResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        var r = stageEl.getBoundingClientRect();
        if (Math.abs(r.width - lastW) > 1 || Math.abs(r.height - lastH) > 1) {
          reset(); lastW = W; lastH = H;
          if (running) play();
        }
      }, 150);
    }
    if ('ResizeObserver' in window) new ResizeObserver(onResize).observe(stageEl);
    else window.addEventListener('resize', onResize);
  }

  /* ------------------------------------------------------------------
     7 · Stacked-sheet page transition (lilac, vermilion, ink)
     ------------------------------------------------------------------ */
  var pt = document.querySelector('.pt');
  var layers = pt ? Array.prototype.slice.call(pt.querySelectorAll('.pt__layer')) : [];
  var DUR = 520, STAG = 80, EASE = 'cubic-bezier(0.7,0,0.2,1)';
  var canAnimate = layers.length > 0 && typeof layers[0].animate === 'function';

  function cancelLayerAnimations() {
    layers.forEach(function (l) {
      if (l.getAnimations) l.getAnimations().forEach(function (a) { a.cancel(); });
    });
  }

  function reveal(onMid) {
    // arriving: the sheets sweep up and away, ink first, so the colors trail behind
    layers.forEach(function (l, i) {
      l.animate(
        [{ transform: 'translateY(0)' }, { transform: 'translateY(-100%)' }],
        { duration: DUR, delay: (layers.length - 1 - i) * STAG, easing: EASE, fill: 'forwards' }
      );
    });
    setTimeout(onMid, 380);
    setTimeout(function () {
      root.classList.remove('pt-cover');
      cancelLayerAnimations();
      if (pt) pt.style.visibility = '';
    }, DUR + STAG * (layers.length - 1) + 60);
  }

  function leave(url) {
    // leaving: the sheets sweep up from the bottom (lilac, vermilion, then ink on top)
    try { sessionStorage.setItem('sd-pt', '1'); } catch (e) { /* storage blocked: just navigate */ }
    pt.style.visibility = 'visible';
    layers.forEach(function (l, i) {
      l.animate(
        [{ transform: 'translateY(100%)' }, { transform: 'translateY(0)' }],
        { duration: DUR, delay: i * STAG, easing: EASE, fill: 'forwards' }
      );
    });
    setTimeout(function () { window.location.href = url; }, DUR + STAG * (layers.length - 1) + 30);
  }

  var PAGE = /(^|\/)(index|projects|math|hobbies|now|visuals)\.html$|\/projects\/[^/]+\.html$|\/$/;
  document.addEventListener('click', function (e) {
    if (reduce || !canAnimate) return;
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest ? e.target.closest('a[href]') : null;
    if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
    var u;
    try { u = new URL(a.href, window.location.href); } catch (err) { return; }
    if (u.protocol !== window.location.protocol || u.host !== window.location.host) return;
    if (u.pathname === window.location.pathname && u.search === window.location.search) return;
    if (!PAGE.test(u.pathname)) return;           // only the themed pages get the transition
    e.preventDefault();
    leave(u.href);
  });

  // Back/forward cache can restore a page mid-transition: clean up so it isn't left covered.
  window.addEventListener('pageshow', function (e) {
    if (!e.persisted) return;
    root.classList.remove('pt-cover');
    cancelLayerAnimations();
    if (pt) pt.style.visibility = '';
  });

  /* ------------------------------------------------------------------ */
  function init() {
    if (root.classList.contains('pt-cover') && canAnimate) {
      requestAnimationFrame(function () { reveal(start); });
    } else {
      root.classList.remove('pt-cover');
      start();
    }
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
