/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { SuccessResponseString } from '../../models/success-response-string';

export interface GetLatestTestOtp$Params {
  email: string;
  'Correlation-Id'?: string;
}

export function getLatestTestOtp(http: HttpClient, rootUrl: string, params: GetLatestTestOtp$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseString>> {
  const rb = new RequestBuilder(rootUrl, getLatestTestOtp.PATH, 'get');
  if (params) {
    rb.query('email', params.email, {});
    rb.header('Correlation-Id', params['Correlation-Id'], {});
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

getLatestTestOtp.PATH = '/test/getLatestTestOtp';
