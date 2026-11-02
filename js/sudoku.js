/* Interactive Sudoku player for the Puzzles section.
 *
 * The puzzle (givens, killer cages, whisper lines) is read from <script type="application/json" id="sd-data">.
 * The solution is NOT in the page: only a salted hash of each correct cell is, and answers are compared by hashing.
 *
 * Input: big digit (top layer), corner marks, centre marks, colours (bottom layer); undo / redo; check; timer.
 * Keyboard: 1-9 enter a big digit, hold Shift for corner marks, hold Ctrl (or Cmd) for centre marks,
 * Space cycles the input mode, arrows move (Shift+arrows extend), Backspace / Delete clears, Ctrl+Z / Ctrl+Y undo / redo.
 */
(function () {
  "use strict";

  var COLORS = ["#bfc4cf", "#f4a3a3", "#f6c08b", "#f1e286", "#a8dba0", "#8bd7cf", "#8dc4f1", "#b7a5ef", "#efa7d4"];
  var MODES = ["digit", "corner", "center", "color"];
  var CORNER_SLOTS = [[20, 25], [80, 25], [20, 80], [80, 80], [50, 25], [50, 80], [20, 53], [80, 53]];
  var MSG = { ok: "Puzzle looks good so far!", bad: "Not quite, check your digits!", win: "Well done!" };

  function h53(str) {
    var h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (var i = 0; i < str.length; i++) {
      var ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
  }

  function init() {
    var dataEl = document.getElementById("sd-data");
    var root = document.getElementById("sd");
    if (!dataEl || !root) return;
    var P = JSON.parse(dataEl.textContent);
    var SVGNS = "http://www.w3.org/2000/svg";

    var given = [];
    for (var g = 0; g < 81; g++) given.push(parseInt(P.givens.charAt(g), 10) || 0);
    var labelCells = {};
    P.cages.forEach(function (cg) { labelCells[cg.labelCell] = true; });

    // ---------- state ----------
    var S = blank();
    var hist = [], hi = 0;
    var selected = [];            // ordered list of cell indices
    var mode = "digit";
    var mods = { shift: false, ctrl: false };
    var solved = false;
    var elapsed = 0, lastTick = null, paused = false, started = false;
    var storeKey = "sd-puzzle-" + P.id;

    function blank() { return { d: zeros(), k: zeros(), m: zeros(), c: zeros() }; }
    function zeros() { var a = []; for (var i = 0; i < 81; i++) a.push(0); return a; }
    function snap() { return JSON.stringify(S); }
    function restore(s) { S = JSON.parse(s); }
    function val(i) { return given[i] || S.d[i]; }

    // ---------- DOM ----------
    var board = document.getElementById("sd-board");
    var timerEl = document.getElementById("sd-timer");
    var msgEl = document.getElementById("sd-msg");
    var keysEl = document.getElementById("sd-keys");
    var undoBtn = document.getElementById("sd-undo");
    var redoBtn = document.getElementById("sd-redo");
    var checkBtn = document.getElementById("sd-check");
    var resetBtn = document.getElementById("sd-reset");
    var modeBtns = root.querySelectorAll("[data-mode]");
    var keyBtns = keysEl.querySelectorAll("[data-n]");

    // ---------- static board ----------
    var svg = [];
    svg.push('<rect class="sd-bg" x="-5" y="-5" width="910" height="910"/>');
    svg.push('<g id="sd-colors"></g><g id="sd-same"></g><g id="sd-sel"></g>');
    var thin = "", thick = "";
    for (var n = 1; n < 9; n++) {
      var p = n * 100, line = "M" + p + " 0V900M0 " + p + "H900";
      if (n % 3) thin += line; else thick += line;
    }
    svg.push('<path class="sd-thin" d="' + thin + '"/>');
    svg.push('<g class="sd-cages">');
    P.cages.forEach(function (cg) {
      svg.push('<path d="' + cg.path + '"/>');
    });
    svg.push("</g>");
    svg.push('<g class="sd-cagetext">');
    P.cages.forEach(function (cg) {
      svg.push('<text x="' + cg.lx + '" y="' + cg.ly + '">' + cg.sum + "</text>");
    });
    svg.push("</g>");
    svg.push('<g class="sd-lines">');
    P.lines.forEach(function (ln) { svg.push('<polyline points="' + ln.points + '"/>'); });
    svg.push("</g>");
    svg.push('<path class="sd-thick" d="' + thick + '"/>');
    svg.push('<rect class="sd-frame" x="0" y="0" width="900" height="900"/>');
    svg.push('<g id="sd-text"></g>');
    svg.push('<rect id="sd-hit" x="-5" y="-5" width="910" height="910" fill="transparent"/>');
    board.innerHTML = svg.join("");
    var gColors = document.getElementById("sd-colors");
    var gSel = document.getElementById("sd-sel");
    var gSame = document.getElementById("sd-same");
    var gText = document.getElementById("sd-text");
    var hit = document.getElementById("sd-hit");

    // ---------- rendering ----------
    function bits(mask) {
      var out = [];
      for (var d = 1; d <= 9; d++) if (mask & (1 << d)) out.push(d);
      return out;
    }

    // does another filled-in (big) digit in the same row, column or box equal d?
    function clash(v, i, d) {
      var r = Math.floor(i / 9), c = i % 9, br = r - r % 3, bc = c - c % 3, k, j2;
      for (k = 0; k < 9; k++) {
        j2 = r * 9 + k; if (j2 !== i && v[j2] === d) return true;
        j2 = k * 9 + c; if (j2 !== i && v[j2] === d) return true;
        j2 = (br + Math.floor(k / 3)) * 9 + bc + (k % 3); if (j2 !== i && v[j2] === d) return true;
      }
      return false;
    }
    var doneDigit = [];
    function applyDone() {
      var colorMode = effMode() === "color";
      Array.prototype.forEach.call(keyBtns, function (b) {
        var d = +b.getAttribute("data-n");
        b.classList.toggle("is-done", !colorMode && !!doneDigit[d]);
      });
    }

    // a cell with several colours is cut into equal wedges that meet at its centre
    function ray(a) {
      var r = a * Math.PI / 180, dx = Math.cos(r), dy = Math.sin(r), t = 1e9;
      if (dx > 1e-9) t = Math.min(t, 50 / dx); else if (dx < -1e-9) t = Math.min(t, -50 / dx);
      if (dy > 1e-9) t = Math.min(t, 50 / dy); else if (dy < -1e-9) t = Math.min(t, -50 / dy);
      return [50 + dx * t, 50 + dy * t];
    }
    function cellColors(mask, x, y) {
      var list = bits(mask), n = list.length, out = "";
      if (n === 1) return '<rect x="' + x + '" y="' + y + '" width="100" height="100" fill="' + COLORS[list[0] - 1] + '" fill-opacity="0.78"/>';
      var A0 = 115, span = 360 / n;
      list.forEach(function (d, k) {
        var a = A0 + k * span, b = a + span, pts = [[50, 50], ray(a)], c;
        for (c = 45 + 90 * Math.ceil((a - 45) / 90); c < b - 1e-6; c += 90) if (c > a + 1e-6) pts.push(ray(c));
        pts.push(ray(b));
        out += '<polygon points="' + pts.map(function (p) { return (x + p[0]).toFixed(2) + "," + (y + p[1]).toFixed(2); }).join(" ") + '" fill="' + COLORS[d - 1] + '" fill-opacity="0.78" stroke="' + COLORS[d - 1] + '" stroke-opacity="0.78" stroke-width="0.6"/>';
      });
      return out;
    }

    function render() {
      var colors = "", sel = "", text = "", same = "";
      var i, x, y;
      var v = [], counts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      for (i = 0; i < 81; i++) { v[i] = given[i] || S.d[i] || 0; if (v[i]) counts[v[i]]++; }
      for (i = 1; i <= 9; i++) doneDigit[i] = counts[i] >= 9;
      var picked = {};
      selected.forEach(function (s) { if (v[s]) picked[v[s]] = true; });
      for (i = 0; i < 81; i++) {
        if (v[i] && picked[v[i]]) same += '<rect class="sd-same" x="' + ((i % 9) * 100 + 5) + '" y="' + (Math.floor(i / 9) * 100 + 5) + '" width="90" height="90" rx="8"/>';
      }
      for (i = 0; i < 81; i++) {
        x = (i % 9) * 100; y = Math.floor(i / 9) * 100;
        if (S.c[i]) colors += cellColors(S.c[i], x, y);
      }
      selected.forEach(function (s) {
        sel += '<rect class="sd-selcell" x="' + ((s % 9) * 100 + 3) + '" y="' + (Math.floor(s / 9) * 100 + 3) + '" width="94" height="94" rx="6"/>';
      });
      for (i = 0; i < 81; i++) {
        x = (i % 9) * 100; y = Math.floor(i / 9) * 100;
        var oc = S.c[i] ? " on-c" : "";
        if (given[i]) {
          text += '<text class="sd-given' + oc + '" x="' + (x + 50) + '" y="' + (y + 52) + '">' + given[i] + "</text>";
        } else if (S.d[i]) {
          text += '<text class="sd-digit' + oc + (clash(v, i, S.d[i]) ? " is-bad" : "") + '" x="' + (x + 50) + '" y="' + (y + 52) + '">' + S.d[i] + "</text>";
        } else {
          var ce = bits(S.m[i]), co = bits(S.k[i]);
          if (ce.length) {
            var fs = [0, 32, 32, 32, 30, 26, 23, 21, 19, 17][ce.length];
            text += '<text class="sd-center' + oc + '" style="font-size:' + fs + 'px" x="' + (x + 50) + '" y="' + (y + 52) + '">' + ce.map(function (d) { return clash(v, i, d) ? '<tspan class="is-bad">' + d + "</tspan>" : d; }).join("") + "</text>";
          }
          if (co.length) {
            var slots = labelCells[i] ? CORNER_SLOTS.slice(1).concat([CORNER_SLOTS[0]]) : CORNER_SLOTS;
            co.forEach(function (d, k) {
              var sl = slots[k % slots.length];
              text += '<text class="sd-corner' + oc + (clash(v, i, d) ? " is-bad" : "") + '" x="' + (x + sl[0]) + '" y="' + (y + sl[1]) + '">' + d + "</text>";
            });
          }
        }
      }
      gColors.innerHTML = colors; gSame.innerHTML = same; gSel.innerHTML = sel; gText.innerHTML = text;
      applyDone();
      undoBtn.disabled = solved || hi === 0;
      redoBtn.disabled = solved || hi >= hist.length - 1;
      root.classList.toggle("is-solved", solved);
    }

    function effMode() {
      if (mods.shift) return "corner";
      if (mods.ctrl) return "center";
      return mode;
    }

    function renderMode() {
      var em = effMode();
      Array.prototype.forEach.call(modeBtns, function (b) {
        var on = b.getAttribute("data-mode") === em;
        b.setAttribute("aria-pressed", on ? "true" : "false");
        b.classList.toggle("is-temp", on && em !== mode);
      });
      keysEl.classList.toggle("is-color", em === "color");
      Array.prototype.forEach.call(keyBtns, function (b) {
        var d = +b.getAttribute("data-n");
        if (em === "color") { b.style.background = COLORS[d - 1]; } else { b.style.background = ""; }
      });
      applyDone();
    }

    function setMsg(kind) {
      msgEl.className = "sd__msg" + (kind ? " is-" + kind : "");
      msgEl.textContent = kind ? MSG[kind] : "";
    }

    // ---------- timer ----------
    function fmt(sec) {
      sec = Math.floor(sec);
      var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
      return (h ? h + ":" + (m < 10 ? "0" : "") : "") + m + ":" + (s < 10 ? "0" : "") + s;
    }
    function tick() {
      var now = Date.now();
      if (started && lastTick !== null && !solved && !paused && !document.hidden) elapsed += (now - lastTick) / 1000;
      lastTick = now;
      timerEl.textContent = fmt(elapsed);
    }

    // ---------- persistence ----------
    function save() {
      try {
        localStorage.setItem(storeKey, JSON.stringify({ s: snap(), t: Math.floor(elapsed), solved: solved, st: started, cv: 2 }));
      } catch (e) { /* storage unavailable: the puzzle still works */ }
    }
    function load() {
      try {
        var raw = localStorage.getItem(storeKey);
        if (!raw) return false;
        var o = JSON.parse(raw);
        var st0 = JSON.parse(o.s);
        if (!o.cv) st0.c = st0.c.map(function (v) { return v ? (1 << v) : 0; });   // older saves held one colour number per cell
        restore(JSON.stringify(st0)); elapsed = o.t || 0; solved = !!o.solved; started = !!o.st || elapsed > 0;
        return true;
      } catch (e) { return false; }
    }

    // ---------- logic ----------
    function correct(i) { return h53(P.id + ":" + i + ":" + val(i)) === P.check[i]; }

    // ---------- confetti on a fresh solve: a few vermilion and lilac flakes drifting down over the board ----------
    var confettiRaf = 0, confettiCv = null;
    function stopConfetti() {
      if (confettiRaf) cancelAnimationFrame(confettiRaf);
      confettiRaf = 0;
      if (confettiCv && confettiCv.parentNode) confettiCv.parentNode.removeChild(confettiCv);
      confettiCv = null;
    }
    function confetti() {
      if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      stopConfetti();
      var host = board.parentNode, r = host.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
      var cv = document.createElement("canvas");
      cv.className = "sd__confetti"; cv.setAttribute("aria-hidden", "true");
      cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr);
      host.appendChild(cv); confettiCv = cv;
      var ctx = cv.getContext("2d"), W = r.width, H = r.height, cols = ["#ff5a36", "#8f9bff"], flakes = [], i;
      for (i = 0; i < 70; i++) {
        flakes.push({
          x: Math.random() * W, y: -10 - Math.random() * H * 0.4,
          w: 5 + Math.random() * 5, h: 3 + Math.random() * 3,
          vy: 130 + Math.random() * 110, sway: 10 + Math.random() * 22, ph: Math.random() * 6.28, fr: 1.2 + Math.random() * 1.6,
          rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 6, c: cols[i % 2]
        });
      }
      var t0 = performance.now(), last = t0, DUR = 4200;
      function frame(now) {
        var dt = Math.min(0.05, (now - last) / 1000); last = now;
        var el = now - t0, fade = el > DUR - 900 ? Math.max(0, (DUR - el) / 900) : 1;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
        flakes.forEach(function (f) {
          f.y += f.vy * dt; f.rot += f.vr * dt; f.ph += f.fr * dt;
          var x = f.x + Math.sin(f.ph) * f.sway;
          ctx.save(); ctx.translate(x, f.y); ctx.rotate(f.rot);
          ctx.globalAlpha = 0.9 * fade; ctx.fillStyle = f.c; ctx.fillRect(-f.w / 2, -f.h / 2, f.w, f.h);
          ctx.restore();
        });
        if (el < DUR) confettiRaf = requestAnimationFrame(frame); else stopConfetti();
      }
      confettiRaf = requestAnimationFrame(frame);
    }

    // ---------- little easter egg: a big 3 in a corner of the grid fires a short burst of confetti toward the middle ----------
    function scheduleBurst(cell) {
      setTimeout(function () { if (S.d[cell] === 3) burst(cell); }, 1000);
    }
    function burst(cell) {
      if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      var host = board.parentNode, r = host.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
      var cv = document.createElement("canvas");
      cv.className = "sd__confetti"; cv.setAttribute("aria-hidden", "true");
      cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr);
      host.appendChild(cv);
      var ctx = cv.getContext("2d"), W = r.width, H = r.height, k = W / 910;
      var ox = (((cell % 9) * 100 + 50) + 5) * k, oy = ((Math.floor(cell / 9) * 100 + 50) + 5) * k;
      var ang = Math.atan2(H / 2 - oy, W / 2 - ox), cols = ["#ff5a36", "#8f9bff"], ps = [], i;
      for (i = 0; i < 44; i++) {
        var a = ang + (Math.random() - 0.5) * 0.9, sp = (W * 0.5) + Math.random() * W * 0.75;
        ps.push({ x: ox, y: oy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, w: 4 + Math.random() * 5, h: 3 + Math.random() * 3,
          rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 12, c: cols[i % 2] });
      }
      var t0 = performance.now(), last = t0, DUR = 1500;
      function frame(now) {
        var dt = Math.min(0.05, (now - last) / 1000); last = now;
        var el = now - t0, fade = el > DUR - 450 ? Math.max(0, (DUR - el) / 450) : 1, drag = Math.pow(0.04, dt);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
        ps.forEach(function (p) {
          p.vx *= drag; p.vy = p.vy * drag + 120 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
          ctx.globalAlpha = 0.92 * fade; ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        });
        if (el < DUR) requestAnimationFrame(frame); else if (cv.parentNode) cv.parentNode.removeChild(cv);
      }
      requestAnimationFrame(frame);
    }

    function startTimer() { if (!started && !solved) { started = true; lastTick = Date.now(); } }

    function afterChange(pushHistory) {
      startTimer();
      if (pushHistory) {
        var s = snap();
        if (s !== hist[hi]) {
          hist = hist.slice(0, hi + 1); hist.push(s); hi = hist.length - 1;
          if (hist.length > 600) { hist.shift(); hi--; }
        }
      }
      var full = true, ok = true;
      for (var i = 0; i < 81; i++) {
        if (!val(i)) { full = false; break; }
      }
      if (full) {
        for (var j = 0; j < 81; j++) if (!correct(j)) { ok = false; break; }
        if (ok) { solved = true; setMsg("win"); if (paused) setPaused(false); confetti(); } else { setMsg("bad"); }
      } else {
        setMsg(null);
      }
      save(); render(); renderMode();
    }

    function targets(forMarks) {
      return selected.filter(function (i) {
        if (given[i]) return false;
        return forMarks ? !S.d[i] : true;
      });
    }

    function enter(d) {
      if (solved) return;
      var em = effMode(), t, all;
      if (em === "color") {
        if (!selected.length) return;
        var bit = 1 << d;
        all = selected.every(function (i) { return S.c[i] & bit; });
        selected.forEach(function (i) { S.c[i] = all ? (S.c[i] & ~bit) : (S.c[i] | bit); });
      } else if (em === "digit") {
        t = targets(false); if (!t.length) return;
        all = t.every(function (i) { return S.d[i] === d; });
        t.forEach(function (i) { S.d[i] = all ? 0 : d; });
        if (d === 3 && !all) t.forEach(function (i) { if (i === 0 || i === 8 || i === 72 || i === 80) scheduleBurst(i); });
      } else {
        t = targets(true); if (!t.length) return;
        var arr = em === "corner" ? S.k : S.m, bit = 1 << d;
        all = t.every(function (i) { return arr[i] & bit; });
        t.forEach(function (i) { arr[i] = all ? (arr[i] & ~bit) : (arr[i] | bit); });
      }
      afterChange(true);
    }

    function clear() {
      if (solved || !selected.length) return;
      var t = targets(false);
      if (effMode() === "color") {
        selected.forEach(function (i) { S.c[i] = 0; });
      } else if (t.some(function (i) { return S.d[i]; })) {
        t.forEach(function (i) { S.d[i] = 0; });
      } else if (t.some(function (i) { return S.k[i] || S.m[i]; })) {
        t.forEach(function (i) { S.k[i] = 0; S.m[i] = 0; });
      } else {
        selected.forEach(function (i) { S.c[i] = 0; });
      }
      afterChange(true);
    }

    function undo() { if (solved || hi === 0) return; hi--; restore(hist[hi]); afterChange(false); }
    function redo() { if (solved || hi >= hist.length - 1) return; hi++; restore(hist[hi]); afterChange(false); }

    function check() {
      if (solved) { setMsg("win"); return; }
      for (var i = 0; i < 81; i++) {
        if (!given[i] && S.d[i] && !correct(i)) { setMsg("bad"); return; }
      }
      setMsg("ok");
    }

    var resetTimer = null;
    function resetClick() {
      if (resetBtn.getAttribute("data-armed") !== "1") {
        resetBtn.setAttribute("data-armed", "1");
        resetBtn.textContent = "Click again to reset";
        resetTimer = setTimeout(disarm, 3000);
        return;
      }
      disarm();
      if (paused) setPaused(false);
      stopConfetti();
      S = blank(); hist = [snap()]; hi = 0; selected = []; solved = false; elapsed = 0; started = false; lastTick = Date.now();
      setMsg(null); save(); render(); renderMode(); tick();
    }
    function disarm() {
      clearTimeout(resetTimer);
      resetBtn.removeAttribute("data-armed");
      resetBtn.textContent = "Reset";
    }

    // ---------- selection ----------
    function cellAt(e) {
      var r = board.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width * 910 - 5;
      var y = (e.clientY - r.top) / r.height * 910 - 5;
      var c = Math.floor(x / 100), rr = Math.floor(y / 100);
      if (c < 0 || c > 8 || rr < 0 || rr > 8) return -1;
      return rr * 9 + c;
    }
    var dragging = false;
    hit.addEventListener("pointerdown", function (e) {
      var i = cellAt(e); if (i < 0) return;
      e.preventDefault();
      startTimer();
      dragging = true;
      try { hit.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      if (e.ctrlKey || e.metaKey || e.shiftKey) {
        var at = selected.indexOf(i);
        if (at >= 0) selected.splice(at, 1); else selected.push(i);
      } else {
        selected = [i];
      }
      render();
    });
    hit.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var i = cellAt(e);
      if (i >= 0 && selected.indexOf(i) < 0) { selected.push(i); render(); }
    });
    function endDrag() { dragging = false; }
    hit.addEventListener("pointerup", endDrag);
    hit.addEventListener("pointercancel", endDrag);

    function move(dr, dc, extend) {
      var cur = selected.length ? selected[selected.length - 1] : 40;
      var r = Math.max(0, Math.min(8, Math.floor(cur / 9) + dr));
      var c = Math.max(0, Math.min(8, (cur % 9) + dc));
      var i = r * 9 + c;
      if (extend) { if (selected.indexOf(i) < 0) selected.push(i); } else selected = [i];
      render();
    }

    // ---------- buttons ----------
    function noFocus(el) { el.addEventListener("mousedown", function (e) { e.preventDefault(); }); }
    Array.prototype.forEach.call(keyBtns, function (b) {
      noFocus(b);
      b.addEventListener("click", function () { enter(+b.getAttribute("data-n")); });
    });
    Array.prototype.forEach.call(modeBtns, function (b) {
      noFocus(b);
      b.addEventListener("click", function () { mode = b.getAttribute("data-mode"); renderMode(); });
    });
    var delBtn = document.getElementById("sd-del");
    noFocus(delBtn); delBtn.addEventListener("click", clear);
    noFocus(undoBtn); undoBtn.addEventListener("click", undo);
    noFocus(redoBtn); redoBtn.addEventListener("click", redo);
    noFocus(checkBtn); checkBtn.addEventListener("click", check);
    resetBtn.addEventListener("click", resetClick);
    var pauseBtn = document.getElementById("sd-pause"), root = document.getElementById("sd");
    function setPaused(v) {
      if (solved) v = false;
      paused = v; lastTick = Date.now();
      root.classList.toggle("is-paused", paused);
      pauseBtn.setAttribute("aria-pressed", paused ? "true" : "false");
      pauseBtn.querySelector("span").textContent = paused ? "Resume" : "Pause";
      var ov = document.getElementById("sd-paused"); if (ov) ov.hidden = !paused;
      if (paused) selected = [];
      render();
    }
    pauseBtn.addEventListener("click", function () { setPaused(!paused); });

    // fullscreen: the real Fullscreen API where there is one, otherwise a page-filling overlay (Esc or the button leaves either)
    var fsBtn = document.getElementById("sd-fs");
    function syncFs() {
      var on = document.fullscreenElement === root || root.classList.contains("is-fs-fallback");
      root.classList.toggle("is-fs", on);
      if (fsBtn) {
        fsBtn.setAttribute("aria-pressed", on ? "true" : "false");
        fsBtn.setAttribute("aria-label", on ? "Exit fullscreen" : "Fullscreen");
        fsBtn.title = on ? "Exit fullscreen (Esc)" : "Fullscreen";
      }
    }
    function setFs(on) {
      if (on) {
        if (root.requestFullscreen) {
          var pr = root.requestFullscreen();
          if (pr && pr.catch) pr.catch(function () { root.classList.add("is-fs-fallback"); syncFs(); });
        } else { root.classList.add("is-fs-fallback"); }
      } else {
        if (document.fullscreenElement) { try { document.exitFullscreen(); } catch (err) { /* ignore */ } }
        root.classList.remove("is-fs-fallback");
      }
      syncFs();
    }
    if (fsBtn) fsBtn.addEventListener("click", function () { setFs(!root.classList.contains("is-fs")); });
    document.addEventListener("fullscreenchange", syncFs);
    var resumeBtn = document.getElementById("sd-resume");
    if (resumeBtn) resumeBtn.addEventListener("click", function () { setPaused(false); });
    resetBtn.addEventListener("blur", disarm);

    // ---------- keyboard ----------
    function digitOf(e) {
      var m = /^(?:Digit|Numpad)([1-9])$/.exec(e.code || "");
      return m ? +m[1] : 0;
    }
    function syncMods(e) {
      var s = !!e.shiftKey, c = !!(e.ctrlKey || e.metaKey);
      if (s !== mods.shift || c !== mods.ctrl) { mods.shift = s; mods.ctrl = c; renderMode(); }
    }
    document.addEventListener("keydown", function (e) {
      if (paused) { if (e.key === " " && e.target === document.body) e.preventDefault(); return; }
      syncMods(e);
      var tag = (e.target && e.target.tagName) || "";
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      var d = digitOf(e);
      if (d) { e.preventDefault(); enter(d); return; }
      var k = e.key;
      if ((e.ctrlKey || e.metaKey) && (k === "z" || k === "Z")) { e.preventDefault(); if (e.shiftKey) redo(); else undo(); return; }
      if ((e.ctrlKey || e.metaKey) && (k === "y" || k === "Y")) { e.preventDefault(); redo(); return; }
      if (k === "Backspace" || k === "Delete") { e.preventDefault(); clear(); return; }
      if (k === "ArrowUp") { e.preventDefault(); move(-1, 0, e.shiftKey); return; }
      if (k === "ArrowDown") { e.preventDefault(); move(1, 0, e.shiftKey); return; }
      if (k === "ArrowLeft") { e.preventDefault(); move(0, -1, e.shiftKey); return; }
      if (k === "ArrowRight") { e.preventDefault(); move(0, 1, e.shiftKey); return; }
      if (k === "Escape") { if (root.classList.contains("is-fs-fallback")) { setFs(false); return; } selected = []; render(); return; }
      if (k === " " && tag !== "BUTTON") {
        e.preventDefault();
        mode = MODES[(MODES.indexOf(mode) + 1) % MODES.length]; renderMode();
      }
    });
    document.addEventListener("keyup", syncMods);
    window.addEventListener("blur", function () { mods.shift = false; mods.ctrl = false; renderMode(); });
    document.addEventListener("visibilitychange", function () { lastTick = Date.now(); save(); });
    window.addEventListener("pagehide", save);

    // ---------- start ----------
    var restored = load();
    hist = [snap()]; hi = 0;
    if (restored && solved) setMsg("win");
    lastTick = Date.now();
    render(); renderMode(); tick();
    setInterval(function () { tick(); }, 500);
    setInterval(function () { if (!solved) save(); }, 5000);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
