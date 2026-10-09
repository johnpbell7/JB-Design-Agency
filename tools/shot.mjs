import puppeteer from 'puppeteer-core';
const [url, sel, out, w='1440'] = process.argv.slice(2);
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
const p = await b.newPage(); await p.setViewport({ width: +w, height: 900, deviceScaleFactor: 2 });
await p.goto(url, { waitUntil: 'networkidle2' });
await p.evaluate(s => document.querySelector(s).scrollIntoView({ block: 'center' }), sel);
await new Promise(r => setTimeout(r, 2500));
await (await p.$(sel)).screenshot({ path: out });
await b.close();
