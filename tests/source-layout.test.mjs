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
    assert.equal(source.version, '1.4.1');
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
