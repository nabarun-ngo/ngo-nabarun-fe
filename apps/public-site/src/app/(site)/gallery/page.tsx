import type { Metadata } from 'next'
import PageBannerShell from '@/components/layout/PageBannerShell'
import SectionHeading from '@/components/ui/SectionHeading'
import ContentImage from '@/components/ui/ContentImage'
import { fetchStaticContent, buildPageBanner } from '@/lib/config/content'
import { getGallery } from '@/lib/api/content.server'
import { buildPageMetadataFromContent } from '@/lib/site'

export async function generateMetadata(): Promise<Metadata> {
  const content = await fetchStaticContent()
  const items = await getGallery()
  const firstImage = items[0]?.image
  return buildPageMetadataFromContent('gallery', content, firstImage
    ? { ogImage: firstImage, ogImageAlt: `${items[0].title} — Nabarun NGO gallery` }
    : undefined)
}

export default async function GalleryPage() {
  const content = await fetchStaticContent()
  const gallery = content.layout.pages.gallery
  const items = await getGallery()
  const banner = buildPageBanner(content, 'gallery')

  return (
    <PageBannerShell
      homeLabel={banner.homeLabel}
      title={banner.title}
      trail={banner.trail}
    >
      <section className="container-xxl py-5">
        <div className="container">
          <SectionHeading
            eyebrow={gallery.sectionTitle}
            eyebrowIcon="fas fa-images"
            title={gallery.title}
            description={gallery.description}
          />

          <div className="row g-4">
            {items.map((item) => (
              <div key={item.id} className="col-lg-3 col-md-4 col-sm-6">
                <figure className="gallery-item position-relative overflow-hidden rounded-4 shadow-sm m-0 hover-lift">
                  <ContentImage
                    src={item.image}
                    alt={item.title}
                    className="img-fluid w-100"
                    width={400}
                    height={300}
                    loading="lazy"
                    style={{ objectFit: 'cover', height: '240px' }}
                  />
                  <figcaption className="p-3">
                    <span className="fw-semibold d-block">{item.title}</span>
                    {item.category && <small className="text-muted">{item.category}</small>}
                  </figcaption>
                </figure>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageBannerShell>
  )
}
