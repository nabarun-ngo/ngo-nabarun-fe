import type { ElementType } from 'react'

interface SectionHeadingProps {
  eyebrow?: string
  eyebrowIcon?: string
  title: string
  description?: string
  /** Heading level for the title. Defaults to h2 to preserve a single h1/page. */
  titleAs?: ElementType
  titleClassName?: string
  eyebrowVariant?: 'primary' | 'secondary' | 'accent'
  align?: 'center' | 'start'
  className?: string
}

const eyebrowClasses: Record<NonNullable<SectionHeadingProps['eyebrowVariant']>, string> = {
  primary: 'bg-gradient-primary text-white',
  secondary: 'bg-secondary text-primary',
  accent: 'bg-gradient-accent text-white',
}

/**
 * The eyebrow pill + title + lead description pattern used across sections.
 * Keeps heading levels consistent (h2 by default) for SEO.
 */
export default function SectionHeading({
  eyebrow,
  eyebrowIcon,
  title,
  description,
  titleAs: TitleTag = 'h2',
  titleClassName = 'display-6 mb-4',
  eyebrowVariant = 'primary',
  align = 'center',
  className = '',
}: SectionHeadingProps) {
  const alignClass = align === 'center' ? 'text-center mx-auto' : 'text-start'
  return (
    <div className={`section-intro ${alignClass} mb-5 ${className}`.trim()}>
      {eyebrow && (
        <div className={`d-inline-block rounded-pill py-2 px-4 mb-3 ${eyebrowClasses[eyebrowVariant]}`}>
          {eyebrowIcon && <i className={`${eyebrowIcon} me-2`} aria-hidden="true"></i>}
          <span>{eyebrow}</span>
        </div>
      )}
      <TitleTag className={titleClassName}>{title}</TitleTag>
      {description && <p className="lead text-muted mb-0">{description}</p>}
    </div>
  )
}
