import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { DmsControllerService, ReportingControllerService } from 'src/app/core/api-client/services';
import { ReportDefaultValue } from './report.const';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  constructor(
    private reportController: ReportingControllerService,
    private dmsController: DmsControllerService
  ) { }

  getReportCategories() {
    return this.reportController.getRegisteredReports().pipe(map(m => m.responsePayload));
  }

  listReports(code: string, state: 'DRAFT' | 'APPROVED' = 'APPROVED', index: number = ReportDefaultValue.pageNumber, size: number = ReportDefaultValue.pageSize) {
    return this.reportController.listReports(
      {
        reportCode: code,
        pageIndex: index,
        pageSize: size,
        status: state
      }
    ).pipe(map(m => m.responsePayload));
  }

  generateReport(reportCode: string, parameters: { [key: string]: any }) {
    return this.reportController.generateReport({
      reportCode: reportCode,
      body: parameters
    }).pipe(map(m => m.responsePayload));
  }

  approveReport(reportId: string) {
    return this.reportController.approveReport({ reportId }).pipe(map(m => m.responsePayload));
  }

  regenerateReport(reportId: string) {
    return this.reportController.regenerateReport({ reportId }).pipe(map(m => m.responsePayload));
  }

  getReport(id: string) {
    return this.dmsController.getDocuments({
      id: id,
      type: 'REPORT'
    }).pipe(map(m => m.responsePayload));
  }

  downloadReports(docId: string) {
    return this.dmsController.downloadDocument({
      id: docId
    });
  }
}

