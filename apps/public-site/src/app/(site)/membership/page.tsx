import type { Metadata } from 'next'
import PageBannerShell from '@/components/layout/PageBannerShell'
import Join from '@/components/sections/Join'
import FormBlock from '@/components/forms/FormBlock'
import { fetchStaticContent, buildPageBanner } from '@/lib/config/content'
import { buildPageMetadataFromContent } from '@/lib/site'

export async function generateMetadata(): Promise<Metadata> {
  const content = await fetchStaticContent()
  return buildPageMetadataFromContent('membership', content)
}

export default async function MembershipPage() {
  const content = await fetchStaticContent()
  const banner = buildPageBanner(content, 'membership')
  const membership = content.layout.pages.membership

  return (
    <PageBannerShell
      homeLabel={banner.homeLabel}
      title={banner.title}
      trail={banner.trail}
    >
      <Join
        content={membership}
        form={<FormBlock form={membership.form} hideHeading />}
      />
    </PageBannerShell>
  )
}
