/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { SuccessResponseString } from '../../models/success-response-string';

export interface GetUserRoleHistory$Params {
  id: string;
  'X-Correlation-Id'?: string;
}

export function getUserRoleHistory(http: HttpClient, rootUrl: string, params: GetUserRoleHistory$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseString>> {
  const rb = new RequestBuilder(rootUrl, getUserRoleHistory.PATH, 'get');
  if (params) {
    rb.path('id', params.id, {});
    rb.header('X-Correlation-Id', params['X-Correlation-Id'], {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<SuccessResponseString>;
    })
  );
}

getUserRoleHistory.PATH = '/api/user/getUserRoleHistory/{id}';
