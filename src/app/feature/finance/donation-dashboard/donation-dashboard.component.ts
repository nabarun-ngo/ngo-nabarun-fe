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


}
