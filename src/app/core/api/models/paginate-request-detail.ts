/* tslint:disable */
/* eslint-disable */
import { RequestDetail } from '../models/request-detail';
export interface PaginateRequestDetail {
  content?: Array<RequestDetail>;
  currentSize?: number;
  nextPageIndex?: number;
  pageIndex?: number;
  pageSize?: number;
  prevPageIndex?: number;
  totalPages?: number;
  totalSize?: number;
}
