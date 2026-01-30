import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { MeetingDefaultValue } from '../communication.const';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { NavigationButtonModel } from 'src/app/shared/components/generic/page-navigation-buttons/page-navigation-buttons.component';
import { SearchAndAdvancedSearchModel } from 'src/app/shared/model/search-and-advanced-search.model';
import { StandardDashboard } from 'src/app/shared/utils/standard-dashboard';
import { PagedMeeting } from '../model/meeting.model';
import { meetingSearchInput } from '../fields/meeting.field';
import { SearchEvent } from 'src/app/shared/components/search-and-advanced-search-form/search-event.model';
import { MeetingAccordionComponent } from './meeting-accordion/meeting-accordion.component';
import { User } from '../../member/models/member.model';

@Component({
  selector: 'app-meeting-dashboard',
  templateUrl: './meeting-dashboard.component.html',
  styleUrls: ['./meeting-dashboard.component.scss'],
})
export class MeetingDashboardComponent extends StandardDashboard<{ meetings: PagedMeeting, members: User[] }> {

  @ViewChild(MeetingAccordionComponent) meetingAccordion!: MeetingAccordionComponent;

  protected navigations: NavigationButtonModel[] = [
    {
      displayName: 'Back to Dashboard',
      routerLink: AppRoute.secured_dashboard_page.url,
    }
  ];
  protected searchInput!: SearchAndAdvancedSearchModel;

  constructor(
    private sharedDataService: SharedDataService,
    protected override route: ActivatedRoute
  ) {
    super(route);
  }

  protected override onInitHook(): void {
    this.sharedDataService.setPageName(MeetingDefaultValue.pageTitle);
    this.searchInput = meetingSearchInput(this.refData!);
  }

  onSearch($event: SearchEvent) {
    if (this.meetingAccordion) {
      this.meetingAccordion.performSearch($event);
    }
  }
}
