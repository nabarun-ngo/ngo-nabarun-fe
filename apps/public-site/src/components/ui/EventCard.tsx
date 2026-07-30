import ContentImage from '@/components/ui/ContentImage'
import { eventDateTimeAttr, formatEventDateRange } from '@/lib/content/events'
import type { EventItem } from '@/lib/types'

interface EventCardProps {
  event: EventItem
  cta: { href: string; label: string }
  /** h2 on the events listing; h3 when nested under a project's own heading. */
  headingLevel?: 'h2' | 'h3'
  /** Redundant on a project page, where every event belongs to that project. */
  showProjectName?: boolean
}

export default function EventCard({
  event,
  cta,
  headingLevel: Heading = 'h2',
  showProjectName = true,
}: EventCardProps) {
  return (
    <article className="bg-light rounded-4 p-4 h-100 hover-lift">
      {event.image && (
        <ContentImage
          src={event.image}
          alt=""
          width={640}
          height={360}
          className="img-fluid rounded-3 mb-3 w-100"
          style={{ aspectRatio: '16 / 9', objectFit: 'cover' }}
          loading="lazy"
        />
      )}
      <div className="d-flex align-items-center text-primary mb-3">
        <i className="fas fa-calendar-day me-2" aria-hidden="true"></i>
        <time dateTime={eventDateTimeAttr(event)}>{formatEventDateRange(event)}</time>
      </div>
      <Heading className="h4 mb-2">{event.title}</Heading>
      {showProjectName && event.projectName && (
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
  )
}
