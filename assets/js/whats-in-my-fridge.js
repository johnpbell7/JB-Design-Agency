// What's in my Fridge: the app's screens and pieces, rebuilt from its source and set
// moving. Each demo plays on its own while it's on screen and pauses when it isn't;
// the pull-out pieces also work by tapping. Reduced motion shows every demo finished.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof window.gsap !== 'undefined';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // ---------- App screens: laid out at 390px like the app, scaled to the phone ----------
  const fit = el => {
    const box = el.parentElement;
    const k = box.clientWidth / 390;
    if (!k) return;
    el.style.transform = `scale(${k})`;
    el.style.height = `${box.clientHeight / k}px`;
  };
  const fits = $$('[data-fit]');
  fits.forEach(fit);
  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(entries => entries.forEach(e => { const el = e.target.querySelector(':scope > [data-fit]'); if (el) fit(el); }));
    fits.forEach(el => ro.observe(el.parentElement));
  } else addEventListener('resize', () => fits.forEach(fit));

  // ---------- Demos: one looping timeline each, played only while in view ----------
  const demos = {};
  const watch = (root, build) => {
    if (!root) return;
    const name = root.dataset.demo;
    if (!hasGsap || reduce) { build(null); return; }
    let tl = null, seen = false;
    const start = () => { tl?.kill(); tl = build(gsap.timeline({ repeat: -1, repeatDelay: 1.6 })); };
    demos[name] = () => { start(); seen = true; };
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { if (!seen) { seen = true; start(); } else tl?.play(); }
      else tl?.pause();
    }, { threshold: 0.3 }).observe(root);
  };
  $$('[data-replay]').forEach(b => b.addEventListener('click', () => demos[b.dataset.replay]?.()));
  if (reduce || !hasGsap) $$('[data-replay]').forEach(b => { b.hidden = true; });

  const show = (el, on) => { if (el) el.hidden = !on; };
  const press = (tl, el, at) => tl.call(() => el.classList.add('is-press'), null, at).call(() => el.classList.remove('is-press'), null, at + 0.28);

  // 01 Scan: snap, read, check the list, add it
  watch($('[data-demo="scan"]'), tl => {
    const r = $('[data-demo="scan"]');
    const s = k => $(`[data-s="${k}"]`, r);
    const rows = $$('.fa-crow', s('confirm'));
    const filedRows = $$('.fa-item', s('filed'));
    const navs = $$('.fa-nav > span', r);
    const title = $('.fa-title', r);
    const flag = $('.fa-flag', r);
    const set = phase => {
      ['idle', 'reading', 'confirm', 'filed'].forEach(p => show(s(p), p === phase));
      show(s('dock'), phase === 'confirm');
      show(title, phase !== 'filed'); show(s('sub'), phase !== 'filed');
      s('sub').textContent = phase === 'confirm' ? 'Check what I saw, then confirm.' : 'A photo proposes items. You decide.';
      navs.forEach((n, i) => n.classList.toggle('on', i === (phase === 'filed' ? 3 : 2)));
    };
    if (!tl) { set('confirm'); return; }
    const sweep = $('.fa-sweep', r);
    tl.call(() => set('idle'), null, 0)
      .fromTo(s('shutter'), { scale: 1 }, { scale: 1.04, duration: 0.25, yoyo: true, repeat: 1, ease: 'power1.inOut' }, 0.7);
    press(tl, s('shutter'), 1.1);
    tl.call(() => set('reading'), null, 1.5)
      .fromTo(sweep, { y: 0 }, { y: 400, duration: 1.1, ease: 'none', repeat: 1 }, 1.5)
      .call(() => set('confirm'), null, 3.8)
      .fromTo(rows, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5, ease: 'back.out(2)', stagger: 0.13 }, 3.85)
      .fromTo(s('dock'), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'expo.out' }, 4.3)
      .fromTo(flag, { scale: 1 }, { scale: 1.25, duration: 0.22, yoyo: true, repeat: 3, ease: 'power1.inOut', transformOrigin: '0 50%' }, 5.2);
    press(tl, s('add'), 7.2);
    tl.call(() => set('filed'), null, 7.6)
      .fromTo($('.fa-cat', s('filed')), { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.5, ease: 'expo.out' }, 7.65)
      .fromTo(filedRows, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5, ease: 'back.out(2)', stagger: 0.1 }, 7.8)
      .to({}, { duration: 2.4 }, 8.4);
    return tl;
  });

  // Scan pull-out: where to file the items
  const FILE_HINT = {
    auto: 'Each item is filed where it usually lives: fridge, freezer or pantry.',
    fridge: 'Everything goes in the fridge.',
    freezer: 'Everything goes in the freezer.',
    pantry: 'Everything goes in the pantry.',
  };
  $$('[data-file]').forEach(b => b.addEventListener('click', () => {
    $$('[data-file]').forEach(x => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-checked', on); });
    const hint = $('[data-file-hint]'); if (hint) hint.textContent = FILE_HINT[b.dataset.file];
  }));

  // 02 Receipt: a beam reads each line; shorthand turns into a real name
  watch($('[data-demo="receipt"]'), tl => {
    const r = $('[data-demo="receipt"]');
    const lines = $$('[data-r="lines"] li', r);
    const rows = $$('[data-r="rows"] .wf-frow', r);
    const skips = [...$$('li[data-skip]', r), ...$$('.wf-receipt__foot[data-skip]', r)];
    const beam = $('[data-r="beam"]', r), paper = $('.wf-receipt', r);
    const date = $('.wf-found__date', r);
    if (!tl) { skips.forEach(l => l.classList.add('is-skip')); return; }
    tl.call(() => { lines.forEach(l => l.classList.remove('is-on', 'is-skip')); skips.forEach(l => l.classList.remove('is-skip')); }, null, 0)
      .set(rows, { opacity: 0, x: -16 }, 0)
      .set(date, { opacity: 0, y: -8 }, 0)
      .set(beam, { opacity: 1, y: 40 }, 0.3)
      .to(date, { opacity: 1, y: 0, duration: 0.5, ease: 'expo.out' }, 0.4);
    const targets = [...lines, ...$$('.wf-receipt__foot', r)];
    targets.forEach((line, i) => {
      const at = 0.8 + i * 0.62;
      tl.to(beam, { y: () => line.offsetTop + line.offsetHeight / 2, duration: 0.5, ease: 'power2.inOut' }, at - 0.5);
      if (line.hasAttribute('data-skip')) tl.call(() => line.classList.add('is-skip'), null, at);
      else {
        tl.call(() => { lines.forEach(l => l.classList.remove('is-on')); line.classList.add('is-on'); }, null, at);
        const row = rows[+line.dataset.to];
        if (row) tl.to(row, { opacity: 1, x: 0, duration: 0.5, ease: 'back.out(2)' }, at + 0.1);
      }
    });
    const end = 0.8 + targets.length * 0.62;
    tl.to(rows[rows.length - 1], { opacity: 1, x: 0, duration: 0.5, ease: 'expo.out' }, end)
      .call(() => lines.forEach(l => l.classList.remove('is-on')), null, end)
      .to(beam, { opacity: 0, duration: 0.3 }, end)
      .to({}, { duration: 2.6 }, end + 0.4);
    void paper;
    return tl;
  });

  // 03 Use it up: tap Used to clear an item, or the snowflake to freeze it
  const soonList = $('[data-soon-list]');
  const soonCount = () => {
    const n = $$('.fa-item.soon, .fa-item.expired', soonList).length;
    const c = $('[data-soon-count]'); if (c) c.textContent = n;
    const banner = $('[data-soon-banner]');
    if (banner) banner.style.display = n ? '' : 'none';
  };
  const resetSoon = () => {
    $$('.fa-item', soonList).forEach(li => {
      li.style.display = ''; li.style.opacity = ''; li.style.transform = '';
      li.className = li.dataset.cls; li.innerHTML = li.dataset.html;
    });
    soonCount();
  };
  if (soonList) {
    $$('.fa-item', soonList).forEach(li => { li.dataset.cls = li.className; li.dataset.html = li.innerHTML; });
    const leave = (li, then) => {
      if (!hasGsap || reduce) { li.style.display = 'none'; then?.(); return; }
      gsap.to(li, { opacity: 0, scale: 0.97, duration: 0.2, delay: 0.3, onComplete: () => {
        const h = li.offsetHeight;
        gsap.fromTo(li, { height: h }, { height: 0, marginTop: -9, paddingBlock: 0, borderWidth: 0, duration: 0.3, ease: 'power2.inOut', onComplete: () => { li.style.display = 'none'; gsap.set(li, { clearProps: 'height,marginTop,paddingBlock,borderWidth,scale' }); then?.(); } });
      } });
    };
    soonList.addEventListener('click', e => {
      const used = e.target.closest('[data-used]'), freeze = e.target.closest('[data-freeze]');
      const li = e.target.closest('.fa-item');
      if (!li) return;
      if (used && !used.classList.contains('on')) {
        used.classList.add('on'); used.setAttribute('aria-pressed', 'true');
        leave(li, () => { soonCount(); if (!$$('.fa-item', soonList).some(x => x.style.display !== 'none')) setTimeout(resetSoon, 900); });
      }
      if (freeze && !freeze.classList.contains('on')) {
        freeze.classList.add('on');
        setTimeout(() => {
          freeze.classList.remove('on'); freeze.style.visibility = 'hidden';
          $('[data-where]', li).textContent = 'Freezer';
          li.classList.remove('soon', 'expired');
          const exp = $('.fa-exp', li); exp.previousElementSibling.remove(); exp.remove();
          soonCount();
        }, 350);
      }
    });
  }
  // On screen, it shows itself once: one item used
  watch($('[data-demo="soon"]'), tl => {
    if (!tl) return;
    const used = $$('[data-used]', soonList)[0];
    tl.repeat(0);
    tl.call(() => used?.click(), null, 1.6);
    return tl;
  });

  // 04 The usuals: Add puts it on the list; ticking files it back into the fridge
  const usuals = $('[data-demo="usuals"]');
  if (usuals) {
    const shop = $('[data-shop]', usuals), done = $('[data-done]', usuals), head = $('[data-tickhead]', usuals);
    const ticked = $('[data-ticked]', usuals), toast = $('[data-usuals-toast]', usuals);
    const count = () => { const n = $$('.fa-shop.done', usuals).length; ticked.textContent = n; head.hidden = !n; };
    const flash = () => {
      if (!hasGsap || reduce) return;
      gsap.killTweensOf(toast);
      gsap.fromTo(toast, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.35, ease: 'back.out(2)' });
      gsap.to(toast, { opacity: 0, y: 12, duration: 0.25, delay: 1.8 });
    };
    const row = name => {
      const d = document.createElement('div');
      d.className = 'fa-shop';
      d.innerHTML = `<button type="button" class="fa-box" aria-label="Tick off ${name}" aria-pressed="false"><svg width="15" height="15"><use href="#fa-check"/></svg></button><b>${name}</b><i><svg width="17" height="17" aria-hidden="true"><use href="#fa-pin"/></svg></i>`;
      return d;
    };
    usuals.addEventListener('click', e => {
      const add = e.target.closest('[data-add]');
      if (add && !add.classList.contains('done')) {
        add.classList.add('done'); $('span', add).textContent = 'On list';
        const r = row(add.dataset.add);
        shop.prepend(r);
        if (hasGsap && !reduce) gsap.from(r, { opacity: 0, y: -12, duration: 0.45, ease: 'back.out(2)' });
        flash();
      }
      const box = e.target.closest('.fa-box');
      if (box) {
        const r = box.closest('.fa-shop');
        const on = !r.classList.contains('done');
        r.classList.toggle('done', on); box.setAttribute('aria-pressed', on);
        setTimeout(() => {
          (on ? done : shop).append(r);
          if (hasGsap && !reduce) gsap.from(r, { opacity: 0, y: on ? -8 : 8, duration: 0.35, ease: 'expo.out' });
          count();
        }, on ? 320 : 0);
      }
    });
    const reset = () => {
      $$('[data-add]', usuals).forEach(b => { b.classList.remove('done'); $('span', b).textContent = 'Add'; });
      $$('.fa-shop', usuals).forEach(r => { if (!['Lemons', 'Garlic'].includes($('b', r).textContent)) r.remove(); else { r.classList.remove('done'); $('.fa-box', r).setAttribute('aria-pressed', 'false'); shop.append(r); } });
      count();
    };
    watch(usuals, tl => {
      if (!tl) return;
      const addMilk = () => $$('[data-add]', usuals)[2];
      tl.call(reset, null, 0)
        .call(() => addMilk().click(), null, 1.2)
        .call(() => $$('[data-add]', usuals)[0].click(), null, 2.6)
        .call(() => { const r = $$('.fa-shop', shop).find(x => $('b', x).textContent === 'Milk'); $('.fa-box', r)?.click(); }, null, 4.2)
        .call(() => { const r = $$('.fa-shop', shop).find(x => $('b', x).textContent === 'Lemons'); $('.fa-box', r)?.click(); }, null, 5.4)
        .to({}, { duration: 3.4 }, 6);
      return tl;
    });
  }

  // 05 Dinner: the question types out, a pause, then the meals
  watch($('[data-demo="dinner"]'), tl => {
    const r = $('[data-demo="dinner"]');
    const d = k => $(`[data-d="${k}"]`, r);
    const Q = 'What can I make for dinner?';
    const meals = $$('.fa-meal', d('meals'));
    const scroll = d('scroll');
    if (!tl) { show(d('q'), true); d('qtext').textContent = Q; show(d('meals'), true); return; }
    const typed = { n: 0 };
    tl.call(() => {
      show(d('q'), false); show(d('typing'), false); show(d('meals'), false);
      d('qtext').textContent = ''; d('garlic').classList.remove('on'); typed.n = 0;
    }, null, 0)
      .set(scroll, { y: 0 }, 0)
      .call(() => show(d('q'), true), null, 0.8)
      .fromTo(d('q'), { opacity: 0, y: 10, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: 'back.out(2)', transformOrigin: '100% 100%' }, 0.8)
      .to(typed, { n: Q.length, duration: 1.4, ease: 'none', onUpdate: () => { d('qtext').innerHTML = `${Q.slice(0, Math.round(typed.n))}<span class="fa-caret"></span>`; } }, 0.9)
      .call(() => { d('qtext').textContent = Q; show(d('typing'), true); }, null, 2.5)
      .fromTo(d('typing'), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.3 }, 2.5)
      .call(() => { show(d('typing'), false); show(d('meals'), true); }, null, 4.1)
      .fromTo(meals, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.55, ease: 'back.out(1.6)', stagger: 0.18 }, 4.1)
      .to(scroll, { y: () => -Math.max(0, scroll.offsetHeight - (r.querySelector('.fa-body').offsetHeight - 150)), duration: 2.2, ease: 'power2.inOut' }, 5.2)
      .to(scroll, { y: 0, duration: 1.2, ease: 'power2.inOut' }, 8)
      .call(() => d('garlic').classList.add('on'), null, 9.4)
      .fromTo(d('garlic'), { scale: 1 }, { scale: 1.12, duration: 0.18, yoyo: true, repeat: 1 }, 9.4)
      .call(() => { const i = d('listtab'); i.classList.remove('pulse'); void i.offsetWidth; i.classList.add('pulse'); }, null, 9.6)
      .to({}, { duration: 2.4 }, 10);
    return tl;
  });
  // Dinner pull-out: save it, add the missing ingredient
  $$('[data-save], [data-buy]').forEach(b => b.addEventListener('click', () => {
    const on = !b.classList.contains('on');
    b.classList.toggle('on', on); b.setAttribute('aria-pressed', on);
    if (b.hasAttribute('data-save')) $('span', b).textContent = on ? 'Saved' : 'Save';
  }));

  // 06 Home screen: Share, Add to Home Screen, the icon lands
  watch($('[data-demo="home"]'), tl => {
    const r = $('[data-demo="home"]');
    const h = k => $(`[data-h="${k}"]`, r);
    const steps = $$('li', h('steps'));
    const step = i => steps.forEach((li, k) => li.classList.toggle('now', k === i));
    if (!tl) { h('browser').style.visibility = 'hidden'; h('hs').style.visibility = 'visible'; step(2); return; }
    tl.call(() => { step(0); h('add').classList.remove('hot'); }, null, 0)
      .set(h('browser'), { visibility: 'visible' }, 0)
      .set(h('hs'), { visibility: 'hidden' }, 0)
      .set(h('sheet'), { visibility: 'hidden', yPercent: 110 }, 0)
      .fromTo(h('ring'), { opacity: 0, scale: 1.6 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(2)' }, 0.8)
      .to(h('ring'), { opacity: 0, duration: 0.3 }, 2)
      .call(() => step(1), null, 2)
      .set(h('sheet'), { visibility: 'visible' }, 2)
      .to(h('sheet'), { yPercent: 0, duration: 0.55, ease: 'expo.out' }, 2)
      .call(() => h('add').classList.add('hot'), null, 3.1)
      .call(() => step(2), null, 4.2)
      .to(h('sheet'), { yPercent: 110, duration: 0.4, ease: 'power2.in' }, 4.2)
      .set(h('browser'), { visibility: 'hidden' }, 4.65)
      .set(h('hs'), { visibility: 'visible' }, 4.65)
      .fromTo(h('icon'), { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.7, ease: 'back.out(2.4)' }, 4.8)
      .to({}, { duration: 2.6 }, 5.6);
    return tl;
  });

  // ---------- Get the app: iPhone / Android steps ----------
  const guide = $('[data-guide]');
  if (guide) {
    const tabs = $$('[role="tab"]', guide);
    const pick = t => tabs.forEach(x => {
      const on = x === t;
      x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1;
      $('#' + x.getAttribute('aria-controls')).hidden = !on;
    });
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => pick(t));
      t.addEventListener('keydown', e => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
        pick(n); n.focus();
      });
    });
    if (/Android/i.test(navigator.userAgent)) pick(tabs[1]);
  }

  // ---------- Up close: the icon draws itself ----------
  const mark = $('[data-mark]');
  if (mark) {
    const m = k => $(`[data-m="${k}"]`, mark);
    const play = () => {
      if (!hasGsap || reduce) return;
      const draw = m('draw'), len = draw.getTotalLength();
      gsap.timeline()
        .set(draw, { strokeDasharray: len, strokeDashoffset: len, opacity: 1 })
        .set([m('fill'), m('door'), m('handle'), m('vein')], { opacity: 0 })
        .set(m('leaf'), { opacity: 0, scale: 0, transformOrigin: '50% 50%' })
        .to(draw, { strokeDashoffset: 0, duration: 0.8, ease: 'power2.inOut' }, 0.2)
        .to(m('fill'), { opacity: 1, duration: 0.35 }, 0.9)
        .to(m('door'), { opacity: 1, duration: 0.3 }, 1.05)
        .to(m('handle'), { opacity: 1, duration: 0.3 }, 1.13)
        .to(m('leaf'), { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(2.2)' }, 1.05)
        .to(m('vein'), { opacity: 1, duration: 0.3 }, 1.35);
    };
    mark.addEventListener('click', play);
    if (hasGsap && !reduce) new IntersectionObserver(([e], io) => { if (e.isIntersecting) { play(); io.disconnect(); } }, { threshold: 0.6 }).observe(mark);
  }

  // ---------- Up close: the tab bar pulses where things land ----------
  const navbox = $('[data-navbox]');
  if (navbox) {
    const tabs = $$('[data-tab]', navbox);
    const pulse = i => { i.classList.remove('pulse'); void i.offsetWidth; i.classList.add('pulse'); };
    const pick = t => { tabs.forEach(x => x.classList.toggle('on', x === t)); pulse($('i', t)); };
    tabs.forEach(t => {
      t.addEventListener('click', () => pick(t));
      t.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(t); } });
    });
    if (!reduce) {
      let timer = null;
      new IntersectionObserver(([e]) => {
        clearInterval(timer);
        if (e.isIntersecting) { pulse($('[data-pulse]', navbox)); timer = setInterval(() => pulse($('[data-pulse]', navbox)), 3200); }
      }, { threshold: 0.6 }).observe(navbox);
    }
  }
})();
