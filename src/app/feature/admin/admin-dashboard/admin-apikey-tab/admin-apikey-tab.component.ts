import { Component } from '@angular/core';
import { AdminConstant, AdminDefaultValue } from '../../admin.const';
import { AdminService } from '../../admin.service';
import { Accordion } from 'src/app/shared/utils/accordion';
import { AccordionButton, AccordionCell } from 'src/app/shared/model/accordion-list.model';
import { DetailedView } from 'src/app/shared/model/detailed-view.model';
import { FormGroup, Validators } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { ModalService } from 'src/app/core/service/modal.service';
import { AppDialog } from 'src/app/core/constant/app-dialog.const';
import { TabComponentInterface } from 'src/app/shared/interfaces/tab-component.interface';
import { SearchEvent } from 'src/app/shared/components/search-and-advanced-search-form/search-event.model';
import { ApiKeyDto } from 'src/app/core/api-client/models';
import { KeyValue } from 'src/app/shared/model/key-value.model';

@Component({
  selector: 'app-admin-apikey-tab',
  templateUrl: './admin-apikey-tab.component.html',
  styleUrls: ['./admin-apikey-tab.component.scss']
})
export class AdminApikeyTabComponent extends Accordion<ApiKeyDto> implements TabComponentInterface<ApiKeyDto> {
  permissions: KeyValue[] = [];
  protected override get paginationConfig(): { pageNumber: number; pageSize: number; pageSizeOptions: number[]; } {
    return {
      pageNumber: this.defaultValue.pageNumber,
      pageSize: this.defaultValue.pageSize,
      pageSizeOptions: this.defaultValue.pageSizeOptions
    };
  }
  defaultValue = AdminDefaultValue;
  constant = AdminConstant;

  constructor(
    private adminService: AdminService,
    private modalService: ModalService,

  ) {
    super();
  }

  override onInitHook(): void {
    this.setHeaderRow([{ value: 'Name' }, { value: 'Scope' }, { value: 'Status' }])
  }

  protected override prepareHighLevelView(data: ApiKeyDto, options?: { [key: string]: any; }): AccordionCell[] {
    let apiKey = data as ApiKeyDto;
    return [
      {
        type: 'text',
        value: apiKey?.name!,
        bgColor: 'bg-purple-200',
        rounded: true
      },
      {
        type: 'text',
        value: apiKey?.permissions?.join(", ")!,
      },
      {
        type: 'text',
        value: new Date(apiKey?.expiresAt!) > new Date() ? 'Active' : 'Expired',
      },
    ];

  }

  protected override prepareDetailedView(data: ApiKeyDto, options?: { [key: string]: any; }): DetailedView[] {
    let isCreate = options && options['create'];
    let apikey = data as ApiKeyDto;
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
          field_value: apikey?.name!,
          editable: true,
          form_control_name: 'name',
          form_input_validation: [Validators.required],
          form_input: {
            html_id: 'ip_api_key_name',
            inputType: 'text',
            tagName: 'input',
            placeholder: 'Enter APIKey Name'
          }
        },
        {
          field_name: 'API Key',
          field_html_id: 'api_key',
          field_value: apikey?.apiToken!,
          hide_field: !apikey?.apiToken,
        },
        {
          field_name: 'APIKey Scope',
          field_html_id: 'api_key_scope',
          field_value: apikey?.permissions?.join(',')!,
          field_value_splitter: ',',
          field_display_value: apikey?.permissions?.join(', ')!,
          editable: true,
          form_control_name: 'permissions',
          form_input_validation: [Validators.required],
          form_input: {
            html_id: 'api_key_scope',
            inputType: 'multiselect',
            tagName: 'select',
            selectList: this.permissions,
            placeholder: 'Select APIKey Scope',
          }
        },
        {
          field_name: 'Expire On',
          field_html_id: 'api_key_exp',
          field_value: apikey?.expiresAt,
          hide_field: !(apikey?.expiresAt || isCreate),
          editable: isCreate,
          form_control_name: 'expireAt',
          form_input_validation: [Validators.required],
          form_input: {
            html_id: 'ip_api_key_exp',
            inputType: 'date',
            tagName: 'input',
            placeholder: 'Select Expire Date'
          }
        },
      ]
    }];


  }

  protected override prepareDefaultButtons(data: ApiKeyDto, options?: { [key: string]: any; }): AccordionButton[] {
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
    }, {
      button_id: 'UPDATE',
      button_name: 'Update'
    }];
  }


  override handlePageEvent($event: PageEvent): void {
    this.pageEvent = $event;
    this.adminService.getAPIKeyList($event.pageIndex, $event.pageSize).subscribe(data => {
      this.setContent(data.content!, data?.totalSize);
    });
  }
  onAccordionOpen($event: { rowIndex: number; }) { }
  onSearch($event: SearchEvent): void { }

  loadData(): void {
    this.adminService.getAPIScopeList().subscribe(d => {
      this.permissions = d.map(x => ({ key: x, displayValue: x } as KeyValue))
      this.adminService.getAPIKeyList(AdminDefaultValue.pageNumber, AdminDefaultValue.pageSize).subscribe(data => {
        this.setContent(data.content!, data?.totalSize);
      });
    })

  }


  onClick($event: { buttonId: string; rowIndex: number; }) {
    switch ($event.buttonId) {
      case 'CREATE':
        const api_key_detail = this.getSectionForm('api_key_detail', 0, true);
        //console.log(api_key_detail)

        if (api_key_detail?.valid) {
          this.adminService.createAPIKey(api_key_detail.value).subscribe(s => {
            this.hideForm(0, true)
            this.addContentRow(s!)
            window.navigator.clipboard.writeText(s?.apiToken!)
            this.modalService.openNotificationModal({
              title: 'API Key Generated',
              description: 'The generated API key has been copied to your clipboard. Please save it securely, as it will not be shown again.'
            }, 'notification', 'success');
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
        let modal = this.modalService.openNotificationModal(AppDialog.warning_confirm_revoke, 'confirmation', 'warning')
        modal.onAccept$.subscribe(s => {
          let apiKey = this.itemList[$event.rowIndex];
          this.adminService.revokeAPIKey(apiKey.id!).subscribe(s => { });
        })
        break;
      case 'UPDATE':
        this.showEditForm($event.rowIndex, ['api_key_detail']);
        break;
      case 'CONFIRM':
        const id = this.itemList[$event.rowIndex].id!;
        const api_key_detail_update = this.getSectionForm('api_key_detail', $event.rowIndex);
        if (api_key_detail_update?.valid) {
          this.adminService.updateAPIKeyDetail(id, api_key_detail_update.value.permissions).subscribe(d => {
            this.hideForm($event.rowIndex);
            this.updateContentRow(d!, $event.rowIndex);
          })
        } else {
          api_key_detail_update?.markAllAsTouched();
        }
        break;
    }

  }

  createAPIKey() {
    this.showCreateForm()
  }
}
