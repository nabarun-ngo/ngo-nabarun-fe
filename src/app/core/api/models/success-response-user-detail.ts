/* tslint:disable */
/* eslint-disable */
import { UserDetail } from '../models/user-detail';
export interface SuccessResponseUserDetail {
  info?: string;
  messages?: Array<string>;
  responsePayload?: UserDetail;
  status?: number;
  timestamp?: string;
}
