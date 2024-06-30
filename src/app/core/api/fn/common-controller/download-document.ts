/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';


export interface DownloadDocument$Params {
  id: string;
  asURL?: boolean;
}

export function downloadDocument(http: HttpClient, rootUrl: string, params: DownloadDocument$Params, context?: HttpContext): Observable<StrictHttpResponse<{
}>> {
  const rb = new RequestBuilder(rootUrl, downloadDocument.PATH, 'get');
  if (params) {
    rb.path('id', params.id, {});
    rb.query('asURL', params.asURL, {});
  }

  return http.request(
    rb.build({ responseType: 'blob', accept: '*/*', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<{
      }>;
    })
  );
}

downloadDocument.PATH = '/api/common/document/downloadDocument/{id}';
