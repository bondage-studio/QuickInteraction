// 构建脚本：从 XiaoSuActivity 仓库提取全部动作，生成 QiAct 内置「小酥动作包」。
// 用法：node tools/build-xiaosu-pack.mjs
// 输出：src/data/xiaosu-pack.js（声明 var XIAOSU_PACKED = [...]）
//
// 设计：把小酥动作拓展(XiaoSuActivity, 前缀 XSAct_) 的全部动作“重新编译”进 QiAct，
// 以 QiAct_ 自定义动作形式内置发布 —— 用户无需安装原版插件即可使用，且对原版停更/故障免疫。
// 文案取自 XiaoSuActivity/translation/CN.json（中文），占位符 {0}/{1}/{2} 统一转换为
// {SourceCharacter}/{TargetCharacter}/{部位名}，与 QiAct 跨客户端发包逻辑一致。

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const xsRoot = '/Users/amoy_johnny/WorkBuddy/2026-06-03-14-48-07/XiaoSuActivity';

const SRC = path.join(xsRoot, 'src/Modules/MActivity.ts');
const CN = path.join(xsRoot, 'translation/CN.json');
const OUT = path.join(repoRoot, 'src/data/xiaosu-pack.js');

// BC 资产组 → 中文显示名（仅用于 isBase 动作的 {2} 占位符替换）
const GROUP_LABELS = {
    ItemHead: '头', ItemMouth: '嘴', ItemMouth2: '嘴', ItemMouth3: '嘴',
    ItemNose: '鼻子', ItemNeck: '脖子', ItemTorso: '身体', ItemTorso2: '身体',
    ItemBreast: '胸', ItemArms: '手臂', ItemLegs: '腿', ItemFeet: '脚',
    ItemBoots: '靴', ItemHood: '头罩', ItemHoodCovered: '头罩', ItemPelvis: '小腹',
    ItemHands: '手', ItemHandheld: '手'
};

function stripComments(s) {
    // 去掉 /* */ 与 // 注释（避免 ${...} 等干扰括号匹配）
    return s
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/[^\n]*/g, '');
}

function extractBlock(src, key) {
    const i = src.indexOf(key);
    const eq = src.indexOf('= {', i);
    const braceStart = src.indexOf('{', eq);
    let depth = 0;
    for (let j = braceStart; j < src.length; j++) {
        const c = src[j];
        if (c === '{') depth++;
        else if (c === '}') { depth--; if (depth === 0) return src.slice(braceStart, j + 1); }
    }
    return '';
}

function parseArr(str) {
    if (!str) return [];
    return str.split(',').map(x => x.trim().replace(/['"]/g, '')).filter(Boolean);
}

function convertPlaceholders(text, groupLabel) {
    if (typeof text !== 'string') return '';
    return text
        .replace(/\{0\}/g, '{SourceCharacter}')
        .replace(/\{1\}/g, '{TargetCharacter}')
        .replace(/\{2\}/g, groupLabel || '')
        .replace(/\{group\}/g, groupLabel || '');
}

function main() {
    const raw = fs.readFileSync(SRC, 'utf8');
    const clean = stripComments(raw);
    const block = extractBlock(clean, 'activityToAddDict:');
    const cn = JSON.parse(fs.readFileSync(CN, 'utf8'));
    const dict = cn.Activity || {};

    // 逐条解析 XSAct_XXX: { act: {...}, desc: null, img: "...", isBase?: true }
    const entries = [];
    const re = /(XSAct_[^\s:]+)\s*:\s*\{\s*act\s*:\s*\{([^}]*)\}/g;
    let m;
    while ((m = re.exec(block))) {
        const fullName = m[1];                 // XSAct_眯眼
        const act = m[2];
        const name = fullName.replace(/^XSAct_/, '');
        const tg = act.match(/Target\s*:\s*\[([^\]]*)\]/);
        const tsg = act.match(/TargetSelf\s*:\s*\[([^\]]*)\]/);
        const target = parseArr(tg && tg[1]);
        const targetSelf = parseArr(tsg && tsg[1]);

        const hasT = target.length > 0;
        const hasTS = targetSelf.length > 0;
        const scope = (hasT && hasTS) ? 'any' : hasTS ? 'self' : 'other';
        const group = (hasT ? target[0] : (hasTS ? targetSelf[0] : 'ItemMouth'));
        const groupLabel = GROUP_LABELS[group] || group;

        const display = dict[name] || name;
        const desc0 = dict[name + '.Desc.0'] || '';   // ChatOther（对他人）
        const desc1 = dict[name + '.Desc.1'] || '';   // ChatSelf（对自己）

        // 兜底：空描述回退到显示名，避免原生面板显示空文案
        const dialogOther = convertPlaceholders(desc0, groupLabel) || display;
        const dialogSelf = convertPlaceholders(desc1, groupLabel) || dialogOther;

        entries.push({
            id: 'xs_' + fullName,
            name: display,
            scope: scope,
            group: group,
            dialog: dialogOther,
            dialogSelf: dialogSelf,
            createdAt: 0,
            source: 'xiaosu',
            builtin: true,
            xiaosuName: fullName,
            visible: true
        });
    }

    if (!entries.length) { console.error('❌ 未解析到任何小酥动作'); process.exit(1); }

    const lines = entries.map(e => '    ' + JSON.stringify(e)).join(',\n');
    const out = [
        '    /* ===== 22. 内置小酥动作包（XiaoSuActivity 动作预编译，离线可用） ===== */',
        '    /* 由 tools/build-xiaosu-pack.mjs 从 XiaoSuActivity 仓库生成；原作 MIT 许可，作者 XiaoSu。',
        '       动作以 QiAct_ 自定义动作形式内置，无需安装原版插件即可使用，且对原版停更/故障免疫。 */',
        '    var XIAOSU_PACKED = [',
        lines,
        '    ];',
        ''
    ].join('\n');

    fs.writeFileSync(OUT, out);
    console.log('✅ 已生成 ' + entries.length + ' 个小酥动作 → ' + path.relative(repoRoot, OUT));
    // 统计各 scope / group 分布，便于核对
    const byScope = {};
    entries.forEach(e => { byScope[e.scope] = (byScope[e.scope] || 0) + 1; });
    console.log('   scope 分布:', JSON.stringify(byScope));
}

main();
