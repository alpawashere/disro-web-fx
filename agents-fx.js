/* agents-fx.js — Agents page hero card stepper + center metadata sync. */
(function () {
  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  ready(function () {
    var host = document.querySelector('.ag-heroimg-illustration');
    if (!host || host.getAttribute('data-agents-fx') === 'true') return;
    host.setAttribute('data-agents-fx', 'true');

    var row = host.querySelector('.ag-heroimg-row');
    var cards = row ? Array.prototype.slice.call(row.querySelectorAll('.ag-heroimg-card')) : [];
    var meta = row && row.querySelector('.ag-heroimg-meta');
    var sourceMeta = meta;
    var tools = meta && meta.querySelector('.ag-heroimg-tools');
    var label = meta && meta.querySelector('.ag-heroimg-label');
    if (cards.length < 5 || !meta || !tools || !label) return;

    function num(v, d) {
      v = parseFloat(v);
      return isFinite(v) ? v : d;
    }

    var cfg = host.dataset || {};
    var DWELL = num(cfg.agentsDwell, 1500);
    var K = num(cfg.agentsK, 230);
    var C = num(cfg.agentsC, 29);
    var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var rawAgentBase = 'https://raw.githubusercontent.com/alpawashere/disro-web-fx/main/assets/agents/';
    var cdn = 'https://cdn.prod.website-files.com/698752f9145b6f03fa98b16d/';

    var initialTools = Array.prototype.slice.call(tools.children).map(function (el) {
      return el.outerHTML;
    });

    function imgIcon(src, opts) {
      opts = opts || {};
      return {
        bg: opts.bg || '#fff',
        cls: opts.cls || '',
        imgCls: opts.imgCls || '',
        html: '<img class="agx-tool-img ' + (opts.imgCls || '') + '" src="' + src + '" alt="">'
      };
    }

    function svgIcon(svg, opts) {
      opts = opts || {};
      return { bg: opts.bg || '#fff', cls: opts.cls || '', html: svg };
    }

    var searchTools = initialTools.length === 3 ? initialTools : null;
    var metaLogo = cdn + '6a2a1e818a6a2403b7d09351_dmk2-meta.svg';
    var gaLogo = cdn + '6a2a1e828a6a2403b7d093a3_dmk2-ga.png';
    var klaviyoLogo = cdn + '6a2a1e81a643fa9f1941ce02_dmk2-klaviyo.svg';
    var shopifyLogo = cdn + '6a2a1e82a803b54e9f62e359_dmk2-shopify.svg';
    var webflowLogo = cdn + '6a29d721954f506fae6c6a9c_dcx-webflow.svg';
    var docsLogo = cdn + '6a305898fe755cf715f8cafe_google%20docs.svg';
    var notionLogo = cdn + '6a3057f5c176f62896a32426_cib%3Anotion.svg';
    var asanaLogo = cdn + '6a3057f5c176f62896a32424_logos%3Aasana-icon.svg';
    var mailchimpLogo = 'https://raw.githubusercontent.com/alpawashere/disro-web-fx/main/assets/home-logos/mailchimp.png';

    var AGENTS = [
      {
        name: 'Paid Media Agent',
        photo: rawAgentBase + 'model-1.jpg',
        tools: [imgIcon(metaLogo, { bg: '#0077f2' }), imgIcon(gaLogo), imgIcon(cdn + '6a29a1e8d81664328c832405_dorg-icon-pinterest.svg')]
      },
      {
        name: 'Creative Agent',
        photo: rawAgentBase + 'model-2.jpg',
        tools: [imgIcon(webflowLogo, { bg: '#191919' }), imgIcon(notionLogo), imgIcon(asanaLogo)]
      },
      {
        name: 'Search Ads Agent',
        photo: rawAgentBase + 'model-3.jpg',
        tools: searchTools
      },
      {
        name: 'Content & SEO Agent',
        photo: rawAgentBase + 'model-4.jpg',
        tools: [imgIcon(docsLogo), imgIcon(webflowLogo, { bg: '#191919' }), imgIcon(cdn + '6a29d721a2d0ed6fb4bf4a2d_dcx-bars.svg')]
      },
      {
        name: 'Lifecycle Agent',
        photo: rawAgentBase + 'model-5.jpg',
        tools: [imgIcon(klaviyoLogo, { bg: '#1a1a1a' }), imgIcon(mailchimpLogo, { bg: '#000', imgCls: 'agx-tool-wide' }), imgIcon(shopifyLogo, { bg: '#95bf47' })]
      },
      {
        name: 'Reporting Agent',
        photo: rawAgentBase + 'model-6.jpg',
        tools: [imgIcon(cdn + '6a29d721a2d0ed6fb4bf4a2d_dcx-bars.svg'), imgIcon(docsLogo), imgIcon(notionLogo)]
      },
      {
        name: 'Account Support Agent',
        photo: rawAgentBase + 'model-7.jpg',
        tools: [imgIcon(asanaLogo), imgIcon(notionLogo), imgIcon(klaviyoLogo, { bg: '#1a1a1a' })]
      },
      {
        name: 'QA Agent',
        photo: rawAgentBase + 'model-8.jpg',
        tools: [
          svgIcon('<svg viewBox="0 0 24 24" fill="none" stroke="#0E5241" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>'),
          imgIcon(docsLogo),
          imgIcon(asanaLogo)
        ]
      }
    ];

    function toolHTML(tool) {
      if (typeof tool === 'string') return tool;
      var style = tool.bg ? ' style="background-color:' + tool.bg + '"' : '';
      return '<div class="ag-heroimg-tool ' + (tool.cls || '') + '"' + style + '><div class="ag-heroimg-tool-icon">' + tool.html + '</div></div>';
    }

    function setMeta(agentIndex, instant) {
      var agent = AGENTS[(agentIndex + AGENTS.length) % AGENTS.length];
      if (!agent || !agent.tools) return;
      tools.innerHTML = agent.tools.map(toolHTML).join('');
      label.textContent = agent.name;
      meta.style.transition = instant ? 'none' : 'opacity 180ms ease, transform 260ms cubic-bezier(.22,1,.36,1)';
      if (!instant) {
        meta.style.opacity = '0';
        meta.style.transform = 'translateX(-50%) translateY(4px)';
        requestAnimationFrame(function () {
          meta.style.opacity = '1';
          meta.style.transform = 'translateX(-50%) translateY(0)';
        });
      }
    }

    function setCardAgent(card, agentIndex) {
      var agent = AGENTS[(agentIndex + AGENTS.length) % AGENTS.length];
      var photo = card.querySelector('.ag-heroimg-photo');
      if (!photo || !agent) return;
      photo.style.backgroundImage = 'url("' + agent.photo + '")';
      photo.style.backgroundPosition = '50%';
      photo.style.backgroundRepeat = 'no-repeat';
      photo.style.backgroundSize = 'cover';
      card.setAttribute('aria-label', agent.name);
    }

    var style = document.createElement('style');
    style.textContent =
      '.ag-heroimg-illustration{overflow:hidden!important;}' +
      '.agx-layer{position:absolute;inset:0;pointer-events:none;z-index:2;}' +
      '.agx-card{position:absolute;will-change:left,top,transform;}' +
      '.agx-card .ag-heroimg-meta{display:none!important;}' +
      '.agx-meta{position:absolute!important;pointer-events:none;z-index:4;}' +
      '.agx-tool-img{display:block;width:68%;height:68%;object-fit:contain;}' +
      '.agx-tool-wide{width:78%;height:56%;}' +
      '.agx-meta.ag-heroimg-meta{will-change:opacity,transform;}' +
      '@media (max-width:767px){.agx-tool-img{width:70%;height:70%;}.agx-tool-wide{width:80%;height:58%;}}';
    document.head.appendChild(style);

    function measureSlots() {
      var hr = host.getBoundingClientRect();
      return cards.map(function (card, i) {
        var r = card.getBoundingClientRect();
        return {
          x: r.left - hr.left + r.width / 2,
          y: r.top - hr.top,
          z: 20 - Math.abs(i - 2),
          opacity: i === 0 || i === 4 ? 0.72 : 1
        };
      });
    }

    function measureMeta() {
      var hr = host.getBoundingClientRect();
      var mr = sourceMeta.getBoundingClientRect();
      return {
        x: mr.left - hr.left + mr.width / 2,
        y: mr.top - hr.top,
        w: mr.width
      };
    }

    var metaSlot = measureMeta();
    var metaClone = meta.cloneNode(true);
    metaClone.classList.add('agx-meta');
    host.appendChild(metaClone);
    meta = metaClone;
    tools = meta.querySelector('.ag-heroimg-tools');
    label = meta.querySelector('.ag-heroimg-label');

    var slots = measureSlots();
    var layer = document.createElement('div');
    layer.className = 'agx-layer';
    host.appendChild(layer);

    var nodes = [];
    var firstAgent = 0;
    for (var i = 0; i < cards.length; i++) {
      var clone = cards[i].cloneNode(true);
      clone.classList.add('agx-card');
      clone.classList.toggle('ag-heroimg-card-featured', i === 2);
      var p = clone.querySelector('.ag-heroimg-photo');
      if (p) {
        p.className = i === 2 ? 'ag-heroimg-photo ag-heroimg-photo-featured' : 'ag-heroimg-photo';
      }
      clone._slotIndex = i;
      clone._agentIndex = firstAgent + i;
      clone._x = slots[i].x;
      clone._y = slots[i].y;
      clone._vx = 0;
      clone._vy = 0;
      setCardAgent(clone, clone._agentIndex);
      layer.appendChild(clone);
      nodes.push(clone);
    }

    row.style.visibility = 'hidden';
    row.style.pointerEvents = 'none';

    function applyNode(node) {
      var slot = slots[node._slotIndex];
      if (!slot) return;
      node.style.left = node._x + 'px';
      node.style.top = node._y + 'px';
      node.style.zIndex = String(slot.z);
      node.style.opacity = String(slot.opacity);
      node.style.transform = 'translateX(-50%)';
      node.classList.toggle('ag-heroimg-card-featured', node._slotIndex === 2);
      var photo = node.querySelector('.ag-heroimg-photo');
      if (photo) {
        photo.className = node._slotIndex === 2 ? 'ag-heroimg-photo ag-heroimg-photo-featured' : 'ag-heroimg-photo';
      }
    }

    function snapAll() {
      slots = measureSlots();
      metaSlot = measureMeta();
      meta.style.left = metaSlot.x + 'px';
      meta.style.top = metaSlot.y + 'px';
      meta.style.width = metaSlot.w + 'px';
      meta.style.transform = 'translateX(-50%)';
      for (var i = 0; i < nodes.length; i++) {
        var slot = slots[nodes[i]._slotIndex];
        nodes[i]._x = slot.x;
        nodes[i]._y = slot.y;
        nodes[i]._vx = 0;
        nodes[i]._vy = 0;
        applyNode(nodes[i]);
      }
      var center = nodes.filter(function (n) { return n._slotIndex === 2; })[0];
      if (center) setMeta(center._agentIndex, true);
    }

    snapAll();

    var moving = false;
    var timer = null;
    var nextAgent = firstAgent + cards.length;

    function animateToTargets(done) {
      moving = true;
      var last = performance.now();
      function frame(now) {
        var dt = Math.min((now - last) / 1000, 0.05);
        last = now;
        var settled = true;
        for (var i = 0; i < nodes.length; i++) {
          var n = nodes[i];
          var s = slots[n._slotIndex];
          if (!s) continue;
          var ax = K * (s.x - n._x) - C * n._vx;
          var ay = K * (s.y - n._y) - C * n._vy;
          n._vx += ax * dt;
          n._vy += ay * dt;
          n._x += n._vx * dt;
          n._y += n._vy * dt;
          applyNode(n);
          if (Math.abs(s.x - n._x) > 0.3 || Math.abs(s.y - n._y) > 0.3 || Math.abs(n._vx) > 6 || Math.abs(n._vy) > 6) settled = false;
        }
        if (!settled) {
          requestAnimationFrame(frame);
          return;
        }
        for (var j = 0; j < nodes.length; j++) {
          var sn = slots[nodes[j]._slotIndex];
          nodes[j]._x = sn.x;
          nodes[j]._y = sn.y;
          nodes[j]._vx = 0;
          nodes[j]._vy = 0;
          applyNode(nodes[j]);
        }
        moving = false;
        done();
      }
      requestAnimationFrame(frame);
    }

    function step() {
      if (moving || !slots.length) return;
      var recycler = null;
      for (var i = 0; i < nodes.length; i++) {
        if (nodes[i]._slotIndex === slots.length - 1) recycler = nodes[i];
      }
      for (var j = 0; j < nodes.length; j++) {
        nodes[j]._slotIndex += 1;
      }
      if (recycler) {
        recycler._slotIndex = 0;
        recycler._agentIndex = nextAgent++;
        setCardAgent(recycler, recycler._agentIndex);
        var s0 = slots[0];
        recycler._x = s0.x - (slots[1].x - slots[0].x);
        recycler._y = s0.y;
        recycler._vx = 0;
        recycler._vy = 0;
        applyNode(recycler);
      }
      animateToTargets(function () {
        var center = nodes.filter(function (n) { return n._slotIndex === 2; })[0];
        if (center) setMeta(center._agentIndex, false);
      });
    }

    function start() {
      if (REDUCED || timer) return;
      timer = setInterval(step, DWELL);
    }

    function stop() {
      if (!timer) return;
      clearInterval(timer);
      timer = null;
    }

    var lastW = window.innerWidth;
    window.addEventListener('resize', function () {
      if (window.innerWidth === lastW) return;
      lastW = window.innerWidth;
      snapAll();
    });
    window.addEventListener('load', snapAll);

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        for (var i = 0; i < entries.length; i++) {
          if (!entries[i].isIntersecting) stop();
          else if (entries[i].intersectionRatio >= 0.25) start();
        }
      }, { threshold: [0, 0.25] }).observe(host);
    } else {
      start();
    }
  });
})();
