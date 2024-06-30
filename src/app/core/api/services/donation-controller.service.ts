/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { getDonationDocuments } from '../fn/donation-controller/get-donation-documents';
import { GetDonationDocuments$Params } from '../fn/donation-controller/get-donation-documents';
import { getDonations } from '../fn/donation-controller/get-donations';
import { GetDonations$Params } from '../fn/donation-controller/get-donations';
import { getDonationSummary } from '../fn/donation-controller/get-donation-summary';
import { GetDonationSummary$Params } from '../fn/donation-controller/get-donation-summary';
import { getLoggedInUserDonations } from '../fn/donation-controller/get-logged-in-user-donations';
import { GetLoggedInUserDonations$Params } from '../fn/donation-controller/get-logged-in-user-donations';
import { getUserDonations } from '../fn/donation-controller/get-user-donations';
import { GetUserDonations$Params } from '../fn/donation-controller/get-user-donations';
import { payments } from '../fn/donation-controller/payments';
import { Payments$Params } from '../fn/donation-controller/payments';
import { raiseDonation } from '../fn/donation-controller/raise-donation';
import { RaiseDonation$Params } from '../fn/donation-controller/raise-donation';
import { SuccessResponseDonationDetail } from '../models/success-response-donation-detail';
import { SuccessResponseDonationSummary } from '../models/success-response-donation-summary';
import { SuccessResponseListDocumentDetail } from '../models/success-response-list-document-detail';
import { SuccessResponsePaginateDonationDetail } from '../models/success-response-paginate-donation-detail';
import { updateDonation } from '../fn/donation-controller/update-donation';
import { UpdateDonation$Params } from '../fn/donation-controller/update-donation';

@Injectable({ providedIn: 'root' })
export class DonationControllerService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `raiseDonation()` */
  static readonly RaiseDonationPath = '/api/donation/raiseDonation';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `raiseDonation()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  raiseDonation$Response(params: RaiseDonation$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseDonationDetail>> {
    return raiseDonation(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `raiseDonation$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  raiseDonation(params: RaiseDonation$Params, context?: HttpContext): Observable<SuccessResponseDonationDetail> {
    return this.raiseDonation$Response(params, context).pipe(
      map((r: StrictHttpResponse<SuccessResponseDonationDetail>): SuccessResponseDonationDetail => r.body)
    );
  }

  /** Path part for operation `payments()` */
  static readonly PaymentsPath = '/api/donation/payments/{id}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `payments()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  payments$Response(params: Payments$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseDonationDetail>> {
    return payments(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `payments$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  payments(params: Payments$Params, context?: HttpContext): Observable<SuccessResponseDonationDetail> {
    return this.payments$Response(params, context).pipe(
      map((r: StrictHttpResponse<SuccessResponseDonationDetail>): SuccessResponseDonationDetail => r.body)
    );
  }

  /** Path part for operation `updateDonation()` */
  static readonly UpdateDonationPath = '/api/donation/updateDonation/{id}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `updateDonation()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  updateDonation$Response(params: UpdateDonation$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseDonationDetail>> {
    return updateDonation(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `updateDonation$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  updateDonation(params: UpdateDonation$Params, context?: HttpContext): Observable<SuccessResponseDonationDetail> {
    return this.updateDonation$Response(params, context).pipe(
      map((r: StrictHttpResponse<SuccessResponseDonationDetail>): SuccessResponseDonationDetail => r.body)
    );
  }

  /** Path part for operation `getUserDonations()` */
  static readonly GetUserDonationsPath = '/api/donation/getUserDonation/{id}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getUserDonations()` instead.
   *
   * This method doesn't expect any request body.
   */
  getUserDonations$Response(params: GetUserDonations$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponsePaginateDonationDetail>> {
    return getUserDonations(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getUserDonations$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getUserDonations(params: GetUserDonations$Params, context?: HttpContext): Observable<SuccessResponsePaginateDonationDetail> {
    return this.getUserDonations$Response(params, context).pipe(
      map((r: StrictHttpResponse<SuccessResponsePaginateDonationDetail>): SuccessResponsePaginateDonationDetail => r.body)
    );
  }

  /** Path part for operation `getLoggedInUserDonations()` */
  static readonly GetLoggedInUserDonationsPath = '/api/donation/getLoggedInUserDonation';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getLoggedInUserDonations()` instead.
   *
   * This method doesn't expect any request body.
   */
  getLoggedInUserDonations$Response(params?: GetLoggedInUserDonations$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponsePaginateDonationDetail>> {
    return getLoggedInUserDonations(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getLoggedInUserDonations$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getLoggedInUserDonations(params?: GetLoggedInUserDonations$Params, context?: HttpContext): Observable<SuccessResponsePaginateDonationDetail> {
    return this.getLoggedInUserDonations$Response(params, context).pipe(
      map((r: StrictHttpResponse<SuccessResponsePaginateDonationDetail>): SuccessResponsePaginateDonationDetail => r.body)
    );
  }

  /** Path part for operation `getDonations()` */
  static readonly GetDonationsPath = '/api/donation/getDonations';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getDonations()` instead.
   *
   * This method doesn't expect any request body.
   */
  getDonations$Response(params: GetDonations$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponsePaginateDonationDetail>> {
    return getDonations(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getDonations$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getDonations(params: GetDonations$Params, context?: HttpContext): Observable<SuccessResponsePaginateDonationDetail> {
    return this.getDonations$Response(params, context).pipe(
      map((r: StrictHttpResponse<SuccessResponsePaginateDonationDetail>): SuccessResponsePaginateDonationDetail => r.body)
    );
  }

  /** Path part for operation `getDonationSummary()` */
  static readonly GetDonationSummaryPath = '/api/donation/getDonationSummary';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getDonationSummary()` instead.
   *
   * This method doesn't expect any request body.
   */
  getDonationSummary$Response(params?: GetDonationSummary$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseDonationSummary>> {
    return getDonationSummary(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getDonationSummary$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getDonationSummary(params?: GetDonationSummary$Params, context?: HttpContext): Observable<SuccessResponseDonationSummary> {
    return this.getDonationSummary$Response(params, context).pipe(
      map((r: StrictHttpResponse<SuccessResponseDonationSummary>): SuccessResponseDonationSummary => r.body)
    );
  }

  /** Path part for operation `getDonationDocuments()` */
  static readonly GetDonationDocumentsPath = '/api/donation/getDonationDocuments/{id}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getDonationDocuments()` instead.
   *
   * This method doesn't expect any request body.
   *
   * @deprecated
   */
  getDonationDocuments$Response(params: GetDonationDocuments$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseListDocumentDetail>> {
    return getDonationDocuments(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getDonationDocuments$Response()` instead.
   *
   * This method doesn't expect any request body.
   *
   * @deprecated
   */
  getDonationDocuments(params: GetDonationDocuments$Params, context?: HttpContext): Observable<SuccessResponseListDocumentDetail> {
    return this.getDonationDocuments$Response(params, context).pipe(
      map((r: StrictHttpResponse<SuccessResponseListDocumentDetail>): SuccessResponseListDocumentDetail => r.body)
    );
  }

}
