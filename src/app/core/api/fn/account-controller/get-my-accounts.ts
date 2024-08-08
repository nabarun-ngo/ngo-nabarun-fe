/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { AccountDetailFilter } from '../../models/account-detail-filter';
import { SuccessResponsePaginateAccountDetail } from '../../models/success-response-paginate-account-detail';

export interface GetMyAccounts$Params {
  pageIndex?: number;
  pageSize?: number;
  filter: AccountDetailFilter;
  'X-Cloud-Trace-Context'?: string;
}

export function getMyAccounts(http: HttpClient, rootUrl: string, params: GetMyAccounts$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponsePaginateAccountDetail>> {
  const rb = new RequestBuilder(rootUrl, getMyAccounts.PATH, 'get');
  if (params) {
    rb.query('pageIndex', params.pageIndex, {});
    rb.query('pageSize', params.pageSize, {});
    rb.query('filter', params.filter, {});
    rb.header('X-Cloud-Trace-Context', params['X-Cloud-Trace-Context'], {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<SuccessResponsePaginateAccountDetail>;
    })
  );
}

getMyAccounts.PATH = '/api/account/getMyAccounts';
