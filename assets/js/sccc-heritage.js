// SCCC Heritage live pieces, ported from sccc-heritage.co.uk (React):
// the Bowl to Scroll ball (HomePage), the decade slider with the cricket-ball
// thumb (/journey) driving a decade card (DecadesOverview), and the roll of
// honour cards (DecadePage, "The Men that Served"). The slider and the roll
// talk to each other: land on the 1910s and the names cascade in; the era tag
// on the roll rolls the ball back to the 1910s.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const IMG = '../assets/projects/sccc-heritage/';
  const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');

  // ---------- Bowl to Scroll: one delivery, the ball drops away and comes back ----------
  const badge = document.querySelector('[data-badge]');
  if (badge) {
    const ball = badge.querySelector('.sc-badge__ball');
    badge.addEventListener('click', () => {
      if (badge.classList.contains('is-bowling')) return;
      badge.classList.add('is-bowling');
      if (reduce || !ball.animate) { setTimeout(() => badge.classList.remove('is-bowling'), 700); return; }
      const drop = ball.animate([{ transform: 'none', opacity: 1 }, { transform: 'translateY(240%) rotate(540deg)', opacity: 0 }],
        { duration: 450, easing: 'cubic-bezier(0.4, 0, 0.6, 1)', fill: 'forwards' });
      drop.finished.then(() => setTimeout(() => {
        const back = ball.animate([{ transform: 'translateY(-60%)', opacity: 0 }, { transform: 'none', opacity: 1 }],
          { duration: 600, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' });
        drop.cancel();
        back.finished.then(() => badge.classList.remove('is-bowling'));
      }, 450));
    });
  }

  // ---------- The roll of honour (public names, from the 1910s decade page) ----------
  const MEN = [
    ['Abrahall', 'S E', 'Royal Warwickshire Reg'], ['Barton', 'A', 'South Staffs Reg'], ['Britton', 'L C', 'Royal Warwickshire Reg'],
    ['Browne', 'H J', 'Public School Battalion'], ['Chapman', 'F', 'Royal Field Artillery'],
    ['Chopping', 'R B C', 'Royal Warwickshire Reg', 'Killed in conflict 28 Aug 16'], ['Clarke', 'F B', 'North Staffordshire Reg'],
    ['Crockford', 'L C', 'Royal Warwickshire Reg'], ['Crockford', 'E B', 'Royal Warwickshire Reg'], ['Davies', 'H', 'Royal Warwickshire Reg'],
    ['Etchells', 'T', 'Manchester Reg'], ['Evans', 'J R L', 'Worcester Reg'],
    ['Felton', 'J H', '10 bt Royal Warwickshire Reg', 'Killed in conflict 10 Apr 18'], ['Gateley', 'A J', 'Liverpool Reg'],
    ['Grove', 'P A', 'South Staffs Reg', 'Killed in conflict 4 Oct 17'], ['Hadley', 'A', 'Royal Engineers'], ['Hall', 'N', 'South Staffordshire Reg'],
    ['Hallewell-Rogers', 'E', 'Royal Warwickshire Reg', 'Died 3 Jul 16'], ['Homer', 'C R', 'Royal Warwickshire Reg'], ['Jenkins', 'D', 'Bengali Patiala Reg'],
    ['Lilly', 'A J', 'Royal Warwickshire Reg', 'Killed in conflict 2 Mar 17'], ['Malkin', 'W', 'Royal Warwickshire Reg'],
    ['Marwick', 'E B', '2nd Signal Co, Royal Engineers', 'Died of Pneumonia 9 Nov 18'], ['Norton', 'J H', 'Royal Warwickshire Reg'],
    ['Oxford', 'F S', 'Royal Warwickshire Reg'], ['Parkes', 'O', 'Royal Navy'],
    ['Parsons', 'S E', 'Royal Warwickshire Reg', 'Killed in conflict 14 Apr 18'], ['Pearson', 'E L', 'Royal Warwickshire Reg'],
    ['Pochin', 'H', 'South Staffordshire Reg'], ['Preedy', 'L J', '4th bt Royal Warwickshire Reg', 'Killed in conflict 31 Mar 18'],
    ['Ray', 'J C', 'South African Artillery'], ['Simpson', 'W B', 'Rifle Brigade', 'Killed in action 10 July 1916'],
    ['Shenton', 'H E', '14th bt Royal Warwickshire Reg', 'Died of Wounds 27 Aug 17'],
    ['Sturgess', 'F H', 'South Staffordshire Reg', 'Pneumonia effects of gas 15 Apr 19'], ['Tabb', 'E J', 'Royal Warwickshire Reg'],
    ['Wakefield', 'A E', '1/7th bt Worcestershire Regiment', 'Killed in conflict 17 Aug 17'], ['Whillier', 'E C', 'Essex Reg'],
    ['Wilson-Browne', 'R M', 'RFC 21st Squadron', 'Wounded & Died a POW 21 Jul 16'], ['Yates', 'J H', 'R A M C'],
  ];
  let cascade = () => {};
  const roll = document.querySelector('[data-roll]');
  if (roll) {
    const grid = roll.querySelector('[data-roll-grid]');
    const more = roll.querySelector('[data-roll-more]');
    const buttons = [...roll.querySelectorAll('[data-filter]')];
    grid.innerHTML = MEN.map(([name, ini, service, fate]) => `
      <article class="sc-man${fate ? ' is-fallen' : ''}">
        <header><h4 role="presentation">${esc(name)}</h4><span>${esc(ini)}</span></header>
        <p><b>Service:</b> ${esc(service)}</p>
        ${fate ? `<p class="sc-man__fate">${esc(fate)}</p>` : ''}
      </article>`).join('');
    const cards = [...grid.children];
    const CAP = 6;
    let filter = 'all', open = false;
    const render = (animate = true) => {
      const shown = cards.filter(c => filter === 'all' || c.classList.contains('is-fallen'));
      const visible = filter === 'all' && !open ? shown.slice(0, CAP) : shown;
      cards.forEach(c => { c.classList.toggle('is-hidden', !visible.includes(c)); c.classList.remove('is-in'); });
      roll.classList.toggle('is-open', filter !== 'all' || open);
      more.hidden = !(filter === 'all' && !open);
      grid.scrollTop = 0;
      if (animate && !reduce) { void grid.offsetWidth; visible.forEach((c, i) => { c.style.setProperty('--i', i); c.classList.add('is-in'); }); }
    };
    buttons.forEach(b => b.addEventListener('click', () => {
      filter = b.dataset.filter;
      buttons.forEach(x => x.setAttribute('aria-pressed', x === b));
      render();
    }));
    more.addEventListener('click', () => { open = true; render(); });
    render(false);
    // The slider landing on the 1910s lights the roll and replays the names
    cascade = () => {
      roll.classList.add('is-lit');
      clearTimeout(cascade.t);
      cascade.t = setTimeout(() => roll.classList.remove('is-lit'), 1400);
      render();
    };
  }

  // ---------- Decade slider: the cricket ball moves through fifteen eras ----------
  const DECADES = [
    ['Foundations Before Formation', '1837-1847', 'd-1859.jpg'], ['The First Fifty Years', '1847-1899', 'd-1892.jpg'],
    ['The Turn of the Century', '1900-1909', 'd-1906.jpg'], ['The Great War Era', '1910-1919', 'd-1910.jpg'],
    ['The Golden Resurgence', '1920-1929', 'd-1921.jpg'], ['The Thirties', '1930-1939', 'd-1937.jpg'],
    ['Second World War', '1940-1949', 'd-1947.jpg'], ['Post-War Revival', '1950-1959', 'd-1951.jpg'],
    ['The Swinging Sixties', '1960-1969', 'd-1966.jpg'], ['The Seventies', '1970-1979', 'd-1970.jpg'],
    ['The Eighties', '1980-1989', 'd-1982.jpg'], ['The Nineties', '1990-1999', 'd-1993.jpg'],
    ['The New Millennium', '2000-2009', 'd-2004.jpg'], ['The Twenty-Tens', '2010-2019', 'd-2016.jpg'],
    ['The Twenty-Twenties', '2020-Present', 'd-2022.jpg'],
  ];
  const GREAT_WAR = 3;
  const dial = document.querySelector('[data-dial]');
  if (dial) {
    const range = dial.querySelector('[data-dial-range]');
    const rail = dial.querySelector('.sc-slider__rail');
    const fill = dial.querySelector('[data-dial-fill]');
    const card = dial.querySelector('[data-dial-card]');
    const img = dial.querySelector('[data-dial-img]');
    const title = dial.querySelector('[data-dial-title]');
    const years = dial.querySelector('[data-dial-years]');
    const last = DECADES.length - 1;
    dial.querySelector('[data-dial-ticks]').innerHTML = DECADES.map((_, i) => `<i class="${i % 2 ? '' : 'is-key'}" style="left:${(i / last) * 100}%"></i>`).join('');
    DECADES.forEach(([, , f]) => { const p = new Image(); p.src = IMG + f; }); // warm the cache so the card swaps cleanly
    let at = +range.value, swap;
    const set = (i, fromUser) => {
      const p = i / last;
      rail.style.setProperty('--p', p);
      fill.style.width = `${p * 100}%`;
      range.value = i;
      const [t, y, f] = DECADES[i];
      range.setAttribute('aria-valuetext', `${t}, ${y}`);
      if (i === at) return;
      at = i;
      card.classList.add('is-swap');
      clearTimeout(swap);
      swap = setTimeout(() => {
        img.src = IMG + f; title.textContent = t; years.textContent = y;
        card.classList.remove('is-swap');
      }, reduce ? 0 : 140);
      if (fromUser && i === GREAT_WAR) cascade();
    };
    range.addEventListener('input', () => set(+range.value, true));
    set(at, false);
    // The era tag on the roll rolls the ball back to the 1910s
    document.querySelector('[data-roll-era]')?.addEventListener('click', () => { set(GREAT_WAR, false); cascade(); });
  }
})();
