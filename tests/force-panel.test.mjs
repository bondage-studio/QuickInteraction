import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

const source = fs.readFileSync(new URL('../src/ui/force-panel.js', import.meta.url), 'utf8');
const BODY_PARTS = [
    { group: 'ItemArms', label: '手臂' },
    { group: 'ItemLegs', label: '腿' },
    { group: 'ItemMouth', label: '口' },
];

const DICT = { 'force.confirm_all_body': '对 {n} 人强制执行「{name}」' };

function fixture(opts = {}) {
    const rawActions = opts.rawActions || [
        { Name: 'Caress', Target: ['ItemArms'], TargetSelf: false },
        { Name: 'TieUp', Target: 'ItemArms', TargetSelf: 'ItemLegs' },
        { Name: 'Kiss', Target: 'ItemMouth' },
    ];
    const listeners = {};
    const timers = [];
    const state = {};
    const ctx = vm.createContext({
        state,
        BODY_PARTS,
        caRawAllActivities: () => rawActions,
        getPartGroupFamily: (g) => [g],
        getActivityLabelFallback: (n) => '译-' + n,
        getRoomCharacters: () => opts.roomChars || [],
        Player: opts.player || { MemberNumber: 1 },
        CurrentScreen: opts.screen === undefined ? 'ChatRoom' : opts.screen,
        QiActT: (k, v) => { let t = DICT[k] || k; if (v) for (const x of Object.keys(v)) t = t.replace('{' + x + '}', v[x]); return t; },
        escapeHtml: (s) => String(s),
        characterDisplayName: (c) => c.name || ('P' + c.MemberNumber),
        toast() {},
        executeAction(...args) { ctx.execCalls.push(args); return true; },
        qiactConfirm: opts.confirm || (() => Promise.resolve(true)),
        addRuntimeListener(t, k, f) { listeners[k] = f; },
        runtime: { timeout(fn, ms) { timers.push({ fn, ms }); return timers.length; } },
        setTimeout(fn, ms) { timers.push({ fn, ms }); return timers.length; },
        clearTimeout() {},
        document: { createElement: () => stubEl(), body: { appendChild() {} } },
        window: { innerWidth: 1366, innerHeight: 768 },
        console,
    });
    ctx.execCalls = [];
    vm.runInContext(source, ctx);
    return { ctx, listeners, timers, state };
}

function stubEl() {
    return {
        id: '', className: '', innerHTML: '', dataset: {}, style: {},
        offsetWidth: 760, offsetLeft: 100, offsetTop: 50,
        querySelector() { return stubEl(); },
        querySelectorAll() { return []; },
        addEventListener() {},
        setPointerCapture() {},
        parentNode: null,
    };
}

const ROOM = [
    { MemberNumber: 1, name: '自己' },
    { MemberNumber: 2, name: '他人A' },
    { MemberNumber: 3, name: '他人B' },
];

test('全量动作按部位枚举，无视可用性；同一动作可在多个部位', () => {
    const f = fixture({ roomChars: ROOM });
    const arms = f.ctx.forceActionsForPart('ItemArms');
    const legs = f.ctx.forceActionsForPart('ItemLegs');
    const mouth = f.ctx.forceActionsForPart('ItemMouth');
    assert.ok(arms.some(a => a.name === 'TieUp'));
    assert.ok(legs.some(a => a.name === 'TieUp'), 'TargetSelf=ItemLegs 也应列出');
    assert.ok(mouth.some(a => a.name === 'Kiss'));
    assert.ok(!arms.some(a => a.name === 'Kiss'));
    assert.equal(arms.length, 2, 'TieUp/Caress 各一次，不重复');
});

test('人物列表含自己与他人（与主面板同源 getRoomCharacters(true)）', () => {
    const f = fixture({ roomChars: ROOM });
    const chars = f.ctx.forceRoomCharacters();
    assert.equal(chars.length, 3);
    assert.ok(chars.some(c => c.MemberNumber === 1), '自己可选');
});

test('点动作对选中角色强制执行的 force=true 参数正确', () => {
    const f = fixture({ roomChars: ROOM });
    f.ctx.runForceAction([ROOM[1]], 'TieUp', 'ItemArms');
    assert.equal(f.ctx.execCalls.length, 1);
    const [, name, item, group, force] = f.ctx.execCalls[0];
    assert.equal(name, 'TieUp');
    assert.equal(item, null);
    assert.equal(group, 'ItemArms');
    assert.equal(force, true);
});

test('Shift+Q 长按 3 秒触发，输入框/非聊天室不触发', () => {
    const f = fixture({ roomChars: ROOM });
    f.ctx.bindForcePanelShortcut();
    const ev = (key, shift, target) => ({ key, shiftKey: shift, altKey: false, ctrlKey: false, metaKey: false, target: target || {} });
    f.listeners.keydown(ev('q', true));
    assert.equal(f.timers.length, 1);
    assert.equal(f.timers[0].ms, 3000);
    f.listeners.keyup(ev('q', false));
    f.ctx.longPressActive = false;
    f.listeners.keydown(ev('q', true, { tagName: 'TEXTAREA' }));
    assert.equal(f.ctx.longPressActive, false, '输入框不启动');
    f.ctx.longPressActive = false;
    f.ctx.CurrentScreen = 'Title';
    f.listeners.keydown(ev('q', true));
    assert.equal(f.ctx.longPressActive, false, '非聊天室不启动');
});

test('全员执行先弹确认，确认后对全房间（含自己）执行', async () => {
    let confirmArgs = null;
    const f = fixture({ roomChars: ROOM, confirm: (o) => { confirmArgs = o; return Promise.resolve(true); } });
    f.ctx.forcePanelAction = 'TieUp';
    f.ctx.forcePanelPart = 'ItemArms';
    f.ctx.forceRunOnRoomAll();
    assert.ok(confirmArgs, '应弹出确认框');
    assert.match(confirmArgs.body, /3/);
    await Promise.resolve(); await Promise.resolve();
    assert.equal(f.ctx.execCalls.length, 3, '对全房间 3 人执行');
    assert.ok(f.ctx.execCalls.every(c => c[4] === true), '全部 force=true');
});

test('未选动作时点全员只提示不执行', () => {
    const f = fixture({ roomChars: ROOM });
    f.ctx.forcePanelAction = null;
    f.ctx.forceRunOnRoomAll();
    assert.equal(f.ctx.execCalls.length, 0);
});
