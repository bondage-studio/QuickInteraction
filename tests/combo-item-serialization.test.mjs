import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

const source = fs.readFileSync(new URL('../src/features/combos/combo-service.js', import.meta.url), 'utf8');

function fixture(initialCombos = []) {
    const store = { value: initialCombos };
    const ctx = vm.createContext({
        state: { combos: initialCombos, editingComboId: null, isActive: false },
        S_COMBOS: 'combos',
        QiActT: (k) => k,
        persist(key, value) { store.value = JSON.parse(JSON.stringify(value)); },
        generateId() { return 'cmb_test'; },
        renderPanel() {},
        console,
    });
    vm.runInContext(source, ctx);
    return { ctx, store };
}

function circularItem() {
    const item = { CraftName: '皮绳', Asset: { Name: 'Rope', Group: { Name: 'ItemHandheld' } } };
    item.Character = { Inventory: [item] };
    return item;
}

test('道具动作带循环引用时仍能存入组合，且被压成可序列化快照', () => {
    const f = fixture([{ id: 'c1', name: '全拘束捆绑', delay: 160, items: [] }]);
    f.ctx.addComboItem('c1', 'ItemArms', 'TieUp', '捆绑', circularItem());
    const combo = f.store.value[0];
    assert.equal(combo.items.length, 1);
    assert.equal(combo.items[0].action, 'TieUp');
    assert.equal(combo.items[0].item.Asset.Name, 'Rope');
    assert.equal(combo.items[0].item.Asset.Group.Name, 'ItemHandheld');
    assert.equal(combo.items[0].item.CraftName, '皮绳');
    assert.equal(combo.items[0].item.Character, undefined);
    assert.doesNotThrow(() => JSON.stringify(f.store.value));
});

test('同名动作不同部位共存，不被去重误删', () => {
    const f = fixture([{ id: 'c1', name: '全拘束捆绑', delay: 160, items: [] }]);
    ['ItemArms', 'ItemLegs', 'ItemHands'].forEach((g) => f.ctx.addComboItem('c1', g, 'TieUp', '捆绑', circularItem()));
    assert.equal(f.store.value[0].items.length, 3);
    assert.deepEqual(f.store.value[0].items.map((i) => i.group), ['ItemArms', 'ItemLegs', 'ItemHands']);
});

test('加载历史存档：完整道具对象被清洗，损坏条目被剔除', () => {
    const legacy = [{
        id: 'old', name: '旧组合', delay: 99,
        items: [
            { group: 'ItemArms', action: 'TieUp', label: '捆绑', item: circularItem() },
            { group: 'ItemHead', action: 'Kiss', label: '亲吻', item: null },
            { group: 'x', label: '缺动作名' },
        ],
    }];
    const f = fixture(legacy);
    const cleaned = f.ctx.normalizeCombos(legacy);
    assert.equal(cleaned.length, 1);
    assert.equal(cleaned[0].items.length, 2);
    assert.equal(cleaned[0].items[0].item.Character, undefined);
    assert.doesNotThrow(() => JSON.stringify(cleaned));
});

test('普通动作（无道具）照常存取，形状不变', () => {
    const f = fixture([{ id: 'c2', name: '温暖', delay: 200, items: [] }]);
    f.ctx.addComboItem('c2', 'ItemArms', 'Caress', '轻抚', null);
    assert.equal(f.store.value[0].items[0].item, null);
    assert.equal(f.store.value[0].items[0].action, 'Caress');
});
