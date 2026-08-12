    /* Custom action execution, import/export and bundled sources. */
    function runCustomAction(id, charObj) {
        var act = getCustom(id);
        if (!act) return;
        if (!charObj) { toast(QiActT('toast.pick_char'), '#FF5C5C'); return; }
        var name = caActivityName(act);
        var ok = executeAction(charObj, name, null, act.group);
        if (ok) toast(QiActT('toast.exec_custom', { name: act.name }), '#FF5C7A');
    }

    /** 从 echo/回声(echo-activity-ext) 导入动作数据 */
    function importCustomFromEcho() {
        try {
            var ext = Player && Player.ExtensionSettings;
            if (!ext) { toast(QiActT('toast.read_ext_failed'), '#FF5C5C'); return; }
            var echoKey = Object.keys(ext).find(function(k) { return k.indexOf('ECHO') === 0; });
            if (!echoKey || !ext[echoKey] || !ext[echoKey]['动作数据']) {
                toast(QiActT('toast.import_echo_notfound'), '#FF5C5C'); return;
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
                // 保留原生束缚前置条件（UseHands/UseMouth/UseFeet 等），否则被束缚时该露出限制的动作照样显示。
                // 优先取 echo 存档里的 Prerequisite；缺失则从现存活动定义按真实名查回。
                var prerequisite = caResolveEchoPrerequisite(item, foundRawNames);

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
                    existing.prerequisite = prerequisite;
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
                        prerequisite: prerequisite, // 原生束缚前置条件，供 caBuildActivityDef 还原限制
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
            toast(QiActT('toast.imported_echo', { n: imported }), '#46E0A0');
        } catch (e) {
            console.warn('[QiAct] 导入 echo/回声 动作失败:', e.message);
            toast(QiActT('toast.import_failed', { msg: e.message }), '#FF5C5C');
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
        if (!state.xiaosuPack && state.caFilter === 'xiaosu') { state.caFilter = 'all'; persist(S_CA_FILTER, 'all'); }
        persist(S_XIAOSU_PACK, state.xiaosuPack);
        syncXiaosuPack();
        registerAllCustomActions();
        saveCustomActions();
        if (state.panelMode === 'custom') updateCustomActionPanel(state.selectedTarget);
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
            toast(QiActT('toast.exported', { n: state.customActions.length }), '#46E0A0');
        } catch (e) {
            console.warn('[QiAct] 导出自定义动作失败:', e.message);
            toast(QiActT('toast.export_failed', { msg: e.message }), '#FF5C5C');
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
                    if (!Array.isArray(arr)) { toast(QiActT('toast.file_format_err'), '#FF5C5C'); return; }
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
                    toast(QiActT('toast.import_done', { n: imported, m: updated }), '#46E0A0');
                } catch (inner) {
                    console.warn('[QiAct] 解析 JSON 失败:', inner.message);
                    toast(QiActT('toast.json_parse_failed', { msg: inner.message }), '#FF5C5C');
                }
            };
            reader.onerror = function() { toast(QiActT('toast.read_file_failed'), '#FF5C5C'); };
            reader.readAsText(file);
        } catch (e) {
            console.warn('[QiAct] 导入本地文件失败:', e.message);
            toast(QiActT('toast.import_failed', { msg: e.message }), '#FF5C5C');
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
