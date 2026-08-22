import { Injectable } from '@angular/core';
import { catchError, forkJoin, map, Observable, of, switchMap } from 'rxjs';
import type { FieldOption } from '@nabarun-ngo/forms-core';
import type { UpdateDonationDto, UploadDocumentRequestDto } from 'src/app/core/api/api-client/models';
import {
  AccountService, DmsService, DonationService, DonorService,
} from 'src/app/core/api/api-client/services';
import type { FileUpload } from 'src/app/shared/components/file-upload/file-upload.component';
import { mapDocDtoToDoc } from 'src/app/shared/models/document.model';
import { removeNullFields } from 'src/app/shared/utils/utilities.service';
import { ActivityService } from '../../../../project/activity/data/activity.service';
import { mapAccountDtoToAccount } from '../../../accounts/data/account-api.mapper';
import type { Donation, DonationDashboardData } from '../../domain';
import {
  buildDonationApiFilter,
  normalizeDonationChip,
} from '../../config/donation.rules';
import { mapDonationDto } from '../donation-data.mapper';
import type {
  DonationDataSource, DonationDonorOption, DonationListQuery,
} from '../donation-data.source';

@Injectable()
export class DonationApiDataSource implements DonationDataSource {
  constructor(
    private readonly donationApi: DonationService,
    private readonly donorApi: DonorService,
    private readonly accountApi: AccountService,
    private readonly dmsApi: DmsService,
    private readonly activityApi: ActivityService,
  ) {}

  loadDonationPage(query: DonationListQuery): Observable<DonationDashboardData> {
    const chip = normalizeDonationChip(query.chipId);
    const params = {
      pageIndex: query.pageIndex,
      pageSize: query.pageSize,
      ...buildDonationApiFilter(chip, query.criteria ?? {}, query.searchText, query.refData),
    } as any;
    const request = chip === 'mine'
      ? this.donationApi.donationControllerGetSelfDonations(params)
      : this.donationApi.donationControllerList(params);
    return request.pipe(map(response => {
      const page: any = response.responsePayload;
      return {
        donations: {
          content: (page?.content ?? page?.items ?? []).map(mapDonationDto),
          totalSize: page?.totalSize ?? page?.total ?? 0,
          pageIndex: page?.pageIndex ?? query.pageIndex,
          pageSize: page?.pageSize ?? query.pageSize,
        },
        accounts: [],
      };
    }));
  }

  fetchDonationById(id: string, scope: 'mine' | 'all' = 'all') {
    return this.loadDonationPage({
      chipId: scope === 'mine' ? 'mine' : 'all_outstanding',
      criteria: { donationId: id },
      pageIndex: 0,
      pageSize: 1,
    }).pipe(map(result => result.donations.content?.[0]));
  }

  fetchDonationDonors() {
    return this.donorApi.donorControllerList({
      pageIndex: 0, pageSize: 500, status: 'ACTIVE', sortBy: 'fullName', sortDir: 'asc',
    }).pipe(map(response => {
      const page: any = response.responsePayload;
      return {
        content: (page?.content ?? []).map((item: any) => ({
          id: item.id,
          fullName: item.fullName ?? item.id,
          status: item.status,
          type: item.type,
          preferredAmount: item.preferredAmount != null
            ? Number(item.preferredAmount) : undefined,
        } satisfies DonationDonorOption)),
        totalSize: page?.totalSize ?? 0,
        pageIndex: page?.pageIndex ?? 0,
        pageSize: page?.pageSize ?? 500,
      };
    }));
  }

  fetchDonationAccounts() {
    return this.accountApi.accountControllerPayableAccount().pipe(
      map(response => (response.responsePayload ?? []).map(mapAccountDtoToAccount)),
    );
  }

  fetchDonationDocuments(id: string) {
    return this.dmsApi.dms2ControllerListDocuments({ entityType: 'DONATION', entityId: id })
      .pipe(map(response => (response.responsePayload?.data ?? []).map(mapDocDtoToDoc)));
  }

  fetchDonationRefData() {
    return this.donationApi.donationControllerGetReferenceData().pipe(map(r => r.responsePayload));
  }

  fetchDonationEvents(): Observable<FieldOption[]> {
    return this.activityApi.fetchActivities(0, 500).pipe(
      map(page => (page.content ?? []).map(item => ({ key: item.id, label: item.name }))),
      catchError(() => of([])),
    );
  }

  createDonation(value: Donation, isGuest: boolean) {
    const request = isGuest
      ? this.donationApi.donationControllerCreateGuestDonation({ body: {
          amount: value.amount, forEventId: value.forEvent, donorEmail: value.donorEmail,
          donorName: value.donorName, donorNumber: value.donorPhone,
        } })
      : this.donationApi.donationControllerCreateDonation({ body: {
          amount: value.amount, donorId: value.donorId, type: value.type,
          ...(value.forEvent ? { forEventId: value.forEvent } : {}),
          ...(value.startDate ? { startDate: value.startDate } : {}),
          ...(value.endDate ? { endDate: value.endDate } : {}),
        } });
    return request.pipe(map(r => mapDonationDto(r.responsePayload)));
  }

  updateDonation(id: string, value: Partial<Donation>, documents: FileUpload[] = []) {
    const body: UpdateDonationDto = removeNullFields({
      amount: value.amount, status: value.status, forEvent: value.forEvent,
      paidOn: value.paidOn, paidToAccountId: value.paidToAccountId,
      paymentMethod: value.paymentMethod, paidUsingUPI: value.paidUsingUPI,
      remarks: value.cancelletionReason ?? value.laterPaymentReason
        ?? value.paymentFailureDetail ?? value.remarks,
    });
    return this.donationApi.donationControllerUpdate({ id, body }).pipe(
      map(r => r.responsePayload),
      switchMap(dto => {
        if (!documents.length) return of(dto);
        const uploads: UploadDocumentRequestDto[] = documents.map(document => ({
          contentType: document.detail.contentType,
          fileBase64: document.detail.base64Content,
          fileName: document.detail.originalFileName,
          mappings: [
            { entityId: id, entityType: 'DONATION' },
            ...(dto.transactionRef
              ? [{ entityId: dto.transactionRef, entityType: 'TRANSACTION' as const }]
              : []),
          ],
        }));
        return this.uploadDonationDocuments(uploads).pipe(map(() => dto));
      }),
      map(mapDonationDto),
    );
  }

  uploadDonationDocuments(documents: UploadDocumentRequestDto[]) {
    return forkJoin(documents.map(body =>
      this.dmsApi.dms2ControllerUploadDocument({ body }).pipe(map(r => r.responsePayload)),
    ));
  }
}
