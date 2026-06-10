/* home-fx.js — manifest for Home page animations.
   Each module is fetched and injected as its OWN <script>, so a syntax
   error in one module cannot take down the others. Add a module = add
   a filename here and push. */
(function () {
  var BASE = 'https://raw.githubusercontent.com/alpawashere/disro-web-fx/main/home/';
  ['fonts.js', 'organigram.js', 'shine.js', 'slack.js', 'cortex.js'].forEach(function (f) {
    fetch(BASE + f + '?cb=' + Date.now()).then(function (r) { return r.text(); }).then(function (t) {
      var s = document.createElement('script');
      s.textContent = t;
      document.head.appendChild(s);
    });
  });
})();
