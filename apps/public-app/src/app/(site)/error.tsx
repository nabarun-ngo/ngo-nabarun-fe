'use client'

import ErrorPageContent from '@/components/layout/ErrorPageContent'

export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <ErrorPageContent error={error} reset={reset} belowHeader />
}
