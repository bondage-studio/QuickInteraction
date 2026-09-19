    function loadStorage(key, fallback) {
        try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
        catch (e) { console.error('[QiAct] 读取存储失败 ' + key + ':', e); return fallback; }
    }

    // R132's extension sync uses ServerSend directly. Send isolated dotted fields,
    // avoiding AccountUpdater's merge queue and the 180K AccountUpdate limit.
    function prepareAccountUpdate(data) {
        var snapshot = JSON.parse(JSON.stringify(data));
        var bytes = new TextEncoder().encode(JSON.stringify(['AccountUpdate', snapshot])).length;
        if (bytes > 180000) throw new Error('AccountUpdate exceeds 180K (' + bytes + ' bytes); data retained locally');
        return snapshot;
    }
    function sendAccountUpdate(data) {
        if (typeof Player === 'undefined' || !Player || Player.CharacterID === '') throw new Error('Player is not logged in');
        if (typeof ServerSend !== 'function') throw new Error('AccountUpdate transport is unavailable');
        ServerSend('AccountUpdate', prepareAccountUpdate(data));
    }
    function syncExtensionField(namespace, path, value) {
        var data = {};
        data['ExtensionSettings.' + namespace + (path ? '.' + path : '')] = value;
        sendAccountUpdate(data);
    }
    function qiStoreUpdates(previous, next) {
        var updates = [];
        ['QiSettings', 'QiAction'].forEach(function(section) {
            Object.keys(next[section]).forEach(function(key) {
                if (key.indexOf('.') !== -1 || key.indexOf('$') !== -1) throw new Error('Invalid settings key: ' + key);
                if (previous && previous[section] && JSON.stringify(previous[section][key]) === JSON.stringify(next[section][key])) return;
                var data = {};
                data['ExtensionSettings.' + MOD_NS + '.' + section + '.' + key] = next[section][key];
                updates.push(prepareAccountUpdate(data));
            });
        });
        return updates;
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
    function saveToServer(key, val) {
        var store = getServerStore();
        if (!store || pendingQiMigrations.has(store)) return;
        val = JSON.parse(JSON.stringify(val));
        var next = { QiSettings: Object.assign({}, store.QiSettings), QiAction: Object.assign({}, store.QiAction) };
        if (key === S_CUSTOM) Object.assign(next.QiAction, splitQiActions(val));
        else next.QiSettings[key] = val;
        try {
            var updates = qiStoreUpdates(store, next);
            updates.forEach(sendAccountUpdate);
            Object.assign(store.QiSettings, next.QiSettings);
            Object.assign(store.QiAction, next.QiAction);
        } catch (e) { warnServerSync(e); }
    }
    function loadFromServer(key, fallback) {
        var store = getServerStore();
        if (!store) return fallback;
        if (key === S_CUSTOM) {
            return ['act_qi', 'act_echo', 'act_xs'].flatMap(function(bucket) {
                var source = bucket === 'act_echo' ? 'echo' : bucket === 'act_xs' ? 'xiaosu' : 'native';
                return (store.QiAction[bucket] || []).map(function(action) { return Object.assign(JSON.parse(JSON.stringify(action)), { source: source }); });
            });
        }
        return Object.prototype.hasOwnProperty.call(store.QiSettings, key) ? JSON.parse(JSON.stringify(store.QiSettings[key])) : fallback;
    }
    function persist(key, val) { saveStorage(key, val); saveToServer(key, val); }
    function loadSetting(key, fallback) {
        var value = loadFromServer(key, undefined);
        return value === undefined ? loadStorage(key, fallback) : value;
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

