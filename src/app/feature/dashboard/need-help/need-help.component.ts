import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ImportantLinks, LinkCategoryDetail } from 'src/app/core/api/models';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { NavigationButtonModel } from 'src/app/shared/components/generic/page-navigation-buttons/page-navigation-buttons.component';
import { CommonService } from 'src/app/shared/services/common.service';


@Component({
  selector: 'app-need-help',
  templateUrl: './need-help.component.html',
  styleUrls: ['./need-help.component.scss']
})
export class NeedHelpComponent implements OnInit{

  protected navigations: NavigationButtonModel[] = [
      {
        displayName: 'Back to Dashboard',
        routerLink: AppRoute.secured_dashboard_page.url,
      },
    ];

  protected AppRoutes = AppRoute;

  links: ImportantLinks = {policies:[],userGuides:[]};

   constructor(
      private sharedData: SharedDataService,
      private commonService: CommonService,
      
    ) {}

  ngOnInit(): void {
    this.sharedData.setPageName('Help & Support');
    this.commonService.getUsefulLink().subscribe((res) => {
      this.links = res!;
      console.log(res)
    });
  }

    
  
}
