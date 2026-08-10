// 构建脚本（v2）：拼接 src/ 下 NN-*.js 模块 → 自包含单文件 userscript
// - 开发者只维护 src/ 模块化源码（每文件 ≤600 行，符合 code-standards §2）
// - 构建产物 quick-interaction.user.js（用户直装源）与 assets/main.js（loader 用）均由本脚本生成
// - 版本单一源：@version 从源码 const VERSION 注入；version.json 以根蓝本生成（含公告）
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import * as vm from 'vm';

const root = process.cwd();
const srcDir = path.join(root, 'src');

// 1. 按文件名顺序读取所有 NN-*.js 模块（数字前缀保证拼接顺序 = 原单文件顺序）
const files = fs.readdirSync(srcDir)
    .filter(f => /^\d{2}-.*\.js$/.test(f))
    .sort();
if (!files.length) { console.error('❌ src/ 下未找到模块'); process.exit(1); }
// i18n 引擎(02-i18n.js) 必须最先执行：部分模块（如 01-entry.js 的 BODY_PARTS / THEMES
// 顶层数组）在加载期就调用 QiActT()，且需要字典已注册才能取到译文。
// 引擎自包含（仅依赖 window/localStorage），不依赖其它模块，提前安全。
const ENGINE = '02-i18n.js';
const rest = files.filter(f => f !== ENGINE);
const engineSrc = fs.readFileSync(path.join(srcDir, ENGINE), 'utf8');
let body = ''; // 在字典校验后于下方拼装（引擎 + locales + 其余模块）

// 1.5 读取多语言字典 src/99-locales/*.js（按字母序），构建期内联进单文件
//     —— 对齐 liko 上游「每插件一个 XXX-i18n.js」范式，但改为构建期拼入而非运行时 import
const localesDir = path.join(srcDir, '99-locales');
let localeBody = '';
// 强制必填语言：CN/EN。TW 由引擎回退 CN，DE/FR/RU/UA 由引擎回退 EN（见 src/02-i18n.js）
const REQUIRED_LANGS = ['CN', 'EN'];
if (fs.existsSync(localesDir)) {
    const localeFiles = fs.readdirSync(localesDir).filter(f => /\.js$/.test(f)).sort();
    if (localeFiles.length) {
        localeBody = localeFiles.map(f => '/* === locales/' + f + ' === */\n' + fs.readFileSync(path.join(localesDir, f), 'utf8')).join('\n\n');
        // 字典完整性校验：在沙箱中执行各 locale 文件，收集键并验证强制三语
        const collected = {};
        const sandbox = {
            console,
            localStorage: { getItem() { return null; }, setItem() {}, removeItem() {} },
            window: {}
        };
        sandbox.window.QiActI18n = {
            register(ns, dict) {
                if (!dict || typeof dict !== 'object') return;
                for (const k in dict) if (Object.prototype.hasOwnProperty.call(dict, k)) collected[ns + '.' + k] = dict[k];
            }
        };
        // locale 文件里直接调用 QiActI18n.register(...)（全局引用），沙箱需暴露为全局
        sandbox.QiActI18n = sandbox.window.QiActI18n;
        vm.createContext(sandbox);
        for (const f of localeFiles) {
            try { vm.runInContext(fs.readFileSync(path.join(localesDir, f), 'utf8'), sandbox, { filename: f }); }
            catch (e) { console.error('❌ 翻译文件执行失败 ' + f + ':', e.message); process.exit(1); }
        }
        const missing = [];
        for (const key in collected) {
            const e = collected[key];
            for (const L of REQUIRED_LANGS) if (!(L in e) || e[L] == null) missing.push(key + '@' + L);
        }
        if (missing.length) {
            console.error('❌ 翻译缺失（强制 CN/EN 必填；TW 回退 CN，DE/FR/RU/UA 回退 EN）：');
            console.error('   ' + missing.slice(0, 30).join('\n   '));
            if (missing.length > 30) console.error('   …（共 ' + missing.length + ' 处）');
            process.exit(1);
        }
        console.log('🌐 翻译校验通过：' + Object.keys(collected).length + ' 键，强制三语齐全');
    }
}
// locale 内联在引擎(02-i18n.js)之后、其余逻辑之前——注册早于任何运行期/加载期 QiActT() 调用
// 顺序：引擎(02) → locales(注册字典) → 其余模块(01/03+/22)，保证顶层 QiActT() 既能解析又不空字典
body = engineSrc + '\n\n' + localeBody + '\n\n' + rest.map(f => fs.readFileSync(path.join(srcDir, f), 'utf8')).join('\n\n');

// 2. 版本单一源：const VERSION 注入到 @version 元数据头（消除双维护）
const verMatch = body.match(/const VERSION\s*=\s*'([^']+)'/);
const version = verMatch ? verMatch[1] : '0.0.0';
body = body.replace(/(\/\/ @version\s+)\S+/, '$1' + version);

// 3. 写出自包含单文件（开发者直装源 = 构建产物，进 git 供 raw 下载）
const mainPath = path.join(root, 'quick-interaction.user.js');
fs.writeFileSync(mainPath, body);

// 4. 语法校验：坏代码直接拦下，不进发布产物
try {
    execSync('node --check ' + JSON.stringify(mainPath), { stdio: 'inherit' });
} catch (e) {
    console.error('❌ 语法校验失败，终止构建');
    process.exit(1);
}

// 5. 剥离元数据头 → assets/main.js（运行时零外部依赖，供 loader import() 加载）
// 注意：i18n 引擎(02-i18n.js)被提前拼接到 00-preamble.js（含 UserScript 头）之前，
// 因此不能简单地「砍掉标记之前的全部内容」——那样会连引擎和字典一起砍掉，
// 只能精确挖掉头块本身（==UserScript== … ==/UserScript==），保留头块前后的代码。
const startHeader = body.indexOf('// ==UserScript==');
const endHeaderMarker = body.indexOf('// ==/UserScript==');
if (startHeader === -1 || endHeaderMarker === -1) throw new Error('未找到 UserScript 头标记，无法剥离头');
const endHeader = endHeaderMarker + '// ==/UserScript=='.length;
const main = body.slice(0, startHeader) + body.slice(endHeader);
const outDir = path.join(root, 'assets');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'main.js'), main);

// 6. 生成 version.json（供脚本端 5 分钟轮询检测「更新可用 / 公告」）
//    以仓库根 version.json（开发者维护的蓝本，含 summary / announcement）为基准，
//    仅把 version 字段与源码 const VERSION 同步，保留公告内容，避免发布时丢失。
const rootVersionPath = path.join(root, 'version.json');
let base = {};
try { base = JSON.parse(fs.readFileSync(rootVersionPath, 'utf8')); } catch (_) { /* 无蓝本：用空模板 */ }
const versionInfo = {
    version,
    date: base.date || new Date().toISOString().slice(0, 10),
    severity: base.severity || 'normal',
    summary: base.summary || [],
    detailsUrl: base.detailsUrl || `https://github.com/bondage-studio/QuickInteraction/releases/tag/v${version}`,
    announcement: (base.announcement !== undefined ? base.announcement : undefined),
};
fs.writeFileSync(path.join(outDir, 'version.json'), JSON.stringify(versionInfo, null, 2) + '\n');

console.log('built', mainPath, 'bytes:', fs.statSync(mainPath).size);
console.log('built', path.join(outDir, 'main.js'), 'bytes:', fs.statSync(path.join(outDir, 'main.js')).size);
console.log('version:', version, '· modules:', files.length);
