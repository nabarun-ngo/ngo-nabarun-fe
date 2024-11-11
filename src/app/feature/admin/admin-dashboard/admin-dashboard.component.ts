import { Component, OnInit } from '@angular/core';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { NavigationButtonModel } from 'src/app/shared/components/generic/page-navigation-buttons/page-navigation-buttons.component';
import { AdminConstant, AdminDefaultValue, adminTabs } from '../admin.const';
import { Accordion } from 'src/app/shared/components/generic/accordion-list/accordion';
import { PageEvent } from '@angular/material/paginator';
import { AccordionCell, AccordionButton } from 'src/app/shared/components/generic/accordion-list/accordion-list.model';
import { DetailedView, DetailedViewField } from 'src/app/shared/components/generic/detailed-view/detailed-view.model';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { ActivatedRoute } from '@angular/router';
import { KeyValue } from 'src/app/core/api/models';
import { AdminServiceInfo } from '../admin.model';
import { FormGroup, Validators } from '@angular/forms';
import { JsonPipe } from '@angular/common';
import { AdminService } from '../admin.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent extends Accordion<AdminServiceInfo> implements OnInit {

  defaultValue = AdminDefaultValue;
  constant = AdminConstant;
  protected tabIndex!: number;
  protected tabMapping: adminTabs[] = ['service_list', 'app_logs', 'global_config'];
  navigations: NavigationButtonModel[] = [
    {
      displayName: 'Back to Dashboard',
      routerLink: AppRoute.secured_dashboard_page.url
    }
  ];
  refData!: {[key: string]: KeyValue[];};

  constructor(
    private sharedDataService: SharedDataService,
    private route: ActivatedRoute,
    private adminService: AdminService,

  ) {
    super();
    super.init(this.defaultValue.pageNumber, this.defaultValue.pageSize, this.defaultValue.pageSizeOptions)
  }
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
      this.setRefData(this.refData);
    }
    this.setAccordionHeader();
    this.fetchDetails();
  }

  setAccordionHeader(){
    if(this.tabMapping[this.tabIndex] == 'service_list'){
      this.setHeaderRow([
        {
          type:'text',
          value:'Service Name',
          bgColor: 'bg-purple-200',
          rounded:true
        },
        {
          type:'text',
          value:'Service Descriptiion',
        }
      ])
    }else{
      this.setHeaderRow([])
    }
    
  }
  fetchDetails() {
    //console.log(this.tabMapping,this.tabIndex)
    if(this.tabMapping[this.tabIndex] == 'service_list'){
      this.setContent([
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
      ])
    }
  }

  protected override prepareHighLevelView(data: AdminServiceInfo, options?: { [key: string]: any; }): AccordionCell[] {
    console.log(data)
    if(this.tabMapping[this.tabIndex] == 'service_list'){
      return [
        {
          type: 'text',
          value: data.name,
          bgColor: 'bg-purple-200',
          rounded:true
        },
        {
          type: 'text',
          value: data.description,
        },
      ];
    }
    return [
      
    ];
  }
  protected override prepareDetailedView(data: AdminServiceInfo, options?: { [key: string]: any; }): DetailedView[] {
    if(this.tabMapping[this.tabIndex] == 'service_list'){
      let service_inputs=data.inputs.map(m=>{
        return {
          field_name: m.name,
          field_html_id: m.id,
          field_value: m.value,
          editable: true,
          form_control_name: m.id,
          form_input: m.model,
          form_input_validation: m.required ? [Validators.required]:[]
        } as DetailedViewField;
      });
      return [{
        section_name: 'Service Input',
        section_type: 'key_value',
        section_html_id: 'service_input',
        section_form: new FormGroup({}),
        show_form:true,
        hide_section: false,
        content: service_inputs
      }];
    }
    
    return [];
  }

  protected override prepareDefaultButtons(data: AdminServiceInfo, options?: { [key: string]: any; }): AccordionButton[] {
    if(this.tabMapping[this.tabIndex] == 'service_list'){
      return [{
        button_id:data.id,
        button_name:'Run'
      }];
    }
    return [];
  }


  override handlePageEvent($event: PageEvent): void {}
  accordionOpened($event: { rowIndex: number; }) {}

  onClick($event: { buttonId: string; rowIndex: number; }) {
    let formdata = this.getSectionForm('service_input', $event.rowIndex);
    switch($event.buttonId){
      case 'CLEAR_CACHE':
        let cacheName=formdata?.value.cacheNames as string;
        this.adminService.clearCache(cacheName?cacheName.split(','):[]).subscribe(data=>{
          this.addSectionInAccordion({
            section_name: 'Service Output',
            section_type: 'key_value',
            section_html_id: 'service_output',
            section_form: new FormGroup({}),
            hide_section: false,
            content: [{
              field_name:'Response',
              field_value: new JsonPipe().transform(data)
            }]
          }, $event.rowIndex)
        })
        break;
        case 'SYNC_USER':
        console.log(formdata)
        let sync_role=formdata?.value.syncRole as string;
        let userId=formdata?.value.userId as string;
        let userEmail=formdata?.value.userEmail as string;
        this.adminService.syncUser(sync_role,{userId:userId,userEmail:userEmail}).subscribe(data=>{
          this.addSectionInAccordion({
            section_name: 'Service Output',
            section_type: 'key_value',
            section_html_id: 'service_output',
            section_form: new FormGroup({}),
            hide_section: false,
            content: [{
              field_name:'Response',
              field_value: new JsonPipe().transform(data)
            }]
          }, $event.rowIndex)
        })
        break;
    }
  }
  tabChanged(index: number) {
    this.tabIndex=index;
    this.fetchDetails();
  }

}
