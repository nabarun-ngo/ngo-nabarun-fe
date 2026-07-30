import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const publicDir = path.join(root, 'public')
const source = path.join(publicDir, 'img', 'logo.png')

// Google only considers square favicons that are a multiple of 48px, so the wide
// logo is letterboxed onto a square canvas instead of cropped.
const BACKGROUND = { r: 255, g: 255, b: 255, alpha: 1 }

const targets = [
  { file: 'favicon-96x96.png', size: 96 },
  { file: 'apple-touch-icon.png', size: 180 },
  { file: 'icon-192.png', size: 192 },
  { file: 'icon-512.png', size: 512 },
]

if (!fs.existsSync(source)) {
  console.error(`Missing icon source: ${path.relative(root, source)}`)
  process.exit(1)
}

console.log('Generating square icons from public/img/logo.png …')

for (const { file, size } of targets) {
  const out = path.join(publicDir, file)
  await sharp(source)
    .resize(size, size, { fit: 'contain', background: BACKGROUND })
    .flatten({ background: BACKGROUND })
    .png({ compressionLevel: 9 })
    .toFile(out)
  console.log(`  ${file} (${size}x${size}, ${Math.round(fs.statSync(out).size / 1024)} KB)`)
}

console.log('Icon generation complete.')
