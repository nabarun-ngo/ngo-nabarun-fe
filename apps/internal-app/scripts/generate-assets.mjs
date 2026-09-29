/**
 * Generates PWA splash screens and app icons from src/assets/logo.png.
 * Outputs are gitignored; run via `npm run generate:assets` (also on prepare/prebuild).
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const APP_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const LOGO_PATH = path.join(APP_ROOT, 'src', 'assets', 'logo.png')
const SPLASH_DIR = path.join(APP_ROOT, 'src', 'assets', 'splash')
const ICONS_DIR = path.join(APP_ROOT, 'src', 'assets', 'icons')
const BRAND_ORANGE = '#f97316'

const sharpCandidates = [
  path.join(APP_ROOT, 'node_modules', 'sharp'),
  path.join(APP_ROOT, '..', '..', 'node_modules', 'sharp'),
  path.join(APP_ROOT, '..', 'public-site', 'node_modules', 'sharp'),
]

async function loadSharp() {
  for (const candidate of sharpCandidates) {
    try {
      const pkg = path.join(candidate, 'package.json')
      if (!fs.existsSync(pkg)) continue
      return (await import(pathToFileURL(path.join(candidate, 'lib', 'index.js')).href))
        .default
    } catch {
      // try next
    }
  }
  throw new Error(
    'sharp is required. Install with: npm install sharp -D -w @nabarun-ngo/internal-app',
  )
}

/** Portrait splash sizes for iOS home-screen launch. */
const IOS_SPLASH_SIZES = [
  { file: 'apple-splash-1290-2796.png', width: 1290, height: 2796 },
  { file: 'apple-splash-1179-2556.png', width: 1179, height: 2556 },
  { file: 'apple-splash-1170-2532.png', width: 1170, height: 2532 },
  { file: 'apple-splash-1284-2778.png', width: 1284, height: 2778 },
  { file: 'apple-splash-1125-2436.png', width: 1125, height: 2436 },
  { file: 'apple-splash-750-1334.png', width: 750, height: 1334 },
  { file: 'apple-splash-2048-2732.png', width: 2048, height: 2732 },
  { file: 'apple-splash-1668-2388.png', width: 1668, height: 2388 },
]

/** Square icon sizes referenced by manifest.webmanifest and index.html. */
const ICON_SIZES = [48, 72, 96, 128, 192, 256, 512]

function buildSplashSvg({ width, height, logoBase64 }) {
  const logoSize = Math.round(Math.min(width, height) * 0.2)
  const boxSize = Math.round(logoSize * 1.35)
  const cx = width / 2
  const cy = height * 0.42
  const brandSize = Math.max(22, Math.round(width * 0.034))
  const tagSize = Math.max(14, Math.round(width * 0.028))

  return Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ea580c"/>
      <stop offset="45%" stop-color="#f97316"/>
      <stop offset="100%" stop-color="#fb923c"/>
    </linearGradient>
    <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
      <circle cx="1.5" cy="1.5" r="1.2" fill="#ffffff" opacity="0.12"/>
    </pattern>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.22"/>
    </filter>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg)"/>
  <rect width="${width}" height="${height}" fill="url(#dots)"/>
  <rect x="${cx - boxSize / 2}" y="${cy - boxSize / 2}" width="${boxSize}" height="${boxSize}" rx="${Math.round(boxSize * 0.22)}" fill="#ffffff" filter="url(#shadow)"/>
  <image href="data:image/png;base64,${logoBase64}" x="${cx - logoSize / 2}" y="${cy - logoSize / 2}" width="${logoSize}" height="${logoSize}" preserveAspectRatio="xMidYMid meet"/>
  <text x="${cx}" y="${cy + boxSize / 2 + brandSize * 1.4}" text-anchor="middle" fill="#ffffff" font-family="Inter, Segoe UI, Arial, sans-serif" font-size="${brandSize}" font-weight="700" letter-spacing="3">NABARUN NGO</text>
  <text x="${cx}" y="${cy + boxSize / 2 + brandSize * 2.8}" text-anchor="middle" fill="#ffffff" fill-opacity="0.88" font-family="Inter, Segoe UI, Arial, sans-serif" font-size="${tagSize}" font-weight="500">
    <tspan x="${cx}" dy="0">Compassion in Action,</tspan>
    <tspan x="${cx}" dy="${Math.round(tagSize * 1.35)}">Community at Heart</tspan>
  </text>
</svg>`)
}

async function generateSplash(sharp, logoBase64) {
  fs.mkdirSync(SPLASH_DIR, { recursive: true })
  console.log('Generating iOS PWA splash screens…')
  for (const { file, width, height } of IOS_SPLASH_SIZES) {
    const svg = buildSplashSvg({ width, height, logoBase64 })
    await sharp(svg).png({ compressionLevel: 9 }).toFile(path.join(SPLASH_DIR, file))
    console.log(`  splash/${file}`)
  }
}

async function generateIcons(sharp, logoBuffer) {
  fs.mkdirSync(ICONS_DIR, { recursive: true })
  console.log('Generating PWA icons…')

  // ~20% padding keeps the logo inside the maskable safe zone used by Android.
  for (const size of ICON_SIZES) {
    const pad = Math.round(size * 0.2)
    const logoSize = size - pad * 2
    const logo = await sharp(logoBuffer)
      .resize(logoSize, logoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer()

    const file = `icon-${size}x${size}.png`
    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: BRAND_ORANGE,
      },
    })
      .composite([{ input: logo, gravity: 'centre' }])
      .png({ compressionLevel: 9 })
      .toFile(path.join(ICONS_DIR, file))
    console.log(`  icons/${file}`)
  }
}

async function main() {
  if (!fs.existsSync(LOGO_PATH)) {
    console.error(`Missing logo: ${LOGO_PATH}`)
    process.exit(1)
  }

  const sharp = await loadSharp()
  const logoBuffer = fs.readFileSync(LOGO_PATH)
  const logoBase64 = logoBuffer.toString('base64')

  await generateSplash(sharp, logoBase64)
  await generateIcons(sharp, logoBuffer)

  console.log(
    `Done. ${IOS_SPLASH_SIZES.length} splash + ${ICON_SIZES.length} icons from logo.png -> src/assets`,
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
