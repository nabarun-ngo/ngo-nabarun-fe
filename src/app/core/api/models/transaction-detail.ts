/* tslint:disable */
/* eslint-disable */
import { AccountDetail } from '../models/account-detail';
export interface TransactionDetail {
  accBalance?: number;
  comment?: string;
  transferFrom?: AccountDetail;
  transferTo?: AccountDetail;
  txnAmount?: number;
  txnDate?: string;
  txnDescription?: string;
  txnId?: string;
  txnParticulars?: string;
  txnRefId?: string;
  txnRefType?: 'DONATION' | 'NONE';
  txnStatus?: 'SUCCESS' | 'FAILURE' | 'REVERT';
  txnType?: 'IN' | 'OUT' | 'TRANSFER';
}
