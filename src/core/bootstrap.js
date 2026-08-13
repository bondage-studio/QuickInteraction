    /* ===== 启动、公开 API 与卸载 ===== */
    function disposeQuickInteraction() {
        if (state.disposed) return;
        state.disposed = true;
        state.isActive = false;

        try { clearBodyGrids(); } catch (_) { silent(_, 'dispose.clearBodyGrids'); }
        try {
            if (window.__QiAct_VisGuard) clearInterval(window.__QiAct_VisGuard);
            delete window.__QiAct_VisGuard;
        } catch (_) { silent(_, 'dispose.visibilityGuard'); }
        try { if (state.updateTimer) clearInterval(state.updateTimer); } catch (_) { silent(_, 'dispose.updateTimer'); }
        try { if (state.refreshInterval) clearInterval(state.refreshInterval); } catch (_) { silent(_, 'dispose.refreshInterval'); }
        state.updateTimer = null;
        state.refreshInterval = null;

        try {
            if (Array.isArray(state.customActions)) {
                state.customActions.slice().forEach(function(action) {
                    try { caUnregister(action); } catch (_) { silent(_, 'dispose.caUnregister'); }
                });
            }
        } catch (_) { silent(_, 'dispose.customActions'); }

        try {
            var crb = window.Liko && window.Liko.__Sys_ChatRoomButtons__;
            if (crb && typeof crb.remove === 'function') crb.remove('quick-interaction');
            var pending = window.Liko && window.Liko.__CRB_pending__;
            if (Array.isArray(pending)) {
                window.Liko.__CRB_pending__ = pending.filter(function(item) { return !item || item.id !== 'quick-interaction'; });
            }
        } catch (_) { silent(_, 'dispose.chatRoomButton'); }

        try { if (state.modApi && typeof state.modApi.unload === 'function') state.modApi.unload(); }
        catch (_) { silent(_, 'dispose.modApi'); }
        state.modApi = null;

        try {
            if (window.__QiAct_ADT_ORIGINAL) {
                window.ActivityDictionaryText = window.__QiAct_ADT_ORIGINAL;
                delete window.__QiAct_ADT_ORIGINAL;
            }
            delete window.__QiAct_ADT_PATCHED;
        } catch (_) { silent(_, 'dispose.activityDictionary'); }

        document.querySelectorAll('#xsact-qa-panel, #xsact-qa-overlay, #xsact-toggle-btn, #xsact-chat-toggle-btn, #xsact-qa-styles, .xsact-tooltip, .xsact-update-banner, .xsact-part-btn').forEach(function(element) {
            try { element.remove(); } catch (_) { silent(_, 'dispose.dom'); }
        });
        state.actionPanelEl = null;
        state.toggleBtnEl = null;
        state.chatToggleBtnEl = null;

        try { if (runtime && typeof runtime.dispose === 'function') runtime.dispose(); }
        catch (_) { silent(_, 'dispose.runtime'); }

        delete window.__qiactTooltipReady;
        window.__QiAct_Loaded__ = false;
        if (window.__QiAct && window.__QiAct.state === state) delete window.__QiAct;
        if (window.__QiActRuntimeHost === runtime) delete window.__QiActRuntimeHost;
    }

    async function main() {
        logD('v' + VERSION + ' 初始化...');

        // Phase 1: 等 bcModSdk
        await waitFor(function() { return typeof bcModSdk !== 'undefined'; });
        if (state.disposed || (runtime && runtime.disposed)) return;

        // 注册 mod（允许重复注册时复用）
        try {
            state.modApi = bcModSdk.registerMod({
                name: '快捷互动',
                fullName: 'Quick Action Launcher',
                version: VERSION,
                repository: 'https://github.com/bondage-studio/QuickInteraction'
            }, { allowReplace: true }); // allowReplace：支持 CDP 反复注入测试时干净替换旧实例
            logD('state.modApi 注册完成');
        } catch (regErr) {
            // getModsInfo() 只回傳描述資料，不是可用的 ModAPI；沒有 API 就不能安全安裝 hook。
            console.error('[QiAct] registerMod 失败，停止初始化:', regErr);
            return;
        }

        // Phase 2: 等玩家登入
        await waitForLogin();
        if (state.disposed || (runtime && runtime.disposed)) return;
        logD('玩家已登入:', Player.AccountName || Player.Name);

        // 修补 ActivityDictionaryText（LSCG 等 mod 文本解析兜底，详见 patchActivityDictionaryText 注释）
        try { patchActivityDictionaryText(); } catch (e) { console.warn('[QiAct] patchActivityDictionaryText 失败:', e); }

        // 加载存储
        state.isActive = loadSetting(S_ENABLED, false);
        state.selfModeActive = loadSetting(S_SELF, false);
        state.interactionGridActive = loadSetting(S_INTERACTION_GRID, true) !== false;
        state.charPopoverRight = loadSetting(S_CHAR_POPOVER_RIGHT, false) === true;
        state.actionDelay = normalizeActionDelay(loadSetting(S_ACTION_DELAY, 500));
        state.actionSkipMembers = parseActionSkipMembers(loadSetting(S_ACTION_SKIP_MEMBERS, []));
        state.actionAllowMembers = parseActionSkipMembers(loadSetting(S_ACTION_ALLOW_MEMBERS, []));
        state.actionAllowGroups = (loadSetting(S_ACTION_ALLOW_GROUPS, []) || []).filter(function(group) { return ['owner','lover','sub','whitelist','friend'].indexOf(group) >= 0; });
        var allTargetScope = loadSetting(S_ALL_TARGET_SCOPE, 'all');
        state.allTargetScope = ['all','allow','skip'].indexOf(allTargetScope) >= 0 ? allTargetScope : 'all';
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
        state.floatingButtonVisible = loadSetting(S_FLOATING_BUTTON, true) !== false;
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
            dispose: disposeQuickInteraction,
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
            // ── 语言切换 ──
            setLanguage: function(code) {
                if (typeof QiActI18n !== 'undefined' && QiActI18n.setLang) QiActI18n.setLang(code);
                if (typeof rebuildPanel === 'function') rebuildPanel();
                return (typeof QiActI18n !== 'undefined' && QiActI18n.getCurrentLang) ? QiActI18n.getCurrentLang() : null;
            },
            getCurrentLang: function() { return (typeof QiActI18n !== 'undefined' && QiActI18n.getCurrentLang) ? QiActI18n.getCurrentLang() : null; },
            rebuildPanel: rebuildPanel,
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

    function waitForLogin() {
        try {
            if (typeof Player !== 'undefined' && Player && Player.MemberNumber !== undefined) return Promise.resolve();
        } catch (_) { /* 尚未建立 Player */ }
        return new Promise(function(resolve) {
            var removeHook = state.modApi.hookFunction('LoginResponse', 0, function(args, next) {
                var result = next(args);
                queueMicrotask(function() {
                    try {
                        if (typeof Player === 'undefined' || !Player || Player.MemberNumber === undefined) return;
                    } catch (_) { return; }
                    removeHook();
                    resolve();
                });
                return result;
            });
        });
    }

    // 启动
    main().catch(function(err) {
        console.error('[QiAct] 初始化失败:', err);
    });

})();
