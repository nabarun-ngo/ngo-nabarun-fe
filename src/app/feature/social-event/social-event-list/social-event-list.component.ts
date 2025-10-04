import { Component, ViewChild } from '@angular/core';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { NavigationButtonModel } from 'src/app/shared/components/generic/page-navigation-buttons/page-navigation-buttons.component';
import { ActivatedRoute } from '@angular/router';
import {
  PaginateEventDetail,
} from 'src/app/core/api/models';
import { DefaultValue, eventTabs } from '../events.conts';
import { EventsService } from '../events.service';
import { SearchAndAdvancedSearchModel } from 'src/app/shared/model/search-and-advanced-search.model';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { StandardTabbedDashboard } from 'src/app/shared/utils/standard-tabbed-dashboard';
import { TabComponentInterface } from 'src/app/shared/interfaces/tab-component.interface';
import { UpcomingEventsTabComponent } from './upcoming-events-tab/upcoming-events-tab.component';
import { CompletedEventsTabComponent } from './completed-events-tab/completed-events-tab.component';
import { eventSearchInput } from '../social-event.field';
import { SearchEvent } from 'src/app/shared/components/search-and-advanced-search-form/search-event.model';

@Component({
  selector: 'app-social-event-list',
  templateUrl: './social-event-list.component.html',
  styleUrls: ['./social-event-list.component.scss'],
})
export class SocialEventListComponent extends StandardTabbedDashboard<eventTabs, PaginateEventDetail> {

  @ViewChild(UpcomingEventsTabComponent) upcomingEvents!: UpcomingEventsTabComponent;
  @ViewChild(CompletedEventsTabComponent) completedEvents!: CompletedEventsTabComponent;

  protected tabMapping: eventTabs[] = ['upcoming_events', 'completed_events'];
  protected navigations: NavigationButtonModel[] = [
    {
      displayName: 'Back to Dashboard',
      routerLink: AppRoute.secured_dashboard_page.url,
    },
  ];
  protected searchInput!: SearchAndAdvancedSearchModel;

  protected override get tabComponents(): { [tab in eventTabs]: TabComponentInterface } {
    return {
      upcoming_events: this.upcomingEvents,
      completed_events: this.completedEvents,
    };
  }

  protected override get defaultTab(): eventTabs {
    return DefaultValue.tabName as eventTabs;
  }

  constructor(
    protected override route: ActivatedRoute,
    private sharedData: SharedDataService,
    protected eventService: EventsService
  ) {
    super(route);
  }


  protected override onInitHook(): void {
    this.sharedData.setPageName(DefaultValue.pageTitle);
    this.searchInput = eventSearchInput(this.getCurrentTab(), this.refData!)
  }
  
  protected override onTabChangedHook(): void { }

  onSearch($event: SearchEvent) {
    this.forwardSearchToActiveTab($event);
  }
}
