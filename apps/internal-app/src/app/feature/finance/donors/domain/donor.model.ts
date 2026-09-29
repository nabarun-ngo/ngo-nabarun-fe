import type { KeyValue } from 'src/app/shared/models/key-value.model';

export type DonorType = 'MEMBER' | 'GUEST';

export type DonorStatus = 'ACTIVE' | 'PAUSED' | 'WAIVED' | 'DELETED';

export type DonorPrimaryChip = 'guest' | 'member';

export interface Donor {
  id: string;
  type: DonorType;
  status: DonorStatus;
  fullName?: string;
  email?: string;
  phoneCode?: string;
  phoneNumber?: string;
  preferredAmount?: number;
  statusEndDate?: string;
  userProfileId?: string;
  outstandingAmount?: number;
  outstandingMonths?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PagedDonors {
  content: Donor[];
  totalSize: number;
  pageIndex: number;
  pageSize: number;
}

export interface DonorListFilter {
  q?: string;
  type?: DonorType;
  status?: DonorStatus;
}

export interface DonorListCriteria {
  [key: string]: unknown;
  status?: DonorStatus;
}

export interface DonorGuestUpdatePatch {
  fullName?: string;
  email?: string;
  phoneCode?: string;
  phoneNumber?: string;
}

export interface DonorGuestCreateRequest {
  fullName: string;
  email?: string;
  phoneCode?: string;
  phoneNumber?: string;
  preferredAmount?: number;
}

export interface DonorMemberUpdatePatch {
  preferredAmount?: number;
  status?: DonorStatus;
  statusEndDate?: string;
}

export interface DonorMemberSummary {
  outstandingAmount?: number;
  outstandingMonths?: string[];
}

export interface MergeGuestDonorsRequest {
  sourceDonorId: string;
  targetDonorId: string;
}

export type DonorRefData = Record<string, KeyValue[] | string[] | undefined>;
