import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { ApiKeyDto, CronExecutionDto, CronJobDto, PagedResultCronExecutionDto } from 'src/app/core/api-client/models';
import { SearchEvent } from 'src/app/shared/components/search-and-advanced-search-form/search-event.model';
import { TabComponentInterface } from 'src/app/shared/interfaces/tab-component.interface';
import { AccordionCell, AccordionButton } from 'src/app/shared/model/accordion-list.model';
import { DetailedView } from 'src/app/shared/model/detailed-view.model';
import { Accordion } from 'src/app/shared/utils/accordion';
import { AdminDefaultValue } from '../../admin.const';
import { AdminService } from '../../admin.service';
import { SearchSelectModalService } from 'src/app/shared/components/search-select-modal/search-select-modal.service';
import { KeyValue } from 'src/app/shared/model/key-value.model';
import { SearchSelectModalConfig } from 'src/app/shared/components/search-select-modal/search-select-modal.component';
import { firstValueFrom } from 'rxjs';
import { date } from 'src/app/core/service/utilities.service';

@Component({
  selector: 'app-admin-cron-job-tab',
  templateUrl: './admin-cron-job-tab.component.html',
  styleUrls: ['./admin-cron-job-tab.component.scss']
})
export class AdminCronJobTabComponent extends Accordion<CronExecutionDto> implements TabComponentInterface {
  jobList: CronJobDto[] = [];
  detailedView: DetailedView<CronJobDto>[] = [];

  constructor(private adminService: AdminService,
    private searchSelectorService: SearchSelectModalService
  ) {
    super();
  }

  override onInitHook(): void {
    this.setHeaderRow([{ value: 'ID' }, { value: 'Name' }, { value: 'State' }, { value: 'Date' }])
  }

  protected override prepareHighLevelView(data: CronExecutionDto, options?: { [key: string]: any; }): AccordionCell[] {
    return [
      { value: data.id, type: 'text' },
      { value: data.jobName, type: 'text' },
      { value: data.status as any, type: 'text' },
      { value: data.executedAt, type: 'date' }
    ]
  }
  protected override prepareDetailedView(data: CronExecutionDto, options?: { [key: string]: any; }): DetailedView[] {
    return [
      {
        section_type: 'key_value',
        section_name: 'Job Information',
        section_form: new FormGroup({}),
        section_html_id: 'cron-job-info',
        content: [
          { field_name: 'Job ID', field_value: data.id },
          { field_name: 'Job Name', field_value: data.jobName },
          { field_name: 'Status', field_value: data.status as any },
          { field_name: 'Executed At', field_value: date(data.executedAt, 'dd-MM-yyyy HH:mm:ss') },
          { field_name: 'Error', field_value: data.error },
          { field_name: 'Result', field_value: JSON.stringify(data.result) },
          { field_name: 'Execution Logs', field_value: data.executionLogs.join('\n') },
        ],
      },
    ]
  }
  protected override prepareDefaultButtons(data: CronExecutionDto, options?: { [key: string]: any; }): AccordionButton[] {
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
    this.adminService.getCronJobExecutions(this.selectedJob.name, $event.pageIndex, $event.pageSize).subscribe(d => {
      this.setContent(d.content, d.totalSize!)
    })
  }


  onSearch($event: SearchEvent): void {
  }

  protected selectedJob!: CronJobDto;
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
        }
      ]
    } as SearchSelectModalConfig
  }
  async loadData(): Promise<void> {
    this.jobList = await firstValueFrom(this.adminService.getCronJobNames())
    if (!this.selectedJob) {
      this.changeJobName();
    }
    else {
      this.adminService.getCronJobExecutions(this.selectedJob.name).subscribe(d => {
        this.setContent(d.content, d.totalSize!)
      })
    }
  }

  changeJobName() {
    const kv = this.jobList.map(m => {
      return {
        key: m.name,
        displayValue: m.name
      } as KeyValue
    })
    this.searchSelectorService.open(this.jobNameConfig(kv), { width: 700 }).subscribe({
      next: (resp) => {
        this.selectedJob = this.jobList.find(m => m.name === resp.value.jobName)!;
        this.detailedView = [this.jobSection(this.selectedJob)]
        this.loadData();
      }
    });
  }

  triggerJob() {
    this.adminService.triggerCronJob(this.selectedJob.name).subscribe(d => {
      this.loadData();
    })
  }

  loadSchedulerLogs() {
    this.adminService.getCronTriggers().subscribe(d => {
      const logText = d.map(m => {
        return `${date(m.triggerAt, 'dd-MM-yyyy HH:mm:ss')} | triggerId=${m.triggerId} | executed=${m.executedJobs.length} | skipped=${m.skippedJobs.length} | executedJobs=${m.executedJobs.join(", ")}`;
      }).join('\n');
      const blob = new Blob([logText], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => window.URL.revokeObjectURL(url), 2000);
    })
  }

  private jobSection = (
    m: CronJobDto,
  ): DetailedView => {
    return {
      section_name: 'Job Detail',
      section_type: 'key_value',
      section_html_id: 'job_detail',
      section_form: new FormGroup({}),
      show_form: false,
      content: [
        {
          field_name: 'Job Name',
          field_html_id: 'job_name',
          field_value: m?.name || '',
        },
        {
          field_name: 'Job Description',
          field_html_id: 'job_description',
          field_value: m?.description || '',
        },
        {
          field_name: 'Enabled',
          field_html_id: 'job_enabled',
          field_value: m?.enabled ? 'Yes' : 'No',
        },
        {
          field_name: 'Job Next Run',
          field_html_id: 'job_next_run',
          field_value: date(m?.nextRun, 'dd-MM-yyyy HH:mm:ss') || '',
        }
      ]
    }
  }

}
