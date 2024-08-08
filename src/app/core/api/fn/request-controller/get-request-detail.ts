/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { SuccessResponseRequestDetail } from '../../models/success-response-request-detail';

export interface GetRequestDetail$Params {
  id: string;
  'X-Cloud-Trace-Context'?: string;
}

export function getRequestDetail(http: HttpClient, rootUrl: string, params: GetRequestDetail$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseRequestDetail>> {
  const rb = new RequestBuilder(rootUrl, getRequestDetail.PATH, 'get');
  if (params) {
    rb.path('id', params.id, {});
    rb.header('X-Cloud-Trace-Context', params['X-Cloud-Trace-Context'], {});
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

getRequestDetail.PATH = '/api/request/getRequest/{id}';
