/* Live site driver (see assets/live/README.md).
   Plays a scripted journey (journey.json) through a real copy of a site running in a
   same-origin iframe: a soft cursor dot glides, the page scrolls with an ease, hover
   menus open through the site's own events, and real clicks fire. The parent page owns
   page changes (it swaps the iframe with a crossfade) and play/pause.

   Include it on every page of a live copy, last in <head>:
     <script src="../driver.js" defer></script>            journey.json next to the page
     <script src="../driver.js" data-journey="j.json" defer></script>
   It does nothing unless the page is framed by a same-origin parent that talks to it.

   driver -> parent  {live:'ready', track, page} {live:'step', i, track} {live:'progress', p, i, track}
                     {live:'nav', href, i, at, track, cursor} {live:'leaving', i, at, track, cursor} {live:'end', track}
   parent -> driver  {live:'goto', i, at?, track?, fresh?, play?, hold?, cursor?} {live:'play'} {live:'pause'} */
(() => {
  'use strict';
  if (window.parent === window) return;
  let parentOk = false;
  try { parentOk = parent.location.origin === location.origin; } catch (e) { /* cross-origin parent */ }
  if (!parentOk) return;

  // Framed copies are scaled down inside the portfolio page, where phones never fire the
  // copy's own lazy loading (blank product cards), so every image loads up front instead,
  // including the ones the site's scripts add later
  const eager = el => {
    if (el.matches('img[loading="lazy"]')) el.loading = 'eager';
    el.querySelectorAll('img[loading="lazy"]').forEach(i => { i.loading = 'eager'; });
  };
  eager(document.documentElement);

  // Never focus a text box: on a phone that opens the visitor's keyboard. The journey types by
  // setting values, so the demos still work; inputmode="none" covers anything that slips through
  const field = el => el && el.matches && el.matches('input:not([type=checkbox]):not([type=radio]):not([type=button]):not([type=submit]), textarea, select, [contenteditable]');
  const nativeFocus = HTMLElement.prototype.focus;
  HTMLElement.prototype.focus = function (o) { if (!field(this)) nativeFocus.call(this, o); };
  const quiet = el => { if (field(el)) el.setAttribute('inputmode', 'none'); el.querySelectorAll?.('input, textarea, [contenteditable]').forEach(f => f.setAttribute('inputmode', 'none')); };
  quiet(document.documentElement);
  new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => { if (n.nodeType === 1) quiet(n); })))
    .observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener('focusin', e => { if (field(e.target)) e.target.blur(); }, true);
  new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => { if (n.nodeType === 1) eager(n); })))
    .observe(document.documentElement, { childList: true, subtree: true });

  const me = document.currentScript;
  // the frame can pick the journey (parade phones): data-live-journey="file.json#key" on the iframe,
  // where key is an index into "phones", a "phones" label or "tracks" name; no key = the "mobile" track
  let frameJourney = null;
  try { frameJourney = frameElement && frameElement.dataset.liveJourney; } catch (e) {}
  const journeyUrl = new URL(frameJourney || (me && me.dataset.journey) || 'journey.json', location.href);
  const CANCEL = { cancel: true };
  const post = m => parent.postMessage(Object.assign({ live: '' }, m), location.origin);
  const $$ = s => [...document.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const ease = f => 0.5 - Math.cos(Math.PI * f) / 2; // gentle sine in-out
  const glideEase = f => (f < 0.5 ? 4 * f * f * f : 1 - Math.pow(-2 * f + 2, 3) / 2) * 0.35 + ease(f) * 0.65;

  let J = null;                 // journey
  let track = 'steps';          // 'steps' (desktop) or 'mobile'
  let si = 0, ai = 0;           // step index, action index
  let playing = false, hold = false, held = false, runId = 0, running = false;
  let pristine = true;          // nothing has been done to this page load yet
  let clock = 0, last = 0;      // active (unpaused) milliseconds
  let waiters = [];
  let cx = -100, cy = -100;     // cursor, viewport px
  let hoverChain = [];
  let stepStart = 0, stepDur = 1, lastP = -1;
  let cursorEl, styleEl, touch = false;

  try { history.scrollRestoration = 'manual'; } catch (e) {}

  // ---------- clock: one rAF loop, time only advances while playing ----------
  const loop = t => {
    const dt = last ? Math.min(50, t - last) : 0; last = t;
    if (playing) clock += dt;
    const w = waiters; waiters = [];
    w.forEach(fn => fn());
    if (playing && running) {
      const p = clamp((clock - stepStart) / stepDur, 0, 1);
      if (Math.abs(p - lastP) > 0.004 || (p === 1 && lastP !== 1)) { lastP = p; post({ live: 'progress', p, i: si, track }); }
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);

  // run fn(f) every frame for ms of active time; rejects with CANCEL if the run is replaced
  const anim = (ms, fn) => {
    const id = runId, start = clock;
    return new Promise((res, rej) => {
      const step = () => {
        if (id !== runId) return rej(CANCEL);
        const f = ms > 0 ? clamp((clock - start) / ms, 0, 1) : 1;
        if (fn) fn(f);
        if (f >= 1) res(); else waiters.push(step);
      };
      step();
    });
  };
  const sleep = ms => anim(ms);
  // Global speed: cursor glides run at MOVE x their journey time, scrolls at SCROLL x
  const MOVE = 0.5, SCROLL = 0.75;
  // SPEED: John wants every walkthrough at double speed, so all journey times are halved here
  const SPEED = 2;
  const pace = () => ((track === 'mobile' ? (J.mobile && J.mobile.pace) || J.pace : J.pace) || 1) / SPEED;

  // ---------- look: cursor dot, click pulse, tap ripple, :hover mirror ----------
  const setupLook = () => {
    const c = Object.assign({ size: 22, color: 'rgba(24,24,26,0.52)', ring: 'rgba(255,255,255,0.95)' }, J.cursor || {});
    styleEl = document.createElement('style');
    styleEl.textContent = `
      html{scroll-behavior:auto!important}
      #lv-cursor{--s:${c.size}px;position:fixed;left:0;top:0;z-index:2147483647;width:var(--s);height:var(--s);margin:calc(var(--s) / -2) 0 0 calc(var(--s) / -2);border-radius:50%;
        background:${c.color};box-shadow:0 0 0 2px ${c.ring},0 6px 14px rgba(0,0,0,.22);pointer-events:none;opacity:0;transition:opacity .4s,scale .18s;will-change:transform}
      #lv-cursor.is-on{opacity:1} #lv-cursor.is-down{scale:.78}
      .lv-pulse,.lv-tap{position:fixed;z-index:2147483646;border-radius:50%;pointer-events:none}
      .lv-pulse{--s:${c.size}px;width:calc(var(--s) * 2.6);height:calc(var(--s) * 2.6);margin:calc(var(--s) * -1.3) 0 0 calc(var(--s) * -1.3);border:calc(var(--s) / 11) solid ${c.color}}
      .lv-tap{width:56px;height:56px;margin:-28px 0 0 -28px;background:rgba(24,24,26,.2)}
      #lv-cursor,.lv-pulse,.lv-tap{display:none!important} /* no visible pointer or click rings: the pages just move */
      ${J.css || ''}${(track === 'mobile' && J.mobile && J.mobile.css) || ''}`;
    document.head.append(styleEl);
    cursorEl = document.createElement('div'); cursorEl.id = 'lv-cursor'; cursorEl.setAttribute('aria-hidden', 'true');
    document.documentElement.append(cursorEl);
    mirrorHover();
  };
  // keep the dot at least ~11 screen px however small the parent shows the frame
  const cursorSize = () => {
    const base = (J.cursor && J.cursor.size) || 22;
    let k = 1; try { k = frameElement.getBoundingClientRect().width / innerWidth || 1; } catch (e) {}
    return Math.max(base, 11 / k);
  };
  const sizeCursor = () => { const s = cursorSize() + 'px'; if (cursorEl) cursorEl.style.setProperty('--s', s); };
  const showCursor = on => cursorEl && cursorEl.classList.toggle('is-on', on && !touch);
  const placeCursor = () => { if (cursorEl) cursorEl.style.transform = `translate(${cx}px,${cy}px)`; };

  // copy every :hover rule as a .lv-hover rule, so pure-CSS hover states follow the dot
  const mirrorHover = () => {
    const out = [];
    const walk = (rules, wrap) => {
      for (const r of rules) {
        if (r.selectorText && r.selectorText.includes(':hover')) out.push(wrap(`${r.selectorText.replace(/:hover/g, '.lv-hover')}{${r.style.cssText}}`));
        else if (r.cssRules && r.media) walk(r.cssRules, s => wrap(`@media ${r.media.mediaText}{${s}}`));
        else if (r.cssRules && r.conditionText) walk(r.cssRules, s => wrap(`@supports ${r.conditionText}{${s}}`));
        else if (r.cssRules && r.name !== undefined && !r.selectorText) walk(r.cssRules, s => wrap(`@layer ${r.name}{${s}}`));
      }
    };
    for (const sh of document.styleSheets) { try { walk(sh.cssRules, s => s); } catch (e) { /* cross-origin sheet */ } }
    const st = document.createElement('style'); st.id = 'lv-hover';
    st.textContent = out.join('\n'); document.head.append(st);
  };

  const fire = (el, type, init) => {
    const isPointer = type.startsWith('pointer');
    const E = isPointer && window.PointerEvent ? PointerEvent : MouseEvent;
    const bubbles = !/enter|leave/.test(type);
    el.dispatchEvent(new E(type, Object.assign({ bubbles, cancelable: bubbles, composed: true, view: window, clientX: cx, clientY: cy,
      pointerId: 1, pointerType: touch ? 'touch' : 'mouse', isPrimary: true }, init)));
  };

  // what is under the dot, with enter/leave/over/out like a real pointer
  const updateHover = () => {
    if (touch) return;
    const el = document.elementFromPoint(clamp(cx, 0, innerWidth - 1), clamp(cy, 0, innerHeight - 1));
    const chain = [];
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) chain.push(n);
    const old = hoverChain;
    if (old[0] === chain[0]) { if (el) fire(el, 'mousemove'); return; }
    const left = old.filter(n => !chain.includes(n)), entered = chain.filter(n => !old.includes(n));
    if (old[0] && old[0].isConnected) { fire(old[0], 'pointerout', { relatedTarget: el }); fire(old[0], 'mouseout', { relatedTarget: el }); }
    left.forEach(n => { n.classList.remove('lv-hover'); fire(n, 'pointerleave', { relatedTarget: el }); fire(n, 'mouseleave', { relatedTarget: el }); });
    if (el) { fire(el, 'pointerover', { relatedTarget: old[0] }); fire(el, 'mouseover', { relatedTarget: old[0] }); }
    entered.reverse().forEach(n => { n.classList.add('lv-hover'); fire(n, 'pointerenter', { relatedTarget: old[0] }); fire(n, 'mouseenter', { relatedTarget: old[0] }); });
    if (el) fire(el, 'mousemove');
    hoverChain = chain;
  };
  const clearHover = () => {
    hoverChain.forEach(n => { n.classList.remove('lv-hover'); fire(n, 'mouseleave'); fire(n, 'pointerleave'); });
    if (hoverChain[0]) fire(hoverChain[0], 'mouseout');
    hoverChain = [];
  };

  // ---------- finding things ----------
  const visible = el => {
    if (!el.getClientRects().length) return false;
    const s = getComputedStyle(el);
    return s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity > 0.05;
  };
  const find = (sel, a) => {
    if (sel instanceof Element) return sel;
    let list = $$(sel);
    if (a.visible !== false) list = list.filter(visible);
    if (a.text) list = list.filter(el => el.textContent.toLowerCase().includes(String(a.text).toLowerCase()));
    const el = list[a.nth || 0];
    if (!el) console.warn('[live] nothing matches', sel, a);
    return el || null;
  };
  const pointIn = (el, a) => {
    const r = el.getBoundingClientRect(), at = a.at || [0.5, 0.5];
    return [r.left + r.width * at[0], r.top + r.height * at[1]];
  };

  // ---------- moves ----------
  const scroller = a => (a.within ? find(a.within, {}) : null);
  const getY = s => (s ? s.scrollTop : scrollY);
  const setY = (s, y) => (s ? (s.scrollTop = y) : window.scrollTo({ top: y, left: scrollX, behavior: 'instant' }));
  const maxY = s => (s ? s.scrollHeight - s.clientHeight : document.documentElement.scrollHeight - innerHeight);
  // "x": true scrolls sideways (a product rail with "within", or the page)
  const getX = s => (s ? s.scrollLeft : scrollX);
  const setX = (s, x) => (s ? s.scrollTo({ left: x, behavior: 'instant' }) : window.scrollTo({ left: x, top: scrollY, behavior: 'instant' }));
  const maxX = s => (s ? s.scrollWidth - s.clientWidth : document.documentElement.scrollWidth - innerWidth);

  const scrollTo = async (target, a) => {
    const s = scroller(a), X = !!a.x, v0 = X ? getX(s) : getY(s), v1 = clamp(Math.round(target), 0, X ? maxX(s) : maxY(s)), d = v1 - v0;
    if (Math.abs(d) < 2) return;
    const ms = (a.ms != null ? a.ms : clamp(650 + Math.abs(d) * 0.75, 750, 2400)) * SCROLL * pace();
    let snap = null;
    if (s && X) { snap = s.style.scrollSnapType; s.style.scrollSnapType = 'none'; } // snapping would fight the ease
    try { await anim(ms, f => { const v = v0 + d * ease(f); X ? setX(s, v) : setY(s, v); updateHover(); }); }
    finally { if (snap != null) s.style.scrollSnapType = snap; }
  };
  const scrollToEl = (el, a) => {
    const s = scroller(a), r = el.getBoundingClientRect(), top = s ? s.getBoundingClientRect().top : 0;
    return scrollTo(getY(s) + r.top - top - (a.offset != null ? a.offset : 110), a);
  };
  // bring an element into view (calmly) before pointing at it
  const ensureInView = async (el, a) => {
    const r = el.getBoundingClientRect(), m = 60;
    if (r.top >= m && r.bottom <= innerHeight - m) return;
    await scrollToEl(el, Object.assign({}, a, { ms: undefined, offset: a.offset != null ? a.offset : Math.max(110, (innerHeight - r.height) / 2.4) }));
  };

  const glide = async (x1, y1, a) => {
    const x0 = cx, y0 = cy, dx = x1 - x0, dy = y1 - y0, dist = Math.hypot(dx, dy);
    if (touch) { cx = x1; cy = y1; return; }
    showCursor(true);
    if (dist < 1) return;
    const ms = (a.ms != null ? a.ms : clamp(520 + dist * 0.55, 650, 1500)) * MOVE * pace();
    const bow = clamp(dist * 0.06, 0, 40), nx = -dy / dist, ny = dx / dist; // a slight arc, like a hand
    await anim(ms, f => {
      const e = glideEase(f), b = Math.sin(Math.PI * e) * bow;
      cx = x0 + dx * e + nx * b; cy = y0 + dy * e + ny * b; placeCursor(); updateHover();
    });
  };
  const pointAt = async (sel, a) => {
    if (Array.isArray(sel)) { await glide(sel[0], sel[1], a); return null; }
    const el = find(sel, a); if (!el) return null;
    if (a.scroll !== false) await ensureInView(el, a);
    const [x, y] = pointIn(el, a);
    await glide(x, y, a);
    return el;
  };

  const pulse = () => {
    const d = document.createElement('div'); d.className = touch ? 'lv-tap' : 'lv-pulse';
    d.style.left = cx + 'px'; d.style.top = cy + 'px'; d.style.setProperty('--s', cursorSize() + 'px');
    document.documentElement.append(d);
    const k = d.animate(touch ? [{ scale: 0.3, opacity: 0.45 }, { scale: 1.5, opacity: 0 }] : [{ scale: 0.35, opacity: 0.7 }, { scale: 1.25, opacity: 0 }],
      { duration: touch ? 650 : 520, easing: 'cubic-bezier(.2,.7,.3,1)' });
    k.onfinish = () => d.remove();
  };

  let navTo = null; // set while a driver click is in flight, so link clicks become parent-led navigations
  const click = async (el, a) => {
    if (touch) { pulse(); await sleep(120 * pace()); }
    else { cursorEl.classList.add('is-down'); pulse(); await sleep(110); }
    const t = document.elementFromPoint(clamp(cx, 0, innerWidth - 1), clamp(cy, 0, innerHeight - 1));
    const target = t && (el.contains(t) || t.contains(el)) ? t : el;
    if (touch) { fire(target, 'pointerdown', { buttons: 1 }); fire(target, 'pointerup'); }
    else { fire(target, 'pointerdown', { buttons: 1 }); fire(target, 'mousedown', { buttons: 1, detail: 1 }); }
    if (target.focus) try { target.closest('input,select,textarea')?.focus({ preventScroll: true }); } catch (e) {}
    if (!touch) { fire(target, 'pointerup'); fire(target, 'mouseup', { detail: 1 }); cursorEl.classList.remove('is-down'); }
    navTo = null;
    if (a.follow === false) return;
    fire(target, 'click', { detail: 1 });
  };

  // a click on a link that would leave this page: let the parent swap pages instead
  addEventListener('click', e => {
    if (e.defaultPrevented) return;
    const link = e.target.closest && e.target.closest('a[href]');
    if (!link || link.target === '_blank' || link.hasAttribute('download')) return;
    const u = new URL(link.href, location.href);
    if (u.origin !== location.origin) { e.preventDefault(); return; } // never leave the copy
    if (u.pathname === location.pathname && u.search === location.search) return; // same page / anchor
    e.preventDefault();
    navTo = u.href;
  });

  const type = async (sel, text, a) => {
    const el = await pointAt(sel, a); if (!el) return;
    await click(el, a);
    for (const ch of String(text)) {
      el.value += ch; el.dispatchEvent(new InputEvent('input', { bubbles: true, data: ch, inputType: 'insertText' }));
      await sleep((a.charMs || 85) * (1 + (Math.random() - 0.5) * (a.jitter || 0)) * pace()); // "jitter": 0.4 = a human rhythm
    }
    el.dispatchEvent(new Event('change', { bubbles: true }));
  };

  // nominal length of an action, for the step progress bars
  const dur = a => {
    const p = pace();
    let ms = (a.wait || 0) + (a.after || 0);
    if (a.click || a.tap || a.move || a.hover) ms += (a.ms != null ? a.ms : 900) * MOVE;
    else if (a.type) ms += a.ms != null ? a.ms : 900;
    if (a.click || a.tap) ms += 260;
    if (a.scroll != null || a.scrollTo != null) ms += (a.ms != null ? a.ms : 1300) * SCROLL;
    return ms * p;
  };

  // ---------- running ----------
  const actionsOf = i => (track === 'mobile' ? (J.mobile && J.mobile.actions) || [] : (J.steps[i] && J.steps[i].actions) || []);
  const stepCount = () => (track === 'mobile' ? 1 : J.steps.length);
  const pageOf = i => (track === 'mobile' ? (J.mobile && J.mobile.page) : J.steps[i] && J.steps[i].page);
  const isHere = page => {
    if (!page) return true;
    const u = new URL(page, journeyUrl);
    return u.pathname === location.pathname && (!u.search || u.search === location.search);
  };
  const leave = (href, i, at) => {
    runId++; running = false;
    post({ live: 'nav', href, i, at, track, cursor: [cx, cy] });
  };

  const doAction = async a => {
    const sel = a.click || a.tap || a.move || a.hover;
    if (a.cursor === 'hide') showCursor(false);
    if (a.cursor === 'show') showCursor(true);
    if (a.wait) await sleep(a.wait * pace());
    if (a.scrollTo != null) {
      if (typeof a.scrollTo === 'number') await scrollTo(a.scrollTo, a);
      else { const el = find(a.scrollTo, a); if (el) await scrollToEl(el, a); }
    } else if (a.scroll != null) {
      const s = scroller(a); await scrollTo((a.x ? getX(s) : getY(s)) + a.scroll, a);
    }
    if (a.type) await type(a.type[0], a.type[1], a);
    else if (sel != null) {
      const el = await pointAt(sel, a);
      if ((a.click || a.tap) && el) { await click(el, a); if (navTo) return { nav: navTo }; }
    }
    if (a.goto) return { nav: new URL(a.goto, journeyUrl).href };
    if (a.after) await sleep(a.after * pace());
    return null;
  };

  // where a step begins on its page: "start": ".selector" | 1200 | { "to": ".selector", "offset": 90 }
  const startY = i => {
    const st = track === 'mobile' ? J.mobile && J.mobile.start : J.steps[i] && J.steps[i].start;
    if (st == null) return null;
    const to = typeof st === 'object' && !Array.isArray(st) ? st.to : st;
    if (typeof to === 'number') return to;
    const el = find(to, { visible: false }); if (!el) return null;
    const off = typeof st === 'object' && st.offset != null ? st.offset : (J.startOffset != null ? J.startOffset : 100);
    return scrollY + el.getBoundingClientRect().top - off;
  };

  const run = async () => {
    const id = ++runId; running = true;
    try {
      for (; si < stepCount(); si++, ai = 0) {
        const acts = actionsOf(si);
        if (ai === 0 && !isHere(pageOf(si))) { leave(new URL(pageOf(si), journeyUrl).href, si, 0); return; }
        stepDur = acts.reduce((t, a) => t + dur(a), 0) || 1;
        stepStart = clock - acts.slice(0, ai).reduce((t, a) => t + dur(a), 0);
        lastP = -1;
        post({ live: 'step', i: si, track });
        post({ live: 'progress', p: 0, i: si, track });
        if (ai === 0) { // go to the step's start: land there on a fresh page, glide there otherwise
          const y = startY(si);
          if (y != null) { if (pristine) setY(null, y); else await scrollTo(y, { ms: undefined }); }
          if (id !== runId) return;
          stepStart = clock;
        }
        pristine = false;
        for (; ai < acts.length; ai++) {
          const r = await doAction(acts[ai]);
          if (id !== runId) return;
          if (r && r.nav) { leave(r.nav, si, ai + 1); return; }
        }
        post({ live: 'progress', p: 1, i: si, track });
        if (hold) { playing = false; hold = false; held = true; ai = 0; si++; running = false; return; } // held: a later 'play' doesn't start the next step
      }
      running = false;
      post({ live: 'end', track });
    } catch (e) {
      if (e !== CANCEL) { console.error('[live]', e); running = false; }
    }
  };

  const resetKeys = () => {
    const r = J.reset || {};
    let had = false;
    (r.localStorage || []).forEach(k => { try { if (localStorage.getItem(k) != null) had = true; localStorage.removeItem(k); } catch (e) {} });
    (r.sessionStorage || []).forEach(k => { try { if (sessionStorage.getItem(k) != null) had = true; sessionStorage.removeItem(k); } catch (e) {} });
    return had;
  };

  // tidy up a page before jumping within it: let go of the button, leave hovers, close drawers/menus
  const tidy = () => {
    cursorEl && cursorEl.classList.remove('is-down');
    clearHover();
    if (J.escapeOnJump !== false) {
      ['keydown', 'keyup'].forEach(t => document.dispatchEvent(new KeyboardEvent(t, { key: 'Escape', code: 'Escape', keyCode: 27, bubbles: true })));
    }
    (J.closeOnJump || []).forEach(sel => $$(sel).filter(visible).forEach(el => el.click()));
  };

  let mobileCss = false;
  const goto = m => {
    runId++; running = false; navTo = null;           // whatever was in flight stops here
    const newTrack = m.track === 'mobile' ? 'mobile' : 'steps';
    if (newTrack !== track) { track = newTrack; touch = track === 'mobile' && !(J.mobile && J.mobile.touch === false); }
    if (track === 'mobile' && !mobileCss && J.mobile && J.mobile.css) { mobileCss = true; styleEl.textContent += J.mobile.css; }
    si = clamp(m.i | 0, 0, stepCount() - 1); ai = Math.max(0, m.at | 0);
    hold = !!m.hold; held = false;
    if (m.cursor) { cx = m.cursor[0]; cy = m.cursor[1]; placeCursor(); }
    playing = m.play !== false;
    if (ai === 0) {
      const restart = si === 0 && track === 'steps';
      const dirty = restart && resetKeys();                 // e.g. empty the basket when the loop starts again
      const step = track === 'mobile' ? J.mobile || {} : J.steps[si];
      if (!isHere(pageOf(si)) || dirty || (step.reload && !pristine)) {
        leave(new URL(pageOf(si) || location.href, journeyUrl).href, si, 0); return;
      }
      if (!pristine) tidy();
    }
    if (pristine && !m.cursor) { const c = J.start || [innerWidth * 0.62, innerHeight * 0.7]; cx = c[0]; cy = c[1]; placeCursor(); }
    if (pristine && ai === 0 && startY(si) == null) setY(null, 0);
    if (!playing) { // still frame: land at the step's start, no cursor
      const y = ai === 0 ? startY(si) : null; if (y != null) setY(null, y);
      showCursor(false); post({ live: 'step', i: si, track }); return;
    }
    sizeCursor();
    if (!touch) { showCursor(true); updateHover(); } else showCursor(false);
    run();
  };

  addEventListener('message', e => {
    if (e.origin !== location.origin || e.source !== parent || !e.data || !J) return;
    const m = e.data;
    if (m.live === 'goto') goto(m);
    else if (m.live === 'pause') { playing = false; }
    else if (m.live === 'play') { if (!playing && !held) { playing = true; if (!running) run(); } }
  });

  // JS-led navigations (location.href = …) still work: tell the parent where to resume
  addEventListener('pagehide', () => { if (J && running) post({ live: 'leaving', i: si, at: ai + 1, track, cursor: [cx, cy] }); });

  const ready = async () => {
    try { J = await (await fetch(journeyUrl, { cache: 'no-store' })).json(); } catch (e) { console.error('[live] no journey at', journeyUrl.href); return; }
    const key = decodeURIComponent(journeyUrl.hash.slice(1));
    if (key) { // a phone of a parade: its track plays as the mobile track
      const list = Array.isArray(J.phones) ? J.phones : [], low = key.toLowerCase();
      const pick = /^\d+$/.test(key) ? list[+key] : (J.tracks && J.tracks[key]) || list.find(p => String(p.id || p.label || '').toLowerCase() === low);
      if (pick) J.mobile = pick; else console.warn('[live] no phone track', key);
    }
    J.steps = J.steps || [];
    if (document.readyState !== 'complete') await new Promise(r => addEventListener('load', r, { once: true }));
    try { await document.fonts.ready; } catch (e) {}
    setupLook();
    setY(null, 0);
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    post({ live: 'ready', page: location.pathname + location.search, track });
  };
  ready();
})();
