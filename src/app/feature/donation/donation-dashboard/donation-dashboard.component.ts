import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { DonationDefaultValue, donationTab } from '../donation.const';
import { DonationService } from '../donation.service';
import { PageEvent } from '@angular/material/paginator';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { DonationList, MemberList } from '../donation.model';
import { DonationDetail, DonationSummary, KeyValue, PaginateDonationDetail, PaginateUserDetail } from 'src/app/core/api/models';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { SearchAndAdvancedSearchModel } from 'src/app/shared/model/search-and-advanced-search.model';
import { NavigationButtonModel } from 'src/app/shared/components/generic/page-navigation-buttons/page-navigation-buttons.component';
import { UserIdentityService } from 'src/app/core/service/user-identity.service';
import { SCOPE } from 'src/app/core/constant/auth-scope.const';

@Component({
  selector: 'app-donation-dashboard',
  templateUrl: './donation-dashboard.component.html',
  styleUrls: ['./donation-dashboard.component.scss']
})
export class DonationDashboardComponent implements OnInit {
  protected scope = SCOPE;
  protected pageNumber: number = DonationDefaultValue.pageNumber;
  protected pageSize: number = DonationDefaultValue.pageSize;
  protected pageSizeOptions: number[] = DonationDefaultValue.pageSizeOptions;
  protected itemLengthSubs: BehaviorSubject<number> = new BehaviorSubject(0);
  searchInputData!: SearchAndAdvancedSearchModel;
  protected itemLength$: Observable<number> = this.itemLengthSubs.asObservable();

  protected tabIndex!: number;
  protected tabMapping: donationTab[] = ['self_donation', 'guest_donation', 'member_donation', 'all_donation'];

  members: MemberList[] = [];
  donations: DonationList[] = [];
  mySummary: DonationSummary | undefined;
  showcreateDonation: boolean = false;
  navigations: NavigationButtonModel[] = [
    {
      displayName: 'Back to Dashboard',
      routerLink: AppRoute.secured_dashboard_page.url
    }
  ];
  refData!: { [key: string]: KeyValue[] };
  searchValue!: string;
  canViewGuestDonation!: boolean;
  canCreateDonation!: boolean;
  canViewMemberDonation!: boolean;
  constructor(
    protected identityService: UserIdentityService,
    private sharedDataService: SharedDataService,
    private donationService: DonationService,
    private route: ActivatedRoute,

  ) { }

  ngOnInit(): void {
    this.canViewGuestDonation = this.identityService.isAccrediatedTo(this.scope.read.donations);
    this.canCreateDonation = this.identityService.isAccrediatedTo(this.scope.create.donation);
    this.canViewMemberDonation = (this.identityService.isAccrediatedTo(this.scope.read.users)
      && this.identityService.isAccrediatedTo(this.scope.read.donations));

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

    if (this.route.snapshot.data['ref_data']) {
      this.refData = this.route.snapshot.data['ref_data'];
      this.sharedDataService.setRefData('DONATION', this.refData);
    }

    if (this.route.snapshot.data['data'] && this.tabMapping[this.tabIndex] == 'member_donation') {
      let data = this.route.snapshot.data['data'] as PaginateUserDetail;
      data.content?.forEach((member: any) => this.members.push({
        member: member
      }))
      this.itemLengthSubs.next(data?.totalSize!);
    }
    else if (this.route.snapshot.data['data'] && this.tabMapping[this.tabIndex] == 'self_donation') {
      let data = this.route.snapshot.data['data'] as { donations: PaginateDonationDetail, summary: DonationSummary };
      data.donations.content?.forEach((donation: any) => this.donations.push({ donation: donation, action: 'view', eventSubject: new Subject<any>() }))
      this.itemLengthSubs.next(data?.donations.totalSize!);
      this.mySummary = data.summary;
    }
    else if (this.route.snapshot.data['data']) {
      let data = this.route.snapshot.data['data'] as PaginateDonationDetail;
      data.content?.forEach((donation: any) => this.donations.push({ donation: donation, action: 'view', eventSubject: new Subject<any>() }))
      this.itemLengthSubs.next(data?.totalSize!);
    } else {
      this.fetchDetails();
    }

    this.searchInputData = this.getSearchAdvancedSearchData(this.tabMapping[this.tabIndex])
  }

  tabChanged(index: number) {
    this.tabIndex = index;
    this.pageNumber = DonationDefaultValue.pageNumber;
    this.pageSize = DonationDefaultValue.pageSize;
    this.members = [];
    this.donations = [];
    this.fetchDetails();
    this.searchInputData = this.getSearchAdvancedSearchData(this.tabMapping[this.tabIndex])
  }

  protected getSearchAdvancedSearchData(tab: donationTab) {
    if (tab == 'member_donation') {
      return {
        normalSearchPlaceHolder: 'Search Member Name, Email, Mobile Number',
        advancedSearch: {
          searchFormFields: [
            {
              formControlName: 'firstName',
              inputModel: {
                tagName: 'input',
                inputType: 'text',
                html_id: 'firstName',
                labelName: 'First Name',
                placeholder: 'Enter First Name',
              },
            },
            {
              formControlName: 'lastName',
              inputModel: {
                tagName: 'input',
                inputType: 'text',
                html_id: 'lastName',
                labelName: 'Last Name',
                placeholder: 'Enter Last Name',
              },
            },
            {
              formControlName: 'status',
              inputModel: {
                tagName: 'select',
                inputType: 'multiselect',
                html_id: 'u_status',
                labelName: 'Member Status',
                placeholder: 'Select Member Status',
                selectList: this.refData['userStatuses']
              },
            },
            // {
            //   formControlName: 'donationId',
            //   inputModel: {
            //     tagName: 'input',
            //     inputType: 'text',
            //     html_id: 'donationId',
            //     labelName: 'Donation Id',
            //     placeholder: 'Enter Donation Id',
            //   },
            // }
          ]
        }
      } as SearchAndAdvancedSearchModel;
    } else {
      return {
        normalSearchPlaceHolder: 'Search Donation Number, Donor Name',
        advancedSearch: {
          searchFormFields: [
            {
              formControlName: 'id',
              inputModel: {
                tagName: 'input',
                inputType: 'text',
                html_id: 'donationId',
                labelName: 'Donation Number',
                placeholder: 'Enter Donation Number',
                cssInputClass: 'bg-white'
              },
            },
            {
              formControlName: 'type',
              inputModel: {
                tagName: 'select',
                inputType: 'multiselect',
                html_id: 'd_type',
                labelName: 'Donation Type',
                placeholder: 'Select Donation Type',
                selectList: this.refData['donationTypes']
              },
            },
            {
              formControlName: 'status',
              inputModel: {
                tagName: 'select',
                inputType: 'multiselect',
                html_id: 'd_status',
                labelName: 'Donation Status',
                placeholder: 'Select Donation Status',
                selectList: this.refData['donationStatuses']
              },
            },
            {
              formControlName: 'startDate',
              inputModel: {
                tagName: 'input',
                inputType: 'date',
                html_id: 'startDate',
                labelName: 'From Date',
                placeholder: 'Enter From Date',
              },
            },
            {
              formControlName: 'endDate',
              inputModel: {
                tagName: 'input',
                inputType: 'date',
                html_id: 'endDate',
                labelName: 'To Date',
                placeholder: 'Enter To Date',
              },
            },
            {
              hidden: tab == 'self_donation',
              formControlName: 'donorName',
              inputModel: {
                tagName: 'input',
                inputType: 'text',
                html_id: 'donorName',
                labelName: 'Donor Name',
                placeholder: 'Enter Donor Name',
              },
            },
          ]
        }
      } as SearchAndAdvancedSearchModel;
    }
  }

  private async fetchDetails() {
    switch (this.tabMapping[this.tabIndex]) {
      case 'self_donation': {
        let data = await this.donationService.fetchMyDonations(this.pageNumber, this.pageSize);
        data.donations?.content?.forEach((donation) => this.donations.push({ donation: donation, action: 'view', eventSubject: new Subject<any>() }))
        this.itemLengthSubs.next(data.donations?.totalSize!);
        this.mySummary = data.summary;
        break;
      }
      case 'guest_donation': {
        this.donationService.fetchGuestDonations(this.pageNumber, this.pageSize).subscribe(donations => {
          donations?.content?.forEach(donation => this.donations.push({ donation: donation, action: 'view', eventSubject: new Subject<any>() }))
          ////console.log(this.donations)
          this.itemLengthSubs.next(donations?.totalSize!);
        });
        break;
      }
      case 'member_donation': {
        this.donationService.fetchMembers(this.pageNumber, this.pageSize).subscribe(members => {
          members?.content?.forEach(member => this.members.push({
            member: member
          }))
          this.itemLengthSubs.next(members?.totalSize!);
        });
        break;
      }
      case 'all_donation': {
        this.donationService.fetchDonations(this.pageNumber, this.pageSize).subscribe(donations => {
          donations?.content?.forEach(donation => this.donations.push({ donation: donation, action: 'view', eventSubject: new Subject<any>() }))
          // //console.log(this.donations)
          this.itemLengthSubs.next(donations?.totalSize!);
        });
        break;
      }
    }
  }

  handlePageEvent($event: PageEvent) {
    this.pageNumber = $event.pageIndex;
    this.pageSize = $event.pageSize;
    this.members = [];
    this.donations = [];
    this.fetchDetails();
  }

  async onSearch($event: { advancedSearch: boolean; reset: boolean; value: any; }) {
    if ($event.advancedSearch && !$event.reset) {
      if (this.tabMapping[this.tabIndex] == 'member_donation') {
        this.donationService.fetchMembers(this.pageNumber, this.pageSize, {
          firstName: $event.value.firstName,
          lastName: $event.value.lastName,
          status: $event.value.status
        }).subscribe(members => {
          this.members = [];
          members?.content?.forEach(member => this.members.push({
            member: member
          }))
          this.itemLengthSubs.next(members?.totalSize!);
        });
      } else {
        this.donationService.advancedSearch({
          donationId: $event.value.id,
          donationStatus: $event.value.status,
          donationType: $event.value.type,
          startDate: $event.value.startDate,
          endDate: $event.value.endDate,
          donorName: $event.value.donorName,
          guest: this.tabMapping[this.tabIndex] == 'guest_donation',
          donorId: this.tabMapping[this.tabIndex] == 'self_donation' ? await this.donationService.getMyId() : undefined
        }).subscribe(donations => {
          this.donations = []
          donations?.content?.forEach(donation => this.donations.push({ donation: donation, action: 'view', eventSubject: new Subject<any>() }))
          this.itemLengthSubs.next(donations?.totalSize!);
        })
      }

    }
    else if ($event.advancedSearch && $event.reset) {
      this.fetchDetails()
    }
    else {
      this.searchValue = $event.value as string;
    }
  }

}


