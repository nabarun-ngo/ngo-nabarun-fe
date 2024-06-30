/* tslint:disable */
/* eslint-disable */
import { WorkDetail } from '../models/work-detail';
export interface SuccessResponseListWorkDetail {
  info?: string;
  messages?: Array<string>;
  responsePayload?: Array<WorkDetail>;
  status?: number;
  timestamp?: string;
}
