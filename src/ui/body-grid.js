    /* ===== 画布身体网格（霓虹线框） ===== */
    function getCharLayout() {
        var layout = [];
        try {
            if (typeof ChatRoomCharacter === 'undefined' || !Array.isArray(ChatRoomCharacter)) return layout;

            // 收集房间内真实成员 MemberNumber 集合（交叉校验，排除离场/NPC）
            var memberMNs = {};
            ChatRoomCharacter.forEach(function(c) {
                if (c && c.MemberNumber) memberMNs[c.MemberNumber] = true;
            });

            var now = Date.now();

            // ① 优先用 DrawCharacter 记录的真实绘制坐标（每帧刷新，含活动位移）
            var anchorMap = {};
            ChatRoomCharacter.forEach(function(c) {
                if (!c || c.MemberNumber == null) return;
                var a = state.charAnchor[c.MemberNumber];
                if (a && (now - a.t < 1000)) anchorMap[c.MemberNumber] = a;
            });

            // ② 退回：ChatRoomCharacterViewLoopCharacters 提供的坐标
            var loopMap = {};
            if (typeof ChatRoomCharacterViewLoopCharacters === 'function') {
                ChatRoomCharacterViewLoopCharacters(function(idx, cx, cy, space, zoom) {
                    var cc = (typeof ChatRoomCharacterDrawlist !== 'undefined' && ChatRoomCharacterDrawlist)
                        ? ChatRoomCharacterDrawlist[idx] : null;
                    if (cc && cc.MemberNumber != null) loopMap[cc.MemberNumber] = { x: cx, y: cy, zoom: zoom };
                    return '';
                });
            }

            // 身体线框使用固定槽位坐标（绝对位置），不跟随拥抱/位移动画的临时绘制位置。
            // 这样即使角色拥抱时绘制位置重叠，线框仍保持左右错开、高度不变。
            ChatRoomCharacter.forEach(function(c) {
                if (!c || c.MemberNumber == null || !memberMNs[c.MemberNumber]) return;
                var loop = loopMap[c.MemberNumber];
                var anchor = anchorMap[c.MemberNumber];
                if (!loop && !anchor) return;
                // 优先固定槽位坐标（loop），缺失才回退到真实绘制坐标（anchor）
                var useX = loop || anchor;
                var useY = loop || anchor;
                layout.push({ char: c, x: useX.x, y: useY.y, zoom: (loop ? loop.zoom : (anchor ? anchor.zoom : 1)), src: loop ? 'loop' : 'anchor' });
            });
        } catch (e) {
            console.warn('[QiAct] getCharLayout 失败:', e);
        }
        return layout;
    }

    // ════════════════════════════════════════════════════════════════════════
    // BC 画布坐标换算（借鉴 BC-HSC geometry.js 的精准做法）
    // ════════════════════════════════════════════════════════════════════════
    const BC_CANVAS_W = 2000;
    const BC_CANVAS_H = 1000;

    // 画布矩形缓存（getBoundingClientRect 较贵，按帧/resize 刷新）已并入 state

    function refreshCanvasCache() {
        try {
            var canvas = document.getElementById('MainCanvas') || document.querySelector('canvas');
            if (!canvas) { state.cachedRect = null; return; }
            state.cachedRect = canvas.getBoundingClientRect();
            state.cachedScaleX = state.cachedRect.width / BC_CANVAS_W;
            state.cachedScaleY = state.cachedRect.height / BC_CANVAS_H;
        } catch (e) { /* ignore */ }
    }

    /** BC 画布坐标(2000x1000) → 屏幕像素坐标 */
    function bcToScreen(bcX, bcY) {
        if (!state.cachedRect) return { x: window.innerWidth * 0.25, y: window.innerHeight * 0.25, sx: state.cachedScaleX, sy: state.cachedScaleY };
        return {
            x: state.cachedRect.left + bcX * state.cachedScaleX,
            y: state.cachedRect.top + bcY * state.cachedScaleY,
            sx: state.cachedScaleX,
            sy: state.cachedScaleY
        };
    }

    /**
     * 角色 asset 坐标(ax, ay) → BC 画布坐标。
     * asset 空间：宽 500、高 1000，角色居中于 x=250。
     * 优先用 BC 原生 CharacterAppearanceXOffset/YOffset（含身高/姿势 OverrideHeight 等），
     * 任何身高/姿势（跪/趴/抱）都正确，绝不与原生脱节。
     */
    function bodyAssetToBc(ax, ay, C, dp) {
        var ratio = (C && typeof C.HeightRatio === 'number') ? C.HeightRatio : 1;
        var prop  = (C && typeof C.HeightRatioProportion === 'number') ? C.HeightRatioProportion : 1;
        var hMod  = (C && typeof C.HeightModifier === 'number') ? C.HeightModifier : 0;
        var xOff, yOff;
        if (typeof CharacterAppearanceXOffset === 'function') {
            try { xOff = CharacterAppearanceXOffset(C, ratio); } catch (_) { xOff = 500 * (1 - ratio) / 2; }
        } else { xOff = 500 * (1 - ratio) / 2; }
        if (typeof CharacterAppearanceYOffset === 'function') {
            try { yOff = CharacterAppearanceYOffset(C, ratio); } catch (_) { yOff = 1000 * (1 - ratio) * prop - hMod * ratio; }
        } else { yOff = 1000 * (1 - ratio) * prop - hMod * ratio; }
        var z = dp.zoom;
        return {
            x: dp.x + z * (xOff + ax * ratio),
            y: dp.y + z * (yOff + ay * ratio)
        };
    }

    /** 创建角色的身体部位线框网格（覆盖在角色身上） */
    /** 创建角色的身体部位线框（覆盖在角色身上，按 BC 原生 Zone 画热区） */
    function createBodyGrid(entry) {
        var charObj = entry.char;
        if (state.bodyGrids.has(charObj)) return state.bodyGrids.get(charObj);

        var grid = document.createElement('div');
        grid.className = 'xsact-body-grid' + (charObj.IsPlayer && charObj.IsPlayer() ? ' self' : '');
        grid.dataset.mn = charObj.MemberNumber;

        // 每个部位 + 每个 Zone 生成一个绝对定位热区（百分比摆放，分辨率无关）
        grid.innerHTML = buildBodyGridMarkup(charObj);
        Array.prototype.forEach.call(grid.querySelectorAll('.xsact-part-btn'), function(btn) {
            // The geometry is shared, but the target identity belongs to this cloned grid.
            btn.dataset.targetMn = charObj.MemberNumber;
            if (state.selectedTarget && state.selectedTarget.MemberNumber === charObj.MemberNumber) {
                btn.classList.toggle('active', isSamePartFamily(state.selectedPart, btn.dataset.group));
            }
        });

        // 点击网格空白区域也提升层级
        grid.addEventListener('click', function(e) {
            var btn = e.target && e.target.closest ? e.target.closest('.xsact-part-btn') : null;
            if (btn && grid.contains(btn)) {
                e.stopPropagation();
                selectTargetAndPart(charObj, btn.dataset.group);
                bringGridToFront(grid);
            } else if (e.target === grid) bringGridToFront(grid);
        });

        document.body.appendChild(grid);
        state.bodyGrids.set(charObj, grid);

        positionGrid(grid, entry);
        return grid;
    }

    /**
     * 根据角色布局定位线框容器。
     * 水平方向仍按角色实际宽度缩放；
     * 垂直方向固定高度，顶部锚定在角色「槽位顶部」(entry.y)，不随蹲姿/身高下移，
     * 避免人多了上下两排时，上排蹲下压到下排。
     */
    /**
     * 计算角色身体线框在屏幕上的矩形位置（供线框和名字浮层共用）
     */
    function getGridScreenRect(entry) {
        var C = entry.char;
        var dp = { x: entry.x, y: entry.y, zoom: entry.zoom };
        var sc = bcToScreen(0, 0); // 取画布→屏幕缩放因子

        // 水平：按实际角色宽度（xOff + ratio）计算，保持左右覆盖
        var left  = bodyAssetToBc(BODY_AX0, BODY_AY1, C, dp);
        var right = bodyAssetToBc(BODY_AX1, BODY_AY1, C, dp);
        var sL = bcToScreen(left.x, left.y);
        var sR = bcToScreen(right.x, right.y);
        var width = Math.abs(sR.x - sL.x);
        var centerX = (sL.x + sR.x) / 2;

        // 垂直：固定高度，顶部锚定在角色槽位顶部(entry.y)，忽略蹲姿导致的 yOff 下移
        var top = bcToScreen(entry.x, entry.y).y;
        var height = entry.zoom * GRID_FIXED_HEIGHT * sc.sy;

        return { left: centerX - width / 2, top: top, right: centerX + width / 2, bottom: top + height, width: width, height: height, centerX: centerX };
    }

    function positionGrid(grid, entry) {
        var rect = getGridScreenRect(entry);
        var shift = entry.overlapShift || 0;
        var signature = [rect.width, rect.height, rect.left + shift, rect.top].map(function(n) { return Math.round(n * 10) / 10; }).join('|');
        if (grid._xsactGeometrySignature === signature) return;
        grid._xsactGeometrySignature = signature;
        grid.style.width = rect.width + 'px';
        grid.style.height = rect.height + 'px';
        grid.style.left = (rect.left + shift) + 'px';
        grid.style.top = rect.top + 'px';
    }

    /** 取 BC 真实人物昵称（优先 Nickname，与游戏内 CharacterNickname 一致） */
    function characterDisplayName(charObj) {
        if (!charObj) return '???';
        if (typeof CharacterNickname === 'function') return CharacterNickname(charObj);
        return charObj.Nickname || charObj.Name || '???';
    }

    /** 将指定网格提升到最前（解决人物重叠时的选择问题） */
    function bringGridToFront(grid) {
        if (!grid) return;
        // Body hit-zones must always stay below the panel and character popover.
        grid.style.zIndex = '80001';
        state.bodyGrids.forEach(function(g) {
            if (g !== grid) g.style.zIndex = '80000';
        });
    }

    /** 更新所有角色的身体网格 */
    function bodyGridTopologySignature(layout) {
        return (layout || []).map(function(entry) { return String(entry.char.MemberNumber); }).sort().join('|');
    }

    function refreshBodyGrids(precomputedLayout) {
        clearBodyGrids();
        if (!state.interactionGridActive) { state.bodyGridTopology = ''; renderCharList(); return; }
        refreshCanvasCache();
        var layout = precomputedLayout || getCharLayout();
        state.bodyGridTopology = bodyGridTopologySignature(layout);
        var shifts = computeOverlapShifts(layout);
        state.gridOverlapShifts = shifts;
        layout.forEach(function(entry) {
            entry.overlapShift = shifts.get(entry.char.MemberNumber) || 0;
            createBodyGrid(entry);
        });
        renderCharList();
    }

    function findBodyGridByMemberNumber(memberNumber) {
        var found = null;
        state.bodyGrids.forEach(function(grid) {
            if (!found && String(grid.dataset.mn) === String(memberNumber)) found = grid;
        });
        return found;
    }

    function syncBodyGridForCharacter(charObj, x, y, zoom) {
        if (!charObj || charObj.MemberNumber == null || typeof x !== 'number' || typeof y !== 'number') return;
        var grid = state.bodyGrids.get(charObj) || findBodyGridByMemberNumber(charObj.MemberNumber);
        var entry = {
            char: charObj,
            x: x,
            y: y,
            zoom: typeof zoom === 'number' ? zoom : 1,
            overlapShift: state.gridOverlapShifts.get(charObj.MemberNumber) || 0
        };
        // On initial injection BC may not have populated CharacterViewLoop yet. Create the
        // grid from the first real overlay callback instead of waiting for another room event.
        if (!grid) {
            if (!state.cachedRect) refreshCanvasCache();
            grid = createBodyGrid(entry);
        } else {
            positionGrid(grid, entry);
        }
    }

    function scheduleBodyGridRefresh(force) {
        if (!state.isActive || state._gridRefreshScheduled) return;
        state._gridRefreshScheduled = true;
        var defer = runtime && runtime.timeout ? runtime.timeout : setTimeout;
        defer(function() {
            state._gridRefreshScheduled = false;
            if (!state.isActive || !state.interactionGridActive) return;
            var layout = getCharLayout();
            var topology = bodyGridTopologySignature(layout);
            if (force || topology !== state.bodyGridTopology) refreshBodyGrids(layout);
        }, 0);
    }

    /** 当两个角色拥抱/位置严重重叠时，给被遮挡的网格加一个水平偏移，避免线框完全糊在一起。
     *  规则：只处理真正大面积重叠（>50%），忽略正常并肩站位；最大偏移约一个角色宽度，
     *  确保拥抱者能完整错开；房间成员或页面布局变化时重算，玩家自己也参与避让。 */
    function computeOverlapShifts(layout) {
        var shifts = new Map();
        if (!layout || layout.length < 2) return shifts;

        var rects = layout.map(function(entry) {
            return { entry: entry, rect: getGridScreenRect(entry), mn: entry.char.MemberNumber };
        });
        rects.sort(function(a, b) { return a.rect.left - b.rect.left; });
        var screenW = window.innerWidth || 1920;
        var maxShiftBase = 70;      // 最小偏移幅度
        var overlapThreshold = 0.5; // 只有>50%面积重叠才推（拥抱级）
        var spacing = 16;           // 推开后留出的间距

        for (var i = 1; i < rects.length; i++) {
            var cur = rects[i];
            var curShift = 0;
            for (var j = 0; j < i; j++) {
                var prev = rects[j];
                var prevShift = shifts.get(prev.mn) || 0;
                if (rectsOverlap(prev.rect, cur.rect, overlapThreshold)) {
                    var desired = prev.rect.left + prevShift + prev.rect.width + spacing;
                    var need = desired - cur.rect.left;
                    if (need > curShift) curShift = need;
                }
            }
            if (curShift > 0) {
                // 关键修复：偏移幅度必须 ≥ 线框宽度 + 间距，才能把拥抱/重叠的两人“完整错开”。
                // 之前用 width*0.55（约 70px）小于线框实际宽度（约 72~80px），推完仍重叠；
                // v0.7.9 的 max(width*0.5, 80) 恰好够，这里改成 width+spacing 保证任何宽度都能彻底分离。
                var maxShift = cur.rect.width + spacing;
                curShift = Math.min(curShift, maxShift);
                // 限制在屏幕右边界内（仅在确实会越界时收紧，不因此残留重叠）
                var maxRight = screenW - 10;
                var desiredRight = cur.rect.left + curShift + cur.rect.width;
                if (desiredRight > maxRight) {
                    curShift = Math.max(0, maxRight - cur.rect.left - cur.rect.width);
                }
                if (curShift > 0) shifts.set(cur.mn, curShift);
            }
        }
        return shifts;
    }

    function rectsOverlap(a, b, threshold) {
        var xOverlap = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
        var yOverlap = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
        var aArea = a.width * a.height;
        var bArea = b.width * b.height;
        if (aArea <= 0 || bArea <= 0) return false;
        return (xOverlap * yOverlap) / Math.min(aArea, bArea) > threshold;
    }

    /** 清除所有浮动网格与名字浮层 */
    function clearBodyGrids() {
        state.bodyGrids.forEach(function(grid) {
            if (grid && grid.parentNode) grid.parentNode.removeChild(grid);
        });
        state.bodyGrids.clear();
        state.bodyGridTopology = '';
    }

    /** 选中目标和部位 */
