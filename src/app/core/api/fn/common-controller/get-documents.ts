/* tslint:disable */
/* eslint-disable */
/* Code generated by ng-openapi-gen DO NOT EDIT. */

import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { SuccessResponseListDocumentDetail } from '../../models/success-response-list-document-detail';

export interface GetDocuments$Params {
  id: string;
  type: 'DONATION' | 'EVENT' | 'NOTICE' | 'USER' | 'PROFILE_PHOTO' | 'EVENT_COVER' | 'REQUEST' | 'EXPENSE';
  'Correlation-Id'?: string;
}

export function getDocuments(http: HttpClient, rootUrl: string, params: GetDocuments$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseListDocumentDetail>> {
  const rb = new RequestBuilder(rootUrl, getDocuments.PATH, 'get');
  if (params) {
    rb.path('id', params.id, {});
    rb.query('type', params.type, {});
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

getDocuments.PATH = '/api/common/document/list/{id}';
