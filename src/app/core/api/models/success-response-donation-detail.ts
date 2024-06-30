/* tslint:disable */
/* eslint-disable */
import { DonationDetail } from '../models/donation-detail';
export interface SuccessResponseDonationDetail {
  info?: string;
  messages?: Array<string>;
  responsePayload?: DonationDetail;
  status?: number;
  timestamp?: string;
}
