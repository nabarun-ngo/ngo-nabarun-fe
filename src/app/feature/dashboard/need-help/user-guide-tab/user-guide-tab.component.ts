import { Component } from '@angular/core';
import { SearchEvent } from 'src/app/shared/components/search-and-advanced-search-form/search-event.model';
import { TabComponentInterface } from 'src/app/shared/interfaces/tab-component.interface';
import { KeyValue } from 'src/app/shared/model/key-value.model';
import { DashboardService } from '../../services/dashboard.service';
import { PolicyHubTabComponent } from '../policy-hub-tab/policy-hub-tab.component';
import { DocumentCategory } from 'src/app/shared/components/document-link/document-link.model';

@Component({
  selector: 'app-user-guide-tab',
  templateUrl: './user-guide-tab.component.html',
  styleUrls: ['./user-guide-tab.component.scss']
})
export class UserGuideTabComponent extends PolicyHubTabComponent {
  userGuides: DocumentCategory[] = [];
  constructor(
    protected override commonService: DashboardService,
  ) { super(commonService) }


  override loadData(): void {
    console.log("Hii2")
    this.commonService.getUserGuideLink().subscribe((res) => this.userGuides = res.map(m => this.toDocumentCategory(m)));
  }
}
