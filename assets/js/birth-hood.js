// Birth-hood live pieces, ported from the site's PackageComparison.tsx (tab
// switcher, linked to the booking card) and PackageQuiz.tsx (weighted quiz).
// In the Up close breakout the questions run in one card and the answer lands
// on the best-match card beside it.
(() => {
  // ---------- Package comparison + booking card (PackageComparison.tsx tabs) ----------
  // Picking a package swaps every row to what it includes and tells the booking card.
  const cmp = document.querySelector('[data-compare]'), bk = document.querySelector('[data-booking]');
  if (cmp) {
    const PKGS = [
      { name: 'Foundation', price: '£1,095', tag: 'Essential', color: '#fecceb' },
      { name: 'Balanced', price: '£1,495', tag: 'Enhanced', color: '#feabde' },
      { name: 'Ultimate', price: '£2,000', tag: 'Comprehensive', color: '#fe7fcc' },
    ];
    const ROWS = [
      ['1 × 2-hour', '2 × 2–3-hour', '4 × 2–3-hour'],
      ['Optional (extra cost)', '✓', '✓'],
      ['—', '✓', '✓'],
      ['39 weeks', '10 days before due date', '38 weeks'],
      ['1 × 90-min', '1 × 2-hour', '3 × 2-hour'],
      ['Limited · 2 weeks', 'Ongoing · 6 weeks', 'Unlimited · 12 weeks'],
      ['—', '—', '✓'],
    ];
    const c = k => cmp.querySelector(`[data-c="${k}"]`);
    const tabs = [...cmp.querySelectorAll('.pkgm-tab')];
    const pick = i => {
      const p = PKGS[i];
      tabs.forEach((t, j) => { t.classList.toggle('is-active', j === i); t.setAttribute('aria-selected', j === i); });
      c('head').style.background = p.color; c('btn').style.background = p.color;
      c('name').textContent = p.name; c('tag').textContent = p.tag; c('price').textContent = p.price;
      c('btn').textContent = `Enquire about ${p.name}`;
      cmp.querySelectorAll('[data-row]').forEach(v => {
        const val = ROWS[+v.dataset.row][i];
        const html = val === '—' ? 'Not included' : val === '✓' ? '<span class="pkg-check">✓</span> Included' : val;
        if (v.innerHTML === html) return;
        v.innerHTML = html;
        v.classList.toggle('pkgm-v--neg', val === '—');
        v.classList.remove('is-changed'); void v.offsetWidth; v.classList.add('is-changed');
      });
      if (bk) {
        bk.querySelector('[data-bk="pkg"]').textContent = p.name;
        bk.querySelector('[data-bk="price"]').textContent = p.price;
        const about = bk.querySelector('.bh-book__about');
        about.classList.remove('is-new'); void about.offsetWidth; about.classList.add('is-new');
      }
    };
    tabs.forEach((t, i) => t.addEventListener('click', () => pick(i)));
  }
  if (bk) {
    const chips = [...bk.querySelectorAll('.bh-chip')];
    chips.forEach(ch => ch.addEventListener('click', () => {
      chips.forEach(x => { x.classList.toggle('is-on', x === ch); x.setAttribute('aria-checked', x === ch); });
      bk.querySelector('[data-bk="slot"]').textContent = ch.dataset.slot;
    }));
  }

  // ---------- Package-finder quiz ----------
  const quiz = document.querySelector('[data-quiz]');
  if (!quiz) return;
  const s = (foundation, balanced, ultimate) => ({ foundation, balanced, ultimate });
  const QUESTIONS = [
    { q: 'How are you feeling about giving birth?', help: 'There are no wrong answers. This just helps gauge how much preparation would help.', options: [
      ["It's my first baby and I'm feeling anxious about it", s(0, 1, 3)],
      ["First baby, but I'm feeling fairly calm and curious", s(0, 3, 2)],
      ["I've birthed before and want solid support again", s(2, 2, 0)],
      ["I've birthed before and know exactly what I want", s(3, 1, 1)],
    ] },
    { q: 'How much preparation would you like before the birth?', options: [
      ['Just the essentials, one good session', s(3, 0, 0)],
      ['A couple of sessions so I feel really ready', s(1, 3, 0)],
      ['Plenty of prep, with hypnobirthing built in', s(0, 2, 2)],
      ['As much as possible, in-depth and tailored to me', s(0, 0, 3)],
    ] },
    { q: 'How much support would you like in the weeks after birth?', options: [
      ['A visit and a couple of weeks of contact', s(3, 0, 0)],
      ['Ongoing support for around six weeks', s(0, 3, 1)],
      ['More than six weeks, but I might not need everything', s(0, 2, 2)],
      ['Lots: several visits, a recovery kit and 12 weeks unlimited', s(0, 0, 3)],
    ] },
    { q: 'How hands-on would you like your doula to be through pregnancy?', help: 'Things like check-ins between sessions, attending appointments and flexible timing.', options: [
      ['Mainly around the birth itself', s(3, 0, 0)],
      ['A few check-ins between our sessions', s(1, 3, 0)],
      ['Regular contact throughout my pregnancy', s(0, 2, 2)],
      ['Very involved: attend appointments with me, fully flexible', s(0, 0, 3)],
    ] },
    { q: 'Would you like equipment and resources included?', help: 'Such as a birth pool, TENS machine and the full online hub.', options: [
      ["Not needed, I'll sort my own if I want them", s(3, 0, 0)],
      ['Pool & TENS included would be handy', s(0, 3, 1)],
      ['Yes, and I want every digital resource too', s(0, 1, 3)],
    ] },
  ];
  const RESULTS = {
    foundation: { name: 'Foundation', price: '£1,095', tag: 'Essential', blurb: 'Streamlined, essential doula support: everything you need for a calm, well-supported birth without the extras.', highlights: ['1 antenatal session + birth planning', 'On-call from 39 weeks', 'Full continuous in-person birth support', '1 postnatal visit + 2 weeks aftercare'] },
    balanced: { name: 'Balanced', price: '£1,495', tag: 'Enhanced', blurb: 'The most popular choice: more preparation, birth pool and TENS included, and longer aftercare.', highlights: ['2 antenatal sessions + hypnobirthing hub', 'Birth pool & TENS machine included', 'On-call from 10 days before your due date', 'Ongoing support for 6 weeks'] },
    ultimate: { name: 'Ultimate', price: '£2,000', tag: 'Comprehensive', blurb: 'The complete experience: maximum preparation, access, flexibility and aftercare, tailored closely around you.', highlights: ['4 antenatal sessions + appointment accompaniment', '3 postnatal visits + bespoke recovery kit', 'On-call from 38 weeks', 'Unlimited support for 12 weeks'] },
  };
  const KEYS = ['foundation', 'balanced', 'ultimate'];
  const ORDER = ['balanced', 'ultimate', 'foundation']; // tie-break priority
  const RANK = { foundation: 0, balanced: 1, ultimate: 2 };

  const tally = answers => {
    const totals = { foundation: 0, balanced: 0, ultimate: 0 };
    answers.forEach((opt, qi) => { const sc = QUESTIONS[qi].options[opt][1]; KEYS.forEach(k => { totals[k] += sc[k]; }); });
    const winner = [...KEYS].sort((a, b) => totals[b] - totals[a] || ORDER.indexOf(a) - ORDER.indexOf(b))[0];
    // Only ever suggest stepping UP, and only when the answers are within ~20% of it
    const stepUp = KEYS.filter(k => RANK[k] > RANK[winner] && totals[winner] > 0 && totals[k] >= totals[winner] * 0.8)
      .sort((a, b) => totals[b] - totals[a] || RANK[a] - RANK[b])[0] || null;
    return { winner, stepUp };
  };

  const ask = quiz.querySelector('[data-quiz-ask]');
  const card = quiz.querySelector('[data-quiz-result]');
  const slot = k => card.querySelector(`[data-r="${k}"]`);
  let step = 0, answers = [];
  const esc = t => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const showResult = () => {
    const { winner, stepUp } = tally(answers);
    const r = RESULTS[winner];
    slot('eyebrow').textContent = 'Your best match';
    slot('name').textContent = r.name;
    slot('price').textContent = r.price;
    slot('tag').textContent = `${r.tag} support`;
    slot('list').innerHTML = r.highlights.map(h => `<li><span class="quiz-tick">✓</span>${esc(h)}</li>`).join('');
    const runner = slot('runner');
    runner.hidden = !stepUp;
    if (stepUp) runner.innerHTML = `You’re also close to <strong>${RESULTS[stepUp].name}</strong> (${RESULTS[stepUp].price}).`;
    card.classList.remove('is-new'); void card.offsetWidth; card.classList.add('is-new');
    return r;
  };
  const render = () => {
    if (step >= QUESTIONS.length) {
      const r = showResult();
      ask.innerHTML = `<div class="quiz-progress"><div class="quiz-progress-bar" style="width:100%"></div></div>
        <div class="quiz-anim quiz-finished">
          <div class="quiz-step-count">All five answered</div>
          <h3 role="presentation" class="quiz-q">Your best match is ${r.name}.</h3>
          <p class="quiz-done">A friendly guide, confirmed together on a free call.</p>
          <button type="button" class="quiz-restart">↻ Retake the quiz</button>
        </div>`;
      ask.querySelector('.quiz-restart').addEventListener('click', () => { step = 0; answers = []; render(); });
      return;
    }
    const cur = QUESTIONS[step];
    ask.innerHTML = `<div class="quiz-progress"><div class="quiz-progress-bar" style="width:${(step / QUESTIONS.length) * 100}%"></div></div>
      <div class="quiz-anim">
        <div class="quiz-step-count">Question ${step + 1} of ${QUESTIONS.length}</div>
        <h3 role="presentation" class="quiz-q">${esc(cur.q)}</h3>
        ${cur.help ? `<p class="quiz-help">${esc(cur.help)}</p>` : ''}
        <div class="quiz-options">${cur.options.map(([label], i) => `<button type="button" class="quiz-option" data-i="${i}"><span>${esc(label)}</span><span class="quiz-option-arrow">→</span></button>`).join('')}</div>
        ${step > 0 ? '<button type="button" class="quiz-back">← Back</button>' : ''}
      </div>`;
    ask.querySelectorAll('.quiz-option').forEach(b => b.addEventListener('click', () => { answers[step] = +b.dataset.i; step++; render(); }));
    ask.querySelector('.quiz-back')?.addEventListener('click', () => { step--; render(); });
  };
  render();
})();
