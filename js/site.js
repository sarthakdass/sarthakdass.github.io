/* Sarthak Dassarma — site behaviour. Plain JS, no dependencies.
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
      Array.prototype.forEach.call(items, function (i) { i.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
    Array.prototype.forEach.call(items, function (i) { io.observe(i); });
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
      el.addEventListener('pointerenter', function () { el.classList.add('is-tilting'); });
      el.addEventListener('pointermove', function (e) {
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
     5 · Marquee pause / play
     ------------------------------------------------------------------ */
  var marquee = document.querySelector('.marquee');
  var marqueeBtn = document.querySelector('[data-marquee-toggle]');
  if (marquee && marqueeBtn) {
    marqueeBtn.addEventListener('click', function () {
      var paused = marquee.classList.toggle('is-paused');
      marqueeBtn.textContent = paused ? 'Play marquee' : 'Pause marquee';
      marqueeBtn.setAttribute('aria-pressed', String(paused));
    });
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
    btn.textContent = running ? 'Pause animation' : 'Play animation';
    btn.addEventListener('click', function () {
      running = !running;
      btn.textContent = running ? 'Pause animation' : 'Play animation';
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
    // arriving: the sheets sweep up and away, ink first, so the colours trail behind
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
