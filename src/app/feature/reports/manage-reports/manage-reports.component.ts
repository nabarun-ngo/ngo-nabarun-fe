import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { NavigationButtonModel } from 'src/app/shared/components/generic/page-navigation-buttons/page-navigation-buttons.component';
import { StandardTabbedDashboard } from 'src/app/shared/utils/standard-tabbed-dashboard';
import { reportManageTab, ReportDefaultValue } from '../report.const';
import { PagedResultReportDetailDto } from 'src/app/core/api-client/models/paged-result-report-detail-dto';
import { TabComponentInterface } from 'src/app/shared/interfaces/tab-component.interface';
import { DraftReportsTabComponent } from './draft-reports-tab/draft-reports-tab.component';
import { ApprovedReportsTabComponent } from './approved-reports-tab/approved-reports-tab.component';

@Component({
  selector: 'app-manage-reports',
  templateUrl: './manage-reports.component.html',
  styleUrls: ['./manage-reports.component.scss'],
})
export class ManageReportsComponent extends StandardTabbedDashboard<reportManageTab, PagedResultReportDetailDto> {
  @ViewChild(DraftReportsTabComponent) draftReportsTab!: DraftReportsTabComponent;
  @ViewChild(ApprovedReportsTabComponent) approvedReportsTab!: ApprovedReportsTabComponent;

  protected navigations: NavigationButtonModel[] = [
    {
      displayName: 'Back to Reports',
      routerLink: AppRoute.secured_report_dashboard_page.url,
    },
  ];

  protected tabMapping: reportManageTab[] = ['draft_reports', 'approved_reports'];

  protected override get tabComponents(): { [key in reportManageTab]?: TabComponentInterface<PagedResultReportDetailDto> } {
    return {
      draft_reports: this.draftReportsTab,
      approved_reports: this.approvedReportsTab,
    };
  }

  protected override get defaultTab(): reportManageTab {
    return ReportDefaultValue.tabName;
  }

  constructor(
    private readonly sharedDataService: SharedDataService,
    protected override route: ActivatedRoute
  ) {
    super(route);
  }

  protected override onInitHook(): void {
    this.sharedDataService.setPageName(ReportDefaultValue.pageTitle);
  }

  protected override onTabChangedHook(): void {
    // no-op for now
  }
}
