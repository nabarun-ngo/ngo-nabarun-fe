import { Component, OnInit } from '@angular/core';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { NavigationButtonModel } from 'src/app/shared/components/generic/page-navigation-buttons/page-navigation-buttons.component';
import { PageNavigation } from 'src/app/shared/layout/page-layout/page-layout.component';
import { TabbedPage } from 'src/app/shared/utils/tab';
import { ActivatedRoute } from '@angular/router';
import { PaginateEventDetail } from 'src/app/core/api/models';
import { DefaultValue, eventTabs } from '../events.conts';
import { EventsService } from '../events.service';
import { SearchAndAdvancedSearchModel } from 'src/app/shared/model/search-and-advanced-search.model';

@Component({
  selector: 'app-social-event-list',
  templateUrl: './social-event-list.component.html',
  styleUrls: ['./social-event-list.component.scss'],
})
export class SocialEventListComponent
  extends TabbedPage<eventTabs>
  implements PageNavigation
{
  tabMapping: eventTabs[] = ['upcoming_events','completed_events'];

  navigations: NavigationButtonModel[] = [
    {
      displayName: 'Back to Dashboard',
      routerLink: AppRoute.secured_dashboard_page.url,
    },
  ];

  searchInput:SearchAndAdvancedSearchModel= {
    normalSearchPlaceHolder:'Search Event Number',
    advancedSearch:{
      searchFormFields:[
        {
          formControlName: 'id',
          inputModel:{
            html_id: 'event-id',
            placeholder: 'Event Id',
            inputType: 'text',
            tagName: 'input',
          },
          validations: [],
        },
        {
          formControlName: 'eventTitle',
          inputModel:{
            html_id: 'event-title',
            placeholder: 'Event Title',
            inputType: 'text',
            tagName: 'input',
          },
          validations: [],
        },
        {
          formControlName: 'fromDate',
          inputModel:{
            html_id: 'event-from-date',
            placeholder: 'From Date',
            inputType: 'date',
            tagName: 'input',
          },
          validations: [],
        }
      ],
    }
  }

  eventListDetail!: PaginateEventDetail;
  searchValue: string = '';

  constructor(protected override route: ActivatedRoute, protected eventService:EventsService) {
    super(route);
  }

  override handleRouteData(): void {
    if (this.route.snapshot.data['data']) {
      this.eventListDetail = this.route.snapshot.data[
        'data'
      ] as PaginateEventDetail;
    }
    console.log(this.eventListDetail);
  }
  override onTabChanged(): void {
    this.eventService.getSocialEventList(DefaultValue.pageNumber,DefaultValue.pageSize,this.tabMapping[this.tabIndex] == 'completed_events').subscribe(data=>{
      this.eventListDetail = data!;
    })
  }

  onSearch($event: { advancedSearch: boolean; reset: boolean; value: any; }) {
    if($event.reset){
     
    }else{
      
    }

    if ($event.advancedSearch && !$event.reset) {
      this.onTabChanged();
    }
    else if ($event.advancedSearch && $event.reset) {
      this.eventService.advancedSearch($event.value).subscribe(data=>{
        this.eventListDetail = data!;
      })
    }
    else {
      this.searchValue = $event.value as string;
    }
  }
}
