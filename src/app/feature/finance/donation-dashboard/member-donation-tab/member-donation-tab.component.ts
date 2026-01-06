import { Component } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { SearchEvent } from 'src/app/shared/components/search-and-advanced-search-form/search-event.model';
import { AccordionCell, AccordionRow } from 'src/app/shared/model/accordion-list.model';
import { DetailedView } from 'src/app/shared/model/detailed-view.model';
import { Donation, DonationSummary } from '../../model';
import { BaseDonationTabComponent } from '../base-donation-tab.component';
import { SearchAndAdvancedSearchFormComponent } from 'src/app/shared/components/search-and-advanced-search-form/search-and-advanced-search-form.component';
import { Validators } from '@angular/forms';
import { KeyValue } from 'src/app/shared/model/key-value.model';
import { getDonorSection } from '../../fields/donation.field';
import { DonationRefData } from '../../finance.const';
import { date, getNonNullValues, removeNullFields } from 'src/app/core/service/utilities.service';
import { SearchAndAdvancedSearchModel } from 'src/app/shared/model/search-and-advanced-search.model';
import { User } from 'src/app/feature/member/models/member.model';
import { AppDialog } from 'src/app/core/constant/app-dialog.const';

@Component({
  selector: 'app-member-donation-tab',
  templateUrl: './member-donation-tab.component.html',
  styleUrls: ['./member-donation-tab.component.scss']
})
export class MemberDonationTabComponent extends BaseDonationTabComponent {
  protected detailedViews: DetailedView[] = [];
  protected summary!: DonationSummary;
  protected userSearch: SearchAndAdvancedSearchModel = {
    normalSearchPlaceHolder: '',
    showOnlyAdvancedSearch: true,
    advancedSearch: {
      buttonText: { search: 'Select', close: 'Close' },
      title: 'Select Members',
      searchFormFields: [{
        formControlName: 'userId',
        inputModel: {
          html_id: 'user_search',
          inputType: 'text',
          tagName: 'input',
          autocomplete: true,
          placeholder: 'Select a member',
          selectList: []
        },
        validations: [Validators.required]
      }]
    }
  };
  protected profile: User | undefined;
  private selectedRows: AccordionRow[] = [];

  override onInitHook(): void {
    this.setHeaderRow([
      {
        value: 'Donation Type',
        rounded: true
      },
      {
        value: 'Donation Amount',
        rounded: true
      },
      {
        value: 'Donation Period',
        rounded: true
      },
      {
        value: 'Donation Status',
        rounded: true
      }
    ]);
    this.setSelectable(true);
  }


  protected override prepareHighLevelView(data: Donation, options?: { [key: string]: any; }): AccordionCell[] {
    return [
      {
        type: 'text',
        value: data?.type,
        showDisplayValue: true,
        refDataSection: DonationRefData.refDataKey.type
      },
      {
        type: 'text',
        value: data?.formattedAmount,
      },
      {
        type: 'text',
        value: data?.startDate && data?.endDate ? `${date(data?.startDate)} - ${date(data?.endDate)}` : '-'
      },
      {
        type: 'text',
        value: data?.status,
        showDisplayValue: true,
        refDataSection: DonationRefData.refDataKey.status
      }
    ];
  }

  override handlePageEvent($event: PageEvent): void {
    this.pageEvent = $event;
    this.donationService.getUserDonations(this.profile?.id!, {
      pageIndex: $event.pageIndex,
      pageSize: $event.pageSize
    }).subscribe(data => {
      this.setContent(data.content!, data.totalSize);
    });
  }

  onSelectionChange(selectedRows: AccordionRow[]) {
    this.selectedRows = selectedRows;
  }

  onSearch($event: SearchEvent): void {
    if ($event.advancedSearch) {
      this.donationService.getUserDonations(this.profile?.id!, {
        filter: removeNullFields($event.value)
      }).subscribe(data => {
        this.setContent(data.content!, data.totalSize);
      });
    }
    else if ($event.reset) {
      this.donationService.getUserDonations(this.profile?.id!, {}).subscribe(data => {
        this.setContent(data.content!, data.totalSize);
      });
    }
  }

  loadData(): void {
    this.donationService.fetchMembers({ pageIndex: 0, pageSize: 100000 }).subscribe(users => {
      this.userSearch.advancedSearch?.searchFormFields.filter(f => f.inputModel.html_id == 'user_search').map(m => {
        m.inputModel.selectList = users.content?.map(m2 => {
          return { key: m2.id, displayValue: m2.fullName } as KeyValue
        })
      });
      let modal = this.modalService.openComponentDialog(SearchAndAdvancedSearchFormComponent,
        this.userSearch,
        {
          height: 290,
          width: 700,
          disableClose: true
        });
      modal.componentInstance.onSearch.subscribe(data => {
        if (data.reset) {
          modal.close();
        }
        else {
          this.profile = users.content?.find(f => f.id == data.value.userId);
          if (this.profile) {
            this.detailedViews = [
              getDonorSection({
                donorName: this.profile.fullName,
                donorEmail: this.profile.email,
                donorPhone: this.profile.primaryNumber?.fullNumber!
              }, {})];
            this.donationService.fetchUserDonations(this.profile.id, {}).subscribe(data => {
              this.setContent(data.donations?.content!, data.donations?.totalSize);
              this.summary = data.summary;
              modal.close();
            });
          }
        }
      })
    });
  }

  protected override handleConfirmCreate(): void {
    const donation_form = this.getSectionForm('donation_detail', 0, true);
    if (donation_form?.valid) {
      const donation = {
        ...donation_form?.value,
        donorId: this.profile?.id!,
      } as Donation;

      this.donationService.createDonation(donation, false).subscribe((data) => {
        this.hideForm(0, true);
        this.addContentRow(data, true);
      });
    } else {
      donation_form?.markAllAsTouched();
    }
  }


  bulkUpdate(): void {
    const dons = this.selectedRows.map((m) => this.itemList[m.index]);
    this.donationService.fetchPayableAccounts().subscribe((accounts) => {
      //this.handleBulkUpdateDonations(dons, accounts);
    });
  }
}