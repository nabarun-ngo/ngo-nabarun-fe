/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { SuccessResponsePaginateUserDetail } from '../../models/success-response-paginate-user-detail';
import { UserDetailFilter } from '../../models/user-detail-filter';

export interface GetUsers$Params {
  pageIndex?: number;
  pageSize?: number;
  filter: UserDetailFilter;
  'Correlation-Id'?: string;
}

export function getUsers(http: HttpClient, rootUrl: string, params: GetUsers$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponsePaginateUserDetail>> {
  const rb = new RequestBuilder(rootUrl, getUsers.PATH, 'get');
  if (params) {
    rb.query('pageIndex', params.pageIndex, {});
    rb.query('pageSize', params.pageSize, {});
    rb.query('filter', params.filter, {});
    rb.header('Correlation-Id', params['Correlation-Id'], {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<SuccessResponsePaginateUserDetail>;
    })
  );
}

getUsers.PATH = '/api/user/getUsers';
