import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { PagedDonations, DonationDashboardData } from '../model';
import { StandardTabbedDashboard } from 'src/app/shared/utils/standard-tabbed-dashboard';
import { SelfDonationTabComponent } from './self-donation-tab/self-donation-tab.component';
import { GuestDonationTabComponent } from './guest-donation-tab/guest-donation-tab.component';
import { MemberDonationTabComponent } from './member-donation-tab/member-donation-tab.component';
import { NavigationButtonModel } from 'src/app/shared/components/generic/page-navigation-buttons/page-navigation-buttons.component';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { SearchAndAdvancedSearchModel } from 'src/app/shared/model/search-and-advanced-search.model';
import { TabComponentInterface } from 'src/app/shared/interfaces/tab-component.interface';
import { SearchEvent } from 'src/app/shared/components/search-and-advanced-search-form/search-event.model';
import { DonationDefaultValue, donationTab } from '../finance.const';
import { donationSearchInput } from '../fields/donation.field';
import { UserIdentityService } from 'src/app/core/service/user-identity.service';
import { SCOPE } from 'src/app/core/constant/auth-scope.const';
import { AllDonationTabComponent } from './all-donation-tab/all-donation-tab.component';

@Component({
  selector: 'app-donation-dashboard',
  templateUrl: './donation-dashboard.component.html',
  styleUrls: ['./donation-dashboard.component.scss']
})
export class DonationDashboardComponent extends StandardTabbedDashboard<donationTab, DonationDashboardData> {

  protected tabMapping: donationTab[] = ['self_donation', 'guest_donation', 'member_donation', 'all_donation'];

  @ViewChild(SelfDonationTabComponent) selfDonationTab!: SelfDonationTabComponent;
  @ViewChild(GuestDonationTabComponent) guestDonationTab!: GuestDonationTabComponent;
  @ViewChild(MemberDonationTabComponent) memberDonationTab!: MemberDonationTabComponent;
  @ViewChild(AllDonationTabComponent) allDonationTab!: AllDonationTabComponent;

  protected permissions: {
    canViewGuestDonation?: boolean;
    canViewMemberDonation?: boolean;
    canViewAllDonation?: boolean;
  } = {}

  protected navigations: NavigationButtonModel[] = [
    {
      displayName: 'Back to Dashboard',
      routerLink: AppRoute.secured_dashboard_page.url
    }
  ];
  protected searchInput!: SearchAndAdvancedSearchModel;

  protected get tabComponents(): { [key in donationTab]?: TabComponentInterface<DonationDashboardData> } {
    return {
      self_donation: this.selfDonationTab,
      guest_donation: this.guestDonationTab,
      member_donation: this.memberDonationTab,
      all_donation: this.allDonationTab
    };
  }


  protected get defaultTab(): donationTab {
    return DonationDefaultValue.tabName as donationTab;
  }


  constructor(
    private sharedDataService: SharedDataService,
    protected override route: ActivatedRoute,
    private identityService: UserIdentityService
  ) {
    super(route);
  }

  protected override onInitHook(): void {
    //console.log(this.initialData);
    const forEventId = this.route.snapshot.queryParamMap.get('forEventId');
    const projectId = this.route.snapshot.queryParamMap.get('projectId');

    if (projectId && forEventId) {
      this.navigations = [
        {
          displayName: 'Back to Project Activities',
          routerLink: AppRoute.secured_project_activities_page.url.replace(':id', btoa(projectId))
        }
      ];
      this.sharedDataService.setPageName('Project Donations');
    } else {
      this.sharedDataService.setPageName(DonationDefaultValue.pageTitle);
    }

    this.searchInput = donationSearchInput(this.getCurrentTab(), this.refData!);
    this.permissions!.canViewGuestDonation = this.identityService.isAccrediatedToAny(SCOPE.read.donation_guest);
    this.permissions!.canViewMemberDonation = this.identityService.isAccrediatedToAny(SCOPE.read.user_donations);
    this.permissions!.canViewAllDonation = this.identityService.isAccrediatedToAny(SCOPE.update.donation);
  }


  protected override onTabChangedHook(): void {
    this.searchInput = donationSearchInput(this.getCurrentTab(), this.refData!);
  }


  onSearch(event: SearchEvent): void {
    // Forward search to the active tab component
    this.forwardSearchToActiveTab(event);
  }

  // defaultValue = DonationDefaultValue;
  // protected mySummary: DonationSummaryDto | undefined;
  // protected payableAccounts: AccountDetailDto[] | undefined;
  // constants = DonationRefData;
  // userList!: UserDto[];


  // constructor(
  //   private route: ActivatedRoute,
  //   private sharedDataService: SharedDataService,
  //   private donationService: DonationNewService
  // ) {
  //   super();
  //   super.init(this.defaultValue.pageNumber, this.defaultValue.pageSize, this.defaultValue.pageSizeOptions)
  // }

  // ngOnInit(): void {


  //   /**
  //    * Setting tabIndex
  //    */
  //   let tab = this.route.snapshot.data["tab"] ? this.route.snapshot.data["tab"] as donationTab : this.defaultValue.tabName;

  //   this.tabMapping.forEach((value: donationTab, key: number) => {
  //     if (tab == value) {
  //       this.tabIndex = key;
  //     }
  //   })

  //   // this.sharedDataService.setPageName(this.defaultValue.pageTitle + " kk");

  //   // if (this.route.snapshot.data['ref_data']) {
  //   //   this.refData = this.route.snapshot.data['ref_data'];
  //   //   this.sharedDataService.setRefData('DONATION', this.refData!);
  //   //   //////console.log(refData,6)
  //   //   this.setRefData(this.refData);
  //   // }

  //   this.setAccordionHeader()
  //   if (this.route.snapshot.data['data'] && this.tabMapping[this.tabIndex] == 'member_donation') {
  //     let data = this.route.snapshot.data['data'] as PagedResultUserDto;
  //     this.userList = data.items!;
  //     this.setContent(data.items!, data.total);
  //   }
  //   // else if (this.route.snapshot.data['data'] && this.tabMapping[this.tabIndex] == 'self_donation') {
  //   //   let data = this.route.snapshot.data['data'] as { donations: PagedResultDonationDto, summary: DonationSummaryDto };
  //   //   this.mySummary = data.summary;
  //   //   this.setContent(data.donations.content!, data.donations.totalSize);
  //   // }
  //   else if (this.route.snapshot.data['data'] && this.tabMapping[this.tabIndex] != 'self_donation') {
  //     let data = this.route.snapshot.data['data'] as PagedResultDonationDto;
  //     this.setContent(data.items!, data.total);
  //   } else {
  //     this.fetchDetails();
  //   }



  // }

  // setAccordionHeader() {
  //   if (this.tabMapping[this.tabIndex] == 'self_donation') {
  //     this.setHeaderRow([
  //       {
  //         value: 'Donation Type',
  //         rounded: true
  //       },
  //       {
  //         value: 'Donation Amount',
  //         rounded: true
  //       },
  //       {
  //         value: 'Donation Period',
  //         rounded: true
  //       },
  //       {
  //         value: 'Donation Status',
  //         rounded: true
  //       }
  //     ]);
  //   }
  //   else if (this.tabMapping[this.tabIndex] == 'guest_donation') {

  //   }
  //   else if (this.tabMapping[this.tabIndex] == 'member_donation') {
  //     this.setHeaderRow([
  //       {
  //         value: 'Donor Name',
  //         rounded: true
  //       },
  //       {
  //         value: 'Donor Email',
  //         rounded: true
  //       },
  //       {
  //         value: 'Donor Status',
  //         rounded: true
  //       },
  //       /*{
  //         value: '',
  //         rounded: false
  //       }*/
  //     ])
  //   }
  // }

  // protected override prepareHighLevelView(data: DonationDto | UserDto, options?: { [key: string]: any; }): AccordionCell[] {
  //   //////console.log(data)
  //   if (this.tabMapping[this.tabIndex] == 'self_donation') {
  //     let donation = data as DonationDto;
  //     return [
  //       {
  //         type: 'text',
  //         value: donation?.type!,
  //         bgColor: 'bg-purple-200',
  //         showDisplayValue: true,
  //         refDataSection: this.constants.refDataKey.type
  //       },
  //       {
  //         type: 'text',
  //         value: '₹ ' + donation?.amount!,
  //       },
  //       {
  //         type: 'text',
  //         value: date(donation?.startDate!) + '-' + date(donation?.endDate!),
  //       },
  //       {
  //         type: 'text',
  //         value: donation?.status!,
  //         showDisplayValue: true,
  //         refDataSection: this.constants.refDataKey.status
  //       },
  //     ];
  //   }
  //   else if (this.tabMapping[this.tabIndex] == 'guest_donation') {
  //     let donation = data as DonationDto;
  //     return [
  //       {
  //         type: 'text',
  //         value: donation.donorName!,
  //       },
  //       {
  //         type: 'text',
  //         value: donation?.type!,
  //         showDisplayValue: true,
  //         refDataSection: this.constants.refDataKey.type
  //       },
  //       {
  //         type: 'text',
  //         value: '₹ ' + donation?.amount!,
  //       },
  //       {
  //         type: 'text',
  //         value: donation?.status!,
  //         showDisplayValue: true,
  //         refDataSection: this.constants.refDataKey.status
  //       },
  //     ];
  //   }
  //   else if (this.tabMapping[this.tabIndex] == 'member_donation') {
  //     let user = data as UserDto;
  //     return [
  //       {
  //         type: 'user',
  //         value: user.fullName!,
  //         props: {
  //           picture: user.picture!
  //         }
  //       },
  //       {
  //         type: 'text',
  //         value: user?.email!,
  //       },
  //       {
  //         type: 'text',
  //         value: user?.status!,
  //         showDisplayValue: false,
  //         refDataSection: this.constants.refDataKey.status
  //       },
  //       /*{
  //         type: 'icon',
  //         value:'',
  //         props:{
  //           icon:'remove_red_eye'
  //         }
  //       }*/
  //     ];
  //   }
  //   return [];

  // }
  // protected override prepareDetailedView(data: DonationDto | UserDto, options?: { [key: string]: any; }): DetailedView[] {
  //   if (this.tabMapping[this.tabIndex] == 'member_donation') {
  //     let user = data as UserDto;
  //     return [
  //       {
  //         section_name: 'Donor Detail',
  //         section_type: 'key_value',
  //         section_form: new FormGroup({}),
  //         section_html_id: 'donor_detail',
  //         content: [
  //           {
  //             field_name: 'Name',
  //             field_value: user.fullName!,
  //             field_html_id: 'donor_name',
  //           },
  //           {
  //             field_name: 'Email address',
  //             field_value: user?.email!,
  //             field_html_id: 'donor_email_address',
  //           },
  //           {
  //             field_name: 'Contact number',
  //             field_value: user?.primaryNumber?.number!,
  //             field_html_id: 'donor_primary_contact',
  //           },
  //         ]
  //       },
  //       {
  //         section_name: 'Donation Summary',
  //         section_type: 'key_value',
  //         section_form: new FormGroup({}),
  //         section_html_id: 'donation_summary',
  //         content: []
  //       },
  //       {
  //         section_name: 'Donation List',
  //         section_type: 'accordion_list',
  //         section_form: new FormGroup({}),
  //         section_html_id: 'donation_list',
  //       },
  //     ];
  //   }
  //   let donation = data as DonationDto;
  //   // Check if donor details are flattened in DonationDto
  //   return [
  //     {
  //       section_name: 'Donor Detail',
  //       section_type: 'key_value',
  //       section_form: new FormGroup({}),
  //       section_html_id: 'donor_detail',
  //       content: [
  //         {
  //           field_name: 'Name',
  //           field_value: donation.donorName!,
  //           field_html_id: 'donor_name',
  //         },
  //         {
  //           field_name: 'Email address',
  //           field_value: donation.donorEmail!,
  //           field_html_id: 'donor_email_address',
  //         },
  //         // DonationDto might not have primaryNumber directly. 
  //         // If we need it, we might need to fetch user, but for now we put empty or remove.
  //         // Leaving it as N/A or empty if not present.
  //         // {
  //         //   field_name: 'Contact number',
  //         //   field_value: '', 
  //         //   field_html_id: 'donor_primary_contact',
  //         // },
  //       ]
  //     },
  //     this.showDonationDetail(donation)
  //   ];
  // }
  // protected override prepareDefaultButtons(data: DonationDto | UserDto, options?: { [key: string]: any; }): AccordionButton[] {
  //   return [
  //     {
  //       button_id: 'UPDATE_DONATION',
  //       button_name: 'Update Donation'
  //     }
  //   ];
  // }


  // onClick($event: { buttonId: string; rowIndex: number; }) {
  //   switch ($event.buttonId) {
  //     case 'UPDATE_DONATION':
  //       this.showEditForm($event.rowIndex, ['donation_detail']);
  //       //this.actionName = $event.buttonId;
  //       break;
  //     case 'CANCEL':
  //       this.hideForm($event.rowIndex)
  //       break;
  //   }
  // }

  // protected override onAccordionOpen($event: { rowIndex: number; }) {
  //   if (this.tabMapping[this.tabIndex] == 'member_donation') {
  //     let user = this.userList[$event.rowIndex];
  //     // this.accordionList.contents[$event.rowIndex].detailed.push({
  //     //   section_name: 'Donation Detail',
  //     //   section_type: 'key_value',
  //     //   section_form: new FormGroup({}),
  //     //   section_html_id: 'donation_detail',
  //     //   content: [
  //     //     {
  //     //       field_name: 'Donation Number',
  //     //       field_value: 'donation.id!',
  //     //       field_html_id: 'donation_id',
  //     //     },
  //     //   ]
  //     // });

  //     this.donationService.fetchUserDonations(user.id!).subscribe(d => {
  //       let index_1 = this.getAccordionList().contents[$event.rowIndex].detailed.findIndex(f => f.section_html_id == 'donation_summary');

  //       d.donations?.items?.forEach(g => {
  //         //this.accordionList.contents[$event.rowIndex].detailed.push(this.showDonationDetail(g));
  //       })
  //     });
  //   }
  // }


  // showDonationDetail(donation: DonationDto) {
  //   return {
  //     section_name: 'Donation Detail',
  //     section_type: 'key_value',
  //     section_form: new FormGroup({}),
  //     section_html_id: 'donation_detail',
  //     content: [
  //       {
  //         field_name: 'Donation Number',
  //         field_value: donation.id!,
  //         field_html_id: 'donation_id',
  //       },
  //       {
  //         field_name: 'Donation type',
  //         field_value: donation.type!,
  //         field_html_id: 'donation_type',
  //         show_display_value: true,
  //         ref_data_section: this.constants.refDataKey.type
  //       },
  //       {
  //         field_name: 'Donation amount',
  //         field_value: '₹ ' + donation.amount!,
  //         field_html_id: 'donation_amount',
  //       },
  //       {
  //         field_name: 'Donation start date',
  //         field_value: date(donation.startDate!),
  //         field_html_id: 'donation_start_date',
  //         hide_field: !donation.startDate && donation.type! == this.constants.enum.type.Onetime,
  //       },
  //       {
  //         field_name: 'Donation end date',
  //         field_value: date(donation.endDate!),
  //         field_html_id: 'donation_eend_date',
  //         hide_field: !donation.endDate && donation.type! == this.constants.enum.type.Onetime
  //       },
  //       {
  //         field_name: 'Donation status',
  //         field_value: donation.status!,
  //         field_html_id: 'donation_status',
  //         show_display_value: true,
  //         ref_data_section: this.constants.refDataKey.status,
  //         editable: true,
  //         form_control_name: 'status',
  //         form_input: {
  //           inputType: '',
  //           tagName: 'select',
  //           selectList: this.getRefData()![this.constants.refDataKey.nextStatus]
  //         }
  //       },
  //       {
  //         field_name: 'Donation raised on',
  //         field_value: date(donation.raisedOn!),
  //         field_html_id: 'donation_raised_date',
  //       },
  //       {
  //         field_name: 'Donation paid on',
  //         field_value: date(donation.paidOn!),
  //         field_html_id: 'donation_paid_date',
  //         hide_field: !donation.paidOn && donation.status! != this.constants.enum.status.Paid,
  //         editable: true,
  //         form_control_name: 'paidOn',
  //         form_input: {
  //           inputType: 'date',
  //           tagName: 'input',
  //         }
  //       },
  //       {
  //         field_name: 'Payment method',
  //         field_value: donation.paymentMethod!,
  //         field_html_id: 'donation_payment_method',
  //         show_display_value: true,
  //         ref_data_section: this.constants.refDataKey.paymentMethod,
  //         editable: true,
  //         form_control_name: 'paymentMethod',
  //         form_input: {
  //           inputType: '',
  //           tagName: 'select',
  //           selectList: this.getRefData()![this.constants.refDataKey.paymentMethod]
  //         }
  //       },
  //       {
  //         field_name: 'Payment UPI name',
  //         field_value: donation.paidUsingUPI!,
  //         field_html_id: 'donation_upi_name',
  //         show_display_value: true,
  //         ref_data_section: this.constants.refDataKey.paymentMethod,
  //         editable: true,
  //         form_control_name: 'paidUsingUPI',
  //         form_input: {
  //           inputType: '',
  //           tagName: 'select',
  //           selectList: this.getRefData()![this.constants.refDataKey.upiOps]
  //         },
  //         hide_field: !donation.paidUsingUPI
  //       },
  //       {
  //         field_name: 'Donation confirmed by',
  //         field_value: donation.confirmedBy?.fullName!,
  //         field_html_id: 'donation_confirmed_by',
  //       },
  //       {
  //         field_name: 'Donation confirmed on',
  //         field_value: date(donation.confirmedOn!),
  //         field_html_id: 'donation_confirmed_by',
  //       },
  //       {
  //         field_name: 'Transaction Number',
  //         field_value: donation.transactionRef!,
  //         field_html_id: 'donation_txn_id',
  //       },
  //       {
  //         field_name: 'Remarks',
  //         field_value: donation.remarks!,
  //         field_html_id: 'donation_remarks',
  //         editable: true,
  //         form_control_name: 'remarks',
  //         form_input: {
  //           inputType: 'text',
  //           tagName: 'textarea',
  //         },
  //         hide_field: !donation.remarks
  //       },
  //       {
  //         field_name: 'Reason for cancel',
  //         field_value: donation.cancelletionReason!,
  //         field_html_id: 'donation_RFC',
  //         form_control_name: 'cancelletionReason',
  //         editable: true,
  //         form_input: {
  //           inputType: 'text',
  //           tagName: 'textarea',
  //         },
  //         hide_field: !donation.cancelletionReason
  //       },
  //       {
  //         field_name: 'Reason for paying later',
  //         field_value: donation.laterPaymentReason!,
  //         field_html_id: 'donation_RPL',
  //         editable: true,
  //         form_control_name: 'laterPaymentReason',
  //         form_input: {
  //           inputType: 'text',
  //           tagName: 'textarea',
  //         },
  //         hide_field: !donation.laterPaymentReason
  //       },
  //       {
  //         field_name: 'Payment failure detail',
  //         field_value: donation.paymentFailureDetail!,
  //         field_html_id: 'donation_PFD',
  //         editable: true,
  //         form_control_name: 'paymentFailureDetail',
  //         form_input: {
  //           inputType: 'text',
  //           tagName: 'textarea',
  //         },
  //         hide_field: !donation.paymentFailureDetail
  //       },
  //     ]
  //   } as DetailedView;
  // }











  // /**
  //  * 
  //  * @param index 
  //  */


  // //members: MemberList[]=[];
  // //donations: DonationList[]=[];
  // tabChanged(index: number) {
  //   this.tabIndex = index;
  //   this.pageNumber = this.defaultValue.pageNumber;
  //   this.pageSize = this.defaultValue.pageSize;
  //   //this.members=[];
  //   //this.donations=[];
  //   this.fetchDetails();
  // }

  // private async fetchDetails() {
  //   this.setAccordionHeader()
  //   switch (this.tabMapping[this.tabIndex]) {
  //     case 'self_donation': {
  //       let data = await this.donationService.fetchMyDonations(this.pageNumber, this.pageSize);
  //       this.setContent(data.donations?.items!, data.donations?.total);
  //       this.mySummary = data.summary;
  //       this.payableAccounts = [];
  //       break;
  //     }
  //     case 'guest_donation': {
  //       this.donationService.fetchGuestDonations(this.pageNumber, this.pageSize).subscribe(data => {
  //         this.setContent(data?.items!, data?.total);
  //       });
  //       break;
  //     }
  //     case 'member_donation': {
  //       this.donationService.fetchMembers(this.pageNumber, this.pageSize).subscribe(members => {
  //         this.userList = members?.items!;
  //         this.setContent(members?.items!, members?.total);
  //       });
  //       break;
  //     }
  //   }
  // }

  // handlePageEvent($event: PageEvent) {
  //   this.pageNumber = $event.pageIndex;
  //   this.pageSize = $event.pageSize;
  //   // this.members = [];
  //   // this.donations = [];
  //   this.fetchDetails();
  // }

}
