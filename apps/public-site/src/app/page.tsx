import type { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Carousel2 from '@/components/sections/Carousel2'
import About from '@/components/sections/About'
import Services from '@/components/sections/Services'
import Donate from '@/components/sections/Donate'
import Team from '@/components/sections/Team'
import Join from '@/components/sections/Join'
import Contact from '@/components/sections/Contact'
import FormBlock from '@/components/forms/FormBlock'
import { fetchStaticContent } from '@/lib/config/content'
import { getCarousel, getHeroStats, getProjects, getTeam } from '@/lib/api/content.server'
import { buildPageMetadataFromContent, getSiteConstants } from '@/lib/site'

export async function generateMetadata(): Promise<Metadata> {
  const content = await fetchStaticContent()
  return buildPageMetadataFromContent('home', content)
}

export default async function Home() {
  const content = await fetchStaticContent()
  const { layout } = content
  const { common, pages } = layout
  const sections = pages.home.sections
  const site = content.metadata.site
  const { SITE_SEARCH_NAME: searchName } = getSiteConstants(site)

  const [carousel, projects, team, heroStats] = await Promise.all([
    getCarousel(),
    getProjects(),
    getTeam(),
    getHeroStats(),
  ])

  const projectsContent = { ...pages.projects, serviceItems: projects }
  const teamContent = { ...pages.team, members: team }

  return (
    <>
      <Navbar content={common.navbar} basicInfo={common.org} siteBrand={content.metadata.site.brand} />
      <main>
        <h1 className="visually-hidden">
          {searchName} — {site.name}, {site.location}
        </h1>

        <Carousel2 items={carousel} />
        {sections.about?.enabled !== false && (
          <About
            content={pages.about}
            heroStats={heroStats}
            showDetail={sections.about?.mode === 'full'}
            teaserOnly={sections.about?.mode === 'teaser'}
            ctaVariant={sections.about?.mode === 'teaser' ? 'teaser' : 'default'}
            ctaOverride={sections.about?.cta}
          />
        )}
        {sections.projects?.enabled !== false && (
          <Services
            content={projectsContent}
            ctaOverride={sections.projects?.cta}
            internalScroll={sections.projects?.internalScroll}
          />
        )}
        {sections.donate?.enabled !== false && (
          <Donate
            content={pages.donate}
            teaserOnly={sections.donate?.mode === 'teaser'}
            ctaOverride={sections.donate?.cta}
          />
        )}
        {sections.team?.enabled !== false && (
          <Team
            content={teamContent}
            ctaOverride={sections.team?.cta}
            internalScroll={sections.team?.internalScroll}
          />
        )}
        {sections.membership?.enabled !== false && (
          <Join
            content={pages.membership}
            teaserOnly={sections.membership?.mode === 'teaser'}
            form={
              sections.membership?.mode !== 'teaser' ? (
                <FormBlock form={pages.membership.form} hideHeading />
              ) : undefined
            }
            ctaOverride={sections.membership?.cta}
          />
        )}
        {sections.contact?.enabled !== false && (
          <Contact
            content={pages.contact}
            teaserOnly={sections.contact?.mode === 'teaser'}
            form={
              sections.contact?.mode !== 'teaser' ? (
                <FormBlock form={pages.contact.form} hideHeading />
              ) : undefined
            }
            ctaOverride={sections.contact?.cta}
          />
        )}
      </main>

      <Footer content={common.footer} basicInfo={common.org} />
    </>
  )
}
