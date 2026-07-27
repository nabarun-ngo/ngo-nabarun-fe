import type { FormProvider } from '@/lib/types'

interface ExternalFormEmbedProps {
  type: Exclude<FormProvider, 'custom'>
  embedUrl: string
  /** Accessible iframe title. */
  title: string
  /** CSS height for the iframe; defaults to 1200px. */
  height?: string
}

/** Ensures a provider embed URL is in an embeddable form (e.g. Google Forms `embedded=true`). */
export function normalizeEmbedUrl(type: Exclude<FormProvider, 'custom'>, url: string): string {
  if (type !== 'google') return url

  try {
    const parsed = new URL(url)
    if (!parsed.searchParams.has('embedded')) {
      parsed.searchParams.set('embedded', 'true')
    }
    return parsed.toString()
  } catch {
    return url
  }
}

/** Renders an external Google/Microsoft form as a responsive iframe embed. */
export default function ExternalFormEmbed({
  type,
  embedUrl,
  title,
  height = '1200px',
}: ExternalFormEmbedProps) {
  const src = normalizeEmbedUrl(type, embedUrl)

  return (
    <div className="external-form-embed">
      <iframe
        src={src}
        title={title}
        loading="lazy"
        sandbox="allow-scripts allow-forms allow-same-origin allow-popups"
        style={{ width: '100%', height, border: 0 }}
      >
        Loading…
      </iframe>
    </div>
  )
}
