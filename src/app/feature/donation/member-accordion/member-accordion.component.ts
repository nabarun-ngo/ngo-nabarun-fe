import { Component, Input, OnInit } from '@angular/core';
import { MemberList } from '../donation.model';
import { UserDetail } from 'src/app/core/api/models';
import { DonationService } from '../donation.service';
import { PageEvent } from '@angular/material/paginator';
import { DonationDefaultValue } from '../donation.const';
import { Subject } from 'rxjs';
import { ModalService } from 'src/app/core/service/modal.service';
import { SearchAndAdvancedSearchFormComponent } from 'src/app/shared/components/search-and-advanced-search-form/search-and-advanced-search-form.component';
import { SearchAndAdvancedSearchModel } from 'src/app/shared/components/search-and-advanced-search-form/search-and-advanced-search.model';
import { MemberProfileComponent } from '../../member/member-profile/member-profile.component';
import { ProfileViewComponent } from 'src/app/shared/components/profile-view/profile-view.component';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { MemberProfileModel } from '../../member/member-profile/member-profile.model';
import { UserIdentityService } from 'src/app/core/service/user-identity.service';
import { SCOPE } from 'src/app/core/constant/auth-scope.const';

@Component({
  selector: 'app-member-accordion',
  templateUrl: './member-accordion.component.html',
  styleUrls: ['./member-accordion.component.scss']
})
export class MemberAccordionComponent implements OnInit {
  protected scope = SCOPE;

  @Input() members!: MemberList[];
  @Input() searchValue!: string;
  @Input() donationSerach!: SearchAndAdvancedSearchModel;
  canCreateDonation!: boolean;
  defaultValue = DonationDefaultValue;


  constructor(
    private donationService: DonationService,
    private modalService: ModalService,
    private sharedDataService: SharedDataService,
    protected identityService: UserIdentityService,

  ) { }
  ngOnInit(): void {
    this.canCreateDonation = this.identityService.isAccrediatedTo(this.scope.create.donation)
  }

  accordionOpened(member: UserDetail) {
    this.fetchDonations(member.id!, this.defaultValue.pageNumber, this.defaultValue.pageSize);
  }

  handlePageEvent(member: UserDetail, $event: PageEvent) {
    this.fetchDonations(member.id!, $event.pageIndex, $event.pageSize);
  }
  private fetchDonations(id: string, index: number, size: number) {
    this.donationService.fetchUserDonations(id, index, size).subscribe(data => {
      this.members.filter(f => f.member?.id == id).map(item => {
        item.donations = [];
        data.donations?.content?.forEach(don => item.donations?.push({ donation: don, action: 'view', eventSubject: new Subject<any>() }))
        item.index = data.donations?.pageIndex!;
        item.size = data.donations?.pageSize!;
        item.total = data.donations?.totalSize!;
        item.donationSummary = data.summary;
        // console.log(item)
        return item;
      });
    })
  }

  donationFilter(member: MemberList, clear?: boolean) {
    if (clear) {
      member.advancedSearch = false;
      this.fetchDonations(member.member?.id!, this.defaultValue.pageNumber, this.defaultValue.pageSize);
    }
    else {
      member.advancedSearch = true;
      this.donationSerach.showOnlyAdvancedSearch = true;
      let modal = this.modalService.openComponentDialog(SearchAndAdvancedSearchFormComponent,
        this.donationSerach, {
        height: 450,
        width: 1000
      });
      modal.componentInstance.onSearch.subscribe(data => {
        if (data.advancedSearch) {
          this.donationService.advancedSearch({
            donorId: member.member?.id,
            guest: false,
            donationId: data.value.id,
            donationStatus: data.value.status,
            donationType: data.value.type,
            endDate: data.value.startDate,
            startDate: data.value.endDate
          }).subscribe(data => {
            modal.close()
            this.members.filter(f => f.member?.id == member.member?.id).map(item => {
              item.donations = [];
              data?.content?.forEach(don => item.donations?.push({ donation: don, action: 'view', eventSubject: new Subject<any>() }))
              return item;
            });
          })
        } else if (data.reset) {
          modal.close();
          this.fetchDonations(member.member?.id!, this.defaultValue.pageNumber, this.defaultValue.pageSize);
        }
      })
    }
  }


  openProfile(profile: UserDetail) {
    let modal = this.modalService.openComponentDialog(MemberProfileComponent,
      {
        member: profile,
        mode: 'view_admin',
        refData: this.sharedDataService.getRefData('DONATION')
      } as MemberProfileModel, {
      fullScreen: true
    });
    modal.componentInstance.dialogClose.subscribe(d => {
      modal.close()
    })
  }


}
