/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { AccountDetail } from '../../models/account-detail';
import { SuccessResponseAccountDetail } from '../../models/success-response-account-detail';

export interface UpdateMyAccount$Params {
  id: string;
  'X-Cloud-Trace-Context'?: string;
      body: AccountDetail
}

export function updateMyAccount(http: HttpClient, rootUrl: string, params: UpdateMyAccount$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseAccountDetail>> {
  const rb = new RequestBuilder(rootUrl, updateMyAccount.PATH, 'patch');
  if (params) {
    rb.path('id', params.id, {});
    rb.header('X-Cloud-Trace-Context', params['X-Cloud-Trace-Context'], {});
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<SuccessResponseAccountDetail>;
    })
  );
}

updateMyAccount.PATH = '/api/account/{id}/updateMyAccount';
