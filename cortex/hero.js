/* Cortex hero — uses the same heartbeat/wavefront logic as the Home hero,
   adapted to Cortex's existing Webflow classes and top-left positioned items. */
(function () {
  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  ready(function () {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var root = document.querySelector('.cx-heroimg-illustration');
    var stage = root && root.querySelector('.cx-heroimg-scene');
    var core = stage && stage.querySelector('.cx-heroimg-badge');
    if (!root || !stage || root.getAttribute('data-cx-hero-fx') === 'true') return;
    root.setAttribute('data-cx-hero-fx', 'true');

    for (var clip = root, clipDepth = 0; clip && clipDepth < 4; clip = clip.parentElement, clipDepth++) {
      clip.style.overflow = 'visible';
    }
    root.style.overflowAnchor = 'none';
    stage.style.overflow = 'visible';

    var waveClip = stage.querySelector('.cxhclip');
    if (!waveClip) {
      waveClip = document.createElement('div');
      waveClip.className = 'cxhclip';
      stage.insertBefore(waveClip, stage.firstChild);
    }

    var style = document.createElement('style');
    style.textContent =
      '@keyframes cxhbeat{0%{transform:translate(-50%,-50%) scale(1)}4.4%{transform:translate(-50%,-50%) scale(1.055)}8.8%{transform:translate(-50%,-50%) scale(1)}13.2%{transform:translate(-50%,-50%) scale(1.09)}22%{transform:translate(-50%,-50%) scale(1)}100%{transform:translate(-50%,-50%) scale(1)}}' +
      '@keyframes cxhwave{0%{transform:translate(-50%,-50%) scale(1);opacity:.9}100%{transform:translate(-50%,-50%) scale(2.4);opacity:0}}' +
      '.cx-heroimg-badge{animation:cxhbeat 2s linear infinite;}' +
      '.cx-heroimg-ring-outer,.cx-heroimg-ring-mid{-webkit-mask:linear-gradient(to bottom,transparent 0%,transparent 18%,#000 30%,#000 100%);mask:linear-gradient(to bottom,transparent 0%,transparent 18%,#000 30%,#000 100%);}' +
      '.cxhclip{position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:1;-webkit-mask:linear-gradient(to bottom,transparent 0%,transparent 17%,#000 28%,#000 100%);mask:linear-gradient(to bottom,transparent 0%,transparent 17%,#000 28%,#000 100%);}' +
      '.cxhwave{position:absolute;left:50%;top:50%;width:36%;aspect-ratio:1/1;border-radius:50%;background:radial-gradient(circle,rgba(208,208,208,.85) 0%,rgba(208,208,208,.65) 62%,rgba(208,208,208,0) 100%);pointer-events:none;animation:cxhwave 1.6s cubic-bezier(.17,.67,.45,1) forwards;}' +
      '.cxhband{position:absolute;left:50%;top:50%;width:36%;aspect-ratio:1/1;border-radius:50%;pointer-events:none;backdrop-filter:blur(1.6px);-webkit-backdrop-filter:blur(1.6px);-webkit-mask:radial-gradient(circle,transparent 74%,#000 84%,#000 94%,transparent 100%);mask:radial-gradient(circle,transparent 74%,#000 84%,#000 94%,transparent 100%);animation:cxhwave 1.6s cubic-bezier(.17,.67,.45,1) forwards;}' +
      '@media (max-width:767px){.cxhband{display:none}}';
    document.head.appendChild(style);

    if (reduce || !core) return;

    var items = [];
    var activePool = [];
    var T = 2000;
    var SP = 264;
    var t0 = performance.now();

    function stageRect() {
      return stage.getBoundingClientRect();
    }

    function coreCenter() {
      var sr = stageRect();
      var cr = core.getBoundingClientRect();
      return {
        x: cr.left - sr.left + cr.width / 2,
        y: cr.top - sr.top + cr.height / 2
      };
    }

    function polar(o) {
      var dx = o.x - 50;
      var dy = o.y - 50;
      var rad = Math.hypot(dx, dy) || 1;
      o.ux = dx / rad;
      o.uy = dy / rad;
      o.r = rad;
      if (o.r <= 18) {
        o.tc = 0;
        o.amp = 1;
        return;
      }
      var f = (o.r - 18) / 25.2;
      if (f >= 1) {
        o.tc = -1;
        o.amp = 0;
        return;
      }
      var q = 1 - Math.sqrt(1 - f);
      o.tc = q * 1600;
      o.amp = Math.pow(1 - q, 1.4);
    }

    function measure() {
      var sr = stageRect();
      var cc = coreCenter();
      items = [];
      activePool = [];
      var els = Array.prototype.slice.call(stage.querySelectorAll('.cx-heroimg-agent, .cx-heroimg-icon, .cx-heroimg-human'));
      for (var i = 0; i < els.length; i++) {
        var el = els[i];
        var cs = getComputedStyle(el);
        if (cs.display === 'none') continue;
        var er = el.getBoundingClientRect();
        var cx = er.left - sr.left + er.width / 2;
        var cy = er.top - sr.top + er.height / 2;
        var o = {
          el: el,
          kind: el.classList.contains('cx-heroimg-agent') ? 'agent' :
            el.classList.contains('cx-heroimg-icon') ? 'icon' : 'human',
          x: (cc.x + (cx - cc.x)) / sr.width * 100,
          y: (cc.y + (cy - cc.y)) / sr.height * 100,
          active: false
        };
        polar(o);
        el.style.transformOrigin = '50% 50%';
        items.push(o);
        activePool.push(o);
      }
    }

    function pickSet(arr, n) {
      var c = arr.slice();
      for (var i = c.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = c[i];
        c[i] = c[j];
        c[j] = tmp;
      }
      return c.slice(0, n);
    }

    function setActive(o, on) {
      o.active = on;
      o.el.style.transition = 'box-shadow .45s ease, background-color .45s ease, filter .45s ease';
      if (on) {
        o.el.style.boxShadow = '0 0 0 1px rgba(255,255,255,.9), -5px -5px 13px rgba(255,255,255,.6), 8px 14px 30px rgba(25,25,25,.24)';
        if (o.kind === 'icon') o.el.style.backgroundColor = '#191919';
      } else {
        o.el.style.boxShadow = '';
        if (o.kind === 'icon') o.el.style.backgroundColor = '';
      }
    }

    function plan(immediate) {
      var want = pickSet(activePool, Math.min(activePool.length, 5 + Math.floor(Math.random() * 4)));
      for (var i = 0; i < activePool.length; i++) {
        (function (o) {
          var on = want.indexOf(o) > -1;
          if (on === o.active) return;
          if (immediate || o.tc < 0) setActive(o, on);
          else setTimeout(function () { setActive(o, on); }, o.tc);
        })(activePool[i]);
      }
    }

    function spawn() {
      var w = document.createElement('div');
      w.className = 'cxhwave';
      waveClip.appendChild(w);
      w.addEventListener('animationend', function () { w.remove(); });

      var b = document.createElement('div');
      b.className = 'cxhband';
      waveClip.appendChild(b);
      b.addEventListener('animationend', function () { b.remove(); });

      plan(false);
    }

    var timer = null;
    var raf = null;
    var running = false;

    function frame(now) {
      var elTime = now - t0;
      for (var i = 0; i < items.length; i++) {
        var o = items[i];
        var g = 0;
        if (o.tc >= 0) {
          for (var k = 0; k < 2; k++) {
            var sp = (Math.floor((elTime - SP) / T) - k) * T + SP;
            if (sp < 0) continue;
            var d = (elTime - sp) - o.tc;
            if (d > -240 && d < 240) {
              var c = Math.cos(d / 240 * Math.PI / 2);
              var v = c * c * o.amp;
              if (v > g) g = v;
            }
          }
        }
        var push = g * 5;
        var scale = 1 + g * 0.035 + (o.active ? 0.02 : 0);
        o.el.style.transform = 'translate(' + (o.ux * push).toFixed(2) + 'px,' + (o.uy * push).toFixed(2) + 'px) scale(' + scale.toFixed(4) + ')';
        if (o.kind === 'human') {
          o.el.style.filter = g > 0.01 ? 'brightness(' + (1 + g * 0.08).toFixed(3) + ')' : '';
        } else {
          o.el.style.filter = g > 0.01 ? 'brightness(' + (1 + g * 0.06).toFixed(3) + ') saturate(' + (1 + g * 0.05).toFixed(3) + ')' : '';
        }
      }
      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (running) return;
      running = true;
      t0 = performance.now();
      measure();
      plan(true);
      setTimeout(function () {
        if (!running) return;
        spawn();
        timer = setInterval(spawn, T);
      }, SP);
      raf = requestAnimationFrame(frame);
    }

    function stop() {
      running = false;
      if (timer) clearInterval(timer);
      if (raf) cancelAnimationFrame(raf);
      timer = null;
      raf = null;
      for (var i = 0; i < items.length; i++) {
        items[i].el.style.transform = '';
        items[i].el.style.filter = '';
        setActive(items[i], false);
      }
    }

    var lastW = window.innerWidth;
    window.addEventListener('resize', function () {
      if (window.innerWidth === lastW) return;
      lastW = window.innerWidth;
      if (running) measure();
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        for (var i = 0; i < entries.length; i++) {
          var e = entries[i];
          if (e.isIntersecting && e.intersectionRatio >= 0.25) start();
          else if (!e.isIntersecting) stop();
        }
      }, { threshold: [0, 0.25] }).observe(root);
    } else {
      start();
    }
  });
})();
