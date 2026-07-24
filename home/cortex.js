/* Ask Cortex v2 — self-contained chat animation for the Home page.
   Mounts into the existing Webflow .dcx host, so the Home footer loader and
   section structure do not need to change. */
(function () {
  'use strict';

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    var host = document.querySelector('[data-ask-cortex], .askc-host, .dcx');
    if (!host || host.getAttribute('data-askc-ready') === 'true') return;
    host.setAttribute('data-askc-ready', 'true');

    var style = document.createElement('style');
    style.setAttribute('data-askc-styles', '');
    style.textContent = [
      '.askc-wrap{--askc-bg:#f5f6f5;--askc-surface:#fff;--askc-border:#eaebea;--askc-divider:#f1f1ef;--askc-subtle:#f7f7f5;--askc-hover:#f3f3f1;--askc-input:#c8c9c8;--askc-primary:#122219;--askc-secondary:#484948;--askc-muted:#8a8d8b;--askc-accent:#0e5241;--askc-button:#080908;--askc-button-fg:#fff;--askc-success-bg:#ecf3f1;--askc-success:#0e5241;max-width:760px;margin:0 auto;font-family:Geist,Arial,sans-serif;color:var(--askc-primary);box-sizing:border-box}',
      '.askc-wrap *{box-sizing:border-box}.askc-wrap button{font:inherit}.askc-frame{position:relative;overflow:visible;border:1px solid var(--askc-border);border-radius:8px;background:var(--askc-surface);box-shadow:0 8px 28px rgba(8,9,8,.1)}',
      '.askc-top{display:flex;align-items:center;gap:12px;height:56px;padding:0 24px;border-bottom:1px solid var(--askc-border)}.askc-top-title{display:flex;align-items:center;gap:9px;min-width:0;flex:1}.askc-chip{display:grid;place-items:center;width:22px;height:22px;flex:none;border:1px solid var(--askc-divider);border-radius:6px;background:var(--askc-subtle);font-size:10px;font-weight:700;color:var(--askc-secondary)}',
      '.askc-title-copy{min-width:0}.askc-title-copy h3{margin:0;overflow:hidden;font-size:14px;font-weight:600;line-height:1.2;text-overflow:ellipsis;white-space:nowrap}.askc-title-copy span{display:block;margin-top:2px;overflow:hidden;font-size:11px;line-height:1.2;color:var(--askc-secondary);text-overflow:ellipsis;white-space:nowrap}',
      '.askc-participants{display:flex;align-items:center;gap:6px;height:34px;padding:0 8px;border:1px solid var(--askc-input);border-radius:6px;background:#fff;color:var(--askc-secondary);cursor:pointer}.askc-participants:hover{background:var(--askc-bg)}.askc-pstack{display:flex}.askc-avatar{display:grid;place-items:center;width:20px;height:20px;margin-left:-6px;border:1.5px solid #fff;border-radius:50%;background:#e8eae8;font-size:8px;font-weight:700;color:#506057}.askc-avatar:first-child{margin-left:0}.askc-pcount{font-size:11px;font-weight:600}',
      '.askc-transcript{display:flex;min-height:314px;padding:24px;flex-direction:column;gap:20px}.askc-msg{display:flex;align-items:flex-start;gap:9px;opacity:0;transform:translateY(7px);transition:opacity .35s ease,transform .35s ease}.askc-msg.in{opacity:1;transform:none}.askc-msg.user{justify-content:flex-end}.askc-mav{display:grid;place-items:center;width:24px;height:24px;flex:none;border-radius:50%;background:#e5e8e6;font-size:9px;font-weight:700;color:#506057}.askc-mav.agent{background:#122219;color:#fff}.askc-mcontent{display:flex;max-width:88%;flex-direction:column;gap:10px}.askc-mcontent.user{align-items:flex-end}',
      '.askc-bubble{width:fit-content;max-width:100%;padding:9px 11px;border-radius:7px;font-size:12px;line-height:1.45}.askc-bubble.user{background:#122219;color:#fff}.askc-bubble.agent{border:1px solid var(--askc-border);background:var(--askc-subtle);color:var(--askc-primary)}',
      '.askc-typing{display:inline-flex;align-items:center;gap:4px}.askc-typing span{width:5px;height:5px;border-radius:50%;background:var(--askc-muted);animation:askc-bounce 1.1s ease-in-out infinite}.askc-typing span:nth-child(2){animation-delay:.15s}.askc-typing span:nth-child(3){animation-delay:.3s}@keyframes askc-bounce{0%,60%,100%{opacity:.35;transform:translateY(0)}30%{opacity:1;transform:translateY(-2px)}}',
      '.askc-tools{display:flex;flex-direction:column;gap:5px;opacity:0;transition:opacity .3s ease}.askc-tools.in{opacity:1}.askc-toolline{display:flex;align-items:center;gap:7px;font-size:10px;color:var(--askc-muted)}.askc-toolline i{width:5px;height:5px;border-radius:50%;background:var(--askc-accent)}',
      '.askc-card{width:100%;overflow:hidden;border:1px solid var(--askc-border);border-radius:7px;background:#fff;opacity:0;transform:translateY(8px);transition:opacity .4s ease,transform .4s ease}.askc-card.in{opacity:1;transform:none}.askc-card-head{display:flex;align-items:baseline;gap:8px;height:38px;padding:0 12px;border-bottom:1px solid var(--askc-divider)}.askc-card-title{font-size:13px;font-weight:600}.askc-card-sub{font-size:10px;color:var(--askc-muted)}',
      '.askc-card-body{display:flex;padding:14px;flex-direction:column;gap:14px}.askc-metrics{display:flex;flex-wrap:wrap;row-gap:12px}.askc-metric{display:flex;min-width:88px;padding-right:16px;flex:1 1 0;flex-direction:column;gap:4px}.askc-metric+.askc-metric{padding-left:16px;border-left:1px solid var(--askc-divider)}.askc-mlabel{font-size:9px;font-weight:600;letter-spacing:.05em;text-transform:uppercase;color:var(--askc-muted)}.askc-mnum{display:flex;align-items:baseline;gap:6px;font-size:17px;font-weight:700;font-variant-numeric:tabular-nums}.askc-delta{font-size:10px;font-weight:600;color:var(--askc-accent)}',
      '.askc-table-wrap{overflow-x:auto}.askc-table{width:100%;border-collapse:collapse}.askc-table th{padding:0 8px 5px;font-size:9px;font-weight:600;letter-spacing:.05em;text-align:left;text-transform:uppercase;color:var(--askc-muted)}.askc-table td{padding:6px 8px;border-top:1px solid var(--askc-divider);font-size:11px;color:var(--askc-secondary)}.askc-table .r{text-align:right}.askc-table td.r{font-weight:500;color:var(--askc-primary)}',
      '.askc-composer-dock{position:relative;z-index:5;padding:12px 24px 20px;border-top:1px solid var(--askc-border)}.askc-composer{position:relative;padding:8px;border:1px solid var(--askc-border);border-radius:7px;background:#fff}.askc-input{min-height:38px;padding:8px;font-size:13px;line-height:22px}.askc-input:empty:before{content:attr(data-placeholder);color:var(--askc-muted)}.askc-caret{display:inline-block;width:1px;height:15px;background:var(--askc-primary);vertical-align:-3px;animation:askc-caret .9s step-end infinite}@keyframes askc-caret{50%{opacity:0}}',
      '.askc-composer-row{display:flex;align-items:center;gap:8px;margin-top:4px}.askc-icon-btn,.askc-send{display:grid;place-items:center;width:38px;height:38px;flex:none;border:0;background:transparent;color:var(--askc-secondary);cursor:pointer}.askc-icon-btn{border-radius:50%}.askc-icon-btn:hover{background:var(--askc-bg)}.askc-icon-btn svg,.askc-send svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:1.7}.askc-actions{display:flex;align-items:center;gap:5px;margin-left:auto}.askc-model{display:flex;align-items:center;gap:6px;height:34px;padding:0 11px;border:0;border-radius:8px;background:transparent;font-size:12px;font-weight:500;color:var(--askc-secondary);cursor:pointer}.askc-model:hover,.askc-model.active{background:var(--askc-bg);color:var(--askc-primary)}.askc-model svg{width:13px;height:13px;fill:none;stroke:currentColor;stroke-width:1.7}.askc-send{border-radius:6px;background:var(--askc-button);color:var(--askc-button-fg)}',
      '.askc-model-pop{position:absolute;right:0;bottom:calc(100% + 12px);z-index:20;display:none;width:300px;padding:6px;border:1px solid var(--askc-border);border-radius:7px;background:#fff;box-shadow:0 10px 34px rgba(8,9,8,.16)}.askc-model-pop.open{display:block}.askc-model-row{display:flex;width:100%;align-items:flex-start;justify-content:space-between;gap:10px;padding:8px 10px;border:0;border-radius:5px;background:transparent;text-align:left;color:var(--askc-primary);cursor:pointer}.askc-model-row:hover{background:var(--askc-bg)}.askc-model-copy span{display:block;font-size:12px;font-weight:500}.askc-model-copy small{display:block;margin-top:2px;font-size:10px;color:var(--askc-secondary)}.askc-check{width:15px;color:var(--askc-primary)}',
      '.askc-route{display:flex;align-items:center;justify-content:center;gap:9px;margin-top:16px;flex-wrap:wrap;font-size:12px;text-align:center;color:var(--askc-secondary)}.askc-route-chip{display:inline-flex;align-items:center;gap:6px;height:22px;padding:0 9px;border-radius:5px;background:var(--askc-success-bg);font-size:10px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--askc-success)}.askc-route-chip i{width:5px;height:5px;border-radius:50%;background:currentColor}',
      '@media(max-width:767px){.askc-wrap{width:100%}.askc-top{padding:0 14px}.askc-transcript{min-height:300px;padding:16px 14px;gap:16px}.askc-composer-dock{padding:10px 14px 14px}.askc-card-head{height:auto;min-height:38px;align-items:flex-start;padding-top:8px;padding-bottom:8px;flex-direction:column;gap:1px}.askc-metric{flex:1 1 42%;padding-right:8px}.askc-metric+.askc-metric{padding-left:0;border-left:0}.askc-table{min-width:340px}.askc-model-pop{right:-1px;width:min(300px,calc(100vw - 48px))}.askc-route{padding:0 12px;font-size:11px}}',
      '@media(max-width:420px){.askc-title-copy span{display:none}.askc-transcript{min-height:330px}.askc-mcontent{max-width:94%}.askc-card-body{padding:10px}.askc-model{padding:0 8px}.askc-icon-btn{width:34px;height:34px}.askc-send{width:36px;height:36px}}',
      '@media(prefers-reduced-motion:reduce){.askc-msg,.askc-tools,.askc-card,.askc-caret,.askc-typing span{transition:none!important;animation:none!important}}'
    ].join('');
    document.head.appendChild(style);

    host.innerHTML = [
      '<div class="askc-wrap">',
        '<div class="askc-frame">',
          '<div class="askc-top">',
            '<div class="askc-top-title"><span class="askc-chip">AD</span><div class="askc-title-copy"><h3>Ask Cortex anything</h3><span>With your Manager Agent</span></div></div>',
            '<button class="askc-participants" type="button" aria-label="Share this chat, 2 participants"><span class="askc-pstack" aria-hidden="true"><span class="askc-avatar">MA</span><span class="askc-avatar">YO</span></span><span class="askc-pcount">2</span></button>',
          '</div>',
          '<div class="askc-transcript" aria-live="polite"></div>',
          '<div class="askc-composer-dock"><div class="askc-composer">',
            '<div class="askc-input" data-placeholder="Ask anything…" aria-hidden="true"></div>',
            '<div class="askc-composer-row">',
              '<button class="askc-icon-btn" type="button" aria-label="Attach file"><svg viewBox="0 0 24 24"><path d="M5 12h14M12 5v14"/></svg></button>',
              '<div class="askc-actions">',
                '<button class="askc-model" type="button" aria-haspopup="menu" aria-expanded="false"><span>Auto</span><svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg></button>',
                '<button class="askc-icon-btn" type="button" aria-label="Record voice"><svg viewBox="0 0 24 24"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3"/></svg></button>',
                '<button class="askc-send" type="button" aria-label="Replay message"><svg viewBox="0 0 24 24"><path d="m5 12 7-7 7 7M12 19V5"/></svg></button>',
              '</div>',
            '</div>',
            '<div class="askc-model-pop" role="menu" aria-label="Model">',
              '<button class="askc-model-row" type="button" role="menuitemradio" aria-checked="true" data-model="Auto"><span class="askc-model-copy"><span>Auto</span><small>Best model for the task</small></span><span class="askc-check">✓</span></button>',
              '<button class="askc-model-row" type="button" role="menuitemradio" aria-checked="false" data-model="Fable 5"><span class="askc-model-copy"><span>Claude Fable 5</span><small>Most capable</small></span><span class="askc-check"></span></button>',
              '<button class="askc-model-row" type="button" role="menuitemradio" aria-checked="false" data-model="Opus 4.8"><span class="askc-model-copy"><span>Claude Opus 4.8</span><small>Deep reasoning</small></span><span class="askc-check"></span></button>',
              '<button class="askc-model-row" type="button" role="menuitemradio" aria-checked="false" data-model="Sonnet 4.5"><span class="askc-model-copy"><span>Claude Sonnet 4.5</span><small>Fast and balanced</small></span><span class="askc-check"></span></button>',
              '<button class="askc-model-row" type="button" role="menuitemradio" aria-checked="false" data-model="GPT-5.6"><span class="askc-model-copy"><span>GPT-5.6</span><small>OpenAI</small></span><span class="askc-check"></span></button>',
            '</div>',
          '</div></div>',
        '</div>',
        '<div class="askc-route"><span class="askc-route-chip"><i></i>Smart routing</span><span>On Auto, each question goes to the cheapest capable model. The pill shows exactly which one answered.</span></div>',
      '</div>'
    ].join('');

    var frame = host.querySelector('.askc-frame');
    var transcript = host.querySelector('.askc-transcript');
    var input = host.querySelector('.askc-input');
    var modelButton = host.querySelector('.askc-model');
    var modelLabel = modelButton.querySelector('span');
    var modelMenu = host.querySelector('.askc-model-pop');
    var sendButton = host.querySelector('.askc-send');
    var question = "What's Adidas paid social spend and ROAS this week?";
    var timers = [];
    var running = false;

    function later(fn, delay) {
      var id = window.setTimeout(fn, delay);
      timers.push(id);
      return id;
    }

    function clearTimers() {
      for (var i = 0; i < timers.length; i++) window.clearTimeout(timers[i]);
      timers = [];
    }

    function openMenu() {
      modelMenu.classList.add('open');
      modelButton.classList.add('active');
      modelButton.setAttribute('aria-expanded', 'true');
    }

    function closeMenu() {
      modelMenu.classList.remove('open');
      modelButton.classList.remove('active');
      modelButton.setAttribute('aria-expanded', 'false');
    }

    modelButton.addEventListener('click', function (event) {
      event.stopPropagation();
      if (modelMenu.classList.contains('open')) closeMenu();
      else openMenu();
    });

    var modelRows = modelMenu.querySelectorAll('.askc-model-row');
    for (var rowIndex = 0; rowIndex < modelRows.length; rowIndex++) {
      modelRows[rowIndex].addEventListener('click', function (event) {
        event.stopPropagation();
        for (var i = 0; i < modelRows.length; i++) {
          modelRows[i].setAttribute('aria-checked', 'false');
          modelRows[i].querySelector('.askc-check').textContent = '';
        }
        this.setAttribute('aria-checked', 'true');
        this.querySelector('.askc-check').textContent = '✓';
        modelLabel.textContent = this.getAttribute('data-model');
        closeMenu();
      });
    }

    document.addEventListener('click', function (event) {
      if (!host.contains(event.target)) closeMenu();
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeMenu();
    });

    function appendUser() {
      var row = document.createElement('div');
      row.className = 'askc-msg user';
      row.innerHTML = '<div class="askc-mcontent user"><div class="askc-bubble user"></div></div><span class="askc-mav">YO</span>';
      row.querySelector('.askc-bubble').textContent = question;
      transcript.appendChild(row);
      requestAnimationFrame(function () { row.classList.add('in'); });
      return row;
    }

    function appendTyping() {
      var row = document.createElement('div');
      row.className = 'askc-msg';
      row.innerHTML = '<span class="askc-mav agent">MA</span><div class="askc-mcontent"><div class="askc-bubble agent"><span class="askc-typing" aria-label="Cortex is answering"><span></span><span></span><span></span></span></div></div>';
      transcript.appendChild(row);
      requestAnimationFrame(function () { row.classList.add('in'); });
      return row;
    }

    function answerHTML() {
      return [
        '<div class="askc-tools"><span class="askc-toolline"><i></i>Queried GA4: paid social channel</span><span class="askc-toolline"><i></i>Queried Google Ads: campaign spend</span></div>',
        '<div class="askc-bubble agent">Paid social is pacing well. ROAS held at 3.2x on higher spend.</div>',
        '<div class="askc-card">',
          '<div class="askc-card-head"><span class="askc-card-title">Paid Social</span><span class="askc-card-sub">Server-derived · Adidas · last 7 days</span></div>',
          '<div class="askc-card-body">',
            '<div class="askc-metrics">',
              '<div class="askc-metric"><span class="askc-mlabel">Sessions</span><span class="askc-mnum">19,100 <span class="askc-delta">+34%</span></span></div>',
              '<div class="askc-metric"><span class="askc-mlabel">Spend</span><span class="askc-mnum">$8,240</span></div>',
              '<div class="askc-metric"><span class="askc-mlabel">ROAS</span><span class="askc-mnum">3.2x</span></div>',
            '</div>',
            '<div class="askc-table-wrap"><table class="askc-table"><thead><tr><th>Campaign</th><th class="r">Sessions</th><th class="r">Spend</th></tr></thead><tbody>',
              '<tr><td>Holiday (Retarget)</td><td class="r">8,400</td><td class="r">$3,120</td></tr>',
              '<tr><td>Holiday (Prospecting)</td><td class="r">6,900</td><td class="r">$3,600</td></tr>',
              '<tr><td>Evergreen (Catalog)</td><td class="r">3,800</td><td class="r">$1,520</td></tr>',
            '</tbody></table></div>',
          '</div>',
        '</div>'
      ].join('');
    }

    function reset() {
      clearTimers();
      transcript.innerHTML = '';
      input.textContent = '';
      closeMenu();
    }

    function typeQuestion(done) {
      var index = 0;
      function step() {
        if (!running) return;
        input.textContent = question.slice(0, index);
        if (index < question.length) {
          var caret = document.createElement('span');
          caret.className = 'askc-caret';
          input.appendChild(caret);
          index++;
          later(step, 22);
        } else if (done) done();
      }
      step();
    }

    function showAnswer(typingRow) {
      var content = typingRow.querySelector('.askc-mcontent');
      content.innerHTML = answerHTML();
      var tools = content.querySelector('.askc-tools');
      var card = content.querySelector('.askc-card');
      requestAnimationFrame(function () { tools.classList.add('in'); });
      later(function () { card.classList.add('in'); }, 260);
    }

    function renderReducedMotion() {
      reset();
      running = true;
      appendUser().classList.add('in');
      var answer = document.createElement('div');
      answer.className = 'askc-msg in';
      answer.innerHTML = '<span class="askc-mav agent">MA</span><div class="askc-mcontent">' + answerHTML() + '</div>';
      transcript.appendChild(answer);
      var reveal = answer.querySelectorAll('.askc-tools,.askc-card');
      for (var i = 0; i < reveal.length; i++) reveal[i].classList.add('in');
    }

    function play() {
      running = true;
      reset();
      running = true;
      typeQuestion(function () {
        later(function () {
          input.textContent = '';
          appendUser();
          var typing = appendTyping();
          later(function () { showAnswer(typing); }, 1200);
        }, 350);
      });
    }

    sendButton.addEventListener('click', function () {
      play();
    });

    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      renderReducedMotion();
      return;
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        for (var i = 0; i < entries.length; i++) {
          var entry = entries[i];
          if (entry.isIntersecting && entry.intersectionRatio >= 0.35 && !running) play();
          else if (!entry.isIntersecting) {
            running = false;
            clearTimers();
          }
        }
      }, { threshold: [0, 0.35] }).observe(frame);
    } else {
      play();
    }
  });
})();
