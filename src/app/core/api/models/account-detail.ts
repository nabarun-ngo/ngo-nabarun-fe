/* tslint:disable */
/* eslint-disable */
/* Code generated by ng-openapi-gen DO NOT EDIT. */

import { BankDetail } from '../models/bank-detail';
import { UpiDetail } from '../models/upi-detail';
import { UserDetail } from '../models/user-detail';
export interface AccountDetail {
  accountHolder?: UserDetail;
  accountHolderName?: string;
  accountStatus?: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  accountType?: 'PRINCIPAL' | 'GENERAL' | 'DONATION' | 'PUBLIC_DONATION';
  activatedOn?: string;
  bankDetail?: BankDetail;
  currentBalance?: number;
  id?: string;
  upiDetail?: UpiDetail;
}
