// Work page (projects/work.html): hero rise, card reveals, phone screens that
// scroll through the site on phones, filter chips that re-flow the grid with
// GSAP Flip, and the print flat-lay settling in. Load after case.js.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  const hasFlip = hasGsap && typeof window.Flip !== 'undefined';
  const motion = hasGsap && !reduce;
  if (hasFlip) gsap.registerPlugin(Flip);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // ---------- Hero ----------
  if (motion) gsap.from('[data-wk-rise]', { y: 36, autoAlpha: 0, duration: 0.9, ease: 'expo.out', stagger: 0.08, delay: 0.05 });

  // ---------- Website cards ----------
  const grid = document.querySelector('[data-wk-grid]');
  const cards = grid ? $$('.wk-card', grid) : [];
  const seen = new Set();
  const show = els => { els.forEach(el => seen.add(el)); };
  if (motion && cards.length) {
    gsap.set(cards, { autoAlpha: 0, y: 40 });
    ScrollTrigger.batch(cards, {
      start: 'top 90%', once: true,
      onEnter: batch => {
        const fresh = batch.filter(el => !seen.has(el));
        show(fresh);
        gsap.to(fresh, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'expo.out', stagger: 0.08, clearProps: 'transform' });
        // brand pieces pop out with a bounce once the card lands (they float in CSS)
        fresh.forEach((card, n) => {
          const kids = $$('.wpop > *', card);
          if (kids.length) gsap.from(kids, {
            opacity: 0, scale: 0.3, x: (i, el) => +(el.parentElement.dataset.fromX || 0) * 0.6, y: (i, el) => +(el.parentElement.dataset.fromY || 40) * 0.6,
            duration: 0.8, delay: 0.4 + n * 0.08, ease: 'back.out(2.2)', stagger: 0.14, clearProps: 'opacity,transform',
          });
        });
      },
    });
  }

  // Phones and tablets: each card's phone screen scrolls slowly down its full-page capture and back
  // while the card is on screen. Desktop keeps the screens still.
  if (motion && matchMedia('(hover: none)').matches && 'IntersectionObserver' in window) cards.forEach(card => {
    const img = card.querySelector('.wk-card__phone .screen img');
    if (!img) return;
    let tween;
    new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) { tween?.pause(); return; }
      if (tween) { tween.play(); return; }
      const screen = img.parentElement;
      const travel = Math.min(img.offsetHeight - screen.clientHeight, screen.clientHeight * 4);
      if (travel <= 0) return;
      tween = gsap.to(img, { y: -travel, duration: travel / 60, ease: 'sine.inOut', yoyo: true, repeat: -1, repeatDelay: 1, delay: 0.6 });
    }, { threshold: 0.5 }).observe(card);
  });

  // ---------- Filter chips ----------
  const chips = $$('[data-wk-filter] button');
  const filter = f => {
    const match = c => f === 'all' || c.dataset.tags.split(' ').includes(f);
    const animate = hasFlip && !reduce;
    const state = animate ? Flip.getState(cards) : null;
    const h0 = grid.offsetHeight;

    let n = 0;
    cards.forEach(c => { const on = match(c); c.hidden = !on; if (on) n++; });
    if (f === 'all') delete grid.dataset.cols;
    else grid.dataset.cols = n % 3 === 0 ? 3 : 2;
    chips.forEach(b => b.setAttribute('aria-pressed', b.dataset.f === f));

    // anything not yet revealed by scroll just shows
    const shown = cards.filter(match);
    if (hasGsap) { show(shown); gsap.set(shown, { autoAlpha: 1, y: 0 }); }
    if (!state) { if (hasGsap) ScrollTrigger.refresh(); return; }

    const h1 = grid.offsetHeight;
    const dur = 0.75;
    gsap.fromTo(grid, { height: h0 }, { height: h1, duration: dur, ease: 'power3.inOut', clearProps: 'height' });
    Flip.from(state, {
      duration: dur, ease: 'power3.inOut', absolute: true, stagger: 0.03,
      onEnter: els => gsap.fromTo(els, { autoAlpha: 0, scale: 0.9 }, { autoAlpha: 1, scale: 1, duration: 0.55, delay: 0.2, ease: 'power3.out' }),
      onLeave: els => gsap.to(els, { autoAlpha: 0, scale: 0.9, duration: 0.35, ease: 'power2.in' }),
      onComplete: () => ScrollTrigger.refresh(),
    });
  };
  chips.forEach(b => b.addEventListener('click', () => { if (b.getAttribute('aria-pressed') !== 'true') filter(b.dataset.f); }));

  // ---------- Print: the swipe draws in, then the pieces settle onto it ----------
  const group = document.querySelector('[data-wk-group]');
  if (group && motion) {
    const lays = $$('.wk-lay', group);
    const swipe = group.querySelector('.wk-group__swipe');
    const tl = gsap.timeline({ paused: true });
    if (swipe) tl.from(swipe, { scaleX: 0, duration: 0.9, ease: 'power3.inOut' }, 0);
    tl.from(lays, {
      y: -50, rotation: i => (i % 2 ? 12 : -12), scale: 1.08, autoAlpha: 0,
      duration: 0.9, ease: 'back.out(1.4)', stagger: 0.07, clearProps: 'transform,opacity,visibility',
    }, 0.15);
    tl.progress(0.0001);
    ScrollTrigger.create({ trigger: group, start: 'top 82%', once: true, onEnter: () => tl.play() });
  }
})();
