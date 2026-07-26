'use client'

import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import { resolveSectionCta } from '@/lib/content/sectionCta'
import SectionCtaBlock from '@/components/ui/SectionCtaBlock'
import type { ContactSection, CtaVariant, SectionCta } from '@/lib/types'
import type { ReactNode } from 'react'

interface ContactProps {
  content: ContactSection
  /** Build-time form fields (server FormBlock). */
  form?: ReactNode
  asPageHeading?: boolean
  teaserOnly?: boolean
  ctaVariant?: CtaVariant
  ctaOverride?: SectionCta
}

export default function Contact({
  content,
  form,
  asPageHeading = false,
  teaserOnly = false,
  ctaVariant = 'default',
  ctaOverride,
}: ContactProps) {
  const { elementRef, isVisible } = useIntersectionObserver({ delay: 100 })
  const TitleTag = asPageHeading ? 'h1' : 'h2'
  const resolvedCta = resolveSectionCta(
    content,
    teaserOnly ? 'teaser' : asPageHeading ? 'page' : ctaVariant,
    ctaOverride
  )

  return (
    <div className="container-xxl py-5 scroll-margin" id="contact">
      <div className="container">
        <div className="row g-5">
          <div
            ref={elementRef as React.RefObject<HTMLDivElement>}
            className={`col-lg-6 animate-on-scroll-left ${isVisible ? 'animate-in' : ''}`}
          >
            <div className="d-inline-block rounded-pill bg-secondary text-primary py-1 px-3 mb-3">
              {content.sectionTitle}
            </div>
            <TitleTag className="display-6 mb-5">{content.title}</TitleTag>

            {!teaserOnly && form}

            {teaserOnly && (
              <SectionCtaBlock cta={resolvedCta} />
            )}
          </div>

          <div className={`col-lg-6 animate-on-scroll-right ${isVisible ? 'animate-in' : ''}`} style={{ minHeight: 450 }}>
            <div className="position-relative rounded overflow-hidden h-100 card-hover">
              <iframe
                className="position-relative w-100 h-100"
                src={content.locationLink}
                style={{ minHeight: 450, border: 0 }}
                allowFullScreen
                loading="lazy"
                title={content.locationMapTitle}
                aria-hidden="false"
                tabIndex={0}
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
