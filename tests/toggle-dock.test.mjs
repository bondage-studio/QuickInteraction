import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

const source = fs.readFileSync(new URL('../src/ui/toggle-button.js', import.meta.url), 'utf8');

function fixture({ saved = null, vw = 1366, vh = 768 } = {}) {
    const store = { value: saved };
    const listeners = {};
    const style = {};
    const btn = {
        style,
        offsetWidth: 44,
        offsetHeight: 44,
        _rect: { left: 0, top: 0 },
        getBoundingClientRect() { return { left: parseFloat(style.left ?? this._rect.left), top: parseFloat(style.top ?? this._rect.top) }; },
    };
    const window = { innerWidth: vw, innerHeight: vh };
    const context = vm.createContext({
        window,
        state: { toggleBtnEl: btn, floatingButtonVisible: true, toggleDragged: false, isActive: false },
        S_TOGGLE_POS: 'pos',
        S_FLOATING_BUTTON: 'float',
        loadSetting: () => store.value,
        persist(k, v) { store.value = v; },
        addRuntimeListener(t, k, f) { listeners[k] = f; },
        QiActT: () => 'reset',
        toast() {},
        accentColor: () => '#fff',
        setFloatingButtonVisible() {},
        createToggleButton() {},
        toggleActionMode() {},
        updateToggleBtnStyle() {},
        document: { addEventListener() {} },
        setTimeout, clearTimeout,
        CurrentScreen: 'ChatRoom',
        console,
    });
    vm.runInContext(source, context);
    return { context, btn, style, window, store, listeners };
}

test('legacy absolute position from a 4K screen is clamped into a small viewport', () => {
    const f = fixture({ saved: { left: 3500, top: 1900 }, vw: 1366, vh: 768 });
    f.context.applyTogglePosition();
    const left = parseFloat(f.style.left), top = parseFloat(f.style.top);
    assert.ok(left >= 0 && left <= 1366 - 44, `left ${left} within viewport`);
    assert.ok(top >= 0 && top <= 768 - 44, `top ${top} within viewport`);
    assert.ok(['top', 'bottom', 'left', 'right'].includes(f.store.value.dock));
    assert.ok(f.store.value.ratio >= 0 && f.store.value.ratio <= 1);
});

test('dock ratio stays inside viewport after shrinking and is restored on resize', () => {
    const f = fixture({ saved: { dock: 'right', ratio: 0.5 }, vw: 3840, vh: 2160 });
    f.context.bindToggleViewport();
    f.context.applyTogglePosition();
    assert.equal(parseFloat(f.style.left), 3840 - 44 - 12);
    f.window.innerWidth = 1366; f.window.innerHeight = 768;
    f.listeners.resize();
    assert.equal(parseFloat(f.style.left), 1366 - 44 - 12);
    assert.equal(parseFloat(f.style.top), (768 - 44) * 0.5);
});

test('dragging near an edge snaps to it and persists dock plus ratio', () => {
    const f = fixture({ saved: null, vw: 1000, vh: 800 });
    f.btn._rect = { left: 20, top: 380 };
    f.context.dockToggleToNearestEdge(f.btn);
    assert.equal(f.store.value.dock, 'left');
    assert.equal(parseFloat(f.style.left), 12);
});

test('reset returns the button to bottom-right and overwrites saved dock', () => {
    const f = fixture({ saved: { dock: 'top', ratio: 0.1 }, vw: 1366, vh: 768 });
    f.context.resetTogglePosition();
    assert.equal(f.store.value.dock, 'right');
    assert.equal(f.store.value.ratio, 1);
    assert.equal(parseFloat(f.style.left), 1366 - 44 - 12);
    assert.equal(parseFloat(f.style.top), 768 - 44);
});

test('constrain pulls a button located fully outside back into view', () => {
    const f = fixture({ saved: null, vw: 800, vh: 600 });
    f.style.left = '5000px'; f.style.top = '4000px';
    f.context.constrainToggleToViewport(f.btn);
    assert.equal(parseFloat(f.style.left), 800 - 44 - 2);
    assert.equal(parseFloat(f.style.top), 600 - 44 - 2);
});

test('visual viewport zoom keeps the button reachable', () => {
    const f = fixture({ saved: { dock: 'right', ratio: 0.5 }, vw: 1366, vh: 768 });
    f.window.visualViewport = { offsetLeft: 100, offsetTop: 50, width: 400, height: 300 };
    f.context.applyTogglePosition();
    assert.equal(parseFloat(f.style.left), 100 + 400 - 44 - 12);
    assert.ok(parseFloat(f.style.top) >= 50 && parseFloat(f.style.top) <= 350 - 44);
});
