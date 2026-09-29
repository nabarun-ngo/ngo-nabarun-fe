import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import type { EarningRefDataDto } from 'src/app/core/api/api-client/models';
import type { FileUpload } from 'src/app/shared/components/file-upload/file-upload.component';
import type { Doc } from 'src/app/shared/models/document.model';
import type { Account } from '../../../accounts/domain';
import { EarningService } from '../earning.service';
import {
  buildEarningApiFilter,
  EARNING_DEFAULT_CHIP,
  normalizeEarningChip,
} from '../../config/earning.rules';
import type { Earning, EarningFilterCriteria, PagedEarnings } from '../../domain';
import type {
  EarningDataSource,
  EarningListOptions,
  EarningListPageQuery,
} from '../earning-data.source';

@Injectable()
export class EarningApiDataSource implements EarningDataSource {
  constructor(private readonly earningService: EarningService) {}

  loadListPage(query: EarningListPageQuery): Observable<PagedEarnings> {
    const chipId = normalizeEarningChip(query.chipId) ?? EARNING_DEFAULT_CHIP;
    const filter = buildEarningApiFilter(
      chipId,
      query.criteria as EarningFilterCriteria | undefined,
      query.searchText,
      query.refData,
    );

    return this.fetchEarnings({
      pageIndex: query.pageIndex,
      pageSize: query.pageSize,
      filter,
    });
  }

  fetchEarnings(options: EarningListOptions): Observable<PagedEarnings> {
    return this.earningService.fetchEarnings(
      options.pageIndex,
      options.pageSize,
      options.filter,
    );
  }

  fetchEarningById(id: string): Observable<Earning | undefined> {
    return this.earningService.getEarningById(id).pipe(
      catchError(() => of(undefined)),
    );
  }

  createEarning(data: Partial<Earning>): Observable<Earning> {
    return this.earningService.createEarning(data);
  }

  updateEarning(id: string, patch: Partial<Earning>): Observable<Earning> {
    return this.earningService.updateEarning(id, patch);
  }

  fetchDocuments(earningId: string): Observable<Doc[]> {
    return this.earningService.getEarningDocuments(earningId).pipe(
      catchError(() => of([])),
    );
  }

  uploadDocuments(docs: FileUpload[], earning: Earning): Observable<unknown> {
    return this.earningService.uploadDocuments(docs, earning);
  }

  fetchPayableAccounts(purpose: 'EARNING_INTEREST' | 'DONATION' = 'EARNING_INTEREST'): Observable<Account[]> {
    return this.earningService.fetchPayableAccounts(purpose).pipe(
      catchError(() => of([])),
    );
  }

  fetchRefData(): Observable<EarningRefDataDto | undefined> {
    return this.earningService.getEarningReferenceData().pipe(
      map(refData => refData ?? undefined),
    );
  }
}
