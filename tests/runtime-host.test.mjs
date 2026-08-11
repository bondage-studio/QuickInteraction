import assert from 'node:assert/strict';
import test from 'node:test';

import { createRuntimeHost, disposePreviousRuntime } from '../src/app/runtime-host.js';

test('runtime host disposes listeners and timers exactly once', async () => {
    const originalWindow = globalThis.window;
    const listeners = new Map();
    let removed = 0;
    globalThis.window = {
        setInterval,
        clearInterval,
        setTimeout,
        clearTimeout,
    };
    const target = {
        addEventListener(type, listener) { listeners.set(type, listener); },
        removeEventListener(type, listener) {
            if (listeners.get(type) === listener) {
                listeners.delete(type);
                removed += 1;
            }
        },
    };

    try {
        const host = createRuntimeHost('test');
        let ticks = 0;
        host.listen(target, 'change', () => {});
        host.interval(() => { ticks += 1; }, 5);
        await new Promise((resolve) => setTimeout(resolve, 18));
        assert.ok(ticks > 0);

        host.dispose();
        host.dispose();
        const stoppedAt = ticks;
        await new Promise((resolve) => setTimeout(resolve, 15));
        assert.equal(ticks, stoppedAt);
        assert.equal(removed, 1);
        assert.equal(host.disposed, true);
    } finally {
        globalThis.window = originalWindow;
    }
});

test('new injection disposes the previous public API and host', () => {
    const originalWindow = globalThis.window;
    let apiDisposed = 0;
    let hostDisposed = 0;
    globalThis.window = {
        __QiAct: { dispose() { apiDisposed += 1; } },
        __QiActRuntimeHost: { dispose() { hostDisposed += 1; } },
    };
    try {
        disposePreviousRuntime();
        assert.equal(apiDisposed, 1);
        assert.equal(hostDisposed, 1);
    } finally {
        globalThis.window = originalWindow;
    }
});
