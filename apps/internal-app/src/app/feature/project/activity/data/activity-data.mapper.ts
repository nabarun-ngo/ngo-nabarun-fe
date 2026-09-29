import type {
  ActivityDetailDto,
  ActivityListResponseDto,
  CreateActivityDto,
  ProjectRefDataDto,
  UpdateActivityDto,
} from 'src/app/core/api/api-client/models';
import type { KeyValue } from 'src/app/shared/models/key-value.model';
import type { Activity, ActivityRefDataMap, PagedActivities } from '../domain';
import { ActivityRefData } from '../domain';

export function mapActivityDto(dto: ActivityDetailDto): Activity {
  return { ...dto };
}

export function mapPagedActivities(dto: ActivityListResponseDto): PagedActivities {
  return {
    content: (dto.items ?? []).map(mapActivityDto),
    totalSize: dto.total ?? 0,
    pageIndex: dto.pageIndex,
    pageSize: dto.pageSize,
  };
}

export function mapToCreateActivity(data: Partial<Activity>): CreateActivityDto {
  return {
    name: String(data.name ?? ''),
    description: data.description,
    type: data.type as CreateActivityDto['type'],
    scale: data.scale as CreateActivityDto['scale'],
    priority: data.priority as CreateActivityDto['priority'],
    startDate: data.startDate,
    endDate: data.endDate,
    location: data.location,
    venue: data.venue,
    currency: data.currency || 'INR',
    estimatedCost: data.estimatedCost,
    expectedParticipants: data.expectedParticipants,
    assignedTo: data.assignedTo,
    organizerId: data.organizerId,
    parentActivityId: data.parentActivityId,
    tags: data.tags ?? [],
    metadata: data.metadata,
  };
}

/** Scale and parent activity are fixed once the activity exists. */
export function mapToUpdateActivity(data: Partial<Activity>): UpdateActivityDto {
  return {
    name: data.name,
    description: data.description,
    type: data.type as UpdateActivityDto['type'],
    priority: data.priority as UpdateActivityDto['priority'],
    status: data.status as UpdateActivityDto['status'],
    startDate: data.startDate,
    endDate: data.endDate,
    location: data.location,
    venue: data.venue,
    estimatedCost: data.estimatedCost,
    expectedParticipants: data.expectedParticipants,
    assignedTo: data.assignedTo,
    organizerId: data.organizerId,
    tags: data.tags,
    metadata: data.metadata,
  };
}

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

/** Activity enums ship with the shared project reference data payload. */
export function mapActivityRefData(dto?: ProjectRefDataDto): ActivityRefDataMap {
  if (!dto) {
    return {};
  }
  return {
    [ActivityRefData.refDataKey.types]: keyValues(dto.activityTypes),
    [ActivityRefData.refDataKey.statuses]: keyValues(dto.activityStatuses),
    [ActivityRefData.refDataKey.priorities]: keyValues(dto.activityPriorities),
    [ActivityRefData.refDataKey.scales]: keyValues(dto.activityScales),
  };
}
