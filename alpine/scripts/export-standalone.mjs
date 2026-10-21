import { build } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises'
import path from 'node:path'

// A portable edition: one HTML file, all scripts, styles, images and fonts
// embedded. It can be opened from the filesystem without a web server.
const project = path.resolve(import.meta.dirname, '..')
const output = path.join(project, 'artifacts', 'standalone-build')
await build({
  configFile: false,
  root: project,
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    outDir: output,
    emptyOutDir: true,
    cssCodeSplit: false,
    modulePreload: false,
    rollupOptions: { output: { inlineDynamicImports: true } },
  },
})

const mime = { '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ttf': 'font/ttf' }
const embedded = new Map()
for (const folder of ['images', 'fonts']) {
  for (const file of await readdir(path.join(project, 'public', folder))) {
    const type = mime[path.extname(file)]
    if (!type) continue
    const content = await readFile(path.join(project, 'public', folder, file))
    embedded.set(`/${folder}/${file}`, `data:${type};base64,${content.toString('base64')}`)
  }
}
const favicon = await readFile(path.join(project, 'public', 'favicon.svg'))
embedded.set('/favicon.svg', `data:image/svg+xml;base64,${favicon.toString('base64')}`)
function embed(source) {
  for (const [url, data] of embedded) {
    for (const variant of [`..${url}`, `.${url}`, url]) source = source.replaceAll(variant, data)
  }
  return source
}

let html = await readFile(path.join(output, 'index.html'), 'utf8')
// Preloads duplicate large data URLs in a one-file edition and are unnecessary.
html = embed(html.replace(/<link\b[^>]*\brel="preload"[^>]*>/g, ''))
const assets = path.join(output, 'assets')
const files = await readdir(assets)
const script = files.find((file) => file.endsWith('.js'))
const stylesheet = files.find((file) => file.endsWith('.css'))
if (!script || !stylesheet) throw new Error('Portable build assets missing')
let js = await readFile(path.join(assets, script), 'utf8')
const images = Object.fromEntries([...embedded].filter(([url]) => url.startsWith('/images/')))
// Reuse each photo instead of embedding it again for every carousel and story.
for (const url of Object.keys(images)) {
  for (const variant of [`..${url}`, `.${url}`, url]) {
    const reference = `globalThis.__ALPINE_ASSETS__[${JSON.stringify(url)}]`
    js = js.replaceAll(JSON.stringify(variant), reference).replaceAll(`'${variant}'`, reference)
  }
}
js = (`globalThis.__ALPINE_ASSETS__=${JSON.stringify(images)};\n${js}`).replaceAll('</script', '<\\/script')
const css = embed(await readFile(path.join(assets, stylesheet), 'utf8'))
html = html.replace(/<script type="module"[^>]*src="[^"]+"[^>]*><\/script>/, () => `<script type="module">${js}</script>`)
html = html.replace(/<link rel="stylesheet"[^>]*href="[^"]+"[^>]*>/, () => `<style>${css}</style>`)
await mkdir(path.join(project, 'artifacts'), { recursive: true })
const target = path.join(project, 'artifacts', 'val-thorens.html')
await writeFile(target, html)
console.log(`Portable site: ${target} (${(Buffer.byteLength(html) / 1024 / 1024).toFixed(2)} MB)`)
