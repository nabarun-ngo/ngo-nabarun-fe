'use client'

import { useEffect, useState } from 'react'

const HEADER_SELECTOR = '#navbar'
const CSS_VAR = '--site-header-offset'

/**
 * Measures the fixed site header (#navbar = top bar + main nav) and publishes
 * the pixel height as --site-header-offset on :root for layout clearance.
 */
export function useSiteHeaderOffset(): number | null {
  const [offset, setOffset] = useState<number | null>(null)

  useEffect(() => {
    const header = document.querySelector<HTMLElement>(HEADER_SELECTOR)
    if (!header) return

    const apply = (height: number) => {
      const px = `${height}px`
      setOffset(height)
      document.documentElement.style.setProperty(CSS_VAR, px)
    }

    const measure = () => {
      apply(Math.ceil(header.getBoundingClientRect().height))
    }

    measure()

    const resizeObserver = new ResizeObserver(measure)
    resizeObserver.observe(header)

    window.addEventListener('resize', measure)
    window.addEventListener('load', measure)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', measure)
      window.removeEventListener('load', measure)
    }
  }, [])

  return offset
}
