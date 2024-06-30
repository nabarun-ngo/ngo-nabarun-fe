/* tslint:disable */
/* eslint-disable */
import { DonationSummary } from '../models/donation-summary';
export interface SuccessResponseDonationSummary {
  info?: string;
  messages?: Array<string>;
  responsePayload?: DonationSummary;
  status?: number;
  timestamp?: string;
}
