import { Component, EventEmitter, Input, Output } from '@angular/core';
import { KeyValue } from 'src/app/shared/model/key-value.model';
import { DocumentCategory } from 'src/app/shared/components/document-link/document-link.model';
import { TabComponentInterface } from 'src/app/shared/interfaces/tab-component.interface';
import { SearchEvent } from 'src/app/shared/components/search-and-advanced-search-form/search-event.model';
import { ReportService } from '../../services/report.service';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import { saveAs } from 'src/app/core/service/utilities.service';

@Component({
  selector: 'app-finance-report-tab',
  templateUrl: './finance-report-tab.component.html',
  styleUrls: ['./finance-report-tab.component.scss']
})
export class FinanceReportTabComponent implements TabComponentInterface<KeyValue[]> {

  financeReports: DocumentCategory[] = [];

  constructor(protected reportService: ReportService) { }

  loadData(): void {
    this.reportService.listFinanceReports().subscribe(data => {
      this.financeReports = [];
      data.forEach(async d => {
        this.financeReports.push({
          name: d.displayValue,
          description: d.description + ' Here is the list of generated reports.',
          documents: await this.listDocuments(d.key)
        })
      })
    });
  }

  protected async listDocuments(key: string): Promise<KeyValue[]> {
    const data = await firstValueFrom(this.reportService.getReports(key));
    return data.map(d => ({
      key: d.id,
      displayValue: d.fileName,
      description: d.fileName
    } as KeyValue));
  }

  protected onDocumentClicked($event: { doc: KeyValue, categoryName: string }) {
    this.reportService.downloadReports($event.doc.key!).subscribe((response) => {
      saveAs(response, $event.doc.description!);
    }, error => {
      console.error('Download failed', error);
    });
  }

  onSearch($event: SearchEvent): void { }

}
