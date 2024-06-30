/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { UserDetail } from '../../models/user-detail';

export interface GetUserEmail$Params {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  hometown: string;
}

export function getUserEmail(http: HttpClient, rootUrl: string, params: GetUserEmail$Params, context?: HttpContext): Observable<StrictHttpResponse<UserDetail>> {
  const rb = new RequestBuilder(rootUrl, getUserEmail.PATH, 'post');
  if (params) {
    rb.query('firstname', params.firstname, {});
    rb.query('lastname', params.lastname, {});
    rb.query('email', params.email, {});
    rb.query('phone', params.phone, {});
    rb.query('hometown', params.hometown, {});
  }

  return http.request(
    rb.build({ responseType: 'blob', accept: '*/*', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<UserDetail>;
    })
  );
}

getUserEmail.PATH = '/api/test/createuser';
