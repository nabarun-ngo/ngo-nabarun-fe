import type { Metadata } from 'next'
import PageBannerShell from '@/components/layout/PageBannerShell'
import EventJsonLd from '@/components/seo/EventJsonLd'
import SectionHeading from '@/components/ui/SectionHeading'
import EventCard from '@/components/ui/EventCard'
import { fetchStaticContent, buildPageBanner } from '@/lib/config/content'
import { getEvents } from '@/lib/api/content.server'
import { resolveEventCta } from '@/lib/content/events'
import { buildPageMetadataFromContent } from '@/lib/site'

export async function generateMetadata(): Promise<Metadata> {
  const content = await fetchStaticContent()
  const events = await getEvents()
  const featuredEvent = events.find((e) => e.image)
  return buildPageMetadataFromContent(
    'events',
    content,
    featuredEvent?.image
      ? {
          ogImage: featuredEvent.image,
          ogImageAlt: `${featuredEvent.title} — Nabarun NGO`,
        }
      : undefined
  )
}

export default async function EventsPage() {
  const content = await fetchStaticContent()
  const eventsPage = content.layout.pages.events
  const contactFallback = content.layout.pages.projects.learnMoreButton
  const events = await getEvents()
  const banner = buildPageBanner(content, 'events')

  return (
    <PageBannerShell
      homeLabel={banner.homeLabel}
      title={banner.title}
      trail={banner.trail}
    >
      <EventJsonLd events={events} site={content.metadata.site} />
      <section className="container-xxl py-5">
        <div className="container">
          <SectionHeading
            eyebrow={eventsPage.sectionTitle}
            eyebrowIcon={eventsPage.eyebrowIcon ?? 'fas fa-calendar-alt'}
            title={eventsPage.title}
            description={eventsPage.description}
          />

          {events.length === 0 ? (
            <p className="text-center text-muted">
              {eventsPage.emptyMessage ?? 'No upcoming events right now. Please check back soon.'}
            </p>
          ) : (
            <div className="row g-4">
              {events.map((event) => (
                <div key={event.id} className="col-lg-6">
                  <EventCard event={event} cta={resolveEventCta(event, contactFallback)} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </PageBannerShell>
  )
}
