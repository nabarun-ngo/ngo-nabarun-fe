import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { DonationDefaultValue, donationTab } from '../donation.const';
import { DonationService } from '../donation.service';
import { PageEvent } from '@angular/material/paginator';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { DonationList, MemberList } from '../donation.model';
import { DonationSummary, KeyValue, PaginateDonationDetail, PaginateUserDetail } from 'src/app/core/api/models';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-donation-dashboard',
  templateUrl: './donation-dashboard.component.html',
  styleUrls: ['./donation-dashboard.component.scss']
})
export class DonationDashboardComponentOld implements OnInit {

  protected pageNumber: number = DonationDefaultValue.pageNumber;
  protected pageSize: number = DonationDefaultValue.pageSize;
  protected pageSizeOptions: number[] = DonationDefaultValue.pageSizeOptions;
  protected itemLengthSubs: BehaviorSubject<number> = new BehaviorSubject(0);;
  protected itemLength$: Observable<number> = this.itemLengthSubs.asObservable();

  protected tabIndex!: number;
  protected tabMapping: donationTab[] = ['self_donation', 'guest_donation', 'member_donation'];

  members: MemberList[]=[];
  donations: DonationList[]=[];
  mySummary: DonationSummary | undefined;
  showcreateDonation:boolean=false;
  route: ActivatedRoute=Inject(ActivatedRoute);

  constructor(
    private sharedDataService: SharedDataService,
    private donationService: DonationService
  ) { }

  ngOnInit(): void {

    
    /**
     * Setting tabIndex
     */
    let tab = this.route.snapshot.data["tab"] ? this.route.snapshot.data["tab"] as donationTab : DonationDefaultValue.tabName;

    this.tabMapping.forEach((value: donationTab, key: number) => {
      if (tab == value) {
        this.tabIndex = key;
      }
    })

    this.sharedDataService.setPageName(DonationDefaultValue.pageTitle);

    if (this.route.snapshot.data['ref_data']){
      let refData=this.route.snapshot.data['ref_data'];
      this.sharedDataService.setRefData('DONATION',refData);
      console.log(refData)
    }

    if (this.route.snapshot.data['data'] && this.tabMapping[this.tabIndex] == 'member_donation') {
      let data = this.route.snapshot.data['data'] as PaginateUserDetail;
      data.content?.forEach((member: any)=>this.members.push({
        member: member
      }))
      this.itemLengthSubs.next(data?.totalSize!);
    } 
    else if (this.route.snapshot.data['data'] && this.tabMapping[this.tabIndex] == 'self_donation') {
      let data = this.route.snapshot.data['data'] as {donations:PaginateDonationDetail,summary:DonationSummary};
      data.donations.content?.forEach((donation: any)=>this.donations.push({donation:donation,action:'view',eventSubject:new Subject<any>()}))
      this.itemLengthSubs.next(data?.donations.totalSize!);
      this.mySummary=data.summary;
    } 
    else if (this.route.snapshot.data['data']) {
      let data = this.route.snapshot.data['data'] as PaginateDonationDetail;
      data.content?.forEach((donation: any)=>this.donations.push({donation:donation,action:'view',eventSubject:new Subject<any>()}))
      this.itemLengthSubs.next(data?.totalSize!);
    } else {
      this.fetchDetails();
    }



  }

  tabChanged(index: number) {
    this.tabIndex = index;
    this.pageNumber = DonationDefaultValue.pageNumber;
    this.pageSize = DonationDefaultValue.pageSize;
    this.members=[];
    this.donations=[];
    this.fetchDetails();
  }

  private fetchDetails() {
    switch (this.tabMapping[this.tabIndex]) {
      case 'self_donation': {
        this.donationService.fetchMyDonations(this.pageNumber, this.pageSize).subscribe(data => {
          data.donations?.content?.forEach(donation=>this.donations.push({donation:donation,action:'view',eventSubject:new Subject<any>()}))
          this.itemLengthSubs.next(data.donations?.totalSize!);
          this.mySummary=data.summary;
        });
        break;
      }
      case 'guest_donation': {
        this.donationService.fetchGuestDonations(this.pageNumber, this.pageSize).subscribe(donations => {
          donations?.content?.forEach(donation=>this.donations.push({donation:donation,action:'view',eventSubject:new Subject<any>()}))
          console.log( this.donations)
          this.itemLengthSubs.next(donations?.totalSize!);
        });
        break;
      }
      case 'member_donation': {
        this.donationService.fetchMembers(this.pageNumber, this.pageSize).subscribe(members => {
          members?.content?.forEach(member=>this.members.push({
            member: member
          }))
          this.itemLengthSubs.next(members?.totalSize!);
        });
        break;
      }
    }
  }

  handlePageEvent($event: PageEvent) {
    this.pageNumber = $event.pageIndex;
    this.pageSize = $event.pageSize;
    this.members=[];
    this.donations=[];
    this.fetchDetails();
  }

}


