/* hero-new.js — Hero (fh-* stack). four strips + the Agency Brain trace.
     Humans   spring stepper, 1 item per step, left-to-right
     Agents   constant marquee, right-to-left
     Tools    spring stepper, 3 items per step, left-to-right
     Clients  constant marquee, right-to-left
     Brain    stroke segment travelling the card perimeter
   Spring constants and px/s pacing match organigram.js so both sections read as
   one system. Overrides via data attributes on .fh-wrap:
   data-fh-speed / data-fh-dwell / data-fh-k / data-fh-c */
(function () {
  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function ready(f) { if (document.readyState !== 'loading') f(); else document.addEventListener('DOMContentLoaded', f); }
  ready(function () {
    if (REDUCED) return;
    var root = document.querySelector('.fh-wrap');
    if (!root) return;
    var cfg = root.dataset || {};
    function num(v, d) { v = parseFloat(v); return isFinite(v) ? v : d; }

    var SPEED = num(cfg.fhSpeed, 120);        /* px/s, matches .dorg-cards */
    var DWELL = num(cfg.fhDwell, 1500);       /* ms hold, matches .dorg-roles */
    var K = num(cfg.fhK, 230), C = num(cfg.fhC, 29);

    /* The rows are images — they measure 0 at DOMContentLoaded. Poll until the
       first item has width, then build. Gives up after ~3s. */
    function whenSized(track, f, tries) {
      tries = tries || 0;
      var first = track.children[0];
      if (first && first.getBoundingClientRect().width > 0) return f();
      if (tries > 180) return;
      requestAnimationFrame(function () { whenSized(track, f, tries + 1); });
    }

    /* Four loops in one hero is a lot — idle them once it scrolls away. */
    function visible(el) {
      var state = { on: true };
      if (!window.IntersectionObserver) return state;
      new IntersectionObserver(function (e) { state.on = e[0].isIntersecting; }, { threshold: 0 }).observe(el);
      return state;
    }

    /* .fh-wrap is scaled down on the tiny breakpoint. getBoundingClientRect
       reports VISUAL px, while columnGap and clientWidth report LAYOUT px —
       mixing the two throws off the pitch. Divide every measured width by the
       ambient scale so the whole module works in layout units. */
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
      /* belt and braces: a row whose mask is not clipping would spill the clones
         across the page. Does not fix a card sized with width:auto — that has to
         be an explicit width in the Designer. */
      r.wrap.style.overflow = 'hidden';
      r.track.style.flexShrink = '0';
      r.track.style.willChange = 'transform';
    }

    /* ---------- constant marquee ---------- */
    /* speed > 0 runs right-to-left, speed < 0 runs left-to-right */
    function marquee(name, speed) {
      var r = setup(name); if (!r) return;
      whenSized(r.track, function () {
        var w = r.items[0].getBoundingClientRect().width / ambientScale();
        if (!w) return;
        var PITCH = w + r.gap, setW = r.items.length * PITCH;
        prep(r);
        var sets = Math.ceil((r.wrap.clientWidth + 2 * setW) / setW);
        for (var s = 1; s < sets; s++) r.items.forEach(function (c) { r.track.appendChild(c.cloneNode(true)); });
        var vis = visible(r.wrap), x = -setW / 2, last = performance.now();
        (function loop(now) {
          now = now || performance.now();
          var dt = Math.min((now - last) / 1000, 0.05);
          last = now;
          if (vis.on) {
            x -= speed * dt;
            if (x <= -setW) x += setW;
            if (x >= 0) x -= setW;
            r.track.style.transform = 'translate3d(' + x + 'px,0,0)';
          }
          requestAnimationFrame(loop);
        })(last);
      });
    }

    /* ---------- spring stepper: advance `by` items, hold, repeat ---------- */
    /* The spring is near critically damped (zeta ~0.96), so settle time is about
       0.3s whatever the distance — stepping 3 just travels faster, it does not
       take longer. That keeps Tools and Humans on the same rhythm. */
    function stepper(name, by, dwell) {
      by = by || 1; dwell = dwell || DWELL;
      var r = setup(name); if (!r) return;
      whenSized(r.track, function () {
        var w = r.items[0].getBoundingClientRect().width / ambientScale();
        if (!w) return;
        var n = r.items.length, PITCH = w + r.gap;
        var SETS = Math.max(4, Math.ceil(by / n) + 3);
        prep(r);
        for (var s = 1; s < SETS; s++) r.items.forEach(function (c) { r.track.appendChild(c.cloneNode(true)); });

        function W() { return r.wrap.clientWidth; }
        function targetFor(i) { return W() / 2 - (i * PITCH + w / 2); }

        var idx = Math.floor(SETS / 2) * n + Math.floor(n / 2);
        var x = targetFor(idx), v = 0, anim = false;
        r.track.style.transform = 'translate3d(' + x + 'px,0,0)';

        function step() {
          idx -= by;
          while (idx < n) { idx += n; x -= n * PITCH; }   /* recycle, same rendered position */
          anim = true;
          var tg = targetFor(idx), lastT = performance.now();
          (function sloop(now) {
            var dt = Math.min((now - lastT) / 1000, 0.05);
            lastT = now;
            var a = K * (tg - x) - C * v;
            v += a * dt; x += v * dt;
            r.track.style.transform = 'translate3d(' + x + 'px,0,0)';
            if (Math.abs(tg - x) < 0.3 && Math.abs(v) < 6) {
              x = tg; v = 0; anim = false;
              r.track.style.transform = 'translate3d(' + x + 'px,0,0)';
              setTimeout(step, dwell);
              return;
            }
            requestAnimationFrame(sloop);
          })(lastT);
        }

        setTimeout(step, dwell);
        window.addEventListener('resize', function () {
          if (!anim) { x = targetFor(idx); r.track.style.transform = 'translate3d(' + x + 'px,0,0)'; }
        });
      });
    }

    /* ---------- Agency Brain: stroke travelling the perimeter ---------- */
    /* pathLength="100" normalises the dash maths, so the segment stays the same
       proportion of the perimeter at every breakpoint — no resize recalculation
       beyond the rect geometry itself. */
    function brainTrace() {
      var card = root.querySelector('.fh-card-brain');
      if (!card) return;
      var NS = 'http://www.w3.org/2000/svg';
      if (getComputedStyle(card).position === 'static') card.style.position = 'relative';

      var LAP = num(cfg.fhBrainLap, 4.6);   /* seconds per lap */
      var N = 12;                           /* segments in the tail */
      var SEG = 2.4;                        /* length of each, in % of perimeter */
      var LAG = 0.85;                       /* spacing between them, same units */

      /* A stroke gradient in SVG is fixed in space, not along the path — it would
         recolour the segment depending on which side of the rectangle it happens
         to be on. So the ramp is built out of stacked segments instead: same
         speed, each one a step further behind, fading out as it goes. That reads
         as a comet and works identically on every edge and corner. */
      var HEAD = [24, 24, 27], TAIL = [161, 161, 170];   /* zinc 950 -> zinc 400 */
      function tone(t) {
        var c = HEAD.map(function (h, i) { return Math.round(h + (TAIL[i] - h) * t); });
        var a = 0.5 * Math.pow(1 - t, 1.7);
        return 'rgba(' + c.join(',') + ',' + a.toFixed(3) + ')';
      }

      var frames = '';
      for (var i = 0; i < N; i++) {
        var o = i * LAG;
        frames += '@keyframes fh-brain-' + i + '{from{stroke-dashoffset:' + o.toFixed(2) +
                  '}to{stroke-dashoffset:' + (o - 100).toFixed(2) + '}}';
      }
      var css = document.createElement('style');
      css.textContent = frames +
        '.fh-brain-seg{animation-duration:' + LAP + 's;animation-timing-function:linear;animation-iteration-count:infinite}' +
        '.fh-brain-seg-0{filter:drop-shadow(0 0 4px rgba(24,24,27,0.28))}';
      document.head.appendChild(css);

      var svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('aria-hidden', 'true');
      svg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none;';

      var rects = [];
      function rect(stroke, dash, width, cls) {
        var el = document.createElementNS(NS, 'rect');
        el.setAttribute('fill', 'none');
        el.setAttribute('stroke', stroke);
        el.setAttribute('stroke-width', width);
        el.setAttribute('stroke-linecap', 'round');
        el.setAttribute('pathLength', '100');
        if (dash) el.setAttribute('stroke-dasharray', dash);
        if (cls) el.setAttribute('class', cls);
        svg.appendChild(el);
        rects.push(el);
        return el;
      }

      rect('rgba(40,40,40,0.09)', null, 2);   /* the rail the head runs on */

      /* tail first so the head paints on top */
      for (var j = N - 1; j >= 0; j--) {
        var t = j / (N - 1);
        var el = rect(tone(t), SEG.toFixed(2) + ' ' + (100 - SEG).toFixed(2),
                      (2.1 - 0.5 * t).toFixed(2),
                      'fh-brain-seg fh-brain-seg-' + j);
        el.style.animationName = 'fh-brain-' + j;
      }

      function geom() {
        /* offsetWidth/Height, not getBoundingClientRect: the rect returns the
           VISUAL size, so any transform:scale on a parent (the hero is scaled
           down on mobile) would shrink the numbers while the SVG viewport stays
           at layout size — the trace ends up small and pinned top-left. */
        var w = card.offsetWidth, h = card.offsetHeight;
        var r = parseFloat(getComputedStyle(card).borderTopLeftRadius) || 0;
        rects.forEach(function (el) {
          el.setAttribute('x', 1);
          el.setAttribute('y', 1);
          el.setAttribute('width', Math.max(0, w - 2));
          el.setAttribute('height', Math.max(0, h - 2));
          el.setAttribute('rx', Math.max(0, r - 1));
        });
      }

      card.appendChild(svg);
      geom();
      if (window.ResizeObserver) new ResizeObserver(geom).observe(card);
      else window.addEventListener('resize', geom);
    }

    stepper('humans', 1);
    marquee('agents', SPEED);
    stepper('tools', 3);
    marquee('clients', SPEED * 0.75);
    brainTrace();
  });
})();
