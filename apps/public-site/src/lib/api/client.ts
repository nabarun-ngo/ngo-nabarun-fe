import { API_BASE_URL, API_KEY, USE_LEGACY_API } from '@/lib/config/env'
import type { SuccessResponse } from '@/lib/types'

function resolveApiUrl(endpoint: string): string {
  if (!API_BASE_URL) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL is not configured (required when USE_MOCK_API=false)')
  }

  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  return `${API_BASE_URL}${path}`
}

function isSuccessResponse<T>(json: unknown): json is SuccessResponse<T> {
  return (
    json != null &&
    typeof json === 'object' &&
    'info' in json &&
    'message' in json &&
    'timestamp' in json
  )
}

function unwrapResponsePayload<T>(json: unknown, endpoint: string): T {
  if (USE_LEGACY_API) {
    if (json != null && typeof json === 'object' && 'responsePayload' in json) {
      return (json as { responsePayload: T }).responsePayload;
    }
    return json as T;
  }

  if (!isSuccessResponse<T>(json)) {
    throw new Error(`Invalid API response for ${endpoint}: expected SuccessResponse envelope`)
  }

  if (json.responsePayload === undefined) {
    throw new Error(`Invalid API response for ${endpoint}: missing responsePayload`)
  }

  return json.responsePayload
}

/**
 * Build-time GET client (server-only callers). Sends the API key header.
 * In mock mode, callers read fixtures from public/ instead.
 */
export async function apiGet<T>(endpoint: string): Promise<T> {
  const res = await fetch(resolveApiUrl(endpoint), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
    },
  })

  if (!res.ok) {
    throw new Error(`GET ${endpoint} failed with status ${res.status}`)
  }

  const json = await res.json()
  return unwrapResponsePayload<T>(json, endpoint)
}

/**
 * Browser POST client for form submissions. Public, rate-limited endpoints —
 * no API key; a silent reCAPTCHA token is attached instead.
 */
export async function apiPost<TBody extends object, TPayload = unknown>(
  endpoint: string,
  body: TBody,
  recaptchaToken: string,
  recaptchaAction: string
): Promise<SuccessResponse<TPayload>> {
  const res = await fetch(resolveApiUrl(endpoint), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-recaptcha-token': recaptchaToken,
      'x-recaptcha-action': recaptchaAction,
    },
    body: JSON.stringify({ ...body }),
  })

  if (!res.ok) {
    throw new Error(`POST ${endpoint} failed with status ${res.status}`)
  }

  const json = await res.json()
  
  if (USE_LEGACY_API) {
    return {
      info: 'Legacy API Response',
      message: json.message || 'Submitted successfully',
      timestamp: Date.now(),
      responsePayload: json,
      ...json
    } as SuccessResponse<TPayload>
  }

  if (!isSuccessResponse<TPayload>(json)) {
    throw new Error(`Invalid API response for ${endpoint}: expected SuccessResponse envelope`)
  }

  return json
}
