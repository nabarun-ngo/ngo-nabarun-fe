import { Component } from '@angular/core';
import { SearchEvent } from 'src/app/shared/components/search-and-advanced-search-form/search-event.model';
import { TabComponentInterface } from 'src/app/shared/interfaces/tab-component.interface';
import { KeyValue } from 'src/app/shared/model/key-value.model';
import { DashboardService } from '../../services/dashboard.service';
import { DocumentCategory } from 'src/app/shared/components/document-link/document-link.model';
import { StaticDocumentDto } from 'src/app/core/api-client/models';

@Component({
  selector: 'app-policy-hub-tab',
  templateUrl: './policy-hub-tab.component.html',
  styleUrls: ['./policy-hub-tab.component.scss']
})
export class PolicyHubTabComponent implements TabComponentInterface<KeyValue[]> {
  policies: DocumentCategory[] = [];

  constructor(
    protected commonService: DashboardService,
  ) { }
  onSearch($event: SearchEvent): void {
  }
  loadData(): void {
    console.log("Hii")
    this.commonService.getPolicyLink().subscribe((res) =>
      this.policies = res.map(m => this.toDocumentCategory(m))
    );
  }

  onDocumentClicked(event: { doc: KeyValue, categoryName: string }) {
    const url = this.getEmbedUrl(event.doc.displayValue);
    window.open(url, '_blank');
  }

  private getEmbedUrl(url: string | undefined): string {
    if (!url) return '';

    // Handle OneDrive view links
    if (url.includes('onedrive.live.com') && url.includes('view.aspx')) {
      return url.replace('view.aspx', 'embed.aspx');
    }

    return url;
  }



  protected toDocumentCategory(m: StaticDocumentDto): DocumentCategory {
    return {
      name: m.name,
      documents: m.documents.map(doc => ({
        key: doc.key,
        displayValue: doc.displayValue,
        description: doc.description,
      }))
    };
  }

}
