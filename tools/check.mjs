// Loads pages of a local site copy and lists anything that failed to load
// (missing files, JS errors). Usage:
//   node tools/check.mjs sites/gosweet index.html collection.html product.html
import puppeteer from 'puppeteer-core';
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';

const [dir, ...pages] = process.argv.slice(2);
const root = path.resolve(dir);
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.json': 'application/json', '.mp4': 'video/mp4' };

const server = http.createServer(async (req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p.endsWith('/')) p += 'index.html';
  const file = path.join(root, p);
  for (const f of [file, file + '.html']) {
    try {
      const body = await fs.readFile(f);
      res.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' }).end(body);
      return;
    } catch {}
  }
  res.writeHead(404).end();
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}/`;

const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
let problems = 0;
for (const p of pages.length ? pages : ['index.html']) {
  const page = await browser.newPage();
  const issues = [];
  page.on('response', r => { if (r.status() >= 400) issues.push(`${r.status()} ${r.url().replace(base, '/')}`); });
  page.on('requestfailed', r => issues.push(`FAILED ${r.url().replace(base, '/')} (${r.failure()?.errorText})`));
  page.on('pageerror', e => issues.push(`JS ERROR ${e.message.split('\n')[0]}`));
  await page.goto(base + p, { waitUntil: 'networkidle2', timeout: 60000 }).catch(e => issues.push(`LOAD ${e.message}`));
  console.log(`${issues.length ? '✗' : '✓'} ${p}`);
  for (const i of [...new Set(issues)]) console.log(`    ${i}`);
  problems += issues.length;
  await page.close();
}
await browser.close();
server.close();
process.exit(problems ? 1 : 0);
