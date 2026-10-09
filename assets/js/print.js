// Print hub: the dealt-out hand in the hero, a page-turning report, cards
// that flip over, mock-up strips that drag sideways, and a film player.
// Needs case.js and property.js (for PrintBook); GSAP is optional.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const animate = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined' && !reduce;

  // ---------- Hero: the highlighter goes down, then the pieces drop on ----------
  const hand = document.querySelector('[data-hand]');
  if (hand && animate) {
    const pen = hand.querySelector('.pr-scribble path');
    const len = pen.getTotalLength();
    gsap.set(pen, { strokeDasharray: len, strokeDashoffset: len });
    gsap.timeline({ delay: 0.2 })
      .to(pen, { strokeDashoffset: 0, duration: 1.4, ease: 'power1.inOut' })
      .from(hand.querySelectorAll('.pr-piece'), { opacity: 0, yPercent: -30, scale: 1.12, duration: 0.9, ease: 'back.out(1.6)', stagger: 0.08, clearProps: 'opacity,transform' }, 0.25);
  }

  // ---------- Featured property: Sloane House turns its own pages, covers fan out on scroll ----------
  const fArt = document.querySelector('[data-feature-art]');
  const fBookEl = fArt?.querySelector('[data-feature-book]');
  if (fBookEl && window.PrintBook) {
    const { Book } = window.PrintBook;
    const fb = new Book(fBookEl);
    fb.speed = 1.05;
    const url = n => `../assets/projects/property/spreads/sloane-${n}.jpg`;
    const states = Array.from({ length: +fBookEl.dataset.spreads }, (_, k) => ({ l: { url: url(k + 1), half: 'l' }, r: { url: url(k + 1), half: 'r' } }));
    fb.load(states, 1.416);
    let visible = false, timer;
    const loop = () => { clearTimeout(timer); timer = setTimeout(async () => { if (visible && !document.hidden) await fb.go(fb.i + 1 < states.length ? 1 : -fb.i); loop(); }, 2600); };
    // jumping back to the start is a straight swap, not fourteen turns
    const go = fb.go.bind(fb);
    fb.go = d => (Math.abs(d) > 1 ? (fb.i = 0, fb.render(), Promise.resolve()) : go(d));
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) loop(); }, { threshold: 0.3 }).observe(fArt);
    if (animate) {
      const pen = fArt.querySelector('.pr-scribble path'); const len = pen.getTotalLength();
      gsap.set(pen, { strokeDasharray: len, strokeDashoffset: len });
      const tl = gsap.timeline({ scrollTrigger: { trigger: fArt, start: 'top 80%', once: true } });
      tl.to(pen, { strokeDashoffset: 0, duration: 1.3, ease: 'power1.inOut' });
      // covers start squared up in the middle and deal out to their places
      // (GSAP can't read CSS variables as end values, so pass them in)
      [...fArt.querySelectorAll('.pr-cover')].forEach((c, i, all) => {
        const to = { '--x': c.style.getPropertyValue('--x'), '--r': c.style.getPropertyValue('--r') };
        tl.fromTo(c, { '--x': '-50%', '--r': '0deg', '--py': '60px', opacity: 0 }, { ...to, '--py': '0px', opacity: 1, duration: 1.1, ease: 'expo.out' }, 0.2 + Math.abs(i - (all.length - 1) / 2) * 0.06);
      });
      tl.from(fArt.querySelector('.pr-feature__book'), { y: 80, opacity: 0, duration: 1, ease: 'expo.out' }, 0.45)
        .from(fArt.querySelector('.pr-flyer'), { x: 60, y: -40, rotation: 30, opacity: 0, duration: 0.9, ease: 'back.out(1.6)' }, 0.7);
      // the flyer drifts a little faster than the rest as the section scrolls
      gsap.fromTo(fArt.querySelectorAll('.pr-flyer'), { yPercent: 10 }, { yPercent: -14, ease: 'none', scrollTrigger: { trigger: fArt, start: 'top bottom', end: 'bottom top', scrub: 0.8 } });
    }
  }

  // ---------- Report: a small brochure that turns its pages ----------
  const bookEl = document.querySelector('[data-mini-book]');
  if (bookEl && window.PrintBook) {
    const { Book, statesFor } = window.PrintBook;
    const book = new Book(bookEl);
    const wrap = bookEl.closest('.pr-book');
    const prev = wrap.querySelector('[data-b-prev]'), next = wrap.querySelector('[data-b-next]'), count = wrap.querySelector('[data-b-count]');
    const states = statesFor(bookEl.dataset.slug, +bookEl.dataset.spreads);
    bookEl.addEventListener('turn', e => {
      count.textContent = `${e.detail + 1} / ${states.length}`;
      prev.disabled = e.detail === 0; next.disabled = e.detail === states.length - 1;
    });
    book.load(states, +bookEl.style.getPropertyValue('--ratio') || 0.707);
    prev.addEventListener('click', () => book.go(-1));
    next.addEventListener('click', () => book.go(1));
    bookEl.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { e.preventDefault(); book.go(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); book.go(-1); }
    });
    // Click the right half to go on, the left half to go back; swipe on touch
    let downX = null;
    bookEl.addEventListener('pointerdown', e => { downX = e.clientX; });
    bookEl.addEventListener('pointerup', e => {
      if (downX === null) return;
      const dx = e.clientX - downX; downX = null;
      if (Math.abs(dx) > 40) { book.go(dx < 0 ? 1 : -1); return; }
      const r = bookEl.getBoundingClientRect();
      book.go(e.clientX > r.left + r.width / 2 || book.i === 0 ? 1 : -1);
    });
    // Open it the first time it comes into view
    new IntersectionObserver(([e], io) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      setTimeout(() => { if (book.i === 0) book.go(1); }, 700);
    }, { threshold: 0.5 }).observe(bookEl);
  }

  // ---------- Cards that turn over ----------
  document.querySelectorAll('[data-flip]').forEach(btn => {
    btn.addEventListener('click', () => btn.classList.toggle('is-flipped'));
  });

  // ---------- Yalla: three names for one gum ----------
  // The three names take turns at the front of the fan while it's in view,
  // until someone picks one. A back tin comes forward when clicked; the front
  // tin opens in the lightbox (data-zoom, handled in case.js). Below, the
  // three ranges zigzag in over one highlighter stroke.
  const yalla = document.querySelector('[data-yalla]');
  if (yalla) {
    const tins = [...yalla.querySelectorAll('.yalla__tin')];
    const slots = ['is-front', 'is-right', 'is-left'];
    let cur = 0, timer = null, picked = false, inView = false;
    const show = i => {
      cur = (i + tins.length) % tins.length;
      tins.forEach((t, k) => { t.classList.remove(...slots); t.classList.add(slots[(k - cur + tins.length) % tins.length]); });
    };
    const stop = () => { clearInterval(timer); timer = null; };
    const play = () => { if (picked || reduce || timer || !inView) return; timer = setInterval(() => { if (!document.hidden) show(cur + 1); }, 3600); };
    const pick = i => { picked = true; stop(); show(i); };
    tins.forEach((t, k) => t.addEventListener('click', e => {
      if (t.classList.contains('is-front')) { picked = true; stop(); return; }
      e.stopPropagation(); pick(k);
    }));
    const top = yalla.querySelector('.yalla__top');
    top.addEventListener('pointerenter', stop);
    top.addEventListener('pointerleave', play);
    new IntersectionObserver(([e]) => { inView = e.isIntersecting; inView ? play() : stop(); }, { threshold: 0.35 }).observe(top);

    if (animate) {
      const tl = gsap.timeline({ scrollTrigger: { trigger: yalla, start: 'top 78%', once: true } });
      tl.from(yalla.querySelector('.yalla__panel'), { y: 70, opacity: 0, duration: 1.1, ease: 'expo.out' })
        .from(yalla.querySelectorAll('.yalla__drop'), { y: -160, rotation: i => [-28, 24, -22][i % 3], opacity: 0, duration: 1.2, ease: 'back.out(1.5)', stagger: 0.12 }, 0.15)
        .from(yalla.querySelectorAll('.yalla__flavours li, .yalla__kicker'), { x: -26, opacity: 0, duration: 0.8, ease: 'expo.out', stagger: 0.06 }, 0.35);
      // the highlighter swipes behind the range as it slides in
      const range = yalla.querySelector('.yalla__range');
      const pen = range.querySelector('.yalla__pen path'), len = pen.getTotalLength();
      gsap.set(pen, { strokeDasharray: len, strokeDashoffset: len });
      const rtl = gsap.timeline({ scrollTrigger: { trigger: range, start: 'top 80%', once: true } })
        .to(pen, { strokeDashoffset: 0, duration: 1.8, ease: 'power1.inOut' });
      range.querySelectorAll('.yalla__row').forEach((row, i) => {
        rtl.from(row.querySelector('img'), { x: i % 2 ? 110 : -110, opacity: 0, duration: 1.2, ease: 'expo.out' }, 0.15 + i * 0.32)
          .from(row.querySelectorAll('figcaption > *'), { y: 16, opacity: 0, duration: 0.7, ease: 'expo.out', stagger: 0.07 }, 0.4 + i * 0.32);
      });
      // each tin bobs on its own slow loop; the camo drifts as the page scrolls
      yalla.querySelectorAll('.yalla__float').forEach((f, i) => {
        gsap.to(f, { y: -12 - i * 2, rotation: i % 2 ? -1.6 : 1.6, duration: 2.6 + i * 0.45, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: i * 0.3 });
      });
      gsap.fromTo(yalla.querySelector('.yalla__panel svg'), { yPercent: -5 }, { yPercent: 5, ease: 'none', scrollTrigger: { trigger: yalla, start: 'top bottom', end: 'bottom top', scrub: 0.8 } });
    }
  }

  // ---------- Strips: drag sideways with a mouse, glide in as you scroll ----------
  document.querySelectorAll('[data-strip]').forEach(strip => {
    let startX = 0, startLeft = 0, moved = false, down = false;
    strip.addEventListener('pointerdown', e => {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = false; startX = e.clientX; startLeft = strip.scrollLeft;
    });
    addEventListener('pointermove', e => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 5) { moved = true; strip.classList.add('is-dragging'); }
      if (moved) strip.scrollLeft = startLeft - dx;
    });
    addEventListener('pointerup', () => {
      if (!down) return;
      down = false;
      // swallow the click that ends a drag, so it doesn't open the lightbox
      if (moved) strip.addEventListener('click', e => { e.stopPropagation(); e.preventDefault(); }, { capture: true, once: true });
      requestAnimationFrame(() => strip.classList.remove('is-dragging'));
    });
    if (animate) {
      gsap.fromTo(strip.querySelector('.strip__track'), { x: () => Math.min(innerWidth * 0.18, 240) }, {
        x: 0, ease: 'none',
        scrollTrigger: { trigger: strip, start: 'top bottom', end: 'center 55%', scrub: 0.8, invalidateOnRefresh: true },
      });
    }
  });

  // ---------- Film player (privacy-enhanced YouTube, loaded only on click) ----------
  const dialog = document.querySelector('[data-film-dialog]');
  if (dialog) {
    const frame = dialog.querySelector('.film__frame');
    const close = () => { dialog.close(); };
    dialog.addEventListener('close', () => { frame.innerHTML = ''; });
    dialog.querySelector('.film__close').addEventListener('click', close);
    dialog.addEventListener('click', e => { if (e.target === dialog) close(); });
    document.querySelectorAll('[data-film]').forEach(btn => btn.addEventListener('click', () => {
      const id = encodeURIComponent(btn.dataset.film);
      // YouTube refuses to embed without a referrer (error 153), which a page
      // opened straight from disk never sends, so there it opens on YouTube
      if (location.protocol === 'file:') { window.open(`https://www.youtube.com/watch?v=${id}`, '_blank', 'noopener'); return; }
      frame.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1" title="${btn.dataset.filmTitle || 'Film'}" referrerpolicy="strict-origin-when-cross-origin" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
      dialog.showModal();
    }));
  }
})();
