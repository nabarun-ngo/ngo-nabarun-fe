import { Component } from '@angular/core';
import { FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { AccordionButton } from 'src/app/shared/model/accordion-list.model';
import { DetailedView } from 'src/app/shared/model/detailed-view.model';
import { ReportDetailDto } from 'src/app/core/api-client/models/report-detail-dto';
import { ReportService } from '../../report.service';
import { ReportAccordionBaseComponent } from '../report-accordion.base';
import { KeyValue } from 'src/app/shared/model/key-value.model';
import { ModalService } from 'src/app/core/service/modal.service';
import { ReportDefaultValue } from '../../report.const';
import { ReportCategoryDto } from 'src/app/core/api-client/models';

@Component({
  selector: 'app-draft-reports-tab',
  templateUrl: './draft-reports-tab.component.html',
  styleUrls: ['./draft-reports-tab.component.scss'],
})
export class DraftReportsTabComponent extends ReportAccordionBaseComponent {
  private categories: ReportCategoryDto[] = [];
  constructor(
    protected readonly reportService: ReportService,
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
        {
          section_type: 'key_value',
          section_name: 'Generate Report',
          section_html_id: 'create_report',
          section_form: new FormGroup({}),
          content: [
            {
              field_name: 'Report Type',
              field_html_id: 'report_type',
              field_value: '',
              editable: true,
              form_control_name: 'reportCode',
              form_input: {
                html_id: 'report_type',
                tagName: 'select',
                inputType: '',
                selectList: [],
                placeholder: 'Select report type',
              },
              form_input_validation: [Validators.required],
            },
            {
              field_name: 'Parameters (JSON key-value)',
              field_html_id: 'parameters',
              field_value: '{}',
              editable: true,
              form_control_name: 'parameters',
              form_input: {
                html_id: 'parameters',
                tagName: 'textarea',
                inputType: 'text',
                placeholder: '{"key":"value"}',
              },
              form_input_validation: [Validators.required, this.jsonObjectValidator!],
            },
          ],
        },
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
      { button_id: 'REMOVE', button_name: 'Remove' },
      { button_id: 'REGENERATE', button_name: 'Regenerate' },
      { button_id: 'APPROVE_PUBLISH', button_name: 'Approve & Publish' },
    ];
  }

  protected override onClick(event: { buttonId: string; rowIndex: number }): void {
    const report = this.itemList[event.rowIndex];
    switch (event.buttonId) {
      case 'REMOVE':
        this.modalService.openNotificationModal(
          { title: 'Unavailable', description: 'Remove is not implemented in backend yet.' },
          'notification',
          'warning'
        );
        break;
      case 'REGENERATE':
        this.reportService.regenerateReport(report.id).subscribe(() => {
          this.loadData();
        });
        break;
      case 'APPROVE_PUBLISH':
        this.reportService.approveReport(report.id).subscribe(() => {
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
    this.reportService.getReportCategories().subscribe((categories) => {
      this.categories = categories || [];
      //this.updateFieldOptions('create_report', 0, 'reportCode', this.categories, true);
    });
  }

  private performGenerate(): void {
    const form = this.getSectionForm('create_report', 0, true);
    form?.markAllAsTouched();
    if (!form?.valid) {
      this.scrollToError(true);
      return;
    }

    const reportCode = form.get('reportCode')?.value as string;
    const parametersRaw = form.get('parameters')?.value as string;
    const parameters = JSON.parse(parametersRaw || '{}');

    this.reportService.generateReport(reportCode, parameters).subscribe((created) => {
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
