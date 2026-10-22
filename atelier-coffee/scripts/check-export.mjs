import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const publicRoot = path.join(root, 'public');
const outputRoot = path.join(root, 'out');

async function filesIn(folder, prefix = '') {
  const files = [];
  for (const entry of await fs.readdir(folder, { withFileTypes: true })) {
    const relative = path.join(prefix, entry.name);
    if (entry.isDirectory()) files.push(...await filesIn(path.join(folder, entry.name), relative));
    else if (entry.isFile()) files.push(relative);
  }
  return files;
}

try {
  const sourceManifest = await fs.readFile(path.join(publicRoot, 'espresso-frames/manifest.json'));
  const manifest = JSON.parse(sourceManifest.toString('utf8'));
  if (!Number.isInteger(manifest.count) || manifest.count < 120) throw new Error('Manifeste de séquence invalide.');

  let checked = 0;
  for (const relative of await filesIn(publicRoot)) {
    const source = await fs.readFile(path.join(publicRoot, relative));
    const exported = await fs.readFile(path.join(outputRoot, relative));
    const digest = data => createHash('sha256').update(data).digest('hex');
    if (digest(source) !== digest(exported)) throw new Error(`Asset exporté différent : ${relative}`);
    checked++;
  }

  const html = await fs.readFile(path.join(outputRoot, 'index.html'), 'utf8');
  if (!html.includes('coffee-sequence')) throw new Error('La page exportée ne contient pas la scène du café.');
  const staticFiles = await filesIn(path.join(outputRoot, '_next/static'));
  if (!staticFiles.some(file => file.endsWith('.js'))) throw new Error('JavaScript du site absent.');
  if (!staticFiles.some(file => /\.woff2?$/.test(file))) throw new Error('Polices locales absentes.');

  console.log(`Export vérifié : ${checked} fichiers publics identiques, dont ${manifest.count} frames desktop et ${manifest.count} mobile ; JavaScript et polices présents.`);
} catch (error) {
  console.error(`Export incomplet : ${error.message}`);
  process.exitCode = 1;
}
