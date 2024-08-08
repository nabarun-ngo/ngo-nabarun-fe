/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { SuccessResponsePaginateRequestDetail } from '../../models/success-response-paginate-request-detail';

export interface GetMyRequests$Params {
  pageIndex?: number;
  pageSize?: number;
  delegated?: boolean;
  'X-Cloud-Trace-Context'?: string;
}

export function getMyRequests(http: HttpClient, rootUrl: string, params?: GetMyRequests$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponsePaginateRequestDetail>> {
  const rb = new RequestBuilder(rootUrl, getMyRequests.PATH, 'get');
  if (params) {
    rb.query('pageIndex', params.pageIndex, {});
    rb.query('pageSize', params.pageSize, {});
    rb.query('delegated', params.delegated, {});
    rb.header('X-Cloud-Trace-Context', params['X-Cloud-Trace-Context'], {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<SuccessResponsePaginateRequestDetail>;
    })
  );
}

getMyRequests.PATH = '/api/request/getMyRequests';
