// PATCH page: business cards and the ID badge flip on click/tap (hover flips
// them on pointer devices, in CSS); the kit tiles unveil as they scroll in, and the Up close pieces
// drop into place on their panels. Loads after case.js and case-plus.js.
document.querySelectorAll('.bc, .pb__flip').forEach(el => {
  const flip = () => { el.classList.toggle('is-flipped'); el.setAttribute('aria-pressed', el.classList.contains('is-flipped')); };
  el.addEventListener('click', flip);
  el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } });
});

(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !window.gsap || !window.ScrollTrigger) return;

  // Kit: each tile opens from a slightly inset frame, row by row
  document.querySelectorAll('[data-kit] .pk-tile').forEach((tile, i) => {
    const img = tile.matches('.pk-tile--cards') ? null : tile.querySelector('img');
    gsap.set(tile, { clipPath: 'inset(9% 9% 9% 9% round 22px)', opacity: 0 });
    if (img) gsap.set(img, { scale: 1.14 });
    ScrollTrigger.create({
      trigger: tile, start: 'top 90%', once: true,
      onEnter: () => {
        const d = (i % 3) * 0.08;
        gsap.to(tile, { clipPath: 'inset(0% 0% 0% 0% round 22px)', opacity: 1, duration: 1.2, ease: 'expo.out', delay: d, onComplete: () => gsap.set(tile, { clearProps: 'clipPath' }) });
        if (img) gsap.to(img, { scale: 1, duration: 1.6, ease: 'expo.out', delay: d, onComplete: () => gsap.set(img, { clearProps: 'scale,transform' }) });
      },
    });
  });

  // Up close: cards and badge fall onto the panel with a little overshoot
  document.querySelectorAll('.pk-break').forEach(fig => {
    const pieces = fig.querySelectorAll('.pk-break__piece, .pb');
    gsap.set(pieces, { y: -70, opacity: 0 });
    ScrollTrigger.create({
      trigger: fig, start: 'top 80%', once: true,
      onEnter: () => gsap.to(pieces, { y: 0, opacity: 1, duration: 1, ease: 'back.out(1.6)', stagger: 0.12, onComplete: () => gsap.set(pieces, { clearProps: 'transform' }) }),
    });
  });
})();

// Sector switcher + enquiry card (ported from the site's industries grid and
// contact form): the sector picked on the right feeds the brief on the left.
(() => {
  const ind = document.querySelector('[data-ind]'), enq = document.querySelector('[data-enq]');
  if (!ind || !enq) return;
  const sum = k => enq.querySelector(`[data-sum-${k}]`);
  const set = (k, text) => {
    const el = sum(k);
    if (el.textContent === text) return;
    el.textContent = text;
    el.classList.remove('is-new'); void el.offsetWidth; el.classList.add('is-new');
  };
  // Sector tabs swap the panel
  const art = ind.querySelector('[data-ind-art]');
  const tabs = [...ind.querySelectorAll('.pk-ind__tab')];
  tabs.forEach(t => { const im = new Image(); im.src = t.dataset.art; }); // warm the cache
  let swap;
  const pick = (tab, focus) => {
    tabs.forEach(t => { const on = t === tab; t.classList.toggle('is-on', on); t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; });
    if (focus) tab.focus();
    ind.querySelector('[data-ind-n]').textContent = `${tab.dataset.n} / 0${tabs.length}`;
    const name = tab.querySelector('span').textContent;
    ind.querySelector('[data-ind-name]').textContent = name;
    art.classList.add('is-out');
    clearTimeout(swap);
    swap = setTimeout(() => { art.src = tab.dataset.art; art.classList.remove('is-out'); }, 220);
    set('sec', name);
  };
  tabs.forEach((t, i) => {
    t.tabIndex = i ? -1 : 0;
    t.addEventListener('click', () => pick(t));
    t.addEventListener('keydown', e => {
      const d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
      if (d) { e.preventDefault(); pick(tabs[(i + d + tabs.length) % tabs.length], true); }
    });
  });
  // Service and region chips write the brief
  enq.querySelectorAll('[role="radiogroup"]').forEach(group => {
    const chips = [...group.querySelectorAll('.pk-chip')];
    chips.forEach(c => c.addEventListener('click', () => {
      chips.forEach(x => { x.classList.toggle('is-on', x === c); x.setAttribute('aria-checked', x === c); });
      if (c.dataset.svc) set('svc', c.dataset.svc);
      if (c.dataset.reg) set('reg', c.dataset.reg);
    }));
  });
  // Send shows the site's thank-you state, then the card resets (nothing is sent)
  let back;
  enq.querySelector('[data-enq-go]').addEventListener('click', () => {
    enq.classList.add('is-sent');
    clearTimeout(back);
    back = setTimeout(() => enq.classList.remove('is-sent'), 2600);
  });
})();
