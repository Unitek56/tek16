/* ============================================================
   ROG BANK LINE 16 — main.js
   Vanilla JS only. No dependencies.
   01. Helpers
   02. Navigation
   03. Scroll reveal
   04. Hero particles + spotlight
   05. Product gallery
   06. Card spotlight
   07. System console simulation
   08. Inquiry form
   ============================================================ */

(function () {
  'use strict';

  /* ---------- 01. Helpers ---------- */
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  var clamp = function (v, min, max) { return Math.min(max, Math.max(min, v)); };
  var rand = function (min, max) { return min + Math.random() * (max - min); };

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var pad2 = function (n) { return n < 10 ? '0' + n : String(n); };

  document.documentElement.classList.add('js');

  /* ---------- 02. Navigation ---------- */
  (function initNav() {
    var nav = $('#nav');
    var progress = $('#navProgress');
    var toggle = $('#navToggle');
    var links = $('#navLinks');
    if (!nav) return;

    var onScroll = function () {
      var y = window.pageYOffset || document.documentElement.scrollTop;
      nav.classList.toggle('is-stuck', y > 20);

      var docH = document.documentElement.scrollHeight - window.innerHeight;
      if (progress) {
        progress.style.width = (docH > 0 ? clamp((y / docH) * 100, 0, 100) : 0) + '%';
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* mobile menu */
    var closeMenu = function () {
      if (!links) return;
      links.classList.remove('is-open');
      if (toggle) {
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open navigation menu');
      }
      document.body.style.overflow = '';
    };

    var openMenu = function () {
      if (!links) return;
      links.classList.add('is-open');
      if (toggle) {
        toggle.setAttribute('aria-expanded', 'true');
        toggle.setAttribute('aria-label', 'Close navigation menu');
      }
      document.body.style.overflow = 'hidden';
    };

    if (toggle && links) {
      toggle.addEventListener('click', function () {
        if (links.classList.contains('is-open')) closeMenu();
        else openMenu();
      });

      $$('a', links).forEach(function (a) {
        a.addEventListener('click', closeMenu);
      });

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeMenu();
      });

      window.addEventListener('resize', function () {
        if (window.innerWidth > 900) closeMenu();
      });
    }

    /* active link tracking */
    var sectionIds = ['overview', 'technology', 'dashboard', 'specifications', 'security', 'contact'];
    var linkFor = {};
    $$('.nav__links a:not(.btn)').forEach(function (a) {
      var href = a.getAttribute('href') || '';
      var id = href.replace('#', '');
      if (sectionIds.indexOf(id) > -1) linkFor[id] = a;
    });

    if ('IntersectionObserver' in window) {
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          var id = entry.target.id;
          var link = linkFor[id];
          if (!link) return;
          if (entry.isIntersecting) {
            $$('.nav__links a').forEach(function (a) { a.classList.remove('is-active'); });
            link.classList.add('is-active');
          }
        });
      }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

      sectionIds.forEach(function (id) {
        var el = document.getElementById(id);
        if (el) spy.observe(el);
      });
    }
  })();

  /* ---------- 03. Scroll reveal ---------- */
  (function initReveal() {
    var items = $$('[data-reveal]');
    if (!items.length) return;

    if (!('IntersectionObserver' in window) || prefersReduced) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    items.forEach(function (el) { io.observe(el); });
  })();

  /* ---------- 04. Hero particles + spotlight ---------- */
  (function initHero() {
    var hero = $('.hero');
    var canvas = $('#heroCanvas');
    var spot = $('#heroSpot');

    if (hero && spot && !prefersReduced) {
      hero.addEventListener('mousemove', function (e) {
        var r = hero.getBoundingClientRect();
        var x = ((e.clientX - r.left) / r.width) * 100;
        var y = ((e.clientY - r.top) / r.height) * 100;
        spot.style.setProperty('--sx', x.toFixed(2) + '%');
        spot.style.setProperty('--sy', y.toFixed(2) + '%');
      });
    }

    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = 0, h = 0;
    var particles = [];
    var raf = null;
    var running = false;
    var visible = true;

    function resize() {
      var rect = canvas.getBoundingClientRect();
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(1, Math.round(rect.height));
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    }

    function build() {
      var count = clamp(Math.round((w * h) / 26000), 22, 74);
      particles = [];
      for (var i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: rand(-0.16, 0.16),
          vy: rand(-0.22, -0.04),
          r: rand(0.6, 1.7),
          a: rand(0.18, 0.62)
        });
      }
    }

    function frame() {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.y < -12) { p.y = h + 10; p.x = Math.random() * w; }
        if (p.x < -12) p.x = w + 10;
        if (p.x > w + 12) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(120, 185, 255, ' + p.a + ')';
        ctx.fill();
      }

      /* constellation links */
      for (var a = 0; a < particles.length; a++) {
        for (var b = a + 1; b < particles.length; b++) {
          var dx = particles[a].x - particles[b].x;
          var dy = particles[a].y - particles[b].y;
          var d2 = dx * dx + dy * dy;
          if (d2 < 15000) {
            var alpha = (1 - d2 / 15000) * 0.16;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.strokeStyle = 'rgba(8, 124, 255, ' + alpha.toFixed(3) + ')';
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }

      raf = window.requestAnimationFrame(frame);
    }

    function start() {
      if (running || prefersReduced) return;
      running = true;
      raf = window.requestAnimationFrame(frame);
    }

    function stop() {
      running = false;
      if (raf) window.cancelAnimationFrame(raf);
      raf = null;
    }

    resize();
    start();

    var resizeTimer = null;
    window.addEventListener('resize', function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resize, 180);
    });

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible && !document.hidden) start();
        else stop();
      }, { threshold: 0 });
      io.observe(canvas);
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop();
      else if (visible) start();
    });
  })();

  /* ---------- 05. Product gallery ---------- */
  (function initGallery() {
    var frame = $('[data-gallery]');
    if (!frame) return;

    var imgs = $$('.gallery__img', frame);
    var tabs = $$('.gallery__tab');
    var label = $('[data-gallery-label]');
    var labels = ['THREE-QUARTER VIEW', 'FRONT ELEVATION'];

    function show(index) {
      imgs.forEach(function (img, i) { img.classList.toggle('is-active', i === index); });
      tabs.forEach(function (tab, i) {
        tab.classList.toggle('is-active', i === index);
        tab.setAttribute('aria-selected', i === index ? 'true' : 'false');
      });
      if (label) label.textContent = labels[index] || '';
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { show(i); });
    });

    /* subtle pointer tilt on desktop */
    if (!prefersReduced && window.matchMedia('(hover: hover)').matches) {
      frame.addEventListener('mousemove', function (e) {
        var r = frame.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        imgs.forEach(function (img) {
          if (img.classList.contains('is-active')) {
            img.style.transform = 'scale(1.03) translate(' + (px * 8).toFixed(2) + 'px,' + (py * 6).toFixed(2) + 'px)';
          }
        });
      });
      frame.addEventListener('mouseleave', function () {
        imgs.forEach(function (img) { img.style.transform = ''; });
      });
    }
  })();

  /* ---------- 06. Card spotlight ---------- */
  (function initCards() {
    if (prefersReduced || !window.matchMedia('(hover: hover)').matches) return;
    $$('.card').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left).toFixed(0) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top).toFixed(0) + 'px');
      });
    });
  })();

  /* ---------- 07. System console simulation ---------- */
  (function initConsole() {
    var grid = $('#chGrid');
    if (!grid) return;

    var CH = 16;
    var POINTS = 80;              /* visible columns */
    var TICK = 1000;              /* ms per sample */

    var channels = [];
    var selected = null;
    var live = true;
    var shift = 0;                /* 0..1 scroll progress between samples */
    var lastTime = 0;

    var rx = [];
    var tx = [];

    var els = {
      summary: $('#chSummary'),
      scope: $('#trafficScope'),
      rxNow: $('#rxNow'),
      txNow: $('#txNow'),
      pktNow: $('#pktNow'),
      health: $('#sHealth'),
      conns: $('#sConns'),
      uptime: $('#sUptime'),
      sec: $('#sSec'),
      cpu: $('#vCpu'), cpuG: $('#gCpu'),
      mem: $('#vMem'), memG: $('#gMem'),
      temp: $('#vTemp'), tempG: $('#gTemp'),
      log: $('#eventLog'),
      canvas: $('#trafficChart'),
      liveBtn: $('#liveToggle'),
      resetBtn: $('#resetChannels')
    };

    /* ---- state ---- */
    for (var i = 0; i < CH; i++) {
      channels.push({
        id: i + 1,
        status: i === 10 ? 'warn' : 'ok',
        base: rand(2.1, 5.4),
        load: rand(28, 78)
      });
    }

    var resources = { cpu: 23, mem: 45, temp: 42, health: 99.98, conns: 1284 };
    var uptime = 15 * 86400 + 7 * 3600 + 42 * 60 + 19;

    /* ---- build channel grid ---- */
    channels.forEach(function (ch) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ch';
      btn.dataset.ch = String(ch.id);
      btn.setAttribute('aria-pressed', 'false');
      btn.setAttribute('aria-label', 'Channel ' + ch.id + ' — ' + (ch.status === 'warn' ? 'degraded' : 'online'));
      btn.innerHTML =
        '<span class="ch__top"><span class="ch__num">' + pad2(ch.id) + '</span>' +
        '<span class="ch__dot' + (ch.status === 'warn' ? ' ch__dot--warn' : '') + '"></span></span>' +
        '<span class="ch__bar"><i style="--v:' + ch.load.toFixed(0) + '%"></i></span>';
      btn.addEventListener('click', function () { select(ch.id); });
      grid.appendChild(btn);
    });

    var chNodes = $$('.ch', grid);

    function select(id) {
      selected = selected === id ? null : id;
      chNodes.forEach(function (n) {
        var on = selected !== null && Number(n.dataset.ch) === selected;
        n.classList.toggle('is-active', on);
        n.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      if (els.scope) {
        els.scope.textContent = selected ? '\u00b7 CH ' + pad2(selected) : '\u00b7 ALL CHANNELS';
      }
      reseed();
      draw();
    }

    if (els.resetBtn) {
      els.resetBtn.addEventListener('click', function () {
        if (selected !== null) select(selected);
      });
    }

    /* ---- series ---- */
    function baseOf() {
      if (selected === null) return 46;
      var ch = channels[selected - 1];
      return ch.base * 2.1;
    }

    function nextValue(prev, base, vol, min, max) {
      var drift = (base - prev) * 0.07;
      var v = prev + drift + (Math.random() - 0.5) * vol;
      return clamp(v, min, max);
    }

    function reseed() {
      var base = baseOf();
      rx = [];
      tx = [];
      var v1 = base, v2 = base * 0.62;
      for (var i = 0; i <= POINTS; i++) {
        v1 = nextValue(v1, base, base * 0.24, base * 0.35, base * 1.75);
        v2 = nextValue(v2, base * 0.62, base * 0.18, base * 0.2, base * 1.2);
        rx.push(v1);
        tx.push(v2);
      }
      shift = 0;
      updateReadout();
    }

    function pushSample() {
      var base = baseOf();
      var nextRx = nextValue(rx[rx.length - 1], base, base * 0.3, base * 0.3, base * 1.9);
      var nextTx = nextValue(tx[tx.length - 1], base * 0.62, base * 0.22, base * 0.18, base * 1.3);
      rx.shift(); rx.push(nextRx);
      tx.shift(); tx.push(nextTx);
    }

    function updateReadout() {
      var r = rx[rx.length - 1];
      var t = tx[tx.length - 1];
      if (els.rxNow) els.rxNow.textContent = r.toFixed(2);
      if (els.txNow) els.txNow.textContent = t.toFixed(2);
      if (els.pktNow) els.pktNow.textContent = Math.round(r * 148 + 120).toLocaleString('en-US');
    }

    /* ---- traffic chart ---- */
    var canvas = els.canvas;
    var ctx = canvas ? canvas.getContext('2d') : null;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);

    function pathFor(data, scaleMax, w, h, padT, padB) {
      var n = data.length;
      var usable = h - padT - padB;
      var pts = [];
      for (var i = 0; i < n; i++) {
        var x = ((i - shift) / (POINTS - 1)) * w;
        var y = padT + usable * (1 - clamp(data[i] / scaleMax, 0, 1));
        pts.push([x, y]);
      }
      return pts;
    }

    function strokeSeries(pts, color, fillTop) {
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (var i = 1; i < pts.length - 1; i++) {
        var xc = (pts[i][0] + pts[i + 1][0]) / 2;
        var yc = (pts[i][1] + pts[i + 1][1]) / 2;
        ctx.quadraticCurveTo(pts[i][0], pts[i][1], xc, yc);
      }
      ctx.lineTo(pts[pts.length - 1][0], pts[pts.length - 1][1]);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.6;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.shadowBlur = 0;

      if (fillTop) {
        ctx.lineTo(pts[pts.length - 1][0], fillTop.baseY);
        ctx.lineTo(pts[0][0], fillTop.baseY);
        ctx.closePath();
        var g = ctx.createLinearGradient(0, fillTop.topY, 0, fillTop.baseY);
        g.addColorStop(0, fillTop.color);
        g.addColorStop(1, 'rgba(8,124,255,0)');
        ctx.fillStyle = g;
        ctx.fill();
      }
    }

    function draw() {
      if (!ctx) return;
      var cw = canvas.clientWidth;
      var chh = canvas.clientHeight;
      if (!cw || !chh) return;

      if (canvas.width !== Math.round(cw * dpr) || canvas.height !== Math.round(chh * dpr)) {
        canvas.width = Math.round(cw * dpr);
        canvas.height = Math.round(chh * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cw, chh);

      var padT = 10, padB = 16;
      var usable = chh - padT - padB;

      var scaleMax = selected === null ? 90 : 14;

      /* grid */
      ctx.strokeStyle = 'rgba(255,255,255,0.055)';
      ctx.lineWidth = 1;
      for (var g = 0; g <= 4; g++) {
        var gy = Math.round(padT + (usable * g) / 4) + 0.5;
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(cw, gy);
        ctx.stroke();
      }

      /* baseline labels */
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(255,255,255,0.22)';
      ctx.textAlign = 'left';
      ctx.fillText(String(scaleMax), 2, chh - 4);
      ctx.textAlign = 'right';
      ctx.fillText('-90s', cw - 2, chh - 4);

      var rxPts = pathFor(rx, scaleMax, cw, chh, padT, padB);
      var txPts = pathFor(tx, scaleMax, cw, chh, padT, padB);

      strokeSeries(txPts, 'rgba(34,211,238,0.85)', null);
      strokeSeries(rxPts, 'rgba(63,169,255,0.95)', {
        topY: padT,
        baseY: padT + usable,
        color: 'rgba(8,124,255,0.26)'
      });

      /* leading marker */
      var last = rxPts[rxPts.length - 1];
      if (last && last[0] <= cw) {
        ctx.beginPath();
        ctx.arc(last[0], last[1], 2.6, 0, Math.PI * 2);
        ctx.fillStyle = '#8CC7FF';
        ctx.shadowColor = 'rgba(8,124,255,0.9)';
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    /* ---- resource gauges ---- */
    function setGauge(node, valNode, value, suffix) {
      if (node) node.style.setProperty('--p', value.toFixed(1));
      if (valNode) valNode.textContent = Math.round(value) + suffix;
    }

    function updateResources() {
      resources.cpu = clamp(resources.cpu + rand(-2.4, 2.4), 14, 62);
      resources.mem = clamp(resources.mem + rand(-1.1, 1.1), 38, 71);
      resources.temp = clamp(resources.temp + rand(-0.7, 0.7), 38, 51);
      resources.health = clamp(resources.health + rand(-0.03, 0.02), 99.9, 100);
      resources.conns = Math.round(clamp(resources.conns + rand(-24, 24), 1120, 1480));

      setGauge(els.cpuG, els.cpu, resources.cpu, '%');
      setGauge(els.memG, els.mem, resources.mem, '%');
      setGauge(els.tempG, els.temp, resources.temp, '\u00b0');

      if (els.health) els.health.innerHTML = resources.health.toFixed(2) + '<span>%</span>';
      if (els.conns) els.conns.textContent = resources.conns.toLocaleString('en-US');
      if (els.sec) {
        els.sec.textContent = 'SECURE';
        els.sec.classList.add('stat__v--ok');
      }
    }

    function updateChannelLoads() {
      chNodes.forEach(function (node, idx) {
        var ch = channels[idx];
        ch.load = clamp(ch.load + rand(-7, 7), 12, 96);
        var bar = node.querySelector('.ch__bar i');
        if (bar) bar.style.setProperty('--v', ch.load.toFixed(0) + '%');
      });
    }

    function updateUptime() {
      uptime += 1;
      var d = Math.floor(uptime / 86400);
      var hh = Math.floor((uptime % 86400) / 3600);
      var mm = Math.floor((uptime % 3600) / 60);
      var ss = uptime % 60;
      if (els.uptime) els.uptime.textContent = d + 'd ' + pad2(hh) + ':' + pad2(mm) + ':' + pad2(ss);
    }

    /* ---- event stream ---- */
    var logTemplates = [
      { t: 'ok', m: 'CH 04 link negotiated 10G-FD, no errors' },
      { t: 'info', m: 'Policy sync completed — 16/16 channels in baseline' },
      { t: 'info', m: 'Discovery sweep finished: 412 endpoints fingerprinted' },
      { t: 'ok', m: 'Configuration attestation passed on CH 01–08' },
      { t: 'warn', m: 'CH 11 optical margin degraded — monitoring' },
      { t: 'info', m: 'Flow table flush completed in 38 ms' },
      { t: 'ok', m: 'Management session authenticated (mTLS, role: operator)' },
      { t: 'info', m: 'Latency baseline refreshed for transaction endpoints' },
      { t: 'ok', m: 'Thermal profile stable — 42\u00b0C, fans 1200 RPM' },
      { t: 'info', m: 'Diagnostic self-test cycle completed — 0 faults' }
    ];
    var logIndex = 0;

    function pushLog() {
      if (!els.log) return;
      var item = logTemplates[logIndex % logTemplates.length];
      logIndex++;

      var now = new Date();
      var stamp = pad2(now.getHours()) + ':' + pad2(now.getMinutes()) + ':' + pad2(now.getSeconds());

      var li = document.createElement('li');
      li.className = 'is-' + item.t;
      var time = document.createElement('time');
      time.textContent = stamp;
      var span = document.createElement('span');
      span.textContent = item.m;
      li.appendChild(time);
      li.appendChild(span);

      els.log.insertBefore(li, els.log.firstChild);
      while (els.log.children.length > 6) {
        els.log.removeChild(els.log.lastChild);
      }
    }

    /* ---- master loop ---- */
    function step(now) {
      if (!lastTime) lastTime = now;
      var dt = now - lastTime;
      lastTime = now;

      if (live) {
        shift += dt / TICK;
        while (shift >= 1) {
          shift -= 1;
          pushSample();
          updateReadout();
        }
      }

      draw();
      window.requestAnimationFrame(step);
    }

    /* ---- start ---- */
    reseed();
    updateResources();
    pushLog();
    draw();

    if (prefersReduced) {
      /* static-ish: sample once per second without continuous scroll */
      setInterval(function () {
        if (!live) return;
        pushSample();
        updateReadout();
        draw();
      }, 1400);
    } else {
      window.requestAnimationFrame(step);
    }

    setInterval(function () {
      if (!live) return;
      updateResources();
      updateChannelLoads();
    }, 1600);

    setInterval(function () {
      if (!live) return;
      pushLog();
    }, 2800);

    setInterval(updateUptime, 1000);

    if (els.liveBtn) {
      els.liveBtn.addEventListener('click', function () {
        live = !live;
        els.liveBtn.classList.toggle('is-on', live);
        els.liveBtn.classList.toggle('is-paused', !live);
        els.liveBtn.setAttribute('aria-pressed', live ? 'true' : 'false');
        var label = els.liveBtn.querySelector('.tool__label');
        if (label) label.textContent = live ? 'Live' : 'Paused';
        if (live) lastTime = 0;
      });
    }

    var resizeTimer = null;
    window.addEventListener('resize', function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(draw, 160);
    });
  })();

  /* ---------- 08. Inquiry form ---------- */
  (function initForm() {
    var form = $('#inquiryForm');
    if (!form) return;

    var note = $('#formNote');
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var ok = true;
      var required = ['#fName', '#fOrg', '#fEmail'];

      required.forEach(function (sel) {
        var field = $(sel);
        if (!field) return;
        var valid = field.value.trim().length > 1;
        if (sel === '#fEmail') valid = emailRe.test(field.value.trim());
        field.classList.toggle('is-invalid', !valid);
        if (!valid) ok = false;
      });

      if (!ok) {
        if (note) {
          note.textContent = 'Please complete the highlighted fields.';
          note.classList.remove('is-ok');
        }
        var firstBad = $('.is-invalid', form);
        if (firstBad) firstBad.focus();
        return;
      }

      var btn = form.querySelector('.form__submit');
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Request prepared \u2713';
      }
      if (note) {
        note.textContent = 'Demonstration only — nothing was transmitted or stored.';
        note.classList.add('is-ok');
      }
    });

    $$('input, textarea', form).forEach(function (field) {
      field.addEventListener('input', function () {
        field.classList.remove('is-invalid');
      });
    });
  })();

})();


/* ---------- Donation: copy wallet ---------- */
(function () {
  var btn = document.getElementById('copyWallet');
  var addr = document.getElementById('walletAddr');
  if (!btn || !addr) return;
  btn.addEventListener('click', function () {
    var text = addr.textContent.trim();
    var done = function () {
      btn.textContent = 'Copied';
      btn.classList.add('is-ok');
      setTimeout(function () { btn.textContent = 'Copy'; btn.classList.remove('is-ok'); }, 1800);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () {});
    } else {
      var r = document.createRange(); r.selectNodeContents(addr);
      var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
      try { document.execCommand('copy'); done(); } catch (e) {}
    }
  });
})();
