import { readFile, stat } from 'node:fs/promises';
import { dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const assets = new Set();
const html = await readFile(resolve(root, 'index.html'), 'utf8');
const css = await readFile(resolve(root, 'styles.css'), 'utf8');
const contentSource = await readFile(resolve(root, 'content.js'), 'utf8');
const sandbox = { window: {} };
vm.runInNewContext(contentSource, sandbox, { filename: 'content.js', timeout: 1000 });
const translations = sandbox.window.PORTFOLIO_CONTENT;

// This is a small static check for this buildless site, not an HTML validator.
const attributes = (source, name) => [...source.matchAll(new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, 'g'))].map(match => match[2]);
const ids = attributes(html, 'id');
const seenIds = new Set();
for (const id of ids) {
  if (seenIds.has(id)) errors.push(`Duplicate HTML id: ${id}`);
  seenIds.add(id);
}

const keys = new Set([
  ...attributes(html, 'data-i18n'), ...attributes(html, 'data-i18n-aria'),
  ...Object.keys(translations?.en || {}), ...Object.keys(translations?.zh || {})
]);
for (const language of ['en', 'zh']) {
  if (!translations || typeof translations[language] !== 'object') {
    errors.push(`Missing PORTFOLIO_CONTENT.${language} dictionary`);
    continue;
  }
  for (const key of keys) {
    if (typeof translations[language][key] !== 'string' || !translations[language][key].trim()) {
      errors.push(`Missing or empty ${language} translation: ${key}`);
    }
  }
}

function localAsset(value, source) {
  if (!value || /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(value)) return;
  if (value.startsWith('#')) {
    const id = value.slice(1);
    if (id && !seenIds.has(id)) errors.push(`${source}: anchor target does not exist: #${id}`);
    return;
  }
  let pathname;
  try { pathname = decodeURIComponent(value.split(/[?#]/, 1)[0]); }
  catch { errors.push(`${source}: malformed path: ${value}`); return; }
  if (!pathname) return;
  if (pathname.startsWith('/') || pathname.includes('\\') || pathname.split('/').includes('..')) {
    errors.push(`${source}: path is not safe for a GitHub Pages subdirectory: ${value}`);
    return;
  }
  const path = resolve(root, pathname);
  if (path !== root && !path.startsWith(root + sep)) {
    errors.push(`${source}: path leaves site directory: ${value}`);
    return;
  }
  assets.add(path);
}

for (const attribute of ['src', 'href']) {
  for (const value of attributes(html, attribute)) localAsset(value, `index.html ${attribute}`);
}
for (const match of css.matchAll(/url\(\s*(["']?)([^"')]+)\1\s*\)/g)) {
  localAsset(match[2].trim(), 'styles.css url()');
}

// Gallery and other configured assets are created by JavaScript rather than HTML.
function inspectContent(value, path = 'window') {
  if (Array.isArray(value)) value.forEach((item, index) => inspectContent(item, `${path}[${index}]`));
  else if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) {
      if (typeof item === 'string' && (/^(?:src|href|image|fallback|poster|avatar)$/i.test(key) || /^\.?\/?assets\//.test(item))) {
        localAsset(item, `${path}.${key}`);
      } else if (typeof item === 'object') inspectContent(item, `${path}.${key}`);
    }
  }
}
inspectContent(sandbox.window);
for (const [index, photo] of (sandbox.window.PORTFOLIO_PHOTOS || []).entries()) {
  if (typeof photo.file !== 'string' || !photo.file) errors.push(`Missing gallery filename at PORTFOLIO_PHOTOS[${index}]`);
  else localAsset(`assets/images/${photo.file}`, `PORTFOLIO_PHOTOS[${index}].file`);
}

for (const path of assets) {
  try {
    const info = await stat(path);
    if (!info.isFile()) errors.push(`Asset is not a file: ${path.slice(root.length + 1)}`);
  } catch { errors.push(`Missing local asset: ${path.slice(root.length + 1)}`); }
}

if (errors.length) {
  console.error(`Portfolio check failed (${errors.length}):\n${errors.map(error => `  - ${error}`).join('\n')}`);
  process.exitCode = 1;
} else {
  console.log(`Portfolio check passed: ${assets.size} local assets, ${keys.size} bilingual keys, ${seenIds.size} unique IDs, and valid anchor targets.`);
}
