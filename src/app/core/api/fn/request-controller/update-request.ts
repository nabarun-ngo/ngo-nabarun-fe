/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { RequestDetail } from '../../models/request-detail';
import { SuccessResponseRequestDetail } from '../../models/success-response-request-detail';

export interface UpdateRequest$Params {
  id: string;
      body: RequestDetail
}

export function updateRequest(http: HttpClient, rootUrl: string, params: UpdateRequest$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseRequestDetail>> {
  const rb = new RequestBuilder(rootUrl, updateRequest.PATH, 'patch');
  if (params) {
    rb.path('id', params.id, {});
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<SuccessResponseRequestDetail>;
    })
  );
}

updateRequest.PATH = '/api/request/updateRequest/{id}';
