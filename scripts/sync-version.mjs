import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
function writeJson(file, value) { fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`); }

export function syncProjectVersion(root) {
    const versionInfo = readJson(path.join(root, 'version.json'));
    const version = String(versionInfo.version || '');
    if (!/^\d+\.\d+\.\d+$/.test(version)) throw new Error(`version.json 的 version 格式無效：${version || '(空白)'}`);

    for (const name of ['package.json', 'package-lock.json']) {
        const file = path.join(root, name);
        if (!fs.existsSync(file)) continue;
        const data = readJson(file);
        data.version = version;
        if (data.packages && data.packages['']) data.packages[''].version = version;
        writeJson(file, data);
    }

    const contextFile = path.join(root, 'src/core/application-context.js');
    const context = fs.readFileSync(contextFile, 'utf8');
    if (!/const VERSION\s*=\s*'[^']+';/.test(context)) throw new Error('找不到 application-context.js 的 VERSION 常數');
    fs.writeFileSync(contextFile, context.replace(/const VERSION\s*=\s*'[^']+';/, `const VERSION = '${version}';`));

    const runtimeFile = path.join(root, 'src/platform/userscript-runtime.js');
    const runtime = fs.readFileSync(runtimeFile, 'utf8');
    if (!/(\/\/ @version\s+)\S+/.test(runtime)) throw new Error('找不到 userscript-runtime.js 的 @version 標頭');
    fs.writeFileSync(runtimeFile, runtime.replace(/(\/\/ @version\s+)\S+/, `$1${version}`));
    return versionInfo;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
    console.log(`版本已同步：${syncProjectVersion(root).version}`);
}
