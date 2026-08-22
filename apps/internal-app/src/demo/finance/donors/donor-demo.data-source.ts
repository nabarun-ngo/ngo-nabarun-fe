import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { DonorRefDataDto } from 'src/app/core/api/api-client/models';
import {
  buildDonorApiFilter,
  DONOR_DEFAULT_CHIP,
  normalizeDonorChip,
} from 'src/app/feature/finance/donors/config/donor.rules';
import {
  DEMO_DONOR_REF_DATA,
  DEMO_DONORS,
  type DemoDonorRecord,
} from './donor-demo.fixtures';
import type {
  DonorDataSource,
  DonorListOptions,
  DonorListPageQuery,
} from 'src/app/feature/finance/donors/data/donor-data.source';
import type {
  Donor,
  DonorGuestCreateRequest,
  DonorGuestUpdatePatch,
  DonorMemberSummary,
  DonorMemberUpdatePatch,
  DonorStatus,
  DonorType,
  MergeGuestDonorsRequest,
  PagedDonors,
} from 'src/app/feature/finance/donors/domain';

function parsePhone(phone?: string): { phoneCode?: string; phoneNumber?: string } {
  if (!phone) return {};
  const normalized = phone.replace(/\s/g, '');
  if (normalized.startsWith('+91')) {
    return { phoneCode: '+91', phoneNumber: normalized.slice(3) };
  }
  if (normalized.startsWith('+')) {
    const match = normalized.match(/^(\+\d{1,3})(\d+)$/);
    if (match) {
      return { phoneCode: match[1], phoneNumber: match[2] };
    }
  }
  return { phoneNumber: normalized };
}

function demoRecordToDonor(record: DemoDonorRecord, index: number): Donor {
  const { phoneCode, phoneNumber } = parsePhone(record.phone);
  const createdAt = new Date(2024, 0, 1 + index).toISOString();
  return {
    id: record.id,
    type: record.type as DonorType,
    status: record.status as DonorStatus,
    fullName: record.fullName,
    email: record.email,
    phoneCode,
    phoneNumber,
    preferredAmount: record.type === 'MEMBER' ? 500 + index * 100 : undefined,
    userProfileId: record.type === 'MEMBER' ? `profile-${record.id}` : undefined,
    outstandingAmount: record.type === 'MEMBER' ? (index + 1) * 500 : undefined,
    outstandingMonths: record.type === 'MEMBER' ? ['2026-01', '2026-02'] : undefined,
    createdAt,
    updatedAt: createdAt,
  };
}

function cloneDonor(donor: Donor): Donor {
  return { ...donor };
}

@Injectable()
export class DonorDemoDataSource implements DonorDataSource {
  private readonly store: Donor[] = DEMO_DONORS.map((record, index) =>
    demoRecordToDonor(record, index));

  loadListPage(query: DonorListPageQuery): Observable<PagedDonors> {
    const chipId = normalizeDonorChip(query.chipId) || DONOR_DEFAULT_CHIP;
    const filter = buildDonorApiFilter(chipId, query.criteria, query.searchText);
    return this.fetchDonors({
      pageIndex: query.pageIndex,
      pageSize: query.pageSize,
      filter,
    });
  }

  fetchDonors(options: DonorListOptions): Observable<PagedDonors> {
    const pageIndex = options.pageIndex ?? 0;
    const pageSize = options.pageSize ?? 12;
    const filter = options.filter;
    const query = filter?.q?.trim().toLowerCase() ?? '';

    let filtered = this.store.filter(donor => donor.status !== 'DELETED');

    if (filter?.type) {
      filtered = filtered.filter(donor => donor.type === filter.type);
    }
    if (filter?.status) {
      filtered = filtered.filter(donor => donor.status === filter.status);
    }
    if (query) {
      filtered = filtered.filter(donor =>
        (donor.fullName ?? '').toLowerCase().includes(query)
        || donor.id.toLowerCase().includes(query)
        || (donor.email ?? '').toLowerCase().includes(query)
        || `${donor.phoneCode ?? ''}${donor.phoneNumber ?? ''}`.includes(query.replace(/\s/g, '')),
      );
    }

    filtered = [...filtered].sort((a, b) =>
      (a.fullName ?? a.id).localeCompare(b.fullName ?? b.id),
    );

    const start = pageIndex * pageSize;
    return of({
      content: filtered.slice(start, start + pageSize).map(cloneDonor),
      totalSize: filtered.length,
      pageIndex,
      pageSize,
    });
  }

  fetchDonorById(id: string): Observable<Donor | undefined> {
    const needle = id.trim().toLowerCase();
    const donor = this.store.find(item => item.id.toLowerCase() === needle);
    return of(donor ? cloneDonor(donor) : undefined);
  }

  fetchMemberSummary(donorId: string, _userProfileId?: string): Observable<DonorMemberSummary | undefined> {
    const needle = donorId.trim().toLowerCase();
    const donor = this.store.find(item => item.id.toLowerCase() === needle);
    if (!donor || donor.type !== 'MEMBER') {
      return of(undefined);
    }
    return of({
      outstandingAmount: donor.outstandingAmount,
      outstandingMonths: donor.outstandingMonths,
    });
  }

  fetchOwnSummary(): Observable<DonorMemberSummary | undefined> {
    const donor = this.store.find(item => item.type === 'MEMBER');
    if (!donor) return of(undefined);
    return of({
      outstandingAmount: donor.outstandingAmount,
      outstandingMonths: donor.outstandingMonths,
    });
  }

  fetchRefData(): Observable<DonorRefDataDto | undefined> {
    return of(DEMO_DONOR_REF_DATA as DonorRefDataDto);
  }

  createGuestDonor(request: DonorGuestCreateRequest): Observable<Donor> {
    const now = new Date().toISOString();
    const created: Donor = {
      id: `guest-${Date.now()}`,
      type: 'GUEST',
      status: 'ACTIVE',
      fullName: request.fullName,
      email: request.email,
      phoneCode: request.phoneCode,
      phoneNumber: request.phoneNumber,
      preferredAmount: request.preferredAmount,
      createdAt: now,
      updatedAt: now,
    };
    this.store.unshift(created);
    return of(cloneDonor(created));
  }

  updateGuestDonor(id: string, patch: DonorGuestUpdatePatch): Observable<Donor> {
    const index = this.store.findIndex(item => item.id === id);
    if (index < 0) return throwError(() => new Error('Donor not found'));
    const current = this.store[index];
    if (current.type !== 'GUEST') {
      return throwError(() => new Error('Only guest donors can be updated'));
    }
    const updated: Donor = {
      ...current,
      fullName: patch.fullName ?? current.fullName,
      email: patch.email ?? current.email,
      phoneCode: patch.phoneCode ?? current.phoneCode,
      phoneNumber: patch.phoneNumber ?? current.phoneNumber,
      updatedAt: new Date().toISOString(),
    };
    this.store[index] = updated;
    return of(cloneDonor(updated));
  }

  updateMemberDonor(id: string, patch: DonorMemberUpdatePatch): Observable<Donor> {
    const index = this.store.findIndex(item => item.id === id);
    if (index < 0) return throwError(() => new Error('Donor not found'));
    const current = this.store[index];
    if (current.type !== 'MEMBER') {
      return throwError(() => new Error('Only member donors can be updated'));
    }
    const status = patch.status ?? current.status;
    const updated: Donor = {
      ...current,
      preferredAmount: patch.preferredAmount ?? current.preferredAmount,
      status,
      statusEndDate: status === 'ACTIVE'
        ? undefined
        : (patch.statusEndDate ?? current.statusEndDate),
      updatedAt: new Date().toISOString(),
    };
    this.store[index] = updated;
    return of(cloneDonor(updated));
  }

  mergeGuestDonors(request: MergeGuestDonorsRequest): Observable<Donor> {
    const sourceIndex = this.store.findIndex(item => item.id === request.sourceDonorId);
    const targetIndex = this.store.findIndex(item => item.id === request.targetDonorId);
    if (sourceIndex < 0 || targetIndex < 0) {
      return throwError(() => new Error('Donor not found'));
    }
    const source = this.store[sourceIndex];
    const target = this.store[targetIndex];
    if (source.type !== 'GUEST' || target.type !== 'GUEST') {
      return throwError(() => new Error('Only guest donors can be merged'));
    }
    const merged: Donor = {
      ...target,
      fullName: target.fullName || source.fullName,
      email: target.email || source.email,
      phoneCode: target.phoneCode || source.phoneCode,
      phoneNumber: target.phoneNumber || source.phoneNumber,
      updatedAt: new Date().toISOString(),
    };
    this.store[targetIndex] = merged;
    this.store[sourceIndex] = {
      ...source,
      status: 'DELETED',
      updatedAt: new Date().toISOString(),
    };
    return of(cloneDonor(merged));
  }
}
