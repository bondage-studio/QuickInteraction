    /* ===== 9. 浮动开关（闪电按钮 + 拖拽 + 可见性守卫） ===== */
    function createToggleButton() {
        if (state.toggleBtnEl) return;
        state.toggleBtnEl = document.createElement('button');
        state.toggleBtnEl.id = 'xsact-toggle-btn';
        state.toggleBtnEl.innerHTML =
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h7l-1 8 10-12h-7z"/></svg>';
        state.toggleBtnEl.title = state.isActive ? QiActT('ui.toggle_off') : QiActT('ui.toggle_on');
        state.toggleBtnEl.addEventListener('click', function(e) {
            if (state.toggleDragged) {
                e.stopPropagation();
                e.preventDefault();
                state.toggleDragged = false;
                return;
            }
            e.stopPropagation();
            toggleActionMode();
            updateToggleBtnStyle();
        });
        document.body.appendChild(state.toggleBtnEl);
        applyTogglePosition();
        makeToggleDraggable();
        updateToggleBtnStyle();
    }

    /** 读取并应用保存的闪电按钮位置 */
    function applyTogglePosition() {
        var btn = state.toggleBtnEl;
        if (!btn) return;
        var pos = loadSetting(S_TOGGLE_POS, null);
        if (pos && typeof pos.left === 'number' && typeof pos.top === 'number') {
            btn.style.left = pos.left + 'px';
            btn.style.top = pos.top + 'px';
            btn.style.right = 'auto';
            btn.style.bottom = 'auto';
        }
    }

    /** 持久化闪电按钮位置 */
    function persistTogglePosition() {
        var btn = state.toggleBtnEl;
        if (!btn) return;
        var rect = btn.getBoundingClientRect();
        persist(S_TOGGLE_POS, { left: Math.round(rect.left), top: Math.round(rect.top) });
    }

    /** 让闪电按钮可拖拽；短按仍是打开/关闭，拖动则不触发打开 */
    function makeToggleDraggable() {
        var btn = state.toggleBtnEl;
        if (!btn) return;
        var startX, startY, startLeft, startTop;
        var DRAG_THRESHOLD = 5;

        function onDown(e) {
            var ev = e.touches ? e.touches[0] : e;
            startX = ev.clientX;
            startY = ev.clientY;
            state.toggleDragged = false;
            var rect = btn.getBoundingClientRect();
            startLeft = rect.left;
            startTop = rect.top;
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
            document.addEventListener('touchmove', onMove, { passive: false });
            document.addEventListener('touchend', onUp);
        }

        function onMove(e) {
            var ev = e.touches ? e.touches[0] : e;
            var dx = ev.clientX - startX;
            var dy = ev.clientY - startY;
            if (!state.toggleDragged && Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD) {
                state.toggleDragged = true;
            }
            if (state.toggleDragged) {
                e.preventDefault();
                btn.style.left = Math.max(0, Math.min(window.innerWidth - btn.offsetWidth, startLeft + dx)) + 'px';
                btn.style.top = Math.max(0, Math.min(window.innerHeight - btn.offsetHeight, startTop + dy)) + 'px';
                btn.style.right = 'auto';
                btn.style.bottom = 'auto';
            }
        }

        function onUp(e) {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
            document.removeEventListener('touchmove', onMove);
            document.removeEventListener('touchend', onUp);
            if (state.toggleDragged) {
                e.preventDefault();
                e.stopPropagation();
                persistTogglePosition();
            }
        }

        btn.addEventListener('mousedown', onDown);
        btn.addEventListener('touchstart', onDown, { passive: false });
    }

    /** 更新按钮外观状态 */
    function updateToggleBtnStyle() {
        if (!state.toggleBtnEl) return;
        if (state.isActive) {
            state.toggleBtnEl.classList.add('active');
            state.toggleBtnEl.title = QiActT('ui.toggle_on_active');
        } else {
            state.toggleBtnEl.classList.remove('active');
            state.toggleBtnEl.title = QiActT('ui.toggle_on');
        }
    }

    /** 兼容旧接口：DrawProcess hook 调用（确保聊天室内闪电图标常驻可见） */
    function drawToggleButton() {
        // 按钮可能被意外移出 DOM，或仅被隐藏 —— 两种情况都要恢复
        if (!state.toggleBtnEl || !document.body.contains(state.toggleBtnEl)) {
            state.toggleBtnEl = null;
            createToggleButton();
        }
        if (state.toggleBtnEl) {
            state.toggleBtnEl.style.display = '';
        }
    }

    /** 可见性守卫：聊天室内确保按钮存在且可见，离开界面则隐藏。
     *  不依赖 DrawProcess hook（BC 打包后 hookFunction 对该转发函数无效）。 */
    function guardToggleVisibility() {
        if (typeof CurrentScreen === 'undefined') return;
        if (CurrentScreen === 'ChatRoom') {
            drawToggleButton();                 // 创建(若需) + 恢复 display
        } else if (state.toggleBtnEl) {
            state.toggleBtnEl.style.display = 'none';
        }
    }
    function startVisibilityGuard() {
        if (window.__QiAct_VisGuard) { try { clearInterval(window.__QiAct_VisGuard); } catch (_) { /* 忽略：清理旧定时器失败无影响 */ } }
        window.__QiAct_VisGuard = setInterval(guardToggleVisibility, 500);
    }

    // ════════════════════════════════════════════════════════════════════════
    // 动作模式 UI — 核心
    // ════════════════════════════════════════════════════════════════════════

    /**
     * 进入/退出动作模式
     */
