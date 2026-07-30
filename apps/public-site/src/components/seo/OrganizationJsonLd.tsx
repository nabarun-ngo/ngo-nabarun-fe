import { getSiteConstants, ORGANIZATION_ID, SITE_URL } from '@/lib/site'
import { toAbsoluteImageUrl } from '@/lib/media'
import type { OrganizationMetadata, SiteMetadata } from '@/lib/types'

interface OrganizationJsonLdProps {
  site: SiteMetadata
  organization: OrganizationMetadata
}

export default function OrganizationJsonLd({ site, organization }: OrganizationJsonLdProps) {
  const { SITE_NAME, SITE_DESCRIPTION, SITE_AREA_SERVED } = getSiteConstants(site)
  const logo = toAbsoluteImageUrl(organization.logo ?? site.openGraph.image, SITE_URL)
  const sameAs = (organization.sameAs ?? []).filter(Boolean)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NGO',
    '@id': ORGANIZATION_ID,
    name: SITE_NAME,
    alternateName: organization.alternateNames,
    url: SITE_URL,
    logo,
    image: logo,
    description: SITE_DESCRIPTION,
    email: organization.email,
    telephone: organization.telephone,
    ...(organization.foundingDate ? { foundingDate: organization.foundingDate } : {}),
    ...(organization.registrationNumber
      ? { identifier: organization.registrationNumber }
      : {}),
    address: {
      '@type': 'PostalAddress',
      streetAddress: organization.address.streetAddress,
      addressLocality: organization.address.addressLocality,
      addressRegion: organization.address.addressRegion,
      addressCountry: organization.address.addressCountry,
    },
    areaServed: {
      '@type': 'AdministrativeArea',
      name: SITE_AREA_SERVED,
    },
    knowsAbout: organization.knowsAbout,
    ...(sameAs.length > 0 ? { sameAs } : {}),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
