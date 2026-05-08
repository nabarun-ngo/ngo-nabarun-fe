import { Component } from '@angular/core';
import { AccordionButton } from 'src/app/shared/model/accordion-list.model';
import { ReportDetailDto } from 'src/app/core/api-client/models/report-detail-dto';
import { ReportAccordionBaseComponent } from '../report-accordion.base';
import { ReportDefaultValue } from '../../report.const';
import { ReportService } from '../../report.service';
import { ModalService } from 'src/app/core/service/modal.service';

@Component({
  selector: 'app-approved-reports-tab',
  templateUrl: './approved-reports-tab.component.html',
  styleUrls: ['./approved-reports-tab.component.scss'],
})
export class ApprovedReportsTabComponent extends ReportAccordionBaseComponent {
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
    this.reportService.listReports(this.reportCode, 'APPROVED', index, size).subscribe((data) => {
      this.setContent(data?.content || [], data?.totalSize);
    });
  }

  protected override prepareDefaultButtons(_data: ReportDetailDto): AccordionButton[] {
    return [{ button_id: 'UNPUBLISH', button_name: 'Unpublish' }];
  }

  protected override onClick(event: { buttonId: string; rowIndex: number }): void {
    if (event.buttonId === 'UNPUBLISH') {
      this.modalService.openNotificationModal(
        { title: 'Unavailable', description: 'Unpublish is not implemented in backend yet.' },
        'notification',
        'warning'
      );
    }
  }
}
