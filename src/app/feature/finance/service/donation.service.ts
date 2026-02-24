import { Injectable } from '@angular/core';
import { combineLatest, map, forkJoin, switchMap, of, Observable } from 'rxjs';
import {
    DmsUploadDto,
    UpdateDonationDto
} from 'src/app/core/api-client/models';
import {
    AccountControllerService,
    DonationControllerService,
    UserControllerService,
    DmsControllerService
} from 'src/app/core/api-client/services';
import { UserIdentityService } from 'src/app/core/service/user-identity.service';
import { date, removeNullFields } from 'src/app/core/service/utilities.service';
import { DonationDefaultValue } from '../finance.const';
import {
    Donation,
    DonationSummary,
    PagedDonations,
    Account,
    mapDonationDtoToDonation,
    mapPagedDonationDtoToPagedDonations,
    mapDonationSummaryDtoToDonationSummary,
    mapAccountDtoToAccount,
    DonationDashboardData
} from '../model';
import { mapDocDtoToDoc } from 'src/app/shared/model/document.model';
import { from } from 'rxjs';
import { FileUpload } from 'src/app/shared/components/generic/file-upload/file-upload.component';
import { mapPagedUserDtoToPagedUser } from '../../member/models/member.mapper';

@Injectable({
    providedIn: 'root'
})
export class DonationService {

    constructor(
        private donationController: DonationControllerService,
        private userController: UserControllerService,
        private identityService: UserIdentityService,
        private accountController: AccountControllerService,
        private dmsService: DmsControllerService
    ) { }

    /**
     * Get self donations with filtering and pagination
     * @param options Filter and pagination options
     * @returns Observable of paged donation results (domain model)
     */
    getSelfDonations(options: {
        pageIndex?: number,
        pageSize?: number,
        filter?: { donationId?: string, donationStatus?: string[], startDate?: string, endDate?: string, donationType?: string[], forEventId?: string }
        skipSummary?: boolean,
        skipAccounts?: boolean
    }): Observable<DonationDashboardData> {
        return from(this.identityService.getUser()).pipe(
            map(user => user.profile_id),
            switchMap(donorId =>
                combineLatest({
                    donations: this.donationController.getSelfDonations({
                        pageIndex: options.pageIndex || DonationDefaultValue.pageNumber,
                        pageSize: options.pageSize || DonationDefaultValue.pageSize,
                        donationId: options.filter?.donationId,
                        status: options.filter?.donationStatus as any,
                        type: options.filter?.donationType as any,
                        startDate: options.filter?.startDate,
                        endDate: options.filter?.endDate,
                    }).pipe(
                        map(d => d.responsePayload),
                        map(mapPagedDonationDtoToPagedDonations)
                    ),
                    summary: options.skipSummary ? of(undefined) : this.donationController.getDonationSummary({ donorId }).pipe(
                        map(res => res.responsePayload),
                        map(mapDonationSummaryDtoToDonationSummary)
                    ),
                })
            ),
            switchMap(data => {
                if (options.skipAccounts || !data.summary?.hasOutstanding) {
                    return of({ ...data, accounts: [] });
                }
                return this.fetchPayableAccounts().pipe(
                    map(accounts => ({ ...data, accounts }))
                );
            })
        );
    }

    fetchPayableAccounts(): Observable<Account[]> {
        return this.accountController.payableAccount({ isTransfer: false }).pipe(
            map(res => res.responsePayload),
            map(accounts => accounts.map(mapAccountDtoToAccount))
        );
    }

    /**
     * Fetch guest donations with pagination
     * @param options Pagination options
     * @returns Observable of paged donation results (domain model)
     */
    fetchGuestDonations(options: {
        pageIndex?: number,
        pageSize?: number
        filter?: { donationId?: string, donationStatus?: string[], startDate?: string, endDate?: string, donationType?: string[], forEventId?: string, donorName?: string }
    }): Observable<DonationDashboardData> {
        return this.donationController.listGuestDonations({
            pageIndex: options.pageIndex ?? DonationDefaultValue.pageNumber,
            pageSize: options.pageSize ?? DonationDefaultValue.pageSize,
            donationId: options.filter?.donationId,
            status: options.filter?.donationStatus as any,
            type: options.filter?.donationType as any,
            startDate: options.filter?.startDate ? date(options.filter.startDate, 'yyyy-MM-dd') : undefined,
            endDate: options.filter?.endDate ? date(options.filter.endDate, 'yyyy-MM-dd') : undefined,
            donorName: options.filter?.donorName,
        }).pipe(
            map(res => res.responsePayload),
            map(mapPagedDonationDtoToPagedDonations),
            map(donations => ({
                donations,
                summary: undefined,
                accounts: []
            }))
        );
    }

    /**
     * Fetch all donations with pagination
     * @param options Pagination options
     * @returns Observable of paged donation results (domain model)
     */
    fetchDonations(options: {
        pageIndex?: number,
        pageSize?: number,
        filter?: { donationId?: string, donationStatus?: string[], startDate?: string, endDate?: string, donationType?: string[], forEventId?: string, donorId?: string, donorName?: string }
    }): Observable<DonationDashboardData> {
        return this.donationController.list({
            pageIndex: options.pageIndex || DonationDefaultValue.pageNumber,
            pageSize: options.pageSize || DonationDefaultValue.pageSize,
            donationId: options.filter?.donationId,
            status: options.filter?.donationStatus as any,
            type: options.filter?.donationType as any,
            startDate: options.filter?.startDate ? date(options.filter.startDate, 'yyyy-MM-dd') : undefined,
            endDate: options.filter?.endDate ? date(options.filter.endDate, 'yyyy-MM-dd') : undefined,
            donorId: options.filter?.donorId,
            donorName: options.filter?.donorName,
        }).pipe(
            map(d => d.responsePayload),
            map(mapPagedDonationDtoToPagedDonations),
            map(donations => ({
                donations,
                summary: undefined,
                accounts: []
            }))
        );
    }

    fetchMembers(options: {
        pageIndex?: number,
        pageSize?: number,
        filter?: { firstName?: string; lastName?: string, }
    }) {
        return this.userController.listUsers({
            pageIndex: options.pageIndex || DonationDefaultValue.pageNumber,
            pageSize: options.pageSize || DonationDefaultValue.pageSize,
            firstName: options.filter?.firstName,
            lastName: options.filter?.lastName,
        }).pipe(map(m => m.responsePayload), map(mapPagedUserDtoToPagedUser));
    }


    /**
     * Fetch donations for a specific user with summary
     * @param id User ID
     * @param options Pagination options
     * @returns Observable of donations and summary (domain models)
     */
    fetchUserDonations(id: string, options: {
        pageIndex?: number,
        pageSize?: number,
        filter?: { donationId?: string, donationStatus?: string[], startDate?: string, endDate?: string, donationType?: string[], forEventId?: string }
        skipSummary?: boolean
    }): Observable<DonationDashboardData> {
        return combineLatest({
            donations: this.donationController.getMemberDonations({
                memberId: id,
                pageIndex: options.pageIndex || DonationDefaultValue.pageNumber,
                pageSize: options.pageSize || DonationDefaultValue.pageSize,
                startDate: options.filter?.startDate ? date(options.filter.startDate, 'yyyy-MM-dd') : undefined,
                endDate: options.filter?.endDate ? date(options.filter.endDate, 'yyyy-MM-dd') : undefined,
                ...options.filter
            } as any).pipe(
                map(d => d.responsePayload),
                map(mapPagedDonationDtoToPagedDonations)
            ),
            summary: options.skipSummary ? of(undefined) : this.donationController.getDonationSummary({ donorId: id }).pipe(
                map(d => d.responsePayload),
                map(mapDonationSummaryDtoToDonationSummary)
            ),
            accounts: of([])
        });
    }

    fetchDocuments(id: string) {
        return this.dmsService.getDocuments({ type: 'DONATION', id: id }).pipe(map(m => m.responsePayload), map(m => m.map(mapDocDtoToDoc)));
    }

    /**
     * Update a donation
     * @param id Donation ID
     * @param details Donation details (API DTO format)
     * @returns Observable of updated donation (domain model)
     */
    updateDonation(id: string, details: Donation, documents?: FileUpload[]): Observable<Donation> {
        const updateDonation: UpdateDonationDto = {
            amount: details.amount,
            status: details.status,
            forEvent: details.forEvent,
            paidOn: details.paidOn,
            paidToAccountId: details.paidToAccountId,
            paymentMethod: details.paymentMethod,
            paidUsingUPI: details.paidUsingUPI,
            remarks: details.remarks
        }
        return this.donationController.update({ id: id, body: removeNullFields(updateDonation) }).pipe(
            map(d => d.responsePayload),
            switchMap((donation) => {
                if (documents && documents.length > 0) {
                    const uploadDtos: DmsUploadDto[] = documents.map(doc => ({
                        contentType: doc.detail.contentType,
                        fileBase64: doc.detail.base64Content,
                        filename: doc.detail.originalFileName,
                        documentMapping: [
                            {
                                entityId: id,
                                entityType: 'DONATION'
                            },
                        ]
                    }));
                    if (donation.transactionRef) {
                        uploadDtos.map(doc => doc.documentMapping.push({
                            entityId: donation.transactionRef!,
                            entityType: 'TRANSACTION'
                        }));
                    }
                    return this.uploadDocuments(uploadDtos).pipe(map(() => donation));
                }
                return of(donation);
            }),
            map(mapDonationDtoToDonation)
        );
    }

    uploadDocuments(documents: DmsUploadDto[]) {
        return forkJoin(documents.map(doc =>
            this.dmsService.uploadFile({ body: doc }).pipe(map(d => d.responsePayload))
        ));
    }

    /**
     * Update payment information for a donation
     * @param id Donation ID
     * @param action Action to perform
     * @param donation Donation update details (API DTO format)
     * @returns Observable of updated donation (domain model) or undefined if action is NOTIFY
     */
    updatePaymentInfo(id: string, action: string, donation: Donation): Observable<Donation> | undefined {
        if (action === 'NOTIFY') {
            return undefined;
        }
        const donationDto: UpdateDonationDto = {
            amount: donation.amount,
            status: donation.status,

        };
        return this.donationController.update({ id: id, body: donationDto }).pipe(
            map(d => d.responsePayload),
            map(mapDonationDtoToDonation)
        );
    }

    /**
     * Create a new donation
     * @param donation Donation details (API DTO format)
     * @returns Observable of created donation (domain model)
     */
    createDonation(donation: Donation, isGuest: boolean): Observable<Donation> {
        if (isGuest) {
            return this.donationController.createGuestDonation({
                body: {
                    amount: donation.amount,
                    forEventId: donation.forEvent,
                    donorEmail: donation.donorEmail,
                    donorName: donation.donorName,
                    donorNumber: donation.donorPhone,
                }
            }).pipe(
                map(d => d.responsePayload),
                map(mapDonationDtoToDonation)
            );
        }
        return this.donationController.createDonation({
            body: {
                amount: donation.amount,
                ...donation.forEvent ? { forEventId: donation.forEvent } : {},
                donorId: donation.donorId,
                type: donation.type,
                ...donation.endDate ? { endDate: donation.endDate } : {},
                ...donation.startDate ? { startDate: donation.startDate } : {},
            }
        }).pipe(
            map(d => d.responsePayload),
            map(mapDonationDtoToDonation)
        );
    }

    fetchRefData() {
        return this.donationController.getReferenceData().pipe(map(d => d.responsePayload));
    }

}
