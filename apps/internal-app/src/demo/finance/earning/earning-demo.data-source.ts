import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import type { EarningRefDataDto } from 'src/app/core/api/api-client/models';
import type { FileUpload } from 'src/app/shared/components/file-upload/file-upload.component';
import type { Doc } from 'src/app/shared/models/document.model';
import type { Account } from 'src/app/feature/finance/accounts/domain';
import {
  EARNING_DEFAULT_CHIP,
  normalizeEarningChip,
} from 'src/app/feature/finance/earning/config/earning.rules';
import type { Earning, EarningFilterCriteria, PagedEarnings } from 'src/app/feature/finance/earning/domain';
import type {
  EarningDataSource,
  EarningListOptions,
  EarningListPageQuery,
} from 'src/app/feature/finance/earning/data/earning-data.source';
import {
  buildDemoCreatedEarning,
  DEMO_EARNING_REF_DATA,
  findDemoEarningById,
  getDemoEarningPage,
  updateDemoEarning,
} from './earning-demo.fixtures';

@Injectable()
export class EarningDemoDataSource implements EarningDataSource {
  loadListPage(query: EarningListPageQuery): Observable<PagedEarnings> {
    const chipId = normalizeEarningChip(query.chipId) ?? EARNING_DEFAULT_CHIP;
    const criteria = (query.criteria ?? {}) as EarningFilterCriteria;
    const { items, totalSize } = getDemoEarningPage(
      chipId,
      criteria,
      query.searchText,
      query.pageIndex,
      query.pageSize,
      query.refData,
    );

    return of({
      content: items,
      totalElements: totalSize,
      totalSize,
      pageIndex: query.pageIndex,
      pageSize: query.pageSize,
    }).pipe(delay(250));
  }

  fetchEarnings(options: EarningListOptions): Observable<PagedEarnings> {
    return this.loadListPage({
      chipId: EARNING_DEFAULT_CHIP,
      criteria: options.filter as EarningFilterCriteria | undefined,
      pageIndex: options.pageIndex ?? 0,
      pageSize: options.pageSize ?? 12,
    });
  }

  fetchEarningById(id: string): Observable<Earning | undefined> {
    return of(findDemoEarningById(id)).pipe(delay(150));
  }

  createEarning(data: Partial<Earning>): Observable<Earning> {
    return of(buildDemoCreatedEarning(data)).pipe(delay(200));
  }

  updateEarning(id: string, patch: Partial<Earning>): Observable<Earning> {
    return of(updateDemoEarning(id, patch)).pipe(delay(200));
  }

  fetchDocuments(_earningId: string): Observable<Doc[]> {
    return of([]).pipe(delay(150));
  }

  uploadDocuments(_docs: FileUpload[], earning: Earning): Observable<unknown> {
    return of(earning).pipe(delay(200));
  }

  fetchPayableAccounts(purpose: 'EARNING_INTEREST' | 'DONATION' = 'EARNING_INTEREST'): Observable<Account[]> {
    const accounts = purpose === 'EARNING_INTEREST'
      ? [
          { id: 'acct-demo-1', accountType: 'BANK', displayName: 'Demo Bank Account' } as Account,
          { id: 'acct-invest-1', accountType: 'INVESTMENT', displayName: 'Demo Investment' } as Account,
        ]
      : [
          { id: 'acct-demo-1', accountType: 'BANK', displayName: 'Demo Payable Account' } as Account,
        ];
    return of(accounts).pipe(delay(150));
  }

  fetchRefData(): Observable<EarningRefDataDto | undefined> {
    return of(DEMO_EARNING_REF_DATA as EarningRefDataDto).pipe(delay(100));
  }
}
