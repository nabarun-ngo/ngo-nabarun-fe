import { Component, OnDestroy } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { SearchEvent } from 'src/app/shared/components/search-and-advanced-search-form/search-event.model';
import { TabComponentInterface } from 'src/app/shared/interfaces/tab-component.interface';
import { AccordionButton, AccordionCell } from 'src/app/shared/model/accordion-list.model';
import { DetailedView } from 'src/app/shared/model/detailed-view.model';
import { Accordion } from 'src/app/shared/utils/accordion';
import { DonationDefaultValue, DonationRefData } from '../../finance.const';
import { Donation, PagedDonations } from '../../model';
import { date } from 'src/app/core/service/utilities.service';
import { getDonationSection, getDonorSection } from '../../fields/donation.field';
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
    return [
      getDonorSection(data, {
        mode: 'view',
        refData: this.getRefData({ isActive: true })
      }),
      getDonationSection(data, {
        mode: 'view',
        refData: this.getRefData({ isActive: true }),
      })
    ];
  }

  protected override prepareDefaultButtons(data: Donation, options?: { [key: string]: any; }): AccordionButton[] {
    return [
      {
        button_id: 'UPDATE',
        button_name: 'Update'
      }
    ];
  }

  protected override onClick(event: { buttonId: string; rowIndex: number; }): void {
    if (event.buttonId === 'UPDATE') {
      this.activeButtonId = event.buttonId;

      // Regenerate sections in edit mode
      const donation = this.itemList[event.rowIndex];
      const donorSection = getDonorSection(donation, {
        mode: 'edit',
        refData: this.getRefData({ isActive: true })
      });
      const donationSection = getDonationSection(donation, {
        mode: 'edit',
        refData: this.getRefData({ isActive: true })
      });

      // Replace sections
      this.getAccordionList().contents[event.rowIndex].detailed = [
        donorSection,
        donationSection
      ];

      // Show edit form
      this.showEditForm(event.rowIndex, ['donation_detail', 'donor_detail', 'document_list']);

      // Setup dynamic field visibility
      this.setupDynamicFieldVisibility(event.rowIndex);
    }
    else if (event.buttonId === 'CANCEL' && this.activeButtonId === 'UPDATE') {
      this.formSubscription?.unsubscribe();
      this.hideForm(event.rowIndex);
    }
    else if (event.buttonId === 'CONFIRM' && this.activeButtonId === 'UPDATE') {
      // TODO: Implement save logic
      const donorForm = this.getSectionForm('donor_detail', event.rowIndex);
      const donationForm = this.getSectionForm('donation_detail', event.rowIndex);

      if (donorForm?.valid && donationForm?.valid) {
        console.log('Donor data:', donorForm.value);
        console.log('Donation data:', donationForm.value);
        // Call service to update donation
        // this.donationService.updateDonation(...).subscribe(...)
      }
    }
  }

  /**
   * Setup dynamic field visibility based on form values
   * This handles fields that should show/hide based on user input
   */
  private setupDynamicFieldVisibility(rowIndex: number): void {
    const form = this.getSectionForm('donation_detail', rowIndex);

    // Clean up previous subscription
    this.formSubscription?.unsubscribe();

    // Subscribe to form changes
    this.formSubscription = form?.valueChanges.subscribe(formValue => {
      const section = this.getSectionInAccordion('donation_detail', rowIndex);

      if (!section?.content) return;

      // Get current form values
      const status = formValue.status;
      const paymentMethod = formValue.paymentMethod;
      const type = formValue.type;

      // Toggle field visibility based on form values
      section.content.forEach(field => {
        switch (field.form_control_name) {
          // Fields that depend on status === 'PAID'
          case 'paidOn':
          case 'paidToAccount':
          case 'paymentMethod':
          case 'remarks':
            field.hide_field = status !== 'PAID';
            break;

          // UPI field depends on both status and payment method
          case 'paidUsingUPI':
            field.hide_field = !(status === 'PAID' && paymentMethod === 'UPI');
            break;

          // Status-specific reason fields
          case 'cancellationReason':
            field.hide_field = status !== 'CANCELLED';
            break;

          case 'laterPaymentReason':
            field.hide_field = status !== 'PAY_LATER';
            break;

          case 'paymentFailureDetail':
            field.hide_field = status !== 'PAYMENT_FAILED';
            break;

          // Type-dependent fields
          case 'startDate':
          case 'endDate':
            field.hide_field = type !== 'REGULAR';
            break;
        }
      });
    });

    // Trigger initial visibility update
    form?.updateValueAndValidity();
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