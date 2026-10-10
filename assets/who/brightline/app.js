(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const hd = $('#hd');
  const callBtn = $('#callBtn');
  const callLabel = $('#callLabel');
  const callSub = $('#callSub');
  const jobs = $$('.job');
  const est = $('#est');
  const estPrice = $('#estPrice');
  const estNote = $('#estNote');
  const quoteBtn = $('#quoteBtn');
  const starFills = $$('#stars .st i');
  const revCount = $('#revCount');
  const CALL_SUB = callSub.innerHTML;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* header goes solid once the hero scrolls under it */
  const onScroll = () => hd.classList.toggle('solid', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- real interactions ---------- */
  function selectJob(btn) {
    jobs.forEach(j => { const on = j === btn; j.classList.toggle('on', on); j.setAttribute('aria-checked', on); });
    quoteBtn.classList.remove('done');
    est.classList.toggle('empty', !btn);
    if (!btn) { estPrice.innerHTML = '&pound;&mdash;'; estNote.textContent = 'Pick a job'; return; }
    estPrice.textContent = '£' + btn.dataset.price;
    estNote.innerHTML = btn.dataset.note;
  }
  jobs.forEach(j => j.addEventListener('click', () => { stop(); selectJob(j); }));
  quoteBtn.addEventListener('click', () => {
    stop();
    if (!$('.job.on')) selectJob(jobs[1]);
    quoteBtn.classList.add('done');
  });

  /* ---------- states ---------- */
  function setStars(n) {
    starFills.forEach((f, i) => { f.style.width = i < n ? (i === 4 ? '90%' : '100%') : '0%'; });
  }
  function callIdle() {
    callBtn.classList.remove('pressed', 'ripple', 'calling');
    callLabel.textContent = 'Call now';
    callSub.innerHTML = CALL_SUB;
  }
  function restState() {
    callIdle();
    selectJob(jobs[2]);
    setStars(5);
    revCount.textContent = '212';
  }
  function endState() {
    restState();
    quoteBtn.classList.add('done');
  }
  function resetState() {
    callIdle();
    selectJob(null);
    setStars(0);
    revCount.textContent = '198';
  }

  /* ---------- auto-demo loop ---------- */
  let timers = [];
  let playing = false;
  let countRaf = 0;
  const at = (ms, fn) => timers.push(setTimeout(fn, ms));

  function countTo(from, to, dur) {
    cancelAnimationFrame(countRaf);
    const t0 = performance.now();
    const step = t => {
      const p = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      revCount.textContent = Math.round(from + (to - from) * e);
      if (p < 1) countRaf = requestAnimationFrame(step);
    };
    countRaf = requestAnimationFrame(step);
  }

  function cycle() {
    timers.forEach(clearTimeout); timers = [];
    resetState();

    // 1. Call now press
    at(700, () => callBtn.classList.add('pressed', 'ripple'));
    at(860, () => {
      callBtn.classList.remove('pressed'); callBtn.classList.add('calling');
      callLabel.textContent = 'Calling…'; callSub.textContent = 'Connecting to the office';
    });
    at(2700, () => callIdle());

    // 2. Free quote job picker
    const pick = (j, ms) => {
      at(ms, () => j.classList.add('tap'));
      at(ms + 140, () => { j.classList.remove('tap'); selectJob(j); });
    };
    pick(jobs[1], 3100);
    pick(jobs[2], 4100);
    at(5100, () => quoteBtn.classList.add('tap'));
    at(5240, () => { quoteBtn.classList.remove('tap'); quoteBtn.classList.add('done'); });

    // 3. Review stars fill and the count settles
    at(5900, () => countTo(198, 212, 1100));
    for (let i = 1; i <= 5; i++) at(5900 + i * 170, () => setStars(i));

    // hold, then loop
    at(10400, () => { if (playing) cycle(); });
  }

  function play() {
    if (reduced) { endState(); return; }
    if (playing) return;
    playing = true;
    cycle();
  }
  function stop() {
    playing = false;
    timers.forEach(clearTimeout); timers = [];
    cancelAnimationFrame(countRaf);
    callIdle();
  }
  function pause() {
    if (!playing) return;
    stop();
    restState();
  }

  window.addEventListener('message', e => {
    const d = e.data;
    if (!d || typeof d !== 'object') return;
    if (d.who === 'play') play();
    else if (d.who === 'pause') pause();
    else if (d.who === 'restart') { stop(); restState(); play(); } // from the top
  });

  if (reduced) endState(); else restState();
  if (location.hash === '#play') play();
})();
