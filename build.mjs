// 构建脚本（v2）：拼接 src/ 下 NN-*.js 模块 → 自包含单文件 userscript
// - 开发者只维护 src/ 模块化源码（每文件 ≤600 行，符合 code-standards §2）
// - 构建产物 quick-interaction.user.js（用户直装源）与 assets/main.js（loader 用）均由本脚本生成
// - 版本单一源：@version 从源码 const VERSION 注入；version.json 以根蓝本生成（含公告）
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const root = process.cwd();
const srcDir = path.join(root, 'src');

// 1. 按文件名顺序读取所有 NN-*.js 模块（数字前缀保证拼接顺序 = 原单文件顺序）
const files = fs.readdirSync(srcDir)
    .filter(f => /^\d{2}-.*\.js$/.test(f))
    .sort();
if (!files.length) { console.error('❌ src/ 下未找到模块'); process.exit(1); }
let body = files.map(f => fs.readFileSync(path.join(srcDir, f), 'utf8')).join('\n\n');

// 2. 版本单一源：const VERSION 注入到 @version 元数据头（消除双维护）
const vm = body.match(/const VERSION\s*=\s*'([^']+)'/);
const version = vm ? vm[1] : '0.0.0';
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
const endHeader = body.indexOf('// ==/UserScript==');
if (endHeader === -1) throw new Error('未找到 ==/UserScript== 标记，无法剥离头');
const main = body.slice(endHeader + '// ==/UserScript=='.length);
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
