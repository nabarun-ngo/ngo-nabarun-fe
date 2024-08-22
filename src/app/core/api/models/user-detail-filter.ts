/* tslint:disable */
/* eslint-disable */
export interface UserDetailFilter {
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  publicFlag?: boolean;
  roles?: Array<'MEMBER' | 'CASHIER' | 'ASSISTANT_CASHIER' | 'TREASURER' | 'GROUP_COORDINATOR' | 'ASST_GROUP_COORDINATOR' | 'SECRETARY' | 'ASST_SECRETARY' | 'COMMUNITY_MANAGER' | 'ASST_COMMUNITY_MANAGER' | 'PRESIDENT' | 'VICE_PRESIDENT' | 'TECHNICAL_SPECIALIST'>;
  status?: Array<'ACTIVE' | 'INACTIVE' | 'DELETED' | 'BLOCKED'>;
  userByRole?: boolean;
  userId?: string;
}
