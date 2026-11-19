    /* ===== 隐藏全量动作面板（Shift+Q 长按 3 秒开启 · 强制执行） ===== */
    /* 设计：零 UI 入口，纯键盘长按唤出；列出 BC 全部动作（无视道具/状态/部位可用性），
       按部位折叠分组；目标可选自己/选中/全员；全员执行需二次确认。
       强制执行仅在本面板点击时给 executeAction 传 force=true，其他路径完全不受影响。 */

    var forcePanelEl = null;
    var forcePanelOpen = false;
    var forcePanelTarget = 'selected'; // 'self' | 'selected' | 'all'
    var forceGroupOpen = {};           // 部位分组展开状态
    var longPressTimer = null;
    var longPressActive = false;
    var LONG_PRESS_MS = 3000;

    /** 从 BC 全量活动表枚举所有动作，按部位分组（无视当前可用性） */
    function collectAllActionsForForcePanel() {
        var raw = (typeof caRawAllActivities === 'function')
            ? caRawAllActivities((typeof Player !== 'undefined' && Player && Player.AssetFamily) || 'Female3DCG')
            : [];
        if (!Array.isArray(raw)) return [];
        var byGroup = {};
        raw.forEach(function(a) {
            if (!a || !a.Name) return;
            // 目标部位：Target（对他人）+ TargetSelf（对自己）都算，全部列出
            var targets = [];
            [a.Target, a.TargetSelf].forEach(function(t) {
                if (!t) return;
                if (Array.isArray(t)) t.forEach(function(x) { if (x && targets.indexOf(x) < 0) targets.push(x); });
                else if (targets.indexOf(t) < 0) targets.push(t);
            });
            if (!targets.length) targets.push('ItemMisc');
            var label = (typeof getActivityLabelFallback === 'function')
                ? getActivityLabelFallback(a.Name, targets[0]) : a.Name;
            var entry = { name: a.Name, label: label || a.Name, groups: targets };
            targets.forEach(function(g) {
                (byGroup[g] = byGroup[g] || []).push(entry);
            });
        });
        return BODY_PARTS.map(function(part) {
            return { group: part.group, label: part.label, actions: byGroup[part.group] || [] };
        }).filter(function(g) { return g.actions.length > 0; });
    }

    /** 目标角色列表（自己/选中/全员） */
    function forcePanelTargets() {
        var chars = [];
        if (forcePanelTarget === 'self') {
            if (typeof Player !== 'undefined' && Player) chars = [Player];
        } else if (forcePanelTarget === 'all') {
            chars = (typeof getRoomCharacters === 'function' ? getRoomCharacters() : []) || [];
            chars = chars.filter(function(c) {
                return c && !(typeof Player !== 'undefined' && Player && c.MemberNumber === Player.MemberNumber);
            });
        } else {
            if (state.selectedTarget) chars = [state.selectedTarget];
            else if (typeof Player !== 'undefined' && Player) chars = [Player];
        }
        return chars.filter(Boolean);
    }

    function openForcePanel() {
        if (forcePanelOpen) { closeForcePanel(); return; }
        if (typeof CurrentScreen !== 'undefined' && CurrentScreen !== 'ChatRoom') return;
        forcePanelOpen = true;
        forcePanelEl = document.createElement('div');
        forcePanelEl.id = 'xsact-force-panel';
        forcePanelEl.className = 'xsact-force-panel';
        document.body.appendChild(forcePanelEl);
        renderForcePanel();
    }

    function closeForcePanel() {
        forcePanelOpen = false;
        if (forcePanelEl && forcePanelEl.parentNode) forcePanelEl.parentNode.removeChild(forcePanelEl);
        forcePanelEl = null;
    }

    function renderForcePanel() {
        if (!forcePanelEl) return;
        var groups = collectAllActionsForForcePanel();
        var total = groups.reduce(function(n, g) { return n + g.actions.length; }, 0);
        var targetBtns = [
            { k: 'self', label: QiActT('force.target_self') },
            { k: 'selected', label: QiActT('force.target_selected') },
            { k: 'all', label: QiActT('force.target_all') }
        ].map(function(t) {
            return '<button type="button" class="xsact-force-target' + (forcePanelTarget === t.k ? ' active' : '') + '" data-target="' + t.k + '">' + escapeHtml(t.label) + '</button>';
        }).join('');
        var html = '<div class="xsact-force-head">' +
            '<span class="xsact-force-title">' + QiActT('force.title', { n: total }) + '</span>' +
            '<button type="button" class="xsact-force-close" title="' + QiActT('force.close') + '">×</button></div>' +
            '<div class="xsact-force-targets">' + targetBtns + '</div>' +
            '<div class="xsact-force-warn">' + QiActT('force.warn') + '</div>' +
            '<div class="xsact-force-groups">';
        groups.forEach(function(g) {
            var open = !!forceGroupOpen[g.group];
            html += '<div class="xsact-force-group" data-group="' + escapeHtml(g.group) + '">' +
                '<button type="button" class="xsact-force-group-head">' + (open ? '▾ ' : '▸ ') + escapeHtml(g.label) + ' <span class="xsact-force-group-count">' + g.actions.length + '</span></button>';
            if (open) {
                html += '<div class="xsact-force-actions">';
                g.actions.forEach(function(a) {
                    html += '<button type="button" class="xsact-force-action" data-name="' + escapeHtml(a.name) + '" data-group="' + escapeHtml(g.group) + '" title="' + escapeHtml(a.name) + '">' + escapeHtml(a.label) + '</button>';
                });
                html += '</div>';
            }
            html += '</div>';
        });
        html += '</div>';
        forcePanelEl.innerHTML = html;

        forcePanelEl.querySelector('.xsact-force-close').addEventListener('click', closeForcePanel);
        forcePanelEl.querySelectorAll('.xsact-force-target').forEach(function(btn) {
            btn.addEventListener('click', function() {
                forcePanelTarget = btn.dataset.target;
                renderForcePanel();
            });
        });
        forcePanelEl.querySelectorAll('.xsact-force-group-head').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var g = btn.closest('.xsact-force-group').dataset.group;
                forceGroupOpen[g] = !forceGroupOpen[g];
                renderForcePanel();
            });
        });
        forcePanelEl.querySelectorAll('.xsact-force-action').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var name = btn.dataset.name;
                var group = btn.dataset.group;
                var chars = forcePanelTargets();
                if (!chars.length) { toast(QiActT('toast.no_others'), '#888'); return; }
                if (forcePanelTarget === 'all') {
                    qiactConfirm({
                        title: QiActT('force.confirm_all_title'),
                        body: QiActT('force.confirm_all_body', { n: chars.length, name: name }),
                        confirmText: QiActT('force.confirm_ok'),
                        danger: true
                    }).then(function(ok) { if (ok) runForceAction(chars, name, group); });
                } else {
                    runForceAction(chars, name, group);
                }
            });
        });
    }

    /** 对目标列表强制执行一个动作 */
    function runForceAction(chars, name, group) {
        var done = 0;
        chars.forEach(function(c) {
            executeAction(c, name, null, group, true); // force=true
            done++;
        });
        toast(QiActT('force.executed', { n: done, name: name }), '#FF5C7A');
    }

    /** Shift+Q 长按 3 秒守卫：只在聊天室、非输入框生效；松开/中断即取消 */
    function bindForcePanelShortcut() {
        addRuntimeListener(document, 'keydown', function(e) {
            if (forcePanelOpen) return;
            var isQ = (e.key || '').toLowerCase() === 'q';
            if (!isQ || !e.shiftKey || e.altKey || e.ctrlKey || e.metaKey) { cancelLongPress(); return; }
            var t = e.target;
            if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) { cancelLongPress(); return; }
            if (typeof CurrentScreen !== 'undefined' && CurrentScreen !== 'ChatRoom') { cancelLongPress(); return; }
            if (longPressActive) return;
            longPressActive = true;
            longPressTimer = runtime && runtime.timeout
                ? runtime.timeout(function() { longPressActive = false; longPressTimer = null; openForcePanel(); }, LONG_PRESS_MS)
                : setTimeout(function() { longPressActive = false; longPressTimer = null; openForcePanel(); }, LONG_PRESS_MS);
        });
        addRuntimeListener(document, 'keyup', function(e) {
            if ((e.key || '').toLowerCase() === 'q') cancelLongPress();
        });
        addRuntimeListener(window, 'blur', cancelLongPress);
    }
    function cancelLongPress() {
        longPressActive = false;
        if (longPressTimer) { try { clearTimeout(longPressTimer); } catch (_) {} longPressTimer = null; }
    }
