// Birdie Blooms live pieces, ported from the site's studio.js: today's season
// colour, the Birdie Card stamps + petals and the self-drawing ink drawings in
// the Up close breakout. Plus the logo exploration (colourways, viewer, final pick).
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const motion = !!window.gsap && !reduce;

  // Run once when an element is actually on screen
  const onShow = (el, fn) => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); fn(); } }, { threshold: 0.35 });
    io.observe(el);
  };

  // ---------- Seasons: the colour follows today's date, as on the site ----------
  const SEASONS = {
    winter: { name: 'Winter', months: 'December to February', colours: 'Berry red and frosted green', flowers: 'Amaryllis, Hellebores, Paperwhites, Anemones', illo: 'bb-sprig' },
    spring: { name: 'Spring', months: 'March to May', colours: 'Tulip pink and narcissus yellow', flowers: 'Tulips, Narcissi, Ranunculus, Hyacinths', illo: 'bb-tulip' },
    summer: { name: 'Summer', months: 'June to August', colours: 'Cornflower blue and sweet-pea pink', flowers: 'Sweet peas, Peonies, Cornflowers, Garden roses', illo: 'bb-wheat' },
    autumn: { name: 'Autumn', months: 'September to November', colours: 'Dahlia orange and amaranth red', flowers: 'Dahlias, Amaranth, Rosehips, Chrysanthemums', illo: 'bb-dahlia' },
  };
  const m = new Date().getMonth();
  const today = m < 2 || m === 11 ? 'winter' : m < 5 ? 'spring' : m < 8 ? 'summer' : 'autumn';
  $$('[data-bb-season]').forEach(el => el.setAttribute('data-bb-season', today));
  // The hero chip always shows the real season
  $$('[data-season-chip]').forEach(chip => {
    $$('i', chip).forEach(i => i.classList.toggle('is-today', i.dataset.s === today));
    const n = $('[data-season-name]', chip); if (n) n.textContent = SEASONS[today].name;
  });
  // The season card in the breakout is today's, like the "In season now" card on the site
  $$('[data-today-swatch]').forEach(sw => {
    const S = SEASONS[today];
    sw.dataset.s = today;
    $('.bb-swatch__name', sw).textContent = S.name;
    $('.bb-swatch__months', sw).textContent = S.months;
    $('.bb-swatch__colours', sw).lastChild.textContent = S.colours;
    $('.bb-swatch__flowers', sw).textContent = S.flowers;
    $('use', sw).setAttribute('href', '#' + S.illo);
  });

  // ---------- The Birdie Card: stamps itself when you reach it; tap to stamp ----------
  const card = $('[data-card]'), stage = $('[data-card-stage]');
  if (card) {
    const slots = $$('.bb-stamps li:not(.free)', card), free = $('.bb-stamps .free', card), list = $('.bb-stamps', card);
    const tilts = [-8, 6, -4, 9, -12];
    const isFull = () => free.classList.contains('won');
    const marks = slots.map(li => $('.bb-b', li));
    const reset = () => {
      slots.forEach(li => li.classList.remove('on'));
      free.classList.remove('won');
      if (window.gsap) gsap.set(marks, { clearProps: 'all' });
      slots.forEach((li, i) => { marks[i].style.rotate = `${tilts[i]}deg`; });
    };
    const burst = () => {
      const b = free.getBoundingClientRect(), s = stage.getBoundingClientRect();
      const cx = b.left - s.left + b.width / 2, cy = b.top - s.top + b.height / 2;
      for (let i = 0; i < 22; i++) {
        const p = document.createElement('i'); p.className = `bb-petal p${1 + (i % 3)}`; stage.append(p);
        const a = Math.random() * Math.PI * 2, dist = 90 + Math.random() * 170;
        gsap.set(p, { x: cx - 7, y: cy - 10, rotation: Math.random() * 360, scale: 0.6 + Math.random() * 0.7 });
        gsap.to(p, { x: cx + Math.cos(a) * dist, y: cy + Math.sin(a) * dist * 0.8 - 50, rotation: `+=${Math.random() * 300 - 150}`, duration: 1 + Math.random() * 0.6, ease: 'power3.out' });
        gsap.to(p, { y: `+=${80 + Math.random() * 60}`, autoAlpha: 0, duration: 0.9, delay: 0.75 + Math.random() * 0.4, ease: 'power1.in', onComplete: () => p.remove() });
      }
    };
    const stamp = () => {
      const next = slots.find(li => !li.classList.contains('on'));
      if (next) {
        next.classList.add('on');
        if (motion) {
          gsap.fromTo($('.bb-b', next), { scale: 2.6, rotation: -40, autoAlpha: 0 }, { scale: 1, rotation: 0, autoAlpha: 1, duration: 0.42, ease: 'power4.in' });
          gsap.fromTo(card, { y: 0 }, { y: 6, duration: 0.07, yoyo: true, repeat: 1, delay: 0.38, ease: 'power1.inOut' });
        }
      } else if (!isFull()) {
        free.classList.add('won');
        if (motion) { gsap.fromTo(free, { scale: 0.6 }, { scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.4)' }); burst(); }
      } else {
        reset();
      }
      const n = slots.filter(li => li.classList.contains('on')).length;
      list.setAttribute('aria-label', isFull() ? 'Card full: a free bunch' : `${n} of five stamps collected`);
    };
    reset();
    card.addEventListener('click', stamp);
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); stamp(); } });
    if (motion) {
      gsap.registerPlugin(ScrollTrigger);
      const autoStamp = () => { const tl = gsap.timeline(); for (let i = 0; i < 6; i++) tl.call(() => { if (!isFull()) stamp(); }, null, i * 0.55); return tl; };
      const intro = gsap.timeline({ paused: true })
        .from(card, { y: 140, rotation: -16, autoAlpha: 0, duration: 0.9, ease: 'power4.out' })
        .add(autoStamp, '+=0.15');
      onShow(card, () => intro.play());
    } else {
      // Static page: show a part-filled card
      slots.slice(0, 3).forEach(li => li.classList.add('on'));
      list.setAttribute('aria-label', '3 of five stamps collected');
    }
  }

  // ---------- Ink drawings: clone each symbol inline, then draw it in ----------
  const inline = svg => {
    const use = $('use', svg);
    const sym = use && document.querySelector(use.getAttribute('href'));
    if (sym) svg.innerHTML = sym.innerHTML;
    return svg;
  };
  const drawIn = (svg, delay = 0) => {
    const parts = $$('path, circle, ellipse', svg);
    const fills = parts.filter(p => /fill:/.test(p.getAttribute('style') || ''));
    const strokes = parts.filter(p => !fills.includes(p));
    strokes.forEach(p => { const len = p.getTotalLength() + 1; p.style.strokeDasharray = len; p.style.strokeDashoffset = len; });
    gsap.set(fills, { autoAlpha: 0, scale: 0, transformOrigin: '50% 50%' });
    return gsap.timeline({ delay })
      .to(strokes, { strokeDashoffset: 0, duration: 0.8, ease: 'power2.out', stagger: 0.05 })
      .to(fills, { autoAlpha: 1, scale: 1, duration: 0.45, ease: 'back.out(2)', stagger: 0.03 }, '-=0.3');
  };
  $$('.bb-break').forEach(fig => {
    const svgs = $$('.bb-illo', fig).map(inline);
    if (!motion || !svgs.length) return;
    svgs.forEach(svg => $$('path, circle, ellipse', svg).forEach(p => {
      if (/fill:/.test(p.getAttribute('style') || '')) gsap.set(p, { autoAlpha: 0 });
      else { const l = p.getTotalLength() + 1; p.style.strokeDasharray = l; p.style.strokeDashoffset = l; }
    }));
    onShow(fig, () => svgs.forEach((svg, i) => drawIn(svg, 0.35 + i * 0.25)));
  });

  // ---------- Row two: the seasons guide (seasons.html + the site's season switch) ----------
  // talks to the enquiry form (contact.html), which writes the email as you go
  const GUIDE = {
    winter: { lead: 'Deep reds and frosted greens. Paperwhites for the windowsill and amaryllis for the table.', flowers: ['Amaryllis', 'Hellebores', 'Paperwhites', 'Anemones', 'Eucalyptus', 'Ilex berries'] },
    spring: { lead: 'The first British stems of the year: tulips in every shade, narcissi and armfuls of blossom.', flowers: ['Tulips', 'Narcissi', 'Ranunculus', 'Hyacinths', 'Blossom', 'Muscari'] },
    summer: { lead: 'Garden flowers at their best. Sweet peas, cornflowers and the short, glorious peony season.', flowers: ['Sweet peas', 'Peonies', 'Cornflowers', 'Garden roses', 'Cosmos', 'Larkspur'] },
    autumn: { lead: 'Rich oranges and deep burgundies. Dahlias by the bucketful, amaranth and the odd pumpkin.', flowers: ['Dahlias', 'Amaranth', 'Rosehips', 'Chrysanthemums', 'Hydrangea', 'Pumpkins'] },
  };
  const row = $('[data-season-row]'), guide = $('[data-guide]');
  const form = $('[data-enq-form]'), enq = $('[data-enq]');
  const seasonal = form && $('option[data-seasonal]', form);
  let season = today;

  // The email, as studio.js builds it: "Label: value" for every filled field
  const lines = $('[data-mail-lines]'), subject = $('[data-mail-subject]');
  let last = [];
  const writeMail = () => {
    if (!form || !lines) return;
    const out = [];
    $$('[name]', form).forEach(el => {
      if (el.type === 'radio' && !el.checked) return;
      const v = (el.value || '').trim(); if (!v) return;
      out.push(`${el.dataset.label}: ${v}`);
    });
    const nm = form.elements.namedItem('name').value.trim();
    subject.textContent = 'Flower enquiry' + (nm ? ` from ${nm}` : '');
    lines.innerHTML = '';
    out.forEach(t => { const li = document.createElement('li'); li.textContent = t; if (last.length && !last.includes(t)) li.className = 'is-new'; lines.append(li); });
    last = out;
  };

  const showSeason = (s, animate) => {
    season = s;
    if (row) row.setAttribute('data-bb-season', s);
    if (!guide) return;
    const S = SEASONS[s], G = GUIDE[s];
    $$('.bb-guide__pick button', guide).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.s === s)));
    $('[data-g="months"]', guide).textContent = S.months;
    $('[data-g="name"]', guide).textContent = S.name;
    $('[data-g="lead"]', guide).textContent = G.lead;
    $('[data-g="flowers"]', guide).innerHTML = G.flowers.map(f => `<li>${f}</li>`).join('');
    $('[data-g="cta"]', guide).textContent = `Enquire about ${s} flowers`;
    const svg = $('[data-g-illo]', guide);
    if (svg.dataset.sym !== S.illo) { svg.innerHTML = `<use href="#${S.illo}"/>`; inline(svg); svg.dataset.sym = S.illo; }
    if (seasonal) { seasonal.textContent = `${S.name} bouquets`; seasonal.value = seasonal.textContent; writeMail(); }
    if (animate && motion) {
      drawIn(svg);
      gsap.fromTo($$('.bb-guide__copy > *', guide), { y: 10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, ease: 'power3.out', stagger: 0.04 });
    }
  };
  if (guide) {
    $$('.bb-guide__pick button', guide).forEach(b => {
      b.classList.toggle('is-today', b.dataset.s === today);
      b.addEventListener('click', () => { if (b.dataset.s !== season) showSeason(b.dataset.s, true); });
    });
    // Enquire about this season's flowers: fills the form, as the site's links do
    $('[data-g-enquire]', guide).addEventListener('click', () => {
      if (!form) return;
      enq.classList.remove('is-sent');
      if (seasonal) seasonal.selected = true;
      writeMail();
      enq.classList.remove('is-nudged'); void enq.offsetWidth; enq.classList.add('is-nudged');
    });
  }
  if (form) {
    form.addEventListener('input', writeMail);
    form.addEventListener('change', writeMail);
    let tt;
    form.addEventListener('submit', e => {
      e.preventDefault();
      enq.classList.add('is-sent');
      clearTimeout(tt); tt = setTimeout(() => enq.classList.remove('is-sent'), 4200);
    });
  }
  showSeason(today, false);
  writeMail();

  // ---------- Logo exploration ----------
  const brand = $('[data-brand]');
  const grid = $('[data-logos]');
  const NAMES = {};
  $$('.bb-logo', grid || document).forEach(t => { NAMES[t.dataset.logo] = t.dataset.name; });
  const SHORT = $$('.bb-logo[data-shortlist]').map(t => t.dataset.logo);
  const slug = n => `${n}-${NAMES[n].toLowerCase().replace(/&/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;

  // Colourways: the marks are single-colour SVG masks, so any pairing is one variable
  $$('[data-colourways] button').forEach((b, _, all) => b.addEventListener('click', () => {
    all.forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    grid.style.setProperty('--lg-bg', b.dataset.bg);
    grid.style.setProperty('--lg-fg', b.dataset.fg);
  }));

  // Viewer: every logo on the same neutral home page
  const viewer = $('[data-viewer]');
  const finalPick = (brand?.dataset.final || '').trim().padStart(2, '0');
  const hasFinal = !!(brand?.dataset.final || '').trim() && NAMES[finalPick];
  let showLogo = () => {};
  if (viewer) {
    const tabs = $$('[data-v]', viewer), devices = $('.bb-viewer__devices', viewer);
    const dImg = $('[data-v-desktop]', viewer), pImg = $('[data-v-phone]', viewer);
    const nameEl = $('[data-v-name]', viewer), tagEl = $('[data-v-tag]', viewer);
    const base = '../assets/projects/birdie-blooms/context/';
    const preload = n => { [`${base}${slug(n)}-desktop.webp`, `${base}${slug(n)}-phone.webp`].forEach(src => { const i = new Image(); i.src = src; }); };
    let current = '01';
    showLogo = (n, animate = true) => {
      if (!NAMES[n]) return;
      tabs.forEach(t => t.setAttribute('aria-pressed', String(t.dataset.v === n)));
      const label = `${n} ${NAMES[n]}`;
      nameEl.textContent = label;
      tagEl.textContent = hasFinal && n === finalPick ? 'Final' : SHORT.includes(n) ? 'Shortlist' : '';
      if (n === current) return;
      current = n;
      const swap = () => {
        dImg.src = `${base}${slug(n)}-desktop.webp`; dImg.alt = `${label} on the home page, desktop`;
        pImg.src = `${base}${slug(n)}-phone.webp`; pImg.alt = `${label} on the home page, phone`;
      };
      if (!animate || reduce) { swap(); return; }
      devices.classList.add('is-swapping');
      setTimeout(() => {
        swap();
        const done = () => devices.classList.remove('is-swapping');
        dImg.complete ? done() : dImg.addEventListener('load', done, { once: true });
        setTimeout(done, 900);
      }, 260);
    };
    tabs.forEach(t => {
      t.addEventListener('click', () => showLogo(t.dataset.v));
      t.addEventListener('pointerenter', () => preload(t.dataset.v), { once: true });
    });
  }
  $$('.bb-logo').forEach(t => t.addEventListener('click', () => {
    showLogo(t.dataset.logo);
    viewer?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
  }));

  // ---------- The final pick: set data-final="NN" on [data-brand] ----------
  if (brand && hasFinal) {
    const name = NAMES[finalPick];
    brand.classList.add('has-final');
    $$('.bb-logo').forEach(t => t.classList.toggle('is-final', t.dataset.logo === finalPick));
    $$('.bb-pick').forEach(p => {
      const isIt = p.dataset.pick === finalPick;
      p.classList.toggle('is-final', isIt);
      const tag = $('.bb-pick__tag', p); if (tag && isIt) tag.textContent = 'Final';
    });
    const txt = $('[data-status-text]'); if (txt) txt.textContent = `Chosen: ${finalPick} ${name}`;
    const title = $('[data-status-title]'); if (title) title.innerHTML = `She chose <em>${name}</em>.`;
    const body = $('[data-status-body]'); if (body) body.textContent = 'It replaces the interim serif wordmark across the site, then moves onto the Birdie Card, the stamps and the favicon.';
    const choose = $('[data-step-choose]'); if (choose) { choose.className = 'is-done'; choose.innerHTML = `<b>Client chose</b><span>${finalPick} ${name}</span>`; }
    const roll = $('[data-step-roll]'); if (roll) roll.className = 'is-now';
    showLogo(finalPick, false);
  } else {
    showLogo('01', false);
  }
})();
