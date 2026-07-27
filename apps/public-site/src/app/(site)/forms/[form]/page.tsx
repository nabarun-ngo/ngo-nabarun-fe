import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import PageBannerShell from '@/components/layout/PageBannerShell'
import FormBlock from '@/components/forms/FormBlock'
import { fetchStaticContent, buildPageBanner } from '@/lib/config/content'
import type { FormPageItem } from '@/lib/types'
import { buildPageMetadataFromSeo } from '@/lib/site'

export async function generateStaticParams() {
  const content = await fetchStaticContent()
  return Object.keys(content.layout.pages.forms ?? {}).map((form) => ({ form }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ form: string }>
}): Promise<Metadata> {
  const { form } = await params
  const content = await fetchStaticContent()
  const seo = content.metadata.pages.forms[form]
  const formData = content.layout.pages.forms?.[form]

  if (!seo || !formData) {
    return { title: `${content.metadata.site.shortBrand} - Page Not Found` }
  }

  return buildPageMetadataFromSeo(seo, content.metadata.site)
}

export default async function FormPage({
  params,
}: {
  params: Promise<{ form: string }>
}) {
  const { form } = await params
  const content = await fetchStaticContent()
  const formData = content.layout.pages.forms?.[form]

  if (!formData) {
    notFound()
  }

  const page = formData as FormPageItem
  const banner = buildPageBanner(content, `forms.${form}`)

  return (
    <PageBannerShell
      homeLabel={banner.homeLabel}
      title={banner.title}
      trail={banner.trail}
    >
      <section className="container-xxl py-5">
        <div className="container">
          <div className="section-intro section-intro--wide text-center mx-auto mb-4">
            <h1 className="display-6 mb-3">{page.title}</h1>
            <p className="text-muted mb-0">{page.description}</p>
          </div>

          <div className="row justify-content-center mt-5">
            <div className="col-lg-8">
              <FormBlock
                form={{
                  type: page.type,
                  formId: page.formId,
                  recaptchaAction: page.recaptchaAction,
                  submitLabel: page.submitLabel,
                  embedUrl: page.embedUrl,
                  embedTitle: page.embedTitle,
                  embedHeight: page.embedHeight,
                }}
                title={page.title}
                hideHeading
              />
            </div>
          </div>
        </div>
      </section>
    </PageBannerShell>
  )
}
