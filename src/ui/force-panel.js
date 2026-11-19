    /* ===== 隐藏全量动作面板（Shift+Q 长按 3 秒开启 · 强制执行） ===== */
    /* 交互与主面板同源：左侧人物列表 → 点人选身体线框部位 → 右侧列该部位全部动作。
       点动作=对选中角色强制执行；顶部「全员」=对全房间强制执行当前选中动作（带二次确认）。
       窗口标题栏可拖动。零 UI 入口，纯键盘长按唤出。
       强制执行仅在本面板点击时给 executeAction 传 force=true，其他路径完全不受影响。 */

    var forcePanelEl = null;
    var forcePanelOpen = false;
    var forcePanelChar = null;      // 当前选中的角色
    var forcePanelPart = null;      // 当前选中的部位 Group
    var forcePanelView = 'chars';   // 'chars' 人物列表 | 'parts' 身体线框
    var forcePanelAction = null;    // 当前选中的动作名（供「全员」复用）
    var longPressTimer = null;
    var longPressActive = false;
    var LONG_PRESS_MS = 3000;

    /** 从 BC 全量活动表枚举指定部位的动作（无视当前可用性） */
    function forceActionsForPart(partGroup) {
        var raw = (typeof caRawAllActivities === 'function')
            ? caRawAllActivities((typeof Player !== 'undefined' && Player && Player.AssetFamily) || 'Female3DCG')
            : [];
        if (!Array.isArray(raw)) return [];
        var family = (typeof getPartGroupFamily === 'function') ? getPartGroupFamily(partGroup) : [partGroup];
        var out = [];
        var seen = {};
        raw.forEach(function(a) {
            if (!a || !a.Name) return;
            var targets = [];
            [a.Target, a.TargetSelf].forEach(function(t) {
                if (!t) return;
                if (Array.isArray(t)) t.forEach(function(x) { if (x && targets.indexOf(x) < 0) targets.push(x); });
                else if (targets.indexOf(t) < 0) targets.push(t);
            });
            var hit = targets.some(function(t) { return family.indexOf(t) >= 0; });
            if (!hit) return;
            if (seen[a.Name]) return;
            seen[a.Name] = true;
            var label = (typeof getActivityLabelFallback === 'function')
                ? getActivityLabelFallback(a.Name, partGroup) : a.Name;
            out.push({ name: a.Name, label: label || a.Name });
        });
        return out;
    }

    function forceRoomCharacters() {
        return (typeof getRoomCharacters === 'function') ? getRoomCharacters(true) : [];
    }

    function openForcePanel() {
        if (forcePanelOpen) { closeForcePanel(); return; }
        if (typeof CurrentScreen !== 'undefined' && CurrentScreen !== 'ChatRoom') return;
        forcePanelOpen = true;
        forcePanelChar = null;
        forcePanelPart = null;
        forcePanelAction = null;
        forcePanelView = 'chars';
        forcePanelEl = document.createElement('div');
        forcePanelEl.id = 'xsact-force-panel';
        forcePanelEl.className = 'xsact-force-panel';
        document.body.appendChild(forcePanelEl);
        // 首次打开按视口居中（用 left/top 定位，与拖动坐标统一）
        var vw = (typeof panelViewport === 'function') ? panelViewport() : { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
        var w = forcePanelEl.offsetWidth || 760;
        forcePanelEl.style.left = Math.max(vw.left, vw.left + (vw.width - w) / 2) + 'px';
        renderForcePanel();
        bindForcePanelDrag();
    }

    function closeForcePanel() {
        forcePanelOpen = false;
        if (forcePanelEl && forcePanelEl.parentNode) forcePanelEl.parentNode.removeChild(forcePanelEl);
        forcePanelEl = null;
    }

    function renderForcePanel() {
        if (!forcePanelEl) return;
        var leftHtml = forcePanelView === 'chars' ? forceCharListHTML() : forceBodyPartsHTML();
        var rightHtml = forcePanelPart ? forceActionsHTML(forcePanelPart) : forceEmptyActionsHTML();
        forcePanelEl.innerHTML =
            '<div class="xsact-force-head" id="xsact-force-head">' +
                '<span class="xsact-force-title">' + QiActT('force.title') + '</span>' +
                '<span class="xsact-force-head-btns">' +
                    '<button type="button" class="xsact-force-all" title="' + QiActT('force.target_all_hint') + '">' + QiActT('force.target_all') + '</button>' +
                    '<button type="button" class="xsact-force-close" title="' + QiActT('force.close') + '">×</button>' +
                '</span>' +
            '</div>' +
            '<div class="xsact-force-warn">' + QiActT('force.warn') + '</div>' +
            '<div class="xsact-force-body">' +
                '<div class="xsact-force-left">' + leftHtml + '</div>' +
                '<div class="xsact-force-right">' + rightHtml + '</div>' +
            '</div>';
        bindForcePanelEvents();
    }

    /** 左栏：人物列表（与主面板同源，含自己） */
    function forceCharListHTML() {
        var chars = forceRoomCharacters().slice();
        chars.sort(function(a, b) {
            var aSelf = a.IsPlayer && a.IsPlayer(), bSelf = b.IsPlayer && b.IsPlayer();
            return aSelf === bSelf ? 0 : (aSelf ? -1 : 1);
        });
        var html = '<div class="xsact-force-subtitle">' + QiActT('ui.chars') + '</div>';
        if (!chars.length) return html + '<div class="xsact-qa-empty">' + QiActT('target.empty') + '</div>';
        html += '<div class="xsact-force-chars">';
        chars.forEach(function(c) {
            var isSelf = c.IsPlayer && c.IsPlayer();
            html += '<div class="xsact-force-char' + (isSelf ? ' self' : '') + '" data-mn="' + c.MemberNumber + '">' +
                '<span>' + escapeHtml(characterDisplayName(c) + ' (' + c.MemberNumber + ')') + '</span>' +
                (isSelf ? '<em>' + QiActT('common.self') + '</em>' : '') +
                '</div>';
        });
        html += '</div>';
        return html;
    }

    /** 左栏：身体部位线框（与主面板同源的矩形 Zone SVG） */
    function forceBodyPartsHTML() {
        var svg = (typeof buildBodyZoneSvg === 'function')
            ? buildBodyZoneSvg(forcePanelChar, forcePanelPart, 'xsact-body-svg', 16, 0.4)
            : '';
        return '<div class="xsact-force-subtitle">' +
                    '<button type="button" class="xsact-force-back">‹ ' + QiActT('ui.chars') + '</button>' +
                    escapeHtml(characterDisplayName(forcePanelChar) || '?') +
                '</div>' +
                '<div class="xsact-body-select">' + svg + '</div>';
    }

    /** 右栏：某部位的全量动作 */
    function forceActionsHTML(partGroup) {
        var actions = forceActionsForPart(partGroup);
        var partLabel = (BODY_PARTS.find(function(p) { return p.group === partGroup; }) || {}).label || partGroup;
        var html = '<div class="xsact-force-subtitle">' + escapeHtml(partLabel) + ' · ' + QiActT('force.action_count', { n: actions.length }) + '</div>';
        if (!actions.length) return html + '<div class="xsact-qa-empty">' + QiActT('render.no_actions') + '</div>';
        html += '<div class="xsact-force-actions">';
        actions.forEach(function(a) {
            var sel = (forcePanelAction === a.name) ? ' selected' : '';
            html += '<button type="button" class="xsact-force-action' + sel + '" data-name="' + escapeHtml(a.name) + '" title="' + escapeHtml(a.name) + '">' +
                '<span>' + escapeHtml(a.label) + '</span><em>' + QiActT('force.badge') + '</em></button>';
        });
        html += '</div>';
        return html;
    }

    function forceEmptyActionsHTML() {
        return '<div class="xsact-qa-empty">' + QiActT('force.pick_char_part') + '</div>';
    }

    function bindForcePanelEvents() {
        if (!forcePanelEl) return;
        var closeBtn = forcePanelEl.querySelector('.xsact-force-close');
        if (closeBtn) closeBtn.addEventListener('click', closeForcePanel);
        var allBtn = forcePanelEl.querySelector('.xsact-force-all');
        if (allBtn) allBtn.addEventListener('click', forceRunOnRoomAll);
        var backBtn = forcePanelEl.querySelector('.xsact-force-back');
        if (backBtn) backBtn.addEventListener('click', function() {
            forcePanelView = 'chars'; forcePanelPart = null; renderForcePanel();
        });
        forcePanelEl.querySelectorAll('.xsact-force-char').forEach(function(item) {
            item.addEventListener('click', function(e) {
                e.stopPropagation();
                var mn = parseInt(item.dataset.mn, 10);
                var c = forceRoomCharacters().find(function(x) { return x.MemberNumber === mn; });
                if (!c) return;
                forcePanelChar = c;
                forcePanelPart = null;
                forcePanelAction = null;
                forcePanelView = 'parts';
                renderForcePanel();
            });
        });
        forcePanelEl.querySelectorAll('.xsact-body-part-zone').forEach(function(zone) {
            zone.addEventListener('click', function(e) {
                e.stopPropagation();
                forcePanelPart = zone.dataset.group;
                forcePanelAction = null;
                (typeof updatePartFamilySelection === 'function') && updatePartFamilySelection(forcePanelEl, forcePanelPart, '.xsact-body-part-zone');
                renderForcePanel();
            });
        });
        forcePanelEl.querySelectorAll('.xsact-force-action').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                if (!forcePanelChar) return;
                forcePanelAction = btn.dataset.name;
                runForceAction([forcePanelChar], forcePanelAction, forcePanelPart);
                renderForcePanel();
            });
        });
    }

    /** 全员执行：对全房间（含自己）强制执行当前选中的动作，带二次确认防刷屏 */
    function forceRunOnRoomAll() {
        if (!forcePanelAction) { toast(QiActT('force.all_pick_first'), '#FFB3C6'); return; }
        var chars = forceRoomCharacters();
        if (!chars.length) { toast(QiActT('toast.no_others'), '#888'); return; }
        qiactConfirm({
            title: QiActT('force.confirm_all_title'),
            body: QiActT('force.confirm_all_body', { n: chars.length, name: forcePanelAction }),
            confirmText: QiActT('force.confirm_ok'),
            danger: true
        }).then(function(ok) { if (ok) runForceAction(chars, forcePanelAction, forcePanelPart); });
    }

    function runForceAction(chars, name, group) {
        var done = 0;
        chars.forEach(function(c) {
            executeAction(c, name, null, group || 'ItemMisc', true); // force=true
            done++;
        });
        toast(QiActT('force.executed', { n: done, name: name }), '#FF5C7A');
    }

    /** 标题栏拖动（边界钳制在视口内） */
    function bindForcePanelDrag() {
        if (!forcePanelEl) return;
        var head = forcePanelEl.querySelector('#xsact-force-head');
        if (!head) return;
        var dragging = false, sx = 0, sy = 0, ox = 0, oy = 0;
        head.addEventListener('pointerdown', function(e) {
            if (e.button !== 0 || (e.target && e.target.closest('button'))) return;
            dragging = true;
            sx = e.clientX; sy = e.clientY;
            ox = forcePanelEl.offsetLeft; oy = forcePanelEl.offsetTop;
            head.setPointerCapture && head.setPointerCapture(e.pointerId);
            e.preventDefault();
        });
        head.addEventListener('pointermove', function(e) {
            if (!dragging) return;
            var v = (typeof panelViewport === 'function') ? panelViewport() : { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
            var x = Math.max(v.left, Math.min(ox + e.clientX - sx, v.left + v.width - forcePanelEl.offsetWidth));
            var y = Math.max(v.top, Math.min(oy + e.clientY - sy, v.top + v.height - 40));
            forcePanelEl.style.left = x + 'px';
            forcePanelEl.style.top = y + 'px';
        });
        var end = function() { dragging = false; };
        head.addEventListener('pointerup', end);
        head.addEventListener('pointercancel', end);
        head.addEventListener('lostpointercapture', end);
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
