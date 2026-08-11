    /* Activity packet construction and execution. */
    function makeActivityPacket(targetChar, group, name, activityItem) {
        var targetMN = targetChar && targetChar.MemberNumber;
        var contentKey = resolveContentKey(group, name, targetChar);
        var isSelfAction = contentKey.indexOf('ChatSelf-') === 0;
        var isPlayerTarget = Player && targetChar && targetChar.MemberNumber === Player.MemberNumber;
        var isTargetSelf = isSelfAction && !isPlayerTarget;

        function charTagForAction(c) {
            return {
                Tag: {
                    MemberNumber: c && c.MemberNumber || 0,
                    Name: c && (c.Name || c.AccountName) || '某人',
                    Nickname: c && (c.Nickname || c.Name || c.AccountName) || '某人'
                }
            };
        }

        // 自定义动作（QiAct_ 前缀）：走 BC 原生「Action 文本」机制（与游戏内 `.a` / BCX 同款）。
        // 关键：包里直接内嵌对话文本（Text 字段），接收端（含原生 BC 与 BCX）直接渲染，
        // 不需要接收方安装任何插件 —— 解决「标准 Activity 包会让无插件者看到 MISSING TEXT」的问题。
        // 昵称由我们在文本里用 {SourceCharacter}/{TargetCharacter} → Nickname 手动拼入，确保显示昵称而非原始 ID。
        // 本地动画副作用由 executeAction 里的 ActivityRun 负责（活动已 push 进 AssetAllActivities，仅本客户端生效）。
        if (new RegExp('^' + CA_PREFIX).test(name)) {
            var ca = caFindByActivityName(name);
            if (ca) {
                var caSrc = (Player && (Player.Nickname || Player.Name || Player.AccountName)) || '某人';
                var caTgt = (targetChar && (targetChar.Nickname || targetChar.Name || targetChar.AccountName)) || '某人';
                // 文本选择规则：
                // - 仅自己：始终用 dialogSelf（自己视角），回退到 dialog
                // - 仅他人：始终用 dialog（他人视角）
                // - 任意：根据当前实际目标是否玩家自己切换
                var caDialog;
                if (ca.scope === 'self') {
                    caDialog = (ca.dialogSelf && ca.dialogSelf.trim()) ? ca.dialogSelf : ca.dialog;
                } else if (ca.scope === 'other') {
                    caDialog = ca.dialog;
                } else {
                    caDialog = isSelfAction
                        ? ((ca.dialogSelf && ca.dialogSelf.trim()) ? ca.dialogSelf : ca.dialog)
                        : ca.dialog;
                }
                if (!caDialog) caDialog = ca.name || '某个动作';
                caDialog = caDialog
                    .replace(/\{SourceCharacter\}/g, caSrc)
                    .replace(/\{TargetCharacter\}/g, caTgt)
                    // 兼容 echo/回声 导入时的裸占位符写法（无花括号）
                    .replace(/SourceCharacter/g, caSrc)
                    .replace(/TargetCharacter/g, caTgt);
                return {
                    Content: 'QiAct_ChatFallback',
                    Type: 'Action',
                    Dictionary: [
                        charTagForAction(Player),
                        { Tag: 'MISSING TEXT IN "Interface.csv": QiAct_ChatFallback', Text: caDialog }
                    ]
                };
            }
        }

        var contentText = (typeof ActivityDictionaryText === 'function') ? ActivityDictionaryText(contentKey) : null;
        var contentKeyMissing = isMissingLabel(contentText);
        // 已导入本插件的 echo/回声 原始动作（如 XSAct_埋怀里）被 suppress 后，仍可能出现在
        // BC 原生动作列表或某些第三方面板。若用户点击了它，不能发标准 Activity 包，否则
        // 接收方没有 echo 插件就会看到 MISSING TEXT。这里把它视为「需要兜底」。
        var isEchoSuppressed = typeof caIsEchoSuppressed === 'function' && caIsEchoSuppressed(name);
        // 关键：不要把所有含下划线的 mod 动作都强制走 Action 兜底。
        // 像 Liko_ 这类动作在本地有完整 Activity + Dictionary 注册，且依赖标准 Activity 包触发
        // 其 ServerSend hook 才能执行脚本（如插呆毛、溶解衣服）。若发 Action 包，Liko hook 监听
        // Type === 'Activity' 会漏掉，导致只有文本没有实际效果。
        // 同样，LSCG_ 动作也是真实 BC 活动（注册进 AssetAllActivities），本客户端装有 LSCG 时
        // 其 ServerSend hook（仅处理 Type === 'Activity'）会执行饥饿/口渴/道具/特殊脚本。
        // 小酥动作拓展（XiaoSuActivity，前缀 XSAct_，如 XSAct_眯眼 / XSAct_看他）同理：
        //   它把对话文本写进全局 ActivityDictionary 数组（与 LSCG 同款），并且其 ServerSend hook
        //   只在 Type === 'Activity' 且活动名以 "XSAct_" 开头时，才拦截并往 Dictionary 注入一条
        //   {Tag, Text}（= 富文本动作描述），使【未装小酥的接收方】也能看到动作内容。
        //   一旦被我们误发成 Action 兜底包，小酥 hook 直接跳过（它只听 Activity），
        //   接收方既看不到富文本、又只能看到退化的「做了「眯眼」」提示。
        // 注意：本 BC 版本 ActivityDictionaryText 读的是 ActivityDictionaryLoad().cache，
        // 而小酥 / LSCG 把对话文本写进了 ActivityDictionary 数组，导致
        // ActivityDictionaryText('ChatOther-<group>-XSAct_xxx') 对这类动作稳定返回 MISSING，
        // 从而被误判 contentKeyMissing 退回 Action 兜底 —— 这正是效果丢失的根因。
        // patchActivityDictionaryText()（main 登录后安装，数组兜底）已让 ActivityDictionaryText
        // 在 MISSING 时回退数组查找，使 contentKeyMissing 对 XSAct_ 也变 false；
        // 这里再对 XSAct_（排除本插件自定义动作 QiAct_ 和已 suppress 的 echo 原始动作）
        // 强制走标准 Activity 包，双保险，与它们在真实游戏里原生触发完全一致。
        // findAllowedActivity 已兜底兜住「活动不在 AssetAllActivities」的非法情况，不会发出无效包。
        var isForcedActivityMod = /^(LSCG_|Liko_)/.test(name || '') ||
            (/^XSAct_/.test(name || '') && !isEchoSuppressed);

        if ((contentKeyMissing || isEchoSuppressed) && !isForcedActivityMod) {
            // 走 BC 原生「自定义动作文本」机制（与游戏内 `.a ` 前缀 / BCX 同款）：
            // 发送 Type:'Action' + 在 Dictionary 中塞一条
            //   { Tag: 'MISSING TEXT IN "<file>": <key>', Text: <动作句> }
            // 接收端（含原生 BC 与 BCX）直接渲染 Dictionary 里的 Text 为小字带颜色动作，
            // 既不依赖接收方是否装有对应 mod 的字典，也不会出现 MISSING TEXT 垃圾串。
            // 注意：Action 消息的 Dictionary[0] 必须是角色对象，且包在 {Tag: ...} 里。
            // BC 渲染名字时会优先读 tag.Nickname，没有再读 tag.Name。
            // 直接传 MemberNumber 或 {SourceCharacter} 对象都无法触发 nickname。
            var actor = isTargetSelf ? targetChar : Player;
            var actorTag = charTagForAction(actor);
            var sentence;
            if (!contentKeyMissing && contentText) {
                sentence = contentText
                    .replace(/\{SourceCharacter\}/g, actorTag.Tag.Nickname)
                    .replace(/\{TargetCharacter\}/g, targetChar && (targetChar.Nickname || targetChar.Name || targetChar.AccountName) || '某人')
                    // 兼容 echo/回声 等使用裸占位符（无花括号）的模板
                    .replace(/SourceCharacter/g, actorTag.Tag.Nickname)
                    .replace(/TargetCharacter/g, targetChar && (targetChar.Nickname || targetChar.Name || targetChar.AccountName) || '某人');
            } else {
                var displayName = getActivityLabelFallback(name, group) || name || '某个动作';
                if (isTargetSelf) {
                    sentence = '做了「' + displayName + '」';
                } else {
                    sentence = '对' + (targetChar && (targetChar.Nickname || targetChar.Name || targetChar.AccountName) || '某人') + '做了「' + displayName + '」';
                }
            }
            var fbKey = 'QiAct_ChatFallback';
            return {
                Content: fbKey,
                Type: 'Action',
                Dictionary: [
                    actorTag,
                    { Tag: 'MISSING TEXT IN "Interface.csv": ' + fbKey, Text: sentence }
                ]
            };
        }

        // PAT All 同款：Dictionary 初始不含 ActivityName（最后 push，顺序敏感！）
        var packet = {
            Content: contentKey,
            Type: 'Activity',
            Dictionary: [
                { SourceCharacter: isTargetSelf ? targetMN : Player.MemberNumber },
                { TargetCharacter: targetMN },
                { Tag: 'FocusAssetGroup', FocusGroupName: group }
            ]
        };

        // 绑定道具（优先用 ActivityAllowedForGroup 返回的真实 Item，
        // 其次从目标角色外观中找最相关衣物作为 ActivityAsset 兜底，
        // 再正则兜底手持/吃东西类动作）
        var item = activityItem || null;
        if (!item && targetChar) {
            item = findBestItemForActivityAsset(targetChar, group);
        }
        if (!item && typeof InventoryGet === 'function') {
            var isLscgEatChew = /^LSCG_(Eat|Chew)/i.test(name) || /EatItem$/i.test(name) || /ThrowItem$/i.test(name);
            var isHand = /^ItemHand/i.test(name);
            if (isLscgEatChew) {
                var tc = (typeof ChatRoomCharacter !== 'undefined' && Array.isArray(ChatRoomCharacter))
                    ? ChatRoomCharacter.find(function(c) { return c.MemberNumber === targetMN; }) : null;
                if (tc) item = InventoryGet(tc, 'ItemHandheld');
            } else if (isHand) {
                item = InventoryGet(Player, 'ItemHandheld');
            }
        }
        if (item && item.Asset) {
            var aa = { Tag: 'ActivityAsset', AssetName: item.Asset.Name, GroupName: item.Asset.Group ? item.Asset.Group.Name : 'ItemHandheld' };
            if (item.CraftName || (item.Craft && item.Craft.Name))
                aa.CraftName = item.CraftName || item.Craft.Name;
            packet.Dictionary.push(aa);
            logD('ActivityAsset 已加入:', aa.AssetName, aa.GroupName, 'CraftName:', aa.CraftName || '无');
        } else {
            logD('未生成 ActivityAsset:', name, group, 'item存在=', !!item, 'Asset存在=', !!(item && item.Asset));
        }

        // ActivityName 放最后（PAT All 做法）
        packet.Dictionary.push({ ActivityName: name });
        return packet;
    }

    /** 记录上次动作（抽取公共代码） */
    function recordLastAction(name, targetMN, part, dict) {
        state.lastAction = { name: name, targetMN: targetMN, part: part, time: Date.now() };
        saveStorage(S_LAST, state.lastAction);
    }

    /** 从 ActivityAllowedForGroup 结果中按名字查找动作（统一解析 a.Activity?.Name）
     * @returns 匹配的动作项（含 .Item）或 null */
    function findAllowedActivity(char, group, name) {
        if (typeof ActivityAllowedForGroup !== 'function') return null;
        try {
            var allowed = ActivityAllowedForGroup(char, group);
            if (!Array.isArray(allowed)) return null;
            return allowed.find(function(a) {
                if (!a) return false;
                var n = a.Activity ? a.Activity.Name : a.Name;
                return n === name;
            }) || null;
        } catch (_) {
            return null; // 单目标/部位查询异常视为不可用，由调用方跳过或提示
        }
    }

    function resolveAllowedActivity(char, preferredGroup, name) {
        var family = getPartGroupFamily(preferredGroup);
        for (var i = 0; i < family.length; i++) {
            var found = findAllowedActivity(char, family[i], name);
            if (found) return { activity: found, group: family[i] };
        }
        return null;
    }

    /** 组合执行间隔归一化（缺失/非法时回退 160ms） */
    function comboDelay(combo) {
        return (combo && typeof combo.delay === 'number' && combo.delay >= 0) ? combo.delay : 160;
    }

    /** 把选中目标排到数组首位（其余保持原序），用于「全员」执行时优先作用于当前目标 */
    function orderBySelectedTarget(chars) {
        var ordered = (chars || []).slice();
        if (state.selectedTarget && state.selectedTarget.MemberNumber) {
            var mn = state.selectedTarget.MemberNumber;
            ordered.sort(function(a, b) { return (a.MemberNumber === mn) ? -1 : 0; });
        }
        return ordered;
    }

    /** 执行动作（先 ActivityRun 本地副作用，再 ServerSend 发送 Activity 包）
     * @param {string} [groupOverride] 指定部位 Group（全身模式逐部位执行时用），缺省用 state.selectedPart */
    function executeAction(charObj, activityName, activityItem, groupOverride) {
        if (!charObj || !activityName) return false;
        var name = String(activityName || '');
        var group = String(groupOverride || state.selectedPart || '');
        if (!name || !group) return false;

        try {
            // 实时可用性预校验（findAllowedActivity 内部已处理 ActivityAllowedForGroup 缺失）
            var resolved = resolveAllowedActivity(charObj, group, name);
            if (!resolved) {
                toast(QiActT('toast.unavailable'), '#FF5C5C'); return false;
            }
            group = resolved.group;
            activityItem = activityItem || (resolved.activity && resolved.activity.Item) || null;
            var packet = makeActivityPacket(charObj, group, name, activityItem);
            if (!packet) { toast(QiActT('toast.need_item'), '#FF5C5C'); return false; }

            // 先执行 BC 原生 ActivityRun(..., false) 触发本地副作用：
            // 重置 PropertyAutoPunishHandled（MakeSound 动作会触发口塞充气等自动惩罚）、
            // ActivityEffect（目标是玩家时）、ActivityRunSelf（玩家自身快感计算）、
            // PropertyPunishActivityCache 等。之后再自己发包，避免直接 ServerSend 跳过规则。
            var activityObj = null;
            var targetGroupObj = null;
            if (typeof ActivityRun === 'function' && typeof ActivityGetGroupOrMirror === 'function' && typeof AssetAllActivities === 'function') {
                try {
                    targetGroupObj = ActivityGetGroupOrMirror(charObj.AssetFamily, group);
                    var allActs = AssetAllActivities(charObj.AssetFamily);
                    activityObj = allActs.find(function(a) { return a.Name === name; });
                    if (targetGroupObj && activityObj) {
                        ActivityRun(Player, charObj, targetGroupObj, { Activity: activityObj, Item: activityItem }, false);
                    }
                } catch (runErr) {
                    console.warn('[QiAct] ActivityRun 本地副作用执行失败:', runErr.message);
                }
            }

            // 再 ServerSend（标准方式）
            // 设置目标聚焦部位：Prank 等自定义动作（如 Liko_CutClothes）的回调依赖
            // target.FocusGroup?.Name 决定作用部位。原生 UI 点击时会自动设置该值，
            // 但本插件直接发包不经过那一步，需手动补上，发完立即还原。
            var prevFocus = charObj.FocusGroup;
            var focusGroupObj = null;
            if (typeof AssetGroup !== 'undefined' && Array.isArray(AssetGroup)) {
                focusGroupObj = AssetGroup.find(function(g) { return g && g.Name === group; });
            }
            try {
                charObj.FocusGroup = focusGroupObj || { Name: group };
                if (typeof ServerSend === 'function') {
                    ServerSend('ChatRoomChat', packet);
                } else {
                    console.warn('[QiAct] ServerSend 暂不可用，动作未实际发送');
                }
                recordLastAction(name, charObj.MemberNumber, group, packet.Dictionary);
                return true;
            } catch (sendErr) {
                console.warn('[QiAct] ServerSend 失败:', sendErr.message);
            } finally {
                charObj.FocusGroup = prevFocus;
            }

            // 最终兜底：如果 ActivityRun 也拿不到，提示不可用
            toast(QiActT('toast.temporarily_unavailable'), '#FF5C5C');
            return false;
        } catch (e) {
            console.error('[QiAct] 执行动作异常:', e);
            toast(QiActT('toast.exec_failed', { msg: e.message }), '#FF5C5C');
            return false;
        }
    }

    /** 对房间内所有其他成员执行同一动作（PAT ALL 同款广播） */
    function executeActionAll() {
        if (!state.selectedAction || !state.selectedPart) { toast(QiActT('toast.pick_action'), '#FF5C5C'); return; }
        var chars = getRoomCharacters();
        if (!Array.isArray(chars) || chars.length === 0) { toast(QiActT('toast.no_others'), '#888'); return; }

        // 如果当前选中了目标，则把目标排到第一个执行，其余随后
        var ordered = orderBySelectedTarget(chars).filter(function(c) { return !isActionSkippedCharacter(c); });
        if (!ordered.length) { toast(QiActT('toast.no_others'), '#888'); return; }

        var name = String(state.selectedAction);
        var group = String(state.selectedPart);
        var success = 0;
        var delay = normalizeActionDelay(state.actionDelay); // 避免触发服务器/本地 anti-spam
        var index = 0;

        function next() {
            if (index >= ordered.length || !state.isActive) return;
            var c = ordered[index++];
            // 预先检查该目标当前是否真的可做这个动作
            var item = null;
            var resolved = resolveAllowedActivity(c, group, name);
            if (!resolved) return next();
            item = resolved.activity.Item || null;
            if (executeAction(c, name, item || state.selectedActionItem)) success++;
            setTimeout(next, delay);
        }
        next();
        toast(QiActT('toast.exec_all', { name: getActivityLabel(name, group) }), '#FF5C7A');
    }

    /* ══════════════════════════════════════════════════════════════
       自定义组合 —— 用户手动把「单部位 + 动作」拼成组合，一键顺序执行。
       比自动按动作名聚合更准确，可跨部位、跨动作自由组合。
       ══════════════════════════════════════════════════════════════ */

