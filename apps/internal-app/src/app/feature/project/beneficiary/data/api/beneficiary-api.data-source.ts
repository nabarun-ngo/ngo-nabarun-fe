import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import type { FieldOption } from '@nabarun-ngo/forms-core';
import {
  buildBeneficiaryApiFilter,
  matchesBeneficiarySearch,
  normalizeBeneficiaryChip,
} from '../../config/beneficiary.rules';
import type { Beneficiary, PagedBeneficiaries } from '../../domain';
import type {
  BeneficiaryDataSource,
  BeneficiaryListPageQuery,
} from '../beneficiary-data.source';
import { BeneficiaryService } from '../beneficiary.service';

/** Widest page the search fallback requests before filtering locally. */
const SEARCH_PAGE_SIZE = 200;

@Injectable()
export class BeneficiaryApiDataSource implements BeneficiaryDataSource {
  constructor(private readonly beneficiaries: BeneficiaryService) {}

  loadListPage(query: BeneficiaryListPageQuery): Observable<PagedBeneficiaries> {
    const projectId = query.criteria?.projectId;
    if (!projectId) {
      return of({
        content: [],
        totalSize: 0,
        pageIndex: query.pageIndex,
        pageSize: query.pageSize,
      });
    }

    const filter = buildBeneficiaryApiFilter(
      normalizeBeneficiaryChip(query.chipId),
      query.criteria,
    );
    const search = query.searchText?.trim();

    if (!search) {
      return this.beneficiaries.fetchBeneficiaries(
        projectId,
        query.pageIndex,
        query.pageSize,
        filter,
      );
    }

    // The endpoint has no text query, so search pulls a wide page and narrows locally.
    return this.beneficiaries.fetchBeneficiaries(projectId, 0, SEARCH_PAGE_SIZE, filter).pipe(
      map(page => {
        const matches = (page.content ?? [])
          .filter(beneficiary => matchesBeneficiarySearch(beneficiary, search));
        const start = query.pageIndex * query.pageSize;
        return {
          content: matches.slice(start, start + query.pageSize),
          totalSize: matches.length,
          pageIndex: query.pageIndex,
          pageSize: query.pageSize,
        };
      }),
    );
  }

  fetchBeneficiaryById(projectId: string, id: string): Observable<Beneficiary | undefined> {
    return this.beneficiaries.fetchBeneficiaryById(projectId, id).pipe(
      catchError(() => of(undefined)),
    );
  }

  createBeneficiary(projectId: string, data: Partial<Beneficiary>): Observable<Beneficiary> {
    return this.beneficiaries.createBeneficiary(projectId, data);
  }

  updateBeneficiary(
    projectId: string,
    id: string,
    patch: Partial<Beneficiary>,
  ): Observable<Beneficiary> {
    return this.beneficiaries.updateBeneficiary(projectId, id, patch);
  }

  exitBeneficiary(projectId: string, id: string): Observable<Beneficiary> {
    return this.beneficiaries.exitBeneficiary(projectId, id);
  }

  fetchProjectOptions(): Observable<FieldOption[]> {
    return this.beneficiaries.fetchProjectOptions().pipe(catchError(() => of([])));
  }
}
