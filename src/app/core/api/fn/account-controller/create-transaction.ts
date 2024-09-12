/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { SuccessResponseTransactionDetail } from '../../models/success-response-transaction-detail';
import { TransactionDetail } from '../../models/transaction-detail';

export interface CreateTransaction$Params {
  'Correlation-Id'?: string;
      body: TransactionDetail
}

export function createTransaction(http: HttpClient, rootUrl: string, params: CreateTransaction$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseTransactionDetail>> {
  const rb = new RequestBuilder(rootUrl, createTransaction.PATH, 'post');
  if (params) {
    rb.header('Correlation-Id', params['Correlation-Id'], {});
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<SuccessResponseTransactionDetail>;
    })
  );
}

createTransaction.PATH = '/api/account/createTransaction';
