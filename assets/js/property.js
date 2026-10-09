// Property marketing page: page-turning brochures, cover shelf, site scene
// and fanned flyers. Needs case.js (and GSAP + ScrollTrigger from cdnjs).
// Without GSAP, or with reduced motion, everything still works: pages swap
// instantly and the scenes sit in their finished layout.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  const animate = hasGsap && !reduce;
  const BASE = document.body.dataset.printBase || '../assets/projects/property/';
  const spreadUrl = (slug, n) => `${BASE}spreads/${slug}-${n}.jpg`;
  const coverUrl = slug => `${BASE}covers/${slug}.jpg`;

  // Image preloader with a cache, so a page never turns onto a blank sheet
  const cache = new Map();
  const loadImg = url => {
    if (!cache.has(url)) cache.set(url, new Promise(res => {
      const img = new Image();
      img.onload = () => res(img); img.onerror = () => res(null);
      img.src = url;
    }));
    return cache.get(url);
  };

  // A brochure state is { l, r }: what is on the left and right page.
  // l: null means the brochure is closed (cover only, on the right).
  const spreadsFor = (slug, n) => Array.from({ length: n }, (_, k) => {
    const url = spreadUrl(slug, k + 1);
    return { l: { url, half: 'l' }, r: { url, half: 'r' } };
  });
  const statesFor = (slug, n) => [{ l: null, r: { url: coverUrl(slug), half: 'full' } }, ...spreadsFor(slug, n)];

  // ---------- Open brochure with a 3D page turn ----------
  class Book {
    constructor(el) {
      this.el = el;
      el.insertAdjacentHTML('beforeend', `
        <div class="book__shadow" aria-hidden="true"></div>
        <div class="book__pages" aria-hidden="true">
          <div class="book__page book__page--l"><i class="book__img"></i></div>
          <div class="book__page book__page--r"><i class="book__img"></i></div>
          <div class="book__leaf">
            <div class="book__face book__face--front"><i class="book__img"></i><i class="book__shade"></i></div>
            <div class="book__face book__face--back"><i class="book__img"></i><i class="book__shade"></i></div>
          </div>
        </div>`);
      const q = s => el.querySelector(s);
      this.L = q('.book__page--l'); this.R = q('.book__page--r'); this.leaf = q('.book__leaf');
      this.front = q('.book__face--front'); this.back = q('.book__face--back');
      this.states = []; this.i = 0; this.busy = false; this.queued = 0; this.token = 0;
    }
    paint(target, p) {
      const img = target.querySelector('.book__img');
      target.classList.toggle('is-empty', !p);
      img.className = 'book__img' + (p ? ` is-${p.half}` : '');
      img.style.backgroundImage = p ? `url("${p.url}")` : 'none';
    }
    load(states, ratio, start = 0) {
      this.token++;
      if (hasGsap) gsap.killTweensOf([this.leaf, ...this.el.querySelectorAll('.book__shade')]);
      this.leaf.style.display = 'none';
      this.states = states; this.i = start; this.busy = false; this.queued = 0;
      this.el.style.setProperty('--ratio', ratio);
      this.el.style.aspectRatio = `${ratio * 2} / 1`;
      this.render();
    }
    render() {
      const s = this.states[this.i];
      this.paint(this.L, s.l); this.paint(this.R, s.r);
      this.el.classList.toggle('is-closed', !s.l);
      this.el.dispatchEvent(new CustomEvent('turn', { detail: this.i }));
    }
    preload(i) {
      const s = this.states[i];
      return s ? Promise.all([s.l, s.r].filter(Boolean).map(p => loadImg(p.url))) : Promise.resolve();
    }
    async go(dir) {
      if (this.busy) { this.queued = dir; return; }
      const j = this.i + dir;
      if (j < 0 || j >= this.states.length) return;
      this.busy = true;
      const token = this.token;
      this.el.classList.add('is-loading');
      await this.preload(j);
      this.el.classList.remove('is-loading');
      if (token !== this.token) return; // another brochure was loaded meanwhile
      const from = this.states[this.i], to = this.states[j];
      const done = () => {
        this.i = j; this.render(); this.busy = false;
        this.preload(j + dir);
        if (this.queued) { const q = this.queued; this.queued = 0; this.go(q); }
      };
      if (!animate) { done(); return; }

      const fwd = dir > 0, leaf = this.leaf;
      leaf.className = `book__leaf ${fwd ? 'is-fwd' : 'is-back'}`;
      this.paint(this.front, fwd ? from.r : from.l);
      this.paint(this.back, fwd ? to.l : to.r);
      // The page underneath the turning leaf shows the next spread straight away
      if (fwd) this.paint(this.R, to.r); else this.paint(this.L, to.l);
      this.el.classList.toggle('is-closed', !to.l);
      const fs = this.front.querySelector('.book__shade'), bs = this.back.querySelector('.book__shade');
      gsap.set(leaf, { display: 'block', rotationY: 0, z: 0 });
      gsap.set(fs, { opacity: 0 }); gsap.set(bs, { opacity: 0.55 });
      const d = this.speed || 0.95;
      gsap.timeline({ onComplete: () => { gsap.set(leaf, { display: 'none' }); done(); } })
        .to(leaf, { rotationY: fwd ? -180 : 180, duration: d, ease: 'power2.inOut' }, 0)
        .to(leaf, { z: 40, duration: d / 2, ease: 'sine.out', yoyo: true, repeat: 1 }, 0)
        .to(fs, { opacity: 0.55, duration: d / 2, ease: 'power1.in' }, 0)
        .to(bs, { opacity: 0, duration: d / 2, ease: 'power1.out' }, d / 2);
    }
  }

  // Shared with print.js, which pages through other jobs' brochures
  window.PrintBook = { Book, statesFor, loadImg, animate };

  // ---------- Hero: things dropped on a desk, the brochure turns its own pages ----------
  const desk = document.querySelector('[data-desk]');
  const heroBookEl = desk?.querySelector('[data-hero-book]');
  if (heroBookEl) {
    const hb = new Book(heroBookEl);
    hb.speed = 1.1;
    hb.load(spreadsFor(heroBookEl.dataset.slug, +heroBookEl.dataset.spreads), +getComputedStyle(heroBookEl).getPropertyValue('--ratio') || 1.414);
    const items = [...desk.querySelectorAll('.pm-item')];
    const plane = desk.querySelector('.pm-desk__plane');
    let started = false, dir = 1, visible = true, timer;
    const loop = () => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        if (visible && !document.hidden) {
          if (hb.i + dir < 0 || hb.i + dir >= hb.states.length) dir *= -1;
          await hb.go(dir);
        }
        loop();
      }, 3400);
    };
    if (animate) {
      gsap.set(plane, { rotationX: 14, rotationZ: -1.5 });
      const fanned = items.filter(el => el.classList.contains('pm-item--fan'));
      const rest = items.filter(el => !el.classList.contains('pm-item--fan'));
      const tl = gsap.timeline({ delay: 0.2, onComplete: () => { if (!started) { started = true; loop(); } } });
      const pen = desk.querySelector('.pm-scribble path');
      if (pen) { const len = pen.getTotalLength(); gsap.set(pen, { strokeDasharray: len, strokeDashoffset: len }); tl.to(pen, { strokeDashoffset: 0, duration: 1.6, ease: 'power1.inOut' }, 0); }
      // covers start as a squared-up stack in the centre, then deal out into a fan
      tl.from(fanned, { left: '50%', top: '14%', rotate: 0, opacity: 0, y: 40, duration: 1.1, ease: 'expo.out', stagger: { each: 0.06, from: 'center' } })
        .from(rest, { y: -80, opacity: 0, scale: 1.12, rotation: i => [-10, 4, 12, -9, 14, -10, -16][i] || 0, duration: 1.1, ease: 'power3.out', stagger: 0.1 }, 0.45);
      // gentle float once settled
      tl.add(() => rest.forEach((el, i) => gsap.to(el, { y: i % 2 ? -6 : 6, duration: 3 + i * 0.4, ease: 'sine.inOut', yoyo: true, repeat: -1 })));
      new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(desk);
      if (matchMedia('(hover: hover) and (min-width: 901px)').matches) {
        const rx = gsap.quickTo(plane, 'rotationX', { duration: 0.9, ease: 'power3.out' });
        const ry = gsap.quickTo(plane, 'rotationY', { duration: 0.9, ease: 'power3.out' });
        desk.addEventListener('pointermove', e => {
          const r = desk.getBoundingClientRect();
          ry(((e.clientX - r.left) / r.width - 0.5) * 7);
          rx(14 - ((e.clientY - r.top) / r.height - 0.5) * 7);
        });
        desk.addEventListener('pointerleave', () => { rx(14); ry(0); });
      }
      addEventListener('load', () => hb.preload(1));
    }
  }

  // ---------- Brochure reader + cover shelf ----------
  const readerEl = document.querySelector('[data-reader]');
  const shelf = document.querySelector('[data-shelf]');
  if (readerEl && shelf) {
    const bookEl = readerEl.querySelector('[data-reader-book]');
    const book = new Book(bookEl);
    const $ = s => readerEl.querySelector(s);
    const title = $('[data-r-title]'), meta = $('[data-r-meta]'), count = $('[data-r-count]');
    const prev = $('[data-r-prev]'), next = $('[data-r-next]'), zoom = $('[data-r-zoom]'), dots = $('[data-r-dots]');
    const items = [...shelf.querySelectorAll('.shelf__item')];

    const open = (item, { autoOpen = false } = {}) => {
      items.forEach(b => { b.classList.toggle('is-active', b === item); b.setAttribute('aria-pressed', b === item); });
      const d = item.dataset;
      title.textContent = d.title;
      meta.textContent = `${d.place} · ${d.format}`;
      dots.innerHTML = '<i></i>'.repeat(+d.spreads + 1);
      book.load(statesFor(d.book, +d.spreads), +d.ratio);
      book.preload(1);
      if (autoOpen) setTimeout(() => book.go(1), 450);
    };
    bookEl.addEventListener('turn', e => {
      const i = e.detail, n = book.states.length - 1;
      count.textContent = i === 0 ? 'Cover' : `${i} / ${n}`;
      prev.disabled = i === 0; next.disabled = i === n;
      [...dots.children].forEach((dot, k) => dot.classList.toggle('is-on', k === i));
      const s = book.states[i];
      zoom.dataset.zoom = (s.l || s.r).url;
    });

    prev.addEventListener('click', () => book.go(-1));
    next.addEventListener('click', () => book.go(1));
    bookEl.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { e.preventDefault(); book.go(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); book.go(-1); }
    });
    // Tap a page to turn it, or swipe
    let downX = null;
    bookEl.addEventListener('pointerdown', e => { downX = e.clientX; });
    bookEl.addEventListener('pointerup', e => {
      if (downX === null) return;
      const dx = e.clientX - downX; downX = null;
      if (Math.abs(dx) > 40) { book.go(dx < 0 ? 1 : -1); return; }
      const r = bookEl.getBoundingClientRect();
      if (book.i === 0) { book.go(1); return; }
      book.go((e.clientX - r.left) / r.width > 0.5 ? 1 : -1);
    });

    items.forEach(item => {
      // Peek: the first inside page appears behind the cover as it swings open
      const peek = () => {
        const inside = item.querySelector('.cover3d__inside');
        if (!inside.style.backgroundImage) inside.style.backgroundImage = `url("${spreadUrl(item.dataset.book, 1)}")`;
      };
      item.addEventListener('pointerenter', peek);
      item.addEventListener('focus', peek);
      item.addEventListener('click', () => {
        open(item, { autoOpen: true });
        const r = readerEl.getBoundingClientRect();
        if (r.top > innerHeight * 0.55 || r.bottom < innerHeight * 0.4) readerEl.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
      });
    });

    open(items[0]);
    // Open the first brochure by itself the first time the reader comes into view
    new IntersectionObserver(([e], io) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      setTimeout(() => { if (book.i === 0) book.go(1); }, 700);
    }, { threshold: 0.5 }).observe(bookEl);
  }

  if (!animate) { document.documentElement.classList.add('no-gsap'); return; }

  // ---------- Site scene: parallax, then the board goes up and the banner unrolls ----------
  const site = document.querySelector('[data-site]');
  if (site) {
    const par = { trigger: site, start: 'top bottom', end: 'bottom top', scrub: 0.6 };
    gsap.fromTo(site.querySelector('.site__sky'), { yPercent: -4 }, { yPercent: 4, ease: 'none', scrollTrigger: par });
    gsap.fromTo(site.querySelector('.site__sun'), { y: 60 }, { y: -50, ease: 'none', scrollTrigger: par });
    gsap.fromTo(site.querySelector('.site__hills--far'), { yPercent: 16 }, { yPercent: -4, ease: 'none', scrollTrigger: par });
    gsap.fromTo(site.querySelector('.site__hills--near'), { yPercent: 10 }, { yPercent: 0, ease: 'none', scrollTrigger: par });
    gsap.fromTo(site.querySelectorAll('.site__cloud'), { x: i => -40 - i * 20 }, { x: i => 50 + i * 30, ease: 'none', scrollTrigger: par });

    const posts = site.querySelectorAll('.hoard__post');
    const board = site.querySelector('.hoard__board');
    const banner = site.querySelector('.banner');
    const dims = site.querySelectorAll('.dim');
    const person = site.querySelector('.site__person');
    gsap.set(posts, { scaleY: 0 });
    gsap.set(board, { y: -50, opacity: 0, rotation: -3 });
    gsap.set(banner, { clipPath: 'inset(0% 100% 0% 0%)' });
    gsap.set(dims, { opacity: 0 });
    gsap.set(person, { scaleY: 0, transformOrigin: '50% 100%' });
    gsap.timeline({ scrollTrigger: { trigger: site, start: 'top 68%', once: true } })
      .to(posts, { scaleY: 1, duration: 0.7, ease: 'power3.out', stagger: 0.1 })
      .to(board, { y: 0, opacity: 1, rotation: 0, duration: 0.9, ease: 'back.out(1.8)' }, 0.35)
      .to(banner, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'power2.inOut' }, 0.6)
      .to(person, { scaleY: 1, duration: 0.6, ease: 'back.out(2)' }, 0.9)
      .to(dims, { opacity: 1, duration: 0.5, stagger: 0.1 }, 1.3);
  }

})();
