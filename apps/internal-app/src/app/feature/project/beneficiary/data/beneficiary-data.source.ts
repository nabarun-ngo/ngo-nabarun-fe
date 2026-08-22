import { InjectionToken } from '@angular/core';
import type { Observable } from 'rxjs';
import type { FieldOption } from '@nabarun-ngo/forms-core';
import type {
  Beneficiary,
  BeneficiaryFilterCriteria,
  BeneficiaryStatus,
  BeneficiaryType,
  PagedBeneficiaries,
} from '../domain';

/** Server-side filters accepted by `GET /projects/{projectId}/beneficiaries`. */
export interface BeneficiaryListFilter {
  status?: BeneficiaryStatus;
  type?: BeneficiaryType;
  category?: string;
}

export interface BeneficiaryListPageQuery {
  chipId?: string;
  criteria?: BeneficiaryFilterCriteria;
  searchText?: string;
  pageIndex: number;
  pageSize: number;
}

export interface BeneficiaryDataSource {
  /** Returns an empty page until a project is in scope. */
  loadListPage(query: BeneficiaryListPageQuery): Observable<PagedBeneficiaries>;
  fetchBeneficiaryById(projectId: string, id: string): Observable<Beneficiary | undefined>;
  createBeneficiary(projectId: string, data: Partial<Beneficiary>): Observable<Beneficiary>;
  updateBeneficiary(
    projectId: string,
    id: string,
    patch: Partial<Beneficiary>,
  ): Observable<Beneficiary>;
  exitBeneficiary(projectId: string, id: string): Observable<Beneficiary>;
  fetchProjectOptions(): Observable<FieldOption[]>;
}

export const BeneficiaryDataSource = new InjectionToken<BeneficiaryDataSource>(
  'BeneficiaryDataSource',
);
