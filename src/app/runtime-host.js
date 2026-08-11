/**
 * QuickInteraction 的熱重載資源管理器。
 *
 * 功能模組可以把長駐 listener / timer / DOM 清理工作登記在此；重新注入時，
 * 新入口會先 dispose 舊 host，再啟動新實例。這個 host 刻意掛在 window 上，
 * 即使沙盒移除了舊 IIFE 內的 QiActT 等詞法變數，仍可先停止所有回呼。
 */
export function createRuntimeHost(name = 'QuickInteraction') {
    let disposed = false;
    const cleanups = [];

    function addCleanup(cleanup) {
        if (typeof cleanup !== 'function') return cleanup;
        if (disposed) {
            try { cleanup(); } catch (error) { console.warn(`[${name}] late cleanup failed:`, error); }
            return cleanup;
        }
        cleanups.push(cleanup);
        return cleanup;
    }

    function listen(target, type, listener, options) {
        if (!target || typeof target.addEventListener !== 'function') return listener;
        target.addEventListener(type, listener, options);
        addCleanup(() => target.removeEventListener(type, listener, options));
        return listener;
    }

    function interval(callback, delay) {
        const id = window.setInterval(() => {
            if (!disposed) callback();
        }, delay);
        addCleanup(() => window.clearInterval(id));
        return id;
    }

    function timeout(callback, delay) {
        const id = window.setTimeout(() => {
            if (!disposed) callback();
        }, delay);
        addCleanup(() => window.clearTimeout(id));
        return id;
    }

    function dispose() {
        if (disposed) return;
        disposed = true;
        for (let i = cleanups.length - 1; i >= 0; i -= 1) {
            try { cleanups[i](); } catch (error) { console.warn(`[${name}] cleanup failed:`, error); }
        }
        cleanups.length = 0;
    }

    return Object.freeze({
        addCleanup,
        listen,
        interval,
        timeout,
        dispose,
        get disposed() { return disposed; },
    });
}

export function disposePreviousRuntime() {
    const previousApi = window.__QiAct;
    if (previousApi && typeof previousApi.dispose === 'function') {
        try { previousApi.dispose(); } catch (error) { console.warn('[QiAct] previous dispose failed:', error); }
    }

    const previousHost = window.__QiActRuntimeHost;
    if (previousHost && typeof previousHost.dispose === 'function') {
        try { previousHost.dispose(); } catch (error) { console.warn('[QiAct] previous host dispose failed:', error); }
    }
}
