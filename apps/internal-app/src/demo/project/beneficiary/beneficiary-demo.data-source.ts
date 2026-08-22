import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import type { FieldOption } from '@nabarun-ngo/forms-core';
import {
  beneficiaryStatusForChip,
  matchesBeneficiarySearch,
  normalizeBeneficiaryChip,
} from 'src/app/feature/project/beneficiary/config/beneficiary.rules';
import type { Beneficiary, PagedBeneficiaries } from 'src/app/feature/project/beneficiary/domain';
import type {
  BeneficiaryDataSource,
  BeneficiaryListPageQuery,
} from 'src/app/feature/project/beneficiary/data/beneficiary-data.source';

const DEMO_BENEFICIARIES: Beneficiary[] = [
  {
    id: 'ben-001',
    projectId: 'prj-001',
    name: 'Riya Das',
    type: 'INDIVIDUAL',
    status: 'ACTIVE',
    category: 'student',
    gender: 'FEMALE',
    age: 11,
    contactNumber: '9800011122',
    location: 'Krishnanagar',
    enrollmentDate: '2026-01-20',
    benefitsReceived: ['Learning kit'],
    createdAt: '2026-01-20T06:00:00.000Z',
    updatedAt: '2026-06-02T06:00:00.000Z',
  },
  {
    id: 'ben-002',
    projectId: 'prj-001',
    name: 'Sahil Mondal',
    type: 'INDIVIDUAL',
    status: 'COMPLETED',
    category: 'student',
    gender: 'MALE',
    age: 13,
    location: 'Krishnanagar',
    enrollmentDate: '2026-01-20',
    exitDate: '2026-06-30',
    benefitsReceived: ['Learning kit', 'Uniform'],
    createdAt: '2026-01-20T06:00:00.000Z',
    updatedAt: '2026-06-30T06:00:00.000Z',
  },
  {
    id: 'ben-003',
    projectId: 'prj-002',
    name: 'Baghmundi Gram Panchayat',
    type: 'COMMUNITY',
    status: 'ACTIVE',
    category: 'village',
    location: 'Purulia',
    enrollmentDate: '2025-11-10',
    benefitsReceived: ['Health screening'],
    createdAt: '2025-11-10T06:00:00.000Z',
    updatedAt: '2026-08-01T06:00:00.000Z',
  },
];

const store = DEMO_BENEFICIARIES.map(beneficiary => ({ ...beneficiary }));

const DEMO_PROJECT_OPTIONS: FieldOption[] = [
  { key: 'prj-001', label: 'EDU · Village School Support' },
  { key: 'prj-002', label: 'HLT · Mobile Health Camps' },
];

@Injectable()
export class BeneficiaryDemoDataSource implements BeneficiaryDataSource {
  loadListPage(query: BeneficiaryListPageQuery): Observable<PagedBeneficiaries> {
    const projectId = query.criteria?.projectId;
    const status = beneficiaryStatusForChip(normalizeBeneficiaryChip(query.chipId))
      ?? query.criteria?.status;
    const matches = store.filter(beneficiary =>
      (!projectId || beneficiary.projectId === projectId)
      && (!status || beneficiary.status === status)
      && (!query.criteria?.type || beneficiary.type === query.criteria.type)
      && (!query.criteria?.category || beneficiary.category === query.criteria.category)
      && matchesBeneficiarySearch(beneficiary, query.searchText));
    const start = query.pageIndex * query.pageSize;
    return of({
      content: matches.slice(start, start + query.pageSize),
      totalSize: matches.length,
      pageIndex: query.pageIndex,
      pageSize: query.pageSize,
    }).pipe(delay(200));
  }

  fetchBeneficiaryById(_projectId: string, id: string): Observable<Beneficiary | undefined> {
    return of(store.find(beneficiary => beneficiary.id === id)).pipe(delay(120));
  }

  createBeneficiary(projectId: string, data: Partial<Beneficiary>): Observable<Beneficiary> {
    const created: Beneficiary = {
      id: `ben-${String(store.length + 1).padStart(3, '0')}`,
      projectId,
      name: data.name ?? 'New beneficiary',
      type: data.type ?? 'INDIVIDUAL',
      status: 'ACTIVE',
      category: data.category,
      gender: data.gender,
      age: data.age,
      contactNumber: data.contactNumber,
      email: data.email,
      address: data.address,
      location: data.location,
      notes: data.notes,
      enrollmentDate: data.enrollmentDate ?? new Date().toISOString().slice(0, 10),
      benefitsReceived: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.unshift(created);
    return of(created).pipe(delay(200));
  }

  updateBeneficiary(
    _projectId: string,
    id: string,
    patch: Partial<Beneficiary>,
  ): Observable<Beneficiary> {
    const index = store.findIndex(beneficiary => beneficiary.id === id);
    const updated: Beneficiary = {
      ...(index >= 0 ? store[index] : store[0]),
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    if (index >= 0) {
      store[index] = updated;
    }
    return of(updated).pipe(delay(200));
  }

  exitBeneficiary(_projectId: string, id: string): Observable<Beneficiary> {
    const index = store.findIndex(beneficiary => beneficiary.id === id);
    const updated: Beneficiary = {
      ...(index >= 0 ? store[index] : store[0]),
      status: 'COMPLETED',
      exitDate: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString(),
    };
    if (index >= 0) {
      store[index] = updated;
    }
    return of(updated).pipe(delay(200));
  }

  fetchProjectOptions(): Observable<FieldOption[]> {
    return of(DEMO_PROJECT_OPTIONS).pipe(delay(120));
  }
}
