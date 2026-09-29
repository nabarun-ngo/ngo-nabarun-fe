'use client'

import { DonateSection, CtaVariant, SectionCta } from '@/lib/types'
import ContentImage from '@/components/ui/ContentImage'
import { enabledOnly } from '@/lib/content/enabled'
import { shouldShowGatewayCta } from '@/lib/content/gateway'
import { resolveSectionCta } from '@/lib/content/sectionCta'
import SectionCtaBlock from '@/components/ui/SectionCtaBlock'

interface DonateProps {
  content: DonateSection
  teaserOnly?: boolean
  asPageHeading?: boolean
  /** Show direct payment-gateway CTA (donate page only). */
  showGatewayCta?: boolean
  ctaVariant?: CtaVariant
  ctaOverride?: SectionCta
}

export default function Donate({
  content,
  teaserOnly = false,
  asPageHeading = false,
  showGatewayCta = false,
  ctaVariant = 'default',
  ctaOverride,
}: DonateProps) {
  const TitleTag = asPageHeading ? 'h1' : 'h2'
  const pm = content.paymentMethods
  const gateway = content.gatewayCta
  const resolvedCta = resolveSectionCta(content, teaserOnly ? 'teaser' : ctaVariant, ctaOverride)
  const impactStats = enabledOnly(content.impact.stats)
  const trustIndicators = enabledOnly(content.trust.indicators)
  const bankAccounts = enabledOnly(pm.bank)
  const upiMethods = enabledOnly(pm.upi)
  const afterDonationSteps = enabledOnly(pm.afterDonation.steps)
  const showGateway = shouldShowGatewayCta(showGatewayCta, gateway)

  const gatewayButton = showGateway ? (
    <a
      className="btn btn-primary btn-lg"
      href={gateway.url}
      target={gateway.external !== false ? '_blank' : undefined}
      rel={gateway.external !== false ? 'noopener noreferrer' : undefined}
    >
      {gateway.icon && <i className={`${gateway.icon} me-2`} aria-hidden="true"></i>}
      <span>{gateway.label}</span>
    </a>
  ) : null

  return (
    <div className="donation-section my-5 py-5 scroll-margin" id="donate">
      <div className="container">
        <div className="section-intro text-center mx-auto mb-5">
          <div className="d-inline-block rounded-pill bg-gradient-accent text-white py-2 px-4 mb-3">
            <i className="fas fa-donate me-2"></i><span>{content.sectionTitle}</span>
          </div>
          <TitleTag className="display-5 mb-4 text-dark">{content.title}</TitleTag>
          <p className="lead text-muted">{content.description}</p>
        </div>

        <div className="row g-5 align-items-stretch">
          <div className={teaserOnly ? 'col-12' : 'col-lg-6'}>
            <div className="donation-info-card h-100">
              <div className="impact-header mb-4">
                <h3 className="text-white mb-3">{content.impact.title}</h3>
                <p className="text-white-75 mb-4">{content.impact.description}</p>
              </div>

              <div className="row g-3 mb-4">
                {impactStats.map((stat, idx) => (
                  <div key={idx} className="col-md-6">
                    <div className="impact-stat-card">
                      <div className="stat-icon">
                        <i className="fas fa-graduation-cap"></i>
                      </div>
                      <div className="stat-content">
                        <p className="h3 text-white">{stat.amount}</p>
                        <p className="text-white-75 mb-0">{stat.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="trust-indicators">
                {trustIndicators.map((indicator, idx) => (
                  <div key={idx} className="trust-item d-flex align-items-center mb-3">
                    <div className="trust-icon me-3">
                      <i className="fas fa-shield-alt text-accent"></i>
                    </div>
                    <div>
                      <h4 className="h6 text-white mb-1">{indicator.title}</h4>
                      <p className="text-white-75 mb-0">{indicator.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {teaserOnly && (
                <div className="mt-4">
                  <SectionCtaBlock cta={resolvedCta} />
                </div>
              )}
            </div>
          </div>

          {!teaserOnly && pm && (
            <div className="col-lg-6">
              <div className="donation-form-card h-100">
                <div className="form-header mb-4">
                  <h3 className="text-dark mb-2">{pm.title}</h3>
                  <p className="text-muted">{pm.description}</p>
                  {gatewayButton && <div className="mt-3">{gatewayButton}</div>}
                </div>

                {bankAccounts.map((account, idx) => (
                  <div key={idx} className="mb-4 p-4 bg-light rounded-3">
                    <h4 className="h6 text-primary mb-3">{account.label}</h4>
                    <dl className="row mb-0 small">
                      <dt className="col-sm-4">Account Name</dt>
                      <dd className="col-sm-8">{account.accountName}</dd>
                      <dt className="col-sm-4">Bank</dt>
                      <dd className="col-sm-8">{account.bankName}</dd>
                      <dt className="col-sm-4">Account No.</dt>
                      <dd className="col-sm-8 font-monospace">{account.accountNumber}</dd>
                      <dt className="col-sm-4">IFSC</dt>
                      <dd className="col-sm-8 font-monospace">{account.ifsc}</dd>
                      <dt className="col-sm-4">Branch</dt>
                      <dd className="col-sm-8">{account.branch}</dd>
                    </dl>
                  </div>
                ))}

                {upiMethods.map((upi, idx) => (
                  <div key={idx} className="mb-4 p-4 bg-light rounded-3">
                    <h4 className="h6 text-primary mb-2">{upi.label}</h4>
                    <p className="font-monospace mb-2">{upi.id}</p>
                    {upi.note && <p className="text-muted small mb-0">{upi.note}</p>}
                    {upi.qrImage && (
                      <ContentImage
                        src={upi.qrImage}
                        alt="UPI QR code"
                        className="img-fluid mt-3"
                        style={{ maxWidth: 200 }}
                      />
                    )}
                  </div>
                ))}

                {pm.afterDonation && (
                  <div className="mt-3">
                    <h4 className="h6 text-dark mb-2">{pm.afterDonation.title}</h4>
                    <ol className="text-muted small ps-3 mb-0">
                      {afterDonationSteps.map((step, i) => (
                        <li key={i} className="mb-1">{step.text}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
