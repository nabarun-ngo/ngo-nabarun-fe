import { Component, ViewChild } from '@angular/core';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { NavigationButtonModel } from 'src/app/shared/components/generic/page-navigation-buttons/page-navigation-buttons.component';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { KeyValue } from 'src/app/shared/model/key-value.model';
import { StandardTabbedDashboard } from 'src/app/shared/utils/standard-tabbed-dashboard';
import { TabComponentInterface } from 'src/app/shared/interfaces/tab-component.interface';
import { ActivatedRoute } from '@angular/router';
import { FinanceReportTabComponent } from './finance-report-tab/finance-report-tab.component';
import { ModalService } from 'src/app/core/service/modal.service';
import { SearchAndAdvancedSearchModel } from 'src/app/shared/model/search-and-advanced-search.model';
import { Validators } from '@angular/forms';
import { ReportService } from '../services/report.service';
import { SearchAndAdvancedSearchFormComponent } from 'src/app/shared/components/search-and-advanced-search-form/search-and-advanced-search-form.component';
import { date, saveAs } from 'src/app/core/service/utilities.service';

type reportTabs = 'financeReports' | 'interimReports';

@Component({
  selector: 'app-report-dashboard',
  templateUrl: './report-dashboard.component.html',
  styleUrls: ['./report-dashboard.component.scss']
})
export class ReportDashboardComponent extends StandardTabbedDashboard<reportTabs, KeyValue[]> {

  @ViewChild(FinanceReportTabComponent) financeReportTab!: FinanceReportTabComponent;

  protected override tabMapping: reportTabs[] = ['financeReports', 'interimReports'];

  protected navigations: NavigationButtonModel[] = [
    {
      displayName: 'Back to Dashboard',
      routerLink: AppRoute.secured_dashboard_page.url,
    }
  ];

  constructor(
    private sharedDataService: SharedDataService,
    protected override route: ActivatedRoute,
    protected modalService: ModalService,
    private reportService: ReportService
  ) {
    super(route);
  }

  protected override onInitHook(): void {
    this.sharedDataService.setPageName(`Reports`);
  }

  protected override onAfterViewInitHook(): void {
    this.getActiveComponent(this.getCurrentTab())?.loadData();
  }

  protected override get tabComponents(): { [key in reportTabs]?: TabComponentInterface<any> } {
    return {
      financeReports: this.financeReportTab,
      interimReports: undefined
    };
  }

  protected override get defaultTab(): reportTabs {
    return 'financeReports';
  }

  protected override onTabChangedHook(): void {
  }

  generateInterimReport() {
    this.reportService.listFinanceReports().subscribe(reportList => {
      const report = this.getReportSearch(reportList);
      let modal = this.modalService.openComponentDialog(SearchAndAdvancedSearchFormComponent,
        report,
        {
          height: 290,
          width: 700,
        });
      modal.componentInstance.onSearch.subscribe(data => {
        if (data.reset) {
          modal.close();
        }
        else {
          this.reportService.generateInterimReport(data.value.reportName).subscribe((blob) => {
            modal.close();
            data
            const fileName = `Interim_Report_${reportList.find(r => r.key === data.value.reportName)?.displayValue}_${date(new Date(), 'yyyyMMddHHmmss')}`;
            saveAs(blob, fileName);
          });
        }
      })
    });
  }

  private getReportSearch(reportList: KeyValue[]) {
    return {
      normalSearchPlaceHolder: '',
      showOnlyAdvancedSearch: true,
      advancedSearch: {
        buttonText: { search: 'Generate', close: 'Close' },
        title: 'Generate Interim Report',
        searchFormFields: [{
          formControlName: 'reportName',
          inputModel: {
            html_id: 'report_name',
            inputType: 'text',
            tagName: 'input',
            autocomplete: true,
            placeholder: 'Select Report',
            selectList: reportList
          },
          validations: [Validators.required]
        }]
      }
    };
  }
}
