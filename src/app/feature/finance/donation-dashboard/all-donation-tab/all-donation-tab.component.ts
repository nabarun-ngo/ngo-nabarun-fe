import { Component } from '@angular/core';
import { GuestDonationTabComponent } from '../guest-donation-tab/guest-donation-tab.component';
import { DonationDefaultValue, DonationRefData } from '../../finance.const';
import { Donation } from '../../model';
import { date, removeNullFields } from 'src/app/core/service/utilities.service';
import { SearchEvent } from 'src/app/shared/components/search-and-advanced-search-form/search-event.model';
import { PageEvent } from '@angular/material/paginator';
import { AccordionCell } from 'src/app/shared/model/accordion-list.model';

@Component({
  selector: 'app-all-donation-tab',
  templateUrl: './all-donation-tab.component.html',
  styleUrls: ['./all-donation-tab.component.scss']
})
export class AllDonationTabComponent extends GuestDonationTabComponent {
  protected override prepareHighLevelView(data: Donation, options?: { [key: string]: any; }): AccordionCell[] {
    return [
      {
        type: 'text',
        value: data?.donorName,
      },
      {
        type: 'text',
        value: this.showDonationType(data),
      },
      {
        type: 'text',
        value: data?.amount ? `₹ ${data.amount}` : '',
      },
      {
        type: 'text',
        value: data?.status,
        showDisplayValue: true,
        refDataSection: DonationRefData.refDataKey.status
      }
    ];
  }
  private showDonationType(data: Donation) {
    const refData = this.getRefData()![DonationRefData.refDataKey.type];
    let period = '';
    if (data?.type === 'REGULAR') {
      period = ` (${date(data?.startDate, 'dd/MM/yyyy')} - ${date(data?.endDate, 'dd/MM/yyyy')})`;
    }
    return `${refData.find((item) => item.key === data?.type)?.displayValue}${period}`;
  }

  override loadData(): void {
    this.donationService.fetchDonations({
      pageIndex: DonationDefaultValue.pageNumber,
      pageSize: DonationDefaultValue.pageSize,
    }).subscribe(data => {
      this.setContent(data.donations.content!, data.donations.totalSize);
    })
  }

  override handlePageEvent($event: PageEvent): void {
    this.pageEvent = $event;
    this.donationService.fetchDonations({
      pageIndex: $event.pageIndex,
      pageSize: $event.pageSize
    }).subscribe(data => {
      this.setContent(data.donations.content!, data.donations.totalSize);
    });
  }

  override onSearch($event: SearchEvent): void {
    if ($event.advancedSearch) {
      this.donationService.fetchDonations({
        filter: removeNullFields($event.value)
      }).subscribe(data => {
        this.setContent(data.donations.content!, data.donations.totalSize);
      });
    }
    else if ($event.reset) {
      this.loadData()
    }
  }


}
