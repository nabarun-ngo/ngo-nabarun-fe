/* tslint:disable */
/* eslint-disable */
/* Code generated by ng-openapi-gen DO NOT EDIT. */

import { DonationStatus } from '../models/donation-status';
import { DonationType } from '../models/donation-type';
export interface DonationDetailFilter {
  donationId?: string;
  donationStatus?: Array<DonationStatus>;
  donationType?: Array<DonationType>;
  donorId?: string;
  donorName?: string;
  fromDate?: string;
  isGuest?: boolean;
  paidToAccountId?: string;
  toDate?: string;
}
