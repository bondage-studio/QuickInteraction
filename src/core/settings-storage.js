    const ECHO_SETTINGS_KEY = 'ECHO动作拓展';
    const QI_ACTION_SOURCES = { act_qi: 'native', act_echo: 'echo', act_xs: 'xiaosu' };
    const ACCOUNT_UPDATE_LIMIT = 180000;

    function loadStorage(key, fallback) {
        try { var value = localStorage.getItem(key); return value === null ? fallback : JSON.parse(value); }
        catch (e) { console.error('[QiAct] 读取存储失败 ' + key + ':', e); return fallback; }
    }
    function saveStorage(key, value) {
        try { localStorage.setItem(key, JSON.stringify(value)); }
        catch (e) { console.error('[QiAct] 写入存储失败 ' + key + ':', e); }
    }

    // Snapshot and validate every packet before sending any of them. R132 ServerSend
    // rate-limits messages without merging them like AccountUpdater does.
    function sendAccountUpdates(updates) {
        if (!updates.length) return;
        if (typeof Player === 'undefined' || !Player || Player.CharacterID === '') throw new Error('Player is not logged in');
        if (typeof ServerSend !== 'function') throw new Error('AccountUpdate transport is unavailable');
        var packets = updates.map(function(data) {
            var snapshot = JSON.parse(JSON.stringify(data));
            var bytes = new TextEncoder().encode(JSON.stringify(['AccountUpdate', snapshot])).length;
            if (bytes > ACCOUNT_UPDATE_LIMIT) throw new Error('AccountUpdate exceeds 180K (' + bytes + ' bytes); data retained locally');
            return snapshot;
        });
        packets.forEach(function(data) { ServerSend('AccountUpdate', data); });
    }
    function syncExtensionField(namespace, path, value) {
        var data = {};
        data['ExtensionSettings.' + namespace + '.' + path] = value;
        sendAccountUpdates([data]);
    }
    function qiStoreUpdates(previous, next) {
        var updates = [];
        ['QiSettings', 'QiAction'].forEach(function(section) {
            Object.keys(next[section]).forEach(function(key) {
                if (key.indexOf('.') !== -1 || key.indexOf('$') !== -1) throw new Error('Invalid settings key: ' + key);
                if (previous && previous[section] && JSON.stringify(previous[section][key]) === JSON.stringify(next[section][key])) return;
                var data = {};
                data['ExtensionSettings.' + MOD_NS + '.' + section + '.' + key] = next[section][key];
                updates.push(data);
            });
        });
        return updates;
    }
    function splitQiActions(actions) {
        var groups = { act_qi: [], act_echo: [], act_xs: [] };
        (Array.isArray(actions) ? actions : []).forEach(function(action) {
            if (!action) return;
            groups[action.source === 'echo' ? 'act_echo' : action.source === 'xiaosu' ? 'act_xs' : 'act_qi'].push(action);
        });
        return groups;
    }
    function getServerStore() {
        try {
            if (typeof Player === 'undefined' || !Player || Player.CharacterID === '') return null;
            if (!Player.ExtensionSettings) Player.ExtensionSettings = {};
            return migrateLegacyServerSettings();
        } catch (e) { warnServerSync(e); return null; }
    }
    function persist(key, value) {
        saveStorage(key, value);
        var store = getServerStore();
        if (!store) return;
        try {
            // Store and UI values must not alias, or in-place edits evade the diff.
            value = JSON.parse(JSON.stringify(value));
            var next = { QiSettings: Object.assign({}, store.QiSettings), QiAction: Object.assign({}, store.QiAction) };
            if (key === S_CUSTOM) Object.assign(next.QiAction, splitQiActions(value));
            else next.QiSettings[key] = value;
            sendAccountUpdates(qiStoreUpdates(store, next));
            Object.assign(store, next);
        } catch (e) { warnServerSync(e); }
    }
    function loadSetting(key, fallback) {
        var store = getServerStore();
        if (!store) return loadStorage(key, fallback);
        var value = key === S_CUSTOM
            ? Object.keys(QI_ACTION_SOURCES).flatMap(function(bucket) { return store.QiAction[bucket]; })
            : store.QiSettings[key];
        return value === undefined ? loadStorage(key, fallback) : JSON.parse(JSON.stringify(value));
    }
