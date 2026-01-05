import { Component, OnInit } from '@angular/core';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { NavigationButtonModel } from 'src/app/shared/components/generic/page-navigation-buttons/page-navigation-buttons.component';
import { DashboardService } from '../dashboard.service';
import { StaticDocumentDto } from 'src/app/core/api-client/models/static-document-dto';

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
  policies: StaticDocumentDto[] = [];
  userGuides: StaticDocumentDto[] = [];


  constructor(
    private sharedData: SharedDataService,
    private commonService: DashboardService,

  ) { }

  ngOnInit(): void {
    this.sharedData.setPageName('Help & Support');
    this.commonService.getPolicyLink().subscribe((res) => this.policies = res);
    this.commonService.getUserGuideLink().subscribe((res) => this.userGuides = res);
  }



}
