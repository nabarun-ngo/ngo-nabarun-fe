import type { MetadataRoute } from 'next'
import { buildContentSitemap } from '@/lib/content/sitemap'

export const dynamic = 'force-static'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return buildContentSitemap()
}
