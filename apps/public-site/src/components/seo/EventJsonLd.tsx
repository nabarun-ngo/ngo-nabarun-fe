import { getSiteConstants, SITE_URL } from '@/lib/site'
import { toAbsoluteImageUrl } from '@/lib/media'
import type { EventItem, SiteMetadata } from '@/lib/types'

interface EventJsonLdProps {
  events: EventItem[]
  site: SiteMetadata
}

/** Event structured data for the /events listing. */
export default function EventJsonLd({ events, site }: EventJsonLdProps) {
  const { SITE_NAME, OG_IMAGE } = getSiteConstants(site)

  const jsonLd = events.map((event) => ({
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: event.description,
    startDate: event.date,
    endDate: event.endDate ?? event.date,
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    image: event.image ? toAbsoluteImageUrl(event.image, SITE_URL) : OG_IMAGE,
    location: {
      '@type': 'Place',
      name: event.location,
      address: event.location,
    },
    organizer: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
  }))

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
