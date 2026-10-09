(() => {
  const book = document.getElementById('widget');
  const cta = document.getElementById('cta');
  const ptr = document.getElementById('ptr');
  const slots = book.querySelector('.slots');
  const dayLbl = document.getElementById('dayLbl');
  const $ = (s) => book.querySelector(s);
  const $$ = (s) => [...book.querySelectorAll(s)];
  const state = { svc: null, date: null, time: null, who: null };

  function pick(group, el) {
    $$(group).forEach((b) => b.classList.toggle('on', b === el));
  }

  function setSvc(el) { state.svc = el; pick('.svc', el); update(); }
  function setDate(el) {
    state.date = el; pick('.chip', el);
    dayLbl.textContent = el ? `${el.dataset.day.slice(0, 3)} ${el.dataset.d} Oct` : 'Choose a date';
    if (el) { slots.classList.remove('fade'); void slots.offsetWidth; slots.classList.add('fade'); }
    update();
  }
  function setTime(el) { state.time = el; pick('.slot', el); update(); }
  function setWho(el) { state.who = el; pick('.who', el); update(); }

  function update() {
    const t = state.time && state.time.textContent.trim();
    const price = state.svc ? `£${state.svc.dataset.price}` : '£0';
    cta.querySelector('.amt').textContent = price;
    if (t && state.svc && state.date) {
      cta.classList.remove('dim');
      cta.querySelector('.txt').textContent = `Book ${t}`;
    } else {
      cta.classList.add('dim');
      cta.querySelector('.txt').textContent = !state.svc ? 'Choose a service' : !state.date ? 'Choose a date' : 'Choose a time';
    }
  }

  function confirmBooking() {
    const svc = state.svc || $('.svc[data-svc="cut"]');
    const date = state.date || $('.chip[data-d="13"]');
    const time = (state.time && state.time.textContent.trim()) || '11:00';
    const who = state.who ? state.who.dataset.who : 'Any';
    document.getElementById('doneDay').textContent = date.dataset.day;
    document.getElementById('rSvc').textContent = `${svc.dataset.name}, ${svc.dataset.min} min`;
    document.getElementById('rWhen').textContent = `${date.dataset.day.slice(0, 3)} ${date.dataset.d} Oct, ${time}`;
    document.getElementById('rWho').textContent = who === 'Any' ? 'First available' : who;
    document.getElementById('rAmt').textContent = `£${svc.dataset.price}`;
    book.classList.add('ok');
  }

  function reset() {
    book.classList.remove('ok');
    cta.classList.remove('busy', 'press');
    setSvc(null); setDate(null); setTime(null); setWho(null);
  }

  function fillDefault() {
    setSvc($('.svc[data-svc="cut"]'));
    setDate($('.chip[data-d="13"]'));
    slots.classList.remove('fade');
    setTime($('.slot[data-t="11:00"]'));
    setWho($('.who[data-who="Mara"]'));
  }

  // Manual use
  $$('.svc').forEach((b) => b.addEventListener('click', () => { if (!demo.running) setSvc(b); }));
  $$('.chip').forEach((b) => b.addEventListener('click', () => { if (!demo.running) setDate(b); }));
  $$('.slot:not(.off)').forEach((b) => b.addEventListener('click', () => { if (!demo.running) setTime(b); }));
  $$('.who').forEach((b) => b.addEventListener('click', () => { if (!demo.running) setWho(b); }));
  cta.addEventListener('click', () => {
    if (demo.running || cta.classList.contains('dim')) return;
    cta.classList.add('busy');
    setTimeout(() => { cta.classList.remove('busy'); confirmBooking(); }, 800);
  });
  book.querySelector('.done .btn-line').addEventListener('click', (e) => { e.preventDefault(); if (!demo.running) book.classList.remove('ok'); });

  // Pointer
  function moveTo(el, dx = 0, dy = 0) {
    const b = book.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const x = r.left - b.left + r.width * 0.55 + dx - 4;
    const y = r.top - b.top + r.height * 0.55 + dy - 3;
    ptr.style.transform = `translate(${x}px, ${y}px)`;
    ptr.classList.add('show');
  }
  function tap() {
    ptr.classList.add('tap');
    setTimeout(() => ptr.classList.remove('tap'), 160);
    const m = /translate\(([-\d.]+)px, ([-\d.]+)px\)/.exec(ptr.style.transform);
    if (m) {
      const ring = document.createElement('span');
      ring.className = 'ring';
      ring.style.left = `${+m[1] + 4}px`;
      ring.style.top = `${+m[2] + 3}px`;
      book.appendChild(ring);
      setTimeout(() => ring.remove(), 650);
    }
  }
  function park() {
    const b = book.getBoundingClientRect();
    ptr.style.transform = `translate(${b.width - 40}px, ${b.height + 10}px)`;
  }

  const steps = [
    [() => { reset(); park(); ptr.classList.remove('show'); }, 700],
    [() => { park(); ptr.classList.add('show'); }, 250],
    [() => moveTo($('.svc[data-svc="cut"]'), -60), 850],
    [() => { tap(); setSvc($('.svc[data-svc="cut"]')); }, 650],
    [() => moveTo($('.chip[data-d="13"]')), 850],
    [() => { tap(); setDate($('.chip[data-d="13"]')); }, 750],
    [() => moveTo($('.slot[data-t="11:00"]')), 850],
    [() => { tap(); setTime($('.slot[data-t="11:00"]')); }, 650],
    [() => moveTo($('.who[data-who="Mara"]')), 850],
    [() => { tap(); setWho($('.who[data-who="Mara"]')); }, 650],
    [() => moveTo(cta, -60), 900],
    [() => { tap(); cta.classList.add('press', 'busy'); }, 160],
    [() => cta.classList.remove('press'), 750],
    [() => { cta.classList.remove('busy'); confirmBooking(); ptr.classList.remove('show'); }, 4200],
  ];

  const demo = { running: false, i: 0, timer: null };
  function tick() {
    if (!demo.running) return;
    const [fn, wait] = steps[demo.i];
    fn();
    demo.i = (demo.i + 1) % steps.length;
    demo.timer = setTimeout(tick, wait);
  }
  function play() {
    if (reduced) { showEnd(); return; }
    if (demo.running) return;
    demo.running = true;
    tick();
  }
  function pause() {
    demo.running = false;
    clearTimeout(demo.timer);
  }
  function showEnd() {
    pause();
    fillDefault();
    confirmBooking();
  }

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  fillDefault();
  if (reduced) showEnd();

  window.addEventListener('message', (e) => {
    const d = e.data;
    if (!d || typeof d !== 'object') return;
    if (d.who === 'play') play();
    else if (d.who === 'pause') pause();
  });
  window.addEventListener('hashchange', () => { if (location.hash === '#play') play(); });
  if (location.hash === '#play') {
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => setTimeout(play, 300));
  }
})();
