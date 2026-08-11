// ─────────────────────────────────────────────────────────────────────────────
// QiAct 多语言运行时（i18n）
// 设计：对齐 liko 上游框架 window.Liko.__Sys_i18n__.register(ns, dict)，
//       但翻译字典在「构建期内联」进单文件（而非运行时动态 import），
//       更适配本插件「拼接成单文件 + GitHub Pages」的发布模型。
//
// 安全铁律：
//   1) QiActT() 永不抛错——任何异常都降级为 key（英文），绝不中断业务逻辑。
//   2) 引擎自身零依赖 BC 就绪：即使 BC 全局未加载，resolveLang() 也安全回退 EN。
//   3) 字典缺失某语言 → 回退 EN → 再缺失 → 回退 key，显示永远不空白、不崩。
//
// 调用约定：各模块使用全局 QiActT('命名空间.键', {var}) 取译文。
// ─────────────────────────────────────────────────────────────────────────────
(function () {
    'use strict';

    // 支持语言（顺序无关；兜底固定走 EN）
    var LANGS = ['TW', 'CN', 'EN', 'JA', 'KO', 'VI', 'DE', 'FR', 'ES', 'RU', 'UA'];
    // 构建至少要求简中与英文齐全；其他语言缺值时统一回退英文。
    var REQUIRED = ['CN', 'EN', 'TW'];
    // 语言原生名（用于下拉菜单展示，不随界面语言翻译）
    var LANG_META = {
        auto: { code: 'A', native: 'Auto' },
        TW: { code: 'TW', native: '繁體中文' },
        CN: { code: 'CN', native: '简体中文' },
        EN: { code: 'EN', native: 'English' },
        JA: { code: 'JA', native: '日本語' },
        KO: { code: 'KO', native: '한국어' },
        VI: { code: 'VI', native: 'Tiếng Việt' },
        DE: { code: 'DE', native: 'Deutsch' },
        FR: { code: 'FR', native: 'Français' },
        ES: { code: 'ES', native: 'Español' },
        RU: { code: 'RU', native: 'Русский' },
        UA: { code: 'UA', native: 'Українська' }
    };

    // 扁平字典：'ns.key' -> { 语言码: 译文 }
    var DICT = {};

    // 注册某命名空间的字典（照搬 liko 的 register 范式）
    function register(ns, dict) {
        if (!dict || typeof dict !== 'object') return;
        for (var k in dict) {
            if (!Object.prototype.hasOwnProperty.call(dict, k)) continue;
            DICT[ns + '.' + k] = dict[k];
        }
    }

    // 根目录 Translation/<语言>.json 由构建器转换成此调用并内联。
    function registerLocale(lang, dictionary) {
        if (!lang || !dictionary || typeof dictionary !== 'object') return;
        for (var key in dictionary) {
            if (!Object.prototype.hasOwnProperty.call(dictionary, key)) continue;
            DICT[key] = DICT[key] || {};
            DICT[key][lang] = dictionary[key];
        }
    }

    // 解析当前语言：手动覆盖(localStorage) > BC TranslationLanguage(auto) > 浏览器 > EN
    function resolveLang() {
        try {
            var ov = null;
            try { ov = localStorage.getItem('QiActLang'); } catch (e) { /* localStorage 不可用：跳过 */ }
            if (ov && ov !== 'auto' && LANGS.indexOf(ov) >= 0) return ov;
            // auto：跟随 BC 游戏语言（与 liko 一致）
            var bc = (typeof TranslationLanguage !== 'undefined' && TranslationLanguage)
                ? String(TranslationLanguage).toUpperCase() : '';
            if (bc === 'JP') bc = 'JA';
            if (bc === 'KR') bc = 'KO';
            if (bc === 'VN') bc = 'VI';
            if (LANGS.indexOf(bc) >= 0) return bc;
            // 回退浏览器语言
            var nav = (typeof navigator !== 'undefined' && navigator.language)
                ? navigator.language.toUpperCase() : 'EN';
            if (nav.indexOf('ZH') === 0) return nav.indexOf('TW') >= 0 ? 'TW' : 'CN';
            if (nav.indexOf('DE') === 0) return 'DE';
            if (nav.indexOf('FR') === 0) return 'FR';
            if (nav.indexOf('JA') === 0) return 'JA';
            if (nav.indexOf('KO') === 0) return 'KO';
            if (nav.indexOf('VI') === 0) return 'VI';
            if (nav.indexOf('ES') === 0) return 'ES';
            if (nav.indexOf('RU') === 0) return 'RU';
            if (nav.indexOf('UK') === 0) return 'UA';
            return 'EN';
        } catch (e) { return 'EN'; }
    }

    // 永不抛错的翻译函数
    function QiActT(key, vars) {
        try {
            if (key == null) return '';
            var entry = DICT[key];
            if (!entry || typeof entry !== 'object') return String(key);
            var lang = resolveLang();
            var val = entry[lang];
            // 兜底链：请求语言缺失时，TW 优先回退 CN（同为中文），其余语言回退 EN
            if (val == null) {
                if (lang === 'TW' && entry['CN'] != null) val = entry['CN'];
                else val = entry['EN'];
            }
            if (val == null) val = key;
            if (vars && typeof vars === 'object') {
                for (var v in vars) {
                    if (!Object.prototype.hasOwnProperty.call(vars, v)) continue;
                    var rep = (vars[v] == null) ? '' : String(vars[v]);
                    val = String(val).split('{' + v + '}').join(rep);
                }
            }
            return (val == null) ? String(key) : String(val);
        } catch (e) {
            return (key == null) ? '' : String(key);
        }
    }

    // 手动设置语言（设置面板调用）：'auto' 或具体语言码；写入 localStorage
    function setLang(code) {
        try {
            if (!code || code === 'auto') { try { localStorage.removeItem('QiActLang'); } catch (e) {} }
            else localStorage.setItem('QiActLang', code);
        } catch (e) { /* 忽略：存储不可用时保持 auto */ }
    }

    // 暴露全局 API
    window.QiActI18n = {
        register: register,
        registerLocale: registerLocale,
        t: QiActT,
        getCurrentLang: resolveLang,
        setLang: setLang,
        LANGS: LANGS.slice(),
        REQUIRED: REQUIRED.slice(),
        LANG_META: LANG_META
    };
    // 全局便捷函数（唯一命名，避免与 BC/其他 mod 的全局 t 冲突）
    window.QiActT = QiActT;
})();
