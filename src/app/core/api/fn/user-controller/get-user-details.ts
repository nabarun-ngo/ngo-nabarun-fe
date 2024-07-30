/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { SuccessResponseUserDetail } from '../../models/success-response-user-detail';

export interface GetUserDetails$Params {
  id: string;
  idType?: 'EMAIL' | 'AUTH_USER_ID' | 'ID';
  'X-Correlation-Id'?: string;
}

export function getUserDetails(http: HttpClient, rootUrl: string, params: GetUserDetails$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseUserDetail>> {
  const rb = new RequestBuilder(rootUrl, getUserDetails.PATH, 'get');
  if (params) {
    rb.path('id', params.id, {});
    rb.query('idType', params.idType, {});
    rb.header('X-Correlation-Id', params['X-Correlation-Id'], {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<SuccessResponseUserDetail>;
    })
  );
}

getUserDetails.PATH = '/api/user/getUserDetails/{id}';
