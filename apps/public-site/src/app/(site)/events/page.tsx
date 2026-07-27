import type { Metadata } from 'next'
import PageBannerShell from '@/components/layout/PageBannerShell'
import EventJsonLd from '@/components/seo/EventJsonLd'
import SectionHeading from '@/components/ui/SectionHeading'
import ContentImage from '@/components/ui/ContentImage'
import { fetchStaticContent, buildPageBanner } from '@/lib/config/content'
import { getEvents } from '@/lib/api/content.server'
import { buildPageMetadataFromContent } from '@/lib/site'
import type { EventItem, LearnMoreButton } from '@/lib/types'

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

function formatDate(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatEventDateRange(event: EventItem): string {
  if (event.endDate && event.endDate !== event.date) {
    return `${formatDate(event.date)} – ${formatDate(event.endDate)}`
  }
  return formatDate(event.date)
}

function eventDateTimeAttr(event: EventItem): string {
  if (event.endDate && event.endDate !== event.date) {
    return `${event.date}/${event.endDate}`
  }
  return event.date
}

function resolveEventCta(
  event: EventItem,
  contactFallback: LearnMoreButton
): { href: string; label: string } {
  if (event.registrationUrl) {
    return { href: event.registrationUrl, label: 'Register' }
  }
  return { href: contactFallback.url, label: contactFallback.label }
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
              {events.map((event) => {
                const cta = resolveEventCta(event, contactFallback)
                return (
                  <div key={event.id} className="col-lg-6">
                    <article className="bg-light rounded-4 p-4 h-100 hover-lift">
                      {event.image && (
                        <ContentImage
                          src={event.image}
                          alt=""
                          width={640}
                          height={360}
                          className="img-fluid rounded-3 mb-3 w-100"
                          loading="lazy"
                        />
                      )}
                      <div className="d-flex align-items-center text-primary mb-3">
                        <i className="fas fa-calendar-day me-2" aria-hidden="true"></i>
                        <time dateTime={eventDateTimeAttr(event)}>{formatEventDateRange(event)}</time>
                      </div>
                      <h2 className="h4 mb-2">{event.title}</h2>
                      {event.projectName && (
                        <p className="small text-muted mb-2">
                          <i className="fas fa-hands-helping me-1" aria-hidden="true"></i>
                          {event.projectName}
                        </p>
                      )}
                      <p className="text-muted mb-3">{event.description}</p>
                      <p className="mb-0">
                        <i className="fas fa-map-marker-alt text-accent me-2" aria-hidden="true"></i>
                        {event.location}
                      </p>
                      <a className="btn btn-outline-primary mt-3" href={cta.href}>
                        {cta.label} <i className="fas fa-arrow-right ms-2" aria-hidden="true"></i>
                      </a>
                    </article>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </PageBannerShell>
  )
}
