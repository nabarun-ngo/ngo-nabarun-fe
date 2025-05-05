import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { DonationList, MemberList } from '../donation.model';
import {
  DonationDetail,
  DonationStatus,
  PaymentMethod,
  UserDetail,
} from 'src/app/core/api/models';
import { DonationService } from '../donation.service';
import { PageEvent } from '@angular/material/paginator';
import { DonationDefaultValue } from '../donation.const';
import { BehaviorSubject, firstValueFrom, Subject } from 'rxjs';
import { ModalService } from 'src/app/core/service/modal.service';
import { SearchAndAdvancedSearchFormComponent } from 'src/app/shared/components/search-and-advanced-search-form/search-and-advanced-search-form.component';
import { SearchAndAdvancedSearchModel } from 'src/app/shared/model/search-and-advanced-search.model';
import { MemberProfileComponent } from '../../member/member-profile/member-profile.component';
import { ProfileViewComponent } from 'src/app/shared/components/profile-view/profile-view.component';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { MemberProfileModel } from '../../member/member-profile/member-profile.model';
import { UserIdentityService } from 'src/app/core/service/user-identity.service';
import { SCOPE } from 'src/app/core/constant/auth-scope.const';
import { DetailedDonationComponent } from 'src/app/shared/components/detailed-donation/detailed-donation.component';
import { DonationAccordionComponent } from '../donation-accordion/donation-accordion.component';
import { FileUpload } from 'src/app/shared/components/generic/file-upload/file-upload.component';
import { removeNullFields } from 'src/app/core/service/utilities.service';
import { AppDialog } from 'src/app/core/constant/app-dialog.const';
import { AppAlert } from 'src/app/core/constant/app-alert.const';

@Component({
  selector: 'app-member-accordion',
  templateUrl: './member-accordion.component.html',
  styleUrls: ['./member-accordion.component.scss'],
})
export class MemberAccordionComponent implements OnInit {
  protected scope = SCOPE;

  @Input() members!: MemberList[];
  @Input() searchValue!: string;
  @Input() donationSerach!: SearchAndAdvancedSearchModel;
  canCreateDonation!: boolean;
  defaultValue = DonationDefaultValue;
  canUpdateDonation!: boolean;

  constructor(
    private donationService: DonationService,
    private modalService: ModalService,
    private sharedDataService: SharedDataService,
    protected identityService: UserIdentityService
  ) {}
  ngOnInit(): void {
    this.canCreateDonation = this.identityService.isAccrediatedTo(
      this.scope.create.donation
    );
    this.canUpdateDonation = this.identityService.isAccrediatedTo(
      this.scope.update.donation
    );
  }

  accordionOpened(member: UserDetail) {
    this.fetchDonations(
      member.id!,
      this.defaultValue.pageNumber,
      this.defaultValue.pageSize
    );
  }

  handlePageEvent(member: UserDetail, $event: PageEvent) {
    this.fetchDonations(member.id!, $event.pageIndex, $event.pageSize);
  }
  private fetchDonations(id: string, index: number, size: number) {
    this.donationService
      .fetchUserDonations(id, index, size)
      .subscribe((data) => {
        this.members
          .filter((f) => f.member?.id == id)
          .map((item) => {
            item.donations = [];
            data.donations?.content?.forEach((don) =>
              item.donations?.push({
                donation: don,
                action: 'view',
                eventSubject: new Subject<any>(),
              })
            );
            item.index = data.donations?.pageIndex!;
            item.size = data.donations?.pageSize!;
            item.total = data.donations?.totalSize!;
            item.donationSummary = data.summary;
            // console.log(item)
            return item;
          });
      });
  }

  donationFilter(member: MemberList, clear?: boolean) {
    if (clear) {
      member.advancedSearch = false;
      this.fetchDonations(
        member.member?.id!,
        this.defaultValue.pageNumber,
        this.defaultValue.pageSize
      );
    } else {
      member.advancedSearch = true;
      this.donationSerach.showOnlyAdvancedSearch = true;
      let modal = this.modalService.openComponentDialog(
        SearchAndAdvancedSearchFormComponent,
        this.donationSerach,
        {
          height: 450,
          width: 1000,
        }
      );
      modal.componentInstance.onSearch.subscribe((data) => {
        if (data.advancedSearch) {
          this.donationService
            .advancedSearch({
              donorId: member.member?.id,
              guest: false,
              donationId: data.value.id,
              donationStatus: data.value.status,
              donationType: data.value.type,
              endDate: data.value.startDate,
              startDate: data.value.endDate,
            })
            .subscribe((data) => {
              modal.close();
              this.members
                .filter((f) => f.member?.id == member.member?.id)
                .map((item) => {
                  item.donations = [];
                  data?.content?.forEach((don) =>
                    item.donations?.push({
                      donation: don,
                      action: 'view',
                      eventSubject: new Subject<any>(),
                    })
                  );
                  return item;
                });
            });
        } else if (data.reset) {
          modal.close();
          this.fetchDonations(
            member.member?.id!,
            this.defaultValue.pageNumber,
            this.defaultValue.pageSize
          );
        }
      });
    }
  }

  openProfile(profile: UserDetail) {
    let modal = this.modalService.openComponentDialog(
      MemberProfileComponent,
      {
        member: profile,
        mode: 'view_admin',
        refData: this.sharedDataService.getRefData('DONATION'),
      } as MemberProfileModel,
      {
        fullScreen: true,
      }
    );
    modal.componentInstance.dialogClose.subscribe((d) => {
      modal.close();
    });
  }

  isBulkEdit(donations: DonationList[]): boolean {
    return donations?.filter((f) => f.selected)?.length > 0;
  }

  performBulkEdit(memId: string, donations: DonationList[]): void {
    let dons = donations?.filter((f) => f.selected);
    if (dons.length > 0) {
      let uniqueTypes = new Set(dons.map((don) => don.donation?.type));
      if (uniqueTypes.size > 1) {
        this.modalService.openNotificationModal(
          AppDialog.err_sel_don_nt_sm_typ,
          'notification',
          'error'
        );
        return;
      }
      let uniqueStatus = new Set(dons.map((don) => don.donation?.status));
      if (uniqueStatus.size > 1) {
        this.modalService.openNotificationModal(
          AppDialog.err_sel_don_nt_sm_sts,
          'notification',
          'error'
        );
        return;
      }
      let donIds = dons.map((m) => m.donation?.id);
      let modal = this.modalService.openBaseModal(
        DetailedDonationComponent,
        {
          donation: {
            id: donIds.join(', '),
            amount: dons.reduce(
              (sum, current) => sum + current.donation?.amount!,
              0
            ),
            status: dons[0].donation?.status,
            type: dons[0].donation?.type,
          },
          setMode: 'edit',
          donationTab: 'member_donation',
        },
        {
          headerText: 'Bulk Edit ',
          buttons: [
            { button_id: 'CANCEL', button_name: 'Cancel' },
            { button_id: 'SUBMIT', button_name: 'Submit', is_primary: true },
          ],
        }
      );
      let docList = new BehaviorSubject<FileUpload[]>([]);
      modal.componentInstance.onConpomentInit.subscribe((s) => {
        let compInstnc = modal.componentInstance.bodyComponentInstance;
        compInstnc?.donationForm?.controls!['amount']?.disable();
        compInstnc.docChange.subscribe(docList);
      });

      modal.componentInstance.onbuttonClick.subscribe((d) => {
        if (d == 'SUBMIT') {
          let compInstnc = modal.componentInstance.bodyComponentInstance;
          compInstnc?.donationForm?.controls!['amount']?.disable();
          compInstnc.donationForm.markAllAsTouched();
          if (compInstnc.donationForm.valid) {
            let formValue = compInstnc.donationForm.value;
            let isFileNeeded =
              formValue.status == DonationStatus.Paid &&
              formValue.paymentMethod &&
              formValue.paymentMethod != PaymentMethod.Cash;
            if (isFileNeeded && docList.value.length == 0) {
              this.modalService.openNotificationModal(
                AppDialog.err_min_1_doc,
                'notification',
                'error'
              );
            } else {
              for (let donId of donIds) {
                let donation: DonationDetail = {
                  status: formValue.status,
                  cancelletionReason: formValue.cancelletionReason,
                  laterPaymentReason: formValue.laterPaymentReason,
                  paidOn: formValue.paidOn,
                  paidToAccount: formValue.paidToAccount
                    ? { id: formValue.paidToAccount }
                    : undefined,
                  paidUsingUPI: formValue.paidUsingUPI,
                  paymentFailureDetail: formValue.paymentFailureDetail,
                  paymentMethod: formValue.paymentMethod,
                  remarks: formValue.remarks,
                };
                this.donationService
                  .updateDonation(donId!, removeNullFields(donation))
                  .subscribe((data) => {
                    let member = this.members.find(
                      (f) => f.member?.id == memId
                    );
                    if (docList.value.length > 0) {
                      this.donationService
                        .uploadDocuments(
                          donId!,
                          docList.value.map((m) => m.detail)
                        )
                        .subscribe((d) => {});
                    }
                    member
                      ?.donations!.filter((f) => f.donation?.id == donId)
                      .map((item) => {
                        item.action = 'view';
                        item.update = undefined;
                        item.donation = data;
                        return item;
                      });
                  });
              }
              modal.close();
            }
          }
        } else {
          modal.close();
        }
      });
    }
  }
}
