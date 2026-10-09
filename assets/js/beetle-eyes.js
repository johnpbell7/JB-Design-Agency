// Beetle Eyes live pieces, ported from the site's inline script: the
// hand-drawn page-load curtain opening onto the homepage (replaying while it's
// on screen), the tilting hero collage, the Wares cards, the eased FAQ
// accordion with its magnetic questions, the Visit card's open-now hours and
// map, the stops beside the phone that follow its recording, and the rose underline.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  // ---------- Curtain: build both drapes from the one drawing ----------
  const tpl = document.getElementById('be-drape');
  document.querySelectorAll('.be-drape svg').forEach(svg => {
    svg.append(...[...tpl.content.firstElementChild.childNodes].map(n => n.cloneNode(true)));
  });

  // The curtain holds shut, parts with the site's timing as the page plays its
  // entrance, rests open, then draws shut and goes again. A click replays it.
  const site = document.querySelector('[data-site]');
  if (site && !reduce) {
    site.classList.add('is-armed');
    let timers = [], visible = false, running = false;
    const later = (fn, ms) => timers.push(setTimeout(fn, ms));
    const stop = () => { timers.forEach(clearTimeout); timers = []; running = false; };
    const move = open => {
      site.classList.remove('is-moving'); void site.offsetWidth;
      site.classList.add('is-moving');
      site.classList.toggle('is-open', open);
    };
    const cycle = () => {
      running = true;
      later(() => { move(true); site.classList.add('is-in'); }, 500);
      later(() => move(false), 500 + 3400);
      later(() => { site.classList.remove('is-in'); if (visible) cycle(); else running = false; }, 500 + 3400 + 1300);
    };
    const replay = () => {
      stop();
      if (site.classList.contains('is-open')) { move(false); later(() => { site.classList.remove('is-in'); cycle(); }, 1100); }
      else { site.classList.remove('is-in'); cycle(); }
    };
    site.addEventListener('click', replay);
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !running) cycle(); }, { threshold: 0.25 }).observe(site);
  }

  // ---------- The hero collage: each frame tilts and drifts by its own depth ----------
  const collage = document.querySelector('[data-tilt]');
  if (collage && !reduce) {
    const frames = [...collage.querySelectorAll('.be-site__frame')];
    const tilt = (x, y) => frames.forEach((f, i) => {
      const d = (i + 1) * 6;
      f.style.transform = `translate(${x * d}%, ${y * d}%) rotateX(${-y * 8}deg) rotateY(${x * 8}deg) rotate(${f.dataset.rot}deg)`;
    });
    if (fine) {
      site.addEventListener('mousemove', e => {
        const r = collage.getBoundingClientRect();
        const c = v => Math.max(-0.8, Math.min(0.8, v));
        tilt(c((e.clientX - r.left) / r.width - 0.5) * 0.4, c((e.clientY - r.top) / r.height - 0.5) * 0.4);
      });
      site.addEventListener('mouseleave', () => frames.forEach(f => { f.style.transform = ''; }));
    } else {
      // No pointer on phones, so it leans on its own, slowly
      let t = 0, raf, seen = false;
      const loop = () => { t += 0.012; tilt(Math.sin(t) * 0.14, Math.cos(t * 0.8) * 0.12); if (seen) raf = requestAnimationFrame(loop); };
      frames.forEach(f => { f.style.transition = 'none'; });
      new IntersectionObserver(([e]) => { seen = e.isIntersecting; cancelAnimationFrame(raf); if (seen) loop(); }).observe(collage);
    }
  }

  // ---------- The Wares fan: on touch, a tap lifts a card to the front ----------
  document.querySelectorAll('[data-fan] .be-ware').forEach((w, _, all) => w.addEventListener('click', () => {
    if (fine) return;
    all.forEach(x => x.classList.toggle('is-up', x === w && !w.classList.contains('is-up')));
  }));

  // ---------- Questions + Visit: the accordion eases by height; parking draws the walk ----------
  const visit = document.querySelector('[data-visit]');
  if (visit) {
    const map = visit.querySelector('[data-map]');
    const parking = visit.querySelector('[data-parking]');
    const sync = () => map.classList.toggle('is-route', parking.open && !parking.dataset.closing);
    visit.querySelectorAll('.be-faq details').forEach(d => {
      const sum = d.querySelector('summary'), p = d.querySelector('p');
      const animate = (from, to, opening) => {
        if (reduce) { d.open = opening; delete d.dataset.closing; sync(); return; }
        p.style.height = from + 'px'; p.style.opacity = opening ? '0' : '1';
        void p.offsetHeight;
        p.style.height = to + 'px'; p.style.opacity = opening ? '1' : '0';
        const done = e => {
          if (e.propertyName !== 'height') return;
          p.removeEventListener('transitionend', done);
          if (!opening) { d.open = false; delete d.dataset.closing; }
          p.style.height = ''; p.style.opacity = '';
          sync();
        };
        p.addEventListener('transitionend', done);
      };
      sum.addEventListener('click', e => {
        e.preventDefault();
        if (d.open) { d.dataset.closing = '1'; animate(p.scrollHeight, 0, false); }
        else { d.open = true; animate(0, p.scrollHeight, true); }
        sync();
      });
    });
    // The car park on the map opens the parking answer
    visit.querySelector('[data-park]').addEventListener('click', () => { if (!parking.open) parking.querySelector('summary').click(); });

    // Magnetic questions: each one drifts towards a nearby pointer
    if (fine && !reduce) {
      const els = [...visit.querySelectorAll('.be-faq summary')];
      let raf = null, mx = 0, my = 0;
      const update = () => {
        raf = null;
        els.forEach(el => {
          const r = el.getBoundingClientRect();
          const dist = Math.hypot(Math.max(r.left - mx, 0, mx - r.right), Math.max(r.top - my, 0, my - r.bottom));
          if (dist < 90) {
            const f = 1 - dist / 90, pull = v => Math.max(-10, Math.min(10, v * 0.32));
            el.style.setProperty('--mx', (pull(mx - (r.left + r.width / 2)) * f).toFixed(2) + 'px');
            el.style.setProperty('--my', (pull(my - (r.top + r.height / 2)) * f).toFixed(2) + 'px');
          } else { el.style.setProperty('--mx', '0px'); el.style.setProperty('--my', '0px'); }
        });
      };
      visit.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; if (raf === null) raf = requestAnimationFrame(update); });
      visit.addEventListener('mouseleave', () => els.forEach(el => { el.style.setProperty('--mx', '0px'); el.style.setProperty('--my', '0px'); }));
    }

    // Open now, by the shop's clock in Mountsorrel, and today's row lit up
    const HOURS = { 0: [11, 16], 1: null, 2: [10, 17], 3: [10, 17], 4: [10, 17], 5: [10, 17], 6: [10, 17] };
    const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const am = h => (h > 12 ? h - 12 : h) + (h >= 12 ? 'pm' : 'am');
    const paintOpen = () => {
      const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(new Date()).map(x => [x.type, x.value]));
      const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.weekday);
      const now = +parts.hour + +parts.minute / 60;
      const h = HOURS[day], open = !!h && now >= h[0] && now < h[1];
      const pill = visit.querySelector('[data-open]');
      let next = '';
      if (!open) {
        if (h && now < h[0]) next = `opens ${am(h[0])}`;
        else for (let k = 1; k <= 7; k++) { const d = (day + k) % 7; if (HOURS[d]) { next = `opens ${k === 1 ? 'tomorrow' : DAYS[d].slice(0, 3)} ${am(HOURS[d][0])}`; break; } }
      }
      pill.classList.toggle('is-shut', !open);
      pill.innerHTML = open ? `<i></i><b>Open now</b> <small>till ${am(h[1])}</small>` : `<i></i><b>Closed</b> <small>${next}</small>`;
      visit.querySelectorAll('.be-hours li').forEach(li => {
        const on = li.dataset.days.split(',').map(Number).includes(day);
        li.classList.toggle('is-today', on);
        li.querySelector('.be-hours__today')?.remove();
        if (on) li.firstElementChild.insertAdjacentHTML('beforeend', '<b class="be-hours__today">Today</b>');
      });
    };
    paintOpen();
    setInterval(paintOpen, 60000);
    sync();
  }

  // ---------- The stops beside the phone light up as its journey reaches them ----------
  const route = document.querySelector('[data-route]');
  const tour = route?.closest('[data-parade]')?.querySelector('video');
  if (route && tour && !reduce) {
    const items = [...route.querySelectorAll('li')];
    const times = items.map(li => +li.dataset.t || 0);
    let on = -1;
    route.classList.add('is-live');
    // Until it plays, the stop shown in the poster frame is the one lit
    const still = Math.max(0, items.findIndex(li => li.hasAttribute('data-poster')));
    let playing = false;
    tour.addEventListener('playing', () => { playing = true; }, { once: true });
    const sync = () => {
      let k = playing ? 0 : still;
      if (playing) times.forEach((t, i) => { if (tour.currentTime >= t) k = i; });
      if (k !== on) { items.forEach((li, i) => li.classList.toggle('is-on', i === k)); on = k; }
    };
    tour.addEventListener('timeupdate', sync);
    sync();
  }

  // ---------- Rose underline draws in when it reaches the screen ----------
  const lines = document.querySelectorAll('.be-underline');
  if (reduce || !('IntersectionObserver' in window)) lines.forEach(l => l.classList.add('is-drawn'));
  else {
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-drawn'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -15% 0px' });
    lines.forEach(l => io.observe(l));
  }
})();
