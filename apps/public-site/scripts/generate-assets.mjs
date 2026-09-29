/**
 * Regenerates public-site static assets:
 * - square icons from public/img/logo.png
 * - WebP siblings under public/img/ (sources stay committed as-is)
 *
 * Clear with: npm run clean:generated
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const publicDir = path.join(root, 'public')
const imgRoot = path.join(publicDir, 'img')
const logoSource = path.join(imgRoot, 'logo.png')
const heroDir = path.join(imgRoot, 'nbrn')
const rasterExt = /\.(jpe?g|png)$/i

const ICON_BACKGROUND = { r: 255, g: 255, b: 255, alpha: 1 }
const ICON_TARGETS = [
  { file: 'favicon-96x96.png', size: 96 },
  { file: 'apple-touch-icon.png', size: 180 },
  { file: 'icon-192.png', size: 192 },
  { file: 'icon-512.png', size: 512 },
]

const HERO_MAX_WIDTH = 1920
const HERO_MAX_HEIGHT = 1080
const HERO_WEBP_QUALITY = 75
const DEFAULT_WEBP_QUALITY = 82

async function generateIcons() {
  if (!fs.existsSync(logoSource)) {
    console.error(`Missing icon source: ${path.relative(root, logoSource)}`)
    process.exit(1)
  }

  // Google only considers square favicons that are a multiple of 48px, so the wide
  // logo is letterboxed onto a square canvas instead of cropped.
  console.log('Generating square icons from public/img/logo.png …')
  for (const { file, size } of ICON_TARGETS) {
    const out = path.join(publicDir, file)
    await sharp(logoSource)
      .resize(size, size, { fit: 'contain', background: ICON_BACKGROUND })
      .flatten({ background: ICON_BACKGROUND })
      .png({ compressionLevel: 9 })
      .toFile(out)
    console.log(`  ${file} (${size}x${size}, ${Math.round(fs.statSync(out).size / 1024)} KB)`)
  }
}

function isHeroImage(filePath) {
  return filePath.startsWith(heroDir + path.sep) || /[/\\]pic\d+\.(jpe?g|png)$/i.test(filePath)
}

function buildPipeline(filePath) {
  let pipeline = sharp(filePath)
  if (isHeroImage(filePath)) {
    pipeline = pipeline.resize(HERO_MAX_WIDTH, HERO_MAX_HEIGHT, {
      fit: 'inside',
      withoutEnlargement: true,
    })
  }
  return pipeline
}

async function writeWebp(filePath) {
  const webpPath = filePath.replace(rasterExt, '.webp')
  const hero = isHeroImage(filePath)
  const webpQuality = hero ? HERO_WEBP_QUALITY : DEFAULT_WEBP_QUALITY

  await buildPipeline(filePath).webp({ quality: webpQuality, effort: 4 }).toFile(webpPath)

  const meta = await sharp(filePath).metadata()
  const srcSize = fs.statSync(filePath).size
  const webpSize = fs.statSync(webpPath).size
  const dims = meta.width && meta.height ? `${meta.width}x${meta.height}` : '?'
  const tag = hero ? ' [hero]' : ''
  console.log(
    `  ${path.relative(root, filePath)}${tag} (${dims}) → webp ${Math.round(webpSize / 1024)} KB (src ${Math.round(srcSize / 1024)} KB)`
  )
}

async function generateWebps(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      await generateWebps(full)
      continue
    }
    if (!rasterExt.test(entry.name)) continue
    await writeWebp(full)
  }
}

await generateIcons()
console.log('Generating WebP images in public/img/ …')
await generateWebps(imgRoot)
console.log('Asset generation complete.')
