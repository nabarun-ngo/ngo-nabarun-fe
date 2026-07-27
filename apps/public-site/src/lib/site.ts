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

export function getSiteConstants(site: SiteMetadata) {
  return {
    SITE_NAME: site.name,
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
  const shortBrand = site?.shortBrand ?? 'INWS (NabarunNGO)'
  const siteName = site?.name ?? 'Ichapur Nabarun Welfare Society'
  const defaultKeywords = site?.keywords
  const defaultOgImage = site
    ? toAbsoluteImageUrl(site.openGraph.image, SITE_URL)
    : `${SITE_URL}/img/logo.png`
  const ogImage = ogImageOverride
    ? toAbsoluteImageUrl(ogImageOverride, SITE_URL)
    : defaultOgImage
  const isLogoImage = ogImage.includes('/logo.png')

  const canonicalPath = path.startsWith('/') ? path : `/${path}`
  const fullTitle = `${shortBrand} - ${page}`
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
          width: isLogoImage ? 547 : 1200,
          height: isLogoImage ? 547 : 630,
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

export const SITE_SHORT_BRAND = 'INWS (NabarunNGO)'
export const SITE_TITLE =
  'Nabarun NGO | Ichapur Nabarun Welfare Society - Empowering Communities'
export const SITE_DESCRIPTION =
  'Nabarun (Ichapur Nabarun Welfare Society) is an NGO in West Bengal founded in 2018. NGO Nabarun serves Ichapur, Barrackpore and nearby communities through education, healthcare, disaster relief, and welfare programs.'
export const SITE_KEYWORDS =
  'Nabarun, NGO Nabarun, Nabarun NGO, Ichapur Nabarun Welfare Society, Nabarun welfare society, Nabarun Ichapur, Nabarun Barrackpore, Nabarun West Bengal, Nabarun charity'
export const SITE_LOCATION = 'Ichapur, Barrackpore, West Bengal, India'
export const SITE_AREA_SERVED = 'Ichapur, Barrackpore, North 24 Parganas, West Bengal'
export const OG_IMAGE = `${SITE_URL}/img/logo.png`
