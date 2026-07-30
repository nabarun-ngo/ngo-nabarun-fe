import 'server-only'
import { cache } from 'react'
import { USE_MOCK_API } from '@/lib/config/env'
import { activeOnly } from '@/lib/content/active'
import { enabledOnly } from '@/lib/content/enabled'
import {
  formatImpactCount,
  mapDynamicProjectsToServiceItems,
} from '@/lib/content/dynamicContent'
import { resolveNavbarSection } from '@/lib/content/resolveNavLinks'
import { resolveVars } from '@/lib/content/resolveVars'
import { toSlug } from '@/lib/content/slug'
import type {
  CarouselItem,
  ContentData,
  DynamicContent,
  EventItem,
  GalleryItem,
  HeroStatsDisplay,
  ProjectDetail,
  ServiceItem,
  TeamMember,
} from '@/lib/types'
import type { FormDefinition } from '@nabarun-ngo/forms-core'
import { fromPublicFormDefinition } from '@nabarun-ngo/forms-core'
import contentsDynamic from '@/data/mock/contents-dynamic.json'
import contentStatic from '@/data/mock/content-static.json'
import formDefinitions from '@/data/mock/form-definitions.json'
import { apiGet } from './client'
import { CONTENTS_DYNAMIC, CONTENTS_STATIC, formDefinitionPath } from './paths'

function finalizeStaticContent(content: ContentData): ContentData {
  return {
    ...content,
    layout: {
      ...content.layout,
      common: {
        ...content.layout.common,
        navbar: resolveNavbarSection(content.layout.common.navbar),
      },
    },
  }
}

/**
 * Call hierarchy (per page render / build pass):
 *
 *   Pages & layouts
 *     └─ fetchStaticContent()     once (React cache)
 *     └─ fetchDynamicContent()    once when team/events needed (React cache)
 *     └─ fetchFormDefinition(id)  once per unique formId on that page (React cache)
 *
 *   Section helpers derive from cached fetches — no extra HTTP/mock I/O:
 *     getCarousel / getGallery / getHeroStatsLabels → fetchStaticContent (+ dynamic for stats values)
 *     getProjects / getTeam / getEvents             → fetchDynamicContent (+ static for learnMoreButton)
 */
async function loadStaticContent(): Promise<ContentData> {
  if (USE_MOCK_API) {
    const content = resolveVars(contentStatic as Record<string, unknown>) as unknown as ContentData
    return finalizeStaticContent(content)
  }

  const content = await apiGet<ContentData>(CONTENTS_STATIC)
  return finalizeStaticContent(content)
}

async function loadDynamicContent(): Promise<DynamicContent> {
  if (USE_MOCK_API) {
    return contentsDynamic as DynamicContent
  }

  return apiGet<DynamicContent>(CONTENTS_DYNAMIC)
}

async function loadFormDefinition(formId: string): Promise<FormDefinition> {
  if (USE_MOCK_API) {
    const definitions = formDefinitions as Record<string, unknown>
    const definition = definitions[formId]
    if (!definition) {
      throw new Error(`Unknown form definition: ${formId}`)
    }
    return fromPublicFormDefinition(definition)
  }

  return fromPublicFormDefinition(await apiGet<unknown>(formDefinitionPath(formId)))
}

/** GET /api/public-site/contents/static — deduped once per render pass. */
export const fetchStaticContent = cache(loadStaticContent)

/** GET /api/public-site/contents/dynamic — deduped once per render pass. */
export const fetchDynamicContent = cache(loadDynamicContent)

/** GET /api/public-site/contents/{formId}/form-defination — deduped per formId. */
export const fetchFormDefinition = cache(loadFormDefinition)
export async function getProjects(): Promise<ServiceItem[]> {
  const [content, dynamic] = await Promise.all([fetchStaticContent(), fetchDynamicContent()])
  const learnMore = content.layout.pages.projects.learnMoreButton
  return mapDynamicProjectsToServiceItems(
    dynamic.projects,
    learnMore,
    content.metadata.pages.projects.path
  )
}

/** Projects keyed by slug for the `/projects/{slug}/` routes, each with its own events. */
export async function getProjectDetails(): Promise<ProjectDetail[]> {
  const { projects } = await fetchDynamicContent()
  return (projects ?? []).map((project) => ({
    ...project,
    slug: toSlug(project.title),
    events: activeOnly(project.events),
  }))
}

export async function getProjectBySlug(slug: string): Promise<ProjectDetail | undefined> {
  const projects = await getProjectDetails()
  return projects.find((project) => project.slug === slug)
}

export async function getTeam(): Promise<TeamMember[]> {
  const { team } = await fetchDynamicContent()
  return activeOnly(team)
}

export async function getCarousel(): Promise<CarouselItem[]> {
  const content = await fetchStaticContent()
  return enabledOnly(content.layout.pages.home?.carousel)
}

export async function getEvents(): Promise<EventItem[]> {
  const { events } = await fetchDynamicContent()
  return activeOnly(events)
}

export async function getEventById(id: string): Promise<EventItem | undefined> {
  const events = await getEvents()
  return events.find((e) => e.id === id)
}

/** Hero impact stats from dynamic API; labels from static home.heroStats (About image overlay on home). */
export async function getHeroStats(): Promise<HeroStatsDisplay | null> {
  const [content, dynamic] = await Promise.all([fetchStaticContent(), fetchDynamicContent()])
  const labels = content.layout.pages.home.heroStats
  if (!labels) {
    return null
  }

  return {
    beneficiaryLabel: labels.beneficiaryLabel,
    projectLabel: labels.projectLabel,
    beneficiaryCount: formatImpactCount(dynamic.stats.beneficiaryCount),
    projectCount: formatImpactCount(dynamic.stats.projectCount),
  }
}

export async function getGallery(): Promise<GalleryItem[]> {
  const content = await fetchStaticContent()
  return enabledOnly(content.layout.pages.gallery.items)
}

/** Unique form IDs configured in static content (layout.pages.forms + page forms). */
export async function listFormIds(): Promise<string[]> {
  const content = await fetchStaticContent()
  const ids = new Set<string>()

  const contact = content.layout.pages.contact?.form?.formId
  const membership = content.layout.pages.membership?.form?.formId
  if (contact) ids.add(contact)
  if (membership) ids.add(membership)

  for (const page of Object.values(content.layout.pages.forms ?? {})) {
    if (page.formId) ids.add(page.formId)
  }

  return [...ids]
}
