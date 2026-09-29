import type {
  CreateGoalDto,
  GoalDetailDto,
  GoalListResponseDto,
  UpdateGoalDto,
} from 'src/app/core/api/api-client/models';
import type { Goal, GoalRefDataMap, PagedGoals } from '../domain';
import { GOAL_PRIORITIES, GOAL_STATUSES, GoalRefData } from '../domain';

export function mapGoalDto(dto: GoalDetailDto): Goal {
  return { ...dto };
}

export function mapPagedGoals(dto: GoalListResponseDto): PagedGoals {
  return {
    content: (dto.items ?? []).map(mapGoalDto),
    totalSize: dto.total ?? 0,
    pageIndex: dto.pageIndex,
    pageSize: dto.pageSize,
  };
}

export function mapToCreateGoal(data: Partial<Goal> & {
  deadline?: string;
  targetUnit?: string;
  weight?: number;
}): CreateGoalDto {
  return {
    title: String(data.title ?? ''),
    description: data.description,
    priority: (data.priority ?? 'MEDIUM') as CreateGoalDto['priority'],
    targetValue: data.targetValue,
    targetUnit: data.targetUnit,
    deadline: data.deadline,
    weight: data.weight,
  };
}

export function mapToUpdateGoal(data: Partial<Goal>): UpdateGoalDto {
  return {
    title: data.title,
    description: data.description,
    priority: data.priority as UpdateGoalDto['priority'],
    targetValue: data.targetValue,
  };
}

export function goalRefData(): GoalRefDataMap {
  return {
    [GoalRefData.refDataKey.statuses]: GOAL_STATUSES,
    [GoalRefData.refDataKey.priorities]: GOAL_PRIORITIES,
  };
}
