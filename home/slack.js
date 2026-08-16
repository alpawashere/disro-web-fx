/* home/slack.js — Slack section conversation loop.

   v2: the choreography is DECLARATIVE. Timing lives on the markup, not in here,
   so changing the conversation in Webflow no longer requires editing this file.
   Nothing is addressed by index and every lookup is guarded, so adding,
   removing or reordering messages can no longer throw.

   ── Markup contract (every attribute is optional) ─────────────────────────

   .dslk                       section root
       data-dslk-hold="9000"   ms to hold the finished state before replaying

   .dslk-chat  > .dslk-msgs    left panel  (external / client channel)
   .dslk-chat2 > .dslk-msgs2   right panel (internal / team channel)

   Any element inside a message list carrying data-dslk-order joins the
   sequence. A direct child of the list is a MESSAGE (slides up and scrolls
   the thread); anything nested deeper is a DETAIL (pops in place — use it
   for file cards, reaction pills, buttons, confirmation rows).

   A direct child WITHOUT data-dslk-order is simply visible from the start.

   v2.1: every reveal is a fade-up by default; the pop is opt-in via data-dslk-pop.
   v2.2: replacement steps (data-dslk-hides) stay out of the flow until they land.
   v2.3: light mode. The typing bubble is repainted for the light Slack UI and is
         offset above the home indicator now that each panel sits in an iPhone frame.

       data-dslk-order="3"     position in the reveal sequence (required to animate)
       data-dslk-delay="800"   ms to wait before this element appears
       data-dslk-typing="850"  show the typing bubble in that panel for N ms
                               immediately before this element appears
       data-dslk-pop           opt in to the pop/scale reveal (bouncy). Without it
                               everything reveals with the same fade-up as messages.
       data-dslk-hides="cls"   on reveal, hide the element with that class inside
                               the same message — lets one step replace another
                               (e.g. an approved state replacing its buttons).
                               The element carrying this sits at display:none until
                               its turn, so it reserves no space beforehand.

   ─────────────────────────────────────────────────────────────────────────── */
(function () {
  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var MOBILE = window.matchMedia && window.matchMedia('(max-width: 767px)').matches;

  function ready(f) {
    if (document.readyState !== 'loading') f();
    else document.addEventListener('DOMContentLoaded', f);
  }

  ready(function () {
    var root = document.querySelector('.dslk');
    if (!root) return;

    var panels = [
      { card: document.querySelector('.dslk-chat'),  list: document.querySelector('.dslk-msgs')  },
      { card: document.querySelector('.dslk-chat2'), list: document.querySelector('.dslk-msgs2') }
    ].filter(function (p) { return p.card && p.list; });
    if (!panels.length) return;

    function num(v, d) { v = parseFloat(v); return isFinite(v) ? v : d; }

    var SPEED = MOBILE ? 0.7 : 1;
    var HOLD = num((root.dataset || {}).dslkHold, 4000);
    if (MOBILE) HOLD = Math.min(HOLD, 6000);

    /* ---------- injected styles: typing bubble + pop keyframes ---------- */
    var st = document.createElement('style');
    st.textContent =
      '@keyframes dslkPop{0%{transform:scale(0)}70%{transform:scale(1.18)}100%{transform:scale(1)}}' +
      '@keyframes dslkDot{0%,60%,100%{transform:translateY(0);opacity:.4}30%{transform:translateY(-3px);opacity:1}}' +
      '.dslk-typing{position:absolute;left:16px;display:flex;gap:4px;align-items:center;background:#fff;' +
        'border:0.89px solid #e2e2e2;border-radius:9.38px;padding:6px 9px;opacity:0;' +
        'box-shadow:0 2px 6px 0 rgba(29,31,35,.06);' +
        'transition:opacity .25s ease;z-index:3;pointer-events:none}' +
      '.dslk-typing-on{opacity:1}' +
      '.dslk-tdot{width:5px;height:5px;border-radius:50%;background:#8b8e90;animation:dslkDot 1.1s infinite}' +
      '.dslk-td2{animation-delay:.15s}.dslk-td3{animation-delay:.3s}';
    document.head.appendChild(st);

    /* ---------- panel setup ---------- */
    panels.forEach(function (P) {
      P.card.style.position = 'relative';

      var comp = P.card.querySelector('.dslk-comp');
      if (comp) { comp.style.position = 'relative'; comp.style.zIndex = '2'; }

      var typing = document.createElement('div');
      typing.className = 'dslk-typing';
      typing.innerHTML =
        '<div class="dslk-tdot"></div>' +
        '<div class="dslk-tdot dslk-td2"></div>' +
        '<div class="dslk-tdot dslk-td3"></div>';
      /* the panel is an iPhone screen now: the composer is no longer the last
         thing in the card, the home indicator sits under it. */
      var home = P.card.querySelector('.dslk-home');
      typing.style.bottom =
        ((comp ? comp.offsetHeight : 60) + (home ? home.offsetHeight : 0) + 10) + 'px';
      P.card.appendChild(typing);

      P.typing = typing;
      P.units  = [].slice.call(P.list.children);
      P.gap    = parseFloat(getComputedStyle(P.list).rowGap) || 12.47;
      P.h      = [];
    });

    /* ---------- build the timeline from the markup ---------- */
    var timeline = [];

    panels.forEach(function (P) {
      [].slice.call(P.list.querySelectorAll('[data-dslk-order]')).forEach(function (el) {
        var d = el.dataset || {};
        var i = P.units.indexOf(el);          /* -1 when nested deeper than a direct child */
        timeline.push({
          P: P,
          el: el,
          i: i,
          isMessage: i !== -1,
          order:  num(d.dslkOrder, 0),
          delay:  num(d.dslkDelay, 800) * SPEED,
          typing: num(d.dslkTyping, 0) * SPEED,
          pop:    d.dslkPop !== undefined,
          hides:  d.dslkHides || ''
        });
      });
    });

    timeline.sort(function (a, b) { return a.order - b.order; });

    /* every element the timeline controls, for the reset pass */
    var controlled = timeline.map(function (s) { return s.el; });

    function measure(P) {
      P.h = P.units.map(function (u) { return u.offsetHeight + P.gap; });
    }

    /* how far the list must sit pushed down so everything after k stays hidden */
    function suffix(P, k) {
      var d = 0;
      for (var i = k + 1; i < P.units.length; i++) d += P.h[i];
      return d;
    }

    /* highest message index that is visible at rest */
    function restIndex(P) {
      var last = -1;
      P.units.forEach(function (u, i) { if (controlled.indexOf(u) === -1) last = i; });
      return last;
    }

    function typingOn(P)  { if (P.typing) P.typing.classList.add('dslk-typing-on'); }
    function typingOff(P) { if (P.typing) P.typing.classList.remove('dslk-typing-on'); }

    function reset() {
      /* Elements that REPLACE another one start out of the flow entirely, not just
         invisible — otherwise they reserve their height and leave a hole under the
         thing they are meant to replace. Done before measuring, so the heights the
         scroll maths uses match the pose the panel actually starts in. */
      timeline.forEach(function (s) {
        if (!s.hides) return;
        var host = s.el.closest ? s.el.closest('.dslk-msg') : null;
        var tgt = (host || document).querySelector('.' + s.hides);
        if (tgt) { tgt.style.display = ''; }
        s.el.style.display = 'none';
      });

      panels.forEach(function (P) {
        P.list.style.transition = 'none';
        measure(P);
        P.list.style.transform = 'translate3d(0,' + suffix(P, restIndex(P)) + 'px,0)';

        P.units.forEach(function (u) {
          u.style.transition = 'none';
          u.style.animation  = 'none';
          if (controlled.indexOf(u) === -1) {
            u.style.opacity = '1';
            u.style.transform = 'none';
          } else {
            u.style.opacity = '0';
            u.style.transform = 'translateY(10px)';
          }
        });

        typingOff(P);
      });

      /* nested details always start hidden, in the pose their reveal expects */
      timeline.forEach(function (s) {
        if (s.isMessage) return;
        s.el.style.transition = 'none';
        s.el.style.animation  = 'none';
        s.el.style.opacity    = '0';
        s.el.style.transform  = s.pop ? 'scale(.96)' : 'translateY(10px)';
      });

      if (panels[0]) void panels[0].card.offsetWidth;  /* flush so the next transitions animate */
    }

    function reveal(s) {
      if (s.hides) {
        var host = s.el.closest ? s.el.closest('.dslk-msg') : null;
        var tgt = (host || document).querySelector('.' + s.hides);
        if (tgt) { tgt.style.display = 'none'; }
        s.el.style.display = '';
        void s.el.offsetWidth;   /* flush the display change so the fade still animates */
      }
      if (s.isMessage) {
        s.P.list.style.transition = 'transform .55s cubic-bezier(.22,1,.36,1)';
        s.P.list.style.transform  = 'translate3d(0,' + suffix(s.P, s.i) + 'px,0)';
      }
      if (s.pop) {
        s.el.style.transition = 'opacity .3s ease, transform .35s cubic-bezier(.22,1,.36,1)';
        s.el.style.opacity    = '1';
        s.el.style.transform  = 'scale(1)';
        s.el.style.animation  = 'dslkPop .4s cubic-bezier(.22,1,.36,1) both';
      } else {
        s.el.style.transition = 'opacity .35s ease, transform .45s cubic-bezier(.22,1,.36,1)';
        s.el.style.opacity    = '1';
        s.el.style.transform  = 'translateY(0)';
      }
    }

    /* ---------- playback ---------- */
    var timer = null, running = false;

    function schedule(queue, k) {
      if (k >= queue.length) return;
      timer = setTimeout(function () {
        queue[k].fn();
        schedule(queue, k + 1);
      }, queue[k].wait);
    }

    function start() {
      if (running || !timeline.length) return;
      running = true;
      reset();

      var queue = [];

      timeline.forEach(function (s) {
        if (s.typing > 0) {
          queue.push({ wait: Math.max(0, s.delay - s.typing), fn: function () { typingOn(s.P); } });
          queue.push({ wait: s.typing, fn: function () { typingOff(s.P); reveal(s); } });
        } else {
          queue.push({ wait: s.delay, fn: function () { reveal(s); } });
        }
      });

      queue.push({ wait: HOLD, fn: function () {
        panels.forEach(function (P) {
          P.list.style.transition = 'opacity .35s ease';
          P.list.style.opacity = '0';
        });
      }});

      queue.push({ wait: 380, fn: function () {
        reset();
        panels.forEach(function (P) { P.list.style.opacity = '1'; });
        running = false;
        start();
      }});

      schedule(queue, 0);
    }

    function stop() { clearTimeout(timer); running = false; }

    /* ---------- reduced motion: render the finished state, skip the loop ---------- */
    if (REDUCED) {
      panels.forEach(function (P) {
        P.list.style.transform = 'none';
        P.units.forEach(function (u) { u.style.opacity = '1'; u.style.transform = 'none'; });
      });
      timeline.forEach(function (s) { s.el.style.opacity = '1'; s.el.style.transform = 'none'; });
      return;
    }

    if ('IntersectionObserver' in window) {
      var START_RATIO = MOBILE ? 0.1 : 0.3;
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          /* Mobile starts earlier because the phone mockups are tall relative to
             the viewport; stop ONLY when fully out so URL-bar resizes do not flap. */
          if (e.isIntersecting && e.intersectionRatio >= START_RATIO) {
            if (document.fonts && document.fonts.ready) document.fonts.ready.then(start);
            else start();
          } else if (!e.isIntersecting) {
            stop();
          }
        });
      }, { threshold: [0, START_RATIO] }).observe(root);
    } else {
      start();
    }
  });
})();
