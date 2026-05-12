import fs from 'fs';
import path from 'path';

// Step 1: Load used keys from the provided list
const usedData = JSON.parse(fs.readFileSync('used_translation_keys.json', 'utf8'));
const usedKeys = new Set(usedData.allKeys);

// Step 2: Load all three language files
function loadLangFile(filename) {
  const filepath = path.join(process.cwd(), 'messages', filename);
  return JSON.parse(fs.readFileSync(filepath, 'utf8'));
}

const ru = loadLangFile('ru.json');
const en = loadLangFile('en.json');
const kk = loadLangFile('kk.json');

// Step 3: Flatten JSON objects to dot-notation keys
function flatten(obj, prefix = '', result = {}) {
  for (const [k, v] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      flatten(v, newKey, result);
    } else {
      result[newKey] = v;
    }
  }
  return result;
}

const ruFlat = flatten(ru);
const enFlat = flatten(en);
const kkFlat = flatten(kk);

const ruKeys = new Set(Object.keys(ruFlat));
const enKeys = new Set(Object.keys(enFlat));
const kkKeys = new Set(Object.keys(kkFlat));

// Step 4: Summary
console.log('=== Translation Coverage Report ===\n');
console.log(`Total keys used in codebase: ${usedKeys.size}`);
console.log(`  ru.json key count: ${ruKeys.size}`);
console.log(`  en.json key count: ${enKeys.size}`);
console.log(`  kk.json key count: ${kkKeys.size}`);

// Step 5: Identify missing keys per language
function findMissing(usedSet, langSet) {
  const missing = [];
  for (const key of usedSet) {
    if (!langSet.has(key)) {
      missing.push(key);
    }
  }
  return missing.sort();
}

const ruMissing = findMissing(usedKeys, ruKeys);
const enMissing = findMissing(usedKeys, enKeys);
const kkMissing = findMissing(usedKeys, kkKeys);

console.log(`\nMissing keys (present in code but absent in language file):`);
console.log(`  RU: ${ruMissing.length} missing`);
console.log(`  EN: ${enMissing.length} missing`);
console.log(`  KK: ${kkMissing.length} missing`);

// Step 6: Check for empty/null/undefined values in each language file
function findEmptyKeys(langFlat) {
  const empty = [];
  for (const [key, value] of Object.entries(langFlat)) {
    if (value === null || value === undefined || value === '') {
      empty.push(key);
    }
  }
  return empty.sort();
}

const ruEmpty = findEmptyKeys(ruFlat);
const enEmpty = findEmptyKeys(enFlat);
const kkEmpty = findEmptyKeys(kkFlat);

console.log(`\nEmpty or null translation values:`);
console.log(`  RU: ${ruEmpty.length} empty`);
console.log(`  EN: ${enEmpty.length} empty`);
console.log(`  KK: ${kkEmpty.length} empty`);

// Step 7: Detailed missing table (only show keys missing in at least one language)
const allUsedSorted = Array.from(usedKeys).sort();

console.log('\n=== Detailed Missing Keys ===');
console.log('Key'.padEnd(55), 'RU', 'EN', 'KK');
for (const key of allUsedSorted) {
  const inRu = ruKeys.has(key) ? '✓' : '✗';
  const inEn = enKeys.has(key) ? '✓' : '✗';
  const inKk = kkKeys.has(key) ? '✓' : '✗';
  if (inRu === '✗' || inEn === '✗' || inKk === '✗') {
    console.log(key.padEnd(55), inRu.padEnd(5), inEn.padEnd(5), inKk);
  }
}

// Step 8: Completeness percentages
const completeness = {
  ru: Math.round(((usedKeys.size - ruMissing.length) / usedKeys.size) * 100 * 10) / 10,
  en: Math.round(((usedKeys.size - enMissing.length) / usedKeys.size) * 100 * 10) / 10,
  kk: Math.round(((usedKeys.size - kkMissing.length) / usedKeys.size) * 100 * 10) / 10,
};

console.log('\n=== Completeness Percentages ===');
console.log(`  RU: ${completeness.ru}% (${usedKeys.size - ruMissing.length}/${usedKeys.size})`);
console.log(`  EN: ${completeness.en}% (${usedKeys.size - enMissing.length}/${usedKeys.size})`);
console.log(`  KK: ${completeness.kk}% (${usedKeys.size - kkMissing.length}/${usedKeys.size})`);

// Step 9: Namespace completeness
function analyzeNamespace(usedSet, langSet) {
  const nsStats = {};
  for (const key of usedSet) {
    const parts = key.split('.');
    const ns = parts.length > 1 ? parts[0] : '_global';
    if (!nsStats[ns]) {
      nsStats[ns] = { total: 0, missing: 0 };
    }
    nsStats[ns].total++;
    if (!langSet.has(key)) {
      nsStats[ns].missing++;
    }
  }
  return nsStats;
}

const ruNs = analyzeNamespace(usedKeys, ruKeys);
const enNs = analyzeNamespace(usedKeys, enKeys);
const kkNs = analyzeNamespace(usedKeys, kkKeys);

const allNamespaces = new Set([...Object.keys(ruNs), ...Object.keys(enNs), ...Object.keys(kkNs)]);

console.log('\n=== Namespace Completeness (missing/total) ===');
for (const ns of [...allNamespaces].sort()) {
  const r = ruNs[ns] || { total: 0, missing: 0 };
  const e = enNs[ns] || { total: 0, missing: 0 };
  const k = kkNs[ns] || { total: 0, missing: 0 };
  console.log(`${ns.padEnd(25)} RU: ${r.missing}/${r.total}  EN: ${e.missing}/${e.total}  KK: ${k.missing}/${k.total}`);
}

// Step 10: Save full report
const report = {
  meta: {
    totalUsedKeys: usedKeys.size,
    languages: {
      ru: { totalKeys: ruKeys.size, missing: ruMissing.length, empty: ruEmpty.length },
      en: { totalKeys: enKeys.size, missing: enMissing.length, empty: enEmpty.length },
      kk: { totalKeys: kkKeys.size, missing: kkMissing.length, empty: kkEmpty.length }
    }
  },
  completenessPercentages: completeness,
  missingKeys: { ru: ruMissing, en: enMissing, kk: kkMissing },
  emptyKeys: { ru: ruEmpty, en: enEmpty, kk: kkEmpty },
  namespaceStats: { ru: ruNs, en: enNs, kk: kkNs }
};

fs.writeFileSync('translation_coverage_report.json', JSON.stringify(report, null, 2));
console.log('\nFull JSON report saved to translation_coverage_report.json');
