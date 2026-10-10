// Services page: each service drawing fades and rises as it scrolls into view while the highlighter
// squiggle behind it draws itself in; the price-card dots follow the phone swipe row. case.js does the
// nav, highlighter marks and [data-reveal] fades. Transforms, opacity and stroke-dashoffset only;
// nothing moves for reduced motion (everything simply shows).
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const boards = [...document.querySelectorAll('[data-draw]')];

  if (!reduce && 'IntersectionObserver' in window) {
    boards.forEach(board => {
      board.classList.add('is-pending');
      board.querySelectorAll('.squig path').forEach(p => {
        const len = p.getTotalLength();
        // dash parked past the start, so the round cap doesn't show before it draws
        p.style.strokeDasharray = `${len} ${len + 200}`;
        p.style.strokeDashoffset = `${len + 100}`;
      });
    });
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (!e.isIntersecting) return;
      const board = e.target;
      board.classList.remove('is-pending');
      board.querySelectorAll('.squig path').forEach(p => {
        p.classList.add('is-drawing');
        requestAnimationFrame(() => { p.style.strokeDashoffset = '0'; });
      });
      io.unobserve(board);
    }), { rootMargin: '0px 0px -15% 0px' });
    boards.forEach(b => io.observe(b));
  }

  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  // ---------- Process: the line draws as you scroll and each step lights up ----------
  // Desktop: vertical scroll drives it. Phones (<= 800px): the steps are a
  // swipeable row, and the line fills dot to dot as the row moves.
  const stepsEl = document.querySelector('[data-steps]');
  if (stepsEl) {
    const items = [...stepsEl.querySelectorAll('.step2')];
    const line = stepsEl.querySelector('.steps2__line');
    const phone = matchMedia('(max-width: 800px)');
    const onRow = () => {
      if (!phone.matches) return;
      const max = stepsEl.scrollWidth - stepsEl.clientWidth;
      const at = max > 0 ? (stepsEl.scrollLeft / max) * (items.length - 1) : 0;
      items.forEach((it, k) => {
        it.style.setProperty('--f', Math.min(1, Math.max(0, at - k)).toFixed(3));
        it.classList.toggle('is-on', at >= k - 0.4);
      });
    };
    stepsEl.addEventListener('scroll', onRow, { passive: true });
    addEventListener('resize', onRow);
    if (hasGsap && !reduce) {
      gsap.matchMedia()
        .add('(min-width: 801px)', () => {
          ScrollTrigger.create({
            trigger: stepsEl, start: 'top 75%', end: 'bottom 55%', scrub: true,
            onUpdate: self => {
              line.style.setProperty('--p', self.progress.toFixed(3));
              items.forEach((it, k) => it.classList.toggle('is-on', self.progress >= k / items.length + 0.02));
            },
          });
          gsap.from(items, { y: 50, opacity: 0, duration: 0.9, ease: 'back.out(1.6)', stagger: 0.12, scrollTrigger: { trigger: stepsEl, start: 'top 80%', once: true } });
        })
        .add('(max-width: 800px)', () => {
          onRow();
          gsap.from(items, { x: 60, opacity: 0, duration: 0.9, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: stepsEl, start: 'top 85%', once: true } });
        });
    } else {
      line.style.setProperty('--p', 1);
      if (phone.matches) onRow(); else items.forEach(it => it.classList.add('is-on'));
      phone.addEventListener('change', () => { if (phone.matches) onRow(); else items.forEach(it => it.classList.add('is-on')); });
    }
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
