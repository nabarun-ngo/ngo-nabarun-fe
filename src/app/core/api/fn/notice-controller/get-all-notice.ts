/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { NoticeDetailFilter } from '../../models/notice-detail-filter';
import { SuccessResponsePaginateNoticeDetail } from '../../models/success-response-paginate-notice-detail';

export interface GetAllNotice$Params {
  pageIndex?: number;
  pageSize?: number;
  filter: NoticeDetailFilter;
  'X-Cloud-Trace-Context'?: string;
}

export function getAllNotice(http: HttpClient, rootUrl: string, params: GetAllNotice$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponsePaginateNoticeDetail>> {
  const rb = new RequestBuilder(rootUrl, getAllNotice.PATH, 'get');
  if (params) {
    rb.query('pageIndex', params.pageIndex, {});
    rb.query('pageSize', params.pageSize, {});
    rb.query('filter', params.filter, {});
    rb.header('X-Cloud-Trace-Context', params['X-Cloud-Trace-Context'], {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<SuccessResponsePaginateNoticeDetail>;
    })
  );
}

getAllNotice.PATH = '/api/notice/getNotices';
