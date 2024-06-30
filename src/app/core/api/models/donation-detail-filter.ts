/* tslint:disable */
/* eslint-disable */
import { DonationStatus } from '../models/donation-status';
import { DonationType } from '../models/donation-type';
export interface DonationDetailFilter {
  donationId?: string;
  donationStatus?: Array<DonationStatus>;
  donationType?: Array<DonationType>;
  donorName?: string;
  fromDate?: string;
  isGuest?: boolean;
  paidToAccountId?: string;
  toDate?: string;
}
