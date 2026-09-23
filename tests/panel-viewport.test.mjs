import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
const source = fs.readFileSync(new URL('../src/ui/panel-behavior.js', import.meta.url), 'utf8');
function fixture(saved) {
    const listeners = {};
    const header = { addEventListener(t, f) { listeners[t] = f; }, classList: { add() {}, remove() {} }, setPointerCapture() {}, hasPointerCapture() { return false; } };
    const style = { setProperty(k, v) { this[k] = v; } };
    const panel = { classList: { toggle() {} }, style, querySelector() { return header; },
        get offsetLeft() { return parseFloat(style.left ?? 20); },
        get offsetTop() { return parseFloat(style.top ?? 20); },
        get offsetWidth() { return Math.min(340, parseFloat(style['--xs-viewport-width'] ?? 340)); },
        get offsetHeight() { return Math.min(600, parseFloat(style['--xs-viewport-height'] ?? 600)); },
        getBoundingClientRect() { return { left: this.offsetLeft, top: this.offsetTop }; } };
    const window = { innerWidth: 390, innerHeight: 700 };
    const events = {};
    const context = vm.createContext({ window, CommonIsMobile: () => false, state: { actionPanelEl: panel }, S_POS: 'pos', loadSetting: () => saved, persist() {}, addRuntimeListener(t, k, f) { events[k] = f; } });
    vm.runInContext(source, context);
    return { context, panel, window, events, listeners };
}
test('desktop saved position is recovered inside a phone viewport, including after rotation', () => {
    const f = fixture({ left: 1500, top: 800 });
    f.context.applyPanelPosition();
    assert.equal(f.panel.offsetLeft, 46);
    assert.equal(f.panel.offsetTop, 96);
    f.window.innerWidth = 700; f.window.innerHeight = 240;
    f.events.resize();
    assert.equal(f.panel.offsetTop, 4);
    assert.equal(f.panel.offsetHeight, 232);
});
test('visual viewport bounds keep the panel reachable when zoomed or panned', () => {
    const f = fixture(null);
    f.window.visualViewport = { offsetLeft: 100, offsetTop: 50, width: 200, height: 300 };
    f.context.applyPanelPosition();
    assert.equal(f.panel.offsetLeft, 104);
    assert.equal(f.panel.offsetTop, 54);
    assert.equal(f.panel.offsetWidth, 192);
});
test('touch pointer drag is bounded, ignores other pointers and ends on cancellation', () => {
    const f = fixture(null);
    f.context.applyPanelPosition(); f.context.makeDraggable(f.panel);
    const event = { pointerId: 1, button: 0, clientX: 30, clientY: 30, target: { closest() { return false; } }, preventDefault() {} };
    f.listeners.pointerdown(event);
    f.listeners.pointermove({ ...event, pointerId: 2, clientX: 1000 });
    assert.equal(f.panel.offsetLeft, 20);
    f.listeners.pointermove({ ...event, clientX: 1000 });
    assert.equal(f.panel.offsetLeft, 46);
    f.listeners.pointercancel(event);
    f.listeners.pointermove({ ...event, clientX: 0 });
    assert.equal(f.panel.offsetLeft, 46);
});

test('BC mobile detection centers a fresh panel even on a wide landscape viewport', () => {
    const f = fixture(null);
    f.context.CommonIsMobile = () => true;
    f.window.innerWidth = 900;
    let mobileClass;
    f.panel.classList.toggle = (name, value) => { mobileClass = value; };
    f.context.applyPanelPosition();
    assert.equal(mobileClass, true);
    assert.equal(f.panel.offsetLeft, 280);
    assert.equal(f.panel.offsetTop, 8);
});
test('BC detection takes precedence and missing detection falls back to viewport width', () => {
    const f = fixture(null);
    assert.equal(f.context.isPanelMobile(), false);
    delete f.context.CommonIsMobile;
    assert.equal(f.context.isPanelMobile(), true);
    f.window.innerWidth = 900;
    assert.equal(f.context.isPanelMobile(), false);
});
