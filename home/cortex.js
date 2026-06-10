/* Ask Cortex — cursor picks a model (Sonnet 4.6 → menu → More models → Opus 4.8), then the conversation plays. Loops. */
(function () {
  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function ready(f) { if (document.readyState !== 'loading') f(); else document.addEventListener('DOMContentLoaded', f); }
  ready(function () {
    if (REDUCED) return;
    var root = document.querySelector('.dcx');
    var chat = document.querySelector('.dcx-chat');
    if (!root || !chat) return;
    var cfg = root.dataset || {};
    function num(v, d) { v = parseFloat(v); return isFinite(v) ? v : d; }
    var HOLD = num(cfg.dcxHold, 8000);   /* hold on finished state — data-dcx-hold */
    var PACE = num(cfg.dcxPace, 1);      /* multiplier on all step delays — data-dcx-pace */

    var menu = chat.querySelector('.dcx-menu');
    var models = chat.querySelector('.dcx-models');
    var trigger = chat.querySelector('.dcx-model');
    var triggerT = chat.querySelector('.dcx-model-t');
    var prow = chat.querySelector('.dcx-prow');
    var resp = chat.querySelector('.dcx-resp');
    var file = chat.querySelector('.dcx-file');
    var moreRow = menu ? menu.querySelectorAll('.dcx-mi')[2] : null;
    var opus = null;
    if (models) [].slice.call(models.querySelectorAll('.dcx-mitem')).forEach(function (it) {
      if (it.textContent.trim() === 'Opus 4.8') opus = it;
    });
    if (!menu || !models || !trigger || !prow || !resp || !moreRow || !opus) return;

    /* fake cursor */
    var cur = document.createElement('div');
    cur.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24"><path d="M5.5 3l13 8.4-5.7 1 3.3 6.6-2.5 1.2-3.3-6.6-4.3 4z" fill="#000" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/></svg>';
    cur.style.cssText = 'position:absolute;left:0;top:0;z-index:20;opacity:0;pointer-events:none;transition:transform .65s cubic-bezier(.3,0,.2,1),opacity .3s ease;will-change:transform;';
    chat.appendChild(cur);
    function moveTo(el, dx, dy) {
      var c = chat.getBoundingClientRect(), r = el.getBoundingClientRect();
      var x = r.left - c.left + r.width / 2 + (dx || 0);
      var y = r.top - c.top + r.height / 2 + (dy || 0);
      cur.style.transform = 'translate(' + x + 'px,' + y + 'px)';
    }
    function clickPulse() {
      cur.firstChild.style.transition = 'transform .12s ease';
      cur.firstChild.style.transform = 'scale(.8)';
      setTimeout(function () { cur.firstChild.style.transform = 'scale(1)'; }, 130);
    }

    function panelInit(p) {
      p.style.transition = 'none';
      p.style.opacity = '0';
      p.style.transform = 'scale(.95)';
      p.style.transformOrigin = '100% 100%';
    }
    function panelShow(p) {
      p.style.transition = 'opacity .25s ease, transform .3s cubic-bezier(.2,.9,.3,1.15)';
      p.style.opacity = '1';
      p.style.transform = 'scale(1)';
    }
    function panelHide(p) {
      p.style.transition = 'opacity .22s ease, transform .22s ease';
      p.style.opacity = '0';
      p.style.transform = 'scale(.96)';
    }
    function msgInit(el) { el.style.transition = 'none'; el.style.opacity = '0'; el.style.transform = 'translateY(10px)'; }
    function msgShow(el) {
      el.style.transition = 'opacity .35s ease, transform .45s cubic-bezier(.22,1,.36,1)';
      el.style.opacity = '1'; el.style.transform = 'translateY(0)';
    }

    var timer = null, running = false;
    function runSteps(steps, i) {
      if (i >= steps.length) return;
      timer = setTimeout(function () { steps[i][1](); runSteps(steps, i + 1); }, steps[i][0] * PACE);
    }
    function resetAll() {
      panelInit(menu); panelInit(models);
      menu.style.right = '119px';          /* menu opens alone, aligned to the trigger */
      models.style.right = '119px';
      msgInit(prow); msgInit(resp);
      if (file) { file.style.transition = 'none'; file.style.opacity = '0'; file.style.transform = 'scale(.96)'; }
      triggerT.textContent = 'Sonnet 4.6';
      opus.style.transition = 'none'; opus.style.backgroundColor = 'transparent';
      cur.style.opacity = '0';
      void chat.offsetWidth;
    }
    function start() {
      if (running) return; running = true;
      resetAll();
      var steps = [
        [600, function () { moveTo(trigger, 30, 40); cur.style.opacity = '1'; void chat.offsetWidth; moveTo(trigger, 2, 4); }],
        [800, function () { clickPulse(); }],
        [180, function () { panelShow(menu); }],
        [700, function () { moveTo(moreRow, 30, 2); }],
        [850, function () { clickPulse(); }],
        [180, function () {
          menu.style.transition = 'right .4s cubic-bezier(.25,.8,.3,1)';
          menu.style.right = '376px';      /* slide aside, list opens aligned to the trigger */
          panelShow(models);
        }],
        [750, function () { moveTo(opus, 10, 2); }],
        [850, function () { clickPulse(); opus.style.transition = 'background-color .15s ease'; opus.style.backgroundColor = '#f2f2f0'; }],
        [320, function () { panelHide(menu); panelHide(models); triggerT.textContent = 'Opus 4.8'; }],
        [450, function () { cur.style.opacity = '0'; }],
        [450, function () { msgShow(prow); }],
        [950, function () { msgShow(resp); }],
        [380, function () { if (file) { file.style.transition = 'opacity .3s ease, transform .35s cubic-bezier(.22,1,.36,1)'; file.style.opacity = '1'; file.style.transform = 'scale(1)'; } }],
        [HOLD, function () {
          prow.style.transition = resp.style.transition = 'opacity .35s ease';
          prow.style.opacity = resp.style.opacity = '0';
        }],
        [400, function () { running = false; start(); }]
      ];
      runSteps(steps, 0);
    }
    function stop() { clearTimeout(timer); running = false; }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) start(); else stop(); });
      }, { threshold: 0.35 }).observe(root);
    } else { start(); }
  });
})();
