import { createHash } from 'node:crypto'
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'

// After the build, writes the list of files to precache (and a version derived from their
// contents) into dist/sw.js, so the service worker can make the whole app work offline.

const MANIFEST_SLOT = '[] /*__PRECACHE_MANIFEST__*/'
const VERSION_SLOT = "'verbum-dev' /*__CACHE_VERSION__*/"

// Not needed to run the app offline: the worker itself, source maps, link-preview images,
// install-only icons, the PNG fallback of the logo, and legacy .woff copies of the fonts.
const SKIP = [
  /^\/sw\.js$/, /\.map$/, /^\/og-image\.jpg$/, /^\/icon-512\.png$/, /^\/icon-maskable\.png$/,
  /^\/verbum-logo-256\.png$/, /^\/fonts\//, /\.woff$/,
]

function listFiles(dir, base = dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name)
    return statSync(full).isDirectory() ? listFiles(full, base) : ['/' + path.relative(base, full).split(path.sep).join('/')]
  })
}

export default function precacheManifest() {
  let outDir = 'dist'
  return {
    name: 'verbum-precache-manifest',
    apply: 'build',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir)
    },
    closeBundle() {
      const files = listFiles(outDir).filter((f) => !SKIP.some((re) => re.test(f))).sort()
      const hash = createHash('sha1')
      for (const f of files) hash.update(f).update(readFileSync(path.join(outDir, f)))
      const urls = ['/', ...files]
      const version = 'verbum-' + hash.digest('hex').slice(0, 10)

      const swPath = path.join(outDir, 'sw.js')
      const sw = readFileSync(swPath, 'utf8')
      if (!sw.includes(MANIFEST_SLOT) || !sw.includes(VERSION_SLOT)) {
        throw new Error('precacheManifest: placeholders not found in sw.js')
      }
      writeFileSync(swPath, sw.replace(MANIFEST_SLOT, JSON.stringify(urls)).replace(VERSION_SLOT, JSON.stringify(version)))
      console.log(`\nprecache: ${urls.length} files, cache ${version}`)
    },
  }
}
