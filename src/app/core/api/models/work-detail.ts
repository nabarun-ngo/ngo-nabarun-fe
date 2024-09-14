/* tslint:disable */
/* eslint-disable */
import { AdditionalField } from '../models/additional-field';
import { UserDetail } from '../models/user-detail';
export interface WorkDetail {
  additionalFields?: Array<AdditionalField>;
  createdOn?: string;
  decision?: 'APPROVE' | 'DECLINE';
  decisionDate?: string;
  decisionOwner?: UserDetail;
  description?: string;
  id?: string;
  pendingWithRoles?: Array<'MEMBER' | 'CASHIER' | 'ASSISTANT_CASHIER' | 'TREASURER' | 'GROUP_COORDINATOR' | 'ASST_GROUP_COORDINATOR' | 'SECRETARY' | 'ASST_SECRETARY' | 'COMMUNITY_MANAGER' | 'ASST_COMMUNITY_MANAGER' | 'PRESIDENT' | 'VICE_PRESIDENT' | 'TECHNICAL_SPECIALIST'>;
  remarks?: string;
  stepCompleted?: boolean;
  workType?: 'DECISION';
  workflowId?: string;
  workflowStatus?: 'EMAIL_VERIFY_PENDING' | 'AWAITING_L1_APPROVAL' | 'AWAITING_L2_APPROVAL' | 'APPROVED_ONBOARDING' | 'REJECTED' | 'CANCELLED' | 'PAYMENT_COLLECTION_PENDING' | 'PAYMENT_CONFIRMATION_PENDING' | 'PAYMENT_COLLECTED' | 'NO_PAYMENT';
}
