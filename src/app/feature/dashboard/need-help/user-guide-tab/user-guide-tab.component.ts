import { Component } from '@angular/core';
import { SearchEvent } from 'src/app/shared/components/search-and-advanced-search-form/search-event.model';
import { TabComponentInterface } from 'src/app/shared/interfaces/tab-component.interface';
import { KeyValue } from 'src/app/shared/model/key-value.model';
import { DashboardService } from '../../services/dashboard.service';
import { PolicyHubTabComponent } from '../policy-hub-tab/policy-hub-tab.component';
import { DocumentCategory } from 'src/app/shared/components/document-link/document-link.model';
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
  ) { super(commonService, snackBar) }


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
