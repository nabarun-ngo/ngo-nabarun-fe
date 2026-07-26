import type { DonateSection } from '@/lib/types'
import { isEnabled } from '@/lib/content/enabled'

export function isGatewayUrlConfigured(url: string | undefined): boolean {
  const trimmed = (url ?? '').trim()
  return trimmed.length > 0 && !trimmed.includes('{{')
}

export function shouldShowGatewayCta(
  showGatewayCta: boolean,
  gateway: DonateSection['gatewayCta'] | undefined
): gateway is NonNullable<DonateSection['gatewayCta']> {
  return showGatewayCta && gateway != null && isEnabled(gateway) && isGatewayUrlConfigured(gateway.url)
}
