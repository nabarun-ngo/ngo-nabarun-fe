import type { CtaVariant, SectionCta, SectionCtaButton } from '@/lib/types'
import { enabledOnly } from '@/lib/content/enabled'

interface SectionWithCtaSource {
  cta?: SectionCta
  ctaVariants?: Partial<Record<Exclude<CtaVariant, 'default'>, SectionCta>>
}

export function resolveSectionCta(
  section: SectionWithCtaSource,
  variant: CtaVariant,
  override?: SectionCta
): SectionCta | null {
  if (override) {
    if (override.enabled === false) return null
    return override
  }

  if (variant !== 'default') {
    const variantCta = section.ctaVariants?.[variant]
    if (variantCta) {
      if (variantCta.enabled === false) return null
      return variantCta
    }
  }

  const base = section.cta
  if (!base || base.enabled === false) return null
  return base
}

export function activeCtaButtons(cta: SectionCta | null | undefined): SectionCtaButton[] {
  return enabledOnly(cta?.buttons ?? [])
}
