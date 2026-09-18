    function migrateLegacyServerSettings() {
        var legacy = Player.OnlineSettings && Player.OnlineSettings.ExtensionSettings;
        if (!legacy || !Object.prototype.hasOwnProperty.call(legacy, MOD_NS)) return;
        // 同步器尚未就绪时保留旧容器，稍后读取设置时重试。
        if (typeof ServerAccountUpdate === 'undefined' || !ServerAccountUpdate || typeof ServerAccountUpdate.QueueData !== 'function') return;
        try {
            // 删除整个旧容器前保留所有命名空间；新位置已有的设置优先。
            Object.keys(legacy).forEach(function(namespace) {
                var previous = legacy[namespace];
                var current = Player.ExtensionSettings[namespace];
                if (!Object.prototype.hasOwnProperty.call(Player.ExtensionSettings, namespace)) {
                    Object.defineProperty(Player.ExtensionSettings, namespace, { value: previous, writable: true, enumerable: true, configurable: true });
                } else if (previous && current && typeof previous === 'object' && typeof current === 'object' && !Array.isArray(previous) && !Array.isArray(current)) {
                    Player.ExtensionSettings[namespace] = Object.assign({}, previous, current);
                }
            });
            ServerAccountUpdate.QueueData({ ExtensionSettings: Player.ExtensionSettings });
            delete Player.OnlineSettings.ExtensionSettings;
            try {
                ServerAccountUpdate.QueueData({ OnlineSettings: Player.OnlineSettings }, true);
            } catch (e) {
                Player.OnlineSettings.ExtensionSettings = legacy;
                throw e;
            }
        } catch (e) { warnServerSync(e); }
    }
