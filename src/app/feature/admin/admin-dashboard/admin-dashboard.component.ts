import { Component, ViewChild } from '@angular/core';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { AdminConstant, AdminDefaultValue, adminTabs } from '../admin.const';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { ActivatedRoute } from '@angular/router';
import { NavigationButtonModel } from 'src/app/shared/components/generic/page-navigation-buttons/page-navigation-buttons.component';
import { StandardTabbedDashboard } from 'src/app/shared/utils/standard-tabbed-dashboard';
import { TabComponentInterface } from 'src/app/shared/interfaces/tab-component.interface';
import { AdminApikeyTabComponent } from './admin-apikey-tab/admin-apikey-tab.component';
import { AdminOauthTabComponent } from './admin-oauth-tab/admin-oauth-tab.component';
import { AdminBgJobsTabComponent } from './admin-bg-jobs-tab/admin-bg-jobs-tab.component';
import { AdminService } from '../admin.service';
import { KeyValueDto } from 'src/app/core/api-client/models';
import { AdminTasksTabComponent } from './admin-tasks-tab/admin-tasks-tab.component';
import { AdminCronJobTabComponent } from './admin-cron-job-tab/admin-cron-job-tab.component';
import { SearchSelectModalConfig } from 'src/app/shared/components/search-select-modal/search-select-modal.component';
import { KeyValue } from 'src/app/shared/model/key-value.model';
import { Validators } from '@angular/forms';
import { SearchSelectModalService } from 'src/app/shared/components/search-select-modal/search-select-modal.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent extends StandardTabbedDashboard<adminTabs, any> {

  /**
     * Declariring variables
     */
  @ViewChild(AdminApikeyTabComponent) apiKeyTab!: AdminApikeyTabComponent;
  @ViewChild(AdminOauthTabComponent) oauthTab!: AdminOauthTabComponent;
  @ViewChild(AdminBgJobsTabComponent) jobTab!: AdminBgJobsTabComponent;
  @ViewChild(AdminTasksTabComponent) taskTab!: AdminTasksTabComponent;
  @ViewChild(AdminCronJobTabComponent) cronJobTab!: AdminCronJobTabComponent;

  defaultValue = AdminDefaultValue;
  constant = AdminConstant;
  protected tabMapping: adminTabs[] = ['api_keys', 'oauth', 'tasks', 'bg_jobs', 'cron_jobs'];
  navigations: NavigationButtonModel[] = [
    {
      displayName: 'Back to Dashboard',
      routerLink: AppRoute.secured_dashboard_page.url
    }
  ];
  appLinks: KeyValueDto[] = [];

  constructor(
    private sharedDataService: SharedDataService,
    public override route: ActivatedRoute,
    private adminService: AdminService,
    private searchService: SearchSelectModalService,

  ) {
    super(route);
  }

  protected override get tabComponents(): { [tab in adminTabs]: TabComponentInterface } {
    return {
      api_keys: this.apiKeyTab,
      oauth: this.oauthTab,
      bg_jobs: this.jobTab,
      tasks: this.taskTab,
      cron_jobs: this.cronJobTab,
    };
  }
  protected override get defaultTab(): adminTabs {
    return this.defaultValue.tabName as adminTabs;
  }

  protected override onInitHook(): void {
    this.sharedDataService.setPageName(this.defaultValue.pageTitle);
    this.adminService.getAppLinks().subscribe(m => {
      this.appLinks = m;
    });
  }

  protected override onTabChangedHook(): void {
  }

  protected override onAfterViewInitHook(): void {
    this.getActiveComponent(this.getCurrentTab())?.loadData();
  }

  async sendPushNotification() {
    this.adminService.getUsers().subscribe(m => {
      const kv = m.content?.map(m2 => {
        return { key: m2.userId, displayValue: `${m2.user.firstName} ${m2.user.lastName} (${m2.user.email})` } as KeyValue
      })
      let modal = this.searchService.open(this.notificationModal(kv!), { width: 700 });
      modal.subscribe(data => {
        if (data) {
          const values = data.value;
          this.adminService.sendTestPushNotification(values.users, values.body, values.title, values.category, values.type).subscribe(res => {
            ////console.log('Notification sent', res);
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
