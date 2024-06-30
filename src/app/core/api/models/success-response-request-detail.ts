/* tslint:disable */
/* eslint-disable */
import { RequestDetail } from '../models/request-detail';
export interface SuccessResponseRequestDetail {
  info?: string;
  messages?: Array<string>;
  responsePayload?: RequestDetail;
  status?: number;
  timestamp?: string;
}
