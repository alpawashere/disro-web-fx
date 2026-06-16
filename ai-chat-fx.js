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
    for (var clip = host, clipDepth = 0; clip && clipDepth < 4; clip = clip.parentElement, clipDepth++) {
      clip.style.overflow = 'visible';
    }

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
      '.aic-heroimg-illustration{overflow:visible!important;}' +
      '.aic-fx-item{position:absolute;display:flex;align-items:center;justify-content:center;overflow:hidden;' +
      'box-shadow:-3px -3px 8px rgba(255,255,255,.5),4px 4px 16px rgba(25,25,25,.2);will-change:left,top,width,height,transform,opacity;}' +
      '.aic-fx-item img,.aic-fx-item svg{display:block;max-width:68%;max-height:68%;}' +
      '.aic-fx-agent{background-position:50%;background-repeat:no-repeat;background-size:cover;}' +
      '.aic-fx-letter{font:600 26px/1 Geist,Arial,sans-serif;color:#fff;letter-spacing:-.04em;}' +
      '.aic-fx-tool{font:600 22px/1 Geist,Arial,sans-serif;color:#191919;}';
    document.head.appendChild(style);

    var slots = [
      { x: 10.5, y: 292, size: 58,  r: 15, s: 0.74, o: 0.42 },
      { x: 21,   y: 172, size: 66,  r: 17, s: 0.84, o: 0.68 },
      { x: 34,   y: 83,  size: 84,  r: 21, s: 0.96, o: 0.88 },
      { x: 50,   y: 52,  size: 100, r: 25, s: 1.16, o: 1 },
      { x: 66,   y: 83,  size: 84,  r: 21, s: 0.96, o: 0.88 },
      { x: 79,   y: 172, size: 66,  r: 17, s: 0.84, o: 0.68 },
      { x: 89.5, y: 292, size: 58,  r: 15, s: 0.74, o: 0.42 }
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
    var nextItem = 7;

    function applyNode(node, animate) {
      var slotIndex = node._slotIndex;
      var slot = slots[slotIndex];
      node.style.transition = animate
        ? 'left 680ms cubic-bezier(0.22,1,0.36,1), top 680ms cubic-bezier(0.22,1,0.36,1), width 680ms cubic-bezier(0.22,1,0.36,1), height 680ms cubic-bezier(0.22,1,0.36,1), border-radius 680ms cubic-bezier(0.22,1,0.36,1), transform 680ms cubic-bezier(0.22,1,0.36,1), opacity 260ms ease'
        : 'none';
      node.style.left = slot.x + '%';
      node.style.top = slot.y + 'px';
      node.style.width = slot.size + 'px';
      node.style.height = slot.size + 'px';
      node.style.borderRadius = slot.r + 'px';
      node.style.opacity = slot.o;
      node.style.zIndex = String(30 - Math.abs(slotIndex - 3));
      node.style.transform = 'translate(-50%, -50%) scale(' + slot.s + ')';
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
      for (var i = 0; i < slots.length; i++) {
        var el = document.createElement('div');
        el._slotIndex = i;
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
        if (nodes[i]._slotIndex === slots.length - 1) recycler = nodes[i];
      }

      recycler.style.transition = 'opacity 220ms ease';
      recycler.style.opacity = '0';

      setTimeout(function () {
        recycler._slotIndex = 0;
        setItem(recycler, nextItem);
        nextItem++;
        applyNode(recycler, false);
        recycler.style.opacity = '0';

        host.offsetHeight;

        for (var i = 0; i < nodes.length; i++) {
          if (nodes[i] !== recycler) {
            nodes[i]._slotIndex += 1;
            applyNode(nodes[i], true);
          }
        }

        recycler.style.transition = 'opacity 260ms ease';
        recycler.style.opacity = String(slots[0].o);

        setTimeout(function () {
          moving = false;
        }, 720);
      }, 240);
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
