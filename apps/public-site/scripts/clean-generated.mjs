/**
 * Removes generated public-site static assets:
 * - all .webp under public/
 * - favicon-96x96.png, apple-touch-icon.png, icon-192.png, icon-512.png
 *   (source: public/img/logo.png)
 *
 * Re-create with: npm run generate:assets
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const publicDir = path.join(root, 'public')

const ICON_FILES = [
  'favicon-96x96.png',
  'apple-touch-icon.png',
  'icon-192.png',
  'icon-512.png',
]

function rm(target) {
  if (!fs.existsSync(target)) {
    console.log(`  skip (missing): ${path.relative(root, target)}`)
    return
  }
  fs.rmSync(target, { recursive: true, force: true })
  console.log(`  removed: ${path.relative(root, target)}`)
}

function removeWebps(dir) {
  if (!fs.existsSync(dir)) return
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      removeWebps(full)
      continue
    }
    if (entry.name.toLowerCase().endsWith('.webp')) {
      rm(full)
    }
  }
}

console.log('Cleaning generated artifacts…')
for (const file of ICON_FILES) {
  rm(path.join(publicDir, file))
}
removeWebps(publicDir)
console.log('Done.')
