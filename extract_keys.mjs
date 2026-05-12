import fs from 'fs';
import path from 'path';

function extractKeysFromFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const keys = new Set();

  // Strategy 1: Match pure t('key') or t("key") calls with simple string literals
  // Key pattern: letters, numbers, dots, underscores, hyphens (no spaces, special chars)
  const simpleRegex = /t\s*\(\s*['"]([a-zA-Z][a-zA-Z0-9._-]*)['"]\s*\)/g;
  let match;

  while ((match = simpleRegex.exec(content)) !== null) {
    keys.add(match[1]);
  }

  // Strategy 2: Match template literal calls but only non-interpolated ones
  // Skip any with ${ in them
  const templateRegex = /t\s*\(\s*`([^`]*?)`\s*\)/g;

  // Clear the regex state and re-search
  while ((match = templateRegex.exec(content)) !== null) {
    const key = match[1];
    // Only add if it doesn't contain interpolation and matches the pattern
    if (!key.includes('${') && !key.includes('\\') && /^[a-zA-Z][a-zA-Z0-9._-]*$/.test(key)) {
      keys.add(key);
    }
  }

  return keys;
}

function walkDir(dir, fileExts = ['.ts', '.tsx', '.js', '.jsx']) {
  const allKeys = new Set();

  function walk(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        // Skip node_modules, .next, .git, etc.
        const skipDirs = ['node_modules', '.next', '.git', '.turbo', 'dist', 'build'];
        if (!skipDirs.includes(entry.name)) {
          walk(fullPath);
        }
      } else if (fileExts.includes(path.extname(entry.name).toLowerCase())) {
        const fileKeys = extractKeysFromFile(fullPath);
        fileKeys.forEach(key => allKeys.add(key));
      }
    }
  }

  walk(dir);
  return allKeys;
}

function organizeByNamespace(keys) {
  const namespaces = {};

  for (const key of keys) {
    const parts = key.split('.');
    const ns = parts[0];

    if (!namespaces[ns]) {
      namespaces[ns] = [];
    }
    namespaces[ns].push(key);
  }

  return namespaces;
}

// Run extraction
const srcDir = path.join(process.cwd(), 'src');
const allKeys = walkDir(srcDir);
const organized = organizeByNamespace(allKeys);

const result = {
  totalCount: allKeys.size,
  allKeys: Array.from(allKeys).sort(),
  byNamespace: Object.fromEntries(
    Object.entries(organized)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([ns, keys]) => [ns, keys.sort()])
  )
};

fs.writeFileSync('used_translation_keys.json', JSON.stringify(result, null, 2));
console.log(`Extracted ${allKeys.size} unique translation keys from source code`);

// Also print summary
console.log('\nNamespace breakdown:');
for (const [ns, keys] of Object.entries(organized).sort()) {
  console.log(`  ${ns}: ${keys.length} keys`);
}
