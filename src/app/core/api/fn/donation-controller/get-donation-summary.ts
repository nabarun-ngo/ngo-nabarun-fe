/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { SuccessResponseDonationSummary } from '../../models/success-response-donation-summary';

export interface GetDonationSummary$Params {
  id?: string;
  includePayableAccount?: boolean;
  includeOutstandingMonths?: boolean;
  'X-Correlation-Id'?: string;
}

export function getDonationSummary(http: HttpClient, rootUrl: string, params?: GetDonationSummary$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseDonationSummary>> {
  const rb = new RequestBuilder(rootUrl, getDonationSummary.PATH, 'get');
  if (params) {
    rb.query('id', params.id, {});
    rb.query('includePayableAccount', params.includePayableAccount, {});
    rb.query('includeOutstandingMonths', params.includeOutstandingMonths, {});
    rb.header('X-Correlation-Id', params['X-Correlation-Id'], {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<SuccessResponseDonationSummary>;
    })
  );
}

getDonationSummary.PATH = '/api/donation/getDonationSummary';
