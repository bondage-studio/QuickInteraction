/* Application context: constants, shared state and storage adapters. */
(function () {
    'use strict';

    // ════════════════════════════════════════════════════════════════════════
    // 防重复加载
    // ════════════════════════════════════════════════════════════════════════
    // 重复注入由 src/main.js 的模块化入口先执行 dispose；这里仅保留兼容标记。
    window.__QiAct_Loaded__ = true;

    const runtime = runtimeHost || window.__QiActRuntimeHost;
    function addRuntimeCleanup(cleanup) {
        return runtime && runtime.addCleanup ? runtime.addCleanup(cleanup) : cleanup;
    }
    function addRuntimeListener(target, type, listener, options) {
        if (runtime && runtime.listen) return runtime.listen(target, type, listener, options);
        target.addEventListener(type, listener, options);
        return listener;
    }

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
        if (!_serverSyncWarned) { _serverSyncWarned = true; toast(QiActT('toast.sync_failed'), '#FF5C5C'); }
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

    const VERSION = '1.4.3';

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
    const S_CHAT_BUTTON = 'xsact_qa_chat_button';
    const S_INTERACTION_GRID = 'xsact_qa_interaction_grid';
    const S_CHAR_POPOVER_RIGHT = 'xsact_qa_char_popover_right';
    const S_ACTION_DELAY = 'xsact_qa_action_delay';
    const S_ACTION_SKIP_MEMBERS = 'xsact_qa_action_skip_members';

    // ── 集中状态（单一数据源，消除散落全局变量）──
    const state = {
        disposed: false,              // 热移除后阻止异步续体重新建立 UI / timer
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
        toggleDragged: false,         // 本次按下闪电按钮是否已拖动
        chatButtonDocked: false
        ,favoritePartFilter: 'all'
        ,interactionGridActive: true
        ,charPopoverRight: false
        ,actionDelay: 500
        ,actionSkipMembers: []
        ,gridOverlapShifts: new Map()
        ,visibleGridMembers: new Set()
        ,screenLifecycleHooked: false
        ,bodyGridTopology: ''
    };

    function normalizeActionDelay(value) {
        var parsed = parseInt(value, 10);
        if (!Number.isFinite(parsed)) parsed = 500;
        return Math.max(100, Math.min(9999, parsed));
    }
    function parseActionSkipMembers(value) {
        var source = Array.isArray(value) ? value.join(',') : String(value || '');
        var seen = {};
        return source.split(/[^0-9]+/).map(function(token) { return parseInt(token, 10); }).filter(function(id) {
            if (!Number.isFinite(id) || id <= 0 || seen[id]) return false;
            seen[id] = true;
            return true;
        });
    }
    function isActionSkippedCharacter(character) {
        var id = character && parseInt(character.MemberNumber, 10);
        return Number.isFinite(id) && state.actionSkipMembers.indexOf(id) >= 0;
    }

    // ════════════════════════════════════════════════════════════════════════
    // 部位定义（BC Target_Group 映射）
    // ════════════════════════════════════════════════════════════════════════
    const BODY_PARTS = [
        { group: 'ItemHead', label: QiActT('part.ItemHead'), icon: '🗣' },
        { group: 'ItemNose', label: QiActT('part.ItemNose'), icon: '👃' },
        { group: 'ItemEars', label: QiActT('part.ItemEars'), icon: '👂' },
        { group: 'ItemHood', label: QiActT('part.ItemHood'), icon: '🎭' },
        { group: 'ItemMouth', label: QiActT('part.ItemMouth'), icon: '👄' },
        { group: 'ItemMouth2', label: QiActT('part.ItemMouth2'), icon: '👄' },
        { group: 'ItemMouth3', label: QiActT('part.ItemMouth3'), icon: '👄' },
        { group: 'ItemNeck', label: QiActT('part.ItemNeck'), icon: '🔗' },
        { group: 'ItemNeckAccessories', label: QiActT('part.ItemNeckAccessories'), icon: '🔗' },
        { group: 'ItemNeckRestraints', label: QiActT('part.ItemNeckRestraints'), icon: '🔗' },
        { group: 'ItemNipples', label: QiActT('part.ItemNipples'), icon: '☁' },
        { group: 'ItemNipplesPiercings', label: QiActT('part.ItemNipplesPiercings'), icon: '💎' },
        { group: 'ItemBreast', label: QiActT('part.ItemBreast'), icon: '🫂' },
        { group: 'ItemTorso', label: QiActT('part.ItemTorso'), icon: '👕' },
        { group: 'ItemTorso2', label: QiActT('part.ItemTorso2'), icon: '👕' },
        { group: 'ItemArms', label: QiActT('part.ItemArms'), icon: '💪' },
        { group: 'ItemHands', label: QiActT('part.ItemHands'), icon: '✋' },
        { group: 'ItemHandheld', label: QiActT('part.ItemHandheld'), icon: '✋' },
        { group: 'ItemPelvis', label: QiActT('part.ItemPelvis'), icon: '〰' },
        { group: 'ItemVulva', label: QiActT('part.ItemVulva'), icon: '🌸' },
        { group: 'ItemVulvaPiercings', label: QiActT('part.ItemVulvaPiercings'), icon: '💎' },
        { group: 'ItemButt', label: QiActT('part.ItemButt'), icon: '🍑' },
        { group: 'ItemLegs', label: QiActT('part.ItemLegs'), icon: '🦵' },
        { group: 'ItemFeet', label: QiActT('part.ItemFeet'), icon: '👢' },
        { group: 'ItemBoots', label: QiActT('part.ItemBoots'), icon: '🥾' },
    ];

    // 合成子部位 → 字典翻译主部位映射（BC 字典键只以主部位命名，如 ItemMouth2 查 Label-ChatOther-ItemMouth-*）
    const SUBPART_TO_BASE = {
        'ItemMouth2': 'ItemMouth',
        'ItemMouth3': 'ItemMouth',
        'ItemNeckAccessories': 'ItemNeck',
        'ItemNeckRestraints': 'ItemNeck',
        'ItemNipplesPiercings': 'ItemNipples',
        'ItemTorso2': 'ItemTorso',
        'ItemHandheld': 'ItemHands'
    };

    function canonicalPartGroup(group) { return SUBPART_TO_BASE[group] || group; }
    function getPartGroupFamily(group) {
        var canonical = canonicalPartGroup(group);
        var family = [];
        BODY_PARTS.forEach(function(part) {
            if (canonicalPartGroup(part.group) === canonical && family.indexOf(part.group) < 0) family.push(part.group);
        });
        if (family.indexOf(canonical) < 0) family.unshift(canonical);
        return family;
    }
    // Linked zones are a visual/favorite identity, not a request to run BC's expensive
    // availability resolver once for every physical slot. Handheld is the sole deliberate
    // exception because ItemHands also exposes a few distinct handheld activities.
    function getPartActionGroups(group) {
        var canonical = canonicalPartGroup(group);
        return canonical === 'ItemHands' ? ['ItemHands', 'ItemHandheld'] : [canonical];
    }
    // 部位名 → BC AssetGroup 对象（找不到时用最小占位）。
    function resolveFocusGroup(groupName) {
        if (typeof AssetGroup !== 'undefined' && Array.isArray(AssetGroup)) {
            var g = AssetGroup.find(function(x) { return x && x.Name === groupName; });
            if (g) return g;
        }
        return { Name: groupName };
    }
    // ActivityAllowedForGroup 包装：临时把角色 FocusGroup 设为查询部位再枚举。
    // LSCG 的 Give/Steal/Swap（交出/偷窃/交换物品）等 CustomPrereq 直接读
    // acted.FocusGroup.Name（要求聚焦在 ItemHandheld）。原生 UI 点击部位会设置该值，
    // 本插件直接枚举/发包不经过点击，必须手动补上——否则这些动作在 prereq 源头即被挡掉，
    // 显示端看不到、执行端预校验（findAllowedActivity）也会判不可用。发完立即还原。
    function activitiesAllowedForGroup(char, groupName) {
        if (!char || typeof ActivityAllowedForGroup !== 'function') return [];
        var prev = char.FocusGroup;
        try {
            char.FocusGroup = resolveFocusGroup(groupName);
            return ActivityAllowedForGroup(char, groupName) || [];
        } finally {
            char.FocusGroup = prev;
        }
    }
    function isSamePartFamily(a, b) { return canonicalPartGroup(a) === canonicalPartGroup(b); }
    function updatePartFamilySelection(container, selectedGroup, selector) {
        if (!container) return;
        container.querySelectorAll(selector || '[data-group]').forEach(function(element) {
            element.classList.toggle('selected', isSamePartFamily(element.dataset.group, selectedGroup));
        });
    }

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

    // 所有部位选择 UI 共用同一份几何资料；视觉层仅分为 DOM 直角热区与 SVG 圆角热区。
    var _bodyGeometryCache = {};
    function getBodyZoneGeometry(C) {
        var family = (C && C.AssetFamily) || (typeof Player !== 'undefined' && Player.AssetFamily) || 'Female3DCG';
        if (_bodyGeometryCache[family]) return _bodyGeometryCache[family];
        var geometry = [];
        BODY_PARTS.forEach(function(part) {
            var canonical = canonicalPartGroup(part.group);
            // Keep every physical BC zone, but expose aliases as one logical/canonical group.
            // Thus Mouth1-3 remain visible while all three select ItemMouth and share actions.
            getPartZones(C, part.group).forEach(function(zone) {
                geometry.push({ group: canonical, label: QiActT('part.' + canonical), x: zone[0], y: zone[1], width: zone[2], height: zone[3] });
            });
        });
        _bodyGeometryCache[family] = geometry;
        return geometry;
    }
    function buildBodyZoneSvg(C, selectedGroup, svgClass, radiusLimit, radiusScale) {
        var rects = getBodyZoneGeometry(C).map(function(zone) {
            var rx = Math.min(radiusLimit || 16, Math.min(zone.width, zone.height) * (radiusScale || 0.4));
            var selected = isSamePartFamily(selectedGroup, zone.group) ? ' selected' : '';
            return '<rect class="xsact-body-part-zone' + selected + '" data-group="' + zone.group +
                '" x="' + zone.x.toFixed(1) + '" y="' + zone.y.toFixed(1) + '" width="' + zone.width.toFixed(1) +
                '" height="' + zone.height.toFixed(1) + '" rx="' + rx.toFixed(1) + '" data-label="' + escapeHtml(QiActT('part.' + zone.group)) + '"/>';
        }).join('');
        return '<svg class="' + svgClass + '" viewBox="0 0 500 1000" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">' + rects + '</svg>';
    }
    var _bodyGridMarkupCache = {};
    function buildBodyGridMarkup(C) {
        var family = (C && C.AssetFamily) || 'Female3DCG';
        var language = (typeof QiActI18n !== 'undefined' && QiActI18n.getCurrentLang) ? QiActI18n.getCurrentLang() : 'default';
        var cacheKey = family + '|' + language;
        if (_bodyGridMarkupCache[cacheKey]) return _bodyGridMarkupCache[cacheKey];
        _bodyGridMarkupCache[cacheKey] = getBodyZoneGeometry(C).map(function(zone) {
            return '<button type="button" class="xsact-part-btn" data-group="' + zone.group + '" style="left:' +
                (zone.x / 5) + '%;top:' + (zone.y / 10) + '%;width:' + (zone.width / 5) + '%;height:' +
                (zone.height / 10) + '%" title="' + escapeHtml(QiActT('part.' + zone.group) + '（' + zone.group + '）') + '"></button>';
        }).join('');
        return _bodyGridMarkupCache[cacheKey];
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
        { id:'dark',  name: QiActT('ui.theme_dark'), base:'dark' },
        { id:'light', name: QiActT('ui.theme_light'), base:'light' }
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
        if (!needMigrate) {
            var normalized = state.favorites.map(function(key) {
                var p = key.indexOf('|');
                return p < 0 ? key : canonicalPartGroup(key.slice(0, p)) + key.slice(p);
            }).filter(function(key, i, arr) { return arr.indexOf(key) === i; });
            if (JSON.stringify(normalized) !== JSON.stringify(state.favorites)) { state.favorites = normalized; persist(S_FAVS, state.favorites); }
            return;
        }
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
                        var acts = activitiesAllowedForGroup(Player, g);
                        if (acts.some(function(a) { return a.Activity && a.Activity.Name === name; })) {
                            out.push(g + '|' + name);
                            expanded = true;
                        }
                    } catch (_) { /* 忽略单个部位枚举失败 */ }
                });
            }
            if (!expanded) out.push(name); // 兜底：无法展开则保留裸名
        });
        state.favorites = out.map(function(key) {
            var p = key.indexOf('|');
            return p < 0 ? key : canonicalPartGroup(key.slice(0, p)) + key.slice(p);
        }).filter(function(key, i, arr) { return arr.indexOf(key) === i; });
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
        toast(QiActT('ui.theme_switched', { theme: next === 'dark' ? QiActT('ui.theme_dark') : QiActT('ui.theme_light') }), accentColor());
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
