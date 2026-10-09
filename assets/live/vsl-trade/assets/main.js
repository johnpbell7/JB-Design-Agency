
(function () {
  'use strict';

  
  var ham = document.getElementById('ham');
  var mnav = document.getElementById('mnav');
  if (ham && mnav) {
    function closeNav() { mnav.classList.remove('open'); ham.classList.remove('active'); ham.setAttribute('aria-expanded', 'false'); }
    ham.addEventListener('click', function () {
      var open = mnav.classList.toggle('open');
      ham.classList.toggle('active', open);
      ham.setAttribute('aria-expanded', String(open));
    });
    mnav.querySelectorAll('a').forEach(function (a) {
      if (a.getAttribute('href') && a.getAttribute('href').charAt(0) !== '#') return;
      a.addEventListener('click', closeNav);
    });
    mnav.querySelectorAll('.m-acc').forEach(function (btn) {
      btn.addEventListener('click', function () {
        btn.setAttribute('aria-expanded', btn.getAttribute('aria-expanded') === 'true' ? 'false' : 'true');
      });
    });
    document.addEventListener('click', function (e) {
      if (mnav.classList.contains('open') && !mnav.contains(e.target) && !ham.contains(e.target)) closeNav();
    });
  }

  
  var nav = document.getElementById('nav');
  if (nav) {
    function onScroll() { nav.classList.toggle('scrolled', window.scrollY > 12); }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  
  document.querySelectorAll('form[data-demo]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var fields = form.querySelector('.form-fields');
      var ok = form.querySelector('.form-ok');
      if (fields) fields.style.display = 'none';
      if (ok) ok.classList.add('show');
      if (typeof gsap !== 'undefined' && ok) gsap.from(ok, { y: 14, opacity: 0, duration: .5, ease: 'power3.out' });
    });
  });

  
  document.querySelectorAll('.faq-q').forEach(function (q) {
    q.setAttribute('aria-expanded', 'false');
    q.addEventListener('click', function () {
      var item = q.closest('.faq-item');
      var open = item.classList.toggle('open');
      q.setAttribute('aria-expanded', String(open));
    });
  });

  
  document.querySelectorAll('[data-filter-group]').forEach(function (group) {
    var chips = group.querySelectorAll('.filter-chip');
    var targetSel = group.getAttribute('data-filter-target');
    var items = targetSel ? document.querySelectorAll(targetSel) : [];
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (c) { c.classList.remove('on'); });
        chip.classList.add('on');
        var f = chip.getAttribute('data-filter');
        items.forEach(function (it) {
          var cats = (it.getAttribute('data-cat') || '').split(' ');
          it.style.display = (f === 'all' || cats.indexOf(f) !== -1) ? '' : 'none';
        });
      });
    });
  });

  function showAll() {
    document.querySelectorAll('.reveal, .reveal-stagger > *').forEach(function (el) {
      el.style.opacity = '1'; el.style.transform = 'none';
    });
  }
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || typeof gsap === 'undefined') { showAll(); return; }
  setTimeout(function () {
    if (typeof ScrollTrigger === 'undefined') showAll();
  }, 1500);
  gsap.registerPlugin(ScrollTrigger);

  
  if (document.querySelector('.hero')) {
    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from('.hero h1', { y: 26, opacity: 0, duration: .8 })
      .from('.hero-lead', { y: 20, opacity: 0, duration: .7 }, '-=.5')
      .from('.hero-btns .btn', { y: 18, opacity: 0, duration: .6, stagger: .1 }, '-=.45')
      .from('.hero-trust', { y: 16, opacity: 0, duration: .6 }, '-=.4')
      .from('.metrics', { y: 22, opacity: 0, duration: .7 }, '-=.45')
      .from('.hero-visual .hero-img', { y: 28, opacity: 0, scale: .97, duration: 1, ease: 'power4.out' }, '-=1.15')
      .from('.hero-visual .float-prod, .hero-visual .float-badge', { opacity: 0, scale: .8, duration: .7, stagger: .12, ease: 'back.out(1.6)' }, '-=.6');
  }

  
  if (document.querySelector('.page-hero')) {
    gsap.timeline({ defaults: { ease: 'power3.out' } })
      .from('.page-hero .crumbs', { y: 12, opacity: 0, duration: .5 })
      .from('.page-hero h1', { y: 22, opacity: 0, duration: .7 }, '-=.25')
      .from('.page-hero .ph-lead', { y: 18, opacity: 0, duration: .6 }, '-=.4')
      .from('.page-hero .hero-btns, .page-hero .chip', { y: 16, opacity: 0, duration: .55, stagger: .1 }, '-=.35')
      .from('.page-hero .ph-media', { opacity: 0, scale: .94, y: 18, duration: .85, ease: 'power4.out' }, '-=.7');
  }

  
  gsap.utils.toArray('.float-1, .float-badge').forEach(function (el, i) {
    gsap.to(el, { y: '-=14', duration: 3 + i * .4, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: i * .3 });
  });
  gsap.utils.toArray('.float-2').forEach(function (el) {
    gsap.to(el, { y: '+=16', duration: 3.6, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  });
  if (document.querySelector('.phone-wrap') && document.querySelector('.hero-visual')) {
    gsap.to('.hero-visual .phone-wrap', { y: -10, duration: 3.4, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  }

  
  gsap.utils.toArray('[data-count]').forEach(function (el) {
    var target = +el.getAttribute('data-count');
    var suffix = el.getAttribute('data-suffix') || '';
    var prefix = el.getAttribute('data-prefix') || '';
    var obj = { v: 0 };
    ScrollTrigger.create({
      trigger: el, start: 'top 92%', once: true,
      onEnter: function () {
        gsap.to(obj, {
          v: target, duration: 1.6, ease: 'power2.out',
          onUpdate: function () { el.textContent = prefix + Math.round(obj.v).toLocaleString('en-GB') + suffix; }
        });
      }
    });
  });

  
  gsap.utils.toArray('.reveal').forEach(function (el) {
    gsap.to(el, { y: 0, opacity: 1, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
  });
  gsap.utils.toArray('.reveal-stagger').forEach(function (grid) {
    gsap.to(grid.children, { y: 0, opacity: 1, duration: .6, ease: 'power3.out', stagger: .06, scrollTrigger: { trigger: grid, start: 'top 86%' } });
  });

  
  gsap.utils.toArray('.feat-row').forEach(function (row) {
    var phone = row.querySelector('.phone-wrap');
    var text = row.querySelector(':scope > div:not(.phone-wrap)');
    var flip = row.classList.contains('flip');
    var tl = gsap.timeline({ scrollTrigger: { trigger: row, start: 'top 78%' } });
    if (phone) tl.from(phone, { opacity: 0, x: flip ? -46 : 46, y: 22, scale: .96, duration: .85, ease: 'power3.out' }, 0);
    if (text) tl.from(text.children, { opacity: 0, y: 18, duration: .55, stagger: .07, ease: 'power3.out' }, .12);
  });

  
  var RING = '0 0 0 2px var(--green-bd)', NORING = '0 0 0 0 rgba(67,176,42,0)';
  function ringPulse(tl, el, at) {
    if (el) tl.fromTo(el, { boxShadow: NORING }, { boxShadow: RING, duration: .34, yoyo: true, repeat: 1, ease: 'power1.inOut' }, at);
  }
  gsap.utils.toArray('.feat-row').forEach(function (row) {
    var fx = row.querySelector('.phone-fx');
    if (!fx) return;
    var screen = row.querySelector('.phone-screen');
    var type = fx.getAttribute('data-fx');

    gsap.set(fx, { opacity: 0, scale: .9 });
    gsap.to(fx, { y: -6, duration: 2.8, ease: 'sine.inOut', yoyo: true, repeat: -1 }); // gentle bob (y only)

    var tl = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 1.3 });
    function popIn(at) { tl.to(fx, { opacity: 1, scale: 1, duration: .5, ease: 'back.out(1.7)' }, at); }
    function popOut() { tl.to(fx, { opacity: 0, scale: .92, duration: .4, ease: 'power2.in' }, '+=1.6'); }

    if (type === 'order') {
      ringPulse(tl, screen.querySelector('.prow'), .1);
      var btn = screen.querySelector('.pbasket-btn');
      if (btn) tl.fromTo(btn, { scale: 1 }, { scale: 1.05, duration: .3, yoyo: true, repeat: 1, ease: 'power1.inOut' }, .2);
      popIn(.5); popOut();
    } else if (type === 'discover') {
      var promo = screen.querySelector('.ppromo');
      if (promo) tl.fromTo(promo, { scale: 1 }, { scale: 1.035, duration: .4, yoyo: true, repeat: 1, ease: 'power1.inOut' }, .1);
      var nb = screen.querySelector('.prow .pb-new');
      if (nb) tl.fromTo(nb, { scale: 1 }, { scale: 1.25, duration: .3, yoyo: true, repeat: 1, ease: 'back.out(2)' }, .25);
      tl.to(fx, { opacity: 1, scale: 1, duration: .5, ease: 'back.out(1.7)' }, .45);
      var bell = fx.querySelector('.fx-ic svg');
      if (bell) tl.fromTo(bell, { rotation: -11, transformOrigin: 'top center' }, { rotation: 11, duration: .09, yoyo: true, repeat: 5, ease: 'sine.inOut' }, .58);
      popOut();
    } else if (type === 'save') {
      var amtEl = screen.querySelector('.w-amt'), o = { v: 18.40 };
      tl.set(amtEl, { textContent: '£18.40' }, 0).set(o, { v: 18.40 }, 0);
      popIn(.2);
      tl.to(o, { v: 22.60, duration: 1.3, ease: 'power1.out', onUpdate: function () { amtEl.textContent = '£' + o.v.toFixed(2); } }, .4);
      ringPulse(tl, screen.querySelector('.tx'), .45);
      popOut();
    } else if (type === 'grow') {
      screen.querySelectorAll('.feat-card').forEach(function (c, i) { ringPulse(tl, c, .1 + i * .27); });
      popIn(.55); popOut();
    }

    ScrollTrigger.create({
      trigger: row, start: 'top 80%',
      onEnter: function () { tl.play(); }, onEnterBack: function () { tl.play(); },
      onLeave: function () { tl.pause(); }, onLeaveBack: function () { tl.pause(); }
    });
  });
})();


window.vslAfterIntro = function (fn) {
  var box = document.getElementById('vsl-intro');
  if (!box || document.documentElement.classList.contains('intro-skip')) {
    
    requestAnimationFrame(function () { requestAnimationFrame(fn); });
    return;
  }
  document.addEventListener('vsl:introdone', function () { fn(); }, { once: true });
};


(function () {
  if (!document.documentElement.classList.contains('js')) return;
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var SKIP = '.ce-hero, .ce-consbar, #app, .ce-hs, .ap-slide, .ap-stack, .ce-mq, .hero, .page-hero, .vx-hero, .ce-chero, .ap-hero';
  var MAX_STAGGER = 10;

  function isRow(el) {
    if (el.children.length < 2 || el.children.length > 24) return false;
    var d = getComputedStyle(el).display;
    return d === 'grid' || d === 'flex';
  }
  function mark(el, i) {
    el.classList.add('rv');
    el.style.setProperty('--rvd', (Math.min(i, MAX_STAGGER) * 70) + 'ms');
  }

  var groups = [];
  document.querySelectorAll('section:not(section section)').forEach(function (sec) {
    if (sec.matches(SKIP) || sec.closest(SKIP)) return;
    var wrap = sec.querySelector(':scope > .w') || sec;
    Array.prototype.forEach.call(wrap.children, function (block) {
      if (block.matches(SKIP) || block.querySelector(SKIP)) return;
      if (block.tagName === 'SCRIPT' || block.tagName === 'STYLE') return;
      if (isRow(block)) {
        var kids = Array.prototype.slice.call(block.children);
        kids.forEach(mark);
        groups.push({ root: block, items: kids });
      } else {
        mark(block, 0);
        groups.push({ root: block, items: [block] });
      }
    });
  });
  if (!groups.length) return;

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var g = e.target.__rv;
      if (g) g.items.forEach(function (el) { el.classList.add('is-in'); });
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });

  window.vslAfterIntro(function () {
    groups.forEach(function (g) { g.root.__rv = g; io.observe(g.root); });
  });

  
  setTimeout(function () {
    document.querySelectorAll('.rv:not(.is-in)').forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0) el.classList.add('is-in');
    });
  }, 1200);
})();


(function () {
  var box = document.getElementById('vsl-intro');
  if (!box) return;
  var html = document.documentElement;
  function announce() { document.dispatchEvent(new CustomEvent('vsl:introdone')); }
  if (html.classList.contains('intro-skip')) { box.remove(); return; }
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { box.remove(); announce(); return; }

  var video = box.querySelector('.vi-video'), skip = document.getElementById('vi-skip'), done = false;
  function finish() {
    if (done) return; done = true;
    try { sessionStorage.setItem('vsl-intro', '1'); } catch (e) {}
    box.classList.add('vi-done');
    announce();
    setTimeout(function () { box.remove(); }, 800);
  }
  
  function showText() { box.classList.add('vi-text'); }
  video.addEventListener('playing', function () {
    video.classList.add('vi-show');
    setTimeout(showText, 700);
  }, { once: true });
  setTimeout(showText, 1500);
  video.addEventListener('ended', finish);
  video.addEventListener('error', finish);
  skip.addEventListener('click', finish);
  setTimeout(finish, 5600);
  video.playbackRate = 1.6;            
  video.addEventListener('ended', function () { setTimeout(finish, 1500); }, { once: true });
  var p = video.play();
  if (p && p.catch) p.catch(finish);
})();



(function () {
  var rails = document.querySelectorAll('[data-rail-nudge]');
  if (!rails.length || !('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var rail = entry.target;
      io.unobserve(rail);

      var touched = false;
      function mark() { touched = true; }
      rail.addEventListener('touchstart', mark, { passive: true, once: true });
      rail.addEventListener('wheel', mark, { passive: true, once: true });

      setTimeout(function () {
        var room = rail.scrollWidth - rail.clientWidth;
        if (touched || room < 40 || rail.scrollLeft > 4) return;   
        rail.classList.add('is-peek');
        rail.scrollTo({ left: Math.min(room, Math.round(rail.clientWidth * 0.42)), behavior: 'smooth' });
        setTimeout(function () {
          if (!touched) rail.scrollTo({ left: 0, behavior: 'smooth' });
          setTimeout(function () { rail.classList.remove('is-peek'); }, 700);
        }, 900);
      }, 2000);
    });
  }, { threshold: 0.4 });

  rails.forEach(function (rail) { io.observe(rail); });
})();
