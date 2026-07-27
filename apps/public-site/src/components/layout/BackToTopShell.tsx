import BackToTop from '@/components/layout/BackToTop'
import { fetchStaticContent } from '@/lib/config/content'

export default async function BackToTopShell() {
  const content = await fetchStaticContent()
  return <BackToTop common={content.layout.common} />
}
