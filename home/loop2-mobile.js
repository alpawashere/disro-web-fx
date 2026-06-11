/* "Every engagement is a loop" — mobile scroll-in-place. Migrated from Webflow registered
   script loop2_mobile_scroll_v9, with one fix: the section height is only recomputed when
   the viewport WIDTH changes. iOS fires `resize` when the URL bar collapses/expands on
   touch; v9 recomputed the section height from innerHeight on every resize, shifting all
   content below the section by ~380px in one frame — the mobile scroll-jump bug. */
(function () {
  var mq = window.matchMedia('(max-width:767px)');
  var section, pairs, sticky, PPH, lastA;
  var lastW = window.innerWidth;
  function navH() { var n = document.querySelector('.nav'); return n ? n.getBoundingClientRect().height : 0; }
  function update() {
    var top = section.getBoundingClientRect().top;
    var p = Math.max(0, Math.min(pairs.length - 1, -top / PPH));
    var a = Math.min(pairs.length - 1, Math.floor(p));
    if (a === lastA) return;
    if (lastA >= 0) { pairs[lastA].style.transition = 'none'; pairs[lastA].style.opacity = 0; }
    pairs[a].style.transition = 'opacity 0.3s ease';
    pairs[a].style.opacity = 1;
    lastA = a;
  }
  function init() {
    section = document.querySelector('.loop2-mobile');
    if (!section) return;
    pairs = Array.from(section.querySelectorAll(':scope>.loop2-mobile-pair'));
    if (!pairs.length) return;
    PPH = Math.round(window.innerHeight * 0.7);
    lastA = -1;
    var nh = navH() + 40;
    sticky = document.createElement('div');
    sticky.style.cssText = 'position:sticky;top:' + nh + 'px;height:calc(100svh - ' + nh + 'px);overflow:hidden;';
    section.appendChild(sticky);
    pairs.forEach(function (p) { sticky.appendChild(p); });
    pairs.forEach(function (p, i) { p.style.cssText = 'position:absolute;inset:0;background:#f8f8f8;opacity:' + (i === 0 ? 1 : 0) + ';'; });
    lastA = 0;
    section.style.height = (pairs.length * PPH + window.innerHeight) + 'px';
    window.addEventListener('scroll', update, { passive: true });
  }
  function destroy() {
    if (!section || !sticky) return;
    pairs.forEach(function (p) { p.style.cssText = ''; section.appendChild(p); });
    sticky.parentNode && sticky.parentNode.removeChild(sticky);
    section.style.height = '';
    window.removeEventListener('scroll', update);
    section = pairs = sticky = null;
    lastA = -1;
  }
  function check(e) { e.matches ? (!section && init()) : destroy(); }
  window.addEventListener('resize', function () {
    if (window.innerWidth === lastW) return; /* URL-bar height change — ignore (the fix) */
    lastW = window.innerWidth;
    if (section) {
      PPH = Math.round(window.innerHeight * 0.7);
      section.style.height = (pairs.length * PPH + window.innerHeight) + 'px';
    }
  });
  mq.addEventListener('change', check);
  function run() { if (mq.matches) init(); }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', run) : run();
})();
