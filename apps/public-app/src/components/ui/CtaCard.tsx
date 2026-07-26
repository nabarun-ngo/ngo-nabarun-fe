import { enabledOnly } from '@/lib/content/enabled'

interface CtaButton {
  label: string
  url: string
  icon?: string
  primary?: boolean
  external?: boolean
  enabled?: boolean
}

interface CtaCardProps {
  title: string
  description: string
  buttons: CtaButton[]
  className?: string
}

/**
 * Reusable call-to-action card (used on projects, team, and page footers).
 */
export default function CtaCard({ title, description, buttons, className = '' }: CtaCardProps) {
  const activeButtons = enabledOnly(buttons)
  if (activeButtons.length === 0) return null

  return (
    <div className={`cta-card text-center ${className}`.trim()}>
      <h3 className="text-white mb-3">{title}</h3>
      <p className="text-white-50 mb-4">{description}</p>
      <div className="d-flex flex-wrap gap-3 justify-content-center">
        {activeButtons.map((button, idx) => (
          <a
            key={idx}
            className={button.primary ? 'btn btn-light btn-lg' : 'btn btn-outline-light btn-lg'}
            href={button.url}
            target={button.external ? '_blank' : undefined}
            rel={button.external ? 'noopener noreferrer' : undefined}
          >
            {button.icon && <i className={`${button.icon} me-2`} aria-hidden="true"></i>}
            <span>{button.label}</span>
          </a>
        ))}
      </div>
    </div>
  )
}
