/* Slack section conversation loop — sequential messages, typing bubbles, infinite replay */
(function () {
  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function ready(f) { if (document.readyState !== 'loading') f(); else document.addEventListener('DOMContentLoaded', f); }
  ready(function () {
    if (REDUCED) return;
    var root = document.querySelector('.dorg');
    var cfg = (root && root.dataset) || {};
    function num(v, d) { v = parseFloat(v); return isFinite(v) ? v : d; }
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
