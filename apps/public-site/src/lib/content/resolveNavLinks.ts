import type { NavLinkItem, NavbarSection } from '@/lib/types'

/**
 * Nav link URL resolution: each link must have an `id`.
 * Internal URLs may use {{metadata.pages...path}} refs; site values use {{vars.key}}.
 * Env key is prefixed with NAV_ to avoid colliding with OS vars (e.g. HOME, PATH).
 * Example: `login` → NAV_LOGIN, `privacy-policy` → NAV_PRIVACY_POLICY.
 * Uses process.env[envKey] when set; otherwise falls back to the resolved JSON `url`.
 */
export function navIdToEnvKey(id: string): string {
  return `NAV_${id.replace(/-/g, '_').toUpperCase()}`
}

export function resolveNavLinkUrl(id: string, fallbackUrl: string): string {
  const envUrl = process.env[navIdToEnvKey(id)]?.trim()
  return envUrl || fallbackUrl
}

export function resolveNavLink(link: NavLinkItem): NavLinkItem {
  if (!link.id) {
    throw new Error('Nav link must have an id')
  }
  return {
    ...link,
    url: resolveNavLinkUrl(link.id, link.url ?? ''),
  }
}

export function resolveNavbarNavLinks(navLinks: NavLinkItem[]): NavLinkItem[] {
  return navLinks.map(resolveNavLink)
}

export function resolveNavbarSection(navbar: NavbarSection): NavbarSection {
  return {
    ...navbar,
    navLinks: resolveNavbarNavLinks(navbar.navLinks),
  }
}
