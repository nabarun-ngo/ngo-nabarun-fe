/* tslint:disable */
/* eslint-disable */
/* Code generated by ng-openapi-gen DO NOT EDIT. */

import { AccountDetail } from '../models/account-detail';
import { ExpenseItemDetail } from '../models/expense-item-detail';
import { UserDetail } from '../models/user-detail';
export interface ExpenseDetail {
  account?: AccountDetail;
  createdBy?: UserDetail;
  createdOn?: string;
  description?: string;
  expenseDate?: string;
  expenseItems?: Array<ExpenseItemDetail>;
  expenseRefId?: string;
  expenseRefType?: 'EVENT' | 'OTHER';
  finalAmount?: number;
  finalized?: boolean;
  finalizedBy?: UserDetail;
  id?: string;
  name?: string;
  status?: 'SUBMITTED' | 'PAID' | 'CLOSED';
  txnNumber?: string;
}
