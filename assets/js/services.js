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
