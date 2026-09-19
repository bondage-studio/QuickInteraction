    // Normalize only our namespace. Existing nested values, including empty arrays, win.
    var normalizedQiStores = new WeakSet();
    var pendingQiMigrations = new WeakMap();
    function migrateLegacyServerSettings() {
        var raw = Player.ExtensionSettings[MOD_NS];
        var legacyContainer = Player.OnlineSettings && Player.OnlineSettings.ExtensionSettings;
        var legacy = legacyContainer && legacyContainer[MOD_NS];
        var root = decodeQiStore(raw);
        if (!normalizedQiStores.has(root)) {
            var old = legacy ? decodeQiStore(legacy) : {};
            var flat = Object.assign({}, old, root);
            var settings = Object.assign({}, old.QiSettings || {}, root.QiSettings || {});
            Object.keys(flat).forEach(function(key) {
                if (key !== 'QiSettings' && key !== 'QiAction' && key !== S_CUSTOM && !(key in settings)) settings[key] = flat[key];
            });
            // Local values are fallback only; do not overwrite account values.
            try {
                for (var i = 0; i < localStorage.length; i++) {
                    var key = localStorage.key(i);
                    if (key && key.indexOf('xsact_qa_') === 0 && key !== S_CUSTOM && !(key in settings)) {
                        var value = loadStorage(key, undefined);
                        if (value !== undefined) settings[key] = value;
                    }
                }
                if (!('QiActLang' in settings)) {
                    var language = localStorage.getItem('QiActLang');
                    if (language) {
                        try { language = JSON.parse(language); } catch (_) {}
                        settings.QiActLang = language;
                    }
                }
            } catch (_) { /* Local storage may be disabled. */ }
            var actions = Object.assign({}, old.QiAction || {}, root.QiAction || {});
            var split = splitQiActions(migrateCustomActionRecords(flat[S_CUSTOM] === undefined ? loadStorage(S_CUSTOM, []) : flat[S_CUSTOM]));
            Object.keys(split).forEach(function(key) {
                var source = key === 'act_echo' ? 'echo' : key === 'act_xs' ? 'xiaosu' : 'native';
                actions[key] = key in actions ? migrateCustomActionRecords(actions[key], source) : split[key];
            });
            var previous = root;
            root = { QiSettings: settings, QiAction: actions };
            // A compressed string or flat legacy container must be initialized before dotted writes.
            var reset = typeof raw === 'string' || Object.keys(previous).some(function(key) { return key !== 'QiSettings' && key !== 'QiAction'; });
            var updates = qiStoreUpdates(reset ? null : previous, root);
            if (reset) { var clear = {}; clear['ExtensionSettings.' + MOD_NS] = {}; updates.unshift(prepareAccountUpdate(clear)); }
            // Validate every packet before replacing anything locally or sending the reset.
            pendingQiMigrations.set(root, updates);
            normalizedQiStores.add(root);
            Player.ExtensionSettings[MOD_NS] = root;
        }
        try {
            var pending = pendingQiMigrations.get(root);
            if (pending) { pending.forEach(sendAccountUpdate); pendingQiMigrations.delete(root); }
            // Remove only the migrated QiAct entry; unrelated namespaces remain untouched.
            if (legacy && typeof ServerSend === 'function') {
                delete legacyContainer[MOD_NS];
                try { sendAccountUpdate({ OnlineSettings: Player.OnlineSettings }); }
                catch (e) { legacyContainer[MOD_NS] = legacy; throw e; }
            }
        } catch (e) { warnServerSync(e); }
        return root;
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


    // Upgrade action records before source-based partitioning; bucket source is authoritative.
    function migrateCustomActionRecords(records, source) {
        var echoNames = new Set();
        var ext = typeof Player !== 'undefined' && Player && Player.ExtensionSettings;
        var echoData = ext && ext['ECHO动作拓展'] && ext['ECHO动作拓展']['动作数据'];
        if (echoData && typeof echoData === 'object') Object.keys(echoData).forEach(function(key) {
            echoNames.add(key);
            if (echoData[key] && echoData[key].Name) echoNames.add(echoData[key].Name);
        });
        return (Array.isArray(records) ? records : []).filter(function(action) {
            return action && typeof action === 'object' && !Array.isArray(action);
        }).map(function(action) {
            var copy = Object.assign({}, action);
            if (typeof copy.visible !== 'boolean') copy.visible = true;
            copy.source = source || copy.source || (copy.echoName || echoNames.has(copy.name) ? 'echo' : copy.xiaosuName ? 'xiaosu' : 'native');
            return copy;
        });
    }
