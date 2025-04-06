import { Component, OnInit } from '@angular/core';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import {  AdminConstant, AdminDefaultValue, adminTabs } from '../admin.const';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { ActivatedRoute } from '@angular/router';
import { ApiKeyDetail, KeyValue } from 'src/app/core/api/models';
import { AdminServiceInfo } from '../admin.model';
import { AdminService } from '../admin.service';
import { NavigationButtonModel } from 'src/app/shared/components/generic/page-navigation-buttons/page-navigation-buttons.component';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {

  defaultValue = AdminDefaultValue;
  constant = AdminConstant;
  protected tabIndex!: number;
  protected tabMapping: adminTabs[] = ['service_list','api_keys', 'global_config','app_logs',];
  navigations: NavigationButtonModel[] = [
    {
      displayName: 'Back to Dashboard',
      routerLink: AppRoute.secured_dashboard_page.url
    }
  ];
  refData!: {[key: string]: KeyValue[];};
  apiKeyList: ApiKeyDetail[] | undefined;
  serviceList: AdminServiceInfo[] | undefined ;



  constructor(
    private sharedDataService: SharedDataService,
    private route: ActivatedRoute,
    private adminService: AdminService,

  ) {}

  ngOnInit(): void {
    this.sharedDataService.setPageName(this.defaultValue.pageTitle);
    /**
     * Mapping tab
     */
    let tab = this.route.snapshot.data["tab"] ? this.route.snapshot.data["tab"] as adminTabs : this.defaultValue.tabName;
    this.tabMapping.forEach((value: adminTabs, key: number) => {
      if (tab == value) {
        this.tabIndex = key;
      }
    })

    if (this.route.snapshot.data['ref_data']) {
      this.refData = this.route.snapshot.data['ref_data'];
      this.sharedDataService.setRefData('ACCOUNT', this.refData!);
    }
    this.fetchDetails();
  }

 
  fetchDetails() {
    //console.log(this.tabMapping,this.tabIndex)
    if(this.tabMapping[this.tabIndex] == 'service_list'){
      this.serviceList=[
        {
          id: 'CLEAR_CACHE',
          name:'Clear Cache',
          description:'This service clears all system cache on server.',
          inputs:[
            {
              id:'cacheNames',
              name:'Cache names (Optional)',
              model:{
                html_id:'cache_names',
                inputType:'',
                tagName:'textarea',
                placeholder:'Enter comma separated cache names'
              }
            }
          ]
        },
        {
          id: 'SYNC_USER',
          name:'Sync User',
          description:'This service sync user details from Auth0.',
          inputs:[
            {
              id:'syncRole',
              name:'Sync Roles',
              model:{
                html_id:'sync_role',
                inputType:'',
                tagName:'select',
                placeholder:'Select Sync Role',
                selectList:[{key:'Y',displayValue:'Yes'},{key:'N',displayValue:'No'}]
              },
              required:true
            },
            {
              id:'userId',
              name:'User Auth0 Id (Optional)',
              model:{
                html_id:'user_auth0_id',
                inputType:'text',
                tagName:'input',
                placeholder:'Enter User Id',
              }
            },
            {
              id:'userEmail',
              name:'User Email (Optional)',
              model:{
                html_id:'user_auth0_email',
                inputType:'email',
                tagName:'input',
                placeholder:'Enter User Email',
              }
            }
          ]
        }
      ];
    }else if(this.tabMapping[this.tabIndex] == 'api_keys'){
      this.adminService.getAPIKeyList().subscribe(data=>{
        this.apiKeyList=data;
      });
    }
  }

  
  tabChanged(index: number) {
    this.tabIndex=index;
    this.fetchDetails();
  }

}
