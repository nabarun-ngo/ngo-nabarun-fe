import { Injectable } from '@angular/core';
import { combineLatest, firstValueFrom, map, forkJoin } from 'rxjs';
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

@Injectable({
    providedIn: 'root'
})
export class DonationNewService {

    constructor(
        private donationController: DonationControllerService,
        private userController: UserControllerService,
        private identityService: UserIdentityService,
        private accountController: AccountControllerService,
        private dmsService: DmsControllerService
    ) { }


    async fetchMyDonations(pageIndex: number = 0, pageSize: number = 100) {
        let id = (await this.identityService.getUser()).profile_id;
        return firstValueFrom(combineLatest({
            donations: this.donationController.getSelfDonations({ pageIndex: pageIndex, pageSize: pageSize }).pipe(map(d => d.responsePayload)),
            summary: this.donationController.getDonationSummary({ donorId: id }).pipe(map(d => d.responsePayload)),
        }))
    }

    fetchGuestDonations(pageIndex: number = 0, pageSize: number = 100) {
        return this.donationController.listGuestDonations({ pageIndex: pageIndex, pageSize: pageSize }).pipe(map(d => d.responsePayload));
    }

    fetchDonations(pageIndex: number = 0, pageSize: number = 100) {
        return this.donationController.list({ pageIndex: pageIndex, pageSize: pageSize }).pipe(map(d => d.responsePayload));
    }

    fetchMembers(pageIndex: number = 0, pageSize: number = 100, filter?: { firstName?: string; lastName?: string, status?: string[] }) {
        return this.userController.listUsers({
            pageIndex: pageIndex,
            pageSize: pageSize,
            firstName: filter?.firstName,
            lastName: filter?.lastName,
            // status: filter?.status ? filter.status : ['ACTIVE'] 
        }).pipe(map(m => m.responsePayload));
    }

    fetchUserDonations(id: string, pageIndex: number = 0, pageSize: number = 100) {
        return combineLatest({
            donations: this.donationController.getDonorDonations({ donorId: id, pageIndex: pageIndex, pageSize: pageSize }).pipe(map(d => d.responsePayload)),
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
            //return this.donationController.notify({ id: id, body: donation }).pipe(map(d => d.responsePayload));
        }
        return this.donationController.update({ id: id, body: donation }).pipe(map(d => d.responsePayload));
    }

    createDonation(donation: any) {
        return this.donationController.createDonation({ body: donation }).pipe(map(d => d.responsePayload));
    }

    getPayableAccounts() {
        return this.accountController.listAccounts({
            status: ['ACTIVE'], type: ['DONATION'],
            pageIndex: 0,
            pageSize: 10000
        }).pipe(map(d => d.responsePayload));
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
            pageIndex: 0,
            pageSize: 10000
        }).pipe(map(d => d.responsePayload));
    }

    async getMyId() {
        return (await this.identityService.getUser()).profile_id;
    }

}
