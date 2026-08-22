import type {
  CreateProjectDto,
  ProjectDashboardResponseDto,
  ProjectDetailDto,
  ProjectListResponseDto,
  ProjectRefDataDto,
  UpdateProjectDto,
} from 'src/app/core/api/api-client/models';
import type { KeyValue } from 'src/app/shared/models/key-value.model';
import type {
  PagedProjects,
  Project,
  ProjectDashboardSnapshot,
  ProjectRefDataMap,
} from '../domain';
import { ProjectRefData } from '../domain';

export function mapProjectDto(dto: ProjectDetailDto): Project {
  return { ...dto };
}

export function mapPagedProjects(dto: ProjectListResponseDto): PagedProjects {
  return {
    content: (dto.items ?? []).map(mapProjectDto),
    totalSize: dto.total ?? 0,
    pageIndex: dto.pageIndex,
    pageSize: dto.pageSize,
  };
}

export function mapProjectDashboard(dto: ProjectDashboardResponseDto): ProjectDashboardSnapshot {
  return {
    progress: dto.progress,
    recentActivities: [...(dto.recentActivities ?? [])],
    upcomingMilestones: [...(dto.upcomingMilestones ?? [])],
  };
}

export function mapToCreateProject(data: Partial<Project>): CreateProjectDto {
  return {
    code: String(data.code ?? ''),
    name: String(data.name ?? ''),
    description: String(data.description ?? ''),
    category: data.category as CreateProjectDto['category'],
    budget: Number(data.budget ?? 0),
    currency: data.currency || 'INR',
    startDate: String(data.startDate ?? ''),
    endDate: data.endDate,
    location: data.location,
    managerId: String(data.managerId ?? ''),
    sponsorId: data.sponsorId,
    status: (data.status ?? 'PLANNING') as CreateProjectDto['status'],
    phase: (data.phase ?? 'INITIATION') as CreateProjectDto['phase'],
    tags: data.tags ?? [],
    targetBeneficiaryCount: data.targetBeneficiaryCount,
    isPublic: data.isPublic,
    metadata: data.metadata,
  };
}

/** Code, currency, start date and manager are immutable once the project exists. */
export function mapToUpdateProject(data: Partial<Project>): UpdateProjectDto {
  return {
    name: data.name,
    description: data.description,
    category: data.category as UpdateProjectDto['category'],
    budget: data.budget,
    endDate: data.endDate,
    location: data.location,
    sponsorId: data.sponsorId,
    status: data.status as UpdateProjectDto['status'],
    phase: data.phase as UpdateProjectDto['phase'],
    tags: data.tags,
    targetBeneficiaryCount: data.targetBeneficiaryCount,
    isPublic: data.isPublic,
    metadata: data.metadata,
  };
}

/**
 * The generated `ProjectRefDataDto` types every section as a nested array, while the
 * API returns flat key/display pairs — normalize both shapes to {@link KeyValue}.
 */
function keyValues(value: unknown): KeyValue[] {
  const entries = Array.isArray(value) ? value.flat() : [];
  return entries
    .filter((item): item is { key?: string; displayValue?: string; value?: string } =>
      !!item && typeof item === 'object')
    .filter(item => !!item.key)
    .map(item => ({
      key: item.key!,
      displayValue: item.displayValue ?? item.value ?? item.key!,
    }));
}

export function mapProjectRefData(dto?: ProjectRefDataDto): ProjectRefDataMap {
  if (!dto) {
    return {};
  }
  return {
    [ProjectRefData.refDataKey.categories]: keyValues(dto.projectCategories),
    [ProjectRefData.refDataKey.statuses]: keyValues(dto.projectStatuses),
    [ProjectRefData.refDataKey.phases]: keyValues(dto.projectPhases),
  };
}
