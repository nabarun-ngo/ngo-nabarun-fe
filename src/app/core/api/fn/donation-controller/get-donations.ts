/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { DonationDetailFilter } from '../../models/donation-detail-filter';
import { SuccessResponsePaginateDonationDetail } from '../../models/success-response-paginate-donation-detail';

export interface GetDonations$Params {
  pageIndex?: number;
  pageSize?: number;
  filter: DonationDetailFilter;
}

export function getDonations(http: HttpClient, rootUrl: string, params: GetDonations$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponsePaginateDonationDetail>> {
  const rb = new RequestBuilder(rootUrl, getDonations.PATH, 'get');
  if (params) {
    rb.query('pageIndex', params.pageIndex, {});
    rb.query('pageSize', params.pageSize, {});
    rb.query('filter', params.filter, {});
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

getDonations.PATH = '/api/donation/getDonations';
