(() => {
  const $ = id => document.getElementById(id);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const el = {
    fLoc: $('fLoc'), fBeds: $('fBeds'), fPrice: $('fPrice'),
    vLoc: $('vLoc'), vBeds: $('vBeds'), vPrice: $('vPrice'),
    go: $('go'), count: $('count'), suggest: $('suggest'),
    track: $('gTrack'), dots: [...$('dots').children], pnum: $('pnum'),
    heart: $('heart'), saved: $('saved'), savedN: $('savedN'),
    book: $('book'), next: $('next'), rail: $('railTrack')
  };
  const PHOTO_NUMS = [1, 7, 12];
  const BOOK_HTML = el.book.innerHTML;
  const NEXT_HTML = el.next.innerHTML;
  const cardShift = () => { const c = el.rail.children[0]; return c.offsetWidth + (parseFloat(getComputedStyle(el.rail).columnGap) || 0); };
  let slideNow = 0;

  /* ---------- state helpers ---------- */
  let countNow = 214;
  function setCount(to, ms = 600) {
    const from = countNow; countNow = to;
    if (reduce || ms === 0) { el.count.textContent = to; return; }
    const t0 = performance.now();
    (function step(now) {
      const p = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - p, 3);
      el.count.textContent = Math.round(from + (to - from) * e);
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }
  function slide(i) {
    slideNow = (i + 3) % 3;
    el.track.style.transform = `translateX(${-el.track.parentNode.clientWidth * slideNow}px)`;
    el.dots.forEach((d, k) => d.classList.toggle('on', k === slideNow));
    el.pnum.textContent = PHOTO_NUMS[slideNow];
  }
  function setHeart(on, animate) {
    el.heart.classList.toggle('on', on);
    el.savedN.textContent = on ? 3 : 2;
    if (animate) {
      el.heart.classList.remove('pop'); el.saved.classList.remove('bump');
      void el.heart.offsetWidth;
      el.heart.classList.add('pop'); el.saved.classList.add('bump');
    }
  }
  function setBooked(state) {
    el.book.classList.toggle('done', state === 'done');
    if (state === 'busy') el.book.innerHTML = '<span class="spin"></span>Checking diary';
    else if (state === 'done') {
      el.book.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24"><path class="tick" d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square"/></svg>Viewing booked';
      el.next.classList.add('done');
      el.next.innerHTML = '<svg width="15" height="15"><use href="#i-check"/></svg><span>Sat 17 Oct, 10.30am. Confirmation sent by email.</span>';
    } else {
      el.book.innerHTML = BOOK_HTML;
      el.next.classList.remove('done');
      el.next.innerHTML = NEXT_HTML;
    }
  }
  function setRail(showNew, instant) {
    el.rail.classList.toggle('instant', !!instant);
    el.rail.style.transform = showNew ? 'translateX(0)' : `translateX(${-cardShift()}px)`;
  }
  function focus(field) {
    [el.fLoc, el.fBeds, el.fPrice].forEach(f => f.classList.toggle('focus', f === field));
  }
  function setLoc(text, typing) {
    if (!text && !typing) { el.vLoc.textContent = 'Area, street or postcode'; el.vLoc.classList.add('ph'); return; }
    el.vLoc.classList.remove('ph');
    el.vLoc.innerHTML = text + (typing ? '<span class="caret"></span>' : '');
  }
  function press(node) {
    node.classList.add('press');
    setTimeout(() => node.classList.remove('press'), 180);
  }

  function resetState(instant) {
    focus(null); setLoc(''); el.vBeds.textContent = 'Any'; el.vPrice.textContent = 'No max';
    el.suggest.classList.remove('show');
    setCount(214, 0); slide(0); setHeart(false); setBooked('idle');
    setRail(false, instant);
  }
  function endState() {
    focus(null); setLoc('Chapel Allerton'); el.vBeds.textContent = '3+ beds'; el.vPrice.textContent = '£500,000';
    setCount(12, 0); slide(0); setHeart(true); setBooked('done'); setRail(true, true);
  }

  /* ---------- pausable timeline ---------- */
  let playing = false, running = false, gen = 0; // gen: a restart abandons the run in progress
  function sleep(ms) {
    const g = gen;
    return new Promise(res => {
      let last = performance.now(), acc = 0;
      (function tick() {
        if (g !== gen) return; // restarted: this run stops here
        const now = performance.now();
        if (playing) acc += now - last;
        last = now;
        if (acc >= ms) res(); else setTimeout(tick, 30);
      })();
    });
  }

  async function demo() {
    if (running) return; running = true;
    while (true) {
      await sleep(900);
      focus(el.fLoc);
      const word = 'Chapel Allerton';
      for (let i = 1; i <= word.length; i++) {
        setLoc(word.slice(0, i), true);
        if (i === 4) el.suggest.classList.add('show');
        await sleep(70);
      }
      await sleep(600);
      setLoc('Chapel Allerton');
      el.suggest.classList.remove('show');
      setCount(46);
      await sleep(650);
      focus(el.fBeds); await sleep(380);
      el.vBeds.textContent = '3+ beds'; setCount(22);
      await sleep(650);
      focus(el.fPrice); await sleep(380);
      el.vPrice.textContent = '£500,000'; setCount(12);
      await sleep(600);
      focus(null); press(el.go);
      await sleep(900);
      slide(1); await sleep(1600);
      slide(2); await sleep(1600);
      slide(0); await sleep(800);
      setHeart(true, true); await sleep(1100);
      press(el.book); setBooked('busy'); await sleep(900);
      setBooked('done'); await sleep(1300);
      setRail(true); await sleep(4200);
      el.rail.style.opacity = 0;
      await sleep(420);
      resetState(true);
      await sleep(60);
      el.rail.style.opacity = 1;
    }
  }

  function play() { if (reduce) return; playing = true; demo(); }
  function pause() { playing = false; }

  /* ---------- real interactions ---------- */
  el.dots.forEach((d, i) => d.addEventListener('click', () => slide(i)));
  $('prev').addEventListener('click', () => slide(slideNow - 1));
  $('nextP').addEventListener('click', () => slide(slideNow + 1));
  el.heart.addEventListener('click', () => setHeart(!el.heart.classList.contains('on'), true));
  el.book.addEventListener('click', () => {
    if (el.book.classList.contains('done')) return;
    setBooked('busy'); setTimeout(() => setBooked('done'), 800);
  });
  document.querySelectorAll('.pcard .heart').forEach(h => h.addEventListener('click', () => {
    h.classList.toggle('on'); h.classList.remove('pop'); void h.offsetWidth; h.classList.add('pop');
  }));
  document.querySelectorAll('.tabs button, .chips button').forEach(b => b.addEventListener('click', () => {
    [...b.parentNode.children].forEach(s => s.classList.toggle('on', s === b));
  }));
  document.querySelectorAll('a[href="#"]').forEach(a => a.addEventListener('click', e => e.preventDefault()));

  /* ---------- boot ---------- */
  if (reduce) endState(); else resetState(true);
  window.addEventListener('message', e => {
    const d = e.data;
    if (!d || typeof d !== 'object') return;
    if (d.who === 'play') play();
    else if (d.who === 'pause') pause();
    else if (d.who === 'restart' && !reduce) { gen++; running = false; resetState(true); el.rail.style.opacity = 1; play(); } // drop the old run, start over
  });
  if (location.hash === '#play') play();
  window.addEventListener('hashchange', () => { if (location.hash === '#play') play(); });
})();
