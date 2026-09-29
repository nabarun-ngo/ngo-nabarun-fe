/** `tel:` URI — dialers reject the spaces and punctuation used for display. */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`
}

export function mailtoHref(email: string): string {
  return `mailto:${email.trim()}`
}

/** Google Maps link for a free-text address. */
export function mapsHref(location: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`
}

const SOCIAL_NETWORKS: Array<[RegExp, string]> = [
  [/facebook\.com|fb\.com/i, 'Facebook'],
  [/instagram\.com/i, 'Instagram'],
  [/youtube\.com|youtu\.be/i, 'YouTube'],
  [/twitter\.com|x\.com/i, 'X'],
  [/linkedin\.com/i, 'LinkedIn'],
  [/wa\.me|whatsapp\.com/i, 'WhatsApp'],
]

export function socialNetworkName(url: string): string {
  return SOCIAL_NETWORKS.find(([pattern]) => pattern.test(url))?.[1] ?? 'social media'
}
