/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { SuccessResponsePaginateWorkDetail } from '../../models/success-response-paginate-work-detail';

export interface GetMyWorkItems$Params {
  pageIndex?: number;
  pageSize?: number;
  completed?: boolean;
}

export function getMyWorkItems(http: HttpClient, rootUrl: string, params?: GetMyWorkItems$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponsePaginateWorkDetail>> {
  const rb = new RequestBuilder(rootUrl, getMyWorkItems.PATH, 'get');
  if (params) {
    rb.query('pageIndex', params.pageIndex, {});
    rb.query('pageSize', params.pageSize, {});
    rb.query('completed', params.completed, {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<SuccessResponsePaginateWorkDetail>;
    })
  );
}

getMyWorkItems.PATH = '/api/request/getMyWorkItems';
