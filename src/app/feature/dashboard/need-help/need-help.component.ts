import { Component, OnInit } from '@angular/core';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { NavigationButtonModel } from 'src/app/shared/components/generic/page-navigation-buttons/page-navigation-buttons.component';
import { DashboardService } from '../dashboard.service';
import { DocumentCategory } from 'src/app/shared/components/document-link/document-link.model';
import { KeyValue } from 'src/app/shared/model/key-value.model';
import { StaticDocumentDto } from 'src/app/core/api-client/models';

@Component({
  selector: 'app-need-help',
  templateUrl: './need-help.component.html',
  styleUrls: ['./need-help.component.scss']
})
export class NeedHelpComponent implements OnInit {

  protected navigations: NavigationButtonModel[] = [
    {
      displayName: 'Back to Dashboard',
      routerLink: AppRoute.secured_dashboard_page.url,
    },
  ];

  protected AppRoutes = AppRoute;
  policies: DocumentCategory[] = [];
  userGuides: DocumentCategory[] = [];


  constructor(
    private sharedData: SharedDataService,
    private commonService: DashboardService,

  ) { }

  ngOnInit(): void {
    this.sharedData.setPageName('Help & Support');
    this.commonService.getPolicyLink().subscribe((res) => this.policies = res.map(m => this.toDocumentCategory(m)));
    this.commonService.getUserGuideLink().subscribe((res) => this.userGuides = res.map(m => this.toDocumentCategory(m)));
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



  private toDocumentCategory(m: StaticDocumentDto): DocumentCategory {
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
