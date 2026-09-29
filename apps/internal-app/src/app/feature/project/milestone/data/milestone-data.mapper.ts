import type {
  CreateMilestoneDto,
  MilestoneDetailDto,
  MilestoneListResponseDto,
  UpdateMilestoneDto,
} from 'src/app/core/api/api-client/models';
import type { Milestone, MilestoneRefDataMap, PagedMilestones } from '../domain';
import { MILESTONE_IMPORTANCES, MILESTONE_STATUSES, MilestoneRefData } from '../domain';

export function mapMilestoneDto(dto: MilestoneDetailDto): Milestone {
  return { ...dto };
}

/** The milestone list is returned whole; paging is applied by the caller. */
export function mapMilestoneList(dto: MilestoneListResponseDto): PagedMilestones {
  return {
    content: (dto.items ?? []).map(mapMilestoneDto),
    totalSize: dto.total ?? 0,
  };
}

export function mapToCreateMilestone(data: Partial<Milestone>): CreateMilestoneDto {
  return {
    name: String(data.name ?? ''),
    description: data.description ?? undefined,
    importance: (data.importance ?? 'MEDIUM') as CreateMilestoneDto['importance'],
    targetDate: String(data.targetDate ?? ''),
  };
}

export function mapToUpdateMilestone(data: Partial<Milestone>): UpdateMilestoneDto {
  return {
    name: data.name,
    description: data.description ?? undefined,
    importance: data.importance as UpdateMilestoneDto['importance'],
    targetDate: data.targetDate,
  };
}

export function milestoneRefData(): MilestoneRefDataMap {
  return {
    [MilestoneRefData.refDataKey.statuses]: MILESTONE_STATUSES,
    [MilestoneRefData.refDataKey.importances]: MILESTONE_IMPORTANCES,
  };
}
