import { Component, OnInit } from '@angular/core';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { NavigationButtonModel } from 'src/app/shared/components/generic/page-navigation-buttons/page-navigation-buttons.component';
import { PageNavigation } from 'src/app/shared/layout/page-layout/page-layout.component';
import { TabbedPage } from 'src/app/shared/model/tab';
import { adminTabs } from '../../admin/admin.const';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-social-event-list',
  templateUrl: './social-event-list.component.html',
  styleUrls: ['./social-event-list.component.scss'],
})
export class SocialEventListComponent extends TabbedPage<adminTabs> implements PageNavigation {
  tabMapping: adminTabs[]=[];

  navigations: NavigationButtonModel[] = [
    {
      displayName: 'Back to Dashboard',
      routerLink: AppRoute.secured_dashboard_page.url,
    }
  ];

  constructor(protected override route: ActivatedRoute) {
    super(route);
  }

  override handleRouteData(): void {
    throw new Error('Method not implemented.');
  }
  override onTabChanged(): void {
    throw new Error('Method not implemented.');
  }
  
 
}
