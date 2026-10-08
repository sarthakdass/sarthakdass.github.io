/* Makes every Gerrymandle board playable: drag across tiles to draw districts.
 *
 * It reads each board's puzzle layer (tile polygons, house polygons, the chips that say how many
 * houses a district holds and how many districts there are) and draws on top of it, so the board
 * data never has to change.
 *
 * Rules the page already states, which the game follows:
 *   - a district is a connected group of tiles holding exactly N houses
 *   - open tiles (dashed) hold no house; a district may take any number of them
 *   - the majority party takes a district; an even split leaves it dead (gray)
 */
(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var PARTY = {
    '#a855f7': 'purple', '#22c55e': 'green', '#f59e0b': 'amber',
    '#38bdf8': 'blue', '#fb7185': 'rose', '#6366f1': 'indigo'
  };
  var TIE = '#cbd5e1';           // dead / tied districts
  var HEX_RADIUS = 26;           // tile circumradius in board units
  var ALPHA = { partial: 0.34, done: 0.8, tiePartial: 0.26, tieDone: 0.62 };

  function el(name, attrs) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }
  function pts(poly) {
    return poly.getAttribute('points').trim().split(/\s+/).map(function (p) {
      var xy = p.split(',');
      return [parseFloat(xy[0]), parseFloat(xy[1])];
    });
  }
  function center(v) {
    var x = 0, y = 0;
    v.forEach(function (p) { x += p[0]; y += p[1]; });
    return [x / v.length, y / v.length];
  }
  function dist(a, b) { return Math.hypot(a[0] - b[0], a[1] - b[1]); }
  function key(p) { return Math.round(p[0]) + ',' + Math.round(p[1]); }

  function init(section) {
    var chips = section.querySelector('.chips');
    var layer = section.querySelector('.layer[data-view="puzzle"]');
    var svg = layer && layer.querySelector('svg');
    if (!chips || !svg) return;
    var text = chips.textContent;
    var N = parseInt((text.match(/(\d+)\s+houses per district/) || [])[1], 10);
    var D = parseInt((text.match(/(\d+)\s+districts/) || [])[1], 10);
    if (!N || !D) return;

    /* ---- read the board ---- */
    var tiles = [];
    var polys = svg.querySelectorAll('polygon');
    var firstHouse = null;
    Array.prototype.forEach.call(polys, function (p) {
      if (p.getAttribute('stroke') === '#0a0e18') {
        var v = pts(p);
        tiles.push({ v: v, c: center(v), party: null, nb: [], edgeNb: [] });
      } else if (!p.getAttribute('stroke-dasharray') && !firstHouse) {
        firstHouse = p;
      }
    });
    if (!tiles.length) return;
    Array.prototype.forEach.call(polys, function (p) {
      var f = p.getAttribute('fill');
      if (!PARTY[f]) return;
      var c = center(pts(p)), best = -1, bd = 1e9;
      tiles.forEach(function (t, i) { var d = dist(t.c, c); if (d < bd) { bd = d; best = i; } });
      if (bd < 3) tiles[best].party = f;
    });
    tiles.forEach(function (t, i) {
      tiles.forEach(function (u, j) {
        if (i !== j && dist(t.c, u.c) < HEX_RADIUS * 1.8) t.nb.push(j);
      });
      // which neighbor lies across each of the six edges (-1 at the edge of the board)
      for (var e = 0; e < 6; e++) {
        var a = t.v[e], b = t.v[(e + 1) % 6];
        var far = [a[0] + b[0] - t.c[0], a[1] + b[1] - t.c[1]], hit = -1;
        for (var k = 0; k < t.nb.length; k++) {
          if (dist(tiles[t.nb[k]].c, far) < 3) { hit = t.nb[k]; break; }
        }
        t.edgeNb.push(hit);
      }
    });

    /* ---- drawing layers ---- */
    var defs = el('defs', {});
    var gFill = el('g', { 'class': 'play-fill', 'pointer-events': 'none' });
    var gLine = el('g', { 'class': 'play-line', 'pointer-events': 'none' });
    svg.insertBefore(defs, svg.firstChild);
    if (firstHouse) svg.insertBefore(gFill, firstHouse); else svg.appendChild(gFill);
    svg.appendChild(gLine);
    svg.classList.add('map--play');
    var uid = section.id + '-d';

    /* ---- state ---- */
    var assign = tiles.map(function () { return -1; });
    var districts = {};            // id -> array of tile indices
    var nextId = 1;

    function houses(id) {
      var tally = {}, total = 0;
      districts[id].forEach(function (i) {
        var p = tiles[i].party;
        if (p) { tally[p] = (tally[p] || 0) + 1; total++; }
      });
      return { tally: tally, total: total };
    }
    function verdict(id) {                    // leading party's color, or null for a tie / no houses
      var h = houses(id), best = 0, lead = null, tied = false;
      for (var p in h.tally) {
        if (h.tally[p] > best) { best = h.tally[p]; lead = p; tied = false; }
        else if (h.tally[p] === best) tied = true;
      }
      return { lead: tied ? null : lead, total: h.total };
    }
    function count() { return Object.keys(districts).length; }

    function adjacentDistricts(t) {
      var seen = {}, out = [];
      tiles[t].nb.forEach(function (j) {
        var d = assign[j];
        if (d >= 0 && !seen[d]) { seen[d] = 1; out.push(d); }
      });
      return out;
    }
    function isFull(id) { return houses(id).total >= N; }

    function put(t, id) {
      assign[t] = id;
      (districts[id] = districts[id] || []).push(t);
    }

    /* Add tile t: join a semi-finished district next to it, else start its own.
       `prefer` (the district a drag is building) wins when it can still take the tile. */
    function addTile(t, prefer) {
      var isHouse = !!tiles[t].party;
      var near = adjacentDistricts(t);
      var open = near.filter(function (d) { return !isFull(d); });
      var id = null;
      if (prefer != null && districts[prefer] && near.indexOf(prefer) >= 0 && (!isHouse || !isFull(prefer))) id = prefer;
      else if (open.length) id = open[0];
      else if (!isHouse && near.length) id = near[0];       // open ground may extend a finished district
      if (id == null) {
        if (count() >= D) { note('All ' + D + ' districts are in use. Take a tile out first, or add to one that is still open.'); return null; }
        id = nextId++;
      }
      put(t, id);
      return id;
    }

    function removeTile(t) {
      var id = assign[t];
      if (id < 0) return;
      assign[t] = -1;
      var rest = districts[id].filter(function (i) { return i !== t; });
      delete districts[id];
      // a removal can cut a district in two: every connected piece becomes its own district
      var seen = {};
      rest.forEach(function (s) {
        if (seen[s]) return;
        var comp = [], stack = [s]; seen[s] = 1;
        while (stack.length) {
          var u = stack.pop(); comp.push(u);
          tiles[u].nb.forEach(function (w) {
            if (!seen[w] && rest.indexOf(w) >= 0) { seen[w] = 1; stack.push(w); }
          });
        }
        var nid = districts[id] ? nextId++ : id;
        districts[nid] = comp;
        comp.forEach(function (i) { assign[i] = nid; });
      });
    }

    /* ---- rendering ---- */
    function outline(list) {
      var inSet = {}; list.forEach(function (i) { inSet[i] = 1; });
      var edges = {};                         // start vertex -> [end vertices]
      list.forEach(function (i) {
        var t = tiles[i];
        for (var e = 0; e < 6; e++) {
          var nb = t.edgeNb[e];
          if (nb >= 0 && inSet[nb]) continue;
          var a = t.v[e], b = t.v[(e + 1) % 6];
          (edges[key(a)] = edges[key(a)] || []).push({ a: a, b: b });
        }
      });
      var d = '';
      for (var k in edges) {
        while (edges[k] && edges[k].length) {
          var e0 = edges[k].pop(), cur = e0;
          d += 'M' + cur.a[0] + ' ' + cur.a[1];
          for (var guard = 0; guard < 400; guard++) {
            d += 'L' + cur.b[0] + ' ' + cur.b[1];
            var nk = key(cur.b), nxt = edges[nk] && edges[nk].pop();
            if (!nxt) break;
            cur = nxt;
          }
          d += 'Z';
        }
      }
      return d;
    }

    function render() {
      gFill.textContent = ''; gLine.textContent = ''; defs.textContent = '';
      var done = 0, working = 0, wins = {}, dead = 0;
      Object.keys(districts).forEach(function (id) {
        var list = districts[id], v = verdict(id), full = v.total >= N;
        var color = v.lead || TIE;
        var alpha = full ? (v.lead ? ALPHA.done : ALPHA.tieDone) : (v.lead ? ALPHA.partial : ALPHA.tiePartial);
        if (full) { done++; if (v.lead) wins[v.lead] = (wins[v.lead] || 0) + 1; else dead++; } else working++;
        var clip = el('clipPath', { id: uid + id });
        list.forEach(function (i) {
          var pe = el('polygon', { points: tiles[i].v.map(function (p) { return p.join(','); }).join(' ') });
          clip.appendChild(pe);
          gFill.appendChild(el('polygon', {
            points: pe.getAttribute('points'), fill: color, 'fill-opacity': alpha
          }));
        });
        defs.appendChild(clip);
        var attrs = {
          d: outline(list), fill: 'none', stroke: color, 'stroke-width': 7,
          'stroke-linejoin': 'round', 'clip-path': 'url(#' + uid + id + ')'
        };
        if (!full) { attrs['stroke-dasharray'] = '7 6'; attrs['stroke-linecap'] = 'butt'; }
        gLine.appendChild(el('path', attrs));
      });
      status(done, working, wins, dead);
    }

    /* ---- status line under the board ---- */
    var bar = document.createElement('div');
    bar.className = 'playbar';
    var msg = document.createElement('p');
    msg.className = 'playbar__msg';
    msg.setAttribute('aria-live', 'polite');
    var clear = document.createElement('button');
    clear.type = 'button'; clear.className = 'playbar__clear'; clear.textContent = 'Clear districts';
    bar.appendChild(msg); bar.appendChild(clear);
    var board = section.querySelector('.board');
    board.parentNode.insertBefore(bar, board.nextSibling);
    var hint = document.createElement('p');
    hint.className = 'playhint';
    hint.textContent = 'Drag across tiles to draw a district, or click a tile to add or remove it. Dashed outlines are districts still open; solid ones hold exactly ' + N + ' houses.';
    board.parentNode.insertBefore(hint, board);

    var flash = '';
    function note(s) { flash = s; msg.textContent = s; }
    function status(done, working, wins, dead) {
      if (flash) { msg.textContent = flash; flash = ''; return; }
      var s = done + ' of ' + D + ' districts complete' + (working ? ' · ' + working + ' in progress' : '');
      if (done === D && !working) {
        var bits = [], top = 0, topParty = null, tie = false;
        for (var c in wins) {
          bits.push(PARTY[c] + ' ' + wins[c]);
          if (wins[c] > top) { top = wins[c]; topParty = c; tie = false; } else if (wins[c] === top) tie = true;
        }
        if (dead) bits.push('dead ' + dead);
        s = bits.join(' · ') + ' — ';
        s += (!tie && topParty === '#a855f7') ? 'purple wins. Solved!' :
             (tie || !topParty) ? 'no outright winner. Try again.' : PARTY[topParty] + ' wins, not purple. Try again.';
        msg.classList.toggle('is-win', !tie && topParty === '#a855f7');
      } else msg.classList.remove('is-win');
      msg.textContent = s;
    }
    clear.addEventListener('click', function () {
      assign = tiles.map(function () { return -1; }); districts = {}; nextId = 1; render();
    });

    /* ---- pointer input ---- */
    function tileAt(ev) {
      var m = svg.getScreenCTM();
      if (!m) return -1;
      var p = svg.createSVGPoint(); p.x = ev.clientX; p.y = ev.clientY;
      p = p.matrixTransform(m.inverse());
      var best = -1, bd = 1e9;
      tiles.forEach(function (t, i) { var d = dist(t.c, [p.x, p.y]); if (d < bd) { bd = d; best = i; } });
      return bd <= HEX_RADIUS * 0.95 ? best : -1;
    }
    var drag = null;
    svg.style.touchAction = 'none';
    svg.addEventListener('pointerdown', function (ev) {
      if (ev.button > 0) return;
      var t = tileAt(ev);
      if (t < 0) return;
      ev.preventDefault();
      try { svg.setPointerCapture(ev.pointerId); } catch (e) { /* not essential */ }
      if (assign[t] >= 0) { drag = { mode: 'erase', last: t }; removeTile(t); }
      else { drag = { mode: 'add', last: t, cur: addTile(t, null) }; }
      render();
    });
    svg.addEventListener('pointermove', function (ev) {
      if (!drag) return;
      var t = tileAt(ev);
      if (t < 0 || t === drag.last) return;
      drag.last = t;
      if (drag.mode === 'erase') { if (assign[t] >= 0) removeTile(t); }
      else if (assign[t] < 0) {
        var id = addTile(t, drag.cur);
        if (id != null) drag.cur = id;
      }
      render();
    });
    function end(ev) { drag = null; try { svg.releasePointerCapture(ev.pointerId); } catch (e) { /* ignore */ } }
    svg.addEventListener('pointerup', end);
    svg.addEventListener('pointercancel', end);

    render();
  }

  /* spoilers: click (or Enter / Space) to reveal an answer */
  function reveal(e) {
    var t = e.target.closest && e.target.closest('.spoiler');
    if (!t || t.classList.contains('is-open')) return;
    if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    t.classList.add('is-open'); t.removeAttribute('role'); t.removeAttribute('tabindex'); t.removeAttribute('aria-label');
  }
  document.addEventListener('click', reveal);
  document.addEventListener('keydown', reveal);

  function boot() {
    Array.prototype.forEach.call(document.querySelectorAll('section.puzzle'), init);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
