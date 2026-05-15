const fs = require('fs');
const path = 'messages';

const files = ['kk.json', 'ru.json', 'en.json'];
const parsed = {};

// Parse each file
files.forEach(file => {
  try {
    const content = fs.readFileSync(`${path}/${file}`, 'utf8');
    parsed[file] = JSON.parse(content);
    console.log(`✓ ${file}: Valid JSON`);
  } catch (e) {
    console.log(`✗ ${file}: JSON Parse Error - ${e.message}`);
    process.exit(1);
  }
});

// Get all key paths recursively
function getKeys(obj, prefix = '') {
  let keys = new Set();
  for (const k in obj) {
    const path = prefix ? `${prefix}.${k}` : k;
    keys.add(path);
    if (obj[k] && typeof obj[k] === 'object' && !Array.isArray(obj[k])) {
      keys = new Set([...keys, ...getKeys(obj[k], path)]);
    }
  }
  return keys;
}

const allKeys = {};
files.forEach(file => {
  allKeys[file] = getKeys(parsed[file]);
});

// Compare keys across all files - collect all unique keys
const allUniqueKeys = new Set();
Object.values(allKeys).forEach(keySet => {
  keySet.forEach(key => allUniqueKeys.add(key));
});

let missingInAny = false;
allUniqueKeys.forEach(key => {
  files.forEach(file => {
    if (!allKeys[file].has(key)) {
      console.log(`✗ Missing key '${key}' in ${file}`);
      missingInAny = true;
    }
  });
});

if (!missingInAny) {
  console.log('✓ All files have identical key structure');
}
