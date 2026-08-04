    /* ===== 14.5 更新与公告 ===== */
    const VERSION_INFO_URL = 'https://bondage-studio.github.io/QuickInteraction/version.json';

    function compareVersion(a, b) {
        var pa = String(a || '').split('.').map(function(x) { return parseInt(x, 10) || 0; });
        var pb = String(b || '').split('.').map(function(x) { return parseInt(x, 10) || 0; });
        var len = Math.max(pa.length, pb.length);
        for (var i = 0; i < len; i++) {
            var va = pa[i] || 0, vb = pb[i] || 0;
            if (va > vb) return 1;
            if (va < vb) return -1;
        }
        return 0;
    }

    function getUpdateBannerEl() {
        return document.getElementById('xsact-update-banner');
    }

    function hideUpdateBanner() {
        var el = getUpdateBannerEl();
        if (el) { el.style.display = 'none'; el.innerHTML = ''; el.className = 'xsact-update-banner'; }
        state.pendingBanner = null;
    }

    function renderPendingBanner() {
        if (!state.pendingBanner) return;
        if (state.pendingBanner.type === 'update') showUpdateBanner(state.pendingBanner.data, true);
        else showAnnounceBanner(state.pendingBanner.data, true);
    }

    function showUpdateBanner(info, isRestore) {
        var el = getUpdateBannerEl();
        if (!el) { state.pendingBanner = { type: 'update', data: info }; return; }
        var summary = (info.summary && info.summary.length) ? info.summary : [];
        var items = summary.slice(0, 4).map(function(s) { return '<li>' + escapeHtml(s) + '</li>'; }).join('');
        el.className = 'xsact-update-banner' + (info.severity === 'important' ? ' is-important' : '');
        el.innerHTML = '' +
            '<div class="xsact-ub-head"><span class="xsact-ub-tag">更新可用</span>' +
            '<span class="xsact-ub-ver">v' + escapeHtml(info.version) + '</span>' +
            '<button class="xsact-ub-close" id="xsact-ub-close" title="稍后提醒" data-tooltip-type="danger">×</button></div>' +
            (items ? '<ul class="xsact-ub-sum">' + items + '</ul>' : '') +
            '<div class="xsact-ub-actions">' +
            (info.detailsUrl ? '<button class="xsact-ub-btn xsact-ub-primary" id="xsact-ub-details">查看详情</button>' : '') +
            '<button class="xsact-ub-btn" id="xsact-ub-later">稍后</button>' +
            '<button class="xsact-ub-btn" id="xsact-ub-ignore">不再提示此版本</button>' +
            '</div>';
        el.style.display = '';
        var close = el.querySelector('#xsact-ub-close');
        var later = el.querySelector('#xsact-ub-later');
        var ignore = el.querySelector('#xsact-ub-ignore');
        var details = el.querySelector('#xsact-ub-details');
        if (close) close.onclick = function() { hideUpdateBanner(); };
        if (later) later.onclick = function() { hideUpdateBanner(); persist(S_UPDATE_DISMISSED, info.version); };
        if (ignore) ignore.onclick = function() { hideUpdateBanner(); persist(S_UPDATE_DISMISSED, info.version); };
        if (details && info.detailsUrl) details.onclick = function() { window.open(info.detailsUrl, '_blank', 'noopener'); };
    }

    function showAnnounceBanner(ann, isRestore) {
        var el = getUpdateBannerEl();
        if (!el) { state.pendingBanner = { type: 'announce', data: ann }; return; }
        var sev = ann.severity || 'info';
        var tagText = '公告';
        var cls = 'xsact-update-banner';
        if (sev === 'important') { cls += ' is-important'; tagText = '重要'; }
        else if (sev === 'available') { cls += ' is-available'; tagText = '可用'; }
        else { cls += ' is-announce'; tagText = '公告'; }
        el.className = cls;
        el.innerHTML = '' +
            '<div class="xsact-ub-head"><span class="xsact-ub-tag">' + escapeHtml(tagText) + '</span>' +
            (ann.title ? '<span class="xsact-ub-title">' + escapeHtml(ann.title) + '</span>' : '') +
            '<button class="xsact-ub-close" id="xsact-ub-close" title="知道了" data-tooltip-type="danger">×</button></div>' +
            (ann.message ? '<div class="xsact-ub-msg">' + escapeHtml(ann.message) + '</div>' : '') +
            (ann.detailsUrl ? '<div class="xsact-ub-actions"><button class="xsact-ub-btn xsact-ub-primary" id="xsact-ub-details">查看详情</button></div>' : '');
        el.style.display = '';
        var close = el.querySelector('#xsact-ub-close');
        var details = el.querySelector('#xsact-ub-details');
        if (close) close.onclick = function() { hideUpdateBanner(); };
        if (details && ann.detailsUrl) details.onclick = function() { window.open(ann.detailsUrl, '_blank', 'noopener'); };
    }

    async function checkUpdate() {
        try {
            var res = await fetch(VERSION_INFO_URL + '?t=' + Date.now(), { cache: 'no-store' });
            if (!res.ok) return;
            var info = await res.json();
            // 1) 版本更新横幅
            if (compareVersion(info.version, VERSION) > 0) {
                var dismissed = loadSetting(S_UPDATE_DISMISSED, '');
                if (dismissed !== info.version) showUpdateBanner(info);
            }
            // 2) 主动公告（独立于版本，即使版本没变也能推）
            if (info.announcement && info.announcement.id) {
                var seen = loadSetting(S_LAST_ANNOUNCE, '');
                var seenVer = loadSetting(S_LAST_ANNOUNCE_VER, '');
                var hasNewVersion = compareVersion(info.version, VERSION) > 0;
                // 首次未见 或 发布了新版本（与上次见到公告时的版本不同）→ 重新提示。
                // 这样蓝色公告像红色版本更新一样，每次发版都会弹出，避免「看过一次就再也弹不出」的错觉。
                if (info.announcement.id !== seen || (hasNewVersion && seenVer !== info.version)) {
                    showAnnounceBanner(info.announcement);
                    persist(S_LAST_ANNOUNCE, info.announcement.id);
                    persist(S_LAST_ANNOUNCE_VER, info.version);
                }
            }
        } catch (e) {
            // 区分真实网络错误与脚本内部错误：脚本 bug（如未定义常量）不应伪装成「网络失败」误导排查
            console.warn('[QiAct] 更新检查未成功（跳过本次轮询，不影响游戏）:', e && e.message);
        }
    }

    function startUpdateChecker() {
        if (state.updateTimer) return;
        // 加载后 30 秒先查一次，之后每 5 分钟轮询
        setTimeout(function() { checkUpdate().catch(function(e) { console.warn('[QiAct] 更新检查失败（已忽略）:', e && e.message); }); }, 30000);
        state.updateTimer = setInterval(function() { checkUpdate().catch(function(e) { console.warn('[QiAct] 更新检查失败（已忽略）:', e && e.message); }); }, 5 * 60 * 1000);
    }

    // ════════════════════════════════════════════════════════════════════════
    // 初始化入口
    // ════════════════════════════════════════════════════════════════════════

