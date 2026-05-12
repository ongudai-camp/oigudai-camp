import fs from 'fs';
import path from 'path';

// Load used keys
const usedData = JSON.parse(fs.readFileSync('used_translation_keys.json', 'utf8'));
const usedKeys = new Set(usedData.allKeys);

// Use raw used keys list as provided (no additional filtering)
const usedKeys = new Set(usedData.allKeys);

// Load language files
function loadLangFile(filename) {
  const filepath = path.join(process.cwd(), 'messages', filename);
  return JSON.parse(fs.readFileSync(filepath, 'utf8'));
}

const ru = loadLangFile('ru.json');
const en = loadLangFile('en.json');
const kk = loadLangFile('kk.json');

// Flatten a nested object to get all keys with dot notation
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

console.log(`\nLanguage file key counts:`);
console.log(`  ru.json: ${ruKeys.size} keys`);
console.log(`  en.json: ${enKeys.size} keys`);
console.log(`  kk.json: ${kkKeys.size} keys`);

// Compute missing keys per language
function findMissing(usedSet, langSet) {
  const missing = [];
  for (const key of usedSet) {
    if (!langSet.has(key)) {
      missing.push(key);
    }
  }
  return missing.sort();
}

const ruMissing = findMissing(filteredUsedKeys, ruKeys);
const enMissing = findMissing(filteredUsedKeys, enKeys);
const kkMissing = findMissing(filteredUsedKeys, kkKeys);

console.log(`\nMissing keys (filtered used set):`);
console.log(`  ru.json: ${ruMissing.length} missing`);
console.log(`  en.json: ${enMissing.length} missing`);
console.log(`  kk.json: ${kkMissing.length} missing`);

// Check for empty/null values in each language
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

console.log(`\nEmpty/null keys in language files:`);
console.log(`  ru.json: ${ruEmpty.length} empty`);
console.log(`  en.json: ${enEmpty.length} empty`);
console.log(`  kk.json: ${kkEmpty.length} empty`);

// Build detailed missing table
const allUsedSorted = Array.from(filteredUsedKeys).sort();

console.log('\n=== Detailed Missing Keys Table ===');
console.log('Key'.padEnd(50), 'Missing in RU?', 'Missing in EN?', 'Missing in KK?');
for (const key of allUsedSorted) {
  const inRu = ruKeys.has(key) ? '' : 'YES';
  const inEn = enKeys.has(key) ? '' : 'YES';
  const inKk = kkKeys.has(key) ? '' : 'YES';
  if (inRu || inEn || inKk) {
    console.log(key.padEnd(50), (inRu || '-').padEnd(14), (inEn || '-').padEnd(14), (inKk || '-').padEnd(14));
  }
}

// Compute completeness percentages
const completeness = {
  ru: Math.round(((filteredUsedKeys.size - ruMissing.length) / filteredUsedKeys.size) * 100 * 10) / 10,
  en: Math.round(((filteredUsedKeys.size - enMissing.length) / filteredUsedKeys.size) * 100 * 10) / 10,
  kk: Math.round(((filteredUsedKeys.size - kkMissing.length) / filteredUsedKeys.size) * 100 * 10) / 10,
};

console.log('\n=== Completeness Percentages ===');
console.log(`  RU: ${completeness.ru}% (${filteredUsedKeys.size - ruMissing.length}/${filteredUsedKeys.size})`);
console.log(`  EN: ${completeness.en}% (${filteredUsedKeys.size - enMissing.length}/${filteredUsedKeys.size})`);
console.log(`  KK: ${completeness.kk}% (${filteredUsedKeys.size - kkMissing.length}/${filteredUsedKeys.size})`);

// Identify namespaces completeness
function getNamespace(key) {
  const parts = key.split('.');
  return parts.length > 1 ? parts[0] : '_root';
}

function analyzeNamespaceCompleteness(usedSet, langSet) {
  const nsStats = {};
  for (const key of usedSet) {
    const ns = getNamespace(key);
    if (!nsStats[ns]) {
      nsStats[ns] = { total: 0, missing: 0 };
    }
    nsStats[ns].total++;
    if (!langSet.has(key)) {
      nsStats[ns].missing++;
    }
  }
  return Object.fromEntries(
    Object.entries(nsStats).sort(([a], [b]) => a.localeCompare(b))
  );
}

const ruNsStats = analyzeNamespaceCompleteness(filteredUsedKeys, ruKeys);
const enNsStats = analyzeNamespaceCompleteness(filteredUsedKeys, enKeys);
const kkNsStats = analyzeNamespaceCompleteness(filteredUsedKeys, kkKeys);

console.log('\n=== Namespace Completeness (missing/total) ===');
const allNamespaces = new Set([
  ...Object.keys(ruNsStats),
  ...Object.keys(enNsStats),
  ...Object.keys(kkNsStats)
]);

for (const ns of [...allNamespaces].sort()) {
  const ruInfo = ruNsStats[ns] || { total: 0, missing: 0 };
  const enInfo = enNsStats[ns] || { total: 0, missing: 0 };
  const kkInfo = kkNsStats[ns] || { total: 0, missing: 0 };
  console.log(`${ns.padEnd(20)} RU: ${ruInfo.missing}/${ruInfo.total}  EN: ${enInfo.missing}/${enInfo.total}  KK: ${kkInfo.missing}/${kkInfo.total}`);
}

// Output full report
const report = {
  summary: {
    totalUsedKeys: filteredUsedKeys.size,
    ruJson: { keyCount: ruKeys.size, missingCount: ruMissing.length, emptyCount: ruEmpty.length, completenessPercent: completeness.ru },
    enJson: { keyCount: enKeys.size, missingCount: enMissing.length, emptyCount: enEmpty.length, completenessPercent: completeness.en },
    kkJson: { keyCount: kkKeys.size, missingCount: kkMissing.length, emptyCount: kkEmpty.length, completenessPercent: completeness.kk }
  },
  missingDetails: {
    ru: ruMissing,
    en: enMissing,
    kk: kkMissing
  },
  emptyDetails: {
    ru: ruEmpty,
    en: enEmpty,
    kk: kkEmpty
  },
  namespaceCompleteness: {
    ru: ruNsStats,
    en: enNsStats,
    kk: kkNsStats
  }
};

fs.writeFileSync('translation_coverage_report.json', JSON.stringify(report, null, 2));
console.log('\nFull report saved to translation_coverage_report.json');
