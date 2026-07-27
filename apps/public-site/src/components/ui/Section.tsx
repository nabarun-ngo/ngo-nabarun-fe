import type { ReactNode } from 'react'

interface SectionProps {
  id?: string
  as?: 'section' | 'div'
  className?: string
  containerClassName?: string
  /** Adds `scroll-margin` so in-page anchor navigation clears the fixed navbar. */
  scrollMargin?: boolean
  children: ReactNode
}

/**
 * Standard page section: outer `container-xxl py-5` wrapper + inner `container`.
 * Reused across all sections for consistent, responsive spacing.
 */
export default function Section({
  id,
  as: Tag = 'section',
  className = '',
  containerClassName = '',
  scrollMargin = false,
  children,
}: SectionProps) {
  return (
    <Tag
      id={id}
      className={`container-xxl py-5 ${scrollMargin ? 'scroll-margin' : ''} ${className}`.trim()}
    >
      <div className={`container ${containerClassName}`.trim()}>{children}</div>
    </Tag>
  )
}
