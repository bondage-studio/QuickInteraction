    /* ===== 模式切换（全员 / 收藏 / 自己） ===== */
    function toggleAllMode() {
        state.allModeActive = !state.allModeActive;
        if (state.allModeActive) {
            // 进入全员模式：临时压制「自己」模式（线框 + 开关视觉），
            // 但**只记录快照、不写记忆**——关闭全员后须恢复原本的值。
            state._selfModeSnapshot = state.selfModeActive;
            if (state.selfModeActive) {
                state.selfModeActive = false;
                updateSelfButtonVisual();
                if (state.isActive) refreshBodyGrids();
            }
        } else {
            // 退出全员模式：把「自己」模式恢复到进入前的值（含记忆），
            // 未开启过则维持关闭，绝不擅自改写。
            if (state._selfModeSnapshot) {
                state.selfModeActive = state._selfModeSnapshot;
                persist(S_SELF, state.selfModeActive);
                updateSelfButtonVisual();
                if (state.isActive) refreshBodyGrids();
            }
            state._selfModeSnapshot = false;
        }
        updateAllButtonVisual();
        renderPanel();
        toast(state.allModeActive ? QiActT('common.all_on') : QiActT('common.all_off'),
              state.allModeActive ? '#E8B339' : '#888');
    }
    function updateAllButtonVisual() {
        if (!state.actionPanelEl) return;
        var btn = state.actionPanelEl.querySelector('#xsact-all-btn');
        if (btn) btn.classList.toggle('on', state.allModeActive);
    }

    /** 收藏模式：点击动作时加入/取消收藏 */
    function toggleFavMode() {
        state.favModeActive = !state.favModeActive;
        updateFavButtonVisual();
        if (state.actionPanelEl) {
            var body = state.actionPanelEl.querySelector('#xsact-action-list');
            if (body) body.classList.toggle('fav-active', state.favModeActive);
        }
        toast(state.favModeActive ? QiActT('common.fav_on') : QiActT('common.fav_off'),
              state.favModeActive ? '#E8B339' : '#888');
    }
    function updateFavButtonVisual() {
        if (!state.actionPanelEl) return;
        var btn = state.actionPanelEl.querySelector('#xsact-fav-btn');
        if (!btn) return;
        btn.classList.toggle('on', state.favModeActive);
        var ico = btn.querySelector('.xsact-ico');
        if (ico) ico.outerHTML = svgIcon(state.favModeActive ? 'starFill' : 'star', 14);
    }
    function toggleInteractionGrid() {
        state.interactionGridActive = !state.interactionGridActive;
        persist(S_INTERACTION_GRID, state.interactionGridActive);
        updateInteractionGridVisual();
        if (state.interactionGridActive) refreshBodyGrids(); else clearBodyGrids();
    }
    function updateInteractionGridVisual() {
        if (!state.actionPanelEl) return;
        var btn = state.actionPanelEl.querySelector('#xsact-grid-btn');
        if (btn) btn.classList.toggle('on', state.interactionGridActive);
    }
    function toggleFavoriteAction(partGroup, name, btn) {
        partGroup = canonicalPartGroup(partGroup);
        var key = partGroup + '|' + name;
        var idx = state.favorites.indexOf(key);
        if (idx === -1) {
            state.favorites.push(key);
            toast(QiActT('common.fav_add', { name: getActivityLabel(name, partGroup) }), '#E8B339');
        } else {
            state.favorites.splice(idx, 1);
            toast(QiActT('common.fav_remove'), '#888');
        }
        persist(S_FAVS, state.favorites);
        if (btn) {
            var added = idx === -1;
            btn.classList.toggle('fav', added);
            var star = btn.querySelector('.xsact-action-star');
            if (added) {
                if (!star) {
                    star = document.createElement('span');
                    star.className = 'xsact-action-star';
                    star.innerHTML = svgIcon('starFill', 13);
                    btn.appendChild(star);
                }
            } else if (star) {
                star.remove();
            }
        } else if (state.selectedTarget && state.selectedPart && state.panelMode === 'part') {
            updateActionPanel(state.selectedTarget, state.selectedPart);
        }
    }

    /** 切换自己模式（纯开关：仅控制玩家自身线框的显隐，可记忆，不被目标选择改变） */
    function toggleSelfMode() {
        state.selfModeActive = !state.selfModeActive;
        if (state.selfModeActive) {
            // 开启自己模式时主动退出全员模式（互斥），并作废全员快照
            state.allModeActive = false;
            state._selfModeSnapshot = false;
            updateAllButtonVisual();
        }
        persist(S_SELF, state.selfModeActive);
        updateSelfButtonVisual();
        if (state.isActive) refreshBodyGrids(); // 即时显隐玩家自身线框
        if (state.panelMode === 'favorite') renderPanel();
        toast(state.selfModeActive ? QiActT('common.self_on') : QiActT('common.self_off'),
              state.selfModeActive ? '#46E0A0' : '#888');
    }
    function updateSelfButtonVisual() {
        if (!state.actionPanelEl) return;
        var btn = state.actionPanelEl.querySelector('#xsact-self-btn');
        if (btn) btn.classList.toggle('on', state.selfModeActive);
    }

    /** 清空全部收藏动作 */
    function clearAllFavorites() {
        if (!Array.isArray(state.favorites) || state.favorites.length === 0) { toast(QiActT('common.no_fav'), '#888'); return; }
        qiactConfirm({
            title: QiActT('common.clear_fav_title'),
            body: QiActT('common.clear_fav_body'),
            confirmText: QiActT('common.clear_fav_confirm'),
            danger: true
        }).then(function(ok) {
            if (!ok) return;
            state.favorites = [];
            persist(S_FAVS, state.favorites);
            renderPanel();
            toast(QiActT('common.cleared_fav'), '#888');
        });
    }

    /** Toast 提示 */
    /* ===== 8. 提示与反馈 ===== */
    function toast(msg, color) {
        color = color || '#FF5C7A';
        try {
            if (window.Liko && window.Liko.__Sys_Toast__) {
                window.Liko.__Sys_Toast__(msg, 2000, color);
                return;
            }
        } catch (_) { /* 忽略：Liko toast 不可用时下方 DOM 兜底仍执行 */ }
        // fallback: 创建简单提示
        var el = document.getElementById('xsact-qa-toast');
        if (!el) {
            el = document.createElement('div');
            el.id = 'xsact-qa-toast';
            el.style.cssText = 'position:fixed;top:80px;left:50%;transform:translateX(-50%);z-index:99999;padding:8px 16px;border-radius:8px;font-size:13px;color:#fff;font-family:-apple-system,sans-serif;pointer-events:none;transition:opacity 0.3s;';
            document.body.appendChild(el);
        }
        el.textContent = msg;
        el.style.background = color;
        el.style.opacity = '1';
        clearTimeout(el._timer);
        el._timer = setTimeout(() => { el.style.opacity = '0'; }, 2000);
    }

    /**
     * 统一确认模态（暗色玫红，替代浏览器原生 confirm）
     *  - 异步：返回 Promise<boolean>，true=确定，false=取消/关闭
     *  - 支持：title / body / confirmText / cancelText / danger
     *  - 交互：ESC 键、点遮罩、点取消 → false；点确定 → true
     */
    function qiactConfirm(opts) {
        opts = opts || {};
        return new Promise(function(resolve) {
            // 同一时刻只允许一个确认框
            var existing = document.getElementById('xsact-confirm');
            if (existing) existing.remove();

            var title = String(opts.title || QiActT('common.confirm_title'));
            var body = opts.body ? String(opts.body) : '';
            var confirmText = String(opts.confirmText || QiActT('common.confirm_ok'));
            var cancelText = String(opts.cancelText || QiActT('common.confirm_cancel'));
            var danger = opts.danger !== false; // 默认危险操作（玫红强调）

            var box = document.createElement('div');
            box.id = 'xsact-confirm';
            box.className = 'xsact-confirm';
            box.innerHTML =
                '<div class="xsact-confirm-box" role="dialog" aria-modal="true">' +
                    '<div class="xsact-confirm-title"></div>' +
                    (body ? '<div class="xsact-confirm-body"></div>' : '') +
                    '<div class="xsact-confirm-footer">' +
                        '<button class="xsact-confirm-btn xsact-confirm-cancel" type="button"></button>' +
                        '<button class="xsact-confirm-btn xsact-confirm-ok' + (danger ? ' is-danger' : '') + '" type="button"></button>' +
                    '</div>' +
                '</div>';
            box.querySelector('.xsact-confirm-title').textContent = title;
            if (body) box.querySelector('.xsact-confirm-body').textContent = body;
            box.querySelector('.xsact-confirm-cancel').textContent = cancelText;
            box.querySelector('.xsact-confirm-ok').textContent = confirmText;

            function done(result) {
                document.removeEventListener('keydown', onKey);
                if (box.parentNode) box.parentNode.removeChild(box);
                resolve(result);
            }
            function onKey(e) {
                if (e.key === 'Escape') { e.preventDefault(); done(false); }
                else if (e.key === 'Enter') { e.preventDefault(); done(true); }
            }
            // 监听加在 box 自身（capture 阶段），绕开 BC 页面在 body/document 层的 keydown 拦截
            box.addEventListener('keydown', onKey, true);
            // 兜底：document 上也监听（正常浏览器中点 modal 内元素后 Esc 应能冒泡到此）
            document.addEventListener('keydown', onKey, false);
            box.addEventListener('click', function(e) {
                if (e.target === box) done(false); // 点击遮罩
            });
            box.querySelector('.xsact-confirm-cancel').addEventListener('click', function() { done(false); });
            box.querySelector('.xsact-confirm-ok').addEventListener('click', function() { done(true); });

            document.body.appendChild(box);
            // 自动 focus 到确定按钮，回车即确认
            setTimeout(function() {
                var ok = box.querySelector('.xsact-confirm-ok');
                if (ok) ok.focus();
            }, 30);
        });
    }

    // 兼容旧版 confirm 调用（同步返回，仅用于不支持 Promise 的旧位置；新代码用 qiactConfirm）
    function qiactConfirmSync(opts) {
        // 兼容：极少数老调用方是同步 if(confirm(...)) 写法。
        // 这里用全局锁 + 轮询检测，**不推荐**新代码使用。
        var _qiactConfirmPending = null;
        // 实际上当前没有调用方使用 confirm()，所以这是预留接口
        return qiactConfirm(opts);
    }

    // ════════════════════════════════════════════════════════════════════════
    // 切换按钮（DOM 固定定位，永远可见）
    // ════════════════════════════════════════════════════════════════════════

    /** 创建 DOM 切换按钮 */
