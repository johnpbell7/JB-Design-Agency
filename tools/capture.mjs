// Captures full-page screenshots (for scrolling device mockups) and element
// close-ups for every shot listed in tools/captures.json.
//
//   node tools/capture.mjs              all projects
//   node tools/capture.mjs nic-pouches  one project
//   node tools/capture.mjs all fold     one shot name across every project
//
// Local sources are served over a throwaway static server so relative fetches work.
import puppeteer from 'puppeteer-core';
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'assets/captures');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const MAX_PIXELS = 16000; // WebP caps out at 16383px per side

const VIEWPORTS = {
  desktop: { width: 1440, height: 900, deviceScaleFactor: 1 },
  mobile: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
};

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
      try {
        const body = await fs.readFile(file);
        res.writeHead(200, { 'content-type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream' });
        res.end(body);
      } catch {
        // Shopify-style pretty URLs: /page -> /page.html
        try {
          const body = await fs.readFile(file + '.html');
          res.writeHead(200, { 'content-type': 'text/html' }).end(body);
        } catch { res.writeHead(404).end(); }
      }
    });
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

// Scroll the whole page so lazy images load and scroll-reveal sections fire.
async function primePage(page) {
  await page.evaluate(async () => {
    // Sites with scroll-behavior: smooth would still be animating when we shoot
    document.documentElement.style.setProperty('scroll-behavior', 'auto', 'important');
    const step = innerHeight * 0.6;
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      scrollTo(0, y);
      await new Promise(r => setTimeout(r, 120));
    }
    // Let count-ups and other JS-driven animations finish before capturing
    await new Promise(r => setTimeout(r, 2500));
    scrollTo(0, 0);
  });
  await page.addStyleTag({ content: `*,*::before,*::after{transition:none!important;animation-play-state:paused!important;caret-color:transparent!important}` });
  await new Promise(r => setTimeout(r, 600));
}

// Full-page screenshots freeze fixed/sticky elements wherever the page was
// scrolled. Pin top bars to the top of the document and drop other floaters.
async function settleFixed(page) {
  await page.evaluate(() => {
    for (const el of document.querySelectorAll('body *')) {
      const cs = getComputedStyle(el);
      if (cs.position !== 'fixed' && cs.position !== 'sticky') continue;
      const r = el.getBoundingClientRect();
      if (r.height === 0 || cs.display === 'none') continue;
      if (cs.position === 'sticky') { el.style.setProperty('position', 'relative', 'important'); el.style.setProperty('top', 'auto', 'important'); continue; }
      const isTopBar = r.top < 40 && r.width > innerWidth * 0.6 && r.height < innerHeight * 0.3;
      if (isTopBar) el.style.setProperty('position', 'absolute', 'important');
      else el.style.setProperty('display', 'none', 'important');
    }
  });
}

// Seed storage before any page script runs (skips intro films, age gates, cookie bars).
async function seedStorage(page, shot, project) {
  const local = { ...project.localStorage, ...shot.localStorage };
  const session = { ...project.sessionStorage, ...shot.sessionStorage };
  await page.evaluateOnNewDocument((local, session) => {
    try {
      for (const [k, v] of Object.entries(local)) localStorage.setItem(k, v);
      for (const [k, v] of Object.entries(session)) sessionStorage.setItem(k, v);
    } catch {}
  }, local, session);
}

async function prepare(page, shot, project) {
  for (const sel of [...(project.click || []), ...(shot.click || [])]) {
    await page.click(sel).catch(() => console.warn(`  ! could not click ${sel}`));
    await new Promise(r => setTimeout(r, 400));
  }
  const hide = [...(project.hide || []), ...(shot.hide || [])];
  if (hide.length) await page.addStyleTag({ content: `${hide.join(',')}{display:none!important}` });
  if (project.css || shot.css) await page.addStyleTag({ content: `${project.css || ''}\n${shot.css || ''}` });
  if (shot.scrollTo) await page.evaluate(sel => document.querySelector(sel)?.scrollIntoView({ block: 'start' }), shot.scrollTo);
}

async function run() {
  // CAPTURE_CONFIG=tools/other.json lets a task use its own shot list
  const config = JSON.parse(await fs.readFile(path.resolve(ROOT, process.env.CAPTURE_CONFIG || 'tools/captures.json'), 'utf8'));
  const only = process.argv[2] === 'all' ? null : process.argv[2];
  const onlyShot = process.argv[3];
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
  try {
    for (const [id, project] of Object.entries(config)) {
      if (only && id !== only) continue;
      console.log(`\n${id}`);
      let server, base = project.url;
      if (project.local) {
        server = await serve(path.resolve(ROOT, project.local));
        base = `http://127.0.0.1:${server.address().port}/`;
      }
      const dir = path.join(OUT, id);
      await fs.mkdir(dir, { recursive: true });

      for (const shot of project.shots) {
        if (onlyShot && shot.name !== onlyShot) continue;
        for (const vp of shot.viewports || ['desktop', 'mobile']) {
          const page = await browser.newPage();
          // Close-ups are always 2x so they stay sharp when zoomed in the portfolio.
          await page.setViewport(shot.selector ? { ...VIEWPORTS[vp], deviceScaleFactor: 2 } : VIEWPORTS[vp]);
          await seedStorage(page, shot, project);
          const url = new URL(shot.path || '', base).href;
          try {
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
            await prepare(page, shot, project);
            await primePage(page);
            const file = path.join(dir, `${shot.name}-${vp}.webp`);
            if (shot.selector) {
              const el = await page.$(shot.selector);
              if (!el) { console.warn(`  ! ${shot.name} (${vp}): no element ${shot.selector}`); continue; }
              await el.scrollIntoView();
              await el.screenshot({ path: file, type: 'webp', quality: 90 });
            } else if (shot.fold) {
              // First screen only, for thumbnails
              await page.screenshot({ path: file, type: 'webp', quality: 80 });
            } else {
              await settleFixed(page);
              const h = await page.evaluate(() => document.documentElement.scrollHeight);
              const max = Math.floor(MAX_PIXELS / VIEWPORTS[vp].deviceScaleFactor);
              await page.screenshot({ path: file, type: 'webp', quality: 82, fullPage: h <= max,
                ...(h > max && { clip: { x: 0, y: 0, width: VIEWPORTS[vp].width, height: max }, captureBeyondViewport: true }) });
            }
            console.log(`  ✓ ${shot.name}-${vp}`);
          } catch (e) {
            console.warn(`  ! ${shot.name} (${vp}): ${e.message}`);
          } finally {
            await page.close();
          }
        }
      }
      server?.close();
    }
  } finally {
    await browser.close();
  }
}

run();
