import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

const root = new URL('..', import.meta.url).pathname;
const source = fs.readFileSync(new URL('../src/services/update-service.js', import.meta.url), 'utf8');

function fixture(opts = {}) {
    const store = Object.assign({
        S_LAST_ANNOUNCE: '', S_LAST_ANNOUNCE_VER: '', S_UPDATE_DISMISSED: '', S_LAST_SEEN_VERSION: '1.5.0',
    }, opts.store || {});
    const calls = { toasts: [] };
    const ctx = vm.createContext({
        VERSION: opts.version || '1.5.1',
        document: { getElementById: () => null }, // 横幅元素不存在 → 走 state.pendingBanner 分支
        escapeHtml: (s) => String(s),
        S_LAST_ANNOUNCE: 'S_LAST_ANNOUNCE',
        S_LAST_ANNOUNCE_VER: 'S_LAST_ANNOUNCE_VER',
        S_LAST_SEEN_VERSION: 'S_LAST_SEEN_VERSION',
        S_UPDATE_DISMISSED: 'S_UPDATE_DISMISSED',
        S_UPDATE_ERROR_LOG: 'S_UPDATE_ERROR_LOG',
        loadSetting: (k, d) => (k in store ? store[k] : d),
        persist(k, v) { store[k] = v; },
        toast(msg) { calls.toasts.push(msg); },
        QiActT: (k, v) => (v && v.VERSION ? '已更新到 v' + v.VERSION : k),
        state: {},
        runtime: null,
        window: {},
        fetch: () => Promise.reject(new Error('no net')),
        console,
        setTimeout, clearTimeout, setInterval, clearInterval,
    });
    vm.runInContext(source, ctx);
    return { ctx, store, calls };
}

test('静默版本：handleVersionInfo 不弹版本横幅、不弹公告横幅', () => {
    const f = fixture();
    f.ctx.handleVersionInfo({
        version: '1.5.1', silent: true,
        announcement: { id: '2026-11-25-touch-scroll-fix', title: '旧公告' },
        summary: ['修复滚动'],
    });
    assert.equal(f.ctx.state.pendingBanner, undefined, '不设任何待显示横幅（完全静默）');
    assert.equal(f.store.S_LAST_ANNOUNCE, '2026-11-25-touch-scroll-fix', '仍标记公告已读');
    assert.equal(f.store.S_LAST_ANNOUNCE_VER, '1.5.1', '仍记录版本，避免后续重弹');
});

test('非静默新版本：公告横幅照常弹出（保证未来发版不受影响）', () => {
    const f = fixture();
    f.ctx.handleVersionInfo({
        version: '1.6.0',
        announcement: { id: 'next-announce', title: '新公告' },
    });
    assert.equal(f.ctx.state.pendingBanner && f.ctx.state.pendingBanner.type, 'announce', '非静默版本公告正常进待显示队列');
});
