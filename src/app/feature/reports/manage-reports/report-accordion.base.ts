import { Component, Directive, inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { AccordionCell } from 'src/app/shared/model/accordion-list.model';
import { DetailedView } from 'src/app/shared/model/detailed-view.model';
import { Accordion } from 'src/app/shared/utils/accordion';
import { ReportDetailDto } from 'src/app/core/api-client/models/report-detail-dto';
import { TabComponentInterface } from 'src/app/shared/interfaces/tab-component.interface';
import { PagedResultReportDetailDto } from 'src/app/core/api-client/models/paged-result-report-detail-dto';
import { SearchEvent } from 'src/app/shared/components/search-and-advanced-search-form/search-event.model';
import { ReportDefaultValue } from '../report.const';
import { date } from 'src/app/core/service/utilities.service';
import { ActivatedRoute } from '@angular/router';
import { ReportService } from '../report.service';
import { Doc, mapDocDtoToDoc } from 'src/app/shared/model/document.model';
import { takeUntil } from 'rxjs';
import { reportDocumentSection } from '../report.field';
import { getCommentSection } from 'src/app/shared/utils/common-fields';
import { getReportInputDetailSection } from './reports.field';

@Component({
  template: ''
})
export abstract class ReportAccordionBaseComponent extends Accordion<ReportDetailDto> implements TabComponentInterface<PagedResultReportDetailDto> {
  protected reportCode!: string;
  private activatedRoute = inject(ActivatedRoute);
  protected reportService = inject(ReportService);

  protected override get paginationConfig(): { pageNumber: number; pageSize: number; pageSizeOptions: number[] } {
    return {
      pageNumber: ReportDefaultValue.pageNumber,
      pageSize: ReportDefaultValue.pageSize,
      pageSizeOptions: ReportDefaultValue.pageSizeOptions,
    };
  }

  override onInitHook(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['reportCode']) {
        this.reportCode = params['reportCode'];
      }
    });

    this.setHeaderRow([
      { value: 'Report Id', type: 'text' },
      { value: 'Report Name', type: 'text' },
      { value: 'Version', type: 'text' },
      { value: 'Created At', type: 'text' },
    ]);


  }

  onSearch(_event: SearchEvent): void {
    // Search is intentionally omitted for this first version.
  }

  protected override prepareHighLevelView(data: ReportDetailDto): AccordionCell[] {
    console.log(data);
    return [
      { value: data.id || '-', type: 'text' },
      { value: data.reportName || '-', type: 'text' },
      { value: `V${data.version ?? 1}`, type: 'text' },
      { value: data.createdAt ? date(data.createdAt, 'dd-MM-yyyy HH:mm:ss') : '-', type: 'text' },
    ];
  }

  protected override prepareDetailedView(data: ReportDetailDto): DetailedView[] {
    return [
      {
        section_type: 'key_value',
        section_name: 'Report Details',
        section_html_id: 'report_details',
        section_form: new FormGroup({}),
        content: [
          { field_name: 'Report ID', field_value: data.id },
          { field_name: 'Report Name', field_value: data.reportName },
          { field_name: 'Report Type', field_value: data.reportCode },
          { field_name: 'Status', field_value: data.status },
          { field_name: 'Version', field_value: `${data.version}` },
          { field_name: 'Workflow Id', field_value: data.workflowId, hide_field: !data.workflowId },
          { field_name: 'Approved By', field_value: data.approvedByName ?? '-', hide_field: !data.approvedByName },
          { field_name: 'Approved At', field_value: data.approvedAt ? date(data.approvedAt, 'dd-MM-YYYY HH:mm:ss') : '-', hide_field: !data.approvedAt },
          { field_name: 'Created At', field_value: data.createdAt ? date(data.createdAt, 'dd-MM-YYYY HH:mm:ss') : '-' },
          { field_name: 'Updated At', field_value: data.updatedAt ? date(data.updatedAt, 'dd-MM-YYYY HH:mm:ss') : '-' },
        ],
      }
    ];
  }

  protected override onAccordionOpen(event: { rowIndex: number }): void {
    const data = this.itemList[event.rowIndex];
    this.reportService.getReport(data.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(docs => {
        this.reportService.getReportInputs(this.reportCode).subscribe((inputs) => {
          this.addSectionInAccordion(getReportInputDetailSection(data!, inputs, false), event.rowIndex);
          const docList = docs ? docs.map(m => mapDocDtoToDoc(m)) : [];
          this.addSectionInAccordion(reportDocumentSection(docList), event.rowIndex);
          this.addSectionInAccordion(getCommentSection(data.id, 'REPORT', false), event.rowIndex);
          setTimeout(() => {
            this.triggerCommentFetch(event.rowIndex);
          }, 250);
        });

      });
  }

  override handlePageEvent($event: PageEvent): void {
    this.loadPage($event.pageIndex, $event.pageSize);
  }

  abstract loadData(): void;
  protected abstract loadPage(index: number, size: number): void;

  protected formatParameters(parameters?: { [key: string]: any }): string {
    if (!parameters || Object.keys(parameters).length === 0) {
      return '-';
    }
    return JSON.stringify(parameters);
  }
}
