import { Component } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { SearchEvent } from 'src/app/shared/components/search-and-advanced-search-form/search-event.model';
import { AccordionButton, AccordionCell } from 'src/app/shared/model/accordion-list.model';
import { DetailedView } from 'src/app/shared/model/detailed-view.model';
import { DonationRefData } from '../../finance.const';
import { Donation } from '../../model';
import { getDonationSection, getDonorSection } from '../../fields/donation.field';
import { BaseDonationTabComponent } from '../base-donation-tab.component';
import { SCOPE } from 'src/app/core/constant/auth-scope.const';
import { removeNullFields } from 'src/app/core/service/utilities.service';

@Component({
  selector: 'app-guest-donation-tab',
  templateUrl: './guest-donation-tab.component.html',
  styleUrls: ['./guest-donation-tab.component.scss']
})
export class GuestDonationTabComponent extends BaseDonationTabComponent {
  permissions: { canCreateDonation: boolean; canUpdateDonation: boolean; } | undefined;

  override onInitHook(): void {
    this.permissions = {
      canCreateDonation: this.identityService.isAccrediatedTo(SCOPE.create.donation),
      canUpdateDonation: this.identityService.isAccrediatedTo(SCOPE.update.donation),
    }
    this.setHeaderRow([
      {
        value: 'Donor Name',
        rounded: true
      },
      {
        value: 'Donation Type',
        rounded: true
      },
      {
        value: 'Donation Amount',
        rounded: true
      },
      {
        value: 'Donation Status',
        rounded: true
      }
    ]);
  }

  protected override prepareHighLevelView(data: Donation, options?: { [key: string]: any; }): AccordionCell[] {
    return [
      {
        type: 'text',
        value: data?.donorName,
      },
      {
        type: 'text',
        value: data?.type,
        showDisplayValue: true,
        refDataSection: DonationRefData.refDataKey.type
      },
      {
        type: 'text',
        value: data.formattedAmount,
      },
      {
        type: 'text',
        value: data?.status,
        showDisplayValue: true,
        refDataSection: DonationRefData.refDataKey.status
      }
    ];
  }

  protected override prepareDetailedView(data: Donation, options?: { [key: string]: any; }): DetailedView[] {
    const mode = (options?.['mode'] as 'create' | 'edit' | 'view') || 'view';

    return [
      getDonorSection(data, {
        mode: mode,
        refData: this.getRefData({ isActive: true })
      }),
      getDonationSection(data, {
        mode: mode,
        refData: this.getRefData({ isActive: true }),
      })
    ];
  }

  protected override prepareDefaultButtons(data: Donation, options?: { [key: string]: any; }): AccordionButton[] {
    return [
      {
        button_id: 'UPDATE_DONATION',
        button_name: 'Update'
      }
    ];
  }


  override handlePageEvent($event: PageEvent): void {
    this.pageEvent = $event;
    this.donationService.fetchGuestDonations({
      pageIndex: $event.pageIndex,
      pageSize: $event.pageSize
    }).subscribe(data => {
      this.setContent(data.content!, data.totalSize);
    });
  }

  onSearch($event: SearchEvent): void {
    if ($event.advancedSearch) {
      this.donationService.fetchGuestDonations({
        filter: removeNullFields($event.value)
      }).subscribe(data => {
        this.setContent(data.content!, data.totalSize);
      });
    }
    else if ($event.reset) {
      this.donationService.fetchGuestDonations({}).subscribe(data => {
        this.setContent(data.content!, data.totalSize);
      });
    }
  }

  loadData(): void {
    this.donationService.fetchGuestDonations({
      pageIndex: this.paginationConfig.pageNumber,
      pageSize: this.paginationConfig.pageSize,
    }).subscribe(data => {
      this.setContent(data.content!, data.totalSize);
    })
  }

  protected override getFormsToValidate(rowIndex: number): any[] {
    return [
      this.getSectionForm('donor_detail', rowIndex),
      this.getSectionForm('donation_detail', rowIndex)
    ];
  }

}