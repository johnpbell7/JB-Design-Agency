// Home hero (big type) + phone-fan section. Ported from heroes/hero-02 and hero-07 by tools/port_hero.py

/* Phone-fan screens sit below the first screen: they start loading once the hero's
   laptop site has arrived (so they don't slow it down), or sooner if the fan nears view */
(() => {
  const imgs = [...document.querySelectorAll('.pf-card img[data-src]')];
  if (!imgs.length) return;
  let done = false;
  const go = () => { if (done) return; done = true; imgs.forEach(x => { if (x.dataset.srcset) { x.srcset = x.dataset.srcset; x.removeAttribute('data-srcset'); } x.src = x.dataset.src; x.removeAttribute('data-src'); }); };
  const first = document.querySelector('.bt-ghost__screen img.is-on');
  const near = () => { if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => e.isIntersecting && go(), { rootMargin: '50% 0px' }).observe(imgs[0].closest('.pf-fan') || imgs[0]); else go(); };
  if (!first) return near(); // phones (no laptop backdrop): load the fan as it nears view
  if (first.complete && first.naturalWidth) return go();
  first.addEventListener('load', go, { once: true });
  first.addEventListener('error', go, { once: true });
  setTimeout(go, 4000);
  if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => e.isIntersecting && go(), { rootMargin: '50% 0px' }).observe(imgs[0].closest('.pf-fan') || imgs[0]);
})();

/* ===== Hero backdrop picker: ?ghost=1..4 swaps the faded laptop for one of the
   options kept as <template data-ghost="N"> in index.html. No query = laptop.
   Runs first so the options' markup is in place before the hero animates.
   Delete this, the unused templates and their ghostN() blocks once one is chosen. ===== */
(() => {
  // phones default to the work wall (columns of phone screens): a faded desktop site reads as mush that small
  const n = new URLSearchParams(location.search).get('ghost') || (matchMedia('(max-width: 560px)').matches ? '1' : null);
  const hero = document.querySelector('[data-bt]');
  const tpl = hero && n && hero.querySelector(`template[data-ghost="${n}"]`);
  if (!tpl) return;
  hero.dataset.ghost = n;
  hero.querySelector('.bt-ghost')?.remove();
  hero.querySelector('.bt-ghost__glow')?.remove();
  const frag = tpl.content.cloneNode(true);
  const logos = frag.querySelector('[data-g3-logos]');
  hero.insertBefore(frag, hero.querySelector('.wrap'));
  if (logos) hero.querySelector('.bt-proof').after(logos);
})();

  (() => {
    document.documentElement.classList.remove('no-js');
    const hero = document.querySelector('[data-bt]');
    const marks = [...hero.querySelectorAll('.bt-title .hl')];
    const pieces = [...hero.querySelectorAll('.bt-piece')];
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduce || !window.gsap) { marks.forEach(m => m.classList.add('is-lit')); return; }

    /* ---- Entrance: lines rise, highlighter sweeps word by word, work drops in ---- */
    gsap.set(marks, { transition: 'none', backgroundSize: '0% 62%' });
    const tl = gsap.timeline({ delay: 0.15 });
    tl.from('.bt-title .bt-ln > span', { yPercent: 110, duration: 1.1, ease: 'expo.out', stagger: 0.1 }, 0)
      .from('[data-in]', { y: 14, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.12 }, 0.35);
    marks.forEach((m, i) => tl.to(m, { backgroundSize: '100% 62%', duration: 0.45, ease: 'power2.inOut' }, 0.5 + i * 0.26));
    if (pieces.length) tl.from(pieces.map(p => p.querySelector('.bt-fl')), {
        opacity: 0, scale: 0.55, y: 60, rotation: (i) => (i % 2 ? 18 : -18),
        duration: 1, ease: 'back.out(1.7)', stagger: { each: 0.1, from: 'random' }
      }, 0.9);
    tl.add(startIdle, 1.9);

    /* ---- Idle: each piece floats on its own rhythm; the phone scrolls its real page ---- */
    function startIdle() {
      pieces.forEach((p, i) => {
        const fl = p.querySelector('.bt-fl');
        gsap.to(fl, { y: i % 2 ? 10 : -10, rotation: i % 2 ? 1.6 : -1.6, duration: 2.6 + i * 0.45, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      });
      const shot = hero.querySelector('.bt-phone .bt-screen img');
      if (shot) gsap.to(shot, { yPercent: -14, duration: 9, ease: 'sine.inOut', yoyo: true, repeat: -1, repeatDelay: 1.2 });
    }

    /* ---- Mouse parallax (fine pointers only) ---- */
    if (matchMedia('(pointer: fine)').matches) {
      const movers = pieces.map(p => ({ d: +p.dataset.depth || 1, x: gsap.quickTo(p, 'x', { duration: 0.9, ease: 'power3.out' }), y: gsap.quickTo(p, 'y', { duration: 0.9, ease: 'power3.out' }) }));
      const title = hero.querySelector('.bt-title');
      const tx = gsap.quickTo(title, 'x', { duration: 1.2, ease: 'power3.out' }), ty = gsap.quickTo(title, 'y', { duration: 1.2, ease: 'power3.out' });
      hero.addEventListener('pointermove', e => {
        const r = hero.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - 0.5, ny = (e.clientY - r.top) / r.height - 0.5;
        movers.forEach(m => { m.x(nx * 34 * m.d); m.y(ny * 26 * m.d); });
        tx(nx * -8); ty(ny * -6);
      });
      hero.addEventListener('pointerleave', () => { movers.forEach(m => { m.x(0); m.y(0); }); tx(0); ty(0); });
    }
  })();
  

  (() => {
    document.documentElement.classList.remove('no-js');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const D = s => (reduce ? 0 : s);

    // Status bar icons (signal, wi-fi, battery)
    const icons = '<svg viewBox="0 0 18 12"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5.5" width="3" height="6.5" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>' +
      '<svg viewBox="0 0 16 12"><path d="M8 2.6c2.3 0 4.4.9 6 2.4l1.2-1.3A10.4 10.4 0 0 0 8 .8 10.4 10.4 0 0 0 .8 3.7L2 5c1.6-1.5 3.7-2.4 6-2.4Zm0 3.6c1.3 0 2.5.5 3.4 1.3l1.2-1.3A6.7 6.7 0 0 0 8 4.4c-1.8 0-3.4.7-4.6 1.8l1.2 1.3c.9-.8 2.1-1.3 3.4-1.3Zm0 3.5c-.6 0-1.1.2-1.5.6L8 11.9l1.5-1.6c-.4-.4-.9-.6-1.5-.6Z"/></svg>' +
      '<svg viewBox="0 0 27 12"><rect x="0.6" y="0.6" width="22.8" height="10.8" rx="3.2" fill="none" stroke="currentColor" stroke-width="1.1" opacity="0.4"/><rect x="2.2" y="2.2" width="17.6" height="7.6" rx="1.8"/><path d="M24.6 4v4c.8-.3 1.4-1.1 1.4-2s-.6-1.7-1.4-2Z" opacity="0.45"/></svg>';
    document.querySelectorAll('[data-pf-icons]').forEach(el => (el.innerHTML = icons));

    const fan = document.querySelector('[data-pf-fan]');
    const stage = document.querySelector('[data-pf-stage]');
    const cards = gsap.utils.toArray('.pf-card');
    const lifts = cards.map(c => c.querySelector('.pf-card__lift'));
    const N = cards.length, MID = 2;
    const ANG = [-20, -10, 0, 10, 20];
    const zFan = i => 10 - Math.abs(i - MID) * 2 + (i > MID ? 1 : 0);
    const data = cards.map(c => ({
      href: c.getAttribute('href'),
      pen: c.style.getPropertyValue('--pen'),
      name: c.querySelector('.pf-tag strong').textContent,
      kind: c.querySelector('.pf-tag span').textContent.split(' · ')[0],
    }));

    /* ---------- Screens gently scroll their page ---------- */
    cards.forEach((c, i) => {
      const img = c.querySelector('img');
      const h = +img.dataset.h;
      // scroll about three screens' worth of the page, then drift back up
      const pct = -Math.min(3.2 * 1.95 * 780 / h, 0.7) * 100;
      gsap.set(img, { yPercent: 0 });
      if (!reduce) gsap.to(img, { yPercent: pct, duration: 15 + i * 1.7, ease: 'sine.inOut', repeat: -1, yoyo: true, repeatDelay: 1.4, delay: 2 + ((i * 1.3) % 3) });
    });

    /* ---------- Scribble draws on ---------- */
    const strokes = gsap.utils.toArray('[data-pf-scribble] path');
    // dash parked past the path start so the round cap doesn't leave a dot before drawing
    strokes.forEach(p => { const l = p.getTotalLength(); gsap.set(p, { strokeDasharray: `${l} ${l + 240}`, strokeDashoffset: reduce ? 0 : l + 130 }); });

    let mode = '', active = -1;
    // Desktop and phone both fan out like a hand of cards; the phone fan is
    // tighter, with smaller phones, and always has one phone lifted.
    const ANGM = [-24, -12, 0, 12, 24];
    const cap = document.querySelector('[data-pf-cap]');
    function caption() {
      const d = data[active < 0 ? MID : active];
      cap.href = d.href; cap.style.setProperty('--pen', d.pen);
      cap.innerHTML = '<mark>' + d.name + '</mark> <span aria-hidden="true">→</span>';
      gsap.fromTo(cap, { y: 6, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: D(0.35), ease: 'power2.out', overwrite: 'auto' });
    }

    /* ---------- Fan (desktop + phone) ---------- */
    function fanLayout(dur = 0.6) {
      const mob = mode === 'mfan';
      const A = mob ? ANGM : ANG, gap = mob ? 3 : 4, rise = mob ? -30 : -78;
      cards.forEach((c, i) => {
        const on = i === active;
        const spread = active < 0 || on ? 0 : (i < active ? -gap : gap);
        c.style.setProperty('--a', (A[i] + spread) + 'deg');
        c.style.setProperty('--n', A[i] + spread);
        c.style.setProperty('--na', Math.abs(A[i] + spread));
        c.style.zIndex = on ? 50 : zFan(i);
        c.classList.toggle('is-active', on && !mob);
        gsap.to(c, { rotation: A[i] + spread, x: 0, y: 0, scale: 1, autoAlpha: 1, duration: D(dur), ease: 'power3.out', overwrite: 'auto' });
        gsap.to(lifts[i], { y: on ? rise : 0, scale: on ? (mob ? 1.08 : 1.05) : 1, duration: D(dur * 0.9), ease: on ? 'back.out(1.6)' : 'power3.out', overwrite: 'auto' });
      });
    }
    function setActive(i) {
      if (i === active) return;
      active = i; fanLayout();
      if (mode === 'mfan') caption();
    }

    // Phone: a sideways swipe moves the lifted phone along the fan
    let down = null, moved = false, lastType = 'mouse';
    stage.addEventListener('pointerdown', e => {
      lastType = e.pointerType;
      moved = false;
      down = mode === 'mfan' ? { x: e.clientX, y: e.clientY } : null;
    });
    window.addEventListener('pointermove', e => {
      if (!down) return;
      const dx = e.clientX - down.x, dy = e.clientY - down.y;
      if (!moved && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) moved = true;
    });
    const release = e => {
      if (!down) return;
      const dx = e.clientX - down.x;
      if (moved && Math.abs(dx) > 36) setActive(Math.min(N - 1, Math.max(0, active - Math.sign(dx))));
      down = null;
    };
    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', () => { down = null; });

    cards.forEach((c, i) => {
      c.addEventListener('mouseenter', () => { if (mode === 'pf-fan') setActive(i); });
      // keyboard focus lifts a phone (a tap also focuses, but the click below handles that)
      c.addEventListener('focus', () => { if (c.matches(':focus-visible')) setActive(i); });
      c.addEventListener('click', e => {
        if (moved) { e.preventDefault(); return; }
        // touch: first tap lifts a phone, a second tap opens its case study
        if ((mode === 'mfan' || lastType !== 'mouse') && active !== i) { e.preventDefault(); setActive(i); }
      });
      c.addEventListener('dragstart', e => e.preventDefault());
    });
    stage.addEventListener('mouseleave', () => { if (mode === 'pf-fan') setActive(-1); });
    fan.addEventListener('focusout', e => { if (mode === 'pf-fan' && !fan.contains(e.relatedTarget)) setActive(-1); });

    /* ---------- Intro: copy rises, scribble colours in, the fan deals out ---------- */
    const mark = document.querySelector('.pf-hero__title .hl');
    const mm = gsap.matchMedia();
    let introDone = false;

    mm.add({ desk: '(min-width: 861px)', mob: '(max-width: 860px)' }, ctx => {
      const { desk } = ctx.conditions;
      mode = desk ? 'pf-fan' : 'mfan';
      active = desk ? -1 : MID;
      cards.forEach(c => (c.tabIndex = 0));
      gsap.set(cards, { transformOrigin: desk ? '50% 135%' : '50% 150%', autoAlpha: 1 });
      cards.forEach((c, i) => { c.style.zIndex = zFan(i); });
      if (!desk) caption();

      if (introDone || reduce) {
        fanLayout(0);
        mark.classList.add('is-lit');
        introDone = true;
        return;
      }
      introDone = true;

      // Parked until the section scrolls into view: copy lowered, scribble undrawn,
      // highlight empty and the five phones squared up in a stack, out of sight.
      const A = desk ? ANG : ANGM;
      gsap.set('.pf-rv', { y: 26, autoAlpha: 0 });
      gsap.set(mark, { transition: 'none', backgroundSize: '0% 72%' }); // case.js lights marks on entry; this one waits for the fan
      gsap.set(cards, { rotation: () => gsap.utils.random(-3, 3), y: desk ? 140 : 90, autoAlpha: 0 });
      gsap.set(lifts, { y: 0, scale: 1 });
      if (!desk) gsap.set('.pf-deck-cap', { autoAlpha: 0, y: 10 });

      // In view: copy rises, the scribble draws on stroke by stroke, the stack deals
      // out into the fan, then the highlight sweeps across "like to use."
      // Phones: the copy sits a screen above the phones, so it rises on its own and the scribble
      // and the deal wait until the phones themselves come into view (drawn a little slower)
      const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' }, onStart: () => { introDone = true; } });
      if (desk) tl.to('.pf-rv', { y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.06 }, 0);
      else ScrollTrigger.create({ trigger: '.pf-hero', start: 'top 82%', once: true, onEnter: () => gsap.to('.pf-rv', { y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.06, ease: 'power3.out' }) });
      tl.to(strokes, { strokeDashoffset: 0, duration: desk ? 0.22 : 0.4, ease: 'power1.inOut', stagger: desk ? 0.14 : 0.22 }, 0.1)
        .to(cards, { y: 0, autoAlpha: 1, duration: 0.45, stagger: 0.03 }, 0.1)
        .to(cards, { rotation: i => A[i], duration: 0.6, ease: 'back.out(1.4)', stagger: { each: 0.04, from: 'center' } }, 0.35)
        .to(mark, { backgroundSize: '100% 72%', duration: 0.5, ease: 'power2.inOut' }, '-=0.3')
        .add(() => mark.classList.add('is-lit'));
      if (!desk) tl.add(() => fanLayout(0.6), '-=0.6').to('.pf-deck-cap', { autoAlpha: 1, y: 0, duration: 0.5 }, '-=0.2');
      ScrollTrigger.create({ trigger: desk ? '.pf-hero' : '[data-pf-fan]', start: desk ? 'top 82%' : 'top 72%', once: true, onEnter: () => tl.play() });
    });
  })();
  
// Fit the big headline to its box: measure the widest line once fonts are in,
// then set the size so it always fits (no cropping on any screen).
(() => {
  const stage = document.querySelector('.bt-hero .bt-stage');
  const wrap = stage?.closest('.wrap');
  if (!stage || !wrap) return;
  const fit = () => {
    stage.style.removeProperty('--fit');
    if (innerWidth <= 560) return; // phones use a 4-line layout sized in CSS
    const base = parseFloat(getComputedStyle(stage).fontSize);
    const widest = Math.max(...[...stage.querySelectorAll('.bt-ln')].map(l => {
      const inner = l.firstElementChild;
      return (parseFloat(getComputedStyle(l).paddingLeft) || 0) + inner.scrollWidth;
    }));
    const room = wrap.clientWidth - (parseFloat(getComputedStyle(wrap).paddingLeft) || 0) - (parseFloat(getComputedStyle(wrap).paddingRight) || 0);
    if (widest > room * 0.985) stage.style.setProperty('--fit', `${Math.floor(base * room * 0.985 / widest)}px`);
  };
  (document.fonts?.ready || Promise.resolve()).then(fit);
  addEventListener('resize', () => { clearTimeout(fit.t); fit.t = setTimeout(fit, 120); });
  addEventListener('load', fit);
})();

// Faded laptop behind the headline: each site scrolls slowly, then crossfades to the next
(() => {
  const imgs = [...document.querySelectorAll('.bt-ghost__screen img')];
  if (!imgs.length || !window.gsap || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  // only the first site loads with the page; each next one loads while the current one scrolls
  const fetch = x => { if (x.dataset.src) { x.src = x.dataset.src; x.removeAttribute('data-src'); } };
  let i = 0;
  const show = () => {
    const img = imgs[i], view = img.closest('.bt-ghost__screen');
    fetch(imgs[(i + 1) % imgs.length]);
    imgs.forEach(x => x.classList.toggle('is-on', x === img));
    const hero = document.querySelector('.bt-hero'), chip = document.querySelector('[data-now-chip]'), nm = document.querySelector('[data-now-name]');
    if (hero && img.dataset.col) hero.style.setProperty('--glow', img.dataset.col);
    if (chip && img.dataset.href) { chip.href = img.dataset.href; nm.textContent = img.dataset.name; gsap.fromTo(nm, { y: 6, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }); }
    const travel = Math.max(0, img.offsetHeight - view.offsetHeight) * 0.55;
    gsap.fromTo(img, { y: 0 }, { y: -travel, duration: 9, ease: 'sine.inOut', onComplete: () => { i = (i + 1) % imgs.length; const n = imgs[i]; n.complete ? show() : n.addEventListener('load', show, { once: true }); } });
  };
  const first = imgs[0];
  first.complete && first.naturalWidth ? show() : first.addEventListener('load', show, { once: true });
})();

/* ---------------------------------------------------------------------
   Backdrop option 1 · Work wall (ghost1)
   Builds three columns from the phone fan's own captures, each showing
   four screens from different depths of the pages, doubled for a
   seamless loop. Columns run in opposite directions; paused off-screen
   and still for reduced motion.
   --------------------------------------------------------------------- */
(() => {
  const root = document.querySelector('.bt-g1');
  if (!root) return;
  const shots = [...document.querySelectorAll('.pf-card .pf-screen__page img')].map(i => (i.dataset.src || i.getAttribute('src')).replace(/captures\/([^/]+)\/home-mobile(-top)?\.webp$/, 'wall/$1.webp')); // small 360px copies of each site's top four screens
  const depth = [0, 0.3, 0.12, 0.5];
  const cols = [...root.querySelectorAll('[data-g1-col]')];
  cols.forEach((col, c) => {
    const set = [0, 1, 2, 3].map(k => {
      const src = shots[(c * 2 + k) % shots.length];
      return `<span class="bt-g1__shot"><img src="${src}" alt="" decoding="async" style="object-position:50% ${depth[(k + c) % 4] * 100}%"></span>`;
    }).join('');
    col.innerHTML = `<div class="bt-g1__track">${set}${set}</div>`;
  });
  if (!window.gsap || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  gsap.from(root, { autoAlpha: 0, duration: 1.6, delay: 0.5, ease: 'power2.out' });
  const runs = cols.map((col, c) => {
    const down = c % 2 === 1;
    return gsap.fromTo(col.firstElementChild, { yPercent: down ? -50 : 0 }, { yPercent: down ? 0 : -50, duration: 70 + c * 12, ease: 'none', repeat: -1 });
  });
  new IntersectionObserver(([e]) => runs.forEach(t => (e.isIntersecting ? t.play() : t.pause()))).observe(root.parentElement);
})();

/* ---------------------------------------------------------------------
   Backdrop option 2 · Big phone (ghost2)
   One phone scrolls each project's mobile page, then crossfades to the
   next. On each change the "grow" highlighter, the glow and the status
   bar take that project's colours.
   --------------------------------------------------------------------- */
(() => {
  const root = document.querySelector('.bt-g2');
  if (!root) return;
  const hero = root.parentElement;
  const imgs = [...root.querySelectorAll('.bt-g2__page img')];
  const screen = root.querySelector('.bt-g2__screen');
  const grow = hero.querySelector('.bt-ln--2 .hl');
  const paint = img => {
    hero.style.setProperty('--g2', img.dataset.col);
    screen.style.setProperty('--sb', img.dataset.sb);
    screen.style.setProperty('--sbt', img.dataset.sbt);
  };
  paint(imgs[0]);
  grow.style.setProperty('--pen', imgs[0].dataset.col);
  if (!window.gsap || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  gsap.from(root.querySelector('.bt-g2__phone'), { x: 120, rotation: 18, autoAlpha: 0, duration: 1.4, delay: 0.6, ease: 'expo.out' });
  let i = 0, live = true, timer;
  const show = () => {
    const img = imgs[i], prev = imgs.find(x => x.classList.contains('is-on') && x !== img);
    imgs.forEach(x => x.classList.toggle('is-on', x === img));
    paint(img);
    gsap.to(grow, { '--pen': img.dataset.col, duration: 0.8, ease: 'power2.inOut' });
    if (prev) gsap.delayedCall(1, () => gsap.set(prev, { y: 0 }));
    const travel = Math.min(img.offsetHeight * 0.32, Math.max(0, img.offsetHeight - screen.offsetHeight));
    gsap.fromTo(img, { y: 0 }, { y: -travel, duration: 6.5, ease: 'power1.inOut' });
    timer = gsap.delayedCall(7.2, next);
  };
  const next = () => {
    if (!live) { timer = gsap.delayedCall(1, next); return; }
    i = (i + 1) % imgs.length;
    const n = imgs[i];
    n.complete && n.naturalWidth ? show() : n.addEventListener('load', show, { once: true });
  };
  const first = imgs[0];
  first.complete && first.naturalWidth ? show() : first.addEventListener('load', show, { once: true });
  new IntersectionObserver(([e]) => (live = e.isIntersecting)).observe(hero);
})();

/* ---------------------------------------------------------------------
   Backdrop option 3 · Brand wash + client logos (ghost3)
   The blobs drift slowly; every few seconds the wash moves to the next
   client's colours. Hovering a logo pulls the wash to that client.
   --------------------------------------------------------------------- */
(() => {
  const root = document.querySelector('.bt-g3');
  if (!root) return;
  const hero = root.parentElement;
  const logos = [...hero.querySelectorAll('.bt-g3__logo')];
  const wash = a => {
    hero.style.setProperty('--g3a', a.style.getPropertyValue('--a'));
    hero.style.setProperty('--g3b', a.style.getPropertyValue('--b'));
  };
  wash(logos[0]);
  if (!window.gsap || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  root.querySelectorAll('.bt-g3__blob').forEach((b, k) => {
    gsap.to(b, { xPercent: [-14, 12, -10][k], yPercent: [10, -14, 12][k], scale: [1.12, 0.9, 1.15][k], duration: 14 + k * 4, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  });
  gsap.from(root, { autoAlpha: 0, duration: 2, delay: 0.3, ease: 'power2.out' });
  let i = 0, held = false, live = true;
  const cycle = () => {
    if (!held && live) { i = (i + 1) % logos.length; wash(logos[i]); }
    gsap.delayedCall(5, cycle);
  };
  gsap.delayedCall(5, cycle);
  logos.forEach((a, k) => {
    a.addEventListener('pointerenter', () => { held = true; i = k; wash(a); });
    a.addEventListener('focus', () => { held = true; i = k; wash(a); });
    a.addEventListener('pointerleave', () => (held = false));
    a.addEventListener('blur', () => (held = false));
  });
  new IntersectionObserver(([e]) => (live = e.isIntersecting)).observe(hero);
})();

/* ---------------------------------------------------------------------
   Backdrop option 4 · Browser cascade (ghost4)
   Three windows sit in back / middle / front slots. Each scrolls its
   page; every 5s the front window slides out and tucks in at the back
   (loading the next site from the pool while it's hidden).
   --------------------------------------------------------------------- */
(() => {
  const root = document.querySelector('.bt-g4');
  if (!root) return;
  const hero = root.parentElement;
  const wins = [...root.querySelectorAll('.bt-g4__win')];
  const pool = ['gosweet', 'patch-agency', 'birth-hood', 'nic-pouches', 'birdie-blooms', 'vsl-trade'].map(s => `assets/captures/${s}/home-desktop.webp`);
  const SLOT = [{ x: 14, y: -36, s: 0.9 }, { x: 7, y: -18, s: 0.95 }, { x: 0, y: 0, s: 1 }]; // back, middle, front
  const order = [...wins]; // order[k] sits in SLOT[k]
  let nextSrc = 3, live = true;
  const place = (w, k, dur = 0) => {
    w.style.zIndex = k + 1;
    return gsap.to(w, { xPercent: SLOT[k].x, yPercent: SLOT[k].y, scale: SLOT[k].s, rotation: 0, duration: dur, ease: 'power3.inOut' });
  };
  if (!window.gsap) return;
  order.forEach((w, k) => place(w, k));
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const scrolls = new Map();
  const scroll = w => {
    const img = w.querySelector('img'), view = img.parentElement;
    scrolls.get(w)?.kill();
    const go = () => {
      const travel = Math.min(img.offsetHeight * 0.5, Math.max(0, img.offsetHeight - view.offsetHeight));
      scrolls.set(w, gsap.fromTo(img, { y: 0 }, { y: -travel, duration: 16 + Math.random() * 6, ease: 'sine.inOut', yoyo: true, repeat: -1, repeatDelay: 1 }));
    };
    img.complete && img.naturalWidth ? go() : img.addEventListener('load', go, { once: true });
  };
  wins.forEach(scroll);
  gsap.from(wins, { yPercent: '+=12', autoAlpha: 0, duration: 1.2, ease: 'expo.out', stagger: 0.12, delay: 0.5 });
  const shuffle = () => {
    if (!live) return;
    const front = order.pop();
    order.unshift(front);
    order.forEach((w, k) => { if (w !== front) place(w, k, 1.1); });
    front.style.zIndex = 9;
    gsap.timeline()
      .to(front, { xPercent: 48, yPercent: -6, rotation: 4, duration: 0.6, ease: 'power2.in' })
      .add(() => {
        front.style.zIndex = 1;
        const img = front.querySelector('img');
        img.src = pool[nextSrc]; nextSrc = (nextSrc + 1) % pool.length;
        scroll(front);
      })
      .to(front, { xPercent: SLOT[0].x, yPercent: SLOT[0].y, scale: SLOT[0].s, rotation: 0, duration: 0.9, ease: 'power3.out' });
  };
  gsap.delayedCall(5, function loop() { shuffle(); gsap.delayedCall(5, loop); });
  new IntersectionObserver(([e]) => (live = e.isIntersecting)).observe(hero);
})();
