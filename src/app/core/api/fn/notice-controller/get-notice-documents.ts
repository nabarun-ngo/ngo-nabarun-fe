/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { SuccessResponseListDocumentDetail } from '../../models/success-response-list-document-detail';

export interface GetNoticeDocuments$Params {
  id: string;
  'Correlation-Id'?: string;
}

export function getNoticeDocuments(http: HttpClient, rootUrl: string, params: GetNoticeDocuments$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseListDocumentDetail>> {
  const rb = new RequestBuilder(rootUrl, getNoticeDocuments.PATH, 'get');
  if (params) {
    rb.path('id', params.id, {});
    rb.header('Correlation-Id', params['Correlation-Id'], {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<SuccessResponseListDocumentDetail>;
    })
  );
}

getNoticeDocuments.PATH = '/api/notice/getNoticeDocuments/{id}';
