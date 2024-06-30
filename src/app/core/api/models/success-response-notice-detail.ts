/* tslint:disable */
/* eslint-disable */
import { NoticeDetail } from '../models/notice-detail';
export interface SuccessResponseNoticeDetail {
  info?: string;
  messages?: Array<string>;
  responsePayload?: NoticeDetail;
  status?: number;
  timestamp?: string;
}
