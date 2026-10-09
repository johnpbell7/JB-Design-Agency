// About page (projects/about.html) and the home About block (index.html #about).
// Line icons draw in when seen, the hero pieces deal onto the scribble and float,
// the story line fills as you scroll and lights each chapter, and the work
// thumbnails drop in. Load after case.js. Without GSAP, or with reduced motion,
// everything is simply there.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // ---------- Line icons: inline each symbol so its strokes can draw ----------
  const drawables = [];
  $$('svg[data-draw]').forEach(svg => {
    const use = svg.querySelector('use');
    const sym = use && document.querySelector(use.getAttribute('href'));
    if (!sym) return;
    svg.setAttribute('viewBox', sym.getAttribute('viewBox'));
    svg.setAttribute('aria-hidden', 'true');
    svg.replaceChildren(...[...sym.children].map(n => n.cloneNode(true)));
    if (reduce || !('IntersectionObserver' in window)) return;
    [...svg.children].forEach(n => n.setAttribute('pathLength', '1'));
    svg.classList.add('is-drawable');
    drawables.push(svg);
  });
  if (drawables.length) {
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (!e.isIntersecting) return;
      setTimeout(() => e.target.classList.add('is-drawn'), 250);
      io.unobserve(e.target);
    }), { rootMargin: '0px 0px -12% 0px' });
    drawables.forEach(svg => io.observe(svg));
  }

  // ---------- Hero: copy rises, the scribble draws, the pieces deal in and float ----------
  const collage = document.querySelector('[data-ab-collage]');
  if (collage && hasGsap && !reduce) {
    const pieces = $$('.ab-piece', collage);
    const path = collage.querySelector('.ab-scribble path');
    const len = path.getTotalLength();
    // dash parked past the start so the round cap doesn't show before drawing
    gsap.set(path, { strokeDasharray: `${len} ${len + 240}`, strokeDashoffset: len + 130 });
    gsap.timeline({ delay: 0.15 })
      .from('[data-ab-rise]', { y: 36, autoAlpha: 0, duration: 0.9, ease: 'expo.out', stagger: 0.08 })
      .to(path, { strokeDashoffset: 0, duration: 1.5, ease: 'power2.inOut' }, 0.15)
      .from(pieces, { y: 90, scale: 0.6, autoAlpha: 0, duration: 1, ease: 'back.out(1.5)', stagger: { each: 0.12, from: 'end' } }, 0.35);
    pieces.forEach((p, i) => {
      gsap.to(p, { y: i % 2 ? 7 : -7, duration: 3.2 + i * 0.5, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 2 + i * 0.25 });
      gsap.to(p, { yPercent: -(4 + i * 4), ease: 'none', scrollTrigger: { trigger: collage, start: 'top 20%', end: 'bottom top', scrub: true } });
    });
  }

  // ---------- Story: the line runs node to node and fills as you scroll ----------
  const story = document.querySelector('[data-ab-story]');
  if (story) {
    const chapters = $$('.ab-ch', story);
    const line = story.querySelector('.ab-story__line');
    const fill = line.querySelector('i');
    const nodes = chapters.map(c => c.querySelector('.ab-ch__node'));
    const size = () => {
      const top = story.getBoundingClientRect().top;
      const a = nodes[0].getBoundingClientRect(), b = nodes[nodes.length - 1].getBoundingClientRect();
      line.style.top = `${a.top + a.height / 2 - top}px`;
      line.style.bottom = 'auto';
      line.style.height = `${b.top + b.height / 2 - a.top - a.height / 2}px`;
    };
    size();
    addEventListener('resize', size);
    addEventListener('load', size);

    if (!hasGsap || reduce) {
      chapters.forEach(c => c.classList.add('is-on'));
    } else {
      ScrollTrigger.addEventListener('refreshInit', size);
      gsap.fromTo(fill, { scaleY: 0 }, {
        scaleY: 1, ease: 'none',
        scrollTrigger: { trigger: nodes[0], endTrigger: nodes[nodes.length - 1], start: 'center 60%', end: 'center 60%', scrub: 0.5 },
      });
      chapters.forEach((ch, i) => {
        ScrollTrigger.create({
          trigger: nodes[i], start: 'center 60%',
          onEnter: () => ch.classList.add('is-on'), onLeaveBack: () => ch.classList.remove('is-on'),
        });
        gsap.from(ch.querySelector('.ab-ch__copy'), { y: 40, autoAlpha: 0, duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: ch, start: 'top 82%', once: true } });
        const shots = $$('.ab-shot', ch);
        if (shots.length) gsap.from(shots, { y: 70, scale: 0.85, autoAlpha: 0, duration: 1, ease: 'back.out(1.4)', stagger: 0.09, scrollTrigger: { trigger: ch, start: 'top 72%', once: true } });
      });
    }
  }
})();
