import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import PageBannerShell from '@/components/layout/PageBannerShell'
import { fetchStaticContent, buildPageBanner } from '@/lib/config/content'
import { PolicyItem } from '@/lib/types'
import { buildPageMetadataFromSeo } from '@/lib/site'

export async function generateStaticParams() {
  const content = await fetchStaticContent()
  return Object.keys(content.layout.pages.policies).map((page) => ({ page }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ page: string }>
}): Promise<Metadata> {
  const { page } = await params
  const content = await fetchStaticContent()
  const seo = content.metadata.pages.policies[page]
  const policyData = content.layout.pages.policies[page]

  if (!seo || !policyData) {
    return { title: `${content.metadata.site.shortBrand} - Page Not Found` }
  }

  return buildPageMetadataFromSeo(seo, content.metadata.site)
}

export default async function PolicyPage({
  params,
}: {
  params: Promise<{ page: string }>
}) {
  const { page } = await params
  const content = await fetchStaticContent()
  const policyData = content.layout.pages.policies[page]

  if (!policyData || typeof policyData === 'string') {
    notFound()
  }

  const policy = policyData as PolicyItem
  const banner = buildPageBanner(content, `policies.${page}`)

  return (
    <PageBannerShell
      homeLabel={banner.homeLabel}
      title={banner.title}
      trail={banner.trail}
    >
      <section className="container-xxl py-5">
        <div className="container">
          <div className="section-intro section-intro--wide text-center mx-auto mb-4">
            <h2 className="h4 mb-4">{policy.description}</h2>
          </div>

          <div className="text-center mb-4 mx-auto">
            <div className="alert alert-info" role="alert">
              Document might take some time to load. If it doesn&apos;t load, please click
              <a href={policy.url} target="_blank" rel="noopener noreferrer" className="alert-link">
                {' '}
                here{' '}
              </a>
              to view it directly.
            </div>
          </div>

          <iframe
            style={{ width: '100%', height: '80vh', border: 'none', borderRadius: '8px' }}
            src={policy.url}
            title={policy.title}
            loading="lazy"
          />
        </div>
      </section>
    </PageBannerShell>
  )
}
