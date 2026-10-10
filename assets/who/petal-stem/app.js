(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const SIZES = [
    { name: 'Classic', price: 38, stems: '12 stems', img: 'img/classic.webp' },
    { name: 'Deluxe', price: 45, stems: '18 stems', img: 'img/deluxe.webp' },
    { name: 'Grand', price: 52, stems: '26 stems', img: 'img/grand.webp' }
  ];
  const DATES = [
    { when: 'Today, by 6pm', meta: 'Same-day delivery today' },
    { when: 'Saturday 10 October', meta: 'Delivery Sat 10 October' },
    { when: 'Monday 12 October', meta: 'Delivery Mon 12 October' },
    { when: 'Tuesday 13 October', meta: 'Delivery Tue 13 October' }
  ];

  const price = $('#price'), stems = $('#stems'), shown = $('#shown'), when = $('#when');
  const add = $('#add'), addLabel = $('#addLabel');
  const badge = $('#badge'), toast = $('#toast');
  const cursor = $('#cursor'), clock = $('#clock');
  const photos = $$('.ph'), pager = $$('.pager i');

  const state = { size: 0, date: 1, count: 0, shown: 38 };
  let priceRaf = 0;

  function tweenPrice(to) {
    cancelAnimationFrame(priceRaf);
    const from = state.shown, t0 = performance.now(), dur = 520;
    const step = now => {
      const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      state.shown = Math.round(from + (to - from) * e);
      price.textContent = state.shown;
      if (k < 1) priceRaf = requestAnimationFrame(step);
    };
    priceRaf = requestAnimationFrame(step);
  }

  function label() { addLabel.textContent = `Add to basket · £${SIZES[state.size].price}.00`; }

  function setSize(i, instant) {
    state.size = i;
    $$('.size').forEach(b => { const on = +b.dataset.i === i; b.classList.toggle('on', on); b.setAttribute('aria-checked', on); });
    photos.forEach(p => p.classList.toggle('on', +p.dataset.i === i));
    pager.forEach((p, k) => p.classList.toggle('on', k === i));
    stems.textContent = `${SIZES[i].name} · ${SIZES[i].stems}`;
    shown.textContent = `Shown in ${SIZES[i].name}`;
    if (instant) { cancelAnimationFrame(priceRaf); state.shown = SIZES[i].price; price.textContent = state.shown; }
    else tweenPrice(SIZES[i].price);
    label();
    resetAdd();
  }

  function setDate(i) {
    state.date = i;
    $$('.date[data-i]').forEach(b => { const on = +b.dataset.i === i; b.classList.toggle('on', on); b.setAttribute('aria-checked', on); });
    when.textContent = DATES[i].when;
    resetAdd();
  }

  function resetAdd() { add.classList.remove('loading', 'done'); }

  function setCount(n, bump) {
    state.count = n;
    badge.textContent = n;
    badge.classList.toggle('show', n > 0);
    $('#toastCount').textContent = n;
    if (bump) { badge.classList.remove('bump'); void badge.offsetWidth; badge.classList.add('bump'); }
  }

  let toastTimer = 0;
  function fillToast() {
    $('#toastImg').src = SIZES[state.size].img;
    $('#toastMeta').textContent = `${SIZES[state.size].name} · ${DATES[state.date].meta}`;
    $('#toastPrice').textContent = `£${SIZES[state.size].price}.00`;
  }
  function addToBasket(instant) {
    if (add.classList.contains('loading')) return;
    fillToast();
    if (instant) { add.classList.add('done'); setCount(state.count + 1); toast.classList.add('show'); return; }
    add.classList.add('loading');
    setTimeout(() => {
      add.classList.remove('loading');
      add.classList.add('done');
      setCount(state.count + 1, true);
      toast.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
    }, 650);
  }

  function pressFx(el) { el.classList.remove('press'); void el.offsetWidth; el.classList.add('press'); }

  // real interactions
  $$('.size').forEach(b => b.addEventListener('click', () => { pressFx(b); setSize(+b.dataset.i); }));
  $$('.date[data-i]').forEach(b => b.addEventListener('click', () => { pressFx(b); setDate(+b.dataset.i); }));
  add.addEventListener('click', () => { pressFx(add); addToBasket(); });
  $$('a[href="#"]').forEach(a => a.addEventListener('click', e => e.preventDefault()));

  // cut-off countdown (fixed demo clock so it always reads before 2pm)
  const START = 2 * 3600 + 47 * 60 + 12;
  let secs = START;
  const fmt = s => `${Math.floor(s / 3600)}h ${String(Math.floor(s / 60) % 60).padStart(2, '0')}m ${String(s % 60).padStart(2, '0')}s`;
  clock.textContent = fmt(secs);
  let clockTimer = 0;

  // ---------- auto demo ----------
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let run = 0, playing = false;
  const cur = { x: 1180, y: 980 };

  function placeCursor(x, y, ms) {
    cursor.style.transition = `opacity .4s, transform ${ms}ms cubic-bezier(.45,.05,.25,1)`;
    cursor.style.transform = `translate(${x}px, ${y}px)`;
    cur.x = x; cur.y = y;
  }
  function target(el, fx = .5, fy = .55) {
    const r = el.getBoundingClientRect();
    return [r.left + scrollX + r.width * fx, r.top + scrollY + r.height * fy];
  }
  function wait(ms, id) {
    return new Promise((res, rej) => setTimeout(() => (id === run ? res() : rej('stop')), ms));
  }
  async function moveClick(el, id, fx, fy, travel = 720) {
    const [x, y] = target(el, fx, fy);
    placeCursor(x, y, travel);
    await wait(travel + 140, id);
    cursor.classList.remove('click'); void cursor.offsetWidth; cursor.classList.add('click');
    el.click();
    await wait(80, id);
  }

  function initialState() {
    toast.classList.remove('show');
    setSize(0, true);
    setDate(1);
    setCount(0);
  }
  function endState() {
    setSize(2, true);
    setDate(0);
    setCount(0);
    addToBasket(true);
  }

  async function loop(id) {
    const sizeBtns = $$('.size'), dateBtns = $$('.date[data-i]');
    while (id === run) {
      cursor.classList.add('on');
      await wait(700, id);
      await moveClick(sizeBtns[1], id, .5, .45, 900);
      await wait(1100, id);
      await moveClick(sizeBtns[2], id, .5, .45, 620);
      await wait(1300, id);
      await moveClick(dateBtns[0], id, .5, .55, 760);
      await wait(1000, id);
      await moveClick(add, id, .46, .55, 760);
      await wait(1400, id);
      placeCursor(cur.x + 60, cur.y + 140, 900);
      await wait(3000, id);
      cursor.classList.remove('on');
      await wait(500, id);
      initialState();
      placeCursor(1180, 980, 0);
      await wait(900, id);
    }
  }

  function play() {
    if (reduce) { endState(); return; }
    if (playing) return;
    playing = true;
    const id = ++run;
    initialState();
    placeCursor(1180, 980, 0);
    clearInterval(clockTimer);
    clockTimer = setInterval(() => { secs = secs > 0 ? secs - 1 : START; clock.textContent = fmt(secs); }, 1000);
    loop(id).catch(() => {});
  }

  function pause() {
    playing = false;
    run++;
    clearInterval(clockTimer);
    cursor.classList.remove('on');
  }

  window.addEventListener('message', e => {
    const d = e.data;
    if (!d || typeof d !== 'object') return;
    if (d.who === 'play') play();
    else if (d.who === 'pause') pause();
    else if (d.who === 'restart') { pause(); play(); } // play() starts from initialState()
  });

  if (reduce) endState();
  else if (location.hash === '#play') {
    if (document.readyState === 'complete') play();
    else addEventListener('load', play);
  }
})();
