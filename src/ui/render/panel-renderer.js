    /* ===== 面板渲染与模式 ===== */
    function renderPanel() {
        if (!state.actionPanelEl) return;
        var listEl = state.actionPanelEl.querySelector('#xsact-action-list');
        var titleEl = state.actionPanelEl.querySelector('#xsact-panel-title');
        var footerEl = state.actionPanelEl.querySelector('.xsact-qa-panel-footer');
        if (footerEl) footerEl.style.display = (state.panelMode === 'settings' || (state.panelMode === 'custom' && state.editingCustomId)) ? 'none' : '';
        if (state.panelMode !== 'favorite') { var favFilter = state.actionPanelEl.querySelector('#xsact-favorite-part-filter'); if (favFilter) favFilter.remove(); }
        if (listEl) {
            listEl.classList.toggle('xsact-custom-mode', state.panelMode === 'custom');
            listEl.classList.toggle('xsact-combo-mode', state.panelMode === 'combo');
            listEl.classList.toggle('xsact-favorite-mode', state.panelMode === 'favorite');
        }
        updateAllButtonVisual();
        updateFavButtonVisual();
        updateInteractionGridVisual();

        // 「我的动作」「组合动作」可独立展开，无需先选中人物或身体部位
        if (state.panelMode === 'custom') {
            updateCustomActionPanel(state.selectedTarget);   // charObj 可能为 null
            return;
        }
        if (state.panelMode === 'combo') {
            updateComboPanel(state.selectedTarget);          // charObj 可能为 null
            return;
        }
        if (state.panelMode === 'favorite') { updateFavoritesPanel(state.selectedTarget); return; }
        if (state.panelMode === 'settings') { updateSettingsPanel(); return; }

        // 「动作」模式：必须先选中人物与身体部位
        if (!state.selectedTarget) {
            if (titleEl) titleEl.textContent = QiActT('render.select_action');
            if (listEl) listEl.innerHTML = '<div class="xsact-qa-empty">' + QiActT('render.pick_char_part2') + '</div>';
            return;
        }
        if (!state.selectedPart) {
            if (titleEl) titleEl.textContent = (characterDisplayName(state.selectedTarget) || '?') + ' → ' + QiActT('target.select_part');
            if (listEl) listEl.innerHTML = '<div class="xsact-qa-empty">' + QiActT('render.pick_part_hint') + '</div>';
            return;
        }
        updateActionPanel(state.selectedTarget, state.selectedPart);
    }

    /** 切换面板模式（部位 / 自定义组合） */
    function setPanelMode(mode) {
        if (!/^(part|favorite|combo|custom|settings)$/.test(mode)) return;
        state.panelMode = mode;
        persist(S_MODE, mode);
        if (state.actionPanelEl) {
            state.actionPanelEl.querySelectorAll('.xsact-mode-tab').forEach(function(tab) {
                tab.classList.toggle('active', tab.dataset.mode === mode);
            });
        }
        renderPanel();
    }

    /** 刷新面板状态（用于刷新按钮）：重新读取当前部位/人物的可执行动作或组合列表 */
    function refreshPanelState() {
        if (!state.actionPanelEl) { toast(QiActT('toast.mode_on_first'), '#888'); return; }
        if (state.panelMode === 'custom') {
            updateCustomActionPanel(state.selectedTarget);
            toast(QiActT('toast.refreshed_custom'), '#FF5C7A');
        } else if (state.panelMode === 'favorite') {
            updateFavoritesPanel(state.selectedTarget);
            toast(QiActT('toast.refreshed_actions'), '#FF5C7A');
        } else if (state.panelMode === 'combo') {
            // 重新从存储加载组合，并刷新视图
            state.combos = loadSetting(S_COMBOS, []);
            updateComboPanel(state.selectedTarget);
            toast(QiActT('toast.refreshed_combo'), '#FF5C7A');
        } else {
            // 「动作」模式才需要选中人物 + 部位
            if (!state.selectedTarget || !state.selectedPart) { toast(QiActT('toast.pick_part'), '#888'); return; }
            // 重新渲染当前部位动作列表（ActivityAllowedForGroup 会实时重新计算）
            updateActionPanel(state.selectedTarget, state.selectedPart);
            toast(QiActT('toast.refreshed_actions'), '#FF5C7A');
        }
    }

    /** 自定义组合面板：列表视图 或 编辑视图 */
    function updateComboPanel(charObj) {
        if (!state.actionPanelEl) return;
        var titleEl = state.actionPanelEl.querySelector('#xsact-panel-title');
        var listEl = state.actionPanelEl.querySelector('#xsact-action-list');
        var allBtn = state.actionPanelEl.querySelector('#xsact-all-btn');
        if (!titleEl || !listEl) return;

        if (state.editingComboId) {
            // ── 编辑视图 ──
            var combo = getCombo(state.editingComboId);
            if (!combo) { state.editingComboId = null; updateComboPanel(charObj); return; }
            titleEl.textContent = QiActT('combo.edit_title', { name: combo.name });
            if (allBtn) allBtn.disabled = false;

            var html = '<div class="xsact-combo-editor">';
            // 名称输入
            html += '<div class="xsact-combo-field"><input type="text" id="xsact-combo-name" value="' +
                escapeHtml(combo.name) + '" placeholder="' + QiActT('combo.name_ph') + '"></div>';
            // 动作间隔（延迟）滑块
            var curDelay = comboDelay(combo);
            html += '<div class="xsact-combo-field xsact-combo-delay">' +
                '<label>' + QiActT('combo.delay_label', { n: curDelay }) + '</label>' +
                '<input type="range" id="xsact-combo-delay" min="50" max="2000" step="50" value="' + curDelay + '">' +
                '</div>';
            // 条目列表
            if (!combo.items.length) {
                html += '<div class="xsact-qa-empty">' + QiActT('combo.add_hint') + '</div>';
            } else {
                html += '<div class="xsact-combo-items">';
                combo.items.forEach(function(it, idx) {
                    var partLbl = (BODY_PARTS.find(function(p) { return p.group === it.group; }) || {}).label || it.group;
                    html += '<div class="xsact-combo-item" data-idx="' + idx + '">' +
                        '<span class="xsact-combo-item-num">' + (idx + 1) + '</span>' +
                        '<span class="xsact-combo-item-part">' + escapeHtml(partLbl) + '</span>' +
                        '<span class="xsact-combo-item-action">' + escapeHtml(it.label || it.action) + '</span>' +
                        '<button class="xsact-combo-item-up" title="' + QiActT('combo.up') + '">' + svgIcon('up', 13) + '</button>' +
                        '<button class="xsact-combo-item-down" title="' + QiActT('combo.down') + '">' + svgIcon('down', 13) + '</button>' +
                        '<button class="xsact-combo-item-del" title="' + QiActT('combo.item_del') + '" data-tooltip-type="danger">' + svgIcon('close', 13) + '</button>' +
                        '</div>';
                });
                html += '</div>';
            }
            // 操作按钮
            html += '<div class="xsact-combo-actions">' +
                '<button class="xsact-combo-save-btn">' + QiActT('combo.save') + '</button>' +
                '<button class="xsact-combo-cancel-btn">' + QiActT('combo.cancel') + '</button>' +
                '</div>';
            html += '</div>';
            listEl.innerHTML = html;

            // 绑定
            var nameInput = listEl.querySelector('#xsact-combo-name');
            if (nameInput) nameInput.addEventListener('change', function() { renameCombo(combo.id, nameInput.value); titleEl.textContent = QiActT('combo.edit_title', { name: combo.name }); });
            // 延迟滑块
            var delayInput = listEl.querySelector('#xsact-combo-delay');
            var delayVal = listEl.querySelector('#xsact-delay-val');
            if (delayInput) delayInput.addEventListener('input', function() {
                var v = parseInt(delayInput.value, 10) || 160;
                if (delayVal) delayVal.textContent = v;
                combo.delay = v;
                saveCombos();
            });
            listEl.querySelectorAll('.xsact-combo-item-del').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    var idx = parseInt(btn.closest('.xsact-combo-item').dataset.idx, 10);
                    removeComboItem(combo.id, idx);
                    updateComboPanel(charObj);
                });
            });
            listEl.querySelectorAll('.xsact-combo-item-up').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    var idx = parseInt(btn.closest('.xsact-combo-item').dataset.idx, 10);
                    if (idx > 0) { moveComboItem(combo.id, idx, idx - 1); updateComboPanel(charObj); }
                });
            });
            listEl.querySelectorAll('.xsact-combo-item-down').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    var idx = parseInt(btn.closest('.xsact-combo-item').dataset.idx, 10);
                    if (idx < combo.items.length - 1) { moveComboItem(combo.id, idx, idx + 1); updateComboPanel(charObj); }
                });
            });
            var saveBtn = listEl.querySelector('.xsact-combo-save-btn');
            if (saveBtn) saveBtn.addEventListener('click', function() { stopEditCombo(); toast(QiActT('toast.combo_saved'), '#46E0A0'); });
            var cancelBtn = listEl.querySelector('.xsact-combo-cancel-btn');
            if (cancelBtn) cancelBtn.addEventListener('click', stopEditCombo);
            return;
        }

        // ── 列表视图 ──
        titleEl.textContent = (charObj ? characterDisplayName(charObj) + ' → ' : '') + QiActT('render.combo_title');
        if (allBtn) allBtn.disabled = false;

        var html = '';
        if (!state.combos.length) {
            html = '<div class="xsact-qa-empty">' + QiActT('combo.empty') + '</div>';
        } else {
            state.combos.forEach(function(c) {
                html += '<div class="xsact-combo-card" data-id="' + c.id + '">' +
                    '<div class="xsact-combo-info">' +
                    '<span class="xsact-combo-name">' + escapeHtml(c.name) + '</span>' +
                    '<span class="xsact-combo-count">' + c.items.length + QiActT('combo.count', { n: c.items.length }) + '</span>' +
                    '</div>' +
                    '<div class="xsact-combo-btns">' +
                    '<button class="xsact-combo-run" title="' + QiActT('combo.exec') + '">' + svgIcon('play', 14) + '</button>' +
                    '<button class="xsact-combo-edit" title="' + QiActT('combo.edit') + '">' + svgIcon('pencil', 14) + '</button>' +
                    '<button class="xsact-combo-delete" title="' + QiActT('combo.item_del') + '" data-tooltip-type="danger">' + svgIcon('trash', 14) + '</button>' +
                    '</div>' +
                    '</div>';
            });
        }
        html += '<button class="xsact-combo-new-btn" id="xsact-new-combo-btn">' + svgIcon('plus', 15) + ' ' + QiActT('combo.new_btn') + '</button>';
        listEl.innerHTML = html;

        listEl.querySelectorAll('.xsact-combo-run').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                var id = btn.closest('.xsact-combo-card').dataset.id;
                var c = getCombo(id);
                if (!c || !c.items.length) return;
                if (state.allModeActive) { runComboAll(c); return; }
                if (!charObj) { toast(QiActT('toast.pick_char'), '#FF5C5C'); return; }
                runComboOnTarget(charObj, c);
            });
        });
        listEl.querySelectorAll('.xsact-combo-edit').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                startEditCombo(btn.closest('.xsact-combo-card').dataset.id);
            });
        });
        listEl.querySelectorAll('.xsact-combo-delete').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                var id = btn.closest('.xsact-combo-card').dataset.id;
                qiactConfirm({ title: QiActT('combo.delete_confirm_title'), body: QiActT('combo.delete_confirm_body'), confirmText: QiActT('combo.delete_confirm_btn'), danger: true }).then(function(ok) {
                    if (!ok) return;
                    deleteCombo(id); updateComboPanel(charObj);
                });
            });
        });
        var newBtn = listEl.querySelector('#xsact-new-combo-btn');
        if (newBtn) newBtn.addEventListener('click', function() {
            var c = addCombo(QiActT('combo.new_name'));
            startEditCombo(c.id);
        });
    }

