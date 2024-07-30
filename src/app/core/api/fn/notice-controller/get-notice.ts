/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { SuccessResponseNoticeDetail } from '../../models/success-response-notice-detail';

export interface GetNotice$Params {
  id: string;
  'X-Correlation-Id'?: string;
}

export function getNotice(http: HttpClient, rootUrl: string, params: GetNotice$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseNoticeDetail>> {
  const rb = new RequestBuilder(rootUrl, getNotice.PATH, 'get');
  if (params) {
    rb.path('id', params.id, {});
    rb.header('X-Correlation-Id', params['X-Correlation-Id'], {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<SuccessResponseNoticeDetail>;
    })
  );
}

getNotice.PATH = '/api/notice/getNotice/{id}';
