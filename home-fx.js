/* home-fx.js — manifest for Home page animations.
   Each module is fetched and injected as its OWN <script>, so a syntax
   error in one module cannot take down the others. Add a module = add
   a filename here and push. */
(function () {
  var PROD_BASE = 'https://raw.githubusercontent.com/alpawashere/disro-web-fx/main/home/';
  var STAGING_BASE = 'https://raw.githubusercontent.com/alpawashere/disro-web-fx/staging/ask-cortex-v2/home/';
  var SLACK_BASE = 'https://raw.githubusercontent.com/alpawashere/disro-web-fx/staging/slack-adidas/home/';
  /* Encode the slash in the branch ref; otherwise raw.githubusercontent.com
     interprets `home-wip-hero` as the first directory in the file path. */
  var HERO_ALT_BASE = 'https://raw.githubusercontent.com/alpawashere/disro-web-fx/staging%2Fhome-wip-hero/home/';
  var isStaging = /\.webflow\.io$/.test(window.location.hostname);
  var isHomeWip = window.location.pathname.replace(/\/+$/, '') === '/home-wip';
  var useAltHero = isStaging && isHomeWip && new URLSearchParams(window.location.search).get('hero') === 'alt';
  var files = ['fonts.js', 'organigram.js', 'shine.js', 'slack.js', 'cortex.js', 'loop2-mobile.js', 'dmocks.js', 'debug.js', 'hero-new.js'];

  files.forEach(function (f) {
    var base = PROD_BASE;
    if (isStaging && f === 'cortex.js') base = STAGING_BASE;
    if (isStaging && f === 'slack.js') base = SLACK_BASE;
    if (useAltHero && f === 'hero-new.js') base = HERO_ALT_BASE;
    fetch(base + f + '?cb=' + Date.now()).then(function (r) { return r.text(); }).then(function (t) {
      var s = document.createElement('script');
      s.textContent = t;
      document.head.appendChild(s);
    });
  });
})();
