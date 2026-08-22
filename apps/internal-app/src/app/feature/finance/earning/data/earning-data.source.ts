import { InjectionToken } from '@angular/core';
import type { Observable } from 'rxjs';
import type { EarningRefDataDto } from 'src/app/core/api/api-client/models';
import type { FileUpload } from 'src/app/shared/components/file-upload/file-upload.component';
import type { Doc } from 'src/app/shared/models/document.model';
import type { Account } from '../../accounts/domain';
import type {
  Earning,
  EarningFilterCriteria,
  EarningRefDataMap,
  PagedEarnings,
} from '../domain';

export interface EarningListFilter {
  source?: string;
  category?: string[];
  status?: string[];
  startDate?: string;
  endDate?: string;
}

export interface EarningListOptions {
  pageIndex?: number;
  pageSize?: number;
  filter?: EarningListFilter;
}

export interface EarningListPageQuery {
  chipId?: string;
  criteria?: EarningFilterCriteria;
  searchText?: string;
  pageIndex: number;
  pageSize: number;
  refData?: EarningRefDataMap;
}

export interface EarningDataSource {
  loadListPage(query: EarningListPageQuery): Observable<PagedEarnings>;
  fetchEarnings(options: EarningListOptions): Observable<PagedEarnings>;
  fetchEarningById(id: string): Observable<Earning | undefined>;
  createEarning(data: Partial<Earning>): Observable<Earning>;
  updateEarning(id: string, patch: Partial<Earning>): Observable<Earning>;
  fetchDocuments(earningId: string): Observable<Doc[]>;
  uploadDocuments(docs: FileUpload[], earning: Earning): Observable<unknown>;
  fetchPayableAccounts(
    purpose?: 'EARNING_INTEREST' | 'DONATION',
  ): Observable<Account[]>;
  fetchRefData(): Observable<EarningRefDataDto | undefined>;
}

export const EarningDataSource = new InjectionToken<EarningDataSource>('EarningDataSource');
