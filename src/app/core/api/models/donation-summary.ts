/* tslint:disable */
/* eslint-disable */
/* Code generated by ng-openapi-gen DO NOT EDIT. */

import { PayableAccDetail } from '../models/payable-acc-detail';
export interface DonationSummary {
  currentMonthCollection?: string;
  hasOutstanding?: boolean;
  outstandingAmount?: number;
  outstandingMonths?: Array<string>;
  payableAccounts?: Array<PayableAccDetail>;
  totalOutstandingAmount?: number;
}
