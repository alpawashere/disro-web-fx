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
})();
