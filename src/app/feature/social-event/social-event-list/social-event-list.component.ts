import { Component, OnInit } from '@angular/core';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { NavigationButtonModel } from 'src/app/shared/components/generic/page-navigation-buttons/page-navigation-buttons.component';
import { PageNavigation } from 'src/app/shared/layout/page-layout/page-layout.component';
import { TabbedPage } from 'src/app/shared/model/tab';
import { adminTabs } from '../../admin/admin.const';
import { ActivatedRoute } from '@angular/router';
import { EventDetail, PaginateEventDetail } from 'src/app/core/api/models';

@Component({
  selector: 'app-social-event-list',
  templateUrl: './social-event-list.component.html',
  styleUrls: ['./social-event-list.component.scss'],
})
export class SocialEventListComponent
  extends TabbedPage<adminTabs>
  implements PageNavigation
{
  tabMapping: adminTabs[] = [];

  navigations: NavigationButtonModel[] = [
    {
      displayName: 'Back to Dashboard',
      routerLink: AppRoute.secured_dashboard_page.url,
    },
  ];

  eventListDetail!: PaginateEventDetail;

  constructor(protected override route: ActivatedRoute) {
    super(route);
  }

  override handleRouteData(): void {
    if (this.route.snapshot.data['data']) {
      this.eventListDetail = this.route.snapshot.data[
        'data'
      ] as PaginateEventDetail;
    }
  }
  override onTabChanged(): void {}
}
