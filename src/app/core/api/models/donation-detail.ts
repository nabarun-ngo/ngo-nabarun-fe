/* tslint:disable */
/* eslint-disable */
import { AccountDetail } from '../models/account-detail';
import { AdditionalField } from '../models/additional-field';
import { DonationStatus } from '../models/donation-status';
import { DonationType } from '../models/donation-type';
import { EventDetail } from '../models/event-detail';
import { PaymentMethod } from '../models/payment-method';
import { UserDetail } from '../models/user-detail';
export interface DonationDetail {
  additionalFields?: Array<AdditionalField>;
  amount?: number;
  cancelletionReason?: string;
  confirmedBy?: UserDetail;
  confirmedOn?: string;
  donorDetails?: UserDetail;
  endDate?: string;
  forEvent?: EventDetail;
  id?: string;
  isGuest?: boolean;
  isPaymentNotified?: boolean;
  laterPaymentReason?: string;
  paidOn?: string;
  paidToAccount?: AccountDetail;
  paidUsingUPI?: 'GPAY' | 'PAYTM' | 'PHONEPE' | 'BHARATPAY' | 'UPI_OTH';
  paymentFailureDetail?: string;
  paymentMethod?: PaymentMethod;
  raisedOn?: string;
  remarks?: string;
  startDate?: string;
  status?: DonationStatus;
  transactionRef?: string;
  type?: DonationType;
}
