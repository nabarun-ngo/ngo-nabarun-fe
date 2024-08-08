/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { SuccessResponseListWorkDetail } from '../../models/success-response-list-work-detail';

export interface GetWorkItems$Params {
  id: string;
  'X-Cloud-Trace-Context'?: string;
}

export function getWorkItems(http: HttpClient, rootUrl: string, params: GetWorkItems$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseListWorkDetail>> {
  const rb = new RequestBuilder(rootUrl, getWorkItems.PATH, 'get');
  if (params) {
    rb.path('id', params.id, {});
    rb.header('X-Cloud-Trace-Context', params['X-Cloud-Trace-Context'], {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<SuccessResponseListWorkDetail>;
    })
  );
}

getWorkItems.PATH = '/api/request/{id}/getWorkItems';
