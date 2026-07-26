import type { SectionCta, SectionCtaButton } from '@/lib/types'
import { activeCtaButtons } from '@/lib/content/sectionCta'
import CtaCard from '@/components/ui/CtaCard'

function ctaButtonClass(button: SectionCtaButton): string {
  const variant =
    button.variant ?? (button.primary ? 'primary' : 'outline')
  switch (variant) {
    case 'primary':
      return 'btn btn-primary btn-lg'
    case 'secondary':
      return 'btn btn-secondary btn-lg'
    case 'light':
      return 'btn btn-light btn-lg'
    default:
      return 'btn btn-outline-primary btn-lg'
  }
}

interface SectionCtaBlockProps {
  cta: SectionCta | null
  className?: string
}

/** Renders section CTAs as inline buttons or a CtaCard when title/description are set. */
export default function SectionCtaBlock({ cta, className = '' }: SectionCtaBlockProps) {
  const buttons = activeCtaButtons(cta)
  if (!cta || buttons.length === 0) return null

  if (cta.title || cta.description) {
    return (
      <CtaCard
        title={cta.title ?? ''}
        description={cta.description ?? ''}
        buttons={buttons}
        className={className}
      />
    )
  }

  return (
    <div className={`d-flex flex-wrap gap-3 ${className}`.trim()}>
      {buttons.map((button, idx) => (
        <a
          key={idx}
          className={ctaButtonClass(button)}
          href={button.url}
          target={button.external ? '_blank' : undefined}
          rel={button.external ? 'noopener noreferrer' : undefined}
        >
          {button.icon && <i className={`${button.icon} me-2`} aria-hidden="true" />}
          <span>{button.label}</span>
        </a>
      ))}
    </div>
  )
}
