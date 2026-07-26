import type { Metadata } from 'next'
import NotFoundContent from '@/components/layout/NotFoundContent'
import { fetchStaticContent } from '@/lib/config/content'
import { getNotFoundMetadata } from '@/lib/site'

export async function generateMetadata(): Promise<Metadata> {
  const content = await fetchStaticContent()
  return getNotFoundMetadata(content.metadata.site)
}

export default function NotFound() {
  return <NotFoundContent />
}
