/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { SuccessResponseUserDetail } from '../../models/success-response-user-detail';
import { UserDetail } from '../../models/user-detail';

export interface UpdateLoggedInUserDetails$Params {
  updatePicture?: boolean;
  'X-Correlation-Id'?: string;
      body: UserDetail
}

export function updateLoggedInUserDetails(http: HttpClient, rootUrl: string, params: UpdateLoggedInUserDetails$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseUserDetail>> {
  const rb = new RequestBuilder(rootUrl, updateLoggedInUserDetails.PATH, 'patch');
  if (params) {
    rb.query('updatePicture', params.updatePicture, {});
    rb.header('X-Correlation-Id', params['X-Correlation-Id'], {});
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<SuccessResponseUserDetail>;
    })
  );
}

updateLoggedInUserDetails.PATH = '/api/user/updateLoggedInUserDetails';
