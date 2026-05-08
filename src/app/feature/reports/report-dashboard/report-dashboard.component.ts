import { Component, OnInit } from '@angular/core';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { NavigationButtonModel } from 'src/app/shared/components/generic/page-navigation-buttons/page-navigation-buttons.component';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { KeyValue } from 'src/app/shared/model/key-value.model';
import { ActivatedRoute } from '@angular/router';
import { ReportService } from '../report.service';
import { saveAs } from 'src/app/core/service/utilities.service';
import { DocumentCategory } from 'src/app/shared/components/document-link/document-link.model';
import { ReportDefaultValue } from '../report.const';
import { ReportCategoryDto } from 'src/app/core/api-client/models';
import { UserIdentityService } from 'src/app/core/service/user-identity.service';

@Component({
  selector: 'app-report-dashboard',
  templateUrl: './report-dashboard.component.html',
  styleUrls: ['./report-dashboard.component.scss']
})
export class ReportDashboardComponent implements OnInit {

  reportCategories: DocumentCategory[] = [];

  protected navigations: NavigationButtonModel[] = [
    {
      displayName: 'Back to Dashboard',
      routerLink: AppRoute.secured_dashboard_page.url,
    }
  ];

  constructor(
    private sharedDataService: SharedDataService,
    protected route: ActivatedRoute,
    private reportService: ReportService,
    private userIdentityService: UserIdentityService
  ) { }

  ngOnInit(): void {
    this.sharedDataService.setPageName(`Reports`);
    this.loadResolvedData();
  }

  private async loadResolvedData(): Promise<void> {
    const categories = this.route.snapshot.data['data'] as ReportCategoryDto[];
    console.log(categories);

    if (categories) {
      this.reportCategories = (await Promise.all(categories.map(async d => ({
        id: d.reportCode,
        name: d.reportName!,
        description: d.description,
        documents: [],
        isLoading: false,
        ...(await this.canManage(d) ? {
          actionName: 'Manage',
          actionLink: AppRoute.secured_manage_reports_page.url,
          actionQueryParams: { reportCode: d.reportCode },
        } : {})
      }))));
    }
  }

  private async canManage(category: ReportCategoryDto): Promise<boolean> {
    const user = await this.userIdentityService.getUser();

    if (!user?.user_roles?.length || !category?.manageRoles?.length) {
      return false;
    }

    return user.user_roles.some(role =>
      category.manageRoles?.includes(role)
    );
  }

  onCategoryOpened(category: DocumentCategory) {
    if (category.documents.length > 0) return;
    this.fetchExecutions(category, 0);
  }

  onPageChanged(event: { category: DocumentCategory, page: number }) {
    this.fetchExecutions(event.category, event.page);
  }

  private fetchExecutions(category: DocumentCategory, page: number) {
    category.isLoading = true;
    this.reportService.listReports(category.id!, 'APPROVED', page, ReportDefaultValue.pageSize).subscribe(res => {
      if (res && res.content) {
        category.documents = res.content.map(d => ({
          key: d.dmsDocumentId,
          displayValue: '',
          description: `${d.reportName}`
        } as KeyValue));
        category.totalElements = res.totalSize;
      }
      category.isLoading = false;
    });
  }

  protected onDocumentClicked($event: { doc: KeyValue, categoryName: string }) {
    if (!$event.doc.key) {
      console.warn('No document ID available for download');
      return;
    }
    this.reportService.downloadReports($event.doc.key).subscribe((response) => {
      saveAs(response, $event.doc.description || 'report');
    }, error => {
      console.error('Download failed', error);
    });
  }
}
