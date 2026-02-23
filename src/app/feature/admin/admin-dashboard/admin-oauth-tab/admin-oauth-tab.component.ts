import { Component } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { AuthTokenDto } from 'src/app/core/api-client/models';
import { SearchEvent } from 'src/app/shared/components/search-and-advanced-search-form/search-event.model';
import { TabComponentInterface } from 'src/app/shared/interfaces/tab-component.interface';
import { AccordionCell, AccordionButton } from 'src/app/shared/model/accordion-list.model';
import { DetailedView } from 'src/app/shared/model/detailed-view.model';
import { Accordion } from 'src/app/shared/utils/accordion';
import { AdminService } from '../../admin.service';
import { KeyValue } from 'src/app/shared/model/key-value.model';
import { AdminConstant, AdminDefaultValue } from '../../admin.const';

@Component({
  selector: 'app-admin-oauth-tab',
  templateUrl: './admin-oauth-tab.component.html',
  styleUrls: ['./admin-oauth-tab.component.scss']
})
export class AdminOauthTabComponent extends Accordion<AuthTokenDto> implements TabComponentInterface<string> {
  scopes: KeyValue[] = [];

  constructor(
    private adminService: AdminService,
  ) {
    super();
  }

  override onInitHook(): void {
    this.setHeaderRow([{ value: 'Client ID' }, { value: 'Provider' }])
  }
  protected override prepareHighLevelView(data: AuthTokenDto, options?: { [key: string]: any; }): AccordionCell[] {
    return [
      {
        type: 'text',
        value: data?.clientId!,
        bgColor: 'bg-purple-200',
        rounded: true
      },
      {
        type: 'text',
        value: data?.provider!,
      },
    ];
  }
  protected override prepareDetailedView(data: AuthTokenDto, options?: { [key: string]: any; }): DetailedView[] {
    const isCreate = options && options['create'];
    return [{
      section_name: 'OAuth Detail',
      section_type: 'key_value',
      section_html_id: 'oauth_detail',
      section_form: new FormGroup({}),
      hide_section: false,
      content: [
        {
          field_name: 'Token ID',
          field_value: data?.id!,
          hide_field: isCreate,
        },
        {
          field_name: 'Provider',
          field_value: data?.provider!,
          hide_field: isCreate,
        },
        {
          field_name: 'Scopes',
          field_value: data?.scope?.join(",")!,
          field_display_value: data?.scope?.join(", ")!,
          field_value_splitter: ",",
          editable: true,
          field_html_id: 'scopes',
          form_control_name: 'scopes',
          form_input_validation: [Validators.required],
          form_input: {
            html_id: 'scopes',
            inputType: 'multiselect',
            tagName: 'select',
            placeholder: 'Select Scopes',
            selectList: this.scopes
          }
        },
        {
          field_name: 'Client ID',
          field_html_id: 'client_id',
          field_value: data?.clientId!,
          hide_field: isCreate,
        },
        {
          field_name: 'Email',
          field_html_id: 'client_email',
          field_value: data?.email!,
          hide_field: isCreate,
        },
        {
          field_name: 'Created At',
          field_value: data?.createdAt!,
          hide_field: isCreate,
        },
        {
          field_name: 'Updated At',
          field_value: data?.updatedAt!,
          hide_field: isCreate,
        },
        {
          field_name: 'Expires At',
          field_value: data?.expiresAt!,
          hide_field: isCreate,
        },

      ]
    }];
  }
  protected override prepareDefaultButtons(data: AuthTokenDto, options?: { [key: string]: any; }): AccordionButton[] {
    const isCreate = options && options['create'];
    if (isCreate) {
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
    return [];
  }
  protected override onClick(event: { buttonId: string; rowIndex: number; }): void {
    switch (event.buttonId) {
      case 'CREATE':
        const oauth_detail = this.getSectionForm('oauth_detail', 0, true);
        if (oauth_detail?.valid) {
          const scopes = oauth_detail.value.scopes as string[];
          this.adminService.createOAuthToken(scopes).subscribe(s => {
            this.hideForm(0, true)
            window.open(s!, '_blank')?.focus();
          });
        } else {
          oauth_detail?.markAllAsTouched();
        }
        break;
      case 'CANCEL_CREATE':
        this.hideForm(0, true);
        break;
      case 'REVOKE':
        break;
    }

  }
  protected override onAccordionOpen(event: { rowIndex: number; }): void {
  }
  protected override get paginationConfig(): { pageNumber: number; pageSize: number; pageSizeOptions: number[]; } {
    return {
      pageNumber: AdminDefaultValue.pageNumber,
      pageSize: AdminDefaultValue.pageSize,
      pageSizeOptions: AdminDefaultValue.pageSizeOptions
    };
  }
  override handlePageEvent($event: PageEvent): void { }
  onSearch($event: SearchEvent): void { }
  loadData(): void {
    this.adminService.getOAuthScopes().subscribe(data => {
      this.scopes = data.map((item) => {
        return {
          key: item,
          displayValue: item.split("/")[item.split("/").length - 1]
        } as KeyValue
      });
      this.adminService.getOAuthTokenList().subscribe(data => {
        this.setContent(data.content!, data?.totalSize);
      });
    });

  }

}
