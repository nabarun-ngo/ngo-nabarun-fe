import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { DmsControllerService, DonationControllerService, FinanceReportControllerService } from 'src/app/core/api-client/services';
import { saveAs } from 'src/app/core/service/utilities.service';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  constructor(
    private donationController: FinanceReportControllerService,
    private dmsController: DmsControllerService
  ) { }

  listActiveReports() {
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
