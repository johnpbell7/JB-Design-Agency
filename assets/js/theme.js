// Shared nav bits on every page: the JB mark, the phone menu and the phone CTA bar.
// The site is light only (no dark mode)
(() => {
  try { localStorage.removeItem('jb-theme'); } catch {} // old saved Light/Dark choice
  // Open at the top on a fresh visit or a refresh (browsers otherwise jump back to where you
  // were, landing mid-hero with the intro already played); Back keeps your place, links to #anchors still work
  try {
    const nav = performance.getEntriesByType('navigation')[0];
    if ('scrollRestoration' in history && (!nav || nav.type !== 'back_forward')) {
      history.scrollRestoration = 'manual';
      if (!location.hash) { scrollTo(0, 0); addEventListener('load', () => scrollTo(0, 0), { once: true }); }
    }
  } catch {}
  // The JB mark beside the wordmark in the nav: inlined in every page's HTML so it shows from the first
  // paint; this only fills it in on pages that don't have it. A yellow keyboard key
  // with the Poppins Bold JB ligature (the J shares the B's stem) on its top face
  const MARK = '<span class="jb-mark" aria-hidden="true"><svg viewBox="0 0 48 48"><defs><linearGradient id="jbT" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff58a"/><stop offset="1" stop-color="#ffe94a"/></linearGradient><linearGradient id="jbS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f5c400"/><stop offset="1" stop-color="#e2a400"/></linearGradient></defs><rect x="1.5" y="1.5" width="45" height="45" rx="10.5" fill="url(#jbS)" stroke="#18181a" stroke-width="1.6"/><g class="jb-mark__cap"><rect x="5" y="3.6" width="38" height="36.4" rx="8" fill="url(#jbT)" stroke="#e9b400" stroke-width="0.8"/><path d="M37.9 29.29Q37.9 32.2 35.87 33.9Q33.83 35.61 30.2 35.61H17.4Q13.73 35.61 11.52 33.64Q9.3 31.67 9.3 27.84H14.92Q14.92 29.29 15.52 30.03Q16.11 30.78 17.24 30.78Q18.26 30.78 18.82 30.12Q19.38 29.46 19.38 28.2V12.39H29.83Q33.37 12.39 35.37 14.01Q37.37 15.63 37.37 18.41Q37.37 20.46 36.3 21.82Q35.22 23.17 33.44 23.7Q35.45 24.13 36.68 25.7Q37.9 27.27 37.9 29.29ZM25.04 21.78H28.74Q30.13 21.78 30.87 21.17Q31.62 20.56 31.62 19.37Q31.62 18.18 30.87 17.55Q30.13 16.92 28.74 16.92H25.04ZM32.18 28.53Q32.18 27.31 31.37 26.61Q30.56 25.92 29.14 25.92H25.04V31.04H29.2Q30.63 31.04 31.4 30.4Q32.18 29.75 32.18 28.53Z" fill="#18181a" transform="translate(24 21.8) scale(0.92) translate(-23.6 -24)"/></g></svg></span>';
  const mark = () => document.querySelectorAll('.site-nav__mark').forEach(a => { if (!a.querySelector('.jb-mark')) a.insertAdjacentHTML('afterbegin', MARK); });
  // Phones: a burger opens a full-screen menu that wipes out from the burger: big page links,
  // then every project as a little phone card, then the CTA
  const menu = () => {
    const nav = document.querySelector('.site-nav'), links = nav && nav.querySelector('.site-nav__links');
    if (!links || nav.querySelector('.nav-burger')) return;
    const inProj = location.pathname.includes('/projects/'), base = inProj ? '' : 'projects/', img = inProj ? '../assets/' : 'assets/';
    const here = location.pathname.split('/').pop() || 'index.html';
    let cta = '';
    const items = [...links.querySelectorAll('a')].map(a => {
      if (a.classList.contains('is-cta')) { cta = a.getAttribute('href'); return ''; }
      return `<a href="${a.getAttribute('href')}">${a.textContent}</a>`;
    }).join('');
    const PROJ = [
      ['patch.html', 'PATCH', '#c7f016', 'menu/patch.webp'], ['birth-hood.html', 'Birth-hood', '#fe7fcc', 'menu/birth-hood.webp'],
      ['gosweet.html', 'GoSweet', '#7b3fc4', 'menu/gosweet.webp'], ['nic-pouches.html', 'Nic Pouches', '#0070d5', 'menu/nic-pouches.webp'],
      ['vsl-trade.html', 'VSL Trade', '#b8a9e8', 'menu/vsl-trade.webp'], ['birdie-blooms.html', 'Birdie Blooms', '#e8879f', 'menu/birdie-blooms.webp'],
      ['sccc-heritage.html', 'SCCC Heritage', '#8b1538', 'menu/sccc-heritage.webp'], ['beetle-eyes.html', 'Beetle Eyes', '#c97b84', 'menu/beetle-eyes.webp'],
      ['whats-in-my-fridge.html', 'What’s in my Fridge', '#2f7d5a', 'menu/whats-in-my-fridge.webp'],
      ['print.html', 'Print + brand', '#fff04d', ['menu/print-1.webp', 'menu/print-2.webp']],
      ['property.html', 'Property', '#9fbf8f', ['menu/property-1.webp', 'menu/property-2.webp']]];
    // websites show a little phone; print shows two fanned covers
    const thumb = src => Array.isArray(src)
      ? `<span class="nm-thumb nm-thumb--print">${src.map(x => `<img data-src="${img}${x}" alt="">`).join('')}</span>`
      : `<span class="nm-thumb"><img data-src="${img}${src}" alt=""></span>`;
    const projects = PROJ.map(([f, n, c, src]) => `<a href="${base}${f}" style="--dot:${c}"${f === here ? ' aria-current="page"' : ''}>${thumb(src)}<b>${n}</b></a>`).join('');
    links.insertAdjacentHTML('beforeend', '<button class="nav-burger" type="button" aria-expanded="false" aria-controls="nav-menu" aria-label="Menu"><i></i><i></i></button>');
    document.body.insertAdjacentHTML('beforeend', `<div class="nav-menu" id="nav-menu" hidden><div class="nav-menu__in">
      <nav class="nm-pages" aria-label="Menu">${items}</nav>
      <div class="nm-work"><span class="nm-k">Projects</span><nav aria-label="Projects">${projects}</nav></div>
      <div class="nm-foot">${cta ? `<a class="nm-cta" href="${cta}">Start a project <span aria-hidden="true">→</span></a>` : ''}</div>
    </div></div>`);
    const btn = nav.querySelector('.nav-burger'), panel = document.getElementById('nav-menu');
    [...panel.querySelectorAll('.nm-pages a, .nm-work a, .nm-foot > *')].forEach((el, i) => el.style.setProperty('--i', i));
    panel.querySelectorAll('.nm-pages a').forEach(a => { const h = a.getAttribute('href'); if (!h.includes('#') && h.split('/').pop() === here) a.setAttribute('aria-current', 'page'); });
    const set = open => {
      btn.setAttribute('aria-expanded', open); nav.classList.toggle('is-open', open);
      document.documentElement.classList.toggle('nav-locked', open);
      if (open) {
        panel.querySelectorAll('img[data-src]').forEach(im => { im.src = im.dataset.src; im.removeAttribute('data-src'); });
        const r = btn.getBoundingClientRect(); panel.style.setProperty('--ox', `${r.left + r.width / 2}px`); panel.style.setProperty('--oy', `${r.top + r.height / 2}px`);
        panel.style.setProperty('--k', Math.ceil(Math.hypot(innerWidth, innerHeight) / 10) + 2); // circle radius 10px -> past the far corner
        panel.hidden = false; requestAnimationFrame(() => requestAnimationFrame(() => panel.classList.add('is-in')));
      } else { panel.classList.remove('is-in'); setTimeout(() => { if (!nav.classList.contains('is-open')) panel.hidden = true; }, 600); }
    };
    btn.addEventListener('click', () => set(!nav.classList.contains('is-open')));
    panel.addEventListener('click', e => { if (e.target.closest('a')) set(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('is-open')) { set(false); btn.focus(); } });
    matchMedia('(min-width: 901px)').addEventListener('change', e => { if (e.matches) set(false); });
  };
  // Phones: a yellow bar floats at the foot of the screen until the contact form comes into view.
  // It replaces every other "Start a project" button on phones (hidden in base.css)
  const bar = () => {
    const contact = document.getElementById('contact');
    if (!contact || document.querySelector('.cta-bar')) return;
    document.body.insertAdjacentHTML('beforeend', '<aside class="cta-bar" aria-label="Start a project"><p><b>Got an idea brewing?</b><span>Let’s have a chat about it.</span></p><a href="#contact">Start a project <span aria-hidden="true">→</span></a></aside>');
    const el = document.querySelector('.cta-bar');
    let past = false, near = false;
    const show = () => el.classList.toggle('is-on', past && !near);
    setTimeout(() => { past = true; show(); }, 900); // it's the only call to action on phones, so it shows from the start
    if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => { near = e.isIntersecting; show(); }, { rootMargin: '0px 0px 25% 0px' }).observe(contact);
  };
  document.addEventListener('DOMContentLoaded', () => { mark(); menu(); bar(); });
})();
