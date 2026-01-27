import { Component } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { SearchEvent } from 'src/app/shared/components/search-and-advanced-search-form/search-event.model';
import { TabComponentInterface } from 'src/app/shared/interfaces/tab-component.interface';
import { AccordionCell, AccordionButton } from 'src/app/shared/model/accordion-list.model';
import { DetailedView } from 'src/app/shared/model/detailed-view.model';
import { KeyValue } from 'src/app/shared/model/key-value.model';
import { Accordion } from 'src/app/shared/utils/accordion';
import { ReportService } from '../../services/report.service';
import { KeyValueDto } from 'src/app/core/api-client/models';

@Component({
  selector: 'app-fin-report-accordion',
  templateUrl: './fin-report-accordion.component.html',
  styleUrls: ['./fin-report-accordion.component.scss']
})
export class FinReportAccordionComponent extends Accordion<KeyValueDto> implements TabComponentInterface<KeyValue> {

  constructor(private reportService: ReportService) {
    super()
  }

  override onInitHook(): void {
    console.log(this.getAccordionList())
  }
  protected override prepareHighLevelView(data: KeyValue, options?: { [key: string]: any; }): AccordionCell[] {
    console.log(data)
    return [
      {
        value: data.displayValue,
        type: 'text',
        rounded: true
      }
    ];
  }
  protected override prepareDetailedView(data: KeyValue, options?: { [key: string]: any; }): DetailedView[] {
    return [];
  }
  protected override prepareDefaultButtons(data: KeyValue, options?: { [key: string]: any; }): AccordionButton[] {
    return [];
  }
  protected override onClick(event: { buttonId: string; rowIndex: number; }): void {
  }
  protected override onAccordionOpen(event: { rowIndex: number; }): void {
  }
  protected override get paginationConfig(): { pageNumber: number; pageSize: number; pageSizeOptions: number[]; } {
    return {
      pageNumber: 0,
      pageSize: 50,
      pageSizeOptions: [50, 100, 200, 500]
    }
  }
  override handlePageEvent($event: PageEvent): void { }

  onSearch($event: SearchEvent): void { }
  loadData(): void { }

}
