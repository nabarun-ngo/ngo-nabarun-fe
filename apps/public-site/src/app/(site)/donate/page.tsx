import type { Metadata } from 'next'
import PageBannerShell from '@/components/layout/PageBannerShell'
import Donate from '@/components/sections/Donate'
import { fetchStaticContent, buildPageBanner } from '@/lib/config/content'
import { buildPageMetadataFromContent } from '@/lib/site'

export async function generateMetadata(): Promise<Metadata> {
  const content = await fetchStaticContent()
  return buildPageMetadataFromContent('donate', content)
}

export default async function DonatePage() {
  const content = await fetchStaticContent()
  const banner = buildPageBanner(content, 'donate')

  return (
    <PageBannerShell
      homeLabel={banner.homeLabel}
      title={banner.title}
      trail={banner.trail}
    >
      <Donate content={content.layout.pages.donate} showGatewayCta />
    </PageBannerShell>
  )
}
