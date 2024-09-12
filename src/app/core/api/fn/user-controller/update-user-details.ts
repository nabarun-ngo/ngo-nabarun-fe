/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { SuccessResponseUserDetail } from '../../models/success-response-user-detail';
import { UserDetail } from '../../models/user-detail';

export interface UpdateUserDetails$Params {
  id: string;
  'Correlation-Id'?: string;
      body: UserDetail
}

export function updateUserDetails(http: HttpClient, rootUrl: string, params: UpdateUserDetails$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseUserDetail>> {
  const rb = new RequestBuilder(rootUrl, updateUserDetails.PATH, 'post');
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
      return r as StrictHttpResponse<SuccessResponseUserDetail>;
    })
  );
}

updateUserDetails.PATH = '/api/user/updateUserDetails/{id}';
