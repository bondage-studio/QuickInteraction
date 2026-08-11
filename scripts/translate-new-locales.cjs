const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const source = JSON.parse(fs.readFileSync(path.join(root, 'Translation', 'EN.json'), 'utf8'));
const targets = { JA: 'ja', KO: 'ko', VI: 'vi', ES: 'es' };
const concurrency = 8;

function sleep(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }

async function translate(text, target) {
  const placeholders = [];
  const protectedText = text.replace(/\{[^}]+\}/g, (value) => `__QI${placeholders.push(value) - 1}__`);
  const url = new URL('https://translate.googleapis.com/translate_a/single');
  url.searchParams.set('client', 'gtx');
  url.searchParams.set('sl', 'en');
  url.searchParams.set('tl', target);
  url.searchParams.set('dt', 't');
  url.searchParams.set('q', protectedText);
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const body = await response.json();
      let result = (body[0] || []).map((part) => part[0] || '').join('');
      placeholders.forEach((value, index) => { result = result.replaceAll(`__QI${index}__`, value); });
      if (result) return result;
    } catch (error) {
      if (attempt === 3) throw error;
      await sleep(400 * (attempt + 1));
    }
  }
}

async function translateLocale(locale, target) {
  const entries = Object.entries(source);
  const output = {};
  let cursor = 0;
  async function worker() {
    while (cursor < entries.length) {
      const [key, text] = entries[cursor++];
      output[key] = await translate(text, target);
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker));
  const ordered = Object.fromEntries(entries.map(([key]) => [key, output[key]]));
  fs.writeFileSync(path.join(root, 'Translation', `${locale}.json`), `${JSON.stringify(ordered, null, 2)}\n`);
  console.log(`${locale}: ${entries.length} keys`);
}

(async () => {
  for (const [locale, target] of Object.entries(targets)) await translateLocale(locale, target);
})().catch((error) => { console.error(error); process.exitCode = 1; });
