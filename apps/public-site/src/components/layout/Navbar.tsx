'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { BasicInfo, NavLinkItem, NavbarSection } from '@/lib/types'
import { enabledOnly } from '@/lib/content/enabled'
import { mailtoHref, mapsHref, socialNetworkName, telHref } from '@/lib/contact'
import ContentImage from '@/components/ui/ContentImage'
import { useSiteHeaderOffset } from '@/hooks/useSiteHeaderOffset'

interface NavbarProps {
  content: NavbarSection
  basicInfo: BasicInfo
  siteBrand: string
}

function Brand({ brand, siteBrand }: { brand: NavbarSection['brand']; siteBrand: string }) {
  const title = siteBrand.toUpperCase()
  const meta =
    brand.established && brand.registrationNumber
      ? `Est. ${brand.established} · Reg. No. ${brand.registrationNumber}`
      : brand.established
        ? `Est. ${brand.established}`
        : brand.registrationNumber
          ? `Reg. No. ${brand.registrationNumber}`
          : null

  return (
    <a
      href="/"
      className="navbar-brand ms-3 ms-lg-0"
      aria-label={meta ? `${title} — ${brand.name} — ${meta}` : `${title} — ${brand.name}`}
    >
      <ContentImage src={brand.logo} className="navbar-brand-logo" alt={`${title} logo`} />
      <span className="navbar-brand-text">
        <span className="navbar-brand-title">{title}</span>
        <span className="navbar-brand-subtitle">{brand.name}</span>
        {/* Shown below lg (nav links are collapsed, so there is room) and again
            at xl. Hidden in the 992–1199px band, where the subtitle is dropped
            too so the inline nav links have space. */}
        {meta && (
          <span className="navbar-brand-meta d-block d-lg-none d-xl-block">{meta}</span>
        )}
      </span>
    </a>
  )
}

function partitionNavLinks(navLinks: NavLinkItem[]) {
  const active = enabledOnly(navLinks)
  const childrenByParent = new Map<string, NavLinkItem[]>()

  for (const link of active) {
    if (!link.parent) continue
    const siblings = childrenByParent.get(link.parent) ?? []
    siblings.push(link)
    childrenByParent.set(link.parent, siblings)
  }

  // Children render inside their parent, so only roots are placed directly.
  const roots = active.filter((link) => !link.parent)
  const mainLinks = roots.filter((link) => !link.endCta && !link.inMore)
  const endCtaLinks = roots.filter((link) => link.endCta)
  const moreLinks = active.filter((link) => link.inMore)
  const moreRoots = moreLinks.filter((link) => !link.parent)

  return { mainLinks, endCtaLinks, moreRoots, childrenByParent, moreLinks }
}

function NavAnchor({
  link,
  className,
  onClick,
}: {
  link: Pick<NavLinkItem, 'label' | 'url' | 'external'>
  className: string
  onClick?: () => void
}) {
  return (
    <a
      href={link.url}
      target={link.external ? '_blank' : '_self'}
      rel={link.external ? 'noopener noreferrer' : undefined}
      className={className}
      onClick={onClick}
    >
      {link.label}
    </a>
  )
}

export default function Navbar({ content, basicInfo, siteBrand }: NavbarProps) {
  useSiteHeaderOffset()
  const [menuOpen, setMenuOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [openNavGroup, setOpenNavGroup] = useState<string | null>(null)

  const { mainLinks, endCtaLinks, moreRoots, childrenByParent, moreLinks } = useMemo(
    () => partitionNavLinks(content.navLinks),
    [content.navLinks]
  )

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      moreRoots
        .filter((root) => (childrenByParent.get(root.id)?.length ?? 0) > 0)
        .map((root) => [root.id, true])
    )
  )

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 992px)')
    const closeMobilePanels = () => {
      if (mq.matches) {
        setMenuOpen(false)
        setMoreOpen(false)
        setOpenNavGroup(null)
      }
    }

    closeMobilePanels()
    mq.addEventListener('change', closeMobilePanels)
    return () => mq.removeEventListener('change', closeMobilePanels)
  }, [])

  const closeNavPanels = useCallback(() => {
    setMenuOpen(false)
    setMoreOpen(false)
    setOpenNavGroup(null)
  }, [])

  const toggleMenu = useCallback(() => {
    setMenuOpen((open) => !open)
  }, [])

  const toggleMore = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    setMoreOpen((open) => !open)
  }, [])

  const toggleNavGroup = useCallback((groupId: string, e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    setOpenNavGroup((open) => (open === groupId ? null : groupId))
  }, [])

  const toggleGroup = useCallback((groupId: string, e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setOpenGroups((open) => ({ ...open, [groupId]: !open[groupId] }))
  }, [])

  const hasMoreMenu = moreLinks.length > 0
  const primaryEndCta = endCtaLinks[0]
  const followUsLabel = basicInfo.followUs

  return (
    <div className="container-fluid fixed-top px-0" id="navbar">
      <div className="top-bar text-white-50 row gx-0 align-items-center d-none d-lg-flex">
        <div className="col-lg-8 px-5 text-start">
          {basicInfo.location && (
            <small>
              <a
                className="top-bar-link"
                href={mapsHref(basicInfo.location)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${basicInfo.location} on Google Maps`}
              >
                <i className="fa fa-map-marker-alt me-2"></i>
                {basicInfo.location}
              </a>
            </small>
          )}
          {basicInfo.email && (
            <small className="ms-4">
              <a className="top-bar-link" href={mailtoHref(basicInfo.email)}>
                <i className="fa fa-envelope me-2"></i>
                {basicInfo.email}
              </a>
            </small>
          )}
          {basicInfo.phone && (
            <small className="ms-4">
              <a className="top-bar-link" href={telHref(basicInfo.phone)}>
                <i className="fa fa-phone-alt me-2"></i>
                {basicInfo.phone}
              </a>
            </small>
          )}
        </div>
        <div className="col-lg-4 px-5 text-end">
          {followUsLabel && <small>{followUsLabel}</small>}
          {enabledOnly(basicInfo.followLinks).map((follow, idx) => (
            <a
              key={idx}
              className="text-white ms-2"
              href={follow.url}
              target="_blank"
              rel="me noopener noreferrer"
              aria-label={`${siteBrand} on ${socialNetworkName(follow.url)}`}
            >
              <i className={follow.icon}></i>
            </a>
          ))}
        </div>
      </div>

      <nav className="navbar navbar-expand-lg navbar-dark site-navbar py-lg-0 px-lg-4 px-xl-5">
        <Brand brand={content.brand} siteBrand={siteBrand} />

        <button
          type="button"
          className={`navbar-toggler me-3${menuOpen ? '' : ' collapsed'}`}
          aria-controls="navbarCollapse"
          aria-expanded={menuOpen}
          aria-label="Toggle navigation"
          onClick={toggleMenu}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse${menuOpen ? ' show' : ''}`} id="navbarCollapse">
          <ul className="navbar-nav ms-auto align-items-lg-center py-3 py-lg-0">
            {mainLinks.map((link) => {
              const children = childrenByParent.get(link.id) ?? []

              if (children.length === 0) {
                return (
                  <li key={link.id} className="nav-item">
                    <NavAnchor
                      link={link}
                      className="nav-link"
                      onClick={closeNavPanels}
                    />
                  </li>
                )
              }

              const isOpen = openNavGroup === link.id
              return (
                <li key={link.id} className={`nav-item dropdown${isOpen ? ' show' : ''}`}>
                  <a
                    className="nav-link dropdown-toggle"
                    href="#"
                    role="button"
                    aria-expanded={isOpen}
                    onClick={(e) => toggleNavGroup(link.id, e)}
                  >
                    {link.label}
                  </a>
                  {/* Always in the DOM: desktop reveals it on hover via CSS, and the
                      child links stay crawlable. `show` only drives the mobile panel. */}
                  <ul className={`dropdown-menu m-0${isOpen ? ' show' : ''}`}>
                    {children.map((child) => (
                      <li key={child.id}>
                        <NavAnchor
                          link={child}
                          className="dropdown-item"
                          onClick={closeNavPanels}
                        />
                      </li>
                    ))}
                  </ul>
                </li>
              )
            })}
            {endCtaLinks.map((link) => (
              <li key={link.id} className="nav-item d-lg-none">
                <NavAnchor
                  link={link}
                  className="nav-link"
                  onClick={closeNavPanels}
                />
              </li>
            ))}

            {hasMoreMenu && (
              <li className={`nav-item dropdown${moreOpen ? ' show' : ''}`}>
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  role="button"
                  aria-expanded={moreOpen}
                  onClick={toggleMore}
                >
                  {content.moreLabel}
                </a>
                <ul className={`dropdown-menu dropdown-menu-end m-0${moreOpen ? ' show' : ''}`}>
                  {moreRoots.map((root) => {
                    const children = childrenByParent.get(root.id) ?? []
                    const isGroup = children.length > 0
                    const isOpen = openGroups[root.id] ?? false

                    if (isGroup) {
                      return (
                        <li key={root.id} className="dropdown-tree-group">
                          <button
                            type="button"
                            className="dropdown-item dropdown-tree-toggle"
                            aria-expanded={isOpen}
                            aria-controls={`navbar-${root.id}-tree`}
                            onClick={(e) => toggleGroup(root.id, e)}
                          >
                            <span>{root.label}</span>
                            <i
                              className={`fas fa-chevron-down dropdown-tree-chevron${isOpen ? ' is-open' : ''}`}
                              aria-hidden="true"
                            />
                          </button>
                          {isOpen && (
                            <ul
                              id={`navbar-${root.id}-tree`}
                              className="dropdown-tree-children list-unstyled mb-0"
                            >
                              {children.map((child) => (
                                <li key={child.id}>
                                  <NavAnchor
                                    link={child}
                                    className="dropdown-item dropdown-tree-child"
                                    onClick={closeNavPanels}
                                  />
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      )
                    }

                    if (!root.url) return null

                    return (
                      <li key={root.id}>
                        <NavAnchor
                          link={root}
                          className="dropdown-item"
                          onClick={closeNavPanels}
                        />
                      </li>
                    )
                  })}
                </ul>
              </li>
            )}
          </ul>

          {primaryEndCta && (
            <div className="d-none d-lg-flex flex-shrink-0 ps-lg-2 pb-lg-0 pb-3">
              <a
                className="btn btn-outline-primary navbar-donate-btn"
                href={primaryEndCta.url}
                target={primaryEndCta.external ? '_blank' : '_self'}
                rel={primaryEndCta.external ? 'noopener noreferrer' : undefined}
              >
                <span>{primaryEndCta.label}</span>
                <span className="navbar-donate-icon" aria-hidden="true">
                  <i className="fa fa-arrow-right"></i>
                </span>
              </a>
            </div>
          )}
        </div>
      </nav>
    </div>
  )
}
