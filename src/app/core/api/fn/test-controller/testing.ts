/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { SuccessResponseObject } from '../../models/success-response-object';

export interface Testing$Params {
  email: string;
}

export function testing(http: HttpClient, rootUrl: string, params: Testing$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseObject>> {
  const rb = new RequestBuilder(rootUrl, testing.PATH, 'get');
  if (params) {
    rb.query('email', params.email, {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<SuccessResponseObject>;
    })
  );
}

testing.PATH = '/testing';
