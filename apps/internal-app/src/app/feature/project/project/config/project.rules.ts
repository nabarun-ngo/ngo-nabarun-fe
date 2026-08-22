import type { AuthorizationService } from '@nabarun-ngo/auth-angular';
import type { AppliedListFilter, ChipFilter, RefDataMap } from '@nabarun-ngo/list-dashboard-core';
import { SCOPE } from 'src/app/core/constant/auth-scope.const';
import type { KeyValue } from 'src/app/shared/models/key-value.model';
import type { ProjectListFilter } from '../data/project-data.source';
import type {
  Project,
  ProjectFilterCriteria,
  ProjectListContext,
  ProjectPrimaryChip,
  ProjectRefDataMap,
  ProjectStatus,
} from '../domain';
import { ProjectRefData } from '../domain';

export const PROJECT_DEFAULT_CHIP: ProjectPrimaryChip = 'all';

export const PROJECT_LIST_CHIPS: ChipFilter[] = [
  { id: 'all', label: 'All' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'completed', label: 'Completed' },
];

/**
 * `GET /projects` takes a single `status` value, so each chip maps to exactly one
 * status and one request. Every other status stays reachable from the filter sheet.
 */
const PROJECT_CHIP_STATUS: Partial<Record<ProjectPrimaryChip, ProjectStatus>> = {
  in_progress: 'ACTIVE',
  completed: 'COMPLETED',
};

export function isProjectPrimaryChip(chip: string): chip is ProjectPrimaryChip {
  return PROJECT_LIST_CHIPS.some(item => item.id === chip);
}

export function normalizeProjectChip(value?: string | null): ProjectPrimaryChip {
  return value && isProjectPrimaryChip(value) ? value : PROJECT_DEFAULT_CHIP;
}

export function projectStatusForChip(chip: ProjectPrimaryChip): ProjectStatus | undefined {
  return PROJECT_CHIP_STATUS[chip];
}

export function createProjectContext(options: {
  refData: ProjectRefDataMap;
}): ProjectListContext {
  return {
    refData: options.refData,
    userOptions: [],
  };
}

export function cloneProjectCriteria(criteria: ProjectFilterCriteria): ProjectFilterCriteria {
  return {
    ...criteria,
    tags: criteria.tags ? [...criteria.tags] : undefined,
  };
}

export function getDefaultCriteriaForChip(_chip: ProjectPrimaryChip): ProjectFilterCriteria {
  return {};
}

/** The chip status wins over a sheet status so the two never contradict each other. */
export function resolveProjectStatus(
  chip: ProjectPrimaryChip,
  criteria?: ProjectFilterCriteria,
): ProjectStatus | undefined {
  return projectStatusForChip(chip) ?? criteria?.status;
}

export function buildProjectApiFilter(
  chip: ProjectPrimaryChip,
  criteria: ProjectFilterCriteria = {},
): ProjectListFilter {
  return {
    status: resolveProjectStatus(chip, criteria),
    category: criteria.category,
    phase: criteria.phase,
    managerId: criteria.managerId || undefined,
    sponsorId: criteria.sponsorId || undefined,
    location: criteria.location || undefined,
    tags: criteria.tags?.length ? criteria.tags : undefined,
    isPublic: criteria.isPublic,
  };
}

/** `GET /projects` has no text query, so name and code search is applied client-side. */
export function matchesProjectSearch(project: Project, searchText?: string): boolean {
  const search = searchText?.trim().toLocaleLowerCase();
  if (!search) {
    return true;
  }
  return project.name.toLocaleLowerCase().includes(search)
    || project.code.toLocaleLowerCase().includes(search);
}

function refLabel(refData: RefDataMap, section: string, value?: string): string {
  if (!value) {
    return '-';
  }
  return (refData[section] as KeyValue[] | undefined)
    ?.find(item => item.key === value)?.displayValue ?? value;
}

export function buildProjectAppliedFilters(
  criteria: ProjectFilterCriteria,
  refData: RefDataMap,
  context?: ProjectListContext,
): AppliedListFilter[] {
  const pills: AppliedListFilter[] = [];
  const userLabel = (id: string): string =>
    context?.userOptions.find(option => option.key === id)?.label ?? id;

  if (criteria.status) {
    pills.push({
      id: 'status',
      label: `Status: ${refLabel(refData, ProjectRefData.refDataKey.statuses, criteria.status)}`,
    });
  }
  if (criteria.category) {
    pills.push({
      id: 'category',
      label: `Category: ${refLabel(refData, ProjectRefData.refDataKey.categories, criteria.category)}`,
    });
  }
  if (criteria.phase) {
    pills.push({
      id: 'phase',
      label: `Phase: ${refLabel(refData, ProjectRefData.refDataKey.phases, criteria.phase)}`,
    });
  }
  if (criteria.managerId) {
    pills.push({ id: 'managerId', label: `Manager: ${userLabel(criteria.managerId)}` });
  }
  if (criteria.sponsorId) {
    pills.push({ id: 'sponsorId', label: `Sponsor: ${userLabel(criteria.sponsorId)}` });
  }
  if (criteria.location) {
    pills.push({ id: 'location', label: `Location: ${criteria.location}` });
  }
  if (criteria.tags?.length) {
    pills.push({ id: 'tags', label: `Tags: ${criteria.tags.join(', ')}` });
  }
  if (criteria.isPublic !== undefined) {
    pills.push({ id: 'isPublic', label: criteria.isPublic ? 'Public only' : 'Internal only' });
  }

  return pills;
}

export function removeProjectFilterById(
  criteria: ProjectFilterCriteria,
  pillId: string,
): ProjectFilterCriteria {
  return { ...criteria, [pillId]: undefined };
}

export function countActiveProjectSheetFilters(criteria: ProjectFilterCriteria): number {
  return [
    criteria.status,
    criteria.category,
    criteria.phase,
    criteria.managerId,
    criteria.sponsorId,
    criteria.location,
    criteria.tags?.length,
    criteria.isPublic !== undefined ? true : undefined,
  ].filter(Boolean).length;
}

export function resolveProjectPermissions(authorization: AuthorizationService) {
  const permissions = authorization.effectivePermissions();
  return {
    showCreateFab: permissions.includes(SCOPE.create.project),
    canUpdateEntity: permissions.includes(SCOPE.update.project),
    canReadActivity: permissions.includes(SCOPE.read.activities),
    canReadGoal: permissions.includes(SCOPE.read.goals),
    canReadBeneficiary: permissions.includes(SCOPE.read.beneficiaries),
    canReadMilestone: permissions.includes(SCOPE.read.milestones),
    canReadTeam: permissions.includes(SCOPE.read.project_teams),
    canReadRisk: permissions.includes(SCOPE.read.risks),
  };
}

/** Per-project update check — the backend authorizes update in the project context. */
export function canUpdateProject(
  authorization: AuthorizationService,
  project: Project,
): boolean {
  return authorization
    .effectivePermissions(authorization.contextFrom('project', project.id))
    .includes(SCOPE.update.project);
}
