/* Organigram — agents marquee (right-to-left) + humans spring stepper (left-to-right) */
(function () {
  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function ready(f) { if (document.readyState !== 'loading') f(); else document.addEventListener('DOMContentLoaded', f); }
  ready(function () {
    if (REDUCED) return;
    var root = document.querySelector('.dorg');
    var cfg = (root && root.dataset) || {};
    function num(v, d) { v = parseFloat(v); return isFinite(v) ? v : d; }
    if (!root) return;
    /* ---------- agents marquee ---------- */
    var SPEED = num(cfg.dorgSpeed, 120); /* px/s right-to-left — override: data-dorg-speed on .dorg */
    var wrap = root.querySelector('.dorg-cards');
    var fade = wrap && wrap.querySelector('.dorg-fade');
    var cards = wrap ? [].slice.call(wrap.querySelectorAll('.dorg-card')) : [];
    var mgap = wrap ? parseFloat(getComputedStyle(wrap).columnGap) || 20 : 20;
    var cardW = cards.length ? cards[0].getBoundingClientRect().width : 0;
    if (cards.length && cardW) {
      var track = document.createElement('div');
      track.style.cssText = 'display:flex;gap:' + mgap + 'px;align-items:center;flex-shrink:0;will-change:transform;';
      cards.forEach(function (c) { track.appendChild(c); });
      wrap.insertBefore(track, fade || null);
      wrap.style.justifyContent = 'flex-start';
      var PITCH = cardW + mgap, setW = cards.length * PITCH;
      var sets = Math.ceil((wrap.clientWidth + 2 * setW) / setW);
      for (var s = 1; s < sets; s++) cards.forEach(function (c) { track.appendChild(c.cloneNode(true)); });
      var mx = -setW / 2, mlast = performance.now();
      (function mloop(now) {
        now = now || performance.now();
        var dt = Math.min((now - mlast) / 1000, 0.05);
        mlast = now;
        mx -= SPEED * dt;
        if (mx <= -setW) mx += setW;
        track.style.transform = 'translate3d(' + mx + 'px,0,0)';
        requestAnimationFrame(mloop);
      })(mlast);
    }

    /* ---------- humans spring stepper ---------- */
    var DWELL = num(cfg.dorgDwell, 1500); /* ms pause — override: data-dorg-dwell */
    var K = num(cfg.dorgK, 230), C = num(cfg.dorgC, 29); /* spring — override: data-dorg-k / data-dorg-c */
    var rwrap = root.querySelector('.dorg-roles');
    var roles = rwrap ? [].slice.call(rwrap.querySelectorAll('.dorg-role')) : [];
    var rgap = rwrap ? parseFloat(getComputedStyle(rwrap).columnGap) || 20 : 20;
    var roleW = roles.length ? roles[0].getBoundingClientRect().width : 0;
    if (roles.length && roleW) {
      var rt = document.createElement('div');
      rt.style.cssText = 'display:flex;gap:' + rgap + 'px;align-items:flex-end;flex-shrink:0;will-change:transform;';
      roles.forEach(function (r) { rt.appendChild(r); });
      rwrap.appendChild(rt);
      rwrap.style.justifyContent = 'flex-start';
      var n = roles.length, RP = roleW + rgap, SETS = 4;
      for (var s2 = 1; s2 < SETS; s2++) roles.forEach(function (r) { rt.appendChild(r.cloneNode(true)); });
      function W() { return rwrap.clientWidth; }
      var idx = Math.floor(SETS / 2) * n + Math.floor(n / 2); /* item under the center line */
      function targetFor(i) { return W() / 2 - (i * RP + roleW / 2); }
      var rx = targetFor(idx), rv = 0, anim = false;
      rt.style.transform = 'translate3d(' + rx + 'px,0,0)';
      function step() {
        idx--;
        if (idx < n) { idx += n; rx -= n * RP; } /* recycle a set — same rendered position */
        anim = true;
        var tg = targetFor(idx), lastT = performance.now();
        (function sloop(now) {
          var dt = Math.min((now - lastT) / 1000, 0.05);
          lastT = now;
          var a = K * (tg - rx) - C * rv;
          rv += a * dt; rx += rv * dt;
          rt.style.transform = 'translate3d(' + rx + 'px,0,0)';
          if (Math.abs(tg - rx) < 0.3 && Math.abs(rv) < 6) {
            rx = tg; rv = 0; anim = false;
            rt.style.transform = 'translate3d(' + rx + 'px,0,0)';
            setTimeout(step, DWELL);
            return;
          }
          requestAnimationFrame(sloop);
        })(lastT);
      }
      setTimeout(step, DWELL);
      window.addEventListener('resize', function () {
        if (!anim) { rx = targetFor(idx); rt.style.transform = 'translate3d(' + rx + 'px,0,0)'; }
      });
    }
  });
})();
