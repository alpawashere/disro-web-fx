/* Disro organigram FX — GitHub-served (push to main = live on next page load) — agents marquee (right-to-left) + humans spring stepper (left-to-right) */
(function () {
  /* Lato for the Slack section mockup (dslk) */
  var l = document.createElement('link');
  l.rel = 'stylesheet';
  l.href = 'https://fonts.googleapis.com/css2?family=Lato:wght@400;500;700;800;900&display=swap';
  document.head.appendChild(l);
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

    /* ---------- dslk: Slack conversation loop (typing bubbles, looping) ---------- */
    var slk1 = document.querySelector('.dslk-chat');
    var slk2 = document.querySelector('.dslk-chat2');
    var slkRoot = document.querySelector('.dslk');
    if (slk1 && slk2 && slkRoot) {
      var scfg = slkRoot.dataset || {};
      var SSTEP = num(scfg.dslkStep, 950);   /* base gap between messages (ms) — data-dslk-step */
      var SHOLD = num(scfg.dslkHold, 4000);  /* hold on finished state before wipe — data-dslk-hold */
      var sst = document.createElement('style');
      sst.textContent =
        '@keyframes dslkPop{0%{transform:scale(0)}70%{transform:scale(1.18)}100%{transform:scale(1)}}' +
        '@keyframes dslkDot{0%,60%,100%{transform:translateY(0);opacity:.4}30%{transform:translateY(-3px);opacity:1}}' +
        '.dslk-typing{position:absolute;left:16px;display:flex;gap:4px;align-items:center;background:#222529;border:0.89px solid #434545;border-radius:8px;padding:6px 9px;opacity:0;transition:opacity .25s ease;z-index:3;pointer-events:none}' +
        '.dslk-typing-on{opacity:1}' +
        '.dslk-tdot{width:5px;height:5px;border-radius:50%;background:#b0b1b4;animation:dslkDot 1.1s infinite}' +
        '.dslk-td2{animation-delay:.15s}.dslk-td3{animation-delay:.3s}';
      document.head.appendChild(sst);

      function slkSetup(card, msgsSel) {
        var msgs = card.querySelector(msgsSel);
        var comp = card.querySelector('.dslk-comp');
        card.style.position = 'relative';
        if (comp) { comp.style.position = 'relative'; comp.style.zIndex = '2'; }
        var typing = document.createElement('div');
        typing.className = 'dslk-typing';
        typing.innerHTML = '<div class="dslk-tdot"></div><div class="dslk-tdot dslk-td2"></div><div class="dslk-tdot dslk-td3"></div>';
        typing.style.bottom = ((comp ? comp.offsetHeight : 60) + 10) + 'px';
        card.appendChild(typing);
        return { msgs: msgs, units: [].slice.call(msgs.children), typing: typing, gap: parseFloat(getComputedStyle(msgs).rowGap) || 12.47, h: [] };
      }
      var SE = slkSetup(slk1, '.dslk-msgs');
      var SI = slkSetup(slk2, '.dslk-msgs2');
      var eFiles = [].slice.call(slk1.querySelectorAll('.dslk-file'));
      var iFile = slk2.querySelector('.dslk-file');
      var pills = [].slice.call(slk2.querySelectorAll('.dslk-react'));
      var reps = slk2.querySelector('.dslk-replies');

      function measure(C) { C.h = C.units.map(function (u) { return u.offsetHeight + C.gap; }); }
      function suffix(C, k) { var d = 0; for (var i = k + 1; i < C.units.length; i++) d += C.h[i]; return d; }
      function resetAll() {
        [SE, SI].forEach(function (C) {
          C.msgs.style.transition = 'none';
          measure(C);
          C.msgs.style.transform = 'translate3d(0,' + suffix(C, -1) + 'px,0)';
          C.units.forEach(function (u) { u.style.transition = 'none'; u.style.opacity = '0'; u.style.transform = 'translateY(10px)'; });
        });
        eFiles.concat([iFile]).forEach(function (f) { f.style.transition = 'none'; f.style.opacity = '0'; f.style.transform = 'scale(.96)'; });
        pills.forEach(function (p) { p.style.opacity = '0'; p.style.animation = 'none'; });
        reps.style.transition = 'none'; reps.style.opacity = '0';
        void slk1.offsetWidth; /* flush so the next transitions animate */
      }
      function reveal(C, k) {
        C.msgs.style.transition = 'transform .55s cubic-bezier(.22,1,.36,1)';
        C.msgs.style.transform = 'translate3d(0,' + suffix(C, k) + 'px,0)';
        var u = C.units[k];
        u.style.transition = 'opacity .35s ease, transform .45s cubic-bezier(.22,1,.36,1)';
        u.style.opacity = '1'; u.style.transform = 'translateY(0)';
      }
      function popEl(f) { f.style.transition = 'opacity .3s ease, transform .35s cubic-bezier(.22,1,.36,1)'; f.style.opacity = '1'; f.style.transform = 'scale(1)'; }
      function popPill(i) { var p = pills[i]; p.style.opacity = '1'; p.style.animation = 'dslkPop .4s cubic-bezier(.22,1,.36,1) both'; }
      function typingOn(C) { C.typing.classList.add('dslk-typing-on'); }
      function typingOff(C) { C.typing.classList.remove('dslk-typing-on'); }

      var slkTimer = null, slkRunning = false;
      function runSteps(steps, i) {
        if (i >= steps.length) return;
        slkTimer = setTimeout(function () { steps[i][1](); runSteps(steps, i + 1); }, steps[i][0]);
      }
      function slkStart() {
        if (slkRunning) return; slkRunning = true;
        resetAll();
        var steps = [
          [500, function () { reveal(SE, 0); }],
          [SSTEP * 0.8, function () { typingOn(SE); }],
          [850, function () { typingOff(SE); reveal(SE, 1); }],
          [380, function () { popEl(eFiles[0]); }],
          [SSTEP, function () { reveal(SE, 2); }],
          [SSTEP * 0.8, function () { typingOn(SE); }],
          [850, function () { typingOff(SE); reveal(SE, 3); }],
          [380, function () { popEl(eFiles[1]); }],
          [800, function () { reveal(SI, 0); }],
          [420, function () { typingOn(SI); }],
          [850, function () { typingOff(SI); reveal(SI, 1); }],
          [380, function () { popEl(iFile); }],
          [340, function () { popPill(0); }],
          [120, function () { popPill(1); }],
          [120, function () { popPill(2); }],
          [120, function () { popPill(3); }],
          [260, function () { popEl(reps); reps.style.transform = ''; }],
          [SSTEP * 1.1, function () { reveal(SI, 2); }],
          [SHOLD, function () {
            slk1.style.transition = slk2.style.transition = 'opacity .35s ease';
            SE.msgs.style.transition = SI.msgs.style.transition = 'opacity .35s ease';
            SE.msgs.style.opacity = SI.msgs.style.opacity = '0';
          }],
          [420, function () {
            resetAll();
            SE.msgs.style.opacity = SI.msgs.style.opacity = '1';
            slkRunning = false; slkStart();
          }]
        ];
        runSteps(steps, 0);
      }
      function slkStop() { clearTimeout(slkTimer); slkRunning = false; }
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (es) {
          es.forEach(function (e) {
            if (e.isIntersecting) {
              if (document.fonts && document.fonts.ready) { document.fonts.ready.then(function () { slkStart(); }); }
              else slkStart();
            } else { slkStop(); }
          });
        }, { threshold: 0.3 }).observe(slkRoot);
      } else { slkStart(); }
    }
  });
})();
