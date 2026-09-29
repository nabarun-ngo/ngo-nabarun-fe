import type { EventItem, LearnMoreButton } from '@/lib/types'

/** Noon avoids the date shifting a day when the ISO date is parsed as UTC. */
function formatDate(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatEventDateRange(event: EventItem): string {
  if (event.endDate && event.endDate !== event.date) {
    return `${formatDate(event.date)} – ${formatDate(event.endDate)}`
  }
  return formatDate(event.date)
}

export function eventDateTimeAttr(event: EventItem): string {
  if (event.endDate && event.endDate !== event.date) {
    return `${event.date}/${event.endDate}`
  }
  return event.date
}

export function resolveEventCta(
  event: EventItem,
  contactFallback: LearnMoreButton
): { href: string; label: string } {
  if (event.registrationUrl) {
    return { href: event.registrationUrl, label: 'Register' }
  }
  return { href: contactFallback.url, label: contactFallback.label }
}
