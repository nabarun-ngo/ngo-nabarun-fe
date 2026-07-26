import { getSiteConstants, SITE_URL } from '@/lib/site'
import type { SiteMetadata } from '@/lib/types'

interface WebSiteJsonLdProps {
  site: SiteMetadata
}

/** WebSite schema (enables sitelinks search box eligibility). */
export default function WebSiteJsonLd({ site }: WebSiteJsonLdProps) {
  const { SITE_NAME } = getSiteConstants(site)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    ...(site.alternateName ? { alternateName: site.alternateName } : {}),
    url: site.openGraph.url || SITE_URL,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
