/* Chrome reflection sweep on the section title — repeats while in view */
(function () {
  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function ready(f) { if (document.readyState !== 'loading') f(); else document.addEventListener('DOMContentLoaded', f); }
  ready(function () {
    if (REDUCED) return;
    var root = document.querySelector('.dorg');
    var cfg = (root && root.dataset) || {};
    function num(v, d) { v = parseFloat(v); return isFinite(v) ? v : d; }
    if (!root) return;
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
