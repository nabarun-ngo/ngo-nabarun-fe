import { Component, ViewChild } from '@angular/core';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { NavigationButtonModel } from 'src/app/shared/components/generic/page-navigation-buttons/page-navigation-buttons.component';
import { KeyValue } from 'src/app/shared/model/key-value.model';
import { StandardDashboard } from 'src/app/shared/utils/standard-dashboard';
import { FinReportAccordionComponent } from './fin-report-accordion/fin-report-accordion.component';
import { SearchAndAdvancedSearchModel } from 'src/app/shared/model/search-and-advanced-search.model';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-report-dashboard',
  templateUrl: './report-dashboard.component.html',
  styleUrls: ['./report-dashboard.component.scss']
})
export class ReportDashboardComponent extends StandardDashboard<KeyValue> {

  @ViewChild(FinReportAccordionComponent) reportAccordion!: FinReportAccordionComponent;

  protected navigations: NavigationButtonModel[] = [
    {
      displayName: 'Back to Dashboard',
      routerLink: AppRoute.secured_dashboard_help_page.url,
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
    this.sharedDataService.setPageName(`Financial Reports`);
    this.searchInput = {
      normalSearchPlaceHolder: 'Search Reports by Name'
    };
    console.log(this.initialData)
  }

}
