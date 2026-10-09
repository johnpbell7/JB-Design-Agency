// Nic Pouches live pieces, rebuilt from the store's app.js and product.js:
// the real product card (strength chips swap the can and the mg badge), the
// quick-add pop-up, the product page's strength + pack chooser and the basket
// drawer with the Mix & Match progress, which both of them fill. Product data
// is a hardcoded slice of the store's own data.js.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof window.gsap !== 'undefined';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const fm = n => '£' + (Math.round(n * 100) / 100).toFixed(2);
  const ic = (id, size = 16) => `<svg class="ico" width="${size}" height="${size}" aria-hidden="true"><use href="#${id}"/></svg>`;
  const CANS = '../assets/projects/nic-pouches/cans/';
  const WARNING = 'This product contains nicotine which is a highly addictive substance.';

  // ---------- Data ----------
  const BANDS = {
    low: { name: 'Low', lvl: 1 }, medium: { name: 'Medium', lvl: 2 }, high: { name: 'High', lvl: 3 },
    strong: { name: 'Strong', lvl: 4 }, extra: { name: 'Extra Strong', lvl: 5 },
  };
  const T_STD = [{ q: 1, p: 4.29, pts: 9 }, { q: 5, p: 3.99, pts: 40 }, { q: 10, p: 3.39, pts: 68 }, { q: 20, p: 3.19, pts: 128, best: true }];
  const T_VELO = [{ q: 1, p: 4.29, pts: 9 }, { q: 10, p: 3.19, pts: 64 }, { q: 20, p: 2.99, pts: 120 }, { q: 30, p: 2.49, pts: 149, best: true }];
  // [mg per pouch, band, can image, in stock]
  const P = {
    clew: { brand: 'Clew', name: 'Blueberry', price: 4.29, tiers: T_STD, sel: 2,
      v: [[5, 'low', 'clew-blueberry-5mg'], [10, 'medium', 'clew-blueberry-10mg'], [15, 'high', 'clew-blueberry-15mg'], [20, 'high', 'clew-blueberry-20mg']] },
    velo: { brand: 'VELO', name: 'Bright Spearmint', price: 4.29, tiers: T_VELO, sel: 3,
      v: [[4, 'low', 'velo-bright-spearmint-4mg-14mg'], [6, 'low', 'velo-bright-spearmint-6mg-8mg'], [8, 'medium', 'velo-bright-spearmint-6mg-8mg'], [14, 'high', 'velo-bright-spearmint-4mg-14mg']] },
    snooze: { brand: 'Snooze', name: 'Tutti Frutti', price: 4.29, tiers: T_STD, sel: 1,
      v: [[4, 'low', 'snooze-tutti-frutti-4mg', false], [10, 'medium', 'snooze-tutti-frutti-10mg'], [25, 'strong', 'snooze-tutti-frutti-25mg']] },
    cuba: { brand: 'CUBA', name: 'Mango', price: 4.29, tiers: T_STD, sel: 0,
      v: [[10.4, 'medium', 'cuba-mango-16mg'], [42.9, 'extra', 'cuba-mango-66mg']] },
  };
  Object.values(P).forEach(p => { p.v = p.v.map(([mg, b, img, ok = true]) => ({ mg, b, ok, img: CANS + img + '.webp' })); });
  const best = p => p.tiers.findIndex(t => t.best);
  const BAND_NOTE = { low: 'Ideal for beginners · Up to 6mg', medium: 'Moderate users · 7mg to 11mg', high: 'Advanced user · 12mg to 20mg', strong: 'Love the burn user · Over 20mg', extra: 'Embrace the intensity · Over 40mg' };
  const meter = b => `<span class="np-meter" data-b="${b}" aria-hidden="true">${[1, 2, 3, 4, 5].map(i => `<i${i <= BANDS[b].lvl ? ' class="on"' : ''}></i>`).join('')}</span>`;
  const pop = el => { if (el && hasGsap && !reduce) gsap.fromTo(el, { scale: 0.86, rotation: -8 }, { scale: 1, rotation: 0, duration: 0.6, ease: 'back.out(2)' }); };

  // ---------- Product card (static markup in the page, as rendered by the store) ----------
  const chips = (p, sel, attr) => p.v.map((v, i) =>
    `<button type="button" class="mgc${v.ok ? '' : ' is-oos'}" role="radio" aria-checked="${i === sel}" ${attr}="${i}" data-b="${v.b}" aria-label="${v.mg}mg, ${BANDS[v.b].name}${v.ok ? '' : ', out of stock'}"${v.ok ? '' : ' aria-disabled="true"'}>${v.mg}</button>`).join('');
  const paintCard = card => {
    const p = P[card.dataset.id], v = p.v[p.sel];
    card.querySelectorAll('[data-cv]').forEach(c => c.setAttribute('aria-checked', +c.dataset.cv === p.sel));
    const badge = card.querySelector('.pouch');
    badge.dataset.b = v.b;
    badge.setAttribute('aria-label', `${v.mg}mg nicotine per pouch`);
    badge.querySelector('b').textContent = v.mg;
    const img = card.querySelector('.pc__media img');
    if (!img.src.endsWith(v.img.replace('../', ''))) { img.src = v.img; img.alt = `${p.brand} ${p.name} ${v.mg}mg can`; pop(img); }
    pop(badge);
  };
  document.addEventListener('click', e => {
    const chip = e.target.closest('.pc [data-cv]');
    if (chip) {
      const card = chip.closest('.pc'), p = P[card.dataset.id], i = +chip.dataset.cv;
      if (!p.v[i].ok || i === p.sel) return;
      p.sel = i; paintCard(card);
      return;
    }
    const add = e.target.closest('.pc [data-quick]');
    if (add) openModal(add.dataset.quick, add);
  });

  // ---------- Quick-add pop-up / bottom sheet ----------
  const qCalc = q => {
    const p = P[q.id], t = p.tiers[q.t], cans = t.q * q.n;
    return { cans, total: t.p * cans, save: (p.price - t.p) * cans, pts: t.pts * q.n };
  };
  const qaHTML = (q, modal) => {
    const p = P[q.id], v = p.v[q.v], c = qCalc(q), tid = modal ? 'npQaModalTitle' : 'npQaTitle';
    const packs = p.tiers.map((t, i) => {
      const sv = (p.price - t.p) * t.q;
      return `<button type="button" class="qpk" role="radio" aria-checked="${i === q.t}" data-qt="${i}">
        ${t.best ? '<span class="bestv">Best value</span>' : ''}<span class="qpk__radio" aria-hidden="true"></span>
        <b class="qpk__n">${t.q} Pack</b><span class="qpk__pts">${ic('i-points', 13)}${t.pts} pts</span>
        <span class="qpk__pp">${fm(t.p)}<small> pp</small></span>${sv > 0.004 ? `<em class="qpk__save">Save ${fm(sv)}</em>` : '<span class="qpk__save is-none">No savings</span>'}
      </button>`;
    }).join('');
    return `<span class="qa__grab" aria-hidden="true"></span>
      <div class="qa__head">
        <div class="qa__img"><img src="${v.img}" alt=""></div>
        <div class="qa__id">
          <span class="qa__brand">${p.brand}</span>
          <h3 id="${tid}">${p.name}</h3>
          <div class="qa__meta"><span class="np-tag np-tag--mm">Mix &amp; Match</span></div>
          <div class="qa__price"><b>${fm(p.price)}</b><span>per can</span></div>
        </div>
        ${modal ? `<button class="qa__close" type="button" data-np-close aria-label="Close">${ic('i-close', 20)}</button>` : ''}
      </div>
      <div class="qa__sec">
        <div class="qa__l"><b>Strength (mg)</b><span>${v.mg}mg · ${BANDS[v.b].name}</span></div>
        <div class="qa__chips" role="radiogroup" aria-label="Strength">${chips(p, q.v, 'data-qv')}</div>
      </div>
      <div class="qa__sec">
        <div class="qa__l"><b>Mix &amp; Match Bundle Offers</b></div>
        <div class="qa__packs" role="radiogroup" aria-label="Pack size">${packs}</div>
      </div>
      <div class="qa__dock">
        <div class="qa__buy">
          <div class="qty" role="group" aria-label="How many packs">
            <button type="button" data-qn="-1" aria-label="Fewer"${q.n <= 1 ? ' disabled' : ''}>${ic('i-minus')}</button><output>${q.n}</output><button type="button" data-qn="1" aria-label="More"${q.n >= 9 ? ' disabled' : ''}>${ic('i-plus')}</button>
          </div>
          <button class="qa__add${q.added ? ' is-added' : ''}" type="button" data-qadd>${q.added ? `${ic('i-check', 18)}<span>Added to basket</span>` : `<span>Add to basket · ${fm(c.total)}</span>`}</button>
        </div>
        <div class="sp-pair">
          ${c.save > 0.004 ? `<span class="sp sp--save">${ic('i-tag', 14)}You save ${fm(c.save)}</span>` : ''}
          <span class="sp sp--pts">${ic('i-points', 14)}${c.pts} pts</span>
          <span class="sp sp--disp">${ic('i-clock', 14)}<span>Dispatch <b>next working day</b></span></span>
        </div>
        <div class="qa__18bar"><span class="age-18">18+</span><span>${WARNING}</span></div>
      </div>`;
  };
  const makeQa = (box, id, modal) => {
    const p = P[id];
    const q = { id, v: p.sel, t: best(p), n: 1, added: false };
    const draw = focusSel => {
      box.innerHTML = qaHTML(q, modal);
      if (focusSel) box.querySelector(focusSel)?.focus();
    };
    box.addEventListener('click', e => {
      const v = e.target.closest('[data-qv]'), t = e.target.closest('[data-qt]'), n = e.target.closest('[data-qn]'), a = e.target.closest('[data-qadd]');
      if (v) { q.v = +v.dataset.qv; q.added = false; draw(`[data-qv="${q.v}"]`); swapImg(box); }
      else if (t) { q.t = +t.dataset.qt; q.added = false; draw(`[data-qt="${q.t}"]`); }
      else if (n) { q.n = Math.max(1, Math.min(9, q.n + +n.dataset.qn)); q.added = false; draw(`[data-qn="${n.dataset.qn}"]`); }
      else if (a && !q.added) {
        basketAdd(q.id, q.v, qCalc(q).cans);
        q.added = true; draw('[data-qadd]');
        setTimeout(() => { q.added = false; if (box.isConnected && box.querySelector('.is-added')) draw(); if (modal) closeModal(); }, modal ? 900 : 1800);
      }
    });
    draw();
    return { q, draw };
  };
  const swapImg = box => {
    const img = box.querySelector('.qa__img img');
    if (img && hasGsap && !reduce) gsap.fromTo(img, { scale: 0.8, rotation: -10 }, { scale: 1, rotation: 0, duration: 0.6, ease: 'back.out(2)' });
  };

  // The same pop-up as a real dialog, opened from the cards' + buttons
  const modalWrap = $('[data-np-modal]');
  let modalBox = $('[data-np-qa-modal]'), opener = null;
  const keyTrap = e => {
    if (e.key === 'Escape') { closeModal(); return; }
    if (e.key !== 'Tab') return;
    const f = $$('button:not([disabled])', modalBox);
    if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  };
  function openModal(id, from) {
    if (!modalWrap) return;
    opener = from;
    // a fresh box each time, so no listeners pile up
    const fresh = modalBox.cloneNode(false);
    modalBox.replaceWith(fresh);
    modalBox = fresh;
    makeQa(fresh, id, true);
    modalWrap.setAttribute('aria-hidden', 'false');
    modalWrap.classList.add('is-open');
    document.documentElement.classList.add('np-lock');
    document.addEventListener('keydown', keyTrap);
    setTimeout(() => fresh.querySelector('[data-qadd]')?.focus(), 60);
  }
  function closeModal() {
    if (!modalWrap?.classList.contains('is-open')) return;
    modalWrap.classList.remove('is-open');
    modalWrap.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('np-lock');
    document.removeEventListener('keydown', keyTrap);
    opener?.isConnected && opener.focus();
  }
  modalWrap?.addEventListener('click', e => { if (e.target.closest('[data-np-close]')) closeModal(); });

  // ---------- Basket with the rewards panel ----------
  const STEPS = [[5, 7], [10, 21], [20, 26]];
  const lines = [{ id: 'clew', v: 0, q: 5 }];
  let fresh = -1; // index of the line that just changed, for the slide-in
  const basketEl = $('[data-np-basket]');
  function basketAdd(id, v, q) {
    const ex = lines.find(l => l.id === id && l.v === v);
    if (ex) { ex.q = Math.min(60, ex.q + q); lines.splice(lines.indexOf(ex), 1); }
    lines.unshift(ex || { id, v, q }); // newest on top, as in the store's drawer
    fresh = 0;
    renderBasket(true);
  }
  const price = () => {
    // Mix & Match: every can in the basket counts towards the pack price
    const n = lines.reduce((a, l) => a + l.q, 0);
    let was = 0, total = 0, pts = 0, count = 0;
    const out = lines.map((l, i) => {
      const p = P[l.id];
      const tier = p.tiers.reduce((a, t) => (t.q <= n && (!a || t.q > a.q) ? t : a), null);
      const L = { i, p, v: p.v[l.v], q: l.q, unit: tier.p, tier, total: tier.p * l.q, was: p.price * l.q, pts: Math.round(tier.pts / tier.q * l.q) };
      was += L.was; total += L.total; pts += L.pts; count += l.q;
      return L;
    });
    return { lines: out, was, total, save: was - total, pts, count, toFree: Math.max(0, 20 - total) };
  };
  const rewards = n => {
    const next = STEPS.find(x => x[0] > n), got = STEPS.filter(x => x[0] <= n).pop();
    return !next ? `${got[1]}% Off Obtained!` : n === 0 ? `Add ${next[0]} for ${next[1]}% Off!` : `Add ${next[0] - n} more for ${next[1]}% Off!`;
  };
  function renderBasket(bump) {
    if (!basketEl) return;
    const s = price(), n = s.count, free = s.toFree <= 0 && n > 0;
    const seg = STEPS.map((x, i) => {
      const from = i ? STEPS[i - 1][0] : 0, pc = Math.max(0, Math.min(1, (n - from) / (x[0] - from)));
      return `<div class="rw__seg${n >= x[0] ? ' on' : ''}"><span class="rw__bar"><i style="width:${pc * 100}%"></i></span><span class="rw__num">${x[0]}</span><span class="rw__lab">Buy ${x[0]} → ${x[1]}%</span></div>`;
    }).join('');
    const lineHTML = L => `<li class="line${L.i === fresh ? ' is-new' : ''}">
        <span class="line__img"><img src="${L.v.img}" alt=""></span>
        <div class="line__main">
          <div class="line__top"><div><span class="line__brand">${L.p.brand}</span><span class="line__name">${L.p.name}</span></div>
            <div class="line__price">${fm(L.total)}${L.was > L.total + 0.001 ? `<s>${fm(L.was)}</s>` : ''}</div></div>
          <div class="line__meta"><span class="np-tag np-tag--band" data-b="${L.v.b}">${L.v.mg}mg · ${BANDS[L.v.b].name}</span><span class="np-tag np-tag--mm">Mix &amp; Match</span>${L.tier.q > 1 ? `<span class="line__each">${fm(L.unit)} each · ${L.tier.q} Pack price</span>` : ''}</div>
          <div class="line__ctl">
            <div class="qty qty--sm" role="group" aria-label="Quantity of ${L.p.name}"><button type="button" data-bq="${L.i}" data-d="-1" aria-label="One fewer">${ic('i-minus', 14)}</button><output>${L.q}</output><button type="button" data-bq="${L.i}" data-d="1" aria-label="One more"${L.q >= 60 ? ' disabled' : ''}>${ic('i-plus', 14)}</button></div>
            <button class="line__rm" type="button" data-brm="${L.i}">Remove</button>
          </div>
        </div>
      </li>`;
    basketEl.innerHTML = `<div class="bk__head"><b>Basket</b><span>(${n})</span></div>
      <section class="rw" aria-label="Rewards">
        <div class="rw__stats">
          <span class="rw__count"><b>${n}</b><small>items</small></span>
          <span class="rws"><span class="ibx">${ic('i-tag', 12)}</span>Save <b class="rws__save">${fm(s.save)}</b></span>
          <span class="rws rws--pts"><span class="ibx">${ic('i-points', 12)}</span><b>${s.pts}</b> pts</span>
          <span class="rws"><span class="ibx">${ic('i-truck', 12)}</span>${free ? 'Free delivery' : n ? `<b>${fm(s.toFree)}</b>&nbsp;to free` : 'Free over £20'}</span>
        </div>
        <p class="rw__head"><span class="np-tag np-tag--mm">Mix &amp; Match</span>${rewards(n)}</p>
        <div class="rw__steps">${seg}</div>
      </section>
      ${s.lines.length ? `<ul class="lines">${s.lines.slice(0, 2).map(lineHTML).join('')}</ul>${s.lines.length > 2 ? `<p class="lines__more">+ ${s.lines.length - 2} more ${s.lines.length > 3 ? 'lines' : 'line'} in the basket</p>` : ''}` :
        `<div class="bk__empty"><b>Your basket is empty</b><span>Buy 5 → 7% · Buy 10 → 21% · Buy 20 → 26%</span><button type="button" class="np-btn np-btn--sm" data-brefill>Add 5 Clew Blueberry</button></div>`}
      <div class="bk__foot">
        <div class="bk__total"><span>Total${n && !free ? ' <small>incl. £2.99 delivery</small>' : ''}</span><span><b>${fm(n ? s.total + (free ? 0 : 2.99) : 0)}</b>${s.save > 0.004 ? `<small class="bk__save">You save ${fm(s.save)}</small>` : ''}</span></div>
        <span class="bk__go">Checkout</span>
        <span class="bk__18"><span class="age-18 age-18--xs">18+</span>Age verified at checkout</span>
      </div>`;
    fresh = -1;
    if (bump && hasGsap && !reduce) gsap.fromTo(basketEl.querySelector('.rw__count'), { scale: 1.35 }, { scale: 1, duration: 0.6, ease: 'back.out(3)' });
  }
  if (basketEl) {
    basketEl.addEventListener('click', e => {
      const b = e.target.closest('[data-bq]'), r = e.target.closest('[data-brm]'), f = e.target.closest('[data-brefill]');
      if (b) {
        const l = lines[+b.dataset.bq];
        l.q = Math.max(0, Math.min(60, l.q + +b.dataset.d));
        if (!l.q) lines.splice(+b.dataset.bq, 1);
        renderBasket(true);
        basketEl.querySelector(`[data-bq="${b.dataset.bq}"][data-d="${b.dataset.d}"]`)?.focus();
      } else if (r) { lines.splice(+r.dataset.brm, 1); renderBasket(); basketEl.querySelector('[data-brefill], [data-bq]')?.focus(); }
      else if (f) { lines.push({ id: 'clew', v: 2, q: 5 }); renderBasket(true); basketEl.querySelector('[data-bq]')?.focus(); }
    });
    renderBasket();
  }

  // ---------- Nic Points tiers: tap spreads the fan on touch screens (hover does it on desktop) ----------
  $$('[data-np-fan]').forEach(f => f.addEventListener('click', () => f.classList.toggle('is-open')));

  // ---------- Strength + pack chooser (product.js .packs / .buy), feeding the basket ----------
  const bbEl = $('[data-np-buybox]');
  if (bbEl) {
    const p = P.clew, PACKS = [1, 2, 3]; // the 5, 10 and 20 packs
    const b = { v: 2, t: 3, n: 1, added: false };
    const draw = focusSel => {
      const v = p.v[b.v], t = p.tiers[b.t], cans = t.q * b.n, save = (p.price - t.p) * cans;
      const packs = PACKS.map(i => {
        const x = p.tiers[i], sv = (p.price - x.p) * x.q;
        return `<button type="button" class="pack" role="radio" aria-checked="${i === b.t}" data-bt="${i}">${x.best ? '<span class="bestv">Best value</span>' : ''}<span class="radio"></span>
          <span class="pack__q"><b>${x.q} Pack</b><small>${fm(x.p)} pp<s>${fm(p.price)}</s> · <span class="ptsi">${ic('i-points', 12)}Earn ${x.pts} pts</span></small></span>
          <span class="pack__r"><b>${fm(x.p * x.q)}</b><span class="np-tag np-tag--save">Save ${fm(sv)}</span></span></button>`;
      }).join('');
      bbEl.innerHTML = `<div class="bb__head">
          <div class="bb__img"><img src="${v.img}" alt="${p.brand} ${p.name} ${v.mg}mg can"><span class="pouch" data-b="${v.b}" role="img" aria-label="${v.mg}mg nicotine per pouch"><svg class="pouch__shape" viewBox="0 0 48 26" preserveAspectRatio="none" aria-hidden="true"><path d="M7 1.8C15 .4 33 .4 41 1.8c4.2.8 5.8 3.6 5.8 11.2S45.2 23.4 41 24.2c-8 1.4-26 1.4-34 0C2.8 23.4 1.2 20.6 1.2 13S2.8 2.6 7 1.8z"/></svg><span class="pouch__t"><span class="pouch__l1"><b>${v.mg}</b><small>mg</small></span><small class="pouch__l2">p/pouch</small></span></span></div>
          <div><span class="bb__brand">${p.brand}</span><h3 class="bb__name">${p.brand} ${p.name}</h3><span class="np-tag np-tag--mm">Mix &amp; Match</span>
            <div class="bb__price"><b>${fm(t.p)}</b><span>per can</span><s>${fm(p.price)}</s></div></div>
        </div>
        <div class="bb__l">Strength (mg)<span>${v.mg}mg · ${BANDS[v.b].name}</span></div>
        <div class="bb__chips" role="radiogroup" aria-label="Strength">${chips(p, b.v, 'data-bv')}</div>
        <div class="band-note" data-b="${v.b}">${meter(v.b)}<span><b>${BANDS[v.b].name}</b> · ${BAND_NOTE[v.b]}</span></div>
        <div class="bb__l">Mix &amp; Match Bundle Offers</div>
        <div class="packs" role="radiogroup" aria-label="Pack size">${packs}</div>
        <div class="bb__buy">
          <div class="qty" role="group" aria-label="Number of packs"><button type="button" data-bn="-1" aria-label="Fewer"${b.n <= 1 ? ' disabled' : ''}>${ic('i-minus')}</button><output>${b.n}</output><button type="button" data-bn="1" aria-label="More"${b.n >= 3 ? ' disabled' : ''}>${ic('i-plus')}</button></div>
          <button class="bb__add${b.added ? ' is-added' : ''}" type="button" data-badd>${b.added ? `${ic('i-check', 18)}<span>Added to basket</span>` : `<span>Add to basket · ${fm(t.p * cans)}</span>`}</button>
        </div>
        <div class="sp-pair"><span class="sp sp--save">${ic('i-tag', 14)}You save ${fm(save)}</span><span class="sp sp--pts">${ic('i-points', 14)}Earn ${t.pts * b.n} pts</span></div>`;
      if (focusSel) bbEl.querySelector(focusSel)?.focus({ preventScroll: true });
    };
    let addedT;
    bbEl.addEventListener('click', e => {
      const v = e.target.closest('[data-bv]'), t = e.target.closest('[data-bt]'), n = e.target.closest('[data-bn]'), a = e.target.closest('[data-badd]');
      if (v) { if (+v.dataset.bv === b.v) return; b.v = +v.dataset.bv; b.added = false; draw(`[data-bv="${b.v}"]`); pop(bbEl.querySelector('.bb__img img')); }
      else if (t) { b.t = +t.dataset.bt; b.added = false; draw(`[data-bt="${b.t}"]`); }
      else if (n) { b.n = Math.max(1, Math.min(3, b.n + +n.dataset.bn)); b.added = false; draw(`[data-bn="${n.dataset.bn}"]`); }
      else if (a && !b.added) {
        basketAdd('clew', b.v, p.tiers[b.t].q * b.n);
        b.added = true; draw('[data-badd]');
        clearTimeout(addedT);
        addedT = setTimeout(() => { b.added = false; if (bbEl.querySelector('.is-added')) draw(); }, 1600);
      }
    });
    draw();
  }
})();
