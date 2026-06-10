/* Disro organigram FX — GitHub-served (push to main = live on next page load) — agents marquee (right-to-left) + humans spring stepper (left-to-right) */
(function () {
  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function ready(f) { if (document.readyState !== 'loading') f(); else document.addEventListener('DOMContentLoaded', f); }
  ready(function () {
    var root = document.querySelector('.dorg');
    if (!root || REDUCED) return;
    var cfg = root.dataset || {};
    function num(v, d) { v = parseFloat(v); return isFinite(v) ? v : d; }

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

    /* ---------- metallic reflection sweep on section title ---------- */
    var SHINE_DELAY = num(cfg.dorgShineDelay, 2000); /* ms after section enters view — override: data-dorg-shine-delay */
    var sec = root.closest('.main-section') || root.closest('section');
    var title = sec && sec.querySelector('.h2-headline-center');
    if (title && 'IntersectionObserver' in window) {
      var st = document.createElement('style');
      var SHINE_MS = num(cfg.dorgShineMs, 750); /* sweep duration — override: data-dorg-shine-ms */
      st.textContent = '@media (max-width:767px){.agents-image-mobile{display:none!important}}.dorg-shine{background-image:linear-gradient(100deg,#191919 0%,#191919 40%,#3c4144 44%,#f4f7f8 48%,#7e868b 51%,#ffffff 54%,#26292b 58%,#191919 62%,#191919 100%);background-size:250% 100%;background-position:110% 0;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent;}@keyframes dorgShine{from{background-position:110% 0}to{background-position:-10% 0}}.dorg-shine-run{animation:dorgShine ' + (SHINE_MS/1000) + 's cubic-bezier(.55,0,.25,1) both;}';
      document.head.appendChild(st);
      title.classList.add('dorg-shine');
      var SHINE_REPEAT = num(cfg.dorgShineRepeat, 10000); /* ms between repeats — override: data-dorg-shine-repeat */
      var visible = false, shineTimer = null;
      function fire() { title.classList.add('dorg-shine-run'); }
      title.addEventListener('animationend', function () {
        title.classList.remove('dorg-shine-run');
        clearTimeout(shineTimer);
        if (visible) shineTimer = setTimeout(fire, SHINE_REPEAT);
      });
      new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting && !visible) {
            visible = true;
            shineTimer = setTimeout(fire, SHINE_DELAY);
          } else if (!e.isIntersecting && visible) {
            visible = false;
            clearTimeout(shineTimer);
            title.classList.remove('dorg-shine-run');
          }
        });
      }, { threshold: 0.35 }).observe(sec);
    }
  });
})();
