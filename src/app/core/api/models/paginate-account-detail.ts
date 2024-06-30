/* tslint:disable */
/* eslint-disable */
import { AccountDetail } from '../models/account-detail';
export interface PaginateAccountDetail {
  content?: Array<AccountDetail>;
  currentSize?: number;
  nextPageIndex?: number;
  pageIndex?: number;
  pageSize?: number;
  prevPageIndex?: number;
  totalPages?: number;
  totalSize?: number;
}
