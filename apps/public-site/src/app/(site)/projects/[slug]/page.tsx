import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import PageBannerShell from '@/components/layout/PageBannerShell'
import EventJsonLd from '@/components/seo/EventJsonLd'
import ContentImage from '@/components/ui/ContentImage'
import EventCard from '@/components/ui/EventCard'
import SectionHeading from '@/components/ui/SectionHeading'
import { fetchStaticContent, buildPageBanner } from '@/lib/config/content'
import { getProjectBySlug, getProjectDetails } from '@/lib/api/content.server'
import { activeOnly } from '@/lib/content/active'
import { formatImpactCount } from '@/lib/content/dynamicContent'
import { resolveEventCta } from '@/lib/content/events'
import { projectDetailPath } from '@/lib/content/slug'
import { buildPageMetadata, getNotFoundMetadata } from '@/lib/site'

export async function generateStaticParams() {
  const projects = await getProjectDetails()
  return projects.map((project) => ({ slug: project.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const [content, project] = await Promise.all([fetchStaticContent(), getProjectBySlug(slug)])
  const site = content.metadata.site

  if (!project) {
    return getNotFoundMetadata(site)
  }

  const projectsSeo = content.metadata.pages.projects
  return buildPageMetadata({
    page: project.title,
    description: project.description,
    path: projectDetailPath(projectsSeo.path, slug),
    keywords: projectsSeo.keywords,
    noindex: projectsSeo.noindex,
    ogImage: project.metadata?.image ?? projectsSeo.ogImage,
    ogImageAlt: `${project.title} — ${site.shortBrand}`,
    site,
  })
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [content, project] = await Promise.all([fetchStaticContent(), getProjectBySlug(slug)])

  if (!project) {
    notFound()
  }

  const projectsPage = content.layout.pages.projects
  const projectsSeo = content.metadata.pages.projects
  const labels = projectsPage.detail ?? {}
  const banner = buildPageBanner(content, {
    parentPageKey: 'projects',
    currentLabel: project.title,
    currentPath: projectDetailPath(projectsSeo.path, slug),
  })

  const goals = activeOnly(project.goals)
  const image = project.metadata?.image
  const icon = project.metadata?.icon ?? 'fas fa-hands-helping'
  const impactLabel = project.metadata?.impactLabel ?? 'Beneficiaries'

  return (
    <PageBannerShell homeLabel={banner.homeLabel} title={banner.title} trail={banner.trail}>
      {project.events.length > 0 && (
        <EventJsonLd events={project.events} site={content.metadata.site} />
      )}

      <section className="container-xxl py-5">
        <div className="container">
          <div className="row g-5 align-items-center">
            {image && (
              <div className="col-lg-6">
                {/* Source images range from 0.88 to 2.13 aspect, so the box is fixed. */}
                <ContentImage
                  src={image}
                  alt={`${project.title} — ${content.metadata.site.shortBrand}`}
                  width={720}
                  height={540}
                  className="img-fluid rounded-4 shadow-lg w-100"
                  style={{ aspectRatio: '4 / 3', objectFit: 'cover' }}
                />
              </div>
            )}
            <div className={image ? 'col-lg-6' : 'col-12'}>
              <div className="d-inline-block rounded-pill bg-gradient-primary text-white py-2 px-4 mb-3">
                <i className={`${icon} me-2`} aria-hidden="true"></i>
                <span>{projectsPage.sectionTitle}</span>
              </div>
              <h2 className="display-6 mb-4">{project.title}</h2>
              <p className="lead text-muted">{project.description}</p>

              <div className="bg-light rounded-4 p-4 mt-4">
                <p className="text-muted text-uppercase small mb-2">
                  {labels.impactTitle ?? project.metadata?.impactTitle ?? 'Impact So Far'}
                </p>
                <p className="h2 text-primary mb-1">
                  {formatImpactCount(project.beneficiaryCount)}
                </p>
                <p className="text-muted mb-0">{impactLabel}</p>
              </div>
            </div>
          </div>

          {goals.length > 0 && (
            <div className="row justify-content-center mt-5 pt-4">
              <div className="col-lg-10">
                <h2 className="h3 mb-4">{labels.goalsTitle ?? 'What We Focus On'}</h2>
                <div className="row g-4">
                  {goals.map((goal) => (
                    <div className="col-md-6" key={goal.name}>
                      <div className="h-100 bg-light rounded-4 p-4">
                        <h3 className="h6 text-primary mb-2">
                          <i className="fas fa-check-circle me-2" aria-hidden="true"></i>
                          {goal.name}
                        </h3>
                        {goal.description && (
                          <p className="text-muted mb-0">{goal.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="container-xxl pb-5">
        <div className="container">
          <SectionHeading
            eyebrow={labels.eventsTitle ?? 'Events'}
            eyebrowIcon="fas fa-calendar-alt"
            title={`${project.title} Events`}
            description={labels.eventsDescription}
          />

          {project.events.length === 0 ? (
            <p className="text-center text-muted">
              {labels.eventsEmptyMessage ??
                'No events scheduled for this project right now. Please check back soon.'}
            </p>
          ) : (
            <div className="row g-4">
              {project.events.map((event) => (
                <div key={event.id} className="col-lg-6">
                  <EventCard
                    event={event}
                    cta={resolveEventCta(event, projectsPage.learnMoreButton)}
                    headingLevel="h3"
                    showProjectName={false}
                  />
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-5">
            <a className="btn btn-outline-primary" href={projectsSeo.path}>
              <i className="fas fa-arrow-left me-2" aria-hidden="true"></i>
              {labels.backLabel ?? 'View All Projects'}
            </a>
          </div>
        </div>
      </section>
    </PageBannerShell>
  )
}
