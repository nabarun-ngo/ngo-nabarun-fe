import { Component, OnInit } from '@angular/core';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { NavigationButtonModel } from 'src/app/shared/components/generic/page-navigation-buttons/page-navigation-buttons.component';
import { AdminDefaultValue, adminTabs } from '../admin.const';
import { Accordion } from 'src/app/shared/components/generic/accordion-list/accordion';
import { PageEvent } from '@angular/material/paginator';
import { AccordionCell, AccordionButton } from 'src/app/shared/components/generic/accordion-list/accordion-list.model';
import { DetailedView } from 'src/app/shared/components/generic/detailed-view/detailed-view.model';
import { SharedDataService } from 'src/app/core/service/shared-data.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent extends Accordion<any> implements OnInit {

  defaultValue = AdminDefaultValue;
  protected tabIndex!: number;
  protected tabMapping: adminTabs[] = ['app_config', 'cron_jobs', 'doppler_prop'];
  navigations: NavigationButtonModel[] = [
    {
      displayName: 'Back to Dashboard',
      routerLink: AppRoute.secured_dashboard_page.url
    }
  ];

  constructor(
    private sharedDataService: SharedDataService,
  ) {
    super();
    super.init(this.defaultValue.pageNumber, this.defaultValue.pageSize, this.defaultValue.pageSizeOptions)
  }
  ngOnInit(): void {
    this.sharedDataService.setPageName(this.defaultValue.pageTitle);

  }

  protected override prepareHighLevelView(data: any, options?: { [key: string]: any; }): AccordionCell[] {
    return [
      
    ];
  }
  protected override prepareDetailedView(data: any, options?: { [key: string]: any; }): DetailedView[] {
    return [];
  }
  protected override prepareDefaultButtons(data: any, options?: { [key: string]: any; }): AccordionButton[] {
    return [];
  }


  override handlePageEvent($event: PageEvent): void {
  }
  accordionOpened($event: { rowIndex: number; }) {
  }
  onClick($event: { buttonId: string; rowIndex: number; }) {
  }
  tabChanged(arg0: number) {
  }

}
