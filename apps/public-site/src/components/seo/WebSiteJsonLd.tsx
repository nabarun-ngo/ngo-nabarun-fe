import { getSiteConstants, ORGANIZATION_ID, SITE_URL, WEBSITE_ID } from '@/lib/site'
import type { SiteMetadata } from '@/lib/types'

interface WebSiteJsonLdProps {
  site: SiteMetadata
}

/**
 * WebSite schema. Google resolves the search-result site name from `name` here
 * first, so it carries the display name and defers the legal name to
 * `alternateName`.
 */
export default function WebSiteJsonLd({ site }: WebSiteJsonLdProps) {
  const { SITE_NAME, SITE_SEARCH_NAME, SITE_BRAND } = getSiteConstants(site)

  const alternateName = [SITE_NAME, site.alternateName, SITE_BRAND]
    .filter((value): value is string => Boolean(value) && value !== SITE_SEARCH_NAME)
    .filter((value, index, all) => all.indexOf(value) === index)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: SITE_SEARCH_NAME,
    ...(alternateName.length > 0 ? { alternateName } : {}),
    url: `${site.openGraph.url || SITE_URL}/`.replace(/\/+$/, '/'),
    publisher: { '@id': ORGANIZATION_ID },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
