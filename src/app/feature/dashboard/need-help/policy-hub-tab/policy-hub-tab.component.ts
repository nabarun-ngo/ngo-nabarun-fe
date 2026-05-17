import { Component, Input } from '@angular/core';
import { SearchEvent } from 'src/app/shared/components/search-and-advanced-search-form/search-event.model';
import { TabComponentInterface } from 'src/app/shared/interfaces/tab-component.interface';
import { KeyValue } from 'src/app/shared/model/key-value.model';
import { DashboardService } from '../../services/dashboard.service';
import { DocumentCategory, KebabMenuItem } from 'src/app/shared/components/document-link/document-link.model';
import { StaticDocumentDto } from 'src/app/core/api-client/models';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-policy-hub-tab',
  templateUrl: './policy-hub-tab.component.html',
  styleUrls: ['./policy-hub-tab.component.scss']
})
export class PolicyHubTabComponent implements TabComponentInterface<KeyValue[]> {
  policies: DocumentCategory[] = [];
  protected allData: StaticDocumentDto[] = [];

  kebabMenuItems: KebabMenuItem[] = [
    {
      name: 'Copy Link',
      onClick: (doc: KeyValue, categoryName: string) => {
        this.copyLink(doc);
      }
    },
    {
      name: 'Share',
      onClick: (doc: KeyValue, categoryName: string) => {
        this.shareToApps(doc);
      }
    }
  ];

  @Input() isLazy: boolean = true;

  constructor(
    protected commonService: DashboardService,
    protected snackBar: MatSnackBar,
  ) { }

  onSearch($event: SearchEvent): void {
  }

  loadData(): void {
    this.commonService.getPolicyLink().subscribe((res) => {
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

  onCategoryOpened(category: DocumentCategory) {
    if (category.documents.length > 0) return; // Already loaded

    const data = this.allData.find(d => d.name === category.name);
    if (data) {
      category.documents = data.documents.map(doc => ({
        key: doc.key,
        displayValue: doc.displayValue,
        description: doc.description,
      }));
    }
  }

  onPageChanged(event: { category: DocumentCategory, page: number }) {
    console.log(`Page changed for ${event.category.name} to ${event.page}`);
    // Here you would normally call a paginated API
  }

  onDocumentClicked(event: { doc: KeyValue, categoryName: string }) {
    const url = this.getEmbedUrl(event.doc.displayValue);
    window.open(url, '_blank');
  }

  copyLink(doc: KeyValue) {
    if (doc.displayValue) {
      const url = this.getEmbedUrl(doc.displayValue);
      navigator.clipboard.writeText(url).then(() => {
        this.snackBar.open('Link copied to clipboard', 'Close', { duration: 2000 });
      }).catch(err => {
        console.error('Failed to copy link: ', err);
        this.snackBar.open('Failed to copy link', 'Close', { duration: 2000 });
      });
    }
  }

  shareToApps(doc: KeyValue) {
    if (doc.displayValue) {
      const url = this.getEmbedUrl(doc.displayValue);
      const description = doc.description || doc.key;
      const text = `Check out this document: ${description}\nLink: ${url}`;

      if (navigator.share) {
        navigator.share({
          title: description,
          text: description,
          url: url
        }).catch(err => {
          console.error('Error sharing:', err);
        });
      } else {
        // Fallback to WhatsApp
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(whatsappUrl, '_blank');
      }
    }
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
