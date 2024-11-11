/* tslint:disable */
/* eslint-disable */
/* Code generated by ng-openapi-gen DO NOT EDIT. */

import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { SuccessResponsePaginateDonationDetail } from '../../models/success-response-paginate-donation-detail';

export interface GetLoggedInUserDonations$Params {
  pageIndex?: number;
  pageSize?: number;
  'Correlation-Id'?: string;
}

export function getLoggedInUserDonations(http: HttpClient, rootUrl: string, params?: GetLoggedInUserDonations$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponsePaginateDonationDetail>> {
  const rb = new RequestBuilder(rootUrl, getLoggedInUserDonations.PATH, 'get');
  if (params) {
    rb.query('pageIndex', params.pageIndex, {});
    rb.query('pageSize', params.pageSize, {});
    rb.header('Correlation-Id', params['Correlation-Id'], {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<SuccessResponsePaginateDonationDetail>;
    })
  );
}

getLoggedInUserDonations.PATH = '/api/donation/list/self';
