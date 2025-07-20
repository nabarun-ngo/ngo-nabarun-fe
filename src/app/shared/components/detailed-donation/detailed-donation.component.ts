import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { AccountDetail, DocumentDetail, DocumentDetailUpload, DonationDetail, DonationStatus, DonationType, EventDetail, HistoryDetail, KeyValue, PaginateAccountDetail, PaymentMethod, RefDataType } from 'src/app/core/api/models';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { getErrorMessage, setValidator } from 'src/app/core/service/form.service';
import { DonationRefData, OperationMode, donationTab } from 'src/app/feature/donation/donation.const';
import { DonationService } from 'src/app/feature/donation/donation.service';
import { FileUpload } from '../generic/file-upload/file-upload.component';
import { DatePipe } from '@angular/common';
import { CommonService } from '../../services/common.service';

@Component({
  selector: 'app-detailed-donation',
  templateUrl: './detailed-donation.component.html',
  styleUrls: ['./detailed-donation.component.scss']
})
export class DetailedDonationComponent implements OnInit {


  donationForm: FormGroup = new FormGroup({});
  protected donationRefData = DonationRefData;
  protected donationType = DonationType;
  protected donationStatus = DonationStatus;
  protected paymentMethod = PaymentMethod;
  protected refData: {
    [key: string]: KeyValue[];
  } | undefined;
  //protected events!: EventDetail[];
  protected payableAccounts: KeyValue[] = [];
  protected events: KeyValue[] = [];

  mode!: OperationMode;
  errorMessage = getErrorMessage

  constructor(
    private sharedDataService: SharedDataService,
    private donationService: DonationService,
    private commonService: CommonService

  ) { }

  @Input('histories') histories!:HistoryDetail[]
  @Input('donation') donation: DonationDetail = {};
  @Input('documents') documents!: DocumentDetail[];
  @Input('tab') donationTab!: donationTab;
  @Input('triggerEvent') triggerEvent: Observable<any> | undefined;
  @Output() donationChange: EventEmitter<{
    valid: boolean,
    donation: DonationDetail,
  }> = new EventEmitter();
  @Output() docChange: EventEmitter<FileUpload[]> = new EventEmitter();

  @Input('mode') set setMode(mode: OperationMode) {
    this.mode = mode;
    if (mode == 'create' || mode == 'edit') {
      console.log(this.donation)
      this.donationForm.setControl('type', new FormControl(this.donation?.type, []))
      this.donationForm.setControl('amount', new FormControl(this.donation?.amount, [Validators.required, Validators.min(1)]))
      this.donationForm.setControl('status', new FormControl(this.donation?.status, []))
      this.donationForm.setControl('startDate', new FormControl(this.donation?.startDate ? new Date(this.donation?.startDate):'', []))
      this.donationForm.setControl('endDate', new FormControl(this.donation?.endDate ? new Date(this.donation?.endDate):'', []))
      this.donationForm.setControl('paidOn', new FormControl(this.donation?.paidOn ? new Date(this.donation?.paidOn):'', []))
      this.donationForm.setControl('paidToAccount', new FormControl(this.donation?.paidToAccount?.id, []))
      this.donationForm.setControl('paymentMethod', new FormControl(this.donation?.paymentMethod, []))
      this.donationForm.setControl('paidUsingUPI', new FormControl(this.donation?.paidUsingUPI, []))
      this.donationForm.setControl('remarks', new FormControl(this.donation?.remarks, []))
      this.donationForm.setControl('cancelletionReason', new FormControl(this.donation?.cancelletionReason, []))
      this.donationForm.setControl('laterPaymentReason', new FormControl(this.donation?.laterPaymentReason, []))
      this.donationForm.setControl('paymentFailureDetail', new FormControl(this.donation?.paymentFailureDetail, []))
      this.donationForm.setControl('isForEvent', new FormControl(null, []))
      this.donationForm.setControl('eventId', new FormControl(null, []))


      this.dfControl['type'].valueChanges.subscribe(value => {
        this.dfControl['isForEvent'].reset();

        /**
         * If donation type = onetime then 'isForEvent' mandatory
         */
        if (value == this.donationType.Onetime) {
          if (mode == 'create') {
            setValidator(this.dfControl['isForEvent'], [Validators.required])
          }
          setValidator(this.dfControl['startDate'], [])
          setValidator(this.dfControl['endDate'], [])
          this.dfControl['startDate'].reset();
          this.dfControl['endDate'].reset();
        } else {
          if (mode == 'create') {
            setValidator(this.dfControl['isForEvent'], [])
          }
          setValidator(this.dfControl['startDate'], [Validators.required])
          setValidator(this.dfControl['endDate'], [Validators.required])
        }
      })


      this.dfControl['status'].valueChanges.subscribe(value => {
        if (value == this.donationStatus.Paid) {
          this.donationService.getPayableAccounts().subscribe(data => {
            this.payableAccounts.splice(0);
            data?.content!.forEach(m => {
              this.payableAccounts.push({ key: m.id, displayValue: m.accountHolderName })
            })
          });
          this.dfControl['amount'].disable();
          setValidator(this.dfControl['paidOn'], [Validators.required]);
          setValidator(this.dfControl['paidToAccount'], [Validators.required]);
          setValidator(this.dfControl['paymentMethod'], [Validators.required]);
        } else {
          this.dfControl['amount'].enable();
          setValidator(this.dfControl['paidOn'], []);
          setValidator(this.dfControl['paidToAccount'], []);
          setValidator(this.dfControl['paymentMethod'], []);
        }

        if (value == this.donationStatus.Cancelled) {
          setValidator(this.dfControl['cancelletionReason'], [Validators.required]);
        } else {
          setValidator(this.dfControl['cancelletionReason'], []);
        }

        if (value == this.donationStatus.PayLater) {
          setValidator(this.dfControl['laterPaymentReason'], [Validators.required]);
        } else {
          setValidator(this.dfControl['laterPaymentReason'], []);
        }

        if (value == this.donationStatus.PaymentFailed) {
          setValidator(this.dfControl['paymentFailureDetail'], [Validators.required]);
        } else {
          setValidator(this.dfControl['paymentFailureDetail'], []);
        }
        this.dfControl['paidToAccount'].reset();
      })

      this.dfControl['paymentMethod'].valueChanges.subscribe(value => {
        if (value == this.paymentMethod.Upi) {
          setValidator(this.dfControl['paidUsingUPI'], [Validators.required]);
        } else {
          setValidator(this.dfControl['paidUsingUPI'], []);
        }
      })


      this.dfControl['isForEvent'].valueChanges.subscribe(value => {
        this.dfControl['eventId'].reset();
        if (value == true) {
          this.donationService.fetchEvents().subscribe(data => {
            this.events.splice(0);
            data?.content!.forEach(m => {
              this.events.push({ key: m.id, displayValue: m.eventTitle })
            })
          })
          setValidator(this.dfControl['eventId'], [Validators.required])
        } else {
          setValidator(this.dfControl['eventId'], [])
        }
      })

      if (mode == 'edit') {
        this.commonService.getRefData([RefDataType.Donation], {
          donationStatus: this.donation.status,
          donationType: this.donation.type
        }).subscribe(data => this.refData = data);
        //console.log(this.dfControl['endDate'].value, this.dfControl['startDate'].value)
        this.dfControl['type'].disable();
        this.dfControl['startDate'].disable();
        this.dfControl['endDate'].disable();
        setValidator(this.dfControl['type'], [])
      } else if (mode == 'create') {
        this.dfControl['type'].enable();
        setValidator(this.dfControl['type'], [Validators.required])
      }
      this.donationForm.removeControl('isPaymentNotified');
    } else if (mode == 'view' && this.donationTab == 'self_donation') {
      //console.log("hiiiiiiii", this.mode, this.donationTab)
      this.donationForm.setControl('isPaymentNotified', new FormControl(null, [Validators.required]))
    }
  };


  ngOnInit(): void {
    this.refData = this.sharedDataService.getRefData('DONATION');

    this.triggerEvent?.subscribe(data => {
      if (data == 'validate_form') {
        console.log(this.dfControl)
        this.donationForm.markAllAsTouched();
      } else if (data == 'reset_form') {
        this.donationForm.reset();
      }
    });

    this.donationForm.valueChanges.subscribe(() => {
      let donation: DonationDetail = {};
      donation.type = this.donationForm.value.type;
      donation.amount = this.donationForm.value.amount;
      donation.status = this.donationForm.value.status;
      donation.startDate = this.donationForm.value.startDate;
      donation.endDate = this.donationForm.value.endDate;
      donation.laterPaymentReason = this.donationForm.value.laterPaymentReason;
      donation.paymentFailureDetail = this.donationForm.value.paymentFailureDetail;
      donation.paidToAccount = this.donationForm.value.paidToAccount ? { id: this.donationForm.value.paidToAccount } : undefined;
      donation.forEvent = this.donationForm.value.eventId ? { id: this.donationForm.value.eventId } : undefined;
      donation.paidOn = this.donationForm.value.paidOn;
      donation.paymentMethod = this.donationForm.value.paymentMethod;
      donation.paidUsingUPI = this.donationForm.value.paidUsingUPI;
      donation.remarks = this.donationForm.value.remarks;
      donation.cancelletionReason = this.donationForm.value.cancelletionReason;
      donation.isPaymentNotified = this.donationForm.value.isPaymentNotified;
      this.donationChange.emit({ valid: this.donationForm.valid, donation: donation })
    })

  }


  protected get dfControl() {
    return this.donationForm.controls;
  }




  /**
   * Replacment keys
   */
  protected displayDonationType = (donationTypeCode: string | undefined) => {
    if (this.refData == undefined || donationTypeCode == undefined) {
      return donationTypeCode;
    }
    return this.refData[this.donationRefData.refDataKey.type]?.find((f: KeyValue) => f.key == donationTypeCode)?.displayValue;
  }

  protected displayDonationStatus = (donationStatusCode: string | undefined) => {
    if (this.refData == undefined || donationStatusCode == undefined) {
      return donationStatusCode;
    }
    return this.refData[this.donationRefData.refDataKey.status]?.find((f: KeyValue) => f.key == donationStatusCode)?.displayValue;
  }

  protected getSelectList = (name: string, options?: { donation?: DonationDetail }): KeyValue[] => {

    // if(name == 'payableAccounts'){
    //   return this.payableAccounts?.map(m => {
    //     return { key: m.id, displayValue: m.accountHolderName! + '('+m.id+')'}  as KeyValue;
    //   })
    // }
    // if(name == 'event_list'){
    //   return this.events?.map(m => {
    //     //let date=new DatePipe('en-US').transform(m.eventDate!);
    //     return { key: m.id, displayValue: ' | '+m.eventTitle+' | '+m.eventLocation} as KeyValue;
    //   })
    // }
    if (!this.refData) {
      return [];
    }
    let item = this.refData[name];
    // console.log(item);

    if (item && name == this.donationRefData.refDataKey.type) {
      return item.filter(f => this.donationTab != 'guest_donation' || f.key == this.donationType.Onetime);
    }
    // if (item && name == this.donationRefData.refDataKey.nextStatus) {
    //   item.unshift({key:options?.donation?.status,displayValue: this.displayDonationStatus(options?.donation?.status)});
    // }
    return item;
  }

}
