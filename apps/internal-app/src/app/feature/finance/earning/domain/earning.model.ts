import type { EarningDetailDto } from 'src/app/core/api/api-client/models';
import type { FieldOption } from '@nabarun-ngo/forms-core';
import type { KeyValue } from 'src/app/shared/models/key-value.model';

export type EarningStatus = EarningDetailDto['status'];
export type EarningCategory = EarningDetailDto['category'];

export type Earning = EarningDetailDto;

export interface PagedEarnings {
  content?: Earning[];
  totalElements?: number;
  totalSize?: number;
  pageIndex?: number;
  pageSize?: number;
}

export type EarningPrimaryChip = 'all' | 'outstanding' | 'closed';

export interface EarningFilterCriteria {
  [key: string]: unknown;
  source?: string;
  category?: string[];
  status?: string[];
  startDate?: string;
  endDate?: string;
}

/** @deprecated Prefer {@link EarningFilterCriteria}. */
export type EarningListCriteria = EarningFilterCriteria;

export const EarningRefData = {
  refDataKey: {
    category: 'earningCategories',
    status: 'earningStatuses',
    statusGroups: 'earningStatusGroups',
  },
} as const;

export interface EarningStatusGroups {
  outstanding: string[];
  closed: string[];
  excluded: string[];
}

export type EarningRefDataMap = Record<
  string,
  KeyValue[] | EarningStatusGroups | undefined
>;

export interface EarningListContext {
  [key: string]: unknown;
  refData: EarningRefDataMap;
  payableAccountOptions: FieldOption[];
}
