/* tslint:disable */
/* eslint-disable */
/* Code generated by ng-openapi-gen DO NOT EDIT. */

import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ExpenseDetail } from '../../models/expense-detail';
import { SuccessResponseExpenseDetail } from '../../models/success-response-expense-detail';

export interface SettleExpense$Params {
  id: string;
  'Correlation-Id'?: string;
      body: ExpenseDetail
}

export function settleExpense(http: HttpClient, rootUrl: string, params: SettleExpense$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseExpenseDetail>> {
  const rb = new RequestBuilder(rootUrl, settleExpense.PATH, 'patch');
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
      return r as StrictHttpResponse<SuccessResponseExpenseDetail>;
    })
  );
}

settleExpense.PATH = '/api/account/expense/{id}/settle';
