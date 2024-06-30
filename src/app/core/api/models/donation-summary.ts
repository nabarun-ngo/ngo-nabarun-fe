/* tslint:disable */
/* eslint-disable */
import { PayableAccDetail } from '../models/payable-acc-detail';
export interface DonationSummary {
  currentMonthCollection?: string;
  hasOutstanding?: boolean;
  outstandingAmount?: number;
  outstandingMonths?: Array<string>;
  payableAccounts?: Array<PayableAccDetail>;
  totalOutstandingAmount?: number;
}
