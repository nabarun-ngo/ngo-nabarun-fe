/* tslint:disable */
/* eslint-disable */
import { NoticeDetail } from '../models/notice-detail';
export interface PaginateNoticeDetail {
  content?: Array<NoticeDetail>;
  currentSize?: number;
  nextPageIndex?: number;
  pageIndex?: number;
  pageSize?: number;
  prevPageIndex?: number;
  totalPages?: number;
  totalSize?: number;
}
