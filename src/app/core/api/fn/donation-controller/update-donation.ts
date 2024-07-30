/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { DonationDetail } from '../../models/donation-detail';
import { SuccessResponseDonationDetail } from '../../models/success-response-donation-detail';

export interface UpdateDonation$Params {
  id: string;
  'X-Correlation-Id'?: string;
      body: DonationDetail
}

export function updateDonation(http: HttpClient, rootUrl: string, params: UpdateDonation$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseDonationDetail>> {
  const rb = new RequestBuilder(rootUrl, updateDonation.PATH, 'patch');
  if (params) {
    rb.path('id', params.id, {});
    rb.header('X-Correlation-Id', params['X-Correlation-Id'], {});
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

updateDonation.PATH = '/api/donation/updateDonation/{id}';
