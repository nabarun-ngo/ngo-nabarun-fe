import { Injectable } from '@angular/core';
import { Observable, combineLatest, firstValueFrom, forkJoin, map } from 'rxjs';
import { DocumentDetailUpload, DonationDetail, DonationDetailFilter, DonationStatus, DonationType, RefDataType, UserDetailFilter } from 'src/app/core/api/models';
import { AccountControllerService, CommonControllerService, DonationControllerService, EventControllerService, UserControllerService } from 'src/app/core/api/services';
import { UserIdentityService } from 'src/app/core/service/user-identity.service';
import { date } from 'src/app/core/service/utilities.service';

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


  async fetchMyDonations(pageIndex: number = 0, pageSize: number = 100) {
    let id =  (await this.identityService.getUser()).profile_id;
    return firstValueFrom(combineLatest({
      donations: this.donationController.getLoggedInUserDonations({ pageIndex: pageIndex, pageSize: pageSize, filter:{}}).pipe(map(d => d.responsePayload)),
      summary: this.donationController.getDonationSummary({ donorId: id, includeOutstandingMonths: true, includePayableAccount: true }).pipe(map(d => d.responsePayload)),
    }))
  }

  fetchGuestDonations(pageIndex: number = 0, pageSize: number = 100) {
    return this.donationController.getDonations({ pageIndex: pageIndex, pageSize: pageSize, filter: { isGuest: true } }).pipe(map(d => d.responsePayload));
  }
  fetchDonations(pageIndex: number = 0, pageSize: number = 100) {
    return this.donationController.getDonations({ pageIndex: pageIndex, pageSize: pageSize, filter: {} }).pipe(map(d => d.responsePayload));
  }
  fetchMembers(pageIndex: number = 0, pageSize: number = 100,filter?:{firstName?:string;lastName?:string,status?:string[]}) {
    let memberFilter:UserDetailFilter={};
    if(filter){
      if(filter.firstName){
        memberFilter.firstName=filter.firstName
      }
      if(filter.lastName){
        memberFilter.lastName=filter.lastName
      }
      if(filter.status){
        memberFilter.status=filter.status as any
      }
    }else{
      memberFilter.status=['ACTIVE','INACTIVE']
    }
    return this.userController.getUsers({ pageIndex: pageIndex, pageSize: pageSize ,filter:memberFilter}).pipe(map(m => m.responsePayload));
  }

  fetchUserDonations(id: string, pageIndex: number = 0, pageSize: number = 100) {
    return combineLatest({
      donations: this.donationController.getDonations({ filter:{ donorId: id }, pageIndex: pageIndex, pageSize: pageSize }).pipe(map(d => d.responsePayload)),
      summary: this.donationController.getDonationSummary({ donorId: id, includeOutstandingMonths: true }).pipe(map(d => d.responsePayload))
    })
  }

  fetchDocuments(id: string) {
    return this.donationController.getDonationDocuments({ id: id }).pipe(map(m => m.responsePayload));
  }

  fetchEvents() {
    return this.eventController.getSocialEvents().pipe(map(m => m.responsePayload));
  }

  // fetchRefData(type?:DonationType,status?:DonationStatus) {
  //   return this.commonController.getReferenceData({ names: [RefDataType.Donation,RefDataType.User], currentDonationStatus:status,donationType:type}).pipe(map(d => d.responsePayload));
  // }

  updateDonation(id: string, details: DonationDetail) {
    return this.donationController.updateDonation({ id: id, body: details }).pipe(map(d => d.responsePayload));
  }

  uploadDocuments(id:string,documents:DocumentDetailUpload[]){
    return this.commonController.uploadDocuments({body:documents,docIndexId:id,docIndexType:'DONATION'}).pipe(map(d => d.responsePayload));
  }

  updatePaymentInfo(id:string,action:string,donation:DonationDetail){
    return this.donationController.payments({action:action,id:id,body:{
      isPaymentNotified:donation.isPaymentNotified,
    }}).pipe(map(d => d.responsePayload));
  }

  createDonation(donation: DonationDetail) {
    return this.donationController.raiseDonation({body:donation}).pipe(map(d => d.responsePayload));
  }

  getPayableAccounts() {
    return this.accountController.getAccounts({filter:{status:['ACTIVE'],type:['DONATION']}}).pipe(map(d => d.responsePayload));
  }

  advancedSearch(filter:{
    donationId?:string,
    donationStatus?:string[],
    donorName?:string,
    startDate?:string,
    endDate?:string,
    donationType?:string[],
    guest:boolean,
    donorId?:string
  }){
    console.log(filter)
    let filterOps:DonationDetailFilter={};
    if(filter.donationId){
      filterOps.donationId=filter.donationId
    }
    if(filter.donationStatus){
      filterOps.donationStatus=filter.donationStatus as any
    }
    if(filter.startDate){
      filterOps.fromDate=date(filter.startDate,'yyyy-MM-dd')
    }
    if(filter.endDate){
      filterOps.toDate=date(filter.endDate,'yyyy-MM-dd')
    }
    if(filter.donationType){
      filterOps.donationType=filter.donationType as any
    }
    if(filter.donorName){
      filterOps.donorName=filter.donorName
    }
    if(filter.donorId){
      filterOps.donorId=filter.donorId
    }
    filterOps.isGuest=filter.guest
    return this.donationController.getDonations({ filter:filterOps}).pipe(map(d => d.responsePayload));
  }

  async getMyId(){
    return (await this.identityService.getUser()).profile_id;
  }

  getHistory(id: string) {
    return this.donationController.getHistories({id:id}).pipe(map(d => d.responsePayload));
  }
  
}
