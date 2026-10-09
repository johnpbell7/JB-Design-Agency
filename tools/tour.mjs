// Viewport screenshots at chosen scroll positions (for checking pinned/sticky sections).
//   node tools/tour.mjs <url> <outprefix> <theme> "<selector>@<fraction>" ...
// fraction = how far through the element to scroll (0 = its top at the top of the screen).
import puppeteer from 'puppeteer-core';
const [url, out, theme = 'light', ...stops] = process.argv.slice(2);
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 });
await p.evaluateOnNewDocument(t => { try { localStorage.setItem('jb-theme', t); } catch {} }, theme);
await p.goto(url, { waitUntil: 'networkidle2' });
let i = 0;
for (const stop of stops) {
  const [sel, frac = '0'] = stop.split('@');
  await p.evaluate(async (sel, frac) => {
    const el = document.querySelector(sel);
    const top = el.getBoundingClientRect().top + scrollY;
    const target = top + (el.offsetHeight - innerHeight) * +frac;
    // step there so scroll-triggered things fire
    for (let y = scrollY; Math.abs(y - target) > 10; y += Math.sign(target - y) * Math.min(400, Math.abs(target - y))) { scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); }
    scrollTo(0, target);
  }, sel, frac);
  await new Promise(r => setTimeout(r, 2600));
  await p.screenshot({ path: `${out}-${String(i++).padStart(2, '0')}.png` });
}
await b.close();
