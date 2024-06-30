/* tslint:disable */
/* eslint-disable */
import { WorkDetail } from '../models/work-detail';
export interface SuccessResponseWorkDetail {
  info?: string;
  messages?: Array<string>;
  responsePayload?: WorkDetail;
  status?: number;
  timestamp?: string;
}
