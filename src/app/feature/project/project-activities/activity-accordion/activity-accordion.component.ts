import { Component, Input, AfterContentInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { AccordionCell, AccordionButton } from 'src/app/shared/model/accordion-list.model';
import { DetailedView } from 'src/app/shared/model/detailed-view.model';
import { Accordion } from 'src/app/shared/utils/accordion';
import { ProjectActivity, PagedActivity } from '../../model/activity.model';
import { ActivityDefaultValue, ActivityConstant } from '../../project.const';
import { activityHeader, getActivitySection } from '../../fields/activity.field';
import { ProjectService } from '../../service/project.service';
import { compareObjects, date, removeNullFields } from 'src/app/core/service/utilities.service';
import { SearchEvent } from 'src/app/shared/components/search-and-advanced-search-form/search-event.model';
import { TabComponentInterface } from 'src/app/shared/interfaces/tab-component.interface';
import { Project } from '../../model/project.model';
import { Router } from '@angular/router';
import { AppRoute } from 'src/app/core/constant/app-routing.const';

@Component({
  selector: 'app-activity-accordion',
  templateUrl: './activity-accordion.component.html',
  styleUrls: ['./activity-accordion.component.scss']
})
export class ActivityAccordionComponent extends Accordion<ProjectActivity> implements TabComponentInterface<PagedActivity>, AfterContentInit {

  protected override get paginationConfig(): { pageNumber: number; pageSize: number; pageSizeOptions: number[]; } {
    return {
      pageNumber: ActivityDefaultValue.pageNumber,
      pageSize: ActivityDefaultValue.pageSize,
      pageSizeOptions: ActivityDefaultValue.pageSizeOptions
    };
  }

  @Input({ required: true })
  project!: Project;


  defaultValue = ActivityDefaultValue;
  protected override activeButtonId: string = '';
  protected allowActivityCreate: boolean = false;

  constructor(
    protected projectService: ProjectService,
    private router: Router
  ) {
    super();
  }

  override onInitHook(): void {
    this.setHeaderRow(activityHeader);
    this.allowActivityCreate = this.project?.status === 'ACTIVE' || false;
  }

  protected override prepareHighLevelView(
    data: ProjectActivity,
    options?: { [key: string]: any }
  ): AccordionCell[] {
    return [
      {
        type: 'text',
        value: data?.name,
      },
      {
        type: 'text',
        value: data?.type,
        showDisplayValue: true,
        refDataSection: ActivityConstant.refDataKey.types
      },
      {
        type: 'text',
        value: data?.status,
        showDisplayValue: true,
        refDataSection: ActivityConstant.refDataKey.statuses
      },
      {
        type: 'text',
        value: date(data?.startDate),
      }
    ];
  }

  protected override prepareDetailedView(
    data: ProjectActivity,
    options?: { [key: string]: any }
  ): DetailedView[] {
    return [
      getActivitySection(data, this.getRefData() || {}, options && options['create']),
    ];
  }

  protected override prepareDefaultButtons(
    data: ProjectActivity,
    options?: { [key: string]: any }
  ): AccordionButton[] {
    const isCreate = options && options['create'];
    if (isCreate) {
      return [
        {
          button_id: 'CANCEL_CREATE',
          button_name: 'Cancel'
        },
        {
          button_id: 'CONFIRM_CREATE',
          button_name: 'Confirm'
        }
      ];
    }
    return [
      // {
      //   button_id: 'VIEW_DONATIONS',
      //   button_name: 'View Donations'
      // },
      {
        button_id: 'VIEW_EXPENSES',
        button_name: 'Add/View Expenses'
      },
      {
        button_id: 'UPDATE_ACTIVITY',
        button_name: 'Update Activity'
      }
    ];
  }

  protected override onClick(event: { buttonId: string; rowIndex: number; }): void {
    if (event.buttonId === 'UPDATE_ACTIVITY') {
      this.showEditForm(event.rowIndex, ['activity_detail']);
      this.activeButtonId = event.buttonId;
    } else if (event.buttonId === 'VIEW_DONATIONS') {
      const activity = this.itemList[event.rowIndex];
      this.router.navigate([AppRoute.secured_donation_dashboard_page.url], {
        queryParams: { tab: 'guest_donation', forEventId: activity.id, projectId: this.project.id },
        state: { project: this.project, activity: activity }
      });
    } else if (event.buttonId === 'VIEW_EXPENSES') {
      const activity = this.itemList[event.rowIndex];
      this.router.navigate([AppRoute.secured_manage_account_page.url], {
        queryParams: { tab: 'my_expenses', activityId: activity.id, projectId: this.project.id },
        state: { project: this.project, activity: activity }
      });
    } else if (event.buttonId === 'CANCEL') {
      this.hideForm(event.rowIndex);
    } else if (event.buttonId === 'CONFIRM') {
      if (this.activeButtonId === 'UPDATE_ACTIVITY') {
        this.performUpdateActivity(event.rowIndex);
      }
    } else if (event.buttonId === 'CANCEL_CREATE') {
      this.hideForm(0, true);
    } else if (event.buttonId === 'CONFIRM_CREATE') {
      this.performCreateActivity();
    }
  }

  protected override onAccordionOpen(event: { rowIndex: number; }): void {
    // Load additional data when accordion opens if needed
  }

  override handlePageEvent($event: PageEvent): void {
    this.pageEvent = $event;
    this.fetchActivities(this.pageNumber, this.pageSize);
  }

  onSearch($event: SearchEvent): void {
    if ($event.advancedSearch && !$event.reset) {
      this.fetchActivities(undefined, undefined, removeNullFields($event.value));
    } else if ($event.advancedSearch && $event.reset) {
      this.fetchActivities(ActivityDefaultValue.pageNumber, ActivityDefaultValue.pageSize);
    } else if ($event.buttonName == 'ADVANCED_SEARCH') {
      this.getAccordionList().searchValue = '';
    }
  }

  loadData(): void {
    this.fetchActivities(
      ActivityDefaultValue.pageNumber,
      ActivityDefaultValue.pageSize
    );
  }

  private fetchActivities(pageNumber?: number, pageSize?: number, filter?: any): void {
    this.projectService.fetchProjectActivities(
      this.project.id,
      pageNumber,
      pageSize
    ).subscribe((data) => {
      this.setContent(
        data.content!,
        data.totalSize
      );
    });
  }

  initCreateActivityForm(): void {
    this.showCreateForm();
  }

  private performCreateActivity(): void {
    const activityForm = this.getSectionForm('activity_detail', 0, true);
    activityForm?.markAllAsTouched();
    if (activityForm?.valid) {
      const activityData = {
        ...activityForm.value,
        projectId: this.project.id,
        tags: activityForm.value.tags || [],
        scale: 'ACTIVITY'
      };
      this.projectService.createActivity(this.project.id, removeNullFields(activityData)).subscribe((data) => {
        this.hideForm(0, true);
        this.addContentRow(data, true);
      });
    }
  }

  private performUpdateActivity(rowIndex: number): void {
    const activity = this.itemList[rowIndex];
    const activityForm = this.getSectionForm('activity_detail', rowIndex);
    activityForm?.markAllAsTouched();
    if (activityForm?.valid) {
      const updatedActivity = compareObjects(activityForm.value, activity);
      this.projectService.updateActivity(activity.id, updatedActivity).subscribe((data) => {
        this.hideForm(rowIndex);
        this.updateContentRow(data, rowIndex);
      });
    }
  }
}
