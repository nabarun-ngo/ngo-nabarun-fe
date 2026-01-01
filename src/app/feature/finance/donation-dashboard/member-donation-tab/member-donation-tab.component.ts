import { Component } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { SearchEvent } from 'src/app/shared/components/search-and-advanced-search-form/search-event.model';
import { AccordionCell } from 'src/app/shared/model/accordion-list.model';
import { DetailedView } from 'src/app/shared/model/detailed-view.model';
import { Donation, DonationSummary } from '../../model';
import { BaseDonationTabComponent } from '../base-donation-tab.component';
import { SearchAndAdvancedSearchFormComponent } from 'src/app/shared/components/search-and-advanced-search-form/search-and-advanced-search-form.component';
import { Validators } from '@angular/forms';
import { KeyValue } from 'src/app/shared/model/key-value.model';
import { getDonorSection } from '../../fields/donation.field';
import { DonationRefData } from '../../finance.const';
import { date } from 'src/app/core/service/utilities.service';
import { SearchAndAdvancedSearchModel } from 'src/app/shared/model/search-and-advanced-search.model';

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
        value: data.formattedAmount,
      },
      {
        type: 'text',
        value: data.periodDisplay || `${date(data.startDate)} - ${date(data.endDate)}`
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

  }

  onSearch($event: SearchEvent): void {

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
          let profile = users.content?.find(f => f.id == data.value.userId);
          if (profile) {
            this.detailedViews = [
              getDonorSection({
                donorName: profile.fullName,
                donorEmail: profile.email,
                donorPhone: profile.primaryNumber?.fullNumber!
              }, {})];
            this.donationService.fetchUserDonations(profile.id, {}).subscribe(data => {
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
  }
}