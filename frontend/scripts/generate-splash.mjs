// Generates the iOS launch images (apple-touch-startup-image) into public/splash
// and prints the <link> tags for index.html.
//
// iOS does not build a splash screen from the web manifest: without these the
// installed app opens on a blank white screen. Each image matches one device's
// exact pixel size; the picture is the same as the in-app launch screen
// (src/components/layout/AppSplash.tsx): brand purple with the mark centred at
// 128pt, so the system splash hands over to the app without a visible jump.
//
//   node scripts/generate-splash.mjs
import { mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import sharp from 'sharp'

const BACKGROUND = '#820ad1'
const MARK_PT = 128
const ICON = resolve('public/maskable-icon-512x512.png')
const OUT_DIR = resolve('public/splash')

/** [css width, css height, pixel ratio, tablet] — portrait sizes. */
const DEVICES = [
  [440, 956, 3], // iPhone 16 Pro Max
  [402, 874, 3], // iPhone 16 Pro
  [430, 932, 3], // iPhone 14 Pro Max, 15 Plus / Pro Max, 16 Plus
  [393, 852, 3], // iPhone 14 Pro, 15, 15 Pro, 16
  [428, 926, 3], // iPhone 12/13 Pro Max, 14 Plus
  [390, 844, 3], // iPhone 12, 13, 14, 16e
  [375, 812, 3], // iPhone X, XS, 11 Pro, 12/13 mini
  [414, 896, 3], // iPhone XS Max, 11 Pro Max
  [414, 896, 2], // iPhone XR, 11
  [414, 736, 3], // iPhone 6/7/8 Plus
  [375, 667, 2], // iPhone 6/7/8, SE 2nd/3rd gen
  [320, 568, 2], // iPhone SE 1st gen
  [744, 1133, 2, true], // iPad mini 6th gen
  [768, 1024, 2, true], // iPad 9.7"
  [810, 1080, 2, true], // iPad 10.2"
  [820, 1180, 2, true], // iPad Air 10.9", iPad 10th gen
  [834, 1112, 2, true], // iPad Pro 10.5"
  [834, 1194, 2, true], // iPad Pro 11"
  [1024, 1366, 2, true], // iPad Pro 12.9"
]

mkdirSync(OUT_DIR, { recursive: true })

const links = []
for (const [cssW, cssH, ratio, tablet] of DEVICES) {
  // iPads also launch in landscape; phones are portrait-only (see the manifest).
  const orientations = tablet ? ['portrait', 'landscape'] : ['portrait']
  for (const orientation of orientations) {
    const portrait = orientation === 'portrait'
    const width = (portrait ? cssW : cssH) * ratio
    const height = (portrait ? cssH : cssW) * ratio
    const mark = MARK_PT * ratio
    const file = `apple-splash-${width}x${height}.png`

    const icon = await sharp(ICON).resize(mark, mark).toBuffer()
    await sharp({ create: { width, height, channels: 3, background: BACKGROUND } })
      .composite([{ input: icon, left: Math.round((width - mark) / 2), top: Math.round((height - mark) / 2) }])
      .png({ compressionLevel: 9, palette: true })
      .toFile(resolve(OUT_DIR, file))

    links.push(
      `    <link rel="apple-touch-startup-image" href="/splash/${file}" media="(device-width: ${cssW}px) and (device-height: ${cssH}px) and (-webkit-device-pixel-ratio: ${ratio}) and (orientation: ${orientation})" />`,
    )
  }
}

console.log(links.join('\n'))
