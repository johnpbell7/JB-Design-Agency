// Records phone journeys through a site (scroll, tap a product, open a page)
// as MP4 clips for the phone parades: assets/clips/<project>/<clip>.mp4 plus a
// poster .jpg. Journeys live in tools/journeys.json.
//
//   node tools/record.mjs gosweet          every clip for one project
//   node tools/record.mjs gosweet shop     one clip
//
// Each clip: { name, path, steps: [...] }. Steps:
//   { "scroll": 700, "ms": 1400 }            eased scroll by px (negative = up)
//   { "scrollTo": "#deals", "ms": 1400, "offset": 80 }
//   { "tap": ".product-card a", "nth": 0 }   finger tap ripple, then click (follows links)
//       "text": "Add"      pick the first match whose text contains this (instead of nth)
//       "js": true         click via element.click() (for sheets whose touch handlers
//                          swallow a synthetic tap)
//       "click": false     ripple only (then e.g. scrollTo, for in-page anchors)
//       "navWait": 350     how long after the tap a page load may start (ms; raise
//                          it for sites that animate out before leaving)
//       "ms": 700          desktop: how long the cursor takes to glide there
//       "cut": 1200        app-style route change: pause the recording this long
//                          after the tap so the new view is ready when it resumes
//   { "hover": ".nav a", "ms": 800 }         desktop: glide the cursor there (menus, hover states)
//   { "move": [720, 600], "ms": 700 }        desktop: glide the cursor to a viewport point
//   { "type": ["input[name=q]", "cola"] }    tap the field and type
//   { "wait": 900 }
//   any step can carry "mark": "Title": its start time is saved to <clip>.marks.json
//   { "goto": "product.html" }               jump without a tap (cut)
// Clip options: "startAt": 1800 | ".selector" (begin part-way down the page),
// "viewport": "desktop" (1440x900, mouse + cursor dot, 1280 wide
// output), "zoom": 2 (sharp close-ups) + "crop": [x, y, w, h] or ".selector" / { sel, pad }, "width", hide, css, localStorage, sessionStorage, lead, tail.
// Project options (same as captures.json): local | url, localStorage,
// sessionStorage, hide (selectors), css, pace.
//
// Sharp capture: Chrome runs with --force-device-scale-factor=2, so the
// screencast sends real 2x frames (phones 780x1688, desktop 2880x1800) at ~60fps.
// Phones encode at 780 wide (~2.6 Mbps), desktop films at 1920x1200 (~6 Mbps).
// Live motion: pages are NOT pre-scrolled any more. Images (src, srcset,
// data-src, CSS backgrounds) are warmed into the cache without scrolling, so the
// site's own reveals, lazy loads and count-ups play on camera as the journey
// scrolls. "prime": true (clip, project or a "cut" step) brings back the old
// scroll-through for a site that renders blank without it.
//   "intro": true      reload the (warmed) first page on camera, so its
//                      entrance animation is in the clip
//   "pre": [steps]     run these before the camera rolls (e.g. open the search
//                      panel), so the clip opens on that screen
//   "posterAt": 2.5    take the poster from this second instead of frame 0
// Calm pacing: "pace" (clip, project, or PACE=1.2 env; default 1.5 for phones,
// 1.25 for desktop) stretches every scroll "ms", "wait", "after", cursor glide,
// "lead" and "tail", so journeys keep their shape but slow down. Scrolls use a
// gentle sine ease. Phones also get a soft slow tap ripple with a settle before
// and after each tap, and at least ~0.8s on a newly loaded page before acting.
// Dissolves: whenever the recording pauses for a new page (a tapped link, a
// "cut", a "goto") or a tap jumps the page to an anchor, the frame index is
// saved and frames2mp4 dissolves across it over "fade" s (default 0.35). The
// end of each phone clip dissolves back to its first frame ("loopFade", default
// 0.5; 0 = off) so the looping video restarts without a jump. Keep phone clips
// to about 14s: drop a minor step rather than lowering the pace.
// Uses the Chrome DevTools screencast, then tools/frames2mp4.swift to encode.
import puppeteer from 'puppeteer-core';
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
// Phone clips (default): touch, 2x, encoded 780 wide.
// Desktop clips ("viewport": "desktop"): mouse with a cursor dot, 2x, encoded 1920 wide.
const DEVICES = {
  phone: { viewport: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, cast: { maxWidth: 780, maxHeight: 1688 }, width: 780, bitrate: 2_600_000 },
  desktop: { viewport: { width: 1440, height: 900, deviceScaleFactor: 2 }, cast: { maxWidth: 2880, maxHeight: 1800 }, width: 1920, bitrate: 6_000_000 },
};
const sleep = ms => new Promise(r => setTimeout(r, ms));

const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.gif': 'image/gif',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.mp4': 'video/mp4', '.webm': 'video/webm' };

function serve(dir) {
  return new Promise(resolve => {
    const server = http.createServer(async (req, res) => {
      let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      if (p.endsWith('/')) p += 'index.html';
      const file = path.join(dir, p);
      if (!file.startsWith(dir)) { res.writeHead(403).end(); return; }
      // read first, then answer once (extensionless paths fall back to .html)
      const body = await fs.readFile(file).catch(() => null);
      if (body) { res.writeHead(200, { 'content-type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream' }).end(body); return; }
      const html = await fs.readFile(file + '.html').catch(() => null);
      if (html) res.writeHead(200, { 'content-type': 'text/html' }).end(html);
      else res.writeHead(404).end();
    });
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

// Injected into every page: no scrollbars, a finger-tap ripple, an eased scroller
const PAGE_KIT = () => {
  const style = document.createElement('style');
  style.textContent = `html{scroll-behavior:auto!important;scrollbar-width:none}::-webkit-scrollbar{display:none}
  .__tap{position:fixed;z-index:2147483647;width:38px;height:38px;margin:-19px 0 0 -19px;border-radius:50%;pointer-events:none;
  background:rgb(20 20 22 / .16);box-shadow:0 0 0 1.5px rgb(255 255 255 / .7);animation:__tap .7s cubic-bezier(.33,0,.2,1) forwards}
  @keyframes __tap{0%{transform:scale(.55);opacity:0}30%{transform:scale(1);opacity:1}100%{transform:scale(1.3);opacity:0}}
  .__nudge{position:fixed;z-index:2147483647;left:0;top:0;width:2px;height:2px;pointer-events:none;background:#000}
  .__cur{position:fixed;z-index:2147483647;left:0;top:0;width:16px;height:16px;margin:-8px 0 0 -8px;border-radius:50%;pointer-events:none;
  background:rgb(20 20 22 / .82);box-shadow:0 0 0 2px #fff,0 2px 8px rgb(0 0 0 / .3);transition:scale .15s}
  .__cur.is-down{scale:.75}
  .__pulse{position:fixed;z-index:2147483646;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;pointer-events:none;
  border:2px solid rgb(20 20 22 / .55);animation:__tap .5s cubic-bezier(.2,.8,.2,1) forwards}`;
  addEventListener('DOMContentLoaded', () => document.head.append(style));
  // Desktop clips: a small dot follows the (puppeteer) mouse and pulses on click
  if (window.__desktop) addEventListener('DOMContentLoaded', () => {
    const dot = document.createElement('i'); dot.className = '__cur'; dot.style.display = 'none'; document.body.append(dot);
    addEventListener('mousemove', e => { dot.style.display = ''; dot.style.translate = `${e.clientX}px ${e.clientY}px`; }, true);
    addEventListener('mousedown', e => { dot.classList.add('is-down'); const p = document.createElement('i'); p.className = '__pulse'; p.style.left = e.clientX + 'px'; p.style.top = e.clientY + 'px'; document.body.append(p); setTimeout(() => p.remove(), 600); }, true);
    addEventListener('mouseup', () => dot.classList.remove('is-down'), true);
  });
  window.__tap = (x, y) => { const d = document.createElement('i'); d.className = '__tap'; d.style.left = x + 'px'; d.style.top = y + 'px'; document.body.append(d); setTimeout(() => d.remove(), 900); };
  // a few invisible repaints, so the screencast sends a frame of a still page
  window.__nudge = () => { const d = document.createElement('i'); d.className = '__nudge'; document.body.append(d); let n = 0;
    const step = () => { d.style.opacity = n % 2 ? '.01' : '.02'; if (++n < 12) requestAnimationFrame(step); else d.remove(); }; requestAnimationFrame(step); };
  window.__scroll = (to, ms) => new Promise(done => {
    const from = scrollY, t0 = performance.now();
    // easeInOutSine: a low top speed, so the page never whips past
    const ease = t => -(Math.cos(Math.PI * t) - 1) / 2;
    const step = now => { const t = Math.min(1, (now - t0) / ms); scrollTo(0, from + (to - from) * ease(t)); t < 1 ? requestAnimationFrame(step) : done(); };
    requestAnimationFrame(step);
  });
};

async function prime(page) {
  // load lazy images and fire reveal animations, then go back to the top
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight * 0.7) { scrollTo(0, y); await new Promise(r => setTimeout(r, 110)); }
    scrollTo(0, 0);
  });
  await page.waitForNetworkIdle({ idleTime: 300, timeout: 6000 }).catch(() => {});
  await sleep(700);
}

// Loads every image the page refers to (src, srcset, data-src, CSS backgrounds)
// without scrolling, so lazy images arrive instantly but reveals still wait
async function warm(page) {
  await page.evaluate(async () => {
    const urls = new Set();
    const add = (u, rel = location.href) => { if (u && !/^(data|blob|javascript):/.test(u)) try { urls.add(new URL(u, rel).href); } catch {} };
    const set = v => v && v.split(',').forEach(c => add(c.trim().split(/\s+/)[0]));
    const re = /url\(\s*['"]?([^'")]+)['"]?\s*\)/g;
    for (const e of document.querySelectorAll('img, source, video, [data-src], [data-srcset], [data-bg], [data-background], [data-lazy], [style*="url("]')) {
      add(e.getAttribute('src')); set(e.getAttribute('srcset')); add(e.getAttribute('poster'));
      add(e.dataset.src); set(e.dataset.srcset); add(e.dataset.bg); add(e.dataset.background); add(e.dataset.lazy);
      for (const m of (e.getAttribute('style') || '').matchAll(re)) add(m[1]);
    }
    const walk = (rules, rel) => { for (const r of rules) { if (r.cssRules) walk(r.cssRules, rel); if (r.type === 5) continue; for (const m of (r.style?.cssText || '').matchAll(re)) add(m[1], rel); } };
    for (const sh of document.styleSheets) { try { walk(sh.cssRules, sh.href || location.href); } catch {} }
    const list = [...urls].filter(u => !/\.(mp4|webm|mov|woff2?|ttf|otf|css|js)(\?|#|$)/i.test(u)).slice(0, 500);
    window.__warm = list.map(u => { const i = new Image(); i.src = u; return i; });
    await Promise.race([Promise.all(window.__warm.map(i => i.decode().catch(() => {}))), new Promise(r => setTimeout(r, 8000))]);
  }).catch(() => {});
  await page.waitForNetworkIdle({ idleTime: 300, timeout: 5000 }).catch(() => {});
  await sleep(500);
}

// hide lists and css, put in at document start too, so a reload never flashes them
const dressCss = (project, clip) => {
  const hide = [...(project.hide || []), ...(clip.hide || [])];
  return `${hide.length ? `${hide.join(',')}{display:none!important}` : ''}\n${project.css || ''}\n${clip.css || ''}`;
};

async function dress(page, project, clip) {
  const hide = [...(project.hide || []), ...(clip.hide || [])];
  if (hide.length) await page.addStyleTag({ content: `${hide.join(',')}{display:none!important}` }).catch(() => {});
  if (project.css || clip.css) await page.addStyleTag({ content: `${project.css || ''}\n${clip.css || ''}` }).catch(() => {});
}

async function record(browser, base, id, project, clip, outDir) {
  const desktop = clip.viewport === 'desktop';
  const base0 = DEVICES[desktop ? 'desktop' : 'phone'];
  // Close-ups: "dpr": 2 records the desktop at double density, "crop": [x, y, w, h]
  // (CSS px of the 1440x900 view) keeps just that part, so a component fills the clip
  const dpr = clip.dpr || base0.viewport.deviceScaleFactor;
  const dev = clip.dpr ? { ...base0, viewport: { ...base0.viewport, deviceScaleFactor: dpr }, cast: { maxWidth: base0.viewport.width * dpr, maxHeight: base0.viewport.height * dpr } } : { ...base0 };
  // "zoom": 2 renders the page twice the size in a twice-as-big window, so a
  // close-up crop has real detail
  const zoom = clip.zoom || 1;
  // calm pacing: every hold and scroll is stretched by "pace" (see the header)
  const pace = +(process.env.PACE || clip.pace || project.pace || (desktop ? 1.25 : 1.5));
  const P = ms => Math.round(ms * pace);
  // no pre-scroll by default (see the header); "prime": true brings it back
  const usePrime = clip.prime ?? project.prime ?? false;
  if (zoom !== 1) { dev.viewport = { ...dev.viewport, width: dev.viewport.width * zoom, height: dev.viewport.height * zoom }; dev.cast = { maxWidth: dev.viewport.width * dpr, maxHeight: dev.viewport.height * dpr }; }
  const page = await browser.newPage();
  await page.setViewport(dev.viewport);
  if (desktop) await page.evaluateOnNewDocument(() => { window.__desktop = true; });
  await page.evaluateOnNewDocument(PAGE_KIT);
  await page.evaluateOnNewDocument(css => {
    const put = () => { const st = document.createElement('style'); st.textContent = css; document.documentElement.append(st); };
    if (document.documentElement) put();
    else new MutationObserver((_, mo) => { if (document.documentElement) { mo.disconnect(); put(); } }).observe(document, { childList: true });
  }, dressCss(project, clip));
  if (zoom !== 1) await page.evaluateOnNewDocument(z => { addEventListener('DOMContentLoaded', () => { document.documentElement.style.zoom = z; }); }, zoom);
  await page.evaluateOnNewDocument((local, session) => {
    try { for (const [k, v] of Object.entries(local)) localStorage.setItem(k, v); for (const [k, v] of Object.entries(session)) sessionStorage.setItem(k, v); } catch {}
  }, { ...project.localStorage, ...clip.localStorage }, { ...project.sessionStorage, ...clip.sessionStorage });

  // Desktop cursor: eased glide to a point (the dot follows the mouse events)
  const mouse = { x: dev.viewport.width * 0.62, y: dev.viewport.height * 0.58 };
  const glide = async (x, y, ms = 700) => {
    ms = P(ms);
    const from = { ...mouse }, n = Math.max(1, Math.round(ms / 16));
    const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    for (let i = 1; i <= n; i++) {
      const k = ease(i / n);
      await page.mouse.move(from.x + (x - from.x) * k, from.y + (y - from.y) * k);
      await sleep(16);
    }
    Object.assign(mouse, { x, y });
  };
  const placeCursor = async () => { if (desktop) await page.mouse.move(mouse.x, mouse.y); };
  // a new view: hide lists, then images warmed (or the old scroll-through)
  const ready = async (primeIt = usePrime) => {
    await dress(page, project, clip);
    if (primeIt) await prime(page); else await warm(page);
    await placeCursor();
  };

  const go = async rel => {
    await page.goto(new URL(rel || '', base).href, { waitUntil: 'networkidle2', timeout: 60000 });
    await ready();
  };
  await go(clip.path);
  // start part-way down the first page (px, or a selector to put near the top)
  const startAt = async () => {
    if (clip.startAt === undefined) return;
    await page.evaluate(at => { const y = typeof at === 'number' ? at : (document.querySelector(at)?.getBoundingClientRect().top ?? 0) + scrollY - 90; scrollTo(0, y); }, clip.startAt);
    await sleep(900); // let the reveals there finish before the camera rolls
  };
  await startAt();

  // Screencast: every painted frame goes straight to disk with its timestamp.
  // While a tapped link loads we pause, so the clip never shows a white flash.
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), `rec-${id}-`));
  const cdp = await page.createCDPSession();
  // paused until the camera rolls (after any "pre" steps)
  const frames = []; let t0 = null, paused = true, pausedAt = 0, pausedTotal = 0, rolling = false;
  const cuts = []; // indices of the first frame after each jump, for the dissolves
  const writes = [];
  const file = i => path.join(tmp, `frame-${String(i).padStart(5, '0')}.jpg`);
  cdp.on('Page.screencastFrame', f => {
    cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {});
    if (paused) return;
    const ts = f.metadata.timestamp;
    if (t0 === null) t0 = ts;
    const i = frames.length;
    frames.push({ t: ts - t0 - pausedTotal });
    writes.push(fs.writeFile(file(i), Buffer.from(f.data, 'base64')));
  });
  const pause = () => { paused = true; pausedAt = performance.now(); };
  // at: the frame to dissolve from the one before (default: the first new frame)
  const resume = async (at = frames.length) => {
    pausedTotal += (performance.now() - pausedAt) / 1000; paused = !rolling;
    cuts.push(at);
    await page.evaluate(() => window.__nudge?.()).catch(() => {});
  };
  // a newly loaded view stays still a moment before the next step
  const settle = after => sleep(Math.max(P(after ?? 500), desktop ? 0 : 800));
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 85, ...dev.cast, everyNthFrame: 1 });
  let started = performance.now();
  const now = () => Math.max(0, (performance.now() - started) / 1000 - pausedTotal);
  const marks = []; // steps with "mark": "Title" are timed, for the film's step list

  // Finds the step's element (nth, or the first whose text contains s.text) and
  // brings it on screen; returns its centre
  const target = async (sel, s) => {
    let els = await page.$$(sel);
    { const vis = []; for (const e of els) if (await e.boundingBox()) vis.push(e); els = vis; }
    if (s.text) { const keep = []; for (const e of els) if ((await e.evaluate(n => n.innerText || n.value || n.getAttribute('aria-label') || '')).includes(s.text)) keep.push(e); els = keep; }
    const el = els[s.nth || 0];
    if (!el) { console.warn(`  ! no element for ${sel}`); return null; }
    await el.evaluate(e => e.scrollIntoView({ block: 'nearest' }));
    const box = await el.boundingBox();
    if (!box) { console.warn(`  ! ${sel} has no box`); return null; }
    return { el, x: box.x + box.width / 2, y: box.y + box.height / 2 };
  };

  const run = async s => {
    if (s.mark) marks.push({ t: +now().toFixed(2), title: s.mark });
    if (s.wait) await sleep(P(s.wait));
    else if (s.scroll !== undefined) await page.evaluate((d, ms) => window.__scroll(scrollY + d, ms), s.scroll, P(s.ms || 1300));
    else if (s.scrollTo) await page.evaluate((sel, ms, off) => { const el = document.querySelector(sel); if (el) return window.__scroll(el.getBoundingClientRect().top + scrollY - off, ms); }, s.scrollTo, P(s.ms || 1300), s.offset ?? 90);
    else if (s.move && desktop) { await glide(s.move[0], s.move[1], s.ms ?? 700); await sleep(P(s.after ?? 200)); }
    else if (s.hover) {
      const t = await target(s.hover, s);
      if (t && desktop) await glide(t.x, t.y, s.ms ?? 800);
      else if (t) await t.el.hover();
      await sleep(P(s.after ?? 400));
    } else if (s.tap) {
      const t = await target(s.tap, s);
      if (!t) return;
      const { x, y } = t;
      if (desktop) await glide(x, y, s.ms ?? 700);
      else { await sleep(P(s.settle ?? 200)); await page.evaluate((x, y) => window.__tap(x, y), x, y); }
      // phones: let the ripple swell before anything reacts
      await sleep(desktop ? 120 : 400);
      if (s.click === false) { await sleep(P(s.after ?? 300)); return; }
      // A page load counts if the main frame asks for a new document soon after the tap
      const navStart = page.waitForRequest(r => r.isNavigationRequest() && r.frame() === page.mainFrame(), { timeout: s.navWait ?? 350 }).then(() => true).catch(() => false);
      const nav = page.waitForNavigation({ waitUntil: 'load', timeout: 20000 }).catch(() => null);
      const tapped = Date.now();
      const before = { i: frames.length, y: await page.evaluate(() => scrollY) };
      if (s.js) await t.el.evaluate(e => e.click());
      else if (desktop) await page.mouse.click(x, y, { delay: 90 }); else await page.touchscreen.tap(x, y);
      if (s.cut) {
        await sleep(150);
        pause(); await sleep(s.cut);
        await ready(s.prime ?? usePrime);
        // an app route swaps the view before the pause, so dissolve from the tap
        await resume(before.i); await settle(s.after); return;
      }
      // If the tap started a page load, pause the recording until the new page is ready
      if (await navStart) {
        pause();
        await nav;
        await page.waitForNetworkIdle({ idleTime: 400, timeout: 8000 }).catch(() => {});
        await ready(s.prime ?? usePrime);
        await resume();
        await settle(s.after);
      } else {
        // an in-page anchor jump: dissolve from the frame before the tap
        await sleep(140);
        const jumped = Math.abs(await page.evaluate(() => scrollY).catch(() => before.y) - before.y);
        if (!desktop && jumped > dev.viewport.height * 0.5) cuts.push(before.i);
        await sleep(Math.max(0, P(s.after ?? 500) - (Date.now() - tapped)));
      }
    } else if (s.type) {
      const [sel, text] = s.type;
      const t = await target(sel, s);
      if (!t) return;
      if (desktop) { await glide(t.x, t.y, s.ms ?? 700); await page.mouse.click(t.x, t.y, { delay: 90 }); }
      else { await sleep(P(s.settle ?? 200)); await page.evaluate((x, y) => window.__tap(x, y), t.x, t.y); await sleep(250); await t.el.tap(); }
      await sleep(desktop ? 250 : 400);
      await page.keyboard.type(text, { delay: Math.round(110 * Math.sqrt(pace)) });
      await sleep(P(s.after ?? 600));
    } else if (s.goto) { pause(); await go(s.goto); await resume(); await settle(s.after); }
  };

  // "pre" steps set the opening screen before the camera rolls
  for (const s of clip.pre || []) await run({ ...s, mark: undefined });
  // "crop": ".sel" or { "sel": ".sel", "pad": 24 }: measured here, in CSS px of the unzoomed view
  let cropArg = clip.crop;
  if (cropArg && !Array.isArray(cropArg)) {
    const { sel, pad = 20, skip = 0, first = 99 } = typeof cropArg === 'string' ? { sel: cropArg } : cropArg;
    const box = await page.evaluate((sel, z, skip, first) => {
      const rs = [...document.querySelectorAll(sel)].map(e => e.getBoundingClientRect()).filter(r => r.width && r.height).slice(skip, skip + first);
      if (!rs.length) return null;
      const x = Math.min(...rs.map(r => r.left)), y = Math.min(...rs.map(r => r.top));
      return [x / z, y / z, (Math.max(...rs.map(r => r.right)) - x) / z, (Math.max(...rs.map(r => r.bottom)) - y) / z];
    }, sel, zoom, skip, first);
    if (!box) { console.warn(`  ! nothing to crop to for ${sel}`); cropArg = null; }
    else cropArg = [box[0] - pad, box[1] - pad, box[2] + pad * 2, box[3] + pad * 2].map(v => Math.round(v));
  }
  // roll: "intro" reloads the warmed first page on camera for its entrance animation
  if (clip.intro) {
    await page.goto(new URL(clip.path || '', base).href, { waitUntil: 'domcontentloaded', timeout: 60000 });
  }
  cuts.length = 0; pausedTotal = 0; t0 = null; paused = false; rolling = true; started = performance.now();
  await page.evaluate(() => window.__nudge?.()).catch(() => {});
  if (clip.intro) { await page.waitForNetworkIdle({ idleTime: 300, timeout: 6000 }).catch(() => {}); await dress(page, project, clip); await startAt(); }
  await sleep(P(clip.lead ?? 900));

  for (const s of clip.steps) await run(s);
  await sleep(P(clip.tail ?? 900));
  // one last repaint, so a still ending (a held sheet, a lightbox) keeps its full length
  await page.evaluate(() => window.__nudge?.()).catch(() => {});
  await sleep(120);
  paused = true;
  await cdp.send('Page.stopScreencast');
  await page.close();
  await Promise.all(writes);

  // hold the last frame to the very end, then encode
  const end = frames.at(-1).t + 0.05;
  await fs.copyFile(file(frames.length - 1), file(frames.length));
  frames.push({ t: end });
  await fs.writeFile(path.join(tmp, 'times.json'), JSON.stringify(frames.map(f => Math.max(0, f.t))));
  const loopFade = clip.loopFade ?? project.loopFade ?? (desktop ? 0 : 0.5);
  const keep = [...new Set(cuts)].filter(i => i > 0 && i < frames.length - 1);
  await fs.writeFile(path.join(tmp, 'opts.json'), JSON.stringify({ cuts: keep, fade: clip.fade ?? 0.35, loopFade }));
  const out = path.join(outDir, `${clip.name}.mp4`);
  if (keep.length) console.log('  dissolves at', keep.map(i => frames[i].t.toFixed(2) + 's').join(' · '));
  const width = clip.width || dev.width;
  console.log('  ' + execFileSync('swift', [path.join(ROOT, 'tools/frames2mp4.swift'), tmp, out, String(width), String(clip.bitrate || dev.bitrate), ...(cropArg ? [`${cropArg.join(',')}@${dev.viewport.width / zoom}`] : [])], { encoding: 'utf8' }).trim());
  // poster: frame 0 (or "posterAt" seconds), scaled to the clip's width
  let pi = 0;
  if (clip.posterAt !== undefined) pi = Math.max(0, frames.findLastIndex(f => f.t <= clip.posterAt));
  const poster = path.join(outDir, `${clip.name}.jpg`);
  if (cropArg) await fs.copyFile(file(pi), poster);
  else execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '82', '--resampleWidth', String(width), file(pi), '--out', poster], { stdio: 'ignore' });
  if (marks.length) { await fs.writeFile(path.join(outDir, `${clip.name}.marks.json`), JSON.stringify(marks, null, 1)); console.log('  marks', marks.map(m => `${m.t}s ${m.title}`).join(' · ')); }
  await fs.rm(tmp, { recursive: true, force: true });
}

// JOURNEYS=tools/other.json lets a task keep its own clip list
const config = JSON.parse(await fs.readFile(path.resolve(ROOT, process.env.JOURNEYS || 'tools/journeys.json'), 'utf8'));
const [id, only] = process.argv.slice(2);
const project = config[id];
if (!project) { console.error(`No journeys for "${id}". Have: ${Object.keys(config).join(', ')}`); process.exit(1); }
// force 2x: without it the screencast sends CSS-size frames whatever the viewport's scale
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--force-device-scale-factor=2'] });
let server, base = project.url;
if (project.local) { server = await serve(path.resolve(ROOT, project.local)); base = `http://127.0.0.1:${server.address().port}/`; }
const outDir = path.join(ROOT, 'assets/clips', id);
await fs.mkdir(outDir, { recursive: true });
try {
  for (const clip of project.clips) {
    if (only && clip.name !== only) continue;
    console.log(`${id} / ${clip.name}`);
    await record(browser, base, id, project, clip, outDir);
  }
} finally { await browser.close(); server?.close(); }
