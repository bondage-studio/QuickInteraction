    // ── 原生动作按钮上的自定义动作图标（与插件视觉一致：玫红强调色 + 白色闪电）──
    var XSACT_ACTIVITY_ICON = 'data:image/svg+xml;utf8,' + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">' +
        '<rect x="2" y="2" width="20" height="20" rx="5" fill="#FF5C7A"/>' +
        '<path d="M13 6l-5 7h4l-1 5 6-8h-4z" fill="#ffffff"/>' +
        '</svg>'
    );

    function initTooltip() {
        if (window.__qiactTooltipReady) return;
        window.__qiactTooltipReady = true;

        var tip = document.createElement('div');
        tip.className = 'xsact-tooltip';
        tip.setAttribute('role', 'tooltip');
        tip.style.visibility = 'hidden';
        document.body.appendChild(tip);

        var currentEl = null;
        var showTimer = null;
        var SHOW_DELAY = 120;

        function isPluginTip(el) {
            return !!(el && el.closest && el.closest('#xsact-qa-panel, #xsact-toggle-btn, .xsact-update-banner'));
        }
        function getText(el) {
            var dt = el.getAttribute('data-tooltip');
            if (dt && dt.trim()) return dt;
            var t = el.getAttribute('title');
            return (t && t.trim()) ? t : '';
        }
        function render(el) {
            var raw = getText(el);
            if (!raw) { tip.innerHTML = ''; return; }
            var type = el.getAttribute('data-tooltip-type');
            tip.className = 'xsact-tooltip' + (type ? ' is-' + type : '');
            var parts = raw.split('@@');
            var html = '<span class="xsact-tt-title">' + escapeHtml(parts[0]) + '</span>';
            if (parts[1]) html += '<span class="xsact-tt-sub">' + escapeHtml(parts[1]) + '</span>';
            tip.innerHTML = html;
        }
        function position(el) {
            var r = el.getBoundingClientRect();
            var tr = tip.getBoundingClientRect();
            var gap = 8;
            var top = r.top - tr.height - gap;
            var left = r.left + r.width / 2 - tr.width / 2;
            if (top < 4) top = r.bottom + gap;
            if (left < 4) left = 4;
            if (left + tr.width > window.innerWidth - 4) left = window.innerWidth - tr.width - 4;
            if (top + tr.height > window.innerHeight - 4) top = window.innerHeight - tr.height - 4;
            tip.style.top = top + 'px';
            tip.style.left = left + 'px';
        }
        function show(el) {
            if (!isPluginTip(el)) return;
            var raw = getText(el);
            if (!raw) return;
            render(el); // 必须在抑制 title 之前渲染，否则 getText 会读到被清空的 title
            // 用空格占位抑制原生 title（属性仍存在于 DOM，closest 继续匹配；外部读取不受影响）
            if (el.getAttribute('title') && el.getAttribute('title').trim() !== '') {
                el.__xsTitle = el.getAttribute('title');
                el.setAttribute('title', ' ');
            }
            position(el);
            tip.style.visibility = 'visible';
            void tip.offsetWidth; // 强制 reflow 以触发过渡
            tip.classList.add('show');
            currentEl = el;
        }
        function hide() {
            if (showTimer) { clearTimeout(showTimer); showTimer = null; }
            tip.classList.remove('show');
            tip.style.visibility = 'hidden';
            if (currentEl && currentEl.__xsTitle != null) {
                // 仅当逻辑未在 hover 期间改写过 title 时才还原，避免覆盖动态更新
                if (!currentEl.getAttribute('title') || currentEl.getAttribute('title').trim() === '') {
                    currentEl.setAttribute('title', currentEl.__xsTitle);
                }
                currentEl.__xsTitle = null;
            }
            currentEl = null;
        }
        document.addEventListener('mouseover', function(e) {
            if (!e.target || !e.target.closest) return;
            var el = e.target.closest('[data-tooltip],[title]');
            if (el && isPluginTip(el)) {
                if (showTimer) { clearTimeout(showTimer); showTimer = null; }
                if (el !== currentEl) {
                    if (currentEl) hide();
                    showTimer = setTimeout(function() { show(el); }, SHOW_DELAY);
                }
            } else if (currentEl) {
                hide();
            }
        });
        document.addEventListener('mouseout', function(e) {
            if (showTimer) { clearTimeout(showTimer); showTimer = null; }
            var to = e.relatedTarget;
            if (!to || !to.closest) { hide(); return; }
            var el = to.closest('[data-tooltip],[title]');
            if (!el || !isPluginTip(el)) hide();
        });
        window.addEventListener('scroll', function() { if (currentEl) hide(); }, true);
    }

    // ════════════════════════════════════════════════════════════════════════
    // Hook 系统
    // ════════════════════════════════════════════════════════════════════════

    function setupHooks() {
        if (!state.modApi) return;

        // ── Hook: ActivityAllowedForGroup —— 屏蔽 echo 端已导入的同名原始动作 ──
        // 用户把 echo 动作导入到本插件后，会生成 QiAct_ 前缀的新 Activity。
        // 这里把 echo 原始 Activity（Name 在 echoSuppressed 集合中）过滤掉，
        // 确保插件动作列表和 BC 原生动作列表都不出现重复项。
        try {
            state.modApi.hookFunction('ActivityAllowedForGroup', 0, function(args, next) {
                var result = next(args);
                if (!state.echoSuppressed || state.echoSuppressed.size === 0 || !Array.isArray(result)) return result;
                return result.filter(function(item) {
                    var nm = (item && item.Activity && item.Activity.Name) || (item && item.Name);
                    return !caIsEchoSuppressed(nm);
                });
            });
        } catch (e) {
            console.warn('[QiAct] ActivityAllowedForGroup hook 失败:', e.message);
        }

        // ── Hook: AssetAllActivities —— 枚举期兜底过滤 echo 端已导入的同名原始动作 ──
        // 仅返回过滤后的「副本」，绝不改写全局数组（caRegister/caUnregister 等内部改写
        // 代码统一走 caRawAllActivities 读原始数组，因此本 hook 不会影响自定义动作注册）。
        // 优先级 0：在所有 mod 读取活动列表时即剔除 echo 原始项，覆盖 BC 原生活动面板、
        // 第三方 mod 枚举等任何直接调用 AssetAllActivities 的路径，解决屏蔽漏网。
        try {
            state.modApi.hookFunction('AssetAllActivities', 0, function(args, next) {
                var result = next(args);
                if (!state.echoSuppressed || state.echoSuppressed.size === 0 || !Array.isArray(result)) return result;
                try {
                    return result.filter(function(a) { return !caIsEchoSuppressed(a && a.Name); });
                } catch (e) { return result; }
            });
        } catch (e) {
            console.warn('[QiAct] AssetAllActivities hook 失败:', e.message);
        }

        // DrawCharacter(Character, X, Y, Zoom, ...) 的 X/Y/Zoom 是角色最终画上去的位置，
        // 含 ECHO 贴贴等活动的 X 位移，比 ChatRoomCharacterViewLoopCharacters 更准。
        // 这是线框能精确贴合人物模型的关键。
        try {
            state.modApi.hookFunction('DrawCharacter', 1, function(args, next) {
                var r = next(args);
                try {
                    var C = args[0], X = args[1], Y = args[2], Zoom = args[3];
                    if (C && C.MemberNumber != null && typeof X === 'number' &&
                        typeof CurrentScreen !== 'undefined' && CurrentScreen === 'ChatRoom') {
                        state.charAnchor[C.MemberNumber] = { x: X, y: Y, zoom: Zoom, t: Date.now() };
                    }
                } catch (e) { reportHookError('DrawCharacter锚点', e); }
                return r;
            });
        } catch (e) {
            console.warn('[QiAct] DrawCharacter 锚点 hook 失败:', e.message);
        }

        // Hook: DrawProcess — 每帧在主聊天界面确保切换按钮常驻
        state.modApi.hookFunction('DrawProcess', 4, function(args, next) {
            var result = next(args);
            try {
                if (typeof CurrentScreen !== 'undefined') {
                    if (CurrentScreen === 'ChatRoom') {
                        drawToggleButton();
                    } else if (state.toggleBtnEl) {
                        state.toggleBtnEl.style.display = 'none';
                    }
                }
            } catch (e) { reportHookError('DrawProcess', e); }
            return result;
        });

        // 窗口尺寸变化 → 刷新画布矩形缓存
        try {
            window.addEventListener('resize', function() { refreshCanvasCache(); });
        } catch (_) { /* 忽略：注册 resize 监听失败无影响 */ }

        // Hook: ChatRoomClick — 按钮已改为 DOM 元素，此处仅保留扩展点
        state.modApi.hookFunction('ChatRoomClick', 4, function(args, next) {
            // DOM 按钮(#xsact-toggle-btn) 自行处理点击事件，无需在此拦截
            return next(args);
        });

        // Hook: ActivityRun — 记录每次执行的上下文
        state.modApi.hookFunction('ActivityRun', 0, function(args, next) {
            try {
                var sourceChar = args[0];
                var targetChar = args[1];
                var group = args[2];
                var itemActivity = args[3] || {};
                var actName = (itemActivity.Activity && itemActivity.Activity.Name) || '';
                if (targetChar && actName) {
                    state.lastAction = {
                        name: actName,
                        targetMN: targetChar.MemberNumber,
                        part: (group && group.Name) || state.selectedPart || '',
                        time: Date.now()
                    };
                    saveStorage(S_LAST, state.lastAction);
                }
            } catch (e) { console.warn('[QiAct] ActivityRun hook 记录失败:', e.message); }
            next(args);
        });

        // Hook: ChatRoomMenuDraw — 动作模式下同步更新浮动网格位置（跟随角色）
        state.modApi.hookFunction('ChatRoomMenuDraw', 0, function(args, next) {
            var result = next(args);
            if (state.isActive) updateGridPositions();
            return result;
        });

        // 全局键盘: Esc 退出
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && state.isActive) {
                e.preventDefault();
                e.stopPropagation();
                toggleActionMode();
            }
        });

        // 定时刷新：检测新进入房间的角色（每 3 秒）
        function startRefreshTimer() {
            stopRefreshTimer();
            // 仅做兜底刷新：每帧 ChatRoomMenuDraw 已调用 updateGridPositions（其内部用
            // state.lastLayoutCount 正确判断人数变化并重建）。这里不能再用自己的
            // bodyGrids.size 与 layout.length 比较来触发 refreshBodyGrids，否则 selfMode
            // 关闭时玩家网格不计入 bodyGrids.size，导致 6 !== 7 永远成立，每 3 秒强制重建
            // 一次、线框瞬间跳动。
            state.refreshInterval = setInterval(function() {
                if (state.isActive) updateGridPositions();
            }, 3000);
        }
        function stopRefreshTimer() {
            if (state.refreshInterval) { clearInterval(state.refreshInterval); state.refreshInterval = null; }
        }

        // Hook ServerSend: 监听房间进出事件
        state.modApi.hookFunction('ServerSend', 0, function(args, next) {
            var data = args[0];
            if (data && (data.Type === 'Action' || data.Type === 'Activity')) {
                setTimeout(function() {
                    if (state.isActive) refreshBodyGrids();
                }, 500);
            }
            return next(args);
        });

        // ── Hook: ActivityRun（优先级 -100，先于记录 hook 拦截）──
        // 原生动作界面点击我们的自定义动作时，BC 原生 ActivityRun 会按「当前菜单部位组」
        // 与「acted 是否为玩家」拼出 ChatSelf/ChatOther-<group>-<QiAct_xxx> 再发送，
        // 这与我们的字典注册组 / self-other 选择可能不一致（例如自我动作点到他人身上会变成
        // ChatOther = 无占位符的纯标签），导致接收端 MISSING TEXT 或「人物名称占位符」未被替换。
        // 这里拦截：本地副作用仍交给 BC（sendMessage=false），消息改走与插件 UI 完全一致的
        // makeActivityPacket，保证原生界面与插件界面行为一致、跨客户端可读。
        try {
            state.modApi.hookFunction('ActivityRun', -100, function(args, next) {
                try {
                    var _item = args[3] || {};
                    var _name = (_item.Activity && _item.Activity.Name) || '';
                    var _send = args[4];
                    if (_send !== false && typeof _name === 'string' && _name.indexOf(CA_PREFIX) === 0) {
                        var _ca = caFindByActivityName(_name);
                        if (_ca) {
                            var _acted = args[1];
                            try { args[4] = false; next(args); }
                            catch (e) { console.warn('[QiAct] 原生点击本地副作用失败:', e.message); }
                            var _packet = makeActivityPacket(_acted, _ca.group, _name, _item.Item || null);
                            if (_packet) {
                                var _prev = _acted ? _acted.FocusGroup : undefined;
                                var _fg = (typeof AssetGroup !== 'undefined' && Array.isArray(AssetGroup))
                                    ? AssetGroup.find(function(g) { return g && g.Name === _ca.group; }) : null;
                                try {
                                    if (_acted) _acted.FocusGroup = _fg || { Name: _ca.group };
                                    if (typeof ServerSend === 'function') ServerSend('ChatRoomChat', _packet);
                                } finally { if (_acted) _acted.FocusGroup = _prev; }
                            }
                            return; // 已自行发包，阻断 BC 默认 Activity 包
                        }
                    }
                } catch (e) { console.warn('[QiAct] 原生点击拦截异常，回退 BC 默认:', e.message); }
                return next(args);
            });
        } catch (e) {
            console.warn('[QiAct] ActivityRun 原生点击拦截 hook 失败:', e.message);
        }

        // ── Hook: ElementButton.CreateForActivity —— 为自定义动作按钮注入图标 ──
        // BC 的 Activity 对象无 Image/Icon 字段，原生按钮会尝试加载
        // ./Assets/Female3DCG/Activity/<QiAct_xxx>.png（该文件不存在 → 破图/无图）。
        // 这里把按钮主图覆盖为插件品牌图标（玫红方块 + 白色闪电 data URL），
        // 使自定义动作在原生动作界面也能显示辨识图标，且不会出现破图。
        try {
            state.modApi.hookFunction('ElementButton.CreateForActivity', 0, function(args, next) {
                var _ia = args[1] || {};
                var _n = (_ia.Activity && _ia.Activity.Name) || '';
                if (typeof _n === 'string' && _n.indexOf(CA_PREFIX) === 0) {
                    if (!args[4] || typeof args[4] !== 'object') args[4] = {};
                    args[4].image = XSACT_ACTIVITY_ICON;
                }
                return next(args);
            });
        } catch (e) {
            console.warn('[QiAct] ElementButton 图标 hook 失败:', e.message);
        }

        // 将定时器控制绑定到 enter/exit
        var _baseEnter = enterActionMode;
        enterActionMode = function() { _baseEnter(); startRefreshTimer(); };
        var _baseExit = exitActionMode;
        exitActionMode = function() { _baseExit(); stopRefreshTimer(); };
    }

    /** 更新浮动网格位置（跟随角色移动/人数变化） */
    function updateGridPositions() {
        refreshCanvasCache(); // 每帧刷新画布矩形缓存（一次即可）
        var layout = getCharLayout();
        // 如果人数变化，重建
        if (layout.length !== state.lastLayoutCount) {
            state.lastLayoutCount = layout.length;
            refreshBodyGrids();
            return;
        }
        var shifts = computeOverlapShifts(layout);
        layout.forEach(function(entry) {
            entry.overlapShift = shifts.get(entry.char.MemberNumber) || 0;
            var grid = state.bodyGrids.get(entry.char);
            if (grid) positionGrid(grid, entry);
        });
    }

    // ════════════════════════════════════════════════════════════════════════
    // 设置页面注册
    // ════════════════════════════════════════════════════════════════════════

    function registerSettings() {
        if (typeof PreferenceRegisterExtensionSetting === 'undefined') return;
        PreferenceRegisterExtensionSetting({
            Identifier: 'QiAct',
            ButtonText: '快速动作',
            Image: 'Icons/End.png',
            load: function() {},
            run: function() {
                // 兜底：绘制异常绝不能再冒泡杀掉 BC 主渲染循环（曾导致进入子页后整页卡死）。
                try {
                    var X0 = 1770; // 左边界
                    var Y0 = 135;   // 顶边界
                    var W = 420;    // 面板宽度

                    // ── 标题栏 ──
                    DrawText('QiAct 快速动作', X0 + 10, Y0 + 22, 'Black', 'Gray');
                    DrawText('v' + (window.__QiAct && window.__QiAct.version ? window.__QiAct.version : ''), X0 + W - 60, Y0 + 22, '#888888', 'Gray');

                    // 分隔线
                    DrawRect(X0, Y0 + 35, W, 1, '#555555');

                    // ── 动作统计 ──
                    DrawText('动作统计', X0 + 10, Y0 + 58, '#AAAAAA', 'Gray');
                    var acts = (window.__QiAct && window.__QiAct.getCustomActions) ? window.__QiAct.getCustomActions() : [];
                    var nNative = acts.filter(function(a) { return a.source === 'native'; }).length;
                    var nEcho = acts.filter(function(a) { return a.source === 'echo'; }).length;
                    var nXs = acts.filter(function(a) { return a.source === 'xiaosu'; }).length;
                    var statY = Y0 + 82;
                    DrawText('总计 ' + acts.length + '  |  自建 ' + nNative + '  |  Echo ' + nEcho + '  |  小酥 ' + nXs, X0 + 10, statY, '#CCCCCC', 'Gray');

                    // 分隔线
                    DrawRect(X0, Y0 + 105, W, 1, '#333333');

                    // ── 模式开关（只读展示，实际操作走聊天室面板）──
                    DrawText('当前状态', X0 + 10, Y0 + 125, '#AAAAAA', 'Gray');
                    var modeY = Y0 + 148;
                    var isSelf = !!(window.__Qiact && window.__QiAct.selfModeActive) || !!(window.__QiAct && window.__QiAct.selfModeActive);
                    var isFav = !!(window.__QiAct && window.__QiAct.favModeActive);
                    var isXsPack = (window.__QiAct && window.__QiAct.getXiaosuPack) ? window.__QiAct.getXiaosuPack() : false;
                    DrawText('自我模式: ' + (isSelf ? 'ON' : 'OFF') + '   收藏模式: ' + (isFav ? 'ON' : 'OFF') + '   小酥包: ' + (isXsPack ? 'ON' : 'OFF'), X0 + 10, modeY, '#BBBBBB', 'Gray');

                    // 分隔线
                    DrawRect(X0, Y0 + 172, W, 1, '#333333');

                    // ── 操作按钮区 ──
                    var btnY = Y0 + 190;
                    var isActive = !!(window.__QiAct && window.__QiAct.isActive);
                    // 注意 DrawButton 签名：X,Y,W,H,Text,Color,Image,Tooltip,Callback
                    DrawButton(X0 + 10, btnY, W - 20, 36,
                        isActive ? '已激活 — 点击退出动作模式' : '进入快速动作模式',
                        isActive ? '#FF5C7A' : '#White', '', '',
                        function() {
                            if (window.__QiAct) {
                                if (window.__QiAct.isActive) window.__QiAct.exit();
                                else window.__QiAct.enter();
                            }
                        }
                    );

                    // 返回按钮
                    DrawButton(X0 + W - 100, btnY + 50, 90, 90, '', '#White', 'Icons/Exit.png',
                        (typeof T !== 'undefined' && T.Back) ? T.Back : '返回',
                        PreferenceExit
                    );

                    // 底部提示
                    DrawText('主操作界面在聊天室中（左下角切换按钮）', X0 + 10, btnY + 70, '#666666', 'Gray');
                } catch (e) {
                    console.error('[QiAct] 扩展设置子页绘制异常（已隔离，不影响游戏）:', e && e.message);
                }
            },
            click: function() {},
            unload: function() {},
            exit: function() {}
        });
    }

    // ════════════════════════════════════════════════════════════════════════
    // 更新 / 公告检测（脚本内 5 分钟轮询，玩家端收得到，无需刷新页面）
    // ════════════════════════════════════════════════════════════════════════

