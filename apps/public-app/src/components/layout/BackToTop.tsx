'use client'

import { useBackToTop } from '@/hooks/useCommonUI'
import { CommonSection } from '@/lib/types'

interface BackToTopProps {
  common?: CommonSection
}

/**
 * Scroll-aware back-to-top button. Visibility and label come from content2.json `layout.common.backToTop`.
 */
export default function BackToTop({ common }: BackToTopProps) {
  const config = common?.backToTop
  const enabled = config?.enabled !== false
  const threshold = config?.scrollThreshold ?? 300
  const { isVisible, scrollToTop } = useBackToTop(threshold)

  if (!enabled) return null

  return (
    <button
      type="button"
      className={`back-to-top-btn${isVisible ? ' show' : ''}`}
      onClick={scrollToTop}
      aria-label={config?.ariaLabel ?? 'Back to top'}
      aria-hidden={!isVisible}
      tabIndex={isVisible ? 0 : -1}
    >
      <i className="fas fa-arrow-up"></i>
    </button>
  )
}
