import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { StaticDocsControllerService, UserControllerService } from 'src/app/core/api-client/services';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(
    private docsController: StaticDocsControllerService,
    private userController: UserControllerService
  ) { }

  getUserMetrics() {
    return this.userController.getUserMetrics().pipe(map(m => m.responsePayload));
  }

  getPolicyLink() {
    return this.docsController.getPolicies().pipe(map(m => m.responsePayload));
  }

  getUserGuideLink() {
    return this.docsController.getUserGuides().pipe(map(m => m.responsePayload));
  }
}
