import fs from 'node:fs';
import path from 'node:path';

export const REQUIRED_LANGS = ['CN', 'EN'];
export const TRANSLATION_LANGS = ['TW', 'CN', 'EN', 'JA', 'KO', 'VI', 'DE', 'FR', 'ES', 'RU', 'UA'];

// 相容核心仍共用一个 IIFE 词法作用域，因此暂时需要明确顺序；顺序集中在此处，
// 不再隐藏在 00-、01- 等文件名前缀。迁入真正 ESM 的功能会从此清单移除。
export const COMPAT_SOURCE_FILES = [
    'i18n/runtime.js',
    'platform/userscript-runtime.js',
    'core/application-context.js',
    'features/actions/action-catalog.js',
    'features/actions/activity-execution.js',
    'features/combos/combo-service.js',
    'features/custom-actions/registry.js',
    'features/custom-actions/manager-view.js',
    'features/custom-actions/editor.js',
    'features/custom-actions/import-export.js',
    'features/modes/mode-state.js',
    'ui/toggle-button.js',
    'ui/panel-lifecycle.js',
    'ui/panel-template.js',
    'ui/body-grid.js',
    'ui/target-picker.js',
    'ui/render/panel-renderer.js',
    'ui/render/action-renderers.js',
    'ui/panel-behavior.js',
    'ui/styles.js',
    'integrations/bc-hooks.js',
    'services/update-service.js',
    'core/bootstrap.js',
    'data/xiaosu-pack.js',
];

export function readCompatSource(root, { validateLocales = true } = {}) {
    const srcDir = path.join(root, 'src');
    const missingFiles = COMPAT_SOURCE_FILES.filter((file) => !fs.existsSync(path.join(srcDir, file)));
    if (missingFiles.length) throw new Error(`相容核心清单缺少文件：\n${missingFiles.join('\n')}`);
    const translationDir = path.join(root, 'Translation');
    const translationFiles = TRANSLATION_LANGS.map((lang) => path.join(translationDir, `${lang}.json`));
    const missingTranslationFiles = translationFiles.filter((file) => !fs.existsSync(file));
    if (missingTranslationFiles.length) throw new Error(`缺少翻译文件：\n${missingTranslationFiles.join('\n')}`);
    const translations = Object.fromEntries(TRANSLATION_LANGS.map((lang, index) => [lang, JSON.parse(fs.readFileSync(translationFiles[index], 'utf8'))]));

    let translationCount = 0;
    if (validateLocales) {
        const collected = {};
        for (const lang of TRANSLATION_LANGS) for (const [key, value] of Object.entries(translations[lang])) {
            collected[key] = collected[key] || {};
            collected[key][lang] = value;
        }
        const missing = [];
        for (const key in collected) {
            for (const lang of REQUIRED_LANGS) {
                if (!(lang in collected[key]) || collected[key][lang] == null) missing.push(`${key}@${lang}`);
            }
        }
        if (missing.length) throw new Error(`翻译缺失：\n${missing.join('\n')}`);
        translationCount = Object.keys(collected).length;
    }

    const localeSource = TRANSLATION_LANGS.map((lang) =>
        `QiActI18n.registerLocale(${JSON.stringify(lang)}, ${JSON.stringify(translations[lang])});`
    ).join('\n');
    const source = COMPAT_SOURCE_FILES.map((file) => {
        const body = fs.readFileSync(path.join(srcDir, file), 'utf8');
        return `/* === ${file} === */\n${body}${file === 'i18n/runtime.js' ? `\n\n/* === Translation/*.json === */\n${localeSource}` : ''}`;
    }).join('\n\n');
    const headerMatch = source.match(/\/\/ ==UserScript==[\s\S]*?\/\/ ==\/UserScript==/);
    if (!headerMatch) throw new Error('未找到 UserScript 元数据头');
    const header = headerMatch[0];
    const runtimeSource = source.replace(header, '');
    const versionMatch = source.match(/const VERSION\s*=\s*'([^']+)'/);

    return {
        files: COMPAT_SOURCE_FILES.slice(),
        header,
        runtimeSource,
        translationCount,
        version: versionMatch ? versionMatch[1] : '0.0.0',
    };
}
