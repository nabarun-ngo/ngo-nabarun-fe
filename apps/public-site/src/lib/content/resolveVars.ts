import replacePlaceholders from '@truto/replace-placeholders'
import { IMAGE_FIELD_KEYS, resolveImageSrc } from '@/lib/media'

function normalizeImageFields(value: unknown, fieldKey?: string): unknown {
  if (typeof value === 'string') {
    if (value.includes('{{')) {
      throw new Error(`Unresolved content placeholder: ${value}`)
    }
    if (fieldKey && IMAGE_FIELD_KEYS.has(fieldKey)) {
      return resolveImageSrc(value)
    }
    return value
  }
  if (Array.isArray(value)) {
    return value.map((item) => normalizeImageFields(item))
  }
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => [key, normalizeImageFields(val, key)])
    )
  }
  return value
}

function yearsSinceEstd(estd: string): string {
  const founded = Number.parseInt(estd, 10)
  const currentYear = new Date().getFullYear()
  if (!Number.isFinite(founded)) return estd
  const years = Math.max(0, currentYear - founded)
  return `${years}+`
}

/** Resolve {{dotted.json.path}} placeholders and remove the raw vars block from output. */
export function resolveVars<T extends Record<string, unknown>>(raw: T): Omit<T, 'vars'> {
  const { vars, ...rest } = raw as T & { vars?: Record<string, string> }

  if (!vars || typeof vars !== 'object') {
    throw new Error('content2.json must include a top-level "vars" object')
  }

  const effectiveVars: Record<string, string> = {
    ...vars,
    year: String(new Date().getFullYear()),
    yearsSinceEstd: yearsSinceEstd(vars.estd ?? ''),
    paymentGatewayUrl:
      vars.paymentGatewayUrl?.trim() ||
      process.env.NEXT_PUBLIC_PAYMENT_GATEWAY_URL?.trim() ||
      '',
  }

  const context = { vars: effectiveVars, ...rest }
  const resolved = replacePlaceholders(
    structuredClone(context) as Record<string, unknown>,
    context
  )
  const normalized = normalizeImageFields(resolved) as T & { vars: Record<string, string> }
  const { vars: _vars, ...withoutVars } = normalized
  void _vars
  return withoutVars as Omit<T, 'vars'>
}
