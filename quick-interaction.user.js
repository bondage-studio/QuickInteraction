// ==UserScript==
// @name         快捷互动 (QiAct)
// @name:zh      快捷互动
// @namespace    https://github.com/bondage-studio/QuickInteraction
// @version      1.3.2
// @description  Bondage Club - 统一动作操作台。一键进入动作模式，在聊天室场景内直接点人物部位选动作，绕过原生5步嵌套菜单。
// @author       Tao MUSE
// @homepageURL  https://github.com/bondage-studio/QuickInteraction
// @updateURL    https://github.com/bondage-studio/QuickInteraction/raw/main/quick-interaction.user.js
// @downloadURL  https://github.com/bondage-studio/QuickInteraction/raw/main/quick-interaction.user.js
// @include      /^https:\/\/(www\.)?bondage(projects\.elementfx|-(europe|asia))\.com\/.*/
// @grant        none
// @run-at       document-end
// ==/UserScript==

/* === 内联 bcModSdk (Bondage Club Mod SDK 1.2.0) — 自包含，无外部 @require 依赖 === */
// Bondage Club Mod Development Kit (1.2.0)
// For more info see: https://github.com/Jomshir98/bondage-club-mod-sdk
/** @type {ModSDKGlobalAPI} */
var bcModSdk=function(){"use strict";const o="1.2.0";function e(o){alert("Mod ERROR:\n"+o);const e=new Error(o);throw console.error(e),e}const t=new TextEncoder;function n(o){return!!o&&"object"==typeof o&&!Array.isArray(o)}function r(o){const e=new Set;return o.filter((o=>!e.has(o)&&e.add(o)))}const i=new Map,a=new Set;function c(o){a.has(o)||(a.add(o),console.warn(o))}function s(o){const e=[],t=new Map,n=new Set;for(const r of f.values()){const i=r.patching.get(o.name);if(i){e.push(...i.hooks);for(const[e,a]of i.patches.entries())t.has(e)&&t.get(e)!==a&&c(`ModSDK: Mod '${r.name}' is patching function ${o.name} with same pattern that is already applied by different mod, but with different pattern:\nPattern:\n${e}\nPatch1:\n${t.get(e)||""}\nPatch2:\n${a}`),t.set(e,a),n.add(r.name)}}e.sort(((o,e)=>e.priority-o.priority));const r=function(o,e){if(0===e.size)return o;let t=o.toString().replaceAll("\r\n","\n");for(const[n,r]of e.entries())t.includes(n)||c(`ModSDK: Patching ${o.name}: Patch ${n} not applied`),t=t.replaceAll(n,r);return(0,eval)(`(${t})`)}(o.original,t);let i=function(e){var t,i;const a=null===(i=(t=m.errorReporterHooks).hookChainExit)||void 0===i?void 0:i.call(t,o.name,n),c=r.apply(this,e);return null==a||a(),c};for(let t=e.length-1;t>=0;t--){const n=e[t],r=i;i=function(e){var t,i;const a=null===(i=(t=m.errorReporterHooks).hookEnter)||void 0===i?void 0:i.call(t,o.name,n.mod),c=n.hook.apply(this,[e,o=>{if(1!==arguments.length||!Array.isArray(e))throw new Error(`Mod ${n.mod} failed to call next hook: Expected args to be array, got ${typeof o}`);return r.call(this,o)}]);return null==a||a(),c}}return{hooks:e,patches:t,patchesSources:n,enter:i,final:r}}function l(o,e=!1){let r=i.get(o);if(r)e&&(r.precomputed=s(r));else{let e=window;const a=o.split(".");for(let t=0;t<a.length-1;t++)if(e=e[a[t]],!n(e))throw new Error(`ModSDK: Function ${o} to be patched not found; ${a.slice(0,t+1).join(".")} is not object`);const c=e[a[a.length-1]];if("function"!=typeof c)throw new Error(`ModSDK: Function ${o} to be patched not found`);const l=function(o){let e=-1;for(const n of t.encode(o)){let o=255&(e^n);for(let e=0;e<8;e++)o=1&o?-306674912^o>>>1:o>>>1;e=e>>>8^o}return((-1^e)>>>0).toString(16).padStart(8,"0").toUpperCase()}(c.toString().replaceAll("\r\n","\n")),d={name:o,original:c,originalHash:l};r=Object.assign(Object.assign({},d),{precomputed:s(d),router:()=>{},context:e,contextProperty:a[a.length-1]}),r.router=function(o){return function(...e){return o.precomputed.enter.apply(this,[e])}}(r),i.set(o,r),e[r.contextProperty]=r.router}return r}function d(){for(const o of i.values())o.precomputed=s(o)}function p(){const o=new Map;for(const[e,t]of i)o.set(e,{name:e,original:t.original,originalHash:t.originalHash,sdkEntrypoint:t.router,currentEntrypoint:t.context[t.contextProperty],hookedByMods:r(t.precomputed.hooks.map((o=>o.mod))),patchedByMods:Array.from(t.precomputed.patchesSources)});return o}const f=new Map;function u(o){f.get(o.name)!==o&&e(`Failed to unload mod '${o.name}': Not registered`),f.delete(o.name),o.loaded=!1,d()}function g(o,t){o&&"object"==typeof o||e("Failed to register mod: Expected info object, got "+typeof o),"string"==typeof o.name&&o.name||e("Failed to register mod: Expected name to be non-empty string, got "+typeof o.name);let r=`'${o.name}'`;"string"==typeof o.fullName&&o.fullName||e(`Failed to register mod ${r}: Expected fullName to be non-empty string, got ${typeof o.fullName}`),r=`'${o.fullName} (${o.name})'`,"string"!=typeof o.version&&e(`Failed to register mod ${r}: Expected version to be string, got ${typeof o.version}`),o.repository||(o.repository=void 0),void 0!==o.repository&&"string"!=typeof o.repository&&e(`Failed to register mod ${r}: Expected repository to be undefined or string, got ${typeof o.version}`),null==t&&(t={}),t&&"object"==typeof t||e(`Failed to register mod ${r}: Expected options to be undefined or object, got ${typeof t}`);const i=!0===t.allowReplace,a=f.get(o.name);a&&(a.allowReplace&&i||e(`Refusing to load mod ${r}: it is already loaded and doesn't allow being replaced.\nWas the mod loaded multiple times?`),u(a));const c=o=>{let e=g.patching.get(o.name);return e||(e={hooks:[],patches:new Map},g.patching.set(o.name,e)),e},s=(o,t)=>(...n)=>{var i,a;const c=null===(a=(i=m.errorReporterHooks).apiEndpointEnter)||void 0===a?void 0:a.call(i,o,g.name);g.loaded||e(`Mod ${r} attempted to call SDK function after being unloaded`);const s=t(...n);return null==c||c(),s},p={unload:s("unload",(()=>u(g))),hookFunction:s("hookFunction",((o,t,n)=>{"string"==typeof o&&o||e(`Mod ${r} failed to patch a function: Expected function name string, got ${typeof o}`);const i=l(o),a=c(i);"number"!=typeof t&&e(`Mod ${r} failed to hook function '${o}': Expected priority number, got ${typeof t}`),"function"!=typeof n&&e(`Mod ${r} failed to hook function '${o}': Expected hook function, got ${typeof n}`);const s={mod:g.name,priority:t,hook:n};return a.hooks.push(s),d(),()=>{const o=a.hooks.indexOf(s);o>=0&&(a.hooks.splice(o,1),d())}})),patchFunction:s("patchFunction",((o,t)=>{"string"==typeof o&&o||e(`Mod ${r} failed to patch a function: Expected function name string, got ${typeof o}`);const i=l(o),a=c(i);n(t)||e(`Mod ${r} failed to patch function '${o}': Expected patches object, got ${typeof t}`);for(const[n,i]of Object.entries(t))"string"==typeof i?a.patches.set(n,i):null===i?a.patches.delete(n):e(`Mod ${r} failed to patch function '${o}': Invalid format of patch '${n}'`);d()})),removePatches:s("removePatches",(o=>{"string"==typeof o&&o||e(`Mod ${r} failed to patch a function: Expected function name string, got ${typeof o}`);const t=l(o);c(t).patches.clear(),d()})),callOriginal:s("callOriginal",((o,t,n)=>{"string"==typeof o&&o||e(`Mod ${r} failed to call a function: Expected function name string, got ${typeof o}`);const i=l(o);return Array.isArray(t)||e(`Mod ${r} failed to call a function: Expected args array, got ${typeof t}`),i.original.apply(null!=n?n:globalThis,t)})),getOriginalHash:s("getOriginalHash",(o=>{"string"==typeof o&&o||e(`Mod ${r} failed to get hash: Expected function name string, got ${typeof o}`);return l(o).originalHash}))},g={name:o.name,fullName:o.fullName,version:o.version,repository:o.repository,allowReplace:i,api:p,loaded:!0,patching:new Map};return f.set(o.name,g),Object.freeze(p)}function h(){const o=[];for(const e of f.values())o.push({name:e.name,fullName:e.fullName,version:e.version,repository:e.repository});return o}let m;const y=void 0===window.bcModSdk?window.bcModSdk=function(){const e={version:o,apiVersion:1,registerMod:g,getModsInfo:h,getPatchingInfo:p,errorReporterHooks:Object.seal({apiEndpointEnter:null,hookEnter:null,hookChainExit:null})};return m=e,Object.freeze(e)}():(n(window.bcModSdk)||e("Failed to init Mod SDK: Name already in use"),1!==window.bcModSdk.apiVersion&&e(`Failed to init Mod SDK: Different version already loaded ('1.2.0' vs '${window.bcModSdk.version}')`),window.bcModSdk.version!==o&&alert(`Mod SDK warning: Loading different but compatible versions ('1.2.0' vs '${window.bcModSdk.version}')\nOne of mods you are using is using an old version of SDK. It will work for now but please inform author to update`),window.bcModSdk);return"undefined"!=typeof exports&&(Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=y),y}();


(function () {
    'use strict';

    // ════════════════════════════════════════════════════════════════════════
    // 防重复加载
    // ════════════════════════════════════════════════════════════════════════
    if (window.__QiAct_Loaded__) {
        console.warn('[QiAct] 已加载，跳过');
        return;
    }
    window.__QiAct_Loaded__ = true;

    // ════════════════════════════════════════════════════════════════════════
    // 调试开关与日志封装
    // 发布版设 DEBUG = false，所有 logD 静默；仅 console.warn/error 用于真实异常。
    // 排障时临时改 DEBUG = true 即可恢复全部内部日志。
    // ════════════════════════════════════════════════════════════════════════
    /* ===== 1. 常量与配置（DEBUG / 版本 / 存储键 / 主题键） ===== */
    const DEBUG = false;
    function logD() {
        if (!DEBUG) return;
        var args = ['[QiAct]'];
        for (var i = 0; i < arguments.length; i++) args.push(arguments[i]);
        console.log.apply(console, args);
    }

    // 错误处理辅助（收口空 catch 红线）
    // 每帧 hook 异常节流上报，避免静默藏 bug；单会话每函数最多报 3 次
    const _hookErrSeen = {};
    function reportHookError(name, e) {
        if (_hookErrSeen[name] >= 3) return;
        _hookErrSeen[name] = (_hookErrSeen[name] || 0) + 1;
        console.warn('[QiAct] hook『' + name + '』异常（已忽略，最多报 3 次）:', e && e.message);
    }
    // 服务器设置同步失败：必须可见 + 至少一次 toast（数据静默丢失红线）
    let _serverSyncWarned = false;
    function warnServerSync(e) {
        console.warn('[QiAct] 服务器设置同步失败，已回退本地存储:', e);
        if (!_serverSyncWarned) { _serverSyncWarned = true; toast('设置同步到服务器失败，已保留在本地', '#FF5C5C'); }
    }

    // 通用空 catch 收口：debug 态才节流打日志，生产静默但不丢上下文。
    // 取代散落的 `catch (e) {}` / `catch (_) {}` — 满足「禁空 catch / 禁静默吞错」红线，
    // 同时生产环境零 console 输出。用法：try { ... } catch (e) { silent(e, 'contextTag'); }
    const _silentSeen = {};
    function silent(e, ctx) {
        if (!DEBUG) return;
        const key = ctx || (e && e.message) || 'silent';
        if (!_silentSeen[key]) _silentSeen[key] = 0;
        if (_silentSeen[key] < 3) {
            _silentSeen[key]++;
            console.warn('[QiAct]' + (ctx ? ' ' + ctx + ':' : '') + (e && e.stack ? '\n' + e.stack : (e ? ' ' + e : '')));
        }
    }

    const VERSION = '1.3.2';

    // ── 存储键 ──
    const S_ENABLED = 'xsact_qa_enabled';
    const S_FAVS = 'xsact_qa_favorites';
    const S_PRESETS = 'xsact_qa_presets';
    const S_LAST = 'xsact_qa_last_action';
    const S_COMBOS = 'xsact_qa_combos';
    const S_CUSTOM = 'xsact_qa_custom_actions';
    const S_POS = 'xsact_qa_panel_pos';
    const S_SIZE = 'xsact_qa_panel_size';
    const S_MODE = 'xsact_qa_panel_mode';
    const S_SELF = 'xsact_qa_self_mode';
    const S_TOGGLE_POS = 'xsact_qa_toggle_pos';
    const S_UPDATE_DISMISSED = 'xsact_qa_update_dismissed';
    const S_LAST_ANNOUNCE = 'xsact_qa_last_announce';
    const S_LAST_ANNOUNCE_VER = 'xsact_qa_last_announce_ver'; // 公告去重：记录上次见到公告时的版本号
    const S_LAST_SEEN_VERSION = 'xsact_qa_last_seen_version'; // 已安装版本：用于「更新成功」一次性通知
    const S_UPDATE_ERROR_LOG = 'xsact_qa_update_errlog';      // 更新检测失败的结构化错误日志（最近 10 条）
    const S_ECHO_SUPPRESS = 'xsact_qa_echo_suppressed'; // 已导入并屏蔽的 echo 原始动作名
    const S_XIAOSU_PACK = 'xsact_qa_xiaosu_pack'; // 是否启用内置「小酥动作包」（预编译进插件，离线可用）
    const S_CA_FILTER = 'xsact_qa_ca_filter'; // 「我的动作」分类 chip：'all' | 'xiaosu' | 'native' | 'echo'

    // ── 集中状态（单一数据源，消除散落全局变量）──
    const state = {
        modApi: null,                 // bcModSdk 注册句柄
        isActive: false,              // 动作模式是否激活
        theme: 'dark',                // 当前主题 id（dark | light）
        selectedTarget: null,         // 当前选中目标 Character
        selectedPart: null,           // 当前选中部位 ItemGroup
        selectedAction: null,         // 当前选中动作名
        selectedActionItem: null,     // 当前选中动作绑定的道具
        panelMode: 'part',            // 'part'=单部位 | 'combo'=自定义组合
        charListOpen: false,          // 人物列表弹出层是否打开
        popoverView: 'chars',         // 人物浮层当前视图：'chars' 人物列表 | 'parts' 部位选择
        allModeActive: false,         // 全员范围开关
        favModeActive: false,         // 收藏模式开关
        selfModeActive: false,        // 自己模式开关
        combos: [],                   // 自定义组合
        editingComboId: null,         // 正在编辑的组合 id
        customActions: [],            // 自定义动作（QiAct 自包含版，替代 echo/回声）
        echoSuppressed: new Set(),    // 已导入的 echo 原始动作名（屏蔽用）
        echoPrefixes: new Set(),     // 已导入 echo 动作的中文显示前缀（安全前缀兜底，仅匹配 echo 命名空间，不误伤 BC 原生动作）
        xiaosuPack: true,            // 是否启用内置「小酥动作包」（预编译进插件，离线可用，默认开）
        editingCustomId: null,        // 正在编辑的自定义动作 id
        caEditMode: false,           // 自定义动作「编辑模式」（拖动排序/批量管理）
        caSelected: [],              // 编辑模式下选中的自定义动作 id 列表
        caDragId: null,              // 拖动排序中正在拖拽的 id
        caFilter: 'all',             // 「我的动作」分类 chip 过滤：'all' | 'xiaosu' | 'native' | 'echo'
        favorites: [],                // 收藏复合键数组：格式 "部位Group|动作名"（如 "ItemMouth|Caress"）
        presets: [],                  // 预留预设
        lastAction: null,             // 上次执行的动作
        toggleBtnDrawn: false,        // 浮动开关是否已绘制
        pendingBanner: null,         // 面板未打开时暂存的公告/更新横幅
        updateTimer: null,           // 更新检测轮询定时器
        // ── UI / 渲染缓存 ──
        actionPanelEl: null,          // 右侧面板 DOM
        bodyGrids: new Map(),         // Character -> 身体线框元素
        toggleBtnEl: null,            // 浮动开关 DOM
        charAnchor: {},               // 角色真实绘制坐标 {MN:{x,y,zoom,t}}
        cachedRect: null,             // 画布屏幕矩形缓存
        cachedScaleX: 1,
        cachedScaleY: 1,
        refreshInterval: null,        // 线框刷新定时器
        lastLayoutCount: 0,           // 上次布局角色数
        toggleDragged: false          // 本次按下闪电按钮是否已拖动
    };

    // ════════════════════════════════════════════════════════════════════════
    // 部位定义（BC Target_Group 映射）
    // ════════════════════════════════════════════════════════════════════════
    const BODY_PARTS = [
        { group: 'ItemHead', label: '头', icon: '🗣' },
        { group: 'ItemNose', label: '鼻', icon: '👃' },
        { group: 'ItemEars', label: '耳', icon: '👂' },
        { group: 'ItemHood', label: '头套', icon: '🎭' },
        { group: 'ItemMouth', label: '口', icon: '👄' },
        { group: 'ItemMouth2', label: '口2', icon: '👄' },
        { group: 'ItemMouth3', label: '口3', icon: '👄' },
        { group: 'ItemNeck', label: '颈', icon: '🔗' },
        { group: 'ItemNeckAccessories', label: '颈饰', icon: '🔗' },
        { group: 'ItemNeckRestraints', label: '颈束', icon: '🔗' },
        { group: 'ItemNipples', label: '乳', icon: '☁' },
        { group: 'ItemNipplesPiercings', label: '乳穿', icon: '💎' },
        { group: 'ItemBreast', label: '胸', icon: '🫂' },
        { group: 'ItemTorso', label: '躯干', icon: '👕' },
        { group: 'ItemTorso2', label: '腹', icon: '👕' },
        { group: 'ItemArms', label: '手臂', icon: '💪' },
        { group: 'ItemHands', label: '手', icon: '✋' },
        { group: 'ItemPelvis', label: '腰臀', icon: '〰' },
        { group: 'ItemVulva', label: '私处', icon: '🌸' },
        { group: 'ItemVulvaPiercings', label: '阴穿', icon: '💎' },
        { group: 'ItemButt', label: '臀后', icon: '🍑' },
        { group: 'ItemLegs', label: '腿', icon: '🦵' },
        { group: 'ItemFeet', label: '脚', icon: '👢' },
        { group: 'ItemBoots', label: '靴', icon: '🥾' },
    ];

    // 合成子部位 → 字典翻译主部位映射（BC 字典键只以主部位命名，如 ItemMouth2 查 Label-ChatOther-ItemMouth-*）
    const SUBPART_TO_BASE = {
        'ItemMouth2': 'ItemMouth',
        'ItemMouth3': 'ItemMouth',
        'ItemNeckAccessories': 'ItemNeck',
        'ItemNeckRestraints': 'ItemNeck',
        'ItemNipplesPiercings': 'ItemNipples',
        'ItemTorso2': 'ItemTorso'
    };

    // ════════════════════════════════════════════════════════════════════════
    // 部位线框 —— 直接采用 BC 原生 AssetGroup[].Zone 矩形（角色本地 500×1000 空间）
    // 这是 BC 自己定位「点身体选部位」的真值坐标（见 BondageClub/Scripts/Dialog.js
    // DialogClickedInZone / DialogGetCharacterZone），解剖正确且互不重叠。
    // 每个部位可能有多个 Zone（如双臂/双手分左右），每个 Zone 生成一个可点击热区。
    // ════════════════════════════════════════════════════════════════════════

    // 角色本地包围盒（asset 坐标系 500×1000，覆盖整具身体）
    const BODY_AX0 = 0, BODY_AX1 = 500;   // 水平 [0,500]
    const BODY_AY0 = 0, BODY_AY1 = 1000;  // 垂直 [0,1000]

    // 固定线框高度：所有角色统一用 asset 1000 高度，不随站起/蹲下/身高变化。
    // 底部锚定在角色脚底（BODY_AY1=1000），向上延伸，避免上排角色蹲下时压到下排。
    const GRID_FIXED_HEIGHT = 1000;

    // 缓存：family|group -> Zone 矩形数组 [[X,Y,W,H], ...]
    var _zoneCache = {};
    /* ===== 2. 工具函数（waitFor / Zone 提取 / 坐标换算） ===== */
    function getPartZones(C, groupName) {
        var family = (C && C.AssetFamily) || (typeof Player !== 'undefined' && Player.AssetFamily) || 'Female3DCG';
        var key = family + '|' + groupName;
        if (_zoneCache[key]) return _zoneCache[key];
        var zones = null;
        try {
            if (typeof AssetGroupGet === 'function') {
                var grp = AssetGroupGet(family, groupName);
                if (grp && Array.isArray(grp.Zone) && grp.Zone.length) {
                    zones = grp.Zone.map(function(z) { return [z[0], z[1], z[2], z[3]]; });
                }
            }
        } catch (e) { zones = null; }
        // 回退：极少数部位在 AssetGroup 里没有 Zone 时，按 BODY_PARTS 均分（几乎不会触发）
        if (!zones) {
            var i = -1;
            for (var k = 0; k < BODY_PARTS.length; k++) { if (BODY_PARTS[k].group === groupName) { i = k; break; } }
            if (i < 0) i = 0;
            zones = [[BODY_AX0, (i / BODY_PARTS.length) * BODY_AY1,
                      BODY_AX1 - BODY_AX0, BODY_AY1 / BODY_PARTS.length]];
        }
        _zoneCache[key] = zones;
        return zones;
    }

    // ════════════════════════════════════════════════════════════════════════
    // 工具函数
    // ════════════════════════════════════════════════════════════════════════
    function waitFor(fn, timeout) {
        timeout = timeout || 120000;
        return new Promise((resolve, reject) => {
            const start = Date.now();
            const check = () => {
                try {
                    if (fn()) resolve(true);
                    else if (Date.now() - start > timeout) reject(new Error('waitFor timeout'));
                    else setTimeout(check, 100);
                } catch (e) {
                    if (Date.now() - start > timeout) reject(e);
                    else setTimeout(check, 100);
                }
            };
            check();
        });
    }

    /* ===== 3. 存储层（localStorage + 服务器 OnlineSettings） ===== */
    function loadStorage(key, fallback) {
        try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
        catch (e) { console.error('[QiAct] 读取存储失败 ' + key + ':', e); return fallback; }
    }
    // 安全序列化：遇到循环引用时跳過（用 [Circular] 占位），避免保存直接抛错丢数据。
    // 同时尽力在二次报错里打印出循环路径，方便定位真实根因（正常扁平数据不受影响）。
    function safeStringify(val) {
        var seen = new WeakSet();
        return JSON.stringify(val, function(key, value) {
            if (typeof value === 'object' && value !== null) {
                if (seen.has(value)) return '[Circular]';
                seen.add(value);
            }
            return value;
        });
    }
    function saveStorage(key, val) {
        try { localStorage.setItem(key, JSON.stringify(val)); }
        catch (e) {
            console.error('[QiAct] 写入存储失败 ' + key + ':', e);
            try {
                if (typeof val === 'object' && val) {
                    console.error('  keys=', Object.keys(val).join(','), 'types=', Object.keys(val).map(function(k){ return typeof val[k]; }).join(','));
                }
            } catch (_) { console.warn('[QiAct] 诊断存储值结构失败（已忽略）:', _ && _.message); }
            // 二次兜底：跳过循环引用，保证数据尽量落盘，绝不让存储写入中断业务流程
            try { localStorage.setItem(key, safeStringify(val)); console.warn('[QiAct] 已用安全序列化兜底写入 ' + key + '（跳过循环引用）'); }
            catch (e2) { console.error('[QiAct] 安全兜底仍失败 ' + key + ':', e2); }
        }
    }

    // ── 主题 / 设置键 ──
    const S_THEME = 'xsact_qa_theme';
    const MOD_NS  = 'QiAct';

    // 主题定义：仅保留深色 / 浅色两套，强调色固定玫红
    const THEMES = [
        { id:'dark',  name:'深色', base:'dark' },
        { id:'light', name:'浅色', base:'light' }
    ];
    function getTheme(id) {
        for (var i = 0; i < THEMES.length; i++) if (THEMES[i].id === id) return THEMES[i];
        return THEMES[0];
    }

    // ── 服务器（游戏账号）持久化：写入 Player.OnlineSettings.ExtensionSettings ──
    // 注意：BC 的 ServerAccountUpdate 是 AccountUpdater 实例，不是函数；
    // 正确同步方式是 ServerAccountUpdate.QueueData({ OnlineSettings: Player.OnlineSettings })，
    // 其内部自带 ~2s 防抖合并，且未登录（CharacterID===""）时自动跳过。
    function getServerStore() {
        try {
            if (typeof Player === 'undefined' || !Player.OnlineSettings) return null;
            if (!Player.OnlineSettings.ExtensionSettings) Player.OnlineSettings.ExtensionSettings = {};
            if (!Player.OnlineSettings.ExtensionSettings[MOD_NS]) Player.OnlineSettings.ExtensionSettings[MOD_NS] = {};
            return Player.OnlineSettings.ExtensionSettings[MOD_NS];
        } catch (e) { return null; }
    }
    function saveToServer(key, val) {
        var store = getServerStore();
        if (!store) return; // 玩家未登录或无法访问账号：仅落 localStorage（persist 已做）
        store[key] = val;
        try {
            if (typeof ServerAccountUpdate !== 'undefined' && ServerAccountUpdate && typeof ServerAccountUpdate.QueueData === 'function') {
                ServerAccountUpdate.QueueData({ OnlineSettings: Player.OnlineSettings });
            }
        } catch (e) { warnServerSync(e); }
    }
    function loadFromServer(key, fallback) {
        var store = getServerStore();
        if (!store || !(key in store)) return fallback;
        return store[key];
    }
    // 统一持久化：本地 + 服务器（服务器优先回读，跨设备生效）
    function persist(key, val) {
        saveStorage(key, val);
        saveToServer(key, val);
    }
    function loadSetting(key, fallback) {
        try {
            var s = loadFromServer(key, undefined);
            if (s !== undefined) return s;
            return loadStorage(key, fallback);
        } catch (e) {
            console.error('[QiAct] 读取设置失败 ' + key + ':', e);
            return fallback;
        }
    }

    /** 收藏数据迁移：旧版 favorites 为纯动作名数组（不区分部位），升级为「部位Group|动作名」复合键。
     *  迁移策略：将遗留裸名展开到玩家当前所有包含该动作的部位，一次性持久化，避免静默丢失收藏。 */
    function migrateFavorites() {
        if (!Array.isArray(state.favorites)) { state.favorites = []; return; }
        var needMigrate = state.favorites.some(function(f) {
            return typeof f === 'string' && f.indexOf('|') === -1;
        });
        if (!needMigrate) return;
        var groups = BODY_PARTS.map(function(p) { return p.group; });
        var out = [];
        state.favorites.forEach(function(f) {
            if (typeof f !== 'string') return;
            if (f.indexOf('|') !== -1) { out.push(f); return; } // 已是新格式
            var name = f;
            var expanded = false;
            if (typeof ActivityAllowedForGroup === 'function' && Player) {
                groups.forEach(function(g) {
                    try {
                        var acts = ActivityAllowedForGroup(Player, g);
                        if (acts.some(function(a) { return a.Activity && a.Activity.Name === name; })) {
                            out.push(g + '|' + name);
                            expanded = true;
                        }
                    } catch (_) { /* 忽略单个部位枚举失败 */ }
                });
            }
            if (!expanded) out.push(name); // 兜底：无法展开则保留裸名
        });
        state.favorites = out;
        persist(S_FAVS, state.favorites);
    }

    // ── 主题应用 ──
    /* ===== 4. 主题系统 ===== */
    function applyTheme(themeId) {
        var t = getTheme(themeId);
        state.theme = t.id;
        document.documentElement.setAttribute('data-xsact-theme', t.id);
    }
    function toggleTheme() {
        var next = (state.theme === 'dark') ? 'light' : 'dark';
        applyTheme(next);
        persist(S_THEME, next);
        toast('已切换为' + (next === 'dark' ? '深色' : '浅色') + '主题', accentColor());
    }

    /** 获取动作列表（按部位过滤 + 前置条件实时校验） */
    /**
     * 获取指定部位「当前可执行的」动作列表（实时）。
     * 主数据源：BC 原生 ActivityAllowedForGroup(C, Group) — 返回该角色在指定部位
     * 此刻能执行的所有动作（含 echo-activity-ext 扩展），权威且不包含前置条件不满足的。
     * 翻译名从 BC_Interactive_Index 或 ActivityDictionaryText 获取。
     * fallback 才用 BC_Interactive_Index / ActivityFemale3DCG 全量列表。
     */
    /* ===== 5. 动作解析与发包（核心业务） ===== */


    function getActionsForPart(partGroup, targetChar) {
        targetChar = targetChar || state.selectedTarget;
        var actions = [];

        // ── 方案 A（推荐）：BC 原生实时可用列表 ──
        if (targetChar && typeof ActivityAllowedForGroup === 'function') {
            try {
                var allowed = ActivityAllowedForGroup(targetChar, partGroup);
                if (Array.isArray(allowed) && allowed.length > 0) {
                    actions = allowed.map(function(a) {
                        if (!a) return null;
                        var name = a.Activity ? (a.Activity.Name || '') : (a.Name || '');
                        return { Name: name, translatedName: getActivityLabelFallback(name, partGroup), Item: a.Item || null };
                    }).filter(function(a) { return a && a.Name; });
                }
            } catch (e) {
                console.warn('[QiAct] ActivityAllowedForGroup 失败，改用全量列表:', e.message);
            }
        }

        // ── 方案 B：BC_Interactive_Index 精选索引（无实时过滤）──
        if (actions.length === 0 && window.BC_Interactive_Index && window.BC_Interactive_Index.Interactive_Index) {
            actions = window.BC_Interactive_Index.Interactive_Index.filter(function(act) {
                return act.Target_Group === partGroup;
            }).map(function(act) {
                return {
                    Name: act.activityName || '',
                    translatedName: act.translatedactivity || act.activityName || '',
                    Item: null
                };
            });
        }

        // ── 方案 C：fallback 从 ActivityFemale3DCG 原始数组构建 ──
        if (actions.length === 0 && window.ActivityFemale3DCG) {
            var raw = window.ActivityFemale3DCG.filter(function(a) {
                if (!a.Name || !a.Target) return false;
                var targets = Array.isArray(a.Target) ? a.Target : [a.Target];
                if (targets.indexOf(partGroup) !== -1) return true;
                if (a.TargetSelf === true) return targets.indexOf(partGroup) !== -1;
                var selfT = Array.isArray(a.TargetSelf) ? a.TargetSelf : (a.TargetSelf ? [a.TargetSelf] : []);
                return selfT.indexOf(partGroup) !== -1;
            });
            actions = raw.map(function(a) {
                return { Name: a.Name || '', translatedName: getActivityLabelFallback(a.Name, partGroup), Item: null };
            });
        }

        // 去重 + 过滤无效条目 + 过滤真实部位无翻译的（避免聊天消息乱码）
        var seen = {};
        return actions.filter(function(a) {
            if (!a.Name || a.Name.indexOf('MISSING') !== -1 ||
                (a.translatedName && (a.translatedName.indexOf('[STRING_RETRIEVAL_FAILED]') !== -1 ||
                                      a.translatedName.indexOf('MISSING TEXT IN') !== -1 ||
                                      a.translatedName.indexOf('MISSING ACTIVITY') !== -1))) return false;
            if (!shouldKeepAction(a.Name, partGroup)) return false;
            // 屏蔽已导入的 echo 原始动作名（双重兜底：ActivityAllowedForGroup hook 已过滤，
            // 但 fallback 数据源和旧数据可能绕过 hook，这里再强制过滤一次）
            if (state.echoSuppressed && caIsEchoSuppressed(a.Name)) return false;
            // 自定义动作：仅保留标记为可见的
            if (a.Name.indexOf(CA_PREFIX) === 0) {
                var ca = caFindByActivityName(a.Name);
                if (ca && ca.visible === false) return false;
            }
            if (seen[a.Name]) return false;
            seen[a.Name] = true;
            return true;
        });
    }

    /** 获取动作显示名（兼容两种数据源） */
    function getActivityLabel(name, targetGroup) {
        if (!name) return '';
        // 如果动作对象带翻译名就直接用
        if (name.translatedName) return name.translatedName;
        return getActivityLabelFallback(name, targetGroup);
    }

    /** 回退翻译：BC Dictionary 查询或去前缀；同时查 Label-ChatOther 与 Label-ChatSelf
     *  （很多"自我动作"如呻吟/呜咽只有 ChatSelf 标签，不能误删）。 */
    /** BC 字典缺失哨兵检测（覆盖多版本格式）：
     *  - [STRING_RETRIEVAL_FAILED]（旧）
     *  - MISSING ACTIVITY ...（旧）
     *  - MISSING TEXT IN "ActivityDictionary.csv": Label-...（BC 更新后新格式，2026-07 起）
     *  一旦命中即视为「无翻译」，必须回退或丢弃，绝不能当正常文本显示成动作名。 */
    function isMissingLabel(t) {
        if (!t || typeof t !== 'string') return true;
        if (t.indexOf('[STRING_RETRIEVAL_FAILED]') !== -1) return true;
        if (t.indexOf('MISSING ACTIVITY') !== -1) return true;
        if (t.indexOf('MISSING TEXT IN') !== -1) return true;
        return false;
    }

    /**
     * 修补 ActivityDictionaryText：本 BC 版本（R130+）该函数只读 ActivityDictionaryLoad()
     * 返回的 cache 实例，而 LSCG 等 mod 把对话文本写进了全局 ActivityDictionary 数组
     * （或其自身的 cache 实例），导致 ActivityDictionaryText 对 LSCG_ 动作稳定返回
     * "MISSING TEXT IN ..."。这会引发连锁问题：
     *   - 我们 makeActivityPacket 误判 contentKeyMissing → 把 LSCG 动作发成 Action 兜底包，
     *     绕过 LSCG 的 ServerSend hook（仅处理 Type==='Activity'），效果丢失；
     *   - LSCG 自身 hook 里 ActivityDictionaryText(data.Content) 也返回 MISSING，
     *     发送方聊天显示 MISSING。
     * 这里加一层兜底：原函数返回 MISSING 时，回退到 ActivityDictionary 数组精确查找。
     * 仅对 MISSING 结果生效，正常解析原样返回，且数组查找只在 MISSING 时触发，性能开销极低。
     * 幂等：重复调用只打一次补丁。
     */
    function patchActivityDictionaryText() {
        if (window.__QiAct_ADT_PATCHED) return;
        if (typeof window.ActivityDictionaryText !== 'function' || !Array.isArray(window.ActivityDictionary)) return;
        // 优先用 ModSDK hook（BCX 兼容，不会触发 Unknown mod not using ModSDK 警告）
        if (state.modApi && typeof state.modApi.hookFunction === 'function') {
            state.modApi.hookFunction('ActivityDictionaryText', 0, function(args, next) {
                var r = next(args);
                if (r && !isMissingLabel(r)) return r;
                var key = args[0];
                if (typeof key === 'string') {
                    var arr = window.ActivityDictionary;
                    for (var i = 0; i < arr.length; i++) {
                        var e = arr[i];
                        if (Array.isArray(e) && e[0] === key && typeof e[1] === 'string' && !isMissingLabel(e[1])) {
                            return e[1];
                        }
                    }
                }
                return r;
            });
            window.__QiAct_ADT_PATCHED = true;
            logD('[QiAct] 已打 ActivityDictionaryText SDK hook 兜底');
            return;
        }
        // 降级：SDK 不可用时直接覆盖（仅在热注入/异常降级场景触发，可能触发 BCX 警告）
        console.warn('[QiAct] ModSDK hook 不可用，降级为 ActivityDictionaryText 直接覆盖；建议检查是否重复注入');
        var _orig = window.ActivityDictionaryText;
        window.ActivityDictionaryText = function(key) {
            var r = _orig.apply(this, arguments);
            if (r && !isMissingLabel(r)) return r;
            if (typeof key === 'string') {
                var arr = window.ActivityDictionary;
                for (var i = 0; i < arr.length; i++) {
                    var e = arr[i];
                    if (Array.isArray(e) && e[0] === key && typeof e[1] === 'string' && !isMissingLabel(e[1])) {
                        return e[1];
                    }
                }
            }
            return r;
        };
        window.__QiAct_ADT_PATCHED = true;
        logD('[QiAct] 已打 ActivityDictionaryText 直接兜底补丁（SDK 不可用）');
    }

    function getActivityLabelFallback(name, targetGroup) {
        if (!name) return '';
        // 自定义动作：直接返回用户定义的名字，避免显示 CA_xxx 内部 ID
        if (name.indexOf(CA_PREFIX) === 0) {
            var ca = caFindByActivityName(name);
            if (ca) return ca.name;
            return name.substring(CA_PREFIX.length);
        }
        if (typeof window.ActivityDictionaryText !== 'function') {
            if (name.indexOf('XSAct_') === 0) return name.substring(6);
            return name;
        }
        function tryKey(g, prefix) {
            var k = 'Label-' + prefix + '-' + g + '-' + name;
            var t = window.ActivityDictionaryText(k);
            if (!isMissingLabel(t)) return t;
            return null;
        }
        function tryGroup(g) {
            return tryKey(g, 'ChatOther') || tryKey(g, 'ChatSelf');
        }
        var result = tryGroup(targetGroup || '');
        if (result) return result;
        // 合成子部位 fallback 到主部位字典键（BC 仅在主部位注册翻译）
        if (targetGroup && SUBPART_TO_BASE[targetGroup]) {
            result = tryGroup(SUBPART_TO_BASE[targetGroup]);
            if (result) return result;
        }
        // 全部查不到：返回「可读名」而非哨兵串。剥离已知 mod 前缀让列表更干净。
        if (name.indexOf('XSAct_') === 0) return name.substring(6);
        var m = /^([A-Za-z]{2,12})_/.exec(name);
        if (m) return name.substring(m[0].length);
        return name;
    }

    /** 检查某个动作在「真实部位」上是否有 BC 字典翻译；同时查 Label-ChatOther 与 Label-ChatSelf。
     *  避免发送出去后显示乱码，也避免子部位的英文动作被误删。 */
    function hasActivityLabel(name, targetGroup) {
        if (!name || !targetGroup) return false;
        if (typeof window.ActivityDictionaryText !== 'function') return true; // 无法判断时放行
        function keyOk(g, prefix) {
            var k = 'Label-' + prefix + '-' + g + '-' + name;
            var t = window.ActivityDictionaryText(k);
            return !isMissingLabel(t);
        }
        function groupKeyOk(g) {
            return keyOk(g, 'ChatOther') || keyOk(g, 'ChatSelf');
        }
        if (groupKeyOk(targetGroup)) return true;
        if (SUBPART_TO_BASE[targetGroup] && groupKeyOk(SUBPART_TO_BASE[targetGroup])) return true;
        return false;
    }

    /**
     * 判断一个动作是否应保留在列表中。
     * - 名字里含「MISSING / [STRING_RETRIEVAL_FAILED]」的乱码动作一律丢弃。
     * - ECHO 情绪拓展的中文动作名（如「张开嘴」「流口水」）以及本插件自定义 XSAct_ 动作：
     *   名字本身就是可读标签，BC 执行时会正常显示，直接放行（不再要求 Label-ChatOther 翻译）。
     * - 其余动作：要求 Label-ChatOther 或 Label-ChatSelf 任一有翻译，避免聊天消息乱码，
     *   同时让"自我动作"（如呻吟/呜咽）在他人面板上也能显示。
     */
    function shouldKeepAction(name, targetGroup) {
        if (!name) return false;
        // 仅丢弃名字本身就是哨兵/乱码的动作；其余一律保留
        // （getActivityLabelFallback 已保证显示名干净可读，不丢功能）
        if (name.indexOf('MISSING') !== -1) return false;
        if (name.indexOf('[STRING_RETRIEVAL_FAILED]') !== -1) return false;
        if (/[一-鿿]/.test(name) || name.indexOf('XSAct_') === 0) return true;
        // 英文 / mod 动作：无论是否有 BC 翻译都保留（无翻译时显示可读名，不丢功能）
        return true;
    }


    /* ══════════════════════════════════════════════════════════════
       动作执行 — 参考 PAT All 的 makeActivityPacket + ServerSend 模式
       ══════════════════════════════════════════════════════════════ */

    /**
     * 为 ActivityAsset 寻找最合理的 fallback 物品。
     * 某些动作（如 echo-activity-ext 的"看看裙底"）消息模板引用了 ActivityAsset，
     * 但 ActivityAllowedForGroup 未返回 Item，且目标部位本身没有穿着物。
     * 此时从目标角色的外观中找最相关的衣物作为兜底。
     */
    function findBestItemForActivityAsset(targetChar, group) {
        if (!targetChar || !targetChar.Appearance) return null;
        var items = targetChar.Appearance;
        var lowerGroups = ['ItemButt', 'ItemPelvis', 'ItemLegs', 'ItemVulva', 'ItemVulvaPiercings'];
        var upperGroups = ['ItemBreast', 'ItemNipples', 'ItemNipplesPiercings', 'ItemTorso', 'ItemTorso2', 'ItemArms'];

        // 1. 优先返回当前动作部位本身的穿着物（如 ItemPelvis 上的丁字裤）。
        // 这样"看裙底"等动作会先显示贴身衣物，而不是外层裙子。
        if (typeof InventoryGet === 'function') {
            var direct = InventoryGet(targetChar, group);
            if (direct) return direct;
        }

        // 2. 当前部位没有时，对下体动作按"贴身衣物→外层衣物"兜底。
        // 内裤在 Panties 组（包括 ECHO 自定义 Panties_xxx），裙装/裤装在 ClothLower/Cloth/SuitLower。
        if (lowerGroups.indexOf(group) !== -1) {
            var panties = items.find(function(i) {
                return i && i.Asset && i.Asset.Group && /Panties/i.test(i.Asset.Group.Name);
            });
            if (panties) return panties;
            var lower = items.find(function(i) {
                return i && i.Asset && i.Asset.Group && /ClothLower/i.test(i.Asset.Group.Name);
            });
            if (lower) return lower;
            var cloth = items.find(function(i) {
                return i && i.Asset && i.Asset.Group && /Cloth/i.test(i.Asset.Group.Name) && !/Accessory/i.test(i.Asset.Group.Name);
            });
            if (cloth) return cloth;
            var suit = items.find(function(i) {
                return i && i.Asset && i.Asset.Group && /SuitLower/i.test(i.Asset.Group.Name);
            });
            if (suit) return suit;
        }

        // 3. 上半身动作按上衣兜底
        if (upperGroups.indexOf(group) !== -1) {
            var top = items.find(function(i) {
                return i && i.Asset && i.Asset.Group && /Cloth/i.test(i.Asset.Group.Name) && !/Accessory/i.test(i.Asset.Group.Name);
            });
            if (top) return top;
            var suitTop = items.find(function(i) {
                return i && i.Asset && i.Asset.Group && /Suit/i.test(i.Asset.Group.Name);
            });
            if (suitTop) return suitTop;
        }

        return null;
    }

    /** 根据目标与动作类型选择正确的聊天消息翻译键：ChatSelf 或 ChatOther。
     *  对他人优先 ChatOther（玩家对目标做的动作），缺失时回退 ChatSelf（目标自己对自己做的动作，如呻吟/呜咽）。
     *  对自己优先 ChatSelf，缺失时回退 ChatOther。
     */
    function resolveContentKey(group, name, targetChar) {
        var isSelf = targetChar && Player && targetChar.MemberNumber === Player.MemberNumber;
        function firstExisting(prefix) {
            var order = [group];
            if (SUBPART_TO_BASE[group]) order.push(SUBPART_TO_BASE[group]);
            if (typeof ActivityDictionaryText !== 'function') return null; // 无法判断，让外层 fallback
            for (var i = 0; i < order.length; i++) {
                var k = prefix + '-' + order[i] + '-' + name;
                var t = ActivityDictionaryText(k);
                if (!isMissingLabel(t)) return k;
            }
            return null;
        }
        if (isSelf) {
            var selfKey = firstExisting('ChatSelf');
            var otherKey = firstExisting('ChatOther');
            return selfKey || otherKey || ('ChatSelf-' + group + '-' + name);
        }
        var otherKey = firstExisting('ChatOther');
        var selfKey = firstExisting('ChatSelf');
        return otherKey || selfKey || ('ChatOther-' + group + '-' + name);
    }

    /**
     * 构建标准活动包（与 PAT All v3.0 同款格式）。
     * 若选到的是 ChatSelf 键且目标不是自己（如目标自己呻吟/呜咽），
     * 则 SourceCharacter 应为目标本人，这样聊天消息才会显示"目标做了某事"。
     * @param {Character} targetChar - 目标角色对象
     * @param {string} group - 部位 Group 名（如 ItemBreast）
     * @param {string} name - 动作原始名（如 ItemBreastCaress）
     * @param {Item|null} activityItem - ActivityAllowedForGroup 返回的绑定道具（可选）
     */


    function makeActivityPacket(targetChar, group, name, activityItem) {
        var targetMN = targetChar && targetChar.MemberNumber;
        var contentKey = resolveContentKey(group, name, targetChar);
        var isSelfAction = contentKey.indexOf('ChatSelf-') === 0;
        var isPlayerTarget = Player && targetChar && targetChar.MemberNumber === Player.MemberNumber;
        var isTargetSelf = isSelfAction && !isPlayerTarget;

        function charTagForAction(c) {
            return {
                Tag: {
                    MemberNumber: c && c.MemberNumber || 0,
                    Name: c && (c.Name || c.AccountName) || '某人',
                    Nickname: c && (c.Nickname || c.Name || c.AccountName) || '某人'
                }
            };
        }

        // 自定义动作（QiAct_ 前缀）：走 BC 原生「Action 文本」机制（与游戏内 `.a` / BCX 同款）。
        // 关键：包里直接内嵌对话文本（Text 字段），接收端（含原生 BC 与 BCX）直接渲染，
        // 不需要接收方安装任何插件 —— 解决「标准 Activity 包会让无插件者看到 MISSING TEXT」的问题。
        // 昵称由我们在文本里用 {SourceCharacter}/{TargetCharacter} → Nickname 手动拼入，确保显示昵称而非原始 ID。
        // 本地动画副作用由 executeAction 里的 ActivityRun 负责（活动已 push 进 AssetAllActivities，仅本客户端生效）。
        if (new RegExp('^' + CA_PREFIX).test(name)) {
            var ca = caFindByActivityName(name);
            if (ca) {
                var caSrc = (Player && (Player.Nickname || Player.Name || Player.AccountName)) || '某人';
                var caTgt = (targetChar && (targetChar.Nickname || targetChar.Name || targetChar.AccountName)) || '某人';
                // 文本选择规则：
                // - 仅自己：始终用 dialogSelf（自己视角），回退到 dialog
                // - 仅他人：始终用 dialog（他人视角）
                // - 任意：根据当前实际目标是否玩家自己切换
                var caDialog;
                if (ca.scope === 'self') {
                    caDialog = (ca.dialogSelf && ca.dialogSelf.trim()) ? ca.dialogSelf : ca.dialog;
                } else if (ca.scope === 'other') {
                    caDialog = ca.dialog;
                } else {
                    caDialog = isSelfAction
                        ? ((ca.dialogSelf && ca.dialogSelf.trim()) ? ca.dialogSelf : ca.dialog)
                        : ca.dialog;
                }
                if (!caDialog) caDialog = ca.name || '某个动作';
                caDialog = caDialog
                    .replace(/\{SourceCharacter\}/g, caSrc)
                    .replace(/\{TargetCharacter\}/g, caTgt)
                    // 兼容 echo/回声 导入时的裸占位符写法（无花括号）
                    .replace(/SourceCharacter/g, caSrc)
                    .replace(/TargetCharacter/g, caTgt);
                return {
                    Content: 'QiAct_ChatFallback',
                    Type: 'Action',
                    Dictionary: [
                        charTagForAction(Player),
                        { Tag: 'MISSING TEXT IN "Interface.csv": QiAct_ChatFallback', Text: caDialog }
                    ]
                };
            }
        }

        var contentText = (typeof ActivityDictionaryText === 'function') ? ActivityDictionaryText(contentKey) : null;
        var contentKeyMissing = isMissingLabel(contentText);
        // 已导入本插件的 echo/回声 原始动作（如 XSAct_埋怀里）被 suppress 后，仍可能出现在
        // BC 原生动作列表或某些第三方面板。若用户点击了它，不能发标准 Activity 包，否则
        // 接收方没有 echo 插件就会看到 MISSING TEXT。这里把它视为「需要兜底」。
        var isEchoSuppressed = typeof caIsEchoSuppressed === 'function' && caIsEchoSuppressed(name);
        // 关键：不要把所有含下划线的 mod 动作都强制走 Action 兜底。
        // 像 Liko_ 这类动作在本地有完整 Activity + Dictionary 注册，且依赖标准 Activity 包触发
        // 其 ServerSend hook 才能执行脚本（如插呆毛、溶解衣服）。若发 Action 包，Liko hook 监听
        // Type === 'Activity' 会漏掉，导致只有文本没有实际效果。
        // 同样，LSCG_ 动作也是真实 BC 活动（注册进 AssetAllActivities），本客户端装有 LSCG 时
        // 其 ServerSend hook（仅处理 Type === 'Activity'）会执行饥饿/口渴/道具/特殊脚本。
        // 小酥动作拓展（XiaoSuActivity，前缀 XSAct_，如 XSAct_眯眼 / XSAct_看他）同理：
        //   它把对话文本写进全局 ActivityDictionary 数组（与 LSCG 同款），并且其 ServerSend hook
        //   只在 Type === 'Activity' 且活动名以 "XSAct_" 开头时，才拦截并往 Dictionary 注入一条
        //   {Tag, Text}（= 富文本动作描述），使【未装小酥的接收方】也能看到动作内容。
        //   一旦被我们误发成 Action 兜底包，小酥 hook 直接跳过（它只听 Activity），
        //   接收方既看不到富文本、又只能看到退化的「做了「眯眼」」提示。
        // 注意：本 BC 版本 ActivityDictionaryText 读的是 ActivityDictionaryLoad().cache，
        // 而小酥 / LSCG 把对话文本写进了 ActivityDictionary 数组，导致
        // ActivityDictionaryText('ChatOther-<group>-XSAct_xxx') 对这类动作稳定返回 MISSING，
        // 从而被误判 contentKeyMissing 退回 Action 兜底 —— 这正是效果丢失的根因。
        // patchActivityDictionaryText()（main 登录后安装，数组兜底）已让 ActivityDictionaryText
        // 在 MISSING 时回退数组查找，使 contentKeyMissing 对 XSAct_ 也变 false；
        // 这里再对 XSAct_（排除本插件自定义动作 QiAct_ 和已 suppress 的 echo 原始动作）
        // 强制走标准 Activity 包，双保险，与它们在真实游戏里原生触发完全一致。
        // findAllowedActivity 已兜底兜住「活动不在 AssetAllActivities」的非法情况，不会发出无效包。
        var isForcedActivityMod = /^(LSCG_|Liko_)/.test(name || '') ||
            (/^XSAct_/.test(name || '') && !isEchoSuppressed);

        if ((contentKeyMissing || isEchoSuppressed) && !isForcedActivityMod) {
            // 走 BC 原生「自定义动作文本」机制（与游戏内 `.a ` 前缀 / BCX 同款）：
            // 发送 Type:'Action' + 在 Dictionary 中塞一条
            //   { Tag: 'MISSING TEXT IN "<file>": <key>', Text: <动作句> }
            // 接收端（含原生 BC 与 BCX）直接渲染 Dictionary 里的 Text 为小字带颜色动作，
            // 既不依赖接收方是否装有对应 mod 的字典，也不会出现 MISSING TEXT 垃圾串。
            // 注意：Action 消息的 Dictionary[0] 必须是角色对象，且包在 {Tag: ...} 里。
            // BC 渲染名字时会优先读 tag.Nickname，没有再读 tag.Name。
            // 直接传 MemberNumber 或 {SourceCharacter} 对象都无法触发 nickname。
            var actor = isTargetSelf ? targetChar : Player;
            var actorTag = charTagForAction(actor);
            var sentence;
            if (!contentKeyMissing && contentText) {
                sentence = contentText
                    .replace(/\{SourceCharacter\}/g, actorTag.Tag.Nickname)
                    .replace(/\{TargetCharacter\}/g, targetChar && (targetChar.Nickname || targetChar.Name || targetChar.AccountName) || '某人')
                    // 兼容 echo/回声 等使用裸占位符（无花括号）的模板
                    .replace(/SourceCharacter/g, actorTag.Tag.Nickname)
                    .replace(/TargetCharacter/g, targetChar && (targetChar.Nickname || targetChar.Name || targetChar.AccountName) || '某人');
            } else {
                var displayName = getActivityLabelFallback(name, group) || name || '某个动作';
                if (isTargetSelf) {
                    sentence = '做了「' + displayName + '」';
                } else {
                    sentence = '对' + (targetChar && (targetChar.Nickname || targetChar.Name || targetChar.AccountName) || '某人') + '做了「' + displayName + '」';
                }
            }
            var fbKey = 'QiAct_ChatFallback';
            return {
                Content: fbKey,
                Type: 'Action',
                Dictionary: [
                    actorTag,
                    { Tag: 'MISSING TEXT IN "Interface.csv": ' + fbKey, Text: sentence }
                ]
            };
        }

        // PAT All 同款：Dictionary 初始不含 ActivityName（最后 push，顺序敏感！）
        var packet = {
            Content: contentKey,
            Type: 'Activity',
            Dictionary: [
                { SourceCharacter: isTargetSelf ? targetMN : Player.MemberNumber },
                { TargetCharacter: targetMN },
                { Tag: 'FocusAssetGroup', FocusGroupName: group }
            ]
        };

        // 绑定道具（优先用 ActivityAllowedForGroup 返回的真实 Item，
        // 其次从目标角色外观中找最相关衣物作为 ActivityAsset 兜底，
        // 再正则兜底手持/吃东西类动作）
        var item = activityItem || null;
        if (!item && targetChar) {
            item = findBestItemForActivityAsset(targetChar, group);
        }
        if (!item && typeof InventoryGet === 'function') {
            var isLscgEatChew = /^LSCG_(Eat|Chew)/i.test(name) || /EatItem$/i.test(name) || /ThrowItem$/i.test(name);
            var isHand = /^ItemHand/i.test(name);
            if (isLscgEatChew) {
                var tc = (typeof ChatRoomCharacter !== 'undefined' && Array.isArray(ChatRoomCharacter))
                    ? ChatRoomCharacter.find(function(c) { return c.MemberNumber === targetMN; }) : null;
                if (tc) item = InventoryGet(tc, 'ItemHandheld');
            } else if (isHand) {
                item = InventoryGet(Player, 'ItemHandheld');
            }
        }
        if (item && item.Asset) {
            var aa = { Tag: 'ActivityAsset', AssetName: item.Asset.Name, GroupName: item.Asset.Group ? item.Asset.Group.Name : 'ItemHandheld' };
            if (item.CraftName || (item.Craft && item.Craft.Name))
                aa.CraftName = item.CraftName || item.Craft.Name;
            packet.Dictionary.push(aa);
            logD('ActivityAsset 已加入:', aa.AssetName, aa.GroupName, 'CraftName:', aa.CraftName || '无');
        } else {
            logD('未生成 ActivityAsset:', name, group, 'item存在=', !!item, 'Asset存在=', !!(item && item.Asset));
        }

        // ActivityName 放最后（PAT All 做法）
        packet.Dictionary.push({ ActivityName: name });
        return packet;
    }

    /** 记录上次动作（抽取公共代码） */
    function recordLastAction(name, targetMN, part, dict) {
        state.lastAction = { name: name, targetMN: targetMN, part: part, time: Date.now() };
        saveStorage(S_LAST, state.lastAction);
    }

    /** 从 ActivityAllowedForGroup 结果中按名字查找动作（统一解析 a.Activity?.Name）
     * @returns 匹配的动作项（含 .Item）或 null */
    function findAllowedActivity(char, group, name) {
        if (typeof ActivityAllowedForGroup !== 'function') return null;
        try {
            var allowed = ActivityAllowedForGroup(char, group);
            if (!Array.isArray(allowed)) return null;
            return allowed.find(function(a) {
                if (!a) return false;
                var n = a.Activity ? a.Activity.Name : a.Name;
                return n === name;
            }) || null;
        } catch (_) {
            return null; // 单目标/部位查询异常视为不可用，由调用方跳过或提示
        }
    }

    /** 组合执行间隔归一化（缺失/非法时回退 160ms） */
    function comboDelay(combo) {
        return (combo && typeof combo.delay === 'number' && combo.delay >= 0) ? combo.delay : 160;
    }

    /** 把选中目标排到数组首位（其余保持原序），用于「全员」执行时优先作用于当前目标 */
    function orderBySelectedTarget(chars) {
        var ordered = (chars || []).slice();
        if (state.selectedTarget && state.selectedTarget.MemberNumber) {
            var mn = state.selectedTarget.MemberNumber;
            ordered.sort(function(a, b) { return (a.MemberNumber === mn) ? -1 : 0; });
        }
        return ordered;
    }

    /** 执行动作（先 ActivityRun 本地副作用，再 ServerSend 发送 Activity 包）
     * @param {string} [groupOverride] 指定部位 Group（全身模式逐部位执行时用），缺省用 state.selectedPart */
    function executeAction(charObj, activityName, activityItem, groupOverride) {
        if (!charObj || !activityName) return false;
        var name = String(activityName || '');
        var group = String(groupOverride || state.selectedPart || '');
        if (!name || !group) return false;

        try {
            var packet = makeActivityPacket(charObj, group, name, activityItem);
            if (!packet) { toast('该动作需要特定道具', '#FF5C5C'); return false; }
            // 实时可用性预校验（findAllowedActivity 内部已处理 ActivityAllowedForGroup 缺失）
            if (!findAllowedActivity(charObj, group, name)) {
                toast('该动作当前不可用', '#FF5C5C'); return false;
            }

            // 先执行 BC 原生 ActivityRun(..., false) 触发本地副作用：
            // 重置 PropertyAutoPunishHandled（MakeSound 动作会触发口塞充气等自动惩罚）、
            // ActivityEffect（目标是玩家时）、ActivityRunSelf（玩家自身快感计算）、
            // PropertyPunishActivityCache 等。之后再自己发包，避免直接 ServerSend 跳过规则。
            var activityObj = null;
            var targetGroupObj = null;
            if (typeof ActivityRun === 'function' && typeof ActivityGetGroupOrMirror === 'function' && typeof AssetAllActivities === 'function') {
                try {
                    targetGroupObj = ActivityGetGroupOrMirror(charObj.AssetFamily, group);
                    var allActs = AssetAllActivities(charObj.AssetFamily);
                    activityObj = allActs.find(function(a) { return a.Name === name; });
                    if (targetGroupObj && activityObj) {
                        ActivityRun(Player, charObj, targetGroupObj, { Activity: activityObj, Item: activityItem }, false);
                    }
                } catch (runErr) {
                    console.warn('[QiAct] ActivityRun 本地副作用执行失败:', runErr.message);
                }
            }

            // 再 ServerSend（标准方式）
            // 设置目标聚焦部位：Prank 等自定义动作（如 Liko_CutClothes）的回调依赖
            // target.FocusGroup?.Name 决定作用部位。原生 UI 点击时会自动设置该值，
            // 但本插件直接发包不经过那一步，需手动补上，发完立即还原。
            var prevFocus = charObj.FocusGroup;
            var focusGroupObj = null;
            if (typeof AssetGroup !== 'undefined' && Array.isArray(AssetGroup)) {
                focusGroupObj = AssetGroup.find(function(g) { return g && g.Name === group; });
            }
            try {
                charObj.FocusGroup = focusGroupObj || { Name: group };
                if (typeof ServerSend === 'function') {
                    ServerSend('ChatRoomChat', packet);
                } else {
                    console.warn('[QiAct] ServerSend 暂不可用，动作未实际发送');
                }
                recordLastAction(name, charObj.MemberNumber, group, packet.Dictionary);
                return true;
            } catch (sendErr) {
                console.warn('[QiAct] ServerSend 失败:', sendErr.message);
            } finally {
                charObj.FocusGroup = prevFocus;
            }

            // 最终兜底：如果 ActivityRun 也拿不到，提示不可用
            toast('该动作暂不可用', '#FF5C5C');
            return false;
        } catch (e) {
            console.error('[QiAct] 执行动作异常:', e);
            toast('执行失败: ' + e.message, '#FF5C5C');
            return false;
        }
    }

    /** 对房间内所有其他成员执行同一动作（PAT ALL 同款广播） */
    function executeActionAll() {
        if (!state.selectedAction || !state.selectedPart) { toast('请先选择一个动作', '#FF5C5C'); return; }
        var chars = getRoomCharacters();
        if (!Array.isArray(chars) || chars.length === 0) { toast('房间内没有其他人', '#888'); return; }

        // 如果当前选中了目标，则把目标排到第一个执行，其余随后
        var ordered = orderBySelectedTarget(chars);

        var name = String(state.selectedAction);
        var group = String(state.selectedPart);
        var success = 0;
        var delay = 120; // ms，避免触发服务器/本地 anti-spam
        var index = 0;

        function next() {
            if (index >= ordered.length || !state.isActive) return;
            var c = ordered[index++];
            // 预先检查该目标当前是否真的可做这个动作
            var item = null;
            var found = findAllowedActivity(c, group, name);
            if (!found) return next();
            item = found.Item || null;
            if (executeAction(c, name, item || state.selectedActionItem)) success++;
            setTimeout(next, delay);
        }
        next();
        toast('开始对所有成员执行：' + getActivityLabel(name, group), '#FF5C7A');
    }

    /* ══════════════════════════════════════════════════════════════
       自定义组合 —— 用户手动把「单部位 + 动作」拼成组合，一键顺序执行。
       比自动按动作名聚合更准确，可跨部位、跨动作自由组合。
       ══════════════════════════════════════════════════════════════ */



    /* ===== 6. 自定义组合（CRUD + 执行） ===== */
    function generateId() { return 'cmb_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7); }
    function saveCombos() { persist(S_COMBOS, state.combos); }
    function getCombo(id) { return state.combos.find(function(c) { return c.id === id; }); }

    function addCombo(name) {
        var combo = { id: generateId(), name: String(name || '新组合'), items: [], delay: 160 };
        state.combos.push(combo);
        saveCombos();
        return combo;
    }
    function deleteCombo(id) {
        state.combos = state.combos.filter(function(c) { return c.id !== id; });
        if (state.editingComboId === id) state.editingComboId = null;
        saveCombos();
    }
    function renameCombo(id, name) {
        var c = getCombo(id);
        if (c) { c.name = String(name || c.name); saveCombos(); }
    }
    function addComboItem(comboId, group, action, label, item) {
        var c = getCombo(comboId);
        if (!c) return;
        c.items.push({ group: group, action: action, label: label, item: item || null });
        saveCombos();
    }
    function removeComboItem(comboId, index) {
        var c = getCombo(comboId);
        if (!c) return;
        c.items.splice(index, 1);
        saveCombos();
    }
    function moveComboItem(comboId, fromIndex, toIndex) {
        var c = getCombo(comboId);
        if (!c) return;
        var item = c.items.splice(fromIndex, 1)[0];
        c.items.splice(toIndex, 0, item);
        saveCombos();
    }
    function startEditCombo(id) {
        if (!getCombo(id)) return;
        state.editingComboId = id;
        renderPanel();
    }
    function stopEditCombo() {
        state.editingComboId = null;
        renderPanel();
    }

    /** 执行一个组合（对单个目标按条目顺序执行） */
    function runComboOnTarget(charObj, combo) {
        if (!charObj || !combo || !combo.items.length) return;
        var items = combo.items.slice();
        var i = 0, success = 0, delay = comboDelay(combo);
        function next() {
            if (i >= items.length || !state.isActive) return;
            var it = items[i++];
            // 执行前校验该动作在当前目标该部位是否仍可用，并取最新道具
            var item = it.item || null;
            var found = findAllowedActivity(charObj, it.group, it.action);
            if (found) item = found.Item || item;
            if (executeAction(charObj, it.action, item, it.group)) success++;
            setTimeout(next, delay);
        }
        next();
        toast('执行组合「' + combo.name + '」· ' + items.length + ' 步', '#FF5C7A');
    }

    /** 对房间内所有其他成员执行同一组合 */
    function runComboAll(combo) {
        if (!combo || !combo.items.length) { toast('组合为空', '#FF5C5C'); return; }
        var chars = getRoomCharacters();
        if (!Array.isArray(chars) || chars.length === 0) { toast('房间内没有其他人', '#888'); return; }
        var ordered = orderBySelectedTarget(chars);
        var ci = 0;
        function nextChar() {
            if (ci >= ordered.length || !state.isActive) return;
            var c = ordered[ci++];
            runComboOnTarget(c, combo);
            var d = comboDelay(combo);
            setTimeout(nextChar, combo.items.length * d + 300);
        }
        nextChar();
        toast('开始对所有人执行组合「' + combo.name + '」', '#FF5C7A');
    }

    /* ══════════════════════════════════════════════════════════════
       自定义动作（QiAct 自包含版，替代 echo/回声 echo-activity-ext）
       —— 参考 echo 注册内核，但完全重做 UI；直接用 BC 原生 ActivityAdd，
          不引入 sugarch 依赖。跨客户端可见性靠 makeActivityPacket 的
          Action 兜底分支（名字含下划线 → 走彩色小字动作，文本用本地字典）。
       ══════════════════════════════════════════════════════════════ */



    /* ===== 6.5 自定义动作（CRUD + 注册 + 执行 + 互通） ===== */
    var CA_PREFIX = 'QiAct_';  // 自定义动作内部 Activity 名前缀；避免与 XiaoSuActivity 的 XSAct_ 前缀冲突
    function caHash(str) {
        // 稳定字符串哈希 → base36，避免引入 btoa / 中文编码问题
        var h = 5381;
        str = String(str || '');
        for (var i = 0; i < str.length; i++) {
            h = ((h << 5) + h + str.charCodeAt(i)) >>> 0;
        }
        return h.toString(36);
    }
    function caActivityName(act) {
        return CA_PREFIX + caHash(act.name + '|' + act.group + '|' + act.scope);
    }
    function caBuildActivityDef(act) {
        var actName = caActivityName(act);
        var isSelfOnly = act.scope === 'self';
        var isOtherOnly = act.scope === 'other';
        // 与 BC 原生 Activity 对象格式保持一致，避免第三方插件（PAT All / echo等）
        // 在处理时读到未定义字段而崩溃。
        // ActivityID 使用正数（避免某些 BC 路径把 -1 当无效处理），基于 hash 保证唯一。
        var actId = (parseInt(caHash(actName), 36) % 900000000) + 100000000;
        return {
            Name: actName,
            ActivityID: actId,
            MaxProgress: 0,
            Prerequisite: [],
            Target: isSelfOnly ? [] : [act.group],
            TargetSelf: isOtherOnly ? [] : [act.group]
        };
    }
    /* ===== 字典注册辅助：自定义动作需要同时注册 Activity 和 Label/Chat 翻译，
       否则 BC 原生活动面板会显示 MISSING TEXT IN "ActivityDictionary ..." ===== */
    // 自定义动作字典兜底：ActivityDictionaryText 在 R130+ 实际从 TextCache.loader.cache 读取，
    // 仅写全局数组或 loader 自有属性无效（表现为原生活动面板 MISSING）。
    // 策略：① 写入 loader.cache（覆盖内部直接读 cache 的路径）；
    //       ② 写入全局 ActivityDictionary 数组（兼容旧版 BC，并供 02-action-a.js 的 SDK hook 兜底）；
    //       ③ 调用 patchActivityDictionaryText() 确保 SDK hook 已安装（BCX 兼容，不直接覆盖全局函数）。
    function caSetDict(key, value) {
        if (typeof key !== 'string' || !key || value == null) return;
        // 优先走 BCX 兼容的 SDK hook 兜底；幂等，已安装则直接返回。
        if (typeof patchActivityDictionaryText === 'function') {
            try { patchActivityDictionaryText(); } catch (e) { silent(e, 'patchActivityDictionaryText'); }
        }
        // 1. R130+ TextCache：必须写入 loader.cache（ActivityDictionaryText 实际读取处）
        try {
            var loader = window.ActivityDictionaryLoad && window.ActivityDictionaryLoad();
            if (loader && loader.cache && typeof loader.cache === 'object') loader.cache[key] = value;
            else if (loader && typeof loader.set === 'function') loader.set(key, value);
            else if (loader && typeof loader === 'object') loader[key] = value;
        } catch (e) { silent(e, 'caSetDict.cache'); }
        // 2. 全局 ActivityDictionary 数组（兼容旧版 BC，并给 SDK hook 兜底用）
        if (Array.isArray(window.ActivityDictionary)) {
            var found = false;
            for (var i = 0; i < window.ActivityDictionary.length; i++) {
                var e = window.ActivityDictionary[i];
                if (Array.isArray(e) && e[0] === key) { e[1] = value; found = true; break; }
            }
            if (!found) window.ActivityDictionary.push([key, value]);
        }
    }
    function caRemoveDict(key) {
        if (typeof key !== 'string' || !key) return;
        if (Array.isArray(window.ActivityDictionary)) {
            for (var i = window.ActivityDictionary.length - 1; i >= 0; i--) {
                var e = window.ActivityDictionary[i];
                if (Array.isArray(e) && e[0] === key) window.ActivityDictionary.splice(i, 1);
            }
        }
        try {
            var loader = window.ActivityDictionaryLoad && window.ActivityDictionaryLoad();
            if (loader && loader.cache && typeof loader.cache === 'object') delete loader.cache[key];
            else if (loader && typeof loader.delete === 'function') loader.delete(key);
            else if (loader && typeof loader === 'object') delete loader[key];
        } catch (e) { silent(e, 'caRemoveDict'); }
    }
    function caRegisterDictionary(act, nm) {
        try {
            var group = act.group || 'ItemMouth';
            var label = act.name || nm;
            var dialogOther = act.dialog || label;
            var dialogSelf = act.dialogSelf || act.dialog || label;
            // 始终注册 Self 与 Other 两套 Label/Chat，避免原生活动面板在任意上下文显示 MISSING。
            // 自定义动作实际走我们自己的发包逻辑（Type:'Chat'），Chat 句子极少被原生路径使用，
            // 此处仅为补全字典、杜绝 MISSING 文本。
            // 子部位（如 ItemMouth2）额外在主部位（ItemMouth）注册一份，
            // 避免 BC 原生面板以主部位为 key 查询时显示 QiAct_ 内部 ID。
            var groups = [group];
            if (typeof SUBPART_TO_BASE !== 'undefined' && SUBPART_TO_BASE[group]) groups.push(SUBPART_TO_BASE[group]);
            groups.forEach(function(g) {
                caSetDict('Label-ChatOther-' + g + '-' + nm, label);
                caSetDict('ChatOther-' + g + '-' + nm, dialogOther);
                caSetDict('Label-ChatSelf-' + g + '-' + nm, label);
                caSetDict('ChatSelf-' + g + '-' + nm, dialogSelf);
            });
        } catch (e) { console.warn('[QiAct] 注册自定义动作字典失败:', e.message); }
    }
    function caUnregisterDictionary(act, nm) {
        try {
            var group = act.group || 'ItemMouth';
            var groups = [group];
            if (typeof SUBPART_TO_BASE !== 'undefined' && SUBPART_TO_BASE[group]) groups.push(SUBPART_TO_BASE[group]);
            groups.forEach(function(g) {
                caRemoveDict('Label-ChatOther-' + g + '-' + nm);
                caRemoveDict('ChatOther-' + g + '-' + nm);
                caRemoveDict('Label-ChatSelf-' + g + '-' + nm);
                caRemoveDict('ChatSelf-' + g + '-' + nm);
            });
        } catch (e) { silent(e, 'caUnregisterDictionary'); }
    }

    function caRegister(act) {
        // 本 BC 版本无全局 ActivityAdd；活动来自 AssetAllActivities(fam) 数组。
        // 直接把标准活动对象 push 进该数组即可被 findAllowedActivity / ActivityRun 识别。
        try {
            // 隐藏动作：从 BC 注册表移除，避免出现在动作面板和原生动作列表
            if (act.visible === false) { caUnregister(act); return false; }
            var fam = (Player && Player.AssetFamily) || 'Female3DCG';
            var acts = caRawAllActivities(fam);
            if (!Array.isArray(acts)) return false;
            var actName = caActivityName(act);
            // 避免重复注册
            if (acts.some(function(a) { return a && a.Name === actName; })) {
                // 即使 Activity 已注册，也要确保字典条目存在（刷新页面后可能只恢复了 Activity）
                caRegisterDictionary(act, actName);
                return true;
            }
            acts.push(caBuildActivityDef(act));
            caRegisterDictionary(act, actName);
            // 同步加入排序索引数组，否则 ActivityAllowedForGroup 排序后第三方插件可能读到 undefined
            if (Array.isArray(ActivityFemale3DCGOrdering) && ActivityFemale3DCGOrdering.indexOf(actName) === -1) {
                ActivityFemale3DCGOrdering.push(actName);
            }
            return true;
        } catch (e) { console.warn('[QiAct] 注册自定义动作失败:', act.name, e.message); return false; }
    }
    function caUnregister(act) {
        try {
            var fam = (Player && Player.AssetFamily) || 'Female3DCG';
            var acts = caRawAllActivities(fam);
            if (!Array.isArray(acts)) return;
            var nm = caActivityName(act);
            for (var i = acts.length - 1; i >= 0; i--) {
                if (acts[i] && acts[i].Name === nm) acts.splice(i, 1);
            }
            caUnregisterDictionary(act, nm);
            // 同步从排序索引数组移除
            if (Array.isArray(ActivityFemale3DCGOrdering)) {
                for (var j = ActivityFemale3DCGOrdering.length - 1; j >= 0; j--) {
                    if (ActivityFemale3DCGOrdering[j] === nm) ActivityFemale3DCGOrdering.splice(j, 1);
                }
            }
        } catch (_) { console.warn('[QiAct] 反注册活动排序项失败（已忽略）:', _ && _.message); }
    }
    /** 按活动名反查自定义动作对象（用于发包时取对话文本） */
    function caFindByActivityName(name) {
        for (var i = 0; i < state.customActions.length; i++) {
            if (caActivityName(state.customActions[i]) === name) return state.customActions[i];
        }
        return null;
    }
    /**
     * 自动检测动作来源（用于动作列表的来源水印标注 + LSCG/Liko 点击后自动刷新）。
     * 返回：'LSCG' | 'LIKO' | 'XIAOSU' | 'ECHO' | 'CUSTOM' | null（null = BC 原版，不标注）。
     * 检测顺序很重要：QiAct_ 是我们自定义动作前缀，必须先于 XSAct_ 判断，
     * 否则会被第三方 mod 小酥（XiaoSuActivity，前缀 XSAct_）抢匹配。
     */
    function caDetectSource(name) {
        if (!name || typeof name !== 'string') return null;
        if (name.indexOf('LSCG_') === 0) return 'LSCG';
        if (name.indexOf('Liko_') === 0) return 'LIKO';
        if (name.indexOf(CA_PREFIX) === 0) {            // QiAct_ 本插件自定义动作
            var ca = caFindByActivityName(name);
            if (ca && ca.source === 'echo') return 'ECHO';
            return 'CUSTOM';                            // 用户自建
        }
        if (name.indexOf('XSAct_') === 0) return 'XIAOSU'; // 小酥动作拓展
        // 兜底：仍出现在列表里的 echo 原始动作名（理论上已被屏蔽，但防漏）
        if (state.echoSuppressed && state.echoSuppressed.has(name)) return 'ECHO';
        return null;                                    // BC 原版自带动作
    }
    function loadCustomActions() {
        state.customActions = loadSetting(S_CUSTOM, []);
        if (!Array.isArray(state.customActions)) state.customActions = [];
        // 迁移旧数据：补 visible/source 字段，并尽量识别是否从 echo/回声 导入
        var echoNames = new Set();
        try {
            var ext = Player && Player.ExtensionSettings;
            var echoKey = ext && Object.keys(ext).find(function(k) { return k.indexOf('ECHO') === 0; });
            var echoData = echoKey && ext[echoKey] && ext[echoKey]['动作数据'];
            if (echoData) Object.values(echoData).forEach(function(item) { if (item && item.Name) echoNames.add(item.Name); });
        } catch (e) { console.warn('[QiAct] 读取 echo 动作数据失败（已忽略）:', e && e.message); }
        state.customActions.forEach(function(a) {
            if (typeof a.visible !== 'boolean') a.visible = true;
            if (!a.source) a.source = echoNames.has(a.name) ? 'echo' : 'native';
        });
        // 同步 echo 屏蔽集合，并立即清理已存在的 echo 原始重复动作
        rebuildEchoSuppressed();
        caRemoveSuppressedEchoActivities();
        // 兜底：部分 mod（如 echo/回声）可能在更晚的时机才把动作注册进全局数组，
        // 这里延迟重新扫描并物理移除一次，确保启动后不残留 echo 原始重复动作。
        setTimeout(function() {
            try { rebuildEchoSuppressed(); caRemoveSuppressedEchoActivities(); } catch (e) { silent(e, 'echoSuppressCleanup'); }
        }, 2000);
    }
    function saveCustomActions() { persist(S_CUSTOM, state.customActions); }
    function getCustom(id) {
        for (var i = 0; i < state.customActions.length; i++) {
            if (state.customActions[i].id === id) return state.customActions[i];
        }
        return null;
    }
    function upsertCustom(act) {
        var idx = -1;
        for (var i = 0; i < state.customActions.length; i++) {
            if (state.customActions[i].id === act.id) { idx = i; break; }
        }
        caRegister(act); // 注册到 BC（重编辑时先注销旧定义，保证 dictionary 刷新）
        if (idx >= 0) state.customActions[idx] = act;
        else state.customActions.push(act);
        saveCustomActions();
    }
    function deleteCustom(id) {
        var act = getCustom(id);
        if (!act) return;
        caUnregister(act);
        state.customActions = state.customActions.filter(function(a) { return a.id !== id; });
        // 若删除的是 echo 导入动作，且没有同名动作残留，则取消屏蔽 echo 原始动作
        if (act.source === 'echo' && act.name && !state.customActions.some(function(a) { return a.name === act.name && a.source === 'echo'; })) {
            state.echoSuppressed.delete(act.name);
            if (act.echoName) state.echoSuppressed.delete(act.echoName);
            saveEchoSuppressed();
        }
        // 若删除的是小酥来源动作，则解除其原版(XSAct_)屏蔽，使其重新可见
        if (act.source === 'xiaosu' && act.xiaosuName) {
            state.echoSuppressed.delete(act.xiaosuName);
            saveEchoSuppressed();
        }
        saveCustomActions();
    }
    /**
     * echo/回声 导入动作屏蔽机制：
     * 当用户把 echo 自定义动作导入到本插件后，本插件会生成 QiAct_ 前缀的新 BC Activity。
     * 如果不把 echo 端同名的原始 Activity 屏蔽，动作面板和 BC 原生动作列表里会出现两个同名动作。
     * 方案：
     *   1. 导入时记录 echo 原始动作名（data[].Name）。
     *   2. 启动/导入后从 AssetAllActivities / ActivityFemale3DCGOrdering 中移除这些原始名。
     *   3. hook ActivityAllowedForGroup 作为兜底，始终过滤掉 suppressed 名。
     *   4. 删除导入的 echo 动作时从屏蔽集合中移除，恢复 echo 原始动作。
     */
    function loadEchoSuppressed() {
        try {
            var arr = loadSetting(S_ECHO_SUPPRESS, []);
            if (!Array.isArray(arr)) arr = [];
            state.echoSuppressed = new Set(arr.filter(function(n) { return typeof n === 'string' && n; }));
        } catch (e) {
            state.echoSuppressed = new Set();
        }
    }
    function saveEchoSuppressed() {
        try { persist(S_ECHO_SUPPRESS, Array.from(state.echoSuppressed)); } catch (e) { console.warn('[QiAct] 持久化 echo 屏蔽集合失败（已忽略）:', e && e.message); }
    }
    function rebuildEchoSuppressed() {
        // 以持久化的屏蔽集合为基础，同步当前所有 source==='echo' 的自定义动作名，
        // 并扫描 BC 注册表 / echo 原始数据把真实 echo 原始 Activity 名（如 笨蛋笨Luzi_xw58d）一起加进屏蔽。
        loadEchoSuppressed();
        state.echoPrefixes = new Set();   // 重建：仅保留已导入 echo 动作的中文前缀集合
        var echoData = caGetEchoData();
        state.customActions.forEach(function(a) {
            if (!a || a.source !== 'echo' || !a.name) return;
            // 1. 直接用导入时记录的原始名
            if (a.echoName && typeof a.echoName === 'string') state.echoSuppressed.add(a.echoName);
            if (Array.isArray(a.echoNames)) a.echoNames.forEach(function(n) { if (n) state.echoSuppressed.add(n); });
            // 收集中文显示前缀（安全前缀兜底用，只匹配 echo 命名空间，不误伤 BC 原生动作）
            var _p1 = caExtractChinesePrefix(a.name); if (_p1) state.echoPrefixes.add(_p1);
            var _p2 = caExtractChinesePrefix(a.echoName); if (_p2) state.echoPrefixes.add(_p2);
            // 2. 从 echo 数据中查找对应条目，把 key / item.Name 都加入屏蔽
            if (echoData) {
                var entry = caFindEchoEntry(echoData, a.name);
                if (!entry && a.echoName) entry = caFindEchoEntry(echoData, a.echoName);
                if (entry) {
                    var resolved = caResolveEchoNames(entry.key, entry.item.Name);
                    state.echoSuppressed.add(entry.key);
                    state.echoSuppressed.add(entry.item.Name);
                    state.echoSuppressed.add(resolved.displayName);
                    state.echoSuppressed.add(resolved.rawName);
                    // 扫描注册表，把真实 Activity Name 也加进来
                    var found = caFindEchoNamesInRegistry(entry.item, entry.key, a.group);
                    found.forEach(function(n) { state.echoSuppressed.add(n); var _fp = caExtractChinesePrefix(n); if (_fp) state.echoPrefixes.add(_fp); });
                }
            }
            // 3. 兜底：用中文名扫描注册表
            var found = caFindEchoNamesInRegistry({ Name: a.name }, a.echoName, a.group);
            found.forEach(function(n) { state.echoSuppressed.add(n); });
        });
        saveEchoSuppressed();
    }
    function caSuppressEchoName(name) {
        if (!name) return;
        state.echoSuppressed.add(name);
        saveEchoSuppressed();
    }
    function caIsEchoSuppressed(name) {
        if (!name) return false;
        var n = String(name);
        // 1) 精确匹配：导入时记录的原始名 + 注册表扫描到的精确变体（如 笨蛋笨Luzi_uc09b0）
        if (state.echoSuppressed.has(n)) return true;
        // 2) 安全的中文前缀兜底：仅当 name 的中文前缀以“已导入 echo 动作的中文显示名前缀”开头，
        //    且该 name 不是本插件自定义动作（QiAct_）时，才视为 echo 原始变体需屏蔽。
        //    关键：BC 原生动作 Name 通常为英文，caExtractChinesePrefix 返回空，不会被误伤；
        //    前缀集合只来自用户真正导入的 echo 动作，因此不会扩大化删除正常动作。
        if (state.echoPrefixes && state.echoPrefixes.size) {
            var cp = caExtractChinesePrefix(n);
            if (cp && n.indexOf(CA_PREFIX) !== 0) {
                var it = state.echoPrefixes.values();
                for (var v = it.next(); !v.done; v = it.next()) {
                    var p = v.value;
                    if (p && cp.indexOf(p) === 0) return true;
                }
            }
        }
        return false;
    }
    /** 判断字符串是否包含中文 */
    function caIsChinese(s) { return typeof s === 'string' && /[\u4e00-\u9fa5]/.test(s); }
    /** 判断字符串是否像 echo 原始 Activity Name（非中文且含下划线或字母数字混合） */
    function caLooksLikeRawActivityName(s) {
        if (typeof s !== 'string' || !s) return false;
        if (s.indexOf('_') !== -1) return true;
        if (/^[A-Za-z0-9]+$/.test(s)) return true;
        return !caIsChinese(s);
    }
    /** 从 echo 扩展设置中读取「动作数据」 */
    function caGetEchoData() {
        try {
            var ext = Player && Player.ExtensionSettings;
            var echoKey = ext && Object.keys(ext).find(function(k) { return k.indexOf('ECHO') === 0; });
            return echoKey && ext[echoKey] && ext[echoKey]['动作数据'];
        } catch (e) { return null; }
    }
    /** 在 echo 动作数据中查找与指定名字对应的条目（key 或 Name 匹配） */
    function caFindEchoEntry(data, name) {
        if (!data || typeof name !== 'string' || !name) return null;
        for (var k in data) {
            var item = data[k];
            if (!item) continue;
            if (k === name || item.Name === name) return { key: k, item: item };
        }
        return null;
    }
    /** 解析 echo 数据条目：返回 { displayName, rawName }。
     *  规则：优先把纯中文当作用户可见的显示名，把含下划线/英文/数字更多的当作真实 Activity Name。
     *  若两者原始度相同，则 key 优先作为显示名。 */
    function caResolveEchoNames(k, itemName) {
        function rawScore(s) {
            if (typeof s !== 'string' || !s) return 0;
            var score = 0;
            if (s.indexOf('_') !== -1) score += 3;
            if (/^[A-Za-z0-9_]/.test(s)) score += 1;
            // 纯中文（不含英文/数字/下划线）原始度更低
            if (/^[\u4e00-\u9fa5]+$/.test(s)) score -= 2;
            return score;
        }
        var kScore = rawScore(k);
        var nScore = rawScore(itemName);
        var displayName = k, rawName = itemName;
        if (kScore > nScore) { displayName = itemName; rawName = k; }
        else if (nScore > kScore) { displayName = k; rawName = itemName; }
        // 原始度相同时：按旧逻辑，key 作为显示名
        else if (!caIsChinese(k) && caIsChinese(itemName)) { displayName = itemName; rawName = k; }
        return { displayName: displayName || k, rawName: rawName || itemName };
    }

    /** 提取字符串开头的中文部分（echo 原始 Activity 名通常是「中文名<ModPrefix>_<ID>」格式） */
    function caExtractChinesePrefix(s) {
        if (!s) return '';
        var m = String(s).match(/^[\u4e00-\u9fa5]+/);
        return m ? m[0] : '';
    }
    /** 辅助：把 Target / TargetSelf 统一归一化为数组（兼容 echo 注册时使用的字符串形式） */
    function caActivityTargets(a) {
        var t = [];
        if (Array.isArray(a.Target)) t = t.concat(a.Target);
        else if (a.Target) t.push(a.Target);
        if (Array.isArray(a.TargetSelf)) t = t.concat(a.TargetSelf);
        else if (a.TargetSelf) t.push(a.TargetSelf);
        return t;
    }

    /** 根据导入的 echo 数据，在 BC 全局 Activity 注册表中找出应被屏蔽的原始 Activity 真实名字。
     *  echo 存储的 item.Name 可能是中文显示名（如「笨蛋笨」），而实际注册名会带随机后缀
     *  （如「笨蛋笨Luzi_xw58d」），直接按 item.Name 匹配会漏网，导致面板仍显示原始 ID。
     *  这里按：精确名、中文前缀、同部位 三个维度匹配，把真实注册名加入屏蔽集合。
     *  candidates 包括 item.Name 和 echo 数据 key，覆盖不同版本 echo 的存储格式。 */
    function caFindEchoNamesInRegistry(item, dataKey, group) {
        var names = new Set();
        try {
            var fam = (Player && Player.AssetFamily) || 'Female3DCG';
            var acts = caRawAllActivities(fam);
            if (!Array.isArray(acts)) return names;
            var candidates = [item.Name, dataKey].filter(function(n) { return typeof n === 'string' && n; });
            var ourPrefix = CA_PREFIX;

            // 1. 精确匹配：item.Name / dataKey 刚好就是注册名
            candidates.forEach(function(n) {
                acts.forEach(function(a) {
                    if (a && a.Name === n && a.Name.indexOf(ourPrefix) !== 0) names.add(a.Name);
                });
            });

            // 2. 中文前缀匹配：注册名以「中文显示名」开头，且同部位（如 笨蛋笨 -> 笨蛋笨Luzi_xw58d）
            candidates.forEach(function(n) {
                var prefix = caExtractChinesePrefix(n);
                if (!prefix) return;
                acts.forEach(function(a) {
                    if (!a || !a.Name) return;
                    if (a.Name.indexOf(ourPrefix) === 0) return;
                    if (a.Name.indexOf(prefix) !== 0) return;
                    // 同部位校验：group 一致或该项注册时未指定部位则放行
                    if (group && caActivityTargets(a).indexOf(group) === -1) return;
                    names.add(a.Name);
                });
            });
        } catch (e) { console.warn('[QiAct] 扫描 echo 原始动作名失败:', e.message); }
        return names;
    }
    /** 读取 BC 原生活动数组（绕过本插件对 AssetAllActivities 的 hook，拿到未过滤的原始数组）。
     *  本插件内部需要枚举/改写活动注册表时（注册自定义动作、扫描 echo 原始名、物理移除屏蔽项）
     *  必须使用此函数，否则会读到被 hook 过滤后的副本，导致 push/splice 落到临时数组上、注册失效。
     *  注意：本 BC 版本 AssetAllActivities 仅在 family==='Female3DCG' 时返回全局 ActivityFemale3DCG。 */
    function caRawAllActivities(fam) {
        try {
            if (typeof ActivityFemale3DCG !== 'undefined' && Array.isArray(ActivityFemale3DCG)) return ActivityFemale3DCG;
        } catch (e) { silent(e, 'getActivitiesNative'); }
        try { if (typeof AssetAllActivities === 'function') return AssetAllActivities(fam || 'Female3DCG'); } catch (e) { silent(e, 'getActivitiesAssetAll'); }
        return [];
    }
    /**
     * 物理移除 echo 端已导入的同名原始 Activity（精确匹配 echoSuppressed 集合中的名字）。
     * 与旧实现不同：仅按「精确名 + 安全中文前缀」匹配移除，绝不按宽前缀批量 splice，
     * 因此不会误伤 BC 原版 / LSCG / Liko / 小酥 等正常动作。
     * 配合 ActivityAllowedForGroup hook（显示期过滤）与 AssetAllActivities hook（枚举期过滤）三重兜底，
     * 彻底解决 echo 原始动作在面板/原生列表里漏网、以及使用后英文乱码的问题。
     */
    function caRemoveSuppressedEchoActivities() {
        try {
            if (!state.echoSuppressed || state.echoSuppressed.size === 0) return;
            var acts = caRawAllActivities((Player && Player.AssetFamily) || 'Female3DCG');
            if (Array.isArray(acts)) {
                for (var i = acts.length - 1; i >= 0; i--) {
                    var nm = acts[i] && acts[i].Name;
                    if (nm && caIsEchoSuppressed(nm)) acts.splice(i, 1);
                }
            }
            if (Array.isArray(ActivityFemale3DCGOrdering)) {
                for (var j = ActivityFemale3DCGOrdering.length - 1; j >= 0; j--) {
                    if (caIsEchoSuppressed(ActivityFemale3DCGOrdering[j])) ActivityFemale3DCGOrdering.splice(j, 1);
                }
            }
        } catch (e) { console.warn('[QiAct] 物理移除 echo 原始动作失败（已忽略）:', e.message); }
    }
    /** 迁移完成后清理原 echo/回声 中的「动作数据」。
     *  仅清空其 ExtensionSettings[ECHO]['动作数据']（不动 echo 其他配置），
     *  并刷新屏蔽集合（持续隐藏任何残留 echo 活动名）。数据由 BC 持久化保存。 */
    function caCleanupEchoData() {
        try {
            var ext = Player && Player.ExtensionSettings;
            var echoKey = ext && Object.keys(ext).find(function(k) { return k.indexOf('ECHO') === 0; });
            if (!echoKey || !ext[echoKey]) { toast('未找到 echo 数据', '#FF5C5C'); return; }
            var echoObj = ext[echoKey];
            var data = echoObj['动作数据'];
            var before = (data && typeof data === 'object') ? Object.keys(data).length : 0;

            // 关键：在清空 echo 数据前，先把 echo 原始数据中所有能定位到的真实 Activity Name
            // （如 笨蛋笨Luzi_xxx）锁定进屏蔽集合。清空 echoData 后，rebuildEchoSuppressed
            // 就无法再从 echoData 反查真实注册名，会导致物理移除漏网。
            if (data && typeof data === 'object') {
                Object.keys(data).forEach(function(k) {
                    var item = data[k];
                    if (!item) return;
                    state.echoSuppressed.add(k);
                    if (item.Name) {
                        state.echoSuppressed.add(item.Name);
                        var resolved = caResolveEchoNames(k, item.Name);
                        state.echoSuppressed.add(resolved.displayName);
                        state.echoSuppressed.add(resolved.rawName);
                    }
                    // 按 item 自身 target 扫描注册表，把真实 Activity Name 也加进屏蔽
                    var targets = [];
                    if (item.Target) {
                        if (Array.isArray(item.Target)) targets = targets.concat(item.Target);
                        else targets.push(item.Target);
                    }
                    if (item.TargetSelf) {
                        if (Array.isArray(item.TargetSelf)) targets = targets.concat(item.TargetSelf);
                        else targets.push(item.TargetSelf);
                    }
                    var group = targets[0] || (state.customActions.find(function(a) {
                        return a.name === k || a.name === (item && item.Name) || a.echoName === k || a.echoName === (item && item.Name);
                    }) || {}).group;
                    var found = caFindEchoNamesInRegistry(item, k, group);
                    found.forEach(function(n) { state.echoSuppressed.add(n); });
                });
                saveEchoSuppressed();
            }
            // 先物理移除一次当前已注册的 echo 原始动作
            caRemoveSuppressedEchoActivities();

            // 清空 echo 扩展设置中的动作数据
            echoObj['动作数据'] = {};

            // 持久化回 BC（优先专用 API，回退到整账户保存）
            try {
                if (typeof PreferenceSetExtensionSettings === 'function') {
                    PreferenceSetExtensionSettings(echoKey, echoObj);
                } else if (typeof ServerAccountUpdate === 'function') {
                    ServerAccountUpdate();
                } else if (ServerAccountUpdate && typeof ServerAccountUpdate.QueueData === 'function' && typeof ServerAccountUpdate.SyncToServer === 'function') {
                    // 部分 BC 版本中 ServerAccountUpdate 为 AccountUpdater 实例（非函数），
                    // 需手动 QueueData + SyncToServer 才能把 ExtensionSettings 落库。
                    ServerAccountUpdate.QueueData('ExtensionSettings', Player.ExtensionSettings);
                    ServerAccountUpdate.SyncToServer();
                }
            } catch (e) { console.warn('[QiAct] 持久化 echo 设置失败（已忽略）:', e && e.message); }

            // 清空 echoData 后再次重建屏蔽集合并移除残留；延迟再扫一次防止 echo 异步回写
            rebuildEchoSuppressed();
            caRemoveSuppressedEchoActivities();
            setTimeout(function() {
                try { rebuildEchoSuppressed(); caRemoveSuppressedEchoActivities(); }
                catch (e) { console.warn('[QiAct] 延迟清理 echo 残留失败（已忽略）:', e && e.message); }
            }, 1200);

            toast('已清理原 echo 数据（' + before + ' 项）', '#46E0A0');
            updateCustomActionPanel(state.selectedTarget);
        } catch (e) { toast('清理失败：' + e.message, '#FF5C5C'); }
    }
    function caNewId() { return 'ca_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7); }

    /** 我的动作面板：列表视图 或 编辑视图 */


    function updateCustomActionPanel(charObj) {
        if (!state.actionPanelEl) return;
        var titleEl = state.actionPanelEl.querySelector('#xsact-panel-title');
        var listEl = state.actionPanelEl.querySelector('#xsact-action-list');
        if (!titleEl || !listEl) return;
        var allBtn = state.actionPanelEl.querySelector('#xsact-all-btn');
        if (allBtn) allBtn.disabled = true; // 自定义动作语义明确，不支持全员广播

        if (state.editingCustomId) {
            var act = getCustom(state.editingCustomId);
            if (!act) { state.editingCustomId = null; updateCustomActionPanel(charObj); return; }
            renderCustomEditor(act, charObj, listEl, titleEl);
            return;
        }

        // ── 列表视图 ──
        titleEl.textContent = (charObj ? characterDisplayName(charObj) + ' → ' : '') + '我的动作（测试版）';
        var html = '';
        var acts = state.customActions;
        var editMode = state.caEditMode;
        var selSet = {};
        (state.caSelected || []).forEach(function(id){ selSet[id] = true; });
        var allOn = acts.length > 0 && acts.every(function(a){ return a.visible !== false; });

        html += '<div class="xsact-ca-view">';
        // 工具栏
        html += '<div class="xsact-ca-toolbar">' +
            '<input type="text" id="xsact-ca-search" class="xsact-ca-search' + (editMode ? ' is-hidden' : '') + '" placeholder="搜索动作...">' +
            '<div class="xsact-ca-toolbar-btns">' +
            '<button class="xsact-ca-new" id="xsact-ca-new" title="新建">' + svgIcon('plus', 14) + '<span>新建</span></button>' +
            '<div class="xsact-ca-import-wrap">' +
            '<button class="xsact-ca-import" id="xsact-ca-import" title="导入" data-tooltip="导入@@从 echo/回声 或本地 JSON 导入自定义动作">' + svgIcon('download', 14) + '</button>' +
            '<div class="xsact-ca-import-menu hidden" id="xsact-ca-import-menu">' +
            '<button data-import="echo">从 echo/回声 导入</button>' +
            '<button data-import="file">从本地 JSON 导入</button>' +
            '</div>' +
            '<input type="file" id="xsact-ca-file-input" class="xsact-ca-file-input" accept="application/json,.json">' +
            '</div>' +
            '<button class="xsact-ca-export" id="xsact-ca-export" title="导出为 JSON">' + svgIcon('upload', 14) + '</button>' +
            '<button class="xsact-ca-editmode' + (editMode ? ' is-active' : '') + '" id="xsact-ca-editmode" title="' + (editMode ? '完成编辑' : '编辑模式：拖动排序与批量管理') + '">' + svgIcon('bulkEdit', 16) + '</button>' +
            '<button class="xsact-ca-toggleall' + (allOn ? ' is-on' : '') + '" id="xsact-ca-toggleall" title="' + (allOn ? '当前全部开启，点击全部关闭' : '当前全部关闭，点击全部开启') + '">' + svgIcon(allOn ? 'toggleOn' : 'toggleOff', 16) + '</button>' +
            '</div></div>';

        // 分类 chip 过滤栏：按来源（all/xiaosu/native/echo）单选；空分类置灰
        var _counts = { all: acts.length, xiaosu: 0, native: 0, echo: 0 };
        acts.forEach(function(a) {
            if (a.source === 'xiaosu') _counts.xiaosu++;
            else if (a.source === 'echo') _counts.echo++;
            else _counts.native++;
        });
        var _chips = [
            { key: 'all', label: '全部', count: _counts.all, color: 'all' },
            { key: 'xiaosu', label: '小酥', count: _counts.xiaosu, color: 'xiaosu' },
            { key: 'native', label: '我的', count: _counts.native, color: 'native' },
            { key: 'echo', label: 'echo', count: _counts.echo, color: 'echo' }
        ];
        html += '<div class="xsact-ca-chips" id="xsact-ca-chips">';
        _chips.forEach(function(ch) {
            var active = state.caFilter === ch.key;
            var empty = ch.count === 0 && ch.key !== 'all';
            var dis = empty ? ' is-disabled' : '';
            var act = active ? ' is-active' : '';
            html += '<button type="button" class="xsact-ca-chip ' + ch.color + act + dis + '" data-filter="' + ch.key + '"' + (empty ? ' disabled' : '') + '>' +
                '<span class="xsact-ca-chip-label">' + ch.label + '</span>' +
                '<span class="xsact-ca-chip-count">' + ch.count + '</span>' +
            '</button>';
        });
        html += '</div>';

        // 编辑模式批量栏
        if (editMode) {
            html += '<div class="xsact-ca-batchbar" id="xsact-ca-batchbar">' +
                '<button class="xsact-ca-select-all" id="xsact-ca-select-all">全选</button>' +
                '<span class="xsact-ca-selected-count" id="xsact-ca-selected-count">已选 0 个</span>' +
                '<div class="xsact-ca-batch-actions">' +
                '<button id="xsact-ca-batch-close" disabled>批量关闭</button>' +
                '<button id="xsact-ca-batch-delete" class="xsact-ca-batch-del" disabled>批量删除</button>' +
                '</div></div>';
        }

        html += '<div class="xsact-ca-beta">自定义动作功能当前为【测试版(Beta)】，仍在开发中，可能存在不稳定或未完善之处，建议谨慎使用并及时反馈问题。</div>';

        // 迁移提示：原 echo/回声 中仍有动作数据 → 提供一键清理入口
        try {
            var _echoData = caGetEchoData();
            var _hasEchoSrc = state.customActions.some(function(a) { return a.source === 'echo'; });
            if (_echoData && Object.keys(_echoData).length && _hasEchoSrc) {
                html += '<div class="xsact-ca-echo-clean" id="xsact-ca-echo-clean">' +
                    '<div class="xsact-ca-echo-clean-text">检测到原 echo/回声 中仍有 <b>' + Object.keys(_echoData).length + '</b> 个自定义动作数据。迁移完成后建议清理，避免动作重复显示与使用后乱码。</div>' +
                    '<button class="xsact-ca-echo-clean-btn" id="xsact-ca-echo-clean-btn" type="button">清理原 echo 数据</button>' +
                '</div>';
            }
        } catch (e) { silent(e, 'renderEchoCleanHint'); }

        // 内置小酥动作包（单行极简：仅标题 + 紧凑开关，长描述走 title hover）
        // 仅在「小酥」chip 下显示 — 开关本身只对小酥分类有意义，
        // 其他分类下隐藏避免视觉干扰 + 杜绝「我的」tab 下开关位置漂移。
        if (state.caFilter === 'xiaosu') {
            html += '<div class="xsact-ca-xiaosu" id="xsact-ca-xiaosu">' +
                '<span class="xsact-ca-xiaosu-label" title="内置小酥动作包（XiaoSuActivity 全部 51 个动作，预编译进插件，离线可用，无需原版插件）">内置小酥动作包</span>' +
                '<label class="xsact-ca-toggle xsact-ca-xiaosu-switch" title="开启后，「我的动作」与 BC 原生动作列表显示小酥动作拓展的全部动作">' +
                    '<input type="checkbox" class="xsact-ca-xiaosu-pack"' + (state.xiaosuPack ? ' checked' : '') + '>' +
                    '<span class="xsact-ca-toggle-track"></span>' +
                '</label>' +
            '</div>';
        }

        if (!acts.length) {
            html += '<div class="xsact-qa-empty xsact-ca-empty">还没有自定义动作。点「新建」创建，或点「导入」从 echo/回声 迁移。</div>';
        } else {
            // 按当前 chip 过滤（不改 customActions 顺序，仅隐藏不匹配卡片）
            var _flt = state.caFilter || 'all';
            var _visibleActs = acts.filter(function(a) {
                if (_flt === 'all') return true;
                if (_flt === 'xiaosu') return a.source === 'xiaosu';
                if (_flt === 'echo') return a.source === 'echo';
                if (_flt === 'native') return !a.source || a.source === 'native';
                return true;
            });
            if (!_visibleActs.length) {
                html += '<div class="xsact-qa-empty xsact-ca-empty xsact-ca-filter-empty">当前分类下没有动作。</div>';
            } else {
                html += '<div class="xsact-ca-list' + (editMode ? ' is-editing' : '') + '">';
                _visibleActs.forEach(function(a) {
                var scopeBadge = a.scope === 'self' ? '<span class="xsact-ca-badge self">仅自己</span>'
                    : a.scope === 'other' ? '<span class="xsact-ca-badge other">仅他人</span>'
                    : '<span class="xsact-ca-badge any">皆可</span>';
                var sourceBadge = a.source === 'xiaosu' ? '<span class="xsact-ca-src xiaosu" title="内置小酥动作包（预编译，无需原版插件）">小酥</span>' : a.source === 'echo' ? '<span class="xsact-ca-src echo" title="来自 echo/回声 导入">echo</span>' : '<span class="xsact-ca-src native" title="本插件创建">QiAct</span>';
                var partLbl = (BODY_PARTS.find(function(p) { return p.group === a.group; }) || {}).label || a.group;
                var isVisible = a.visible !== false;
                var isSel = !!selSet[a.id];
                if (editMode) {
                    html += '<div class="xsact-ca-card is-edit' + (isSel ? ' is-selected' : '') + (isVisible ? '' : ' is-hidden') + '" data-id="' + a.id + '" draggable="true">' +
                        '<span class="xsact-ca-handle" title="拖动排序">' + svgIcon('grip', 14) + '</span>' +
                        '<div class="xsact-ca-info">' +
                            '<div class="xsact-ca-title">' +
                                '<span class="xsact-ca-name">' + escapeHtml(a.name) + '</span>' +
                                scopeBadge + sourceBadge +
                            '</div>' +
                            '<div class="xsact-ca-meta">' +
                                '<span class="xsact-ca-part">' + escapeHtml(partLbl) + '</span>' +
                                '<span class="xsact-ca-vis-dot ' + (isVisible ? 'on' : 'off') + '">' + (isVisible ? '显示中' : '已隐藏') + '</span>' +
                            '</div>' +
                        '</div>' +
                        '<span class="xsact-ca-check" aria-hidden="true">' + svgIcon('check', 14) + '</span>' +
                    '</div>';
                } else {
                    html += '<div class="xsact-ca-card' + (isVisible ? '' : ' is-hidden') + '" data-id="' + a.id + '">' +
                        '<div class="xsact-ca-info">' +
                            '<div class="xsact-ca-title">' +
                                '<span class="xsact-ca-name">' + escapeHtml(a.name) + '</span>' +
                                scopeBadge + sourceBadge +
                            '</div>' +
                            '<div class="xsact-ca-meta">' +
                                '<label class="xsact-ca-toggle" title="在「动作」面板和 BC 原生动作列表中显示">' +
                                    '<input type="checkbox" class="xsact-ca-visible" data-id="' + a.id + '"' + (isVisible ? ' checked' : '') + '>' +
                                    '<span class="xsact-ca-toggle-track"></span>' +
                                    '<span class="xsact-ca-toggle-label">' + (isVisible ? '显示' : '隐藏') + '</span>' +
                                '</label>' +
                                '<span class="xsact-ca-part">' + escapeHtml(partLbl) + '</span>' +
                            '</div>' +
                        '</div>' +
                        '<div class="xsact-ca-btns">' +
                            '<button class="xsact-ca-run" title="对当前目标执行" data-id="' + a.id + '">' + svgIcon('play', 14) + '</button>' +
                            '<button class="xsact-ca-edit" title="编辑" data-id="' + a.id + '">' + svgIcon('pencil', 14) + '</button>' +
                            '<button class="xsact-ca-delete" title="删除" data-tooltip-type="danger" data-id="' + a.id + '">' + svgIcon('trash', 14) + '</button>' +
                        '</div>' +
                    '</div>';
                }
            });
            html += '</div>';
            }
        }
        html += '</div>';
        listEl.innerHTML = html;

        var newBtn = listEl.querySelector('#xsact-ca-new');
        if (newBtn) newBtn.addEventListener('click', function() {
            state.editingCustomId = caNewId();
            var draft = { id: state.editingCustomId, name: '', scope: 'other', group: 'ItemMouth', dialog: '', dialogSelf: '', createdAt: Date.now(), source: 'native', visible: true };
            renderCustomEditor(draft, charObj, listEl, titleEl);
        });
        var importBtn = listEl.querySelector('#xsact-ca-import');
        var importMenu = listEl.querySelector('#xsact-ca-import-menu');
        if (importBtn && importMenu) {
            importBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                importMenu.classList.toggle('hidden');
            });
            importMenu.querySelectorAll('button').forEach(function(mb) {
                mb.addEventListener('click', function(e) {
                    e.stopPropagation();
                    importMenu.classList.add('hidden');
                    var mode = mb.dataset.import;
                    if (mode === 'echo') { importCustomFromEcho(); }
                    else if (mode === 'file') { listEl.querySelector('#xsact-ca-file-input').click(); }
                });
            });
            var closeMenu = function(ev) { if (!importMenu.contains(ev.target) && !importBtn.contains(ev.target)) importMenu.classList.add('hidden'); };
            state.actionPanelEl.addEventListener('click', closeMenu);
        }
        var fileInput = listEl.querySelector('#xsact-ca-file-input');
        if (fileInput) fileInput.addEventListener('change', function() {
            var file = fileInput.files && fileInput.files[0];
            if (file) importCustomFromFile(file);
            fileInput.value = '';
        });
        var exportBtn = listEl.querySelector('#xsact-ca-export');
        if (exportBtn) exportBtn.addEventListener('click', exportCustomActions);
        var echoCleanBtn = listEl.querySelector('#xsact-ca-echo-clean-btn');
        if (echoCleanBtn) echoCleanBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            qiactConfirm({
                title: '清理原 echo 数据',
                body: '确定清理原 echo/回声 中的自定义动作数据吗？\n仅删除其「动作数据」，不影响本插件与其他配置（清理后系统更稳定）。',
                confirmText: '清理',
                danger: true
            }).then(function(ok) {
                if (ok) caCleanupEchoData();
            });
        });
        var packToggle = listEl.querySelector('.xsact-ca-xiaosu-pack');
        if (packToggle) packToggle.addEventListener('change', function() {
            setXiaosuPack(!!packToggle.checked);
            updateCustomActionPanel(charObj);
        });
        // chip 过滤：点击切换 caFilter，持久化，重新渲染
        listEl.querySelectorAll('.xsact-ca-chip').forEach(function(btn) {
            if (btn.disabled) return;
            btn.addEventListener('click', function() {
                var k = btn.dataset.filter;
                if (!k || state.caFilter === k) return;
                state.caFilter = k;
                persist(S_CA_FILTER, k);
                updateCustomActionPanel(charObj);
            });
        });
        var searchInput = listEl.querySelector('#xsact-ca-search');
        if (searchInput) searchInput.addEventListener('input', function() {
            var q = searchInput.value.trim().toLowerCase();
            listEl.querySelectorAll('.xsact-ca-card').forEach(function(card) {
                var nm = (card.querySelector('.xsact-ca-name') || {}).textContent || '';
                card.style.display = (!q || nm.toLowerCase().indexOf(q) !== -1) ? '' : 'none';
            });
        });

        // 编辑模式按钮（进入 / 退出）
        var editModeBtn = listEl.querySelector('#xsact-ca-editmode');
        if (editModeBtn) editModeBtn.addEventListener('click', function() {
            state.caEditMode = !state.caEditMode;
            state.caSelected = [];
            updateCustomActionPanel(charObj);
        });

        // 一键切换所有开关：当前若全部已开启则全部关闭，否则全部开启
        var toggleAllBtn = listEl.querySelector('#xsact-ca-toggleall');
        if (toggleAllBtn) toggleAllBtn.addEventListener('click', function() {
            var turnOn = !allOn;
            acts.forEach(function(a) {
                a.visible = turnOn;
                caRegister(a);
            });
            saveCustomActions();
            updateCustomActionPanel(charObj);
            toast(turnOn ? '已开启全部 ' + acts.length + ' 个动作' : '已关闭全部 ' + acts.length + ' 个动作', turnOn ? '#46E0A0' : '#888');
        });

        // 非编辑模式：执行 / 编辑 / 删除 / 开关
        listEl.querySelectorAll('.xsact-ca-run').forEach(function(btn) {
            btn.addEventListener('click', function(e) { e.stopPropagation(); runCustomAction(btn.dataset.id, charObj); });
        });
        listEl.querySelectorAll('.xsact-ca-edit').forEach(function(btn) {
            btn.addEventListener('click', function(e) { e.stopPropagation(); state.editingCustomId = btn.dataset.id; updateCustomActionPanel(charObj); });
        });
        listEl.querySelectorAll('.xsact-ca-delete').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                var id = btn.dataset.id;
                var a = getCustom(id);
                if (a) qiactConfirm({ title: '删除动作', body: '确定删除自定义动作「' + a.name + '」吗？', confirmText: '删除', danger: true }).then(function(ok) { if (!ok) return; deleteCustom(id); updateCustomActionPanel(charObj); toast('已删除', '#888'); });
            });
        });
        listEl.querySelectorAll('.xsact-ca-visible').forEach(function(chk) {
            chk.addEventListener('change', function() {
                var id = chk.dataset.id;
                var a = getCustom(id);
                if (!a) return;
                a.visible = !!chk.checked;
                saveCustomActions();
                caRegister(a);
                updateCustomActionPanel(charObj);
                toast(a.visible ? '已显示「' + a.name + '」' : '已隐藏「' + a.name + '」', a.visible ? '#46E0A0' : '#888');
            });
        });

        // 编辑模式：批量栏 + 点击选中 + 拖拽排序
        if (editMode) {
            var selectAllBtn = listEl.querySelector('#xsact-ca-select-all');
            var selectedCountEl = listEl.querySelector('#xsact-ca-selected-count');
            var batchCloseBtn = listEl.querySelector('#xsact-ca-batch-close');
            var batchDeleteBtn = listEl.querySelector('#xsact-ca-batch-delete');
            function syncSel() {
                var cards = listEl.querySelectorAll('.xsact-ca-card.is-edit');
                cards.forEach(function(card) {
                    var id = card.dataset.id;
                    if (state.caSelected.indexOf(id) !== -1) card.classList.add('is-selected');
                    else card.classList.remove('is-selected');
                });
                if (selectedCountEl) selectedCountEl.textContent = '已选 ' + state.caSelected.length + ' 个';
                if (batchCloseBtn) batchCloseBtn.disabled = state.caSelected.length === 0;
                if (batchDeleteBtn) batchDeleteBtn.disabled = state.caSelected.length === 0;
                if (selectAllBtn) selectAllBtn.textContent = (state.caSelected.length > 0 && state.caSelected.length === cards.length) ? '取消全选' : '全选';
            }
            if (selectAllBtn) selectAllBtn.addEventListener('click', function() {
                var cards = Array.from(listEl.querySelectorAll('.xsact-ca-card.is-edit'));
                var allSelected = state.caSelected.length > 0 && state.caSelected.length === cards.length;
                state.caSelected = allSelected ? [] : cards.map(function(c){ return c.dataset.id; });
                syncSel();
            });
            listEl.querySelectorAll('.xsact-ca-card.is-edit').forEach(function(card) {
                card.addEventListener('click', function(e) {
                    if (e.target.closest('.xsact-ca-handle')) return; // 拖拽手柄不触发选中
                    var id = card.dataset.id;
                    var idx = state.caSelected.indexOf(id);
                    if (idx === -1) state.caSelected.push(id);
                    else state.caSelected.splice(idx, 1);
                    syncSel();
                });
            });
            if (batchCloseBtn) batchCloseBtn.addEventListener('click', function() {
                if (!state.caSelected.length) return;
                state.caSelected.slice().forEach(function(id) {
                    var a = getCustom(id);
                    if (!a) return;
                    a.visible = false;
                    caRegister(a);
                });
                saveCustomActions();
                updateCustomActionPanel(charObj);
                toast('已批量关闭 ' + state.caSelected.length + ' 个动作', '#888');
            });
            if (batchDeleteBtn) batchDeleteBtn.addEventListener('click', function() {
                if (!state.caSelected.length) return;
                var names = state.caSelected.map(function(id) { var a = getCustom(id); return a ? a.name : ''; }).filter(Boolean).join('、');
                var n = state.caSelected.length;
                qiactConfirm({
                    title: '批量删除 ' + n + ' 个动作',
                    body: '确定批量删除以下动作吗？\n' + names,
                    confirmText: '全部删除',
                    danger: true
                }).then(function(ok) {
                    if (!ok) return;
                    state.caSelected.slice().forEach(function(id) { deleteCustom(id); });
                    state.caSelected = [];
                    updateCustomActionPanel(charObj);
                    toast('已批量删除 ' + n + ' 个动作', '#FF5C5C');
                });
            });

            // 拖拽排序
            var dragList = listEl.querySelector('.xsact-ca-list.is-editing');
            if (dragList) {
                var dragEl = null;
                dragList.addEventListener('dragstart', function(e) {
                    var card = e.target.closest('.xsact-ca-card.is-edit');
                    if (!card) return;
                    dragEl = card;
                    state.caDragId = card.dataset.id;
                    e.dataTransfer.effectAllowed = 'move';
                    try { e.dataTransfer.setData('text/plain', card.dataset.id); } catch (err) { console.warn('[QiAct] 拖拽 setData 失败（已忽略）:', err && err.message); }
                    setTimeout(function(){ if (dragEl) dragEl.classList.add('dragging'); }, 0);
                });
                dragList.addEventListener('dragover', function(e) {
                    if (!dragEl) return;
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    var after = getCaDragAfter(dragList, e.clientY);
                    if (after == null) dragList.appendChild(dragEl);
                    else dragList.insertBefore(dragEl, after);
                });
                dragList.addEventListener('drop', function(e) { if (dragEl) e.preventDefault(); });
                dragList.addEventListener('dragend', function() {
                    if (!dragEl) return;
                    dragEl.classList.remove('dragging');
                    dragEl = null;
                    var ids = Array.from(dragList.querySelectorAll('.xsact-ca-card.is-edit')).map(function(c){ return c.dataset.id; });
                    state.customActions.sort(function(a, b){ return ids.indexOf(a.id) - ids.indexOf(b.id); });
                    saveCustomActions();
                    updateCustomActionPanel(charObj);
                });
            }
            syncSel();
        }
    }

    /** 自定义动作列表拖拽排序：根据鼠标 Y 坐标计算插入位置
     *  （返回应插入其前的元素；null 表示插入到末尾）。 */


    function getCaDragAfter(container, y) {
        var els = Array.from(container.querySelectorAll('.xsact-ca-card.is-edit:not(.dragging)'));
        var closest = { offset: -Infinity, el: null };
        els.forEach(function(child) {
            var box = child.getBoundingClientRect();
            var offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                closest = { offset: offset, el: child };
            }
        });
        return closest.el;
    }

    /** 渲染一个迷你身体部位选择 SVG（用于自定义动作编辑器内）。
     *  复用 BC 原生 Zone 矩形，尺寸自适应容器。 */
    function renderBodyMapMini(container, selectedGroup, onSelect) {
        var rects = '';
        BODY_PARTS.forEach(function(part) {
            var zones = getPartZones(Player, part.group);
            zones.forEach(function(z) {
                var rx = Math.min(14, Math.min(z[2], z[3]) * 0.35);
                var sel = (selectedGroup === part.group) ? ' selected' : '';
                rects += '<rect class="xsact-body-part-zone' + sel + '" data-group="' + part.group +
                    '" x="' + z[0].toFixed(1) + '" y="' + z[1].toFixed(1) + '" width="' + z[2].toFixed(1) +
                    '" height="' + z[3].toFixed(1) + '" rx="' + rx.toFixed(1) + '" data-label="' + part.label + '"/>';
            });
        });
        var svg = '<svg class="xsact-body-mini-svg" viewBox="0 0 500 1000" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">' + rects + '</svg>';
        container.innerHTML = '<div class="xsact-body-mini-hint">点击框选身体部位</div>' + svg;
        var hint = container.querySelector('.xsact-body-mini-hint');
        container.querySelectorAll('.xsact-body-part-zone').forEach(function(zone) {
            zone.addEventListener('mouseenter', function() {
                if (hint) hint.textContent = zone.dataset.label || zone.dataset.group;
                zone.classList.add('hover');
            });
            zone.addEventListener('mouseleave', function() {
                if (hint) hint.textContent = '点击框选身体部位';
                zone.classList.remove('hover');
            });
            zone.addEventListener('click', function(e) {
                e.stopPropagation();
                var group = zone.dataset.group;
                container.querySelectorAll('.xsact-body-part-zone').forEach(function(z) {
                    z.classList.toggle('selected', z.dataset.group === group);
                });
                if (onSelect) onSelect(group, zone.dataset.label || group);
            });
        });
    }

    function renderCustomEditor(act, charObj, listEl, titleEl) {
        var isNew = !getCustom(act.id);
        titleEl.textContent = (isNew ? '新建' : '编辑') + '：自定义动作';
        var scope = act.scope || 'other';
        var group = act.group || 'ItemMouth';
        var partLbl = (BODY_PARTS.find(function(p) { return p.group === group; }) || {}).label || group;
        var html = '<div class="xsact-ca-editor">';
        html += '<div class="xsact-combo-field"><label>动作名称</label><input type="text" id="xsact-ca-name" value="' + escapeHtml(act.name) + '" placeholder="如：轻轻咬住"></div>';
        html += '<div class="xsact-combo-field"><label>谁能使用这个动作</label><div class="xsact-ca-scope" id="xsact-ca-scope">' +
            '<button data-scope="other" class="' + (scope === 'other' ? 'active' : '') + '">仅他人</button>' +
            '<button data-scope="self" class="' + (scope === 'self' ? 'active' : '') + '">仅自己</button>' +
            '<button data-scope="any" class="' + (scope === 'any' ? 'active' : '') + '">皆可</button>' +
            '</div></div>';
        html += '<div class="xsact-combo-field"><label>身体部位</label>' +
            '<div class="xsact-ca-part-display" id="xsact-ca-part-display"><span class="xsact-ca-part-label">' + escapeHtml(partLbl) + '（' + group + '）</span><span class="xsact-ca-part-change">点击下图重新选择</span></div>' +
            '<div class="xsact-ca-part-map" id="xsact-ca-part-map"></div>' +
            '<input type="hidden" id="xsact-ca-group" value="' + group + '">' +
            '</div>';
        html += '<div class="xsact-combo-field"><label>对他人时显示</label><textarea id="xsact-ca-dialog-raw" class="xsact-ca-raw" rows="2">' + escapeHtml(act.dialog) + '</textarea><div id="xsact-ca-dialog" class="xsact-ca-dialog-rich" contenteditable="true" tabindex="0" data-placeholder="如：轻轻咬住了 对方 的耳朵"></div></div>';
        html += '<div class="xsact-ca-hint">' +
            '<div class="xsact-ca-hint-title">可用占位符（点击插入）</div>' +
            '<div class="xsact-ca-hint-btns">' +
            '<button class="xsact-ca-token" data-token="{SourceCharacter}"><span class="xsact-ca-token-dot self"></span>自己</button>' +
            '<button class="xsact-ca-token" data-token="{TargetCharacter}"><span class="xsact-ca-token-dot other"></span>对方</button>' +
            '</div>' +
            '</div>';
        html += '<div class="xsact-combo-field"><label>对自己时显示</label><textarea id="xsact-ca-dialogself-raw" class="xsact-ca-raw" rows="2">' + escapeHtml(act.dialogSelf || '') + '</textarea><div id="xsact-ca-dialogself" class="xsact-ca-dialog-rich" contenteditable="true" tabindex="0" data-placeholder="如：被轻轻咬住了耳朵"></div></div>';
        html += '<div class="xsact-ca-preview" id="xsact-ca-preview"></div>';
        html += '<div class="xsact-combo-actions">' +
            '<button class="xsact-combo-save-btn" id="xsact-ca-save">保存</button>' +
            (isNew ? '' : '<button class="xsact-ca-del-btn" id="xsact-ca-del">删除</button>') +
            '<button class="xsact-combo-cancel-btn" id="xsact-ca-cancel">返回</button>' +
            '</div>';
        html += '</div>';
        listEl.innerHTML = html;

        var lastFocusedRich = listEl.querySelector('#xsact-ca-dialog');
        var lastFocusedRaw = listEl.querySelector('#xsact-ca-dialog-raw');
        function trackFocus(el, rawId) {
            if (!el) return;
            el.addEventListener('focus', function() { lastFocusedRich = el; lastFocusedRaw = listEl.querySelector('#' + rawId); });
            el.addEventListener('click', function() { lastFocusedRich = el; lastFocusedRaw = listEl.querySelector('#' + rawId); });
        }
        trackFocus(listEl.querySelector('#xsact-ca-name'), 'xsact-ca-name');
        trackFocus(listEl.querySelector('#xsact-ca-dialog'), 'xsact-ca-dialog-raw');
        trackFocus(listEl.querySelector('#xsact-ca-dialogself'), 'xsact-ca-dialogself-raw');
        // 对 raw textarea（调试或自动化场景）也同步跟踪
        ['#xsact-ca-dialog-raw', '#xsact-ca-dialogself-raw'].forEach(function(sel) {
            var rawEl = listEl.querySelector(sel);
            if (!rawEl) return;
            rawEl.addEventListener('focus', function() {
                lastFocusedRaw = rawEl;
                lastFocusedRich = listEl.querySelector('#' + rawEl.id.replace(/-raw$/, ''));
            });
        });

        function renderRichText(raw) {
            return escapeHtml(raw)
                .replace(/\{SourceCharacter\}/g, '<span class="xsact-token-pill" contenteditable="false" data-token="{SourceCharacter}">自己</span><span class="xsact-zwsp">&#8203;</span>')
                .replace(/\{TargetCharacter\}/g, '<span class="xsact-token-pill" contenteditable="false" data-token="{TargetCharacter}">对方</span><span class="xsact-zwsp">&#8203;</span>');
        }
        function extractRawFromRich(el) {
            var raw = '';
            function walk(nodes) {
                Array.from(nodes).forEach(function(node) {
                    if (node.nodeType === Node.TEXT_NODE) {
                        raw += node.textContent;
                    } else if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.classList && node.classList.contains('xsact-token-pill')) {
                            raw += node.dataset.token;
                        } else if (node.classList && node.classList.contains('xsact-zwsp')) {
                            // skip
                        } else {
                            walk(node.childNodes);
                        }
                    }
                });
            }
            walk(el.childNodes);
            return raw.replace(/\u200B/g, '');
        }
        function syncRichToRaw(richEl) {
            var rawEl = listEl.querySelector('#' + richEl.id + '-raw');
            if (!rawEl) return;
            rawEl.value = extractRawFromRich(richEl);
        }
        function syncRawToRich(rawEl) {
            var richEl = listEl.querySelector('#' + rawEl.id.replace(/-raw$/, ''));
            if (!richEl) return;
            richEl.innerHTML = renderRichText(rawEl.value);
        }
        function insertTokenPill(token, richEl) {
            var label = token === '{SourceCharacter}' ? '自己' : '对方';
            if (!richEl || richEl.contentEditable !== 'true') return;
            richEl.focus();
            var sel = window.getSelection();
            var range;
            if (!sel.rangeCount || !richEl.contains(sel.getRangeAt(0).commonAncestorContainer)) {
                range = document.createRange();
                range.selectNodeContents(richEl);
                range.collapse(false);
                sel.removeAllRanges();
                sel.addRange(range);
            } else {
                range = sel.getRangeAt(0);
            }
            // 删除当前选区内容（如用户选中了已有占位符 pill）
            range.deleteContents();
            var pill = document.createElement('span');
            pill.className = 'xsact-token-pill';
            pill.contentEditable = 'false';
            pill.dataset.token = token;
            pill.textContent = label;
            var zwsp = document.createElement('span');
            zwsp.className = 'xsact-zwsp';
            zwsp.textContent = '\u200B';
            var space = document.createTextNode(' ');
            var frag = document.createDocumentFragment();
            frag.appendChild(pill);
            frag.appendChild(zwsp);
            frag.appendChild(space);
            range.insertNode(frag);
            range.setStartAfter(space);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
            richEl.focus();
            syncRichToRaw(richEl);
            refreshPreview();
        }
        function insertToken(token) {
            // 占位符只应插入到两个 contenteditable 富文本框中；若最后聚焦的是名称输入框等，回退到默认对他人框
            var richEl = lastFocusedRich;
            if (!richEl || richEl.contentEditable !== 'true') richEl = listEl.querySelector('#xsact-ca-dialog');
            if (!richEl) {
                // 兜底：直接操作 raw textarea（对自动化/测试友好）
                var rawEl = lastFocusedRaw || listEl.querySelector('#xsact-ca-dialog-raw');
                if (!rawEl) return;
                var start = rawEl.selectionStart || 0;
                var end = rawEl.selectionEnd || 0;
                var before = rawEl.value.substring(0, start);
                var after = rawEl.value.substring(end);
                rawEl.value = before + token + after;
                var pos = start + token.length;
                rawEl.setSelectionRange(pos, pos);
                rawEl.focus();
                rawEl.dispatchEvent(new Event('input', { bubbles: true }));
                return;
            }
            insertTokenPill(token, richEl);
        }

        syncRawToRich(listEl.querySelector('#xsact-ca-dialog-raw'));
        syncRawToRich(listEl.querySelector('#xsact-ca-dialogself-raw'));

        listEl.querySelectorAll('.xsact-ca-token').forEach(function(btn) {
            // mousedown 阻止默认行为，防止按钮抢走富文本框焦点，避免插入后输入框"失活"
            btn.addEventListener('mousedown', function(e) { e.preventDefault(); });
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                insertToken(btn.dataset.token);
            });
        });

        var partMap = listEl.querySelector('#xsact-ca-part-map');
        var partDisplay = listEl.querySelector('#xsact-ca-part-display');
        var groupInput = listEl.querySelector('#xsact-ca-group');
        function updatePartLabel(g) {
            var p = BODY_PARTS.find(function(x) { return x.group === g; }) || {};
            var label = p.label || g;
            if (partDisplay) partDisplay.querySelector('.xsact-ca-part-label').textContent = label + '（' + g + '）';
            if (groupInput) groupInput.value = g;
        }
        if (partMap) {
            renderBodyMapMini(partMap, group, function(newGroup, newLabel) {
                updatePartLabel(newGroup);
                refreshPreview();
            });
        }

        function refreshPreview() {
            var nm = (listEl.querySelector('#xsact-ca-name') || {}).value || '动作';
            var dlg = (listEl.querySelector('#xsact-ca-dialog-raw') || {}).value || nm;
            var dlgSelf = (listEl.querySelector('#xsact-ca-dialogself-raw') || {}).value || '';
            var sc = (listEl.querySelector('#xsact-ca-scope') || {}).querySelector('.active');
            var scope = sc ? sc.dataset.scope : 'other';
            var src = (Player && (Player.Nickname || Player.Name)) || '某人';
            var tgt = (charObj && (charObj.Nickname || charObj.Name)) || '对方';
            // 根据“谁能使用”显示对应文本，any 时双行展示两种情形
            var preview;
            function resolveText(text, source, target) {
                return text.replace(/\{SourceCharacter\}/g, source).replace(/\{TargetCharacter\}/g, target);
            }
            if (scope === 'self') {
                // 仅自己：目标也是玩家自己，因此“对方”同样解析为玩家
                var textSelf = (dlgSelf.trim() ? dlgSelf : dlg).replace(/\{SourceCharacter\}/g, src).replace(/\{TargetCharacter\}/g, src);
                preview = textSelf; // 自己对自己，文本里已含角色，直接显示完整句子
            } else if (scope === 'any') {
                var textOther = resolveText(dlg, src, tgt);
                // 对自己时显示：保留源视角，因此“对方”仍指向实际目标（而非玩家自己）
                var textSelf = (dlgSelf.trim() ? dlgSelf : dlg).replace(/\{SourceCharacter\}/g, src).replace(/\{TargetCharacter\}/g, tgt);
                preview = '对他人：' + textOther + '\n对自己：' + textSelf;
            } else {
                preview = resolveText(dlg, src, tgt);
            }
            var pv = listEl.querySelector('#xsact-ca-preview');
            if (pv) pv.textContent = preview;
        }
        var scopeBox = listEl.querySelector('#xsact-ca-scope');
        if (scopeBox) scopeBox.querySelectorAll('button').forEach(function(b) {
            b.addEventListener('click', function() {
                scopeBox.querySelectorAll('button').forEach(function(x) { x.classList.remove('active'); });
                b.classList.add('active');
                refreshPreview();
            });
        });
        ['#xsact-ca-name', '#xsact-ca-dialog-raw', '#xsact-ca-dialogself-raw'].forEach(function(sel) {
            var el = listEl.querySelector(sel);
            if (el) el.addEventListener('input', refreshPreview);
        });
        ['#xsact-ca-dialog', '#xsact-ca-dialogself'].forEach(function(sel) {
            var el = listEl.querySelector(sel);
            if (el) el.addEventListener('input', function() {
                syncRichToRaw(el);
                refreshPreview();
            });
        });
        refreshPreview();

        var saveBtn = listEl.querySelector('#xsact-ca-save');
        if (saveBtn) saveBtn.addEventListener('click', function() {
            var nm = (listEl.querySelector('#xsact-ca-name') || {}).value || '';
            var dlg = (listEl.querySelector('#xsact-ca-dialog-raw') || {}).value || '';
            var dlgSelf = (listEl.querySelector('#xsact-ca-dialogself-raw') || {}).value || '';
            var sc = (listEl.querySelector('#xsact-ca-scope') || {}).querySelector('.active');
            var gp = (listEl.querySelector('#xsact-ca-group') || {}).value || 'ItemMouth';
            if (!nm.trim()) { toast('请填写动作名称', '#FF5C5C'); return; }
            if (!dlg.trim()) { toast('请填写对话文本', '#FF5C5C'); return; }
            var existing = getCustom(act.id);
            if (existing) caUnregister(existing);
            var updated = { id: act.id, name: nm.trim(), scope: (sc ? sc.dataset.scope : 'other'), group: gp, dialog: dlg, dialogSelf: dlgSelf, createdAt: act.createdAt || Date.now(), source: act.source || 'native', visible: typeof act.visible === 'boolean' ? act.visible : true, echoName: act.echoName || null, echoNames: Array.isArray(act.echoNames) ? act.echoNames.slice() : [] };
            upsertCustom(updated);
            state.editingCustomId = null;
            updateCustomActionPanel(charObj);
            toast('自定义动作已保存', '#46E0A0');
        });
        var cancelBtn = listEl.querySelector('#xsact-ca-cancel');
        if (cancelBtn) cancelBtn.addEventListener('click', function() {
            if (isNew) deleteCustom(act.id);
            state.editingCustomId = null; updateCustomActionPanel(charObj);
        });
        var delBtn = listEl.querySelector('#xsact-ca-del');
        if (delBtn) delBtn.addEventListener('click', function() {
            qiactConfirm({ title: '删除动作', body: '确定删除该自定义动作吗？', confirmText: '删除', danger: true }).then(function(ok) {
                if (!ok) return;
                deleteCustom(act.id); state.editingCustomId = null; updateCustomActionPanel(charObj); toast('已删除', '#888');
            });
        });
    }



    function runCustomAction(id, charObj) {
        var act = getCustom(id);
        if (!act) return;
        if (!charObj) { toast('请先在左侧选择人物', '#FF5C5C'); return; }
        var name = caActivityName(act);
        var ok = executeAction(charObj, name, null, act.group);
        if (ok) toast('执行：' + act.name, '#FF5C7A');
    }

    /** 从 echo/回声(echo-activity-ext) 导入动作数据 */
    function importCustomFromEcho() {
        try {
            var ext = Player && Player.ExtensionSettings;
            if (!ext) { toast('读取扩展设置失败', '#FF5C5C'); return; }
            var echoKey = Object.keys(ext).find(function(k) { return k.indexOf('ECHO') === 0; });
            if (!echoKey || !ext[echoKey] || !ext[echoKey]['动作数据']) {
                toast('未找到 echo/回声 的动作数据', '#FF5C5C'); return;
            }
            var data = ext[echoKey]['动作数据'];
            var keys = Object.keys(data);
            var imported = 0;
            keys.forEach(function(k) {
                var item = data[k];
                if (!item || !item.Name) return;
                var hasTarget = !!item.Target;
                var hasTargetSelf = !!item.TargetSelf;
                var scope = (hasTarget && hasTargetSelf) ? 'any' : hasTargetSelf ? 'self' : 'other';
                var group = item.Target || item.TargetSelf || 'ItemMouth';
                var dialog = item.Dialog || item.Name || '';
                var dialogSelf = item.DialogSelf || '';
                // echo/回声 使用裸 SourceCharacter/TargetCharacter 占位符；统一成花括号格式
                function normalizeEchoPlaceholder(s) { return typeof s === 'string' ? s.replace(/SourceCharacter/g, '{SourceCharacter}').replace(/TargetCharacter/g, '{TargetCharacter}') : s; }
                // 解析 echo 条目的显示名与真实 Activity Name：key / item.Name 可能是中文显示名 ↔ 原始名 任意组合
                var resolved = caResolveEchoNames(k, item.Name);
                var displayName = resolved.displayName;
                var rawName = resolved.rawName;
                // 在注册表里找到这个 echo 动作的真实 Activity.Name（通常带随机后缀，如 笨蛋笨Luzi_xw58d）
                var foundRawNames = caFindEchoNamesInRegistry(item, k, group);
                // 如果 rawName 看起来就是原始 Activity 名，也直接加进去
                if (caLooksLikeRawActivityName(rawName)) foundRawNames.add(rawName);
                if (caLooksLikeRawActivityName(k) && k !== rawName) foundRawNames.add(k);
                var primaryEchoName = foundRawNames.values().next().value || rawName;

                // 去重：同名同部位已存在则更新，避免重复导入导致屏蔽集合/注册表混乱
                var existing = state.customActions.find(function(a) { return a.name === displayName && a.group === group; });
                if (existing) {
                    caUnregister(existing);
                    existing.scope = scope;
                    existing.dialog = normalizeEchoPlaceholder(dialog);
                    existing.dialogSelf = normalizeEchoPlaceholder(dialogSelf);
                    existing.source = 'echo';
                    existing.echoName = primaryEchoName;
                    existing.echoNames = Array.from(foundRawNames);
                    if (typeof existing.visible !== 'boolean') existing.visible = true;
                    upsertCustom(existing);
                } else {
                    var ca = {
                        id: caNewId(),
                        name: displayName,
                        scope: scope,
                        group: group,
                        dialog: normalizeEchoPlaceholder(dialog),
                        dialogSelf: normalizeEchoPlaceholder(dialogSelf),
                        createdAt: Date.now(),
                        source: 'echo',
                        visible: true,
                        echoName: primaryEchoName, // 记录真实 echo 注册名，用于后续启动时重新屏蔽
                        echoNames: Array.from(foundRawNames) // 记录所有可能的原始名，防止漏网
                    };
                    upsertCustom(ca);
                }
                foundRawNames.forEach(caSuppressEchoName);
                // 把 rawName 的中文前缀也加入屏蔽，防止 echo 动态注册同一中文名的其他变体
                var rawPrefix = caExtractChinesePrefix(rawName);
                if (rawPrefix) caSuppressEchoName(rawPrefix);
                var displayPrefix = caExtractChinesePrefix(displayName);
                if (displayPrefix) caSuppressEchoName(displayPrefix);
                caSuppressEchoName(displayName);
                caSuppressEchoName(rawName);
                imported++;
            });
            // 导入完成后，立即屏蔽 echo 端已存在的同名原始动作，并刷新当前面板（custom 面板）
            caRemoveSuppressedEchoActivities();
            updateCustomActionPanel(state.selectedTarget);
            toast('已从 echo/回声 导入 ' + imported + ' 个动作', '#46E0A0');
        } catch (e) {
            console.warn('[QiAct] 导入 echo/回声 动作失败:', e.message);
            toast('导入失败：' + e.message, '#FF5C5C');
        }
    }

    /**
     * 内置「小酥动作包」同步：把预编译进插件的小酥动作（XIAOSU_PACKED，由
     * tools/build-xiaosu-pack.mjs 从 XiaoSuActivity 仓库生成）按需并入 / 移出
     * state.customActions。源标记为 source==='xiaosu' && builtin。
     *   - 启用：先移除全部小酥源条目（含 legacy 克隆残留），再把打包动作按 id 补回列表（幂等）。
     *   - 禁用：移除全部内置小酥动作（builtin + legacy），用户自建 / echo 导入不受影响。
     * 动作以 QiAct_ 自定义动作形式内置发布，用户无需安装原版插件即可使用，
     * 且对原版停更 / Web Worker 故障完全免疫。
     */
    function syncXiaosuPack() {
        if (!Array.isArray(XIAOSU_PACKED)) return;
        // 清理旧版克隆残留 + 内置包条目（移除全部 source==='xiaosu'，稍后按需补回；
        // 这样关闭开关时 builtin 条目也能被正确移除，且包升级时旧条目自动被权威数据替换）
        state.customActions = state.customActions.filter(function(a) {
            return !(a && a.source === 'xiaosu');
        });
        if (state.xiaosuPack) {
            XIAOSU_PACKED.forEach(function(p) {
                if (!state.customActions.some(function(a) { return a.id === p.id; })) {
                    state.customActions.push(p);
                }
            });
        }
    }

    /** 开关「内置小酥动作包」：持久化 → 同步列表 → 重新注册到 BC → 刷新面板 */
    function setXiaosuPack(enabled) {
        state.xiaosuPack = !!enabled;
        persist(S_XIAOSU_PACK, state.xiaosuPack);
        syncXiaosuPack();
        registerAllCustomActions();
        saveCustomActions();
        updateCustomActionPanel(state.selectedTarget);
    }

    /** 导出自定义动作为 JSON 文件 */
    function exportCustomActions() {
        try {
            var data = JSON.stringify(state.customActions, null, 2);
            var blob = new Blob([data], { type: 'application/json' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = 'qiact_custom_actions.json';
            a.click();
            URL.revokeObjectURL(url);
            toast('已导出 ' + state.customActions.length + ' 个动作', '#46E0A0');
        } catch (e) {
            console.warn('[QiAct] 导出自定义动作失败:', e.message);
            toast('导出失败：' + e.message, '#FF5C5C');
        }
    }

    /** 从本地 JSON 文件导入自定义动作 */
    function importCustomFromFile(file) {
        try {
            var reader = new FileReader();
            reader.onload = function(ev) {
                try {
                    var json = ev.target.result;
                    var arr = JSON.parse(json);
                    if (!Array.isArray(arr)) { toast('文件格式错误：应为动作对象数组', '#FF5C5C'); return; }
                    var imported = 0, updated = 0;
                    arr.forEach(function(item) {
                        if (!item || !item.name || !item.group) return;
                        var source = item.source || 'native';
                        var dialog = typeof item.dialog === 'string' ? item.dialog : (item.Dialog || '');
                        var dialogSelf = typeof item.dialogSelf === 'string' ? item.dialogSelf : (item.DialogSelf || '');
                        var scope = item.scope || 'other';
                        var visible = typeof item.visible === 'boolean' ? item.visible : true;
                        var existing = state.customActions.find(function(a) { return a.name === item.name && a.group === item.group; });
                        if (existing) {
                            caUnregister(existing);
                            existing.scope = scope;
                            existing.dialog = dialog;
                            existing.dialogSelf = dialogSelf;
                            existing.visible = visible;
                            if (item.source) existing.source = item.source;
                            if (item.echoName) existing.echoName = item.echoName;
                            if (Array.isArray(item.echoNames)) existing.echoNames = item.echoNames.slice();
                            upsertCustom(existing);
                            updated++;
                        } else {
                            var ca = {
                                id: caNewId(),
                                name: item.name,
                                scope: scope,
                                group: item.group,
                                dialog: dialog,
                                dialogSelf: dialogSelf,
                                createdAt: item.createdAt || Date.now(),
                                source: source,
                                visible: visible,
                                echoName: item.echoName || null,
                                echoNames: Array.isArray(item.echoNames) ? item.echoNames.slice() : []
                            };
                            upsertCustom(ca);
                            imported++;
                        }
                    });
                    registerAllCustomActions();
                    updateCustomActionPanel(state.selectedTarget);
                    toast('导入完成：新增 ' + imported + ' 个，更新 ' + updated + ' 个', '#46E0A0');
                } catch (inner) {
                    console.warn('[QiAct] 解析 JSON 失败:', inner.message);
                    toast('JSON 解析失败：' + inner.message, '#FF5C5C');
                }
            };
            reader.onerror = function() { toast('读取文件失败', '#FF5C5C'); };
            reader.readAsText(file);
        } catch (e) {
            console.warn('[QiAct] 导入本地文件失败:', e.message);
            toast('导入失败：' + e.message, '#FF5C5C');
        }
    }

    /** 启动时重新注册所有已存自定义动作到 BC（使本会话内可执行） */
    function registerAllCustomActions() {
        // 清理：移除 BC 注册表中不在当前自定义动作列表里的 QiAct_ / XSQAct_ / XSAct_CA_ 残留条目
        // （防止旧版本残留、重复注入或重复注册导致动作面板显示 CA_xxx 裸 ID；
        //   XSAct_CA_ 为早期版本前缀，部分第三方 mod（小酥的動作拓展）会遍历 XSAct* 活动，
        //   旧前缀与其冲突导致原生动作界面崩溃，升级后必须清除。）
        try {
            var fam = (Player && Player.AssetFamily) || 'Female3DCG';
            var acts = caRawAllActivities(fam);
            var validNames = new Set();
            state.customActions.forEach(function(a) { validNames.add(caActivityName(a)); });
            var OLD_PREFIXES = ['XSAct_CA_', 'XSQAct_', CA_PREFIX];
            var isStale = function(name) {
                return OLD_PREFIXES.some(function(p) { return name.indexOf(p) === 0; });
            };
            if (Array.isArray(acts)) {
                for (var i = acts.length - 1; i >= 0; i--) {
                    var a = acts[i];
                    if (a && a.Name && isStale(a.Name) && !validNames.has(a.Name)) {
                        acts.splice(i, 1);
                    }
                }
            }
            // 同步清理排序索引数组中的残留条目
            if (Array.isArray(ActivityFemale3DCGOrdering)) {
                for (var j = ActivityFemale3DCGOrdering.length - 1; j >= 0; j--) {
                    var nm = ActivityFemale3DCGOrdering[j];
                    if (nm && isStale(nm) && !validNames.has(nm)) {
                        ActivityFemale3DCGOrdering.splice(j, 1);
                    }
                }
            }
        } catch (e) { console.warn('[QiAct] 清理自定义动作残留失败:', e.message); }
        state.customActions.forEach(function(act) { caRegister(act); });
        // 末尾统一清理：把已存小酥克隆对应的原版活动从 BC 全局数组物理移除，
        // 避免原版插件仍在运行时出现重复（无论原版是否加载，无残留则空操作）。
        try { caRemoveSuppressedEchoActivities(); } catch (e) { silent(e, 'caRemoveSuppressedEcho'); }
    }

    /** 切换「全部」范围开关，并更新按钮视觉 */


    /* ===== 7. 模式切换（全员 / 收藏 / 自己） ===== */
    function toggleAllMode() {
        state.allModeActive = !state.allModeActive;
        updateAllButtonVisual();
        toast(state.allModeActive ? '全员范围：开启' : '全员范围：关闭',
              state.allModeActive ? '#E8B339' : '#888');
    }
    function updateAllButtonVisual() {
        if (!state.actionPanelEl) return;
        var btn = state.actionPanelEl.querySelector('#xsact-all-btn');
        if (btn) btn.classList.toggle('on', state.allModeActive);
    }

    /** 收藏模式：点击动作时加入/取消收藏 */
    function toggleFavMode() {
        state.favModeActive = !state.favModeActive;
        updateFavButtonVisual();
        if (state.actionPanelEl) {
            var body = state.actionPanelEl.querySelector('#xsact-action-list');
            if (body) body.classList.toggle('fav-active', state.favModeActive);
        }
        toast(state.favModeActive ? '收藏模式：开启 · 点击动作加入收藏' : '收藏模式：关闭',
              state.favModeActive ? '#E8B339' : '#888');
    }
    function updateFavButtonVisual() {
        if (!state.actionPanelEl) return;
        var btn = state.actionPanelEl.querySelector('#xsact-fav-btn');
        if (!btn) return;
        btn.classList.toggle('on', state.favModeActive);
        var ico = btn.querySelector('.xsact-ico');
        if (ico) ico.outerHTML = svgIcon(state.favModeActive ? 'starFill' : 'star', 14);
    }
    function toggleFavoriteAction(partGroup, name, btn) {
        var key = partGroup + '|' + name;
        var idx = state.favorites.indexOf(key);
        if (idx === -1) {
            state.favorites.push(key);
            toast('已收藏：' + getActivityLabel(name, partGroup), '#E8B339');
        } else {
            state.favorites.splice(idx, 1);
            toast('取消收藏', '#888');
        }
        persist(S_FAVS, state.favorites);
        if (btn) {
            var added = idx === -1;
            btn.classList.toggle('fav', added);
            var star = btn.querySelector('.xsact-action-star');
            if (added) {
                if (!star) {
                    star = document.createElement('span');
                    star.className = 'xsact-action-star';
                    star.innerHTML = svgIcon('starFill', 13);
                    btn.appendChild(star);
                }
            } else if (star) {
                star.remove();
            }
        } else if (state.selectedTarget && state.selectedPart && state.panelMode === 'part') {
            updateActionPanel(state.selectedTarget, state.selectedPart);
        }
    }

    /** 切换自己模式 */
    function toggleSelfMode() {
        state.selfModeActive = !state.selfModeActive;
        persist(S_SELF, state.selfModeActive);
        updateSelfButtonVisual();
        if (state.isActive) refreshBodyGrids();
        toast(state.selfModeActive ? '自己模式：开启' : '自己模式：关闭',
              state.selfModeActive ? '#46E0A0' : '#888');
    }
    function updateSelfButtonVisual() {
        if (!state.actionPanelEl) return;
        var btn = state.actionPanelEl.querySelector('#xsact-self-btn');
        if (btn) btn.classList.toggle('on', state.selfModeActive);
    }

    /** 清空全部收藏动作 */
    function clearAllFavorites() {
        if (!Array.isArray(state.favorites) || state.favorites.length === 0) { toast('当前没有收藏动作', '#888'); return; }
        qiactConfirm({
            title: '清空全部收藏',
            body: '确定清空全部收藏动作吗？此操作无法撤销。',
            confirmText: '全部清空',
            danger: true
        }).then(function(ok) {
            if (!ok) return;
            state.favorites = [];
            persist(S_FAVS, state.favorites);
            renderPanel();
            toast('已清空全部收藏', '#888');
        });
    }

    /** Toast 提示 */
    /* ===== 8. 提示与反馈 ===== */
    function toast(msg, color) {
        color = color || '#FF5C7A';
        try {
            if (window.Liko && window.Liko.__Sys_Toast__) {
                window.Liko.__Sys_Toast__(msg, 2000, color);
                return;
            }
        } catch (_) { /* 忽略：Liko toast 不可用时下方 DOM 兜底仍执行 */ }
        // fallback: 创建简单提示
        var el = document.getElementById('xsact-qa-toast');
        if (!el) {
            el = document.createElement('div');
            el.id = 'xsact-qa-toast';
            el.style.cssText = 'position:fixed;top:80px;left:50%;transform:translateX(-50%);z-index:99999;padding:8px 16px;border-radius:8px;font-size:13px;color:#fff;font-family:-apple-system,sans-serif;pointer-events:none;transition:opacity 0.3s;';
            document.body.appendChild(el);
        }
        el.textContent = msg;
        el.style.background = color;
        el.style.opacity = '1';
        clearTimeout(el._timer);
        el._timer = setTimeout(() => { el.style.opacity = '0'; }, 2000);
    }

    /**
     * 统一确认模态（暗色玫红，替代浏览器原生 confirm）
     *  - 异步：返回 Promise<boolean>，true=确定，false=取消/关闭
     *  - 支持：title / body / confirmText / cancelText / danger
     *  - 交互：ESC 键、点遮罩、点取消 → false；点确定 → true
     */
    function qiactConfirm(opts) {
        opts = opts || {};
        return new Promise(function(resolve) {
            // 同一时刻只允许一个确认框
            var existing = document.getElementById('xsact-confirm');
            if (existing) existing.remove();

            var title = String(opts.title || '确认操作');
            var body = opts.body ? String(opts.body) : '';
            var confirmText = String(opts.confirmText || '确定');
            var cancelText = String(opts.cancelText || '取消');
            var danger = opts.danger !== false; // 默认危险操作（玫红强调）

            var box = document.createElement('div');
            box.id = 'xsact-confirm';
            box.className = 'xsact-confirm';
            box.innerHTML =
                '<div class="xsact-confirm-box" role="dialog" aria-modal="true">' +
                    '<div class="xsact-confirm-title"></div>' +
                    (body ? '<div class="xsact-confirm-body"></div>' : '') +
                    '<div class="xsact-confirm-footer">' +
                        '<button class="xsact-confirm-btn xsact-confirm-cancel" type="button"></button>' +
                        '<button class="xsact-confirm-btn xsact-confirm-ok' + (danger ? ' is-danger' : '') + '" type="button"></button>' +
                    '</div>' +
                '</div>';
            box.querySelector('.xsact-confirm-title').textContent = title;
            if (body) box.querySelector('.xsact-confirm-body').textContent = body;
            box.querySelector('.xsact-confirm-cancel').textContent = cancelText;
            box.querySelector('.xsact-confirm-ok').textContent = confirmText;

            function done(result) {
                document.removeEventListener('keydown', onKey);
                if (box.parentNode) box.parentNode.removeChild(box);
                resolve(result);
            }
            function onKey(e) {
                if (e.key === 'Escape') { e.preventDefault(); done(false); }
                else if (e.key === 'Enter') { e.preventDefault(); done(true); }
            }
            // 监听加在 box 自身（capture 阶段），绕开 BC 页面在 body/document 层的 keydown 拦截
            box.addEventListener('keydown', onKey, true);
            // 兜底：document 上也监听（正常浏览器中点 modal 内元素后 Esc 应能冒泡到此）
            document.addEventListener('keydown', onKey, false);
            box.addEventListener('click', function(e) {
                if (e.target === box) done(false); // 点击遮罩
            });
            box.querySelector('.xsact-confirm-cancel').addEventListener('click', function() { done(false); });
            box.querySelector('.xsact-confirm-ok').addEventListener('click', function() { done(true); });

            document.body.appendChild(box);
            // 自动 focus 到确定按钮，回车即确认
            setTimeout(function() {
                var ok = box.querySelector('.xsact-confirm-ok');
                if (ok) ok.focus();
            }, 30);
        });
    }

    // 兼容旧版 confirm 调用（同步返回，仅用于不支持 Promise 的旧位置；新代码用 qiactConfirm）
    function qiactConfirmSync(opts) {
        // 兼容：极少数老调用方是同步 if(confirm(...)) 写法。
        // 这里用全局锁 + 轮询检测，**不推荐**新代码使用。
        var _qiactConfirmPending = null;
        // 实际上当前没有调用方使用 confirm()，所以这是预留接口
        return qiactConfirm(opts);
    }

    // ════════════════════════════════════════════════════════════════════════
    // 切换按钮（DOM 固定定位，永远可见）
    // ════════════════════════════════════════════════════════════════════════

    /** 创建 DOM 切换按钮 */


    /* ===== 9. 浮动开关（闪电按钮 + 拖拽 + 可见性守卫） ===== */
    function createToggleButton() {
        if (state.toggleBtnEl) return;
        state.toggleBtnEl = document.createElement('button');
        state.toggleBtnEl.id = 'xsact-toggle-btn';
        state.toggleBtnEl.innerHTML =
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h7l-1 8 10-12h-7z"/></svg>';
        state.toggleBtnEl.title = state.isActive ? '退出快速动作模式' : '开启快速动作模式';
        state.toggleBtnEl.addEventListener('click', function(e) {
            if (state.toggleDragged) {
                e.stopPropagation();
                e.preventDefault();
                state.toggleDragged = false;
                return;
            }
            e.stopPropagation();
            toggleActionMode();
            updateToggleBtnStyle();
        });
        document.body.appendChild(state.toggleBtnEl);
        applyTogglePosition();
        makeToggleDraggable();
        updateToggleBtnStyle();
    }

    /** 读取并应用保存的闪电按钮位置 */
    function applyTogglePosition() {
        var btn = state.toggleBtnEl;
        if (!btn) return;
        var pos = loadSetting(S_TOGGLE_POS, null);
        if (pos && typeof pos.left === 'number' && typeof pos.top === 'number') {
            btn.style.left = pos.left + 'px';
            btn.style.top = pos.top + 'px';
            btn.style.right = 'auto';
            btn.style.bottom = 'auto';
        }
    }

    /** 持久化闪电按钮位置 */
    function persistTogglePosition() {
        var btn = state.toggleBtnEl;
        if (!btn) return;
        var rect = btn.getBoundingClientRect();
        persist(S_TOGGLE_POS, { left: Math.round(rect.left), top: Math.round(rect.top) });
    }

    /** 让闪电按钮可拖拽；短按仍是打开/关闭，拖动则不触发打开 */
    function makeToggleDraggable() {
        var btn = state.toggleBtnEl;
        if (!btn) return;
        var startX, startY, startLeft, startTop;
        var DRAG_THRESHOLD = 5;

        function onDown(e) {
            var ev = e.touches ? e.touches[0] : e;
            startX = ev.clientX;
            startY = ev.clientY;
            state.toggleDragged = false;
            var rect = btn.getBoundingClientRect();
            startLeft = rect.left;
            startTop = rect.top;
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
            document.addEventListener('touchmove', onMove, { passive: false });
            document.addEventListener('touchend', onUp);
        }

        function onMove(e) {
            var ev = e.touches ? e.touches[0] : e;
            var dx = ev.clientX - startX;
            var dy = ev.clientY - startY;
            if (!state.toggleDragged && Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD) {
                state.toggleDragged = true;
            }
            if (state.toggleDragged) {
                e.preventDefault();
                btn.style.left = Math.max(0, Math.min(window.innerWidth - btn.offsetWidth, startLeft + dx)) + 'px';
                btn.style.top = Math.max(0, Math.min(window.innerHeight - btn.offsetHeight, startTop + dy)) + 'px';
                btn.style.right = 'auto';
                btn.style.bottom = 'auto';
            }
        }

        function onUp(e) {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
            document.removeEventListener('touchmove', onMove);
            document.removeEventListener('touchend', onUp);
            if (state.toggleDragged) {
                e.preventDefault();
                e.stopPropagation();
                persistTogglePosition();
            }
        }

        btn.addEventListener('mousedown', onDown);
        btn.addEventListener('touchstart', onDown, { passive: false });
    }

    /** 更新按钮外观状态 */
    function updateToggleBtnStyle() {
        if (!state.toggleBtnEl) return;
        if (state.isActive) {
            state.toggleBtnEl.classList.add('active');
            state.toggleBtnEl.title = '退出快速动作模式 · 已激活';
        } else {
            state.toggleBtnEl.classList.remove('active');
            state.toggleBtnEl.title = '开启快速动作模式';
        }
    }

    /** 兼容旧接口：DrawProcess hook 调用（确保聊天室内闪电图标常驻可见） */
    function drawToggleButton() {
        // 按钮可能被意外移出 DOM，或仅被隐藏 —— 两种情况都要恢复
        if (!state.toggleBtnEl || !document.body.contains(state.toggleBtnEl)) {
            state.toggleBtnEl = null;
            createToggleButton();
        }
        if (state.toggleBtnEl) {
            state.toggleBtnEl.style.display = '';
        }
    }

    /** 可见性守卫：聊天室内确保按钮存在且可见，离开界面则隐藏。
     *  不依赖 DrawProcess hook（BC 打包后 hookFunction 对该转发函数无效）。 */
    function guardToggleVisibility() {
        if (typeof CurrentScreen === 'undefined') return;
        if (CurrentScreen === 'ChatRoom') {
            drawToggleButton();                 // 创建(若需) + 恢复 display
        } else if (state.toggleBtnEl) {
            state.toggleBtnEl.style.display = 'none';
        }
    }
    function startVisibilityGuard() {
        if (window.__QiAct_VisGuard) { try { clearInterval(window.__QiAct_VisGuard); } catch (_) { /* 忽略：清理旧定时器失败无影响 */ } }
        window.__QiAct_VisGuard = setInterval(guardToggleVisibility, 500);
    }

    // ════════════════════════════════════════════════════════════════════════
    // 动作模式 UI — 核心
    // ════════════════════════════════════════════════════════════════════════

    /**
     * 进入/退出动作模式
     */


    /* ===== 10. 动作模式生命周期 ===== */
    function toggleActionMode() {
        state.isActive = !state.isActive;
        persist(S_ENABLED, state.isActive);

        if (state.isActive) enterActionMode();
        else exitActionMode();

        drawToggleButton();
    }

    function enterActionMode() {
        logD('进入动作模式');
        state.isActive = true;
        persist(S_ENABLED, true);

        // 防御：清除所有残留的旧 UI（重复注入/历史模块可能导致多份面板），
        // 确保单实例，避免动作被写进隐藏的旧面板
        document.querySelectorAll('#xsact-qa-overlay').forEach(function(el) { el.remove(); });
        document.querySelectorAll('#xsact-qa-panel').forEach(function(el) { el.remove(); });
        state.actionPanelEl = null;

        // 创建右侧面板
        if (!state.actionPanelEl) {
            state.actionPanelEl = document.createElement('div');
            state.actionPanelEl.id = 'xsact-qa-panel';
            state.actionPanelEl.innerHTML = buildPanelHTML();
            document.body.appendChild(state.actionPanelEl);
            bindPanelEvents(state.actionPanelEl);
            makeDraggable(state.actionPanelEl);
            makeResizable(state.actionPanelEl);
        }
        // 恢复上次使用的模式（首次无记录则默认「单部位」）
        var savedMode = loadSetting(S_MODE, 'part');
        if (!/^(part|combo|custom)$/.test(savedMode)) savedMode = 'part';
        state.panelMode = savedMode;
        state.actionPanelEl.querySelectorAll('.xsact-mode-tab').forEach(function(tab) {
            tab.classList.toggle('active', tab.dataset.mode === state.panelMode);
        });
        state.actionPanelEl.style.display = '';
        applyPanelSize();
        applyPanelPosition();
        renderPanel();
        renderPendingBanner();
        checkUpdate().catch(function(e) { console.warn('[QiAct] 更新检查失败（已忽略）:', e && e.message); });

        // 恢复自己模式开关状态
        state.selfModeActive = loadSetting(S_SELF, false);
        updateSelfButtonVisual();


        // 为每个角色创建身体部位浮动网格，并同步渲染人物列表
        refreshBodyGrids();
        renderCharList();
        updateAllButtonVisual();
        updateFavButtonVisual();

        toast('动作模式已开启', '#FF5C7A');
    }

    function exitActionMode() {
        logD('退出动作模式');

        if (state.actionPanelEl) {
            state.actionPanelEl.style.display = 'none';
        }

        // 清除所有浮动网格
        clearBodyGrids();

        state.selectedTarget = null;
        state.selectedPart = null;
        state.selectedAction = null;
        state.selectedActionItem = null;
        state.editingComboId = null;
        state.allModeActive = false;

        toast('已退出动作模式', '#888');
    }

    /** 构建右侧面板 HTML */


    /* ===== 11. 主面板 UI（HTML 结构） ===== */
    function buildPanelHTML() {
        return '\
<div class="xsact-qa-panel-inner">\
  <div class="xsact-qa-panel-header" id="xsact-panel-header">\
    <span class="xsact-panel-grip" id="xsact-drag-grip" title="拖动面板">' + svgIcon('grip', 16) + '</span>\
    <span id="xsact-panel-title">选择动作...</span>\
    <span class="xsact-panel-head-actions">\
      <button class="xsact-qa-mini-btn" id="xsact-theme-btn" title="切换深色/浅色主题"><span class="xsact-theme-icon sun">' + svgIcon('sun', 15) + '</span><span class="xsact-theme-icon moon">' + svgIcon('moon', 15) + '</span></button>\
      <button class="xsact-qa-mini-btn" id="xsact-refresh-btn" title="刷新当前部位/人物的动作列表状态">' + svgIcon('refresh', 15) + '</button>\
      <button class="xsact-qa-mini-btn" id="xsact-exit-panel-btn" title="退出快速动作模式 (Esc)">' + svgIcon('close', 15) + '</button>\
    </span>\
  </div>\
  <div class="xsact-update-banner" id="xsact-update-banner" style="display:none;"></div>\
  <div class="xsact-qa-panel-content">\
    <div class="xsact-qa-panel-main">\
      <div class="xsact-qa-mode-tabs">\
        <button class="xsact-mode-tab active" data-mode="part" title="单部位动作：点人物部位后直接触发">' + svgIcon('target', 14) + '<span>动作</span></button>\
        <button class="xsact-mode-tab" data-mode="combo" title="组合动作：手动拼装多部位动作并一键执行">' + svgIcon('layers', 14) + '<span>组合动作</span></button>\
        <button class="xsact-mode-tab" data-mode="custom" title="我的动作：创建/管理自定义动作（替代 echo/回声）。当前为测试版(Beta)">' + svgIcon('custom', 14) + '<span>我的动作</span><span class="xsact-beta-badge">测试版</span></button>\
      </div>\
      <div class="xsact-qa-panel-body" id="xsact-action-list">\
        <div class="xsact-qa-empty">点击左侧 ◀ 按钮选择人物和部位</div>\
      </div>\
    </div>\
  </div>\
  <div class="xsact-qa-panel-footer">\
    <button class="xsact-qa-mini-btn xsact-toggle-pill" id="xsact-self-btn" title="切换自己模式">' + svgIcon('user', 14) + '<span>自己</span><span class="xsact-pill-dot"></span></button>\
    <button class="xsact-qa-mini-btn xsact-toggle-pill" id="xsact-all-btn" title="切换全员范围：开启后，动作将对房间内所有人执行">' + svgIcon('users', 14) + '<span>全员</span><span class="xsact-pill-dot"></span></button>\
    <button class="xsact-qa-mini-btn xsact-toggle-pill" id="xsact-fav-btn" title="收藏模式：开启后点击动作会加入/取消收藏">' + svgIcon('star', 14) + '<span>收藏</span><span class="xsact-pill-dot"></span></button>\
    <button class="xsact-qa-mini-btn" id="xsact-fav-clear-btn" title="清空全部收藏动作" data-tooltip-type="danger">' + svgIcon('favRemove', 14) + '</button>\
    <button class="xsact-qa-mini-btn" id="xsact-x3-btn" title="连续3次">' + svgIcon('bolt', 14) + '<span>×3</span></button>\
    <span class="xsact-version-tag" title="当前插件版本">v' + VERSION + '</span>\
  </div>\
  <div class="xsact-qa-state.presets-bar" id="xsact-state.presets-bar"></div>\
  <div class="xsact-resize-handle" id="xsact-resize-handle" title="拖动缩放面板">' + svgIcon('resize', 14) + '</div>\
</div>\
<div class="xsact-char-popover" id="xsact-char-popover" style="display:none;">\
  <div class="xsact-char-popover-header">\
    <button class="xsact-char-popover-back" id="xsact-char-popover-back" title="返回人物列表">&#8249;</button>\
    <span class="xsact-char-popover-title" id="xsact-char-popover-title">人物列表</span>\
    <button class="xsact-char-popover-close" id="xsact-char-popover-close" title="关闭" data-tooltip-type="danger">×</button>\
  </div>\
  <div class="xsact-char-popover-body" id="xsact-char-popover-body"></div>\
</div>\
<div id="xsact-char-popover-tab" title="人物列表">' + svgIcon('triangle-left', 12) + '</div>\
<div id="xsact-popover-connector"></div>';
    }

    // ════════════════════════════════════════════════════════════════════════
    // 身体部位浮动网格
    // ════════════════════════════════════════════════════════════════════════

    /**
     * 获取房间内"真实成员"的绘制布局（逻辑坐标）
     * 使用 ChatRoomCharacter（权威成员列表）交叉校验，避免 Drawlist 含离场/NPC 角色
     */


    /* ===== 12. 画布身体网格（霓虹线框） ===== */
    function getCharLayout() {
        var layout = [];
        try {
            if (typeof ChatRoomCharacter === 'undefined' || !Array.isArray(ChatRoomCharacter)) return layout;

            // 收集房间内真实成员 MemberNumber 集合（交叉校验，排除离场/NPC）
            var memberMNs = {};
            ChatRoomCharacter.forEach(function(c) {
                if (c && c.MemberNumber) memberMNs[c.MemberNumber] = true;
            });

            var now = Date.now();

            // ① 优先用 DrawCharacter 记录的真实绘制坐标（每帧刷新，含活动位移）
            var anchorMap = {};
            ChatRoomCharacter.forEach(function(c) {
                if (!c || c.MemberNumber == null) return;
                var a = state.charAnchor[c.MemberNumber];
                if (a && (now - a.t < 1000)) anchorMap[c.MemberNumber] = a;
            });

            // ② 退回：ChatRoomCharacterViewLoopCharacters 提供的坐标
            var loopMap = {};
            if (typeof ChatRoomCharacterViewLoopCharacters === 'function') {
                ChatRoomCharacterViewLoopCharacters(function(idx, cx, cy, space, zoom) {
                    var cc = (typeof ChatRoomCharacterDrawlist !== 'undefined' && ChatRoomCharacterDrawlist)
                        ? ChatRoomCharacterDrawlist[idx] : null;
                    if (cc && cc.MemberNumber != null) loopMap[cc.MemberNumber] = { x: cx, y: cy, zoom: zoom };
                    return '';
                });
            }

            // 身体线框使用固定槽位坐标（绝对位置），不跟随拥抱/位移动画的临时绘制位置。
            // 这样即使角色拥抱时绘制位置重叠，线框仍保持左右错开、高度不变。
            ChatRoomCharacter.forEach(function(c) {
                if (!c || c.MemberNumber == null || !memberMNs[c.MemberNumber]) return;
                var loop = loopMap[c.MemberNumber];
                var anchor = anchorMap[c.MemberNumber];
                if (!loop && !anchor) return;
                // 优先固定槽位坐标（loop），缺失才回退到真实绘制坐标（anchor）
                var useX = loop || anchor;
                var useY = loop || anchor;
                layout.push({ char: c, x: useX.x, y: useY.y, zoom: (loop ? loop.zoom : (anchor ? anchor.zoom : 1)), src: loop ? 'loop' : 'anchor' });
            });
        } catch (e) {
            console.warn('[QiAct] getCharLayout 失败:', e);
        }
        return layout;
    }

    // ════════════════════════════════════════════════════════════════════════
    // BC 画布坐标换算（借鉴 BC-HSC geometry.js 的精准做法）
    // ════════════════════════════════════════════════════════════════════════
    const BC_CANVAS_W = 2000;
    const BC_CANVAS_H = 1000;

    // 画布矩形缓存（getBoundingClientRect 较贵，按帧/resize 刷新）已并入 state

    function refreshCanvasCache() {
        try {
            var canvas = document.getElementById('MainCanvas') || document.querySelector('canvas');
            if (!canvas) { state.cachedRect = null; return; }
            state.cachedRect = canvas.getBoundingClientRect();
            state.cachedScaleX = state.cachedRect.width / BC_CANVAS_W;
            state.cachedScaleY = state.cachedRect.height / BC_CANVAS_H;
        } catch (e) { /* ignore */ }
    }

    /** BC 画布坐标(2000x1000) → 屏幕像素坐标 */
    function bcToScreen(bcX, bcY) {
        if (!state.cachedRect) return { x: window.innerWidth * 0.25, y: window.innerHeight * 0.25, sx: state.cachedScaleX, sy: state.cachedScaleY };
        return {
            x: state.cachedRect.left + bcX * state.cachedScaleX,
            y: state.cachedRect.top + bcY * state.cachedScaleY,
            sx: state.cachedScaleX,
            sy: state.cachedScaleY
        };
    }

    /**
     * 角色 asset 坐标(ax, ay) → BC 画布坐标。
     * asset 空间：宽 500、高 1000，角色居中于 x=250。
     * 优先用 BC 原生 CharacterAppearanceXOffset/YOffset（含身高/姿势 OverrideHeight 等），
     * 任何身高/姿势（跪/趴/抱）都正确，绝不与原生脱节。
     */
    function bodyAssetToBc(ax, ay, C, dp) {
        var ratio = (C && typeof C.HeightRatio === 'number') ? C.HeightRatio : 1;
        var prop  = (C && typeof C.HeightRatioProportion === 'number') ? C.HeightRatioProportion : 1;
        var hMod  = (C && typeof C.HeightModifier === 'number') ? C.HeightModifier : 0;
        var xOff, yOff;
        if (typeof CharacterAppearanceXOffset === 'function') {
            try { xOff = CharacterAppearanceXOffset(C, ratio); } catch (_) { xOff = 500 * (1 - ratio) / 2; }
        } else { xOff = 500 * (1 - ratio) / 2; }
        if (typeof CharacterAppearanceYOffset === 'function') {
            try { yOff = CharacterAppearanceYOffset(C, ratio); } catch (_) { yOff = 1000 * (1 - ratio) * prop - hMod * ratio; }
        } else { yOff = 1000 * (1 - ratio) * prop - hMod * ratio; }
        var z = dp.zoom;
        return {
            x: dp.x + z * (xOff + ax * ratio),
            y: dp.y + z * (yOff + ay * ratio)
        };
    }

    /** 创建角色的身体部位线框网格（覆盖在角色身上） */
    /** 创建角色的身体部位线框（覆盖在角色身上，按 BC 原生 Zone 画热区） */
    function createBodyGrid(entry) {
        var charObj = entry.char;
        if (state.bodyGrids.has(charObj)) return state.bodyGrids.get(charObj);

        var grid = document.createElement('div');
        grid.className = 'xsact-body-grid' + (charObj.IsPlayer && charObj.IsPlayer() ? ' self' : '');
        grid.dataset.mn = charObj.MemberNumber;

        // 每个部位 + 每个 Zone 生成一个绝对定位热区（百分比摆放，分辨率无关）
        BODY_PARTS.forEach(function(part) {
            var zones = getPartZones(charObj, part.group);
            zones.forEach(function(z) {
                var btn = document.createElement('button');
                btn.className = 'xsact-part-btn';
                btn.dataset.group = part.group;
                btn.dataset.targetMn = charObj.MemberNumber;
                // 在容器(0-500 × 0-1000)内的百分比定位
                btn.style.left   = (z[0] / 500 * 100) + '%';
                btn.style.top    = (z[1] / 1000 * 100) + '%';
                btn.style.width  = (z[2] / 500 * 100) + '%';
                btn.style.height = (z[3] / 1000 * 100) + '%';
                btn.title = part.label + '（' + part.group + '）';
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    selectTargetAndPart(charObj, part.group);
                    bringGridToFront(grid);
                });
                grid.appendChild(btn);
            });
        });

        // 点击网格空白区域也提升层级
        grid.addEventListener('click', function(e) {
            if (e.target === grid) bringGridToFront(grid);
        });

        document.body.appendChild(grid);
        state.bodyGrids.set(charObj, grid);

        refreshCanvasCache();
        positionGrid(grid, entry);
        return grid;
    }

    /**
     * 根据角色布局定位线框容器。
     * 水平方向仍按角色实际宽度缩放；
     * 垂直方向固定高度，顶部锚定在角色「槽位顶部」(entry.y)，不随蹲姿/身高下移，
     * 避免人多了上下两排时，上排蹲下压到下排。
     */
    /**
     * 计算角色身体线框在屏幕上的矩形位置（供线框和名字浮层共用）
     */
    function getGridScreenRect(entry) {
        var C = entry.char;
        var dp = { x: entry.x, y: entry.y, zoom: entry.zoom };
        var sc = bcToScreen(0, 0); // 取画布→屏幕缩放因子

        // 水平：按实际角色宽度（xOff + ratio）计算，保持左右覆盖
        var left  = bodyAssetToBc(BODY_AX0, BODY_AY1, C, dp);
        var right = bodyAssetToBc(BODY_AX1, BODY_AY1, C, dp);
        var sL = bcToScreen(left.x, left.y);
        var sR = bcToScreen(right.x, right.y);
        var width = Math.abs(sR.x - sL.x);
        var centerX = (sL.x + sR.x) / 2;

        // 垂直：固定高度，顶部锚定在角色槽位顶部(entry.y)，忽略蹲姿导致的 yOff 下移
        var top = bcToScreen(entry.x, entry.y).y;
        var height = entry.zoom * GRID_FIXED_HEIGHT * sc.sy;

        return { left: centerX - width / 2, top: top, right: centerX + width / 2, bottom: top + height, width: width, height: height, centerX: centerX };
    }

    function positionGrid(grid, entry) {
        var rect = getGridScreenRect(entry);
        var shift = entry.overlapShift || 0;
        grid.style.width = rect.width + 'px';
        grid.style.height = rect.height + 'px';
        grid.style.left = (rect.left + shift) + 'px';
        grid.style.top = rect.top + 'px';
    }

    /** 取 BC 真实人物昵称（优先 Nickname，与游戏内 CharacterNickname 一致） */
    function characterDisplayName(charObj) {
        if (!charObj) return '???';
        if (typeof CharacterNickname === 'function') return CharacterNickname(charObj);
        return charObj.Nickname || charObj.Name || '???';
    }

    /** 将指定网格提升到最前（解决人物重叠时的选择问题） */
    var _gridZTop = 89999;
    function bringGridToFront(grid) {
        if (!grid) return;
        _gridZTop += 1;
        grid.style.zIndex = _gridZTop;
        // 同时降低其他网格
        state.bodyGrids.forEach(function(g) {
            if (g !== grid && g.style.zIndex > 90000) {
                g.style.zIndex = 89999;
            }
        });
    }

    /** 更新所有角色的身体网格 */
    function refreshBodyGrids() {
        clearBodyGrids();
        var layout = getCharLayout();
        var shifts = computeOverlapShifts(layout);
        layout.forEach(function(entry) {
            var isPlayer = entry.char.IsPlayer && entry.char.IsPlayer();
            if (isPlayer && !state.selfModeActive) return; // 未开启自己模式时跳过自己
            entry.overlapShift = shifts.get(entry.char.MemberNumber) || 0;
            createBodyGrid(entry);
        });
        renderCharList();
    }

    /** 当两个角色拥抱/位置严重重叠时，给被遮挡的网格加一个水平偏移，避免线框完全糊在一起。
     *  规则：只处理真正大面积重叠（>50%），忽略正常并肩站位；最大偏移约一个角色宽度，
     *  确保拥抱者能完整错开；每帧重算，玩家自己也参与避让。 */
    function computeOverlapShifts(layout) {
        var shifts = new Map();
        if (!layout || layout.length < 2) return shifts;

        var rects = layout.map(function(entry) {
            return { entry: entry, rect: getGridScreenRect(entry), mn: entry.char.MemberNumber };
        });
        rects.sort(function(a, b) { return a.rect.left - b.rect.left; });
        var screenW = window.innerWidth || 1920;
        var maxShiftBase = 70;      // 最小偏移幅度
        var overlapThreshold = 0.5; // 只有>50%面积重叠才推（拥抱级）
        var spacing = 16;           // 推开后留出的间距

        for (var i = 1; i < rects.length; i++) {
            var cur = rects[i];
            var curShift = 0;
            for (var j = 0; j < i; j++) {
                var prev = rects[j];
                var prevShift = shifts.get(prev.mn) || 0;
                if (rectsOverlap(prev.rect, cur.rect, overlapThreshold)) {
                    var desired = prev.rect.left + prevShift + prev.rect.width + spacing;
                    var need = desired - cur.rect.left;
                    if (need > curShift) curShift = need;
                }
            }
            if (curShift > 0) {
                // 关键修复：偏移幅度必须 ≥ 线框宽度 + 间距，才能把拥抱/重叠的两人“完整错开”。
                // 之前用 width*0.55（约 70px）小于线框实际宽度（约 72~80px），推完仍重叠；
                // v0.7.9 的 max(width*0.5, 80) 恰好够，这里改成 width+spacing 保证任何宽度都能彻底分离。
                var maxShift = cur.rect.width + spacing;
                curShift = Math.min(curShift, maxShift);
                // 限制在屏幕右边界内（仅在确实会越界时收紧，不因此残留重叠）
                var maxRight = screenW - 10;
                var desiredRight = cur.rect.left + curShift + cur.rect.width;
                if (desiredRight > maxRight) {
                    curShift = Math.max(0, maxRight - cur.rect.left - cur.rect.width);
                }
                if (curShift > 0) shifts.set(cur.mn, curShift);
            }
        }
        return shifts;
    }

    function rectsOverlap(a, b, threshold) {
        var xOverlap = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
        var yOverlap = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
        var aArea = a.width * a.height;
        var bArea = b.width * b.height;
        if (aArea <= 0 || bArea <= 0) return false;
        return (xOverlap * yOverlap) / Math.min(aArea, bArea) > threshold;
    }

    /** 清除所有浮动网格与名字浮层 */
    function clearBodyGrids() {
        state.bodyGrids.forEach(function(grid) {
            if (grid && grid.parentNode) grid.parentNode.removeChild(grid);
        });
        state.bodyGrids.clear();
    }

    /** 选中目标和部位 */


    /* ===== 13. 目标选择与人物浮层 ===== */
    function selectTargetAndPart(charObj, partGroup) {
        state.selectedTarget = charObj;
        state.selectedPart = partGroup;

        // 高亮选中的网格
        state.bodyGrids.forEach(function(grid, c) {
            var isSelected = (c.MemberNumber === charObj.MemberNumber);
            grid.classList.toggle('selected', isSelected);
            grid.querySelectorAll('.xsact-part-btn').forEach(function(btn) {
                btn.classList.toggle('active', isSelected && btn.dataset.group === partGroup);
            });
        });

        // 更新右侧面板（按当前模式分派）
        renderCharList();
        renderPanel();
    }

    /** 获取当前房间内有效成员（自己受 selfMode 控制） */
    function getRoomCharacters() {
        var arr = [];
        if (typeof ChatRoomCharacter !== 'undefined' && Array.isArray(ChatRoomCharacter)) {
            ChatRoomCharacter.forEach(function(c) {
                if (!c || !c.MemberNumber) return;
                var isSelf = c.IsPlayer && c.IsPlayer();
                if (isSelf && !state.selfModeActive) return;
                arr.push(c);
            });
        }
        return arr;
    }

    /** 从人物列表选中角色：清除已选部位，切换到左侧浮层的部位选择视图 */
    function selectCharacterFromList(charObj) {
        state.selectedTarget = charObj;
        state.selectedPart = null;
        state.selectedAction = null;
        state.selectedActionItem = null;
        state.popoverView = 'parts';
        // 同步高亮该角色的身体线框
        state.bodyGrids.forEach(function(grid, c) {
            grid.classList.toggle('selected', c.MemberNumber === charObj.MemberNumber);
            grid.querySelectorAll('.xsact-part-btn').forEach(function(btn) {
                btn.classList.remove('active');
            });
        });
        renderPopover();
        renderPanel();
    }

    /** 渲染人物列表弹出层 */
    function renderCharList() {
        var bodyEl = state.actionPanelEl && state.actionPanelEl.querySelector('#xsact-char-popover-body');
        if (!bodyEl) return;
        var chars = getRoomCharacters();
        var html = '';
        if (chars.length === 0) {
            html = '<div class="xsact-char-popover-empty">房间无人</div>';
        } else {
            html = '<div class="xsact-char-popover-items">';
            chars.forEach(function(c) {
                var isSelf = c.IsPlayer && c.IsPlayer();
                var selected = state.selectedTarget && state.selectedTarget.MemberNumber === c.MemberNumber;
                html += '<div class="xsact-char-popover-item' + (selected ? ' selected' : '') + (isSelf ? ' self' : '') + '" data-mn="' + c.MemberNumber + '">' +
                    '<span class="xsact-char-popover-name">' + escapeHtml(characterDisplayName(c)) + '</span>' +
                    (isSelf ? '<span class="xsact-char-popover-self">自己</span>' : '') +
                    '</div>';
            });
            html += '</div>';
        }
        bodyEl.innerHTML = html;
        var items = bodyEl.querySelectorAll('.xsact-char-popover-item');
        items.forEach(function(item) {
            item.addEventListener('click', function(e) {
                e.stopPropagation();
                var mn = parseInt(item.dataset.mn, 10);
                var c = chars.find(function(x) { return x.MemberNumber === mn; });
                if (c) selectCharacterFromList(c);
            });
        });
    }

    /** 渲染左侧浮层「部位选择」视图：用 BC 原生 Zone 矩形拼出矩形身体地图。
     *  与游戏内浮动线框共用 getPartZones() 同一套真值坐标，保持「原版矩形选择」体感。 */
    function renderPopoverParts(charObj) {
        var bodyEl = state.actionPanelEl && state.actionPanelEl.querySelector('#xsact-char-popover-body');
        if (!bodyEl) return;

        // 用 BC 原生 AssetGroup[].Zone 矩形（500x1000 资产空间）逐个部位生成可点击热区。
        // 矩形本身即身体轮廓，不需要额外人物贴图——这正是 BC 原版「点矩形选部位」的方式。
        var rects = '';
        BODY_PARTS.forEach(function(part) {
            var zones = getPartZones(charObj, part.group);
            zones.forEach(function(z) {
                var x = z[0], y = z[1], w = z[2], h = z[3];
                var rx = Math.min(16, Math.min(w, h) * 0.4);
                var sel = (state.selectedPart === part.group) ? ' selected' : '';
                rects += '<rect class="xsact-body-part-zone' + sel + '" data-group="' + part.group +
                    '" x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + w.toFixed(1) +
                    '" height="' + h.toFixed(1) + '" rx="' + rx.toFixed(1) + '" data-label="' + part.label + '"/>';
            });
        });

        var svg = '<svg class="xsact-body-svg" viewBox="0 0 500 1000" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">' +
            rects +
            '</svg>' +
            '<div class="xsact-body-part-hint">点击身体部位选择动作</div>';
        bodyEl.innerHTML = '<div class="xsact-body-select">' + svg + '</div>';

        var hint = bodyEl.querySelector('.xsact-body-part-hint');
        bodyEl.querySelectorAll('.xsact-body-part-zone').forEach(function(zone) {
            zone.addEventListener('mouseenter', function() {
                var label = zone.dataset.label || zone.dataset.group;
                if (hint) hint.textContent = label;
                zone.classList.add('hover');
            });
            zone.addEventListener('mouseleave', function() {
                if (hint) hint.textContent = '点击身体部位选择动作';
                zone.classList.remove('hover');
            });
            zone.addEventListener('click', function(e) {
                e.stopPropagation();
                state.selectedPart = zone.dataset.group;
                // 立即高亮当前选中的矩形，避免等下次重绘
                bodyEl.querySelectorAll('.xsact-body-part-zone').forEach(function(z) {
                    z.classList.toggle('selected', z.dataset.group === state.selectedPart);
                });
                renderPanel();
                // 选择部位后保持浮层开启，方便继续选其他部位
            });
        });
    }

    /** 渲染左侧人物浮层：根据 popoverView 切换人物列表 / 部位选择 */
    function renderPopover() {
        var popover = state.actionPanelEl && state.actionPanelEl.querySelector('#xsact-char-popover');
        var titleEl = state.actionPanelEl && state.actionPanelEl.querySelector('#xsact-char-popover-title');
        if (!popover) return;
        var view = (state.popoverView === 'parts' && state.selectedTarget) ? 'parts' : 'chars';
        popover.classList.toggle('show-back', view === 'parts');
        if (view === 'chars') {
            if (titleEl) titleEl.textContent = '人物列表';
            renderCharList();
        } else {
            if (titleEl) titleEl.textContent = (characterDisplayName(state.selectedTarget) || '?') + ' → 选择部位';
            renderPopoverParts(state.selectedTarget);
        }
    }

    /** 打开人物列表弹出层 */
    function openCharPopover() {
        if (!state.actionPanelEl) return;
        var panel = state.actionPanelEl;
        var popover = panel.querySelector('#xsact-char-popover');
        var tab = panel.querySelector('#xsact-char-popover-tab');
        if (!popover) return;
        // 打开时默认显示人物列表
        state.popoverView = 'chars';
        // 智能定位：若面板左侧空间不足，则弹出层显示在右侧
        var rect = panel.getBoundingClientRect();
        if (rect.left < 256) {
            popover.classList.add('right');
        } else {
            popover.classList.remove('right');
        }
        popover.style.display = 'flex';
        state.charListOpen = true;
        panel.classList.add('popover-open');
        if (tab) tab.classList.add('active');
        renderPopover();
    }

    /** 关闭人物列表弹出层 */
    function closeCharPopover() {
        if (!state.actionPanelEl) return;
        var panel = state.actionPanelEl;
        var popover = panel.querySelector('#xsact-char-popover');
        var tab = panel.querySelector('#xsact-char-popover-tab');
        if (popover) popover.style.display = 'none';
        state.charListOpen = false;
        state.popoverView = 'chars';
        panel.classList.remove('popover-open');
        if (tab) tab.classList.remove('active');
    }

    /** 切换人物列表弹出层 */
    function toggleCharPopover() {
        if (state.charListOpen) closeCharPopover();
        else openCharPopover();
    }


    // ════════════════════════════════════════════════════════════════════════
    // 右侧动作面板
    // ════════════════════════════════════════════════════════════════════════

    /** 面板渲染分派：根据 state.panelMode 渲染「单部位」或「自定义组合」 */


    /* ===== 14. 面板渲染与模式 ===== */
    function renderPanel() {
        if (!state.actionPanelEl) return;
        var listEl = state.actionPanelEl.querySelector('#xsact-action-list');
        var titleEl = state.actionPanelEl.querySelector('#xsact-panel-title');
        if (listEl) {
            listEl.classList.toggle('xsact-custom-mode', state.panelMode === 'custom');
            listEl.classList.toggle('xsact-combo-mode', state.panelMode === 'combo');
        }
        updateAllButtonVisual();
        updateFavButtonVisual();

        // 「我的动作」「组合动作」可独立展开，无需先选中人物或身体部位
        if (state.panelMode === 'custom') {
            updateCustomActionPanel(state.selectedTarget);   // charObj 可能为 null
            return;
        }
        if (state.panelMode === 'combo') {
            updateComboPanel(state.selectedTarget);          // charObj 可能为 null
            return;
        }

        // 「动作」模式：必须先选中人物与身体部位
        if (!state.selectedTarget) {
            if (titleEl) titleEl.textContent = '选择动作...';
            if (listEl) listEl.innerHTML = '<div class="xsact-qa-empty">点击左侧 ◀ 按钮选择人物和部位</div>';
            return;
        }
        if (!state.selectedPart) {
            if (titleEl) titleEl.textContent = (characterDisplayName(state.selectedTarget) || '?') + ' → 选择部位';
            if (listEl) listEl.innerHTML = '<div class="xsact-qa-empty">请在左侧人物浮层选择身体部位</div>';
            return;
        }
        updateActionPanel(state.selectedTarget, state.selectedPart);
    }

    /** 切换面板模式（部位 / 自定义组合） */
    function setPanelMode(mode) {
        if (!/^(part|combo|custom)$/.test(mode)) return;
        state.panelMode = mode;
        persist(S_MODE, mode);
        if (state.actionPanelEl) {
            state.actionPanelEl.querySelectorAll('.xsact-mode-tab').forEach(function(tab) {
                tab.classList.toggle('active', tab.dataset.mode === mode);
            });
        }
        renderPanel();
    }

    /** 刷新面板状态（用于刷新按钮）：重新读取当前部位/人物的可执行动作或组合列表 */
    function refreshPanelState() {
        if (!state.actionPanelEl) { toast('请先开启动作模式', '#888'); return; }
        if (state.panelMode === 'custom') {
            updateCustomActionPanel(state.selectedTarget);
            toast('我的动作列表已刷新', '#FF5C7A');
        } else if (state.panelMode === 'combo') {
            // 重新从存储加载组合，并刷新视图
            state.combos = loadSetting(S_COMBOS, []);
            updateComboPanel(state.selectedTarget);
            toast('组合列表已刷新', '#FF5C7A');
        } else {
            // 「动作」模式才需要选中人物 + 部位
            if (!state.selectedTarget || !state.selectedPart) { toast('请先选择一个人物部位', '#888'); return; }
            // 重新渲染当前部位动作列表（ActivityAllowedForGroup 会实时重新计算）
            updateActionPanel(state.selectedTarget, state.selectedPart);
            toast('动作列表已刷新', '#FF5C7A');
        }
    }

    /** 自定义组合面板：列表视图 或 编辑视图 */
    function updateComboPanel(charObj) {
        if (!state.actionPanelEl) return;
        var titleEl = state.actionPanelEl.querySelector('#xsact-panel-title');
        var listEl = state.actionPanelEl.querySelector('#xsact-action-list');
        var allBtn = state.actionPanelEl.querySelector('#xsact-all-btn');
        if (!titleEl || !listEl) return;

        if (state.editingComboId) {
            // ── 编辑视图 ──
            var combo = getCombo(state.editingComboId);
            if (!combo) { state.editingComboId = null; updateComboPanel(charObj); return; }
            titleEl.textContent = '编辑：' + combo.name;
            if (allBtn) allBtn.disabled = false;

            var html = '<div class="xsact-combo-editor">';
            // 名称输入
            html += '<div class="xsact-combo-field"><input type="text" id="xsact-combo-name" value="' +
                escapeHtml(combo.name) + '" placeholder="组合名称"></div>';
            // 动作间隔（延迟）滑块
            var curDelay = comboDelay(combo);
            html += '<div class="xsact-combo-field xsact-combo-delay">' +
                '<label>动作间隔 <span id="xsact-delay-val">' + curDelay + '</span>ms</label>' +
                '<input type="range" id="xsact-combo-delay" min="50" max="2000" step="50" value="' + curDelay + '">' +
                '</div>';
            // 条目列表
            if (!combo.items.length) {
                html += '<div class="xsact-qa-empty">请到「动作」模式，点击动作旁的「加入」按钮添加</div>';
            } else {
                html += '<div class="xsact-combo-items">';
                combo.items.forEach(function(it, idx) {
                    var partLbl = (BODY_PARTS.find(function(p) { return p.group === it.group; }) || {}).label || it.group;
                    html += '<div class="xsact-combo-item" data-idx="' + idx + '">' +
                        '<span class="xsact-combo-item-num">' + (idx + 1) + '</span>' +
                        '<span class="xsact-combo-item-part">' + escapeHtml(partLbl) + '</span>' +
                        '<span class="xsact-combo-item-action">' + escapeHtml(it.label || it.action) + '</span>' +
                        '<button class="xsact-combo-item-up" title="上移">' + svgIcon('up', 13) + '</button>' +
                        '<button class="xsact-combo-item-down" title="下移">' + svgIcon('down', 13) + '</button>' +
                        '<button class="xsact-combo-item-del" title="删除" data-tooltip-type="danger">' + svgIcon('close', 13) + '</button>' +
                        '</div>';
                });
                html += '</div>';
            }
            // 操作按钮
            html += '<div class="xsact-combo-actions">' +
                '<button class="xsact-combo-save-btn">保存</button>' +
                '<button class="xsact-combo-cancel-btn">返回</button>' +
                '</div>';
            html += '</div>';
            listEl.innerHTML = html;

            // 绑定
            var nameInput = listEl.querySelector('#xsact-combo-name');
            if (nameInput) nameInput.addEventListener('change', function() { renameCombo(combo.id, nameInput.value); titleEl.textContent = '编辑：' + combo.name; });
            // 延迟滑块
            var delayInput = listEl.querySelector('#xsact-combo-delay');
            var delayVal = listEl.querySelector('#xsact-delay-val');
            if (delayInput) delayInput.addEventListener('input', function() {
                var v = parseInt(delayInput.value, 10) || 160;
                if (delayVal) delayVal.textContent = v;
                combo.delay = v;
                saveCombos();
            });
            listEl.querySelectorAll('.xsact-combo-item-del').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    var idx = parseInt(btn.closest('.xsact-combo-item').dataset.idx, 10);
                    removeComboItem(combo.id, idx);
                    updateComboPanel(charObj);
                });
            });
            listEl.querySelectorAll('.xsact-combo-item-up').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    var idx = parseInt(btn.closest('.xsact-combo-item').dataset.idx, 10);
                    if (idx > 0) { moveComboItem(combo.id, idx, idx - 1); updateComboPanel(charObj); }
                });
            });
            listEl.querySelectorAll('.xsact-combo-item-down').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    var idx = parseInt(btn.closest('.xsact-combo-item').dataset.idx, 10);
                    if (idx < combo.items.length - 1) { moveComboItem(combo.id, idx, idx + 1); updateComboPanel(charObj); }
                });
            });
            var saveBtn = listEl.querySelector('.xsact-combo-save-btn');
            if (saveBtn) saveBtn.addEventListener('click', function() { stopEditCombo(); toast('组合已保存', '#46E0A0'); });
            var cancelBtn = listEl.querySelector('.xsact-combo-cancel-btn');
            if (cancelBtn) cancelBtn.addEventListener('click', stopEditCombo);
            return;
        }

        // ── 列表视图 ──
        titleEl.textContent = (charObj ? characterDisplayName(charObj) + ' → ' : '') + '组合动作';
        if (allBtn) allBtn.disabled = false;

        var html = '';
        if (!state.combos.length) {
            html = '<div class="xsact-qa-empty">暂无组合。点击下方「新建组合」，然后到「动作」模式点击动作旁的「加入」按钮添加动作。</div>';
        } else {
            state.combos.forEach(function(c) {
                html += '<div class="xsact-combo-card" data-id="' + c.id + '">' +
                    '<div class="xsact-combo-info">' +
                    '<span class="xsact-combo-name">' + escapeHtml(c.name) + '</span>' +
                    '<span class="xsact-combo-count">' + c.items.length + ' 步</span>' +
                    '</div>' +
                    '<div class="xsact-combo-btns">' +
                    '<button class="xsact-combo-run" title="执行">' + svgIcon('play', 14) + '</button>' +
                    '<button class="xsact-combo-edit" title="编辑">' + svgIcon('pencil', 14) + '</button>' +
                    '<button class="xsact-combo-delete" title="删除" data-tooltip-type="danger">' + svgIcon('trash', 14) + '</button>' +
                    '</div>' +
                    '</div>';
            });
        }
        html += '<button class="xsact-combo-new-btn" id="xsact-new-combo-btn">' + svgIcon('plus', 15) + '新建组合</button>';
        listEl.innerHTML = html;

        listEl.querySelectorAll('.xsact-combo-run').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                var id = btn.closest('.xsact-combo-card').dataset.id;
                var c = getCombo(id);
                if (!c || !c.items.length) return;
                if (state.allModeActive) { runComboAll(c); return; }
                if (!charObj) { toast('请先在左侧选择人物', '#FF5C5C'); return; }
                runComboOnTarget(charObj, c);
            });
        });
        listEl.querySelectorAll('.xsact-combo-edit').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                startEditCombo(btn.closest('.xsact-combo-card').dataset.id);
            });
        });
        listEl.querySelectorAll('.xsact-combo-delete').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                var id = btn.closest('.xsact-combo-card').dataset.id;
                qiactConfirm({ title: '删除组合', body: '确定删除这个组合吗？', confirmText: '删除', danger: true }).then(function(ok) {
                    if (!ok) return;
                    deleteCombo(id); updateComboPanel(charObj);
                });
            });
        });
        var newBtn = listEl.querySelector('#xsact-new-combo-btn');
        if (newBtn) newBtn.addEventListener('click', function() {
            var c = addCombo('新组合');
            startEditCombo(c.id);
        });
    }



    function escapeHtml(s) {
        return String(s || '').replace(/[&<>"']/g, function(m) {
            return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m];
        });
    }

    /** 统一内联 SVG 图标（无 emoji）。stroke 继承 currentColor；部分实心图标单独处理。 */
    function svgIcon(name, size) {
        // 我的动作标签图标：糖果/魔法棒（用户提供的矢量图，实心）。
        if (name === 'custom') {
            return '<svg class="xsact-ico" viewBox="0 0 1024 1024" width="' + size + '" height="' + size +
                '" fill="currentColor" aria-hidden="true">' +
                '<path d="M727.008 487.232l194.016-184.32a99.2 99.2 0 0 0 0-140.288l-48.416-48.416a99.2 99.2 0 0 0-138.464-1.76L544.64 292.384l-184.064-196.64-1.504-1.568a64.832 64.832 0 0 0-91.712-0.384L129.184 231.968a64.8 64.8 0 0 0-1.12 90.144l181.344 193.728-171.456 162.88a99.264 99.264 0 0 0-28.256 49.28l-28.992 123.744a65.632 65.632 0 0 0 82.4 77.92l119.296-35.136a99.744 99.744 0 0 0 40.32-23.232l169.056-160.608 203.616 217.536 1.504 1.568a64.832 64.832 0 0 0 91.712 0.384l138.176-138.176a64.8 64.8 0 0 0 1.12-90.144l-200.896-214.624zM319.424 786.176l-90.112-90.112a31.488 31.488 0 0 0-9.792-6.496L667.104 264.352l94.272 94.272c1.408 1.408 3.168 2.08 4.768 3.168L319.424 786.176zM778.208 158.784a35.2 35.2 0 0 1 49.12 0.64l48.416 48.416c13.76 13.76 13.76 36.032-0.64 50.4l-64.448 61.216c-1.28-2.08-2.24-4.288-4.064-6.112l-93.12-93.12 64.736-61.44zM288.512 399.904c8-0.128 16-3.168 22.112-9.28l48-48a31.968 31.968 0 1 0-45.248-45.248l-48 48a31.68 31.68 0 0 0-8.928 20.256L174.816 278.4c-0.512-0.512-0.512-1.024-0.352-1.152L312.64 139.04c0.128-0.128 0.672-0.128 1.248 0.416l184.384 196.992-142.432 135.328-67.328-71.872zM145.024 868.288a1.6 1.6 0 0 1-2.016-1.92l28.992-123.744c0.992-4.16 2.944-7.968 5.312-11.488a31.808 31.808 0 0 0 6.752 10.144l88.288 88.288a35.072 35.072 0 0 1-8 3.552l-119.328 35.168z m598.336 16.672c-0.128 0.128-0.672 0.128-1.248-0.416l-125.6-134.176a31.232 31.232 0 0 0 14.08-7.712l48-48a31.968 31.968 0 1 0-45.248-45.248l-48 48a31.68 31.68 0 0 0-7.296 11.904l-39.904-42.656 142.432-135.328 200.576 214.304c0.48 0.512 0.48 1.024 0.352 1.152l-138.144 138.176z"/>' +
                '</svg>';
        }
        if (name === 'favRemove') {
            return '<svg class="xsact-ico" viewBox="0 0 1024 1024" width="' + size + '" height="' + size +
                '" fill="currentColor" aria-hidden="true">' +
                '<path d="M481.408 62.037333a34.133333 34.133333 0 0 1 61.184 0l111.957333 226.773334a34.133333 34.133333 0 0 0 13.781334 14.592 341.418667 341.418667 0 0 0-238.378667 507.733333L272.213333 894.037333a34.133333 34.133333 0 0 1-49.493333-35.968l42.752-249.258666a34.133333 34.133333 0 0 0-9.813333-30.208L74.538667 402.048a34.133333 34.133333 0 0 1 18.901333-58.197333l250.282667-36.394667a34.133333 34.133333 0 0 0 25.685333-18.645333l111.957333-226.773334z"/>' +
                '<path d="M725.333333 896a256 256 0 1 0 0-512 256 256 0 0 0 0 512z m-85.333333-298.666667h170.666667a42.666667 42.666667 0 1 1 0 85.333334h-170.666667a42.666667 42.666667 0 1 1 0-85.333334z"/>' +
                '</svg>';
        }
        // 批量编辑图标：文档 + 铅笔（用户提供的矢量图，实心）。
        if (name === 'bulkEdit') {
            return '<svg class="xsact-ico" viewBox="0 0 1024 1024" width="' + size + '" height="' + size +
                '" fill="currentColor" aria-hidden="true">' +
                '<path d="M957.3 147L860 49.7c-13.6-13.6-35.7-13.7-49.4-0.1L437.5 418.7c-4.8 4.8-8.1 10.8-9.6 17.4l-28.4 130.2a34.92 34.92 0 0 0 10 32.7c6.6 6.3 15.3 9.8 24.2 9.8 3 0 5.9-0.4 8.9-1.1l125.7-32.9c6-1.6 11.4-4.7 15.8-9l373.1-369.1c6.6-6.6 10.4-15.5 10.4-24.8-0.1-9.3-3.7-18.3-10.3-24.9zM541.5 509.4L480 525.5l14-64.3 341-337.3 47.8 47.8-341.3 337.7z"/>' +
                '<path d="M888.3 442.8c-19.3 0-35 15.7-35 35v267H248V203h215.1c19.3 0 35-15.7 35-35s-15.7-35-35-35H213c-19.3 0-35 15.7-35 35v135.1H96.1c-19.3 0-35 15.7-35 35v590.1c0 19.3 15.7 35 35 35h675.4c19.3 0 35-15.7 35-35V814.8h81.9c19.3 0 35-15.7 35-35v-302c-0.1-19.3-15.8-35-35.1-35zM736.4 893.3H131.1V373.2H178v406.6c0 19.3 15.7 35 35 35h523.4v78.5z"/>' +
                '</svg>';
        }
        size = size || 16;
        var P = {
            close:    '<path d="M6 6l12 12M18 6L6 18"/>',
            refresh:  '<path d="M21 12a9 9 0 1 1-2.64-6.36"/><path d="M21 3v6h-6"/>',
            play:     '<path d="M7 4l13 8-13 8z"/>',
            star:     '<path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.9 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z"/>',
            starFill: '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>',
            plus:     '<path d="M12 5v14M5 12h14"/>',
            trash:    '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
            pencil:   '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M14 6l4 4"/>',
            up:       '<path d="M6 14l6-6 6 6"/>',
            down:     '<path d="M6 10l6 6 6-6"/>',
            grip:     '<circle cx="9" cy="6" r="1.4"/><circle cx="15" cy="6" r="1.4"/><circle cx="9" cy="12" r="1.4"/><circle cx="15" cy="12" r="1.4"/><circle cx="9" cy="18" r="1.4"/><circle cx="15" cy="18" r="1.4"/>',
            check:    '<path d="M5 12l5 5 9-11"/>',
            bolt:     '<path d="M13 2 4 14h7l-1 8 10-12h-7z"/>',
            resize:   '<path d="M22 2L2 22M16 22h6v-6"/>',
            users:    '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
            target:   '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>',
            tag:      '<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><circle cx="7" cy="7" r="1.5"/>',
            zap:      '<polygon points="13 2 4 14 11 14 10 22 20 10 13 10"/>',
            layers:   '<path d="M12 3L2 9l10 6 10-6-10-6z"/><path d="M2 15l10 6 10-6"/>',
            user:     '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
            'triangle-left': '<path d="M18 5L7 12l11 7z" fill="currentColor" stroke="none"/>',
            settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
            download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
            upload:   '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
            sun:      '<circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>',
            moon:     '<path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"/>',
            edit:     '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z"/>',
            power:    '<path d="M12 2v10"/><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/>',
            toggleOff:'<path d="M6 4h12a8 8 0 0 1 0 16H6a8 8 0 0 1 0-16z" fill="none"/><circle cx="6" cy="12" r="4" fill="currentColor" stroke="none"/>',
            toggleOn: '<path d="M6 4h12a8 8 0 0 1 0 16H6a8 8 0 0 1 0-16z" fill="none"/><circle cx="18" cy="12" r="4" fill="currentColor" stroke="none"/>'
        };
        var inner = P[name] || '';
        return '<svg class="xsact-ico" viewBox="0 0 24 24" width="' + size + '" height="' + size +
            '" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
            inner + '</svg>';
    }

    function updateActionPanel(charObj, partGroup) {
        try {
            // 该函数只应在「单部位」动作面板模式下渲染；若当前处于 custom/combo，避免覆盖界面。
            if (state.panelMode !== 'part') return;
            // 用模块持有的面板引用查询，避免重复注入时 getElementById 命中隐藏旧面板
            if (!state.actionPanelEl) return;
            var titleEl = state.actionPanelEl.querySelector('#xsact-panel-title');
            var listEl = state.actionPanelEl.querySelector('#xsact-action-list');
            var allBtn = state.actionPanelEl.querySelector('#xsact-all-btn');

            if (!titleEl || !listEl) return;
            if (!charObj || !partGroup) {
                listEl.innerHTML = '<div class="xsact-qa-empty">请先在左侧选择人物和部位</div>';
                return;
            }

            var partLabel = BODY_PARTS.find(function(p) { return p.group === partGroup; });
            titleEl.textContent = (characterDisplayName(charObj) || '?') + ' → ' + (partLabel ? partLabel.label : partGroup);

            var actions = getActionsForPart(partGroup, charObj);
            if (!Array.isArray(actions) || actions.length === 0) {
                listEl.innerHTML = '<div class="xsact-qa-empty">该部位暂无可用动作</div>';
                if (allBtn) allBtn.disabled = true;
                return;
            }

            if (allBtn) allBtn.disabled = false;
            var html = '';
            var isEditing = !!state.editingComboId;
            actions.forEach(function(act) {
                if (!act || !act.Name) return;
                var lbl = getActivityLabel(act.Name, partGroup);
                var isFav = state.favorites.indexOf(partGroup + '|' + act.Name) !== -1;
                // 来源水印功能已暂停（按需求优先修复动作显示功能）。
                // 下方点击处理器仍用 caDetectSource 判断 LSCG/Liko 以触发自动刷新。
                html += '<div class="xsact-action-row' + (isEditing ? ' editing' : '') + '" data-name="' + escapeHtml(act.Name) + '">' +
                    '<button class="xsact-action-btn' + (isFav ? ' fav' : '') + '" data-name="' + escapeHtml(act.Name) + '" title="' + escapeHtml(act.Name) + '">' +
                    '<span class="xsact-action-label">' + escapeHtml(lbl) + '</span>' +
                    (isFav ? '<span class="xsact-action-star">' + svgIcon('starFill', 13) + '</span>' : '') +
                    '</button>';
                if (isEditing) {
                    html += '<button class="xsact-add-to-combo" title="加入当前组合">' + svgIcon('plus', 16) + '</button>';
                }
                html += '</div>';
            });
            listEl.innerHTML = html || '<div class="xsact-qa-empty">该部位暂无可用动作</div>';

            // 绑定动作按钮点击：收藏模式下加入/取消收藏，否则执行
            listEl.querySelectorAll('.xsact-action-btn').forEach(function(btn) {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation(); // 避免冒泡到面板导致左侧人物浮层关闭
                    var actName = btn.dataset.name;
                    var act = actions.find(function(a) { return a && a.Name === actName; }) || { Name: actName, Item: null };
                    state.selectedAction = actName;
                    state.selectedActionItem = act.Item || null;
                    listEl.querySelectorAll('.xsact-action-btn').forEach(b => b.classList.remove('sel'));
                    btn.classList.add('sel');

                    if (state.favModeActive) {
                        toggleFavoriteAction(partGroup, actName, btn);
                        return;
                    }

                    if (state.allModeActive) executeActionAll();
                    else {
                        var execOk = executeAction(charObj, actName, act.Item || null);
                        var srcKey = caDetectSource(actName);
                        // 来源为 LSCG / Liko 的动作会改变可用状态/进度（如进食进度、道具附加），
                        // 执行后立即静默刷新当前部位动作列表以反映最新状态，且不弹任何提示。
                        if (srcKey === 'LSCG' || srcKey === 'LIKO') {
                            setTimeout(function() { try { updateActionPanel(charObj, partGroup); } catch (_) { console.warn('[QiAct] 延迟刷新动作面板失败（已忽略）:', _ && _.message); } }, 50);
                        } else if (execOk !== false) {
                            toast('已执行：' + getActivityLabel(actName, partGroup), '#46E0A0');
                        }
                    }
                });
            });

            // 绑定「加入组合」点击（编辑模式）
            if (isEditing) {
                listEl.querySelectorAll('.xsact-add-to-combo').forEach(function(btn) {
                    btn.addEventListener('click', function(e) {
                        e.stopPropagation(); // 避免冒泡到面板导致左侧人物浮层关闭
                        var actName = btn.parentNode.dataset.name;
                        var act = actions.find(function(a) { return a && a.Name === actName; }) || { Name: actName, Item: null, translatedName: actName };
                        var lbl = act.translatedName || getActivityLabel(act.Name, partGroup);
                        addComboItem(state.editingComboId, partGroup, act.Name, lbl, act.Item || null);
                        toast('已加入「' + getCombo(state.editingComboId).name + '」', '#46E0A0');
                    });
                });
            }
        } catch (panelErr) {
            console.error('[QiAct] updateActionPanel 渲染失败:', panelErr);
            if (state.actionPanelEl) {
                var listEl = state.actionPanelEl.querySelector('#xsact-action-list');
                if (listEl) listEl.innerHTML = '<div class="xsact-qa-empty" style="color:#FF8FA6">动作列表加载出错，请刷新或反馈。<br><small>' + escapeHtml(panelErr.message) + '</small></div>';
            }
        }
    }

    // ════════════════════════════════════════════════════════════════════════
    // 事件绑定
    // ════════════════════════════════════════════════════════════════════════

    /** 把面板恢复到上次拖拽保存的位置（无记录则用默认右上角） */


    function applyPanelPosition() {
        if (!state.actionPanelEl) return;
        var saved = loadSetting(S_POS, null);
        if (saved && typeof saved.left === 'number' && typeof saved.top === 'number') {
            state.actionPanelEl.style.right = 'auto';
            state.actionPanelEl.style.bottom = 'auto';
            state.actionPanelEl.style.left = saved.left + 'px';
            state.actionPanelEl.style.top = saved.top + 'px';
        }
    }

    /** 保存面板位置（拖拽结束调用） */
    function savePanelPosition() {
        if (!state.actionPanelEl) return;
        var r = state.actionPanelEl.getBoundingClientRect();
        persist(S_POS, { left: Math.round(r.left), top: Math.round(r.top) });
    }

    /** 应用保存的面板尺寸 */
    function applyPanelSize() {
        if (!state.actionPanelEl) return;
        var saved = loadSetting(S_SIZE, null);
        if (saved && typeof saved.width === 'number' && typeof saved.height === 'number') {
            state.actionPanelEl.style.width = Math.max(220, Math.min(560, saved.width)) + 'px';
            state.actionPanelEl.style.height = Math.max(300, Math.min(Math.min(window.innerHeight - 60, 820), saved.height)) + 'px';
        }
    }

    /** 保存面板尺寸（缩放结束调用） */
    function savePanelSize() {
        if (!state.actionPanelEl) return;
        persist(S_SIZE, { width: Math.round(state.actionPanelEl.offsetWidth), height: Math.round(state.actionPanelEl.offsetHeight) });
    }

    /** 让面板右下角可缩放 */
    function makeResizable(panel) {
        var handle = panel.querySelector('#xsact-resize-handle');
        if (!handle) return;
        var resizing = false, sx = 0, sy = 0, ow = 0, oh = 0;

        function onMove(e) {
            if (!resizing) return;
            var nw = ow + (e.clientX - sx);
            var nh = oh + (e.clientY - sy);
            nw = Math.max(220, Math.min(560, nw));
            nh = Math.max(300, Math.min(Math.min(window.innerHeight - 60, 820), nh));
            panel.style.width = nw + 'px';
            panel.style.height = nh + 'px';
        }
        function onUp() {
            if (!resizing) return;
            resizing = false;
            handle.classList.remove('resizing');
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
            savePanelSize();
        }
        handle.addEventListener('mousedown', function(e) {
            resizing = true;
            sx = e.clientX; sy = e.clientY;
            ow = panel.offsetWidth; oh = panel.offsetHeight;
            handle.classList.add('resizing');
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
            e.preventDefault();
            e.stopPropagation();
        });
    }

    /** 让面板标题栏可拖拽 */
    function makeDraggable(panel) {
        var header = panel.querySelector('#xsact-panel-header');
        if (!header) return;
        var dragging = false, sx = 0, sy = 0, ox = 0, oy = 0;

        function onMove(e) {
            if (!dragging) return;
            var nx = ox + (e.clientX - sx);
            var ny = oy + (e.clientY - sy);
            // 限制在视口内
            var w = panel.offsetWidth, h = panel.offsetHeight;
            nx = Math.max(4, Math.min(nx, window.innerWidth - w - 4));
            ny = Math.max(4, Math.min(ny, window.innerHeight - h - 4));
            panel.style.left = nx + 'px';
            panel.style.top = ny + 'px';
            panel.style.right = 'auto';
            panel.style.bottom = 'auto';
        }
        function onUp() {
            if (!dragging) return;
            dragging = false;
            header.classList.remove('dragging');
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
            savePanelPosition();
        }
        header.addEventListener('mousedown', function(e) {
            // 标题栏上的按钮不触发拖拽
            if (e.target.closest('button')) return;
            dragging = true;
            sx = e.clientX; sy = e.clientY;
            var r = panel.getBoundingClientRect();
            ox = r.left; oy = r.top;
            panel.style.right = 'auto';
            panel.style.bottom = 'auto';
            header.classList.add('dragging');
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
            e.preventDefault();
        });
    }

    function bindPanelEvents(panel) {
        // 退出按钮（面板上的 ✕）
        var exitBtn = panel.querySelector('#xsact-exit-panel-btn');
        if (exitBtn) exitBtn.addEventListener('click', function() { toggleActionMode(); });

        // 刷新按钮：重新渲染当前面板状态（单部位刷新动作列表，组合模式刷新组合列表）
        var refreshBtn = panel.querySelector('#xsact-refresh-btn');
        if (refreshBtn) refreshBtn.addEventListener('click', refreshPanelState);

        // 模式切换标签（动作 / 组合动作）
        panel.querySelectorAll('.xsact-mode-tab').forEach(function(tab) {
            tab.addEventListener('click', function() { setPanelMode(tab.dataset.mode); });
        });

        // 人物列表弹出层：左侧三角形按钮 + 关闭 + 返回
        var charPopoverTab = panel.querySelector('#xsact-char-popover-tab');
        var charPopoverClose = panel.querySelector('#xsact-char-popover-close');
        var charPopoverBack = panel.querySelector('#xsact-char-popover-back');
        if (charPopoverTab) {
            charPopoverTab.addEventListener('click', function(e) {
                e.stopPropagation();
                toggleCharPopover();
            });
        }
        if (charPopoverClose) {
            charPopoverClose.addEventListener('click', function(e) {
                e.stopPropagation();
                closeCharPopover();
            });
        }
        if (charPopoverBack) {
            charPopoverBack.addEventListener('click', function(e) {
                e.stopPropagation();
                state.popoverView = 'chars';
                renderPopover();
            });
        }
        // 点击面板内部不关闭；点击面板外部关闭人物列表
        panel.addEventListener('click', function(e) {
            var popover = panel.querySelector('#xsact-char-popover');
            if (popover && state.charListOpen && !popover.contains(e.target) && e.target !== charPopoverTab && !(charPopoverTab && charPopoverTab.contains(e.target))) {
                closeCharPopover();
            }
        });
        // 阻止 BC 页面全局 wheel 监听吞掉面板内滚动：wheel 事件在面板层停止冒泡，
        // 让面板/浮层自身的 overflow 滚动正常生效（不 preventDefault，保留原生滚动）。
        panel.addEventListener('wheel', function(e) { e.stopPropagation(); }, { passive: true });
        var charPop = panel.querySelector('#xsact-char-popover');
        if (charPop) charPop.addEventListener('wheel', function(e) { e.stopPropagation(); }, { passive: true });

        // 右侧动作选择面板需要更积极的滚动保护：BC 页面全局可能在 capture 阶段
        // preventDefault 滚动，因此直接拦截动作列表的 wheel 事件并手动滚动。
        var actionList = panel.querySelector('#xsact-action-list');
        if (actionList) {
            function onActionListWheel(e) {
                e.preventDefault();
                e.stopPropagation();
                actionList.scrollTop += e.deltaY;
            }
            actionList.addEventListener('wheel', onActionListWheel, { passive: false });
            // 触屏设备：阻止 document 层 touchmove 被 preventDefault，保留容器内自然滚动
            actionList.addEventListener('touchmove', function(e) { e.stopPropagation(); }, { passive: true });
        }

        // 全员执行按钮：切换全员范围开关
        var allBtn = panel.querySelector('#xsact-all-btn');
        if (allBtn) allBtn.addEventListener('click', toggleAllMode);

        // 自己模式按钮
        var selfBtn = panel.querySelector('#xsact-self-btn');
        if (selfBtn) selfBtn.addEventListener('click', toggleSelfMode);


        // ×3 连打
        var x3Btn = panel.querySelector('#xsact-x3-btn');
        if (x3Btn) x3Btn.addEventListener('click', function() {
            if (!state.selectedTarget || !state.selectedAction) return;
            var count = 0;
            var doIt = function() {
                if (count < 3 && state.isActive) {
                    executeAction(state.selectedTarget, state.selectedAction);
                    count++;
                    setTimeout(doIt, 300);
                }
            };
            doIt();
        });

        // 收藏按钮：切换收藏模式
        var favBtn = panel.querySelector('#xsact-fav-btn');
        if (favBtn) favBtn.addEventListener('click', toggleFavMode);

        // 清空收藏按钮
        var favClearBtn = panel.querySelector('#xsact-fav-clear-btn');
        if (favClearBtn) favClearBtn.addEventListener('click', clearAllFavorites);

        // 主题切换按钮（太阳/月亮）
        var themeBtn = panel.querySelector('#xsact-theme-btn');
        if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
    }

    /** 取当前主题强调色（用于 toast 等需要真实颜色值的场景） */
    function accentColor() {
        try { return getComputedStyle(document.documentElement).getPropertyValue('--xs-accent').trim() || '#FF5C7A'; }
        catch (e) { return '#FF5C7A'; }
    }

    /** 重复上次动作 */
    function repeatLastAction() {
        if (!state.lastAction) { toast('没有上次的动作记录', '#888'); return; }
        var target = (ChatRoomCharacter || []).find(function(c) {
            return c && c.MemberNumber === state.lastAction.targetMN;
        });
        if (!target) { toast('目标不在房间内', '#FF5C5C'); return; }
        state.selectedTarget = target;
        state.selectedPart = state.lastAction.part || '';
        state.selectedAction = state.lastAction.name;
        executeAction(target, state.lastAction.name);
        toast('重复：' + state.lastAction.name, '#FF5C7A');
    }

    // ════════════════════════════════════════════════════════════════════════
    // CSS 样式注入
    // ════════════════════════════════════════════════════════════════════════

    // 生成主题调色板 CSS（只保留 dark/light 两套）
    function buildThemeVarsCSS() {
        var DARK = {
            bg:'rgba(20,23,28,0.98)', bg2:'#1C2027', border:'rgba(255,255,255,0.08)',
            borderStrong:'rgba(255,255,255,0.18)', text:'#E7E9EE', textDim:'#9AA1AD',
            textFaint:'#5F6672', hover:'#232833', shadow:'0 14px 44px rgba(0,0,0,0.55)',
            scroll:'#3A3F49', blur:'blur(10px)', inputBg:'#10131A',
            btnBg:'rgba(255,255,255,0.05)', nameShadow:'rgba(255,92,122,0.45)'
        };
        var LIGHT = {
            bg:'rgba(248,245,251,0.97)', bg2:'#E9E6EF', border:'rgba(28,22,32,0.14)',
            borderStrong:'rgba(28,22,32,0.32)', text:'#1E2430', textDim:'#4A5568',
            textFaint:'#7B8494', hover:'#DCD9E2', shadow:'0 14px 40px rgba(60,40,80,0.16)',
            scroll:'#B8BCC6', blur:'blur(14px)', inputBg:'#FFFFFF',
            btnBg:'rgba(28,22,32,0.07)', nameShadow:'rgba(255,92,122,0.35)'
        };
        var ACCENT = '#FF5C7A', ACCENT_RGB = '255,92,122';
        var ZONES = {
            dark: {
                stroke:'rgba(255,255,255,0.35)', strokeHover:'#fff', strokeSelected:'var(--xs-accent)',
                fill:'rgba(' + ACCENT_RGB + ',0.08)', fillHover:'rgba(' + ACCENT_RGB + ',0.26)', fillSelected:'rgba(' + ACCENT_RGB + ',0.32)',
                filter:'drop-shadow(0 0 10px rgba(' + ACCENT_RGB + ',0.06))'
            },
            light: {
                stroke:'rgba(74,68,88,0.70)', strokeHover:'var(--xs-accent)', strokeSelected:'#B02A4E',
                fill:'rgba(' + ACCENT_RGB + ',0.10)', fillHover:'rgba(' + ACCENT_RGB + ',0.22)', fillSelected:'rgba(' + ACCENT_RGB + ',0.30)',
                filter:'drop-shadow(0 0 6px rgba(' + ACCENT_RGB + ',0.10))'
            }
        };
        // 默认回退（置于最前）：:root 与 [data-xsact-theme] 特异性相同(0,1,0)，
        // 必须让主题规则靠后、优先生效；属性缺失时才回退到这里。
        var blocks = [':root{' +
            '--xs-accent:' + ACCENT + ';--xs-accent-rgb:' + ACCENT_RGB + ';--xs-accent-soft:rgba(' + ACCENT_RGB + ',0.14);--xs-accent-text:#D6336C;' +
            '--xs-panel-bg:' + DARK.bg + ';--xs-panel-bg-2:' + DARK.bg2 + ';--xs-border:' + DARK.border + ';' +
            '--xs-border-strong:' + DARK.borderStrong + ';--xs-text:' + DARK.text + ';--xs-text-dim:' + DARK.textDim + ';--xs-text-faint:' + DARK.textFaint + ';' +
            '--xs-hover:' + DARK.hover + ';--xs-shadow:' + DARK.shadow + ';--xs-scroll:' + DARK.scroll + ';--xs-blur:' + DARK.blur + ';' +
            '--xs-input-bg:' + DARK.inputBg + ';--xs-btn-bg:' + DARK.btnBg + ';--xs-name-shadow:' + DARK.nameShadow + ';' +
            '--xs-zone-stroke:' + ZONES.dark.stroke + ';--xs-zone-stroke-hover:' + ZONES.dark.strokeHover + ';--xs-zone-stroke-selected:' + ZONES.dark.strokeSelected + ';' +
            '--xs-zone-fill:' + ZONES.dark.fill + ';--xs-zone-fill-hover:' + ZONES.dark.fillHover + ';--xs-zone-fill-selected:' + ZONES.dark.fillSelected + ';' +
            '--xs-zone-filter:' + ZONES.dark.filter + ';' +
        '}'];
        THEMES.forEach(function(t) {
            var p = (t.base === 'light') ? LIGHT : DARK;
            var z = (t.base === 'light') ? ZONES.light : ZONES.dark;
            var accentText = (t.base === 'light') ? '#B02A4E' : '#FFD6DF';
            blocks.push('[data-xsact-theme="' + t.id + '"]{' +
                '--xs-accent:' + ACCENT + ';' +
                '--xs-accent-rgb:' + ACCENT_RGB + ';' +
                '--xs-accent-soft:rgba(' + ACCENT_RGB + ',0.14);' +
                '--xs-accent-text:' + accentText + ';' +
                '--xs-panel-bg:' + p.bg + ';' +
                '--xs-panel-bg-2:' + p.bg2 + ';' +
                '--xs-border:' + p.border + ';' +
                '--xs-border-strong:' + p.borderStrong + ';' +
                '--xs-text:' + p.text + ';' +
                '--xs-text-dim:' + p.textDim + ';' +
                '--xs-text-faint:' + p.textFaint + ';' +
                '--xs-hover:' + p.hover + ';' +
                '--xs-shadow:' + p.shadow + ';' +
                '--xs-scroll:' + p.scroll + ';' +
                '--xs-blur:' + p.blur + ';' +
                '--xs-input-bg:' + p.inputBg + ';' +
                '--xs-btn-bg:' + p.btnBg + ';' +
                '--xs-name-shadow:' + p.nameShadow + ';' +
                '--xs-zone-stroke:' + z.stroke + ';' +
                '--xs-zone-stroke-hover:' + z.strokeHover + ';' +
                '--xs-zone-stroke-selected:' + z.strokeSelected + ';' +
                '--xs-zone-fill:' + z.fill + ';' +
                '--xs-zone-fill-hover:' + z.fillHover + ';' +
                '--xs-zone-fill-selected:' + z.fillSelected + ';' +
                '--xs-zone-filter:' + z.filter + ';' +
            '}');
        });
        return blocks.join('\n');
    }



    function injectStyles() {
        // 清理任何残留的旧样式表：历史上多次热注入可能留下了无 id 的 <style>，
        // 把 #xsact-qa-panel 的 background 写死成字面量，盖过本脚本的主题变量，
        // 导致主题切换“看似没反应”。凡含本面板选择器且非本脚本样式表的一律移除。
        try {
            Array.prototype.forEach.call(document.querySelectorAll('style'), function(s) {
                if (s.id !== 'xsact-qa-styles' && s.textContent && s.textContent.indexOf('#xsact-qa-panel') !== -1) {
                    s.parentNode && s.parentNode.removeChild(s);
                }
            });
        } catch (_) { /* 忽略：清理旧样式表失败无影响 */ }
        // 已存在则覆盖内容：避免旧版本残留的样式表（只有 dark-rose 等旧主题名）
        // 导致新版 data-xsact-theme="dark/light" 匹配不到规则、主题切换失效。
        var css = document.getElementById('xsact-qa-styles');
        if (!css) {
            css = document.createElement('style');
            css.id = 'xsact-qa-styles';
            document.head.appendChild(css);
        }
        css.textContent = [
            buildThemeVarsCSS(),
            /* 统一图标基样式 */
            '.xsact-ico{display:block;flex-shrink:0;}',

            /* ===== DOM 切换按钮（固定右下角，永远可见） ===== */
            '#xsact-toggle-btn{',
            '  position:fixed;bottom:72px;right:16px;z-index:100000;',
            '  width:44px;height:44px;border-radius:13px;',
            '  background:rgba(var(--xs-accent-rgb), 0.85);border:2px solid rgba(var(--xs-accent-rgb), 0.5);',
            '  color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;',
            '  backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);',
            '  box-shadow:0 4px 16px var(--xs-shadow),0 0 8px rgba(var(--xs-accent-rgb), 0.2);',
            '  transition:all 0.2s ease;outline:none;',
            '}',
            '#xsact-toggle-btn:hover{',
            '  background:rgba(var(--xs-accent-rgb), 1);border-color:var(--xs-accent);',
            '  box-shadow:0 6px 24px var(--xs-shadow),0 0 16px rgba(var(--xs-accent-rgb), 0.4);',
            '  transform:scale(1.08);',
            '}',
            '#xsact-toggle-btn.active{',
            '  background:rgba(70,224,160,0.9);border-color:#46E0A0;',
            '  box-shadow:0 4px 16px rgba(70,224,160,0.3),0 0 12px rgba(70,224,160,0.4);',
            '}',
            '#xsact-toggle-btn.active:hover{',
            '  background:#46E0A0;transform:scale(1.08);',
            '}',

            /* ===== 右侧面板（暗色战术操作台） ===== */
            '#xsact-qa-panel{',
            '  position:fixed;top:min(48px,4vh);right:12px;width:min(380px,92vw);height:min(680px,88vh);z-index:90000;',
            '  background:var(--xs-panel-bg);border-radius:14px;',
            '  border:1px solid var(--xs-border);',
            '  display:flex;flex-direction:column;box-sizing:border-box;',
            '  backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);',
            '  box-shadow:0 14px 44px var(--xs-shadow);',
            '  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"PingFang SC","Microsoft YaHei",sans-serif;',
            '  min-width:220px;min-height:300px;max-width:min(560px,96vw);max-height:min(88vh,820px);',
            '  transition:border-color .2s ease,box-shadow .2s ease;',
            '}',
            '#xsact-qa-panel.popover-open{',
            '  border-left-color:var(--xs-accent);',
            '  box-shadow:0 0 24px rgba(var(--xs-accent-rgb), 0.15),0 14px 44px var(--xs-shadow);',
            '}',
            '.xsact-qa-panel-inner{',
            '  display:flex;flex-direction:column;height:100%;min-width:0;min-height:0;box-sizing:border-box;container-type:inline-size;container-name:xsact-panel;',
            '  overflow:hidden;border-radius:14px;',
            '}',

            /* 标题栏 = 拖拽手柄 */
            '.xsact-qa-panel-header{',
            '  display:flex;justify-content:space-between;align-items:center;gap:8px;',
            '  padding:11px 12px 9px;border-bottom:1px solid var(--xs-border);',
            '  cursor:grab;user-select:none;-webkit-user-select:none;',
            '}',
            '.xsact-qa-panel-header.dragging{cursor:grabbing;}',
            '.xsact-panel-grip{color:var(--xs-text-faint);display:flex;transition:color .15s;}',
            '.xsact-qa-panel-header.dragging .xsact-panel-grip{color:var(--xs-accent);}',
            '#xsact-panel-title{',
            '  flex:1;min-width:0;font-size:13px;font-weight:600;color:var(--xs-text);',
            '  letter-spacing:0.3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;',
            '}',
            '.xsact-panel-head-actions{display:flex;gap:5px;flex-shrink:0;}',

            /* 模式切换标签 */
            '.xsact-qa-mode-tabs{',
            '  display:flex;gap:6px;padding:9px 12px 5px;',
            '}',
            '.xsact-mode-tab{',
            '  flex:1;padding:8px 8px;font-size:12px;cursor:pointer;',
            '  background:var(--xs-btn-bg);border:1px solid var(--xs-border);min-width:32px;min-height:32px;box-sizing:border-box;',
            '  border-radius:8px;color:var(--xs-text-dim);transition:all 0.15s ease;',
            '  display:flex;align-items:center;justify-content:center;gap:6px;',
            '}',
            '.xsact-mode-tab .xsact-ico{width:14px;height:14px;stroke-width:2.2px;}',
            '.xsact-mode-tab:hover{color:var(--xs-text);border-color:var(--xs-border-strong);}',
            '.xsact-mode-tab.active{',
            '  background:rgba(var(--xs-accent-rgb), 0.14);border-color:var(--xs-accent);color:var(--xs-accent-text);font-weight:600;',
            '}',

            /* 类型计数徽标 */
            '.xsact-type-count{',
            '  margin-left:auto;min-width:20px;text-align:center;',
            '  font-size:11px;font-weight:700;color:var(--xs-accent-text);',
            '  background:rgba(var(--xs-accent-rgb), 0.16);border-radius:9px;padding:1px 7px;',
            '}',

            '.xsact-qa-panel-body{',
            '  flex:1;overflow-y:auto;overflow-x:hidden;padding:10px 12px;overscroll-behavior:contain;',
            '  scrollbar-width:thin;scrollbar-color:var(--xs-scroll) transparent;',
            '  display:grid;grid-template-columns:repeat(auto-fill, minmax(108px, 1fr));gap:6px;min-width:0;container-type:inline-size;container-name:xsact-body;',
            '  align-content:start;min-height:0;',
            '}',
            '.xsact-qa-empty{',
            '  color:var(--xs-text-faint);text-align:center;padding:42px 14px;font-size:12px;line-height:1.6;grid-column:1 / -1;',
            '}',

            /* 动作按钮 */
            '.xsact-action-btn{',
            '  position:relative;overflow:hidden;',
            '  display:flex;align-items:center;gap:8px;',
            '  width:100%;padding:10px 11px;',
            '  background:var(--xs-panel-bg-2);border:1px solid var(--xs-border);',
            '  border-left:2px solid transparent;',
            '  border-radius:8px;color:var(--xs-text-dim);font-size:12.5px;cursor:pointer;',
            '  transition:background .15s ease,border-color .15s ease,color .15s ease,box-shadow .15s ease;text-align:left;',
            '}',
            '.xsact-action-btn:hover{',
            '  background:var(--xs-hover);border-color:var(--xs-border-strong);color:var(--xs-text);',
            '}',
            '.xsact-action-btn.sel{',
            '  background:rgba(var(--xs-accent-rgb), 0.12);border-color:var(--xs-accent);border-left-color:var(--xs-accent);color:var(--xs-accent-text);',
            '}',
            '.xsact-action-btn.fav{',
            '  background:rgba(232,179,57,0.12);border-color:rgba(232,179,57,0.55);border-left-color:#E8B339;color:#FCEBC0;',
            '  box-shadow:0 0 0 1px rgba(232,179,57,0.08) inset,0 0 12px rgba(232,179,57,0.15);',
            '}',
            '.xsact-action-btn.fav:hover{',
            '  background:rgba(232,179,57,0.20);border-color:rgba(232,179,57,0.75);color:#fff;',
            '}',
            '.xsact-action-label{flex:1;position:relative;z-index:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
            '.xsact-action-star{color:#E8B339;display:flex;position:relative;z-index:1;filter:drop-shadow(0 0 4px rgba(232,179,57,0.7));}',

            /* 动作行 + 加入组合按钮 */
            '.xsact-action-row{',
            '  display:flex;align-items:center;gap:6px;min-width:0;',
            '}',
            '.xsact-action-row .xsact-action-btn{flex:1;margin-bottom:0;width:auto;min-width:0;height:100%;}',
            '.xsact-add-to-combo{',
            '  width:30px;height:30px;flex-shrink:0;',
            '  background:rgba(70,224,160,0.12);border:1px solid rgba(70,224,160,0.4);',
            '  border-radius:8px;color:#46E0A0;cursor:pointer;',
            '  display:flex;align-items:center;justify-content:center;transition:all 0.15s ease;',
            '}',
            '.xsact-add-to-combo:hover{background:rgba(70,224,160,0.24);border-color:#46E0A0;color:#CFFAE8;}',

            /* 自定义组合卡片 */
            '.xsact-combo-card{',
            '  grid-column:1 / -1;',
            '  display:flex;justify-content:space-between;align-items:center;',
            '  padding:11px 12px;margin-bottom:7px;',
            '  background:var(--xs-panel-bg-2);border:1px solid var(--xs-border);',
            '  border-radius:9px;color:var(--xs-text-dim);',
            '}',
            '.xsact-combo-info{display:flex;flex-direction:column;gap:2px;min-width:0;}',
            '.xsact-combo-name{font-size:13px;font-weight:600;color:var(--xs-text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
            '.xsact-combo-count{font-size:11px;color:var(--xs-text-faint);}',
            '.xsact-combo-btns{display:flex;gap:6px;}',
            '.xsact-combo-btns button{',
            '  width:30px;height:30px;border-radius:7px;cursor:pointer;',
            '  background:var(--xs-btn-bg);border:1px solid var(--xs-border-strong);',
            '  color:var(--xs-text-dim);display:flex;align-items:center;justify-content:center;transition:all 0.15s ease;',
            '}',
            '.xsact-combo-run:hover{background:rgba(var(--xs-accent-rgb), 0.18);border-color:var(--xs-accent);color:var(--xs-accent-text);}',
            '.xsact-combo-edit:hover{background:rgba(70,224,160,0.16);border-color:#46E0A0;color:#CFFAE8;}',
            '.xsact-combo-delete:hover{background:rgba(255,92,92,0.16);border-color:#FF5C5C;color:#FFB3B3;}',

            '.xsact-combo-new-btn{',
            '  grid-column:1 / -1;',
            '  width:100%;padding:10px;margin-top:7px;',
            '  background:rgba(var(--xs-accent-rgb), 0.08);border:1px dashed rgba(var(--xs-accent-rgb), 0.4);',
            '  border-radius:8px;color:var(--xs-accent-text);font-size:12.5px;cursor:pointer;',
            '  display:flex;align-items:center;justify-content:center;gap:6px;transition:all 0.15s ease;',
            '}',
            '.xsact-combo-new-btn:hover{background:rgba(var(--xs-accent-rgb), 0.16);color:#fff;}',

            /* 预设栏 */
            '.xsact-combo-editor{grid-column:1 / -1;display:flex;flex-direction:column;gap:11px;}',
            '.xsact-combo-field input{',
            '  width:100%;padding:8px 10px;box-sizing:border-box;',
            '  background:var(--xs-input-bg);border:1px solid var(--xs-border-strong);',
            '  border-radius:7px;color:var(--xs-text);font-size:13px;',
            '}',
            '.xsact-combo-field input:focus{outline:none;border-color:var(--xs-accent);}',
            '.xsact-combo-delay label{display:block;font-size:12px;color:var(--xs-text-dim);margin-bottom:6px;}',
            '.xsact-combo-delay #xsact-delay-val{color:var(--xs-accent);font-weight:700;}',
            '.xsact-combo-delay input[type=range]{width:100%;accent-color:var(--xs-accent);height:4px;cursor:pointer;}',
            '.xsact-combo-items{',
            '  display:flex;flex-direction:column;gap:6px;max-height:230px;overflow-y:auto;',
            '  scrollbar-width:thin;scrollbar-color:var(--xs-scroll) transparent;',
            '}',
            '.xsact-combo-item{',
            '  display:flex;align-items:center;gap:7px;padding:8px;',
            '  background:var(--xs-panel-bg-2);border:1px solid var(--xs-border);',
            '  border-radius:7px;font-size:12px;color:var(--xs-text-dim);',
            '}',
            '.xsact-combo-item-num{',
            '  min-width:18px;text-align:center;font-size:10px;font-weight:700;',
            '  color:var(--xs-accent-text);background:rgba(var(--xs-accent-rgb), 0.16);border-radius:5px;padding:1px 0;',
            '}',
            '.xsact-combo-item-part{',
            '  min-width:42px;color:var(--xs-text-faint);font-weight:500;',
            '}',
            '.xsact-combo-item-action{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
            '.xsact-combo-item button{',
            '  width:24px;height:24px;padding:0;border-radius:6px;cursor:pointer;',
            '  background:var(--xs-btn-bg);border:1px solid var(--xs-border-strong);',
            '  color:var(--xs-text-dim);display:flex;align-items:center;justify-content:center;transition:all 0.15s ease;',
            '}',
            '.xsact-combo-item-up:hover,.xsact-combo-item-down:hover{border-color:var(--xs-accent);color:var(--xs-accent-text);}',
            '.xsact-combo-item-del:hover{border-color:#FF5C5C;color:#FFB3B3;}',
            '.xsact-combo-actions{display:flex;gap:8px;}',
            '.xsact-combo-actions button{flex:1;padding:9px;border-radius:7px;cursor:pointer;font-size:13px;border:none;color:var(--xs-text);}',
            '.xsact-combo-save-btn{background:#46E0A0;color:#fff;}',
            '.xsact-combo-save-btn:hover{background:#2FC989;}',
            '.xsact-combo-cancel-btn{background:var(--xs-border);color:var(--xs-text);}',
            '.xsact-combo-cancel-btn:hover{background:var(--xs-border-strong);}',

            /* ===== 自定义动作（我的动作 tab） ===== */
            '#xsact-action-list.xsact-custom-mode{display:flex;flex-direction:column;gap:12px;padding:10px 12px;}',
            '#xsact-action-list.xsact-custom-mode > *{width:100%;min-width:0;}',
            '.xsact-ca-view{display:flex;flex-direction:column;gap:12px;width:100%;min-width:0;padding:2px 0;}',

            '.xsact-ca-toolbar{display:flex;align-items:center;gap:8px;width:100%;min-width:0;}',
            '.xsact-ca-search{flex:1;min-width:0;padding:9px 12px;border-radius:8px;border:1px solid var(--xs-border);background:var(--xs-input-bg);color:var(--xs-text);font-size:13px;transition:opacity .15s;}',
            '.xsact-ca-search:focus{outline:none;border-color:var(--xs-accent);}',
            '.xsact-ca-search.is-hidden{visibility:hidden;pointer-events:none;opacity:0;}',
            '.xsact-ca-toolbar-btns{display:flex;gap:6px;flex-shrink:0;}',
            '.xsact-ca-toolbar-btns button{display:flex;align-items:center;justify-content:center;gap:5px;width:34px;height:34px;padding:0;border-radius:8px;border:1px solid var(--xs-border);background:var(--xs-btn-bg);color:var(--xs-text-dim);cursor:pointer;font-size:12px;transition:background .15s,border-color .15s,color .15s;}',
            '.xsact-ca-toolbar-btns button:hover{background:var(--xs-hover);border-color:var(--xs-border-strong);color:var(--xs-text);}',
            '.xsact-ca-toolbar-btns button.xsact-ca-new{width:auto;padding:0 12px;background:rgba(255,92,122,0.14);border-color:rgba(255,92,122,0.45);color:#FF8FA6;}',
            '.xsact-ca-toolbar-btns button.xsact-ca-new:hover{background:rgba(255,92,122,0.24);color:#FFB3C6;}',

            '.xsact-ca-import-wrap{position:relative;display:flex;align-items:center;}',
            '.xsact-ca-import-menu{position:absolute;top:calc(100% + 6px);right:0;z-index:100;display:flex;flex-direction:column;gap:4px;min-width:150px;padding:6px;border-radius:8px;background:var(--xs-panel-bg);border:1px solid var(--xs-border);box-shadow:0 8px 24px rgba(0,0,0,0.35);}',
            '.xsact-ca-import-menu.hidden{display:none;}',
            '.xsact-ca-import-menu button{width:100%;justify-content:flex-start;padding:8px 10px;border-radius:6px;border:1px solid transparent;background:transparent;color:var(--xs-text);font-size:12px;text-align:left;cursor:pointer;transition:background .15s,border-color .15s;}',
            '.xsact-ca-import-menu button:hover{background:var(--xs-hover);border-color:var(--xs-border);}',
            '.xsact-ca-file-input{position:absolute;opacity:0;width:0;height:0;pointer-events:none;}',

            /* ── 分类 chip 过滤栏：按来源（all/xiaosu/native/echo）单选 ── */
            '.xsact-ca-chips{display:flex;flex-wrap:wrap;gap:6px;width:100%;min-width:0;padding:2px 0 4px;}',
            '.xsact-ca-chip{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:999px;border:1px solid var(--xs-border);background:var(--xs-btn-bg);color:var(--xs-text-dim);font-size:12px;font-weight:600;cursor:pointer;transition:background .15s,border-color .15s,color .15s,box-shadow .15s;}',
            '.xsact-ca-chip:hover:not(.is-disabled):not(.is-active){background:var(--xs-hover);border-color:var(--xs-border-strong);color:var(--xs-text);}',
            '.xsact-ca-chip-count{display:inline-flex;align-items:center;justify-content:center;min-width:18px;height:18px;padding:0 6px;border-radius:9px;background:rgba(255,255,255,0.08);color:var(--xs-text-dim);font-size:10px;font-weight:700;line-height:1;}',
            '.xsact-ca-chip.is-active.xiaosu{background:rgba(255,92,122,0.20);border-color:rgba(255,92,122,0.55);color:#FFB3C6;box-shadow:0 0 0 1px rgba(255,92,122,0.25);}',
            '.xsact-ca-chip.is-active.xiaosu .xsact-ca-chip-count{background:rgba(255,92,122,0.30);color:#FFD6DF;}',
            '.xsact-ca-chip.is-active.native{background:rgba(160,140,255,0.20);border-color:rgba(160,140,255,0.55);color:#C4B8FF;box-shadow:0 0 0 1px rgba(160,140,255,0.25);}',
            '.xsact-ca-chip.is-active.native .xsact-ca-chip-count{background:rgba(160,140,255,0.30);color:#DCD4FF;}',
            '.xsact-ca-chip.is-active.echo{background:rgba(255,200,90,0.20);border-color:rgba(255,200,90,0.55);color:#FFD87A;box-shadow:0 0 0 1px rgba(255,200,90,0.25);}',
            '.xsact-ca-chip.is-active.echo .xsact-ca-chip-count{background:rgba(255,200,90,0.30);color:#FFE9B0;}',
            '.xsact-ca-chip.is-active.all{background:var(--xs-panel-bg-2);border-color:var(--xs-border-strong);color:var(--xs-text);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.05);}',
            '.xsact-ca-chip.is-active.all .xsact-ca-chip-count{background:rgba(255,255,255,0.16);color:var(--xs-text);}',
            '.xsact-ca-chip.is-disabled{opacity:.42;cursor:not-allowed;}',
            '.xsact-ca-filter-empty{padding:24px 12px;text-align:center;}',

            '.xsact-ca-beta{font-size:11px;line-height:1.55;color:var(--xs-accent-text);background:rgba(var(--xs-accent-rgb),0.10);border:1px solid rgba(var(--xs-accent-rgb),0.30);border-left:3px solid var(--xs-accent);border-radius:8px;padding:10px 12px;}',

            '.xsact-ca-echo-clean{display:flex;align-items:center;gap:12px;flex-wrap:wrap;font-size:11px;line-height:1.5;color:var(--xs-text);background:rgba(255,92,122,0.08);border:1px solid rgba(255,92,122,0.32);border-left:3px solid #FF5C7A;border-radius:8px;padding:10px 12px;margin-top:2px;}',
            '.xsact-ca-echo-clean-text{flex:1;min-width:160px;color:var(--xs-text-dim);}',
            '.xsact-ca-echo-clean-text b{color:#FF8FA6;font-weight:700;}',
            '.xsact-ca-echo-clean-btn{flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;padding:7px 14px;border-radius:8px;border:1px solid rgba(255,92,122,0.5);background:rgba(255,92,122,0.16);color:#FFB3C6;font-size:12px;font-weight:600;cursor:pointer;transition:background .15s,border-color .15s,color .15s;}',
            '.xsact-ca-echo-clean-btn:hover{background:rgba(255,92,122,0.28);border-color:#FF5C7A;color:#FFFFFF;}',

            '.xsact-ca-list{display:flex;flex-direction:column;gap:10px;width:100%;}',
            '.xsact-ca-card{display:grid;grid-template-columns:1fr auto;align-items:center;gap:10px;padding:12px 14px;border-radius:10px;background:var(--xs-card-bg);border:1px solid var(--xs-border);transition:border-color .15s,background .15s,transform .1s;min-width:0;}',
            '.xsact-ca-card:hover{border-color:var(--xs-border-strong);background:var(--xs-hover);transform:translateY(-1px);}',
            '.xsact-ca-info{display:flex;flex-direction:column;gap:5px;min-width:0;overflow:hidden;}',
            '.xsact-ca-title{display:flex;align-items:center;gap:8px;min-width:0;}',
            '.xsact-ca-name{font-size:14px;font-weight:600;color:var(--xs-text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
            '.xsact-ca-meta{display:flex;align-items:center;gap:8px;min-width:0;}',
            '.xsact-ca-part{font-size:11px;color:var(--xs-text-dim);opacity:.85;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
            '.xsact-ca-badge{flex-shrink:0;font-size:10px;padding:3px 8px;border-radius:20px;font-weight:600;letter-spacing:0.02em;}',
            '.xsact-ca-badge.other{background:rgba(90,160,255,0.16);color:#8FB8FF;}',
            '.xsact-ca-badge.self{background:rgba(70,224,160,0.16);color:#5FE3B0;}',
            '.xsact-ca-badge.any{background:rgba(255,92,122,0.16);color:#FF8FA6;}',
            '.xsact-ca-src{flex-shrink:0;font-size:10px;padding:2px 7px;border-radius:20px;font-weight:600;letter-spacing:0.02em;}',
            '.xsact-ca-src.echo{background:rgba(255,200,90,0.16);color:#FFD87A;}',
            '.xsact-ca-src.native{background:rgba(160,140,255,0.16);color:#C4B8FF;}',
            '.xsact-ca-src.xiaosu{background:rgba(255,92,122,0.18);color:#FF8FA6;border:1px solid rgba(255,92,122,0.35);}',
            '.xsact-ca-card.is-hidden{opacity:.55;border-style:dashed;}',
            '.xsact-ca-editmode.is-active{background:rgba(255,92,122,0.22);border-color:rgba(255,92,122,0.55);color:#FFB3C6;}',
            '.xsact-ca-toggleall:hover{background:rgba(255,92,122,0.18);border-color:rgba(255,92,122,0.45);color:#FFB3C6;}',
            '.xsact-ca-toggleall.is-on{background:rgba(255,92,122,0.22);border-color:rgba(255,92,122,0.55);color:#FFB3C6;}',
            '.xsact-ca-toggleall.is-on:hover{background:rgba(255,92,122,0.32);color:#FFD6DF;}',
            '.xsact-ca-card.is-edit{grid-template-columns:auto 1fr auto;cursor:pointer;user-select:none;}',
            '.xsact-ca-card.is-edit:hover{transform:none;background:var(--xs-hover);}',
            '.xsact-ca-handle{display:flex;align-items:center;justify-content:center;width:20px;color:var(--xs-text-dim);cursor:grab;flex-shrink:0;}',
            '.xsact-ca-handle:active{cursor:grabbing;}',
            '.xsact-ca-card.is-selected{border-color:var(--xs-accent);background:rgba(var(--xs-accent-rgb),0.12);box-shadow:0 0 0 1px var(--xs-accent) inset;}',
            '.xsact-ca-check{display:none;align-items:center;justify-content:center;width:22px;height:22px;border-radius:50%;background:var(--xs-accent);color:#fff;flex-shrink:0;}',
            '.xsact-ca-card.is-selected .xsact-ca-check{display:flex;}',
            '.xsact-ca-card.dragging{opacity:.45;outline:2px dashed var(--xs-accent);outline-offset:-2px;}',
            '.xsact-ca-vis-dot{font-size:11px;padding:1px 8px;border-radius:999px;background:var(--xs-border-strong);color:var(--xs-text-dim);white-space:nowrap;}',
            '.xsact-ca-vis-dot.on{background:rgba(70,224,160,0.18);color:#46E0A0;}',
            '.xsact-ca-vis-dot.off{background:rgba(255,92,92,0.16);color:#FF9C9C;}',
            '.xsact-ca-select-all{padding:6px 12px;border-radius:6px;border:1px solid var(--xs-border);background:var(--xs-btn-bg);color:var(--xs-text);font-size:12px;cursor:pointer;transition:background .15s,border-color .15s;white-space:nowrap;}',
            '.xsact-ca-select-all:hover{background:var(--xs-hover);border-color:var(--xs-border-strong);}',
            '.xsact-ca-batchbar{display:flex;align-items:center;gap:10px;width:100%;min-width:0;padding:9px 12px;border-radius:8px;background:var(--xs-panel-bg-2);border:1px solid var(--xs-border);}',
            '.xsact-ca-selected-count{font-size:12px;color:var(--xs-text-dim);white-space:nowrap;margin-right:auto;}',
            '.xsact-ca-batch-actions{display:flex;gap:6px;flex-shrink:0;}',
            '.xsact-ca-batch-actions button{padding:6px 12px;border-radius:6px;border:1px solid var(--xs-border);background:var(--xs-btn-bg);color:var(--xs-text);font-size:12px;cursor:pointer;transition:background .15s,border-color .15s,color .15s;}',
            '.xsact-ca-batch-actions button:hover:not(:disabled){background:var(--xs-hover);border-color:var(--xs-border-strong);}',
            '.xsact-ca-batch-actions button:disabled{opacity:.45;cursor:not-allowed;}',
            '.xsact-ca-batch-del{background:rgba(255,92,92,0.12);border-color:rgba(255,92,92,0.35);color:#FF9C9C;}',
            '.xsact-ca-batch-del:hover:not(:disabled){background:rgba(255,92,92,0.22);border-color:rgba(255,92,92,0.5);}',
            '.xsact-ca-toggle{display:flex;align-items:center;gap:7px;cursor:pointer;font-size:11px;color:var(--xs-text-dim);}',
            '.xsact-ca-toggle input{position:absolute;opacity:0;width:0;height:0;}',
            '.xsact-ca-toggle-track{width:34px;height:18px;border-radius:999px;background:var(--xs-border-strong);position:relative;transition:background .2s;}',
            '.xsact-ca-toggle-track::before{content:"";position:absolute;left:2px;top:2px;width:14px;height:14px;border-radius:50%;background:#fff;transition:transform .2s;}',
            '.xsact-ca-toggle input:checked + .xsact-ca-toggle-track{background:var(--xs-accent);}',
            '.xsact-ca-toggle input:checked + .xsact-ca-toggle-track::before{transform:translateX(16px);}',
            '.xsact-ca-toggle input:focus + .xsact-ca-toggle-track{box-shadow:0 0 0 2px rgba(var(--xs-accent-rgb),0.35);}',
            '.xsact-beta-badge{font-size:9px;font-weight:700;line-height:1;padding:2px 5px;border-radius:6px;margin-left:5px;color:#FFD27A;background:rgba(255,180,60,0.16);border:1px solid rgba(255,180,60,0.4);vertical-align:middle;white-space:nowrap;}',
            '.xsact-ca-btns{display:flex;gap:6px;flex-shrink:0;}',
            '.xsact-ca-btns button{width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:8px;border:1px solid var(--xs-border);background:var(--xs-btn-bg);color:var(--xs-text-dim);cursor:pointer;transition:background .15s,color .15s,border-color .15s;}',
            '.xsact-ca-btns button:hover{background:var(--xs-hover);color:var(--xs-text);border-color:var(--xs-border-strong);}',
            '.xsact-ca-run:hover{background:rgba(70,224,160,0.16);color:#5FE3B0;border-color:rgba(70,224,160,0.5);}',
            '.xsact-ca-delete:hover{background:rgba(255,92,92,0.16);color:#FF9C9C;border-color:rgba(255,92,92,0.5);}',
            '.xsact-ca-empty{padding:36px 14px;}',

            '.xsact-ca-editor{display:flex;flex-direction:column;gap:14px;width:100%;min-width:0;}',
            '.xsact-ca-editor .xsact-combo-field{display:flex;flex-direction:column;gap:7px;padding:13px 14px;background:var(--xs-panel-bg-2);border:1px solid var(--xs-border);border-radius:10px;}',
            '.xsact-ca-editor .xsact-combo-field label{font-size:11px;font-weight:600;color:var(--xs-accent-text);letter-spacing:0.04em;text-transform:uppercase;}',
            '.xsact-ca-editor .xsact-combo-field input,.xsact-ca-editor .xsact-combo-field textarea,.xsact-ca-editor .xsact-combo-field select,.xsact-ca-editor .xsact-combo-field .xsact-ca-dialog-rich{width:100%;padding:10px 12px;border-radius:8px;border:1px solid var(--xs-border-strong);background:var(--xs-input-bg);color:var(--xs-text);font-size:13px;box-sizing:border-box;font-family:inherit;}',
            '.xsact-ca-editor .xsact-combo-field input:focus,.xsact-ca-editor .xsact-combo-field textarea:focus,.xsact-ca-editor .xsact-combo-field select:focus,.xsact-ca-editor .xsact-combo-field .xsact-ca-dialog-rich:focus{outline:none;border-color:var(--xs-accent);}',
            '.xsact-ca-editor textarea{resize:vertical;min-height:54px;line-height:1.5;}',
            '.xsact-ca-scope{display:flex;gap:8px;}',
            '.xsact-ca-scope button{flex:1;padding:9px 10px;border-radius:8px;border:1px solid var(--xs-border);background:var(--xs-btn-bg);color:var(--xs-text-dim);cursor:pointer;font-size:12px;font-weight:500;transition:all .15s;}',
            '.xsact-ca-scope button:hover{background:var(--xs-hover);border-color:var(--xs-border-strong);color:var(--xs-text);}',
            '.xsact-ca-scope button.active{background:rgba(255,92,122,0.18);border-color:rgba(255,92,122,0.55);color:#FFB3C6;font-weight:600;}',
            '.xsact-ca-hint{display:flex;align-items:baseline;justify-content:flex-start;gap:8px;flex-wrap:wrap;padding:10px 14px;border-radius:10px;border:1px solid var(--xs-border-strong);background:var(--xs-panel-bg-2);box-shadow:0 1px 4px rgba(0,0,0,0.08);}',
            '.xsact-ca-hint-title{font-size:12px;font-weight:600;color:var(--xs-accent-text);letter-spacing:0.04em;text-transform:uppercase;white-space:nowrap;line-height:1;}',
            '.xsact-ca-hint-btns{display:flex;gap:8px;flex-wrap:wrap;}',
            '.xsact-ca-token{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:999px;border:1px solid var(--xs-border);background:var(--xs-input-bg);color:var(--xs-text);font-size:12px;font-weight:500;cursor:pointer;transition:all .15s ease;white-space:nowrap;user-select:none;-webkit-user-select:none;box-shadow:0 1px 2px rgba(0,0,0,0.08);}',
            '.xsact-ca-token:hover{background:rgba(255,92,122,0.12);border-color:rgba(255,92,122,0.5);color:#FFD6DF;box-shadow:0 2px 8px rgba(255,92,122,0.18);transform:translateY(-1px);}',
            '.xsact-ca-token:active{transform:translateY(0) scale(0.97);box-shadow:0 1px 3px rgba(255,92,122,0.12);}',
            '.xsact-ca-token-dot{width:7px;height:7px;border-radius:50%;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.12);}',
            '.xsact-ca-token-dot.self{background:#46E0A0;}',
            '.xsact-ca-token-dot.other{background:#FF5C7A;}',
            '.xsact-ca-part-display{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 12px;border-radius:8px;border:1px solid var(--xs-border-strong);background:var(--xs-input-bg);cursor:pointer;transition:background .15s,border-color .15s;}',
            '.xsact-ca-part-display:hover{background:var(--xs-hover);border-color:var(--xs-accent);}',
            '.xsact-ca-part-label{font-size:13px;color:var(--xs-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
            '.xsact-ca-part-change{font-size:11px;color:var(--xs-text-dim);white-space:nowrap;flex-shrink:0;}',
            '.xsact-ca-part-map{height:min(240px,42vh);min-height:160px;max-height:300px;border-radius:10px;border:1px solid var(--xs-border);background:var(--xs-panel-bg-2);padding:10px;display:flex;flex-direction:column;align-items:stretch;gap:6px;overflow:hidden;box-sizing:border-box;}',
            '.xsact-body-mini-svg{flex:1;min-height:0;width:100%;height:100%;overflow:visible;filter:var(--xs-zone-filter);}',
            '.xsact-body-mini-hint{font-size:11px;color:var(--xs-text-dim);text-align:center;padding:5px 8px;border-radius:6px;background:var(--xs-panel-bg);border:1px solid var(--xs-border);white-space:nowrap;flex-shrink:0;}',
            '.xsact-ca-part-map .xsact-body-part-zone{fill:var(--xs-zone-fill);stroke:var(--xs-zone-stroke);stroke-width:1.2;cursor:pointer;transition:fill .12s,stroke .12s,stroke-width .12s,filter .12s;pointer-events:all;vector-effect:non-scaling-stroke;}',
            '.xsact-ca-part-map .xsact-body-part-zone:hover,.xsact-ca-part-map .xsact-body-part-zone.hover{fill:var(--xs-zone-fill-hover);stroke:var(--xs-zone-stroke-hover);stroke-width:2.5;filter:drop-shadow(0 0 8px rgba(var(--xs-accent-rgb), 0.6));}',
            '.xsact-ca-part-map .xsact-body-part-zone.selected{fill:var(--xs-zone-fill-selected);stroke:var(--xs-zone-stroke-selected);stroke-width:2.5;filter:drop-shadow(0 0 10px rgba(var(--xs-accent-rgb), 0.55));}',
            '.xsact-ca-preview{padding:12px 14px;border-radius:9px;background:rgba(255,92,122,0.08);border:1px dashed rgba(255,92,122,0.35);color:var(--xs-text);font-size:13px;line-height:1.55;white-space:pre-line;}',
            '.xsact-ca-preview::before{content:"效果预览";display:block;font-size:10px;font-weight:600;color:var(--xs-accent-text);letter-spacing:0.04em;text-transform:uppercase;margin-bottom:6px;}',
            '.xsact-ca-editor .xsact-combo-actions{display:flex;gap:8px;margin-top:4px;}',
            '.xsact-ca-editor .xsact-combo-actions button{flex:1;padding:10px 14px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;border:none;color:var(--xs-text);transition:background .15s,transform .1s;}',
            '.xsact-ca-editor .xsact-combo-actions button:hover{transform:translateY(-1px);}',
            '.xsact-ca-editor .xsact-combo-save-btn{background:#46E0A0;color:#0B1F18;}',
            '.xsact-ca-editor .xsact-combo-save-btn:hover{background:#2FC989;}',
            '.xsact-ca-editor .xsact-combo-cancel-btn{background:var(--xs-border);color:var(--xs-text);}',
            '.xsact-ca-editor .xsact-combo-cancel-btn:hover{background:var(--xs-border-strong);}',
            '.xsact-ca-del-btn{background:rgba(255,92,92,0.14);color:#FF9C9C;}',
            '.xsact-ca-del-btn:hover{background:rgba(255,92,92,0.24);transform:translateY(-1px);}',

            '.xsact-ca-raw{display:none;}',
            '.xsact-ca-editor .xsact-ca-dialog-rich{min-height:54px;max-height:160px;line-height:1.5;white-space:pre-wrap;word-break:break-word;overflow:auto;outline:none;}',
            '.xsact-ca-editor .xsact-ca-dialog-rich:empty:before{content:attr(data-placeholder);color:var(--xs-text-dim);pointer-events:none;}',
            '.xsact-token-pill{display:inline-flex;align-items:center;background:rgba(255,92,122,0.18);border:1px solid rgba(255,92,122,0.45);color:#FFD6DF;border-radius:5px;padding:1px 5px;font-size:12px;line-height:1;cursor:default;user-select:none;-webkit-user-select:none;vertical-align:baseline;margin:0 2px;}',
            '.xsact-zwsp{display:inline;font-size:0;line-height:0;}',

            /* 底部操作栏 */
            '.xsact-qa-panel-footer{',
            '  display:flex;align-items:center;flex-wrap:wrap;gap:7px;padding:11px 12px;border-top:1px solid var(--xs-border);min-height:0;',
            '}',
            '.xsact-qa-mini-btn{',
            '  background:var(--xs-btn-bg);border:1px solid var(--xs-border);',
            '  border-radius:8px;padding:8px 10px;font-size:12px;color:var(--xs-text-dim);cursor:pointer;',
            '  display:flex;align-items:center;justify-content:center;gap:6px;transition:background .15s,border-color .15s,color .15s,box-shadow .15s;',
            '}',
            '.xsact-qa-mini-btn:hover{background:var(--xs-hover);border-color:var(--xs-border-strong);color:var(--xs-text);}',
            '#xsact-refresh-btn,#xsact-exit-panel-btn{padding:0;width:28px;height:28px;}',
            '#xsact-x3-btn{padding:8px 10px;min-width:34px;}',
            /* 版本号隐约显示（footer 右下，hover 才清晰） */
            '.xsact-version-tag{',
            '  margin-left:auto;font-size:10px;line-height:1;letter-spacing:.04em;user-select:none;',
            '  color:rgba(var(--xs-accent-rgb),0.9);opacity:.32;transition:opacity .25s ease;align-self:center;',
            '}',
            '.xsact-version-tag:hover{opacity:.72;}',
            '.xsact-toggle-pill{gap:5px;padding:8px 10px;}',
            '.xsact-toggle-pill .xsact-ico{width:14px;height:14px;stroke-width:2.2px;}',
            '.xsact-pill-dot{width:7px;height:7px;border-radius:50%;background:var(--xs-text-faint);border:1px solid var(--xs-border-strong);transition:background .15s,box-shadow .15s,border-color .15s;}',
            '.xsact-qa-mini-btn.on{color:#E8B339;border-color:rgba(232,179,57,0.6);background:rgba(232,179,57,0.12);box-shadow:0 0 10px rgba(232,179,57,0.12);}',
            '.xsact-toggle-pill.on .xsact-pill-dot{background:#E8B339;border-color:#E8B339;box-shadow:0 0 8px rgba(232,179,57,0.7);}',
            '#xsact-fav-btn.on{color:#E8B339;background:rgba(232,179,57,0.12);border-color:rgba(232,179,57,0.6);}',
            '#xsact-fav-btn.on .xsact-pill-dot{background:#E8B339;border-color:#E8B339;}',
            '#xsact-self-btn.on{color:#46E0A0;border-color:rgba(70,224,160,0.6);background:rgba(70,224,160,0.12);}',
            '#xsact-self-btn.on .xsact-pill-dot{background:#46E0A0;border-color:#46E0A0;box-shadow:0 0 8px rgba(70,224,160,0.7);}',
            '#xsact-fav-clear-btn{padding:0;width:28px;height:28px;color:var(--xs-text-dim);}',
            '#xsact-fav-clear-btn:hover{background:rgba(255,92,92,0.12);border-color:rgba(255,92,92,0.5);color:#FFB3B3;}',

            '.xsact-qa-panel-content{',
            '  flex:1;position:relative;display:flex;flex-direction:column;min-width:0;',
            '  overflow:hidden;min-height:0;',
            '}',
            '.xsact-qa-panel-main{',
            '  flex:1;display:flex;flex-direction:column;min-width:0;min-height:0;',
            '}',

            /* ===== 人物列表侧边触发按钮（左向小三角）===== */
            '#xsact-char-popover-tab{',
            '  position:absolute;left:-16px;top:50%;transform:translateY(-50%);',
            '  width:16px;height:56px;',
            '  display:flex;align-items:center;justify-content:center;',
            '  background:var(--xs-panel-bg);border:1px solid var(--xs-border);border-right:none;',
            '  border-radius:8px 0 0 8px;',
            '  color:var(--xs-text-dim);cursor:pointer;',
            '  z-index:90001;',
            '  box-shadow:-4px 0 14px rgba(0,0,0,0.22);',
            '  transition:all .15s ease;',
            '}',
            '#xsact-char-popover-tab:hover,',
            '#xsact-char-popover-tab.active{',
            '  color:var(--xs-accent);border-color:var(--xs-accent);',
            '  box-shadow:0 0 12px rgba(var(--xs-accent-rgb), 0.35), -4px 0 14px rgba(0,0,0,0.22);',
            '}',
            '#xsact-char-popover-tab .xsact-ico{width:10px;height:10px;}',

            /* 左右窗口联动桥接 */
            '#xsact-popover-connector{',
            '  display:none;position:absolute;left:-16px;top:50%;',
            '  width:16px;height:80px;transform:translateY(-50%);',
            '  background:linear-gradient(to right, rgba(var(--xs-accent-rgb),0.15), rgba(var(--xs-accent-rgb),0.55));',
            '  border-top:1px solid rgba(var(--xs-accent-rgb),0.55);',
            '  border-bottom:1px solid rgba(var(--xs-accent-rgb),0.55);',
            '  box-shadow:0 0 16px rgba(var(--xs-accent-rgb), 0.35);',
            '  z-index:90000;',
            '}',
            '#xsact-popover-connector::after{',
            '  content:"";position:absolute;left:5px;top:50%;transform:translateY(-50%);',
            '  width:0;height:0;',
            '  border-top:4px solid transparent;',
            '  border-bottom:4px solid transparent;',
            '  border-left:5px solid rgba(var(--xs-accent-rgb),0.85);',
            '}',
            '#xsact-qa-panel.popover-open #xsact-popover-connector{display:block;}',

            /* ===== 人物列表弹出层 ===== */
            '.xsact-char-popover{',
            '  position:absolute;left:-256px;top:46px;',
            '  width:min(260px,85vw);height:calc(100% - 64px);',
            '  display:flex;flex-direction:column;min-height:0;',
            '  background:var(--xs-panel-bg);',
            '  border:1px solid var(--xs-accent);border-radius:12px;',
            '  box-shadow:0 12px 40px rgba(0,0,0,0.45),0 0 0 1px rgba(var(--xs-accent-rgb), 0.08),0 0 24px rgba(var(--xs-accent-rgb), 0.10);',
            '  backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);',
            '  z-index:10;overflow:hidden;',
            '  animation:xsact-popover-in .2s cubic-bezier(.16,1,.3,1);',
            '}',
            '.xsact-char-popover.right{',
            '  left:calc(100% + 16px);',
            '}',
            '.xsact-char-popover.show-back .xsact-char-popover-back{display:flex;}',
            '.xsact-char-popover-header{',
            '  display:flex;justify-content:space-between;align-items:center;gap:6px;',
            '  padding:10px 12px;border-bottom:1px solid var(--xs-border);',
            '  background:rgba(var(--xs-accent-rgb), 0.08);',
            '}',
            '.xsact-char-popover-back{',
            '  display:none;width:22px;height:22px;align-items:center;justify-content:center;',
            '  background:transparent;border:1px solid transparent;border-radius:6px;',
            '  color:var(--xs-text-dim);font-size:20px;line-height:1;cursor:pointer;',
            '  transition:all .15s ease;',
            '}',
            '.xsact-char-popover-back:hover{',
            '  background:var(--xs-hover);color:var(--xs-text);',
            '}',
            '.xsact-char-popover-title{',
            '  flex:1;font-size:13px;font-weight:600;color:var(--xs-accent-text);',
            '  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;',
            '}',
            '.xsact-char-popover-close{',
            '  width:22px;height:22px;display:flex;align-items:center;justify-content:center;',
            '  background:transparent;border:1px solid transparent;border-radius:6px;',
            '  color:var(--xs-text-dim);font-size:17px;line-height:1;cursor:pointer;',
            '  transition:all .15s ease;',
            '}',
            '.xsact-char-popover-close:hover{',
            '  background:rgba(255,92,92,0.12);border-color:rgba(255,92,92,0.4);color:#FFB3B3;',
            '}',
            '.xsact-char-popover-body{',
            '  flex:1;overflow-y:auto;overflow-x:hidden;scrollbar-width:thin;scrollbar-color:var(--xs-scroll) transparent;overscroll-behavior:contain;',
            '  display:flex;flex-direction:column;min-height:0;',
            '}',
            '.xsact-char-popover-body::-webkit-scrollbar{width:4px;}',
            '.xsact-char-popover-body::-webkit-scrollbar-track{background:transparent;}',
            '.xsact-char-popover-body::-webkit-scrollbar-thumb{background:var(--xs-scroll);border-radius:2px;}',
            '.xsact-char-popover-items{',
            '  flex:1;overflow-y:auto;scrollbar-width:thin;scrollbar-color:var(--xs-scroll) transparent;',
            '  padding:6px;',
            '}',
            '.xsact-char-popover-items::-webkit-scrollbar{width:4px;}',
            '.xsact-char-popover-items::-webkit-scrollbar-track{background:transparent;}',
            '.xsact-char-popover-items::-webkit-scrollbar-thumb{background:var(--xs-scroll);border-radius:2px;}',
            '.xsact-char-popover-empty{',
            '  padding:16px 10px;font-size:12px;color:var(--xs-text-faint);text-align:center;',
            '}',
            '.xsact-char-popover-item{',
            '  display:flex;align-items:center;gap:8px;',
            '  padding:9px 10px;margin-bottom:4px;',
            '  border-radius:8px;cursor:pointer;',
            '  background:var(--xs-panel-bg-2);border:1px solid var(--xs-border);',
            '  color:var(--xs-text-dim);font-size:12.5px;',
            '  transition:all .12s ease;',
            '}',
            '.xsact-char-popover-item:last-child{margin-bottom:0;}',
            '.xsact-char-popover-item:hover{',
            '  background:var(--xs-hover);border-color:var(--xs-border-strong);color:var(--xs-text);',
            '  transform:translateX(3px);',
            '}',
            '.xsact-char-popover-item.selected{',
            '  background:rgba(var(--xs-accent-rgb), 0.14);border-color:var(--xs-accent);',
            '  color:var(--xs-accent-text);',
            '}',
            '.xsact-char-popover-item.self{',
            '  color:#46E0A0;border-color:rgba(70,224,160,0.25);',
            '}',
            '.xsact-char-popover-item.self:hover{',
            '  background:rgba(70,224,160,0.08);border-color:rgba(70,224,160,0.5);color:#CFFAE8;',
            '}',
            '.xsact-char-popover-item.self.selected{',
            '  background:rgba(70,224,160,0.14);border-color:#46E0A0;color:#46E0A0;',
            '}',
            '.xsact-char-popover-name{',
            '  flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;',
            '}',
            '.xsact-char-popover-self{',
            '  flex-shrink:0;font-size:9px;padding:2px 5px;border-radius:4px;',
            '  background:rgba(70,224,160,0.15);color:#46E0A0;',
            '}',
            '@keyframes xsact-popover-in{',
            '  from{opacity:0;transform:translateY(-8px) scale(.96);}',
            '  to{opacity:1;transform:translateY(0) scale(1);}',
            '}',

            /* ===== 人物部位选择（BC 原生矩形 Zone 地图）===== */
            '.xsact-body-select{',
            '  flex:1;display:flex;flex-direction:column;align-items:stretch;min-height:0;',
            '  min-height:0;padding:6px 4px 0;gap:6px;overflow:hidden;',
            '}',
            '.xsact-body-svg{',
            '  flex:1;min-height:0;width:100%;height:100%;',
            '  align-self:center;overflow:visible;',
            '  filter:var(--xs-zone-filter);',
            '}',
            /* 矩形热区：主题感知描边；light 下深灰/玫红，dark 下保持白色霓虹 */
            '.xsact-body-part-zone{',
            '  fill:var(--xs-zone-fill);',
            '  stroke:var(--xs-zone-stroke);stroke-width:1.2;',
            '  cursor:pointer;transition:fill .12s,stroke .12s,stroke-width .12s,filter .12s;',
            '  pointer-events:all;vector-effect:non-scaling-stroke;',
            '}',
            '.xsact-body-part-zone:hover,.xsact-body-part-zone.hover{',
            '  fill:var(--xs-zone-fill-hover);stroke:var(--xs-zone-stroke-hover);stroke-width:2.5;',
            '  filter:drop-shadow(0 0 8px rgba(var(--xs-accent-rgb), 0.6));',
            '}',
            '.xsact-body-part-zone.selected{',
            '  fill:var(--xs-zone-fill-selected);',
            '  stroke:var(--xs-zone-stroke-selected);stroke-width:2.5;',
            '  filter:drop-shadow(0 0 10px rgba(var(--xs-accent-rgb), 0.55));',
            '}',
            '.xsact-body-part-hint{',
            '  font-size:12px;color:var(--xs-text-dim);text-align:center;',
            '  padding:6px 10px;border-radius:6px;background:var(--xs-panel-bg-2);',
            '  border:1px solid var(--xs-border);white-space:nowrap;',
            '}',
            /* 预设栏 */
            '.xsact-qa-panel-body.fav-active .xsact-action-btn:hover{',
            '  border-style:dashed;border-color:rgba(232,179,57,0.7);',
            '}',
            '.xsact-qa-state.presets-bar{grid-column:1 / -1;padding:6px 12px 10px;display:flex;flex-wrap:wrap;gap:4px;}',

            '.xsact-resize-handle{',
            '  position:absolute;right:4px;bottom:4px;width:18px;height:18px;',
            '  display:flex;align-items:flex-end;justify-content:flex-end;',
            '  color:var(--xs-text-faint);cursor:nwse-resize;z-index:10;transition:color .15s;',
            '  pointer-events:auto;',
            '}',
            '.xsact-resize-handle:hover{color:var(--xs-accent);}',
            '.xsact-resize-handle.resizing{color:var(--xs-accent);}',
            '.xsact-resize-handle .xsact-ico{width:14px;height:14px;}',

            /* ===== 浮动身体网格（霓虹线框，按 BC 原生 Zone 定位） ===== */
            '.xsact-body-grid{',
            '  position:absolute;z-index:89999;pointer-events:none;',
            '  background:transparent !important;',
            '}',
            '.xsact-part-btn{',
            '  position:absolute;padding:0;margin:0;',
            '  background:transparent;color:transparent;font-size:0;border:none;',
            '  cursor:pointer;transition:box-shadow 0.12s ease;box-sizing:border-box;',
            '  pointer-events:auto;',
            '  box-shadow:inset 0 0 0 2px rgba(77,248,255,0.55),',
            '             0 0 6px rgba(77,248,255,0.18);',
            '}',
            '.xsact-part-btn:hover{',
            '  box-shadow:inset 0 0 0 3px rgba(77,248,255,1),',
            '             0 0 18px rgba(77,248,255,0.6),0 0 36px rgba(77,248,255,0.2);',
            '}',
            '.xsact-part-btn.active{',
            '  box-shadow:inset 0 0 0 3.5px rgba(255,51,102,1),',
            '             0 0 22px rgba(255,51,102,0.75),0 0 44px rgba(255,51,102,0.35),',
            '             inset 0 0 24px rgba(255,51,102,0.12);',
            '}',
            '.xsact-part-btn.active:hover{',
            '  box-shadow:inset 0 0 0 4.5px #FF3366,',
            '             0 0 30px rgba(255,51,102,1),0 0 60px rgba(255,51,102,0.45);',
            '}',

            /* 自己模式：给玩家自己的身体线框加个绿色边框提示 */
            '.xsact-body-grid.self .xsact-part-btn{',
            '  box-shadow:inset 0 0 0 2px rgba(70,224,160,0.65),',
            '             0 0 6px rgba(70,224,160,0.25);',
            '}',
            '.xsact-body-grid.self .xsact-part-btn:hover{',
            '  box-shadow:inset 0 0 0 3px rgba(70,224,160,1),',
            '             0 0 18px rgba(70,224,160,0.55),0 0 36px rgba(70,224,160,0.25);',
            '}',

            /* ===== 滚动条 ===== */
            '.xsact-qa-panel-body::-webkit-scrollbar{width:6px;}',
            '.xsact-qa-panel-body::-webkit-scrollbar-track{background:transparent;}',
            '.xsact-qa-panel-body::-webkit-scrollbar-thumb{background:var(--xs-scroll);border-radius:3px;}',

            /* ===== 容器查询：面板内容按实际宽度自适应 ===== */
            '@container xsact-body (max-width: 180px){',
              '.xsact-qa-panel-body{grid-template-columns:1fr;}',
              '.xsact-action-btn{padding:10px 9px;font-size:11.5px;}',
            '}',
            '@container xsact-body (min-width: 181px) and (max-width: 280px){',
              '.xsact-qa-panel-body{grid-template-columns:repeat(2,1fr);}',
            '}',
            '@container xsact-body (min-width: 281px){',
              '.xsact-qa-panel-body{grid-template-columns:repeat(auto-fill, minmax(108px, 1fr));}',
            '}',
            '@container xsact-panel (max-width: 280px){',
              '.xsact-qa-panel-footer .xsact-qa-mini-btn span:not(.xsact-pill-dot){display:none;}',
              '.xsact-qa-panel-footer .xsact-qa-mini-btn{flex:0 0 36px;padding:6px;}',
              '.xsact-qa-mode-tabs .xsact-mode-tab span{display:none;}',
              '.xsact-mode-tab .xsact-ico{width:16px;height:16px;}',
            '}',
            '@container xsact-panel (max-width: 240px){',
              '.xsact-panel-head-actions button:not(#xsact-exit-panel-btn){display:none;}',
            '}',

            /* ===== 主题色切换过渡 ===== */
            '#xsact-qa-panel,#xsact-toggle-btn{',
            '  transition:background-color .3s ease,border-color .3s ease,color .3s ease,box-shadow .3s ease;',
            '}',
            '#xsact-qa-panel{animation:xsact-pop-in .28s cubic-bezier(.16,1,.3,1);}',

            /* ===== 过渡动画 ===== */
            '@keyframes xsact-pop-in{from{opacity:0;transform:translateY(-8px) scale(.98);}to{opacity:1;transform:none;}}',
            '@keyframes xsact-fade-in{from{opacity:0;transform:translateY(4px);}to{opacity:1;transform:none;}}',
            '.xsact-action-btn,.xsact-combo-card{animation:xsact-fade-in .22s ease both;}',

            /* 主题切换按钮图标显隐 */
            '#xsact-theme-btn .xsact-theme-icon{display:none;}',
            '[data-xsact-theme="dark"] #xsact-theme-btn .sun{display:block;}',
            '[data-xsact-theme="light"] #xsact-theme-btn .moon{display:block;}',

            /* ===== 视口断点适配（手机/平板/笔记本/大屏） ===== */
            '@media (max-width: 480px){',
              '#xsact-qa-panel{',
                'width:92vw;height:88vh;top:6vh;right:4vw;left:auto;bottom:auto;',
                'min-width:200px;min-height:260px;max-width:98vw;max-height:94vh;',
              '}',
              '#xsact-qa-panel.popover-open #xsact-popover-connector{display:none;}',
              '#xsact-char-popover-tab{display:none;}',
              '.xsact-char-popover,',
              '.xsact-char-popover.right{',
                'position:absolute;left:0;top:0;width:100%;height:100%;border-radius:14px;',
                'border-color:var(--xs-accent);animation:xsact-popover-in .2s cubic-bezier(.16,1,.3,1);',
              '}',
              '.xsact-qa-panel-header{padding:12px 14px;}',
              '#xsact-panel-title{font-size:14px;}',
              '.xsact-qa-mode-tabs{padding:10px 14px;}',
              '.xsact-mode-tab{padding:12px 10px;font-size:13px;}',
              '.xsact-qa-panel-body{padding:12px 14px;gap:8px;}',
              '.xsact-action-btn{padding:14px 12px;font-size:14px;}',
              '.xsact-qa-panel-footer{padding:10px 14px;gap:8px;}',
              '.xsact-qa-mini-btn{flex:1 1 0;min-height:44px;padding:10px 8px;font-size:13px;}',
              '#xsact-fav-clear-btn{flex:0 0 44px;}',
              '.xsact-body-select{padding:8px 6px;}',
              '.xsact-body-part-hint{font-size:13px;}',
            '}',
            '@media (min-width: 481px) and (max-width: 768px){',
              '#xsact-qa-panel{width:min(340px,90vw);height:min(640px,86vh);}',
              '.xsact-action-btn{padding:11px 12px;font-size:13px;}',
            '}',
            '@media (min-width: 769px) and (max-width: 1200px){',
              '#xsact-qa-panel{width:min(360px,40vw);height:min(680px,84vh);}',
            '}',
            '@media (min-width: 1201px){',
              '#xsact-qa-panel{width:min(380px,30vw);height:min(720px,82vh);}',
            '}',
            '@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi){',
              '.xsact-qa-panel-header,.xsact-qa-panel-footer,.xsact-action-btn,.xsact-char-popover-item{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;}',
            '}',
            /* ===== light 主题下高对比文字修正 ===== */
            '[data-xsact-theme="light"] .xsact-action-btn.fav{ color:#7D5A10; }',
            '[data-xsact-theme="light"] .xsact-action-btn.fav:hover{ color:#5C4508; }',
            '[data-xsact-theme="light"] .xsact-add-to-combo{ color:#1B7A5C; }',
            '[data-xsact-theme="light"] .xsact-add-to-combo:hover{ color:#0F5C44; }',
            '[data-xsact-theme="light"] #xsact-self-btn.on{ color:#1B7A5C; }',
            '[data-xsact-theme="light"] .xsact-char-popover-item.self{ color:#1B7A5C; }',
            '[data-xsact-theme="light"] .xsact-char-popover-item.self:hover{ color:#0F5C44; }',
            '[data-xsact-theme="light"] .xsact-char-popover-item.self.selected{ color:#1B7A5C; }',
            /* ── 更新 / 公告横幅 ── */
            '.xsact-update-banner{',
            '  margin:8px 10px 0;border:1px solid var(--xs-accent, rgba(255,92,122,0.6));border-radius:10px;',
            '  background:linear-gradient(180deg, rgba(255,92,122,0.14), rgba(255,92,122,0.06));',
            '  padding:8px 10px;font-size:12px;color:var(--xs-text);box-shadow:0 4px 14px rgba(0,0,0,0.25);',
            '}',
            '.xsact-update-banner.is-announce{',
            '  border-color:rgba(120,180,255,0.55);background:linear-gradient(180deg, rgba(120,180,255,0.14), rgba(120,180,255,0.05));',
            '}',
            '.xsact-update-banner.is-important{',
            '  border-color:#ffcf5c;background:linear-gradient(180deg, rgba(255,207,92,0.16), rgba(255,207,92,0.06));',
            '}',
            '.xsact-update-banner.is-available{',
            '  border-color:var(--xs-accent, rgba(255,92,122,0.6));background:linear-gradient(180deg, rgba(255,92,122,0.14), rgba(255,92,122,0.06));',
            '}',
            '.xsact-update-banner.is-available .xsact-ub-tag{color:var(--xs-accent, #FF5C7A);}',
            '.xsact-ub-head{display:flex;align-items:center;gap:6px;margin-bottom:4px;}',
            '.xsact-ub-tag{font-weight:700;letter-spacing:.04em;color:var(--xs-accent, #FF5C7A);}',
            '.xsact-update-banner.is-announce .xsact-ub-tag{color:#7ab8ff;}',
            '.xsact-ub-ver{font-weight:700;}',
            '.xsact-ub-title{font-weight:600;}',
            '.xsact-ub-close{margin-left:auto;background:none;border:none;color:var(--xs-text-dim);font-size:16px;line-height:1;cursor:pointer;padding:0 4px;}',
            '.xsact-ub-close:hover{color:var(--xs-text);}',
            '.xsact-ub-sum{margin:2px 0 6px;padding-left:16px;color:var(--xs-text-dim);}',
            '.xsact-ub-sum li{margin:1px 0;}',
            '.xsact-ub-msg{margin:2px 0 6px;color:var(--xs-text-dim);line-height:1.4;white-space:pre-line;}',
            '.xsact-ub-actions{display:flex;gap:6px;flex-wrap:wrap;}',
            '.xsact-ub-btn{background:var(--xs-btn-bg, rgba(255,255,255,0.08));border:1px solid var(--xs-border, rgba(255,255,255,0.12));',
            '  color:var(--xs-text);border-radius:7px;padding:4px 9px;font-size:12px;cursor:pointer;}',
            '.xsact-ub-btn:hover{background:var(--xs-hover, rgba(255,255,255,0.14));}',
            '.xsact-ub-primary{background:var(--xs-accent, #FF5C7A);border-color:transparent;color:#fff;font-weight:600;}',
            '.xsact-ub-primary:hover{filter:brightness(1.08);}',
            '@media (max-width:480px){',
            '  .xsact-update-banner{font-size:11px;}',
            '}',

            /* ===== 自定义 tooltip（替换原生 title：统一风格 / 视口翻转 / 短延迟） ===== */
            '.xsact-tooltip{',
            '  position:fixed;z-index:100001;max-width:240px;',
            '  padding:6px 10px;border-radius:9px;',
            '  background:var(--xs-panel-bg);color:var(--xs-text);',
            '  font-size:12px;line-height:1.45;white-space:normal;',
            '  border:1px solid var(--xs-border-strong);',
            '  box-shadow:0 6px 20px var(--xs-shadow);',
            '  backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);',
            '  pointer-events:none;opacity:0;transform:translateY(3px);',
            '  transition:opacity .12s ease,transform .12s ease;',
            '}',
            '.xsact-tooltip.show{opacity:1;transform:translateY(0);}',
            '.xsact-tooltip .xsact-tt-title{font-weight:600;}',
            '.xsact-tooltip .xsact-tt-sub{display:block;margin-top:2px;color:var(--xs-text-dim);font-size:11px;line-height:1.4;}',
            '.xsact-tooltip.is-danger{border-color:#ff6b6b;box-shadow:0 6px 20px var(--xs-shadow),0 0 0 1px rgba(255,107,107,0.25);}',
            '.xsact-tooltip.is-danger .xsact-tt-sub{color:#ffb3b3;}',
            /* ── 小酥动作包：内置动作开关（预编译，无需原版插件） ── */
            '.xsact-ca-xiaosu{margin-top:2px;display:flex;align-items:center;justify-content:space-between;gap:8px;padding:6px 10px;border-radius:8px;background:var(--xs-card-bg);border:1px solid var(--xs-border);}',
            '.xsact-ca-xiaosu-label{font-size:12px;color:var(--xs-text);font-weight:500;line-height:1;cursor:help;}',
            '.xsact-ca-xiaosu-switch .xsact-ca-toggle-track{width:28px;height:15px;}',
            '.xsact-ca-xiaosu-switch .xsact-ca-toggle-track::before{width:11px;height:11px;}',
            '.xsact-ca-xiaosu-switch input:checked + .xsact-ca-toggle-track::before{transform:translateX(13px);}',
            '.xsact-ca-toggle.is-disabled{opacity:.55;cursor:not-allowed;}',
            /* ── 统一确认模态（暗色玫红，替代浏览器原生 confirm） ── */
            '.xsact-confirm{position:fixed;inset:0;z-index:1000001;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.55);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);animation:xsact-confirm-fade .15s ease-out;}',
            '@keyframes xsact-confirm-fade{from{opacity:0;}to{opacity:1;}}',
            '@keyframes xsact-confirm-pop{from{opacity:0;transform:translateY(-6px) scale(.97);}to{opacity:1;transform:translateY(0) scale(1);}}',
            '.xsact-confirm-box{width:min(380px,90vw);padding:20px 22px 16px;border-radius:12px;background:var(--xs-panel-bg);border:1px solid rgba(255,92,122,0.35);box-shadow:0 18px 60px rgba(0,0,0,0.6),0 0 0 1px rgba(255,92,122,0.12);animation:xsact-confirm-pop .18s cubic-bezier(.16,1,.3,1);}',
            '.xsact-confirm-title{font-size:14px;font-weight:600;color:#FFB3C6;margin-bottom:8px;line-height:1.4;}',
            '.xsact-confirm-body{font-size:13px;line-height:1.65;color:var(--xs-text-dim);white-space:pre-wrap;word-break:break-word;}',
            '.xsact-confirm-footer{display:flex;justify-content:flex-end;gap:8px;margin-top:18px;}',
            '.xsact-confirm-btn{padding:7px 16px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;border:1px solid transparent;transition:background .15s,border-color .15s,color .15s;}',
            '.xsact-confirm-cancel{background:rgba(255,255,255,0.04);border-color:var(--xs-border);color:var(--xs-text-dim);}',
            '.xsact-confirm-cancel:hover{background:rgba(255,255,255,0.08);color:var(--xs-text);border-color:var(--xs-border-strong);}',
            '.xsact-confirm-ok{background:rgba(255,92,122,0.20);border-color:rgba(255,92,122,0.5);color:#FFB3C6;}',
            '.xsact-confirm-ok:hover{background:rgba(255,92,122,0.32);border-color:#FF5C7A;color:#fff;}',
            '.xsact-confirm-ok.is-danger{background:rgba(255,92,122,0.28);border-color:rgba(255,92,122,0.6);}',
        ].join('\n');
        document.head.appendChild(css);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 自定义 tooltip：替换原生 title（仅作用于本插件 UI，不触达 BC 原生提示）
    // 设计要点：
    //  · 事件委托在 document（bubble），靠 isPluginTip() 限定作用域，BC 自身 title 完全不受影响
    //  · 读 data-tooltip 优先（支持 @@ 分隔的「标题@@副标题」），title 兜底
    //  · 悬停时用空格占位抑制原生 title（保留属性存在，closest 仍匹配；移出按条件还原，不覆盖逻辑动态改写的 title）
    //  · 动态定位 + 视口翻转（上方空间不足翻到下方、超出左右则夹取），固定间距不随光标抖动
    //  · 120ms 短延迟显隐；scroll 时隐藏避免错位
    // ─────────────────────────────────────────────────────────────────────────


    // ── 原生动作按钮上的自定义动作图标（与插件视觉一致：玫红强调色 + 白色闪电）──
    var XSACT_ACTIVITY_ICON = 'data:image/svg+xml;utf8,' + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">' +
        '<rect x="2" y="2" width="20" height="20" rx="5" fill="#FF5C7A"/>' +
        '<path d="M13 6l-5 7h4l-1 5 6-8h-4z" fill="#ffffff"/>' +
        '</svg>'
    );

    function initTooltip() {
        if (window.__qiactTooltipReady) return;
        window.__qiactTooltipReady = true;

        var tip = document.createElement('div');
        tip.className = 'xsact-tooltip';
        tip.setAttribute('role', 'tooltip');
        tip.style.visibility = 'hidden';
        document.body.appendChild(tip);

        var currentEl = null;
        var showTimer = null;
        var SHOW_DELAY = 120;

        function isPluginTip(el) {
            return !!(el && el.closest && el.closest('#xsact-qa-panel, #xsact-toggle-btn, .xsact-update-banner'));
        }
        function getText(el) {
            var dt = el.getAttribute('data-tooltip');
            if (dt && dt.trim()) return dt;
            var t = el.getAttribute('title');
            return (t && t.trim()) ? t : '';
        }
        function render(el) {
            var raw = getText(el);
            if (!raw) { tip.innerHTML = ''; return; }
            var type = el.getAttribute('data-tooltip-type');
            tip.className = 'xsact-tooltip' + (type ? ' is-' + type : '');
            var parts = raw.split('@@');
            var html = '<span class="xsact-tt-title">' + escapeHtml(parts[0]) + '</span>';
            if (parts[1]) html += '<span class="xsact-tt-sub">' + escapeHtml(parts[1]) + '</span>';
            tip.innerHTML = html;
        }
        function position(el) {
            var r = el.getBoundingClientRect();
            var tr = tip.getBoundingClientRect();
            var gap = 8;
            var top = r.top - tr.height - gap;
            var left = r.left + r.width / 2 - tr.width / 2;
            if (top < 4) top = r.bottom + gap;
            if (left < 4) left = 4;
            if (left + tr.width > window.innerWidth - 4) left = window.innerWidth - tr.width - 4;
            if (top + tr.height > window.innerHeight - 4) top = window.innerHeight - tr.height - 4;
            tip.style.top = top + 'px';
            tip.style.left = left + 'px';
        }
        function show(el) {
            if (!isPluginTip(el)) return;
            var raw = getText(el);
            if (!raw) return;
            render(el); // 必须在抑制 title 之前渲染，否则 getText 会读到被清空的 title
            // 用空格占位抑制原生 title（属性仍存在于 DOM，closest 继续匹配；外部读取不受影响）
            if (el.getAttribute('title') && el.getAttribute('title').trim() !== '') {
                el.__xsTitle = el.getAttribute('title');
                el.setAttribute('title', ' ');
            }
            position(el);
            tip.style.visibility = 'visible';
            void tip.offsetWidth; // 强制 reflow 以触发过渡
            tip.classList.add('show');
            currentEl = el;
        }
        function hide() {
            if (showTimer) { clearTimeout(showTimer); showTimer = null; }
            tip.classList.remove('show');
            tip.style.visibility = 'hidden';
            if (currentEl && currentEl.__xsTitle != null) {
                // 仅当逻辑未在 hover 期间改写过 title 时才还原，避免覆盖动态更新
                if (!currentEl.getAttribute('title') || currentEl.getAttribute('title').trim() === '') {
                    currentEl.setAttribute('title', currentEl.__xsTitle);
                }
                currentEl.__xsTitle = null;
            }
            currentEl = null;
        }
        document.addEventListener('mouseover', function(e) {
            if (!e.target || !e.target.closest) return;
            var el = e.target.closest('[data-tooltip],[title]');
            if (el && isPluginTip(el)) {
                if (showTimer) { clearTimeout(showTimer); showTimer = null; }
                if (el !== currentEl) {
                    if (currentEl) hide();
                    showTimer = setTimeout(function() { show(el); }, SHOW_DELAY);
                }
            } else if (currentEl) {
                hide();
            }
        });
        document.addEventListener('mouseout', function(e) {
            if (showTimer) { clearTimeout(showTimer); showTimer = null; }
            var to = e.relatedTarget;
            if (!to || !to.closest) { hide(); return; }
            var el = to.closest('[data-tooltip],[title]');
            if (!el || !isPluginTip(el)) hide();
        });
        window.addEventListener('scroll', function() { if (currentEl) hide(); }, true);
    }

    // ════════════════════════════════════════════════════════════════════════
    // Hook 系统
    // ════════════════════════════════════════════════════════════════════════

    function setupHooks() {
        if (!state.modApi) return;

        // ── Hook: ActivityAllowedForGroup —— 屏蔽 echo 端已导入的同名原始动作 ──
        // 用户把 echo 动作导入到本插件后，会生成 QiAct_ 前缀的新 Activity。
        // 这里把 echo 原始 Activity（Name 在 echoSuppressed 集合中）过滤掉，
        // 确保插件动作列表和 BC 原生动作列表都不出现重复项。
        try {
            state.modApi.hookFunction('ActivityAllowedForGroup', 0, function(args, next) {
                var result = next(args);
                if (!state.echoSuppressed || state.echoSuppressed.size === 0 || !Array.isArray(result)) return result;
                return result.filter(function(item) {
                    var nm = (item && item.Activity && item.Activity.Name) || (item && item.Name);
                    return !caIsEchoSuppressed(nm);
                });
            });
        } catch (e) {
            console.warn('[QiAct] ActivityAllowedForGroup hook 失败:', e.message);
        }

        // ── Hook: AssetAllActivities —— 枚举期兜底过滤 echo 端已导入的同名原始动作 ──
        // 仅返回过滤后的「副本」，绝不改写全局数组（caRegister/caUnregister 等内部改写
        // 代码统一走 caRawAllActivities 读原始数组，因此本 hook 不会影响自定义动作注册）。
        // 优先级 0：在所有 mod 读取活动列表时即剔除 echo 原始项，覆盖 BC 原生活动面板、
        // 第三方 mod 枚举等任何直接调用 AssetAllActivities 的路径，解决屏蔽漏网。
        try {
            state.modApi.hookFunction('AssetAllActivities', 0, function(args, next) {
                var result = next(args);
                if (!state.echoSuppressed || state.echoSuppressed.size === 0 || !Array.isArray(result)) return result;
                try {
                    return result.filter(function(a) { return !caIsEchoSuppressed(a && a.Name); });
                } catch (e) { return result; }
            });
        } catch (e) {
            console.warn('[QiAct] AssetAllActivities hook 失败:', e.message);
        }

        // DrawCharacter(Character, X, Y, Zoom, ...) 的 X/Y/Zoom 是角色最终画上去的位置，
        // 含 ECHO 贴贴等活动的 X 位移，比 ChatRoomCharacterViewLoopCharacters 更准。
        // 这是线框能精确贴合人物模型的关键。
        try {
            state.modApi.hookFunction('DrawCharacter', 1, function(args, next) {
                var r = next(args);
                try {
                    var C = args[0], X = args[1], Y = args[2], Zoom = args[3];
                    if (C && C.MemberNumber != null && typeof X === 'number' &&
                        typeof CurrentScreen !== 'undefined' && CurrentScreen === 'ChatRoom') {
                        state.charAnchor[C.MemberNumber] = { x: X, y: Y, zoom: Zoom, t: Date.now() };
                    }
                } catch (e) { reportHookError('DrawCharacter锚点', e); }
                return r;
            });
        } catch (e) {
            console.warn('[QiAct] DrawCharacter 锚点 hook 失败:', e.message);
        }

        // Hook: DrawProcess — 每帧在主聊天界面确保切换按钮常驻
        state.modApi.hookFunction('DrawProcess', 4, function(args, next) {
            var result = next(args);
            try {
                if (typeof CurrentScreen !== 'undefined') {
                    if (CurrentScreen === 'ChatRoom') {
                        drawToggleButton();
                    } else if (state.toggleBtnEl) {
                        state.toggleBtnEl.style.display = 'none';
                    }
                }
            } catch (e) { reportHookError('DrawProcess', e); }
            return result;
        });

        // 窗口尺寸变化 → 刷新画布矩形缓存
        try {
            window.addEventListener('resize', function() { refreshCanvasCache(); });
        } catch (_) { /* 忽略：注册 resize 监听失败无影响 */ }

        // Hook: ChatRoomClick — 按钮已改为 DOM 元素，此处仅保留扩展点
        state.modApi.hookFunction('ChatRoomClick', 4, function(args, next) {
            // DOM 按钮(#xsact-toggle-btn) 自行处理点击事件，无需在此拦截
            return next(args);
        });

        // Hook: ActivityRun — 记录每次执行的上下文
        state.modApi.hookFunction('ActivityRun', 0, function(args, next) {
            try {
                var sourceChar = args[0];
                var targetChar = args[1];
                var group = args[2];
                var itemActivity = args[3] || {};
                var actName = (itemActivity.Activity && itemActivity.Activity.Name) || '';
                if (targetChar && actName) {
                    state.lastAction = {
                        name: actName,
                        targetMN: targetChar.MemberNumber,
                        part: (group && group.Name) || state.selectedPart || '',
                        time: Date.now()
                    };
                    saveStorage(S_LAST, state.lastAction);
                }
            } catch (e) { console.warn('[QiAct] ActivityRun hook 记录失败:', e.message); }
            next(args);
        });

        // Hook: ChatRoomMenuDraw — 动作模式下同步更新浮动网格位置（跟随角色）
        state.modApi.hookFunction('ChatRoomMenuDraw', 0, function(args, next) {
            var result = next(args);
            if (state.isActive) updateGridPositions();
            return result;
        });

        // 全局键盘: Esc 退出
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && state.isActive) {
                e.preventDefault();
                e.stopPropagation();
                toggleActionMode();
            }
        });

        // 定时刷新：检测新进入房间的角色（每 3 秒）
        function startRefreshTimer() {
            stopRefreshTimer();
            // 仅做兜底刷新：每帧 ChatRoomMenuDraw 已调用 updateGridPositions（其内部用
            // state.lastLayoutCount 正确判断人数变化并重建）。这里不能再用自己的
            // bodyGrids.size 与 layout.length 比较来触发 refreshBodyGrids，否则 selfMode
            // 关闭时玩家网格不计入 bodyGrids.size，导致 6 !== 7 永远成立，每 3 秒强制重建
            // 一次、线框瞬间跳动。
            state.refreshInterval = setInterval(function() {
                if (state.isActive) updateGridPositions();
            }, 3000);
        }
        function stopRefreshTimer() {
            if (state.refreshInterval) { clearInterval(state.refreshInterval); state.refreshInterval = null; }
        }

        // Hook ServerSend: 监听房间进出事件
        state.modApi.hookFunction('ServerSend', 0, function(args, next) {
            var data = args[0];
            if (data && (data.Type === 'Action' || data.Type === 'Activity')) {
                setTimeout(function() {
                    if (state.isActive) refreshBodyGrids();
                }, 500);
            }
            return next(args);
        });

        // ── Hook: ActivityRun（优先级 -100，先于记录 hook 拦截）──
        // 原生动作界面点击我们的自定义动作时，BC 原生 ActivityRun 会按「当前菜单部位组」
        // 与「acted 是否为玩家」拼出 ChatSelf/ChatOther-<group>-<QiAct_xxx> 再发送，
        // 这与我们的字典注册组 / self-other 选择可能不一致（例如自我动作点到他人身上会变成
        // ChatOther = 无占位符的纯标签），导致接收端 MISSING TEXT 或「人物名称占位符」未被替换。
        // 这里拦截：本地副作用仍交给 BC（sendMessage=false），消息改走与插件 UI 完全一致的
        // makeActivityPacket，保证原生界面与插件界面行为一致、跨客户端可读。
        try {
            state.modApi.hookFunction('ActivityRun', -100, function(args, next) {
                try {
                    var _item = args[3] || {};
                    var _name = (_item.Activity && _item.Activity.Name) || '';
                    var _send = args[4];
                    if (_send !== false && typeof _name === 'string' && _name.indexOf(CA_PREFIX) === 0) {
                        var _ca = caFindByActivityName(_name);
                        if (_ca) {
                            var _acted = args[1];
                            try { args[4] = false; next(args); }
                            catch (e) { console.warn('[QiAct] 原生点击本地副作用失败:', e.message); }
                            var _packet = makeActivityPacket(_acted, _ca.group, _name, _item.Item || null);
                            if (_packet) {
                                var _prev = _acted ? _acted.FocusGroup : undefined;
                                var _fg = (typeof AssetGroup !== 'undefined' && Array.isArray(AssetGroup))
                                    ? AssetGroup.find(function(g) { return g && g.Name === _ca.group; }) : null;
                                try {
                                    if (_acted) _acted.FocusGroup = _fg || { Name: _ca.group };
                                    if (typeof ServerSend === 'function') ServerSend('ChatRoomChat', _packet);
                                } finally { if (_acted) _acted.FocusGroup = _prev; }
                            }
                            return; // 已自行发包，阻断 BC 默认 Activity 包
                        }
                    }
                } catch (e) { console.warn('[QiAct] 原生点击拦截异常，回退 BC 默认:', e.message); }
                return next(args);
            });
        } catch (e) {
            console.warn('[QiAct] ActivityRun 原生点击拦截 hook 失败:', e.message);
        }

        // ── Hook: ElementButton.CreateForActivity —— 为自定义动作按钮注入图标 ──
        // BC 的 Activity 对象无 Image/Icon 字段，原生按钮会尝试加载
        // ./Assets/Female3DCG/Activity/<QiAct_xxx>.png（该文件不存在 → 破图/无图）。
        // 这里把按钮主图覆盖为插件品牌图标（玫红方块 + 白色闪电 data URL），
        // 使自定义动作在原生动作界面也能显示辨识图标，且不会出现破图。
        try {
            state.modApi.hookFunction('ElementButton.CreateForActivity', 0, function(args, next) {
                var _ia = args[1] || {};
                var _n = (_ia.Activity && _ia.Activity.Name) || '';
                if (typeof _n === 'string' && _n.indexOf(CA_PREFIX) === 0) {
                    if (!args[4] || typeof args[4] !== 'object') args[4] = {};
                    args[4].image = XSACT_ACTIVITY_ICON;
                }
                return next(args);
            });
        } catch (e) {
            console.warn('[QiAct] ElementButton 图标 hook 失败:', e.message);
        }

        // 将定时器控制绑定到 enter/exit
        var _baseEnter = enterActionMode;
        enterActionMode = function() { _baseEnter(); startRefreshTimer(); };
        var _baseExit = exitActionMode;
        exitActionMode = function() { _baseExit(); stopRefreshTimer(); };
    }

    /** 更新浮动网格位置（跟随角色移动/人数变化） */
    function updateGridPositions() {
        refreshCanvasCache(); // 每帧刷新画布矩形缓存（一次即可）
        var layout = getCharLayout();
        // 如果人数变化，重建
        if (layout.length !== state.lastLayoutCount) {
            state.lastLayoutCount = layout.length;
            refreshBodyGrids();
            return;
        }
        var shifts = computeOverlapShifts(layout);
        layout.forEach(function(entry) {
            entry.overlapShift = shifts.get(entry.char.MemberNumber) || 0;
            var grid = state.bodyGrids.get(entry.char);
            if (grid) positionGrid(grid, entry);
        });
    }


    // ════════════════════════════════════════════════════════════════════════
    // 更新 / 公告检测（脚本内 5 分钟轮询，玩家端收得到，无需刷新页面）
    // ════════════════════════════════════════════════════════════════════════



    /* ===== 14.5 更新与公告 ===== */
    const VERSION_INFO_URL = 'https://bondage-studio.github.io/QuickInteraction/version.json';
    // 备用源：主源（GitHub Pages）偶发不可达时回退到 GitHub Raw，互为冗余提升检测成功率
    const VERSION_INFO_FALLBACK = 'https://raw.githubusercontent.com/bondage-studio/QuickInteraction/main/version.json';

    // 更新检测参数（集中管理，方便调参）
    const UPDATE_INTERVAL = 5 * 60 * 1000; // 5 分钟轮询
    const UPDATE_FIRST_DELAY = 30000;      // 加载后 30 秒首查
    const UPDATE_MAX_RETRY = 3;            // 单次轮询内最大重试次数
    const UPDATE_FETCH_TIMEOUT = 8000;     // 单次请求超时（毫秒），避免挂起阻塞检测周期

    function compareVersion(a, b) {
        var pa = String(a || '').split('.').map(function (x) { return parseInt(x, 10) || 0; });
        var pb = String(b || '').split('.').map(function (x) { return parseInt(x, 10) || 0; });
        var len = Math.max(pa.length, pb.length);
        for (var i = 0; i < len; i++) {
            var va = pa[i] || 0, vb = pb[i] || 0;
            if (va > vb) return 1;
            if (va < vb) return -1;
        }
        return 0;
    }

    // ── 错误日志（控制台 + 持久化）──
    function logUpdateError(entry) {
        var where = entry.kind === 'http'
            ? ('HTTP ' + entry.status)
            : (entry.kind === 'parse' ? '响应解析失败' : '网络错误');
        console.error('[QiAct] 更新检查失败（第 ' + entry.attempt + ' 次）[' + where + '] ' + (entry.message || '') + (entry.url ? ' @ ' + entry.url : ''));
        try {
            var log = [];
            try { log = JSON.parse(loadSetting(S_UPDATE_ERROR_LOG, '[]')) || []; } catch (_) { log = []; }
            if (!Array.isArray(log)) log = [];
            log.push({
                ts: Date.now(),
                attempt: entry.attempt,
                kind: entry.kind,
                status: entry.status || null,
                url: entry.url || null,
                message: String(entry.message || '').slice(0, 200)
            });
            if (log.length > 10) log = log.slice(-10);
            persist(S_UPDATE_ERROR_LOG, JSON.stringify(log));
        } catch (_) { /* 存储失败不影响检测主流程 */ }
    }
    function clearUpdateErrorLog() {
        try { persist(S_UPDATE_ERROR_LOG, '[]'); } catch (_) {}
    }
    function getUpdateErrorLog() {
        try { var l = JSON.parse(loadSetting(S_UPDATE_ERROR_LOG, '[]')); return Array.isArray(l) ? l : []; } catch (_) { return []; }
    }

    // 单次带超时的请求，返回解析后的 info；失败抛带 kind/status 的错误对象
    async function fetchVersionJson(url, attempt) {
        var ctrl = ('AbortController' in window) ? new AbortController() : null;
        var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, UPDATE_FETCH_TIMEOUT) : null;
        try {
            var sep = url.indexOf('?') >= 0 ? '&' : '?';
            var res = await fetch(url + sep + 't=' + Date.now(), ctrl ? { cache: 'no-store', signal: ctrl.signal } : { cache: 'no-store' });
            if (!res.ok) {
                var he = new Error('HTTP ' + res.status);
                he.kind = 'http'; he.status = res.status; he.url = url; he.attempt = attempt;
                throw he;
            }
            var text = await res.text();
            try {
                return JSON.parse(text);
            } catch (pe) {
                var pe2 = new Error('JSON 解析失败: ' + pe.message);
                pe2.kind = 'parse'; pe2.status = res.status; pe2.url = url; pe2.attempt = attempt;
                throw pe2;
            }
        } finally {
            if (timer) clearTimeout(timer);
        }
    }

    // 主源 → 备用源 逐源尝试；任一成功即返回；全失败抛最后一个错误（每源失败均已记录日志）
    async function fetchWithFallback(attempt) {
        var sources = [VERSION_INFO_URL, VERSION_INFO_FALLBACK];
        var lastErr = null;
        for (var i = 0; i < sources.length; i++) {
            try {
                return await fetchVersionJson(sources[i], attempt);
            } catch (e) {
                lastErr = e;
                logUpdateError({ kind: e.kind || 'network', status: e.status, url: e.url || sources[i], message: e.message, attempt: attempt });
            }
        }
        throw lastErr;
    }

    // 单次完整轮询：含重试 + 退避，成功返回 true，彻底失败返回 false（错误日志已落盘）
    async function checkUpdate() {
        for (var attempt = 1; attempt <= UPDATE_MAX_RETRY; attempt++) {
            try {
                var info = await fetchWithFallback(attempt);
                clearUpdateErrorLog(); // 恢复：清掉历史错误日志
                handleVersionInfo(info);
                return true;
            } catch (e) {
                // 各源失败已由 fetchWithFallback 逐条记录；此处仅做退避与最终汇总，避免重复写日志
                if (attempt < UPDATE_MAX_RETRY) {
                    await new Promise(function (r) { setTimeout(r, 1000 * attempt); }); // 退避 1s, 2s
                    continue;
                }
                console.warn('[QiAct] 更新检查连续 ' + UPDATE_MAX_RETRY + ' 次失败，错误已记录；下个周期（' + Math.round(UPDATE_INTERVAL / 60000) + ' 分钟）将自动重试');
                return false;
            }
        }
        return false;
    }

    function handleVersionInfo(info) {
        if (!info || !info.version) return;
        // 1) 版本更新横幅
        if (compareVersion(info.version, VERSION) > 0) {
            var dismissed = loadSetting(S_UPDATE_DISMISSED, '');
            if (dismissed !== info.version) showUpdateBanner(info);
        }
        // 2) 主动公告（独立于版本，即使版本没变也能推）
        if (info.announcement && info.announcement.id) {
            var seen = loadSetting(S_LAST_ANNOUNCE, '');
            var seenVer = loadSetting(S_LAST_ANNOUNCE_VER, '');
            var hasNewVersion = compareVersion(info.version, VERSION) > 0;
            // 首次未见 或 发布了新版本（与上次见到公告时的版本不同）→ 重新提示。
            // 这样蓝色公告像红色版本更新一样，每次发版都会弹出，避免「看过一次就再也弹不出」的错觉。
            if (info.announcement.id !== seen || (hasNewVersion && seenVer !== info.version)) {
                showAnnounceBanner(info.announcement);
                persist(S_LAST_ANNOUNCE, info.announcement.id);
                persist(S_LAST_ANNOUNCE_VER, info.version);
            }
        }
    }

    // 更新成功通知：加载时若本机版本与「上次记录版本」不同，升级则提示「已更新到 vX」并展示摘要
    function notifyIfUpdated() {
        var last = loadSetting(S_LAST_SEEN_VERSION, '');
        if (!last) { persist(S_LAST_SEEN_VERSION, VERSION); return; } // 首次运行不提示
        if (compareVersion(VERSION, last) !== 0) {
            if (compareVersion(VERSION, last) > 0) {
                try { toast('QiAct 已更新到 v' + VERSION, '#46E0A0'); } catch (_) {}
                // 轻量拉取本次更新摘要，用公告横幅补充展示（失败不影响已显示的 toast）
                fetchVersionJson(VERSION_INFO_URL, 0).then(function (info) {
                    if (info && Array.isArray(info.summary) && info.summary.length) {
                        showAnnounceBanner({ id: 'updated-' + VERSION, title: '已更新到 v' + VERSION, severity: 'available', message: info.summary.join('\n'), detailsUrl: info.detailsUrl });
                    }
                }).catch(function () {});
            }
            persist(S_LAST_SEEN_VERSION, VERSION); // 降级也静默记录，保证后续升级能正确提示
        }
    }

    function startUpdateChecker() {
        if (state.updateTimer) return; // 防重复启动（热重载/多次 init）
        state.updateTimer = setInterval(function () {
            checkUpdate().catch(function (e) { console.warn('[QiAct] 更新检查失败（已忽略）:', e && e.message); });
        }, UPDATE_INTERVAL);
        // 加载后首查（首查延后，避免与初始化抢资源）
        setTimeout(function () {
            checkUpdate().catch(function (e) { console.warn('[QiAct] 更新检查失败（已忽略）:', e && e.message); });
        }, UPDATE_FIRST_DELAY);
    }

    function getUpdateBannerEl() {
        return document.getElementById('xsact-update-banner');
    }

    function hideUpdateBanner() {
        var el = getUpdateBannerEl();
        if (el) { el.style.display = 'none'; el.innerHTML = ''; el.className = 'xsact-update-banner'; }
        state.pendingBanner = null;
    }

    function renderPendingBanner() {
        if (!state.pendingBanner) return;
        if (state.pendingBanner.type === 'update') showUpdateBanner(state.pendingBanner.data, true);
        else showAnnounceBanner(state.pendingBanner.data, true);
    }

    function showUpdateBanner(info, isRestore) {
        var el = getUpdateBannerEl();
        if (!el) { state.pendingBanner = { type: 'update', data: info }; return; }
        var summary = (info.summary && info.summary.length) ? info.summary : [];
        var items = summary.slice(0, 4).map(function (s) { return '<li>' + escapeHtml(s) + '</li>'; }).join('');
        el.className = 'xsact-update-banner' + (info.severity === 'important' ? ' is-important' : '');
        el.innerHTML = '' +
            '<div class="xsact-ub-head"><span class="xsact-ub-tag">更新可用</span>' +
            '<span class="xsact-ub-ver">v' + escapeHtml(info.version) + '</span>' +
            '<button class="xsact-ub-close" id="xsact-ub-close" title="稍后提醒" data-tooltip-type="danger">×</button></div>' +
            (items ? '<ul class="xsact-ub-sum">' + items + '</ul>' : '') +
            '<div class="xsact-ub-actions">' +
            (info.detailsUrl ? '<button class="xsact-ub-btn xsact-ub-primary" id="xsact-ub-details">查看详情</button>' : '') +
            '<button class="xsact-ub-btn" id="xsact-ub-later">稍后</button>' +
            '<button class="xsact-ub-btn" id="xsact-ub-ignore">不再提示此版本</button>' +
            '</div>';
        el.style.display = '';
        var close = el.querySelector('#xsact-ub-close');
        var later = el.querySelector('#xsact-ub-later');
        var ignore = el.querySelector('#xsact-ub-ignore');
        var details = el.querySelector('#xsact-ub-details');
        if (close) close.onclick = function () { hideUpdateBanner(); };
        if (later) later.onclick = function () { hideUpdateBanner(); persist(S_UPDATE_DISMISSED, info.version); };
        if (ignore) ignore.onclick = function () { hideUpdateBanner(); persist(S_UPDATE_DISMISSED, info.version); };
        if (details && info.detailsUrl) details.onclick = function () { window.open(info.detailsUrl, '_blank', 'noopener'); };
    }

    function showAnnounceBanner(ann, isRestore) {
        var el = getUpdateBannerEl();
        if (!el) { state.pendingBanner = { type: 'announce', data: ann }; return; }
        var sev = ann.severity || 'info';
        var tagText = '公告';
        var cls = 'xsact-update-banner';
        if (sev === 'important') { cls += ' is-important'; tagText = '重要'; }
        else if (sev === 'available') { cls += ' is-available'; tagText = '可用'; }
        else { cls += ' is-announce'; tagText = '公告'; }
        el.className = cls;
        el.innerHTML = '' +
            '<div class="xsact-ub-head"><span class="xsact-ub-tag">' + escapeHtml(tagText) + '</span>' +
            (ann.title ? '<span class="xsact-ub-title">' + escapeHtml(ann.title) + '</span>' : '') +
            '<button class="xsact-ub-close" id="xsact-ub-close" title="知道了" data-tooltip-type="danger">×</button></div>' +
            (ann.message ? '<div class="xsact-ub-msg">' + escapeHtml(ann.message) + '</div>' : '') +
            (ann.detailsUrl ? '<div class="xsact-ub-actions"><button class="xsact-ub-btn xsact-ub-primary" id="xsact-ub-details">查看详情</button></div>' : '');
        el.style.display = '';
        var close = el.querySelector('#xsact-ub-close');
        var details = el.querySelector('#xsact-ub-details');
        if (close) close.onclick = function () { hideUpdateBanner(); };
        if (details && ann.detailsUrl) details.onclick = function () { window.open(ann.detailsUrl, '_blank', 'noopener'); };
    }

    // ════════════════════════════════════════════════════════════════════════
    // 初始化入口
    // ════════════════════════════════════════════════════════════════════════


    /* ===== 15. 启动与初始化 ===== */
    async function main() {
        logD('v' + VERSION + ' 初始化...');

        // 热重注入（CDP 反复注入测试）场景：若上一轮实例仍挂在 window.__QiAct，
        // 先卸载其 bcModSdk 注册，避免 "it is already loaded" 导致本次 registerMod 失败、
        // 进而 setupHooks 拿不到 modApi（降级成空对象）→ 面板/动作列表无法渲染。
        try {
            if (window.__QiAct && window.__QiAct.state && window.__QiAct.state.modApi &&
                typeof window.__QiAct.state.modApi.unload === 'function') {
                window.__QiAct.state.modApi.unload();
            }
        } catch (_) { /* 卸载旧实例失败不阻塞本次启动 */ }

        // Phase 1: 等 bcModSdk
        await waitFor(function() { return typeof bcModSdk !== 'undefined'; });

        // 注册 mod（允许重复注册时复用）
        try {
            state.modApi = bcModSdk.registerMod({
                name: '快捷互动',
                fullName: 'Quick Action Launcher',
                version: VERSION,
                repository: '统一动作操作台'
            }, { allowReplace: true }); // allowReplace：支持 CDP 反复注入测试时干净替换旧实例
            logD('state.modApi 注册完成');
        } catch (regErr) {
            // 已注册过（热重注入场景）：尝试从已有 mods 中取回
            console.warn('[QiAct] registerMod 异常（可能已注册）:', regErr.message);
            try {
                var mods = bcModSdk.getModsInfo ? bcModSdk.getModsInfo() : [];
                for (var mi = 0; mi < mods.length; mi++) {
                    if (mods[mi].name === '快捷互动') { state.modApi = mods[mi]; break; }
                }
            } catch (_) { /* 忽略：取回已注册 mod 失败则降级为空对象继续运行 */ }
            if (!state.modApi) state.modApi = {}; // 降级：无 state.modApi 但继续运行
        }

        // Phase 2: 等玩家登入
        await waitFor(function() {
            try { return Player && typeof Player.MemberNumber === 'number'; }
            catch (_) { return false; }
        });
        logD('玩家已登入:', Player.AccountName || Player.Name);

        // 修补 ActivityDictionaryText（LSCG 等 mod 文本解析兜底，详见 patchActivityDictionaryText 注释）
        try { patchActivityDictionaryText(); } catch (e) { console.warn('[QiAct] patchActivityDictionaryText 失败:', e); }

        // 加载存储
        state.isActive = loadSetting(S_ENABLED, false);
        state.selfModeActive = loadSetting(S_SELF, false);
        state.favorites = loadSetting(S_FAVS, []);
        migrateFavorites(); // 旧版纯动作名 → 部位复合键（一次性迁移）
        state.presets = loadSetting(S_PRESETS, []);
        state.lastAction = loadStorage(S_LAST, null);
        state.combos = loadSetting(S_COMBOS, []);
        loadCustomActions();
        state.xiaosuPack = loadSetting(S_XIAOSU_PACK, true);
        // 「我的动作」分类 chip 过滤：caFilter 是受控枚举字符串，
        // 走通用 loadSetting 会触发 loadStorage 的 JSON.parse（对裸字符串抛 SyntaxError）污染控制台。
        // 这里直接用白名单 + 静默 try/catch 兜底，避免控制台噪声。
        (function() {
            var VALID = { all: 1, xiaosu: 1, native: 1, echo: 1 };
            var v;
            try { v = localStorage.getItem(S_CA_FILTER); if (v) v = JSON.parse(v); } catch (e) { v = undefined; }
            if (typeof v !== 'string' || !VALID[v]) {
                try {
                    var sv = loadFromServer(S_CA_FILTER, undefined);
                    v = (typeof sv === 'string' && VALID[sv]) ? sv : 'all';
                } catch (e) { v = 'all'; }
            }
            state.caFilter = v;
        })();
        syncXiaosuPack(); // 合并内置「小酥动作包」到 customActions（幂等，默认开启）
        registerAllCustomActions(); // 重新注册已存自定义动作 + 内置包到 BC，使本会话内可执行

        // 恢复主题设置（优先读游戏账号，回退本地）
        state.theme = loadSetting(S_THEME, 'dark');
        applyTheme(state.theme);

        // 注入样式
        try { injectStyles(); } catch (e) { console.warn('[QiAct] injectStyles 失败:', e); }

        // 自定义 tooltip（替换原生 title，仅作用于本插件 UI）
        try { initTooltip(); } catch (e) { console.warn('[QiAct] initTooltip 失败:', e); }

        // 安装 hooks
        try { setupHooks(); } catch (e) { console.error('[QiAct] setupHooks 失败:', e); }

        // 若设置默认开启，且当前在聊天室，自动进入动作模式
        if (state.isActive && typeof CurrentScreen !== 'undefined' && CurrentScreen === 'ChatRoom') {
            try { enterActionMode(); } catch (e) { console.warn('[QiAct] 自动进入动作模式失败:', e); }
        }

        // 聊天室内确保浮动开关（闪电图标）常驻可见；用轮询守卫，离开/回到聊天室都能正确恢复
        if (typeof CurrentScreen !== 'undefined') {
            try { startVisibilityGuard(); guardToggleVisibility(); } catch (e) { console.warn('[QiAct] 启动浮动开关守卫失败:', e); }
        }

        // 启动更新/公告检测（脚本内 5 分钟轮询，玩家端收到，无需刷新页面）
        try { startUpdateChecker(); } catch (e) { console.warn('[QiAct] 启动更新检测失败:', e); }
        // 更新成功通知：若本机版本高于上次记录，提示「已更新到 vX」（加载即触发，不依赖轮询）
        try { notifyIfUpdated(); } catch (e) { console.warn('[QiAct] 更新成功通知失败:', e); }

        // 暴露调试/控制接口（无论前面是否出错，必须暴露）
        window.__QiAct = {
            toggle: toggleActionMode,
            enter: enterActionMode,
            exit: exitActionMode,
            getLayout: getCharLayout,
            refreshGrids: refreshBodyGrids,
            selectPart: selectTargetAndPart,
            setMode: setPanelMode,
            getCombos: function() { return state.combos.slice(); },
            addCombo: addCombo,
            deleteCombo: deleteCombo,
            addComboItem: addComboItem,
            removeComboItem: removeComboItem,
            startEditCombo: startEditCombo,
            stopEditCombo: stopEditCombo,
            runCombo: runComboOnTarget,
            runComboAll: runComboAll,
            isActive: function() { return state.isActive; },
            get panelMode() { return state.panelMode; },
            get allModeActive() { return state.allModeActive; },
            get favModeActive() { return state.favModeActive; },
            get selfModeActive() { return state.selfModeActive; },
            toggleAllMode: toggleAllMode,
            toggleFavMode: toggleFavMode,
            toggleSelfMode: toggleSelfMode,
            clearAllFavorites: clearAllFavorites,
            get favorites() { return state.favorites.slice(); },
            favKey: function(partGroup, name) { return partGroup + '|' + name; },
            // ── 自定义动作 / echo 屏蔽调试 ──
            state: state,
            getCustomActions: function() { return state.customActions.slice(); },
            getEchoData: caGetEchoData,
            getEchoSuppressed: function() { return Array.from(state.echoSuppressed); },
            importFromEcho: importCustomFromEcho,
            setXiaosuPack: setXiaosuPack,
            getXiaosuPack: function() { return !!state.xiaosuPack; },
            syncXiaosuPack: syncXiaosuPack,
            getCaFilter: function() { return state.caFilter; },
            setCaFilter: function(k) { var v = (k === 'xiaosu' || k === 'native' || k === 'echo' || k === 'all') ? k : 'all'; state.caFilter = v; try { persist(S_CA_FILTER, v); } catch (_) { silent(_, 'setCaFilter.persist'); } try { if (typeof updateCustomActionPanel === 'function' && state && state.actionPanelEl) updateCustomActionPanel(state._lastCharObj || null); } catch (_) { silent(_, 'setCaFilter.render'); } return v; },
            rebuildEchoSuppressed: rebuildEchoSuppressed,
            removeSuppressedEchoActivities: caRemoveSuppressedEchoActivities,
            cleanupEchoData: caCleanupEchoData,
            upsertCustom: upsertCustom,
            deleteCustom: deleteCustom,
            // 测试用：以新数组整体替换 customActions（清旧注册 + 重新注册 + 持久化）
            replaceCustomActions: function(arr) {
                try { if (Array.isArray(state.customActions)) state.customActions.slice().forEach(function(a) { try { caUnregister(a); } catch (_) { silent(_, 'caUnregister'); } }); } catch (_) { silent(_, 'replaceCustomActions'); }
                state.customActions = Array.isArray(arr) ? arr : [];
                registerAllCustomActions();
                saveCustomActions();
                return state.customActions.length;
            },
            getCustomActions: function() { return state.customActions.slice(); },
            caHash: caHash,
            caActivityName: caActivityName,
            caFindByActivityName: caFindByActivityName,
            caBuildActivityDef: caBuildActivityDef,
            caDetectSource: caDetectSource,
            updateActionPanel: updateActionPanel,
            getActionsForPart: getActionsForPart,
            isEchoSuppressed: caIsEchoSuppressed,
            // ── 主题切换 ──
            toggleTheme: toggleTheme,
            setTheme: function(id) { applyTheme(id); persist(S_THEME, id); return state.theme; },
            getTheme: function() { return state.theme; },
            get editingComboId() { return state.editingComboId; },
            get selectedTarget() { return state.selectedTarget; },
            get selectedPart() { return state.selectedPart; },
            makeActivityPacket: makeActivityPacket,
            findBestItemForActivityAsset: findBestItemForActivityAsset,
            version: VERSION,
            // ── 更新 / 公告 ──
            checkUpdate: checkUpdate,
            startUpdateChecker: startUpdateChecker,
            notifyIfUpdated: notifyIfUpdated,
            getUpdateErrorLog: getUpdateErrorLog,
            showUpdateBanner: showUpdateBanner,
            showAnnounceBanner: showAnnounceBanner,
            hideUpdateBanner: hideUpdateBanner
        };

        logD('✅ 初始化完成 · 版本 ' + VERSION);
    }

    // 启动
    main().catch(function(err) {
        console.error('[QiAct] 初始化失败:', err);
    });

})();


    /* ===== 22. 内置小酥动作包（XiaoSuActivity 动作预编译，离线可用） ===== */
    /* 由 tools/build-xiaosu-pack.mjs 从 XiaoSuActivity 仓库生成；原作 MIT 许可，作者 XiaoSu。
       动作以 QiAct_ 自定义动作形式内置，无需安装原版插件即可使用，且对原版停更/故障免疫。 */
    var XIAOSU_PACKED = [
    {"id":"xs_XSAct_眯眼","name":"眯眼","scope":"self","group":"ItemHead","dialog":"眯眼","dialogSelf":"{SourceCharacter}眯了眯眼.","createdAt":0,"source":"xiaosu","builtin":true,"xiaosuName":"XSAct_眯眼","visible":true},
    {"id":"xs_XSAct_眼神飘忽","name":"眼神飘忽","scope":"self","group":"ItemHead","dialog":"眼神飘忽","dialogSelf":"{SourceCharacter}眼神飘忽的左看右看.","createdAt":0,"source":"xiaosu","builtin":true,"xiaosuName":"XSAct_眼神飘忽","visible":true},
    {"id":"xs_XSAct_甩头发","name":"甩头发","scope":"self","group":"ItemHood","dialog":"甩头发","dialogSelf":"{SourceCharacter}甩动着头发.","createdAt":0,"source":"xiaosu","builtin":true,"xiaosuName":"XSAct_甩头发","visible":true},
    {"id":"xs_XSAct_大力甩头发","name":"大力甩头发","scope":"self","group":"ItemHood","dialog":"大力甩头发","dialogSelf":"{SourceCharacter}连连摇头，慌乱的甩动着头发.","createdAt":0,"source":"xiaosu","builtin":true,"xiaosuName":"XSAct_大力甩头发","visible":true},
    {"id":"xs_XSAct_轻抚发梢","name":"轻抚发梢","scope":"any","group":"ItemHood","dialog":"{SourceCharacter}轻柔抚动着{TargetCharacter}的头发.","dialogSelf":"{SourceCharacter}轻柔抚动着自己的头发.","createdAt":0,"source":"xiaosu","builtin":true,"xiaosuName":"XSAct_轻抚发梢","visible":true},
    {"id":"xs_XSAct_叼起头发","name":"叼起头发","scope":"any","group":"ItemHood","dialog":"{SourceCharacter}轻轻咬起{TargetCharacter}的头发.","dialogSelf":"{SourceCharacter}轻轻咬起自己的头发.","createdAt":0,"source":"xiaosu","builtin":true,"xiaosuName":"XSAct_叼起头发","visible":true},
    {"id":"xs_XSAct_嗅头发","name":"嗅头发","scope":"any","group":"ItemHood","dialog":"{SourceCharacter}在{TargetCharacter}的发间嗅着，鼻息弥漫着{TargetCharacter}的发香.","dialogSelf":"{SourceCharacter}撩起自己的头发轻轻嗅着.","createdAt":0,"source":"xiaosu","builtin":true,"xiaosuName":"XSAct_嗅头发","visible":true},
    {"id":"xs_XSAct_绕头发","name":"绕头发","scope":"any","group":"ItemHood","dialog":"{SourceCharacter}勾起一缕{TargetCharacter}的发丝，在指尖绕来绕去.","dialogSelf":"{SourceCharacter}勾起自己的一缕头发在指尖绕来绕去.","createdAt":0,"source":"xiaosu","builtin":true,"xiaosuName":"XSAct_绕头发","visible":true},
    {"id":"xs_XSAct_皱鼻子","name":"皱鼻子","scope":"self","group":"ItemNose","dialog":"皱鼻子","dialogSelf":"{SourceCharacter}皱了皱自己的鼻头.","createdAt":0,"source":"xiaosu","builtin":true,"xiaosuName":"XSAct_皱鼻子","visible":true},
    {"id":"xs_XSAct_打喷嚏","name":"打喷嚏","scope":"self","group":"ItemNose","dialog":"打喷嚏","dialogSelf":"{SourceCharacter}打了个喷嚏.","createdAt":0,"source":"xiaosu","builtin":true,"xiaosuName":"XSAct_打喷嚏","visible":true},
    {"id":"xs_XSAct_深呼吸","name":"深呼吸","scope":"self","group":"ItemNose","dialog":"深呼吸","dialogSelf":"{SourceCharacter}深深的吸了口气.","createdAt":0,"source":"xiaosu","builtin":true,"xiaosuName":"XSAct_深呼吸","visible":true},
    {"id":"xs_XSAct_低头","name":"低头","scope":"self","group":"ItemHood","dialog":"低头","dialogSelf":"{SourceCharacter}红润着脸蛋低头逃避.","createdAt":0,"source":"xiaosu","builtin":true,"xiaosuName":"XSAct_低头","visible":true},
    {"id":"xs_XSAct_恳求的摇头","name":"恳求的摇头","scope":"other","group":"ItemHead","dialog":"{SourceCharacter}对着{TargetCharacter}的方向恳求的摇头.","dialogSelf":"{SourceCharacter}对着{TargetCharacter}的方向恳求的摇头.","createdAt":0,"source":"xiaosu","builtin":true,"xiaosuName":"XSAct_恳求的摇头","visible":true},
    {"id":"xs_XSAct_恳求的看","name":"恳求的看","scope":"other","group":"ItemHead","dialog":"{SourceCharacter}汪着眼睛恳求的看着{TargetCharacter}.","dialogSelf":"{SourceCharacter}汪着眼睛恳求的看着{TargetCharacter}.","createdAt":0,"source":"xiaosu","builtin":true,"xiaosuName":"XSAct_恳求的看","visible":true},
    {"id":"xs_XSAct_内八夹腿","name":"内八夹腿","scope":"self","group":"ItemLegs","dialog":"内八夹腿","dialogSelf":"{SourceCharacter}通红的脸蛋忍耐着快感，大腿紧紧夹起来，摆出着内八的姿势，身体微微颤抖.","createdAt":0,"source":"xiaosu","builtin":true,"xiaosuName":"XSAct_内八夹腿","visible":true},
    {"id":"xs_XSAct_噘嘴","name":"噘嘴","scope":"self","group":"ItemMouth","dialog":"噘嘴","dialogSelf":"{SourceCharacter}有些不满的噘起嘴巴.","createdAt":0,"source":"xiaosu","builtin":true,"xiaosuName":"XSAct_噘嘴","visible":true},
    {"id":"xs_XSAct_抿住嘴巴","name":"抿住嘴巴","scope":"self","group":"ItemMouth","dialog":"抿住嘴巴","dialogSelf":"{SourceCharacter}抿住嘴巴.","createdAt":0,"source":"xiaosu","builtin":true,"xiaosuName":"XSAct_抿住嘴巴","visible":true},
    {"id":"xs_XSAct_瘪嘴","name":"瘪嘴","scope":"self","group":"ItemMouth","dialog":"瘪嘴","dialogSelf":"{SourceCharacter}瘪着嘴巴，一副委屈的样子.","createdAt":0,"source":"xiaosu","builtin":true,"xiaosuName":"XSAct_瘪嘴","visible":true},
    {"id":"xs_XSAct_坐直身体","name":"坐直身体","scope":"self","group":"ItemTorso","dialog":"坐直身体","dialogSelf":"{SourceCharacter}挺直了腰，坐直了身体.","createdAt":0,"source":"xiaosu","builtin":true,"xiaosuName":"XSAct_坐直身体","visible":true},
    {"id":"xs_XSAct_挺胸收腹","name":"挺胸收腹","scope":"self","group":"ItemBreast","dialog":"挺胸收腹","dialogSelf":"{SourceCharacter}挺起胸部，微收下巴，腹部用力收腰.","createdAt":0,"source":"xiaosu","builtin":true,"xiaosuName":"XSAct_挺胸收腹","visible":true},
    {"id":"xs_XSAct_站直身体","name":"站直身体","scope":"self","group":"ItemTorso","dialog":"站直身体","dialogSelf":"{SourceCharacter}挺胸收腹，努力绷紧小腿，站直了身体.","createdAt":0,"source":"xiaosu","builtin":true,"xiaosuName":"XSAct_站直身体","visible":true},
    {"id":"xs_XSAct_身体一颤","name":"身体一颤","scope":"self","group":"ItemTorso","dialog":"身体一颤","dialogSelf":"{SourceCharacter}的身体猛然颤抖了一下.","createdAt":0,"source":"xiaosu","builtin":true,"xiaosuName":"XSAct_身体一颤","visible":true},
    {"id":"xs_XSAct_活动大腿","name":"活动大腿","scope":"self","group":"ItemLegs","dialog":"活动大腿","dialogSelf":"{SourceCharacter}尝试活动了一下腿部.","createdAt":0,"source":"xiaosu","builtin":true,"xiaosuName":"XSAct_活动大腿","visible":true},
    {"id":"xs_XSAct_活动手臂","name":"活动手臂","scope":"self","group":"ItemArms","dialog":"活动手臂","dialogSelf":"{SourceCharacter}一边按摩一边活动着手臂.","createdAt":0,"source":"xiaosu","builtin":true,"xiaosuName":"XSAct_活动手臂","visible":true},
    {"id":"xs_XSAct_绷紧膝盖","name":"绷紧膝盖","scope":"self","group":"ItemLegs","dialog":"绷紧膝盖","dialogSelf":"{SourceCharacter}努力的绷紧膝盖，尽可能站的更直.","createdAt":0,"source":"xiaosu","builtin":true,"xiaosuName":"XSAct_绷紧膝盖","visible":true},
    {"id":"xs_XSAct_绷直脚踝","name":"绷直脚踝","scope":"self","group":"ItemBoots","dialog":"绷直脚踝","dialogSelf":"{SourceCharacter}不自觉的用力绷直脚踝，释放涌来的快感.","createdAt":0,"source":"xiaosu","builtin":true,"xiaosuName":"XSAct_绷直脚踝","visible":true},
    {"id":"xs_XSAct_蜷缩脚趾","name":"蜷缩脚趾","scope":"self","group":"ItemBoots","dialog":"蜷缩脚趾","dialogSelf":"{SourceCharacter}脚趾互相纠结，又时而蜷缩，忍耐着快感袭来.","createdAt":0,"source":"xiaosu","builtin":true,"xiaosuName":"XSAct_蜷缩脚趾","visible":true},
    {"id":"xs_XSAct_踮脚","name":"踮脚","scope":"self","group":"ItemBoots","dialog":"踮脚","dialogSelf":"{SourceCharacter}努力的踮起脚.","createdAt":0,"source":"xiaosu","builtin":true,"xiaosuName":"XSAct_踮脚","visible":true},
    {"id":"xs_XSAct_兴奋的伸出舌头","name":"兴奋的伸出舌头","scope":"self","group":"ItemMouth","dialog":"兴奋的伸出舌头","dialogSelf":"{SourceCharacter}兴奋的伸出舌头.}","createdAt":0,"source":"xiaosu","builtin":true,"xiaosuName":"XSAct_兴奋的伸出舌头","visible":true},
    {"id":"xs_XSAct_兴奋的扭动","name":"兴奋的扭动","scope":"self","group":"ItemTorso","dialog":"兴奋的扭动","dialogSelf":"{SourceCharacter}兴奋的扭动着身体.","createdAt":0,"source":"xiaosu","builtin":true,"xiaosuName":"XSAct_兴奋的扭动","visible":true},
    {"id":"xs_XSAct_呼吸平复","name":"呼吸平复","scope":"self","group":"ItemNose","dialog":"呼吸平复","dialogSelf":"{SourceCharacter}的呼吸渐渐平复.","createdAt":0,"source":"xiaosu","builtin":true,"xiaosuName":"XSAct_呼吸平复","visible":true},
    {"id":"xs_XSAct_呼吸紊乱","name":"呼吸紊乱","scope":"self","group":"ItemNose","dialog":"呼吸紊乱","dialogSelf":"{SourceCharacter}的呼吸渐渐紊乱起来，发出软软的鼻音.","createdAt":0,"source":"xiaosu","builtin":true,"xiaosuName":"XSAct_呼吸紊乱","visible":true},
    {"id":"xs_XSAct_嘟囔着想说什么","name":"嘟囔着想说什么","scope":"self","group":"ItemMouth","dialog":"嘟囔着想说什么","dialogSelf":"{SourceCharacter}嘟囔着想说什么.","createdAt":0,"source":"xiaosu","builtin":true,"xiaosuName":"XSAct_嘟囔着想说什么","visible":true},
    {"id":"xs_XSAct_失神的伸出舌头","name":"失神的伸出舌头","scope":"self","group":"ItemMouth","dialog":"失神的伸出舌头","dialogSelf":"{SourceCharacter}失神的伸出自己的舌头.","createdAt":0,"source":"xiaosu","builtin":true,"xiaosuName":"XSAct_失神的伸出舌头","visible":true},
    {"id":"xs_XSAct_慢慢伸出舌头","name":"慢慢伸出舌头","scope":"self","group":"ItemMouth","dialog":"慢慢伸出舌头","dialogSelf":"{SourceCharacter}慢慢的伸出了自己的舌头.","createdAt":0,"source":"xiaosu","builtin":true,"xiaosuName":"XSAct_慢慢伸出舌头","visible":true},
    {"id":"xs_XSAct_微微摇头","name":"微微摇头","scope":"self","group":"ItemHead","dialog":"微微摇头","dialogSelf":"{SourceCharacter}微微的摇了摇头.","createdAt":0,"source":"xiaosu","builtin":true,"xiaosuName":"XSAct_微微摇头","visible":true},
    {"id":"xs_XSAct_微微点头","name":"微微点头","scope":"self","group":"ItemHead","dialog":"微微点头","dialogSelf":"{SourceCharacter}微微的点了点头.","createdAt":0,"source":"xiaosu","builtin":true,"xiaosuName":"XSAct_微微点头","visible":true},
    {"id":"xs_XSAct_身体颤抖的摇头","name":"身体颤抖的摇头","scope":"self","group":"ItemHead","dialog":"身体颤抖的摇头","dialogSelf":"{SourceCharacter}浑身颤抖的摇了摇头.","createdAt":0,"source":"xiaosu","builtin":true,"xiaosuName":"XSAct_身体颤抖的摇头","visible":true},
    {"id":"xs_XSAct_身体颤抖的点头","name":"身体颤抖的点头","scope":"self","group":"ItemHead","dialog":"身体颤抖的点头","dialogSelf":"{SourceCharacter}浑身颤抖的点了点头.","createdAt":0,"source":"xiaosu","builtin":true,"xiaosuName":"XSAct_身体颤抖的点头","visible":true},
    {"id":"xs_XSAct_歪头疑惑","name":"歪头疑惑","scope":"self","group":"ItemNeck","dialog":"歪头疑惑","dialogSelf":"{SourceCharacter}歪着脑袋一副疑惑的样子.","createdAt":0,"source":"xiaosu","builtin":true,"xiaosuName":"XSAct_歪头疑惑","visible":true},
    {"id":"xs_XSAct_扭动身体","name":"扭动身体","scope":"self","group":"ItemTorso","dialog":"扭动身体","dialogSelf":"{SourceCharacter}扭动着身体.","createdAt":0,"source":"xiaosu","builtin":true,"xiaosuName":"XSAct_扭动身体","visible":true},
    {"id":"xs_XSAct_活动四肢","name":"活动四肢","scope":"other","group":"ItemArms","dialog":"活动四肢","dialogSelf":"{SourceCharacter}活动了下自己的四肢.","createdAt":0,"source":"xiaosu","builtin":true,"xiaosuName":"XSAct_活动四肢","visible":true},
    {"id":"xs_XSAct_看他","name":"看他","scope":"other","group":"ItemHead","dialog":"{SourceCharacter}看向了{TargetCharacter}.","dialogSelf":"{SourceCharacter}看向了{TargetCharacter}.","createdAt":0,"source":"xiaosu","builtin":true,"xiaosuName":"XSAct_看他","visible":true},
    {"id":"xs_XSAct_缩脖子","name":"缩脖子","scope":"self","group":"ItemNeck","dialog":"缩脖子","dialogSelf":"{SourceCharacter}缩了下自己的脖子.","createdAt":0,"source":"xiaosu","builtin":true,"xiaosuName":"XSAct_缩脖子","visible":true},
    {"id":"xs_XSAct_脸红喘气","name":"脸红喘气","scope":"self","group":"ItemMouth","dialog":"脸红喘气","dialogSelf":"{SourceCharacter}面色潮红的喘着气.","createdAt":0,"source":"xiaosu","builtin":true,"xiaosuName":"XSAct_脸红喘气","visible":true},
    {"id":"xs_XSAct_轻声喘气","name":"轻声喘气","scope":"self","group":"ItemMouth","dialog":"轻声喘气","dialogSelf":"{SourceCharacter}轻声喘着气.","createdAt":0,"source":"xiaosu","builtin":true,"xiaosuName":"XSAct_轻声喘气","visible":true},
    {"id":"xs_XSAct_跺脚","name":"跺脚","scope":"self","group":"ItemBoots","dialog":"跺脚","dialogSelf":"{SourceCharacter}跺了跺脚.","createdAt":0,"source":"xiaosu","builtin":true,"xiaosuName":"XSAct_跺脚","visible":true},
    {"id":"xs_XSAct_头蹭","name":"头蹭","scope":"other","group":"ItemHead","dialog":"{SourceCharacter}用自己的脑袋蹭了蹭{TargetCharacter}的头.","dialogSelf":"{SourceCharacter}用自己的脑袋蹭了蹭{TargetCharacter}的头.","createdAt":0,"source":"xiaosu","builtin":true,"xiaosuName":"XSAct_头蹭","visible":true},
    {"id":"xs_XSAct_脸蹭","name":"脸蹭","scope":"other","group":"ItemHead","dialog":"{SourceCharacter}用自己的脸颊蹭了蹭{TargetCharacter}的头.","dialogSelf":"{SourceCharacter}用自己的脸颊蹭了蹭{TargetCharacter}的头.","createdAt":0,"source":"xiaosu","builtin":true,"xiaosuName":"XSAct_脸蹭","visible":true},
    {"id":"xs_XSAct_鼻子蹭","name":"鼻子蹭","scope":"other","group":"ItemHead","dialog":"{SourceCharacter}用自己的鼻子蹭了蹭{TargetCharacter}的头.","dialogSelf":"{SourceCharacter}用自己的鼻子蹭了蹭{TargetCharacter}的头.","createdAt":0,"source":"xiaosu","builtin":true,"xiaosuName":"XSAct_鼻子蹭","visible":true},
    {"id":"xs_XSAct_埋怀里","name":"埋怀里","scope":"other","group":"ItemBreast","dialog":"{SourceCharacter}把脑袋埋在{TargetCharacter}的怀里.","dialogSelf":"{SourceCharacter}把脑袋埋在{TargetCharacter}的怀里.","createdAt":0,"source":"xiaosu","builtin":true,"xiaosuName":"XSAct_埋怀里","visible":true}
    ];
