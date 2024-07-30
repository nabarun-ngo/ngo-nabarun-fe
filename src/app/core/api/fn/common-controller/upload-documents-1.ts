/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { DocumentDetailUpload } from '../../models/document-detail-upload';
import { SuccessResponseVoid } from '../../models/success-response-void';

export interface UploadDocuments1$Params {
  docIndexId: string;
  docIndexType: 'DONATION' | 'EVENT' | 'NOTICE' | 'USER' | 'PROFILE_PHOTO' | 'EVENT_COVER';
  'X-Correlation-Id'?: string;
      body: Array<DocumentDetailUpload>
}

export function uploadDocuments1(http: HttpClient, rootUrl: string, params: UploadDocuments1$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseVoid>> {
  const rb = new RequestBuilder(rootUrl, uploadDocuments1.PATH, 'post');
  if (params) {
    rb.query('docIndexId', params.docIndexId, {});
    rb.query('docIndexType', params.docIndexType, {});
    rb.header('X-Correlation-Id', params['X-Correlation-Id'], {});
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

uploadDocuments1.PATH = '/api/common/document/uploadBase64Documents';
