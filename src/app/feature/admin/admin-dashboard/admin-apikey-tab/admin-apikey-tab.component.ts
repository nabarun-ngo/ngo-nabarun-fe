import { Component, Input, OnInit } from '@angular/core';
import { AdminConstant, AdminDefaultValue } from '../../admin.const';
import { AdminService } from '../../admin.service';
import { ApiKeyDetail, KeyValue } from 'src/app/core/api/models';
import { Accordion } from 'src/app/shared/components/generic/accordion-list/accordion';
import { AccordionButton, AccordionCell } from 'src/app/shared/components/generic/accordion-list/accordion-list.model';
import { DetailedView } from 'src/app/shared/components/generic/detailed-view/detailed-view.model';
import { FormGroup, Validators } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { ModalService } from 'src/app/core/service/modal.service';
import { AppDialog } from 'src/app/core/constant/app-dialog.const';

@Component({
  selector: 'app-admin-apikey-tab',
  templateUrl: './admin-apikey-tab.component.html',
  styleUrls: ['./admin-apikey-tab.component.scss']
})
export class AdminApikeyTabComponent extends Accordion<ApiKeyDetail> implements OnInit {

  defaultValue = AdminDefaultValue;
  constant = AdminConstant;
  apiKeys: ApiKeyDetail[]=[];

  @Input({ required: true }) set apiKeyList(list: ApiKeyDetail[]) {
    if (list) {
      this.apiKeys=list;
      this.setContent(list!, list.length);
    }
  }

  constructor(
    private sharedData: SharedDataService,
    private adminService: AdminService,
    private modalService: ModalService,

  ) {
    super();
    super.init(this.defaultValue.pageNumber, this.defaultValue.pageSize, this.defaultValue.pageSizeOptions)
  }

  ngOnInit(): void {
    this.setRefData(this.sharedData.getRefData('ACCOUNT'));
    this.setHeaderRow([{value:'API Key Name'},{value:'API Key Scope'}])
  }

  protected override prepareHighLevelView(data: ApiKeyDetail, options?: { [key: string]: any; }): AccordionCell[] {
    console.log(data)

    let apiKey = data as ApiKeyDetail;
    return [
      {
        type: 'text',
        value: apiKey.name!,
        bgColor: 'bg-purple-200',
        rounded: true
      },
      {
        type: 'text',
        value: apiKey.scopes?.join(",")!,
      },
    ];

  }
  protected override prepareDetailedView(data: ApiKeyDetail, options?: { [key: string]: any; }): DetailedView[] {
    let isCreate = options && options['create'];
    let apikey = data as ApiKeyDetail;
    return [{
      section_name: 'API Key Detail',
      section_type: 'key_value',
      section_html_id: 'api_key_detail',
      section_form: new FormGroup({}),
      show_form: false,
      hide_section: false,
      content: [
        {
          field_name: 'APIKey Name',
          field_html_id: 'api_key_name',
          field_value: apikey.name!,
          editable: true,
          form_control_name: 'name',
          form_input_validation: [Validators.required],
          form_input: {
            html_id: 'ip_api_key_name',
            inputType: 'text',
            tagName: 'input',
            placeholder:'Enter APIKey Name'
          }
        },
        {
          field_name: 'APIKey Scope',
          field_html_id: 'api_key_scope',
          field_value: apikey.scopes?.join(',')!,
          field_value_splitter:',',
          editable: true,
          form_control_name: 'scopes',
          form_input_validation: [Validators.required],
          form_input: {
            html_id: 'ip_api_key_scope',
            inputType: 'multiselect',
            tagName: 'select',
            selectList:[],
            placeholder:'Select APIKey Scope',
            autocomplete:true
          }
        },
        {
          field_name: 'Expire On',
          field_html_id: 'api_key_exp',
          field_value: apikey.expiryDate!,
          hide_field: !(apikey.expireable|| isCreate),
          editable: isCreate,
          form_control_name: 'expiryDate',
          form_input_validation: [],
          form_input: {
            html_id: 'ip_api_key_exp',
            inputType: 'date',
            tagName: 'input',
            placeholder:'Select Expire Date'
          }
        },
      ]
    }];


  }

  protected override prepareDefaultButtons(data: ApiKeyDetail, options?: { [key: string]: any; }): AccordionButton[] {
    if (options && options['create']) {
      return [
        {
          button_id: 'CANCEL_CREATE',
          button_name: 'Cancel'
        },
        {
          button_id: 'CREATE',
          button_name: 'Create'
        }
      ];
    }
    return [{
      button_id: 'REVOKE',
      button_name: 'Revoke'
    },{
      button_id: 'UPDATE',
      button_name: 'Update'
    }];
  }


  override handlePageEvent($event: PageEvent): void { }
  accordionOpened($event: { rowIndex: number; }) { }

  onClick($event: { buttonId: string; rowIndex: number; }) {
    switch ($event.buttonId) {
      case 'CREATE':
        let api_key_detail = this.getSectionForm('api_key_detail', 0, true);
        if (api_key_detail?.valid) {
          this.adminService.createAPIKey(api_key_detail.value).subscribe(s => {
            this.hideForm(0, true)
            this.addContentRow(s!)
            this.apiKeys.push(s!)
            window.navigator.clipboard.writeText(s?.apiKey!)
            this.modalService.openNotificationModal({
              title:'API Key Generated',
              description:'The generated API key has been copied to your clipboard. Please save it securely, as it will not be shown again.<br><br><b>'+s?.apiKey+'</b>'
            },'notification','success');
          });
        } else {
          api_key_detail?.markAllAsTouched();
        }
        break;
      case 'CANCEL':
        this.hideForm($event.rowIndex);
        break;
      case 'CANCEL_CREATE':
        this.hideForm(0, true);
        break;
      case 'REVOKE':
        let modal=this.modalService.openNotificationModal(AppDialog.warning_confirm_revoke,'confirmation','warning')
        modal.onAccept$.subscribe(s=>{
          let id =this.apiKeys[$event.rowIndex].id!;
          this.adminService.revokeAPIKey(id).subscribe(s=>{});
        })
        break;
      case 'UPDATE':
          this.adminService.getEndpointList().subscribe(d=>{
            let list = d.filter((p: any)=> p.details ).map((m: any)=>{
              let url= m.details.requestMappingConditions.patterns[0];
              return {key:url,displayValue:url}as KeyValue;
            })
            this.showForm($event.rowIndex, ['api_key_detail']);
            this.getSectionField('api_key_detail','api_key_scope',$event.rowIndex).form_input!.selectList=list;
          })
          break;
      case 'CONFIRM':
        console.log(this.apiKeys)
        let id =this.apiKeys[$event.rowIndex].id!;
        let api_key_detail_update = this.getSectionForm('api_key_detail', $event.rowIndex);
        if(api_key_detail_update?.valid){
          this.adminService.updateAPIKeyDetail(id,api_key_detail_update.value).subscribe(d=>{
            this.hideForm($event.rowIndex);
          })
        }else {
          api_key_detail_update?.markAllAsTouched();
        }
        break;
    }

  }

  createAPIKey() {
    this.showCreateForm({})
    this.adminService.getEndpointList().subscribe(d=>{
      let list = d.filter((p: any)=> p.details ).map((m: any)=>{
        let url= m.details.requestMappingConditions.patterns[0];
        return {key:url,displayValue:url}as KeyValue;
      })
      this.getSectionField('api_key_detail','api_key_scope',0,true).form_input!.selectList=list;
    })
    
  }
}
