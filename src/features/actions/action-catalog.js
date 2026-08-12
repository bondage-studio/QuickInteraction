    /* Action discovery, labels and availability. */
    function getActionsForPart(partGroup, targetChar) {
        targetChar = targetChar || state.selectedTarget;
        var actions = [];
        var groupCandidates = getPartActionGroups(partGroup);
        var allowedCache = {};

        // ── 方案 A（推荐）：BC 原生实时可用列表 ──
        if (targetChar && typeof ActivityAllowedForGroup === 'function') {
            try {
                groupCandidates.forEach(function(candidateGroup) {
                    var allowed = ActivityAllowedForGroup(targetChar, candidateGroup);
                    if (!Array.isArray(allowed)) return;
                    var allowedSet = {};
                    allowed.forEach(function(a) {
                        if (!a) return;
                        var name = a.Activity ? (a.Activity.Name || '') : (a.Name || '');
                        if (name) {
                            allowedSet[name] = true;
                            actions.push({ Name: name, Group: candidateGroup, translatedName: getActivityLabelFallback(name, candidateGroup), Item: a.Item || null });
                        }
                    });
                    allowedCache[candidateGroup] = allowedSet;
                });
            } catch (e) {
                console.warn('[QiAct] ActivityAllowedForGroup 失败，改用全量列表:', e.message);
            }
        }

        // ── 方案 B：BC_Interactive_Index 精选索引（无实时过滤）──
        if (actions.length === 0 && window.BC_Interactive_Index && window.BC_Interactive_Index.Interactive_Index) {
            actions = window.BC_Interactive_Index.Interactive_Index.filter(function(act) {
                return groupCandidates.indexOf(act.Target_Group) !== -1;
            }).map(function(act) {
                return {
                    Name: act.activityName || '',
                    translatedName: act.translatedactivity || act.activityName || '',
                    Item: null,
                    Group: act.Target_Group || partGroup
                };
            });
        }

        // ── 方案 C：fallback 从 ActivityFemale3DCG 原始数组构建 ──
        if (actions.length === 0 && window.ActivityFemale3DCG) {
            var raw = window.ActivityFemale3DCG.filter(function(a) {
                if (!a.Name || !a.Target) return false;
                var targets = Array.isArray(a.Target) ? a.Target : [a.Target];
                if (targets.some(function(group) { return groupCandidates.indexOf(group) !== -1; })) return true;
                if (a.TargetSelf === true) return targets.some(function(group) { return groupCandidates.indexOf(group) !== -1; });
                var selfT = Array.isArray(a.TargetSelf) ? a.TargetSelf : (a.TargetSelf ? [a.TargetSelf] : []);
                return selfT.some(function(group) { return groupCandidates.indexOf(group) !== -1; });
            });
            actions = raw.map(function(a) {
                var actualGroup = groupCandidates.find(function(group) {
                    var targets = Array.isArray(a.Target) ? a.Target : [a.Target];
                    return targets.indexOf(group) !== -1;
                }) || partGroup;
                return { Name: a.Name || '', Group: actualGroup, translatedName: getActivityLabelFallback(a.Name, actualGroup), Item: null };
            });
        }

        // 强制可用白名单注入：命中的动作（echo 原始 或 已导入的 QiAct_ 副本）无视 BC 可用性判定，
        // 按当前部位 + 自我/对他方向直接注入候选——否则若 ActivityAllowedForGroup 把它挡在源头，
        // 方案 A 非空导致 B/C 不执行，这些动作根本进不了候选、下面的过滤器也就看不到它们。
        if (typeof caRawAllActivities === 'function' && typeof isForceAvailableActivity === 'function') {
            var _toSelf = !!(targetChar && targetChar.IsPlayer && targetChar.IsPlayer());
            var _rawAll = caRawAllActivities((typeof Player !== 'undefined' && Player && Player.AssetFamily) || 'Female3DCG');
            if (Array.isArray(_rawAll)) {
                _rawAll.forEach(function(a) {
                    if (!a || !a.Name) return;
                    // 方向：对自己看 TargetSelf（布尔 true 表示同 Target），对他人看 Target
                    var g = _toSelf ? (a.TargetSelf === true ? a.Target : a.TargetSelf) : a.Target;
                    g = Array.isArray(g) ? g : (g ? [g] : []);
                    var hit = g.find(function(x) { return groupCandidates.indexOf(x) !== -1; });
                    if (!hit) return;
                    var disp = (caFindByActivityName(a.Name) || {}).name || getActivityLabelFallback(a.Name, hit);
                    if (!isForceAvailableActivity(a.Name, disp)) return;
                    if (actions.some(function(x) { return x.Name === a.Name; })) return;
                    actions.push({ Name: a.Name, Group: hit, translatedName: disp, Item: null });
                });
            }
        }

        // 去重 + 过滤无效条目 + 过滤真实部位无翻译的（避免聊天消息乱码）
        var seen = {};
        // 与执行端同源的权威白名单：execution 用 resolveAllowedActivity → ActivityAllowedForGroup 判定「能否执行」，
        // 显示端必须同源，否则会出现「显示了、点了却报不可用」。ActivityAllowedForGroup 已内含
        // 前置条件(束缚)、权限、自我/对他方向、Needs-道具展开、源头封锁等全部判定，无需再各自复刻。
        // 按候选部位组缓存其权威可用名集合，避免逐动作重复调用。
        function allowedNamesFor(g) {
            if (g in allowedCache) return allowedCache[g];
            var set = null;
            if (targetChar && typeof ActivityAllowedForGroup === 'function') {
                try {
                    var list = ActivityAllowedForGroup(targetChar, g);
                    if (Array.isArray(list)) {
                        set = {};
                        list.forEach(function(x) { var n = x && (x.Activity ? x.Activity.Name : x.Name); if (n) set[n] = true; });
                    }
                } catch (e) { set = null; }
            }
            allowedCache[g] = set;
            return set;
        }
        // 动作只要在其部位族任一候选组的权威白名单中即可执行；候选组都能权威判定却都不含它 → 隐藏（点了必然不可用）。
        // 完全无法权威判定（旧版 BC 无此函数/自定义组解析不出）→ 放行，退回原有数据源行为，避免整块空白。
        function actionExecutable(name, group) {
            var fam = getPartActionGroups(group);
            var sawAuthoritative = false;
            for (var i = 0; i < fam.length; i++) {
                var set = allowedNamesFor(fam[i]);
                if (set === null) continue;
                sawAuthoritative = true;
                if (set[name]) return true;
            }
            return !sawAuthoritative;
        }
        return actions.filter(function(a) {
            if (!a.Name || a.Name.indexOf('MISSING') !== -1 ||
                (a.translatedName && (a.translatedName.indexOf('[STRING_RETRIEVAL_FAILED]') !== -1 ||
                                      a.translatedName.indexOf('MISSING TEXT IN') !== -1 ||
                                      a.translatedName.indexOf('MISSING ACTIVITY') !== -1))) return false;
            if (!shouldKeepAction(a.Name, a.Group || partGroup)) return false;
            // 与执行端一致：不在 BC 权威可用列表里的一律不显示（束缚/权限/方向/道具缺失等都在此判定）。
            // 例外：强制可用白名单动作始终显示（执行端亦强制放行，保持一致）。
            if (!isForceAvailableActivity(a.Name, a.translatedName) && !actionExecutable(a.Name, a.Group || partGroup)) return false;
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

    var _activityDictionaryIndex = null;
    var _activityDictionarySource = null;
    var _activityDictionaryLength = -1;
    function activityDictionaryFallback(key) {
        var source = window.ActivityDictionary;
        if (!Array.isArray(source)) return null;
        if (_activityDictionarySource !== source || _activityDictionaryLength !== source.length) {
            var index = Object.create(null);
            for (var i = 0; i < source.length; i++) {
                var entry = source[i];
                if (Array.isArray(entry) && typeof entry[0] === 'string' && typeof entry[1] === 'string' && !isMissingLabel(entry[1])) {
                    index[entry[0]] = entry[1];
                }
            }
            _activityDictionarySource = source;
            _activityDictionaryLength = source.length;
            _activityDictionaryIndex = index;
        }
        return _activityDictionaryIndex[key] || null;
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
                    var fallback = activityDictionaryFallback(key);
                    if (fallback) return fallback;
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
        window.__QiAct_ADT_ORIGINAL = _orig;
        window.ActivityDictionaryText = function(key) {
            var r = _orig.apply(this, arguments);
            if (r && !isMissingLabel(r)) return r;
            if (typeof key === 'string') {
                var fallback = activityDictionaryFallback(key);
                if (fallback) return fallback;
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
