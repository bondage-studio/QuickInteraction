import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

const source = fs.readFileSync(new URL('../src/core/application-context.js', import.meta.url), 'utf8');
const storage = fs.readFileSync(new URL('../src/core/settings-migration.js', import.meta.url), 'utf8')
    + source.slice(source.indexOf('    function getServerStore()'), source.indexOf('    function saveToServer('));
function setup(player, updater) {
    const calls = [];
    const context = vm.createContext({ Player: player, MOD_NS: 'QiAct', warnServerSync() {},
        ServerAccountUpdate: updater === undefined ? { QueueData(data, immediate) { calls.push({ data: structuredClone(data), immediate }); } } : updater });
    vm.runInContext(storage, context);
    return { context, calls, read: () => context.getServerStore() };
}

test('migrates legacy settings, preserves current values and other namespaces, and cleans once', () => {
    const player = { OnlineSettings: { unrelated: true, ExtensionSettings: { QiAct: { theme: 'dark', favorites: ['a'] }, Other: { enabled: true } } }, ExtensionSettings: { QiAct: { theme: 'light' }, Existing: {} } };
    const { read, calls } = setup(player);
    const result = read();
    assert.equal(result.theme, 'light');
    assert.deepEqual(result.favorites, ['a']);
    assert.equal(player.ExtensionSettings.Other.enabled, true);
    assert.ok(player.ExtensionSettings.Existing);
    assert.deepEqual(player.OnlineSettings, { unrelated: true });
    assert.deepEqual(calls, [
        { data: { ExtensionSettings: structuredClone(player.ExtensionSettings) }, immediate: undefined },
        { data: { OnlineSettings: { unrelated: true } }, immediate: true },
    ]);
    read();
    assert.equal(calls.length, 2);
});

test('leaves legacy container alone when QiAct is absent', () => {
    const player = { OnlineSettings: { ExtensionSettings: { Other: {} } } };
    const { read, calls } = setup(player);
    read();
    assert.ok(player.OnlineSettings.ExtensionSettings.Other);
    assert.equal(calls.length, 0);
    assert.equal(setup(null).read(), null);
});

test('retains legacy data until updater is available and retries failed cleanup', () => {
    const player = { OnlineSettings: { ExtensionSettings: { QiAct: { theme: 'dark' } } } };
    const { context, read } = setup(player, null);
    read();
    assert.ok(player.OnlineSettings.ExtensionSettings);
    context.ServerAccountUpdate = { QueueData(data, immediate) { if (immediate) throw new Error('offline'); } };
    read();
    assert.ok(player.OnlineSettings.ExtensionSettings);
    context.ServerAccountUpdate = { QueueData() {} };
    assert.equal(read().theme, 'dark');
    assert.equal(player.OnlineSettings.ExtensionSettings, undefined);
});
