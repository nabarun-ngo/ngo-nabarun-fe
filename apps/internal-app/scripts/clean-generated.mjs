/**
 * Removes all generated internal-app artifacts:
 * - src/environments/env.generated.ts
 * - src/app/core/api/api-client/
 * - src/assets/splash/
 * - src/assets/icons/
 *
 * Re-create with: npm run env:generate && npm run generate:assets && npm run sync:api
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')

const TARGETS = [
  path.join(root, 'src', 'environments', 'env.generated.ts'),
  path.join(root, 'src', 'app', 'core', 'api', 'api-client'),
  path.join(root, 'src', 'assets', 'splash'),
  path.join(root, 'src', 'assets', 'icons'),
]

function rm(target) {
  if (!fs.existsSync(target)) {
    console.log(`  skip (missing): ${path.relative(root, target)}`)
    return
  }
  fs.rmSync(target, { recursive: true, force: true })
  console.log(`  removed: ${path.relative(root, target)}`)
}

console.log('Cleaning generated artifacts…')
for (const target of TARGETS) {
  rm(target)
}
console.log('Done.')
