import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

const source = fs.readFileSync(new URL('../src/ui/render/panel-renderer.js', import.meta.url), 'utf8');

function fixture(combos) {
    const listEl = {
        innerHTML: '',
        classList: { toggle() {} },
        querySelectorAll() { return []; },
        querySelector() { return null; },
    };
    const titleEl = { textContent: '' };
    const panel = {
        querySelector(sel) {
            if (sel === '#xsact-action-list') return listEl;
            if (sel === '#xsact-panel-title') return titleEl;
            if (sel === '#xsact-all-btn') return null;
            return null;
        },
    };
    // 模板与项目一致：combo.count 自带 {n}
    const dict = { 'combo.count': '{n} 步', 'combo.new_btn': '新建组合', 'combo.edit_title': '编辑：{name}', 'render.combo_title': '组合动作' };
    const QiActT = (key, vars) => {
        let t = dict[key] || key;
        if (vars) for (const k of Object.keys(vars)) t = t.replace(new RegExp('\\{' + k + '\\}', 'g'), String(vars[k]));
        return t;
    };
    const ctx = vm.createContext({
        state: { actionPanelEl: panel, combos, editingComboId: null, allModeActive: false },
        QiActT,
        characterDisplayName: (c) => c.name,
        getCombo: (id) => combos.find((c) => c.id === id),
        comboDelay: () => 160,
        BODY_PARTS: [],
        svgIcon: () => '',
        escapeHtml: (s) => String(s),
        QiActI18n: {},
        console,
    });
    vm.runInContext(source, ctx);
    return { ctx, listEl, panel };
}

test('组合列表步数只显示一次（不再出现 55 步这种重复数字）', () => {
    const combos = [
        { id: 'a', name: '全拘束捆绑', items: [{}, {}, {}, {}, {}], delay: 160 },
        { id: 'b', name: '温暖', items: [{}, {}, {}, {}], delay: 160 },
        { id: 'c', name: '抚摸全身', items: Array.from({ length: 9 }, () => ({})) },
    ];
    const f = fixture(combos);
    f.ctx.updateComboPanel(null);
    assert.match(f.listEl.innerHTML, />5 步</, '5 步只显示一次');
    assert.match(f.listEl.innerHTML, />4 步</, '4 步只显示一次');
    assert.match(f.listEl.innerHTML, />9 步</, '9 步只显示一次');
    assert.doesNotMatch(f.listEl.innerHTML, />55 步</);
    assert.doesNotMatch(f.listEl.innerHTML, />44 步</);
    assert.doesNotMatch(f.listEl.innerHTML, />99 步</);
});
