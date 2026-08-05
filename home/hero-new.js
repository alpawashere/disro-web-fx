/* hero-new.js — Hero (fh-* stack): four stepped rows on one shared clock,
   plus the Agency Brain rim.
     Humans   1 item per step, left-to-right
     Agents   1 item per step, right-to-left
     Tools    3 items per step, left-to-right, centre trio in colour
     Clients  1 item per step, right-to-left
   Every row advances on the same beat and the Brain pulses with it.
   Overrides via data attributes on .fh-wrap:
   data-fh-dwell / data-fh-k / data-fh-c / data-fh-brain-lap */
(function () {
  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function ready(f) { if (document.readyState !== 'loading') f(); else document.addEventListener('DOMContentLoaded', f); }
  ready(function () {
    if (REDUCED) return;
    var root = document.querySelector('.fh-wrap');
    if (!root) return;
    var cfg = root.dataset || {};
    function num(v, d) { v = parseFloat(v); return isFinite(v) ? v : d; }

    var PERIOD = num(cfg.fhDwell, 1800);      /* ms from one step to the next */
    var K = num(cfg.fhK, 230), C = num(cfg.fhC, 29);   /* spring, as organigram.js */

    /* The rows are images — they measure 0 at DOMContentLoaded. Poll until the
       first item has width, then build. Gives up after ~3s. */
    function whenSized(track, f, tries) {
      tries = tries || 0;
      var first = track.children[0];
      if (first && first.getBoundingClientRect().width > 0) return f();
      if (tries > 180) return;
      requestAnimationFrame(function () { whenSized(track, f, tries + 1); });
    }

    function visible(el) {
      var state = { on: true };
      if (!window.IntersectionObserver) return state;
      new IntersectionObserver(function (e) { state.on = e[0].isIntersecting; }, { threshold: 0 }).observe(el);
      return state;
    }

    /* .fh-wrap is scaled down on the tiny breakpoint. getBoundingClientRect
       reports VISUAL px while columnGap and clientWidth report LAYOUT px —
       mixing the two throws off the pitch. Divide measured widths by the
       ambient scale so the module works entirely in layout units. */
    function ambientScale() {
      var w = root.offsetWidth;
      if (!w) return 1;
      var s = root.getBoundingClientRect().width / w;
      return s > 0.01 ? s : 1;
    }

    function setup(name) {
      var wrap = root.querySelector('.fh-mask-' + name);
      var track = wrap && wrap.querySelector('.fh-track-' + name);
      if (!wrap || !track || !track.children.length) return null;
      return {
        wrap: wrap,
        track: track,
        items: [].slice.call(track.children),
        gap: parseFloat(getComputedStyle(track).columnGap) || 0
      };
    }

    function prep(r) {
      r.wrap.style.justifyContent = 'flex-start';
      r.wrap.style.overflow = 'hidden';
      r.track.style.flexShrink = '0';
      r.track.style.willChange = 'transform';
    }

    /* ---------- stepper: advance `by` items, hold, repeat ----------
       dir -1 walks left-to-right, +1 walks right-to-left.
       The spring is near critically damped (zeta ~0.96) so settle time is about
       0.3s whatever the distance — stepping 3 travels faster, not longer, which
       is what keeps Tools locked to the other three rows. */
    function makeStepper(name, opts) {
      var r = setup(name); if (!r) return null;
      var api = {};
      whenSized(r.track, function () {
        var w = r.items[0].getBoundingClientRect().width / ambientScale();
        if (!w) return;
        var n = r.items.length, PITCH = w + r.gap, SETS = 4;
        prep(r);
        for (var s = 1; s < SETS; s++) r.items.forEach(function (c) {
          var clone = c.cloneNode(true);
          clone.setAttribute('aria-hidden', 'true');
          r.track.appendChild(clone);
        });
        var all = [].slice.call(r.track.children);

        function W() { return r.wrap.clientWidth; }
        function targetFor(i) { return W() / 2 - (i * PITCH + w / 2); }

        var idx = Math.floor(SETS / 2) * n + Math.floor(n / 2);
        var x = targetFor(idx), v = 0, running = false;
        r.track.style.transform = 'translate3d(' + x + 'px,0,0)';
        if (opts.onStep) opts.onStep(idx, all);

        api.step = function () {
          idx += opts.dir * opts.by;
          /* recycle a whole set, compensating x so nothing moves on screen */
          while (idx < n) { idx += n; x -= n * PITCH; }
          while (idx >= (SETS - 1) * n) { idx -= n; x += n * PITCH; }
          if (opts.onStep) opts.onStep(idx, all);
          if (running) return;              /* spring will chase the new target */
          running = true;
          var lastT = performance.now();
          (function sloop(now) {
            var dt = Math.min((now - lastT) / 1000, 0.05);
            lastT = now;
            var tg = targetFor(idx);
            var a = K * (tg - x) - C * v;
            v += a * dt; x += v * dt;
            r.track.style.transform = 'translate3d(' + x + 'px,0,0)';
            if (Math.abs(tg - x) < 0.3 && Math.abs(v) < 6) {
              x = tg; v = 0; running = false;
              r.track.style.transform = 'translate3d(' + x + 'px,0,0)';
              return;
            }
            requestAnimationFrame(sloop);
          })(lastT);
        };

        window.addEventListener('resize', function () {
          if (!running) { x = targetFor(idx); r.track.style.transform = 'translate3d(' + x + 'px,0,0)'; }
        });
      });
      return api;
    }

    /* ---------- Tools: only the centre trio keeps its colour ---------- */
    var toolCSS = document.createElement('style');
    toolCSS.textContent =
      '.fh-track-tools > *{filter:grayscale(1);transition:filter .55s ease}' +
      '.fh-track-tools > .fh-tool-live{filter:grayscale(0)}';
    document.head.appendChild(toolCSS);

    function toolsHighlight(idx, all) {
      all.forEach(function (el) { el.classList.remove('fh-tool-live'); });
      for (var k = idx - 1; k <= idx + 1; k++) if (all[k]) all[k].classList.add('fh-tool-live');
    }

    /* ---------- Agency Brain: rotating rim + press ---------- */
    function brainTrace() {
      var card = root.querySelector('.fh-card-brain');
      if (!card) return function () {};
      var NS = 'http://www.w3.org/2000/svg';
      if (getComputedStyle(card).position === 'static') card.style.position = 'relative';
      /* .fh-card clips its children, which would cut the outer glow in half */
      card.style.overflow = 'visible';

      var LAP = num(cfg.fhBrainLap, 6);   /* seconds per full rotation */
      var SW = 6;                         /* stroke width */

      var css = document.createElement('style');
      css.textContent =
        '.fh-card.fh-card-brain{transition:transform .19s cubic-bezier(.4,0,.2,1),box-shadow .19s cubic-bezier(.4,0,.2,1)}' +
        '.fh-card.fh-brain-push{transform:scale(.986);' +
          'box-shadow:2px 2px 7px 0 rgba(214,214,218,.85),-1.5px -1.5px 6px 0 #ffffff}' +
        '.fh-brain-rim{filter:drop-shadow(0 0 5px rgba(255,255,255,.95)) drop-shadow(0 0 12px rgba(255,255,255,.6))}';
      document.head.appendChild(css);

      var svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('aria-hidden', 'true');
      svg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none;';

      var defs = document.createElementNS(NS, 'defs');
      var grad = document.createElementNS(NS, 'linearGradient');
      grad.setAttribute('id', 'fh-brain-grad');
      grad.setAttribute('gradientUnits', 'userSpaceOnUse');
      /* white -> E2E2E2 -> white, so the ramp meets itself and the rotation has
         no seam. objectBoundingBox would skew the spin on a wide box, hence
         userSpaceOnUse with coordinates refreshed in geom(). */
      [['0%', '#ffffff'], ['50%', '#E2E2E2'], ['100%', '#ffffff']].forEach(function (s) {
        var stop = document.createElementNS(NS, 'stop');
        stop.setAttribute('offset', s[0]);
        stop.setAttribute('stop-color', s[1]);
        grad.appendChild(stop);
      });
      defs.appendChild(grad);
      svg.appendChild(defs);

      var rim = document.createElementNS(NS, 'rect');
      rim.setAttribute('fill', 'none');
      rim.setAttribute('stroke', 'url(#fh-brain-grad)');
      rim.setAttribute('stroke-width', SW);
      rim.setAttribute('class', 'fh-brain-rim');
      svg.appendChild(rim);

      var spin = null;
      function geom() {
        var w = card.offsetWidth, h = card.offsetHeight;   /* layout px, ignores transforms */
        if (!w || !h) return;
        var r = parseFloat(getComputedStyle(card).borderTopLeftRadius) || 0;
        var i = SW / 2;
        rim.setAttribute('x', i);
        rim.setAttribute('y', i);
        rim.setAttribute('width', Math.max(0, w - SW));
        rim.setAttribute('height', Math.max(0, h - SW));
        rim.setAttribute('rx', Math.max(0, r - i));

        var cx = w / 2, cy = h / 2, R = Math.sqrt(w * w + h * h) / 2;
        grad.setAttribute('x1', cx - R); grad.setAttribute('y1', cy);
        grad.setAttribute('x2', cx + R); grad.setAttribute('y2', cy);

        if (spin) grad.removeChild(spin);
        spin = document.createElementNS(NS, 'animateTransform');
        spin.setAttribute('attributeName', 'gradientTransform');
        spin.setAttribute('type', 'rotate');
        spin.setAttribute('from', '0 ' + cx + ' ' + cy);
        spin.setAttribute('to', '360 ' + cx + ' ' + cy);
        spin.setAttribute('dur', LAP + 's');
        spin.setAttribute('repeatCount', 'indefinite');
        grad.appendChild(spin);
      }

      card.appendChild(svg);
      geom();
      if (window.ResizeObserver) new ResizeObserver(geom).observe(card);
      else window.addEventListener('resize', geom);

      var t = null;
      return function push() {
        card.classList.add('fh-brain-push');
        clearTimeout(t);
        t = setTimeout(function () { card.classList.remove('fh-brain-push'); }, 170);
      };
    }

    /* ---------- one clock for everything ---------- */
    var rows = [
      makeStepper('humans',  { by: 1, dir: -1 }),
      makeStepper('agents',  { by: 1, dir:  1 }),
      makeStepper('tools',   { by: 3, dir: -1, onStep: toolsHighlight }),
      makeStepper('clients', { by: 1, dir:  1 })
    ];
    var pushBrain = brainTrace();
    var vis = visible(root);

    setInterval(function () {
      if (!vis.on || document.hidden) return;
      rows.forEach(function (s) { if (s && s.step) s.step(); });
      pushBrain();
    }, PERIOD);
  });
})();
