const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const sourcePath = path.join(root, 'src', 'i18n', 'dictionary.js');
const outputDir = path.join(root, 'Translation');
const locales = ['TW', 'CN', 'EN', 'DE', 'FR', 'RU', 'UA'];
const collected = {};
const sandbox = {
  QiActI18n: {
    register(namespace, dictionary) {
      for (const [key, values] of Object.entries(dictionary || {})) {
        collected[`${namespace}.${key}`] = values;
      }
    },
  },
};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(sourcePath, 'utf8'), sandbox, { filename: sourcePath });
fs.mkdirSync(outputDir, { recursive: true });
for (const locale of locales) {
  const output = {};
  for (const [key, values] of Object.entries(collected)) {
    if (typeof values[locale] === 'string') output[key] = values[locale];
  }
  fs.writeFileSync(path.join(outputDir, `${locale}.json`), `${JSON.stringify(output, null, 2)}\n`);
}
console.log(`Migrated ${Object.keys(collected).length} keys into ${locales.length} locale files.`);
