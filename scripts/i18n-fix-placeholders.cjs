// QiAct 字典占位符修复：仅对「缺失参考占位符 token」的 (ns,key,lang) 单元格重新机翻
// 重译时用 {token} -> ZXtokenXZ 包裹保护，翻译后还原为 {token}，杜绝机器翻译把占位符本地化/丢弃。
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
function tokensOf(s) { return [...String(s || '').matchAll(/\{(\w+)\}/g)].map(m => m[1]); }

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

// 占位符保护重译：把每个 {token} 按出现顺序包成 ZZph{i}ZZ（非单词内文，GT 实测原样保留），
// 译后按索引精确还原为 {token}，杜绝机器翻译把占位符本地化/丢弃。
function placeholderMap(src) {
  const toks = [...new Set(tokensOf(src))];
  const map = {};
  let prot = src;
  toks.forEach((t, i) => { const s = 'ZZph' + i + 'ZZ'; map[s] = '{' + t + '}'; prot = prot.split('{' + t + '}').join(s); });
  return { prot, map };
}
async function translateProtected(src, sl, tl) {
  const { prot, map } = placeholderMap(src);
  let out = await translateOne(prot, sl, tl);
  if (!out) out = prot;
  for (const s of Object.keys(map)) out = out.split(s).join(map[s]);
  out = out.replace(/ZZ\s*ph(\d+)\s*ZZ/g, (m, i) => (map['ZZph' + i + 'ZZ'] || m));
  return ensureTokens(src, out);
}

// GT 偶尔会整段丢弃占位符（HTML 内 / 句尾 / e.g. 示例）。此处兜底：按源串结构把规范 token 插回正确位置。
function ensureTokens(src, out) {
  const refToks = tokensOf(src);
  let res = out;
  for (const tk of refToks) {
    if (res.includes('{' + tk + '}')) continue;
    const idx = src.indexOf('{' + tk + '}');
    if (src.slice(idx - 11, idx) === '<br><small>') {
      res = res + '<br><small>{' + tk + '}</small>';
    } else if (src.lastIndexOf('\n', idx) !== -1 && src.lastIndexOf('\n', idx) < idx) {
      res = res + '\n{' + tk + '}';
    } else {
      res = res + ' {' + tk + '}';
    }
  }
  return res;
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
      ret[i] = val || items[i].src;
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
  return ret;
}

(async () => {
  // 收集需要修复的单元格
  const todo = []; // { ns, key, lang, sl, tl, src }
  for (const t of TARGETS) {
    for (const ns in collect) for (const [k, v] of collect[ns]) {
      if (!exists(v, t.lang)) continue;
      const src = t.pick(v);
      const refToks = tokensOf(src);
      if (refToks.length === 0) continue;
      const cur = v[t.lang];
      const curToks = new Set(tokensOf(cur));
      const missing = refToks.filter(tk => !curToks.has(tk));
      if (missing.length > 0) todo.push({ ns, key: k, lang: t.lang, sl: t.sl, tl: t.tl, src });
    }
  }
  console.error('需要修复占位符的单元格: ' + todo.length);
  const results = await mapPool(todo, it => translateProtected(it.src, it.sl, it.tl), CONCURRENCY);

  const fill = {};
  let fixed = 0, stillBad = 0;
  for (let i = 0; i < todo.length; i++) {
    const { ns, key, lang } = todo[i];
    const newStr = results[i];
    const refToks = tokensOf(todo[i].src);
    const got = new Set(tokensOf(newStr));
    const stillMissing = refToks.filter(tk => !got.has(tk));
    const fk = ns + '|' + key;
    fill[fk] = fill[fk] || {};
    fill[fk][lang] = newStr;
    if (stillMissing.length === 0) fixed++;
    else { stillBad++; console.error('仍缺失占位符', ns, key, lang, stillMissing.join(',')); }
  }
  console.error('修复成功: ' + fixed + ' / 仍异常: ' + stillBad);

  // 干净重建（与 autofill 同格式）
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
  console.error('WROTE ' + DICT);
})().catch(e => { console.error('FATAL', e.message); process.exit(1); });
