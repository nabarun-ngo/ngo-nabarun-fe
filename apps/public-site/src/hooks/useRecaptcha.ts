'use client'

import { useCallback } from 'react'
import { MOCK_RECAPTCHA, RECAPTCHA_SITE_KEY, USE_MOCK_API } from '@/lib/config/env'

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void
      execute: (siteKey: string, opts: { action: string }) => Promise<string>
    }
  }
}

let scriptPromise: Promise<void> | null = null

function loadRecaptchaScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (window.grecaptcha) return Promise.resolve()
  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `https://www.google.com/recaptcha/enterprise.js?render=${RECAPTCHA_SITE_KEY}`
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load reCAPTCHA'))
    document.head.appendChild(script)
  })

  return scriptPromise
}

/**
 * Silent (invisible) reCAPTCHA v3. `execute(action)` returns a token to attach
 * to the POST. In mock mode (or without a site key) it returns a placeholder so
 * forms work with no backend.
 */
export function useRecaptcha() {
  const execute = useCallback(async (action: string): Promise<string> => {
    if (MOCK_RECAPTCHA || typeof window === 'undefined') {
      return 'mock-recaptcha-token'
    }

    if (!RECAPTCHA_SITE_KEY || RECAPTCHA_SITE_KEY === '') {
      console.error('reCAPTCHA site key not found')
      throw new Error('reCAPTCHA site key not found')
    }

    await loadRecaptchaScript()

    return new Promise<string>((resolve, reject) => {
      if (!window.grecaptcha) {
        reject(new Error('reCAPTCHA not available'))
        return
      }
      window.grecaptcha.ready(() => {
        window
          .grecaptcha!.execute(RECAPTCHA_SITE_KEY, { action })
          .then(resolve)
          .catch(reject)
      })
    })
  }, [])

  return { execute }
}
