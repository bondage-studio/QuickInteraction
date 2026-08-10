    /* ===== 10. 动作模式生命周期 ===== */
    function toggleActionMode() {
        state.isActive = !state.isActive;
        persist(S_ENABLED, state.isActive);

        if (state.isActive) enterActionMode();
        else exitActionMode();

        drawToggleButton();
    }

    function enterActionMode() {
        logD('进入动作模式');
        state.isActive = true;
        persist(S_ENABLED, true);

        // 防御：清除所有残留的旧 UI（重复注入/历史模块可能导致多份面板），
        // 确保单实例，避免动作被写进隐藏的旧面板
        document.querySelectorAll('#xsact-qa-overlay').forEach(function(el) { el.remove(); });
        document.querySelectorAll('#xsact-qa-panel').forEach(function(el) { el.remove(); });
        state.actionPanelEl = null;

        // 创建右侧面板
        if (!state.actionPanelEl) {
            state.actionPanelEl = document.createElement('div');
            state.actionPanelEl.id = 'xsact-qa-panel';
            state.actionPanelEl.innerHTML = buildPanelHTML();
            document.body.appendChild(state.actionPanelEl);
            bindPanelEvents(state.actionPanelEl);
            makeDraggable(state.actionPanelEl);
            makeResizable(state.actionPanelEl);
        }
        // 恢复上次使用的模式（首次无记录则默认「单部位」）
        var savedMode = loadSetting(S_MODE, 'part');
        if (!/^(part|combo|custom)$/.test(savedMode)) savedMode = 'part';
        state.panelMode = savedMode;
        state.actionPanelEl.querySelectorAll('.xsact-mode-tab').forEach(function(tab) {
            tab.classList.toggle('active', tab.dataset.mode === state.panelMode);
        });
        state.actionPanelEl.style.display = '';
        applyPanelSize();
        applyPanelPosition();
        renderPanel();
        renderPendingBanner();
        checkUpdate().catch(function(e) { console.warn('[QiAct] 更新检查失败（已忽略）:', e && e.message); });

        // 恢复自己模式开关状态
        state.selfModeActive = loadSetting(S_SELF, false);
        updateSelfButtonVisual();


        // 为每个角色创建身体部位浮动网格，并同步渲染人物列表
        refreshBodyGrids();
        renderCharList();
        updateAllButtonVisual();
        updateFavButtonVisual();

        toast(QiActT('common.enter_mode'), '#FF5C7A');
    }

    function exitActionMode() {
        logD('退出动作模式');

        if (state.actionPanelEl) {
            state.actionPanelEl.style.display = 'none';
        }

        // 清除所有浮动网格
        clearBodyGrids();

        state.selectedTarget = null;
        state.selectedPart = null;
        state.selectedAction = null;
        state.selectedActionItem = null;
        state.editingComboId = null;
        state.allModeActive = false;

        toast(QiActT('common.exit_mode'), '#888');
    }

    /** 语言切换后重建面板（重渲染所有 QiActT 文案），不重置选择/模式/位置 */
    function rebuildPanel() {
        if (!state.actionPanelEl) { if (typeof enterActionMode === 'function') enterActionMode(); return; }
        // 移除旧面板再重建，避免重复绑定事件（与 enterActionMode 防御一致）
        if (state.actionPanelEl.parentNode) state.actionPanelEl.parentNode.removeChild(state.actionPanelEl);
        state.actionPanelEl = document.createElement('div');
        state.actionPanelEl.id = 'xsact-qa-panel';
        state.actionPanelEl.innerHTML = buildPanelHTML();
        document.body.appendChild(state.actionPanelEl);
        bindPanelEvents(state.actionPanelEl);
        makeDraggable(state.actionPanelEl);
        makeResizable(state.actionPanelEl);
        // 恢复当前模式高亮
        var savedMode = state.panelMode || 'part';
        state.actionPanelEl.querySelectorAll('.xsact-mode-tab').forEach(function(tab) {
            tab.classList.toggle('active', tab.dataset.mode === savedMode);
        });
        state.actionPanelEl.style.display = '';
        applyPanelSize();
        applyPanelPosition();
        renderPanel();
        // 同步刷新人物列表（含 QiActT 文案）
        try { if (typeof renderCharList === 'function') renderCharList(); } catch (_) { /* 忽略 */ }
    }

    /** 构建右侧面板 HTML */
