/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { DonationDetail } from '../../models/donation-detail';
import { SuccessResponseDonationDetail } from '../../models/success-response-donation-detail';

export interface Payments$Params {
  id: string;
  action: string;
  'X-Cloud-Trace-Context'?: string;
      body: DonationDetail
}

export function payments(http: HttpClient, rootUrl: string, params: Payments$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseDonationDetail>> {
  const rb = new RequestBuilder(rootUrl, payments.PATH, 'post');
  if (params) {
    rb.path('id', params.id, {});
    rb.query('action', params.action, {});
    rb.header('X-Cloud-Trace-Context', params['X-Cloud-Trace-Context'], {});
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<SuccessResponseDonationDetail>;
    })
  );
}

payments.PATH = '/api/donation/payments/{id}';
