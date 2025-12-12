import { Injectable } from '@angular/core';
import { combineLatest, firstValueFrom, map, forkJoin, switchMap, of } from 'rxjs';
import {
    DonationDto,
    DonationSummaryDto,
    UserDto,
    DmsUploadDto,
    DocumentDto,
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
import { DonationDefaultValue } from './donation.const';

@Injectable({
    providedIn: 'root'
})
export class DonationNewService {
    notifyPayment(rowIndex: number) {
        throw new Error('Method not implemented.');
    }

    constructor(
        private donationController: DonationControllerService,
        private userController: UserControllerService,
        private identityService: UserIdentityService,
        private accountController: AccountControllerService,
        private dmsService: DmsControllerService
    ) { }

    getSelfDonations(options: {
        pageIndex?: number,
        pageSize?: number,
        filter?: { donationId?: string, donationStatus?: string[], startDate?: string, endDate?: string, donationType?: string[] }
    }) {
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
        }).pipe(map(d => d.responsePayload));
    }

    async fetchMyDonations(options: {
        pageIndex?: number,
        pageSize?: number
    }) {
        let id = (await this.identityService.getUser()).profile_id;
        return firstValueFrom(combineLatest({
            donations: this.donationController.getSelfDonations({
                pageIndex: options.pageIndex || DonationDefaultValue.pageNumber,
                pageSize: options.pageSize || DonationDefaultValue.pageSize
            }).pipe(map(d => d.responsePayload)),
            summary: this.donationController.getDonationSummary({ donorId: id }).pipe(map(d => d.responsePayload)),
        }).pipe(switchMap(data => {
            if (data.summary.hasOutstanding) {
                return this.accountController.payableAccount({ isTransfer: false }).pipe(map(d => d.responsePayload)).pipe(
                    map(accounts => ({ ...data, accounts }))
                );
            }
            return of({ ...data, accounts: [] });
        })))
    }

    fetchGuestDonations(options: {
        pageIndex?: number,
        pageSize?: number
    }) {
        return this.donationController.listGuestDonations({
            pageIndex: options.pageIndex || DonationDefaultValue.pageNumber,
            pageSize: options.pageSize || DonationDefaultValue.pageSize
        }).pipe(map(d => d.responsePayload));
    }

    fetchDonations(options: {
        pageIndex?: number,
        pageSize?: number
    }) {
        return this.donationController.list({
            pageIndex: options.pageIndex || DonationDefaultValue.pageNumber,
            pageSize: options.pageSize || DonationDefaultValue.pageSize
        }).pipe(map(d => d.responsePayload));
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

    fetchUserDonations(id: string, options: {
        pageIndex?: number,
        pageSize?: number
    }) {
        return combineLatest({
            donations: this.donationController.getDonorDonations({
                donorId: id,
                pageIndex: options.pageIndex || DonationDefaultValue.pageNumber,
                pageSize: options.pageSize || DonationDefaultValue.pageSize
            }).pipe(map(d => d.responsePayload)),
            summary: this.donationController.getDonationSummary({ donorId: id }).pipe(map(d => d.responsePayload))
        })
    }

    fetchDocuments(id: string) {
        return this.dmsService.getDocuments({ type: 'DONATION', id: id }).pipe(map(m => m.responsePayload));
    }

    updateDonation(id: string, details: DonationDto) {
        return this.donationController.update({ id: id, body: details as any }).pipe(map(d => d.responsePayload));
    }

    uploadDocuments(documents: DmsUploadDto[]) {
        // Assuming uploadDocuments expects an array of upload DTOs
        return forkJoin(documents.map(doc =>
            this.dmsService.uploadFile({ body: doc }).pipe(map(d => d.responsePayload))
        ));
    }

    updatePaymentInfo(id: string, action: string, donation: UpdateDonationDto) {
        if (action === 'NOTIFY') {
            return
        }
        return this.donationController.update({ id: id, body: donation }).pipe(map(d => d.responsePayload));
    }

    createDonation(donation: any) {
        return this.donationController.createDonation({ body: donation }).pipe(map(d => d.responsePayload));
    }

    fetchRefData() {
        return this.donationController.getReferenceData().pipe(map(d => d.responsePayload));
    }

    advancedSearch(filter: {
        donationId?: string,
        donationStatus?: string[],
        donorName?: string,
        startDate?: string,
        endDate?: string,
        donationType?: string[],
        guest: boolean,
        donorId?: string
    }) {

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
        }).pipe(map(d => d.responsePayload));
    }

    async getMyId() {
        return (await this.identityService.getUser()).profile_id;
    }

}
