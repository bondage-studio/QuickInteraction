    /* Shared icons plus action, favorite and settings renderers. */
    function escapeHtml(s) {
        return String(s || '').replace(/[&<>"']/g, function(m) {
            return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m];
        });
    }

    /** 统一内联 SVG 图标（无 emoji）。stroke 继承 currentColor；部分实心图标单独处理。 */
    function svgIcon(name, size) {
        // 我的动作标签图标：糖果/魔法棒（用户提供的矢量图，实心）。
        if (name === 'custom') {
            return '<svg class="xsact-ico" viewBox="0 0 1024 1024" width="' + size + '" height="' + size +
                '" fill="currentColor" aria-hidden="true">' +
                '<path d="M727.008 487.232l194.016-184.32a99.2 99.2 0 0 0 0-140.288l-48.416-48.416a99.2 99.2 0 0 0-138.464-1.76L544.64 292.384l-184.064-196.64-1.504-1.568a64.832 64.832 0 0 0-91.712-0.384L129.184 231.968a64.8 64.8 0 0 0-1.12 90.144l181.344 193.728-171.456 162.88a99.264 99.264 0 0 0-28.256 49.28l-28.992 123.744a65.632 65.632 0 0 0 82.4 77.92l119.296-35.136a99.744 99.744 0 0 0 40.32-23.232l169.056-160.608 203.616 217.536 1.504 1.568a64.832 64.832 0 0 0 91.712 0.384l138.176-138.176a64.8 64.8 0 0 0 1.12-90.144l-200.896-214.624zM319.424 786.176l-90.112-90.112a31.488 31.488 0 0 0-9.792-6.496L667.104 264.352l94.272 94.272c1.408 1.408 3.168 2.08 4.768 3.168L319.424 786.176zM778.208 158.784a35.2 35.2 0 0 1 49.12 0.64l48.416 48.416c13.76 13.76 13.76 36.032-0.64 50.4l-64.448 61.216c-1.28-2.08-2.24-4.288-4.064-6.112l-93.12-93.12 64.736-61.44zM288.512 399.904c8-0.128 16-3.168 22.112-9.28l48-48a31.968 31.968 0 1 0-45.248-45.248l-48 48a31.68 31.68 0 0 0-8.928 20.256L174.816 278.4c-0.512-0.512-0.512-1.024-0.352-1.152L312.64 139.04c0.128-0.128 0.672-0.128 1.248 0.416l184.384 196.992-142.432 135.328-67.328-71.872zM145.024 868.288a1.6 1.6 0 0 1-2.016-1.92l28.992-123.744c0.992-4.16 2.944-7.968 5.312-11.488a31.808 31.808 0 0 0 6.752 10.144l88.288 88.288a35.072 35.072 0 0 1-8 3.552l-119.328 35.168z m598.336 16.672c-0.128 0.128-0.672 0.128-1.248-0.416l-125.6-134.176a31.232 31.232 0 0 0 14.08-7.712l48-48a31.968 31.968 0 1 0-45.248-45.248l-48 48a31.68 31.68 0 0 0-7.296 11.904l-39.904-42.656 142.432-135.328 200.576 214.304c0.48 0.512 0.48 1.024 0.352 1.152l-138.144 138.176z"/>' +
                '</svg>';
        }
        if (name === 'favRemove') {
            return '<svg class="xsact-ico" viewBox="0 0 1024 1024" width="' + size + '" height="' + size +
                '" fill="currentColor" aria-hidden="true">' +
                '<path d="M481.408 62.037333a34.133333 34.133333 0 0 1 61.184 0l111.957333 226.773334a34.133333 34.133333 0 0 0 13.781334 14.592 341.418667 341.418667 0 0 0-238.378667 507.733333L272.213333 894.037333a34.133333 34.133333 0 0 1-49.493333-35.968l42.752-249.258666a34.133333 34.133333 0 0 0-9.813333-30.208L74.538667 402.048a34.133333 34.133333 0 0 1 18.901333-58.197333l250.282667-36.394667a34.133333 34.133333 0 0 0 25.685333-18.645333l111.957333-226.773334z"/>' +
                '<path d="M725.333333 896a256 256 0 1 0 0-512 256 256 0 0 0 0 512z m-85.333333-298.666667h170.666667a42.666667 42.666667 0 1 1 0 85.333334h-170.666667a42.666667 42.666667 0 1 1 0-85.333334z"/>' +
                '</svg>';
        }
        // 批量编辑图标：文档 + 铅笔（用户提供的矢量图，实心）。
        if (name === 'bulkEdit') {
            return '<svg class="xsact-ico" viewBox="0 0 1024 1024" width="' + size + '" height="' + size +
                '" fill="currentColor" aria-hidden="true">' +
                '<path d="M957.3 147L860 49.7c-13.6-13.6-35.7-13.7-49.4-0.1L437.5 418.7c-4.8 4.8-8.1 10.8-9.6 17.4l-28.4 130.2a34.92 34.92 0 0 0 10 32.7c6.6 6.3 15.3 9.8 24.2 9.8 3 0 5.9-0.4 8.9-1.1l125.7-32.9c6-1.6 11.4-4.7 15.8-9l373.1-369.1c6.6-6.6 10.4-15.5 10.4-24.8-0.1-9.3-3.7-18.3-10.3-24.9zM541.5 509.4L480 525.5l14-64.3 341-337.3 47.8 47.8-341.3 337.7z"/>' +
                '<path d="M888.3 442.8c-19.3 0-35 15.7-35 35v267H248V203h215.1c19.3 0 35-15.7 35-35s-15.7-35-35-35H213c-19.3 0-35 15.7-35 35v135.1H96.1c-19.3 0-35 15.7-35 35v590.1c0 19.3 15.7 35 35 35h675.4c19.3 0 35-15.7 35-35V814.8h81.9c19.3 0 35-15.7 35-35v-302c-0.1-19.3-15.8-35-35.1-35zM736.4 893.3H131.1V373.2H178v406.6c0 19.3 15.7 35 35 35h523.4v78.5z"/>' +
                '</svg>';
        }
        size = size || 16;
        var P = {
            close:    '<path d="M6 6l12 12M18 6L6 18"/>',
            refresh:  '<path d="M21 12a9 9 0 1 1-2.64-6.36"/><path d="M21 3v6h-6"/>',
            play:     '<path d="M7 4l13 8-13 8z"/>',
            star:     '<path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.9 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z"/>',
            starFill: '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>',
            plus:     '<path d="M12 5v14M5 12h14"/>',
            trash:    '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
            pencil:   '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M14 6l4 4"/>',
            up:       '<path d="M6 14l6-6 6 6"/>',
            down:     '<path d="M6 10l6 6 6-6"/>',
            grip:     '<circle cx="9" cy="6" r="1.4"/><circle cx="15" cy="6" r="1.4"/><circle cx="9" cy="12" r="1.4"/><circle cx="15" cy="12" r="1.4"/><circle cx="9" cy="18" r="1.4"/><circle cx="15" cy="18" r="1.4"/>',
            check:    '<path d="M5 12l5 5 9-11"/>',
            resize:   '<path d="M22 2L2 22M16 22h6v-6"/>',
            users:    '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
            target:   '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>',
            tag:      '<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><circle cx="7" cy="7" r="1.5"/>',
            zap:      '<polygon points="13 2 4 14 11 14 10 22 20 10 13 10"/>',
            layers:   '<path d="M12 3L2 9l10 6 10-6-10-6z"/><path d="M2 15l10 6 10-6"/>',
            user:     '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
            'triangle-left': '<path d="M18 5L7 12l11 7z" fill="currentColor" stroke="none"/>',
            settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
            download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
            upload:   '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
            sun:      '<circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>',
            moon:     '<path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"/>',
            edit:     '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z"/>',
            power:    '<path d="M12 2v10"/><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/>',
            toggleOff:'<path d="M6 4h12a8 8 0 0 1 0 16H6a8 8 0 0 1 0-16z" fill="none"/><circle cx="6" cy="12" r="4" fill="currentColor" stroke="none"/>',
            toggleOn: '<path d="M6 4h12a8 8 0 0 1 0 16H6a8 8 0 0 1 0-16z" fill="none"/><circle cx="18" cy="12" r="4" fill="currentColor" stroke="none"/>'
        };
        var inner = P[name] || '';
        return '<svg class="xsact-ico" viewBox="0 0 24 24" width="' + size + '" height="' + size +
            '" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
            inner + '</svg>';
    }

    function updateActionPanel(charObj, partGroup, renderImmediately) {
        try {
            // 该函数只应在「单部位」动作面板模式下渲染；若当前处于 custom/combo，避免覆盖界面。
            if (state.panelMode !== 'part') return;
            // 用模块持有的面板引用查询，避免重复注入时 getElementById 命中隐藏旧面板
            if (!state.actionPanelEl) return;
            var titleEl = state.actionPanelEl.querySelector('#xsact-panel-title');
            var listEl = state.actionPanelEl.querySelector('#xsact-action-list');
            var allBtn = state.actionPanelEl.querySelector('#xsact-all-btn');

            if (!titleEl || !listEl) return;
            if (!charObj || !partGroup) {
                listEl.innerHTML = '<div class="xsact-qa-empty">' + QiActT('render.pick_char_part') + '</div>';
                return;
            }

            titleEl.textContent = (characterDisplayName(charObj) || '?') + ' → ' + QiActT('part.' + partGroup);

            // Paint the selected zone before entering BC's synchronous action resolver.
            // The token prevents an older tap from replacing a newer selection.
            if (!renderImmediately) {
                var renderToken = (state._actionRenderToken || 0) + 1;
                state._actionRenderToken = renderToken;
                listEl.innerHTML = '<div class="xsact-qa-empty xsact-action-loading">…</div>';
                requestAnimationFrame(function() {
                    if (state._actionRenderToken !== renderToken || state.panelMode !== 'part' ||
                        state.selectedTarget !== charObj || canonicalPartGroup(state.selectedPart) !== canonicalPartGroup(partGroup)) return;
                    updateActionPanel(charObj, partGroup, true);
                });
                return;
            }

            var actions = getActionsForPart(partGroup, charObj);
            if (!Array.isArray(actions) || actions.length === 0) {
                listEl.innerHTML = '<div class="xsact-qa-empty">' + QiActT('render.no_actions') + '</div>';
                if (allBtn) allBtn.disabled = true;
                return;
            }

            if (allBtn) allBtn.disabled = false;
            var html = '';
            var isEditing = !!state.editingComboId;
            actions.forEach(function(act) {
                if (!act || !act.Name) return;
                var lbl = getActivityLabel(act, act.Group || partGroup);
                var isFav = state.favorites.indexOf(canonicalPartGroup(partGroup) + '|' + act.Name) !== -1;
                // 来源水印功能已暂停（按需求优先修复动作显示功能）。
                // 下方点击处理器仍用 caDetectSource 判断 LSCG/Liko 以触发自动刷新。
                html += '<div class="xsact-action-row' + (isEditing ? ' editing' : '') + '" data-name="' + escapeHtml(act.Name) + '" data-group="' + escapeHtml(act.Group || partGroup) + '">' +
                    '<button class="xsact-action-btn' + (isFav ? ' fav' : '') + '" data-name="' + escapeHtml(act.Name) + '" data-group="' + escapeHtml(act.Group || partGroup) + '" title="' + escapeHtml(act.Name) + '">' +
                    '<span class="xsact-action-label">' + escapeHtml(lbl) + '</span>' +
                    (isFav ? '<span class="xsact-action-star">' + svgIcon('starFill', 13) + '</span>' : '') +
                    '</button>';
                if (isEditing) {
                    html += '<button class="xsact-add-to-combo" title="' + QiActT('combo.add_title') + '">' + svgIcon('plus', 16) + '</button>';
                }
                html += '</div>';
            });
            listEl.innerHTML = html || '<div class="xsact-qa-empty">' + QiActT('render.no_actions') + '</div>';

            // 绑定动作按钮点击：收藏模式下加入/取消收藏，否则执行
            listEl.querySelectorAll('.xsact-action-btn').forEach(function(btn) {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation(); // 避免冒泡到面板导致左侧人物浮层关闭
                    var actName = btn.dataset.name;
                    var actGroup = btn.dataset.group || partGroup;
                    var act = actions.find(function(a) { return a && a.Name === actName && (a.Group || partGroup) === actGroup; }) || { Name: actName, Group: actGroup, Item: null };
                    state.selectedAction = actName;
                    state.selectedActionGroup = actGroup;
                    state.selectedActionItem = act.Item || null;
                    listEl.querySelectorAll('.xsact-action-btn').forEach(b => b.classList.remove('sel'));
                    btn.classList.add('sel');

                    if (state.allModeActive) {
                        executeActionAll();
                        return;
                    }

                    if (state.favModeActive) {
                        toggleFavoriteAction(partGroup, actName, btn);
                        return;
                    }

                    {
                        var execOk = executeAction(charObj, actName, act.Item || null, act.Group || partGroup);
                        var srcKey = caDetectSource(actName);
                        // 来源为 LSCG / Liko 的动作会改变可用状态/进度（如进食进度、道具附加），
                        // 执行后立即静默刷新当前部位动作列表以反映最新状态，且不弹任何提示。
                        if (srcKey === 'LSCG' || srcKey === 'LIKO') {
                            setTimeout(function() { try { updateActionPanel(charObj, partGroup); } catch (_) { console.warn('[QiAct] 延迟刷新动作面板失败（已忽略）:', _ && _.message); } }, 50);
                        } else if (execOk !== false) {
                            toast(QiActT('toast.executed', { name: getActivityLabel(actName, partGroup) }), '#46E0A0');
                        }
                    }
                });
            });

            // 绑定「加入组合」点击（编辑模式）
            if (isEditing) {
                listEl.querySelectorAll('.xsact-add-to-combo').forEach(function(btn) {
                    btn.addEventListener('click', function(e) {
                        e.stopPropagation(); // 避免冒泡到面板导致左侧人物浮层关闭
                        var actName = btn.parentNode.dataset.name;
                        var actGroup = btn.parentNode.dataset.group || partGroup;
                        var act = actions.find(function(a) { return a && a.Name === actName && (a.Group || partGroup) === actGroup; }) || { Name: actName, Group: actGroup, Item: null, translatedName: actName };
                        var lbl = act.translatedName || getActivityLabel(act.Name, partGroup);
                        addComboItem(state.editingComboId, act.Group || partGroup, act.Name, lbl, act.Item || null);
                        toast(QiActT('toast.added_to_combo', { name: getCombo(state.editingComboId).name }), '#46E0A0');
                    });
                });
            }
        } catch (panelErr) {
            console.error('[QiAct] updateActionPanel 渲染失败:', panelErr);
            if (state.actionPanelEl) {
                var listEl = state.actionPanelEl.querySelector('#xsact-action-list');
                if (listEl) listEl.innerHTML = '<div class="xsact-qa-empty" style="color:#FF8FA6">' + QiActT('render.load_err', { msg: escapeHtml(panelErr.message) }) + '</div>';
            }
        }
    }

    function updateFavoritesPanel(charObj) {
        if (!state.actionPanelEl) return;
        var titleEl = state.actionPanelEl.querySelector('#xsact-panel-title');
        var listEl = state.actionPanelEl.querySelector('#xsact-action-list');
        if (!titleEl || !listEl) return;
        titleEl.textContent = (charObj ? characterDisplayName(charObj) + ' → ' : '') + QiActT('render.favorite_title');
        renderFavoritePartFilter();
        if (!state.favorites.length) { listEl.innerHTML = '<div class="xsact-qa-empty">' + QiActT('common.no_fav') + '</div>'; return; }
        var html = '';
        var seen = {};
        state.favorites.forEach(function(key) {
            var sep = key.indexOf('|');
            var group = canonicalPartGroup(sep < 0 ? '' : key.slice(0, sep));
            var name = sep < 0 ? key : key.slice(sep + 1);
            var normalizedKey = group + '|' + name;
            if (seen[normalizedKey] || (state.favoritePartFilter !== 'all' && state.favoritePartFilter !== group)) return;
            seen[normalizedKey] = true;
            html += '<div class="xsact-action-row" data-key="' + escapeHtml(key) + '">' +
                '<button class="xsact-action-btn fav" data-group="' + escapeHtml(group) + '" data-name="' + escapeHtml(name) + '"><span class="xsact-action-label">' + escapeHtml(getActivityLabel(name, group)) + '</span><span class="xsact-action-star">' + svgIcon('starFill', 13) + '</span></button></div>';
        });
        if (!html) html = '<div class="xsact-qa-empty">' + QiActT('common.no_fav') + '</div>';
        listEl.innerHTML = html;
        listEl.querySelectorAll('.xsact-action-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                state.selectedPart = btn.dataset.group;
                state.selectedAction = btn.dataset.name;
                state.selectedActionItem = null;
                if (state.allModeActive) { executeActionAll(); return; }
                if (state.favModeActive) { toggleFavoriteAction(btn.dataset.group, btn.dataset.name, btn); updateFavoritesPanel(charObj); return; }
                if (!charObj) { toast(QiActT('render.pick_char_part2'), '#888'); return; }
                var acts = getActionsForPart(btn.dataset.group, charObj) || [];
                var act = acts.find(function(a) { return a && a.Name === btn.dataset.name; });
                executeAction(charObj, btn.dataset.name, act && act.Item ? act.Item : null, btn.dataset.group);
            });
        });
    }

    function renderFavoritePartFilter() {
        if (!state.actionPanelEl) return;
        var old = state.actionPanelEl.querySelector('#xsact-favorite-part-filter'); if (old) old.remove();
        if (state.panelMode !== 'favorite') return;
        var footer = state.actionPanelEl.querySelector('.xsact-qa-panel-footer'); if (!footer) return;
        var groups = []; state.favorites.forEach(function(k) { var p = k.indexOf('|'); var g = canonicalPartGroup(p < 0 ? '' : k.slice(0,p)); if (g && groups.indexOf(g) < 0) groups.push(g); });
        var bar = document.createElement('div'); bar.id = 'xsact-favorite-part-filter'; bar.className = 'xsact-favorite-part-filter';
        bar.innerHTML = '<button data-group="all" class="' + (state.favoritePartFilter === 'all' ? 'active' : '') + '">' + QiActT('custom.chip_all') + '</button>' + groups.map(function(g) { return '<button data-group="' + escapeHtml(g) + '" class="' + (state.favoritePartFilter === g ? 'active' : '') + '">' + escapeHtml(QiActT('part.' + g)) + '</button>'; }).join('');
        var listEl = state.actionPanelEl.querySelector('#xsact-action-list');
        if (listEl) listEl.insertAdjacentElement('beforebegin', bar);
        bar.querySelectorAll('button').forEach(function(b) { b.addEventListener('click', function() { state.favoritePartFilter = b.dataset.group; updateFavoritesPanel(state.selectedTarget); }); });
    }

    function updateSettingsPanel() {
        if (!state.actionPanelEl) return;
        var titleEl = state.actionPanelEl.querySelector('#xsact-panel-title');
        var listEl = state.actionPanelEl.querySelector('#xsact-action-list');
        if (titleEl) titleEl.textContent = QiActT('settings.title');
        var cur = QiActI18n.getCurrentLang ? QiActI18n.getCurrentLang() : 'auto';
        var langs = ['auto'].concat(QiActI18n.LANGS || ['TW','CN','EN','JA','KO','VI','DE','FR','ES','RU','UA']);
        var opts = langs.map(function(l) { var m = (QiActI18n.LANG_META || {})[l] || {}; return '<option value="' + l + '"' + (l === cur ? ' selected' : '') + '>' + escapeHtml(m.native || (l === 'auto' ? QiActT('settings.auto') : l)) + '</option>'; }).join('');
        function idChips(ids, kind) { return ids.map(function(id) { return '<button type="button" class="xsact-id-chip" data-list="' + kind + '" data-id="' + id + '" title="' + QiActT('settings.remove_id') + '">' + id + ' ×</button>'; }).join(''); }
        var relationChoices = [['owner','settings.allow_owner'],['lover','settings.allow_lover'],['sub','settings.allow_sub'],['whitelist','settings.allow_whitelist'],['friend','settings.allow_friend']].map(function(choice) {
            return '<label class="xsact-relation-' + choice[0] + '"><input type="checkbox" data-allow-group="' + choice[0] + '"' + (state.actionAllowGroups.indexOf(choice[0]) >= 0 ? ' checked' : '') + '><span>' + QiActT(choice[1]) + '</span></label>';
        }).join('');
        var scopeChoices = [['all','settings.scope_all'],['allow','settings.scope_allow'],['skip','settings.scope_skip']].map(function(choice) {
            return '<label><input type="radio" name="xsact-all-scope" value="' + choice[0] + '"' + (state.allTargetScope === choice[0] ? ' checked' : '') + '><span>' + QiActT(choice[1]) + '<i></i></span></label>';
        }).join('');
        listEl.innerHTML = '<div class="xsact-settings">' +
            '<label class="xsact-settings-row"><span>' + QiActT('settings.language') + '</span><select id="xsact-settings-lang">' + opts + '</select></label>' +
            '<label class="xsact-settings-row"><span>' + QiActT('settings.theme') + '</span><select id="xsact-settings-theme"><option value="dark"' + (state.theme === 'dark' ? ' selected' : '') + '>' + QiActT('ui.theme_dark') + '</option><option value="light"' + (state.theme === 'light' ? ' selected' : '') + '>' + QiActT('ui.theme_light') + '</option></select></label>' +
            '<div class="xsact-settings-group"><span class="xsact-settings-group-title">' + QiActT('settings.all_targets_group') + '</span>' +
              '<div class="xsact-settings-row xsact-settings-row-stack"><strong>' + QiActT('settings.general') + '</strong><div class="xsact-scope-options">' + scopeChoices + '</div></div>' +
              '<div class="xsact-settings-row xsact-settings-row-stack"><span><strong>' + QiActT('settings.action_allow_members') + '</strong><small>' + QiActT('settings.action_allow_hint') + '</small></span><div class="xsact-relation-options">' + relationChoices + '</div><div class="xsact-id-editor"><input id="xsact-settings-allow-input" inputmode="numeric" placeholder="' + QiActT('settings.action_skip_placeholder') + '"><button type="button" id="xsact-settings-allow-add">+</button></div><div class="xsact-id-chips" id="xsact-settings-allow-chips">' + idChips(state.actionAllowMembers, 'allow') + '</div></div>' +
              '<div class="xsact-settings-row xsact-settings-row-stack"><span><strong>' + QiActT('settings.action_skip_members') + '</strong><small>' + QiActT('settings.action_skip_hint') + '</small></span><div class="xsact-id-editor"><input id="xsact-settings-skip-input" inputmode="numeric" placeholder="' + QiActT('settings.action_skip_placeholder') + '"><button type="button" id="xsact-settings-skip-add">+</button></div><div class="xsact-id-chips" id="xsact-settings-skip-chips">' + idChips(state.actionSkipMembers, 'skip') + '</div></div>' +
            '</div>' +
            '<label class="xsact-settings-row"><span><strong>' + QiActT('settings.action_delay') + '</strong><small>' + QiActT('settings.action_delay_hint') + '</small></span><span class="xsact-settings-number"><input type="number" id="xsact-settings-delay" min="100" max="9999" step="100" value="' + state.actionDelay + '"><em>ms</em></span></label>' +
            '<label class="xsact-settings-row"><span>' + QiActT('settings.char_list_right') + '</span><span class="xsact-switch"><input type="checkbox" id="xsact-settings-char-right"' + (state.charPopoverRight ? ' checked' : '') + '><span class="xsact-switch-track"></span></span></label>' +
            '<label class="xsact-settings-row"><span>' + QiActT('settings.chat_button') + '</span><span class="xsact-switch"><input type="checkbox" id="xsact-settings-chat"' + (state.floatingButtonVisible ? ' checked' : '') + '><span class="xsact-switch-track"></span></span></label>' +
            '<label class="xsact-settings-row"><span>' + QiActT('settings.enable_xiaosu') + '</span><span class="xsact-switch"><input type="checkbox" id="xsact-settings-xiaosu"' + (state.xiaosuPack ? ' checked' : '') + '><span class="xsact-switch-track"></span></span></label></div>';
        listEl.querySelector('#xsact-settings-lang').addEventListener('change', function(e) { QiActI18n.setLang(e.target.value); rebuildPanel(); setPanelMode('settings'); });
        listEl.querySelector('#xsact-settings-theme').addEventListener('change', function(e) { applyTheme(e.target.value); persist(S_THEME, e.target.value); });
        listEl.querySelector('#xsact-settings-delay').addEventListener('change', function(e) { state.actionDelay = normalizeActionDelay(e.target.value); e.target.value = state.actionDelay; persist(S_ACTION_DELAY, state.actionDelay); });
        function bindIdEditor(kind) {
            var input = listEl.querySelector('#xsact-settings-' + kind + '-input');
            var add = listEl.querySelector('#xsact-settings-' + kind + '-add');
            function commit() {
                var current = kind === 'allow' ? state.actionAllowMembers : state.actionSkipMembers;
                var next = parseActionSkipMembers(current.concat(parseActionSkipMembers(input.value)));
                if (kind === 'allow') { state.actionAllowMembers = next; persist(S_ACTION_ALLOW_MEMBERS, next); }
                else { state.actionSkipMembers = next; persist(S_ACTION_SKIP_MEMBERS, next); }
                updateSettingsPanel();
            }
            add.addEventListener('click', commit);
            input.addEventListener('keydown', function(e) { if (e.key === 'Enter') { e.preventDefault(); commit(); } });
        }
        bindIdEditor('allow'); bindIdEditor('skip');
        listEl.querySelectorAll('.xsact-id-chip').forEach(function(chip) { chip.addEventListener('click', function() {
            var id = parseInt(chip.dataset.id, 10), kind = chip.dataset.list;
            if (kind === 'allow') { state.actionAllowMembers = state.actionAllowMembers.filter(function(x) { return x !== id; }); persist(S_ACTION_ALLOW_MEMBERS, state.actionAllowMembers); }
            else { state.actionSkipMembers = state.actionSkipMembers.filter(function(x) { return x !== id; }); persist(S_ACTION_SKIP_MEMBERS, state.actionSkipMembers); }
            updateSettingsPanel();
        }); });
        listEl.querySelectorAll('[data-allow-group]').forEach(function(box) { box.addEventListener('change', function() {
            state.actionAllowGroups = Array.from(listEl.querySelectorAll('[data-allow-group]:checked')).map(function(x) { return x.dataset.allowGroup; });
            persist(S_ACTION_ALLOW_GROUPS, state.actionAllowGroups);
        }); });
        listEl.querySelectorAll('input[name="xsact-all-scope"]').forEach(function(radio) { radio.addEventListener('change', function() { if (radio.checked) { state.allTargetScope = radio.value; persist(S_ALL_TARGET_SCOPE, radio.value); } }); });
        listEl.querySelector('#xsact-settings-char-right').addEventListener('change', function(e) { state.charPopoverRight = e.target.checked; persist(S_CHAR_POPOVER_RIGHT, state.charPopoverRight); applyCharPopoverSide(state.actionPanelEl); });
        listEl.querySelector('#xsact-settings-chat').addEventListener('change', function(e) { setFloatingButtonVisible(e.target.checked); });
        listEl.querySelector('#xsact-settings-xiaosu').addEventListener('change', function(e) { setXiaosuPack(e.target.checked); });
    }

    // ════════════════════════════════════════════════════════════════════════
    // 事件绑定
    // ════════════════════════════════════════════════════════════════════════

    /** 把面板恢复到上次拖拽保存的位置（无记录则用默认右上角） */
