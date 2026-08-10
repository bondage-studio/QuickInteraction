// QiAct 字典批量机翻打底（干净版）：逐条翻译缺失的 DE/FR/RU/UA/TW（Google 免费端点）
// 源：DE/FR/RU/UA 取 EN（缺则 CN）；TW 取 CN（zh-CN→zh-TW）
// 逐条请求：data[0][0][0] 即纯译文串（无数组包裹/弯引号问题），占位符 {xxx} 天然保留。
// 翻译后按 (ns,key) 存储，最后「逐命名空间干净重建」：每个键只出现一次，绝无重复 lang。
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const { promisify } = require('util');
const execFileP = promisify(execFile);

const DICT = path.join(__dirname, '..', 'src', '99-locales', 'dictionary.js');
const CURL = '/usr/bin/curl';
const CONCURRENCY = 6;
const RETRIES = 4;
const LANGS = ['TW', 'CN', 'EN', 'DE', 'FR', 'RU', 'UA'];
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const code = fs.readFileSync(DICT, 'utf8');
const collect = {};
global.QiActI18n = { register(ns, dict) { collect[ns] = []; for (const k in dict) collect[ns].push([k, Object.assign({}, dict[k])]); } };
(new Function(code))();

function exists(v, L) { return v && typeof v[L] === 'string' && v[L].length > 0; }
function jsEscape(s) { return String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/[\u0000-\u001F]/g, ''); }

const TARGETS = [
  { lang: 'DE', sl: 'en', tl: 'de', pick: v => (v.EN || v.CN || '') },
  { lang: 'FR', sl: 'en', tl: 'fr', pick: v => (v.EN || v.CN || '') },
  { lang: 'RU', sl: 'en', tl: 'ru', pick: v => (v.EN || v.CN || '') },
  { lang: 'UA', sl: 'en', tl: 'uk', pick: v => (v.EN || v.CN || '') },
  { lang: 'TW', sl: 'zh-CN', tl: 'zh-TW', pick: v => (v.CN || v.EN || '') }
];

async function translateOne(src, sl, tl) {
  const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=' + sl + '&tl=' + tl + '&dt=t';
  const { stdout } = await execFileP(CURL, ['-s', '-m', '30', '--retry', '3', '--retry-delay', '1', '--retry-all-errors',
    '--data-urlencode', 'q=' + src, '-G', url], { maxBuffer: 16 * 1024 * 1024, encoding: 'utf8' });
  const d = JSON.parse(stdout);
  const v = d[0] && d[0][0] && d[0][0][0];
  return (typeof v === 'string' && v.trim()) ? v.trim() : '';
}

async function mapPool(items, fn, concurrency) {
  const ret = new Array(items.length);
  let idx = 0;
  async function worker() {
    while (idx < items.length) {
      const i = idx++;
      let val = '', tries = 0;
      while (tries < RETRIES && !val) {
        try { val = await fn(items[i]); } catch (e) { val = ''; }
        if (!val) { tries++; await sleep(400); }
      }
      ret[i] = val;
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
  return ret;
}

(async () => {
  const fill = {}; // ns|key -> { DE, FR, RU, UA, TW }
  const stats = { DE: 0, FR: 0, RU: 0, UA: 0, TW: 0, fallback: 0, translated: 0 };

  for (const t of TARGETS) {
    const items = [];
    for (const ns in collect) for (const [k, v] of collect[ns]) {
      if (!exists(v, t.lang)) {
        const src = t.pick(v);
        if (src) items.push({ ns, key: k, src });
      }
    }
    console.error(`[${t.lang}] 待译 ${items.length} 条，并发 ${CONCURRENCY}...`);
    const results = await mapPool(items, it => translateOne(it.src, t.sl, t.tl), CONCURRENCY);
    for (let i = 0; i < items.length; i++) {
      const { ns, key } = items[i];
      let val = results[i];
      const fk = ns + '|' + key;
      fill[fk] = fill[fk] || {};
      if (!val) { val = items[i].src; stats.fallback++; } else stats.translated++;
      fill[fk][t.lang] = val;
      stats[t.lang]++;
    }
    console.error(`[${t.lang}] 完成`);
    await sleep(800);
  }

  // 干净重建：每个 (ns,key) 一次，原始值 + 译文
  const header = code.split('(function () {')[0];
  const lines = [];
  lines.push(header.replace(/\s+$/, ''));
  lines.push('(function () {');
  lines.push("    if (typeof QiActI18n === 'undefined' || !QiActI18n) return; // 引擎未就绪则跳过（防御，运行时不会触发）");
  lines.push('');
  lines.push('    // ⚠️ 机器翻译草稿（Google 免费端点自动生成，DE/FR/RU/UA/TW）。术语与情色语境措辞需人工校对后再正式发布。');
  lines.push('');
  for (const ns in collect) {
    const entries = collect[ns];
    const maxKey = entries.reduce((m, [k]) => Math.max(m, k.length), 0);
    lines.push('    // ' + ns + ' 命名空间');
    lines.push("    QiActI18n.register('" + ns + "', {");
    entries.forEach(([k, v], idx) => {
      const fk = ns + '|' + k;
      const merged = Object.assign({}, v);
      if (fill[fk]) for (const L of ['TW', 'DE', 'FR', 'RU', 'UA']) if (fill[fk][L]) merged[L] = fill[fk][L];
      const pad = ' '.repeat(maxKey - k.length);
      const parts = LANGS.filter(L => exists(merged, L)).map(L => L + ": '" + jsEscape(merged[L]) + "'").join(', ');
      const comma = idx < entries.length - 1 ? ',' : '';
      lines.push("        '" + k + "'" + pad + ':        { ' + parts + ' }' + comma);
    });
    lines.push('    });');
    lines.push('');
  }
  lines.push('})();');
  lines.push('');

  fs.writeFileSync(DICT, lines.join('\n'), 'utf8');
  console.error('STATS ' + JSON.stringify(stats));
  console.error('WROTE ' + DICT);
})().catch(e => { console.error('FATAL', e.message); process.exit(1); });
