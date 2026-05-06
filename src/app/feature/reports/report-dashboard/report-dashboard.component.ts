import { Component, OnInit } from '@angular/core';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { NavigationButtonModel } from 'src/app/shared/components/generic/page-navigation-buttons/page-navigation-buttons.component';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { KeyValue } from 'src/app/shared/model/key-value.model';
import { ActivatedRoute } from '@angular/router';
import { ReportService } from '../report.service';
import { saveAs } from 'src/app/core/service/utilities.service';
import { DocumentCategory } from 'src/app/shared/components/document-link/document-link.model';

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
    private reportService: ReportService
  ) { }

  ngOnInit(): void {
    this.sharedDataService.setPageName(`Reports`);
    this.loadResolvedData();
  }

  private loadResolvedData(): void {
    const categories = this.route.snapshot.data['data'] as KeyValue[];
    console.log(categories);

    if (categories) {
      this.reportCategories = categories.map(d => ({
        id: d.key,
        name: d.displayValue!,
        description: d.description,
        documents: [],
        isLoading: false
      }));
    }
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
    this.reportService.listReports(category.id!, page, 10).subscribe(res => {
      if (res && res.content) {
        category.documents = res.content.map(d => ({
          key: d.dmsDocumentId,
          displayValue: `Execution v${d.version} - ${new Date(d.createdAt).toLocaleString()}`,
          description: `Status: ${d.status}, Created at: ${new Date(d.createdAt).toLocaleString()}`
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
      saveAs(response, $event.doc.displayValue || 'report');
    }, error => {
      console.error('Download failed', error);
    });
  }
}
