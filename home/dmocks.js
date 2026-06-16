/* dmocks.js — scales the coded card mocks (.dmk1/.dmk2/.dmk3) so their
   fixed 393x327 stages cover the card like the old background-size:cover
   PNGs did. Resize recompute is gated on width change (iOS URL-bar resize
   events change height only — see decisions.md §5g). */
(function () {
  var DESIGN_W = 393, DESIGN_H = 327;

  function fit() {
    var boxes = document.querySelectorAll('.dmk1, .dmk2, .dmk3');
    for (var i = 0; i < boxes.length; i++) {
      var box = boxes[i];
      var stage = box.firstElementChild;
      if (!stage) continue;
      var s = Math.max(box.clientWidth / DESIGN_W, box.clientHeight / DESIGN_H);
      stage.style.transform = 'scale(' + s + ')';
    }
  }

  var lastW = window.innerWidth;
  window.addEventListener('resize', function () {
    if (window.innerWidth === lastW) return;
    lastW = window.innerWidth;
    fit();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fit);
  } else {
    fit();
  }
  window.addEventListener('load', fit);

  /* dmk1 infinite stack cycle — the front notification recedes to the back
     (shrinks, blurs, grays) while the other two step forward. All three cards
     share identical front-size markup; depth lives entirely in transform/
     filter/background, so the cycle is a pure style swap with CSS transitions
     doing the motion. IO-gated: starts at ratio >= 0.35, pauses (never resets)
     only on full exit — decisions.md §5f rule. */
  function initStackCycle() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var box = document.querySelector('.dmk1');
    if (!box) return;
    var cards = [
      box.querySelector('.dmk1-c1'),
      box.querySelector('.dmk1-c2'),
      box.querySelector('.dmk1-c3')
    ];
    if (!cards[0] || !cards[1] || !cards[2]) return;

    var SLOTS = [
      { y: 0,  s: 0.739, b: 2,   bg: 'rgba(237,237,237,0.99)', z: 1 },
      { y: 28, s: 0.848, b: 0.5, bg: 'rgba(248,248,248,0.99)', z: 2 },
      { y: 61, s: 1,     b: 0,   bg: 'rgba(255,255,255,0.99)', z: 3 }
    ];
    var idx = [0, 1, 2]; // card i currently occupies slot idx[i]

    function applyTo(c, sl) {
      c.style.transform = 'translate(-50%, ' + sl.y + 'px) scale(' + sl.s + ')';
      c.style.filter = sl.b ? 'blur(' + sl.b + 'px)' : 'none';
      c.style.backgroundColor = sl.bg;
      c.style.zIndex = sl.z;
    }

    function apply() {
      for (var i = 0; i < 3; i++) applyTo(cards[i], SLOTS[idx[i]]);
    }

    var FLIGHT_MS = 1150;

    function step() {
      var frontI = idx.indexOf(2);
      // front (2) -> back (0), back (0) -> middle (1), middle (1) -> front (2)
      idx = idx.map(function (v) { return (v + 1) % 3; });

      /* Receding card: dive down in a fast arc (still on top), then shoot up
         to the back slot decelerating hard. zIndex flips mid-flight so it
         passes behind the advancing cards on the way up. */
      var c = cards[frontI];
      c.style.transition = 'none';
      applyTo(c, SLOTS[0]);
      c.style.zIndex = 3;
      c.animate([
        { transform: 'translate(-50%, 61px) scale(1)', filter: 'blur(0px)',
          backgroundColor: 'rgba(255,255,255,0.99)',
          easing: 'cubic-bezier(0.5, 0, 0.9, 0.6)' },
        { transform: 'translate(-50%, 110px) scale(1.05)', filter: 'blur(0.3px)',
          backgroundColor: 'rgba(252,252,252,0.99)', offset: 0.24,
          easing: 'cubic-bezier(0.19, 1, 0.22, 1)' },
        { transform: 'translate(-50%, 0px) scale(0.739)', filter: 'blur(2px)',
          backgroundColor: 'rgba(237,237,237,0.99)' }
      ], { duration: FLIGHT_MS }).onfinish = function () {
        c.style.transition = '';
      };
      setTimeout(function () { c.style.zIndex = 1; }, FLIGHT_MS * 0.3);

      // Advancing cards step forward on the CSS transition, slightly delayed
      // so the dip reads first.
      setTimeout(function () {
        for (var i = 0; i < 3; i++) {
          if (i !== frontI) applyTo(cards[i], SLOTS[idx[i]]);
        }
      }, 140);
    }

    var timer = null;
    function start() { if (!timer) timer = setInterval(step, 2600); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }

    new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        var e = entries[i];
        if (!e.isIntersecting) stop();
        else if (e.intersectionRatio >= 0.35) start();
      }
    }, { threshold: [0, 0.35] }).observe(box);
  }

  /* dmk2 "intelligence at the core" cycle — bubble appears, prompt types in,
     dashboard builds, then the four connected icons resolve at the end. Runtime
     styles only; the static Webflow layout remains the reduced-motion state. */
  function initDmk2Cycle() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var box = document.querySelector('.dmk2');
    if (!box) return;

    var bubble = box.querySelector('.dmk2-bubble');
    var dash = box.querySelector('.dmk2-dash');
    var metrics = Array.prototype.slice.call(box.querySelectorAll('.dmk2-m'));
    var fills = Array.prototype.slice.call(box.querySelectorAll(
      '.dmk2-f1, .dmk2-f2, .dmk2-f3, .dmk2-f4, .dmk2-f5, .dmk2-f6, .dmk2-f7, .dmk2-f8'
    ));
    var icons = Array.prototype.slice.call(box.querySelectorAll('.dmk2-rail > div'));
    if (!bubble || !dash || !metrics.length || !fills.length || !icons.length) return;

    var prompt = bubble.textContent;
    var fillWidths = fills.map(function (f) { return window.getComputedStyle(f).width; });
    var timers = [];
    var running = false;

    function later(ms, fn) {
      var t = setTimeout(fn, ms);
      timers.push(t);
      return t;
    }

    function clearTimers() {
      for (var i = 0; i < timers.length; i++) clearTimeout(timers[i]);
      timers = [];
    }

    function resetFrame() {
      bubble.style.transition = 'none';
      bubble.style.opacity = '0';
      bubble.style.transform = 'translateY(12px) scale(0.96)';
      bubble.textContent = '';

      dash.style.transition = 'none';
      dash.style.opacity = '0';
      dash.style.transform = 'translateY(18px) scale(0.96)';
      dash.style.transformOrigin = '50% 18%';

      for (var i = 0; i < metrics.length; i++) {
        metrics[i].style.transition = 'none';
        metrics[i].style.opacity = '0';
        metrics[i].style.transform = 'translateY(8px)';
      }

      for (var j = 0; j < fills.length; j++) {
        fills[j].style.transition = 'none';
        fills[j].style.width = '0px';
      }

      for (var k = 0; k < icons.length; k++) {
        icons[k].style.transition = 'none';
        icons[k].style.opacity = '0';
        icons[k].style.transform = 'translateX(-8px) scale(0.84)';
        icons[k].style.transformOrigin = '50% 50%';
      }
    }

    function typePrompt() {
      var step = 0;
      var total = prompt.length;
      var tick = Math.max(18, Math.floor(1250 / total));
      function write() {
        if (!running) return;
        step++;
        bubble.textContent = prompt.slice(0, step);
        if (step < total) later(tick, write);
      }
      write();
    }

    function play() {
      if (!running) return;
      clearTimers();
      resetFrame();

      later(80, function () {
        bubble.style.transition = 'opacity 220ms ease, transform 520ms cubic-bezier(0.19, 1, 0.22, 1)';
        bubble.style.opacity = '1';
        bubble.style.transform = 'translateY(0) scale(1)';
      });

      later(320, typePrompt);

      later(1780, function () {
        bubble.style.transition = 'transform 520ms cubic-bezier(0.19, 1, 0.22, 1)';
        bubble.style.transform = 'translateY(-4px) scale(1.01)';
      });

      later(1980, function () {
        dash.style.transition = 'opacity 360ms ease, transform 760ms cubic-bezier(0.19, 1, 0.22, 1)';
        dash.style.opacity = '1';
        dash.style.transform = 'translateY(0) scale(1)';
      });

      for (var m = 0; m < metrics.length; m++) {
        (function (card, n) {
          later(2260 + n * 115, function () {
            card.style.transition = 'opacity 260ms ease, transform 520ms cubic-bezier(0.19, 1, 0.22, 1)';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          });
        })(metrics[m], m);
      }

      for (var f = 0; f < fills.length; f++) {
        (function (bar, w, n) {
          later(2640 + n * 75, function () {
            bar.style.transition = 'width 620ms cubic-bezier(0.19, 1, 0.22, 1)';
            bar.style.width = w;
          });
        })(fills[f], fillWidths[f], f);
      }

      for (var i = 0; i < icons.length; i++) {
        (function (icon, n) {
          later(3440 + n * 150, function () {
            icon.style.transition = 'opacity 260ms ease, transform 520ms cubic-bezier(0.19, 1, 0.22, 1)';
            icon.style.opacity = '1';
            icon.style.transform = 'translateX(0) scale(1.08)';
            later(220, function () { icon.style.transform = 'translateX(0) scale(1)'; });
          });
        })(icons[i], i);
      }

      later(5400, function () {
        bubble.style.transition = 'opacity 260ms ease, transform 420ms ease';
        dash.style.transition = 'opacity 260ms ease, transform 420ms ease';
        bubble.style.opacity = '0';
        dash.style.opacity = '0';
        dash.style.transform = 'translateY(12px) scale(0.985)';
        for (var i = 0; i < icons.length; i++) icons[i].style.opacity = '0';
      });

      later(5850, play);
    }

    function start() {
      if (running) return;
      running = true;
      play();
    }

    function stop() {
      running = false;
      clearTimers();
    }

    resetFrame();

    new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        var e = entries[i];
        if (!e.isIntersecting) stop();
        else if (e.intersectionRatio >= 0.35) start();
      }
    }, { threshold: [0, 0.35] }).observe(box);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initStackCycle();
      initDmk2Cycle();
    });
  } else {
    initStackCycle();
    initDmk2Cycle();
  }
})();
