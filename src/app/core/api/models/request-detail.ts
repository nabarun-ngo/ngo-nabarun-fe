/* tslint:disable */
/* eslint-disable */
import { AdditionalField } from '../models/additional-field';
import { UserDetail } from '../models/user-detail';
export interface RequestDetail {
  additionalFields?: Array<AdditionalField>;
  createdOn?: string;
  delegated?: boolean;
  delegatedRequester?: UserDetail;
  description?: string;
  id?: string;
  name?: string;
  remarks?: string;
  requester?: UserDetail;
  resolvedOn?: string;
  status?: 'EMAIL_VERIFY_PENDING' | 'AWAITING_L1_APPROVAL' | 'AWAITING_L2_APPROVAL' | 'APPROVED_ONBOARDING' | 'REJECTED' | 'CANCELLED' | 'PAYMENT_COLLECTION_PENDING' | 'PAYMENT_CONFIRMATION_PENDING' | 'PAYMENT_COLLECTED' | 'NO_PAYMENT';
  type?: 'JOIN_REQUEST' | 'JOIN_REQUEST_USER' | 'CHECK_PAYMENT' | 'COLLECT_CASH_PAYMENT';
}
