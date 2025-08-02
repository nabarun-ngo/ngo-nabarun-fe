import { Component, Input, OnInit } from '@angular/core';
import { AdminServiceInfo } from '../../admin.model';
import { Accordion } from 'src/app/shared/utils/accordion';
import { AdminConstant, AdminDefaultValue } from '../../admin.const';
import { AdminService } from '../../admin.service';
import { AccordionButton, AccordionCell } from 'src/app/shared/model/accordion-list.model';
import { DetailedView, DetailedViewField } from 'src/app/shared/model/detailed-view.model';
import { FormGroup, Validators } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-admin-service-tab',
  templateUrl: './admin-service-tab.component.html',
  styleUrls: ['./admin-service-tab.component.scss']
})
export class AdminServiceTabComponent extends Accordion<AdminServiceInfo> implements OnInit{
 
  defaultValue = AdminDefaultValue;
  constant = AdminConstant;

  @Input({ required: true }) set serviceList(list: AdminServiceInfo[]) {
    if (list) {
      this.setContent(list!, list.length);
    }
  }

  constructor(
    private adminService: AdminService,
  ) {
    super();
    super.init(this.defaultValue.pageNumber, this.defaultValue.pageSize, this.defaultValue.pageSizeOptions)
  }

  ngOnInit(): void {
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
  }

  protected override prepareHighLevelView(data: AdminServiceInfo, options?: { [key: string]: any; }): AccordionCell[] {
    console.log(data)
      let service = data as AdminServiceInfo
      return [
        {
          type: 'text',
          value: service.name,
          bgColor: 'bg-purple-200',
          rounded:true
        },
        {
          type: 'text',
          value: service.description,
        },
      ];
  
  }
  protected override prepareDetailedView(data: AdminServiceInfo, options?: { [key: string]: any; }): DetailedView[] {
      let service=data as AdminServiceInfo;
      let service_inputs=service.inputs.map(m=>{
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

  protected override prepareDefaultButtons(data: AdminServiceInfo, options?: { [key: string]: any; }): AccordionButton[] {
    return [{
      button_id:data.id,
      button_name:'Run'
    }];
  }


  override handlePageEvent($event: PageEvent): void {}
  protected override onAccordionOpen($event: { rowIndex: number; }) {}

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
 

}
