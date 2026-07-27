import type { Metadata } from 'next'
import PageBannerShell from '@/components/layout/PageBannerShell'
import Team from '@/components/sections/Team'
import { fetchStaticContent, buildPageBanner } from '@/lib/config/content'
import { getTeam } from '@/lib/api/content.server'
import { buildPageMetadataFromContent } from '@/lib/site'

export async function generateMetadata(): Promise<Metadata> {
  const content = await fetchStaticContent()
  return buildPageMetadataFromContent('team', content)
}

export default async function TeamPage() {
  const content = await fetchStaticContent()
  const team = await getTeam()
  const banner = buildPageBanner(content, 'team')

  return (
    <PageBannerShell
      homeLabel={banner.homeLabel}
      title={banner.title}
      trail={banner.trail}
    >
      <Team content={{ ...content.layout.pages.team, members: team }} />
    </PageBannerShell>
  )
}
