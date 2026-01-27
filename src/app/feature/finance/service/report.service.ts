import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { DonationControllerService, FinanceReportControllerService } from 'src/app/core/api-client/services';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  constructor(private donationController: FinanceReportControllerService) { }

  listActiveReports() {
    return this.donationController.getReportList().pipe(map(m => m.responsePayload));
  }
}
