import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { DonationDefaultValue, donationTab } from '../donation.const';
import { DonationService } from '../donation.service';
import { PageEvent } from '@angular/material/paginator';
import { DonationList, MemberList } from '../donation.model';
import { DonationDetail, DonationSummary, KeyValue, PaginateDonationDetail, PaginateUserDetail, UserDetail } from 'src/app/core/api/models';
import { Accordion } from 'src/app/shared/components/generic/accordion-list/accordion';
import { AccordionCell, AccordionButton } from 'src/app/shared/components/generic/accordion-list/accordion-list.model';
import { DetailedView } from 'src/app/shared/components/generic/detailed-view/detailed-view.model';

@Component({
  selector: 'app-donation-dashboard',
  templateUrl: './donation-dashboard.component.html',
  styleUrls: ['./donation-dashboard.component.scss']
})
export class DonationDashboardComponent extends Accordion<DonationDetail | UserDetail> implements OnInit {

  protected tabIndex!: number;
  protected tabMapping: donationTab[] = ['self_donation', 'guest_donation', 'member_donation'];
  defaultValue = DonationDefaultValue;
  protected mySummary: DonationSummary | undefined;


  constructor(
    private route: ActivatedRoute,
    private sharedDataService: SharedDataService,
    private donationService: DonationService
  ) {
    super();
    super.init(this.defaultValue.pageNumber, this.defaultValue.pageSize, this.defaultValue.pageSizeOptions)
  }

  ngOnInit(): void {


    /**
     * Setting tabIndex
     */
    let tab = this.route.snapshot.data["tab"] ? this.route.snapshot.data["tab"] as donationTab : this.defaultValue.tabName;

    this.tabMapping.forEach((value: donationTab, key: number) => {
      if (tab == value) {
        this.tabIndex = key;
      }
    })

    this.sharedDataService.setPageName(this.defaultValue.pageTitle);

    if (this.route.snapshot.data['ref_data']) {
      let refData = this.route.snapshot.data['ref_data'];
      this.sharedDataService.setRefData('DONATION', refData);
      console.log(refData)
    }

    if (this.route.snapshot.data['data'] && this.tabMapping[this.tabIndex] == 'member_donation') {
      let data = this.route.snapshot.data['data'] as PaginateUserDetail;
      this.setContent(data.content!,data.totalSize);
    }
    else if (this.route.snapshot.data['data'] && this.tabMapping[this.tabIndex] == 'self_donation') {
      let data = this.route.snapshot.data['data'] as { donations: PaginateDonationDetail, summary: DonationSummary };
      this.mySummary = data.summary;
      this.setContent(data.donations.content!,data.donations.totalSize);
    }
    else if (this.route.snapshot.data['data']) {
      let data = this.route.snapshot.data['data'] as PaginateDonationDetail;
      this.setContent(data.content!,data.totalSize);
    } else {
      this.fetchDetails();
    }



  }

  protected override prepareHighLevelView(data: DonationDetail | UserDetail, options?: { [key: string]: any; }): AccordionCell[] {
    return [
      
    ];
  }
  protected override prepareDetailedView(data: DonationDetail | UserDetail, options?: { [key: string]: any; }): DetailedView[] {
    throw new Error('Method not implemented.');
  }
  protected override prepareDefaultButtons(data: DonationDetail | UserDetail, options?: { [key: string]: any; }): AccordionButton[] {
    throw new Error('Method not implemented.');
  }


  onClick($event: { buttonId: string; rowIndex: number; }) {
    throw new Error('Method not implemented.');
  }
  accordionOpened($event: { rowIndex: number; }) {
    throw new Error('Method not implemented.');
  }












  /**
   * 
   * @param index 
   */


  //members: MemberList[]=[];
  //donations: DonationList[]=[];
  tabChanged(index: number) {
    this.tabIndex = index;
    this.pageNumber = this.defaultValue.pageNumber;
    this.pageSize = this.defaultValue.pageSize;
    //this.members=[];
    //this.donations=[];
    this.fetchDetails();
  }

  private fetchDetails() {
    switch (this.tabMapping[this.tabIndex]) {
      case 'self_donation': {
        this.donationService.fetchMyDonations(this.pageNumber, this.pageSize).subscribe(data => {
          //data.donations?.content?.forEach(donation => this.donations.push({ donation: donation, action: 'view', eventSubject: new Subject<any>() }))
          this.itemLengthSubs.next(data.donations?.totalSize!);
          this.mySummary = data.summary;
        });
        break;
      }
      case 'guest_donation': {
        this.donationService.fetchGuestDonations(this.pageNumber, this.pageSize).subscribe(donations => {
          // donations?.content?.forEach(donation => this.donations.push({ donation: donation, action: 'view', eventSubject: new Subject<any>() }))
          // console.log(this.donations)
          this.itemLengthSubs.next(donations?.totalSize!);
        });
        break;
      }
      case 'member_donation': {
        this.donationService.fetchMembers(this.pageNumber, this.pageSize).subscribe(members => {
          // members?.content?.forEach(member => this.members.push({
          //   member: member
          // }))
          this.itemLengthSubs.next(members?.totalSize!);
        });
        break;
      }
    }
  }

  handlePageEvent($event: PageEvent) {
    this.pageNumber = $event.pageIndex;
    this.pageSize = $event.pageSize;
    // this.members = [];
    // this.donations = [];
    this.fetchDetails();
  }

}


