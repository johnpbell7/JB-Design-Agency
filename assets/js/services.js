// Services page: the work in each service's visual pops in when it scrolls into view, the hero tiles
// rise in, and the price-card dots follow the phone swipe row. case.js does the nav, highlighter
// marks and [data-reveal] fades. Transforms and opacity only; nothing moves for reduced motion.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

  if (hasGsap && !reduce) {
    gsap.registerPlugin(ScrollTrigger);
    // hero tiles: a quick stagger on load
    gsap.from('.svc-tile', { opacity: 0, y: 26, scale: 0.94, duration: 0.8, ease: 'back.out(1.6)', stagger: 0.06, delay: 0.15, clearProps: 'opacity,transform' });

    // each service visual: the board scales up a touch, then its pieces drop in one after another
    document.querySelectorAll('.svc__media').forEach(media => {
      const flip = !!media.closest('.svc--flip');
      const bits = media.querySelectorAll('[data-pop], .svc__spark, .m-tea, .m-rocket');
      gsap.set(media, { opacity: 0, x: flip ? 40 : -40 });
      gsap.set(bits, { opacity: 0, y: 40, scale: 0.92 });
      ScrollTrigger.create({
        trigger: media, start: 'top 85%', once: true,
        onEnter: () => {
          gsap.to(media, { opacity: 1, x: 0, duration: 0.9, ease: 'expo.out' });
          gsap.to(bits, { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: 'back.out(1.4)', stagger: 0.1, delay: 0.15 });
        },
      });
    });

    // ticks slide in after their list fades up
    document.querySelectorAll('.svc__ticks').forEach(list => {
      const items = list.children;
      gsap.set(items, { opacity: 0, x: -14 });
      ScrollTrigger.create({ trigger: list, start: 'top 88%', once: true, onEnter: () => gsap.to(items, { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out', stagger: 0.07, delay: 0.2 }) });
    });
  }

  // price cards on phones: dots follow the swipe row
  const row = document.querySelector('#prices .hp-cards'), dots = [...document.querySelectorAll('#prices .hp-dots i')];
  if (row && dots.length) {
    const sync = () => {
      const cards = [...row.children], x = row.scrollLeft;
      let k = 0, best = Infinity;
      cards.forEach((c, i) => { const d = Math.abs(c.offsetLeft - row.offsetLeft - x - parseFloat(getComputedStyle(row).paddingLeft || 0)); if (d < best) { best = d; k = i; } });
      dots.forEach((d, i) => d.classList.toggle('is-on', i === k));
    };
    row.addEventListener('scroll', () => requestAnimationFrame(sync), { passive: true });
  }
})();
