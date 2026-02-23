import { Component } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { JobDetail } from 'src/app/core/api-client/models';
import { SearchEvent } from 'src/app/shared/components/search-and-advanced-search-form/search-event.model';
import { TabComponentInterface } from 'src/app/shared/interfaces/tab-component.interface';
import { AccordionCell, AccordionButton } from 'src/app/shared/model/accordion-list.model';
import { DetailedView } from 'src/app/shared/model/detailed-view.model';
import { Accordion } from 'src/app/shared/utils/accordion';
import { AdminService } from '../../admin.service';
import { FormGroup } from '@angular/forms';
import { date } from 'src/app/core/service/utilities.service';
import { AdminDefaultValue } from '../../admin.const';

function duration(start?: string, end?: string): string {
  if (!start || !end) return '-';

  const diff = new Date(end).getTime() - new Date(start).getTime();
  if (diff <= 0) return '-';

  const seconds = Math.floor(diff / 1000);
  const mins = Math.floor(seconds / 60);
  const rem = seconds % 60;

  return `${mins}m ${rem}s`;
}

function pretty(v: any): string {
  if (v === null || v === undefined) return '-';
  return JSON.stringify(v, null, 2);
}

@Component({
  selector: 'app-admin-bg-jobs-tab',
  templateUrl: './admin-bg-jobs-tab.component.html',
  styleUrls: ['./admin-bg-jobs-tab.component.scss']
})
export class AdminBgJobsTabComponent extends Accordion<JobDetail> implements TabComponentInterface<string> {


  constructor(private readonly adminService: AdminService) {
    super();
  }
  override onInitHook(): void {
    this.setHeaderRow([{ value: 'ID' }, { value: 'Name' }, { value: 'State' }, { value: 'Date' }])
  }
  protected override prepareHighLevelView(data: JobDetail, options?: { [key: string]: any; }): AccordionCell[] {
    return [
      { value: data.id!, type: 'text' },
      { value: data.name!, type: 'text' },
      { value: data.state as any, type: 'text' },
      { value: date(data.timestamp), type: 'text' },
    ]
  }
  protected override prepareDetailedView(data: JobDetail, options?: { [key: string]: any; }): DetailedView[] {
    return [
      {
        section_type: 'key_value',
        section_name: 'Job Information',
        section_form: new FormGroup({}),
        section_html_id: 'bg-job-info',
        content: [
          { field_name: 'Job ID', field_value: data.id },
          { field_name: 'Job Name', field_value: data.name },
          { field_name: 'State', field_value: data.state as any },
        ],
      },

      // ---------------- 2. FAILURES ----------------
      {
        section_type: 'key_value',
        section_name: 'Failures & Retries',
        section_form: new FormGroup({}),
        section_html_id: 'bg-job-failure',
        hide_section: !data.failedReason,
        content: [
          { field_name: 'Attempts Made', field_value: `${data.attemptsMade}` },
          { field_name: 'Failure Reason', field_value: data.failedReason || '-' },
        ],
      },

      // ---------------- 3. EXECUTION ----------------
      {
        section_type: 'key_value',
        section_name: 'Execution Lifecycle',
        section_form: new FormGroup({}),
        section_html_id: 'bg-job-lifecycle',
        content: [
          { field_name: 'Processing Started', field_value: date(data.processedOn, 'dd-MM-YYYY HH:mm:ss') },
          { field_name: 'Finished At', field_value: date(data.finishedOn, 'dd-MM-YYYY HH:mm:ss') },
          { field_name: 'Execution Time', field_value: duration(data.processedOn, data.finishedOn) },
          { field_name: 'Progress', field_value: `${data.progress ?? 0}%` },
        ],
      },

      // ---------------- 4. QUEUE ----------------
      {
        section_type: 'key_value',
        section_name: 'Queue & Scheduling',
        section_form: new FormGroup({}),
        section_html_id: 'bg-job-queue',
        content: [
          { field_name: 'Queued At', field_value: date(data.timestamp, 'dd-MM-YYYY HH:mm:ss') },
          { field_name: 'Delay', field_value: `${data.delay ?? 0} ms` },
          { field_name: 'Job Options', field_value: pretty(data.opts) },
        ],
      },

      // ---------------- 5. PAYLOAD ----------------
      {
        section_type: 'key_value',
        section_name: 'Payload & Result',
        section_form: new FormGroup({}),
        section_html_id: 'bg-job-payload',
        content: [
          { field_name: 'Payload Data', field_value: pretty(data.data) },
          { field_name: 'Return Value', field_value: pretty(data.returnvalue) },
        ],
      }
    ]
  }
  protected override prepareDefaultButtons(data: JobDetail, options?: { [key: string]: any; }): AccordionButton[] {
    return data.failedReason ? [
      {
        button_id: 'retry',
        button_name: 'Retry',
      },
    ] : [];
  }
  protected override onClick(event: { buttonId: string; rowIndex: number; }): void {
    if (event.buttonId == 'retry') {
      this.adminService.retryJob(this.itemList[event.rowIndex].id!).subscribe({
        next: () => {
          this.loadData();
        }
      });
    }
  }
  protected override onAccordionOpen(event: { rowIndex: number; }): void {
  }
  protected override get paginationConfig(): { pageNumber: number; pageSize: number; pageSizeOptions: number[]; } {
    return {
      pageNumber: AdminDefaultValue.pageNumber,
      pageSize: AdminDefaultValue.pageSize,
      pageSizeOptions: AdminDefaultValue.pageSizeOptions,
    };
  }
  override handlePageEvent($event: PageEvent): void {
    this.pageEvent = $event;
    this.adminService.getBgJobs($event.pageIndex, $event.pageSize).subscribe((response) => {
      this.setContent(response.content, response.totalSize);
    });;
  }
  onSearch($event: SearchEvent): void {
  }
  loadData(): void {
    this.adminService.getBgJobs().subscribe((response) => {
      this.setContent(response.content, response.totalSize);
    });
  }




}
