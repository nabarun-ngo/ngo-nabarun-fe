/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { SuccessResponsePaginateDonationDetail } from '../../models/success-response-paginate-donation-detail';

export interface GetUserDonations$Params {
  id: string;
  pageIndex?: number;
  pageSize?: number;
  'X-Cloud-Trace-Context'?: string;
}

export function getUserDonations(http: HttpClient, rootUrl: string, params: GetUserDonations$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponsePaginateDonationDetail>> {
  const rb = new RequestBuilder(rootUrl, getUserDonations.PATH, 'get');
  if (params) {
    rb.path('id', params.id, {});
    rb.query('pageIndex', params.pageIndex, {});
    rb.query('pageSize', params.pageSize, {});
    rb.header('X-Cloud-Trace-Context', params['X-Cloud-Trace-Context'], {});
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

getUserDonations.PATH = '/api/donation/getUserDonation/{id}';
