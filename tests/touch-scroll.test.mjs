import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const styles = read('src/ui/styles.js');
const behavior = read('src/ui/panel-behavior.js');
const editor = read('src/features/custom-actions/editor.js');
const manager = read('src/features/custom-actions/manager-view.js');
const forcePanel = read('src/ui/force-panel.js');

test('自定义动作编辑器自身是可滚动容器（触屏表单不再撑破面板）', () => {
    const line = styles.split('\n').find(l => l.includes('.xsact-ca-editor{'));
    assert.ok(line, '存在 .xsact-ca-editor 样式');
    assert.match(line, /overflow-y:auto/, '编辑器可纵向滚动');
    assert.match(line, /touch-action:pan-y/, '允许原生纵向平移手势');
    assert.match(line, /overscroll-behavior:contain/, '滚动不穿透到页面');
});

test('编辑器的 touchmove 被拦截，不冒泡到 BC 文档层', () => {
    assert.match(editor, /editorEl\.addEventListener\('touchmove'/, '编辑器容器有 touchmove stopPropagation');
});

test('主面板有 touchmove 兜底，覆盖面板内所有滚动子容器', () => {
    assert.match(behavior, /panel\.addEventListener\('touchmove'/, '面板根节点统一兜底');
    assert.match(behavior, /actionList\.addEventListener\('touchmove'/, '动作列表额外保护');
});

test('自定义动作列表与隐藏面板均有 touchmove 保护', () => {
    assert.match(manager, /scEl\.addEventListener\('touchmove'/, '自定义动作列表保护');
    assert.match(forcePanel, /forcePanelEl\.addEventListener\('touchmove'/, '隐藏面板左右栏保护');
});

test('所有纵向滚动容器都声明 overscroll-behavior:contain（隐藏面板除外单独处理）', () => {
    const scrollLines = styles.split('\n').filter(l => /overflow-y:\s*(auto|scroll)/.test(l));
    assert.ok(scrollLines.length >= 8, `应有多个滚动容器，实际 ${scrollLines.length}`);
    const withContain = scrollLines.filter(l => /overscroll-behavior:contain/.test(l));
    assert.ok(withContain.length >= 6, `多数容器应含 overscroll-behavior:contain，实际 ${withContain.length}`);
});
