import { Component, OnInit } from '@angular/core';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { NavigationButtonModel } from 'src/app/shared/components/generic/page-navigation-buttons/page-navigation-buttons.component';
import { TabbedPage } from 'src/app/shared/utils/tab';
import { ActivatedRoute } from '@angular/router';
import {
  EventDetailFilter,
  PaginateEventDetail,
} from 'src/app/core/api/models';
import { DefaultValue, eventTabs } from '../events.conts';
import { EventsService } from '../events.service';
import { SearchAndAdvancedSearchModel } from 'src/app/shared/model/search-and-advanced-search.model';
import { SharedDataService } from 'src/app/core/service/shared-data.service';

@Component({
  selector: 'app-social-event-list',
  templateUrl: './social-event-list.component.html',
  styleUrls: ['./social-event-list.component.scss'],
})
export class SocialEventListComponent extends TabbedPage<eventTabs> {
  protected navigations: NavigationButtonModel[] = [
    {
      displayName: 'Back to Dashboard',
      routerLink: AppRoute.secured_dashboard_page.url,
    },
  ];
  

  constructor(
    protected override route: ActivatedRoute,
    private sharedData: SharedDataService,
    protected eventService: EventsService
  ) {
    super(route);
    sharedData.setPageName('Social Events');
  }

  protected eventListDetail!: PaginateEventDetail;

  override handleRouteData(): void {
    if (this.route.snapshot.data['data']) {
      this.eventListDetail = this.route.snapshot.data[
        'data'
      ] as PaginateEventDetail;
    }
    console.log(this.eventListDetail);
  }

  protected tabMapping: eventTabs[] = ['upcoming_events', 'completed_events'];

  override onTabChanged(): void {
    this.eventService
      .getSocialEventList(
        DefaultValue.pageNumber,
        DefaultValue.pageSize,
        this.tabMapping[this.tabIndex] == 'completed_events'
      )
      .subscribe((data) => {
        this.eventListDetail = data!;
      });
  }

  protected searchInput: SearchAndAdvancedSearchModel = {
    normalSearchPlaceHolder: 'Search for anything related to social events here',
    advancedSearch: {
      searchFormFields: [
        {
          formControlName: 'id',
          inputModel: {
            html_id: 'event-id',
            placeholder: 'Enter Event Id',
            inputType: 'text',
            tagName: 'input',
            labelName:'Event Id', 
          },
          validations: [],
        },
        {
          formControlName: 'eventTitle',
          inputModel: {
            html_id: 'event-title',
            placeholder: 'Enter Event Title',
            inputType: 'text',
            tagName: 'input',
            labelName: 'Event Title',
          },
          validations: [],
        },
        {
          formControlName: 'fromDate',
          inputModel: {
            html_id: 'event-from-date',
            placeholder: 'Select From Date',
            inputType: 'date',
            tagName: 'input',
            labelName: 'From Date',
          },
          validations: [],
        },
        {
          formControlName: 'toDate',
          inputModel: {
            html_id: 'event-to-date',
            placeholder: 'Select To Date',
            inputType: 'date',
            tagName: 'input',
            labelName: 'To Date',
          },
          validations: [],
        },
      ],
    },
  };

  onSearch($event: { advancedSearch: boolean; reset: boolean; value: any }) {
    console.log($event);
    if ($event.advancedSearch && !$event.reset) {
      let criteria = $event.value as EventDetailFilter;
      criteria.completed = this.tabMapping[this.tabIndex] == 'completed_events';
      this.eventService.advancedSearch(criteria).subscribe((data) => {
        this.eventListDetail = data!;
      });
    } else if ($event.advancedSearch && $event.reset) {
      this.onTabChanged();
    }
  }
}
