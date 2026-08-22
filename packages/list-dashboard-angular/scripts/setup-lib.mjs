import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkgRoot = path.join(__dirname, '..');
const srcRoot = path.join(pkgRoot, 'src', 'lib');
const importSrc = path.join(srcRoot, '_import-src');
const appSrc = path.join(
  pkgRoot,
  '..',
  '..',
  'apps',
  'internal-app',
  'src',
  'app',
  'shared',
  'next',
  'filtered-infinite-list',
);

const CORE_ONLY = new Set([
  'infinite-list.model.ts',
  'list-detail.model.ts',
  'list-detail.helpers.ts',
  'filtered-list-page.config.ts',
  'filtered-list-dashboard.config.ts',
  'list-detail-page.config.ts',
  'list-detail-page.adapter.ts',
  'list-page.adapter.ts',
  'create-list-page.adapter.ts',
  'create-detail-page.adapter.ts',
  'derive-bulk-edit-from-detail-edit.util.ts',
  'merge-filter-form-definition.util.ts',
  'list-route-query.util.ts',
  'route-resolver.util.ts',
  'detailed-view-list-detail.mapper.ts',
  'index.ts',
]);

function copyDir(from, to, rel = '') {
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const relPath = path.join(rel, entry.name);
    const fromPath = path.join(from, entry.name);
    const toPath = path.join(to, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === 'components') {
        fs.mkdirSync(toPath, { recursive: true });
        copyDir(fromPath, toPath, relPath);
        continue;
      }
      if (rel === '' && entry.name === 'components') {
        fs.mkdirSync(toPath, { recursive: true });
        copyDir(fromPath, toPath, relPath);
      } else if (rel.startsWith('components')) {
        fs.mkdirSync(toPath, { recursive: true });
        copyDir(fromPath, toPath, relPath);
      }
      continue;
    }

    if (rel === '' && CORE_ONLY.has(entry.name)) {
      continue;
    }

    fs.mkdirSync(path.dirname(toPath), { recursive: true });
    let content = fs.readFileSync(fromPath, 'utf8');
    content = transformContent(content, relPath);
    fs.writeFileSync(toPath, content);
  }
}

function transformContent(content, relPath) {
  const depth = relPath.split(path.sep).filter(Boolean).length;
  const upToLib = '../'.repeat(depth);

  return content
    .replace(/from 'src\/app\/shared\/model\/key-value\.model'/g, "from '@nabarun-ngo/list-dashboard-core'")
    .replace(/from 'src\/app\/shared\/model\/document\.model'/g, "from '@nabarun-ngo/list-dashboard-core'")
    .replace(/from 'src\/app\/shared\/components\/generic\/file-upload\/file-upload\.component'/g, "from '@nabarun-ngo/list-dashboard-core'")
    .replace(/from 'src\/app\/shared\/utils\/mobile-sheet-body-lock'/g, `from '${upToLib}utils/mobile-sheet-body-lock.js'`)
    .replace(/from '\.\/infinite-list\.model'/g, "from '@nabarun-ngo/list-dashboard-core'")
    .replace(/from '\.\.\/infinite-list\.model'/g, "from '@nabarun-ngo/list-dashboard-core'")
    .replace(/from '\.\.\/\.\.\/infinite-list\.model'/g, "from '@nabarun-ngo/list-dashboard-core'")
    .replace(/from '\.\/list-detail\.model'/g, "from '@nabarun-ngo/list-dashboard-core'")
    .replace(/from '\.\.\/list-detail\.model'/g, "from '@nabarun-ngo/list-dashboard-core'")
    .replace(/from '\.\.\/\.\.\/list-detail\.model'/g, "from '@nabarun-ngo/list-dashboard-core'")
    .replace(/from '\.\/list-detail\.helpers'/g, "from '@nabarun-ngo/list-dashboard-core'")
    .replace(/from '\.\.\/list-detail\.helpers'/g, "from '@nabarun-ngo/list-dashboard-core'")
    .replace(/from '\.\/filtered-list-page\.config'/g, "from '@nabarun-ngo/list-dashboard-core'")
    .replace(/from '\.\/filtered-list-dashboard\.config'/g, "from '@nabarun-ngo/list-dashboard-core'")
    .replace(/from '\.\/list-detail-page\.config'/g, "from '@nabarun-ngo/list-dashboard-core'")
    .replace(/from '\.\/list-detail-page\.adapter'/g, "from '@nabarun-ngo/list-dashboard-core'")
    .replace(/from '\.\/list-page\.adapter'/g, "from '@nabarun-ngo/list-dashboard-core'")
    .replace(/from '\.\/create-list-page\.adapter'/g, "from '@nabarun-ngo/list-dashboard-core'")
    .replace(/from '\.\/create-detail-page\.adapter'/g, "from '@nabarun-ngo/list-dashboard-core'")
    .replace(/from '\.\/derive-bulk-edit-from-detail-edit\.util'/g, "from '@nabarun-ngo/list-dashboard-core'")
    .replace(/from '\.\/merge-filter-form-definition\.util'/g, "from '@nabarun-ngo/list-dashboard-core'")
    .replace(/from '\.\/list-route-query\.util'/g, "from '@nabarun-ngo/list-dashboard-core'")
    .replace(/from '\.\/route-resolver\.util'/g, "from '@nabarun-ngo/list-dashboard-core'")
    .replace(/\bKeyValue\b/g, 'KeyValueLike')
    .replace(/Record<string, KeyValueLike\[\]>/g, 'RefDataMap')
    .replace(/\bDoc\b/g, 'ListDocument')
    .replace(/\bFileUpload\b/g, 'ListFileUpload');
}

// Copy components directory explicitly
function copyComponents() {
  const from = path.join(importSrc, 'components');
  const to = path.join(srcRoot, 'components');
  fs.mkdirSync(to, { recursive: true });

  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const fromPath = path.join(from, entry.name);
    const toPath = path.join(to, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(toPath, { recursive: true });
      for (const file of fs.readdirSync(fromPath)) {
        const fp = path.join(fromPath, file);
        const tp = path.join(toPath, file);
        let content = fs.readFileSync(fp, 'utf8');
        const rel = path.join('components', entry.name, file);
        content = transformContent(content, rel);
        fs.writeFileSync(tp, content);
      }
    }
  }
}

// Copy root-level angular files
for (const entry of fs.readdirSync(importSrc, { withFileTypes: true })) {
  if (entry.isDirectory()) continue;
  if (CORE_ONLY.has(entry.name)) continue;
  const fromPath = path.join(importSrc, entry.name);
  const toPath = path.join(srcRoot, entry.name);
  let content = fs.readFileSync(fromPath, 'utf8');
  content = transformContent(content, entry.name);
  fs.writeFileSync(toPath, content);
}

copyComponents();

// Copy mobile form sheet from app if not already present
const mobileFrom = path.join(pkgRoot, 'src', 'lib', 'mobile-form-sheet');
if (fs.existsSync(mobileFrom)) {
  for (const file of fs.readdirSync(mobileFrom)) {
    if (!file.endsWith('.ts') && !file.endsWith('.html') && !file.endsWith('.scss')) continue;
    const fp = path.join(mobileFrom, file);
    let content = fs.readFileSync(fp, 'utf8');
    content = transformContent(content, path.join('mobile-form-sheet', file));
    fs.writeFileSync(fp, content);
  }
}

// Copy styles
const stylesFrom = path.join(pkgRoot, '..', '..', 'apps', 'internal-app', 'src', 'styles', '_mobile-form-sheet.scss');
const stylesTo = path.join(pkgRoot, 'src', 'styles', '_mobile-form-sheet.scss');
if (fs.existsSync(stylesFrom)) {
  fs.mkdirSync(path.dirname(stylesTo), { recursive: true });
  fs.copyFileSync(stylesFrom, stylesTo);
}

console.log('Angular lib files prepared.');
