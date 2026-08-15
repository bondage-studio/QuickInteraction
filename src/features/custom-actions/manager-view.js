    /* Custom action manager list and toolbar. */
    function updateCustomActionPanel(charObj) {
        if (!state.actionPanelEl) return;
        var titleEl = state.actionPanelEl.querySelector('#xsact-panel-title');
        var listEl = state.actionPanelEl.querySelector('#xsact-action-list');
        if (!titleEl || !listEl) return;
        var footerEl = state.actionPanelEl.querySelector('.xsact-qa-panel-footer');
        var allBtn = state.actionPanelEl.querySelector('#xsact-all-btn');
        if (allBtn) allBtn.disabled = true; // 自定义动作语义明确，不支持全员广播

        if (state.editingCustomId) {
            if (footerEl) footerEl.style.display = 'none';
            var act = getCustom(state.editingCustomId);
            if (!act) { state.editingCustomId = null; updateCustomActionPanel(charObj); return; }
            renderCustomEditor(act, charObj, listEl, titleEl);
            return;
        }

        if (footerEl) footerEl.style.display = '';

        // ── 列表视图 ──
        titleEl.textContent = (charObj ? characterDisplayName(charObj) + ' → ' : '') + QiActT('custom.title');
        var html = '';
        var acts = state.customActions;
        var editMode = state.caEditMode;
        var selSet = {};
        (state.caSelected || []).forEach(function(id){ selSet[id] = true; });
        var allOn = acts.length > 0 && acts.every(function(a){ return a.visible !== false; });

        var toolbarHtml = '<div class="xsact-ca-toolbar">' +
            '<input type="text" id="xsact-ca-search" class="xsact-ca-search' + (editMode ? ' is-hidden' : '') + '" placeholder="' + QiActT('custom.search_placeholder') + '">' +
            '<div class="xsact-ca-toolbar-btns">' +
            '<button class="xsact-ca-new" id="xsact-ca-new" title="' + QiActT('custom.new') + '">' + svgIcon('plus', 14) + '<span>' + QiActT('custom.new') + '</span></button>' +
            '<div class="xsact-ca-import-wrap"><button class="xsact-ca-import" id="xsact-ca-import" title="' + QiActT('custom.import') + '">' + svgIcon('download', 14) + '</button>' +
            '<div class="xsact-ca-import-menu hidden" id="xsact-ca-import-menu"><button data-import="echo">' + QiActT('custom.import_echo') + '</button><button data-import="file">' + QiActT('custom.import_file') + '</button></div>' +
            '<input type="file" id="xsact-ca-file-input" class="xsact-ca-file-input" accept="application/json,.json"></div>' +
            '<button class="xsact-ca-export" id="xsact-ca-export" title="' + QiActT('custom.export') + '">' + svgIcon('upload', 14) + '</button>' +
            '<button class="xsact-ca-editmode' + (editMode ? ' is-active' : '') + '" id="xsact-ca-editmode" title="' + (editMode ? QiActT('custom.editmode_on') : QiActT('custom.editmode_off')) + '">' + svgIcon('bulkEdit', 16) + '</button>' +
            '<button class="xsact-ca-toggleall' + (allOn ? ' is-on' : '') + '" id="xsact-ca-toggleall" title="' + (allOn ? QiActT('custom.toggleall_on') : QiActT('custom.toggleall_off')) + '">' + svgIcon(allOn ? 'toggleOn' : 'toggleOff', 16) + '</button>' +
            '</div></div>';

        html += '<div class="xsact-ca-view">';
        html += toolbarHtml;
        // 分类 chip 过滤栏：按来源（all/xiaosu/native/echo）单选；空分类置灰
        var _counts = { all: acts.length, xiaosu: 0, native: 0, echo: 0 };
        acts.forEach(function(a) {
            if (a.source === 'xiaosu') _counts.xiaosu++;
            else if (a.source === 'echo') _counts.echo++;
            else _counts.native++;
        });
        var _chips = [
            { key: 'all', label: QiActT('custom.chip_all'), count: _counts.all, color: 'all' },
            state.xiaosuPack ? { key: 'xiaosu', label: QiActT('custom.chip_xiaosu'), count: _counts.xiaosu, color: 'xiaosu' } : null,
            { key: 'native', label: QiActT('custom.chip_native'), count: _counts.native, color: 'native' },
            { key: 'echo', label: 'echo', count: _counts.echo, color: 'echo' }
        ];
        _chips = _chips.filter(Boolean);
        html += '<div class="xsact-ca-chips" id="xsact-ca-chips">';
        _chips.forEach(function(ch) {
            var active = state.caFilter === ch.key;
            var empty = ch.count === 0 && ch.key !== 'all' && ch.key !== 'xiaosu';
            var dis = empty ? ' is-disabled' : '';
            var act = active ? ' is-active' : '';
            html += '<button type="button" class="xsact-ca-chip ' + ch.color + act + dis + '" data-filter="' + ch.key + '"' + (empty ? ' disabled' : '') + '>' +
                '<span class="xsact-ca-chip-label">' + ch.label + '</span>' +
                '<span class="xsact-ca-chip-count">' + ch.count + '</span>' +
            '</button>';
        });
        html += '</div>';

        // 编辑模式批量栏
        if (editMode) {
            html += '<div class="xsact-ca-batchbar" id="xsact-ca-batchbar">' +
                '<button class="xsact-ca-select-all" id="xsact-ca-select-all">' + QiActT('custom.select_all') + '</button>' +
                '<span class="xsact-ca-selected-count" id="xsact-ca-selected-count">' + QiActT('custom.selected_count', { n: 0 }) + '</span>' +
                '<div class="xsact-ca-batch-actions">' +
                '<button id="xsact-ca-batch-close" disabled>' + QiActT('custom.batch_close') + '</button>' +
                '<button id="xsact-ca-batch-delete" class="xsact-ca-batch-del" disabled>' + QiActT('custom.batch_delete') + '</button>' +
                '</div></div>';
        }

        // 迁移提示：原 echo/回声 中仍有动作数据 → 提供一键清理入口
        try {
            var _echoData = caGetEchoData();
            var _hasEchoSrc = state.customActions.some(function(a) { return a.source === 'echo'; });
            if (_echoData && Object.keys(_echoData).length && _hasEchoSrc) {
                html += '<div class="xsact-ca-echo-clean" id="xsact-ca-echo-clean">' +
                    '<div class="xsact-ca-echo-clean-text">' + QiActT('custom.echo_clean_text', { n: Object.keys(_echoData).length }) + '</div>' +
                    '<button class="xsact-ca-echo-clean-btn" id="xsact-ca-echo-clean-btn" type="button">' + QiActT('custom.echo_clean_btn') + '</button>' +
                '</div>';
            }
        } catch (e) { silent(e, 'renderEchoCleanHint'); }

        // 内置小酥动作包（单行极简：仅标题 + 紧凑开关，长描述走 title hover）
        // 仅在「小酥」chip 下显示 — 开关本身只对小酥分类有意义，
        // 其他分类下隐藏避免视觉干扰 + 杜绝「我的」tab 下开关位置漂移。
        if (state.caFilter === 'xiaosu') {
            html += '<div class="xsact-ca-xiaosu" id="xsact-ca-xiaosu">' +
                '<span class="xsact-ca-xiaosu-label" title="' + QiActT('custom.xiaosu_pack_title') + '">' + QiActT('custom.xiaosu_pack_label') + '</span>' +
                '<label class="xsact-ca-toggle xsact-ca-xiaosu-switch" title="' + QiActT('custom.xiaosu_pack_toggle_title') + '">' +
                    '<input type="checkbox" class="xsact-ca-xiaosu-pack"' + (state.xiaosuPack ? ' checked' : '') + '>' +
                    '<span class="xsact-ca-toggle-track"></span>' +
                '</label>' +
            '</div>';
        }

        if (!acts.length) {
            html += '<div class="xsact-qa-empty xsact-ca-empty">' + QiActT('custom.empty') + '</div>';
        } else {
            // 按当前 chip 过滤（不改 customActions 顺序，仅隐藏不匹配卡片）
            var _flt = state.caFilter || 'all';
            var _visibleActs = acts.filter(function(a) {
                if (_flt === 'all') return true;
                if (_flt === 'xiaosu') return a.source === 'xiaosu';
                if (_flt === 'echo') return a.source === 'echo';
                if (_flt === 'native') return !a.source || a.source === 'native';
                return true;
            });
            if (!_visibleActs.length) {
                html += '<div class="xsact-qa-empty xsact-ca-empty xsact-ca-filter-empty">' + QiActT('custom.filter_empty') + '</div>';
            } else {
                html += '<div class="xsact-ca-list' + (editMode ? ' is-editing' : '') + '">';
                _visibleActs.forEach(function(a) {
                var scopeBadge = a.scope === 'self' ? '<span class="xsact-ca-badge self">' + QiActT('custom.scope_self') + '</span>'
                    : a.scope === 'other' ? '<span class="xsact-ca-badge other">' + QiActT('custom.scope_other') + '</span>'
                    : '<span class="xsact-ca-badge any">' + QiActT('custom.scope_any') + '</span>';
                var sourceBadge = a.source === 'xiaosu' ? '<span class="xsact-ca-src xiaosu" title="' + QiActT('custom.xiaosu_pack_src_title') + '">' + QiActT('custom.src_xiaosu') + '</span>' : a.source === 'echo' ? '<span class="xsact-ca-src echo" title="' + QiActT('custom.src_echo_title') + '">' + QiActT('custom.src_echo') + '</span>' : '<span class="xsact-ca-src native" title="' + QiActT('custom.src_qiact_title') + '">' + QiActT('custom.src_qiact') + '</span>';
                var partLbl = (BODY_PARTS.find(function(p) { return p.group === a.group; }) || {}).label || a.group;
                var isVisible = a.visible !== false;
                var isSel = !!selSet[a.id];
                if (editMode) {
                    html += '<div class="xsact-ca-card is-edit' + (isSel ? ' is-selected' : '') + (isVisible ? '' : ' is-hidden') + '" data-id="' + a.id + '" draggable="true">' +
                        '<span class="xsact-ca-handle" title="' + QiActT('custom.drag_handle') + '">' + svgIcon('grip', 14) + '</span>' +
                        '<div class="xsact-ca-info">' +
                            '<div class="xsact-ca-title">' +
                                '<span class="xsact-ca-name">' + escapeHtml(a.name) + '</span>' +
                                scopeBadge + sourceBadge +
                            '</div>' +
                            '<div class="xsact-ca-meta">' +
                                '<span class="xsact-ca-part">' + escapeHtml(partLbl) + '</span>' +
                                '<span class="xsact-ca-vis-dot ' + (isVisible ? 'on' : 'off') + '">' + (isVisible ? QiActT('custom.vis_on') : QiActT('custom.vis_off')) + '</span>' +
                            '</div>' +
                        '</div>' +
                        '<span class="xsact-ca-check" aria-hidden="true">' + svgIcon('check', 14) + '</span>' +
                    '</div>';
                } else {
                    html += '<div class="xsact-ca-card' + (isVisible ? '' : ' is-hidden') + '" data-id="' + a.id + '">' +
                        '<div class="xsact-ca-info">' +
                            '<div class="xsact-ca-title">' +
                                '<span class="xsact-ca-name">' + escapeHtml(a.name) + '</span>' +
                                scopeBadge + sourceBadge +
                            '</div>' +
                            '<div class="xsact-ca-meta">' +
                                '<label class="xsact-ca-toggle" title="' + QiActT('custom.vis_toggle_title') + '">' +
                                    '<input type="checkbox" class="xsact-ca-visible" data-id="' + a.id + '"' + (isVisible ? ' checked' : '') + '>' +
                                    '<span class="xsact-ca-toggle-track"></span>' +
                                    '<span class="xsact-ca-toggle-label">' + (isVisible ? QiActT('custom.vis_label_on') : QiActT('custom.vis_label_off')) + '</span>' +
                                '</label>' +
                                '<span class="xsact-ca-part">' + escapeHtml(partLbl) + '</span>' +
                            '</div>' +
                        '</div>' +
                        '<div class="xsact-ca-btns">' +
                            '<button class="xsact-ca-run" title="' + QiActT('custom.run_title') + '" data-id="' + a.id + '">' + svgIcon('play', 14) + '</button>' +
                            '<button class="xsact-ca-edit" title="' + QiActT('custom.edit_title') + '" data-id="' + a.id + '">' + svgIcon('pencil', 14) + '</button>' +
                            '<button class="xsact-ca-delete" title="' + QiActT('custom.delete_title') + '" data-tooltip-type="danger" data-id="' + a.id + '">' + svgIcon('trash', 14) + '</button>' +
                        '</div>' +
                    '</div>';
                }
            });
            html += '</div>';
            }
        }
        html += '</div>';
        listEl.innerHTML = html;

        // 拖曳捲動 + 滚轮接管（非编辑模式；编辑模式用原生 HTML5 拖拽排序，避免冲突）。
        // BC 宿主页在 capture 阶段 preventDefault 滚动，故手动接管 wheel/touchmove。
        if (!editMode) {
            var scEl = listEl.querySelector('.xsact-ca-list');
            if (scEl) {
                var scDown = false, scStartY = 0, scStartTop = 0, scMoved = false, scPid = null;
                scEl.addEventListener('pointerdown', function(e) {
                    if (e.button !== 0) return;
                    if (e.target.closest('button, input, label, a')) return; // 控件正常点击
                    scDown = true; scMoved = false; scPid = e.pointerId;
                    scStartY = e.clientY; scStartTop = scEl.scrollTop;
                    try { scEl.setPointerCapture(e.pointerId); } catch (_) {} // 捕获指针：离开元素仍持续拖动，直到松开左键
                });
                scEl.addEventListener('pointermove', function(e) {
                    if (!scDown) return;
                    var dy = e.clientY - scStartY;
                    if (!scMoved && Math.abs(dy) < 4) return; // 阈值：区分点击与拖曳
                    scMoved = true;
                    scEl.classList.add('is-grabscroll');
                    scEl.scrollTop = scStartTop - dy;
                });
                var scEnd = function() {
                    scDown = false; scEl.classList.remove('is-grabscroll');
                    if (scPid !== null) { try { scEl.releasePointerCapture(scPid); } catch (_) {} scPid = null; }
                };
                scEl.addEventListener('pointerup', scEnd);
                scEl.addEventListener('pointercancel', scEnd);
                scEl.addEventListener('wheel', function(e) {
                    var d = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY; // 行模式换算成像素
                    var before = scEl.scrollTop;
                    scEl.scrollTop += d;
                    if (scEl.scrollTop !== before) { e.preventDefault(); e.stopPropagation(); }
                }, { passive: false });
                scEl.addEventListener('touchmove', function(e) { e.stopPropagation(); }, { passive: true });
            }
        }

        var newBtn = listEl.querySelector('#xsact-ca-new');
        if (newBtn) newBtn.addEventListener('click', function() {
            state.editingCustomId = caNewId();
            var draft = { id: state.editingCustomId, name: '', scope: 'other', group: 'ItemMouth', dialog: '', dialogSelf: '', createdAt: Date.now(), source: 'native', visible: true };
            renderCustomEditor(draft, charObj, listEl, titleEl);
        });
        var importBtn = listEl.querySelector('#xsact-ca-import');
        var importMenu = listEl.querySelector('#xsact-ca-import-menu');
        if (importBtn && importMenu) {
            importBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                importMenu.classList.toggle('hidden');
            });
            importMenu.querySelectorAll('button').forEach(function(mb) {
                mb.addEventListener('click', function(e) {
                    e.stopPropagation();
                    importMenu.classList.add('hidden');
                    var mode = mb.dataset.import;
                    if (mode === 'echo') { importCustomFromEcho(); }
                    else if (mode === 'file') { listEl.querySelector('#xsact-ca-file-input').click(); }
                });
            });
            var closeMenu = function(ev) { if (!importMenu.contains(ev.target) && !importBtn.contains(ev.target)) importMenu.classList.add('hidden'); };
            state.actionPanelEl.addEventListener('click', closeMenu);
        }
        var fileInput = listEl.querySelector('#xsact-ca-file-input');
        if (fileInput) fileInput.addEventListener('change', function() {
            var file = fileInput.files && fileInput.files[0];
            if (file) importCustomFromFile(file);
            fileInput.value = '';
        });
        var exportBtn = listEl.querySelector('#xsact-ca-export');
        if (exportBtn) exportBtn.addEventListener('click', exportCustomActions);
        var echoCleanBtn = listEl.querySelector('#xsact-ca-echo-clean-btn');
        if (echoCleanBtn) echoCleanBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            qiactConfirm({
                title: QiActT('custom.echo_clean_confirm_title'),
                body: QiActT('custom.echo_clean_confirm_body'),
                confirmText: QiActT('custom.echo_clean_confirm_btn'),
                danger: true
            }).then(function(ok) {
                if (ok) caCleanupEchoData();
            });
        });
        var packToggle = listEl.querySelector('.xsact-ca-xiaosu-pack');
        if (packToggle) packToggle.addEventListener('change', function() {
            setXiaosuPack(!!packToggle.checked);
            updateCustomActionPanel(charObj);
        });
        // chip 过滤：点击切换 caFilter，持久化，重新渲染
        listEl.querySelectorAll('.xsact-ca-chip').forEach(function(btn) {
            if (btn.disabled) return;
            btn.addEventListener('click', function() {
                var k = btn.dataset.filter;
                if (!k || state.caFilter === k) return;
                state.caFilter = k;
                persist(S_CA_FILTER, k);
                updateCustomActionPanel(charObj);
            });
        });
        var searchInput = listEl.querySelector('#xsact-ca-search');
        if (searchInput) searchInput.addEventListener('input', function() {
            var q = searchInput.value.trim().toLowerCase();
            listEl.querySelectorAll('.xsact-ca-card').forEach(function(card) {
                var nm = (card.querySelector('.xsact-ca-name') || {}).textContent || '';
                card.style.display = (!q || nm.toLowerCase().indexOf(q) !== -1) ? '' : 'none';
            });
        });

        // 编辑模式按钮（进入 / 退出）
        var editModeBtn = listEl.querySelector('#xsact-ca-editmode');
        if (editModeBtn) editModeBtn.addEventListener('click', function() {
            state.caEditMode = !state.caEditMode;
            state.caSelected = [];
            updateCustomActionPanel(charObj);
        });

        // 一键切换所有开关：当前若全部已开启则全部关闭，否则全部开启
        var toggleAllBtn = listEl.querySelector('#xsact-ca-toggleall');
        if (toggleAllBtn) toggleAllBtn.addEventListener('click', function() {
            var turnOn = !allOn;
            acts.forEach(function(a) {
                a.visible = turnOn;
                caRegister(a);
            });
            saveCustomActions();
            updateCustomActionPanel(charObj);
            toast(turnOn ? QiActT('custom.toggle_all_on_toast', { n: acts.length }) : QiActT('custom.toggle_all_off_toast', { n: acts.length }), turnOn ? '#46E0A0' : '#888');
        });

        // 非编辑模式：执行 / 编辑 / 删除 / 开关
        listEl.querySelectorAll('.xsact-ca-run').forEach(function(btn) {
            btn.addEventListener('click', function(e) { e.stopPropagation(); runCustomAction(btn.dataset.id, charObj); });
        });
        listEl.querySelectorAll('.xsact-ca-edit').forEach(function(btn) {
            btn.addEventListener('click', function(e) { e.stopPropagation(); state.editingCustomId = btn.dataset.id; updateCustomActionPanel(charObj); });
        });
        listEl.querySelectorAll('.xsact-ca-delete').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                var id = btn.dataset.id;
                var a = getCustom(id);
                if (a) qiactConfirm({ title: QiActT('custom.delete_confirm_title'), body: QiActT('custom.delete_confirm_body', { name: a.name }), confirmText: QiActT('custom.delete_confirm_btn'), danger: true }).then(function(ok) { if (!ok) return; deleteCustom(id); updateCustomActionPanel(charObj); toast(QiActT('toast.deleted'), '#888'); });
            });
        });
        listEl.querySelectorAll('.xsact-ca-visible').forEach(function(chk) {
            chk.addEventListener('change', function() {
                var id = chk.dataset.id;
                var a = getCustom(id);
                if (!a) return;
                a.visible = !!chk.checked;
                saveCustomActions();
                caRegister(a);
                updateCustomActionPanel(charObj);
                toast(a.visible ? QiActT('custom.show_toast', { name: a.name }) : QiActT('custom.hide_toast', { name: a.name }), a.visible ? '#46E0A0' : '#888');
            });
        });

        // 编辑模式：批量栏 + 点击选中 + 拖拽排序
        if (editMode) {
            var selectAllBtn = listEl.querySelector('#xsact-ca-select-all');
            var selectedCountEl = listEl.querySelector('#xsact-ca-selected-count');
            var batchCloseBtn = listEl.querySelector('#xsact-ca-batch-close');
            var batchDeleteBtn = listEl.querySelector('#xsact-ca-batch-delete');
            function syncSel() {
                var cards = listEl.querySelectorAll('.xsact-ca-card.is-edit');
                cards.forEach(function(card) {
                    var id = card.dataset.id;
                    if (state.caSelected.indexOf(id) !== -1) card.classList.add('is-selected');
                    else card.classList.remove('is-selected');
                });
                if (selectedCountEl) selectedCountEl.textContent = QiActT('custom.selected_count', { n: state.caSelected.length });
                if (batchCloseBtn) batchCloseBtn.disabled = state.caSelected.length === 0;
                if (batchDeleteBtn) batchDeleteBtn.disabled = state.caSelected.length === 0;
                if (selectAllBtn) selectAllBtn.textContent = (state.caSelected.length > 0 && state.caSelected.length === cards.length) ? QiActT('custom.cancel_select_all') : QiActT('custom.select_all');
            }
            if (selectAllBtn) selectAllBtn.addEventListener('click', function() {
                var cards = Array.from(listEl.querySelectorAll('.xsact-ca-card.is-edit'));
                var allSelected = state.caSelected.length > 0 && state.caSelected.length === cards.length;
                state.caSelected = allSelected ? [] : cards.map(function(c){ return c.dataset.id; });
                syncSel();
            });
            listEl.querySelectorAll('.xsact-ca-card.is-edit').forEach(function(card) {
                card.addEventListener('click', function(e) {
                    if (e.target.closest('.xsact-ca-handle')) return; // 拖拽手柄不触发选中
                    var id = card.dataset.id;
                    var idx = state.caSelected.indexOf(id);
                    if (idx === -1) state.caSelected.push(id);
                    else state.caSelected.splice(idx, 1);
                    syncSel();
                });
            });
            if (batchCloseBtn) batchCloseBtn.addEventListener('click', function() {
                if (!state.caSelected.length) return;
                state.caSelected.slice().forEach(function(id) {
                    var a = getCustom(id);
                    if (!a) return;
                    a.visible = false;
                    caRegister(a);
                });
                saveCustomActions();
                updateCustomActionPanel(charObj);
                toast(QiActT('custom.batch_close_toast', { n: state.caSelected.length }), '#888');
            });
            if (batchDeleteBtn) batchDeleteBtn.addEventListener('click', function() {
                if (!state.caSelected.length) return;
                var names = state.caSelected.map(function(id) { var a = getCustom(id); return a ? a.name : ''; }).filter(Boolean).join('、');
                var n = state.caSelected.length;
                qiactConfirm({
                    title: QiActT('custom.batch_delete_title', { n: n }),
                    body: QiActT('custom.batch_delete_body', { names: names }),
                    confirmText: QiActT('custom.batch_delete_btn'),
                    danger: true
                }).then(function(ok) {
                    if (!ok) return;
                    state.caSelected.slice().forEach(function(id) { deleteCustom(id); });
                    state.caSelected = [];
                    updateCustomActionPanel(charObj);
                    toast(QiActT('custom.batch_deleted_toast', { n: n }), '#FF5C5C');
                });
            });

            // 拖拽排序
            var dragList = listEl.querySelector('.xsact-ca-list.is-editing');
            if (dragList) {
                var dragEl = null;
                dragList.addEventListener('dragstart', function(e) {
                    var card = e.target.closest('.xsact-ca-card.is-edit');
                    if (!card) return;
                    dragEl = card;
                    state.caDragId = card.dataset.id;
                    e.dataTransfer.effectAllowed = 'move';
                    try { e.dataTransfer.setData('text/plain', card.dataset.id); } catch (err) { console.warn('[QiAct] 拖拽 setData 失败（已忽略）:', err && err.message); }
                    setTimeout(function(){ if (dragEl) dragEl.classList.add('dragging'); }, 0);
                });
                dragList.addEventListener('dragover', function(e) {
                    if (!dragEl) return;
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    var after = getCaDragAfter(dragList, e.clientY);
                    if (after == null) dragList.appendChild(dragEl);
                    else dragList.insertBefore(dragEl, after);
                });
                dragList.addEventListener('drop', function(e) { if (dragEl) e.preventDefault(); });
                dragList.addEventListener('dragend', function() {
                    if (!dragEl) return;
                    dragEl.classList.remove('dragging');
                    dragEl = null;
                    var ids = Array.from(dragList.querySelectorAll('.xsact-ca-card.is-edit')).map(function(c){ return c.dataset.id; });
                    state.customActions.sort(function(a, b){ return ids.indexOf(a.id) - ids.indexOf(b.id); });
                    saveCustomActions();
                    updateCustomActionPanel(charObj);
                });
            }
            syncSel();
        }
    }

    /** 自定义动作列表拖拽排序：根据鼠标 Y 坐标计算插入位置
     *  （返回应插入其前的元素；null 表示插入到末尾）。 */
