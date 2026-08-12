    /* ===== 目标选择与人物浮层 ===== */
    function selectTargetAndPart(charObj, partGroup) {
        state.selectedTarget = charObj;
        state.selectedPart = partGroup;

        // 高亮选中的网格
        state.bodyGrids.forEach(function(grid, c) {
            var isSelected = (c.MemberNumber === charObj.MemberNumber);
            grid.classList.toggle('selected', isSelected);
            grid.querySelectorAll('.xsact-part-btn').forEach(function(btn) {
                btn.classList.toggle('active', isSelected && isSamePartFamily(btn.dataset.group, partGroup));
            });
        });

        // 更新右侧面板（按当前模式分派）
        renderCharList();
        setPanelMode('part');
    }

    /** 获取当前房间内有效成员。
     *  includeSelf=true 时无条件包含自己（人物列表弹层用——「自己」作为目标始终可选，
     *  与「互動格」的 selfMode 解耦）；否则自己仍受 selfMode 控制（全員广播/组合动作用）。 */
    function getRoomCharacters(includeSelf) {
        var arr = [];
        if (typeof ChatRoomCharacter !== 'undefined' && Array.isArray(ChatRoomCharacter)) {
            ChatRoomCharacter.forEach(function(c) {
                if (!c || !c.MemberNumber) return;
                var isSelf = c.IsPlayer && c.IsPlayer();
                if (isSelf && !includeSelf && !state.selfModeActive) return;
                arr.push(c);
            });
        }
        return arr;
    }

    /** 从人物列表选中角色：清除已选部位，切换到左侧浮层的部位选择视图 */
    function selectCharacterFromList(charObj) {
        state.selectedTarget = charObj;
        state.selectedPart = null;
        state.selectedAction = null;
        state.selectedActionItem = null;
        state.popoverView = state.panelMode === 'favorite' ? 'chars' : 'parts';
        // 同步高亮该角色的身体线框
        state.bodyGrids.forEach(function(grid, c) {
            grid.classList.toggle('selected', c.MemberNumber === charObj.MemberNumber);
            grid.querySelectorAll('.xsact-part-btn').forEach(function(btn) {
                btn.classList.remove('active');
            });
        });
        renderPopover();
        renderPanel();
    }

    /** 渲染人物列表弹出层 */
    function renderCharList() {
        var bodyEl = state.actionPanelEl && state.actionPanelEl.querySelector('#xsact-char-popover-body');
        if (!bodyEl) return;
        var chars = getRoomCharacters(true); // 人物列表始终列出「自己」，不受 selfMode 影响
        var html = '';
        if (chars.length === 0) {
            html = '<div class="xsact-char-popover-empty">' + QiActT('target.empty') + '</div>';
        } else {
            html = '<div class="xsact-char-popover-items">';
            chars.forEach(function(c) {
                var isSelf = c.IsPlayer && c.IsPlayer();
                var selected = state.selectedTarget && state.selectedTarget.MemberNumber === c.MemberNumber;
                html += '<div class="xsact-char-popover-item' + (selected ? ' selected' : '') + (isSelf ? ' self' : '') + '" data-mn="' + c.MemberNumber + '">' +
                    '<span class="xsact-char-popover-name">' + escapeHtml(characterDisplayName(c)) + '</span>' +
                    (isSelf ? '<span class="xsact-char-popover-self">' + QiActT('common.self') + '</span>' : '') +
                    '</div>';
            });
            html += '</div>';
        }
        bodyEl.innerHTML = html;
        var items = bodyEl.querySelectorAll('.xsact-char-popover-item');
        items.forEach(function(item) {
            item.addEventListener('click', function(e) {
                e.stopPropagation();
                var mn = parseInt(item.dataset.mn, 10);
                var c = chars.find(function(x) { return x.MemberNumber === mn; });
                if (c) selectCharacterFromList(c);
            });
        });
    }

    /** 渲染左侧浮层「部位选择」视图：用 BC 原生 Zone 矩形拼出矩形身体地图。
     *  与游戏内浮动线框共用 getPartZones() 同一套真值坐标，保持「原版矩形选择」体感。 */
    function renderPopoverParts(charObj) {
        var bodyEl = state.actionPanelEl && state.actionPanelEl.querySelector('#xsact-char-popover-body');
        if (!bodyEl) return;

        // 用 BC 原生 AssetGroup[].Zone 矩形（500x1000 资产空间）逐个部位生成可点击热区。
        // 矩形本身即身体轮廓，不需要额外人物贴图——这正是 BC 原版「点矩形选部位」的方式。
        var rects = '';
        BODY_PARTS.forEach(function(part) {
            var zones = getPartZones(charObj, part.group);
            zones.forEach(function(z) {
                var x = z[0], y = z[1], w = z[2], h = z[3];
                var rx = Math.min(16, Math.min(w, h) * 0.4);
                var sel = isSamePartFamily(state.selectedPart, part.group) ? ' selected' : '';
                rects += '<rect class="xsact-body-part-zone' + sel + '" data-group="' + part.group +
                    '" x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + w.toFixed(1) +
                    '" height="' + h.toFixed(1) + '" rx="' + rx.toFixed(1) + '" data-label="' + part.label + '"/>';
            });
        });

        var svg = '<svg class="xsact-body-svg" viewBox="0 0 500 1000" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">' +
            rects +
            '</svg>' +
            '<div class="xsact-body-part-hint">' + QiActT('target.pick_part') + '</div>';
        bodyEl.innerHTML = '<div class="xsact-body-select">' + svg + '</div>';

        var hint = bodyEl.querySelector('.xsact-body-part-hint');
        bodyEl.querySelectorAll('.xsact-body-part-zone').forEach(function(zone) {
            zone.addEventListener('mouseenter', function() {
                var label = zone.dataset.label || zone.dataset.group;
                if (hint) hint.textContent = label;
                zone.classList.add('hover');
            });
            zone.addEventListener('mouseleave', function() {
                if (hint) hint.textContent = QiActT('target.pick_part');
                zone.classList.remove('hover');
            });
            zone.addEventListener('click', function(e) {
                e.stopPropagation();
                state.selectedPart = zone.dataset.group;
                // 立即高亮当前选中的矩形，避免等下次重绘
                updatePartFamilySelection(bodyEl, state.selectedPart, '.xsact-body-part-zone');
                setPanelMode('part');
                // 选择部位后保持浮层开启，方便继续选其他部位
            });
        });
    }

    /** 渲染左侧人物浮层：根据 popoverView 切换人物列表 / 部位选择 */
    function renderPopover() {
        var popover = state.actionPanelEl && state.actionPanelEl.querySelector('#xsact-char-popover');
        var titleEl = state.actionPanelEl && state.actionPanelEl.querySelector('#xsact-char-popover-title');
        if (!popover) return;
        var view = (state.popoverView === 'parts' && state.selectedTarget) ? 'parts' : 'chars';
        popover.classList.toggle('show-back', view === 'parts');
        if (view === 'chars') {
            if (titleEl) titleEl.textContent = QiActT('ui.chars');
            renderCharList();
        } else {
            if (titleEl) titleEl.textContent = (characterDisplayName(state.selectedTarget) || '?') + ' → ' + QiActT('target.select_part');
            renderPopoverParts(state.selectedTarget);
        }
    }

    /** 打开人物列表弹出层 */
    function applyCharPopoverSide(panel) {
        panel = panel || state.actionPanelEl;
        if (!panel) return;
        panel.classList.toggle('char-popover-right', !!state.charPopoverRight);
        var popover = panel.querySelector('#xsact-char-popover');
        if (popover) popover.classList.toggle('right', !!state.charPopoverRight);
    }

    function openCharPopover() {
        if (!state.actionPanelEl) return;
        var panel = state.actionPanelEl;
        var popover = panel.querySelector('#xsact-char-popover');
        var tab = panel.querySelector('#xsact-char-popover-tab');
        if (!popover) return;
        // 打开时默认显示人物列表
        state.popoverView = 'chars';
        applyCharPopoverSide(panel);
        popover.style.display = 'flex';
        state.charListOpen = true;
        panel.classList.add('popover-open');
        if (tab) tab.classList.add('active');
        renderPopover();
    }

    /** 关闭人物列表弹出层 */
    function closeCharPopover() {
        if (!state.actionPanelEl) return;
        var panel = state.actionPanelEl;
        var popover = panel.querySelector('#xsact-char-popover');
        var tab = panel.querySelector('#xsact-char-popover-tab');
        if (popover) popover.style.display = 'none';
        state.charListOpen = false;
        state.popoverView = 'chars';
        panel.classList.remove('popover-open');
        if (tab) tab.classList.remove('active');
    }

    /** 切换人物列表弹出层 */
    function toggleCharPopover() {
        if (state.charListOpen) closeCharPopover();
        else openCharPopover();
    }


    // ════════════════════════════════════════════════════════════════════════
    // 右侧动作面板
    // ════════════════════════════════════════════════════════════════════════

    /** 面板渲染分派：根据 state.panelMode 渲染「单部位」或「自定义组合」 */
