    /* ===== 自定义组合（CRUD + 执行） ===== */
    function generateId() { return 'cmb_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7); }
    function getCombo(id) { return state.combos.find(function(c) { return c.id === id; }); }

    /** 把 BC 道具对象压成纯数据快照（可 JSON 序列化）。
     *  道具动作（如「捆绑」由绳子提供）的 Item 含对角色/Asset 的循环引用，
     *  直接存进 localStorage 会让 JSON.stringify 抛错、整个组合存档写入失败，
     *  表现为「保存后组合变空 / 动作消失」。这里只保留发包真正需要的标量，
     *  形状与真实 Item 一致，makeActivityPacket 无需改动即可读取。 */
    function snapshotComboItem(item) {
        if (!item || typeof item !== 'object') return null;
        var asset = item.Asset || {};
        var group = asset.Group || {};
        var snap = { Asset: { Name: asset.Name || '', Group: { Name: group.Name || '' } } };
        var craftName = item.CraftName || (item.Craft && item.Craft.Name);
        if (craftName) snap.CraftName = craftName;
        return snap;
    }

    /** 清洗组合存档：把历史遗留的完整道具对象压成快照，剔除结构损坏的条目。
     *  在加载后、保存前都调用，保证旧数据能被读取且不再毒化新存档。 */
    function normalizeCombos(list) {
        if (!Array.isArray(list)) return [];
        return list.filter(function(c) {
            return c && typeof c === 'object' && typeof c.id === 'string';
        }).map(function(c) {
            var items = (Array.isArray(c.items) ? c.items : []).filter(function(it) {
                return it && typeof it === 'object' && typeof it.action === 'string' && it.action;
            }).map(function(it) {
                return { group: it.group, action: it.action, label: it.label, item: snapshotComboItem(it.item) };
            });
            return {
                id: c.id,
                name: typeof c.name === 'string' ? c.name : QiActT('combo.new_name'),
                delay: typeof c.delay === 'number' && c.delay >= 0 ? c.delay : 160,
                items: items
            };
        });
    }

    /** 保存前统一清洗 items，确保任何历史遗留的完整道具对象都不会毒化存档 */
    function saveCombos() {
        state.combos = normalizeCombos(state.combos);
        persist(S_COMBOS, state.combos);
    }

    function addCombo(name) {
        var combo = { id: generateId(), name: String(name || QiActT('combo.new_name')), items: [], delay: 160 };
        state.combos.push(combo);
        saveCombos();
        return combo;
    }
    function deleteCombo(id) {
        state.combos = state.combos.filter(function(c) { return c.id !== id; });
        if (state.editingComboId === id) state.editingComboId = null;
        saveCombos();
    }
    function renameCombo(id, name) {
        var c = getCombo(id);
        if (c) { c.name = String(name || c.name); saveCombos(); }
    }
    function addComboItem(comboId, group, action, label, item) {
        var c = getCombo(comboId);
        if (!c) return;
        c.items.push({ group: group, action: action, label: label, item: snapshotComboItem(item) });
        saveCombos();
    }
    function removeComboItem(comboId, index) {
        var c = getCombo(comboId);
        if (!c) return;
        c.items.splice(index, 1);
        saveCombos();
    }
    function moveComboItem(comboId, fromIndex, toIndex) {
        var c = getCombo(comboId);
        if (!c) return;
        var item = c.items.splice(fromIndex, 1)[0];
        c.items.splice(toIndex, 0, item);
        saveCombos();
    }
    function startEditCombo(id) {
        if (!getCombo(id)) return;
        state.editingComboId = id;
        renderPanel();
    }
    function stopEditCombo() {
        state.editingComboId = null;
        renderPanel();
    }

    /** 执行一个组合（对单个目标按条目顺序执行） */
    function runComboOnTarget(charObj, combo) {
        if (!charObj || !combo || !combo.items.length) return;
        var items = combo.items.slice();
        var i = 0, success = 0, delay = comboDelay(combo);
        function next() {
            if (i >= items.length || !state.isActive) return;
            var it = items[i++];
            // 执行前校验该动作在当前目标该部位是否仍可用，并取最新道具
            var item = it.item || null;
            var found = findAllowedActivity(charObj, it.group, it.action);
            if (found) item = found.Item || item;
            if (executeAction(charObj, it.action, item, it.group)) success++;
            setTimeout(next, delay);
        }
        next();
        toast('执行组合「' + combo.name + '」· ' + items.length + ' 步', '#FF5C7A');
    }

    /** 对房间内所有其他成员执行同一组合 */
    function runComboAll(combo) {
        if (!combo || !combo.items.length) { toast(QiActT('toast.combo_empty'), '#FF5C5C'); return; }
        var chars = getRoomCharacters();
        if (!Array.isArray(chars) || chars.length === 0) { toast(QiActT('toast.no_others'), '#888'); return; }
        var ordered = orderBySelectedTarget(filterAllActionTargets(chars));
        if (!ordered.length) { toast(QiActT('toast.no_others'), '#888'); return; }
        var ci = 0;
        function nextChar() {
            if (ci >= ordered.length || !state.isActive) return;
            var c = ordered[ci++];
            runComboOnTarget(c, combo);
            var d = comboDelay(combo);
            setTimeout(nextChar, combo.items.length * d + 300);
        }
        nextChar();
        toast(QiActT('toast.exec_combo_all', { name: combo.name }), '#FF5C7A');
    }

    /* ══════════════════════════════════════════════════════════════
       自定义动作（QiAct 自包含版，替代 echo/回声 echo-activity-ext）
       —— 参考 echo 注册内核，但完全重做 UI；直接用 BC 原生 ActivityAdd，
          不引入 sugarch 依赖。跨客户端可见性靠 makeActivityPacket 的
          Action 兜底分支（名字含下划线 → 走彩色小字动作，文本用本地字典）。
       ══════════════════════════════════════════════════════════════ */

