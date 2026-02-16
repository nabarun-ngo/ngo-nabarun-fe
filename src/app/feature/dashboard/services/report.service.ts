import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { DmsControllerService, DonationControllerService, FinanceReportControllerService } from 'src/app/core/api-client/services';
import { date, saveAs } from 'src/app/core/service/utilities.service';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  generateInterimReport(reportName: string) {
    const now = new Date();
    // First date: set day to 1
    const firstDate = new Date(now.getFullYear(), now.getMonth(), 1);
    return this.donationController.generateReport({
      reportName: reportName,
      startDate: firstDate.toISOString(),
      endDate: now.toISOString(),
      sendEmail: 'N',
      uploadFile: 'N'
    });
  }

  constructor(
    private donationController: FinanceReportControllerService,
    private dmsController: DmsControllerService
  ) { }

  listFinanceReports() {
    return this.donationController.getReportList().pipe(map(m => m.responsePayload));
  }

  getReports(id: string) {
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
