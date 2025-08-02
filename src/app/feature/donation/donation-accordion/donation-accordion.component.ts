import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {
  DocumentDetail,
  DonationDetail,
  DonationStatus,
  PaymentMethod,
  UserDetail,
} from 'src/app/core/api/models';
import { DonationRefData, donationTab } from '../donation.const';
import { DonationService } from '../donation.service';
import { DonationList } from '../donation.model';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import {
  compareObjects,
  getNonNullValues,
} from 'src/app/core/service/utilities.service';
import { ModalService } from 'src/app/core/service/modal.service';
import { AppDialog } from 'src/app/core/constant/app-dialog.const';
import { Subject } from 'rxjs';
import { AlertData } from 'src/app/shared/model/alert.model';
import { AppAlert, interpolate } from 'src/app/core/constant/app-alert.const';
import { UserIdentityService } from 'src/app/core/service/user-identity.service';
import { SCOPE } from 'src/app/core/constant/auth-scope.const';
import { UniversalInputModel } from 'src/app/shared/model/universal-input.model';

@Component({
  selector: 'app-donation-accordion',
  templateUrl: './donation-accordion.component.html',
  styleUrls: ['./donation-accordion.component.scss'],
})
export class DonationAccordionComponent implements OnInit {
  protected scope = SCOPE;
  @Input({ required: true }) donations!: DonationList[];
  @Input() tabName: donationTab | undefined;
  @Input() createDonation: boolean = false;
  @Output() createDonationChange: EventEmitter<boolean> = new EventEmitter();
  refData: any;
  donationStatus = DonationStatus;
  createDonationData: {
    eventSubject: Subject<any>;
    validDonation?: boolean;
    validGuest?: boolean;
    donation?: DonationDetail;
  } = { eventSubject: new Subject<any>() };
  @Input() member!: UserDetail;
  @Input() searchValue!: string;

  alertList: AlertData[] = [];
  canUpdateDonation!: boolean;
  checkboxInput: UniversalInputModel = {
    inputType: 'check',
    html_id: 'id',
    tagName: 'input',
  };

  constructor(
    private donationService: DonationService,
    private sharedDataService: SharedDataService,
    private modalService: ModalService,
    protected identityService: UserIdentityService
  ) {}

  ngOnInit(): void {
    this.refData = this.sharedDataService.getRefData('DONATION');
    this.canUpdateDonation = this.identityService.isAccrediatedTo(
      this.scope.update.donation
    );
  }

  accordionOpened(donation: DonationDetail) {
    this.donationService.fetchDocuments(donation.id!).subscribe((data) => {
      this.donations
        .filter((f) => f.donation?.id == donation.id)
        .map((item) => {
          item.documents = data;
          return item;
        });
    });
  }

  /**
   *
   * @param donation
   * @param isConfirmed
   */
  donationEdit(donation: DonationDetail, isConfirmed: boolean) {
    let result = this.donations.find((f) => f.donation?.id == donation.id);
    if (result?.action == 'edit') {
      if (isConfirmed == true) {
        console.log(result.update?.valid);
        //console.log(result.update?.donation,result.donation)
        if (result.update?.valid) {
          let isFileNeeded =
            result.update?.donation.status == this.donationStatus.Paid &&
            result.update?.donation.paymentMethod &&
            result.update?.donation.paymentMethod != PaymentMethod.Cash;
          if (
            isFileNeeded &&
            (!result?.upload || result?.upload?.length == 0)
          ) {
            this.modalService.openNotificationModal(
              AppDialog.err_min_1_doc,
              'notification',
              'error'
            );
          } else {
            let update = compareObjects(
              result.update?.donation,
              result.donation
            ) as DonationDetail;
            if (isFileNeeded) {
              this.donationService
                .updateDonation(donation.id!, update)
                .subscribe((data) => {
                  let files = result?.upload?.map((m) => {
                    m.detail.documentMapping = [
                      {
                        docIndexId: donation.id!,
                        docIndexType: 'DONATION',
                      },
                      {
                        docIndexId: data?.transactionRef!,
                        docIndexType: 'TRANSACTION',
                      },
                    ];
                    return m.detail;
                  })!;
                  this.alertList.push(AppAlert.donation_updated);
                  this.donationService
                    .uploadDocuments(files!)
                    .subscribe((data1) => {
                      this.donations
                        .filter((f) => f.donation?.id == donation.id)
                        .map((item) => {
                          item.action = 'view';
                          item.update = undefined;
                          item.donation = data;
                          return item;
                        });
                    });
                });
            } else {
              this.donationService
                .updateDonation(donation.id!, update)
                .subscribe((data) => {
                  this.alertList.push(AppAlert.donation_updated);
                  this.donations
                    .filter((f) => f.donation?.id == donation.id)
                    .map((item) => {
                      item.action = 'view';
                      item.update = undefined;
                      item.donation = data;
                      return item;
                    });
                });
            }
          }
        } else {
          let don = this.donations.find((f) => f.donation?.id == donation.id);
          console.log(don);
          don?.eventSubject?.next('validate_form');
        }
      } else {
        this.createDonationData.eventSubject.next('reset_form');
        this.donations
          .filter((f) => f.donation?.id == donation.id)
          .map((item) => {
            item.action = 'view';
            item.update = undefined;
            return item;
          });
      }
    } else {
      this.donations
        .filter((f) => f.donation?.id == donation.id)
        .map((item) => {
          item.action = 'edit';
          return item;
        });
      console.log(this.donations);
    }
  }

  saveAndUpload(donation: DonationDetail) {
    let result = this.donations.find((f) => f.donation?.id == donation.id);
    let isFileNeeded = result?.update?.donation.isPaymentNotified;
    if (isFileNeeded && (!result?.upload || result?.upload?.length == 0)) {
      this.modalService.openNotificationModal(
        AppDialog.err_min_1_doc,
        'notification',
        'error'
      );
    } else {
      this.donationService
        .updatePaymentInfo(donation.id!, 'NOTIFY', result?.update?.donation!)
        .subscribe((data) => {
          console.log(data);
          if (isFileNeeded) {
            let files = result?.upload?.map((m) => {
              m.detail.documentMapping = [
                {
                  docIndexId: donation.id!,
                  docIndexType: 'DONATION',
                },
              ];
              return m.detail;
            })!;
            this.donationService
              .uploadDocuments(files!)
              .subscribe((data) => {});
          }
          this.donations
            .filter((f) => f.donation?.id == donation.id)
            .map((item) => {
              item.donation = data!;
              item.action = 'view';
              return item;
            });
          this.alertList.push(AppAlert.payment_notified);
        });
    }
    console.log(this.donations);
    //this.donationService.updatePaymentAndDocuments
  }

  addDonation(isConfirmed: boolean) {
    if (isConfirmed) {
      console.log(this.createDonationData);
      this.tabName == 'guest_donation';
      if (
        this.createDonationData.validDonation &&
        (this.tabName != 'guest_donation' || this.createDonationData.validGuest)
      ) {
        let donation = this.createDonationData.donation as DonationDetail;
        donation.isGuest = this.tabName == 'guest_donation';
        if (!donation.isGuest) {
          donation.donorDetails = this.member;
        }
        //console.log(donation);
        this.donationService.createDonation(donation).subscribe((data) => {
          this.alertList.push(
            interpolate(AppAlert.donation_created, { donationId: data?.id! })
          );

          this.donations.unshift({
            donation: data!,
            action: 'view',
            eventSubject: new Subject<any>(),
          });
          this.createDonationData = {
            donation: {},
            eventSubject: new Subject<any>(),
          };
          this.createDonation = false;
          this.createDonationChange.emit(this.createDonation);
        });
      } else {
        this.createDonationData.eventSubject.next('validate_form');
      }
    } else {
      this.createDonationData = {
        donation: {},
        eventSubject: new Subject<any>(),
      };
      this.createDonation = false;
      this.createDonationData.eventSubject.next('reset_form');
      this.createDonationChange.emit(this.createDonation);
    }
  }

  onDonationChange(donationData: {
    valid?: boolean | undefined;
    donation?: DonationDetail | undefined;
  }) {
    this.createDonationData.validDonation = donationData.valid;
    let donor = this.createDonationData.donation?.donorDetails;
    this.createDonationData.donation = donationData.donation;
    if (!this.createDonationData.donation) {
      this.createDonationData.donation = {};
    }
    this.createDonationData.donation.donorDetails = donor;
    console.log(this.createDonationData.donation);
  }

  onProfileChange(memberData: {
    valid?: boolean | undefined;
    member?: UserDetail | undefined;
  }) {
    this.createDonationData.validGuest = memberData.valid;
    if (!this.createDonationData.donation) {
      this.createDonationData.donation = {};
    }
    this.createDonationData.donation.donorDetails = memberData.member;
    console.log(this.createDonationData.donation);
  }

  showHistory(donation: DonationDetail) {
    this.donationService.getHistory(donation.id!).subscribe((data) => {
      this.donations
        .filter((f) => f.donation?.id == donation.id)
        .map((item) => {
          item.histories = data;
          return item;
        });
    });
  }

  /**
   * @param donationTypeCode
   * @returns
   */
  protected displayDonationType = (donationTypeCode: string | undefined) => {
    if (this.refData == undefined || donationTypeCode == undefined) {
      return donationTypeCode;
    }
    return this.refData[DonationRefData.refDataKey.type]?.find(
      (f: { key: string }) => f.key == donationTypeCode
    )?.displayValue;
  };

  protected displayDonationStatus = (
    donationStatusCode: string | undefined
  ) => {
    if (this.refData == undefined || donationStatusCode == undefined) {
      return donationStatusCode;
    }
    return this.refData[DonationRefData.refDataKey.status]?.find(
      (f: { key: string }) => f.key == donationStatusCode
    )?.displayValue;
  };
}
