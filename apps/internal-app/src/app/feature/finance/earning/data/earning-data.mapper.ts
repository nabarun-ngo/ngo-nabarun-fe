import type {
  CreateEarningDto,
  EarningDetailDto,
  EarningListResponseDto,
  EarningRefDataDto,
  UpdateEarningDto,
} from 'src/app/core/api/api-client/models';
import type { KeyValue } from 'src/app/shared/models/key-value.model';
import type { Earning, EarningRefDataMap, PagedEarnings } from '../domain';
import { EarningRefData } from '../domain';

export function mapEarningDto(data: EarningDetailDto): Earning {
  return { ...data } as Earning;
}

export function mapPagedEarnings(data: EarningListResponseDto | {
  content?: EarningDetailDto[];
  items?: EarningDetailDto[];
  total?: number;
  totalElements?: number;
  pageIndex?: number;
  pageSize?: number;
}): PagedEarnings {
  const content = (data as EarningListResponseDto).items
    ?? (data as { content?: EarningDetailDto[] }).content
    ?? [];
  const total = (data as EarningListResponseDto).total
    ?? (data as { totalElements?: number }).totalElements
    ?? 0;
  return {
    content: content.map(mapEarningDto),
    totalElements: total,
    totalSize: total,
    pageIndex: data.pageIndex,
    pageSize: data.pageSize,
  };
}

export function mapToCreateEarning(data: Partial<Earning>): CreateEarningDto {
  return {
    accountId: data.accountId,
    amount: Number(data.amount),
    category: data.category as CreateEarningDto['category'],
    currency: data.currency || 'INR',
    description: data.description,
    source: String(data.source ?? ''),
  };
}

export function mapToUpdateEarning(data: Partial<Earning>): UpdateEarningDto {
  return {
    amount: data.amount,
    category: data.category as UpdateEarningDto['category'],
    description: data.description,
    earningDate: data.earningDate,
    source: data.source,
    status: data.status as UpdateEarningDto['status'],
    accountId: data.accountId,
  };
}

const items = (value: Array<{ key?: string; displayValue?: string; value?: string }> | undefined): KeyValue[] =>
  (value ?? [])
    .filter(item => item.key)
    .map(item => ({
      key: item.key!,
      displayValue: item.displayValue ?? item.value ?? item.key!,
    }));

export function mapEarningRefData(dto?: EarningRefDataDto): EarningRefDataMap {
  if (!dto) {
    return {};
  }
  const result: EarningRefDataMap = {
    [EarningRefData.refDataKey.category]: items(dto.earningCategories),
    [EarningRefData.refDataKey.status]: items(dto.earningStatuses),
  };
  if (dto.earningStatusGroups) {
    result[EarningRefData.refDataKey.statusGroups] = {
      outstanding: [...(dto.earningStatusGroups.outstanding ?? [])],
      closed: [...(dto.earningStatusGroups.closed ?? [])],
      excluded: [...(dto.earningStatusGroups.excluded ?? [])],
    };
  }
  return result;
}

/** @deprecated Prefer {@link mapEarningDto}. */
export const mapToEarning = mapEarningDto;

/** @deprecated Prefer {@link mapPagedEarnings}. */
export const mapToPagedEarnings = mapPagedEarnings;
