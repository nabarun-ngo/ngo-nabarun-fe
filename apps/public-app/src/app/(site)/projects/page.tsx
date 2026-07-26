import type { Metadata } from 'next'
import PageBannerShell from '@/components/layout/PageBannerShell'
import Services from '@/components/sections/Services'
import { fetchStaticContent, buildPageBanner } from '@/lib/config/content'
import { getProjects } from '@/lib/api/content.server'
import { buildPageMetadataFromContent } from '@/lib/site'

export async function generateMetadata(): Promise<Metadata> {
  const content = await fetchStaticContent()
  return buildPageMetadataFromContent('projects', content)
}

export default async function ProjectsPage() {
  const content = await fetchStaticContent()
  const projects = await getProjects()
  const banner = buildPageBanner(content, 'projects')
  const servicesContent = { ...content.layout.pages.projects, serviceItems: projects }

  return (
    <PageBannerShell
      homeLabel={banner.homeLabel}
      title={banner.title}
      trail={banner.trail}
    >
      <Services content={servicesContent} ctaVariant="page" />
    </PageBannerShell>
  )
}
