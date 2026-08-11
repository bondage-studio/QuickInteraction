    /* Panel position, resize and event bindings. */
    function applyPanelPosition() {
        if (!state.actionPanelEl) return;
        var saved = loadSetting(S_POS, null);
        if (saved && typeof saved.left === 'number' && typeof saved.top === 'number') {
            state.actionPanelEl.style.right = 'auto';
            state.actionPanelEl.style.bottom = 'auto';
            state.actionPanelEl.style.left = saved.left + 'px';
            state.actionPanelEl.style.top = saved.top + 'px';
        }
    }

    /** 保存面板位置（拖拽结束调用） */
    function savePanelPosition() {
        if (!state.actionPanelEl) return;
        var r = state.actionPanelEl.getBoundingClientRect();
        persist(S_POS, { left: Math.round(r.left), top: Math.round(r.top) });
    }

    /** 应用保存的面板尺寸 */
    function applyPanelSize() {
        if (!state.actionPanelEl) return;
        var saved = loadSetting(S_SIZE, null);
        if (saved && typeof saved.width === 'number' && typeof saved.height === 'number') {
            state.actionPanelEl.style.width = Math.max(220, Math.min(560, saved.width)) + 'px';
            state.actionPanelEl.style.height = Math.max(300, Math.min(Math.min(window.innerHeight - 60, 820), saved.height)) + 'px';
        }
    }

    /** 保存面板尺寸（缩放结束调用） */
    function savePanelSize() {
        if (!state.actionPanelEl) return;
        persist(S_SIZE, { width: Math.round(state.actionPanelEl.offsetWidth), height: Math.round(state.actionPanelEl.offsetHeight) });
    }

    /** 让面板右下角可缩放 */
    function makeResizable(panel) {
        var handle = panel.querySelector('#xsact-resize-handle');
        if (!handle) return;
        var resizing = false, sx = 0, sy = 0, ow = 0, oh = 0;

        function onMove(e) {
            if (!resizing) return;
            var nw = ow + (e.clientX - sx);
            var nh = oh + (e.clientY - sy);
            nw = Math.max(220, Math.min(560, nw));
            nh = Math.max(300, Math.min(Math.min(window.innerHeight - 60, 820), nh));
            panel.style.width = nw + 'px';
            panel.style.height = nh + 'px';
        }
        function onUp() {
            if (!resizing) return;
            resizing = false;
            handle.classList.remove('resizing');
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
            savePanelSize();
        }
        handle.addEventListener('mousedown', function(e) {
            resizing = true;
            sx = e.clientX; sy = e.clientY;
            ow = panel.offsetWidth; oh = panel.offsetHeight;
            handle.classList.add('resizing');
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
            e.preventDefault();
            e.stopPropagation();
        });
    }

    /** 让面板标题栏可拖拽 */
    function makeDraggable(panel) {
        var header = panel.querySelector('#xsact-panel-header');
        if (!header) return;
        var dragging = false, sx = 0, sy = 0, ox = 0, oy = 0;

        function onMove(e) {
            if (!dragging) return;
            var nx = ox + (e.clientX - sx);
            var ny = oy + (e.clientY - sy);
            // 限制在视口内
            var w = panel.offsetWidth, h = panel.offsetHeight;
            nx = Math.max(4, Math.min(nx, window.innerWidth - w - 4));
            ny = Math.max(4, Math.min(ny, window.innerHeight - h - 4));
            panel.style.left = nx + 'px';
            panel.style.top = ny + 'px';
            panel.style.right = 'auto';
            panel.style.bottom = 'auto';
        }
        function onUp() {
            if (!dragging) return;
            dragging = false;
            header.classList.remove('dragging');
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
            savePanelPosition();
        }
        header.addEventListener('mousedown', function(e) {
            // 标题栏上的按钮/下拉不触发拖拽
            if (e.target.closest('button, select, input')) return;
            dragging = true;
            sx = e.clientX; sy = e.clientY;
            var r = panel.getBoundingClientRect();
            ox = r.left; oy = r.top;
            panel.style.right = 'auto';
            panel.style.bottom = 'auto';
            header.classList.add('dragging');
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
            e.preventDefault();
        });
    }

    // 语言下拉的全局关闭监听只需绑定一次（rebuildPanel 会频繁重建面板）
    var __langGlobalBound = false;

    function bindPanelEvents(panel) {
        // 退出按钮（面板上的 ✕）
        var exitBtn = panel.querySelector('#xsact-exit-panel-btn');
        if (exitBtn) exitBtn.addEventListener('click', function() { toggleActionMode(); });

        // 刷新按钮：重新渲染当前面板状态（单部位刷新动作列表，组合模式刷新组合列表）
        var refreshBtn = panel.querySelector('#xsact-refresh-btn');
        if (refreshBtn) refreshBtn.addEventListener('click', refreshPanelState);
        var settingsBtn = panel.querySelector('#xsact-settings-btn');
        if (settingsBtn) settingsBtn.addEventListener('click', function() { setPanelMode('settings'); });

        // 语言切换下拉（自定义菜单）：setLang 后重建面板以应用新语言（auto 跟随 BC 游戏语言）
        var langWrap = panel.querySelector('#xsact-lang');
        var langTrigger = panel.querySelector('#xsact-lang-trigger');
        var langMenu = panel.querySelector('#xsact-lang-menu');
        if (langWrap && langTrigger && langMenu) {
            var closeLang = function() { langWrap.classList.remove('open'); langTrigger.setAttribute('aria-expanded', 'false'); };
            var openLang = function() {
                langWrap.classList.add('open'); langTrigger.setAttribute('aria-expanded', 'true');
                var act = langMenu.querySelector('.xsact-lang-item.active') || langMenu.querySelector('.xsact-lang-item');
                if (act) act.focus();
            };
            langTrigger.addEventListener('click', function(e) {
                e.stopPropagation();
                if (langWrap.classList.contains('open')) closeLang(); else openLang();
            });
            langMenu.querySelectorAll('.xsact-lang-item').forEach(function(it) {
                it.addEventListener('click', function(e) {
                    e.stopPropagation();
                    var code = it.getAttribute('data-lang');
                    if (typeof QiActI18n !== 'undefined' && QiActI18n.setLang) QiActI18n.setLang(code);
                    closeLang();
                    if (typeof rebuildPanel === 'function') rebuildPanel();
                    else if (window.__QiAct && window.__QiAct.rebuild) window.__QiAct.rebuild();
                });
            });
            // 键盘导航：菜单内 ↑/↓ 移动高亮，Enter 选中（按钮原生触发 click），Esc 关闭
            langMenu.addEventListener('keydown', function(e) {
                var items = Array.prototype.slice.call(langMenu.querySelectorAll('.xsact-lang-item'));
                var idx = items.indexOf(document.activeElement);
                if (e.key === 'ArrowDown') { e.preventDefault(); (items[(idx + 1) % items.length] || items[0]).focus(); }
                else if (e.key === 'ArrowUp') { e.preventDefault(); (items[(idx - 1 + items.length) % items.length] || items[0]).focus(); }
                else if (e.key === 'Escape') { e.preventDefault(); closeLang(); langTrigger.focus(); }
            });
            // 仅绑定一次：点击面板外 / Esc 关闭（Esc 用捕获阶段，绕过 BC 自身对 Escape 的 stopPropagation）
            if (!__langGlobalBound) {
                __langGlobalBound = true;
                document.addEventListener('click', function(e) {
                    var w = document.getElementById('xsact-lang');
                    if (w && !w.contains(e.target)) { w.classList.remove('open'); var t = document.getElementById('xsact-lang-trigger'); if (t) t.setAttribute('aria-expanded', 'false'); }
                });
                document.addEventListener('keydown', function(e) {
                    if (e.key === 'Escape') { var w = document.getElementById('xsact-lang'); if (w && w.classList.contains('open')) { w.classList.remove('open'); var t = document.getElementById('xsact-lang-trigger'); if (t) { t.setAttribute('aria-expanded', 'false'); t.focus(); } } }
                }, true);
            }
        }

        // 模式切换标签（动作 / 组合动作）
        panel.querySelectorAll('.xsact-mode-tab').forEach(function(tab) {
            tab.addEventListener('click', function() { setPanelMode(tab.dataset.mode); });
        });

        // 人物列表弹出层：左侧三角形按钮 + 关闭 + 返回
        var charPopoverTab = panel.querySelector('#xsact-char-popover-tab');
        var charPopoverClose = panel.querySelector('#xsact-char-popover-close');
        var charPopoverBack = panel.querySelector('#xsact-char-popover-back');
        if (charPopoverTab) {
            charPopoverTab.addEventListener('click', function(e) {
                e.stopPropagation();
                toggleCharPopover();
            });
        }
        if (charPopoverClose) {
            charPopoverClose.addEventListener('click', function(e) {
                e.stopPropagation();
                closeCharPopover();
            });
        }
        if (charPopoverBack) {
            charPopoverBack.addEventListener('click', function(e) {
                e.stopPropagation();
                state.popoverView = 'chars';
                renderPopover();
            });
        }
        // 点击面板内部不关闭；点击面板外部关闭人物列表
        panel.addEventListener('click', function(e) {
            var popover = panel.querySelector('#xsact-char-popover');
            if (popover && state.charListOpen && !popover.contains(e.target) && e.target !== charPopoverTab && !(charPopoverTab && charPopoverTab.contains(e.target))) {
                closeCharPopover();
            }
        });
        // 阻止 BC 页面全局 wheel 监听吞掉面板内滚动：wheel 事件在面板层停止冒泡，
        // 让面板/浮层自身的 overflow 滚动正常生效（不 preventDefault，保留原生滚动）。
        panel.addEventListener('wheel', function(e) { e.stopPropagation(); }, { passive: true });
        var charPop = panel.querySelector('#xsact-char-popover');
        if (charPop) charPop.addEventListener('wheel', function(e) { e.stopPropagation(); }, { passive: true });

        // 右侧动作选择面板需要更积极的滚动保护：BC 页面全局可能在 capture 阶段
        // preventDefault 滚动，因此直接拦截动作列表的 wheel 事件并手动滚动。
        var actionList = panel.querySelector('#xsact-action-list');
        if (actionList) {
            function onActionListWheel(e) {
                e.preventDefault();
                e.stopPropagation();
                actionList.scrollTop += e.deltaY;
            }
            actionList.addEventListener('wheel', onActionListWheel, { passive: false });
            // 触屏设备：阻止 document 层 touchmove 被 preventDefault，保留容器内自然滚动
            actionList.addEventListener('touchmove', function(e) { e.stopPropagation(); }, { passive: true });
        }

        // 全员执行按钮：切换全员范围开关
        var allBtn = panel.querySelector('#xsact-all-btn');
        if (allBtn) allBtn.addEventListener('click', toggleAllMode);

        // 自己模式按钮
        var selfBtn = panel.querySelector('#xsact-self-btn');
        if (selfBtn) selfBtn.addEventListener('click', toggleSelfMode);


        // ×3 连打
        var x3Btn = panel.querySelector('#xsact-x3-btn');
        if (x3Btn) x3Btn.addEventListener('click', function() {
            if (!state.selectedTarget || !state.selectedAction) return;
            var count = 0;
            var doIt = function() {
                if (count < 3 && state.isActive) {
                    executeAction(state.selectedTarget, state.selectedAction);
                    count++;
                    setTimeout(doIt, 300);
                }
            };
            doIt();
        });

        // 收藏按钮：切换收藏模式
        var favBtn = panel.querySelector('#xsact-fav-btn');
        if (favBtn) favBtn.addEventListener('click', toggleFavMode);
        var gridBtn = panel.querySelector('#xsact-grid-btn');
        if (gridBtn) gridBtn.addEventListener('click', toggleInteractionGrid);

        // 清空收藏按钮

        // 主题切换按钮（太阳/月亮）
        var themeBtn = panel.querySelector('#xsact-theme-btn');
        if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
    }

    /** 取当前主题强调色（用于 toast 等需要真实颜色值的场景） */
    function accentColor() {
        try { return getComputedStyle(document.documentElement).getPropertyValue('--xs-accent').trim() || '#FF5C7A'; }
        catch (e) { return '#FF5C7A'; }
    }

    /** 重复上次动作 */
    function repeatLastAction() {
        if (!state.lastAction) { toast(QiActT('toast.no_last'), '#888'); return; }
        var target = (ChatRoomCharacter || []).find(function(c) {
            return c && c.MemberNumber === state.lastAction.targetMN;
        });
        if (!target) { toast(QiActT('toast.target_not_in_room'), '#FF5C5C'); return; }
        state.selectedTarget = target;
        state.selectedPart = state.lastAction.part || '';
        state.selectedAction = state.lastAction.name;
        executeAction(target, state.lastAction.name);
        toast(QiActT('toast.repeat', { name: state.lastAction.name }), '#FF5C7A');
    }

    // ════════════════════════════════════════════════════════════════════════
    // CSS 样式注入
    // ════════════════════════════════════════════════════════════════════════

    // 生成主题调色板 CSS（只保留 dark/light 两套）
    function buildThemeVarsCSS() {
        var DARK = {
            bg:'rgba(20,23,28,0.98)', bg2:'#1C2027', border:'rgba(255,255,255,0.08)',
            borderStrong:'rgba(255,255,255,0.18)', text:'#E7E9EE', textDim:'#9AA1AD',
            textFaint:'#5F6672', hover:'#232833', shadow:'0 14px 44px rgba(0,0,0,0.55)',
            scroll:'#3A3F49', blur:'blur(10px)', inputBg:'#10131A',
            btnBg:'rgba(255,255,255,0.05)', nameShadow:'rgba(255,92,122,0.45)'
        };
        var LIGHT = {
            bg:'rgba(248,245,251,0.97)', bg2:'#E9E6EF', border:'rgba(28,22,32,0.14)',
            borderStrong:'rgba(28,22,32,0.32)', text:'#1E2430', textDim:'#4A5568',
            textFaint:'#7B8494', hover:'#DCD9E2', shadow:'0 14px 40px rgba(60,40,80,0.16)',
            scroll:'#B8BCC6', blur:'blur(14px)', inputBg:'#FFFFFF',
            btnBg:'rgba(28,22,32,0.07)', nameShadow:'rgba(255,92,122,0.35)'
        };
        var ACCENT = '#FF5C7A', ACCENT_RGB = '255,92,122';
        var ZONES = {
            dark: {
                stroke:'rgba(255,255,255,0.35)', strokeHover:'#fff', strokeSelected:'var(--xs-accent)',
                fill:'rgba(' + ACCENT_RGB + ',0.08)', fillHover:'rgba(' + ACCENT_RGB + ',0.26)', fillSelected:'rgba(' + ACCENT_RGB + ',0.32)',
                filter:'drop-shadow(0 0 10px rgba(' + ACCENT_RGB + ',0.06))'
            },
            light: {
                stroke:'rgba(74,68,88,0.70)', strokeHover:'var(--xs-accent)', strokeSelected:'#B02A4E',
                fill:'rgba(' + ACCENT_RGB + ',0.10)', fillHover:'rgba(' + ACCENT_RGB + ',0.22)', fillSelected:'rgba(' + ACCENT_RGB + ',0.30)',
                filter:'drop-shadow(0 0 6px rgba(' + ACCENT_RGB + ',0.10))'
            }
        };
        // 默认回退（置于最前）：:root 与 [data-xsact-theme] 特异性相同(0,1,0)，
        // 必须让主题规则靠后、优先生效；属性缺失时才回退到这里。
        var blocks = [':root{' +
            '--xs-accent:' + ACCENT + ';--xs-accent-rgb:' + ACCENT_RGB + ';--xs-accent-soft:rgba(' + ACCENT_RGB + ',0.14);--xs-accent-text:#D6336C;' +
            '--xs-panel-bg:' + DARK.bg + ';--xs-panel-bg-2:' + DARK.bg2 + ';--xs-border:' + DARK.border + ';' +
            '--xs-border-strong:' + DARK.borderStrong + ';--xs-text:' + DARK.text + ';--xs-text-dim:' + DARK.textDim + ';--xs-text-faint:' + DARK.textFaint + ';' +
            '--xs-hover:' + DARK.hover + ';--xs-shadow:' + DARK.shadow + ';--xs-scroll:' + DARK.scroll + ';--xs-blur:' + DARK.blur + ';' +
            '--xs-input-bg:' + DARK.inputBg + ';--xs-btn-bg:' + DARK.btnBg + ';--xs-name-shadow:' + DARK.nameShadow + ';' +
            '--xs-zone-stroke:' + ZONES.dark.stroke + ';--xs-zone-stroke-hover:' + ZONES.dark.strokeHover + ';--xs-zone-stroke-selected:' + ZONES.dark.strokeSelected + ';' +
            '--xs-zone-fill:' + ZONES.dark.fill + ';--xs-zone-fill-hover:' + ZONES.dark.fillHover + ';--xs-zone-fill-selected:' + ZONES.dark.fillSelected + ';' +
            '--xs-zone-filter:' + ZONES.dark.filter + ';' +
        '}'];
        THEMES.forEach(function(t) {
            var p = (t.base === 'light') ? LIGHT : DARK;
            var z = (t.base === 'light') ? ZONES.light : ZONES.dark;
            var accentText = (t.base === 'light') ? '#B02A4E' : '#FFD6DF';
            blocks.push('[data-xsact-theme="' + t.id + '"]{' +
                '--xs-accent:' + ACCENT + ';' +
                '--xs-accent-rgb:' + ACCENT_RGB + ';' +
                '--xs-accent-soft:rgba(' + ACCENT_RGB + ',0.14);' +
                '--xs-accent-text:' + accentText + ';' +
                '--xs-panel-bg:' + p.bg + ';' +
                '--xs-panel-bg-2:' + p.bg2 + ';' +
                '--xs-border:' + p.border + ';' +
                '--xs-border-strong:' + p.borderStrong + ';' +
                '--xs-text:' + p.text + ';' +
                '--xs-text-dim:' + p.textDim + ';' +
                '--xs-text-faint:' + p.textFaint + ';' +
                '--xs-hover:' + p.hover + ';' +
                '--xs-shadow:' + p.shadow + ';' +
                '--xs-scroll:' + p.scroll + ';' +
                '--xs-blur:' + p.blur + ';' +
                '--xs-input-bg:' + p.inputBg + ';' +
                '--xs-btn-bg:' + p.btnBg + ';' +
                '--xs-name-shadow:' + p.nameShadow + ';' +
                '--xs-zone-stroke:' + z.stroke + ';' +
                '--xs-zone-stroke-hover:' + z.strokeHover + ';' +
                '--xs-zone-stroke-selected:' + z.strokeSelected + ';' +
                '--xs-zone-fill:' + z.fill + ';' +
                '--xs-zone-fill-hover:' + z.fillHover + ';' +
                '--xs-zone-fill-selected:' + z.fillSelected + ';' +
                '--xs-zone-filter:' + z.filter + ';' +
            '}');
        });
        return blocks.join('\n');
    }

