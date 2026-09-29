'use client'

import { AboutSection, CtaVariant, HeroStatsDisplay, SectionCta } from '@/lib/types'
import { useIntersectionObserver, useStaggeredAnimation } from '@/hooks/useIntersectionObserver'
import { enabledOnly } from '@/lib/content/enabled'
import SectionCtaBlock from '@/components/ui/SectionCtaBlock'
import { resolveSectionCta } from '@/lib/content/sectionCta'

interface AboutProps {
  content: AboutSection
  /** When true, renders the section title as h1 (used on the dedicated /about page). */
  asPageHeading?: boolean
  /** Show the image, stats, mission points, and founder block. Default true. */
  showMain?: boolean
  /** Show enhanced paragraphs and mission/vision. Respects `content.detail.enabled`. */
  showDetail?: boolean
  /** Homepage teaser: visual hook + CTA, hides deep main content. */
  teaserOnly?: boolean
  /** Which CTA variant to render (`default`, `teaser`, or `page`). */
  ctaVariant?: CtaVariant
  /** Optional CTA override (e.g. from `pages.home.sections`). */
  ctaOverride?: SectionCta
  /** Dynamic stats for the image overlay (home hero); replaces static about.stats values. */
  heroStats?: HeroStatsDisplay | null
}

export default function About({
  content,
  asPageHeading = false,
  showMain = true,
  showDetail = false,
  teaserOnly = false,
  ctaVariant = 'default',
  ctaOverride,
  heroStats,
}: AboutProps) {
  const staticStats = enabledOnly(content.stats)
  const stats = heroStats
    ? [
        {
          icon: staticStats[0]?.icon ?? 'fas fa-users',
          value: heroStats.beneficiaryCount,
          label: heroStats.beneficiaryLabel,
        },
        {
          icon: staticStats[1]?.icon ?? 'fas fa-hands-helping',
          value: heroStats.projectCount,
          label: heroStats.projectLabel,
        },
      ]
    : staticStats
  const missionPoints = enabledOnly(content.missionPoints)
  const resolvedCta = resolveSectionCta(content, ctaVariant, ctaOverride)
  const { elementRef: headerRef, isVisible: isHeaderVisible } = useIntersectionObserver({ delay: 100 })
  const { elementRef: contentRef, isVisible: isContentVisible } = useIntersectionObserver({ delay: 300 })
  const { containerRef: statsRef, visibleItems: statsVisible } = useStaggeredAnimation(stats.length, 200)

  const TitleTag = asPageHeading ? 'h1' : 'h2'
  const detail = content.detail
  const showExtended = showDetail && detail && detail.enabled !== false

  return (
    <div className="container-xxl py-5 scroll-margin" id="about">
      <div className="container">
        <div
          ref={headerRef as React.RefObject<HTMLDivElement>}
          className={`section-intro text-center mx-auto mb-5 animate-on-scroll ${isHeaderVisible ? 'animate-in' : ''}`}
        >
          <div className="d-inline-block rounded-pill bg-gradient-primary text-white py-2 px-4 mb-3">
            <i className="fas fa-heart me-2"></i>
            <span>{content.sectionTitle}</span>
          </div>
          <TitleTag className="display-6 mb-4">{content.title}</TitleTag>
          <p className="lead text-muted mb-0">{content.description}</p>
        </div>

        {showExtended && detail && (
          <>
            <div className="row justify-content-center mb-5">
              <div className="col-lg-10 col-xl-9">
                <div className="about-narrative text-muted fs-5 lh-lg">
                  {detail.paragraphs.map((paragraph, idx) => (
                    <p key={idx} className={idx === detail.paragraphs.length - 1 ? 'mb-0' : 'mb-4'}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            <div className="row justify-content-center mb-5 g-4">
              <div className="col-lg-10 col-xl-9">
                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="h-100 bg-light rounded-4 p-4 p-lg-5">
                      <h3 className="h5 text-primary mb-3">
                        <i className="fas fa-bullseye me-2" aria-hidden="true" />
                        {detail.mission.title}
                      </h3>
                      <p className="text-muted mb-0">{detail.mission.description}</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="h-100 bg-light rounded-4 p-4 p-lg-5">
                      <h3 className="h5 text-primary mb-3">
                        <i className="fas fa-eye me-2" aria-hidden="true" />
                        {detail.vision.title}
                      </h3>
                      <p className="text-muted mb-0">{detail.vision.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {showMain && (
          <div className="row g-5 align-items-center">
            <div className={`col-lg-6 animate-on-scroll-left ${isContentVisible ? 'animate-in' : ''}`}>
              <div className="about-image-card position-relative card-hover">
                <div className="main-image-wrapper">
                  <img
                    className="img-fluid rounded-4 shadow-lg"
                    src="/img/nbrn/pic4.jpg"
                    alt="Nabarun NGO community work in Ichapur and Barrackpore"
                    width={600}
                    height={650}
                    loading="lazy"
                    style={{ width: '100%', height: '650px', objectFit: 'cover' }}
                  />
                  <div className="experience-badge animate-float">
                    <div className="badge-content text-center">
                      <p className="h3 text-white mb-1">{content.experience.years}</p>
                      <p className="text-white-50 mb-0">{content.experience.label}</p>
                    </div>
                  </div>
                </div>

                <div ref={statsRef as React.RefObject<HTMLDivElement>} className="stats-cards">
                  {stats.map((stat, idx) => (
                    <div
                      className={`stat-card hover-lift animate-on-scroll ${statsVisible[idx] ? 'animate-in' : ''}`}
                      key={idx}
                    >
                      <i className={`${stat.icon} text-primary mb-2`}></i>
                      <p className="h4 text-dark mb-1">{stat.value}</p>
                      <p className="text-muted mb-0">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {!teaserOnly && (
              <div
                ref={contentRef as React.RefObject<HTMLDivElement>}
                className={`col-lg-6 animate-on-scroll-right ${isContentVisible ? 'animate-in' : ''}`}
              >
                <div className="about-content">
                  <div className="mission-points mb-5">
                    {missionPoints.map((point, idx) => (
                      <div className="mission-point d-flex align-items-start mb-3" key={idx}>
                        <div className="icon-wrapper me-3">
                          <i className={`${point.icon} text-primary`}></i>
                        </div>
                        <div>
                          <h3 className="h5 text-dark mb-1">{point.title}</h3>
                          <p className="text-muted mb-0">{point.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="founder-message-card mb-4">
                    <div className="card-content">
                      <div className="quote-icon">
                        <i className="fas fa-quote-left text-primary"></i>
                      </div>
                      <p className="mb-3">{content.founderMessage.quote}</p>
                      <div className="founder-info d-flex align-items-center">
                        <div className="founder-avatar me-3">
                          <i className="fas fa-user-circle text-primary"></i>
                        </div>
                        <div>
                          <p className="h6 text-primary mb-0">{content.founderMessage.name}</p>
                          <small className="text-muted">{content.founderMessage.title}</small>
                        </div>
                      </div>
                    </div>
                  </div>

                  <SectionCtaBlock cta={resolvedCta} />
                </div>
              </div>
            )}

            {teaserOnly && (
              <div className={`col-lg-6 animate-on-scroll-right ${isContentVisible ? 'animate-in' : ''}`}>
                <div className="about-content d-flex flex-column justify-content-center h-100">
                  <SectionCtaBlock cta={resolvedCta} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
