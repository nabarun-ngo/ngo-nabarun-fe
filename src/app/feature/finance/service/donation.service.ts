import { Injectable } from '@angular/core';
import { combineLatest, firstValueFrom, map, forkJoin, switchMap, of, Observable } from 'rxjs';
import {
    DonationDto,
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
import { date } from 'src/app/core/service/utilities.service';
import { DonationDefaultValue } from '../finance.const';
import {
    Donation,
    DonationSummary,
    PagedDonations,
    Account,
    mapDonationDtoToDonation,
    mapPagedDonationDtoToPagedDonations,
    mapDonationSummaryDtoToDonationSummary,
    mapAccountDtoToAccount
} from '../model';

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
        filter?: { donationId?: string, donationStatus?: string[], startDate?: string, endDate?: string, donationType?: string[] }
    }): Observable<PagedDonations> {
        const param: any = {};

        if (options.filter) {
            if (options.filter.donationId) param.donationId = options.filter.donationId;
            if (options.filter.donationStatus?.length) param.status = [options.filter.donationStatus, 'default'];
            if (options.filter.donationType?.length) param.type = [options.filter.donationType, 'default'];
            if (options.filter.startDate) param.startDate = new Date(options.filter.startDate).toISOString();
            if (options.filter.endDate) param.endDate = new Date(options.filter.endDate).toISOString();
        }

        return this.donationController.getSelfDonations({
            pageIndex: options.pageIndex || DonationDefaultValue.pageNumber,
            pageSize: options.pageSize || DonationDefaultValue.pageSize,
            ...param
        }).pipe(
            map(d => d.responsePayload),
            map(mapPagedDonationDtoToPagedDonations)
        );
    }

    /**
     * Fetch current user's donations with summary and payable accounts
     * @param options Pagination options
     * @returns Promise of donations, summary, and accounts (domain models)
     */
    async fetchMyDonations(options: {
        pageIndex?: number,
        pageSize?: number
    }): Promise<{ donations: PagedDonations; summary: DonationSummary; accounts: Account[] }> {
        const id = (await this.identityService.getUser()).profile_id;
        return firstValueFrom(combineLatest({
            donations: this.donationController.getSelfDonations({
                pageIndex: options.pageIndex || DonationDefaultValue.pageNumber,
                pageSize: options.pageSize || DonationDefaultValue.pageSize
            }).pipe(
                map(d => d.responsePayload),
                map(mapPagedDonationDtoToPagedDonations)
            ),
            summary: this.donationController.getDonationSummary({ donorId: id }).pipe(
                map(d => d.responsePayload),
                map(mapDonationSummaryDtoToDonationSummary)
            ),
        }).pipe(switchMap(data => {
            if (data.summary.hasOutstanding) {
                return this.accountController.payableAccount({ isTransfer: false }).pipe(
                    map(d => d.responsePayload),
                    map(m => m.map(mapAccountDtoToAccount)),
                    map(accounts => ({ ...data, accounts: accounts }))
                );
            }
            return of({ ...data, accounts: [] });
        })));
    }

    /**
     * Fetch guest donations with pagination
     * @param options Pagination options
     * @returns Observable of paged donation results (domain model)
     */
    fetchGuestDonations(options: {
        pageIndex?: number,
        pageSize?: number
    }): Observable<PagedDonations> {
        return this.donationController.listGuestDonations({
            pageIndex: options.pageIndex || DonationDefaultValue.pageNumber,
            pageSize: options.pageSize || DonationDefaultValue.pageSize
        }).pipe(
            map(d => d.responsePayload),
            map(mapPagedDonationDtoToPagedDonations)
        );
    }

    /**
     * Fetch all donations with pagination
     * @param options Pagination options
     * @returns Observable of paged donation results (domain model)
     */
    fetchDonations(options: {
        pageIndex?: number,
        pageSize?: number
    }): Observable<PagedDonations> {
        return this.donationController.list({
            pageIndex: options.pageIndex || DonationDefaultValue.pageNumber,
            pageSize: options.pageSize || DonationDefaultValue.pageSize
        }).pipe(
            map(d => d.responsePayload),
            map(mapPagedDonationDtoToPagedDonations)
        );
    }

    fetchMembers(options: {
        pageIndex?: number,
        pageSize?: number,
        filter?: { firstName?: string; lastName?: string, status?: string[] }
    }) {
        return this.userController.listUsers({
            pageIndex: options.pageIndex || DonationDefaultValue.pageNumber,
            pageSize: options.pageSize || DonationDefaultValue.pageSize,
            firstName: options.filter?.firstName,
            lastName: options.filter?.lastName,
            // status: filter?.status ? filter.status : ['ACTIVE'] 
        }).pipe(map(m => m.responsePayload));
    }

    /**
     * Fetch donations for a specific user with summary
     * @param id User ID
     * @param options Pagination options
     * @returns Observable of donations and summary (domain models)
     */
    fetchUserDonations(id: string, options: {
        pageIndex?: number,
        pageSize?: number
    }): Observable<{ donations: PagedDonations; summary: DonationSummary }> {
        return combineLatest({
            donations: this.donationController.getDonorDonations({
                donorId: id,
                pageIndex: options.pageIndex || DonationDefaultValue.pageNumber,
                pageSize: options.pageSize || DonationDefaultValue.pageSize
            }).pipe(
                map(d => d.responsePayload),
                map(mapPagedDonationDtoToPagedDonations)
            ),
            summary: this.donationController.getDonationSummary({ donorId: id }).pipe(
                map(d => d.responsePayload),
                map(mapDonationSummaryDtoToDonationSummary)
            )
        });
    }

    fetchDocuments(id: string) {
        return this.dmsService.getDocuments({ type: 'DONATION', id: id }).pipe(map(m => m.responsePayload));
    }

    /**
     * Update a donation
     * @param id Donation ID
     * @param details Donation details (API DTO format)
     * @returns Observable of updated donation (domain model)
     */
    updateDonation(id: string, details: DonationDto): Observable<Donation> {
        return this.donationController.update({ id: id, body: details as any }).pipe(
            map(d => d.responsePayload),
            map(mapDonationDtoToDonation)
        );
    }

    uploadDocuments(documents: DmsUploadDto[]) {
        // Assuming uploadDocuments expects an array of upload DTOs
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
    updatePaymentInfo(id: string, action: string, donation: UpdateDonationDto): Observable<Donation> | undefined {
        if (action === 'NOTIFY') {
            return undefined;
        }
        return this.donationController.update({ id: id, body: donation }).pipe(
            map(d => d.responsePayload),
            map(mapDonationDtoToDonation)
        );
    }

    /**
     * Create a new donation
     * @param donation Donation details (API DTO format)
     * @returns Observable of created donation (domain model)
     */
    createDonation(donation: any): Observable<Donation> {
        return this.donationController.createDonation({ body: donation }).pipe(
            map(d => d.responsePayload),
            map(mapDonationDtoToDonation)
        );
    }

    fetchRefData() {
        return this.donationController.getReferenceData().pipe(map(d => d.responsePayload));
    }

    /**
     * Advanced search for donations
     * @param filter Search filter criteria
     * @returns Observable of paged donation results (domain model)
     */
    advancedSearch(filter: {
        donationId?: string,
        donationStatus?: string[],
        donorName?: string,
        startDate?: string,
        endDate?: string,
        donationType?: string[],
        guest: boolean,
        donorId?: string
    }): Observable<PagedDonations> {
        return this.donationController.list({
            donationId: filter.donationId,
            status: filter.donationStatus as any,
            donorName: filter.donorName,
            startDate: filter.startDate ? date(filter.startDate, 'yyyy-MM-dd') : undefined,
            endDate: filter.endDate ? date(filter.endDate, 'yyyy-MM-dd') : undefined,
            type: filter.donationType as any,
            isGuest: filter.guest,
            donorId: filter.donorId,
            pageIndex: DonationDefaultValue.pageNumber,
            pageSize: DonationDefaultValue.pageSize
        }).pipe(
            map(d => d.responsePayload),
            map(mapPagedDonationDtoToPagedDonations)
        );
    }

    async getMyId() {
        return (await this.identityService.getUser()).profile_id;
    }

    notifyPayment(rowIndex: number) {
        throw new Error('Method not implemented.');
    }

}
