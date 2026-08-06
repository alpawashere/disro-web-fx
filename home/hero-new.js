/* hero-new.js — Alternative Home-WIP hero: four continuous marquee rows,
   plus the Agency Brain rim.
     Humans   left-to-right
     Agents   right-to-left
     Tools    left-to-right, gaining their original colour at centre
     Clients  right-to-left
   Overrides on .fh-wrap: data-fh-speed / data-fh-<row>-speed /
   data-fh-color-radius / data-fh-brain-lap */
(function () {
  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function ready(f) { if (document.readyState !== 'loading') f(); else document.addEventListener('DOMContentLoaded', f); }
  ready(function () {
    if (REDUCED) return;
    var root = document.querySelector('.fh-wrap');
    if (!root) return;
    if (root.getAttribute('data-fh-continuous-ready') === 'true') return;
    root.setAttribute('data-fh-continuous-ready', 'true');
    var cfg = root.dataset || {};
    function num(v, d) { v = parseFloat(v); return isFinite(v) ? v : d; }
    var SPEED = Math.max(1, num(cfg.fhSpeed, 42));

    /* The rows are images — they measure 0 at DOMContentLoaded. Poll until the
       first item has width, then build. Gives up after ~3s. */
    function whenSized(track, f, tries) {
      tries = tries || 0;
      var first = track.children[0];
      if (first && first.getBoundingClientRect().width > 0) return f();
      if (tries > 180) return;
      requestAnimationFrame(function () { whenSized(track, f, tries + 1); });
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

    /* Duplicate whole sets and translate by exactly one set length. Resetting
       the phase is invisible because the repeated pixels are identical. All
       coordinates stay in layout pixels so the small-screen scale remains safe. */
    function makeMarquee(name, direction, colorTools) {
      var r = setup(name); if (!r) return null;
      var api = { ready: false, phase: 0 };
      whenSized(r.track, function () {
        var w = r.items[0].getBoundingClientRect().width / ambientScale();
        if (!w) return;
        var n = r.items.length, pitch = w + r.gap, loop = n * pitch;
        var sets = Math.max(5, Math.ceil(r.wrap.clientWidth / loop) + 4);
        if (sets % 2 === 0) sets += 1;
        prep(r);
        for (var s = 1; s < sets; s++) r.items.forEach(function (c) {
          var clone = c.cloneNode(true);
          clone.setAttribute('aria-hidden', 'true');
          r.track.appendChild(clone);
        });
        var all = [].slice.call(r.track.children);
        var middleItem = Math.floor(sets / 2) * n + Math.floor(n / 2);
        var base = 0;
        function measure() {
          w = r.items[0].getBoundingClientRect().width / ambientScale();
          r.gap = parseFloat(getComputedStyle(r.track).columnGap) || 0;
          pitch = w + r.gap;
          loop = n * pitch;
          base = r.wrap.clientWidth / 2 - (middleItem * pitch + w / 2);
        }
        measure();

        api.speed = Math.max(1, num(cfg['fh' + name.charAt(0).toUpperCase() + name.slice(1) + 'Speed'], SPEED));
        api.render = function () {
          var x = base + direction * api.phase;
          r.track.style.transform = 'translate3d(' + x.toFixed(3) + 'px,0,0)';
          if (!colorTools) return;
          var centre = r.wrap.clientWidth / 2;
          var radius = Math.max(1, num(cfg.fhColorRadius, pitch * 1.25));
          all.forEach(function (el, i) {
            var distance = Math.abs(x + i * pitch + w / 2 - centre);
            var t = Math.max(0, Math.min(1, 1 - distance / radius));
            var colour = t * t * (3 - 2 * t); /* smoothstep in and back out */
            el.style.filter = 'grayscale(' + (1 - colour).toFixed(3) + ')';
          });
        };
        api.advance = function (dt) {
          api.phase = (api.phase + api.speed * dt) % loop;
          api.render();
        };
        window.addEventListener('resize', function () { measure(); api.render(); });
        api.ready = true;
        api.render();
      });
      return api;
    }

    /* Tools keep their white tiles and black artwork away from centre. */
    var toolCSS = document.createElement('style');
    toolCSS.textContent = '.fh-track-tools > *{filter:grayscale(1);will-change:filter}';
    document.head.appendChild(toolCSS);

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
        /* Asymmetric timing is what makes it read as soft: the press settles in
           quickly, the release eases back out almost twice as slowly. */
        '.fh-card.fh-card-brain{transition:box-shadow .44s cubic-bezier(.22,.61,.36,1)}' +
        /* Pressed = concave. The light sits top-left (that is where .fh-card puts
           its white highlight), so hollowing the plate means a dark inset from
           the top-left and a light inset from the bottom-right — the exact
           inverse of the raised state. The outer shadows stay, much reduced, so
           the plate still sits above the wrap instead of going flat.
           No scale here on purpose: a button pressing into a surface does not
           get smaller, and that was what read as fake. */
        '.fh-card.fh-brain-push{transition-duration:.24s;box-shadow:' +
          'inset 6px 6px 14px 0 rgba(168,168,178,.55),' +
          'inset -5px -5px 12px 0 rgba(255,255,255,.85),' +
          '2px 2px 7px 0 rgba(214,214,218,.35),' +
          '-1.5px -1.5px 6px 0 rgba(255,255,255,.9)}' +
        '.fh-brain-rim{transition:filter .44s cubic-bezier(.22,.61,.36,1),opacity .44s cubic-bezier(.22,.61,.36,1);' +
          'filter:drop-shadow(0 0 5px rgba(255,255,255,.95)) drop-shadow(0 0 12px rgba(255,255,255,.6))}' +
        /* the rim sinks with the plate: glow collapses, edge sits back */
        '.fh-brain-push .fh-brain-rim{transition-duration:.24s;opacity:.88;' +
          'filter:drop-shadow(0 0 2px rgba(255,255,255,.45))}';
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
        t = setTimeout(function () { card.classList.remove('fh-brain-push'); }, 240);
      };
    }

    /* ---------- one time-based clock for every row ---------- */
    var rows = [
      makeMarquee('humans',   1, false),
      makeMarquee('agents',  -1, false),
      makeMarquee('tools',    1, true),
      makeMarquee('clients', -1, false)
    ];
    var pushBrain = brainTrace();
    var onScreen = true, last = performance.now(), lastPush = last;
    if (window.IntersectionObserver) {
      new IntersectionObserver(function (e) { onScreen = e[0].isIntersecting; }).observe(root);
    }
    (function tick(now) {
      var dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (onScreen && !document.hidden) {
        rows.forEach(function (row) { if (row && row.ready) row.advance(dt); });
        if (now - lastPush >= 1800) { pushBrain(); lastPush = now; }
      }
      requestAnimationFrame(tick);
    })(last);
  });
})();
