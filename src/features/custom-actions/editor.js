    /* Custom action editor and drag ordering. */
    function getCaDragAfter(container, y) {
        var els = Array.from(container.querySelectorAll('.xsact-ca-card.is-edit:not(.dragging)'));
        var closest = { offset: -Infinity, el: null };
        els.forEach(function(child) {
            var box = child.getBoundingClientRect();
            var offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                closest = { offset: offset, el: child };
            }
        });
        return closest.el;
    }

    /** 渲染一个迷你身体部位选择 SVG（用于自定义动作编辑器内）。
     *  复用 BC 原生 Zone 矩形，尺寸自适应容器。 */
    function renderBodyMapMini(container, selectedGroup, onSelect) {
        var rects = '';
        BODY_PARTS.forEach(function(part) {
            var zones = getPartZones(Player, part.group);
            zones.forEach(function(z) {
                var rx = Math.min(14, Math.min(z[2], z[3]) * 0.35);
                var sel = isSamePartFamily(selectedGroup, part.group) ? ' selected' : '';
                rects += '<rect class="xsact-body-part-zone' + sel + '" data-group="' + part.group +
                    '" x="' + z[0].toFixed(1) + '" y="' + z[1].toFixed(1) + '" width="' + z[2].toFixed(1) +
                    '" height="' + z[3].toFixed(1) + '" rx="' + rx.toFixed(1) + '" data-label="' + escapeHtml(QiActT('part.' + part.group)) + '"/>';
            });
        });
        var svg = '<svg class="xsact-body-mini-svg" viewBox="0 0 500 1000" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">' + rects + '</svg>';
        container.innerHTML = '<div class="xsact-body-mini-hint">' + QiActT('editor.pick_part_hint') + '</div>' + svg;
        var hint = container.querySelector('.xsact-body-mini-hint');
        container.querySelectorAll('.xsact-body-part-zone').forEach(function(zone) {
            zone.addEventListener('mouseenter', function() {
                if (hint) hint.textContent = zone.dataset.label || zone.dataset.group;
                zone.classList.add('hover');
            });
            zone.addEventListener('mouseleave', function() {
                if (hint) hint.textContent = QiActT('editor.pick_part_hint');
                zone.classList.remove('hover');
            });
            zone.addEventListener('click', function(e) {
                e.stopPropagation();
                var group = zone.dataset.group;
                updatePartFamilySelection(container, group, '.xsact-body-part-zone');
                if (onSelect) onSelect(group, zone.dataset.label || group);
            });
        });
    }

    function renderCustomEditor(act, charObj, listEl, titleEl) {
        var footerEl = state.actionPanelEl && state.actionPanelEl.querySelector('.xsact-qa-panel-footer');
        if (footerEl) footerEl.style.display = 'none';
        var isNew = !getCustom(act.id);
        titleEl.textContent = (isNew ? QiActT('editor.new_title') : QiActT('editor.edit_title'));
        var scope = act.scope || 'other';
        var group = act.group || 'ItemMouth';
        var partLbl = QiActT('part.' + group);
        var html = '<div class="xsact-ca-editor">';
        html += '<div class="xsact-combo-field"><label>' + QiActT('editor.name_label') + '</label>' + '<input type="text" id="xsact-ca-name" value="' + escapeHtml(act.name) + '" placeholder="' + QiActT('editor.name_placeholder') + '"></div>';
        html += '<div class="xsact-combo-field"><label>' + QiActT('editor.scope_label') + '</label>' + '<div class="xsact-ca-scope" id="xsact-ca-scope">' +
            '<button data-scope="other" class="' + (scope === 'other' ? 'active' : '') + '">' + QiActT('custom.scope_other') + '</button>' +
            '<button data-scope="self" class="' + (scope === 'self' ? 'active' : '') + '">' + QiActT('custom.scope_self') + '</button>' +
            '<button data-scope="any" class="' + (scope === 'any' ? 'active' : '') + '">' + QiActT('custom.scope_any') + '</button>' +
            '</div></div>';
        html += '<div class="xsact-combo-field"><label>' + QiActT('editor.part_label') + '</label>' +
            '<button type="button" class="xsact-ca-part-display" id="xsact-ca-part-display"><span class="xsact-ca-part-label">' + escapeHtml(partLbl) + '（' + group + '）</span><span class="xsact-ca-part-change">' + QiActT('editor.part_change') + '</span></button>' +
            '<div class="xsact-ca-part-map" id="xsact-ca-part-map"></div>' +
            '<input type="hidden" id="xsact-ca-group" value="' + group + '">' +
            '</div>';
        html += '<div class="xsact-combo-field"><div class="xsact-ca-field-head"><label>' + QiActT('editor.dialog_other_label') + '</label><div class="xsact-ca-field-tokens"><button type="button" class="xsact-ca-token" data-target="xsact-ca-dialog" data-token="{SourceCharacter}"><span class="xsact-ca-token-dot self"></span>' + QiActT('editor.token_self') + '</button><button type="button" class="xsact-ca-token" data-target="xsact-ca-dialog" data-token="{TargetCharacter}"><span class="xsact-ca-token-dot other"></span>' + QiActT('editor.token_other') + '</button></div></div><textarea id="xsact-ca-dialog-raw" class="xsact-ca-raw" rows="2">' + escapeHtml(act.dialog) + '</textarea><div id="xsact-ca-dialog" class="xsact-ca-dialog-rich" contenteditable="true" tabindex="0" data-placeholder="' + QiActT('editor.dialog_other_ph') + '"></div></div>';
        html += '<div class="xsact-combo-field"><div class="xsact-ca-field-head"><label>' + QiActT('editor.dialog_self_label') + '</label><div class="xsact-ca-field-tokens"><button type="button" class="xsact-ca-token" data-target="xsact-ca-dialogself" data-token="{SourceCharacter}"><span class="xsact-ca-token-dot self"></span>' + QiActT('editor.token_self') + '</button><button type="button" class="xsact-ca-token" data-target="xsact-ca-dialogself" data-token="{TargetCharacter}"><span class="xsact-ca-token-dot other"></span>' + QiActT('editor.token_other') + '</button></div></div><textarea id="xsact-ca-dialogself-raw" class="xsact-ca-raw" rows="2">' + escapeHtml(act.dialogSelf || '') + '</textarea><div id="xsact-ca-dialogself" class="xsact-ca-dialog-rich" contenteditable="true" tabindex="0" data-placeholder="' + QiActT('editor.dialog_self_ph') + '"></div></div>';
        html += '<div class="xsact-ca-preview" id="xsact-ca-preview"><span class="xsact-ca-preview-label">' + QiActT('editor.preview_label') + '</span><span class="xsact-ca-preview-text"></span></div>';
        html += '<div class="xsact-combo-actions">' +
            '<button class="xsact-combo-save-btn" id="xsact-ca-save">' + QiActT('editor.save') + '</button>' +
            (isNew ? '' : '<button class="xsact-ca-del-btn" id="xsact-ca-del">' + QiActT('editor.delete') + '</button>') +
            '<button class="xsact-combo-cancel-btn" id="xsact-ca-cancel">' + QiActT('editor.cancel') + '</button>' +
            '</div>';
        html += '</div>';
        html += '<div class="xsact-ca-part-picker hidden" id="xsact-ca-part-picker"><div class="xsact-ca-part-picker-backdrop" data-part-picker-close></div><div class="xsact-ca-part-picker-dialog" role="dialog" aria-modal="true" aria-labelledby="xsact-ca-part-picker-title"><div class="xsact-ca-part-picker-head"><strong id="xsact-ca-part-picker-title">' + QiActT('editor.part_picker_title') + '</strong><button type="button" class="xsact-ca-part-picker-close" data-part-picker-close aria-label="' + QiActT('editor.part_picker_close') + '">×</button></div><div class="xsact-ca-part-map xsact-ca-part-map-large" id="xsact-ca-part-map-large"></div></div></div>';
        listEl.innerHTML = html;

        var lastFocusedRich = listEl.querySelector('#xsact-ca-dialog');
        var lastFocusedRaw = listEl.querySelector('#xsact-ca-dialog-raw');
        function trackFocus(el, rawId) {
            if (!el) return;
            el.addEventListener('focus', function() { lastFocusedRich = el; lastFocusedRaw = listEl.querySelector('#' + rawId); });
            el.addEventListener('click', function() { lastFocusedRich = el; lastFocusedRaw = listEl.querySelector('#' + rawId); });
        }
        trackFocus(listEl.querySelector('#xsact-ca-name'), 'xsact-ca-name');
        trackFocus(listEl.querySelector('#xsact-ca-dialog'), 'xsact-ca-dialog-raw');
        trackFocus(listEl.querySelector('#xsact-ca-dialogself'), 'xsact-ca-dialogself-raw');
        // 对 raw textarea（调试或自动化场景）也同步跟踪
        ['#xsact-ca-dialog-raw', '#xsact-ca-dialogself-raw'].forEach(function(sel) {
            var rawEl = listEl.querySelector(sel);
            if (!rawEl) return;
            rawEl.addEventListener('focus', function() {
                lastFocusedRaw = rawEl;
                lastFocusedRich = listEl.querySelector('#' + rawEl.id.replace(/-raw$/, ''));
            });
        });

        function renderRichText(raw) {
            return escapeHtml(raw)
                .replace(/\{SourceCharacter\}/g, '<span class="xsact-token-pill" contenteditable="false" data-token="{SourceCharacter}">' + QiActT('editor.token_self_pill') + '<span class="xsact-zwsp">&#8203;</span>')
                .replace(/\{TargetCharacter\}/g, '<span class="xsact-token-pill" contenteditable="false" data-token="{TargetCharacter}">' + QiActT('editor.token_other_pill') + '<span class="xsact-zwsp">&#8203;</span>');
        }
        function extractRawFromRich(el) {
            var raw = '';
            function walk(nodes) {
                Array.from(nodes).forEach(function(node) {
                    if (node.nodeType === Node.TEXT_NODE) {
                        raw += node.textContent;
                    } else if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.classList && node.classList.contains('xsact-token-pill')) {
                            raw += node.dataset.token;
                        } else if (node.classList && node.classList.contains('xsact-zwsp')) {
                            // skip
                        } else {
                            walk(node.childNodes);
                        }
                    }
                });
            }
            walk(el.childNodes);
            return raw.replace(/\u200B/g, '');
        }
        function syncRichToRaw(richEl) {
            var rawEl = listEl.querySelector('#' + richEl.id + '-raw');
            if (!rawEl) return;
            rawEl.value = extractRawFromRich(richEl);
        }
        function syncRawToRich(rawEl) {
            var richEl = listEl.querySelector('#' + rawEl.id.replace(/-raw$/, ''));
            if (!richEl) return;
            richEl.innerHTML = renderRichText(rawEl.value);
        }
        function insertTokenPill(token, richEl) {
            var label = token === '{SourceCharacter}' ? QiActT('editor.token_self_pill') : QiActT('editor.token_other_pill');
            if (!richEl || richEl.contentEditable !== 'true') return;
            richEl.focus();
            var sel = window.getSelection();
            var range;
            if (!sel.rangeCount || !richEl.contains(sel.getRangeAt(0).commonAncestorContainer)) {
                range = document.createRange();
                range.selectNodeContents(richEl);
                range.collapse(false);
                sel.removeAllRanges();
                sel.addRange(range);
            } else {
                range = sel.getRangeAt(0);
            }
            // 删除当前选区内容（如用户选中了已有占位符 pill）
            range.deleteContents();
            var pill = document.createElement('span');
            pill.className = 'xsact-token-pill';
            pill.contentEditable = 'false';
            pill.dataset.token = token;
            pill.textContent = label;
            var zwsp = document.createElement('span');
            zwsp.className = 'xsact-zwsp';
            zwsp.textContent = '\u200B';
            var space = document.createTextNode(' ');
            var frag = document.createDocumentFragment();
            frag.appendChild(pill);
            frag.appendChild(zwsp);
            frag.appendChild(space);
            range.insertNode(frag);
            range.setStartAfter(space);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
            richEl.focus();
            syncRichToRaw(richEl);
            refreshPreview();
        }
        function insertToken(token) {
            // 占位符只应插入到两个 contenteditable 富文本框中；若最后聚焦的是名称输入框等，回退到默认对他人框
            var richEl = lastFocusedRich;
            if (!richEl || richEl.contentEditable !== 'true') richEl = listEl.querySelector('#xsact-ca-dialog');
            if (!richEl) {
                // 兜底：直接操作 raw textarea（对自动化/测试友好）
                var rawEl = lastFocusedRaw || listEl.querySelector('#xsact-ca-dialog-raw');
                if (!rawEl) return;
                var start = rawEl.selectionStart || 0;
                var end = rawEl.selectionEnd || 0;
                var before = rawEl.value.substring(0, start);
                var after = rawEl.value.substring(end);
                rawEl.value = before + token + after;
                var pos = start + token.length;
                rawEl.setSelectionRange(pos, pos);
                rawEl.focus();
                rawEl.dispatchEvent(new Event('input', { bubbles: true }));
                return;
            }
            insertTokenPill(token, richEl);
        }

        syncRawToRich(listEl.querySelector('#xsact-ca-dialog-raw'));
        syncRawToRich(listEl.querySelector('#xsact-ca-dialogself-raw'));

        listEl.querySelectorAll('.xsact-ca-token').forEach(function(btn) {
            // mousedown 阻止默认行为，防止按钮抢走富文本框焦点，避免插入后输入框"失活"
            btn.addEventListener('mousedown', function(e) { e.preventDefault(); });
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                insertTokenPill(btn.dataset.token, listEl.querySelector('#' + btn.dataset.target));
            });
        });

        var partMap = listEl.querySelector('#xsact-ca-part-map');
        var partMapLarge = listEl.querySelector('#xsact-ca-part-map-large');
        var partDisplay = listEl.querySelector('#xsact-ca-part-display');
        var partPicker = listEl.querySelector('#xsact-ca-part-picker');
        var groupInput = listEl.querySelector('#xsact-ca-group');
        function updatePartLabel(g) {
            var label = QiActT('part.' + g);
            if (partDisplay) partDisplay.querySelector('.xsact-ca-part-label').textContent = label + '（' + g + '）';
            if (groupInput) groupInput.value = g;
        }
        if (partMap) {
            renderBodyMapMini(partMap, group, function(newGroup, newLabel) {
                updatePartLabel(newGroup);
                updatePartFamilySelection(partMapLarge, newGroup, '.xsact-body-part-zone');
                refreshPreview();
                if (partPicker) partPicker.classList.add('hidden');
            });
        }
        if (partMapLarge) {
            renderBodyMapMini(partMapLarge, group, function(newGroup) {
                updatePartLabel(newGroup);
                updatePartFamilySelection(partMap, newGroup, '.xsact-body-part-zone');
                refreshPreview();
                if (partPicker) partPicker.classList.add('hidden');
            });
        }
        if (partDisplay && partPicker) partDisplay.addEventListener('click', function() { partPicker.classList.remove('hidden'); });
        if (partPicker) partPicker.querySelectorAll('[data-part-picker-close]').forEach(function(el) {
            el.addEventListener('click', function() { partPicker.classList.add('hidden'); });
        });

        function refreshPreview() {
            var nm = (listEl.querySelector('#xsact-ca-name') || {}).value || QiActT('editor.default_name');
            var dlg = (listEl.querySelector('#xsact-ca-dialog-raw') || {}).value || nm;
            var dlgSelf = (listEl.querySelector('#xsact-ca-dialogself-raw') || {}).value || '';
            var sc = (listEl.querySelector('#xsact-ca-scope') || {}).querySelector('.active');
            var scope = sc ? sc.dataset.scope : 'other';
            var src = (Player && (Player.Nickname || Player.Name)) || '某人';
            var tgt = (charObj && (charObj.Nickname || charObj.Name)) || '对方';
            // 根据“谁能使用”显示对应文本，any 时双行展示两种情形
            var preview;
            function resolveText(text, source, target) {
                return text.replace(/\{SourceCharacter\}/g, source).replace(/\{TargetCharacter\}/g, target);
            }
            if (scope === 'self') {
                // 仅自己：目标也是玩家自己，因此“对方”同样解析为玩家
                var textSelf = (dlgSelf.trim() ? dlgSelf : dlg).replace(/\{SourceCharacter\}/g, src).replace(/\{TargetCharacter\}/g, src);
                preview = textSelf; // 自己对自己，文本里已含角色，直接显示完整句子
            } else if (scope === 'any') {
                var textOther = resolveText(dlg, src, tgt);
                // 对自己时显示：保留源视角，因此“对方”仍指向实际目标（而非玩家自己）
                var textSelf = (dlgSelf.trim() ? dlgSelf : dlg).replace(/\{SourceCharacter\}/g, src).replace(/\{TargetCharacter\}/g, tgt);
                preview = QiActT('editor.preview', { a: textOther, b: textSelf });
            } else {
                preview = resolveText(dlg, src, tgt);
            }
            var pv = listEl.querySelector('#xsact-ca-preview');
            if (pv) { var pvt = pv.querySelector('.xsact-ca-preview-text'); if (pvt) pvt.textContent = preview; }
        }
        var scopeBox = listEl.querySelector('#xsact-ca-scope');
        if (scopeBox) scopeBox.querySelectorAll('button').forEach(function(b) {
            b.addEventListener('click', function() {
                scopeBox.querySelectorAll('button').forEach(function(x) { x.classList.remove('active'); });
                b.classList.add('active');
                refreshPreview();
            });
        });
        ['#xsact-ca-name', '#xsact-ca-dialog-raw', '#xsact-ca-dialogself-raw'].forEach(function(sel) {
            var el = listEl.querySelector(sel);
            if (el) el.addEventListener('input', refreshPreview);
        });
        ['#xsact-ca-dialog', '#xsact-ca-dialogself'].forEach(function(sel) {
            var el = listEl.querySelector(sel);
            if (el) el.addEventListener('input', function() {
                syncRichToRaw(el);
                refreshPreview();
            });
        });
        refreshPreview();

        var saveBtn = listEl.querySelector('#xsact-ca-save');
        if (saveBtn) saveBtn.addEventListener('click', function() {
            var nm = (listEl.querySelector('#xsact-ca-name') || {}).value || '';
            var dlg = (listEl.querySelector('#xsact-ca-dialog-raw') || {}).value || '';
            var dlgSelf = (listEl.querySelector('#xsact-ca-dialogself-raw') || {}).value || '';
            var sc = (listEl.querySelector('#xsact-ca-scope') || {}).querySelector('.active');
            var gp = (listEl.querySelector('#xsact-ca-group') || {}).value || 'ItemMouth';
            if (!nm.trim()) { toast(QiActT('toast.fill_name'), '#FF5C5C'); return; }
            if (!dlg.trim()) { toast(QiActT('toast.fill_dialog'), '#FF5C5C'); return; }
            var existing = getCustom(act.id);
            if (existing) caUnregister(existing);
            var updated = { id: act.id, name: nm.trim(), scope: (sc ? sc.dataset.scope : 'other'), group: gp, dialog: dlg, dialogSelf: dlgSelf, createdAt: act.createdAt || Date.now(), source: act.source || 'native', visible: typeof act.visible === 'boolean' ? act.visible : true, echoName: act.echoName || null, echoNames: Array.isArray(act.echoNames) ? act.echoNames.slice() : [] };
            upsertCustom(updated);
            state.editingCustomId = null;
            updateCustomActionPanel(charObj);
            toast(QiActT('toast.custom_saved'), '#46E0A0');
        });
        var cancelBtn = listEl.querySelector('#xsact-ca-cancel');
        if (cancelBtn) cancelBtn.addEventListener('click', function() {
            if (isNew) deleteCustom(act.id);
            state.editingCustomId = null; updateCustomActionPanel(charObj);
        });
        var delBtn = listEl.querySelector('#xsact-ca-del');
        if (delBtn) delBtn.addEventListener('click', function() {
            qiactConfirm({ title: QiActT('custom.delete_confirm_title'), body: QiActT('custom.delete_confirm_body', { name: act.name }), confirmText: QiActT('custom.delete_confirm_btn'), danger: true }).then(function(ok) {
                if (!ok) return;
                deleteCustom(act.id); state.editingCustomId = null; updateCustomActionPanel(charObj); toast(QiActT('toast.deleted'), '#888');
            });
        });
    }

