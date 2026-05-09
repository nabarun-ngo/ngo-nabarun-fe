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
  protected allData: StaticDocumentDto[] = [];

  constructor(
    protected commonService: DashboardService,
  ) { }

  onSearch($event: SearchEvent): void {
  }

  loadData(): void {
    this.commonService.getPolicyLink().subscribe((res) => {
      this.allData = res;
      // Initially load only headers
      this.policies = res.map(m => ({
        id: m.name, // Using name as ID for this example
        name: m.name,
        documents: [], // Empty initially
        totalElements: m.documents.length,
        isLoading: false
      }));
    });
  }

  onCategoryOpened(category: DocumentCategory) {
    if (category.documents.length > 0) return; // Already loaded

    category.isLoading = true;
    
    // Simulate API delay
    setTimeout(() => {
      const data = this.allData.find(d => d.name === category.name);
      if (data) {
        category.documents = data.documents.map(doc => ({
          key: doc.key,
          displayValue: doc.displayValue,
          description: doc.description,
        }));
      }
      category.isLoading = false;
    }, 800);
  }

  onPageChanged(event: { category: DocumentCategory, page: number }) {
    console.log(`Page changed for ${event.category.name} to ${event.page}`);
    // Here you would normally call a paginated API
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
}
