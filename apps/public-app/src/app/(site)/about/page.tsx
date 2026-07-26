import type { Metadata } from 'next'
import About from '@/components/sections/About'
import PageBannerShell from '@/components/layout/PageBannerShell'
import { fetchStaticContent, buildPageBanner } from '@/lib/config/content'
import { buildPageMetadataFromContent } from '@/lib/site'

export async function generateMetadata(): Promise<Metadata> {
  const content = await fetchStaticContent()
  return buildPageMetadataFromContent('about', content)
}

export default async function AboutPage() {
  const content = await fetchStaticContent()
  const about = content.layout.pages.about
  const banner = buildPageBanner(content, 'about')

  return (
    <PageBannerShell
      homeLabel={banner.homeLabel}
      title={banner.title}
      trail={banner.trail}
    >
      <About content={about} showDetail ctaVariant="page" />
    </PageBannerShell>
  )
}
