'use client'

import { useEffect } from 'react'
import StatusPageContent from '@/components/layout/StatusPageContent'

interface ErrorPageContentProps {
  error: Error & { digest?: string }
  reset: () => void
  belowHeader?: boolean
}

export default function ErrorPageContent({
  error,
  reset,
  belowHeader = false,
}: ErrorPageContentProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <StatusPageContent
      code={500}
      message="Something went wrong. Please try again or return to the home page."
      belowHeader={belowHeader}
      onRetry={reset}
    />
  )
}
