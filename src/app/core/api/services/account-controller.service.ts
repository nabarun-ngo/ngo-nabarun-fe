/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { createAccount } from '../fn/account-controller/create-account';
import { CreateAccount$Params } from '../fn/account-controller/create-account';
import { getAccounts } from '../fn/account-controller/get-accounts';
import { GetAccounts$Params } from '../fn/account-controller/get-accounts';
import { getTransactions } from '../fn/account-controller/get-transactions';
import { GetTransactions$Params } from '../fn/account-controller/get-transactions';
import { SuccessResponseAccountDetail } from '../models/success-response-account-detail';
import { SuccessResponsePaginateAccountDetail } from '../models/success-response-paginate-account-detail';
import { SuccessResponsePaginateTransactionDetail } from '../models/success-response-paginate-transaction-detail';

@Injectable({ providedIn: 'root' })
export class AccountControllerService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `createAccount()` */
  static readonly CreateAccountPath = '/api/account/createAccount';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `createAccount()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  createAccount$Response(params: CreateAccount$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseAccountDetail>> {
    return createAccount(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `createAccount$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  createAccount(params: CreateAccount$Params, context?: HttpContext): Observable<SuccessResponseAccountDetail> {
    return this.createAccount$Response(params, context).pipe(
      map((r: StrictHttpResponse<SuccessResponseAccountDetail>): SuccessResponseAccountDetail => r.body)
    );
  }

  /** Path part for operation `getTransactions()` */
  static readonly GetTransactionsPath = '/api/account/{id}/getTransactions';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getTransactions()` instead.
   *
   * This method doesn't expect any request body.
   */
  getTransactions$Response(params: GetTransactions$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponsePaginateTransactionDetail>> {
    return getTransactions(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getTransactions$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getTransactions(params: GetTransactions$Params, context?: HttpContext): Observable<SuccessResponsePaginateTransactionDetail> {
    return this.getTransactions$Response(params, context).pipe(
      map((r: StrictHttpResponse<SuccessResponsePaginateTransactionDetail>): SuccessResponsePaginateTransactionDetail => r.body)
    );
  }

  /** Path part for operation `getAccounts()` */
  static readonly GetAccountsPath = '/api/account/getAccounts';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getAccounts()` instead.
   *
   * This method doesn't expect any request body.
   */
  getAccounts$Response(params: GetAccounts$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponsePaginateAccountDetail>> {
    return getAccounts(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getAccounts$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getAccounts(params: GetAccounts$Params, context?: HttpContext): Observable<SuccessResponsePaginateAccountDetail> {
    return this.getAccounts$Response(params, context).pipe(
      map((r: StrictHttpResponse<SuccessResponsePaginateAccountDetail>): SuccessResponsePaginateAccountDetail => r.body)
    );
  }

}
