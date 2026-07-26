import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { fetchStaticContent } from '@/lib/config/content'

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const content = await fetchStaticContent()
  const { layout } = content

  const { common } = layout

  return (
    <>
      <Navbar content={common.navbar} basicInfo={common.org} siteBrand={content.metadata.site.brand} />
      {children}
      <Footer content={common.footer} basicInfo={common.org} />
    </>
  )
}
