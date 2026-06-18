/* task-management-fx.js - Task Management hero handoff loop. */
(function () {
  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  ready(function () {
    var host = document.querySelector('.tm-heroimg-illustration');
    if (!host || host.getAttribute('data-tm-fx') === 'true') return;
    host.setAttribute('data-tm-fx', 'true');

    var leftCards = Array.prototype.slice.call(host.querySelectorAll('.tm-heroimg-col-left .tm-heroimg-card'));
    var rightCards = Array.prototype.slice.call(host.querySelectorAll('.tm-heroimg-col-right .tm-heroimg-card'));
    var center = host.querySelector('.tm-heroimg-center');
    var lineLeft = host.querySelector('.tm-heroimg-lines-left');
    var lineRight = host.querySelector('.tm-heroimg-lines-right');
    if (!leftCards.length || !rightCards.length || !center) return;

    function num(v, d) {
      v = parseFloat(v);
      return isFinite(v) ? v : d;
    }

    var cfg = host.dataset || {};
    var DWELL = num(cfg.tmDwell, 1900);
    var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var style = document.createElement('style');
    style.textContent =
      '.tm-heroimg-illustration{position:relative;isolation:isolate;}' +
      '.tm-heroimg-card,.tm-heroimg-center,.tm-heroimg-lines-left,.tm-heroimg-lines-right{transition:transform 620ms cubic-bezier(.22,1,.36,1),opacity 260ms ease,filter 620ms cubic-bezier(.22,1,.36,1),box-shadow 620ms cubic-bezier(.22,1,.36,1);will-change:transform,opacity,filter;}' +
      '.tm-heroimg-card.tmfx-active{filter:saturate(1.05);box-shadow:0 14px 34px rgba(14,82,65,.13);}' +
      '.tm-heroimg-col-left .tm-heroimg-card.tmfx-active{transform:translateX(12px) scale(1.018);}' +
      '.tm-heroimg-col-right .tm-heroimg-card.tmfx-active{transform:translateX(-12px) scale(1.018);}' +
      '.tm-heroimg-card.tmfx-dim{opacity:.62;}' +
      '.tm-heroimg-center.tmfx-active{transform:scale(1.028);filter:drop-shadow(0 16px 34px rgba(14,82,65,.15));}' +
      '.tm-heroimg-lines-left.tmfx-active,.tm-heroimg-lines-right.tmfx-active{opacity:1;filter:saturate(1.25);}' +
      '.tmfx-packet{position:absolute;left:0;top:0;width:10px;height:10px;border-radius:999px;background:#0E5241;box-shadow:0 0 0 7px rgba(14,82,65,.12),0 8px 18px rgba(14,82,65,.24);pointer-events:none;z-index:10;opacity:0;transform:translate(-50%,-50%) scale(.72);}' +
      '.tmfx-packet.tmfx-run{animation:tmfx-route 980ms cubic-bezier(.22,1,.36,1) forwards;}' +
      '@keyframes tmfx-route{0%{opacity:0;transform:translate(-50%,-50%) scale(.72);}12%{opacity:1;}54%{transform:translate(calc(var(--tmfx-mid-x) - 50%),calc(var(--tmfx-mid-y) - 50%)) scale(1);}100%{opacity:0;transform:translate(calc(var(--tmfx-end-x) - 50%),calc(var(--tmfx-end-y) - 50%)) scale(.82);}}' +
      '@media (max-width:767px){.tm-heroimg-col-left .tm-heroimg-card.tmfx-active,.tm-heroimg-col-right .tm-heroimg-card.tmfx-active{transform:translateY(-4px) scale(1.012);}.tmfx-packet{display:none;}}';
    document.head.appendChild(style);

    var packet = document.createElement('div');
    packet.className = 'tmfx-packet';
    host.appendChild(packet);

    function pointFor(el, side) {
      var hr = host.getBoundingClientRect();
      var r = el.getBoundingClientRect();
      return {
        x: (side === 'right' ? r.right : side === 'center' ? r.left + r.width / 2 : r.left) - hr.left,
        y: r.top + r.height / 2 - hr.top
      };
    }

    function setActive(index) {
      var count = Math.min(leftCards.length, rightCards.length);
      var active = index % count;

      for (var i = 0; i < leftCards.length; i++) {
        leftCards[i].classList.toggle('tmfx-active', i === active);
        leftCards[i].classList.toggle('tmfx-dim', i !== active);
      }
      for (var j = 0; j < rightCards.length; j++) {
        rightCards[j].classList.toggle('tmfx-active', j === active);
        rightCards[j].classList.toggle('tmfx-dim', j !== active);
      }

      center.classList.add('tmfx-active');
      if (lineLeft) lineLeft.classList.add('tmfx-active');
      if (lineRight) lineRight.classList.add('tmfx-active');

      if (!REDUCED) runPacket(leftCards[active], rightCards[active]);

      window.setTimeout(function () {
        center.classList.remove('tmfx-active');
        if (lineLeft) lineLeft.classList.remove('tmfx-active');
        if (lineRight) lineRight.classList.remove('tmfx-active');
      }, 720);
    }

    function runPacket(fromEl, toEl) {
      var start = pointFor(fromEl, 'right');
      var mid = pointFor(center, 'center');
      var end = pointFor(toEl, 'left');
      packet.classList.remove('tmfx-run');
      packet.style.left = start.x + 'px';
      packet.style.top = start.y + 'px';
      packet.style.setProperty('--tmfx-mid-x', Math.round(mid.x - start.x) + 'px');
      packet.style.setProperty('--tmfx-mid-y', Math.round(mid.y - start.y) + 'px');
      packet.style.setProperty('--tmfx-end-x', Math.round(end.x - start.x) + 'px');
      packet.style.setProperty('--tmfx-end-y', Math.round(end.y - start.y) + 'px');
      packet.offsetHeight;
      packet.classList.add('tmfx-run');
    }

    var index = 0;
    setActive(index);
    if (REDUCED) return;

    window.setInterval(function () {
      index += 1;
      setActive(index);
    }, DWELL);
  });
})();
