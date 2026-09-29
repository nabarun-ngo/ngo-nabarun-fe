import 'server-only'
import type { MetadataRoute } from 'next'
import { fetchStaticContent } from '@/lib/config/content'
import { getProjectDetails } from '@/lib/api/content.server'
import { projectDetailPath } from '@/lib/content/slug'
import { SITE_URL } from '@/lib/site'
import type { PageSeo } from '@/lib/types'

const DEFAULT_SITEMAP = {
  priority: 0.7,
  changeFrequency: 'monthly' as const,
}

/** Build-time date used when a page has no explicit sitemap lastmod. */
const BUILD_LAST_MOD = new Date()

type SitemapChangeFrequency = NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>

function toChangeFrequency(value: string | undefined): SitemapChangeFrequency {
  const allowed: SitemapChangeFrequency[] = [
    'always',
    'hourly',
    'daily',
    'weekly',
    'monthly',
    'yearly',
    'never',
  ]
  if (value && allowed.includes(value as SitemapChangeFrequency)) {
    return value as SitemapChangeFrequency
  }
  return DEFAULT_SITEMAP.changeFrequency
}

function getLastModified(seo: PageSeo): Date {
  const lastmod = seo.sitemap?.lastmod
  if (lastmod) {
    const parsed = new Date(lastmod)
    if (!Number.isNaN(parsed.getTime())) return parsed
  }
  return BUILD_LAST_MOD
}

function getSitemapMeta(seo: PageSeo) {
  return {
    priority: seo.sitemap?.priority ?? DEFAULT_SITEMAP.priority,
    changeFrequency: toChangeFrequency(seo.sitemap?.changefreq),
    lastModified: getLastModified(seo),
  }
}

function absoluteUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${SITE_URL}${normalized}`
}

function pushSeoEntry(entries: MetadataRoute.Sitemap, seo: PageSeo) {
  if (seo.noindex) return
  const meta = getSitemapMeta(seo)
  entries.push({
    url: absoluteUrl(seo.path),
    ...meta,
  })
}

/** Build sitemap entries from static content (API or mock JSON). */
export async function buildContentSitemap(): Promise<MetadataRoute.Sitemap> {
  const content = await fetchStaticContent()
  const entries: MetadataRoute.Sitemap = []
  const { pages } = content.metadata

  for (const [key, seo] of Object.entries(pages)) {
    if (key === 'policies' || key === 'forms') continue

    const pageSeo = seo as PageSeo
    if (pageSeo.noindex) continue

    const meta = getSitemapMeta(pageSeo)
    entries.push({
      url: absoluteUrl(pageSeo.path),
      ...meta,
    })
  }

  for (const seo of Object.values(pages.policies ?? {})) {
    pushSeoEntry(entries, seo)
  }

  for (const seo of Object.values(pages.forms ?? {})) {
    pushSeoEntry(entries, seo)
  }

  // Project detail pages are generated from the API, so they have no static SEO entry.
  if (!pages.projects.noindex) {
    const projectsMeta = getSitemapMeta(pages.projects)
    for (const project of await getProjectDetails()) {
      entries.push({
        url: absoluteUrl(projectDetailPath(pages.projects.path, project.slug)),
        ...projectsMeta,
      })
    }
  }

  return entries
}
