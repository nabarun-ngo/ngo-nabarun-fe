/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { SuccessResponsePaginateTransactionDetail } from '../../models/success-response-paginate-transaction-detail';

export interface GetTransactions$Params {
  id: string;
  pageIndex: number;
  pageSize: number;
  'X-Correlation-Id'?: string;
}

export function getTransactions(http: HttpClient, rootUrl: string, params: GetTransactions$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponsePaginateTransactionDetail>> {
  const rb = new RequestBuilder(rootUrl, getTransactions.PATH, 'get');
  if (params) {
    rb.path('id', params.id, {});
    rb.query('pageIndex', params.pageIndex, {});
    rb.query('pageSize', params.pageSize, {});
    rb.header('X-Correlation-Id', params['X-Correlation-Id'], {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<SuccessResponsePaginateTransactionDetail>;
    })
  );
}

getTransactions.PATH = '/api/account/{id}/getTransactions';
