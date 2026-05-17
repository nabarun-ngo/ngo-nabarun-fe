import { Component } from '@angular/core';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { DashboardService } from '../../services/dashboard.service';
import { PolicyHubTabComponent } from '../policy-hub-tab/policy-hub-tab.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-user-guide-tab',
  templateUrl: './user-guide-tab.component.html',
  styleUrls: ['./user-guide-tab.component.scss']
})
export class UserGuideTabComponent extends PolicyHubTabComponent {
  // We'll use the 'policies' property from the base class for simplicity 
  // or rename it to something more generic in the base class later.
  // For now, let's just reuse the logic.

  constructor(
    protected override commonService: DashboardService,
    protected override snackBar: MatSnackBar,
    protected override sharedData: SharedDataService,
  ) { super(commonService, snackBar, sharedData) }


  override loadData(): void {
    this.commonService.getUserGuideLink().subscribe((res) => {
      this.allData = res;
      this.policies = res.map(m => ({
        id: m.name,
        name: m.name,
        documents: this.isLazy ? [] : m.documents.map(doc => ({
          key: doc.key,
          displayValue: doc.displayValue,
          description: doc.description,
        })),
        totalElements: m.documents.length,
        isLoading: false
      }));
    });
  }
}
