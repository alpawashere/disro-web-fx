/* fx debug overlay — only active when the URL contains "fxdebug".
   Open e.g. https://disro.com/?fxdebug=1 — reproduce the issue, screenshot the overlay. */
(function () {
  if (!/fxdebug/.test(location.href)) return;
  function init() {
    var box = document.createElement('div');
    box.style.cssText = 'position:fixed;left:6px;bottom:6px;z-index:99999;background:rgba(0,0,0,.85);color:#7CFC00;font:10px/1.45 monospace;padding:6px 8px;border-radius:6px;max-width:90vw;max-height:40vh;overflow:hidden;pointer-events:none;white-space:pre;';
    document.body.appendChild(box);
    var lines = [];
    function log(s) {
      lines.push((performance.now() / 1000).toFixed(2) + ' ' + s);
      if (lines.length > 20) lines.shift();
      box.textContent = lines.join('\n');
    }
    log('fx debug on');

    var lastSY = window.scrollY, lastIH = window.innerHeight;
    var lastVV = window.visualViewport ? window.visualViewport.height : 0;
    var lastSH = document.documentElement.scrollHeight;
    var lastTick = performance.now();

    setInterval(function () {
      var now = performance.now();
      if (now - lastTick > 900) log('TIMER STALL ' + Math.round(now - lastTick) + 'ms');
      lastTick = now;
      var sh = document.documentElement.scrollHeight;
      if (Math.abs(sh - lastSH) > 2) { log('PAGE HEIGHT ' + lastSH + ' -> ' + sh); lastSH = sh; }
    }, 250);

    window.addEventListener('scroll', function () {
      var sy = window.scrollY, d = sy - lastSY;
      if (Math.abs(d) > 120) log('SCROLL JUMP d=' + Math.round(d) + ' -> ' + Math.round(sy));
      lastSY = sy;
    }, { passive: true });

    window.addEventListener('resize', function () {
      log('winH ' + lastIH + ' -> ' + window.innerHeight); lastIH = window.innerHeight;
    });
    if (window.visualViewport) window.visualViewport.addEventListener('resize', function () {
      log('vvH ' + Math.round(lastVV) + ' -> ' + Math.round(window.visualViewport.height));
      lastVV = window.visualViewport.height;
    });
    ['touchstart', 'touchend'].forEach(function (ev) {
      window.addEventListener(ev, function () { log(ev + ' sy=' + Math.round(window.scrollY)); }, { passive: true });
    });
    if ('ResizeObserver' in window) {
      var ro = new ResizeObserver(function (es) {
        es.forEach(function (e) {
          var el = e.target;
          var name = el === document.body ? 'body' : (String(el.className).split(' ')[0] || el.tagName);
          log('RESIZE ' + name + ' h=' + Math.round(e.contentRect.height));
        });
      });
      ['.dcx', '.dslk', '.dorg', '.loop2', '[data-loop2-track]', '.hero-section'].forEach(function (sel) {
        var el = document.querySelector(sel); if (el) ro.observe(el);
      });
      ro.observe(document.body);
    }
  }
  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
