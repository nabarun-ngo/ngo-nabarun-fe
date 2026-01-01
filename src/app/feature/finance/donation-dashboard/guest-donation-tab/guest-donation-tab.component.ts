import { Component } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { SearchEvent } from 'src/app/shared/components/search-and-advanced-search-form/search-event.model';
import { AccordionCell } from 'src/app/shared/model/accordion-list.model';
import { DetailedView } from 'src/app/shared/model/detailed-view.model';
import { DonationRefData } from '../../finance.const';
import { Donation } from '../../model';
import { getDonorSection } from '../../fields/donation.field';
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

  protected override prepareDetailedView(data: Donation, options?: { [key: string]: any; }): DetailedView[] {
    return [
      getDonorSection(data, {
        refData: this.getRefData({ isActive: true })
      }),
      ...super.prepareDetailedView(data, { guest: true, ...options })
    ];
  }


  override handlePageEvent($event: PageEvent): void {
    this.pageEvent = $event;
    this.donationService.fetchGuestDonations({
      pageIndex: $event.pageIndex,
      pageSize: $event.pageSize
    }).subscribe(data => {
      this.setContent(data.donations.content!, data.donations.totalSize);
    });
  }

  onSearch($event: SearchEvent): void {
    if ($event.advancedSearch) {
      this.donationService.fetchGuestDonations({
        filter: removeNullFields($event.value)
      }).subscribe(data => {
        this.setContent(data.donations.content!, data.donations.totalSize);
      });
    }
    else if ($event.reset) {
      this.donationService.fetchGuestDonations({}).subscribe(data => {
        this.setContent(data.donations.content!, data.donations.totalSize);
      });
    }
  }

  loadData(): void {
    this.donationService.fetchGuestDonations({
      pageIndex: this.paginationConfig.pageNumber,
      pageSize: this.paginationConfig.pageSize,
    }).subscribe(data => {
      this.setContent(data.donations.content!, data.donations.totalSize);
    })
  }

  protected override getFormsToValidate(rowIndex: number): any[] {
    return [
      this.getSectionForm('donor_detail', rowIndex),
      this.getSectionForm('donation_detail', rowIndex)
    ];
  }

  protected override handleConfirmCreate(): void {
    const donor_form = this.getSectionForm('donor_detail', 0, true);
    const donation_form = this.getSectionForm('donation_detail', 0, true);
    console.log(donor_form?.value, donation_form?.value);
    if (donor_form?.valid && donation_form?.valid) {
      const donor = donor_form?.value;
      const donation = {
        ...donor,
        amount: donation_form?.value.amount,
      } as Donation;

      this.donationService.createDonation(donation, true).subscribe((data) => {
        this.hideForm(0, true);
        this.addContentRow(data, true);
      });
    } else {
      donation_form?.markAllAsTouched();
      donor_form?.markAllAsTouched();
    }
  }


}