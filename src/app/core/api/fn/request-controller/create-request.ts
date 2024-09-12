/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { RequestDetail } from '../../models/request-detail';
import { SuccessResponseRequestDetail } from '../../models/success-response-request-detail';

export interface CreateRequest$Params {
  'Correlation-Id'?: string;
      body: RequestDetail
}

export function createRequest(http: HttpClient, rootUrl: string, params: CreateRequest$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseRequestDetail>> {
  const rb = new RequestBuilder(rootUrl, createRequest.PATH, 'post');
  if (params) {
    rb.header('Correlation-Id', params['Correlation-Id'], {});
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<SuccessResponseRequestDetail>;
    })
  );
}

createRequest.PATH = '/api/request/createRequest';
