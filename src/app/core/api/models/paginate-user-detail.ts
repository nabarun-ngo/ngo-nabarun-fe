/* tslint:disable */
/* eslint-disable */
import { UserDetail } from '../models/user-detail';
export interface PaginateUserDetail {
  content?: Array<UserDetail>;
  currentSize?: number;
  nextPageIndex?: number;
  pageIndex?: number;
  pageSize?: number;
  prevPageIndex?: number;
  totalPages?: number;
  totalSize?: number;
}
