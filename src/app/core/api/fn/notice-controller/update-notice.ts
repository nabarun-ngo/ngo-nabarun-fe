/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { NoticeDetail } from '../../models/notice-detail';
import { SuccessResponseNoticeDetail } from '../../models/success-response-notice-detail';

export interface UpdateNotice$Params {
  id: string;
  'X-Correlation-Id'?: string;
      body: NoticeDetail
}

export function updateNotice(http: HttpClient, rootUrl: string, params: UpdateNotice$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseNoticeDetail>> {
  const rb = new RequestBuilder(rootUrl, updateNotice.PATH, 'patch');
  if (params) {
    rb.path('id', params.id, {});
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

updateNotice.PATH = '/api/notice/updateNotice/{id}';
