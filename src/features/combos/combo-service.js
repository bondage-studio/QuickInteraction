    /* ===== 自定义组合（CRUD + 执行） ===== */
    function generateId() { return 'cmb_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7); }
    function saveCombos() { persist(S_COMBOS, state.combos); }
    function getCombo(id) { return state.combos.find(function(c) { return c.id === id; }); }

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
        c.items.push({ group: group, action: action, label: label, item: item || null });
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
        var ordered = orderBySelectedTarget(chars).filter(function(c) { return !isActionSkippedCharacter(c); });
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

