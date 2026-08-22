import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { DonorRefDataDto } from 'src/app/core/api/api-client/models';
import type {
  Donor,
  DonorGuestCreateRequest,
  DonorGuestUpdatePatch,
  DonorListCriteria,
  DonorListFilter,
  DonorMemberSummary,
  DonorMemberUpdatePatch,
  MergeGuestDonorsRequest,
  PagedDonors,
} from '../domain';

export interface DonorListOptions {
  pageIndex?: number;
  pageSize?: number;
  filter?: DonorListFilter;
}

export interface DonorListPageQuery {
  chipId?: string;
  criteria?: DonorListCriteria;
  searchText?: string;
  pageIndex: number;
  pageSize: number;
}

export interface DonorDataSource {
  loadListPage(query: DonorListPageQuery): Observable<PagedDonors>;
  fetchDonors(options: DonorListOptions): Observable<PagedDonors>;
  fetchDonorById(id: string): Observable<Donor | undefined>;
  fetchMemberSummary(donorId: string, userProfileId?: string): Observable<DonorMemberSummary | undefined>;
  fetchOwnSummary(): Observable<DonorMemberSummary | undefined>;
  fetchRefData(): Observable<DonorRefDataDto | undefined>;
  createGuestDonor(request: DonorGuestCreateRequest): Observable<Donor>;
  updateGuestDonor(id: string, patch: DonorGuestUpdatePatch): Observable<Donor>;
  updateMemberDonor(id: string, patch: DonorMemberUpdatePatch): Observable<Donor>;
  mergeGuestDonors(request: MergeGuestDonorsRequest): Observable<Donor>;
}

export const DonorDataSource = new InjectionToken<DonorDataSource>('DonorDataSource');
