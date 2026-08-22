import { InjectionToken } from '@angular/core';
import type { Observable } from 'rxjs';
import type { FieldOption } from '@nabarun-ngo/forms-core';
import type { DonationRefDataDto, UploadDocumentRequestDto } from 'src/app/core/api/api-client/models';
import type { FileUpload } from 'src/app/shared/components/file-upload/file-upload.component';
import type { ApiPagedResult } from 'src/app/shared/models/paged-result.model';
import type { Doc } from 'src/app/shared/models/document.model';
import type { Account } from '../../accounts/domain';
import type {
  Donation,
  DonationDashboardData,
  DonationFilterCriteria,
  DonationRefData,
} from '../domain';

export interface DonationDonorOption {
  id: string;
  fullName: string;
  status: string;
  type: 'MEMBER' | 'GUEST';
  preferredAmount?: number;
}

export interface DonationListQuery {
  chipId?: string;
  criteria?: DonationFilterCriteria;
  refData?: DonationRefData;
  searchText?: string;
  pageIndex: number;
  pageSize: number;
  append?: boolean;
}

export interface DonationDataSource {
  loadDonationPage(query: DonationListQuery): Observable<DonationDashboardData>;
  fetchDonationById(id: string, scope?: 'mine' | 'all'): Observable<Donation | undefined>;
  fetchDonationDonors(): Observable<ApiPagedResult<DonationDonorOption>>;
  fetchDonationAccounts(): Observable<Account[]>;
  fetchDonationDocuments(id: string): Observable<Doc[]>;
  fetchDonationRefData(): Observable<DonationRefDataDto | undefined>;
  fetchDonationEvents(): Observable<FieldOption[]>;
  createDonation(value: Donation, isGuest: boolean): Observable<Donation>;
  updateDonation(id: string, value: Partial<Donation>, documents?: FileUpload[]): Observable<Donation>;
  uploadDonationDocuments(documents: UploadDocumentRequestDto[]): Observable<unknown[]>;
}

export const DonationDataSource =
  new InjectionToken<DonationDataSource>('DonationDataSource');
