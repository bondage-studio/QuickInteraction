import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import vm from 'node:vm';
import { build as viteBuild } from 'vite';
import { readCompatSource } from './scripts/source-bundle.mjs';
import { syncProjectVersion } from './scripts/sync-version.mjs';

const root = process.cwd();
const editableVersionInfo = syncProjectVersion(root);
const source = readCompatSource(root);
console.log(`🌐 翻译校验通过：${source.translationCount} 键，强制 CN/EN 齐全`);

await viteBuild({ configFile: path.join(root, 'vite.config.js') });

const viteOutDir = path.join(root, '.vite-dist');
const viteAssetPath = path.join(viteOutDir, 'assets', 'main.js');
const assetPath = path.join(root, 'assets', 'main.js');
const builtRuntime = fs.readFileSync(viteAssetPath, 'utf8');
// userscript 以经典脚本执行，不能只用 package.json(type=module) 下的 node --check；
// vm.Script 会额外拦下误产出的 import/export/top-level await。
new vm.Script(builtRuntime, { filename: 'assets/main.js' });
fs.mkdirSync(path.dirname(assetPath), { recursive: true });
fs.writeFileSync(assetPath, builtRuntime);
const viteMapPath = `${viteAssetPath}.map`;
if (fs.existsSync(viteMapPath)) fs.copyFileSync(viteMapPath, `${assetPath}.map`);
const header = source.header.replace(/(\/\/ @version\s+)\S+/, `$1${source.version}`);
const userscriptPath = path.join(root, 'quick-interaction.user.js');
const userscriptRuntime = builtRuntime.replace(/\n\/\/# sourceMappingURL=.*\s*$/, '\n');
fs.writeFileSync(userscriptPath, `${header}\n\n${userscriptRuntime}`);

execFileSync(process.execPath, ['--check', assetPath], { stdio: 'inherit' });
execFileSync(process.execPath, ['--check', userscriptPath], { stdio: 'inherit' });

const versionInfo = {
    version: source.version,
    date: editableVersionInfo.date || new Date().toISOString().slice(0, 10),
    severity: editableVersionInfo.severity || 'normal',
    summary: editableVersionInfo.summary || [],
    detailsUrl: editableVersionInfo.detailsUrl || `https://github.com/bondage-studio/QuickInteraction/releases/tag/v${source.version}`,
    announcement: editableVersionInfo.announcement,
};
fs.writeFileSync(path.join(root, 'assets', 'version.json'), `${JSON.stringify(versionInfo, null, 2)}\n`);
fs.rmSync(viteOutDir, { recursive: true, force: true });

console.log('built', userscriptPath, 'bytes:', fs.statSync(userscriptPath).size);
console.log('built', assetPath, 'bytes:', fs.statSync(assetPath).size);
console.log('version:', source.version, '· compatibility modules:', source.files.length, '· ESM entry: src/main.js');
