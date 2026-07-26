import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const imgRoot = path.join(root, 'public', 'img')
const heroDir = path.join(imgRoot, 'nbrn')
const rasterExt = /\.(jpe?g|png)$/i

const HERO_MAX_WIDTH = 1920
const HERO_MAX_HEIGHT = 1080
const HERO_WEBP_QUALITY = 75
const HERO_JPEG_QUALITY = 80
const DEFAULT_WEBP_QUALITY = 82
const DEFAULT_JPEG_QUALITY = 85

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

async function optimizeFile(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  const webpPath = filePath.replace(rasterExt, '.webp')
  const hero = isHeroImage(filePath)
  const webpQuality = hero ? HERO_WEBP_QUALITY : DEFAULT_WEBP_QUALITY
  const jpegQuality = hero ? HERO_JPEG_QUALITY : DEFAULT_JPEG_QUALITY

  await buildPipeline(filePath).webp({ quality: webpQuality, effort: 4 }).toFile(webpPath)

  const tmp = `${filePath}.opt.tmp`
  if (ext === '.jpg' || ext === '.jpeg') {
    await buildPipeline(filePath).jpeg({ quality: jpegQuality, mozjpeg: true }).toFile(tmp)
  } else if (ext === '.png') {
    await buildPipeline(filePath)
      .png({ compressionLevel: 9, palette: !hero })
      .toFile(tmp)
  }
  fs.renameSync(tmp, filePath)

  const meta = await sharp(filePath).metadata()
  const srcSize = fs.statSync(filePath).size
  const webpSize = fs.statSync(webpPath).size
  const dims = meta.width && meta.height ? `${meta.width}x${meta.height}` : '?'
  const tag = hero ? ' [hero]' : ''
  console.log(
    `  ${path.relative(root, filePath)}${tag} (${dims}) → webp ${Math.round(webpSize / 1024)} KB, src ${Math.round(srcSize / 1024)} KB`
  )
}

async function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      await walk(full)
      continue
    }
    if (!rasterExt.test(entry.name)) continue
    await optimizeFile(full)
  }
}

console.log('Optimizing images in public/img/ …')
await walk(imgRoot)
console.log('Image optimization complete.')
