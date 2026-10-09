/* Static copy of birth-hood.co.uk for John Bell's portfolio: the site's own client-side
   behaviour (menu, nav on scroll, package finder, FAQs, photo carousel) rebuilt in plain JS.
   Nothing here talks to a server. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // links that went off this copy, and forms, go nowhere
  document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a[data-off]');
    if (a) e.preventDefault();
  });
  document.addEventListener('submit', e => e.preventDefault(), true);

  // ---------- nav: shrink after 50px, hide on the way down past 120px ----------
  const nav = $('#nav'), top = $('.top-bar');
  let lastY = 0;
  addEventListener('scroll', () => {
    const y = scrollY;
    if (nav) nav.classList.toggle('scrolled', y > 50);
    const hide = y > 120 ? y > lastY : false;
    if (nav) nav.classList.toggle('nav-hidden', hide);
    if (top) top.classList.toggle('nav-hidden', hide);
    lastY = y;
  }, { passive: true });

  // ---------- mobile menu ----------
  const mob = $('#mob'), ham = $('.nav-ham');
  const setMob = open => {
    if (!mob) return;
    mob.classList.toggle('open', open);
    mob.setAttribute('aria-hidden', String(!open));
    if (open) mob.removeAttribute('inert'); else mob.setAttribute('inert', '');
    if (!open) $$('.mob-accordion', mob).forEach(b => setSection(b, false));
  };
  const setSection = (btn, open) => {
    btn.setAttribute('aria-expanded', String(open));
    const chev = $('.mob-chevron', btn); if (chev) chev.classList.toggle('open', open);
    let dd = btn.nextElementSibling && btn.nextElementSibling.classList.contains('mob-dropdown') ? btn.nextElementSibling : null;
    if (!open) { if (dd) dd.remove(); return; }
    if (dd) return;
    const label = btn.textContent.trim().toLowerCase();
    const li = $$('.nav-links > li.nav-dropdown').find(l => l.firstElementChild.textContent.replace('▾', '').trim().toLowerCase() === label);
    if (!li) return;
    dd = document.createElement('div'); dd.className = 'mob-dropdown';
    $$('.nav-drop-menu a', li).forEach(a => {
      const l = document.createElement('a');
      l.className = 'mob-link mob-link--sub'; l.href = a.getAttribute('href'); l.textContent = a.textContent;
      if (a.dataset.off) l.dataset.off = a.dataset.off;
      l.addEventListener('click', () => setMob(false));
      dd.append(l);
    });
    btn.after(dd);
  };
  if (ham) ham.addEventListener('click', () => setMob(true));
  if (mob) {
    const close = $('.mob-close', mob); if (close) close.addEventListener('click', () => setMob(false));
    $$('.mob-accordion', mob).forEach(btn => btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      $$('.mob-accordion', mob).forEach(b => b !== btn && setSection(b, false));
      setSection(btn, open);
    }));
  }

  // ---------- FAQs ----------
  $$('.faq-item').forEach(item => {
    const q = $('.faq-q', item);
    if (q) q.addEventListener('click', () => {
      const open = !item.classList.contains('open');
      $$('.faq-item').forEach(i => i.classList.remove('open'));
      item.classList.toggle('open', open);
    });
  });

  // ---------- photo carousel (Meet Leanne) ----------
  $$('.carousel').forEach(c => {
    const slides = $$('.carousel-slide', c), dots = $$('.carousel-dot', c);
    if (slides.length < 2) return;
    let i = 0, timer;
    const go = n => {
      i = (n + slides.length) % slides.length;
      slides.forEach((s, k) => { s.dataset.active = String(k === i); s.setAttribute('aria-hidden', String(k !== i)); });
      dots.forEach((d, k) => { d.dataset.active = String(k === i); d.setAttribute('aria-selected', String(k === i)); });
    };
    const start = () => { clearInterval(timer); timer = setInterval(() => go(i + 1), 4500); };
    dots.forEach((d, k) => d.addEventListener('click', () => { go(k); start(); }));
    c.addEventListener('mouseenter', () => clearInterval(timer));
    c.addEventListener('mouseleave', start);
    start();
  });

  // ---------- floating Book button hides at the footer ----------
  const fab = $('.mobile-book-fab'), footer = $('#footer');
  if (fab && footer && 'IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { fab.classList.toggle('is-hidden', e.isIntersecting); fab.setAttribute('aria-hidden', String(e.isIntersecting)); },
      { rootMargin: '0px 0px -40px 0px' }).observe(footer);
  }

  // ---------- scroll reveal: .reveal and the sections after the hero fade up once ----------
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
    const D = { 'reveal-d1': 0.1, 'reveal-d2': 0.2, 'reveal-d3': 0.3, 'reveal-d4': 0.4 };
    const items = [];
    $$('.reveal').forEach(el => items.push([el, 32, 0.9, Object.keys(D).reduce((d, k) => (el.classList.contains(k) ? D[k] : d), 0), 0.9]));
    $$('main section').forEach((s, i) => { if (i && !s.classList.contains('page-hero') && !s.classList.contains('home-hero-split')) items.push([s, 40, 1, 0, 0.85]); });
    items.forEach(([el, y, dur, delay, at]) => {
      const r = el.getBoundingClientRect();
      if (r.top < innerHeight * at) { el.style.opacity = ''; el.style.transform = ''; return; } // already on screen
      el.style.opacity = '0'; el.style.transform = `translateY(${y}px)`;
      const io = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        el.style.transition = `opacity ${dur}s cubic-bezier(.25,.46,.45,.94) ${delay}s, transform ${dur}s cubic-bezier(.25,.46,.45,.94) ${delay}s`;
        el.style.opacity = '1'; el.style.transform = 'none';
      }, { rootMargin: `0px 0px -${Math.round((1 - at) * 100)}% 0px` });
      io.observe(el);
    });
  }

  // ---------- home hero collage: five polaroids, the front one cycles (three on phones) ----------
  const collage = $('.hero-photo-collage');
  if (collage) {
    const frames = $$('.hero-frame', collage);
    const ROT = [-8, 7, -3, -6, 5];
    const DESK = [[-0.56, -0.36], [0.56, -0.38], [0, 0], [-0.56, 0.38], [0.56, 0.36]];
    const MOB = [[-0.28, -0.24], [-0.24, 0.08], [0.17, -0.04], [0, 0], [0, 0]];
    let active = 2, pos = [], aPos = [0, 0], aScale = 1.45, inScale = 1, count = 5;
    const put = (f, x, y, r, sc) => { f.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${r}deg) scale(${sc})`; };
    const layout = () => {
      const W = collage.offsetWidth, H = collage.offsetHeight, mob = innerWidth < 960;
      aScale = mob ? 1.35 : 1.45; inScale = mob ? 0.78 : 1; count = mob ? 3 : frames.length;
      aPos = mob ? [W * 0.17, H * -0.04] : [0, 0];
      if (active >= count) active = count - 1;
      pos = (mob ? MOB : DESK).map(([fx, fy], i) => (i === active ? aPos.slice() : [W * fx, H * fy]));
      frames.forEach((f, i) => {
        f.style.translate = 'none'; f.style.rotate = 'none'; f.style.scale = 'none'; f.style.transition = 'none';
        put(f, pos[i][0], pos[i][1], i === active ? -1 : ROT[i], i === active ? aScale : inScale);
        f.style.zIndex = i === active ? 20 : i + 1;
      });
    };
    const next = () => {
      const n = (active + 1) % count, prev = active, pf = frames[prev], nf = frames[n];
      const from = pos[n];
      pos[prev] = from; pos[n] = aPos.slice(); active = n;
      nf.style.zIndex = 20; pf.style.zIndex = 19;
      nf.style.transition = 'transform 1.1s cubic-bezier(.16,1,.3,1)';
      pf.style.transition = 'transform .9s cubic-bezier(.45,0,.55,1) .1s';
      put(nf, aPos[0], aPos[1], -1, aScale);
      put(pf, from[0], from[1], ROT[prev], inScale);
      setTimeout(() => { if (active !== prev) pf.style.zIndex = prev + 1; }, 1000);
    };
    layout();
    let lw = innerWidth; addEventListener('resize', () => { if (innerWidth !== lw) { lw = innerWidth; layout(); } });
    setInterval(next, 4500);
  }

  // ---------- package finder (same questions, weights and tie-breaks as the live site) ----------
  const s = (foundation, balanced, ultimate) => ({ foundation, balanced, ultimate });
  const QUESTIONS = [
    { q: 'How are you feeling about giving birth?', help: 'There are no wrong answers — this just helps gauge how much preparation would help.', options: [
      ["It's my first baby and I'm feeling anxious about it", s(0, 1, 3)],
      ["First baby, but I'm feeling fairly calm and curious", s(0, 3, 2)],
      ["I've birthed before and want solid support again", s(2, 2, 0)],
      ["I've birthed before and know exactly what I want", s(3, 1, 1)]] },
    { q: 'How much preparation would you like with me before the birth?', options: [
      ['Just the essentials — one good session', s(3, 0, 0)],
      ['A couple of sessions so I feel really ready', s(1, 3, 0)],
      ['Plenty of prep, with hypnobirthing built in', s(0, 2, 2)],
      ['As much as possible — in-depth and tailored to me', s(0, 0, 3)]] },
    { q: 'How much support would you like in the weeks after birth?', options: [
      ['A visit and a couple of weeks of contact', s(3, 0, 0)],
      ['Ongoing support for around six weeks', s(0, 3, 1)],
      ['More than six weeks — but I might not need everything', s(0, 2, 2)],
      ['Lots — several visits, a recovery kit and 12 weeks unlimited', s(0, 0, 3)]] },
    { q: 'How hands-on would you like me to be through your pregnancy?', help: 'Things like check-ins between sessions, attending appointments and flexible timing.', options: [
      ['Mainly around the birth itself', s(3, 0, 0)],
      ['A few check-ins between our sessions', s(1, 3, 0)],
      ['Regular contact throughout my pregnancy', s(0, 2, 2)],
      ['Very involved — attend appointments with me, fully flexible', s(0, 0, 3)]] },
    { q: 'Would you like equipment and resources included?', help: 'Such as a birth pool, TENS machine and the full online hub.', options: [
      ["Not needed — I'll sort my own if I want them", s(3, 0, 0)],
      ['Pool & TENS included would be handy', s(0, 3, 1)],
      ['Yes — and I want every digital resource too', s(0, 1, 3)]] },
  ];
  const RESULTS = {
    foundation: { name: 'Foundation', price: '£1,095', tag: 'Essential', blurb: 'Streamlined, essential doula support — everything you need for a calm, well-supported birth without the extras.',
      highlights: ['1 antenatal session + birth planning', 'On-call from 39 weeks', 'Full continuous in-person birth support', '1 postnatal visit + 2 weeks aftercare'] },
    balanced: { name: 'Balanced', price: '£1,495', tag: 'Enhanced', blurb: 'Our most popular choice — more preparation, birth pool & TENS included, and longer aftercare. A brilliant all-rounder.',
      highlights: ['2 antenatal sessions + hypnobirthing hub', 'Birth pool & TENS machine included', 'On-call from 10 days before your due date', 'Ongoing support for 6 weeks'] },
    ultimate: { name: 'Ultimate', price: '£2,000', tag: 'Comprehensive', blurb: 'The complete experience — maximum preparation, access, flexibility and aftercare, tailored closely around you.',
      highlights: ['4 antenatal sessions + appointment accompaniment', '3 postnatal visits + bespoke recovery kit', 'On-call from 38 weeks', 'Unlimited support for 12 weeks'] },
  };
  const KEYS = ['foundation', 'balanced', 'ultimate'], ORDER = ['balanced', 'ultimate', 'foundation'], RANK = { foundation: 0, balanced: 1, ultimate: 2 };
  const tally = answers => {
    const t = { foundation: 0, balanced: 0, ultimate: 0 };
    answers.forEach((o, q) => { const sc = QUESTIONS[q].options[o][1]; KEYS.forEach(k => { t[k] += sc[k]; }); });
    const winner = [...KEYS].sort((a, b) => (t[b] - t[a]) || (ORDER.indexOf(a) - ORDER.indexOf(b)))[0];
    const stepUp = KEYS.filter(k => RANK[k] > RANK[winner] && t[winner] > 0 && t[k] >= t[winner] * 0.8).sort((a, b) => (t[b] - t[a]) || (RANK[a] - RANK[b]))[0] || null;
    return { winner, stepUp };
  };
  const esc = t => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');

  const mountQuiz = (box, { compact = false, onClose, preset = [] } = {}) => {
    let answers = preset.slice(0, QUESTIONS.length), step = answers.length, first = true;
    const render = () => {
      const cls = `quiz${step < QUESTIONS.length ? ' quiz--asking' : ''}${compact ? ' quiz--compact' : ''}`;
      if (step >= QUESTIONS.length) {
        const { winner, stepUp } = tally(answers), r = RESULTS[winner];
        box.className = cls;
        box.innerHTML = `<div class="quiz-result"><div class="quiz-result-eyebrow">Your best match</div><div class="quiz-result-card">
          <div class="quiz-result-head"><span class="quiz-result-name">${r.name}</span><span class="quiz-result-price">${r.price}</span></div>
          <div class="quiz-result-tag">${r.tag} support</div><p class="quiz-result-blurb">${esc(r.blurb)}</p>
          <ul class="quiz-result-list">${r.highlights.map(h => `<li><span class="quiz-tick">✓</span>${esc(h)}</li>`).join('')}</ul>
          ${stepUp ? `<p class="quiz-result-runner">If you'd like even more support, you're also close to <strong>${RESULTS[stepUp].name}</strong> (${RESULTS[stepUp].price}) — worth a look, and we can compare the two on your free call.</p>` : ''}
          <div class="quiz-result-actions"><a href="#" data-off="link" class="btn-primary quiz-btn">Book a free consultation</a><a href="birth-doula.html" class="btn-outline quiz-btn">See full package details</a></div>
          </div><p class="quiz-result-note">This is a friendly guide, not a rule — every birth is unique. We'll confirm the perfect fit together on your free call.</p>
          <button type="button" class="quiz-restart">↻ Retake the quiz</button></div>`;
        $('.quiz-restart', box).addEventListener('click', () => { step = 0; answers = []; render(); });
        const det = $('a[href="birth-doula.html"]', box);
        if (onClose && /birth-doula\.html$/.test(location.pathname)) det.addEventListener('click', e => { e.preventDefault(); onClose(); });
      } else {
        const cur = QUESTIONS[step];
        box.className = cls;
        box.innerHTML = `<div class="quiz-progress"><div class="quiz-progress-bar" style="width:${(step / QUESTIONS.length) * 100}%"></div></div>
          <div class="quiz-step-count">Question ${step + 1} of ${QUESTIONS.length}</div><h3 class="quiz-q">${esc(cur.q)}</h3>
          ${cur.help ? `<p class="quiz-help">${esc(cur.help)}</p>` : ''}
          <div class="quiz-options">${cur.options.map(o => `<button type="button" class="quiz-option"><span>${esc(o[0])}</span><span class="quiz-option-arrow">→</span></button>`).join('')}</div>
          ${step > 0 ? '<button type="button" class="quiz-back">← Back</button>' : ''}`;
        $$('.quiz-option', box).forEach((b, i) => b.addEventListener('click', () => { answers[step] = i; step++; render(); }));
        const back = $('.quiz-back', box); if (back) back.addEventListener('click', () => { if (step > 0) { step--; render(); } });
      }
      if (!first) box.scrollIntoView({ behavior: 'smooth', block: 'start' });
      first = false;
    };
    render();
  };

  // inline finder (Find your package page)
  $$('.quiz').forEach(q => { if (!q.closest('.quiz-modal')) mountQuiz(q); });

  // the "Find your package" buttons open the finder in a modal
  const openModal = (preset = []) => {
    const ov = document.createElement('div');
    ov.className = 'quiz-modal-overlay'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-label', 'Package finder quiz');
    ov.innerHTML = `<div class="quiz-modal"><button type="button" class="quiz-modal-close" aria-label="Close">×</button>
      <div class="quiz-modal-head"><div class="quiz-modal-eyebrow">Package finder</div><h2 class="quiz-modal-title">Which doula package is right for you?</h2>
      <p class="quiz-modal-sub">Answer a few quick questions and I'll suggest your best-fit package.</p></div><div class="quiz-mount"></div></div>`;
    const close = () => { ov.remove(); document.body.style.overflow = ''; removeEventListener('keydown', onKey); };
    const onKey = e => { if (e.key === 'Escape') close(); };
    ov.addEventListener('click', close);
    $('.quiz-modal', ov).addEventListener('click', e => e.stopPropagation());
    $('.quiz-modal-close', ov).addEventListener('click', close);
    addEventListener('keydown', onKey);
    document.body.append(ov); document.body.style.overflow = 'hidden';
    mountQuiz($('.quiz-mount', ov), { compact: true, onClose: close, preset });
  };
  $$('button[type=button]').forEach(b => {
    if (b.closest('.quiz,.quiz-modal,#mob,#nav')) return;
    if (/find your package/i.test(b.textContent)) b.addEventListener('click', () => openModal());
  });
  // ?finder=1,1,1,2 opens the finder with those answers already given (a start state for the film)
  const pre = new URLSearchParams(location.search).get('finder');
  if (pre != null) {
    const ans = pre.split(',').filter(x => x !== '').map(Number).filter((n, i) => QUESTIONS[i] && QUESTIONS[i].options[n]);
    openModal(ans);
  }
})();
