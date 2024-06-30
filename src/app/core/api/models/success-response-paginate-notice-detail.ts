/* tslint:disable */
/* eslint-disable */
import { PaginateNoticeDetail } from '../models/paginate-notice-detail';
export interface SuccessResponsePaginateNoticeDetail {
  info?: string;
  messages?: Array<string>;
  responsePayload?: PaginateNoticeDetail;
  status?: number;
  timestamp?: string;
}
