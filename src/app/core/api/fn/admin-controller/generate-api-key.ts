/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { SuccessResponseMapStringString } from '../../models/success-response-map-string-string';

export interface GenerateApiKey$Params {
  'Correlation-Id'?: string;
      body: Array<string>
}

export function generateApiKey(http: HttpClient, rootUrl: string, params: GenerateApiKey$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseMapStringString>> {
  const rb = new RequestBuilder(rootUrl, generateApiKey.PATH, 'post');
  if (params) {
    rb.header('Correlation-Id', params['Correlation-Id'], {});
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<SuccessResponseMapStringString>;
    })
  );
}

generateApiKey.PATH = '/api/admin/generateApiKey';