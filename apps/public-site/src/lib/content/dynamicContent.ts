import type {
  DynamicProject,
  LearnMoreButton,
  ServiceItem,
} from '@/lib/types'
import { projectDetailPath, toSlug } from '@/lib/content/slug'

/** Client-side impact count display (e.g. 200+). */
export function formatImpactCount(count: number): string {
  if (!Number.isFinite(count) || count <= 0) {
    return '0'
  }
  return `${count}+`
}

export function mapDynamicProjectToServiceItem(
  project: DynamicProject,
  learnMore: LearnMoreButton,
  projectsBasePath: string
): ServiceItem {
  const slug = toSlug(project.title)
  const metadata = project.metadata ?? {}
  const icon = metadata.icon ?? 'fas fa-hands-helping'
  const impactTitle = metadata.impactTitle ?? project.title
  const impactLabel = metadata.impactLabel ?? 'Beneficiaries'

  const features = (project.goals ?? [])
    .filter((goal) => goal.active !== false)
    .map((goal) => ({
      text: goal.name,
      enabled: true as const,
    }))

  return {
    icon,
    title: project.title,
    description: project.description,
    enabled: true,
    slug,
    features,
    button: {
      label: learnMore.label,
      url: projectDetailPath(projectsBasePath, slug),
    },
    overlay: {
      title: impactTitle,
      stat: {
        value: formatImpactCount(project.beneficiaryCount),
        label: impactLabel,
      },
    },
    image: metadata.image,
  }
}

export function mapDynamicProjectsToServiceItems(
  projects: DynamicProject[] | undefined,
  learnMore: LearnMoreButton,
  projectsBasePath: string
): ServiceItem[] {
  return (projects ?? []).map((project) =>
    mapDynamicProjectToServiceItem(project, learnMore, projectsBasePath)
  )
}
