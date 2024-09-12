/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { AccountDetail } from '../../models/account-detail';
import { SuccessResponseAccountDetail } from '../../models/success-response-account-detail';

export interface CreateAccount$Params {
  'Correlation-Id'?: string;
      body: AccountDetail
}

export function createAccount(http: HttpClient, rootUrl: string, params: CreateAccount$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseAccountDetail>> {
  const rb = new RequestBuilder(rootUrl, createAccount.PATH, 'post');
  if (params) {
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

createAccount.PATH = '/api/account/createAccount';
