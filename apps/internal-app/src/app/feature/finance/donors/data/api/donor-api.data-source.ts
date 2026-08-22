import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, switchMap } from 'rxjs';
import { DonationService, DonorService } from 'src/app/core/api/api-client/services';
import {
  DonorRefDataDto,
  SuccessResponseDonationSummaryDto,
} from 'src/app/core/api/api-client/models';
import { DonationDefaultValue } from '../../../finance.const';
import {
  buildDonorApiFilter,
  DONOR_DEFAULT_CHIP,
  normalizeDonorChip,
} from '../../config/donor.rules';
import {
  mapDonorDtoToDonor,
  mapPagedDonorDtoToPagedDonors,
} from '../donor-data.mapper';
import type {
  DonorDataSource,
  DonorListOptions,
  DonorListPageQuery,
} from '../donor-data.source';
import type {
  Donor,
  DonorGuestCreateRequest,
  DonorGuestUpdatePatch,
  DonorMemberSummary,
  DonorMemberUpdatePatch,
  MergeGuestDonorsRequest,
  PagedDonors,
} from '../../domain';
import { UserIdentityService } from '@nabarun-ngo/auth-angular';

@Injectable()
export class DonorApiDataSource implements DonorDataSource {
  constructor(
    private readonly donorApi: DonorService,
    private readonly donationApi: DonationService,
    private readonly userIdentity: UserIdentityService,
  ) {}

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
    const filter = options.filter;
    return this.donorApi.donorControllerList({
      pageIndex: options.pageIndex ?? DonationDefaultValue.pageNumber,
      pageSize: options.pageSize ?? DonationDefaultValue.pageSize,
      q: filter?.q,
      type: filter?.type,
      status: filter?.status,
      sortBy: 'fullName',
      sortDir: 'asc',
    }).pipe(
      map(response => mapPagedDonorDtoToPagedDonors(response.responsePayload)),
    );
  }

  fetchDonorById(id: string): Observable<Donor | undefined> {
    return this.donorApi.donorControllerGetById({ id }).pipe(
      map(response => mapDonorDtoToDonor(response.responsePayload)),
      switchMap(donor => {
        if (donor.type !== 'MEMBER') {
          return of(donor);
        }
        return this.fetchMemberSummary(id, donor.userProfileId).pipe(
          map(summary => ({
            ...donor,
            outstandingAmount: summary?.outstandingAmount,
            outstandingMonths: summary?.outstandingMonths,
          })),
        );
      }),
      catchError(() => of(undefined)),
    );
  }

  fetchMemberSummary(donorId: string, userProfileId?: string): Observable<DonorMemberSummary | undefined> {
    const currentUserId = this.userIdentity.rbacSnapShot?.userId;
    if (!!userProfileId && !!currentUserId && userProfileId === currentUserId) {
      return this.fetchOwnSummary();
    }
    return this.toMemberSummary(
      this.donationApi.donationControllerGetDonationSummary({ donorId }),
    );
  }

  fetchOwnSummary(): Observable<DonorMemberSummary | undefined> {
    return this.toMemberSummary(
      this.donationApi.donationControllerGetSelfDonationSummary(),
    );
  }

  private toMemberSummary(
    request: Observable<SuccessResponseDonationSummaryDto>,
  ): Observable<DonorMemberSummary | undefined> {
    return request.pipe(
      map(response => ({
        outstandingAmount: response.responsePayload?.outstandingAmount,
        outstandingMonths: response.responsePayload?.outstandingMonths,
      })),
      catchError(() => of(undefined)),
    );
  }

  updateGuestDonor(id: string, patch: DonorGuestUpdatePatch): Observable<Donor> {
    return this.donorApi.donorControllerUpdateGuest({
      id,
      body: patch,
    }).pipe(
      map(response => mapDonorDtoToDonor(response.responsePayload)),
    );
  }

  fetchRefData(): Observable<DonorRefDataDto | undefined> {
    return this.donorApi.donorControllerGetDonorReferenceData().pipe(
      map(response => response.responsePayload),
      catchError(() => of(undefined)),
    );
  }

  createGuestDonor(request: DonorGuestCreateRequest): Observable<Donor> {
    return this.donorApi.donorControllerCreateGuest({
      body: request,
    }).pipe(
      map(response => mapDonorDtoToDonor(response.responsePayload)),
    );
  }

  updateMemberDonor(id: string, patch: DonorMemberUpdatePatch): Observable<Donor> {
    return this.donorApi.donorControllerUpdateMember({
      id,
      body: patch,
    }).pipe(
      switchMap(() => this.fetchDonorById(id)),
      map(donor => {
        if (!donor) {
          throw new Error('Donor not found after update');
        }
        return donor;
      }),
    );
  }

  mergeGuestDonors(request: MergeGuestDonorsRequest): Observable<Donor> {
    return this.donorApi.donorControllerMergeGuest({
      body: request,
    }).pipe(
      map(response => mapDonorDtoToDonor(response.responsePayload)),
    );
  }
}
