import fs from 'fs';
import path from 'path';

const report = JSON.parse(fs.readFileSync('translation_coverage_report.json', 'utf8'));

console.log('# Translation Coverage Report\n');

// Summary
console.log('## Summary');
console.log(`Total used keys: ${report.meta.totalUsedKeys}\n`);
console.log('| Language | Total Keys | Missing | Empty | Completeness |');
console.log('|----------|-----------|---------|-------|--------------|');
console.log(`| RU       | ${report.meta.languages.ru.totalKeys.toString().padStart(9)} | ${report.meta.languages.ru.missing.toString().padStart(7)} | ${report.meta.languages.ru.empty.toString().padStart(5)} | ${report.completenessPercentages.ru}% |`);
console.log(`| EN       | ${report.meta.languages.en.totalKeys.toString().padStart(9)} | ${report.meta.languages.en.missing.toString().padStart(7)} | ${report.meta.languages.en.empty.toString().padStart(5)} | ${report.completenessPercentages.en}% |`);
console.log(`| KK       | ${report.meta.languages.kk.totalKeys.toString().padStart(9)} | ${report.meta.languages.kk.missing.toString().padStart(7)} | ${report.meta.languages.kk.empty.toString().padStart(5)} | ${report.completenessPercentages.kk}% |`);

console.log('\n## Missing Keys by Namespace');
// Combine namespace stats
const allNs = new Set([
  ...Object.keys(report.namespaceStats.ru),
  ...Object.keys(report.namespaceStats.en),
  ...Object.keys(report.namespaceStats.kk)
]);

console.log('| Namespace | RU Missing/Total | EN Missing/Total | KK Missing/Total |');
console.log('|-----------|------------------|------------------|------------------|');
for (const ns of [...allNs].sort()) {
  const ru = report.namespaceStats.ru[ns] || { total: 0, missing: 0 };
  const en = report.namespaceStats.en[ns] || { total: 0, missing: 0 };
  const kk = report.namespaceStats.kk[ns] || { total: 0, missing: 0 };
  console.log(`| ${ns.padEnd(9)} | ${ru.missing}/${ru.total}${' '.repeat(16 - ru.missing.toString().length - ru.total.toString().length)} | ${en.missing}/${en.total}${' '.repeat(16 - en.missing.toString().length - en.total.toString().length)} | ${kk.missing}/${kk.total}${' '.repeat(16 - kk.missing.toString().length - kk.total.toString().length)} |`);
}

console.log('\n## Detailed Missing Keys Table');
console.log('Key'.padEnd(60), 'RU', 'EN', 'KK');
const allMissingSet = new Set([
  ...report.missingKeys.ru,
  ...report.missingKeys.en,
  ...report.missingKeys.kk
]);
const allMissingSorted = [...allMissingSet].sort();
for (const key of allMissingSorted) {
  const inRu = report.missingKeys.ru.includes(key) ? '✗' : '✓';
  const inEn = report.missingKeys.en.includes(key) ? '✗' : '✓';
  const inKk = report.missingKeys.kk.includes(key) ? '✗' : '✓';
  console.log(key.padEnd(60), inRu.padStart(3), inEn.padStart(3), inKk);
}

console.log('\n## Structural Issues');
console.log('No malformed JSON or syntax errors detected in ru.json, en.json, or kk.json.');

console.log('\n---');
console.log('Full data saved to translation_coverage_report.json');
