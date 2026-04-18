import { Component } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { SearchEvent } from 'src/app/shared/components/search-and-advanced-search-form/search-event.model';
import { TabComponentInterface } from 'src/app/shared/interfaces/tab-component.interface';
import { AccordionCell, AccordionButton } from 'src/app/shared/model/accordion-list.model';
import { DetailedView } from 'src/app/shared/model/detailed-view.model';
import { Accordion } from 'src/app/shared/utils/accordion';
import { AdminDefaultValue } from '../../admin.const';
import { AdminService } from '../../admin.service';
import { date } from 'src/app/core/service/utilities.service';
import { CronJobDto, SchedulerLogDto } from 'src/app/core/api-client/models';
import { SearchSelectModalConfig } from 'src/app/shared/components/search-select-modal/search-select-modal.component';
import { KeyValue } from 'src/app/shared/model/key-value.model';
import { firstValueFrom } from 'rxjs';
import { SearchSelectModalService } from 'src/app/shared/components/search-select-modal/search-select-modal.service';

@Component({
  selector: 'app-admin-cron-trigger-tab',
  templateUrl: './admin-cron-trigger-tab.component.html',
  styleUrls: ['./admin-cron-trigger-tab.component.scss']
})
export class AdminCronTriggerTabComponent extends Accordion<SchedulerLogDto> implements TabComponentInterface {
  jobList: CronJobDto[] = [];

  constructor(private adminService: AdminService,
    private searchSelectorService: SearchSelectModalService,
  ) {
    super();
  }

  override async onInitHook(): Promise<void> {
    this.setHeaderRow([{ value: 'Trigger ID' }, { value: 'Trigger Time' }])
    this.jobList = await firstValueFrom(this.adminService.getCronJobNames())
  }

  protected override prepareHighLevelView(data: SchedulerLogDto, options?: { [key: string]: any; }): AccordionCell[] {
    return [
      { value: data.triggerId!, type: 'text' },
      { value: date(data.triggerAt, 'dd-MM-yyyy HH:mm:ss'), type: 'text' }
    ]
  }
  protected override prepareDetailedView(data: SchedulerLogDto, options?: { [key: string]: any; }): DetailedView[] {
    return [
      {
        section_type: 'key_value',
        section_name: 'Trigger Information',
        section_form: new FormGroup({}),
        section_html_id: 'cron-trigger-info',
        content: [
          { field_name: 'Trigger ID', field_value: data.triggerId },
          { field_name: 'Trigger Time', field_value: date(data.triggerAt, 'dd-MM-yyyy HH:mm:ss') },
        ],
      },
      {
        section_type: 'editable_list',
        section_name: 'Executed Jobs',
        section_form: new FormGroup({
          jobs: new FormArray(data.executedJobs.map(m => {
            return new FormGroup({
              id: new FormControl(m.id),
              jobName: new FormControl(m.jobName),
            })
          })),
        }),
        section_html_id: 'cron-trigger-info',
        editableList: {
          formArrayName: 'jobs',
          itemFields: [
            {
              field_html_id: 'id',
              field_value: '',
              form_control_name: 'id',
              editable: false,
            },
            {
              field_html_id: 'jobName',
              field_value: '',
              form_control_name: 'jobName',
              editable: false,
            },
          ],
          allowAddRow: false,
          allowDeleteRow: false,
        }
      },
      {
        section_type: 'editable_list',
        section_name: 'Skipped Jobs',
        section_form: new FormGroup({
          skippedJobs: new FormArray(data.skippedJobs.map(m => {
            return new FormGroup({
              jobName: new FormControl(m.jobName),
              remarks: new FormControl(m.remarks),
            })
          })),
        }),
        section_html_id: 'cron-trigger-info',
        editableList: {
          formArrayName: 'skippedJobs',
          itemFields: [
            {
              field_html_id: 'jobName',
              field_value: '',
              form_control_name: 'jobName',
              editable: false,
            },
            {
              field_html_id: 'remarks',
              field_value: '',
              form_control_name: 'remarks',
              editable: false,
            },
          ],
          allowAddRow: false,
          allowDeleteRow: false,
        }
      }
    ]
  }
  protected override prepareDefaultButtons(data: SchedulerLogDto, options?: { [key: string]: any; }): AccordionButton[] {
    return [];
  }
  protected override onClick(event: { buttonId: string; rowIndex: number; }): void {

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
  override async handlePageEvent($event: PageEvent): Promise<void> {
    this.pageEvent = $event;
    this.adminService.getCronTriggers($event.pageIndex, $event.pageSize).subscribe(d => {
      this.setContent(d.content, d.totalSize!)
    })
  }


  onSearch($event: SearchEvent): void {
  }


  async loadData(): Promise<void> {
    this.adminService.getCronTriggers().subscribe(d => {
      this.setContent(d.content, d.totalSize!)
    })
  }

  async runJob(): Promise<void> {
    const kv = this.jobList.map(m => {
      return {
        key: m.name,
        displayValue: m.name
      } as KeyValue
    })
    this.searchSelectorService.open(this.jobNameConfig(kv), { width: 700 }).subscribe({
      next: (resp) => {
        this.adminService.triggerCronJob(resp.value.jobName, resp.value.inputData).subscribe({
          next: () => {
            this.loadData();
          }
        })
      }
    });
  }

  protected jobNameConfig = (kv: KeyValue[]) => {
    return {
      title: 'Select Job',
      searchFormFields: [
        {
          formControlName: 'jobName',
          inputModel: {
            html_id: 'jobName',
            inputType: '',
            tagName: 'select',
            placeholder: 'Select Job Name',
            selectList: kv
          }
        },
        {
          formControlName: 'inputData',

          inputModel: {
            html_id: 'inputData',
            inputType: '',
            tagName: 'textarea',
            placeholder: 'Enter Input Data',
          }
        }
      ]
    } as SearchSelectModalConfig
  }
}
