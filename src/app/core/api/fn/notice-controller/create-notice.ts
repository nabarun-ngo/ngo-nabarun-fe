/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { NoticeDetail } from '../../models/notice-detail';
import { SuccessResponseNoticeDetail } from '../../models/success-response-notice-detail';

export interface CreateNotice$Params {
  'X-Correlation-Id'?: string;
      body: NoticeDetail
}

export function createNotice(http: HttpClient, rootUrl: string, params: CreateNotice$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseNoticeDetail>> {
  const rb = new RequestBuilder(rootUrl, createNotice.PATH, 'post');
  if (params) {
    rb.header('X-Correlation-Id', params['X-Correlation-Id'], {});
    rb.body(params.body, 'application/json');
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

createNotice.PATH = '/api/notice/createNotice';
