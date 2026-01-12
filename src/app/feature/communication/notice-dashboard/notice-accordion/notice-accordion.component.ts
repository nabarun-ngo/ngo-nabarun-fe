import { Component, Input, AfterContentInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { AccordionCell, AccordionButton } from 'src/app/shared/model/accordion-list.model';
import { DetailedView } from 'src/app/shared/model/detailed-view.model';
import { Accordion } from 'src/app/shared/utils/accordion';
import { Notice, PagedNotice } from '../../model/notice.model';
import { NoticeDefaultValue, NoticeConstant } from '../../communication.const';
import { noticeHeader, getNoticeSection } from '../../fields/notice.field';
import { CommunicationService } from '../../service/communication.service';
import { removeNullFields } from 'src/app/core/service/utilities.service';
import { SearchEvent } from 'src/app/shared/components/search-and-advanced-search-form/search-event.model';

@Component({
  selector: 'app-notice-accordion',
  templateUrl: './notice-accordion.component.html',
  styleUrls: ['./notice-accordion.component.scss']
})
export class NoticeAccordionComponent extends Accordion<Notice> implements AfterContentInit {

  protected override get paginationConfig(): { pageNumber: number; pageSize: number; pageSizeOptions: number[]; } {
    return {
      pageNumber: NoticeDefaultValue.pageNumber,
      pageSize: NoticeDefaultValue.pageSize,
      pageSizeOptions: NoticeDefaultValue.pageSizeOptions
    };
  }

  defaultValue = NoticeDefaultValue;
  protected override activeButtonId: string = '';

  constructor(
    protected communicationService: CommunicationService
  ) {
    super();
  }

  override onInitHook(): void {
    this.setHeaderRow(noticeHeader);
  }


  protected override prepareHighLevelView(
    data: Notice,
    options?: { [key: string]: any }
  ): AccordionCell[] {
    return [
      {
        type: 'text',
        value: data?.title,
      },
      {
        type: 'date',
        value: data?.noticeDate,
      },
      {
        type: 'text',
        value: data?.noticeStatus!,
        showDisplayValue: true,
        refDataSection: NoticeConstant.refDataKey.statuses
      },
      {
        type: 'text',
        value: data?.hasMeeting ? 'Yes' : 'No',
      },
    ];
  }

  protected override prepareDetailedView(
    data: Notice,
    options?: { [key: string]: any }
  ): DetailedView[] {
    return [
      getNoticeSection(data, this.getRefData() || {}, options && options['create']),
    ];
  }

  protected override prepareDefaultButtons(
    data: Notice,
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
      {
        button_id: 'UPDATE_NOTICE',
        button_name: 'Update Notice'
      }
    ];
  }

  protected override onClick(event: { buttonId: string; rowIndex: number; }): void {
    if (event.buttonId === 'UPDATE_NOTICE') {
      this.showEditForm(event.rowIndex, ['notice_detail']);
      this.activeButtonId = event.buttonId;
    } else if (event.buttonId === 'CANCEL') {
      this.hideForm(event.rowIndex);
    } else if (event.buttonId === 'CONFIRM') {
      if (this.activeButtonId === 'UPDATE_NOTICE') {
        this.performUpdateNotice(event.rowIndex);
      }
    } else if (event.buttonId === 'CANCEL_CREATE') {
      this.hideForm(0, true);
    } else if (event.buttonId === 'CONFIRM_CREATE') {
      this.performCreateNotice();
    }
  }

  protected override onAccordionOpen(event: { rowIndex: number; }): void {
    // Load additional data when accordion opens if needed
  }

  override handlePageEvent($event: PageEvent): void {
    this.pageEvent = $event;
    this.fetchNotices(this.pageNumber, this.pageSize);
  }

  performSearch($event: SearchEvent): void {
    if ($event.advancedSearch && !$event.reset) {
      this.fetchNotices(undefined, undefined, removeNullFields($event.value));
    } else if ($event.advancedSearch && $event.reset) {
      this.fetchNotices(NoticeDefaultValue.pageNumber, NoticeDefaultValue.pageSize);
    } else if ($event.buttonName == 'ADVANCED_SEARCH') {
      this.getAccordionList().searchValue = '';
    }
  }

  loadData(): void {
    this.fetchNotices(
      NoticeDefaultValue.pageNumber,
      NoticeDefaultValue.pageSize
    );
  }

  private fetchNotices(pageNumber?: number, pageSize?: number, filter?: any): void {
    this.communicationService.fetchNotices(pageNumber, pageSize).subscribe((data) => {
      this.setContent(data.content || [], data.totalSize);
    });
  }

  initCreateNoticeForm(): void {
    this.showCreateForm();
  }

  private performCreateNotice(): void {
    const noticeForm = this.getSectionForm('notice_detail', 0, true);
    noticeForm?.markAllAsTouched();
    if (noticeForm?.valid) {
      this.communicationService.createNotice(noticeForm.value).subscribe({
        next: (data) => {
          this.hideForm(0, true);
          // Refresh the list to show the new notice
          this.fetchNotices(this.pageNumber, this.pageSize);
        },
        error: (error) => {
          console.error('Error creating notice:', error);
          // Handle error - could show a toast notification here
        }
      });
    }
  }

  private performUpdateNotice(rowIndex: number): void {
    const notice = this.itemList[rowIndex];
    const noticeForm = this.getSectionForm('notice_detail', rowIndex);
    noticeForm?.markAllAsTouched();
    if (noticeForm?.valid) {
      this.communicationService.updateNotice(notice.id, noticeForm.value).subscribe({
        next: (data) => {
          this.hideForm(rowIndex);
          // Update the row with the new data
          this.updateContentRow(data, rowIndex);
        },
        error: (error) => {
          console.error('Error updating notice:', error);
          // Handle error - could show a toast notification here
        }
      });
    }
  }
}
