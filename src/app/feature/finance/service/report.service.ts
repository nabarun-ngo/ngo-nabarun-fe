import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { FinanceReportControllerService } from 'src/app/core/api-client/services';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  constructor(private readonly financeReport: FinanceReportControllerService) { }

  listActiveReports() {
    return this.financeReport.getReportList().pipe(
      map(m => m.responsePayload),
      map(c => c.filter(f => f.active))
    )
  }
}
