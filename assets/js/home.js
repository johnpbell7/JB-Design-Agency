// Home page behaviour. Everything degrades to a calm, static page when GSAP
// is missing or the visitor prefers reduced motion.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const desktop = () => innerWidth > 860;
  const PENS = ['#fff04d', '#ff9ed2', '#7fd0ff', '#ffb547', '#c7f016'];
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // ---------- Smooth scrolling (Lenis), kept in step with ScrollTrigger ----------
  let lenis = null;
  if (hasGsap && !reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const target = $(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -20 });
    }));
  }

  // ---------- Illustrations: swap doodles for real images once they exist ----------
  const available = new Set(window.ILLOS || []);
  $$('[data-illo]').forEach(fig => {
    const file = fig.dataset.illo;
    if (!available.has(file)) return;
    const img = new Image();
    img.alt = '';
    img.decoding = 'async';
    img.src = `assets/illustrations/${file}`;
    img.addEventListener('load', () => { fig.prepend(img); fig.classList.add('is-loaded'); });
  });

  // ---------- Custom cursor: a dot that grows into a label over work and drags ----------
  const cursor = $('.cursor');
  if (cursor && fine && hasGsap && !reduce) {
    document.documentElement.classList.add('has-cursor');
    const label = cursor.querySelector('span');
    gsap.set(cursor, { opacity: 0 });
    addEventListener('pointermove', () => gsap.to(cursor, { opacity: 1, duration: 0.3 }), { once: true });
    const xTo = gsap.quickTo(cursor, 'x', { duration: 0.35, ease: 'power3.out' });
    const yTo = gsap.quickTo(cursor, 'y', { duration: 0.35, ease: 'power3.out' });
    addEventListener('pointermove', e => {
      xTo(e.clientX); yTo(e.clientY);
      const t = e.target.closest('[data-cursor], [data-drag]');
      const text = t ? (t.dataset.cursor || 'Drag') : '';
      cursor.classList.toggle('is-label', !!text);
      label.textContent = text;
    });
    document.addEventListener('pointerleave', () => cursor.classList.remove('is-label'));
  }

  // ---------- Hero headline: words rise in ----------
  const title = $('[data-split]');
  if (title && hasGsap && !reduce) {
    const wrap = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.append(part); return; }
            const w = document.createElement('span'); w.className = 'w';
            const inner = document.createElement('span'); inner.textContent = part;
            w.append(inner); frag.append(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== 'MARK') wrap(n);
      });
    };
    wrap(title);
    const mark = title.querySelector('mark');
    gsap.from(title.querySelectorAll('.w > span'), { yPercent: 110, duration: 1, ease: 'expo.out', stagger: 0.07, delay: 0.15 });
    if (mark) gsap.from(mark, { opacity: 0, y: 30, duration: 0.9, ease: 'expo.out', delay: 0.15 + title.querySelectorAll('.w').length * 0.07 });
  }

  // ---------- Hero laptop: cycles through projects ----------
  $$('[data-slides]').forEach(device => {
    const slides = $$('.slide', device);
    const now = $('[data-now]', device);
    let i = 0, timer;
    const show = next => {
      slides[i].classList.remove('is-on'); slides[i].classList.add('is-leaving');
      const prev = slides[i];
      setTimeout(() => prev.classList.remove('is-leaving'), 950);
      i = next; slides[i].classList.add('is-on');
      if (now) now.textContent = slides[i].dataset.name;
    };
    const run = () => { clearInterval(timer); if (!reduce) timer = setInterval(() => show((i + 1) % slides.length), 3600); };
    run();
    device.addEventListener('pointerenter', () => clearInterval(timer));
    device.addEventListener('pointerleave', run);
  });

  // ---------- Hero floats: drag them about ----------
  $$('[data-drag]').forEach(item => {
    let sx, sy, bx = 0, by = 0, moved = false;
    item.addEventListener('pointerdown', e => {
      item.setPointerCapture(e.pointerId); item.classList.add('is-dragging');
      sx = e.clientX - bx; sy = e.clientY - by; moved = false;
    });
    item.addEventListener('pointermove', e => {
      if (!item.classList.contains('is-dragging')) return;
      bx = e.clientX - sx; by = e.clientY - sy; moved = true;
      item.style.translate = `${bx}px ${by}px`;
    });
    const drop = () => {
      item.classList.remove('is-dragging');
      if (moved && hasGsap && !reduce) gsap.fromTo(item, { scale: 1.08 }, { scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    };
    item.addEventListener('pointerup', drop);
    item.addEventListener('pointercancel', drop);
  });

  // ---------- Hero: a website that sketches, designs and builds itself ----------
  const builder = $('[data-builder]');
  if (builder) {
    const SKINS = [
      { url: 'crystalclear.co.uk', logo: 'Crystal Clear', eyebrow: 'Window cleaning', h: 'Sparkling windows, priced in 30 seconds.', sub: 'Insured, local and rain-guaranteed.', btn: 'Get a price', art: '#d-local', toast: 'Booked for Thursday' },
      { url: 'beanthere.cafe', logo: 'Bean There', eyebrow: 'Coffee & brunch', h: 'Skip the queue. Your flat white is waiting.', sub: 'Order ahead, collect in minutes.', btn: 'Order ahead', art: '#d-tea', toast: 'Ready in 8 minutes' },
      { url: 'petalandstem.co.uk', logo: 'Petal & Stem', eyebrow: 'Florist', h: 'Bouquets, delivered today.', sub: 'Order by 1pm for same-day delivery.', btn: 'Send flowers', art: '#d-flower', toast: 'Out for delivery' },
      { url: 'snipandco.co.uk', logo: 'Snip & Co', eyebrow: 'Hair & beauty', h: 'Your new favourite chair is one tap away.', sub: 'Pick a stylist, pick a time.', btn: 'Book online', art: '#d-hand', toast: 'See you at 2:30' },
      { url: 'fixwell.co.uk', logo: 'Fixwell', eyebrow: 'Plumbing & heating', h: 'Burst pipe? We’re on our way.', sub: 'Local, approved and upfront on price.', btn: 'Call us out', art: '#d-b2b', toast: 'Engineer 18 min away' },
    ];
    const q = s => $(s, builder);
    const frame = q('.builder__frame'), canvas = q('.builder__canvas');
    const headline = q('[data-b-headline]'), btn = q('[data-b-btn]'), cursorEl = q('.b-cursor'), toast = q('[data-b-toast]');
    const steps = $$('.builder__steps li', builder);
    const els = $$('.b-el', builder);
    const wait = ms => new Promise(r => setTimeout(r, ms));
    let inView = true;
    new IntersectionObserver(([e]) => { inView = e.isIntersecting; }).observe(builder);
    const setPhase = ph => {
      builder.dataset.phase = ph;
      const order = ['sketch', 'design', 'build', 'phone'];
      steps.forEach(li => {
        li.classList.toggle('is-on', li.dataset.step === ph);
        li.classList.toggle('is-done', order.indexOf(li.dataset.step) < order.indexOf(ph));
      });
    };
    const fill = s => {
      q('[data-b-url]').textContent = s.url; q('[data-b-logo]').textContent = s.logo;
      q('[data-b-eyebrow]').textContent = s.eyebrow; q('[data-b-sub]').textContent = s.sub;
      btn.textContent = s.btn; toast.textContent = s.toast; headline.textContent = s.h;
      q('[data-b-art]').setAttribute('href', s.art);
    };
    const type = async text => {
      builder.classList.add('is-typing');
      headline.textContent = '';
      for (const ch of text) { headline.textContent += ch; await wait(ch === ' ' ? 40 : 26); }
      builder.classList.remove('is-typing');
    };
    const flip = async on => {
      if (window.Flip) {
        const state = Flip.getState([frame, ...els]);
        builder.classList.toggle('is-phone', on);
        Flip.from(state, { duration: 0.9, ease: 'power3.inOut', nested: true });
      } else builder.classList.toggle('is-phone', on);
      await wait(950);
    };
    const press = async () => {
      const c = canvas.getBoundingClientRect(), b = btn.getBoundingClientRect();
      const x = b.left - c.left + b.width * 0.6, y = b.top - c.top + b.height * 0.55;
      gsap.set(cursorEl, { opacity: 1, left: c.width * 0.86, top: c.height * 0.92 });
      await new Promise(r => gsap.to(cursorEl, { left: x, top: y, duration: 0.9, ease: 'power2.inOut', onComplete: r }));
      gsap.to(btn, { scale: 0.92, duration: 0.12, yoyo: true, repeat: 1 });
      gsap.fromTo(cursorEl, { scale: 1 }, { scale: 0.8, duration: 0.12, yoyo: true, repeat: 1 });
      await wait(250);
      toast.classList.add('is-on');
      gsap.fromTo($$('.b-card', builder), { y: 0 }, { y: -8, duration: 0.35, stagger: 0.08, yoyo: true, repeat: 1, ease: 'power2.out' });
      await wait(1500);
      toast.classList.remove('is-on');
      gsap.to(cursorEl, { opacity: 0, duration: 0.3 });
    };
    const run = async () => {
      let k = 0;
      for (;;) {
        if (!inView) { await wait(500); continue; }
        const s = SKINS[k];
        builder.dataset.skin = k;
        fill(s);
        setPhase('sketch');
        gsap.from(els, { opacity: 0, scale: 0.9, duration: 0.45, ease: 'back.out(2)', stagger: 0.035 });
        await wait(2100);
        setPhase('design');
        await wait(350);
        await type(s.h);
        gsap.fromTo(q('.b-img svg'), { scale: 0.5, rotation: -12 }, { scale: 1, rotation: 0, duration: 1, ease: 'elastic.out(1, 0.5)' });
        await wait(900);
        setPhase('build');
        await press();
        setPhase('phone');
        await flip(true);
        await wait(2000);
        await flip(false);
        await wait(500);
        k = (k + 1) % SKINS.length;
      }
    };
    if (hasGsap && !reduce) run();
    else { fill(SKINS[0]); setPhase('design'); }
  }

  // ---------- Marquees speed up with your scroll, then ease back ----------
  if (hasGsap && !reduce) {
    const tracks = $$('.tape__track, .foot-marquee__track');
    let boost = 0;
    ScrollTrigger.create({ onUpdate: self => { boost = Math.min(4, Math.abs(self.getVelocity()) / 600); } });
    // Only touch the animations while the rate is actually changing: setting playbackRate on a
    // running CSS animation every frame re-syncs it with the compositor, which isn't free.
    // The (infinite) animations are looked up once: getAnimations() flushes style every call.
    let rate = 1, anims = null;
    gsap.ticker.add(() => {
      boost *= 0.92;
      const r = boost < 0.01 ? 1 : Math.round((1 + boost) * 20) / 20;
      if (r === rate) return;
      rate = r;
      if (!anims?.length) anims = tracks.flatMap(t => t.getAnimations());
      anims.forEach(a => { a.playbackRate = r; });
    });
  }

  // ---------- Chapter marker ----------
  const pill = $('.chapter-pill');
  if (pill && 'IntersectionObserver' in window) {
    const num = $('[data-chapter-num]', pill), name = $('[data-chapter-name]', pill);
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (!e.isIntersecting) return;
      const c = e.target.dataset.chapter;
      pill.classList.toggle('is-on', c !== '00');
      num.textContent = c; name.textContent = e.target.dataset.chapterLabel;
    }), { rootMargin: '-45% 0px -50% 0px' });
    $$('[data-chapter]').forEach(ch => io.observe(ch));
    const foot = $('.site-foot');
    if (foot) new IntersectionObserver(([e]) => pill.classList.toggle('is-off', e.isIntersecting)).observe(foot);
  }

  // ---------- Rotating word: '…and gyms too' ----------
  $$('[data-flip-words]').forEach(el => {
    const words = el.dataset.flipWords.split(',');
    let k = 0;
    if (!hasGsap || reduce) return;
    setInterval(() => {
      k = (k + 1) % words.length;
      gsap.to(el, { yPercent: -60, opacity: 0, duration: 0.25, ease: 'power2.in', onComplete: () => {
        el.textContent = words[k];
        gsap.fromTo(el, { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.35, ease: 'back.out(2)' });
      } });
    }, 1800);
  });

  // ---------- Sectors: scroll moves through the concept sites ----------
  const sectors = $('[data-sectors]');
  if (sectors) {
    const scenes = $$('.scene', sectors);
    const items = $$('.sector-list li', sectors);
    const url = $('[data-url]', sectors);
    const bar = $('.sectors__progress', sectors);
    const laptop = $('.sector-laptop', sectors);
    const DOMAINS = ['crystalclear.co.uk', 'keyhole-lettings.co.uk', 'beanthere.cafe', 'snipandco.co.uk', 'fixwell.co.uk', 'petalandstem.co.uk'];
    let active = -1;
    const setActive = n => {
      if (n === active) return;
      active = n;
      scenes.forEach((s, k) => s.classList.toggle('is-active', k === n));
      items.forEach((li, k) => li.classList.toggle('is-active', k === n));
      if (url) url.textContent = DOMAINS[n] || '';
    };
    setActive(0);
    if (hasGsap) {
      const st = ScrollTrigger.create({
        trigger: sectors, start: 'top top', end: 'bottom bottom',
        onUpdate: self => {
          if (!desktop()) return;
          const n = scenes.length;
          bar?.style.setProperty('--p', self.progress.toFixed(3));
          const index = Math.min(n - 1, Math.floor(self.progress * n));
          const local = Math.min(1, self.progress * n - index);
          setActive(index);
          // Hold on the hero while the cursor uses it, then scroll the concept page
          const page = scenes[index].querySelector('.cs__page');
          const view = scenes[index].querySelector('.cs');
          const pageP = Math.max(0, Math.min(1, (local - 0.4) / 0.55));
          if (page && view) page.style.transform = `translateY(${-pageP * Math.max(0, page.offsetHeight - view.offsetHeight)}px)`;
          // The laptop turns gently as you move through the sectors
          laptop?.style.setProperty('--ry', `${-14 + self.progress * 10}deg`);
          laptop?.style.setProperty('--rx', `${8 - Math.sin(local * Math.PI) * 3}deg`);
          dispatchEvent(new CustomEvent('sector:update', { detail: { index, local } }));
        },
      });
      items.forEach((li, k) => li.querySelector('button').addEventListener('click', () => {
        const y = st.start + (st.end - st.start) * ((k + 0.5) / scenes.length);
        lenis ? lenis.scrollTo(y) : scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
      }));
    }
    // On phones every scene is visible; play each while it's on screen
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(entries => entries.forEach(e => { if (!desktop()) e.target.classList.toggle('is-active', e.isIntersecting); }), { threshold: 0.3 });
      scenes.forEach(s => io.observe(s));
    }
  }

  // ---------- Statement: words fill in as you scroll ----------
  const statement = $('[data-scrub-words]');
  if (statement) {
    const split = node => [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.append(part); return; }
          const s = document.createElement('span'); s.className = 'sw'; s.textContent = part; frag.append(s);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) split(n);
    });
    split(statement);
    const all = $$('.sw', statement);
    const words = all.filter(w => !w.closest('mark'));
    const marks = $$('mark', statement).map(m => ({ m, at: all.indexOf(m.querySelector('.sw')) / all.length }));
    if (hasGsap && !reduce) {
      gsap.to(words, {
        opacity: 1, ease: 'none', stagger: 0.1,
        scrollTrigger: { trigger: statement, start: 'top 80%', end: 'bottom 45%', scrub: true,
          onUpdate: self => marks.forEach(({ m, at }) => m.classList.toggle('is-lit', self.progress >= at)) },
      });
    } else { words.forEach(w => { w.style.opacity = 1; }); marks.forEach(({ m }) => m.classList.add('is-lit')); }
  }

  // ---------- Process: the line draws as you scroll and each step lights up ----------
  // Desktop: vertical scroll drives it. Phones (<= 800px): the steps are a
  // swipeable row, and the line fills dot to dot as the row moves.
  const stepsEl = $('[data-steps]');
  if (stepsEl) {
    const items = $$('.step2', stepsEl);
    const line = $('.steps2__line', stepsEl);
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

  // ---------- Who cards: each phone runs a concept homepage that demos itself ----------
  // The mini sites are live HTML (#who in index.html). At rest each shows a finished
  // state, so with reduced motion or no GSAP they read as still screens. A beat starts
  // and ends at that rest state: it plays on arrival, loops gently while the card is on
  // screen, replays on hover, and on touch whenever the card scrolls back into view.
  const whoCards = $$('#who .who-card');
  // Each concept site only starts loading when its own card is about to scroll into view,
  // one at a time, so they don't compete with the rest of the page (or run before anyone sees them)
  const whoFrames = whoCards.map(c => $('iframe[data-src]', c)).filter(Boolean);
  if (whoFrames.length) {
    const load = f => { if (f.dataset.src) { f.src = f.dataset.src; f.removeAttribute('data-src'); } };
    if ('IntersectionObserver' in window) {
      let queue = Promise.resolve();
      const io = new IntersectionObserver(es => es.forEach(e => {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        const f = $('iframe[data-src]', e.target);
        if (f) queue = queue.then(() => new Promise(done => { f.addEventListener('load', done, { once: true }); setTimeout(done, 1500); load(f); }));
      }), { rootMargin: '300px 0px' });
      whoFrames.forEach(f => io.observe(f.closest('.who-card')));
    } else whoFrames.forEach(load);
  }

  if (whoCards.length && hasGsap && !reduce) {
    // Centre of an element in its mini site's own (untransformed) coordinates
    const centre = (el, root) => {
      let x = el.offsetWidth / 2, y = el.offsetHeight / 2;
      for (let n = el; n && n !== root; n = n.offsetParent) { x += n.offsetLeft; y += n.offsetTop; }
      return [x, y];
    };
    // A finger tap: a ripple where it lands, and the control gives a little
    const tap = (site, el, press = el) => {
      const rip = $('.ms-tap', site);
      const t = gsap.timeline()
        .call(() => { const [x, y] = centre(el, site); gsap.set(rip, { x, y }); })
        .fromTo(rip, { scale: 0.3, opacity: 0.9 }, { scale: 1.5, opacity: 0, duration: 0.65, ease: 'power2.out', immediateRender: false });
      if (press) t.fromTo(press, { scale: 1 }, { scale: 0.94, duration: 0.12, ease: 'power2.out', yoyo: true, repeat: 1, immediateRender: false }, 0);
      return t;
    };
    const count = (el, from, to, fmt, duration = 0.8) => {
      const o = { v: from };
      return gsap.to(o, { v: to, duration, ease: 'power2.inOut', onUpdate: () => { el.textContent = fmt(o.v); } });
    };
    const settle = tl => tl.to({}, { duration: 0.7 }); // let CSS transitions land before the beat ends

    const SCENES = {
      window: s => {
        const track = $('.ms-quote__track', s), n = $('.ms-quote__n', s), amt = $('.ms-quote__amt', s);
        const knob = $('.ms-quote__knob', s), btn = $('.ms-quote__btn', s);
        const st = { v: 3 };
        const draw = () => { const r = Math.round(st.v); track.style.setProperty('--p', (st.v - 1) * 25); n.textContent = r; amt.textContent = `£${12 + 4 * r}`; };
        const slide = (to, duration) => gsap.to(st, { v: to, duration, ease: 'power2.inOut', onUpdate: draw });
        return {
          beat: tl => settle(tl
            .to(knob, { scale: 1.2, duration: 0.25, ease: 'power2.out' }, 0.3)
            .add(slide(5, 1.3), 0.45)
            .to(knob, { scale: 1, duration: 0.3, ease: 'power2.out' }, 1.8)
            .add(tap(s, btn), 2.3)
            .to(knob, { scale: 1.2, duration: 0.25, ease: 'power2.out' }, 4)
            .add(slide(3, 1), 4.1)
            .to(knob, { scale: 1, duration: 0.3, ease: 'power2.out' }, 5.1)),
        };
      },
      property: s => {
        const list = $('.ms-list', s), photo = $('.ms-list__photo', s), heart = $('.ms-list__heart', s);
        const btn = $('.ms-list__btn', s), label = $('.ms-swap__in', btn);
        return {
          beat: tl => settle(tl
            .add(tap(s, photo, null), 0.3).call(() => list.classList.add('is-2'), null, 0.4)
            .add(tap(s, heart), 1.6).call(() => list.classList.add('is-fav'), null, 1.7)
            .add(tap(s, btn), 2.7).call(() => label.style.setProperty('--i', 1), null, 2.85)
            .call(() => { list.classList.remove('is-2', 'is-fav'); label.style.setProperty('--i', 0); }, null, 5.4)),
        };
      },
      cafe: s => {
        const adds = $$('.ms-add', s), bag = $('.ms-bag', s), n = $('.ms-bag__n', s), tot = $('.ms-cafe__tot', s), go = $('.ms-cafe__go', s);
        const add = (i, k, total) => () => { adds[i].classList.add('is-on'); n.textContent = k; bag.classList.add('is-on'); tot.textContent = ` · ${total}`; };
        return {
          beat: tl => settle(tl
            .add(tap(s, adds[0]), 0.3).call(add(0, 1, '£3.40'), null, 0.4)
            .add(tap(s, adds[2]), 1.4).call(add(2, 2, '£6.60'), null, 1.5)
            .fromTo(n, { y: 0 }, { y: -4, duration: 0.15, yoyo: true, repeat: 1, ease: 'power2.out', immediateRender: false }, 1.55)
            .add(tap(s, go), 2.6)
            .call(() => { adds.forEach(a => a.classList.remove('is-on')); bag.classList.remove('is-on'); tot.textContent = ''; }, null, 5)),
        };
      },
      salon: s => {
        const book = $('.ms-book', s), pick = $('.ms-slots__pick', s), btn = $('.ms-book__btn', s), label = $('.ms-swap__in', btn);
        const state = (i, picked) => () => { label.style.setProperty('--i', i); pick.classList.toggle('is-on', picked); book.classList.toggle('is-empty', !picked); };
        return {
          init: state(0, false),
          beat: tl => settle(tl
            .call(state(0, false), null, 0)
            .add(tap(s, pick), 0.9).call(state(1, true), null, 1)
            .add(tap(s, btn), 2.3).call(() => label.style.setProperty('--i', 2), null, 2.45)
            .call(() => label.style.setProperty('--i', 1), null, 4.6)),
        };
      },
      trades: s => {
        const stars = $$('.ms-stars svg', s), n = $('.ms-review__count', s), call = $('.ms-cta__call', s);
        const icon = $('svg', call), dot = $('.ms-live i', s);
        return {
          init: () => gsap.set(stars, { scale: 0 }),
          beat: tl => settle(tl
            .to(stars, { scale: 0, duration: 0.25, ease: 'power2.in', stagger: { each: 0.04, from: 'end' } }, 0)
            .fromTo(dot, { scale: 1 }, { scale: 1.5, duration: 0.3, yoyo: true, repeat: 1, ease: 'sine.inOut', immediateRender: false }, 0.2)
            .to(stars, { scale: 1, duration: 0.5, ease: 'back.out(3)', stagger: 0.12 }, 0.5)
            .add(count(n, 211, 212, v => Math.round(v), 0.3), 1.2)
            .add(tap(s, call), 2.3)
            .fromTo(icon, { rotation: 0 }, { keyframes: [{ rotation: -16, duration: 0.08 }, { rotation: 14, duration: 0.08 }, { rotation: -10, duration: 0.08 }, { rotation: 0, duration: 0.14 }], immediateRender: false }, 2.4)),
        };
      },
      florist: s => {
        const size = $('.ms-size', s), opts = $$('.ms-size i:not(.ms-size__pill)', s), price = $('.ms-prod__price', s);
        const pic = $('.ms-prod__bq', s), btn = $('.ms-prod__btn', s), bag = $('.ms-bag', s);
        const grand = on => () => { size.classList.toggle('is-2', on); opts[0].classList.toggle('is-on', !on); opts[1].classList.toggle('is-on', on); };
        return {
          beat: tl => settle(tl
            .add(tap(s, opts[1]), 0.3).call(grand(true), null, 0.4)
            .add(count(price, 38, 52, v => `£${Math.round(v)}`, 0.7), 0.45)
            .to(pic, { scale: 1.08, duration: 1.6, ease: 'power2.out' }, 0.4)
            .add(tap(s, btn), 2).call(() => bag.classList.add('is-on'), null, 2.15)
            .call(grand(false), null, 4.6)
            .add(count(price, 52, 38, v => `£${Math.round(v)}`, 0.6), 4.65)
            .to(pic, { scale: 1, duration: 1, ease: 'power2.inOut' }, 4.6)
            .call(() => bag.classList.remove('is-on'), null, 4.8)),
        };
      },
    };

    whoCards.forEach((card, k) => {
      // Real concept sites in an iframe: tell them to play while the card is on screen
      const frame = $('iframe[data-who]', card);
      if (frame) {
        // the site is laid out at its real width; give it a viewport as tall as the frame so it fills it
        const box = frame.parentElement, vw = parseFloat(frame.style.getPropertyValue('--vw'));
        const fit = () => { const k = box.clientWidth / vw; if (k) frame.style.setProperty('--vh', Math.round(box.clientHeight / k)); };
        fit(); new ResizeObserver(fit).observe(box);
        const send = msg => { try { frame.contentWindow?.postMessage({ who: msg }, '*'); } catch {} };
        let vis = false;
        frame.addEventListener('load', () => send(vis ? 'play' : 'pause'));
        ScrollTrigger.create({ trigger: card, start: 'top 85%', end: 'bottom 10%', onToggle: self => { vis = self.isActive; send(vis ? 'play' : 'pause'); } });
        if (fine) {
          const layers = $$('[data-depth]', card).map(el => ({ el, d: +el.dataset.depth }));
          const tilt = gsap.quickTo(card, 'rotationY', { duration: 0.6, ease: 'power3.out' });
          const tiltX = gsap.quickTo(card, 'rotationX', { duration: 0.6, ease: 'power3.out' });
          const shift = layers.map(({ el }) => [gsap.quickTo(el, 'x', { duration: 0.7, ease: 'power3.out' }), gsap.quickTo(el, 'y', { duration: 0.7, ease: 'power3.out' })]);
          card.addEventListener('pointermove', e => {
            const r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
            tilt(x * 4); tiltX(-y * 4);
            layers.forEach(({ d }, i) => { shift[i][0](x * d * 3); shift[i][1](y * d * 2); });
          });
          card.addEventListener('pointerleave', () => { tilt(0); tiltX(0); shift.forEach(([sx, sy]) => { sx(0); sy(0); }); });
        }
        return;
      }
      const site = $('.ms', card);
      const make = site && SCENES[site.dataset.ms];
      if (!make) return;
      const rip = document.createElement('i');
      rip.className = 'ms-tap';
      site.append(rip);
      const scene = make(site);
      scene.init?.();
      let beat = null, wait = null, onScreen = false;
      const gap = 2.4 + (k % 3) * 0.8; // neighbours don't move in step
      const play = () => {
        wait?.kill();
        if (beat?.isActive()) return;
        beat = scene.beat(gsap.timeline({ onComplete: () => { if (onScreen) wait = gsap.delayedCall(gap, play); } }));
      };
      ScrollTrigger.create({
        trigger: card, start: 'top 80%', end: 'bottom 15%',
        onToggle: self => { onScreen = self.isActive; if (onScreen) play(); else wait?.kill(); },
      });
      if (!fine) return;

      // Hover: replay the beat, tilt the card and shift phone and prop by depth
      const layers = $$('[data-depth]', card).map(el => ({ el, d: +el.dataset.depth }));
      const tilt = gsap.quickTo(card, 'rotationY', { duration: 0.6, ease: 'power3.out' });
      const tiltX = gsap.quickTo(card, 'rotationX', { duration: 0.6, ease: 'power3.out' });
      const shift = layers.map(({ el }) => [gsap.quickTo(el, 'x', { duration: 0.7, ease: 'power3.out' }), gsap.quickTo(el, 'y', { duration: 0.7, ease: 'power3.out' })]);
      card.addEventListener('pointerenter', play);
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        tilt(x * 4); tiltX(-y * 4);
        layers.forEach(({ d }, i) => { shift[i][0](x * d * 3); shift[i][1](y * d * 2); });
      });
      card.addEventListener('pointerleave', () => { tilt(0); tiltX(0); shift.forEach(([sx, sy]) => { sx(0); sy(0); }); });
    });
  }

  // ---------- Count-ups ----------
  // (handled by case.js [data-count])

  // ---------- Skills: one product page, five ways to make it feel good ----------
  const feel = $('[data-feel-device]');
  if (feel) {
    const tabs = $$('.feel-tabs button');
    const view = $('[data-feel-view]', feel), pp = $('[data-pp]', feel);
    const count = $('[data-pp-count]', feel), toast = $('[data-pp-toast]', feel), cur = $('.pp-cursor', feel);
    const ripple = $('.pp-ripple', feel), handle = $('[data-pp-handle]', feel), add = $('[data-pp-add]', feel);
    const row = $('[data-pp-row]', feel), blob = $('.pp__blob', feel), stars = $('.pp__star-row', feel);
    const DUR = 7000;
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    let idx = 0, run = 0, timer = null, bar = null, inView = false, manual = false;

    const reset = () => {
      feel.classList.remove('is-focus');
      toast.classList.remove('is-on');
      pp.classList.remove('is-dark', 'skin-b', 'skin-c');
      if (hasGsap) {
        gsap.killTweensOf([view, cur, ripple, row, blob, add, stars]);
        gsap.set([cur], { opacity: 0 });
        gsap.set(ripple, { scale: 0, opacity: 1 });
        gsap.set([row, blob, add], { clearProps: 'transform' });
      }
      view.style.width = '';
      count.textContent = '2';
    };
    const MODES = {
      clear: async alive => { await sleep(500); if (alive()) feel.classList.add('is-focus'); },
      respond: async alive => {
        const v = view.getBoundingClientRect(), b = add.getBoundingClientRect();
        gsap.set(cur, { opacity: 1, left: v.width * 0.9, top: v.height * 0.95 });
        await new Promise(r => gsap.to(cur, { left: b.left - v.left + b.width * 0.6, top: b.top - v.top + b.height * 0.6, duration: 1, ease: 'power2.inOut', onComplete: r }));
        if (!alive()) return;
        for (let n = 0; n < 2 && alive(); n++) {
          gsap.fromTo(add, { scale: 1 }, { scale: 0.93, duration: 0.1, yoyo: true, repeat: 1 });
          gsap.fromTo(cur, { scale: 1 }, { scale: 0.8, duration: 0.1, yoyo: true, repeat: 1 });
          for (let i = 0; i < 14; i++) {
            const s = document.createElement('span');
            s.className = 'pp-sprinkle';
            s.style.cssText = `left:${b.left - v.left + b.width / 2}px;top:${b.top - v.top}px;background:${PENS[i % PENS.length]}`;
            view.append(s);
            gsap.to(s, { x: gsap.utils.random(-110, 110), y: gsap.utils.random(-150, -40), rotation: gsap.utils.random(-220, 220), opacity: 0, duration: gsap.utils.random(0.7, 1.1), ease: 'power2.out', onComplete: () => s.remove() });
          }
          count.textContent = String(3 + n);
          gsap.fromTo(count, { scale: 1.7 }, { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
          toast.classList.add('is-on');
          await sleep(1300);
        }
        gsap.to(cur, { opacity: 0, duration: 0.3 });
      },
      fit: async alive => {
        const full = view.parentElement.clientWidth;
        view.style.width = `${full}px`;
        await new Promise(r => gsap.to(view, { width: Math.min(360, full * 0.5), duration: 1.3, ease: 'power3.inOut', onComplete: r }));
        if (!alive()) return;
        await sleep(2200);
        if (!alive()) return;
        await new Promise(r => gsap.to(view, { width: full, duration: 1.1, ease: 'power3.inOut', onComplete: r }));
      },
      yours: async alive => {
        const flip = async on => {
          await new Promise(r => gsap.fromTo(ripple, { scale: 0, opacity: 1 }, { scale: 60, duration: 0.7, ease: 'power2.in', onComplete: r }));
          pp.classList.toggle('is-dark', on);
          gsap.to(ripple, { opacity: 0, duration: 0.5 });
        };
        await sleep(300); if (!alive()) return;
        await flip(true); await sleep(1500); if (!alive()) return;
        pp.classList.add('skin-b'); await sleep(1500); if (!alive()) return;
        pp.classList.replace('skin-b', 'skin-c'); await sleep(1500);
      },
      move: async alive => {
        gsap.to(blob, { y: -14, rotation: 14, duration: 1.4, ease: 'sine.inOut', yoyo: true, repeat: -1 });
        gsap.fromTo(stars, { opacity: 0.2 }, { opacity: 1, duration: 0.6, repeat: 2, yoyo: true });
        gsap.to(row, { x: () => -(row.scrollWidth - row.parentElement.clientWidth), duration: 5, ease: 'sine.inOut', yoyo: true, repeat: -1 });
        gsap.fromTo(add, { y: 0 }, { y: -6, duration: 0.5, ease: 'power2.out', yoyo: true, repeat: 3, delay: 1 });
      },
    };
    const go = (i, auto = false) => {
      idx = i; run++;
      const mine = run, alive = () => mine === run;
      reset();
      const mode = tabs[i].dataset.feel;
      feel.dataset.mode = mode;
      tabs.forEach((t, k) => t.setAttribute('aria-selected', k === i));
      clearTimeout(timer); bar?.kill();
      $$('.feel-tabs__bar').forEach(b => { b.style.transform = 'scaleX(0)'; });
      if (!hasGsap || reduce) { if (mode === 'clear') feel.classList.add('is-focus'); return; }
      MODES[mode](alive);
      if (!manual) {
        bar = gsap.fromTo($('.feel-tabs__bar', tabs[i]), { scaleX: 0 }, { scaleX: 1, duration: DUR / 1000, ease: 'none' });
        timer = setTimeout(() => { if (inView) go((idx + 1) % tabs.length, true); }, DUR);
      }
    };
    tabs.forEach((t, i) => t.addEventListener('click', () => { manual = false; go(i); }));
    new IntersectionObserver(([e]) => {
      const was = inView; inView = e.isIntersecting;
      if (inView && !was) go(idx);
      if (!inView) { clearTimeout(timer); bar?.kill(); }
    }, { threshold: 0.35 }).observe(feel);
    // Drag the handle to resize the page yourself (pauses the autoplay)
    handle.addEventListener('pointerdown', e => {
      manual = true; clearTimeout(timer); bar?.kill(); gsap.killTweensOf(view);
      handle.setPointerCapture(e.pointerId);
      const left = view.getBoundingClientRect().left, max = view.parentElement.clientWidth;
      const move = ev => { view.style.width = `${Math.max(260, Math.min(max, ev.clientX - left))}px`; };
      handle.addEventListener('pointermove', move);
      handle.addEventListener('pointerup', () => handle.removeEventListener('pointermove', move), { once: true });
    });
  }

  // ---------- Work cards: the screenshot scrolls the whole page on hover ----------
  $$('.work-card').forEach(card => {
    const view = $('.work-card__view', card);
    const img = view && $('img', view);
    if (!img || reduce) return;
    card.addEventListener('pointerenter', () => {
      const travel = Math.max(0, img.offsetHeight - view.offsetHeight);
      img.style.transition = `transform ${Math.min(14, Math.max(4, travel / 450))}s cubic-bezier(.45,0,.55,1)`;
      img.style.transform = `translateY(${-travel}px)`;
    });
    card.addEventListener('pointerleave', () => {
      img.style.transition = 'transform 1.2s cubic-bezier(.22,1,.36,1)';
      img.style.transform = 'translateY(0)';
    });
  });

  // ---------- Work: cards stack; each one sinks back as the next slides over ----------
  const stack = $('[data-stack]');
  if (stack) {
    const cards = $$('.feature', stack);
    cards.forEach((c, k) => c.style.setProperty('--k', k));
    // The card images are lazy; once the stack is a screen or so away, load and decode them all,
    // so nothing pops in (or leaves an unpainted hole) during a fast flick through the cards
    const imgs = $$('img', stack);
    const warm = () => imgs.forEach(i => { i.loading = 'eager'; i.decode?.().catch(() => {}); });
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); warm(); } }, { rootMargin: '150% 0px' });
      io.observe(stack);
    } else warm();
    const mm = hasGsap && !reduce ? gsap.matchMedia() : null;
    // Desktop: each card sinks back (scale + dim overlay) as the next slides over. Phones skip the
    // scrub entirely and the sticky cards just stack: a scrubbed scale re-rasters a whole card
    // every frame, and on a fast flick the GPU tiles couldn't keep up (torn, half-painted cards).
    mm?.add('(min-width: 861px)', () => {
      cards.forEach((c, k) => {
        const next = cards[k + 1];
        if (!next) return;
        gsap.to(c, { scale: 0.95, '--dim': 0.18, ease: 'power1.in', scrollTrigger: { trigger: next, start: 'top 45%', end: 'top 110px', scrub: true } });
      });
    });
    mm?.add('(min-width: 0px)', () => {
      cards.forEach(c => {
        gsap.from($('.feature__laptop', c), { y: 60, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: c, start: 'top 80%', once: true } });
        gsap.from($('.feature__phone', c), { x: 60, rotation: -6, opacity: 0, duration: 1, delay: 0.15, ease: 'expo.out', scrollTrigger: { trigger: c, start: 'top 80%', once: true } });
        // Brand pieces pop out with a bounce as the card settles into the stack (they float in CSS)
        const pops = $$('.wpop', c);
        if (pops.length) gsap.from(pops, {
          opacity: 0, scale: 0.3, x: (i, el) => +(el.dataset.fromX || 0), y: (i, el) => +(el.dataset.fromY || 50),
          duration: 0.8, delay: 0.35, ease: 'back.out(2.2)', stagger: 0.14,
          scrollTrigger: { trigger: c, start: 'top 65%', once: true },
        });
      });
    });
  }

  // ---------- Prices: the dots under the phone swipe row follow the card in view ----------
  const hpRow = $('.hp-cards'), hpDots = $$('.hp-dots i');
  if (hpRow && hpDots.length) hpRow.addEventListener('scroll', () => {
    const cards = [...hpRow.children], k = cards.reduce((b, c, i) => Math.abs(c.offsetLeft - hpRow.scrollLeft - 18) < Math.abs(cards[b].offsetLeft - hpRow.scrollLeft - 18) ? i : b, 0);
    hpDots.forEach((d, i) => d.classList.toggle('is-on', i === k));
  }, { passive: true });

  // ---------- Contact: validate, confetti, then open the email app ----------
  const form = $('[data-contact]');
  if (form) {
    const error = $('[data-contact-error]', form);
    const confetti = origin => {
      if (!hasGsap || reduce) return;
      const r = origin.getBoundingClientRect();
      for (let i = 0; i < 40; i++) {
        const c = document.createElement('span');
        c.className = 'confetti';
        c.style.cssText = `left:${r.left + r.width / 2}px;top:${r.top}px;background:${PENS[i % PENS.length]}`;
        document.body.append(c);
        gsap.to(c, { x: gsap.utils.random(-260, 260), y: gsap.utils.random(-320, -80), rotation: gsap.utils.random(-540, 540), duration: gsap.utils.random(0.9, 1.5), ease: 'power2.out' });
        gsap.to(c, { y: '+=420', opacity: 0, delay: 0.8, duration: 1.2, ease: 'power1.in', onComplete: () => c.remove() });
      }
    };
    form.addEventListener('submit', e => {
      e.preventDefault();
      const { name, email, message } = form.elements;
      [name, email, message].forEach(f => f.removeAttribute('aria-invalid'));
      const problems = [];
      if (!name.value.trim()) { problems.push('your name'); name.setAttribute('aria-invalid', 'true'); }
      if (!email.value.trim() || !email.validity.valid) { problems.push('a valid email'); email.setAttribute('aria-invalid', 'true'); }
      if (!message.value.trim()) { problems.push('a few words about the project'); message.setAttribute('aria-invalid', 'true'); }
      if (problems.length) { error.textContent = `Please add ${problems.join(', ')}.`; $('[aria-invalid="true"]', form).focus(); return; }
      error.textContent = '';
      confetti(form.querySelector('button[type="submit"]'));
      const needs = $$('input[name="need"]:checked', form).map(i => i.value);
      const body = `${message.value.trim()}\n\n${needs.length ? `Looking for: ${needs.join(', ')}\n` : ''}From: ${name.value.trim()} (${email.value.trim()})`;
      setTimeout(() => {
        location.href = `mailto:jb.designagency89@gmail.com?subject=${encodeURIComponent(`New project from ${name.value.trim()}`)}&body=${encodeURIComponent(body)}`;
      }, 700);
    });
  }

  // ---------- FAQ: numbered accordion, one answer open at a time ----------
  const faq = $('[data-faq]');
  if (faq) {
    const qas = $$('.qa', faq);
    const btns = qas.map(q => $('.qa__btn', q));
    const animate = hasGsap && !reduce;
    let refreshT;
    const refresh = () => { clearTimeout(refreshT); refreshT = setTimeout(() => hasGsap && ScrollTrigger.refresh(), 120); };
    const set = (qa, open) => {
      const btn = $('.qa__btn', qa), panel = $('.qa__panel', qa), inner = $('.qa__inner', qa);
      if (open === qa.classList.contains('is-open')) return;
      qa.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
      if (!animate) { panel.hidden = !open; return; }
      gsap.killTweensOf([panel, inner]);
      if (open) {
        panel.hidden = false;
        gsap.fromTo(panel, { height: panel.offsetHeight ? panel.offsetHeight : 0 }, { height: 'auto', duration: 0.6, ease: 'power3.inOut', onComplete: () => { gsap.set(panel, { clearProps: 'height' }); refresh(); } });
        gsap.fromTo(inner, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.55, delay: 0.12, ease: 'power2.out' });
      } else {
        gsap.to(inner, { opacity: 0, y: -6, duration: 0.25, ease: 'power1.in' });
        gsap.fromTo(panel, { height: panel.offsetHeight }, { height: 0, duration: 0.45, ease: 'power3.inOut', onComplete: () => { panel.hidden = true; gsap.set([panel, inner], { clearProps: 'all' }); refresh(); } });
      }
    };
    btns.forEach((btn, i) => {
      btn.addEventListener('click', () => {
        const qa = qas[i], open = !qa.classList.contains('is-open');
        if (open) qas.forEach(o => o !== qa && set(o, false));
        set(qa, open);
      });
      btn.addEventListener('keydown', e => {
        const to = { ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: btns.length - 1 }[e.key];
        if (to === undefined) return;
        e.preventDefault();
        btns[(to + btns.length) % btns.length].focus();
      });
    });
  }

  addEventListener('load', () => hasGsap && ScrollTrigger.refresh());
})();
