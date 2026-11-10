/* CM MainWorks case study: the site's hero, live. A port of VanHero.tsx from the CM MainWorks
   site (same numbers, same easing): the van drives along the street, everything behind the middle
   of the van is the renovated house, everything ahead of it the tired one. Plays when it comes into
   view and again on "Play again". Reduced motion shows the finished house. */
(() => {
  // The logo film plays while it's on screen
  document.querySelectorAll('[data-cmw-film]').forEach(v => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { v.preload = 'metadata'; v.controls = true; return; }
    new IntersectionObserver(([e]) => { if (e.isIntersecting) v.play().catch(() => {}); else v.pause(); }, { threshold: 0.4 }).observe(v);
  });
})();
(() => {
  const root = document.querySelector('[data-cmw-street]');
  if (!root) return;
  const svg = root.querySelector('svg');
  const replay = document.querySelector('[data-cmw-replay]');
  const W = 1600, VAN_SCALE = 1.05, VAN_Y = 432 - 130 * VAN_SCALE, VAN_MID = 128 * VAN_SCALE;
  const WHEEL_R = 20, START = -260, END = 1730, PASS = 713, FULL_RUN = 2 * (PASS - START), ENTER = 170;
  const TICKS = [606, 700, 792, 902, 1090];
  const lingering = t => t + (0.62 * Math.sin(2 * Math.PI * t)) / (2 * Math.PI);

  const a = svg.querySelector('#vh-a'), b = svg.querySelector('#vh-b');
  const setEdge = e => {
    a.setAttribute('width', String(Math.max(0, e)));
    b.setAttribute('x', String(e));
    b.setAttribute('width', String(Math.max(0, W - e)));
  };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!window.gsap || reduce) {
    setEdge(W);
    svg.querySelector('.vh-van')?.setAttribute('transform', `translate(${END + 200} ${VAN_Y}) scale(${VAN_SCALE})`);
    if (replay) replay.hidden = true;
    return;
  }

  const van = svg.querySelector('.vh-van'), body = svg.querySelector('.vh-body');
  const wheels = gsap.utils.toArray(svg.querySelectorAll('.vh-wheel'));
  const ticks = gsap.utils.toArray(svg.querySelectorAll('.vh-pop'));
  const sparks = gsap.utils.toArray(svg.querySelectorAll('.vh-spark'));
  const arm = svg.querySelector('.vh-arm'), tail = svg.querySelector('.vh-tail');

  gsap.set(ticks, { scale: 0, transformOrigin: '50% 50%' });
  gsap.set(sparks, { scale: 0, opacity: 0, transformOrigin: '50% 50%' });
  gsap.set(arm, { rotation: 0, svgOrigin: '411 310' });
  gsap.set(tail, { rotation: 0, svgOrigin: '450 341' });
  wheels.forEach(w => gsap.set(w, { svgOrigin: `${w.dataset.cx} 110` }));
  const wag = gsap.to(tail, { rotation: 24, duration: 0.3, yoyo: true, repeat: -1, ease: 'sine.inOut', paused: true });
  const bounce = gsap.to(body, { y: -1.4, duration: 0.17, yoyo: true, repeat: -1, ease: 'sine.inOut', paused: true });

  const state = { x: -ENTER };
  let popped = 0, waved = false, run = null;
  const render = () => {
    const edge = state.x + VAN_MID;
    gsap.set(van, { x: state.x, y: VAN_Y, scale: VAN_SCALE });
    const turn = (state.x / (2 * Math.PI * WHEEL_R * VAN_SCALE)) * 360;
    wheels.forEach(w => gsap.set(w, { rotation: turn }));
    setEdge(edge);
    while (popped < TICKS.length && edge > TICKS[popped] + 36) {
      gsap.to(ticks[popped], { scale: 1, duration: 0.5, ease: 'back.out(2.6)' });
      popped++;
    }
    if (!waved && edge > 1130) {
      waved = true;
      gsap.to(sparks, { scale: 1, opacity: 1, duration: 0.4, stagger: 0.07, ease: 'back.out(3)' });
      gsap.timeline()
        .to(arm, { rotation: 150, duration: 0.35, ease: 'back.out(2)' })
        .to(arm, { rotation: 128, duration: 0.2, yoyo: true, repeat: 5, ease: 'sine.inOut' })
        .to(arm, { rotation: 0, duration: 0.4, ease: 'power2.inOut' }, '+=0.4');
      wag.timeScale(2.4);
      gsap.delayedCall(2.4, () => wag.timeScale(1));
    }
  };

  // What part of the street is on screen: phones crop the ends (preserveAspectRatio slice)
  const visible = () => {
    const box = svg.getBoundingClientRect();
    const scale = Math.max(box.width / W, box.height / 440);
    const shown = box.width / scale;
    const left = (W - shown) / 2;
    return { left, right: left + shown };
  };

  const play = () => {
    run?.kill();
    const view = visible();
    const from = view.left - ENTER;
    const past = 2 * PASS - from;
    const off = Math.max(past, view.right + 20);
    state.x = from; popped = 0; waved = false;
    gsap.set(ticks, { scale: 0 });
    gsap.set(sparks, { scale: 0, opacity: 0 });
    render();
    bounce.play(); wag.play();
    const run1 = 5.6 * Math.max(0.55, (past - from) / FULL_RUN);
    const speed = (1.62 * (past - from)) / run1;
    root.classList.add('is-live');
    van.classList.add('is-driving');
    run = gsap.timeline({ onComplete: () => {
      bounce.pause(); wag.pause(); van.classList.remove('is-driving');
      gsap.to(tail, { rotation: 0, duration: 0.4, ease: 'sine.out', onComplete: () => root.classList.remove('is-live') });
    } })
      .to(state, { x: past, duration: run1, ease: lingering, onUpdate: render })
      .to(state, { x: off, duration: (off - past) / speed, ease: 'none', onUpdate: render });
  };

  // Park the van just off the left edge until the street is in view
  state.x = visible().left - ENTER; render();
  if (window.ScrollTrigger) ScrollTrigger.create({ trigger: root, start: 'top 75%', once: true, onEnter: play });
  else play();
  replay?.addEventListener('click', play);
})();

/* The fourth phone in the parade: his menu, a tap opens the Renovations list, a tap on Kitchens,
   and that page slides in and scrolls. Loops while it's on screen; reduced motion shows the menu open. */
(() => {
  const ph = document.querySelector('[data-cmw-menu]');
  if (!ph) return;
  const menu = ph.querySelector('.cmw-ph__menu'), tap = ph.querySelector('.cmw-ph__tap');
  const page = ph.querySelector('.cmw-ph__page'), pageImg = page.querySelector('img');
  if (!window.gsap || matchMedia('(prefers-reduced-motion: reduce)').matches) { menu.style.opacity = 1; return; }
  const press = (x, y) => gsap.timeline()
    .set(tap, { left: x + '%', top: y + '%', scale: 0.4, opacity: 0 })
    .to(tap, { scale: 1, opacity: 1, duration: 0.18, ease: 'power2.out' })
    .to(tap, { scale: 1.5, opacity: 0, duration: 0.35, ease: 'power1.out' });
  const travel = () => -Math.max(0, pageImg.offsetHeight - page.offsetHeight) * 0.32;
  const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.6, paused: true })
    .set(menu, { opacity: 0 }).set(page, { xPercent: 100, opacity: 1 }).set(pageImg, { y: 0 })
    .add(press(89.2, 14.2), 1.4)
    .to(menu, { opacity: 1, duration: 0.35, ease: 'power2.out' }, 1.6)
    .add(press(50, 43.4), 3.1)
    .to(page, { xPercent: 0, duration: 0.65, ease: 'power3.inOut' }, 3.35)
    .to(pageImg, { y: travel, duration: 3.6, ease: 'sine.inOut' }, 4.6)
    .to(page, { opacity: 0, duration: 0.5 }, 9.2)
    .set(menu, { opacity: 0 }, 9.2);
  gsap.set(page, { xPercent: 100, opacity: 1 });
  new IntersectionObserver(([e]) => (e.isIntersecting ? tl.play() : tl.pause())).observe(ph);
})();

/* The before and after in Up close: drag (or arrow keys) to compare; it sweeps once when it comes into view */
(() => {
  document.querySelectorAll('[data-cmw-ba]').forEach((ba) => {
    const range = ba.querySelector('input');
    const set = (v) => { ba.style.setProperty('--pos', v + '%'); range.value = v; };
    range.addEventListener('input', () => set(+range.value));
    if (!window.gsap || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const st = { v: 50 };
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      gsap.timeline({ delay: 0.6, onUpdate: () => set(Math.round(st.v * 10) / 10) })
        .to(st, { v: 18, duration: 0.9, ease: 'power2.inOut' })
        .to(st, { v: 82, duration: 1.3, ease: 'power2.inOut' })
        .to(st, { v: 50, duration: 0.9, ease: 'power2.inOut' });
    }, { threshold: 0.5 });
    io.observe(ba);
  });
})();
