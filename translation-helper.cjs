const fs = require('fs');
const glob = require('glob');
const path = require('path');

const translationFiles = glob.sync('src/lib/translations/*/*.json');
const codeFiles = glob.sync('src/**/*.{svelte,ts}');

const translations = {};
const translationUsages = {};
const translationValues = {};

translationFiles.forEach((file) => {
  const lang = file.split(path.sep)[3];
  const json = JSON.parse(fs.readFileSync(file, 'utf8'));
  const keys = collectLeafKeys(json);
  if (!translations[lang]) {
    translations[lang] = {};
    translationUsages[lang] = {};
    translationValues[lang] = {};
  }
  keys.forEach((key) => {
    const prefix = path.basename(file, '.json');
    const fullKey = `${prefix}.${key}`;
    const value = getJsonValue(json, key);
    translations[lang][fullKey] = value;
    translationUsages[lang][fullKey] = false;
    if (!translationValues[lang][value]) {
      translationValues[lang][value] = [];
    }
    translationValues[lang][value].push(fullKey);
  });
});

const keyPattern = /(?<=['`])([^'`]*?\.[^'`$]*?)(?=\$\{.*\}|['`])/g;

codeFiles.forEach((file) => {
  const code = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = keyPattern.exec(code))) {
    const key = match[1];
    for (const lang in translationUsages) {
      if (key.endsWith('.')) {
        for (const translationKey in translationUsages[lang]) {
          if (translationKey.startsWith(key)) {
            translationUsages[lang][translationKey] = true;
          }
        }
      } else {
        if (translationUsages[lang][key] !== undefined) {
          translationUsages[lang][key] = true;
        }
      }
    }
  }
});

for (const lang in translationUsages) {
  let counter = 0;
  console.log(`\nUnused translations in ${lang}:`);
  for (const key in translationUsages[lang]) {
    if (!translationUsages[lang][key]) {
      console.log(key);
      counter++;
    }
  }
  console.log(`Total: ${counter}`);
}

const languages = Object.keys(translationUsages);
for (let i = 0; i < languages.length; i++) {
  for (let j = i + 1; j < languages.length; j++) {
    const lang1 = languages[i];
    const lang2 = languages[j];
    console.log(`\nDifferences in keys between ${lang1} and ${lang2}:`);
    for (const key in translationUsages[lang1]) {
      if (translationUsages[lang2][key] === undefined) {
        console.log(`"${key}" in ${lang1} is missing in ${lang2}`);
      }
    }
    for (const key in translationUsages[lang2]) {
      if (translationUsages[lang1][key] === undefined) {
        console.log(`"${key}" in ${lang2} is missing in ${lang1}`);
      }
    }
  }
}

console.log('\nDuplicate translations:');
for (const lang in translationValues) {
  console.log(`\nIn ${lang}:`);
  for (const value in translationValues[lang]) {
    const keys = translationValues[lang][value];
    if (keys.length > 2) {
      console.log(`"${value}": ${keys.join(', ')}`);
    }
  }
}

const args = process.argv.slice(2);
if (args[0] === 'mc') {
  const sourceLang = args[1] ?? 'en';
  const targetLangs = args[2]
    ? [args[2]]
    : Object.keys(translations).filter((lang) => lang !== sourceLang);
  targetLangs.forEach((targetLang) => {
    console.log(`\nMaking ${targetLang} consistent with ${sourceLang}`);
    const targetFiles = glob.sync(`src/lib/translations/${targetLang}/*.json`);
    targetFiles.forEach((file) => {
      const json = JSON.parse(fs.readFileSync(file, 'utf8'));
      const prefix = path.basename(file, '.json');
      for (const key in translationUsages[sourceLang]) {
        if (key.startsWith(prefix) && translationUsages[targetLang][key] === undefined) {
          const keyPath = key.slice(prefix.length + 1).split('.');
          let obj = json;
          for (let i = 0; i < keyPath.length - 1; i++) {
            if (!obj[keyPath[i]]) {
              obj[keyPath[i]] = {};
            }
            obj = obj[keyPath[i]];
          }
          obj[keyPath[keyPath.length - 1]] = translations[sourceLang][key];
          console.log(`+ ${key}`);
        }
      }
      for (const key in translationUsages[targetLang]) {
        if (key.startsWith(prefix) && translationUsages[sourceLang][key] === undefined) {
          const keyPath = key.slice(prefix.length + 1).split('.');
          let obj = json;
          for (let i = 0; i < keyPath.length - 1; i++) {
            obj = obj[keyPath[i]];
          }
          delete obj[keyPath[keyPath.length - 1]];
          console.log(`- ${key}`);
        }
      }
      fs.writeFileSync(file, `${JSON.stringify(sortObject(json), null, 2)}\n`);
    });
  });
}

if (args[0] === 's') {
  translationFiles.forEach((file) => {
    const json = JSON.parse(fs.readFileSync(file, 'utf8'));
    fs.writeFileSync(file, `${JSON.stringify(sortObject(json), null, 2)}\n`);
  });
}

function collectLeafKeys(obj, prefix = '') {
  return Object.keys(obj).reduce((keys, key) => {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      return keys.concat(collectLeafKeys(obj[key], `${prefix}${key}.`));
    } else {
      return keys.concat(`${prefix}${key}`);
    }
  }, []);
}

function getJsonValue(obj, path) {
  const parts = path.split('.');
  let value = obj;
  for (const part of parts) {
    value = value[part];
  }
  return value;
}

function sortObject(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sortObject);
  }

  return Object.keys(obj)
    .sort()
    .reduce((sortedObj, key) => {
      sortedObj[key] = sortObject(obj[key]);
      return sortedObj;
    }, {});
}
