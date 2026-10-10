(() => {
  const PRICES = { 4: [14, 17, 20, 24, 29], 8: [17, 21, 25, 29, 34] };
  const LABELS = ['1 bed flat', '2 bed house', '3 bed house', '4 bed house', '5+ bed house'];

  const input = document.getElementById('beds');
  const slider = input.parentElement;
  const out = document.getElementById('bedsOut');
  const ticks = [...slider.querySelectorAll('.ticks span')];
  const seg = document.querySelector('.seg');
  const segBtns = [...seg.querySelectorAll('button')];
  const priceEl = document.getElementById('price');
  const priceBox = priceEl.closest('.price');
  const book = document.getElementById('book');
  const touch = document.querySelector('.touch');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const state = { beds: 3, freq: 4, shown: 20 };
  let countRaf = 0;

  function setFill(v) {
    const w = input.clientWidth || 350;
    const frac = (v - 1) / 4;
    const px = 14 + frac * (w - 28);
    slider.style.setProperty('--p', (px / w * 100).toFixed(2) + '%');
  }

  function countTo(target, instant) {
    cancelAnimationFrame(countRaf);
    const from = +priceEl.textContent || state.shown;
    if (instant || reduce || from === target) {
      state.shown = target; priceEl.textContent = target; return;
    }
    priceBox.classList.remove('bump'); void priceBox.offsetWidth; priceBox.classList.add('bump');
    const t0 = performance.now(), dur = 520;
    const step = now => {
      const k = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - k, 3);
      const v = Math.round(from + (target - from) * e);
      priceEl.textContent = v;
      if (k < 1) countRaf = requestAnimationFrame(step);
      else state.shown = target;
    };
    countRaf = requestAnimationFrame(step);
    state.shown = target;
  }

  function update(instant) {
    const b = state.beds;
    out.textContent = LABELS[b - 1];
    ticks.forEach((t, i) => t.classList.toggle('on', i === b - 1));
    countTo(PRICES[state.freq][b - 1], instant);
  }

  function setBeds(b, instant) {
    state.beds = b; input.step = '1'; input.value = b; setFill(b); update(instant);
  }

  function setFreq(f, instant) {
    state.freq = f;
    seg.classList.toggle('eight', f === 8);
    segBtns.forEach(btn => {
      const on = +btn.dataset.freq === f;
      btn.classList.toggle('on', on);
      btn.setAttribute('aria-checked', on);
    });
    update(instant);
  }

  // manual use
  input.addEventListener('input', () => {
    const b = Math.round(+input.value);
    setFill(+input.value);
    if (b !== state.beds) { state.beds = b; update(); }
  });
  input.addEventListener('change', () => setBeds(Math.round(+input.value)));
  segBtns.forEach(btn => btn.addEventListener('click', () => setFreq(+btn.dataset.freq)));
  let bookTimer;
  book.addEventListener('click', () => {
    book.classList.add('done');
    clearTimeout(bookTimer);
    bookTimer = setTimeout(() => book.classList.remove('done'), 3200);
  });

  setFill(state.beds);
  addEventListener('resize', () => setFill(+input.value));

  // ---------- auto demo ----------
  let token = null;

  const wait = (ms, tk) => new Promise((res, rej) => setTimeout(() => (tk.stop ? rej('stop') : res()), ms));

  function thumbPoint(v) {
    const r = input.getBoundingClientRect();
    return { x: r.left + 14 + ((v - 1) / 4) * (r.width - 28), y: r.top + r.height / 2 };
  }
  function centre(el, dx = 0) {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2 + dx, y: r.top + r.height / 2 };
  }
  function moveTouch(p, follow) {
    touch.classList.toggle('follow', !!follow);
    touch.style.left = p.x + 'px';
    touch.style.top = p.y + 'px';
  }
  async function tap(el, tk, dx) {
    moveTouch(centre(el, dx));
    touch.classList.add('on');
    await wait(560, tk);
    touch.classList.add('down');
    if (el === book) book.classList.add('press');
    await wait(160, tk);
    touch.classList.remove('down');
    book.classList.remove('press');
  }
  function drag(from, to, tk) {
    return new Promise((res, rej) => {
      input.step = 'any';
      slider.classList.add('grab');
      const t0 = performance.now(), dur = 620 * Math.abs(to - from);
      const step = now => {
        if (tk.stop) { slider.classList.remove('grab'); return rej('stop'); }
        const k = Math.min(1, (now - t0) / dur);
        const e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        const v = from + (to - from) * e;
        input.value = v; setFill(v);
        moveTouch(thumbPoint(v), true);
        const b = Math.round(v);
        if (b !== state.beds) { state.beds = b; update(); }
        if (k < 1) requestAnimationFrame(step);
        else { setBeds(to); slider.classList.remove('grab'); res(); }
      };
      requestAnimationFrame(step);
    });
  }

  async function run(tk) {
    while (!tk.stop) {
      book.classList.remove('done');
      setFreq(4, true); setBeds(2, true);
      touch.classList.remove('on', 'down');
      await wait(900, tk);
      moveTouch(thumbPoint(2));
      touch.classList.add('on');
      await wait(450, tk);
      touch.classList.add('down');
      await wait(150, tk);
      await drag(2, 3, tk);
      await wait(550, tk);
      await drag(3, 4, tk);
      touch.classList.remove('down');
      await wait(900, tk);
      await tap(segBtns[1], tk);
      setFreq(8);
      await wait(1300, tk);
      await tap(segBtns[0], tk);
      setFreq(4);
      await wait(1000, tk);
      await tap(book, tk, 20);
      book.classList.add('done');
      await wait(500, tk);
      touch.classList.remove('on');
      await wait(2600, tk);
    }
  }

  function play() {
    if (reduce) { endState(); return; }
    if (token && !token.stop) return;
    const tk = token = { stop: false };
    run(tk).catch(() => {});
  }
  function pause() {
    if (token) token.stop = true;
    touch.classList.remove('on', 'down');
    slider.classList.remove('grab');
    book.classList.remove('press');
  }
  function endState() {
    setFreq(4, true); setBeds(4, true);
  }

  addEventListener('message', e => {
    const d = e.data;
    if (!d || typeof d !== 'object') return;
    if (d.who === 'play') play();
    else if (d.who === 'pause') pause();
    else if (d.who === 'restart') { pause(); play(); } // a new run starts from its reset state
  });

  if (reduce) endState();
  const boot = () => { if (location.hash === '#play') play(); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(boot); else boot();
  addEventListener('hashchange', boot);
})();
