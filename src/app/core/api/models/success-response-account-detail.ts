/* tslint:disable */
/* eslint-disable */
import { AccountDetail } from '../models/account-detail';
export interface SuccessResponseAccountDetail {
  info?: string;
  messages?: Array<string>;
  responsePayload?: AccountDetail;
  status?: number;
  timestamp?: string;
}
