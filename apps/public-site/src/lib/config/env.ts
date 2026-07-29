/**
 * Centralized environment access.
 *
 * API (shared base URL for GET + POST):
 *   - NEXT_PUBLIC_API_BASE_URL
 *   - API_KEY                    (server-only; sent on GET requests)
 *   - NEXT_PUBLIC_SITE_KEY (browser form submits)
 *
 * NEXT_PUBLIC_USE_MOCK_API toggles mocked data/responses so the site builds
 * and runs with no backend. Defaults to `true`.
 */

function toBool(value: string | undefined, fallback: boolean): boolean {
  if (value == null || value === '') return fallback
  return value.toLowerCase() === 'true'
}

export const USE_MOCK_API = toBool(process.env.NEXT_PUBLIC_USE_MOCK_API, true)
export const USE_LEGACY_API = toBool(process.env.NEXT_PUBLIC_USE_LEGACY_API, false)
export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '').replace(/\/$/, '')
export const API_KEY = process.env.API_KEY ?? ''
export const MOCK_RECAPTCHA = process.env.NEXT_PUBLIC_MOCK_RECAPTCHA ?? false
export const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_SITE_KEY ?? ''
export const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim()
