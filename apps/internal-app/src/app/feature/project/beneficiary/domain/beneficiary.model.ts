import type { FieldOption } from '@nabarun-ngo/forms-core';
import type { BeneficiaryDetailDto } from 'src/app/core/api/api-client/models';
import type { KeyValue } from 'src/app/shared/models/key-value.model';

export type Beneficiary = BeneficiaryDetailDto;

export type BeneficiaryStatus = BeneficiaryDetailDto['status'];
export type BeneficiaryType = BeneficiaryDetailDto['type'];
export type BeneficiaryGender = NonNullable<BeneficiaryDetailDto['gender']>;

export interface PagedBeneficiaries {
  content?: Beneficiary[];
  totalSize?: number;
  pageIndex?: number;
  pageSize?: number;
}

export type BeneficiaryPrimaryChip = 'all' | 'active' | 'completed';

export interface BeneficiaryFilterCriteria {
  [key: string]: unknown;
  projectId?: string;
  status?: BeneficiaryStatus;
  type?: BeneficiaryType;
  category?: string;
}

export const BeneficiaryRefData = {
  refDataKey: {
    statuses: 'beneficiaryStatuses',
    types: 'beneficiaryTypes',
    genders: 'beneficiaryGenders',
  },
} as const;

export type BeneficiaryRefDataMap = Record<string, KeyValue[] | undefined>;

/** Beneficiary enums are absent from the reference-data endpoint. */
export const BENEFICIARY_STATUSES: KeyValue[] = [
  { key: 'ACTIVE', displayValue: 'Active' },
  { key: 'COMPLETED', displayValue: 'Completed' },
  { key: 'DROPPED_OUT', displayValue: 'Dropped out' },
  { key: 'TRANSFERRED', displayValue: 'Transferred' },
];

export const BENEFICIARY_TYPES: KeyValue[] = [
  { key: 'INDIVIDUAL', displayValue: 'Individual' },
  { key: 'FAMILY', displayValue: 'Family' },
  { key: 'COMMUNITY', displayValue: 'Community' },
  { key: 'INSTITUTION', displayValue: 'Institution' },
  { key: 'OTHER', displayValue: 'Other' },
];

export const BENEFICIARY_GENDERS: KeyValue[] = [
  { key: 'MALE', displayValue: 'Male' },
  { key: 'FEMALE', displayValue: 'Female' },
  { key: 'OTHER', displayValue: 'Other' },
  { key: 'PREFER_NOT_TO_SAY', displayValue: 'Prefer not to say' },
];

export interface BeneficiaryListContext {
  [key: string]: unknown;
  refData: BeneficiaryRefDataMap;
  projectId?: string;
  projectOptions: FieldOption[];
}
