// Work page (projects/work.html): hero rise, the stacked website cards (as on the
// home page), and the print flat-lay settling in. Load after case.js.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  const motion = hasGsap && !reduce;
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // ---------- Hero ----------
  if (motion) gsap.from('[data-wk-rise]', { y: 36, autoAlpha: 0, duration: 0.9, ease: 'expo.out', stagger: 0.08, delay: 0.05 });

  // ---------- Websites: the home page's stacked cards; each sinks back as the next slides over ----------
  const stack = document.querySelector('[data-stack]');
  if (stack) {
    const cards = $$('.feature', stack);
    cards.forEach((c, k) => c.style.setProperty('--k', k));
    if (motion) {
      cards.forEach((c, k) => {
        const next = cards[k + 1];
        if (next) gsap.to(c, { scale: 0.95, filter: 'brightness(0.9)', ease: 'power1.in', scrollTrigger: { trigger: next, start: 'top 45%', end: 'top 110px', scrub: true } });
        gsap.from(c.querySelector('.feature__laptop'), { y: 60, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: c, start: 'top 80%', once: true } });
        gsap.from(c.querySelector('.feature__phone'), { x: 60, rotation: -6, opacity: 0, duration: 1, delay: 0.15, ease: 'expo.out', scrollTrigger: { trigger: c, start: 'top 80%', once: true } });
        // brand pieces pop out with a bounce as the card settles into the stack (they float in CSS)
        const pops = $$('.wpop', c);
        if (pops.length) gsap.from(pops, {
          opacity: 0, scale: 0.3, x: (i, el) => +(el.dataset.fromX || 0), y: (i, el) => +(el.dataset.fromY || 50),
          duration: 0.8, delay: 0.35, ease: 'back.out(2.2)', stagger: 0.14,
          scrollTrigger: { trigger: c, start: 'top 65%', once: true },
        });
      });
    }
  }

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
