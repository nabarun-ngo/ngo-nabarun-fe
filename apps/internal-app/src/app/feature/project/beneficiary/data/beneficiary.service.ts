import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import type { FieldOption } from '@nabarun-ngo/forms-core';
import {
  BeneficiaryService as BeneficiaryApiService,
  ProjectService as ProjectApiService,
} from 'src/app/core/api/api-client/services';
import type { Beneficiary, PagedBeneficiaries } from '../domain';
import {
  mapBeneficiaryDto,
  mapPagedBeneficiaries,
  mapToCreateBeneficiary,
  mapToUpdateBeneficiary,
} from './beneficiary-data.mapper';
import type { BeneficiaryListFilter } from './beneficiary-data.source';

/** Thin transport wrapper over the project-scoped beneficiary endpoints. */
@Injectable({ providedIn: 'root' })
export class BeneficiaryService {
  constructor(
    private readonly beneficiaryApi: BeneficiaryApiService,
    private readonly projectApi: ProjectApiService,
  ) {}

  fetchBeneficiaries(
    projectId: string,
    pageIndex = 0,
    pageSize = 12,
    filter: BeneficiaryListFilter = {},
  ): Observable<PagedBeneficiaries> {
    return this.beneficiaryApi.beneficiaryControllerList({
      projectId,
      pageIndex,
      pageSize,
      status: filter.status,
      type: filter.type,
      category: filter.category,
    }).pipe(
      map(response => mapPagedBeneficiaries(response.responsePayload!)),
    );
  }

  fetchBeneficiaryById(projectId: string, id: string): Observable<Beneficiary> {
    return this.beneficiaryApi.beneficiaryControllerGetById({ projectId, id }).pipe(
      map(response => mapBeneficiaryDto(response.responsePayload!)),
    );
  }

  createBeneficiary(projectId: string, data: Partial<Beneficiary>): Observable<Beneficiary> {
    return this.beneficiaryApi.beneficiaryControllerCreate({
      projectId,
      body: mapToCreateBeneficiary(data),
    }).pipe(
      map(response => mapBeneficiaryDto(response.responsePayload!)),
    );
  }

  updateBeneficiary(
    projectId: string,
    id: string,
    patch: Partial<Beneficiary>,
  ): Observable<Beneficiary> {
    return this.beneficiaryApi.beneficiaryControllerUpdate({
      projectId,
      id,
      body: mapToUpdateBeneficiary(patch),
    }).pipe(
      map(response => mapBeneficiaryDto(response.responsePayload!)),
    );
  }

  /** `PATCH .../beneficiaries/{id}/exit` — records the exit; takes no input. */
  exitBeneficiary(projectId: string, id: string): Observable<Beneficiary> {
    return this.beneficiaryApi.beneficiaryControllerExit({ projectId, id }).pipe(
      map(response => mapBeneficiaryDto(response.responsePayload!)),
    );
  }

  fetchProjectOptions(): Observable<FieldOption[]> {
    return this.projectApi.projectControllerListProjects({
      pageIndex: 0,
      pageSize: 100,
    }).pipe(
      map(response => (response.responsePayload?.items ?? []).map(project => ({
        key: project.id,
        label: `${project.code} · ${project.name}`,
      }))),
    );
  }
}
