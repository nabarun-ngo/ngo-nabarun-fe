/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { SuccessResponseWorkDetail } from '../../models/success-response-work-detail';
import { WorkDetail } from '../../models/work-detail';

export interface UpdateWorkItem$Params {
  id: string;
  'Correlation-Id'?: string;
      body: WorkDetail
}

export function updateWorkItem(http: HttpClient, rootUrl: string, params: UpdateWorkItem$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseWorkDetail>> {
  const rb = new RequestBuilder(rootUrl, updateWorkItem.PATH, 'patch');
  if (params) {
    rb.path('id', params.id, {});
    rb.header('Correlation-Id', params['Correlation-Id'], {});
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<SuccessResponseWorkDetail>;
    })
  );
}

updateWorkItem.PATH = '/api/request/updateWorkItem/{id}';
