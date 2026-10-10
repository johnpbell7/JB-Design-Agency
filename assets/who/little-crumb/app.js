(() => {
  const MENU = {
    coffee: [
      { id: 'flat', name: 'Flat white', desc: 'Double ristretto, whole or oat', price: 3.40, img: 'flatwhite' },
      { id: 'cort', name: 'Cortado', desc: 'Espresso cut with warm milk', price: 3.20, img: 'cortado' },
      { id: 'latte', name: 'Latte', desc: 'Kirkstall house espresso', price: 3.60, img: 'latte' }
    ],
    bakes: [
      { id: 'crois', name: 'Butter croissant', desc: 'Three-day lamination', price: 3.20, img: 'croissant' },
      { id: 'pain', name: 'Pain au chocolat', desc: 'Two dark chocolate batons', price: 3.50, img: 'pain' },
      { id: 'bun', name: 'Cinnamon bun', desc: 'Brown butter, cream cheese icing', price: 3.60, img: 'bun' }
    ],
    lunch: [
      { id: 'toast', name: 'Ham & Gruyère toastie', desc: 'Sourdough, Dijon, pickles', price: 7.50, img: 'toastie' },
      { id: 'foc', name: 'Focaccia slice', desc: 'Rosemary, sea salt, olive oil', price: 3.80, img: 'focaccia' },
      { id: 'loaf', name: 'Country sourdough', desc: 'Whole 48-hour loaf', price: 5.20, img: 'sourdough' }
    ]
  };
  const ALL = Object.values(MENU).flat();
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const list = $('[data-items]');
  const tabs = $('.tabs');
  const totalEl = $('[data-total]');
  const labelEl = $('[data-bag-label]');
  const chip = $('[data-chip]');
  const chipText = $('[data-chip-text]');
  const checkout = $('[data-checkout]');
  const checkoutText = $('[data-checkout-text]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const state = { tab: 'coffee', bag: {}, time: null, done: false };
  let shownTotal = 0;

  const fmt = n => '£' + n.toFixed(2);
  const count = () => Object.values(state.bag).reduce((a, b) => a + b, 0);
  const total = () => ALL.reduce((s, i) => s + (state.bag[i.id] || 0) * i.price, 0);
  const plus = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  const tick = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function renderItems() {
    list.innerHTML = MENU[state.tab].map((it, i) => {
      const q = state.bag[it.id] || 0;
      return `<li class="item" data-id="${it.id}">
        <img class="thumb" src="img/t-${it.img}.webp" alt="" width="64" height="64">
        <span class="item-text"><span class="item-name">${it.name}</span><span class="item-desc">${it.desc}</span><span class="item-price">${fmt(it.price)}</span></span>
        <button class="add${q ? ' in' : ''}" data-add="${it.id}" aria-label="Add ${it.name}">${q ? q : plus}</button>
      </li>`;
    }).join('');
  }

  const thumbEl = $('.tab-thumb');
  function placeThumb() {
    const b = $(`[data-tab="${state.tab}"]`, tabs);
    if (!b) return;
    thumbEl.style.width = b.offsetWidth + 'px';
    thumbEl.style.transform = `translateX(${b.offsetLeft - thumbEl.offsetLeft}px)`;
  }
  function setTab(t, animate = true) {
    if (t === state.tab && list.children.length) return;
    state.tab = t;
    tabs.dataset.active = t;
    placeThumb();
    $$('[role="tab"]', tabs).forEach(b => b.setAttribute('aria-selected', b.dataset.tab === t));
    if (!animate || reduced) { renderItems(); return; }
    list.classList.add('swap');
    setTimeout(() => { renderItems(); list.classList.remove('swap'); }, 200);
  }

  function animateTotal(instant) {
    const target = total();
    const from = shownTotal;
    if (reduced || instant) { shownTotal = target; totalEl.textContent = fmt(target); return; }
    const t0 = performance.now();
    const step = now => {
      const k = Math.min(1, (now - t0) / 450);
      const e = 1 - Math.pow(1 - k, 3);
      totalEl.textContent = fmt(from + (target - from) * e);
      if (k < 1) requestAnimationFrame(step); else shownTotal = target;
    };
    requestAnimationFrame(step);
  }

  function renderBag(bump, instant) {
    const n = count();
    $$('[data-bag-count]').forEach(b => {
      b.textContent = n;
      b.classList.toggle('on', n > 0);
      if (bump && n > 0 && !reduced) { b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); }
    });
    if (state.done) {
      labelEl.textContent = 'Order placed';
    } else {
      labelEl.textContent = n ? `${n} item${n > 1 ? 's' : ''} · collect` : 'Your bag';
    }
    chipText.textContent = state.time || 'ASAP';
    chip.classList.toggle('set', !!state.time);
    checkout.classList.toggle('empty', n === 0);
    checkout.classList.toggle('done', state.done);
    checkoutText.innerHTML = state.done ? tick + ' Ordered' : 'Checkout';
    animateTotal(instant);
  }

  function fly(fromEl) {
    if (reduced) return;
    const a = fromEl.getBoundingClientRect();
    const b = $('.bag-ico').getBoundingClientRect();
    const dot = document.createElement('span');
    dot.className = 'fly';
    dot.style.left = '0'; dot.style.top = '0';
    document.body.appendChild(dot);
    const x0 = a.left + a.width / 2 - 6, y0 = a.top + a.height / 2 - 6;
    const x1 = b.left + b.width / 2 - 6, y1 = b.top + b.height / 2 - 6;
    dot.animate([
      { transform: `translate(${x0}px, ${y0}px) scale(1)` },
      { transform: `translate(${(x0 + x1) / 2}px, ${Math.min(y0, y1) - 40}px) scale(1.1)`, offset: .45 },
      { transform: `translate(${x1}px, ${y1}px) scale(.5)`, opacity: .4 }
    ], { duration: 560, easing: 'cubic-bezier(.45,.1,.4,1)', fill: 'forwards' }).onfinish = () => dot.remove();
  }

  function press(el) {
    if (!el || reduced) return;
    el.classList.add('press');
    setTimeout(() => el.classList.remove('press'), 170);
  }

  function add(id, fromBtn) {
    if (state.done) { state.done = false; }
    state.bag[id] = (state.bag[id] || 0) + 1;
    const btn = fromBtn || $(`[data-add="${id}"]`);
    if (btn) {
      btn.classList.add('in');
      btn.innerHTML = state.bag[id];
      const row = btn.closest('.item');
      row.classList.add('flash');
      setTimeout(() => row.classList.remove('flash'), 700);
      fly(btn);
    }
    setTimeout(() => renderBag(true), reduced ? 0 : 480);
  }

  // Real interaction
  list.addEventListener('click', e => {
    const b = e.target.closest('[data-add]');
    if (b) { stopDemo(); press(b); add(b.dataset.add, b); }
  });
  tabs.addEventListener('click', e => {
    const b = e.target.closest('[role="tab"]');
    if (b) { stopDemo(); setTab(b.dataset.tab); }
  });
  const TIMES = ['8:15', '8:30', '8:45', '9:00'];
  chip.addEventListener('click', () => {
    stopDemo(); press(chip);
    const i = state.time ? (TIMES.indexOf(state.time) + 1) % TIMES.length : 0;
    state.time = TIMES[i]; renderBag();
  });
  checkout.addEventListener('click', () => {
    stopDemo();
    if (!count()) return;
    press(checkout); state.done = !state.done; renderBag();
  });

  // Auto-demo
  let playing = false, runId = 0, userTook = false;
  const wait = (ms, id) => new Promise(res => {
    let left = ms, last = performance.now();
    const t = () => {
      if (id !== runId) return res(false);
      const now = performance.now();
      if (playing) left -= now - last;
      last = now;
      if (left <= 0) res(true); else setTimeout(t, 40);
    };
    setTimeout(t, 40);
  });

  function reset() {
    state.bag = {}; state.time = null; state.done = false;
    setTab('coffee', false);
    renderItems();
    renderBag(false, true);
  }

  function endState() {
    state.bag = { flat: 1, crois: 1, pain: 1 }; state.time = '8:15'; state.done = false;
    state.tab = '';
    setTab('bakes', false);
    shownTotal = total();
    renderBag(false);
  }

  async function loop(id) {
    while (id === runId) {
      reset();
      if (!await wait(1100, id)) return;
      let b = $('[data-add="flat"]'); press(b); add('flat', b);
      if (!await wait(1300, id)) return;
      press($('[data-tab="bakes"]')); setTab('bakes');
      if (!await wait(1000, id)) return;
      b = $('[data-add="crois"]'); press(b); add('crois', b);
      if (!await wait(1000, id)) return;
      b = $('[data-add="pain"]'); press(b); add('pain', b);
      if (!await wait(1300, id)) return;
      press(chip); state.time = '8:15'; renderBag();
      if (!await wait(1200, id)) return;
      press(checkout); state.done = true; renderBag();
      if (!await wait(2600, id)) return;
      list.classList.add('swap');
      if (!await wait(250, id)) return;
      list.classList.remove('swap');
    }
  }

  function play() {
    if (reduced || userTook) return;
    if (playing) return;
    playing = true;
    document.body.classList.add('playing');
    if (!loopActive) { loopActive = true; const id = ++runId; loop(id).finally(() => { if (id === runId) loopActive = false; }); }
  }
  let loopActive = false;
  function pause() { playing = false; document.body.classList.remove('playing'); }
  function stopDemo() {
    if (!loopActive) return;
    userTook = true; playing = false; runId++; loopActive = false;
    document.body.classList.remove('playing');
  }

  window.addEventListener('message', e => {
    const d = e.data;
    if (!d || typeof d !== 'object') return;
    if (d.who === 'play') play();
    if (d.who === 'pause') pause();
    if (d.who === 'restart' && !reduced && !userTook) { runId++; loopActive = false; pause(); play(); } // loop() starts with reset()
  });

  // Initial render: a settled, believable state
  tabs.dataset.active = 'coffee';
  renderItems();
  endState();
  document.fonts && document.fonts.ready.then(placeThumb);
  addEventListener('load', placeThumb);
  if (location.hash === '#play') play();
})();
