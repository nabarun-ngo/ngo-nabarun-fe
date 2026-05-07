import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { DmsControllerService, ReportingControllerService } from 'src/app/core/api-client/services';

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

  listReports(code: string, index: number = 0, size: number = 10) {
    return this.reportController.listReports(
      {
        reportCode: code,
        pageIndex: index,
        pageSize: size,
        status: 'APPROVED'
      }
    ).pipe(map(m => m.responsePayload));
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
