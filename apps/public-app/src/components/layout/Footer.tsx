'use client'

import { useState } from 'react'
import { BasicInfo, FooterSection } from '@/lib/types'
import { enabledOnly } from '@/lib/content/enabled'
import { useRecaptcha } from '@/hooks/useRecaptcha'
import { useNotification } from '@/hooks/useCommonUI'
import { subscribeNewsletter } from '@/lib/api/submit'
import { newsletterSchema } from '@/lib/validation'

interface FooterProps {
  content: FooterSection
  basicInfo: BasicInfo
}

export default function Footer({ content, basicInfo }: FooterProps) {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { execute } = useRecaptcha()
  const { showNotification } = useNotification()

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = newsletterSchema.safeParse({ email })
    if (!parsed.success) {
      showNotification(parsed.error.issues[0]?.message ?? 'Invalid email', 'error')
      return
    }
    setSubmitting(true)
    try {
      const token = await execute('newsletter')
      const result = await subscribeNewsletter(email, token)
      showNotification(result.message || `${content.newsletter.title} — subscribed!`, 'success')
      setEmail('')
    } catch {
      showNotification('Subscription failed. Please try again.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <footer className="modern-footer mt-5">
      <div className="footer-main">
        <div className="container py-5">
          <div className="row g-5">
            {/* Brand Section */}
            <div className="col-lg-5 col-md-6">
              <div className="footer-brand">
                <div className="brand-logo mb-4">
                  <img
                    src="/img/logo.png"
                    alt={`${content.brand.name} Logo`}
                    className="footer-logo"
                    width={60}
                    height={60}
                    loading="lazy"
                  />
                  <span className="brand-text">{content.brand.name}</span>
                </div>
                <p className="footer-description mb-4">{content.brand.description}</p>

                {/* Social Media Links */}
                <div className="social-links">
                  <h2 className="h6 text-white mb-3">{content.social.title}</h2>
                  <div className="social-icons">
                    {enabledOnly(basicInfo.followLinks).map((follow, idx) => (
                      <a
                        key={idx}
                        className="social-icon"
                        href={follow.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Follow us on social media"
                      >
                        <i className={follow.icon}></i>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="col-lg-3 col-md-6">
              <div className="footer-section">
                <h2 className="h5 footer-heading mb-4">{content.quickLinks.title}</h2>
                <ul className="footer-links">
                  {enabledOnly(content.quickLinks.links).map((link, idx) => (
                    <li key={idx}>
                      <a href={link.url}>
                        <i className="fas fa-chevron-right me-2"></i>
                        <span>{link.label}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="col-lg-4 col-md-6">
              <div className="footer-section">
                <h2 className="h5 footer-heading mb-4">{content.getInTouch.title}</h2>

                {/* Contact Information */}
                <div className="contact-info mb-4">
                  <div className="contact-item d-flex align-items-start mb-3">
                    <div className="contact-icon me-3">
                      <i className="fas fa-map-marker-alt"></i>
                    </div>
                    <div className="contact-text">
                      <span>{basicInfo.location}</span>
                    </div>
                  </div>

                  {basicInfo.phone && (
                    <div className="contact-item d-flex align-items-start mb-3">
                      <div className="contact-icon me-3">
                        <i className="fas fa-phone-alt"></i>
                      </div>
                      <div className="contact-text">
                        <a href={`tel:${basicInfo.phone}`}>{basicInfo.phone}</a>
                      </div>
                    </div>
                  )}

                  <div className="contact-item d-flex align-items-start">
                    <div className="contact-icon me-3">
                      <i className="fas fa-envelope"></i>
                    </div>
                    <div className="contact-text">
                      <a href={`mailto:${basicInfo.email}`}>{basicInfo.email}</a>
                    </div>
                  </div>
                </div>

                {/* Newsletter */}
                <div className="newsletter-section">
                  <h2 className="h6 text-white mb-3">{content.newsletter.title}</h2>
                  <p className="newsletter-text mb-3">{content.newsletter.description}</p>
                  <form className="newsletter-form" onSubmit={handleNewsletter}>
                    <label htmlFor="newsletter-email" className="visually-hidden">
                      {content.newsletter.placeholder}
                    </label>
                    <div className="input-group">
                      <input
                        id="newsletter-email"
                        type="email"
                        className="form-control newsletter-input"
                        placeholder={content.newsletter.placeholder}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                      />
                      <button
                        className="btn btn-primary newsletter-btn"
                        type="submit"
                        disabled={submitting}
                      >
                        {submitting ? '...' : content.newsletter.button}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6">
              <div className="copyright-text">
                <p className="mb-0" dangerouslySetInnerHTML={{ __html: content.bottom.copyright }} />
              </div>
            </div>
            <div className="col-md-6">
              <div className="footer-legal text-md-end">
                {enabledOnly(content.bottom.legal).map((link, idx) => (
                  <a key={idx} href={link.url} className="legal-link me-3">
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
