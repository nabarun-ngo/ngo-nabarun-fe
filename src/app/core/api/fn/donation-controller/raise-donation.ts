/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { DonationDetail } from '../../models/donation-detail';
import { SuccessResponseDonationDetail } from '../../models/success-response-donation-detail';

export interface RaiseDonation$Params {
  'Correlation-Id'?: string;
      body: DonationDetail
}

export function raiseDonation(http: HttpClient, rootUrl: string, params: RaiseDonation$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseDonationDetail>> {
  const rb = new RequestBuilder(rootUrl, raiseDonation.PATH, 'post');
  if (params) {
    rb.header('Correlation-Id', params['Correlation-Id'], {});
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

raiseDonation.PATH = '/api/donation/raiseDonation';
