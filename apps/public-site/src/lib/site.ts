import type { Metadata } from 'next'
import type { ContentData, PageSeo, SiteMetadata } from '@/lib/types'
import { toAbsoluteImageUrl } from '@/lib/media'

const SITE_URL_ENV = process.env.NEXT_PUBLIC_SITE_URL
if (!SITE_URL_ENV) {
  throw new Error(
    'Missing required environment variable: NEXT_PUBLIC_SITE_URL. Set it in .env (see .env.example).'
  )
}

export const SITE_URL = SITE_URL_ENV.replace(/\/$/, '')
export const IS_NOINDEX = process.env.NEXT_PUBLIC_NOINDEX === 'true'

/** Stable JSON-LD node ids so WebSite and Organization can reference each other. */
export const WEBSITE_ID = `${SITE_URL}/#website`
export const ORGANIZATION_ID = `${SITE_URL}/#organization`

/** Intrinsic size of `public/img/logo.*` (kept in sync by scripts/generate-icons.mjs). */
const LOGO_DIMENSIONS = { width: 1305, height: 877 }

export function getSiteConstants(site: SiteMetadata) {
  return {
    SITE_NAME: site.name,
    SITE_SEARCH_NAME: site.searchName ?? site.alternateName ?? site.brand,
    SITE_BRAND: site.brand,
    SITE_SHORT_BRAND: site.shortBrand,
    SITE_TITLE: site.title,
    SITE_DESCRIPTION: site.description,
    SITE_KEYWORDS: site.keywords,
    SITE_LOCATION: site.location,
    SITE_AREA_SERVED: site.areaServed,
    OG_IMAGE: toAbsoluteImageUrl(site.openGraph.image, SITE_URL),
  }
}

export function buildPageMetadata({
  page,
  description,
  path,
  keywords,
  noindex,
  ogImage: ogImageOverride,
  ogImageAlt,
  site,
}: {
  page: string
  description: string
  path: string
  keywords?: string
  noindex?: boolean
  ogImage?: string
  ogImageAlt?: string
  site?: SiteMetadata
}): Metadata {
  const shortBrand = site?.shortBrand ?? 'Nabarun NGO'
  const siteName = site?.name ?? 'Ichapur Nabarun Social Welfare Society'
  const defaultKeywords = site?.keywords
  const defaultOgImage = site
    ? toAbsoluteImageUrl(site.openGraph.image, SITE_URL)
    : `${SITE_URL}/img/logo.png`
  const ogImage = ogImageOverride
    ? toAbsoluteImageUrl(ogImageOverride, SITE_URL)
    : defaultOgImage
  const isLogoImage = /\/logo\.(png|jpe?g|webp|svg)$/i.test(ogImage)

  const canonicalPath = path.startsWith('/') ? path : `/${path}`
  // Google already prints the legal name as the site name above the home page
  // result, so the title carries the searchable brand instead of repeating it.
  const fullTitle =
    canonicalPath === '/' ? (site?.title ?? siteName) : `${shortBrand} - ${page}`
  const isNoIndex = noindex ?? IS_NOINDEX

  return {
    title: fullTitle,
    description,
    keywords: keywords ?? defaultKeywords,
    alternates: {
      canonical: canonicalPath,
    },
    robots: isNoIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      title: fullTitle,
      description,
      url: `${SITE_URL}${canonicalPath}`,
      siteName,
      images: [
        {
          url: ogImage,
          width: isLogoImage ? LOGO_DIMENSIONS.width : 1200,
          height: isLogoImage ? LOGO_DIMENSIONS.height : 630,
          alt: ogImageAlt ?? (isLogoImage ? `${siteName} logo` : `${siteName} — ${page}`),
        },
      ],
      locale: site?.locale ?? 'en_IN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [ogImage],
    },
  }
}

export function buildPageMetadataFromSeo(
  seo: PageSeo,
  site: SiteMetadata,
  overrides?: { ogImage?: string; ogImageAlt?: string }
): Metadata {
  return buildPageMetadata({
    page: seo.title,
    description: seo.description,
    path: seo.path,
    keywords: seo.keywords,
    noindex: seo.noindex,
    ogImage: overrides?.ogImage ?? seo.ogImage,
    ogImageAlt: overrides?.ogImageAlt,
    site,
  })
}

export function buildPageMetadataFromContent(
  pageKey: keyof ContentData['metadata']['pages'],
  content: ContentData,
  overrides?: { ogImage?: string; ogImageAlt?: string }
): Metadata {
  const seo = content.metadata.pages[pageKey] as PageSeo
  return buildPageMetadataFromSeo(seo, content.metadata.site, overrides)
}

/** Shared root layout metadata (no page title/robots — set per route). */
export function getRootLayoutMetadata(): Metadata {
  const verificationId = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim()
  return {
    metadataBase: new URL(SITE_URL),
    ...(verificationId
      ? { verification: { google: verificationId } }
      : {}),
  }
}

export function getDefaultMetadata(site: SiteMetadata): Metadata {
  const home = { title: 'Home', description: site.description, path: '/' }
  return {
    ...getRootLayoutMetadata(),
    ...buildPageMetadata({
      page: home.title,
      description: home.description,
      path: home.path,
      site,
    }),
  }
}

export function getNotFoundMetadata(site: SiteMetadata): Metadata {
  const shortBrand = site.shortBrand
  return {
    title: `${shortBrand} - Page Not Found`,
    robots: { index: false, follow: false },
  }
}
