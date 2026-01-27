import { Component, OnInit } from '@angular/core';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { NavigationButtonModel } from 'src/app/shared/components/generic/page-navigation-buttons/page-navigation-buttons.component';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { DocumentCategory } from 'src/app/shared/components/document-link/document-link.model';
import { ReportService } from '../services/report.service';
import { KeyValue } from 'src/app/shared/model/key-value.model';
import { firstValueFrom } from 'rxjs';
import { saveAs } from 'src/app/core/service/utilities.service';

@Component({
  selector: 'app-report-dashboard',
  templateUrl: './report-dashboard.component.html',
  styleUrls: ['./report-dashboard.component.scss']
})
export class ReportDashboardComponent implements OnInit {

  protected navigations: NavigationButtonModel[] = [
    {
      displayName: 'Back to Dashboard',
      routerLink: AppRoute.secured_dashboard_page.url,
    }
  ];

  financeReports: DocumentCategory[] = [];


  constructor(
    private sharedDataService: SharedDataService,
    private reportService: ReportService) {
  }


  ngOnInit(): void {
    this.sharedDataService.setPageName(`Reports`);
    this.reportService.listActiveReports().subscribe(data => {
      data.forEach(async d => {
        this.financeReports.push({
          name: d.displayValue,
          documents: await this.listDocuments(d.key)
        })
      })
    })
  }

  private async listDocuments(key: string): Promise<KeyValue[]> {
    const data = await firstValueFrom(this.reportService.getReports(key))
    return data.map(d => {
      return {
        key: d.id,
        displayValue: d.fileName,
        description: d.fileName
      } as KeyValue
    })
  }



  onDocumentClicked($event: { doc: KeyValue, categoryName: string }) {
    console.log($event);
    this.reportService.downloadReports($event.doc.key!).subscribe((response) => {
      const blob = response;

      // 2. Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob!);

      // 3. Create a hidden <a> tag and click it
      const link = window.document.createElement('a');
      link.href = url;
      link.download = $event.doc.description!;
      window.document.body.appendChild(link);
      link.click();

      // 4. Cleanup
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, error => {
      console.error('Download failed', error);
    });
  }

}
