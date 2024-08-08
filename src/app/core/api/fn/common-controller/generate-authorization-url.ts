/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { AuthorizationDetail } from '../../models/authorization-detail';
import { SuccessResponseString } from '../../models/success-response-string';

export interface GenerateAuthorizationUrl$Params {
  'X-Cloud-Trace-Context'?: string;
      body: AuthorizationDetail
}

export function generateAuthorizationUrl(http: HttpClient, rootUrl: string, params: GenerateAuthorizationUrl$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseString>> {
  const rb = new RequestBuilder(rootUrl, generateAuthorizationUrl.PATH, 'post');
  if (params) {
    rb.header('X-Cloud-Trace-Context', params['X-Cloud-Trace-Context'], {});
    rb.body(params.body, 'application/json');
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

generateAuthorizationUrl.PATH = '/api/common/authorization/createAuthorizationUrl';
