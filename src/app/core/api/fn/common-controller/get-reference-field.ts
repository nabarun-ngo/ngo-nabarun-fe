/* tslint:disable */
/* eslint-disable */
/* Code generated by ng-openapi-gen DO NOT EDIT. */

import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { SuccessResponseListAdditionalField } from '../../models/success-response-list-additional-field';

export interface GetReferenceField$Params {
  source: string;
  'Correlation-Id'?: string;
}

export function getReferenceField(http: HttpClient, rootUrl: string, params: GetReferenceField$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseListAdditionalField>> {
  const rb = new RequestBuilder(rootUrl, getReferenceField.PATH, 'get');
  if (params) {
    rb.query('source', params.source, {});
    rb.header('Correlation-Id', params['Correlation-Id'], {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<SuccessResponseListAdditionalField>;
    })
  );
}

getReferenceField.PATH = '/api/common/getReferenceField';