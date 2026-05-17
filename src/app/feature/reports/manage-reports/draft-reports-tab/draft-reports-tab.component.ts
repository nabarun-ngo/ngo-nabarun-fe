import { Component } from '@angular/core';
import { FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { AccordionButton } from 'src/app/shared/model/accordion-list.model';
import { DetailedView } from 'src/app/shared/model/detailed-view.model';
import { ReportDetailDto } from 'src/app/core/api-client/models/report-detail-dto';
import { ReportAccordionBaseComponent } from '../report-accordion.base';
import { ModalService } from 'src/app/core/service/modal.service';
import { ReportDefaultValue } from '../../report.const';
import { ReportCategoryDto } from 'src/app/core/api-client/models';
import { getReportInputDetailSection } from '../reports.field';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'app-draft-reports-tab',
  templateUrl: './draft-reports-tab.component.html',
  styleUrls: ['./draft-reports-tab.component.scss'],
})
export class DraftReportsTabComponent extends ReportAccordionBaseComponent {
  constructor(
    protected readonly modalService: ModalService,
  ) {
    super();
  }

  override loadData(): void {
    this.loadPage(ReportDefaultValue.pageNumber, ReportDefaultValue.pageSize);
  }

  protected override loadPage(index: number, size: number): void {
    this.reportService.listReports(this.reportCode, 'DRAFT', index, size).subscribe((data) => {
      this.setContent(data?.content || [], data?.totalSize);
    });
  }

  protected override prepareDetailedView(data: ReportDetailDto, options?: { [key: string]: any }): DetailedView[] {
    const isCreate = !!options?.['create'];
    if (isCreate) {
      return [
      ];
    }
    return super.prepareDetailedView(data);
  }

  protected override prepareDefaultButtons(_data: ReportDetailDto, options?: { [key: string]: any }): AccordionButton[] {
    if (options?.['create']) {
      return [
        { button_id: 'CANCEL_CREATE', button_name: 'Cancel' },
        { button_id: 'CONFIRM_CREATE', button_name: 'Create' },
      ];
    }

    return [
      { button_id: 'REMOVE', button_name: 'Delete' },
      { button_id: 'REGENERATE', button_name: 'Regenerate' },
      { button_id: 'APPROVE_PUBLISH', button_name: 'Approve & Publish' },
    ];
  }

  protected override onClick(event: { buttonId: string; rowIndex: number }): void {
    const report = this.itemList[event.rowIndex];
    switch (event.buttonId) {
      case 'REMOVE':
        this.modalService.openNotificationModal(
          { title: 'Confirm delete', description: `Are you sure you want to delete this report?` },
          'confirmation',
          'warning'
        ).onAccept$.pipe(takeUntil(this.destroy$)).subscribe(() => {
          this.reportService.deleteReport(report.id).subscribe(() => {
            this.removeContentRow(event.rowIndex);
          });
        });
        break;
      case 'REGENERATE':
        this.reportService.regenerateReport(report.id).subscribe(() => {
          this.loadData();
        });
        break;
      case 'APPROVE_PUBLISH':
        this.reportService.markApproved(report.id).subscribe(() => {
          this.removeContentRow(event.rowIndex);
        });
        break;
      case 'CANCEL_CREATE':
        this.hideForm(0, 'user_cancelled', true);
        break;
      case 'CONFIRM_CREATE':
        this.performGenerate();
        break;
      default:
        break;
    }
  }

  initCreateReport(): void {
    this.showCreateForm({} as ReportDetailDto);
    this.reportService.getReportInputs(this.reportCode).subscribe((inputs) => {
      this.addSectionInAccordion(getReportInputDetailSection({} as ReportDetailDto, inputs, true), 0, true);
    });
  }

  private performGenerate(): void {
    const form = this.getSectionForm('report_data', 0, true);
    form?.markAllAsTouched();
    if (!form?.valid) {
      this.scrollToError(true);
      return;
    }

    const parameters = form.getRawValue();
    this.reportService.generateReport(this.reportCode, parameters).subscribe((created) => {
      this.hideForm(0, 'request_completed', true);
      this.addContentRow(created, true);
    });
  }

  private readonly jsonObjectValidator = (control: FormControl): ValidationErrors | null => {
    const value = (control.value || '').trim();
    if (!value) return { invalidJson: true };
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return null;
      }
      return { invalidJson: true };
    } catch {
      return { invalidJson: true };
    }
  };
}
