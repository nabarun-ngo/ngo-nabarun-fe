/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { SuccessResponseVoid } from '../../models/success-response-void';
import { UserDetail } from '../../models/user-detail';

export interface AssignUsersToRoles$Params {
  id: 'MEMBER' | 'CASHIER' | 'ASSISTANT_CASHIER' | 'TREASURER' | 'GROUP_COORDINATOR' | 'ASST_GROUP_COORDINATOR' | 'SECRETARY' | 'ASST_SECRETARY' | 'COMMUNITY_MANAGER' | 'ASST_COMMUNITY_MANAGER' | 'PRESIDENT' | 'VICE_PRESIDENT' | 'TECHNICAL_SPECIALIST';
  'Correlation-Id'?: string;
      body: Array<UserDetail>
}

export function assignUsersToRoles(http: HttpClient, rootUrl: string, params: AssignUsersToRoles$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseVoid>> {
  const rb = new RequestBuilder(rootUrl, assignUsersToRoles.PATH, 'post');
  if (params) {
    rb.path('id', params.id, {});
    rb.header('Correlation-Id', params['Correlation-Id'], {});
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<SuccessResponseVoid>;
    })
  );
}

assignUsersToRoles.PATH = '/api/user/assignUsersToRoles/{id}';
