/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { SuccessResponsePaginateMapStringString } from '../../models/success-response-paginate-map-string-string';

export interface GetNotification$Params {
  pageIndex?: number;
  pageSize?: number;
  'X-Correlation-Id'?: string;
}

export function getNotification(http: HttpClient, rootUrl: string, params?: GetNotification$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponsePaginateMapStringString>> {
  const rb = new RequestBuilder(rootUrl, getNotification.PATH, 'get');
  if (params) {
    rb.query('pageIndex', params.pageIndex, {});
    rb.query('pageSize', params.pageSize, {});
    rb.header('X-Correlation-Id', params['X-Correlation-Id'], {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<SuccessResponsePaginateMapStringString>;
    })
  );
}

getNotification.PATH = '/api/common/getNotifications';
