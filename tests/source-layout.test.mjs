import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

import { COMPAT_SOURCE_FILES, TRANSLATION_LANGS, readCompatSource } from '../scripts/source-bundle.mjs';

const root = path.resolve(import.meta.dirname, '..');

test('compat source manifest is explicit, complete and has semantic names', () => {
    assert.equal(new Set(COMPAT_SOURCE_FILES).size, COMPAT_SOURCE_FILES.length);
    for (const file of COMPAT_SOURCE_FILES) {
        assert.doesNotMatch(path.basename(file), /^\d{2}-/);
        assert.equal(fs.existsSync(path.join(root, 'src', file)), true, file);
    }
    const source = readCompatSource(root);
    assert.equal(source.files.length, COMPAT_SOURCE_FILES.length);
    assert.match(source.version, /^\d+\.\d+\.\d+$/); // 版本會隨發佈變動，只校驗格式，不釘死字面值
    assert.ok(source.translationCount > 0);
});

test('translations are split into one root file per supported locale', () => {
    const english = JSON.parse(fs.readFileSync(path.join(root, 'Translation/EN.json'), 'utf8'));
    for (const locale of TRANSLATION_LANGS) {
        const file = path.join(root, 'Translation', `${locale}.json`);
        assert.equal(fs.existsSync(file), true, locale);
        const dictionary = JSON.parse(fs.readFileSync(file, 'utf8'));
        assert.deepEqual(Object.keys(dictionary), Object.keys(english), `${locale} keys`);
    }
});

test('large source files are split by responsibility, with stylesheet exception', () => {
    const allowedLargeFiles = new Set(['ui/styles.js']);
    for (const file of COMPAT_SOURCE_FILES) {
        const lines = fs.readFileSync(path.join(root, 'src', file), 'utf8').split(/\r?\n/).length;
        if (lines > 600) assert.equal(allowedLargeFiles.has(file), true, `${file}: ${lines} lines`);
    }
});

test('panel layout keeps the footer last and removes x3 controls', () => {
    const template = fs.readFileSync(path.join(root, 'src/ui/panel-template.js'), 'utf8');
    const actionListAt = template.indexOf('id="xsact-action-list"');
    const footerAt = template.indexOf('xsact-qa-panel-footer');
    assert.ok(actionListAt >= 0 && footerAt > actionListAt);
    assert.equal(template.includes('xsact-x3-btn'), false);

    const behavior = fs.readFileSync(path.join(root, 'src/ui/panel-behavior.js'), 'utf8');
    assert.equal(behavior.includes('xsact-x3-btn'), false);
});

test('custom action toolbar is rendered before category chips', () => {
    const manager = fs.readFileSync(path.join(root, 'src/features/custom-actions/manager-view.js'), 'utf8');
    assert.ok(manager.indexOf('html += toolbarHtml') < manager.indexOf('id="xsact-ca-chips"'));
});

test('docked toggle delegates collapse visibility to BC ChatRoomButtons', () => {
    const toggle = fs.readFileSync(path.join(root, 'src/ui/toggle-button.js'), 'utf8');
    assert.match(toggle, /\{ plain: true \}/);
    assert.equal(toggle.includes('collapse: false'), false);
    assert.equal(toggle.includes('ensureDockedToggleVisible'), false);
});

test('body overlays use shared geometry and event-driven room updates', () => {
    const context = fs.readFileSync(path.join(root, 'src/core/application-context.js'), 'utf8');
    const grid = fs.readFileSync(path.join(root, 'src/ui/body-grid.js'), 'utf8');
    const hooks = fs.readFileSync(path.join(root, 'src/integrations/bc-hooks.js'), 'utf8');
    assert.match(context, /function getBodyZoneGeometry/);
    assert.match(context, /function buildBodyZoneSvg/);
    assert.match(grid, /grid\.innerHTML = buildBodyGridMarkup/);
    assert.match(grid, /btn\.dataset\.targetMn = charObj\.MemberNumber/);
    assert.match(grid, /grid = createBodyGrid\(entry\)/);
    assert.match(grid, /_xsactGeometrySignature/);
    assert.match(hooks, /ChatRoomCharacterViewDrawOverlay/);
    assert.match(hooks, /ChatRoomSyncMemberJoin/);
    assert.match(hooks, /ChatRoomSyncMemberLeave/);
    assert.equal(hooks.includes("hookFunction('DrawProcess'"), false);
    assert.equal(hooks.includes("hookFunction('ChatRoomMenuDraw'"), false);
    assert.equal(hooks.includes("hookFunction('ChatRoomRun'"), false);
    assert.equal(hooks.includes("'ChatRoomSync',"), false);
    assert.equal(hooks.includes("'ChatRoomSyncCharacter'"), false);
    assert.equal(hooks.includes('startRefreshTimer'), false);
    const styles = fs.readFileSync(path.join(root, 'src/ui/styles.js'), 'utf8');
    assert.match(styles, /z-index:100100/);
    assert.match(styles, /z-index:80000;pointer-events:none/);
    const picker = fs.readFileSync(path.join(root, 'src/ui/target-picker.js'), 'utf8');
    assert.doesNotMatch(picker, /updatePartFamilySelection[\s\S]{0,200}closeCharPopover\(\)[\s\S]{0,200}setPanelMode\('part'\)/);
    assert.match(styles, /\.xsact-char-popover\{[\s\S]*contain:layout paint style/);
});

test('part availability trusts the initial BC filtering result', () => {
    const context = fs.readFileSync(path.join(root, 'src/core/application-context.js'), 'utf8');
    const catalog = fs.readFileSync(path.join(root, 'src/features/actions/action-catalog.js'), 'utf8');
    const renderer = fs.readFileSync(path.join(root, 'src/ui/render/action-renderers.js'), 'utf8');
    assert.match(context, /function getPartActionGroups/);
    assert.match(context, /getPartZones\(C, part\.group\)/);
    assert.match(context, /group: canonical/);
    assert.match(context, /canonical === 'ItemHands' \? \['ItemHands', 'ItemHandheld'\] : \[canonical\]/);
    assert.match(catalog, /getPartActionGroups\(partGroup\)/);
    assert.equal(catalog.includes('getPartGroupFamily(partGroup)'), false);
    assert.match(catalog, /hasAuthoritativeResult = true/);
    assert.equal(catalog.includes('function actionExecutable'), false);
    assert.equal(catalog.includes('function allowedNamesFor'), false);
    assert.match(renderer, /getActivityLabel\(act, act\.Group \|\| partGroup\)/);
    assert.match(renderer, /requestAnimationFrame\(function\(\)/);
    assert.match(renderer, /state\._actionRenderToken/);
    assert.match(catalog, /function activityDictionaryFallback/);
    assert.equal(catalog.includes('for (var i = 0; i < arr.length; i++)'), false);
});

test('ECHO bed actions are included in the force-available allowlist', () => {
    const registry = fs.readFileSync(path.join(root, 'src/features/custom-actions/registry.js'), 'utf8');
    for (const name of ['躺上去', '拉上床', '拉到床上']) assert.ok(registry.includes(`'${name}'`), name);
});
