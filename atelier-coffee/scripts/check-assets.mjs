import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../public/espresso-frames/', import.meta.url));

try {
  const manifest = JSON.parse(await fs.readFile(path.join(root, 'manifest.json'), 'utf8'));
  if (!Number.isInteger(manifest.count) || manifest.count < 120 || manifest.count > 9999 || manifest.ext !== 'webp') {
    throw new Error('Le manifeste doit décrire au moins 120 photogrammes WebP.');
  }
  const missing = [];
  const files = ['poster.webp', 'final.webp'];
  for (let index = 1; index <= manifest.count; index++) {
    const name = `frame-${String(index).padStart(4, '0')}.webp`;
    files.push(name, `mobile/${name}`);
  }
  for (const name of files) {
    let handle;
    try {
      handle = await fs.open(path.join(root, name), 'r');
      const header = Buffer.alloc(12);
      const { bytesRead } = await handle.read(header, 0, 12, 0);
      if (bytesRead !== 12 || header.toString('ascii', 0, 4) !== 'RIFF' || header.toString('ascii', 8, 12) !== 'WEBP') missing.push(name);
    } catch { missing.push(name); }
    finally { await handle?.close(); }
  }
  if (missing.length) throw new Error(`${missing.length} fichier(s) absent(s) ou invalide(s) : ${missing.slice(0, 6).join(', ')}`);
  console.log(`Assets vérifiés : ${manifest.count} photogrammes dans chaque résolution et deux posters. La validation visuelle reste distincte.`);
} catch (error) {
  console.error(`Construction interrompue : séquence incomplète. ${error.message}`);
  process.exitCode = 1;
}
