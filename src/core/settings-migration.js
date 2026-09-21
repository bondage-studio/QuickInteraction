    // Normalize only our namespace. Existing nested values, including empty arrays, win.
    var normalizedQiStores = new WeakSet();
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
                var source = QI_ACTION_SOURCES[key];
                actions[key] = key in actions ? migrateCustomActionRecords(actions[key], source) : split[key];
            });
            var previous = root;
            root = { QiSettings: settings, QiAction: actions };
            // A compressed string or flat legacy container must be initialized before dotted writes.
            var reset = typeof raw === 'string' || Object.keys(previous).some(function(key) { return key !== 'QiSettings' && key !== 'QiAction'; });
            var updates = qiStoreUpdates(reset ? null : previous, root);
            if (reset) { var clear = {}; clear['ExtensionSettings.' + MOD_NS] = {}; updates.unshift(clear); }
            // Failed sends leave the original container available for a full retry.
            sendAccountUpdates(updates);
            normalizedQiStores.add(root);
            Player.ExtensionSettings[MOD_NS] = root;
        }
        try {
            // Remove only the migrated QiAct entry; unrelated namespaces remain untouched.
            if (legacy && typeof ServerSend === 'function') {
                var online = Object.assign({}, Player.OnlineSettings, { ExtensionSettings: Object.assign({}, legacyContainer) });
                delete online.ExtensionSettings[MOD_NS];
                sendAccountUpdates([{ OnlineSettings: online }]);
                delete legacyContainer[MOD_NS];
            }
        } catch (e) { warnServerSync(e); }
        return root;
    }

    // Expand old bare names, normalize part aliases, and retain unresolved names.
    function migrateFavorites() {
        var previous = state.favorites;
        var normalized = [];
        (Array.isArray(previous) ? previous : []).forEach(function(key) {
            if (typeof key !== 'string') return;
            var separator = key.indexOf('|');
            if (separator >= 0) {
                normalized.push(canonicalPartGroup(key.slice(0, separator)) + key.slice(separator));
                return;
            }
            var matches = [];
            if (typeof ActivityAllowedForGroup === 'function' && Player) {
                BODY_PARTS.forEach(function(part) {
                    try {
                        if (activitiesAllowedForGroup(Player, part.group).some(function(action) {
                            return action.Activity && action.Activity.Name === key;
                        })) matches.push(canonicalPartGroup(part.group) + '|' + key);
                    } catch (e) { silent(e, 'favorites.migrate'); }
                });
            }
            normalized.push.apply(normalized, matches.length ? matches : [key]);
        });
        state.favorites = Array.from(new Set(normalized));
        if (JSON.stringify(previous) !== JSON.stringify(state.favorites)) persist(S_FAVS, state.favorites);
    }

    // Upgrade action records before source-based partitioning; bucket source is authoritative.
    function migrateCustomActionRecords(records, source) {
        var echoNames = new Set();
        var ext = typeof Player !== 'undefined' && Player && Player.ExtensionSettings;
        var echoData = ext && ext[ECHO_SETTINGS_KEY] && ext[ECHO_SETTINGS_KEY]['动作数据'];
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

    function decodeQiStore(raw) {
        if (typeof raw === 'string') {
            try { raw = JSON.parse(raw); }
            catch (_) { raw = JSON.parse(LZString.decompressFromBase64(raw)); }
        }
        if (raw == null) return {};
        if (typeof raw !== 'object' || Array.isArray(raw)) throw new Error('Invalid QiAct settings');
        return raw;
    }
