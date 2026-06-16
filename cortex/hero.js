/* Cortex hero — Home-style core pulse that activates the existing orbit items.
   Runtime-only animation: the Webflow artwork remains the static fallback. */
(function () {
  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  ready(function () {
    if (REDUCED) return;

    var root = document.querySelector('.cx-heroimg-illustration');
    var scene = root && root.querySelector('.cx-heroimg-scene');
    var badge = scene && scene.querySelector('.cx-heroimg-badge');
    if (!root || !scene || !badge || root.getAttribute('data-cx-hero-fx') === 'true') return;
    root.setAttribute('data-cx-hero-fx', 'true');

    root.style.overflow = 'visible';
    scene.style.overflow = 'visible';
    root.style.overflowAnchor = 'none';

    var agents = Array.prototype.slice.call(scene.querySelectorAll('.cx-heroimg-agent'));
    var icons = Array.prototype.slice.call(scene.querySelectorAll('.cx-heroimg-icon'));
    var humans = Array.prototype.slice.call(scene.querySelectorAll('.cx-heroimg-human'));
    var rings = Array.prototype.slice.call(scene.querySelectorAll('.cx-heroimg-ring'));
    var nodes = agents.concat(icons, humans);
    if (!nodes.length) return;

    var style = document.createElement('style');
    style.textContent =
      '.cx-wave{position:absolute;left:50%;top:50%;width:120px;height:120px;border-radius:999px;' +
      'border:1px solid rgba(255,255,255,.82);background:radial-gradient(circle,rgba(255,255,255,.42) 0%,rgba(255,255,255,.16) 45%,rgba(255,255,255,0) 72%);' +
      'box-shadow:0 0 34px rgba(255,255,255,.45);pointer-events:none;z-index:1;transform:translate(-50%,-50%) scale(.55);opacity:0;will-change:transform,opacity;}' +
      '.cx-wave.is-on{animation:cxWave 1900ms cubic-bezier(.18,.86,.24,1) forwards;}' +
      '@keyframes cxWave{0%{opacity:.78;transform:translate(-50%,-50%) scale(.5)}72%{opacity:.24}100%{opacity:0;transform:translate(-50%,-50%) scale(5.4)}}';
    document.head.appendChild(style);

    var wave = document.createElement('div');
    wave.className = 'cx-wave';
    scene.insertBefore(wave, scene.firstChild);

    var measured = [];
    var center = { x: 0, y: 0 };

    function cxMid(el) {
      var s = scene.getBoundingClientRect();
      var r = el.getBoundingClientRect();
      return {
        x: r.left - s.left + r.width / 2,
        y: r.top - s.top + r.height / 2
      };
    }

    function measure() {
      center = cxMid(badge);
      measured = [];
      for (var i = 0; i < nodes.length; i++) {
        var p = cxMid(nodes[i]);
        var dx = p.x - center.x;
        var dy = p.y - center.y;
        measured.push({
          el: nodes[i],
          d: Math.sqrt(dx * dx + dy * dy),
          dx: dx,
          dy: dy,
          kind: nodes[i].classList.contains('cx-heroimg-agent') ? 'agent' :
            nodes[i].classList.contains('cx-heroimg-icon') ? 'icon' : 'human'
        });
      }
      measured.sort(function (a, b) { return a.d - b.d; });
    }

    function resetVisuals() {
      badge.style.transition = 'none';
      badge.style.transform = '';
      badge.style.filter = '';

      for (var i = 0; i < nodes.length; i++) {
        nodes[i].style.transition = 'none';
        nodes[i].style.transform = '';
        nodes[i].style.filter = '';
        nodes[i].style.opacity = '';
      }
      for (var r = 0; r < rings.length; r++) {
        rings[r].style.transition = 'none';
        rings[r].style.opacity = '';
        rings[r].style.filter = '';
      }
    }

    function activate(item) {
      var el = item.el;
      var mag = item.kind === 'agent' ? 8 : item.kind === 'icon' ? 6 : 4;
      var len = Math.max(1, item.d);
      var x = (item.dx / len) * mag;
      var y = (item.dy / len) * mag;
      var scale = item.kind === 'agent' ? 1.035 : item.kind === 'icon' ? 1.08 : 1.05;

      el.style.transition = 'transform 520ms cubic-bezier(.19,1,.22,1), filter 420ms ease, opacity 420ms ease';
      el.style.transform = 'translate(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px) scale(' + scale + ')';
      el.style.filter = 'brightness(1.08) saturate(1.08) drop-shadow(0 10px 18px rgba(25,25,25,.14))';
      el.style.opacity = '1';

      setTimeout(function () {
        el.style.transition = 'transform 720ms cubic-bezier(.19,1,.22,1), filter 680ms ease, opacity 680ms ease';
        el.style.transform = '';
        el.style.filter = '';
        el.style.opacity = '';
      }, 560);
    }

    var timers = [];
    function later(ms, fn) {
      var t = setTimeout(fn, ms);
      timers.push(t);
      return t;
    }
    function clearTimers() {
      for (var i = 0; i < timers.length; i++) clearTimeout(timers[i]);
      timers = [];
    }

    var running = false;
    function play() {
      if (!running) return;
      clearTimers();
      measure();

      badge.style.transition = 'transform 440ms cubic-bezier(.19,1,.22,1), filter 440ms ease';
      badge.style.transform = 'scale(1.045)';
      badge.style.filter = 'brightness(1.06) drop-shadow(0 18px 34px rgba(25,25,25,.18))';

      later(180, function () {
        badge.style.transform = 'scale(1)';
      });
      later(460, function () {
        badge.style.filter = '';
      });

      wave.classList.remove('is-on');
      void wave.offsetWidth;
      wave.classList.add('is-on');

      for (var r = 0; r < rings.length; r++) {
        (function (ring, n) {
          later(220 + n * 170, function () {
            ring.style.transition = 'opacity 620ms ease, filter 620ms ease';
            ring.style.opacity = '1';
            ring.style.filter = 'drop-shadow(0 0 10px rgba(255,255,255,.5))';
            later(760, function () {
              ring.style.opacity = '';
              ring.style.filter = '';
            });
          });
        })(rings[r], r);
      }

      for (var i = 0; i < measured.length; i++) {
        (function (item, n) {
          later(300 + n * 115, function () { activate(item); });
        })(measured[i], i);
      }

      later(3200, play);
    }

    function start() {
      if (running) return;
      running = true;
      resetVisuals();
      play();
    }

    function stop() {
      running = false;
      clearTimers();
      resetVisuals();
    }

    var lastW = window.innerWidth;
    window.addEventListener('resize', function () {
      if (window.innerWidth === lastW) return;
      lastW = window.innerWidth;
      measure();
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
