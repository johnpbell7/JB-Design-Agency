// VSL Trade page extras. The film steps, reveals and counters come from
// case.js / case-plus.js. This file runs the pulled-out pieces:
//  - the homepage wallet: an order lands when it is seen and the credit counts
//    up; Pay by BACS adds another (invented demo figures only)
//  - the homepage USP strip: three tiles whose icons animate in, and again on hover
//  - the consultation step card (consultation.js): answer and the step moves on
//  - Register Free (register.html + main.js form[data-demo]): the store name
//    types itself in when the card is seen, and the steps tick as it fills.
//    Finishing the consultation hands the store over to it.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const STORE = "Sam's Shop", CONTACT = 'Sam';

  // ---------- Wallet (homepage app story, "Earn credit on orders") ----------
  // The first time it is on screen an order lands: a row slides in, the chip
  // pops and the balance counts up from £18.40, as on the site. Pay by BACS
  // adds another. All figures are invented demo credit, never trade prices.
  const wal = document.querySelector('[data-wal]');
  if (wal) {
    const amtEl = wal.querySelector('[data-wal-amt]'), list = wal.querySelector('[data-wal-tx]');
    const bal = amtEl.parentElement, pay = wal.querySelector('[data-wal-pay]');
    const chip = wal.parentElement.querySelector('[data-wal-chip]');
    const CREDITS = [4.3, 3.75, 0.9, 4.85, 3.45, 2.6]; // none of these, nor any running total, is a catalogue price
    let amount = 18.4, order = 1047, n = 0, raf = 0, upTimer;
    const fmt = v => '£' + v.toFixed(2);
    const countTo = to => {
      cancelAnimationFrame(raf);
      const from = amount, t0 = performance.now(), dur = reduce ? 0 : 1300;
      amount = to;
      const tick = now => {
        const k = dur ? Math.min(1, (now - t0) / dur) : 1;
        amtEl.textContent = fmt(from + (to - from) * (1 - Math.pow(1 - k, 2))); // power1.out
        if (k < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    const land = () => {
      const credit = CREDITS[n++ % CREDITS.length];
      const li = document.createElement('li');
      li.className = 'is-new';
      li.innerHTML = `<span class="vs-wal__o">Order ${order++}<small>Paid by BACS</small></span><b>+${fmt(credit)}</b>`;
      list.prepend(li);
      const rows = [...list.children].filter(r => !r.classList.contains('is-out'));
      rows.slice(2).forEach(r => { r.classList.add('is-out'); setTimeout(() => r.remove(), reduce ? 0 : 450); });
      chip.classList.remove('is-pop'); void chip.offsetWidth; chip.classList.add('is-pop');
      bal.classList.add('is-up'); clearTimeout(upTimer); upTimer = setTimeout(() => bal.classList.remove('is-up'), 1700);
      setTimeout(() => countTo(Math.round((amount + credit) * 100) / 100), reduce ? 0 : 250);
    };
    pay.addEventListener('click', land);
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        setTimeout(land, reduce ? 0 : 700);
      }, { threshold: 0.6 });
      io.observe(wal);
    }
  }

  // ---------- USP strip (homepage, under the hero) ----------
  // The three tiles play their icons in turn when the strip comes into view:
  // the margin line draws up, the range squares pop in, the van drives in.
  // Hovering or tapping a tile plays its icon again.
  const usps = document.querySelector('[data-usps]');
  if (usps && !reduce) {
    const tiles = [...usps.querySelectorAll('.vs-usp')];
    const play = t => { t.classList.remove('is-play'); void t.offsetWidth; t.classList.add('is-play'); };
    tiles.forEach(t => {
      t.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse' && usps.classList.contains('is-in')) play(t); });
      t.addEventListener('pointerdown', () => { if (usps.classList.contains('is-in')) play(t); });
    });
    if ('IntersectionObserver' in window) {
      usps.classList.add('is-armed');
      const io = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        usps.classList.add('is-in');
        tiles.forEach((t, i) => setTimeout(() => play(t), 300 + i * 380));
      }, { threshold: 0.5 });
      io.observe(usps);
    }
  }

  // ---------- Register Free ----------
  const reg = document.querySelector('[data-reg]');
  let typeInto = () => Promise.resolve();
  let regSync = () => {};
  if (reg) {
    const store = reg.querySelector('#vs-store'), contact = reg.querySelector('#vs-contact'), type = reg.querySelector('#vs-type');
    const go = reg.querySelector('[data-reg-go]'), fields = reg.querySelector('[data-reg-fields]'), ok = reg.querySelector('[data-reg-ok]');
    const step = k => reg.querySelector(`[data-reg-step="${k}"]`);
    let busy = false;
    regSync = () => {
      const a = !!store.value.trim(), b = a && !!contact.value.trim() && !!type.value;
      step('store').classList.toggle('is-done', a);
      step('details').classList.toggle('is-done', b);
      step('review').classList.toggle('is-done', !ok.hidden);
      go.disabled = !b;
    };
    // types like a person, one letter at a time, into an empty field
    typeInto = async (input, text) => {
      while (busy) await new Promise(r => setTimeout(r, 100));
      if (input.value.trim()) return;
      busy = true;
      const fg = input.closest('.vs-fg');
      fg.classList.add('is-typing');
      if (reduce) input.value = text;
      else for (const ch of text) { input.value += ch; await new Promise(r => setTimeout(r, 85 + Math.random() * 60)); }
      fg.classList.remove('is-typing');
      busy = false;
      regSync();
    };
    [store, contact, type].forEach(f => f.addEventListener('input', regSync));
    type.addEventListener('change', regSync);
    reg.addEventListener('submit', e => {
      e.preventDefault();
      if (go.disabled) return;
      reg.querySelector('[data-reg-name]').textContent = store.value.trim();
      fields.hidden = true; ok.hidden = false;
      regSync();
    });
    reg.querySelector('[data-reg-again]').addEventListener('click', () => {
      reg.reset(); ok.hidden = true; fields.hidden = false; regSync();
    });
    // the first time it is properly on screen, the store name fills itself in
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        setTimeout(() => typeInto(store, STORE), 500);
      }, { threshold: 0.7 });
      io.observe(reg);
    }
    regSync();
  }

  // ---------- Consultation step card ----------
  const cf = document.querySelector('[data-cf]');
  if (cf) {
    const screens = [...cf.querySelectorAll('[data-cf-screen]')];
    const n = screens.length;
    const pill = cf.querySelector('[data-cf-step]'), bar = cf.querySelector('[data-cf-bar]'), meter = bar.parentElement;
    const back = cf.querySelector('[data-cf-back]'), next = cf.querySelector('[data-cf-next]'), toReg = cf.querySelector('[data-cf-reg]');
    let cur = 0, timer;
    const answered = s => !s.querySelector('input') || !!s.querySelector('input:checked');
    const show = i => {
      cur = Math.max(0, Math.min(n - 1, i));
      screens.forEach((s, k) => {
        s.classList.toggle('is-on', k === cur);
        s.classList.toggle('is-past', k < cur);
        s.querySelectorAll('input').forEach(inp => { inp.tabIndex = k === cur ? 0 : -1; });
      });
      const last = cur === n - 1, pct = Math.round(((cur + 1) / n) * 100);
      pill.textContent = last ? 'Last step' : `Step ${cur + 1} of ${n}`;
      bar.style.width = pct + '%';
      meter.setAttribute('aria-valuenow', pct);
      back.disabled = cur === 0;
      next.hidden = last; toReg.hidden = !last;
      next.disabled = !answered(screens[cur]);
    };
    cf.addEventListener('change', e => {
      const s = e.target.closest('[data-cf-screen]');
      if (!s) return;
      // "None of the above" clears the others, and the others clear it (as on the site)
      if (e.target.type === 'checkbox') {
        const none = e.target.value === 'none';
        s.querySelectorAll('input').forEach(x => { if (x !== e.target && e.target.checked && (none || x.value === 'none')) x.checked = false; });
      }
      next.disabled = !answered(s);
      // a single choice moves straight on; ticks wait for Next
      clearTimeout(timer);
      if (e.target.type === 'radio') timer = setTimeout(() => show(cur + 1), reduce ? 0 : 520);
    });
    next.addEventListener('click', () => { if (answered(screens[cur])) show(cur + 1); });
    back.addEventListener('click', () => { clearTimeout(timer); show(cur - 1); });
    // the hand-off: Register Free picks up the store and fills in the rest
    toReg.addEventListener('click', async () => {
      if (!reg) return;
      reg.classList.remove('is-nudged'); void reg.offsetWidth; reg.classList.add('is-nudged');
      const ok = reg.querySelector('[data-reg-ok]');
      if (!ok.hidden) reg.querySelector('[data-reg-again]').click();
      await typeInto(reg.querySelector('#vs-store'), STORE);
      await typeInto(reg.querySelector('#vs-contact'), CONTACT);
      const type = reg.querySelector('#vs-type');
      if (!type.value) { type.value = 'Convenience'; regSync(); }
      reg.querySelector('[data-reg-go]').focus({ preventScroll: true });
    });
    show(0);
  }
})();
