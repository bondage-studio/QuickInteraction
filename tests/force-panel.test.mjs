import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

const source = fs.readFileSync(new URL('../src/ui/force-panel.js', import.meta.url), 'utf8');
const BODY_PARTS = [
    { group: 'ItemArms', label: '手臂' },
    { group: 'ItemLegs', label: '腿' },
    { group: 'ItemMisc', label: '其他' },
];

function fixture(opts = {}) {
    const rawActions = opts.rawActions || [
        { Name: 'Caress', Target: ['ItemArms'], TargetSelf: false },
        { Name: 'TieUp', Target: 'ItemArms', TargetSelf: 'ItemLegs' },
        { Name: 'Kiss', Target: 'ItemMouth' },
    ];
    const listeners = {};
    const timers = [];
    const state = { selectedTarget: opts.selectedTarget || null };
    const ctx = vm.createContext({
        state,
        BODY_PARTS,
        caRawAllActivities: () => rawActions,
        getActivityLabelFallback: (n) => n,
        getRoomCharacters: () => opts.roomChars || [],
        Player: opts.player || { MemberNumber: 1, Name: 'Player' },
        CurrentScreen: opts.screen === undefined ? 'ChatRoom' : opts.screen,
        QiActT: (k, v) => { let t = k; if (v) for (const x of Object.keys(v)) t = t.replace('{' + x + '}', v[x]); return t; },
        escapeHtml: (s) => String(s),
        toast() {},
        executeAction(...args) { ctx.execCalls.push(args); return true; },
        qiactConfirm: opts.confirm || (() => Promise.resolve(true)),
        addRuntimeListener(t, k, f) { listeners[k] = f; },
        runtime: { timeout(fn, ms) { timers.push({ fn, ms }); return timers.length; } },
        setTimeout(fn, ms) { timers.push({ fn, ms }); return timers.length; },
        clearTimeout() {},
        document: { createElement: () => stubEl(), body: { appendChild() {} } },
        window: {},
        console,
    });
    ctx.execCalls = [];
    vm.runInContext(source, ctx);
    return { ctx, listeners, timers, state };
}

function stubEl() {
    return {
        id: '', className: '', innerHTML: '', dataset: {},
        querySelector() { return stubEl(); },
        querySelectorAll() { return []; },
        addEventListener() {},
        parentNode: null,
    };
}

test('全量枚举按部位分组，无视当前可用性，同一动作可出现在多个部位', () => {
    const f = fixture();
    const groups = f.ctx.collectAllActionsForForcePanel();
    const arms = groups.find(g => g.group === 'ItemArms');
    const legs = groups.find(g => g.group === 'ItemLegs');
    assert.ok(arms.actions.some(a => a.name === 'TieUp'));
    assert.ok(legs.actions.some(a => a.name === 'TieUp'), 'TieUp 的 TargetSelf=ItemLegs 也应列出');
    assert.ok(arms.actions.some(a => a.name === 'Caress'));
    assert.equal(groups.find(g => g.group === 'ItemMouth'), undefined, '未定义的部位不建组');
});

test('目标选择：自己/选中/全员（全员排除自己）', () => {
    const selected = { MemberNumber: 2 };
    const room = [selected, { MemberNumber: 1 }, { MemberNumber: 3 }];
    const f = fixture({ selectedTarget: selected, roomChars: room });
    f.ctx.forcePanelTarget = 'self';
    assert.equal(f.ctx.forcePanelTargets()[0].MemberNumber, 1);
    f.ctx.forcePanelTarget = 'selected';
    assert.equal(f.ctx.forcePanelTargets()[0].MemberNumber, 2);
    f.ctx.forcePanelTarget = 'all';
    assert.deepEqual(f.ctx.forcePanelTargets().map(c => c.MemberNumber), [2, 3]);
});

test('强制执行调用 executeAction 且 force=true', () => {
    const f = fixture();
    f.ctx.runForceAction([{ MemberNumber: 1 }], 'TieUp', 'ItemArms');
    assert.equal(f.ctx.execCalls.length, 1);
    const [, name, item, group, force] = f.ctx.execCalls[0];
    assert.equal(name, 'TieUp');
    assert.equal(item, null);
    assert.equal(group, 'ItemArms');
    assert.equal(force, true);
});

test('Shift+Q 长按 3 秒才触发，输入框/非聊天室不触发', () => {
    const f = fixture();
    f.ctx.bindForcePanelShortcut();
    const ev = (key, shift, target) => ({ key, shiftKey: shift, altKey: false, ctrlKey: false, metaKey: false, target: target || {} });
    f.listeners.keydown(ev('q', true));
    assert.equal(f.timers.length, 1);
    assert.equal(f.timers[0].ms, 3000);
    f.listeners.keyup(ev('q', false));
    assert.equal(f.timers.length, 1, '松开只是取消，不新增计时器');
    f.ctx.longPressActive = false;
    f.listeners.keydown(ev('q', true, { tagName: 'INPUT' }));
    assert.equal(f.ctx.longPressActive, false, '输入框内不启动长按');
    f.ctx.longPressActive = false;
    f.ctx.CurrentScreen = 'Title';
    f.listeners.keydown(ev('q', true));
    assert.equal(f.ctx.longPressActive, false, '非聊天室不启动长按');
});
