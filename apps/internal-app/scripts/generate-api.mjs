/**
 * Generates the typed API client from src/app/core/api/swagger.json.
 *
 * The output is gitignored, so a fresh checkout has no client at all and
 * anything that compiles the app has to generate one first. That is why this
 * runs from `generate:code`, ahead of lint, test and build, rather than by hand.
 *
 * Pass --cached to keep a client that is already present instead of rebuilding
 * it. The flag compares nothing: it trusts the caller to know the contract has
 * not moved, which holds for a second task in the same run or a warm CI cache,
 * and does not hold after editing swagger.json. Without it the client is always
 * rebuilt from scratch, which is the safe default.
 *
 * A failed generation is retried a few times. Only the generator run is worth
 * retrying: a missing contract or a missing dependency is settled and waiting
 * cannot change either, whereas a run that dies or half-writes partway through
 * is usually a file still held by a scanner or a previous process, and clears
 * on the next attempt.
 *
 * Usage: node scripts/generate-api.mjs [--cached]
 *        npm run generate:api -- --cached
 */
import { execFileSync } from 'child_process'
import fs from 'fs'
import { createRequire } from 'module'
import path from 'path'
import { fileURLToPath } from 'url'

const APP_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const SWAGGER = path.join(APP_ROOT, 'src', 'app', 'core', 'api', 'swagger.json')
const OUT_DIR = path.join(APP_ROOT, 'src', 'app', 'core', 'api', 'api-client')

const cached = process.argv.includes('--cached')

const MAX_ATTEMPTS = 5
const RETRY_DELAY_MS = 5000

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/* The barrels every consumer imports through. Checking these rather than the
   directory means a run that died midway counts as absent, so --cached cannot
   hand a half-written client to the compiler. */
const BARRELS = ['models.ts', 'services.ts'].map((file) => path.join(OUT_DIR, file))

const rel = (target) => path.relative(APP_ROOT, target).replace(/\\/g, '/')

function fail(message, hint) {
  console.error(`[generate-api] ${message}`)
  if (hint) {
    console.error(`[generate-api] ${hint}`)
  }
  process.exit(1)
}

const present = BARRELS.filter((file) => fs.existsSync(file))

if (cached && present.length === BARRELS.length) {
  console.log(`[generate-api] Keeping the existing client in ${rel(OUT_DIR)} (--cached).`)
  process.exit(0)
}

if (cached && present.length > 0) {
  console.warn('[generate-api] Existing client is incomplete, regenerating despite --cached.')
}

if (!fs.existsSync(SWAGGER)) {
  fail(
    `Missing API contract: ${rel(SWAGGER)}`,
    "The contract is committed, so this means the checkout is incomplete rather than that something needs generating.",
  )
}

/* Resolved before the delete below, so a missing dependency cannot leave the
   tree with no client at all. The entry point is then run with this Node binary
   rather than through the npx or .cmd shim, which Node refuses to spawn without
   a shell on Windows. */
function resolveGenerator() {
  const require = createRequire(import.meta.url)
  const manifestPath = require.resolve('ng-openapi-gen/package.json')
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  const bin = typeof manifest.bin === 'string' ? manifest.bin : manifest.bin?.['ng-openapi-gen']
  if (!bin) {
    throw new Error('the installed package declares no bin entry')
  }
  return path.join(path.dirname(manifestPath), bin)
}

let generator
try {
  generator = resolveGenerator()
} catch (error) {
  fail(`Cannot locate ng-openapi-gen: ${error.message}`, 'Run `npm ci` at the repo root.')
}

let lastFailure = ''

for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
  /* Cleared at the start of every attempt, not once before the loop, so a
     partial client left by a failed attempt cannot survive into the next one. */
  fs.rmSync(OUT_DIR, { recursive: true, force: true })

  try {
    execFileSync(process.execPath, [generator, '--input', SWAGGER, '--output', OUT_DIR], {
      cwd: APP_ROOT,
      stdio: 'inherit',
    })

    /* Counted as a failed attempt rather than a hard stop. A zero exit with no
       barrels is the half-written case, which is the one retrying fixes, and
       left alone it would surface much later as a wall of unresolved imports
       pointing at the app rather than at generation. */
    const missing = BARRELS.filter((file) => !fs.existsSync(file))
    if (missing.length > 0) {
      throw new Error(`exited cleanly without writing ${missing.map(rel).join(', ')}`)
    }

    console.log(`[generate-api] Client written to ${rel(OUT_DIR)}.`)
    process.exit(0)
  } catch (error) {
    lastFailure =
      error.status != null ? `ng-openapi-gen exited with ${error.status}` : error.message
    console.warn(`[generate-api] Attempt ${attempt} of ${MAX_ATTEMPTS} failed: ${lastFailure}`)
  }

  if (attempt < MAX_ATTEMPTS) {
    console.warn(`[generate-api] Retrying in ${RETRY_DELAY_MS / 1000}s …`)
    await sleep(RETRY_DELAY_MS)
  }
}

fail(
  `Generation failed after ${MAX_ATTEMPTS} attempts. Last failure: ${lastFailure}`,
  `Nothing is left in ${rel(OUT_DIR)}; the generator's own output above says why.`,
)
