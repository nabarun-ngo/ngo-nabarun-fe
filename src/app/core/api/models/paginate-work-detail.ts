/* tslint:disable */
/* eslint-disable */
import { WorkDetail } from '../models/work-detail';
export interface PaginateWorkDetail {
  content?: Array<WorkDetail>;
  currentSize?: number;
  nextPageIndex?: number;
  pageIndex?: number;
  pageSize?: number;
  prevPageIndex?: number;
  totalPages?: number;
  totalSize?: number;
}
