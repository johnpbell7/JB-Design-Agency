// GoSweet live pieces, ported from the store's app.js: Buy now -> quantity
// stepper, the sprinkle burst, the basket toast and the free-delivery nudge.
(() => {
  // Rewards wallet: tap spreads the cards on touch screens (hover does it on desktop)
  document.querySelectorAll('[data-fan]').forEach(fan => fan.addEventListener('click', () => fan.classList.toggle('is-open')));

  // ---------- Pack chooser + basket drawer: Add to basket drops a line into the drawer ----------
  const bb = document.querySelector('[data-buybox]'), dr = document.querySelector('[data-drawer]');
  if (bb && dr) {
    const gbp = n => '£' + (Math.round(n * 100) / 100).toFixed(2);
    const opts = [...bb.querySelectorAll('.gs-opt')];
    let n = 1;
    const cur = () => bb.querySelector('.gs-opt.is-on').dataset;
    const show = () => {
      const o = cur();
      bb.querySelector('[data-bb-price]').textContent = gbp(o.p * n);
      bb.querySelector('[data-bb-was]').textContent = gbp(o.w * n);
      bb.querySelector('[data-bb-save]').innerHTML = `<small>Save</small>${o.save}%`;
      bb.querySelector('[data-bb-n]').textContent = n;
    };
    opts.forEach(b => b.addEventListener('click', () => { opts.forEach(x => { x.classList.toggle('is-on', x === b); x.setAttribute('aria-checked', x === b); }); show(); }));
    bb.querySelectorAll('[data-bb-q]').forEach(b => b.addEventListener('click', () => { n = Math.max(1, Math.min(9, n + +b.dataset.bbQ)); show(); }));
    const FREE = 20;
    const totals = () => {
      let sub = 0, was = 0, items = 0;
      dr.querySelectorAll('.gs-line').forEach(l => { sub += +l.dataset.p; was += +l.dataset.w; items += +(l.dataset.n || 0); });
      return { sub, was };
    };
    let count = 8;
    const paint = () => {
      const t = totals(), left = Math.max(0, FREE - t.sub);
      dr.querySelector('[data-dr-n]').textContent = count;
      dr.querySelector('[data-dr-sub]').textContent = gbp(t.sub);
      dr.querySelector('[data-dr-save]').textContent = gbp(t.was - t.sub);
      dr.querySelector('[data-dr-pts]').textContent = `${Math.floor(t.sub)} pts`;
      dr.querySelector('[data-dr-bar]').style.width = `${Math.min(100, t.sub / FREE * 100).toFixed(1)}%`;
      dr.querySelector('.gs-dship').classList.toggle('is-done', left <= 0);
      dr.querySelector('[data-dr-ship]').innerHTML = left > 0 ? `Spend <b>${gbp(left)}</b> more for <b>FREE UK delivery</b>` : 'You’ve unlocked <b>FREE UK delivery</b>';
    };
    bb.querySelector('[data-bb-add]').addEventListener('click', e => {
      const o = cur(), pieces = (o.pack === 'box' ? 12 : 1) * n;
      let line = dr.querySelector(`.gs-line[data-pack="${o.pack}"]`);
      if (!line) {
        line = document.createElement('div'); line.className = 'gs-line'; line.dataset.pack = o.pack; line.dataset.p = 0; line.dataset.w = 0; line.dataset.q = 0;
        line.innerHTML = `<img src="../assets/projects/gosweet/p/cluck-o-late-box.webp" alt=""><div><span class="gs-line__brand">Cluck-O-Late</span><span class="gs-line__t">Chicken Chocolate 50g</span><span class="gs-line__sub"></span></div><b></b>`;
        dr.querySelector('[data-dr-lines]').prepend(line);
      }
      line.dataset.q = +line.dataset.q + n; line.dataset.p = (+line.dataset.p + o.p * n).toFixed(2); line.dataset.w = (+line.dataset.w + o.w * n).toFixed(2);
      line.querySelector('.gs-line__sub').textContent = `${o.name} · Qty ${line.dataset.q}`;
      line.querySelector('b').textContent = gbp(+line.dataset.p);
      line.classList.remove('is-new'); void line.offsetWidth; line.classList.add('is-new');
      count += pieces; paint();
    });
    show();
  }

  const grid = document.querySelector('main');
  if (!grid || !grid.querySelector('.es')) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FREE = 20;
  const cards = [...grid.querySelectorAll('.es')];
  const qty = new Map(cards.map(c => [c, 0]));
  const toastEl = document.querySelector('[data-toast]');
  const countEl = document.querySelector('[data-count-bag]');
  const sumEl = document.querySelector('[data-sum]');
  const shipTxt = document.querySelector('[data-ship-txt]');
  const shipBar = document.querySelector('[data-ship-bar]');
  const fm = n => '£' + (Math.round(n * 100) / 100).toFixed(2);

  const totals = () => {
    let n = 0, sub = 0;
    qty.forEach((q, c) => { n += q; sub += q * +c.dataset.p; });
    sub = Math.round(sub * 100) / 100;
    return { n, sub, left: Math.max(0, Math.round((FREE - sub) * 100) / 100) };
  };

  const render = () => {
    const t = totals();
    if (countEl) { countEl.textContent = t.n; countEl.dataset.n = t.n; }
    if (sumEl) sumEl.textContent = fm(t.sub);
    if (shipBar) shipBar.style.width = Math.min(100, (t.sub / FREE) * 100).toFixed(1) + '%';
    if (shipTxt) shipTxt.innerHTML = t.left > 0
      ? `Spend <b>${fm(t.left)}</b> more for <b>FREE UK delivery</b>`
      : 'You’ve unlocked <b>FREE UK delivery</b>';
    cards.forEach(c => {
      const q = qty.get(c);
      c.classList.toggle('is-added', q > 0);
      if (q) c.querySelector('.es__n').textContent = q;
    });
  };

  const bump = () => { if (!countEl) return; countEl.classList.remove('bump'); void countEl.offsetWidth; countEl.classList.add('bump'); };

  const burst = el => {
    if (reduce) return;
    const r = el.getBoundingClientRect();
    const b = document.createElement('div');
    b.className = 'gs-burst';
    b.style.left = `${r.left + r.width / 2}px`;
    b.style.top = `${r.top + r.height / 2}px`;
    const cs = ['#5c2a9d', '#e73e80', '#ffd23f', '#b79be0'];
    for (let i = 0; i < 14; i++) {
      const s = document.createElement('i');
      const a = (Math.PI * 2 * i) / 14 + Math.random() * 0.4, d = 36 + Math.random() * 28;
      s.style.setProperty('--c', cs[i % cs.length]);
      s.style.setProperty('--x', `${Math.cos(a) * d}px`);
      s.style.setProperty('--y', `${Math.sin(a) * d - 10}px`);
      b.append(s);
    }
    document.body.append(b);
    setTimeout(() => b.remove(), 700);
  };

  let tt;
  const toast = card => {
    if (!toastEl) return;
    const t = totals();
    toastEl.innerHTML = `<img src="${card.dataset.img}" alt=""><div><b>Added to basket</b><span>${t.left > 0 ? `${fm(t.left)} away from free UK delivery` : 'Free UK delivery unlocked'}</span></div>`;
    toastEl.classList.add('is-on');
    clearTimeout(tt);
    tt = setTimeout(() => toastEl.classList.remove('is-on'), 3200);
  };

  grid.addEventListener('click', e => {
    const card = e.target.closest('.es');
    if (!card) return;
    const add = e.target.closest('[data-add]');
    const step = e.target.closest('[data-step]');
    if (add) {
      qty.set(card, 1);
      burst(add); // measure the button before render() swaps it for the stepper
      render();
      card.classList.remove('is-pop'); void card.offsetWidth; card.classList.add('is-pop');
      card.querySelector('[data-step="1"]').focus({ preventScroll: true });
      bump(); toast(card);
    } else if (step) {
      const d = +step.dataset.step;
      qty.set(card, Math.max(0, qty.get(card) + d));
      render();
      if (d > 0) { burst(step); bump(); toast(card); }
      else if (!qty.get(card)) card.querySelector('[data-add]').focus({ preventScroll: true });
    }
  });

  render();
})();
