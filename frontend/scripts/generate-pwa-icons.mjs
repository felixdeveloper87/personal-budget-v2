// Renders the PWA / home-screen icons from public/favicon.svg.
// Run with: node scripts/generate-pwa-icons.mjs
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import sharp from 'sharp'

const publicDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public')
const rounded = readFileSync(join(publicDir, 'favicon.svg'), 'utf8')
// Maskable and Apple icons must be full-bleed: the OS applies its own mask.
// The P already sits inside the maskable safe zone (80% centre circle).
const fullBleed = rounded.replace(/\s+rx="\d+"/, '')

// Android status-bar badge: only the alpha channel is used, so draw the P
// as a white silhouette on transparent.
const badge = rounded
  .replace(/<rect[^>]*\/>/, '')
  .replace(/fill="#[0-9a-fA-F]{6}"/g, 'fill="#ffffff"')

const outputs = [
  { file: 'pwa-64x64.png', svg: rounded, size: 64 },
  { file: 'pwa-192x192.png', svg: rounded, size: 192 },
  { file: 'pwa-512x512.png', svg: rounded, size: 512 },
  { file: 'maskable-icon-512x512.png', svg: fullBleed, size: 512 },
  { file: 'apple-touch-icon-180x180.png', svg: fullBleed, size: 180 },
  { file: 'badge-96x96.png', svg: badge, size: 96 },
]

for (const { file, svg, size } of outputs) {
  await sharp(Buffer.from(svg), { density: 384 })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toFile(join(publicDir, file))
  console.log(`wrote public/${file}`)
}
