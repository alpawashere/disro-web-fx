/* cortex-fx.js — manifest for Cortex page animations.
   Same pattern as Home: each module is fetched and injected as its own script
   so one module error cannot take down the page. */
(function () {
  var BASE = 'https://raw.githubusercontent.com/alpawashere/disro-web-fx/main/cortex/';
  ['hero.js', 'google-icons-v2.js'].forEach(function (f) {
    fetch(BASE + f + '?cb=' + Date.now()).then(function (r) { return r.text(); }).then(function (t) {
      var s = document.createElement('script');
      s.textContent = t;
      document.head.appendChild(s);
    });
  });
})();
