/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { SuccessResponseUserDetail } from '../../models/success-response-user-detail';

export interface GetLoggedInUserDetails$Params {
  'X-Correlation-Id'?: string;
}

export function getLoggedInUserDetails(http: HttpClient, rootUrl: string, params?: GetLoggedInUserDetails$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseUserDetail>> {
  const rb = new RequestBuilder(rootUrl, getLoggedInUserDetails.PATH, 'get');
  if (params) {
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

getLoggedInUserDetails.PATH = '/api/user/getLoggedInUserDetails';
