/* ai-chat-fx.js — AI Chat page banner animation. */
(function () {
  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  ready(function () {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var host = document.querySelector('.aic-heroimg-illustration');
    if (!host || host.getAttribute('data-aic-fx') === 'true') return;
    host.setAttribute('data-aic-fx', 'true');

    var originals = [
      host.querySelector('.aic-heroimg-icon-bl'),
      host.querySelector('.aic-heroimg-icon-ml'),
      host.querySelector('.aic-heroimg-icon-tl'),
      host.querySelector('.aic-heroimg-icon-top'),
      host.querySelector('.aic-heroimg-icon-tr'),
      host.querySelector('.aic-heroimg-icon-mr'),
      host.querySelector('.aic-heroimg-icon-br')
    ].filter(Boolean);
    if (originals.length < 5) return;

    var style = document.createElement('style');
    style.textContent =
      '.aic-fx-item{position:absolute;display:flex;align-items:center;justify-content:center;overflow:hidden;' +
      'box-shadow:-3px -3px 8px rgba(255,255,255,.5),4px 4px 16px rgba(25,25,25,.2);will-change:left,top,width,height,transform,opacity;}' +
      '.aic-fx-item img,.aic-fx-item svg{display:block;max-width:68%;max-height:68%;}' +
      '.aic-fx-agent{background-position:50%;background-repeat:no-repeat;background-size:cover;}' +
      '.aic-fx-letter{font:600 26px/1 Geist,Arial,sans-serif;color:#fff;letter-spacing:-.04em;}' +
      '.aic-fx-tool{font:600 22px/1 Geist,Arial,sans-serif;color:#191919;}';
    document.head.appendChild(style);

    var slots = [
      { x: -2,    y: 300, size: 54,  r: 14, s: 0.62, o: 0 },
      { x: 8.47,  y: 258, size: 64,  r: 16, s: 0.72, o: 0.42 },
      { x: 17.45, y: 131, size: 70,  r: 18, s: 0.82, o: 0.68 },
      { x: 30.8,  y: 36,  size: 88,  r: 22, s: 0.94, o: 0.88 },
      { x: 50,    y: 0,   size: 100, r: 25, s: 1.16, o: 1 },
      { x: 62.85, y: 36,  size: 88,  r: 22, s: 0.94, o: 0.88 },
      { x: 77.52, y: 131, size: 70,  r: 18, s: 0.82, o: 0.68 },
      { x: 86.86, y: 258, size: 64,  r: 16, s: 0.72, o: 0.42 },
      { x: 98,    y: 300, size: 54,  r: 14, s: 0.62, o: 0 }
    ];

    function makeAgent(src) {
      return { bg: '#d9d9d9', imgBg: src, cls: 'aic-fx-agent' };
    }

    var items = [
      makeAgent('https://cdn.prod.website-files.com/698752f9145b6f03fa98b16d/6a2c87d84279ca1f188fd6a3_untitled_ChatGPT%20Images%202.0%20Edit_2026-05-06_23-25-22%205.jpg'),
      { bg: '#1a1a1a', html: '<img src="https://cdn.prod.website-files.com/698752f9145b6f03fa98b16d/6a2a1e81a643fa9f1941ce02_dmk2-klaviyo.svg" alt="">'},
      { bg: '#fff', html: '<img src="https://cdn.prod.website-files.com/698752f9145b6f03fa98b16d/6a29d721a2d0ed6fb4bf4a2d_dcx-bars.svg" alt="">'},
      makeAgent('https://cdn.prod.website-files.com/698752f9145b6f03fa98b16d/6a178687c4c836a09c3cb391_Frame%2015-7.png'),
      makeAgent('https://cdn.prod.website-files.com/698752f9145b6f03fa98b16d/6a2c87d73e0793ecdb52fc16_untitled_ChatGPT%20Images%202.0%20Edit_2026-05-06_23-25-22%206.jpg'),
      { bg: '#0077f2', html: '<img src="https://cdn.prod.website-files.com/698752f9145b6f03fa98b16d/6a3057f451841e2293c9ce98_image-2-%5BVectorized%5D.svg" alt="">'},
      { bg: '#95bf47', html: '<img src="https://cdn.prod.website-files.com/698752f9145b6f03fa98b16d/6a2a1e82a803b54e9f62e359_dmk2-shopify.svg" alt="">'},
      { bg: '#000', html: '<div class="aic-fx-letter">M</div>' },
      { bg: '#f9ab00', html: '<div class="aic-fx-letter">GA</div>' },
      { bg: '#191919', html: '<div class="aic-fx-letter">WF</div>' },
      { bg: '#fff', html: '<div class="aic-fx-tool">SEO</div>' },
      { bg: '#0e5241', html: '<div class="aic-fx-letter">PM</div>' },
      { bg: '#efefef', html: '<div class="aic-fx-tool">CS</div>' },
      { bg: '#191919', html: '<div class="aic-fx-letter">AI</div>' }
    ];

    for (var i = 0; i < originals.length; i++) originals[i].style.opacity = '0';

    var nodes = [];
    var nextItem = 9;

    function applyNode(node, animate) {
      var pathIndex = node._pathIndex;
      var slot = slots[pathIndex];
      node.style.transition = animate
        ? 'left 980ms cubic-bezier(0.19,1,0.22,1), top 980ms cubic-bezier(0.19,1,0.22,1), width 980ms cubic-bezier(0.19,1,0.22,1), height 980ms cubic-bezier(0.19,1,0.22,1), border-radius 980ms cubic-bezier(0.19,1,0.22,1), transform 980ms cubic-bezier(0.19,1,0.22,1), opacity 520ms ease'
        : 'none';
      node.style.left = slot.x + '%';
      node.style.top = slot.y + 'px';
      node.style.width = slot.size + 'px';
      node.style.height = slot.size + 'px';
      node.style.borderRadius = slot.r + 'px';
      node.style.opacity = slot.o;
      node.style.zIndex = String(30 - Math.abs(pathIndex - 4));
      node.style.transform = 'translateX(-50%) scale(' + slot.s + ')';
    }

    function setItem(node, itemIndex) {
      var item = items[itemIndex % items.length];
      node.className = 'aic-fx-item' + (item.cls ? ' ' + item.cls : '');
      node.style.backgroundColor = item.bg;
      node.style.backgroundImage = item.imgBg ? 'url("' + item.imgBg + '")' : 'none';
      node.innerHTML = item.html || '';
    }

    var timer = null;
    var moving = false;

    function applyInstant() {
      for (var i = 0; i < 9; i++) {
        var el = document.createElement('div');
        el._pathIndex = i;
        setItem(el, i);
        host.appendChild(el);
        nodes.push(el);
        applyNode(el, false);
      }
    }

    function step() {
      if (moving) return;
      moving = true;
      var recycler = null;
      for (var i = 0; i < nodes.length; i++) {
        if (nodes[i]._pathIndex === 8) recycler = nodes[i];
      }
      if (recycler) {
        recycler._pathIndex = 0;
        setItem(recycler, nextItem);
        nextItem++;
        applyNode(recycler, false);
      }
      host.offsetHeight;
      for (var i = 0; i < nodes.length; i++) {
        nodes[i]._pathIndex += 1;
        applyNode(nodes[i], true);
      }
      setTimeout(function () {
        moving = false;
      }, 1040);
    }

    function start() {
      if (timer) return;
      timer = setInterval(step, 1500);
    }

    function stop() {
      if (!timer) return;
      clearInterval(timer);
      timer = null;
    }

    applyInstant();

    new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        var e = entries[i];
        if (!e.isIntersecting) stop();
        else if (e.intersectionRatio >= 0.25) start();
      }
    }, { threshold: [0, 0.25] }).observe(host);
  });
})();
