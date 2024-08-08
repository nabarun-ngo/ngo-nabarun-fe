/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { DonationStatus } from '../../models/donation-status';
import { DonationType } from '../../models/donation-type';
import { RefDataType } from '../../models/ref-data-type';
import { SuccessResponseMapStringListKeyValue } from '../../models/success-response-map-string-list-key-value';

export interface GetReferenceData$Params {
  names?: Array<RefDataType>;
  donationType?: DonationType;
  currentDonationStatus?: DonationStatus;
  'X-Cloud-Trace-Context'?: string;
}

export function getReferenceData(http: HttpClient, rootUrl: string, params?: GetReferenceData$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseMapStringListKeyValue>> {
  const rb = new RequestBuilder(rootUrl, getReferenceData.PATH, 'get');
  if (params) {
    rb.query('names', params.names, {});
    rb.query('donationType', params.donationType, {});
    rb.query('currentDonationStatus', params.currentDonationStatus, {});
    rb.header('X-Cloud-Trace-Context', params['X-Cloud-Trace-Context'], {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<SuccessResponseMapStringListKeyValue>;
    })
  );
}

getReferenceData.PATH = '/api/common/getReferenceData';
