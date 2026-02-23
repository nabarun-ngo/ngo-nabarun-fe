import { Component } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { ApiKeyDto } from 'src/app/core/api-client/models';
import { SearchEvent } from 'src/app/shared/components/search-and-advanced-search-form/search-event.model';
import { TabComponentInterface } from 'src/app/shared/interfaces/tab-component.interface';
import { AccordionCell, AccordionButton } from 'src/app/shared/model/accordion-list.model';
import { DetailedView } from 'src/app/shared/model/detailed-view.model';
import { Accordion } from 'src/app/shared/utils/accordion';

@Component({
  selector: 'app-admin-cron-trigger-tab',
  templateUrl: './admin-cron-trigger-tab.component.html',
  styleUrls: ['./admin-cron-trigger-tab.component.scss']
})
export class AdminCronTriggerTabComponent extends Accordion<ApiKeyDto> implements TabComponentInterface<ApiKeyDto> {
  override onInitHook(): void {
    throw new Error('Method not implemented.');
  }
  protected override prepareHighLevelView(data: ApiKeyDto, options?: { [key: string]: any; }): AccordionCell[] {
    throw new Error('Method not implemented.');
  }
  protected override prepareDetailedView(data: ApiKeyDto, options?: { [key: string]: any; }): DetailedView[] {
    throw new Error('Method not implemented.');
  }
  protected override prepareDefaultButtons(data: ApiKeyDto, options?: { [key: string]: any; }): AccordionButton[] {
    throw new Error('Method not implemented.');
  }
  protected override onClick(event: { buttonId: string; rowIndex: number; }): void {
    throw new Error('Method not implemented.');
  }
  protected override onAccordionOpen(event: { rowIndex: number; }): void {
    throw new Error('Method not implemented.');
  }
  protected override get paginationConfig(): { pageNumber: number; pageSize: number; pageSizeOptions: number[]; } {
    throw new Error('Method not implemented.');
  }
  override handlePageEvent($event: PageEvent): void {
    throw new Error('Method not implemented.');
  }
  onSearch($event: SearchEvent): void {
    throw new Error('Method not implemented.');
  }
  loadData(): void {
    throw new Error('Method not implemented.');
  }

}
