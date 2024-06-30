/* tslint:disable */
/* eslint-disable */
import { BankDetail } from '../models/bank-detail';
import { UpiDetail } from '../models/upi-detail';
export interface PayableAccDetail {
  bankDetail?: BankDetail;
  id?: string;
  upiDetail?: UpiDetail;
}
