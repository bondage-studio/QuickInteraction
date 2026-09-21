import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
const source = ['settings-storage.js', 'settings-migration.js'].map(file => fs.readFileSync(new URL('../src/core/' + file, import.meta.url), 'utf8')).join('\n');
function setup(player, local = {}) {
    const calls = [], warnings = [];
    const entries = new Map(Object.entries(local));
    const context = vm.createContext({ Player: player, MOD_NS: 'QiAct', S_CUSTOM: 'xsact_qa_custom_actions', console, TextEncoder,
        warnServerSync(e) { warnings.push(e); },
        localStorage: { get length() { return entries.size; }, key(i) { return [...entries.keys()][i]; }, getItem(k) { return entries.get(k) ?? null; }, setItem(k,v) { entries.set(k,v); } },
        LZString: { decompressFromBase64(raw) { assert.equal(raw, 'packed'); return JSON.stringify({ xsact_qa_theme: 'dark' }); } },
        ServerSend(event, data) { calls.push({ event, data: structuredClone(data) }); }
    });
    vm.runInContext(source, context);
    return { context, calls, warnings, read: () => context.getServerStore() };
}
test('migrates only QiAct, preserves nested settings and empty buckets, cleans legacy once', () => {
    const player = { OnlineSettings: { ExtensionSettings: { QiAct: { xsact_qa_theme: 'dark', old: true }, Other: { enabled: true } } }, ExtensionSettings: { QiAct: { QiSettings: { xsact_qa_theme: 'light' }, QiAction: { act_echo: [] }, xsact_qa_custom_actions: [{ id: 'e', source: 'echo' }, { id: 'q' }] }, Existing: {} } };
    const { read, calls } = setup(player);
    const result = read();
    assert.equal(result.QiSettings.xsact_qa_theme, 'light');
    assert.equal(result.QiSettings.old, true);
    assert.equal(result.QiAction.act_echo.length, 0);
    assert.equal(result.QiAction.act_qi[0].id, 'q');
    assert.ok(player.OnlineSettings.ExtensionSettings.Other);
    assert.equal(player.OnlineSettings.ExtensionSettings.QiAct, undefined);
    assert.ok(player.ExtensionSettings.Existing);
    const count = calls.length;
    read(); assert.equal(calls.length, count);
});
test('compressed legacy and local fallback are migrated without overriding the account', () => {
    const { read } = setup({ ExtensionSettings: { QiAct: 'packed' } }, { xsact_qa_theme: '"light"', QiActLang: 'TW', xsact_qa_last_action: '{"name":"a"}', xsact_qa_custom_actions: '[{"id":"x","source":"xiaosu"}]' });
    const root = read();
    assert.equal(root.QiSettings.xsact_qa_theme, 'dark');
    assert.equal(root.QiSettings.QiActLang, 'TW');
    assert.equal(root.QiSettings.xsact_qa_last_action.name, 'a');
    assert.equal(root.QiAction.act_xs[0].id, 'x');
});
test('writes and reloads action buckets and settings, preserves other namespaces and arousal', () => {
    const player = { ExtensionSettings: { Other: { keep: true } }, ArousalSettings: { keep: true } };
    const { context } = setup(player);
    context.persist('xsact_qa_custom_actions', [{ id: 'q' }, { id: 'e', source: 'echo' }, { id: 'x', source: 'xiaosu' }]);
    context.persist('QiActLang', 'TW');
    assert.equal(player.ExtensionSettings.QiAct.QiSettings.QiActLang, 'TW');
    assert.equal(player.ExtensionSettings.QiAct.QiAction.act_echo[0].id, 'e');
    const next = setup(player).context;
    assert.equal(next.loadSetting('xsact_qa_custom_actions', []).length, 3);
    context.persist('xsact_qa_custom_actions', []);
    assert.equal(context.loadSetting('xsact_qa_custom_actions', []).length, 0);
    assert.deepEqual(player.ExtensionSettings.Other, { keep: true });
    assert.deepEqual(player.ArousalSettings, { keep: true });
});
test('sync failure retains legacy data and retries; unavailable player and invalid data are safe', () => {
    const player = { OnlineSettings: { ExtensionSettings: { QiAct: { theme: 'dark' } } } };
    const { context, read } = setup(player);
    context.ServerSend = null;
    assert.equal(read(), null);
    assert.ok(player.OnlineSettings.ExtensionSettings.QiAct);
    context.ServerSend = (event, data) => { if (data.OnlineSettings) throw Error('offline'); };
    read(); assert.ok(player.OnlineSettings.ExtensionSettings.QiAct);
    context.ServerSend = () => {};
    read(); assert.equal(player.OnlineSettings.ExtensionSettings.QiAct, undefined);
    assert.equal(setup(null).read(), null);
    const broken = { ExtensionSettings: { QiAct: 'broken' } };
    assert.equal(setup(broken).read(), null);
    assert.equal(broken.ExtensionSettings.QiAct, 'broken');
});

test('ECHO copy import uses exact namespace, separates buckets, and cleanup preserves other data', () => {
    const original = { sample: { Name: 'Wave_Echo', Target: 'ItemHands', Dialog: 'SourceCharacter waves' } };
    const player = { ExtensionSettings: { ECHOOther: { 动作数据: { unrelated: {} } }, 'ECHO动作拓展': { 动作数据: original, otherSetting: true } } };
    const { context, calls } = setup(player);
    for (const file of ['registry.js', 'import-export.js']) vm.runInContext(fs.readFileSync(new URL('../src/features/custom-actions/' + file, import.meta.url), 'utf8'), context);
    const suppressed = [];
    Object.assign(context, {
        state: { customActions: [], echoSuppressed: new Set() },
        caRegister() {}, caUnregister() {}, caFindEchoNamesInRegistry() { return new Set(['Wave_Echo']); },
        caResolveEchoPrerequisite() { return []; }, caSuppressEchoName(name) { suppressed.push(name); },
        caRemoveSuppressedEchoActivities() {}, rebuildEchoSuppressed() {},
        updateCustomActionPanel() {}, toast() {}, QiActT(key) { return key; }, setTimeout() {},
        S_ECHO_SUPPRESS: 'xsact_qa_echo_suppressed'
    });
    context.importCustomFromEcho();
    context.importCustomFromEcho();
    assert.equal(context.state.customActions.length, 1);
    assert.equal(player.ExtensionSettings.QiAct.QiAction.act_echo.length, 1);
    assert.equal(player.ExtensionSettings['ECHO动作拓展'].动作数据, original);
    assert.ok(suppressed.includes('Wave_Echo'));
    context.caCleanupEchoData();
    assert.equal(Object.keys(player.ExtensionSettings['ECHO动作拓展'].动作数据).length, 0);
    assert.equal(player.ExtensionSettings['ECHO动作拓展'].otherSetting, true);
    assert.ok(player.ExtensionSettings.ECHOOther.动作数据.unrelated);
    assert.equal(player.ExtensionSettings.QiAct.QiAction.act_echo.length, 1);
    assert.ok(calls.some(call => call.data['ExtensionSettings.ECHO动作拓展.动作数据']));
    player.ExtensionSettings['ECHO动作拓展'].动作数据 = original;
    context.syncExtensionField = () => { throw Error('offline'); };
    context.caCleanupEchoData();
    assert.equal(player.ExtensionSettings['ECHO动作拓展'].动作数据, original);
});

test('R132 transport sends isolated changed leaves and bypasses the account merge queue', () => {
    const player = { CharacterID: 'Online-1', ExtensionSettings: { Other: { retained: true } } };
    const { context, read } = setup(player);
    const sent = [];
    Object.assign(context, { CommonEntries: Object.entries, setTimeout() { return 1; }, clearTimeout() {}, ServerSocket: { emit(event, data) { sent.push({ event, data: structuredClone(data) }); } } });
    vm.runInContext(fs.readFileSync(new URL('./fixtures/r132-account-sync.js', import.meta.url), 'utf8'), context);
    read(); sent.length = 0;
    context.ServerAccountUpdate.QueueData({ OtherQueuedData: 'untouched' });
    context.persist('theme', 'light');
    context.syncExtensionField('ECHO动作拓展', '动作数据', {});
    assert.equal(sent.length, 2);
    assert.deepEqual(sent[0], { event: 'AccountUpdate', data: { 'ExtensionSettings.QiAct.QiSettings.theme': 'light' } });
    assert.deepEqual(sent[1].data, { 'ExtensionSettings.ECHO动作拓展.动作数据': {} });
    assert.equal(context.ServerAccountUpdate.Queue.size, 1);
    assert.deepEqual(player.ExtensionSettings.Other, { retained: true });
});

test('logged-out reads do not migrate or remove legacy settings; login retries', () => {
    const player = { CharacterID: '', OnlineSettings: { ExtensionSettings: { QiAct: { theme: 'dark' } } } };
    const { context, read, calls } = setup(player);
    assert.equal(read(), null);
    assert.equal(calls.length, 0);
    assert.ok(player.OnlineSettings.ExtensionSettings.QiAct);
    assert.throws(() => context.syncExtensionField('QiAct', 'QiSettings.theme', 'light'), /not logged in/);
    player.CharacterID = 'Online-1';
    assert.equal(read().QiSettings.theme, 'dark');
    assert.equal(player.OnlineSettings.ExtensionSettings.QiAct, undefined);
});

test('legacy action metadata migrates before partitioning, with nested bucket ownership preserved', () => {
    const player = { ExtensionSettings: { 'ECHO动作拓展': { 动作数据: { DisplayName: { Name: 'RawEcho' } } }, QiAct: { xsact_qa_custom_actions: [{ id: 'e', name: 'DisplayName' }, { id: 'x', xiaosuName: 'XS_old' }, { id: 'q' }], QiAction: { act_qi: [{ id: 'nested', source: 'echo', visible: false }] } } } };
    const { read } = setup(player);
    const actions = read().QiAction;
    assert.equal(actions.act_echo[0].id, 'e');
    assert.equal(actions.act_echo[0].visible, true);
    assert.equal(actions.act_xs[0].id, 'x');
    assert.equal(actions.act_qi[0].id, 'nested');
    assert.equal(actions.act_qi[0].source, 'native');
    assert.equal(actions.act_qi[0].visible, false);
});

test('centralized favorites migration expands legacy names, canonicalizes and deduplicates', () => {
    const { context } = setup({ ExtensionSettings: {} });
    Object.assign(context, {
        S_FAVS: 'xsact_qa_favorites', state: { favorites: ['Wave', 'OldHands|Wave', 'Unknown'] },
        BODY_PARTS: [{ group: 'ItemHands' }], ActivityAllowedForGroup() {},
        activitiesAllowedForGroup() { return [{ Activity: { Name: 'Wave' } }]; },
        canonicalPartGroup(group) { return group === 'OldHands' ? 'ItemHands' : group; }
    });
    context.migrateFavorites();
    assert.deepEqual(Array.from(context.state.favorites), ['ItemHands|Wave', 'Unknown']);
    assert.deepEqual(Array.from(context.loadSetting('xsact_qa_favorites', [])), ['ItemHands|Wave', 'Unknown']);
});

test('changed-only uploads handle in-place UI edits without resending unrelated action buckets', () => {
    const { context, calls } = setup({ ExtensionSettings: {} });
    context.persist('xsact_qa_custom_actions', [{ id: 'q', dialog: 'old' }, { id: 'e', source: 'echo' }]);
    context.persist('xsact_qa_favorites', ['A']);
    calls.length = 0;
    const actions = context.loadSetting('xsact_qa_custom_actions', []);
    actions.find(action => action.id === 'q').dialog = 'new';
    context.persist('xsact_qa_custom_actions', actions);
    const favorites = context.loadSetting('xsact_qa_favorites', []);
    favorites.push('B');
    context.persist('xsact_qa_favorites', favorites);
    context.persist('xsact_qa_favorites', favorites);
    assert.deepEqual(calls.map(call => Object.keys(call.data)), [['ExtensionSettings.QiAct.QiAction.act_qi'], ['ExtensionSettings.QiAct.QiSettings.xsact_qa_favorites']]);
    actions[0].dialog = 'mutated after upload';
    assert.equal(calls[0].data['ExtensionSettings.QiAct.QiAction.act_qi'][0].dialog, 'new');
});

test('large migrations are isolated per field; over-limit values fail before resetting legacy data', () => {
    const { read, calls } = setup({ ExtensionSettings: { QiAct: { first: 'a'.repeat(100000), second: 'b'.repeat(100000) } } });
    read();
    assert.ok(calls.length > 2);
    for (const call of calls) {
        assert.equal(Object.keys(call.data).length, 1);
        assert.ok(Buffer.byteLength(JSON.stringify(['AccountUpdate', call.data])) < 180000);
    }
    const huge = { content: '中'.repeat(61000) };
    const player = { ExtensionSettings: { QiAct: huge } };
    const failed = setup(player);
    assert.equal(failed.read(), null);
    assert.equal(player.ExtensionSettings.QiAct, huge);
    assert.equal(failed.calls.length, 0);
    assert.ok(failed.warnings.length > 0);
});

test('normalized stores do not upload again on reload, and oversized edits retain local backup', () => {
    const player = { ExtensionSettings: {} };
    setup(player).read();
    const { context, read, calls, warnings } = setup(player);
    read(); assert.equal(calls.length, 0);
    context.persist('large', '中'.repeat(61000));
    assert.equal(calls.length, 0);
    assert.equal(player.ExtensionSettings.QiAct.QiSettings.large, undefined);
    assert.equal(JSON.parse(context.localStorage.getItem('large')).length, 61000);
    assert.equal(warnings.length, 1);
});

test('partial migration failure leaves the original source intact for retry', () => {
    const original = { first: 1, second: 2 };
    const player = { ExtensionSettings: { QiAct: original } };
    const { context, read } = setup(player);
    let count = 0;
    context.ServerSend = () => { if (++count === 2) throw Error('offline'); };
    assert.equal(read(), null);
    assert.equal(player.ExtensionSettings.QiAct, original);
    context.ServerSend = () => {};
    assert.equal(read().QiSettings.second, 2);
});

test('language storage uses the shared adapter and preserves automatic game language', () => {
    const { context } = setup({ ExtensionSettings: {} }, { QiActLang: 'TW' });
    Object.assign(context, { window: {}, TranslationLanguage: 'EN' });
    vm.runInContext(fs.readFileSync(new URL('../src/i18n/runtime.js', import.meta.url), 'utf8'), context);
    const i18n = context.window.QiActI18n;
    assert.equal(i18n.getSelectedLang(), 'TW');
    i18n.setStorage({ load: context.loadSetting, save: context.persist });
    i18n.setLang('JA');
    assert.equal(context.loadSetting('QiActLang', null), 'JA');
    assert.equal(i18n.getCurrentLang(), 'JA');
    i18n.setLang('auto');
    assert.equal(i18n.getSelectedLang(), 'auto');
    assert.equal(i18n.getCurrentLang(), 'EN');
});
