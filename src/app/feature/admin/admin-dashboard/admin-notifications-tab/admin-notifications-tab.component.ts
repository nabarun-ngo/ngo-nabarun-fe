import { Component } from '@angular/core';
import { Accordion } from 'src/app/shared/utils/accordion';
import { NotificationResponseDto } from 'src/app/core/api-client/models';
import { TabComponentInterface } from 'src/app/shared/interfaces/tab-component.interface';
import { AdminService } from '../../admin.service';
import { AdminDefaultValue } from '../../admin.const';
import { AccordionCell, AccordionButton } from 'src/app/shared/model/accordion-list.model';
import { DetailedView } from 'src/app/shared/model/detailed-view.model';
import { FormGroup, Validators } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { SearchEvent } from 'src/app/shared/components/search-and-advanced-search-form/search-event.model';
import { ModalService } from 'src/app/core/service/modal.service';
import { AppDialog } from 'src/app/core/constant/app-dialog.const';
import { date } from 'src/app/core/service/utilities.service';
import { SearchSelectModalConfig } from 'src/app/shared/components/search-select-modal/search-select-modal.component';
import { KeyValue } from 'src/app/shared/model/key-value.model';
import { SearchSelectModalService } from 'src/app/shared/components/search-select-modal/search-select-modal.service';

@Component({
  selector: 'app-admin-notifications-tab',
  templateUrl: './admin-notifications-tab.component.html',
  styleUrls: ['./admin-notifications-tab.component.scss']
})
export class AdminNotificationsTabComponent extends Accordion<NotificationResponseDto> implements TabComponentInterface<NotificationResponseDto> {

  constructor(
    private adminService: AdminService,
    private modalService: ModalService,
    private searchService: SearchSelectModalService,
  ) {
    super();
  }

  override onInitHook(): void {
    this.setHeaderRow([
      { value: 'Title' },
      { value: 'User' },
      { value: 'Date' }
    ]);
  }

  protected override prepareHighLevelView(data: NotificationResponseDto): AccordionCell[] {
    return [
      {
        type: 'text',
        value: data.title,
        bgColor: 'bg-red-50',
        rounded: true
      },
      {
        type: 'text',
        value: data.user ? `${data.user.firstName} ${data.user.lastName}` : 'N/A'
      },
      {
        type: 'text',
        value: date(data.createdAt!)
      }
    ];
  }

  protected override prepareDetailedView(data: NotificationResponseDto): DetailedView[] {
    return [
      {
        section_name: 'Target User Information',
        section_type: 'key_value',
        section_html_id: 'user_info',
        section_form: new FormGroup({}),
        content: [
          { field_name: 'User Name', field_value: data.user ? `${data.user.firstName} ${data.user.lastName}` : 'N/A' },
          { field_name: 'Email', field_value: data.user?.email || 'N/A' },
          { field_name: 'User ID', field_value: data.user?.id || 'N/A' }
        ]
      },
      {
        section_name: 'Delivery Details',
        section_type: 'key_value',
        section_html_id: 'failure_details',
        section_form: new FormGroup({}),
        content: [
          { field_name: 'Title', field_value: data.title },
          { field_name: 'Notification Body', field_value: data.body },
          { field_name: 'Push Status', field_value: data.isPushSent ? (data.pushDelivered ? 'Delivered' : 'Failed') : 'Not Sent' },
          { field_name: 'Error Message', field_value: data.pushError || 'None' },
          { field_name: 'Category', field_value: data.category },
          { field_name: 'Type', field_value: data.type },
          { field_name: 'Created At', field_value: date(data.createdAt, 'dd/MM/yyyy HH:mm:ss') }
        ]
      }
    ];
  }

  protected override prepareDefaultButtons(data: NotificationResponseDto): AccordionButton[] {
    return [
      {
        button_id: 'RETRY',
        button_name: 'Retry Resend',
        props: { class: 'text-primary-600 font-bold' }
      }
    ];
  }

  protected override onClick(event: { buttonId: string; rowIndex: number; }): void {
    if (event.buttonId === 'RETRY') {
      const log = this.itemList[event.rowIndex];
      const modal = this.modalService.openNotificationModal(AppDialog.warn_confirm_resend, 'confirmation', 'warning');
      modal.onAccept$.subscribe(() => {
        this.adminService.resendPushNotification(log.id).subscribe(() => {
          this.loadData();
        });
      });
    }
  }

  protected override onAccordionOpen(event: { rowIndex: number; }): void {
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

    this.adminService.getUndeliveredNotifications(pageIndex, pageSize).subscribe(data => {
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

  async sendPushNotification() {
    this.adminService.getUsers().subscribe(m => {
      const kv = m.content?.map(m2 => {
        return { key: m2.id, displayValue: `${m2.firstName} ${m2.lastName} (${m2.email})` } as KeyValue
      })
      let modal = this.searchService.open(this.notificationModal(kv!), { width: 700 });
      modal.subscribe(data => {
        if (data) {
          const values = data.value;
          this.adminService.sendTestPushNotification(values.users, values.body, values.title, values.category, values.type).subscribe(res => {
            alert('Notification sent successfully');
          });
        }
      });
    });

  }



  private notificationModal = (kv: KeyValue[]): SearchSelectModalConfig => {
    return {
      buttonText: { search: 'Send', close: 'Close' },
      title: 'Send Notification',
      searchFormFields: [
        {
          formControlName: 'users',
          inputModel: {
            labelName: 'Target Users',
            html_id: 'user_search',
            inputType: 'multiselect',
            tagName: 'select',
            placeholder: 'Select users to send notification',
            selectList: kv
          },
          validations: [Validators.required]
        },
        {
          formControlName: 'title',
          inputModel: {
            labelName: 'Notification Title',
            html_id: 'title',
            inputType: 'text',
            tagName: 'input',
            placeholder: 'Enter notification title',
          },
          validations: [Validators.required]
        },
        {
          formControlName: 'body',
          inputModel: {
            labelName: 'Notification Body',
            html_id: 'body',
            inputType: 'text',
            tagName: 'textarea',
            placeholder: 'Enter notification body',
          },
          validations: [Validators.required]
        },
        {
          formControlName: 'category',
          inputModel: {
            labelName: 'Notification Category',
            html_id: 'category',
            inputType: '',
            tagName: 'select',
            placeholder: 'Select notification category',
            selectList: [
              { key: 'SYSTEM', displayValue: 'System' },
              { key: 'WORKFLOW', displayValue: 'Workflow' },
              { key: 'DONATION', displayValue: 'Donation' },
              { key: 'EXPENSE', displayValue: 'Expense' },
              { key: 'PROJECT', displayValue: 'Project' },
              { key: 'MEETING', displayValue: 'Meeting' },
              { key: 'TASK', displayValue: 'Task' },
              { key: 'DOCUMENT', displayValue: 'Document' },
            ]
          },
          validations: [Validators.required]
        },
        {
          formControlName: 'type',
          inputModel: {
            labelName: 'Notification Type',
            html_id: 'type',
            inputType: '',
            tagName: 'select',
            placeholder: 'Select notification type',
            selectList: [
              { key: 'INFO', displayValue: 'Info' },
              { key: 'SUCCESS', displayValue: 'Success' },
              { key: 'WARNING', displayValue: 'Warning' },
              { key: 'ERROR', displayValue: 'Error' },
              { key: 'TASK', displayValue: 'Task' },
              { key: 'APPROVAL', displayValue: 'Approval' },
              { key: 'REMINDER', displayValue: 'Reminder' },
              { key: 'ANNOUNCEMENT', displayValue: 'Announcement' },
            ]
          },
          validations: [Validators.required]
        }
      ]
    }
  };
}
