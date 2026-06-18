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

    var style = document.createElement('style');
    style.textContent =
      '.tm-heroimg-illustration{position:relative;isolation:isolate;}' +
      '.tm-heroimg-card,.tm-heroimg-lines-left,.tm-heroimg-lines-right{transition:transform 620ms cubic-bezier(.22,1,.36,1),opacity 260ms ease,filter 620ms cubic-bezier(.22,1,.36,1),box-shadow 620ms cubic-bezier(.22,1,.36,1);will-change:transform,opacity,filter;}' +
      '.tm-heroimg-card.tmfx-active{filter:saturate(1.05);box-shadow:0 14px 34px rgba(14,82,65,.13);}' +
      '.tm-heroimg-col-left .tm-heroimg-card.tmfx-active{transform:translateX(12px) scale(1.018);}' +
      '.tm-heroimg-col-right .tm-heroimg-card.tmfx-active{transform:translateX(-12px) scale(1.018);}' +
      '.tm-heroimg-card.tmfx-dim{opacity:.62;}' +
      '.tm-heroimg-center{position:relative!important;z-index:8!important;}' +
      '.tm-heroimg-center.tmfx-active{transform:none!important;filter:none!important;}' +
      '.tm-heroimg-lines-left.tmfx-active,.tm-heroimg-lines-right.tmfx-active{opacity:1;filter:saturate(1.25);}' +
      '@media (max-width:767px){.tm-heroimg-col-left .tm-heroimg-card.tmfx-active,.tm-heroimg-col-right .tm-heroimg-card.tmfx-active{transform:translateY(-4px) scale(1.012);}}';
    document.head.appendChild(style);

    function randomTarget(lastTarget) {
      if (rightCards.length < 2) return 0;
      var next = Math.floor(Math.random() * rightCards.length);
      if (next === lastTarget) next = (next + 1 + Math.floor(Math.random() * (rightCards.length - 1))) % rightCards.length;
      return next;
    }

    function setActive(index) {
      var count = Math.min(leftCards.length, rightCards.length);
      var active = index % count;
      target = randomTarget(target);
      center.classList.remove('tmfx-active');

      for (var i = 0; i < leftCards.length; i++) {
        leftCards[i].classList.toggle('tmfx-active', i === active);
        leftCards[i].classList.toggle('tmfx-dim', i !== active);
      }
      for (var j = 0; j < rightCards.length; j++) {
        rightCards[j].classList.toggle('tmfx-active', j === target);
        rightCards[j].classList.toggle('tmfx-dim', j !== target);
      }

      if (lineLeft) lineLeft.classList.add('tmfx-active');
      if (lineRight) lineRight.classList.add('tmfx-active');

      window.setTimeout(function () {
        if (lineLeft) lineLeft.classList.remove('tmfx-active');
        if (lineRight) lineRight.classList.remove('tmfx-active');
      }, 980);
    }

    var index = 0;
    var target = -1;
    setActive(index);

    window.setInterval(function () {
      index += 1;
      setActive(index);
    }, DWELL);
  });
})();
