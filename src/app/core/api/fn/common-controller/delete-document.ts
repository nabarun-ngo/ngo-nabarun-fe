/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { SuccessResponseVoid } from '../../models/success-response-void';

export interface DeleteDocument$Params {
  id: string;
  'X-Correlation-Id'?: string;
}

export function deleteDocument(http: HttpClient, rootUrl: string, params: DeleteDocument$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseVoid>> {
  const rb = new RequestBuilder(rootUrl, deleteDocument.PATH, 'delete');
  if (params) {
    rb.path('id', params.id, {});
    rb.header('X-Correlation-Id', params['X-Correlation-Id'], {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<SuccessResponseVoid>;
    })
  );
}

deleteDocument.PATH = '/api/common/document/deleteDocument/{id}';
