import { Component } from '@angular/core';
import { Accordion } from 'src/app/shared/utils/accordion';
import { UserFcmTokensDto } from 'src/app/core/api-client/models';
import { TabComponentInterface } from 'src/app/shared/interfaces/tab-component.interface';
import { AdminService } from '../../admin.service';
import { AdminDefaultValue } from '../../admin.const';
import { AccordionCell, AccordionButton } from 'src/app/shared/model/accordion-list.model';
import { DetailedView } from 'src/app/shared/model/detailed-view.model';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { SearchEvent } from 'src/app/shared/components/search-and-advanced-search-form/search-event.model';
import { ModalService } from 'src/app/core/service/modal.service';
import { AppDialog } from 'src/app/core/constant/app-dialog.const';
import { date } from 'src/app/core/service/utilities.service';

@Component({
  selector: 'app-admin-fcm-token-tab',
  templateUrl: './admin-fcm-token-tab.component.html',
  styleUrls: ['./admin-fcm-token-tab.component.scss']
})
export class AdminFcmTokenTabComponent extends Accordion<UserFcmTokensDto> implements TabComponentInterface<UserFcmTokensDto> {

  constructor(
    private adminService: AdminService,
    private modalService: ModalService
  ) {
    super();
  }

  override onInitHook(): void {
    this.setHeaderRow([
      { value: 'User' },
      { value: 'Email' },
      { value: 'Tokens' }
    ]);
  }

  protected override prepareHighLevelView(data: UserFcmTokensDto): AccordionCell[] {
    return [
      {
        type: 'text',
        value: `${data.user.firstName} ${data.user.lastName}`,
        bgColor: 'bg-blue-50',
        rounded: true
      },
      {
        type: 'text',
        value: data.user.email
      },
      {
        type: 'text',
        value: data.tokens.length.toString(),
        bgColor: data.tokens.length > 0 ? 'bg-green-100' : 'bg-gray-100',
        rounded: true
      }
    ];
  }

  protected override prepareDetailedView(data: UserFcmTokensDto): DetailedView[] {
    const tokenFormArray = new FormArray(
      data.tokens.map(t => new FormGroup({
        id: new FormControl(t.id),
        deviceName: new FormControl(t.deviceName || '-'),
        os: new FormControl(t.os || '-'),
        browser: new FormControl(t.browser || '-'),
        isActive: new FormControl(t.isActive ? 'Active' : 'Inactive'),
        lastUsedAt: new FormControl(date(t.lastUsedAt, 'dd/MM/yyyy HH:mm:ss') || '-')
      }))
    );

    // Revoke Logic: Hijack removeAt
    const originalRemoveAt = tokenFormArray.removeAt.bind(tokenFormArray);
    tokenFormArray.removeAt = (index: number) => {
      const token = tokenFormArray.at(index).value;
      const modal = this.modalService.openNotificationModal(AppDialog.warning_confirm_revoke, 'confirmation', 'warning');
      modal.onAccept$.subscribe(() => {
        this.adminService.deleteFcmToken(token.id!).subscribe(() => {
          originalRemoveAt(index);
        });
      });
    };

    return [
      {
        section_name: 'Registered Devices',
        section_type: 'editable_list',
        section_html_id: 'tokens_list',
        section_form: new FormGroup({
          tokens: tokenFormArray
        }),
        show_form: true,
        editableList: {
          formArrayName: 'tokens',
          allowDeleteRow: true,
          itemFields: [
            { field_name: 'Device Name', form_control_name: 'deviceName', editable: false, field_value: undefined },
            { field_name: 'OS', form_control_name: 'os', editable: false, field_value: undefined },
            { field_name: 'Browser', form_control_name: 'browser', editable: false, field_value: undefined },
            { field_name: 'Status', form_control_name: 'isActive', editable: false, field_value: undefined },
            { field_name: 'Last Used At', form_control_name: 'lastUsedAt', editable: false, field_value: undefined }
          ]
        }
      }
    ];
  }

  protected override prepareDefaultButtons(data: UserFcmTokensDto): AccordionButton[] {
    return [];
  }

  protected override onAccordionOpen(event: { rowIndex: number; }): void {
  }

  protected override onClick(event: { buttonId: string; rowIndex: number; }): void {
  }

  override handlePageEvent($event: PageEvent): void {
    this.pageEvent = $event;
    this.loadData();
  }

  onSearch($event: SearchEvent): void {
  }

  loadData(): void {
    const pageIndex = this.pageEvent?.pageIndex ?? AdminDefaultValue.pageNumber;
    const pageSize = this.pageEvent?.pageSize ?? AdminDefaultValue.pageSize;

    this.adminService.getFcmTokenMetadataList(pageIndex, pageSize).subscribe(data => {
      this.setContent(data.content!, data.totalSize);
    });
  }

  protected override get paginationConfig(): { pageNumber: number; pageSize: number; pageSizeOptions: number[]; } {
    return {
      pageNumber: AdminDefaultValue.pageNumber,
      pageSize: AdminDefaultValue.pageSize,
      pageSizeOptions: AdminDefaultValue.pageSizeOptions
    };
  }
}
