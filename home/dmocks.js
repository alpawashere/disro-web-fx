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

    function apply() {
      for (var i = 0; i < 3; i++) {
        var sl = SLOTS[idx[i]];
        var c = cards[i];
        c.style.transform = 'translate(-50%, ' + sl.y + 'px) scale(' + sl.s + ')';
        c.style.filter = sl.b ? 'blur(' + sl.b + 'px)' : 'none';
        c.style.backgroundColor = sl.bg;
        c.style.zIndex = sl.z;
      }
    }

    function step() {
      // front (2) -> back (0), back (0) -> middle (1), middle (1) -> front (2)
      idx = idx.map(function (v) { return (v + 1) % 3; });
      apply();
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
