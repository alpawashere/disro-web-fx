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

    var FLIGHT_MS = 760;

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
          backgroundColor: 'rgba(252,252,252,0.99)', offset: 0.36,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
        { transform: 'translate(-50%, 0px) scale(0.739)', filter: 'blur(2px)',
          backgroundColor: 'rgba(237,237,237,0.99)' }
      ], { duration: FLIGHT_MS }).onfinish = function () {
        c.style.transition = '';
      };
      setTimeout(function () { c.style.zIndex = 1; }, FLIGHT_MS * 0.42);

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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStackCycle);
  } else {
    initStackCycle();
  }
})();
