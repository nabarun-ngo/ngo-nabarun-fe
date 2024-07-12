import { Injectable } from '@angular/core';
import { Observable, combineLatest, forkJoin, map } from 'rxjs';
import { DocumentDetailUpload, DonationDetail, DonationStatus, DonationType, RefDataType } from 'src/app/core/api/models';
import { AccountControllerService, CommonControllerService, DonationControllerService, EventControllerService, UserControllerService } from 'src/app/core/api/services';
import { UserIdentityService } from 'src/app/core/service/user-identity.service';

@Injectable({
  providedIn: 'root'
})
export class DonationService {
  

  constructor(
    private donationController: DonationControllerService,
    private userController: UserControllerService,
    private commonController: CommonControllerService,
    private eventController: EventControllerService,
    private identityService: UserIdentityService,
    private accountController: AccountControllerService,

  ) { }


  fetchMyDonations(pageIndex: number = 0, pageSize: number = 100) {
    let id = this.identityService.getUser().profile_id;
    return combineLatest({
      donations: this.donationController.getLoggedInUserDonations({ pageIndex: pageIndex, pageSize: pageSize }).pipe(map(d => d.responsePayload)),
      summary: this.donationController.getDonationSummary({ id: id, includeOutstandingMonths: true, includePayableAccount: true }).pipe(map(d => d.responsePayload))
    })
  }

  fetchGuestDonations(pageIndex: number = 0, pageSize: number = 100) {
    return this.donationController.getDonations({ pageIndex: pageIndex, pageSize: pageSize, filter: { isGuest: true } }).pipe(map(d => d.responsePayload));
  }

  fetchMembers(pageIndex: number = 0, pageSize: number = 100) {
    return this.userController.getUsers({ pageIndex: pageIndex, pageSize: pageSize ,filter:{}}).pipe(map(m => m.responsePayload));
  }

  fetchUserDonations(id: string, pageIndex: number = 0, pageSize: number = 100) {
    return combineLatest({
      donations: this.donationController.getUserDonations({ id: id, pageIndex: pageIndex, pageSize: pageSize }).pipe(map(d => d.responsePayload)),
      summary: this.donationController.getDonationSummary({ id: id, includeOutstandingMonths: true }).pipe(map(d => d.responsePayload))
    })
  }

  fetchDocuments(id: string) {
    return this.donationController.getDonationDocuments({ id: id }).pipe(map(m => m.responsePayload));
  }

  fetchEvents() {
    return this.eventController.getSocialEvents().pipe(map(m => m.responsePayload));
  }

  fetchRefData(type?:DonationType,status?:DonationStatus) {
    return this.commonController.getReferenceData({ names: [RefDataType.Donation], currentDonationStatus:status,donationType:type}).pipe(map(d => d.responsePayload));
  }

  updateDonation(id: string, details: DonationDetail) {
    return this.donationController.updateDonation({ id: id, body: details }).pipe(map(d => d.responsePayload));
  }

  uploadDocuments(id:string,documents:DocumentDetailUpload[]){
    return this.commonController.uploadDocuments1({body:documents,docIndexId:id,docIndexType:'DONATION'})
  }

  updatePaymentInfo(id:string,donation:DonationDetail){
    return this.donationController.payments({action:'NOTIFY',id:id,body:{
      isPaymentNotified:donation.isPaymentNotified,
    }})
  }

  createDonation(donation: DonationDetail) {
    return this.donationController.raiseDonation({body:donation}).pipe(map(d => d.responsePayload));
  }

  getPayableAccounts() {
    return this.accountController.getAccounts({filter:{status:['ACTIVE'],type:['DONATION']}}).pipe(map(d => d.responsePayload));
  }
  
}
