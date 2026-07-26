'use client'

import { useEffect } from 'react'
import StatusPageContent from '@/components/layout/StatusPageContent'
import '@fortawesome/fontawesome-free/css/all.min.css'
import '@/app/globals.css'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="en">
      <head>
        <link href="/css/bootstrap.min.css" rel="stylesheet" />
        <link href="/css/style.css" rel="stylesheet" />
      </head>
      <body>
        <StatusPageContent
          code={500}
          message="Something went wrong. Please try again or return to the home page."
          onRetry={reset}
        />
      </body>
    </html>
  )
}
