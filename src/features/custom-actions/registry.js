    /* ===== 自定义动作注册、储存与互通 ===== */
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
            // 有指定就沿用（echo 导入会带回原生 UseHands/UseMouth/UseFeet 等束缚前置条件），
            // 否则空数组＝不受限（小酥表情动作、用户自建动作默认无束缚门槛）。
            Prerequisite: Array.isArray(act.prerequisite) ? act.prerequisite.slice() : [],
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
    // 强制可用动作白名单（用户指定）：这些 echo 动作无视 BC 可用性/前置条件判定，始终显示且强制执行。
    // 收录简繁两种写法，按动作显示名精确匹配（显示名缺失时回退查自定义动作的 name）。
    var FORCE_AVAILABLE_ACTION_NAMES = [
        '流出液體', '流出液体',
        '失禁',
        '鑽進懷裡', '钻进怀里',
        '抱入懷中', '抱入怀中',
        '躺上去',
        '拉上床', '拉到床上'
    ];
    var _forceAvailableCache = Object.create(null);
    function isForceAvailableActivity(activityName, displayName) {
        try {
            var cacheKey = String(activityName || '') + '|' + String(displayName || '');
            if (Object.prototype.hasOwnProperty.call(_forceAvailableCache, cacheKey)) return _forceAvailableCache[cacheKey];
            // 多来源解析显示名：传入的 displayName、已导入自定义动作名、字典标签、原始活动名（可能内嵌中文）。
            // echo/sugarch 原始动作名（如「躺上去」或带前后缀）无 QiAct_ 记录，靠标签与原始名兜底。
            var cands = [];
            if (displayName) cands.push(String(displayName));
            var ca = caFindByActivityName(activityName);
            if (ca && ca.name) cands.push(String(ca.name));
            if (!displayName && typeof getActivityLabelFallback === 'function' && activityName) {
                var lbl = getActivityLabelFallback(activityName, '');
                if (lbl) cands.push(String(lbl));
            }
            if (activityName) cands.push(String(activityName));
            for (var c = 0; c < cands.length; c++) {
                var disp = cands[c].trim();
                if (!disp) continue;
                for (var i = 0; i < FORCE_AVAILABLE_ACTION_NAMES.length; i++) {
                    if (disp.indexOf(FORCE_AVAILABLE_ACTION_NAMES[i]) !== -1) return (_forceAvailableCache[cacheKey] = true); // 命中即强制可用
                }
            }
            return (_forceAvailableCache[cacheKey] = false);
        } catch (e) { return false; }
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
    /** 还原 echo 动作的束缚前置条件：优先取 echo 存档里的 Prerequisite，
     *  缺失则按真实注册名从现存活动定义查回。找不到就返回空数组（不限制）。 */
    function caResolveEchoPrerequisite(item, rawNames) {
        if (item && Array.isArray(item.Prerequisite)) return item.Prerequisite.slice();
        try {
            var acts = caRawAllActivities((Player && Player.AssetFamily) || 'Female3DCG');
            if (Array.isArray(acts) && rawNames && rawNames.size) {
                for (var i = 0; i < acts.length; i++) {
                    var a = acts[i];
                    if (a && rawNames.has(a.Name) && Array.isArray(a.Prerequisite)) return a.Prerequisite.slice();
                }
            }
        } catch (e) { silent(e, 'caResolveEchoPrerequisite'); }
        return [];
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
            if (!echoKey || !ext[echoKey]) { toast(QiActT('toast.echo_notfound'), '#FF5C5C'); return; }
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

            toast(QiActT('toast.echo_cleaned', { n: before }), '#46E0A0');
            updateCustomActionPanel(state.selectedTarget);
        } catch (e) { toast(QiActT('toast.echo_clean_failed', { msg: e.message }), '#FF5C5C'); }
    }
    function caNewId() { return 'ca_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7); }

    /** 我的动作面板：列表视图 或 编辑视图 */
