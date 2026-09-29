import type { CSSProperties } from 'react'
import type { InternalScrollConfig } from '@/lib/types'

export type InternalScrollInput = boolean | InternalScrollConfig | undefined

export interface ResolvedInternalScroll {
  maxHeight: string
  maxHeightMobile: string
}

const DEFAULT_MAX_HEIGHT = 'min(85vh, 56rem)'
const DEFAULT_MAX_HEIGHT_MOBILE = 'min(78vh, 48rem)'

export function resolveInternalScroll(input: InternalScrollInput): ResolvedInternalScroll | null {
  if (!input) return null
  if (input === true) {
    return {
      maxHeight: DEFAULT_MAX_HEIGHT,
      maxHeightMobile: DEFAULT_MAX_HEIGHT_MOBILE,
    }
  }
  if (input.enabled === false) return null
  return {
    maxHeight: input.maxHeight ?? DEFAULT_MAX_HEIGHT,
    maxHeightMobile: input.maxHeightMobile ?? input.maxHeight ?? DEFAULT_MAX_HEIGHT_MOBILE,
  }
}

export function internalScrollStyle(
  config: ResolvedInternalScroll | null
): CSSProperties | undefined {
  if (!config) return undefined
  return {
    '--section-scroll-max-height': config.maxHeight,
    '--section-scroll-max-height-mobile': config.maxHeightMobile,
  } as CSSProperties
}
