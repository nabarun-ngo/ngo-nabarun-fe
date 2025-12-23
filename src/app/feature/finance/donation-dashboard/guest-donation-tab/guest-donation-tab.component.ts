import { Component, OnDestroy } from '@angular/core';
import { Validators } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { SearchEvent } from 'src/app/shared/components/search-and-advanced-search-form/search-event.model';
import { TabComponentInterface } from 'src/app/shared/interfaces/tab-component.interface';
import { AccordionButton, AccordionCell } from 'src/app/shared/model/accordion-list.model';
import { DetailedView } from 'src/app/shared/model/detailed-view.model';
import { Accordion } from 'src/app/shared/utils/accordion';
import { DonationDefaultValue, DonationRefData } from '../../finance.const';
import { Donation, PagedDonations } from '../../model';
import { compareObjects, date } from 'src/app/core/service/utilities.service';
import { DonationFieldVisibilityRules, getDonationSection, getDonorSection } from '../../fields/donation.field';
import { DonationService } from '../../service/donation.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-guest-donation-tab',
  templateUrl: './guest-donation-tab.component.html',
  styleUrls: ['./guest-donation-tab.component.scss']
})
export class GuestDonationTabComponent extends Accordion<Donation> implements TabComponentInterface<PagedDonations>, OnDestroy {
  private formSubscription?: Subscription;

  constructor(
    protected donationService: DonationService,
  ) {
    super();
  }

  override onInitHook(): void {
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


  protected get paginationConfig(): { pageNumber: number; pageSize: number; pageSizeOptions: number[]; } {
    return {
      pageNumber: DonationDefaultValue.pageNumber,
      pageSize: DonationDefaultValue.pageSize,
      pageSizeOptions: DonationDefaultValue.pageSizeOptions
    };
  }

  protected get tabComponents() {
    return {};
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

  protected override onClick(event: { buttonId: string; rowIndex: number; }): void {
    if (event.buttonId === 'UPDATE_DONATION') {
      this.activeButtonId = event.buttonId;
      this.regenerateDetailedView(event.rowIndex, { mode: 'edit' });
      this.showEditForm(event.rowIndex, ['donation_detail', 'document_list']);

      setTimeout(() => {
        this.formSubscription = this.setupFieldVisibilityRules('donation_detail', event.rowIndex, DonationFieldVisibilityRules);
        const form = this.getSectionForm('donation_detail', event.rowIndex);
        this.formSubscription?.add(
          form?.get('status')?.valueChanges.subscribe(status => {
            const isPaid = status === 'PAID';
            this.updateFieldValidators('donation_detail', event.rowIndex, {
              'paidOn': isPaid ? [Validators.required] : [],
              'paidToAccountId': isPaid ? [Validators.required] : [],
              'paymentMethod': isPaid ? [Validators.required] : [],
              'paidUsingUPI': isPaid && form?.get('paymentMethod')?.value === 'UPI' ? [Validators.required] : [],
              'cancellationReason': status === 'CANCELLED' ? [Validators.required] : [],
              'laterPaymentReason': status === 'PAY_LATER' ? [Validators.required] : [],
              'paymentFailureDetail': status === 'PAYMENT_FAILED' ? [Validators.required] : []
            });
          })
        );

        // Trigger initial validation update
        form?.get('status')?.updateValueAndValidity({ emitEvent: true });
      }, 0);

      this.donationService.fetchPayableAccounts().subscribe(accounts => {
        const accountOptions = accounts.map(a => ({
          key: a.id,
          displayValue: a.displayName
        }));
        this.updateFieldOptions('donation_detail', event.rowIndex, 'paidToAccountId', accountOptions);
      });
    }
    else if (event.buttonId === 'CANCEL' && this.activeButtonId === 'UPDATE_DONATION') {
      this.formSubscription?.unsubscribe();
      this.hideForm(event.rowIndex);
    }
    else if (event.buttonId === 'CONFIRM' && this.activeButtonId === 'UPDATE_DONATION') {
      const donation = this.itemList[event.rowIndex];
      const donorForm = this.getSectionForm('donor_detail', event.rowIndex);
      const donationForm = this.getSectionForm('donation_detail', event.rowIndex);
      if (donorForm?.valid && donationForm?.valid) {
        this.donationService.updateDonation(donation.id, compareObjects(donationForm.value, donation)).subscribe(data => {
          this.hideForm(event.rowIndex);
          this.updateContentRow(data, event.rowIndex);
        });
      } else {
        donationForm?.markAllAsTouched();
        donorForm?.markAllAsTouched();
      }
    }
  }

  protected override onAccordionOpen(event: { rowIndex: number; }): void {
    // Load documents or other data when accordion opens
  }

  override handlePageEvent($event: PageEvent): void {
    // Handle pagination
  }

  onSearch($event: SearchEvent): void {
    // Handle search
  }

  loadData(): void {
    this.donationService.fetchGuestDonations({
      pageIndex: this.paginationConfig.pageNumber,
      pageSize: this.paginationConfig.pageSize,
    }).subscribe(data => {
      this.setContent(data.content!, data.totalSize);
    })
  }

  ngOnDestroy(): void {
    this.formSubscription?.unsubscribe();
  }

}