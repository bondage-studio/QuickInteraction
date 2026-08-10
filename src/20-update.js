    /* ===== 14.5 更新与公告 ===== */
    const VERSION_INFO_URL = 'https://bondage-studio.github.io/QuickInteraction/version.json';
    // 备用源：主源（GitHub Pages）偶发不可达时回退到 GitHub Raw，互为冗余提升检测成功率
    const VERSION_INFO_FALLBACK = 'https://raw.githubusercontent.com/bondage-studio/QuickInteraction/main/version.json';

    // 更新检测参数（集中管理，方便调参）
    const UPDATE_INTERVAL = 5 * 60 * 1000; // 5 分钟轮询
    const UPDATE_FIRST_DELAY = 30000;      // 加载后 30 秒首查
    const UPDATE_MAX_RETRY = 3;            // 单次轮询内最大重试次数
    const UPDATE_FETCH_TIMEOUT = 8000;     // 单次请求超时（毫秒），避免挂起阻塞检测周期

    function compareVersion(a, b) {
        var pa = String(a || '').split('.').map(function (x) { return parseInt(x, 10) || 0; });
        var pb = String(b || '').split('.').map(function (x) { return parseInt(x, 10) || 0; });
        var len = Math.max(pa.length, pb.length);
        for (var i = 0; i < len; i++) {
            var va = pa[i] || 0, vb = pb[i] || 0;
            if (va > vb) return 1;
            if (va < vb) return -1;
        }
        return 0;
    }

    // ── 错误日志（控制台 + 持久化）──
    function logUpdateError(entry) {
        var where = entry.kind === 'http'
            ? ('HTTP ' + entry.status)
            : (entry.kind === 'parse' ? QiActT('update.parse_err') : QiActT('update.net_err'));
        console.error('[QiAct] 更新检查失败（第 ' + entry.attempt + ' 次）[' + where + '] ' + (entry.message || '') + (entry.url ? ' @ ' + entry.url : ''));
        try {
            var log = [];
            try { log = JSON.parse(loadSetting(S_UPDATE_ERROR_LOG, '[]')) || []; } catch (_) { log = []; }
            if (!Array.isArray(log)) log = [];
            log.push({
                ts: Date.now(),
                attempt: entry.attempt,
                kind: entry.kind,
                status: entry.status || null,
                url: entry.url || null,
                message: String(entry.message || '').slice(0, 200)
            });
            if (log.length > 10) log = log.slice(-10);
            persist(S_UPDATE_ERROR_LOG, JSON.stringify(log));
        } catch (_) { /* 存储失败不影响检测主流程 */ }
    }
    function clearUpdateErrorLog() {
        try { persist(S_UPDATE_ERROR_LOG, '[]'); } catch (_) {}
    }
    function getUpdateErrorLog() {
        try { var l = JSON.parse(loadSetting(S_UPDATE_ERROR_LOG, '[]')); return Array.isArray(l) ? l : []; } catch (_) { return []; }
    }

    // 单次带超时的请求，返回解析后的 info；失败抛带 kind/status 的错误对象
    async function fetchVersionJson(url, attempt) {
        var ctrl = ('AbortController' in window) ? new AbortController() : null;
        var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, UPDATE_FETCH_TIMEOUT) : null;
        try {
            var sep = url.indexOf('?') >= 0 ? '&' : '?';
            var res = await fetch(url + sep + 't=' + Date.now(), ctrl ? { cache: 'no-store', signal: ctrl.signal } : { cache: 'no-store' });
            if (!res.ok) {
                var he = new Error('HTTP ' + res.status);
                he.kind = 'http'; he.status = res.status; he.url = url; he.attempt = attempt;
                throw he;
            }
            var text = await res.text();
            try {
                return JSON.parse(text);
            } catch (pe) {
                var pe2 = new Error(QiActT('update.json_parse_err', { msg: pe.message }));
                pe2.kind = 'parse'; pe2.status = res.status; pe2.url = url; pe2.attempt = attempt;
                throw pe2;
            }
        } finally {
            if (timer) clearTimeout(timer);
        }
    }

    // 主源 → 备用源 逐源尝试；任一成功即返回；全失败抛最后一个错误（每源失败均已记录日志）
    async function fetchWithFallback(attempt) {
        var sources = [VERSION_INFO_URL, VERSION_INFO_FALLBACK];
        var lastErr = null;
        for (var i = 0; i < sources.length; i++) {
            try {
                return await fetchVersionJson(sources[i], attempt);
            } catch (e) {
                lastErr = e;
                logUpdateError({ kind: e.kind || 'network', status: e.status, url: e.url || sources[i], message: e.message, attempt: attempt });
            }
        }
        throw lastErr;
    }

    // 单次完整轮询：含重试 + 退避，成功返回 true，彻底失败返回 false（错误日志已落盘）
    async function checkUpdate() {
        for (var attempt = 1; attempt <= UPDATE_MAX_RETRY; attempt++) {
            try {
                var info = await fetchWithFallback(attempt);
                clearUpdateErrorLog(); // 恢复：清掉历史错误日志
                handleVersionInfo(info);
                return true;
            } catch (e) {
                // 各源失败已由 fetchWithFallback 逐条记录；此处仅做退避与最终汇总，避免重复写日志
                if (attempt < UPDATE_MAX_RETRY) {
                    await new Promise(function (r) { setTimeout(r, 1000 * attempt); }); // 退避 1s, 2s
                    continue;
                }
                console.warn('[QiAct] 更新检查连续 ' + UPDATE_MAX_RETRY + ' 次失败，错误已记录；下个周期（' + Math.round(UPDATE_INTERVAL / 60000) + ' 分钟）将自动重试');
                return false;
            }
        }
        return false;
    }

    function handleVersionInfo(info) {
        if (!info || !info.version) return;
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
    }

    // 更新成功通知：加载时若本机版本与「上次记录版本」不同，升级则提示「已更新到 vX」并展示摘要
    function notifyIfUpdated() {
        var last = loadSetting(S_LAST_SEEN_VERSION, '');
        if (!last) { persist(S_LAST_SEEN_VERSION, VERSION); return; } // 首次运行不提示
        if (compareVersion(VERSION, last) !== 0) {
            if (compareVersion(VERSION, last) > 0) {
                try { toast('QiAct ' + QiActT('update.title', { VERSION: VERSION }), '#46E0A0'); } catch (_) {}
                // 轻量拉取本次更新摘要，用公告横幅补充展示（失败不影响已显示的 toast）
                fetchVersionJson(VERSION_INFO_URL, 0).then(function (info) {
                    if (info && Array.isArray(info.summary) && info.summary.length) {
                        showAnnounceBanner({ id: 'updated-' + VERSION, title: QiActT('update.title', { VERSION: VERSION }), severity: 'available', message: info.summary.join('\n'), detailsUrl: info.detailsUrl });
                    }
                }).catch(function () {});
            }
            persist(S_LAST_SEEN_VERSION, VERSION); // 降级也静默记录，保证后续升级能正确提示
        }
    }

    function startUpdateChecker() {
        if (state.updateTimer) return; // 防重复启动（热重载/多次 init）
        state.updateTimer = setInterval(function () {
            checkUpdate().catch(function (e) { console.warn('[QiAct] 更新检查失败（已忽略）:', e && e.message); });
        }, UPDATE_INTERVAL);
        // 加载后首查（首查延后，避免与初始化抢资源）
        setTimeout(function () {
            checkUpdate().catch(function (e) { console.warn('[QiAct] 更新检查失败（已忽略）:', e && e.message); });
        }, UPDATE_FIRST_DELAY);
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
        var items = summary.slice(0, 4).map(function (s) { return '<li>' + escapeHtml(s) + '</li>'; }).join('');
        el.className = 'xsact-update-banner' + (info.severity === 'important' ? ' is-important' : '');
        el.innerHTML = '' +
            '<div class="xsact-ub-head"><span class="xsact-ub-tag">' + QiActT('update.available_tag') + '</span>' +
            '<span class="xsact-ub-ver">v' + escapeHtml(info.version) + '</span>' +
            '<button class="xsact-ub-close" id="xsact-ub-close" title="' + QiActT('update.later_title') + '" data-tooltip-type="danger">×</button></div>' +
            (items ? '<ul class="xsact-ub-sum">' + items + '</ul>' : '') +
            '<div class="xsact-ub-actions">' +
            (info.detailsUrl ? '<button class="xsact-ub-btn xsact-ub-primary" id="xsact-ub-details">' + QiActT('update.details') + '</button>' : '') +
            '<button class="xsact-ub-btn" id="xsact-ub-later">' + QiActT('update.later') + '</button>' +
            '<button class="xsact-ub-btn" id="xsact-ub-ignore">' + QiActT('update.ignore') + '</button>' +
            '</div>';
        el.style.display = '';
        var close = el.querySelector('#xsact-ub-close');
        var later = el.querySelector('#xsact-ub-later');
        var ignore = el.querySelector('#xsact-ub-ignore');
        var details = el.querySelector('#xsact-ub-details');
        if (close) close.onclick = function () { hideUpdateBanner(); };
        if (later) later.onclick = function () { hideUpdateBanner(); persist(S_UPDATE_DISMISSED, info.version); };
        if (ignore) ignore.onclick = function () { hideUpdateBanner(); persist(S_UPDATE_DISMISSED, info.version); };
        if (details && info.detailsUrl) details.onclick = function () { window.open(info.detailsUrl, '_blank', 'noopener'); };
    }

    function showAnnounceBanner(ann, isRestore) {
        var el = getUpdateBannerEl();
        if (!el) { state.pendingBanner = { type: 'announce', data: ann }; return; }
        var sev = ann.severity || 'info';
        var tagText = QiActT('update.announce_tag');
        var cls = 'xsact-update-banner';
        if (sev === 'important') { cls += ' is-important'; tagText = QiActT('update.important_tag'); }
        else if (sev === 'available') { cls += ' is-available'; tagText = QiActT('update.available_tag'); }
        else { cls += ' is-announce'; tagText = QiActT('update.announce_tag'); }
        el.className = cls;
        el.innerHTML = '' +
            '<div class="xsact-ub-head"><span class="xsact-ub-tag">' + escapeHtml(tagText) + '</span>' +
            (ann.title ? '<span class="xsact-ub-title">' + escapeHtml(ann.title) + '</span>' : '') +
            '<button class="xsact-ub-close" id="xsact-ub-close" title="' + QiActT('update.know') + '" data-tooltip-type="danger">×</button></div>' +
            (ann.message ? '<div class="xsact-ub-msg">' + escapeHtml(ann.message) + '</div>' : '') +
            (ann.detailsUrl ? '<div class="xsact-ub-actions"><button class="xsact-ub-btn xsact-ub-primary" id="xsact-ub-details">' + QiActT('update.details') + '</button>' + '</div>' : '');
        el.style.display = '';
        var close = el.querySelector('#xsact-ub-close');
        var details = el.querySelector('#xsact-ub-details');
        if (close) close.onclick = function () { hideUpdateBanner(); };
        if (details && ann.detailsUrl) details.onclick = function () { window.open(ann.detailsUrl, '_blank', 'noopener'); };
    }

    // ════════════════════════════════════════════════════════════════════════
    // 初始化入口
    // ════════════════════════════════════════════════════════════════════════
