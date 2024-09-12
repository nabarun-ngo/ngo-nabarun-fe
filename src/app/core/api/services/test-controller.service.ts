/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { getLatestTestOtp } from '../fn/test-controller/get-latest-test-otp';
import { GetLatestTestOtp$Params } from '../fn/test-controller/get-latest-test-otp';
import { SuccessResponseString } from '../models/success-response-string';

@Injectable({ providedIn: 'root' })
export class TestControllerService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `getLatestTestOtp()` */
  static readonly GetLatestTestOtpPath = '/test/getLatestTestOtp';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getLatestTestOtp()` instead.
   *
   * This method doesn't expect any request body.
   */
  getLatestTestOtp$Response(params: GetLatestTestOtp$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseString>> {
    return getLatestTestOtp(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getLatestTestOtp$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getLatestTestOtp(params: GetLatestTestOtp$Params, context?: HttpContext): Observable<SuccessResponseString> {
    return this.getLatestTestOtp$Response(params, context).pipe(
      map((r: StrictHttpResponse<SuccessResponseString>): SuccessResponseString => r.body)
    );
  }

}
