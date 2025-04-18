/* tslint:disable */
/* eslint-disable */
/* Code generated by ng-openapi-gen DO NOT EDIT. */

import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { AccountDetail } from '../../models/account-detail';
import { SuccessResponseAccountDetail } from '../../models/success-response-account-detail';

export interface UpdateAccount$Params {
  id: string;
  'Correlation-Id'?: string;
      body: AccountDetail
}

export function updateAccount(http: HttpClient, rootUrl: string, params: UpdateAccount$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseAccountDetail>> {
  const rb = new RequestBuilder(rootUrl, updateAccount.PATH, 'patch');
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
      return r as StrictHttpResponse<SuccessResponseAccountDetail>;
    })
  );
}

updateAccount.PATH = '/api/account/{id}/update';
