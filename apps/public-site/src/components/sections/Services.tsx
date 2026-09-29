import { ServicesSection, CtaVariant, SectionCta } from '@/lib/types'
import { enabledOnly } from '@/lib/content/enabled'
import { resolveSectionCta } from '@/lib/content/sectionCta'
import { resolveInternalScroll, internalScrollStyle, type InternalScrollInput } from '@/lib/content/internalScroll'
import SectionCtaBlock from '@/components/ui/SectionCtaBlock'

interface ServicesProps {
  content: ServicesSection
  /** Section title as h1 (dedicated /projects page) vs h2 (home section). */
  asPageHeading?: boolean
  /** Show pill + title + description above the grid. Default true. */
  showHeader?: boolean
  ctaVariant?: CtaVariant
  ctaOverride?: SectionCta
  /** Home embed: scroll project cards inside a capped panel. */
  internalScroll?: InternalScrollInput
}

export default function Services({
  content,
  asPageHeading = false,
  showHeader = true,
  ctaVariant = 'default',
  ctaOverride,
  internalScroll,
}: ServicesProps) {
  const TitleTag = asPageHeading ? 'h1' : 'h2'
  const serviceItems = enabledOnly(content.serviceItems ?? [])
  const resolvedCta = resolveSectionCta(content, ctaVariant, ctaOverride)
  const scrollPanel = resolveInternalScroll(internalScroll)

  return (
    <div className="container-xxl py-5 scroll-margin" id="services">
      <div className="container">
        {showHeader && (
          <div className="section-intro text-center mx-auto mb-5">
            <div className="d-inline-block rounded-pill bg-gradient-secondary text-white py-2 px-4 mb-3">
              <i className="fas fa-hands-helping me-2"></i><span>{content.sectionTitle}</span>
            </div>
            <TitleTag className="display-5 mb-4">{content.title}</TitleTag>
            <p className="lead text-muted">{content.description}</p>
          </div>
        )}

        <div
          className={scrollPanel ? 'section-internal-scroll' : undefined}
          style={internalScrollStyle(scrollPanel)}
        >
          <div className="row g-4 justify-content-center">
            {serviceItems.map((service) => {
              const features = enabledOnly(service.features)
              const detailUrl = service.button.url
              return (
              <div key={service.slug ?? service.title} className="col-lg-4 col-md-6">
                <a
                  className="service-card h-100"
                  href={detailUrl}
                  aria-label={`${service.title} — ${service.button.label}`}
                >
                  <div className="service-icon">
                    <i className={service.icon} aria-hidden="true"></i>
                  </div>
                  <div className="service-content">
                    <h3 className="h4 service-title mb-3">{service.title}</h3>
                    <p className="service-description mb-4">{service.description}</p>
                    <div className="service-features mb-4">
                      {features.map((feature, fIdx) => (
                        <div key={fIdx} className="feature-item d-flex align-items-center mb-2">
                          <i className="fas fa-check-circle text-accent me-2"></i>
                          <span className="text-muted">{feature.text}</span>
                        </div>
                      ))}
                    </div>
                    {/* A span, not a nested <a>: the whole card is already the link. */}
                    <span className="btn btn-outline-primary w-100">
                      <i className="fas fa-info-circle me-2" aria-hidden="true"></i>
                      <span>{service.button.label}</span>
                    </span>
                  </div>
                  <div className="service-overlay">
                    <div className="overlay-content">
                      <p className="h5 text-white mb-3">{service.overlay.title}</p>
                      <div className="impact-stats">
                        <div className="stat">
                          <p className="h4 text-white">{service.overlay.stat.value}</p>
                          <p className="text-white-50">{service.overlay.stat.label}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </a>
              </div>
              )
            })}
          </div>
        </div>

        <div className="text-center mt-5">
          <SectionCtaBlock cta={resolvedCta} />
        </div>
      </div>
    </div>
  )
}
