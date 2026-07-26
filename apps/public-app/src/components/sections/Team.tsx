import { TeamSection, CtaVariant, SectionCta } from '@/lib/types'
import { activeOnly } from '@/lib/content/active'
import { resolveSectionCta } from '@/lib/content/sectionCta'
import { resolveInternalScroll, internalScrollStyle, type InternalScrollInput } from '@/lib/content/internalScroll'
import SectionCtaBlock from '@/components/ui/SectionCtaBlock'
import ContentImage from '@/components/ui/ContentImage'

interface TeamProps {
  content: TeamSection
  asPageHeading?: boolean
  ctaVariant?: CtaVariant
  ctaOverride?: SectionCta
  /** Home embed: scroll member cards inside a capped panel. */
  internalScroll?: InternalScrollInput
}

export default function Team({
  content,
  asPageHeading = false,
  ctaVariant = 'default',
  ctaOverride,
  internalScroll,
}: TeamProps) {
  const members = activeOnly(content.members)
  const resolvedCta = resolveSectionCta(content, ctaVariant, ctaOverride)
  const TitleTag = asPageHeading ? 'h1' : 'h2'
  const scrollPanel = resolveInternalScroll(internalScroll)

  return (
    <div className="container-xxl py-5 team-section">
      <div className="container">
        {/* Section Header */}
        <div className="section-intro text-center mx-auto mb-5">
          <div className="d-inline-flex align-items-center rounded-pill bg-gradient-primary text-white py-2 px-4 mb-4">
            <i className="fas fa-users me-2"></i>
            <span className="fw-600 text-uppercase letter-spacing-1">{content.sectionTitle}</span>
          </div>
          <TitleTag className="display-5 mb-3 text-gradient-primary">{content.title}</TitleTag>
          <p className="lead text-muted">{content.description}</p>
        </div>

        <div
          className={scrollPanel ? 'section-internal-scroll' : undefined}
          style={internalScrollStyle(scrollPanel)}
        >
          <div className="row g-4">
            {members.map((profile) => (
              <div key={profile.id} className="col-xl-3 col-lg-4 col-md-6">
                <div className="modern-team-card position-relative hover-lift">
                  {/* Profile Image */}
                  <div className="team-image-container position-relative overflow-hidden">
                    {profile.picture ? (
                      <ContentImage
                        className="img-fluid team-profile-img"
                        src={profile.picture}
                        alt={`Photo of ${profile.fullName}, ${profile.roleString} at Nabarun`}
                        width={300}
                        height={300}
                        loading="lazy"
                      />
                    ) : (
                      <div
                        className="team-profile-img d-flex align-items-center justify-content-center bg-light text-muted"
                        style={{ minHeight: '280px' }}
                        aria-hidden="true"
                      >
                        <i className="fas fa-user fa-3x"></i>
                      </div>
                    )}
                    <div className="team-overlay d-flex align-items-center justify-content-center">
                      <div className="social-links-modern d-flex gap-2">
                        {profile.socialLinks?.facebook && (
                          <a href={profile.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="social-btn social-facebook" aria-label={`${profile.fullName} on Facebook`}>
                            <i className="fab fa-facebook-f"></i>
                          </a>
                        )}
                        {profile.socialLinks?.twitter && (
                          <a href={profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="social-btn social-twitter" aria-label={`${profile.fullName} on Twitter`}>
                            <i className="fab fa-twitter"></i>
                          </a>
                        )}
                        {profile.socialLinks?.linkedin && (
                          <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="social-btn social-linkedin" aria-label={`${profile.fullName} on LinkedIn`}>
                            <i className="fab fa-linkedin-in"></i>
                          </a>
                        )}
                        {profile.socialLinks?.instagram && (
                          <a href={profile.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="social-btn social-instagram" aria-label={`${profile.fullName} on Instagram`}>
                            <i className="fab fa-instagram"></i>
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="team-status-badge">
                      <i className="fas fa-heart text-danger pulse-animation"></i>
                    </div>
                  </div>

                  {/* Profile Info */}
                  <div className="team-info text-center">
                    <div className="member-details">
                      <h3 className="h5 member-name mb-2">{profile.fullName}</h3>
                      <div className="member-role mb-3">
                        <span className="role-badge m-1">{profile.roleString}</span>
                      </div>
                      <p className="member-bio text-muted mb-3">{profile.bio}</p>
                    </div>

                    <div className="member-actions">
                      <a className="btn btn-outline-primary btn-sm contact-member-btn" href={'mailto:' + profile.email}>
                        <i className="fas fa-envelope me-2"></i>
                        <span>{content.member.contact}</span>
                      </a>
                    </div>
                  </div>

                  <div className="team-card-decoration"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="row mt-5">
          <div className="col-12">
            <SectionCtaBlock
              cta={
                resolvedCta
                  ? {
                      ...resolvedCta,
                      buttons: resolvedCta.buttons.map((b) => ({ ...b })),
                    }
                  : null
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
}
