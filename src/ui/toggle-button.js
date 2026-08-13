    /* ===== 浮动开关（闪电按钮 + 拖拽 + 可见性守卫） ===== */
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

    function createChatRoomToggleButton() {
        var btn = document.createElement('button');
        btn.id = 'xsact-toggle-btn'; btn.type = 'button';
        // 不加 HideOnPopup：那是 BC 的「彈窗時隱藏」機制，會在打開任意對話框/主頁面時把按鈕藏掉，
        // 且關閉後常無法可靠復原（本按鈕的顯隱同時被協調器收合邏輯與 guard 迴圈接管，三方打架）。
        // 想要的「跟隨收納列收合」由 registerChatRoomToggle 的 opts 不帶 collapse:false（即跟隨收合）達成。
        btn.className = 'blank-button button chat-room-button xsact-chat-toggle';
        btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h7l-1 8 10-12h-7z"/></svg>';
        btn.addEventListener('click', function(e) { e.preventDefault(); e.stopPropagation(); toggleActionMode(); updateToggleBtnStyle(); });
        state.toggleBtnEl = btn; updateToggleBtnStyle(); return btn;
    }
    function registerChatRoomToggle() {
        var L = window.Liko = window.Liko || {};
        var spec = {
            id: 'quick-interaction', order: 50, createButton: createChatRoomToggleButton, plain: true,
            tooltip: QiActT('ui.toggle_on'), background: '#FF5C7A', border: 'none',
            active: { tooltip: QiActT('ui.toggle_on_active'), background: '#46E0A0', color: '#ffffff', border: 'none' },
            state: { active: state.isActive }
        };
        if (L.__Sys_ChatRoomButtons__ && L.__Sys_ChatRoomButtons__.add) {
            L.__Sys_ChatRoomButtons__.add(spec);
        }
        else {
            L.__CRB_pending__ = L.__CRB_pending__ || []; if (!L.__CRB_pending__.some(function(x) { return x && x.id === spec.id; })) L.__CRB_pending__.push(spec);
            if (!L.__QiActCRBLoading) {
                L.__QiActCRBLoading = fetch('https://raw.githubusercontent.com/awdrrawd/liko-Plugin-Repository/main/Plugins/expand/BC_ChatRoomButtons.js', { cache:'no-store' }).then(function(r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); }).then(function(code) { var s = document.createElement('script'); s.textContent = code; document.head.appendChild(s); }).catch(function(e) { console.warn('[QiAct] BC_ChatRoomButtons:', e && e.message); });
            }
        }
    }
    function setChatButtonDocked(on) {
        state.chatButtonDocked = !!on; persist(S_CHAT_BUTTON, state.chatButtonDocked);
        if (state.toggleBtnEl && state.toggleBtnEl.parentNode) state.toggleBtnEl.parentNode.removeChild(state.toggleBtnEl);
        state.toggleBtnEl = null;
        var crb = window.Liko && window.Liko.__Sys_ChatRoomButtons__;
        if (state.chatButtonDocked) registerChatRoomToggle();
        else { if (crb && crb.remove) crb.remove('quick-interaction'); var q = window.Liko && window.Liko.__CRB_pending__; if (Array.isArray(q)) window.Liko.__CRB_pending__ = q.filter(function(x) { return !x || x.id !== 'quick-interaction'; }); drawToggleButton(); }
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
        var tooltip = state.isActive ? QiActT('ui.toggle_on_active') : QiActT('ui.toggle_on');
        if (state.isActive) {
            state.toggleBtnEl.classList.add('active');
        } else {
            state.toggleBtnEl.classList.remove('active');
        }
        var crb = window.Liko && window.Liko.__Sys_ChatRoomButtons__;
        if (state.chatButtonDocked) {
            state.toggleBtnEl.removeAttribute('title');
            if (crb && crb.setState) crb.setState('quick-interaction', { active: state.isActive, tooltip: tooltip, border: 'none' });
        } else {
            state.toggleBtnEl.title = tooltip;
        }
    }

    /** 兼容旧接口：DrawProcess hook 调用（确保聊天室内闪电图标常驻可见） */
    function drawToggleButton() {
        if (state.chatButtonDocked) { if (!state.toggleBtnEl || !document.documentElement.contains(state.toggleBtnEl)) registerChatRoomToggle(); if (state.toggleBtnEl) updateToggleBtnStyle(); return; }
        // 按钮可能被意外移出 DOM，或仅被隐藏 —— 两种情况都要恢复
        if (!state.toggleBtnEl || !document.body.contains(state.toggleBtnEl)) {
            state.toggleBtnEl = null;
            createToggleButton();
        }
        if (state.toggleBtnEl) {
            state.toggleBtnEl.style.display = '';
            updateToggleBtnStyle();
        }
    }

    /** 可见性守卫：聊天室内确保按钮存在且可见，离开界面则隐藏。
     *  不依赖 DrawProcess hook（BC 打包后 hookFunction 对该转发函数无效）。 */
    function guardToggleVisibility() {
        if (state.disposed || (runtime && runtime.disposed)) return;
        if (typeof CurrentScreen === 'undefined') return;
        // 收纳模式的显示、隐藏和容器重建完全交给 BC_ChatRoomButtons 管理。
        if (state.chatButtonDocked) {
            if (CurrentScreen === 'ChatRoom') drawToggleButton();
            return;
        }
        if (CurrentScreen === 'ChatRoom') {
            drawToggleButton();                 // 创建(若需) + 恢复 display
        } else if (state.toggleBtnEl) {
            state.toggleBtnEl.style.display = 'none';
        }
    }
    function startVisibilityGuard() {
        if (state.screenLifecycleHooked) return;
        if (window.__QiAct_VisGuard) { try { clearInterval(window.__QiAct_VisGuard); } catch (_) { /* 忽略：清理旧定时器失败无影响 */ } }
        window.__QiAct_VisGuard = runtime && runtime.interval
            ? runtime.interval(guardToggleVisibility, 2000)
            : setInterval(guardToggleVisibility, 2000);
    }

    // ════════════════════════════════════════════════════════════════════════
    // 动作模式 UI — 核心
    // ════════════════════════════════════════════════════════════════════════

    /**
     * 进入/退出动作模式
     */
