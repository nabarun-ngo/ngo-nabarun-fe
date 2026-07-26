import type { Metadata } from 'next'
import PageBannerShell from '@/components/layout/PageBannerShell'
import Contact from '@/components/sections/Contact'
import FormBlock from '@/components/forms/FormBlock'
import { fetchStaticContent, buildPageBanner } from '@/lib/config/content'
import { buildPageMetadataFromContent } from '@/lib/site'

export async function generateMetadata(): Promise<Metadata> {
  const content = await fetchStaticContent()
  return buildPageMetadataFromContent('contact', content)
}

export default async function ContactPage() {
  const content = await fetchStaticContent()
  const banner = buildPageBanner(content, 'contact')
  const contact = content.layout.pages.contact

  return (
    <PageBannerShell
      homeLabel={banner.homeLabel}
      title={banner.title}
      trail={banner.trail}
    >
      <Contact
        content={contact}
        form={<FormBlock form={contact.form} hideHeading />}
      />
    </PageBannerShell>
  )
}
