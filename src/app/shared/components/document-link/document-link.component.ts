import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { KeyValueDto, StaticDocumentDto } from 'src/app/core/api-client/models';
import { AppRoute } from 'src/app/core/constant/app-routing.const';

@Component({
  selector: 'app-document-link',
  templateUrl: './document-link.component.html',
  styleUrls: ['./document-link.component.scss']
})
export class DocumentLinkComponent {

  //TODO: Change this to StaticDoc[]`
  @Input({ required: true })
  categories: StaticDocumentDto[] = [];

  constructor(private router: Router) { }

  openDocument(doc: KeyValueDto, secName: string) {
    const url = this.getEmbedUrl(doc.displayValue);
    //if (secName.toLowerCase().includes('video')) 
    // {
    window.open(url, '_blank');
    //return;
    //}
    // this.router.navigate([AppRoute.secured_dashboard_help_viewer_page.url], {
    //   queryParams: {
    //     title: doc.description,
    //     url: url
    //   }
    // });
  }

  private getEmbedUrl(url: string): string {
    if (!url) return '';

    // Handle OneDrive view links
    if (url.includes('onedrive.live.com') && url.includes('view.aspx')) {
      return url.replace('view.aspx', 'embed.aspx');
    }

    return url;
  }
}

