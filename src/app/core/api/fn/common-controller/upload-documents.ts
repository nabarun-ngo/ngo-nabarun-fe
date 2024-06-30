/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { SuccessResponseVoid } from '../../models/success-response-void';

export interface UploadDocuments$Params {
  docIndexId: string;
  docIndexType: 'DONATION' | 'EVENT' | 'NOTICE' | 'USER' | 'PROFILE_PHOTO' | 'EVENT_COVER';
  files: Array<Blob>;
}

export function uploadDocuments(http: HttpClient, rootUrl: string, params: UploadDocuments$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseVoid>> {
  const rb = new RequestBuilder(rootUrl, uploadDocuments.PATH, 'post');
  if (params) {
    rb.query('docIndexId', params.docIndexId, {});
    rb.query('docIndexType', params.docIndexType, {});
    rb.query('files', params.files, {});
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

uploadDocuments.PATH = '/api/common/document/uploadDocuments';
