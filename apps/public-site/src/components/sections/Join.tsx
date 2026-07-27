'use client'

import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import { resolveSectionCta } from '@/lib/content/sectionCta'
import SectionCtaBlock from '@/components/ui/SectionCtaBlock'
import type { CtaVariant, SectionCta, MembershipSection } from '@/lib/types'
import type { ReactNode } from 'react'

interface JoinProps {
  content: MembershipSection
  /** Build-time form fields (server FormBlock). */
  form?: ReactNode
  asPageHeading?: boolean
  teaserOnly?: boolean
  ctaVariant?: CtaVariant
  ctaOverride?: SectionCta
}

export default function Join({
  content,
  form,
  asPageHeading = false,
  teaserOnly = false,
  ctaVariant = 'default',
  ctaOverride,
}: JoinProps) {
  const { elementRef, isVisible } = useIntersectionObserver({ delay: 200 })
  const TitleTag = asPageHeading ? 'h1' : 'h2'
  const resolvedCta = resolveSectionCta(
    content,
    teaserOnly ? 'teaser' : asPageHeading ? 'page' : ctaVariant,
    ctaOverride
  )

  return (
    <div className="container-xxl py-5 scroll-margin" id="join">
      <div className="container">
        <div
          ref={elementRef as React.RefObject<HTMLDivElement>}
          className={`animate-on-scroll ${isVisible ? 'animate-in' : ''}`}
        >
          <div className="section-intro text-center mx-auto mb-5">
            <div className="d-inline-block rounded-pill bg-secondary text-primary py-1 px-3 mb-3">
              {content.sectionTitle}
            </div>
            <TitleTag className="display-6 mb-4">{content.title}</TitleTag>
          </div>

          {teaserOnly ? (
            <div className="text-center">
              <SectionCtaBlock cta={resolvedCta} />
            </div>
          ) : (
            form && (
              <div className="row justify-content-center">
                <div className="col-lg-8">
                  {content.disclaimer && (
                    <div className="alert alert-warning mb-4" role="alert">
                      <p className="mb-0">
                        {content.disclaimer.message}{' '}
                        <a
                          href={content.disclaimer.rulesLink.url}
                          className="alert-link fw-semibold"
                        >
                          {content.disclaimer.rulesLink.label}
                        </a>
                        .
                      </p>
                    </div>
                  )}
                  {form}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}
