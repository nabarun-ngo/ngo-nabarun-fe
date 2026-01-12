import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { NoticeDefaultValue } from '../communication.const';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { NavigationButtonModel } from 'src/app/shared/components/generic/page-navigation-buttons/page-navigation-buttons.component';
import { SearchAndAdvancedSearchModel } from 'src/app/shared/model/search-and-advanced-search.model';
import { StandardDashboard } from 'src/app/shared/utils/standard-dashboard';
import { PagedNotice } from '../model/notice.model';
import { noticeSearchInput } from '../fields/notice.field';
import { SearchEvent } from 'src/app/shared/components/search-and-advanced-search-form/search-event.model';
import { NoticeAccordionComponent } from './notice-accordion/notice-accordion.component';

@Component({
  selector: 'app-notice-dashboard',
  templateUrl: './notice-dashboard.component.html',
  styleUrls: ['./notice-dashboard.component.scss'],
})
export class NoticeDashboardComponent extends StandardDashboard<PagedNotice> {

  @ViewChild(NoticeAccordionComponent) noticeAccordion!: NoticeAccordionComponent;

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
    this.sharedDataService.setPageName(NoticeDefaultValue.pageTitle);
    this.searchInput = noticeSearchInput(this.refData!);
  }

  onSearch($event: SearchEvent) {
    if (this.noticeAccordion) {
      this.noticeAccordion.performSearch($event);
    }
  }
}
