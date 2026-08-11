import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

import { COMPAT_SOURCE_FILES, readCompatSource } from '../scripts/source-bundle.mjs';

const root = path.resolve(import.meta.dirname, '..');

test('compat source manifest is explicit, complete and has semantic names', () => {
    assert.equal(new Set(COMPAT_SOURCE_FILES).size, COMPAT_SOURCE_FILES.length);
    for (const file of COMPAT_SOURCE_FILES) {
        assert.doesNotMatch(path.basename(file), /^\d{2}-/);
        assert.equal(fs.existsSync(path.join(root, 'src', file)), true, file);
    }
    const source = readCompatSource(root);
    assert.equal(source.files.length, COMPAT_SOURCE_FILES.length);
    assert.equal(source.version, '1.4.0');
    assert.ok(source.translationCount > 0);
});

test('large source files are split by responsibility, with stylesheet exception', () => {
    const allowedLargeFiles = new Set(['ui/styles.js']);
    for (const file of COMPAT_SOURCE_FILES) {
        const lines = fs.readFileSync(path.join(root, 'src', file), 'utf8').split(/\r?\n/).length;
        if (lines > 600) assert.equal(allowedLargeFiles.has(file), true, `${file}: ${lines} lines`);
    }
});
