const MIN_SPLASH_MS = 450

let splashHidden = false
let splashShownAt = typeof performance !== 'undefined' ? performance.now() : 0

/** True when opened as an installed PWA (home screen / standalone), not a normal browser tab. */
export function isStandalonePwa(): boolean {
  if (typeof window === 'undefined') return false

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

export function hideAppSplash(): void {
  if (!isStandalonePwa() || splashHidden || typeof document === 'undefined') return
  splashHidden = true

  const splash = document.getElementById('app-splash')
  if (!splash) return

  const elapsed = performance.now() - splashShownAt
  const delay = Math.max(0, MIN_SPLASH_MS - elapsed)

  window.setTimeout(() => {
    splash.classList.add('app-splash--hide')
    splash.addEventListener(
      'transitionend',
      () => splash.remove(),
      { once: true },
    )
  }, delay)
}
