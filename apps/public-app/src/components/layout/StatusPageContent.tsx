'use client'

import Link from 'next/link'

interface StatusPageContentProps {
  code: string | number
  message: string
  belowHeader?: boolean
  homeHref?: string
  homeLabel?: string
  onRetry?: () => void
  retryLabel?: string
}

export default function StatusPageContent({
  code,
  message,
  belowHeader = false,
  homeHref = '/',
  homeLabel = 'Back to Home',
  onRetry,
  retryLabel = 'Try Again',
}: StatusPageContentProps) {
  return (
    <main
      className={`status-page-section${belowHeader ? ' status-page-section--below-header' : ''}`}
    >
      <div className="container">
        <h1 className="display-1 fw-bold text-dark mb-3">{code}</h1>
        <p className="lead text-muted mb-4">{message}</p>
        <div className="d-flex flex-wrap gap-3 justify-content-center">
          {onRetry && (
            <button
              type="button"
              className="btn btn-outline-primary btn-lg text-uppercase"
              onClick={onRetry}
            >
              {retryLabel}
            </button>
          )}
          <Link href={homeHref} className="btn btn-primary btn-lg text-uppercase">
            {homeLabel}
          </Link>
        </div>
      </div>
    </main>
  )
}
