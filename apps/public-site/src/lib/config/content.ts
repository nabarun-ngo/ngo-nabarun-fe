import 'server-only'
import { fetchStaticContent } from '@/lib/api/content.server'
import type { ContentData, PageSeo } from '@/lib/types'

export { fetchStaticContent, fetchDynamicContent, fetchFormDefinition } from '@/lib/api/content.server'

export type BreadcrumbTrailItem = {
  label: string
  href?: string
  path: string
}

export type PageBannerSpec =
  | string
  | {
      parentPageKey: string
      currentLabel: string
      currentPath: string
    }

export function resolvePageSeo(content: ContentData, pageKey: string): PageSeo | undefined {
  if (pageKey.startsWith('policies.')) {
    const slug = pageKey.slice('policies.'.length)
    return content.metadata.pages.policies[slug]
  }
  if (pageKey.startsWith('forms.')) {
    const slug = pageKey.slice('forms.'.length)
    return content.metadata.pages.forms[slug]
  }
  const pages = content.metadata.pages as Record<string, PageSeo | Record<string, PageSeo>>
  const entry = pages[pageKey]
  if (entry && 'path' in entry) {
    return entry as PageSeo
  }
  return undefined
}

/** Build page banner title and breadcrumb trail from metadata `pageName`. */
export function buildPageBanner(
  content: ContentData,
  spec: PageBannerSpec
): { title: string; trail: BreadcrumbTrailItem[]; homeLabel: string } {
  const homeLabel = content.layout.common.breadcrumb.home

  if (typeof spec === 'string') {
    const seo = resolvePageSeo(content, spec)
    if (!seo) {
      throw new Error(`Unknown page key: ${spec}`)
    }
    return {
      title: seo.pageName,
      trail: [{ label: seo.pageName, path: seo.path }],
      homeLabel,
    }
  }

  const parentSeo = resolvePageSeo(content, spec.parentPageKey)
  if (!parentSeo) {
    throw new Error(`Unknown parent page key: ${spec.parentPageKey}`)
  }

  return {
    title: spec.currentLabel,
    trail: [
      { label: parentSeo.pageName, href: parentSeo.path, path: parentSeo.path },
      { label: spec.currentLabel, path: spec.currentPath },
    ],
    homeLabel,
  }
}

export async function getPageSeo(
  pageKey: keyof ContentData['metadata']['pages'] | `policies.${string}`
): Promise<PageSeo | undefined> {
  const content = await fetchStaticContent()
  return resolvePageSeo(content, pageKey)
}
